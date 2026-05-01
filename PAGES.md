# Komuna — Page Build Roadmap

This file is the single source of truth for frontend page progress. Each page is one unit of work for a subagent. Work sequentially from top to bottom. Mark a page `[x]` only after it is fully implemented, tested, and wired into routing.

> **For subagents:** Read this file first to find the first unchecked `[ ]` page — that is your task. Do not skip ahead or work on multiple pages at once. When done, mark the item `[x]` and stop.
>
> **ERD is mandatory:** Before implementing any page, read `mermaid-diagram.png` at the project root — it is the canonical database schema. All mock data types must include every field present in the ERD for the relevant tables. You may add extra fields for UI/frontend needs, but you must not omit any ERD field.

---

## Status legend

- `[ ]` — not started
- `[~]` — in progress
- `[x]` — done

---

## Member-Facing Flow

- [x] **DiscoveryPage** — `/` — Hero search, category filter, program grid. Entry point for all visitors.

- [x] **ProgramDetailPage** — `/programs/:id` — Program info (name, description, location, timezone, visibility badge), products list, join button (one-click for public, request for need-approval, invite-only gate). Links to each ProductDetailPage.

- [x] **ProductDetailPage** — `/programs/:id/products/:productId` — Product name/description, type badge (session/simple), upcoming sessions preview (next 3–5), list of purchase packages that include this product with prices and validity rules. Book or buy CTA.

- [x] **CheckoutPage** — `/programs/:id/packages/:packageId/checkout` — Package summary, service fee breakdown (`max(percentage × price, minimum_fee)`), Xendit payment initiation, success/failure states. Issues vouchers on confirmed payment.

- [x] **WalletPage** — `/wallet` — Authenticated member's vouchers grouped by product, sorted by `expiredAt` (soonest first). Toggle to show/hide expired vouchers. Each row shows product, expiry date, status badge (`active | claimed | expired | refunded`), source (`purchase | compensation | giveaway`).

- [x] **SessionsPage** — `/programs/:id/products/:productId/sessions` — Paginated list or calendar of upcoming sessions for a session-type product. Each row shows date/time, manager(s), capacity (`x / total`), and a Book button. Handles full-session request and out-of-window request states. Disabled for simple-type products.

- [x] **BookingsPage** — `/my/bookings` — Member's active and past claims. Active tab: upcoming sessions with cancel button (triggers compensation flow confirmation dialog). Past tab: completed/cancelled history with compensation voucher reference. Custom field answers visible per booking.

- [x] **NotificationsPage** — `/notifications` — Chronological in-app notification feed. Pairs with the existing `NotificationBell` component. Mark-all-read action. Links from each notification to the relevant entity (session, voucher, booking).

- [x] **ProfilePage** — `/profile` — Display name, email (read-only from auth provider). Email notification toggles per event type (on/off). Account settings.

---

## Admin Flow

- [ ] **AdminDashboardPage** — `/programs/:id/admin` — Summary cards: total revenue, active members, sessions this week, pending approvals. Quick-access links to sub-pages. Approval queue badge count.

- [ ] **MembersPage** — `/programs/:id/admin/members` — Member list with role badges. Join request queue for need-approval programs (approve/deny with notification). Invite form (email + optional SMS). Ban/unban action. Role assignment.

- [ ] **ProductsPage** — `/programs/:id/admin/products` — List of products with type, status (active/archived), and session count. Create product form (name, type, capacity for session-type, custom fields, cancellation tiers). Archive action. Link to individual product management.

- [ ] **PackagesPage** — `/programs/:id/admin/packages` — List of purchase packages. Create form: name, price, entries (product + quantity + validity rule per entry). Immutability enforced — edit creates a new version and archives the old. Archive action.

- [ ] **VouchersPage** — `/programs/:id/admin/vouchers` — Giveaway issuance form (member, product, quantity, expiry, reason). Validity extension tool (member voucher lookup, calendar picker capped at per-product max, reason). Refund flow: invalidate original voucher(s) and trigger Xendit cash refund.

- [ ] **ApprovalsPage** — `/programs/:id/admin/approvals` — Two tabs: (1) join requests for need-approval programs, (2) booking requests (full-session or out-of-window). Each row shows requester, session/product, request time. Approve/deny with optional reason. Notification sent on decision.

- [ ] **AnalyticsPage** — `/programs/:id/admin/analytics` — Charts and tables: attendance rate per product/session, revenue per product/package/period, voucher utilization (purchased vs claimed vs expired vs refunded), compensation issuance rate, no-show rate, package attribution on revenue.

- [ ] **AuditLogPage** — `/programs/:id/admin/audit` — Append-only event table: actor, action, target entity, timestamp, optional reason. Filterable by event type, actor, date range. Read-only.

---

## Manager Flow

- [ ] **ManagerDashboardPage** — `/programs/:id/manage/products/:productId` — Today's sessions for the assigned product with activate/deactivate toggle (deactivate requires reason, triggers cancellation flow and notifications). Attendance marking (QR scan or manual). Pending booking approval requests for this product. Walk-in alias add/edit on individual claims.

---

## Super Admin Flow

- [ ] **PlatformSettingsPage** — `/platform/settings` — Service fee percentage and minimum fee configuration. Platform-wide stats: total programs, total revenue, total transactions. Read-only breakdown by program.
