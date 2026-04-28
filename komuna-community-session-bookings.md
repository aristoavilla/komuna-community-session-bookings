# Komuna - community session bookings

# Session Booking Platform — Specification

A multi-tenant platform for running session-based services (e.g., boxing gyms, yoga studios, coaching programs). Generalized via the "product" abstraction so it can support any bookable or redeemable offering.

## 1. Core Concepts

### 1.1 Program

A program is the top-level container operated by an admin. Each program has its own members, products, purchase packages, and settings. It also has location info as optional data to enable user filter programs based on location.

**Visibility levels:**

- **Public** — anyone can discover and join freely.
- **Need approval** — anyone can discover and request; admin reviews a queue.
- **Invitation only** — only invited users can join. Invitations sent by admin or product manager.
- **Private** — not discoverable; access by direct link only.

**Program settings:**

- Name, description, visibility
- Default timezone (each program is tied to a single timezone)
- Cancellation reason required on admin/manager cancellations (always on)

### 1.2 Product

Any purchasable or redeemable offering within a program.

**Types:**

- **Session** — has scheduled instances with a date/time, capacity, and assigned managers. Examples: a weekly boxing class, a personal training slot.
- **Simple** — no scheduling; redeemable as-is. Examples: drop-in pass, merchandise, refund token.

**Product properties:**

- Name, description, type
- Capacity (session-type only) — set at creation
- Custom fields for member input at claim time (see §5.6)
- Cancellation settings (see §6)
- Validity extension rules (admin-configurable max extension, via calendar picker)
- Visibility: inherited from program by default; may be further restricted (future)

**Product lifecycle:** active, archived. Archived products keep existing vouchers valid until expiry but accept no new purchases.

### 1.3 Purchase Package

Program-level. Defines how vouchers are sold. Shown on each relevant product's page.

**Properties:**

- Name, price
- List of entries, each specifying: product, quantity of vouchers, validity rule
- Validity rules supported: *X days from purchase*, *end of purchase month*, *end of N months from purchase*
- Status: active, archived

**Immutability:** purchase packages are immutable after creation. Any edit creates a new version; the old version is archived. This preserves revenue reporting integrity.

**Complex packages:** a single package may grant vouchers across multiple products (e.g., "Starter Pack: 5 Boxing + 2 Yoga"). Each entry in the package has its own validity rule.

### 1.4 Voucher

The member's right to claim a product. One row per voucher (no grouping).

**Properties:**

- Owner (member)
- Product reference
- `expiredAt` (UTC timestamp, stamped at issuance)
- Source: `purchase` | `compensation` | `giveaway`
- Status: `active` | `claimed` | `expired` | `refunded`
- Issued by (for non-purchase sources)
- Issuance reason (required for compensation and giveaway)
- Originating purchase or claim reference (for audit)

**Expiry handling:** lazy. A voucher is treated as expired when queried if `expiredAt <= now()`. No cron needed. UI filters hide expired vouchers by default; they remain viewable in detailed transaction history.

**Validity source at issuance:**

- Purchase → from purchase package's validity rule for that product
- Compensation → from product's cancellation settings (with override field)
- Giveaway → admin enters manually at issuance

### 1.5 Voucher Claim

A spent voucher, tied to a specific session (session-type) or redemption event (simple-type).

**Properties:**

- Voucher reference
- Session reference (for session-type)
- Claimant (the member who owns the voucher)
- Alias (optional; for walk-ins — see §5.7)
- Custom field answers (see §5.6)
- Attendance status (for session-type; optional)
- Created at, cancelled at
- Cancellation reason (if cancelled)

**Claim finality:** cancel is always cancel. No undo window. Cancellation triggers the compensation flow (§6).

### 1.6 Session

A dated instance of a session-type product.

**Properties:**

- Product reference
- Start and end datetime (in program timezone)
- Assigned managers (one or more)
- Active/inactive state for its date (see §7)
- Capacity (inherited from product; may be overridden per session — future)
- Status: scheduled, cancelled, completed
- Attendance QR code (static per session, manually regeneratable)

Sessions are generated from a weekly template defined on the product, plus one-off additions. Weekly template changes do not auto-move existing bookings; admin uses in-app broadcast to notify affected members.

## 2. Roles and Permissions

Roles are scoped per program. A user may hold multiple roles within a program and across programs.

### 2.1 Super Admin (Platform Level)

- Configure platform-wide settings: service fee percentage, minimum fee amount
- View platform-wide statistics
- Not scoped to any program

### 2.2 Admin (Per Program)

Full authority within the program:

- Create/edit/archive products, purchase packages, voucher settings
- Assign product managers
- Manage program members (invite, approve, ban)
- Issue giveaway vouchers (with reason, any product)
- Extend voucher validity (with calendar picker, per-product-configurable max)
- Cancel sessions
- Approve booking requests (full-session, out-of-window)
- Manage refund product (see §8.2)
- View all program statistics
- Request payouts on-demand

### 2.3 Product Manager (Per Product)

Narrower scope, per assigned product:

