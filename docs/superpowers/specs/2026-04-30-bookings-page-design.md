# BookingsPage Design Spec

**Date:** 2026-04-30
**Route:** `/my/bookings`
**Status:** Approved

---

## Overview

Member-facing page showing all their voucher claims — upcoming (active) and historical (past). Authenticated only. Follows the WalletPage layout pattern and the warm editorial design system from the Komuna Discovery design file.

---

## Layout

Same shell as WalletPage:
- `TopNav` (loggedIn=true) at top
- `Footer` at bottom
- `maxWidth: 760`, `margin: 0 auto`, `padding: 48px 24px 72px`
- Section label: `§06 · My bookings` (monospace, uppercase, `--ink-3`)
- `h1`: "My bookings" (DM Serif Display, 36px, `--ink-1`)

---

## Tabs

Two tabs below the header: **Active** (default) and **Past**.

Tab styling: underline-style indicator, active tab in `--ink-1`, inactive in `--ink-3`. No background pills.

---

## Active Tab

Upcoming bookings — sessions where `cancelled_at` is null and `start_time > now`.

Each booking renders as a `<section>` card (border `1px solid var(--rule)`, `borderRadius: 8`, `padding: 24`, `background: var(--paper-1)`).

**Card structure:**

```
[Product name — serif 18px]        [Cancel button — right]
[Program name — ink-3, 13px]

─────────────────────────────────

[Date + time — ink-1, 14px]        [Coach — ink-3, 13px]
[Duration — ink-3, 13px]           [Capacity: 8 / 14 — ink-3, 13px]

[Custom field answers — collapsible if any]
```

**Cancel button:** `border: 1px solid var(--rule)`, `color: var(--ink-2)`, borderRadius 999, 13px. On click → expands an inline confirmation strip below the card header.

**Cancel confirmation strip:**
- Background: `var(--paper-3)`, `border-top: 1px solid var(--rule)`, padding 16px
- Text: "Cancelling will issue a compensation voucher valid for [N] days."
- Two buttons: "Confirm cancel" (accent bg) + "Keep booking" (transparent/text)
- After confirm: card updates to cancelled state immediately (optimistic UI in mock)

**Empty state:** `"No upcoming bookings."` + `"Browse programs →"` link to `/`.

---

## Past Tab

Historical claims — sessions in the past or where `cancelled_at` is not null.

Same card structure as Active but:
- Status badge (right of product name): `completed` | `cancelled` — same badge style as WalletPage status pills (monospace, uppercase, borderRadius 99)
- `completed`: green tint (`oklch(0.78 0.12 150 / 15%)` bg, `--ok` color)
- `cancelled`: `--paper-3` bg, `--ink-3` color; card opacity 0.7
- If `cancelled` and a compensation voucher was issued: shows `"Compensation voucher: expires [date]"` in `--ink-3`, 12px mono below the card body
- No action buttons

**Empty state:** `"No past bookings yet."`

---

## Data Model

### `VoucherClaimMock`

ERD-aligned fields:
- `id: string`
- `voucher_id: string`
- `session_id: string`
- `claimed_at: string` — ISO-8601
- `alias: string | null` — walk-in alias (manager-set)
- `attendance_status: 'pending' | 'attended' | 'no-show'`
- `grievance_status: 'none' | 'pending' | 'resolved'`
- `cancelled_at: string | null` — ISO-8601

UI-only extras:
- `product_id: string`
- `product_name: string`
- `program_id: string`
- `program_name: string`
- `session_start_time: string` — ISO-8601
- `session_end_time: string` — ISO-8601
- `coach: string`
- `session_capacity: number`
- `session_taken: number`
- `custom_field_answers: CustomFieldAnswerMock[]`
- `compensation_voucher_expires_at: string | null` — UI-only; populated if cancelled

### `CustomFieldAnswerMock`

ERD-aligned:
- `id: string`
- `claim_id: string`
- `value: string`

UI-only:
- `field_name: string`
- `field_required: boolean`

### Mock data

Export `BOOKINGS: VoucherClaimMock[]` from `programs.ts`. Cover:
- 2–3 upcoming (active) bookings across different programs/products
- 1 completed booking (attended)
- 1 cancelled booking with compensation voucher reference
- At least one booking with custom field answers

---

## Component Structure

```
pages/
  BookingsPage.tsx           — page shell, tab state, filters active vs past
  bookings/
    BookingCard.tsx          — single booking card (active or past)
    CancelConfirmStrip.tsx   — inline cancel confirmation UI
```

---

## Routing

Add to `App.tsx`:
```tsx
<Route path="/my/bookings" element={<BookingsPage />} />
```

---

## Tests

`__tests__/BookingsPage.test.tsx`:
- Renders Active tab by default
- Active tab shows only non-cancelled upcoming bookings
- Past tab shows completed and cancelled bookings
- Cancel confirmation strip appears on cancel button click
- Compensation voucher reference shown for cancelled bookings in Past tab
- Empty state renders when no bookings in that tab
- Custom field answers render when present

---

## Constraints

- All ERD fields on `VoucherClaimMock` must be present (no omissions)
- FIFO / voucher selection logic is not shown here (that's booking-time, not display-time)
- Cancel flow is local state only (no API in mock)
- No pagination in v1 (list all; YAGNI)
