# ProfilePage Design Spec

**Date:** 2026-05-01
**Route:** `/profile`
**Status:** Approved

---

## Overview

Authenticated member page for viewing identity details and managing email notification preferences. Single-file component following the existing member-page pattern. Three sections exposed via a left sidebar nav: Identity, Notifications, Account.

---

## Layout

Shell matches WalletPage / BookingsPage / NotificationsPage:
- `TopNav` (loggedIn=true) at top
- `Footer` at bottom
- Page body: `padding: 48px 56px 72px`, `background: var(--paper-1)`

**Page header:**
- Section label: `§08 · My profile` (JetBrains Mono, 11px, uppercase, `--ink-3`)
- `h1`: `"My profile."` with italic `"profile."` in `--accent` (DM Serif Display, 36px)

**Settings layout:** CSS grid, `grid-template-columns: 180px 1fr`, `gap: 40px`, `align-items: start`.

---

## Sidebar Nav

Left column, `position: sticky; top: 24px`. Three items: **Identity**, **Notifications**, **Account**.

Each item:
- `padding: 9px 12px`, `border-radius: 8px`, `font-size: 14px`, `color: var(--ink-2)`
- Hover: `background: var(--paper-2)`, `color: var(--ink-1)`
- Active: `background: var(--paper-2)`, `color: var(--ink-1)`, `font-weight: 500`, plus a 6px accent dot (`background: var(--accent)`) visible only on the active item

Active section is driven by `activeSection` state (`'identity' | 'notifications' | 'account'`, default `'identity'`). Clicking a sidebar item updates the state and shows the corresponding panel.

---

## Panel: Identity

Sub-label: `§08.1 · Identity`. Card title: `"Your details"`.

Two read-only fields (display name and email), each rendered as:
```
[JetBrains Mono field label — 10px uppercase --ink-3]
[field value row — padding 10px 14px, background --paper-2, border 1px --rule, border-radius 8px]
  left: value text (15px --ink-1)
  right: "read-only" badge pill (JetBrains Mono 10px uppercase, --paper-3 bg, --ink-3 text)
```

Below the fields, a helper note (12px, `--ink-3`, line-height 1.6):
> "Your name and email are managed by your authentication provider and cannot be changed here."

**Mock data:** hardcoded — name `"Maya Alinejad"`, email `"maya@example.com"`.

---

## Panel: Notifications

Sub-label: `§08.2 · Notifications`. Card title: `"Email preferences"`.

Six toggle rows, one per event type. Rows are separated by `1px solid var(--rule)` (last row has no border).

Each row:
```
[toggle-info flex:1]                    [toggle]
  toggle-name  — 14px --ink-1 500
  toggle-desc  — 12px --ink-3
```

**Toggle component:** 40×22px pill. On: `background: var(--accent)`, thumb right. Off: `background: var(--paper-3)`, border `1px solid var(--rule-2)`, thumb left. Clicking flips state.

**Event types and default states:**

| Event type | Label | Description | Default |
|---|---|---|---|
| `booking_confirmed` | Booking confirmed | When a session booking is confirmed | on |
| `voucher_expiring` | Voucher expiring | Reminder when a voucher expires in 1 day | on |
| `session_cancelled` | Session cancelled | When a session you've booked is cancelled | on |
| `compensation_issued` | Compensation issued | When a compensation voucher is issued to you | off |
| `purchase_confirmed` | Purchase confirmed | Receipt when a package purchase goes through | on |
| `approval_decision` | Approval decision | When a booking request is approved or denied | off |

Below the card, a helper note (12px, `--ink-3`, line-height 1.6):
> "In-app push notifications are always on. Email notifications can be toggled per event type above. Changes are saved automatically."

**State:** `emailPrefs` — `Record<EventType, boolean>`, initialised from the default table above. Toggle clicks update this record. No persistence in mock (local state only).

---

## Panel: Account

Sub-label: `§08.3 · Account`. Card title: `"Account settings"`.

Content:
- **Sign out button:** `border: 1px solid var(--rule-2)`, `background: var(--paper-1)`, `color: var(--ink-1)`, `border-radius: 8px`, `padding: 10px 20px`, `font-size: 14px`, `font-weight: 500`. No action in mock.
- **Meta line** below (after a `1px solid var(--rule)` divider, `margin-top: 4px`): `"Signed in as maya@example.com via NeonAuth."` — 13px, `--ink-3`. Email in `--ink-1 font-weight: 500`.

---

## Card Shell

Each panel uses a card with:
- `border: 1px solid var(--rule)`, `border-radius: 12px`, `overflow: hidden`
- **Card header:** `padding: 18px 24px 14px`, `background: var(--paper-2)`, `border-bottom: 1px solid var(--rule)`. Contains sub-label (JetBrains Mono 10px uppercase `--ink-3`) + card title (DM Serif Display 20px `--ink-1`).
- **Card body:** `padding: 24px`

---

## Component Structure

Single file: `apps/web/src/pages/ProfilePage.tsx`

```
ProfilePage
  ├─ activeSection state: 'identity' | 'notifications' | 'account'
  ├─ emailPrefs state: Record<EventType, boolean>
  ├─ TopNav
  ├─ page header (§08 label + h1)
  ├─ settings layout grid
  │   ├─ SidebarNav (inline — renders 3 items)
  │   └─ panel area
  │       ├─ IdentityPanel (inline)
  │       ├─ NotificationsPanel (inline)
  │       └─ AccountPanel (inline)
  └─ Footer
```

No sub-components extracted — all three panels are small enough to inline.

---

## Data / Types

```ts
type NotificationEventType =
  | 'booking_confirmed'
  | 'voucher_expiring'
  | 'session_cancelled'
  | 'compensation_issued'
  | 'purchase_confirmed'
  | 'approval_decision'

type EmailPrefs = Record<NotificationEventType, boolean>
```

These types are local to `ProfilePage.tsx` — no additions to `programs.ts` needed.

---

## Routing

Add to `App.tsx`:
```tsx
import { ProfilePage } from './pages/ProfilePage'
// ...
<Route path="/profile" element={<ProfilePage />} />
```

---

## Tests

File: `apps/web/src/__tests__/ProfilePage.test.tsx`

| # | Description |
|---|---|
| 1 | Renders page heading "My profile" |
| 2 | Identity panel is shown by default |
| 3 | Clicking "Notifications" sidebar item shows Notifications panel |
| 4 | Clicking "Account" sidebar item shows Account panel |
| 5 | Identity panel renders display name and email as read-only |
| 6 | Identity panel shows "read-only" badge on both fields |
| 7 | Notifications panel renders all 6 toggle rows |
| 8 | Toggles reflect correct default on/off state |
| 9 | Clicking a toggle flips its state |
| 10 | Account panel renders "Sign out" button |
| 11 | Account panel shows signed-in email in meta line |

---

## Constraints

- No real auth gate — page assumes `loggedIn=true`
- No API calls — all state is local
- No persistence of notification prefs in mock
- `ProfilePage` accepts optional props for testability: `initialSection?: 'identity' | 'notifications' | 'account'`, `initialPrefs?: EmailPrefs`, `userName?: string`, `userEmail?: string`

---

## Out of Scope (v1)

- Editable display name or email
- Password change flow
- Delete account
- SMS notification preferences
- Per-program notification overrides