- Set session active/inactive for a given day (§7)
- Cancel sessions (triggers compensation flow)
- Approve booking requests for their product
- Mark attendance (optional; QR scan or manual)
- Add alias to claims for walk-ins
- View statistics for their product
- Invite users to the program

Managers cannot: create/edit products or purchase packages, change voucher pricing, manage other managers, access program-level settings.

### 2.4 Member

- Browse products visible to them
- Purchase packages
- Claim vouchers (book sessions, redeem simple products)
- View their voucher wallet with expiry dates
- Cancel their own claims (triggers compensation rule evaluation)
- Scan attendance QR
- Fill custom fields at claim time

### 2.5 Role Edge Cases

- **Manager-as-member:** a manager may book sessions as a member, including sessions of their own product. They may optionally add an alias.
- **Banned users:** remain in the program but cannot claim or purchase. Existing vouchers remain visible but unusable.

## 3. Program Membership Flow

**Public programs:** one-click join.

**Need-approval programs:** user submits join request → admin sees queue → approves/denies. Notification on decision.

**Invitation-only programs:** admin or manager sends invitation via email and SMS (SMS is opt-in per the invite channel settings). User follows link to accept.

**Private programs:** invitation flow only; no discovery.

## 4. Purchases

### 4.1 Purchase Flow

