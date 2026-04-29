# ProductDetailPage — Design Spec

_Date: 2026-04-29_

## Overview

Implement `ProductDetailPage` at `/programs/:id/products/:productId` — the third page in the member-facing flow. Shows product details, upcoming sessions (session-type only), and a list of purchase packages that include this product. Wires into the existing router.

---

## Architecture & Routing

### New route
Add to `App.tsx`:
```
/programs/:id/products/:productId → <ProductDetailPage />
```

### Page file
`apps/web/src/pages/ProductDetailPage.tsx`

Reads `programId` and `productId` from `useParams`. Looks up the product by finding it inside `PROGRAM_DETAILS[programId].products`. Renders a "not found" fallback for unknown ids. Shell:

```
<TopNav loggedIn={true} />
<Breadcrumb programId={id} programName={...} productName={...} />
<HeroSection product={product} program={program} />
<SessionsSection sessions={product.sessions} timezone={program.timezone} />  {/* session-type only */}
<PackagesSection packages={filteredPackages} programId={id} />
<Footer />
```

### Sub-components
All live in `apps/web/src/pages/product-detail/`:
- `HeroSection.tsx` — product image, stats strip, CTA buttons
- `SessionsSection.tsx` — upcoming session rows (session-type only)
- `PackagesSection.tsx` — package card grid + section header
- `PackageCard.tsx` — single package card

---

## Data Model

New types added to `apps/web/src/data/programs.ts`. All ERD fields must be present; UI-only fields may be added.

### ERD reference (relevant tables)

| Table | Canonical fields |
|---|---|
| PURCHASE_PACKAGE | `id, program_id, name, price, status, created_at` |
| PACKAGE_ENTRY | `id, package_id, product_id, quantity, validity_rule` |
| SESSION | `id, product_id, start_time, end_time, status, is_active, created_at` |

### `PackageEntryMock`
```ts
export type PackageEntryMock = {
  // ERD: PACKAGE_ENTRY fields
  id: string
  package_id: string
  product_id: string
  quantity: number
  validity_rule: string   // display string, e.g. "60 days from purchase"
}
```

### `PackageMock`
```ts
export type PackageMock = {
  // ERD: PURCHASE_PACKAGE fields
  id: string
  program_id: string
  name: string
  price: string           // display string, e.g. "$240"
  status: 'active' | 'archived'
  created_at: string      // ISO-8601

  // UI-only
  entries: PackageEntryMock[]
}
```

### `SessionInstanceMock`
```ts
export type SessionInstanceMock = {
  // ERD: SESSION fields
  id: string
  product_id: string
  start_time: string      // ISO-8601
  end_time: string        // ISO-8601
  status: 'open' | 'full' | 'past'
  is_active: boolean
  created_at: string      // ISO-8601

  // UI-only extras
  coach: string
  taken: number
  capacity: number   // copied from product for display; avoids prop drilling
}
```

### `ProductMock` extension
Add two optional UI-only fields to the existing `ProductMock`:
```ts
sessions?: SessionInstanceMock[]   // session-type only; 3–5 entries
validityDays?: number              // display in hero stats strip, e.g. 60
```
`validityDays` is a product-level concept (admin-configurable per product). It is separate from `validity_rule` on `PackageEntryMock`, which describes the per-package entry window.

### `PACKAGES` export
A flat `PackageMock[]` exported from `programs.ts`. Each program gets 2–3 packages. Example for `p1` (Eastside Boxing Club):
- "10-class pass" — $240, entries: Saturday Bag Work ×10 (60 days), Friday Pad Rounds ×5 (60 days)
- "Drop-in single" — $28, entries: Saturday Bag Work ×1 (60 days)
- "Monthly unlimited" — $99, entries: Saturday Bag Work ×∞ (30 days), Friday Pad Rounds ×∞ (30 days)

### Package filtering
At render time, the page filters `PACKAGES` by:
```ts
PACKAGES.filter(pkg =>
  pkg.program_id === programId &&
  pkg.entries.some(e => e.product_id === productId)
)
```
No denormalization into `ProductMock`.

---

## Component Design

### Breadcrumb
`padding: 20px 64px`, 13px, `var(--ink-3)`, flex row with `→` separators.
- "Discover" — `<Link to="/">` accent on hover
- `{programName}` — `<Link to="/programs/:id">` accent on hover
- `{productName}` — plain `var(--ink-1)`, no link (current page)

### HeroSection

Two-column grid (`1fr 1.05fr`, gap 56, `padding: 0 64px 56px`).

