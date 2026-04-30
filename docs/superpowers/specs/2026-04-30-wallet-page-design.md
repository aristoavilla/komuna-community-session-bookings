# WalletPage Design Spec

**Date:** 2026-04-30
**Route:** `/wallet`
**Status:** Approved

---

## Overview

The WalletPage is an authenticated member's view of all their vouchers. It shows vouchers grouped by product, sorted soonest-expiring first, with a toggle to reveal expired vouchers.

---

## Architecture

Single page component `WalletPage` at `src/pages/WalletPage.tsx`. Reads from a `VOUCHERS` mock data array added to `src/data/programs.ts`. No sub-components needed — voucher rows and product cards are simple enough to inline. The page is wired into routing at `/wallet` in `App.tsx`.

---

## Mock Data

Add `VoucherMock` type and `VOUCHERS` array to `src/data/programs.ts`.

### `VoucherMock` type (all ERD VOUCHER fields)

```ts
export type VoucherMock = {
  // ERD: VOUCHER fields
  id: string
  program_member_id: string
  product_id: string
  purchase_id: string | null     // null for compensation/giveaway
  source: 'purchase' | 'compensation' | 'giveaway'
  status: 'active' | 'claimed' | 'expired' | 'refunded'
  expired_at: string             // ISO-8601

  // UI-only
  product_name: string
  program_id: string
  program_name: string
}
```

### `VOUCHERS` dataset

8–10 entries across 3 products covering all status and source variants:

| product | source | status |
|---|---|---|
| Saturday Bag Work (p1) | purchase | active ×3 |
| Saturday Bag Work (p1) | purchase | claimed ×1 |
| Saturday Bag Work (p1) | purchase | expired ×2 |
| Morning Vinyasa (p2) | purchase | active ×1 |
| Morning Vinyasa (p2) | compensation | active ×1 |
| Barbell Fundamentals (p3) | giveaway | refunded ×1 |

Sorted by `expired_at` ascending within each product group.

---

## Page Layout

```
TopNav (loggedIn=true)
│
├─ Page header row
│   ├─ left: mono label "§05 · My wallet"  /  serif heading "My wallet"
│   └─ right: toggle "Show expired" (boolean state, default false)
│
├─ Product cards (one per product with vouchers)
│   ├─ Card header row
│   │   ├─ left: product name (serif ~18px) + program name (ink-3, 13px)
│   │   └─ right: "Book →" link → /programs/:id/products/:productId/sessions
│   │            (only rendered if ≥1 voucher is active)
│   ├─ hairline rule
│   └─ Voucher rows (one per voucher, sorted by expired_at asc)
│       ├─ col 1: expiry date text (ink-2, 14px)
│       ├─ col 2: status badge (pill)
│       └─ col 3: source badge (mono label)
│
└─ Footer
```

---

## Grouping & Sorting

- Vouchers are grouped by `product_id`.
- Within each group, sorted by `expired_at` ascending (soonest-expiring first).
- Product groups are ordered by the earliest `expired_at` among their active vouchers; products with no active vouchers go last.
- Expired vouchers are hidden by default. The toggle (`showExpired` state) reveals them at reduced opacity (0.5).
- If `showExpired` is false and a product group has no active/claimed/refunded vouchers, the entire product card is hidden.

---

## Voucher Row

Three columns in a flex row, `align-items: center`, `padding: 10px 0`, separated by a `1px dashed var(--rule)` divider between rows.

### Column 1 — Expiry
- If `expired_at > now`: `"Expires DD MMM YYYY"` — `var(--ink-2)`, 14px
- If `expired_at <= now`: `"Expired DD MMM YYYY"` — `var(--ink-3)`, 14px

### Column 2 — Status badge (pill)
| status | background | text color |
|---|---|---|
| active | `var(--ok)` at 15% opacity (oklch tint) | `var(--ok)` |
| claimed | `var(--accent-soft)` | `var(--accent-ink)` |
| expired | `var(--paper-3)` | `var(--ink-3)` |
| refunded | `var(--paper-3)` | `var(--ink-3)` |

Pill: `border-radius: 99px`, `padding: 2px 10px`, `font-size: 12px`, uppercase mono.

### Column 3 — Source badge
Small mono label, `var(--ink-3)`, 11px, uppercase, no background.

---

## "Book →" Link

- Rendered in the card header right side only when the product has ≥1 `active` voucher.
- Links to `/programs/:programId/products/:productId/sessions` — anticipates the upcoming SessionsPage.
- Style: `var(--accent)`, 13px, no underline, font-sans.

---

## Show/Hide Expired Toggle

- Boolean state `showExpired`, default `false`.
- Rendered as a text toggle button in the page header: "Show expired" / "Hide expired".
- Style: 13px, `var(--ink-3)`, cursor pointer, no border, background transparent.
- When `showExpired` is false:
  - Expired voucher rows are not rendered.
  - Product cards with zero visible rows after filtering are not rendered.

---

## Empty State

When `VOUCHERS` is empty or all vouchers are filtered out:
- Centered message: `"No vouchers yet."` — `var(--ink-2)`, 16px
- Link below: `"Browse programs →"` — `var(--accent)`, links to `/`

---

## Routing

Add to `App.tsx`:
```tsx
<Route path="/wallet" element={<WalletPage />} />
```

Add import for `WalletPage`.

---

## Tests

File: `src/__tests__/WalletPage.test.tsx`

| # | description |
|---|---|
| 1 | renders page heading "My wallet" |
| 2 | renders one card per product that has vouchers |
| 3 | hides expired vouchers by default |
| 4 | reveals expired vouchers after toggling "Show expired" |
| 5 | hides entire product card when all its vouchers are expired and toggle is off |
| 6 | renders "Book →" link for products with at least one active voucher |
| 7 | does not render "Book →" link when no active vouchers |
| 8 | renders correct status badge label for each status |
| 9 | renders correct source label for each source |
| 10 | renders empty state when no vouchers exist |
| 11 | expired vouchers render with reduced opacity when showExpired is true |
| 12 | voucher rows sorted by expired_at ascending within each product group |

---

## Out of Scope

- Real auth gate (page assumes `loggedIn=true`)
- Filtering by program
- Voucher detail drill-down
- "Book" CTA for simple-type products (link rendered for all active vouchers; SessionsPage will handle the routing)
