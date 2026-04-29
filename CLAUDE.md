# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ERD — Mandatory Schema Reference

The file `mermaid-diagram.png` at the project root is the canonical database schema (ERD). **Read it before implementing any feature that touches data types or mock data.** All TypeScript types for entities (Program, Product, Voucher, Session, etc.) must include every field present in the corresponding ERD table. You may add extra fields for UI or frontend needs, but you must not omit any ERD field.

## Project Overview

Komuna is a multi-tenant platform for session-based services (gyms, yoga studios, coaching). The central abstraction is a **Program** (tenant) that sells **Purchase Packages** which grant **Vouchers** that members **Claim** against scheduled **Sessions** or simple redeemable products.

## Tech Stack

- **Runtime:** Cloudflare Workers (edge, no Node.js APIs)
- **Backend:** TypeScript + Hono + Drizzle ORM
- **Database:** NeonDB (Postgres) via Drizzle, connected over HTTP (`@neondatabase/serverless`)
- **Auth:** NeonAuth (stack-auth)
- **Storage:** Cloudflare R2 (object storage)
- **Queue:** Cloudflare Queues (async jobs)
- **Frontend:** TypeScript + React + shadcn/ui
- **Payments:** Xendit (invoice/redirect flow TBD; service fee = max(percentage, minimum))
- **Monitoring:** PostHog (product analytics), BetterStack (logs/uptime)

## Domain Model

The full spec lives in `komuna-community-session-bookings.md`. Key entities and invariants:

### Entities
- **Program** — tenant. Has visibility (public / need-approval / invitation-only / private) and a single canonical timezone. All datetime operations use program timezone.
- **Product** — either `session` (has scheduled instances, capacity) or `simple` (drop-in, merchandise). Products can be archived; archived products honor existing vouchers until expiry but accept no new purchases.
- **PurchasePackage** — **immutable after creation**. Edits create a new version and archive the old one (preserves revenue reporting). May grant vouchers for multiple products in one purchase.
- **Voucher** — one row per voucher (no grouping). Status: `active | claimed | expired | refunded`. Source: `purchase | compensation | giveaway`. Expiry is **lazy** — treated as expired when `expiredAt <= now()` at query time; no cron needed.
- **VoucherClaim** — links a voucher to a session or redemption event. Cancellation is final (no undo). Cancellation triggers the compensation flow (issues a new compensation voucher per the product's tiered cancellation rules).
- **Session** — a dated instance of a session-type product. Active state is **per date** (not a persistent flag). Sessions are generated from a weekly template plus one-off additions.

### Key Business Rules
- **Voucher selection at claim:** FIFO by `expiredAt` (soonest-expiring first). No user choice.
- **Booking window:** outside the configured window, claims require admin/manager approval unless a manager has explicitly activated the session for that day.
- **Full session:** member can request to join at-capacity sessions; manager/admin approves manually (no auto-waitlist promotion).
- **Walk-in alias:** only managers/admins can set; members cannot self-alias.
- **Voucher validity extension:** admin-only, per-product configurable max date.
- **Refunds:** use a dedicated "Refund" simple product; admin invalidates original voucher(s) and triggers Xendit cash refund.
- **Service fee:** `max(platform_percentage * price, minimum_fee)`, added on top, paid by buyer.
- **Audit log:** append-only; every significant action is logged with actor, action, target, timestamp, optional reason.

### Roles (per-program scope)
- **Super Admin** — platform-wide settings (fee config), no program scope
- **Admin** — full authority within a program
- **Product Manager** — scoped to assigned products; can activate/deactivate sessions, mark attendance, approve bookings for their product
- **Member** — can browse, purchase, claim, and cancel their own claims

A user can hold multiple roles within and across programs. Managers can book as members (including their own product's sessions).

## Architecture Notes

### Backend Structure (planned)
Hono on Cloudflare Workers. Route handlers should be thin; business logic lives in service modules. Drizzle handles schema and queries — use Drizzle migrations for all schema changes.

### Async Work
Use Cloudflare Queues for: payment webhooks, notification dispatch (email/push/SMS), payout processing, and any retry logic. Keep Workers synchronous where possible.

### Notifications
- Email — default on, member can toggle per-event
- Push (in-app) — always on
- SMS — only for program invitations (opt-in at invite time)
- No third-party push provider decided yet (FCM vs OneSignal is an open question)

### Multi-tenancy
All queries must be scoped to a program. Never return cross-program data without super-admin auth. Role checks are program-scoped — validate role membership on every request.

### Timezone Handling
Store all timestamps in UTC. Apply program timezone only at presentation layer. Session times are entered in program timezone and must be converted to UTC for storage.

## Out of Scope (v1)
Discount codes, per-member restricted packages, mixed-timezone programs, auto-promoting waitlists, un-cancel/undo, session-level capacity override, multi-channel custom fields (text only).
