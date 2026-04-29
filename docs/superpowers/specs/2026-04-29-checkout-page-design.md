# CheckoutPage Design

**Route:** `/programs/:id/packages/:packageId/checkout`
**Date:** 2026-04-29

## Overview

The CheckoutPage is reached from PackageCard's "Buy this package →" link. It shows the member a full package summary, a service fee breakdown, and a pay button. Payment is simulated inline (no real Xendit call): the page transitions through `idle → paying → success | failure` without navigating away.

## Layout

Two-column split at `padding: 0 64px`, matching ProductDetailPage:

```
TopNav
Breadcrumb: Discover → {Program} → {Package name} → Checkout
──────────────────────────────────────────────────────
Left column (1.4fr)          │  Right column (1fr, sticky)
  §01 · Package              │    §02 · Order summary
  Placeholder image          │    Fee breakdown table
  Package name (large serif) │    Total
  Entry list                 │    Pay CTA / state transitions
  Program badge              │
──────────────────────────────────────────────────────
Footer
```

## Left Column — Package Summary (`PackageSummary.tsx`)

- **Section label:** `§01 · Package` in `font-mono`, uppercase, `var(--ink-3)`
- **Image placeholder:** striped, `ratio: "16/9"`, tone matches the first product's `imageTone` in the package entries
- **Program badge:** accent-soft pill with program name (same style as category badges on ProductDetailPage)
- **Package name:** `font-serif`, `fontSize: 56`, `letterSpacing: -0.03em`; the final word rendered in italic accent color — if the name is a single word, the whole name gets the italic treatment
- **Entry list:** one row per `PackageEntryMock`
  - Product name + `×{quantity}` (or `×∞` for quantity ≥ 999) in sans, `fontSize: 14`
  - Validity rule in mono, `fontSize: 12`, `var(--ink-3)`, below the product name
  - Each row separated by `borderTop: 1px solid var(--rule)`

## Right Column — Order Summary Card (`OrderSummaryCard.tsx`)

Sticky card (`position: sticky`, `top: 24px`), `border: 1px solid var(--rule)`, `borderRadius: 14`, `padding: 28`.

### Idle state

- **Section label:** `§02 · Order summary` in mono
- **Fee table** (3 rows, dashed `borderBottom`):
  - Row 1: "Package price" / `{pkg.price}`
  - Row 2: "Service fee (5% · min $3)" / computed fee display
  - Row 3: **"Total"** / total in `font-serif`, `fontSize: 28`
- **Fee computation:** `parsePriceAmount(pkg.price)` → `amount`; `fee = Math.max(amount * 0.05, 3.00)`; `total = amount + fee`
- **Pay button:** full-width, `background: var(--accent)`, `color: var(--paper-1)`, label "Pay with Xendit →"
- **Trust note:** `fontSize: 12`, `var(--ink-3)` — "Secure payment via Xendit. Vouchers issued immediately on confirmation."

### Paying state (1.5 s simulated delay)

- Spinner (CSS animation) + "Processing payment…" in mono, centered
- Pay button replaced / disabled

`OrderSummaryCard` accepts an `onPay: () => Promise<'success' | 'failure'>` prop. The default implementation resolves `'success'` after 1.5 s. Tests inject controlled mocks to exercise both outcomes deterministically.

### Success state

- `✓` icon in `var(--ok)`
- Serif headline: "Payment confirmed."
- Vouchers-issued list: one row per package entry — `"{quantity}× {product_name} — valid {validity_rule}"`
- Primary link: "Go to my wallet →" (`/wallet`)
- Secondary link: "Back to program →" (`/programs/:id`)

### Failure state

- `✕` icon in `var(--accent)`
- Serif headline: "Payment failed."
- Subtext: "No charges were made. Please try again."
- "Try again" button → resets to idle state

## Mock Data Additions (`programs.ts`)

### `SERVICE_FEE_CONFIG`

```ts
export const SERVICE_FEE_CONFIG = {
  percentage: 0.05,   // 5%
  minimum: 3.00,      // $3.00 minimum
}
```

### `parsePriceAmount(price: string): number`

Strips leading currency symbol (`$`, `€`, or any non-digit/non-dot prefix) and parses as float. Returns `0` if parsing fails.

```ts
export function parsePriceAmount(price: string): number {
  const match = price.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}
```

### ERD-aligned types for simulated purchase result

```ts
// mirrors ERD PURCHASE table
type CheckoutPurchaseMock = {
  id: string
  program_member_id: string
  created_at: string        // ISO-8601
  total_amount: string      // display string
  status: 'paid' | 'failed'
}

// mirrors ERD VOUCHER table fields relevant to issuance
type IssuedVoucherMock = {
  id: string
  product_id: string
  product_name: string      // UI-only
  source: 'purchase'
  status: 'active'
  expired_at: string        // ISO-8601
  quantity: number          // UI-only: how many issued
  validity_rule: string     // UI-only: display string
}
```

## New Files

| File | Purpose |
|---|---|
| `src/pages/CheckoutPage.tsx` | Page shell, route params, state machine |
| `src/pages/checkout/PackageSummary.tsx` | Left column |
| `src/pages/checkout/OrderSummaryCard.tsx` | Right column with all three states |

## Routing

Add to `App.tsx`:
```tsx
<Route path="/programs/:id/packages/:packageId/checkout" element={<CheckoutPage />} />
```

## Tests (`src/__tests__/CheckoutPage.test.tsx`)

12 tests using Vitest + React Testing Library:

1. Renders package name for a known `packageId`
2. Renders all package entries (product names and quantities)
3. Renders validity rule for each entry
4. Shows correct base price from package data
5. Computes service fee correctly — percentage case (e.g. 5% of $240 = $12 > $3 min)
6. Computes service fee correctly — minimum case (e.g. 5% of $19 = $0.95 < $3 min → shows $3)
7. Shows correct total (base + fee)
8. Clicking "Pay with Xendit" transitions to paying state
9. After simulated delay, success state renders vouchers issued
10. Failure state shows "Payment failed." and "Try again" button
11. Clicking "Try again" resets to idle state
12. Renders "Package not found." for an unknown `packageId`

Plus additions to `routing.test.tsx`:
- Renders CheckoutPage at `/programs/p1/packages/pkg-p1-1/checkout`