1. Member views a product, sees list of purchase packages that include that product.
2. Member selects a package → taken to checkout.
3. Payment via Xendit. Service fee (super admin's percentage or minimum, whichever is higher) is added on top, paid by the member.
4. On successful payment, voucher(s) are issued per the package's entries. Each entry produces `quantity` vouchers with the specified validity.
5. Purchase confirmation email + in-app notification.

### 4.2 Payment Recovery

- Xendit timeout or failure mid-flow → purchase marked pending; auto-retry with exponential backoff.
- Failed after retries → member notified, purchase discarded, no vouchers issued.
- Manual reconciliation view available to admin for edge cases.

### 4.3 Refunds

Refunds use a dedicated **Refund Product** mechanism:

- Admin creates a simple-type product called "Refund."
- Claiming this product requires elevated permission (admin only).
- Admin issues a refund by invalidating the original voucher(s) and triggering a cash refund via Xendit.
- Partial refunds are supported at the voucher level (e.g., refund 3 of 5 vouchers in a bundle).

### 4.4 Payouts

- Admin requests payouts on-demand from their program's revenue balance.
- Payout processed via Xendit.
- Notification on payout completion.
- Invoice/receipt generation for PPN compliance.

## 5. Booking (Claiming Vouchers)

### 5.1 Booking Window

Each session-type product has a configurable booking window (e.g., "bookings open 7 days before").

**Within window:** direct claim.

**Outside window:** requires admin/manager approval *unless* the session has been marked active by a manager (§7), in which case direct claim is allowed.

### 5.2 Full Session

If the session is at capacity, the member may still request to join. Request goes to the product manager or admin (either can approve). Not an auto-promoting waitlist — manual decision per request.

### 5.3 Multiple Bookings

A member may book any number of future sessions, subject to booking window and voucher availability. Each booking consumes one voucher.

### 5.4 Voucher Selection

When a member has multiple eligible vouchers for the same product, the system **auto-selects FIFO by expiry** (soonest-expiring first). No user choice at claim time.

### 5.5 Cancellation by Member

See §6.

### 5.6 Custom Fields

Each product may define custom fields (text type for v1).

- **Collected at:** claim time.
- **Required or optional:** configurable per field.
- **Reuse:** last answer is saved per member and pre-fills next claim.
- **Visibility:** admins and managers of the product can see answers.

### 5.7 Walk-in Aliases

- A member's claim may have an alias, set only by a manager or admin.
- Alias is a free-text field; manager can add additional info in the same field if needed.
- Members cannot self-alias (prevents accidental misattribution).

### 5.8 Attendance

- Attendance is optional by default.
- No-shows consume the voucher as normal.
- Two mechanisms: static QR per session (regeneratable by admin/manager), manual mark by manager.
- Manager can override attendance after the fact.
- Attendance status is visible to the member (notification optional).

## 6. Cancellations

### 6.1 By Member

Each product defines cancellation rules as a set of tiered thresholds:

- *If cancelled more than X hours before session → issue compensation voucher with validity V1*
- *If cancelled between X and Y hours before → validity V2*
- *If cancelled less than Y hours before → no voucher issued* (optional tier)

Tiers are fully configurable per product. At least one tier is required; no cap on number of tiers.

**Compensation voucher properties:**

- Same product as the cancelled voucher
- Validity per the matched tier
- Source: `compensation`
- Reason: "Member cancellation" (or custom)

### 6.2 By Admin or Manager

Same flow as member cancellation — uses the same product cancellation rules. (No separate "admin-cancelled" path.)

- Cancellation requires a reason (free text).
- Reason is included in notifications to affected members.
- Warning shown before confirmation listing affected members.
- Validity field is pre-filled from the rule; canceller can override.

### 6.3 Voucher Validity Extension

- Admin only.
- Per-product configured max extension (calendar picker defines the latest date allowed).
- Extension is logged in audit with reason.

## 7. Session Activation

By default, no sessions are active on any given day. Either the assigned manager or the program admin must activate a session for it to run.

**Activation:**

- One-click per session per day.
- Triggers notifications to booked members ("Your session today is confirmed").

**Deactivation:**

- Shows warning listing affected members.
- Requires reason.
- Triggers cancellation flow for all bookings (compensation vouchers issued per §6).
- Notifications sent to admin, managers, and affected members with the reason.

**Active state is per date**, not a persistent flag on the session template. Each day is independently activated.

## 8. Voucher Lifecycle Summary

```
[Purchase] ─┐
[Compensation] ─┼─→ [Voucher: active] ─┬─→ [Claim] ─→ [Voucher: claimed]
[Giveaway] ─┘                          ├─→ [Expiry] ─→ [Voucher: expired]
                                       └─→ [Refund] ─→ [Voucher: refunded]
```

- **Expired** vouchers are hidden from the default wallet view but visible in transaction history.
- **Claimed** vouchers are tied to a Voucher Claim row; cancellation of that claim may issue a new compensation voucher (it does not reactivate the original).
- **Refunded** vouchers are invalidated; associated cash refund processed via Xendit.
- If a product is archived, its vouchers remain usable until their individual expiry.

## 9. Notifications

**Channels:**

- **Email** — on by default, per-event toggle available to members
- **Push (in-app)** — always on
- **SMS** — used only for program invitations (opt-in at invite time)

**Event matrix:**

| Event | Admin | Manager (of product) | Member involved |
| --- | --- | --- | --- |
| Voucher purchased | — | — | ✓ (receipt) |
| Voucher expiring in 1 day | — | — | ✓ |
| Booking confirmed | — | ✓ | ✓ |
| Booking approval requested | ✓ | ✓ | — |
| Booking approved/denied | — | — | ✓ |
| Session activated for today | — | — | ✓ (if booked) |
| Session deactivated/cancelled | ✓ | ✓ | ✓ (with reason) |
| Compensation voucher issued | — | — | ✓ |
| Session reminder 24h before | — | ✓ | ✓ |
| Session reminder 1h before | — | — | ✓ |
| Manager assigned to product | ✓ | ✓ (assignee) | — |
| Invitation to program | — | — | ✓ (email + SMS) |
| Join approval granted/denied | — | — | ✓ |
| Attendance marked | — | — | ✓ (optional) |
| Payout processed | ✓ | — | — |
| Weekly schedule template changed | — | — | ✓ (in-app broadcast) |

## 10. Analytics

Dashboards visible to admin (program-wide) and manager (product-scoped):

- Attendance rate per product and per session
- Revenue per product, per package, per period
- Voucher utilization: purchased vs claimed vs expired vs refunded
- Compensation voucher issuance rate (signal of cancellation volume)
- Popular trainers/managers
- Popular sessions and time slots
- Student retention (repeat bookings over time)
- No-show rate per product
- Package attribution on revenue (which packages are selling)

Compensation vs purchased vouchers are tracked separately in utilization stats.

**Multi-product package revenue split:** revenue is attributed evenly across the claims issued (simple and auditable for v1; can refine later).

## 11. Audit Log

Append-only log of key actions for dispute resolution. Captured events:

- Voucher purchase, compensation issuance, giveaway issuance, refund, expiry, validity extension
- Session create, activate, deactivate, cancel, complete
- Booking create, cancel, alias add/edit, attendance mark/override
- Role assignments and changes
- Program visibility changes
- Purchase package create/archive (packages themselves are immutable)
- Member bans, approvals, invitations
- Admin/manager settings changes

Each entry includes: actor, action, target entity, timestamp, optional reason.

## 12. Platform-Level Settings (Super Admin)

- Service fee percentage
- Minimum service fee amount (whichever is higher of percentage or minimum applies)
- Fee applied per transaction, on top of the package price, paid by the member
- Platform-wide statistics dashboard

## 13. Out of Scope for v1

Documented so they're not forgotten:

- Discount codes / promo codes on packages
- Per-member-restricted packages (loyalty tiers)
- Time-limited package availability (workaround: create a second package and archive the old one)
- Mixed-timezone programs
- Auto-promoting waitlists
- Un-cancel / undo window on claims
- Session-level capacity override (inherits from product)
- Voucher validity resume on un-refund
- Per-member notification preferences beyond on/off for email
- Multi-channel custom fields (file upload, multi-select, etc. — text only for v1)

## 14. Open Implementation Questions (for build phase)

These are settled design decisions but have implementation nuances to resolve during build:

- Exact Xendit integration pattern (invoice vs redirect vs embedded)
- PPN invoice numbering and template format
- Push notification provider (FCM? OneSignal?)
- QR format and validation logic (time window around session, signing)
- Manager "invite to program" — does this share the admin invite quota or have its own?
- Audit log retention period and archival strategy

[https://www.notion.so](https://www.notion.so)