**Left column:**
- `4/5` placeholder with `imageTone` matching product
- Top-left floating pill (paper-1 bg, border, rounded-full): `§02` mono label + `"Session product"` or `"Simple product"` text
- Bottom-right capacity chip (ink-1 bg, paper-1 text, mono 10px, rounded-12): `CAP · {n} PEOPLE` — session-type only

**Right column (flex column, space-between):**

Top block:
- Category pill (from `program.category`): accent-soft bg, accent-ink text, 12px, rounded-full
- Product name: `<h1>` DM Serif Display 76px, line-height 0.95, `-0.03em` tracking. Last word italic in accent color.
- Description: 16px Inter Tight, `var(--ink-2)`, max-width 540, line-height 1.6

Stats strip (border-top + border-bottom, padding 28px 0):
- **Session-type:** 4 cells — `Per session` (value: `product.lowestPrice`) / `Capacity` (value: `product.capacity`) / `Sessions / wk` (value: `product.sessionsPerWeek`) / `Voucher valid` (value: `product.validityDays ?? '—'` + `"days"` sub-label)
- **Simple-type:** 2 cells — `Price` (value: `product.lowestPrice`) / `Voucher valid` (value: `product.validityDays ?? '—'`)
- Each cell: mono 10px uppercase label (`var(--ink-3)`) + serif 32px value + 12px sub-label (`var(--ink-2)`)

CTA block (margin-top 28):
- **Session-type:** filled button `"Reserve a session →"` (accent bg, paper-1 text) + outline button `"Buy a package →"` (transparent bg, ink-1 border + text)
- **Simple-type:** single filled button `"Get this product →"` (accent bg, paper-1 text)

### SessionsSection
Rendered only when `product.type === 'session' && product.sessions?.length`. Hidden for simple-type products and session-type products with no session data.

`padding: 32px 64px 72px`, `background: var(--paper-2)`, border-top + border-bottom.

Header:
- Mono eyebrow: `§03 · Schedule`, 11px, 0.1em tracking
- `<h2>` DM Serif Display 44px: `Upcoming *instances.*` (last word italic in accent)
- Sub note: `Times shown in {timezone} (program timezone)`, 13px, ink-2

Session list container: paper-1 bg, border, border-radius 14, overflow hidden. Renders 3–5 `SessionInstance` rows.

**SessionInstance row** (`display: grid`, columns `64px 1fr auto auto`, gap 24, `padding: 20px 24px`, border-top):
- Date column: mono day-of-week (10px, ink-3) + serif date number (32px)
- Info column: time in 15px sans 500 + "with {coach} · 60 min" in 12px ink-2
- Capacity column (160px): mono `{taken}/{capacity} TAKEN` label + `{n} OPEN` or `WAITLIST`, 4px progress bar (accent fill for open, ink-3 for full)
- Action button (min-width 110): `"Reserve →"` dark filled / `"Join waitlist"` outline / `"Past"` ghost (45% opacity row)

### PackagesSection

`padding: 56px 64px 80px`

Header:
- Mono eyebrow: `§04 · Purchase packages`, 11px
- `<h2>` DM Serif Display 36px: `How to *buy in.*`
- Sub: `{n} packages include this product`, 14px, ink-2

`PackageCard` grid: `repeat(3, 1fr)`, gap 20.

**PackageCard:**
- Border `var(--rule)`, border-radius 14, `padding: 24px`, flex column, gap 16
- Package name: serif 22px, ink-1
- Price: serif 36px, ink-1 + `/ package` in 13px ink-2
- Entries list: each entry shows `{product name} · ×{quantity}` in 13px ink-1, validity rule in 12px ink-3 mono below
- Divider: 1px dashed rule
- CTA link: `"Buy this package →"` 13px accent, navigates to `/programs/:id/packages/:packageId/checkout` (stub route — not yet implemented)

---

## Tests

File: `apps/web/src/__tests__/ProductDetailPage.test.tsx`

All tests use `MemoryRouter` + `Routes` + `Route` wrapping, same as `ProgramDetailPage.test.tsx`.

1. Renders product name and description for a known product id
2. Shows `session` type badge for a session-type product
3. Shows `simple` type badge for a simple-type product
4. Renders the sessions section for a session-type product
5. Does **not** render the sessions section for a simple-type product
6. Renders correct session rows (date, coach name present)
7. Shows "Join waitlist" button for a full session
8. Renders the packages section with correct package names
9. Package card CTA links point to `/programs/:id/packages/:packageId/checkout`
10. Breadcrumb "Discover" link points to `/`
11. Breadcrumb program name links to `/programs/:id`
12. Renders "Product not found." for an unknown product id

---

## Out of scope
- Real booking / checkout API calls (CTAs are stubs)
- Authentication state (loggedIn hardcoded `true`)
- Waitlist logic
- Admin/manager flows
- CheckoutPage implementation
