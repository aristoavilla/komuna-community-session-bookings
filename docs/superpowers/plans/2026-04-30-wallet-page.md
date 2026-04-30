# WalletPage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/wallet` — an authenticated member's voucher wallet that groups vouchers by product, sorted soonest-expiring first, with a toggle to show/hide expired vouchers.

**Architecture:** Single `WalletPage` component reads from a `VOUCHERS` mock array added to `programs.ts`. Accepts an optional `vouchers` prop (defaults to `VOUCHERS`) to keep tests free of module mocks. Products are derived by grouping vouchers in the component; no sub-components needed.

**Tech Stack:** React 19, React Router v6, Vitest + @testing-library/react, inline styles with CSS custom properties.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `apps/web/src/data/programs.ts` | Add `VoucherMock` type + `VOUCHERS` mock array |
| Create | `apps/web/src/pages/WalletPage.tsx` | Full page component |
| Create | `apps/web/src/__tests__/WalletPage.test.tsx` | 12 component tests |
| Modify | `apps/web/src/__tests__/programs.test.ts` | Add voucher data shape test |
| Modify | `apps/web/src/App.tsx` | Add `/wallet` route |
| Modify | `apps/web/src/__tests__/routing.test.tsx` | Add `/wallet` routing test |
| Modify | `PAGES.md` | Mark WalletPage `[x]` |

---

## Task 1: VoucherMock type and VOUCHERS mock data

**Files:**
- Modify: `apps/web/src/data/programs.ts`
- Modify: `apps/web/src/__tests__/programs.test.ts`

- [ ] **Step 1: Write failing test**

Append to `apps/web/src/__tests__/programs.test.ts` (add `VOUCHERS` and `VoucherMock` to the existing import line, then append the test):

Change the import line at the top from:
```ts
import { PROGRAMS, CATEGORIES } from '../data/programs'
import type { ProgramDetailMock, ProductMock } from '../data/programs'
import { PROGRAM_DETAILS } from '../data/programs'
```
to:
```ts
import { PROGRAMS, CATEGORIES, PROGRAM_DETAILS, VOUCHERS } from '../data/programs'
import type { ProgramDetailMock, ProductMock, VoucherMock } from '../data/programs'
```

Then append this test at the end of the file:

```ts
it('VoucherMock has all required ERD fields', () => {
  const v: VoucherMock = VOUCHERS[0]
  expect(v.id).toBeDefined()
  expect(v.program_member_id).toBeDefined()
  expect(v.product_id).toBeDefined()
  // purchase_id is nullable for compensation/giveaway
  expect('purchase_id' in v).toBe(true)
  expect(v.source).toMatch(/^(purchase|compensation|giveaway)$/)
  expect(v.status).toMatch(/^(active|claimed|expired|refunded)$/)
  expect(v.expired_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
})

it('VOUCHERS covers all four statuses', () => {
  const statuses = new Set(VOUCHERS.map((v) => v.status))
  expect(statuses.has('active')).toBe(true)
  expect(statuses.has('claimed')).toBe(true)
  expect(statuses.has('expired')).toBe(true)
  expect(statuses.has('refunded')).toBe(true)
})

it('VOUCHERS covers all three sources', () => {
  const sources = new Set(VOUCHERS.map((v) => v.source))
  expect(sources.has('purchase')).toBe(true)
  expect(sources.has('compensation')).toBe(true)
  expect(sources.has('giveaway')).toBe(true)
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/web && npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: compilation error — `VOUCHERS` and `VoucherMock` are not exported from `programs.ts`.

- [ ] **Step 3: Add VoucherMock type and VOUCHERS data to programs.ts**

Append the following at the end of `apps/web/src/data/programs.ts` (after the closing `}` of `IssuedVoucherMock`):

```ts
// ─── Wallet mock data ─────────────────────────────────────────────────────────

export type VoucherMock = {
  // ERD: VOUCHER fields
  id: string
  program_member_id: string
  product_id: string
  purchase_id: string | null    // null for compensation / giveaway
  source: 'purchase' | 'compensation' | 'giveaway'
  status: 'active' | 'claimed' | 'expired' | 'refunded'
  expired_at: string            // ISO-8601

  // UI-only
  product_name: string
  program_id: string
  program_name: string
}

// Covers all 4 statuses and all 3 sources across 3 products.
// Saturday Bag Work (p1): active ×3, claimed ×1, refunded ×1, expired ×2
// Morning Vinyasa (p2): active ×1 purchase, active ×1 compensation
// Barbell Fundamentals (p3): expired ×2 giveaway  — hidden by default (no active)
export const VOUCHERS: VoucherMock[] = [
  {
    id: 'v1', program_member_id: 'pm-1', product_id: 'prod-p1-1',
    purchase_id: 'pur-1', source: 'purchase', status: 'active',
    expired_at: '2026-06-03T00:00:00Z',
    product_name: 'Saturday Bag Work', program_id: 'p1', program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v2', program_member_id: 'pm-1', product_id: 'prod-p1-1',
    purchase_id: 'pur-1', source: 'purchase', status: 'active',
    expired_at: '2026-06-05T00:00:00Z',
    product_name: 'Saturday Bag Work', program_id: 'p1', program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v3', program_member_id: 'pm-1', product_id: 'prod-p1-1',
    purchase_id: 'pur-1', source: 'purchase', status: 'active',
    expired_at: '2026-06-15T00:00:00Z',
    product_name: 'Saturday Bag Work', program_id: 'p1', program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v4', program_member_id: 'pm-1', product_id: 'prod-p1-1',
    purchase_id: 'pur-1', source: 'purchase', status: 'claimed',
    expired_at: '2026-06-07T00:00:00Z',
    product_name: 'Saturday Bag Work', program_id: 'p1', program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v5', program_member_id: 'pm-1', product_id: 'prod-p1-1',
    purchase_id: 'pur-1', source: 'purchase', status: 'refunded',
    expired_at: '2026-06-10T00:00:00Z',
    product_name: 'Saturday Bag Work', program_id: 'p1', program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v6', program_member_id: 'pm-1', product_id: 'prod-p1-1',
    purchase_id: 'pur-2', source: 'purchase', status: 'expired',
    expired_at: '2026-03-01T00:00:00Z',
    product_name: 'Saturday Bag Work', program_id: 'p1', program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v7', program_member_id: 'pm-1', product_id: 'prod-p1-1',
    purchase_id: 'pur-2', source: 'purchase', status: 'expired',
    expired_at: '2026-03-15T00:00:00Z',
    product_name: 'Saturday Bag Work', program_id: 'p1', program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v8', program_member_id: 'pm-1', product_id: 'prod-p2-1',
    purchase_id: 'pur-3', source: 'purchase', status: 'active',
    expired_at: '2026-05-20T00:00:00Z',
    product_name: 'Morning Vinyasa', program_id: 'p2', program_name: 'Slow Flow with Ines',
  },
  {
    id: 'v9', program_member_id: 'pm-1', product_id: 'prod-p2-1',
    purchase_id: null, source: 'compensation', status: 'active',
    expired_at: '2026-05-25T00:00:00Z',
    product_name: 'Morning Vinyasa', program_id: 'p2', program_name: 'Slow Flow with Ines',
  },
  {
    id: 'v10', program_member_id: 'pm-1', product_id: 'prod-p3-1',
    purchase_id: null, source: 'giveaway', status: 'expired',
    expired_at: '2026-02-01T00:00:00Z',
    product_name: 'Barbell Fundamentals', program_id: 'p3', program_name: 'Strong Together',
  },
  {
    id: 'v11', program_member_id: 'pm-1', product_id: 'prod-p3-1',
    purchase_id: null, source: 'giveaway', status: 'expired',
    expired_at: '2026-02-15T00:00:00Z',
    product_name: 'Barbell Fundamentals', program_id: 'p3', program_name: 'Strong Together',
  },
]
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/web && npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: the 3 new voucher tests PASS. All pre-existing tests still pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/data/programs.ts apps/web/src/__tests__/programs.test.ts
git commit -m "$(cat <<'EOF'
feat: add VoucherMock type and VOUCHERS mock data to programs.ts

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: WalletPage tests (all failing)

**Files:**
- Create: `apps/web/src/__tests__/WalletPage.test.tsx`

- [ ] **Step 1: Create the test file**

Create `apps/web/src/__tests__/WalletPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { WalletPage } from '../pages/WalletPage'
import type { VoucherMock } from '../data/programs'

function renderWallet(vouchers?: VoucherMock[]) {
  return render(
    <MemoryRouter>
      <WalletPage vouchers={vouchers} />
    </MemoryRouter>
  )
}

describe('WalletPage', () => {
  it('renders page heading "My wallet"', () => {
    renderWallet()
    expect(screen.getByRole('heading', { name: /my wallet/i })).toBeInTheDocument()
  })

  it('renders product cards for products with visible vouchers', () => {
    renderWallet()
    // Default (showExpired=false): Saturday Bag Work and Morning Vinyasa have active vouchers
    expect(screen.getByText('Saturday Bag Work')).toBeInTheDocument()
    expect(screen.getByText('Morning Vinyasa')).toBeInTheDocument()
    // Barbell Fundamentals has only expired vouchers — hidden by default
    expect(screen.queryByText('Barbell Fundamentals')).not.toBeInTheDocument()
  })

  it('hides expired vouchers by default', () => {
    renderWallet()
    // v6 and v7 have status=expired and expired_at in March 2026; their rows are hidden
    expect(screen.queryByText(/Mar 2026/)).not.toBeInTheDocument()
  })

  it('reveals expired vouchers and hidden product cards after toggling "Show expired"', async () => {
    const user = userEvent.setup()
    renderWallet()
    await user.click(screen.getByRole('button', { name: /show expired/i }))
    // March-dated expired vouchers for Saturday Bag Work are now visible
    expect(screen.getAllByText(/Mar 2026/).length).toBeGreaterThan(0)
    // Barbell Fundamentals card (all-expired product) is now visible
    expect(screen.getByText('Barbell Fundamentals')).toBeInTheDocument()
  })

  it('hides entire product card when all its vouchers are expired and toggle is off', () => {
    renderWallet()
    expect(screen.queryByText('Barbell Fundamentals')).not.toBeInTheDocument()
  })

  it('renders "Book →" link for products with at least one active voucher', () => {
    renderWallet()
    const bagWorkCard = screen.getByTestId('product-card-prod-p1-1')
    expect(within(bagWorkCard).getByText('Book →')).toBeInTheDocument()
    const vinyasaCard = screen.getByTestId('product-card-prod-p2-1')
    expect(within(vinyasaCard).getByText('Book →')).toBeInTheDocument()
  })

  it('does not render "Book →" link when no active vouchers', async () => {
    const user = userEvent.setup()
    renderWallet()
    await user.click(screen.getByRole('button', { name: /show expired/i }))
    const barbellCard = screen.getByTestId('product-card-prod-p3-1')
    expect(within(barbellCard).queryByText('Book →')).not.toBeInTheDocument()
  })

  it('renders correct status badge label for each status', async () => {
    const user = userEvent.setup()
    renderWallet()
    await user.click(screen.getByRole('button', { name: /show expired/i }))
    expect(screen.getAllByText('active').length).toBeGreaterThan(0)
    expect(screen.getAllByText('claimed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('expired').length).toBeGreaterThan(0)
    expect(screen.getAllByText('refunded').length).toBeGreaterThan(0)
  })

  it('renders correct source label for each source', async () => {
    const user = userEvent.setup()
    renderWallet()
    await user.click(screen.getByRole('button', { name: /show expired/i }))
    expect(screen.getAllByText('purchase').length).toBeGreaterThan(0)
    expect(screen.getAllByText('compensation').length).toBeGreaterThan(0)
    expect(screen.getAllByText('giveaway').length).toBeGreaterThan(0)
  })

  it('renders empty state when no vouchers exist', () => {
    renderWallet([])
    expect(screen.getByText(/no vouchers yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse programs/i })).toBeInTheDocument()
  })

  it('expired vouchers render with reduced opacity when showExpired is true', async () => {
    const user = userEvent.setup()
    renderWallet()
    await user.click(screen.getByRole('button', { name: /show expired/i }))
    // Barbell card has only expired vouchers — all rows should have opacity 0.5
    const barbellCard = screen.getByTestId('product-card-prod-p3-1')
    const rows = within(barbellCard).getAllByTestId('voucher-row')
    expect(rows[0]).toHaveStyle('opacity: 0.5')
  })

  it('voucher rows sorted by expired_at ascending within each product group', async () => {
    const user = userEvent.setup()
    renderWallet()
    await user.click(screen.getByRole('button', { name: /show expired/i }))
    // Saturday Bag Work: expired March rows first, latest June row last
    const bagWorkCard = screen.getByTestId('product-card-prod-p1-1')
    const rows = within(bagWorkCard).getAllByTestId('voucher-row')
    expect(rows[0].textContent).toMatch(/Mar/)           // earliest: 2026-03-01
    expect(rows[rows.length - 1].textContent).toMatch(/15 Jun/) // latest: 2026-06-15
  })
})
```

- [ ] **Step 2: Run tests to verify they all fail**

```bash
cd apps/web && npm test -- --reporter=verbose 2>&1 | grep -E "FAIL|PASS|✓|✗|×" | head -30
```

Expected: all 12 WalletPage tests fail with "Cannot find module '../pages/WalletPage'" or similar import error.

- [ ] **Step 3: Commit the failing tests**

```bash
git add apps/web/src/__tests__/WalletPage.test.tsx
git commit -m "$(cat <<'EOF'
test: add 12 WalletPage tests (all failing)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Implement WalletPage

**Files:**
- Create: `apps/web/src/pages/WalletPage.tsx`

- [ ] **Step 1: Create WalletPage.tsx**

Create `apps/web/src/pages/WalletPage.tsx`:

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { VOUCHERS } from '../data/programs'
import type { VoucherMock } from '../data/programs'

interface WalletPageProps {
  vouchers?: VoucherMock[]
}

function formatExpiry(isoDate: string): string {
  const date = new Date(isoDate)
  const formatted = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return date <= new Date() ? `Expired ${formatted}` : `Expires ${formatted}`
}

const STATUS_STYLES: Record<
  VoucherMock['status'],
  { background: string; color: string }
> = {
  active:   { background: 'oklch(0.93 0.06 150)', color: 'var(--ok)' },
  claimed:  { background: 'var(--accent-soft)',   color: 'var(--accent-ink)' },
  expired:  { background: 'var(--paper-3)',        color: 'var(--ink-3)' },
  refunded: { background: 'var(--paper-3)',        color: 'var(--ink-3)' },
}

export function WalletPage({ vouchers = VOUCHERS }: WalletPageProps) {
  const [showExpired, setShowExpired] = useState(false)

  // Group by product_id, sort each group by expired_at ascending
  const grouped = new Map<string, VoucherMock[]>()
  for (const v of vouchers) {
    if (!grouped.has(v.product_id)) grouped.set(v.product_id, [])
    grouped.get(v.product_id)!.push(v)
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.expired_at.localeCompare(b.expired_at))
  }

  // Sort product groups: earliest active expiry first; no-active groups last
  const groups = Array.from(grouped.entries())
    .map(([productId, list]) => {
      const firstActive = list.find((v) => v.status === 'active')
      return { productId, list, firstActiveExpiry: firstActive?.expired_at ?? null, meta: list[0] }
    })
    .sort((a, b) => {
      if (!a.firstActiveExpiry && !b.firstActiveExpiry) return 0
      if (!a.firstActiveExpiry) return 1
      if (!b.firstActiveExpiry) return -1
      return a.firstActiveExpiry.localeCompare(b.firstActiveExpiry)
    })

  // Apply showExpired filter
  const visibleGroups = groups
    .map((g) => ({
      ...g,
      visibleList: showExpired ? g.list : g.list.filter((v) => v.status !== 'expired'),
    }))
    .filter((g) => g.visibleList.length > 0)

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        {/* Page header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 40,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: 8,
              }}
            >
              §05 · My wallet
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: 36,
                letterSpacing: '-0.02em',
                color: 'var(--ink-1)',
                margin: 0,
              }}
            >
              My wallet
            </h1>
          </div>
          <button
            onClick={() => setShowExpired((s) => !s)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-sans, sans-serif)',
              padding: '4px 0',
              marginTop: 4,
            }}
          >
            {showExpired ? 'Hide expired' : 'Show expired'}
          </button>
        </div>

        {/* Empty state */}
        {visibleGroups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 16 }}>
              No vouchers yet.
            </div>
            <Link
              to="/"
              style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none' }}
            >
              Browse programs →
            </Link>
          </div>
        )}

        {/* Product cards */}
        {visibleGroups.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {visibleGroups.map(({ productId, visibleList, firstActiveExpiry, meta }) => (
              <div
                key={productId}
                data-testid={`product-card-${productId}`}
                style={{
                  border: '1px solid var(--rule)',
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-serif, serif)',
                        fontSize: 18,
                        color: 'var(--ink-1)',
                        marginBottom: 4,
                      }}
                    >
                      {meta.product_name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                      {meta.program_name}
                    </div>
                  </div>
                  {firstActiveExpiry !== null && (
                    <Link
                      to={`/programs/${meta.program_id}/products/${productId}/sessions`}
                      style={{
                        fontSize: 13,
                        color: 'var(--accent)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-sans, sans-serif)',
                        marginTop: 4,
                      }}
                    >
                      Book →
                    </Link>
                  )}
                </div>

                <hr
                  style={{
                    border: 'none',
                    borderBottom: '1px solid var(--rule)',
                    margin: '0 0 8px',
                  }}
                />

                {/* Voucher rows */}
                {visibleList.map((voucher, i) => (
                  <div
                    key={voucher.id}
                    data-testid="voucher-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '10px 0',
                      borderBottom:
                        i < visibleList.length - 1
                          ? '1px dashed var(--rule)'
                          : 'none',
                      opacity: voucher.status === 'expired' ? 0.5 : 1,
                    }}
                  >
                    {/* Expiry date */}
                    <div style={{ flex: 1, fontSize: 14, color: 'var(--ink-2)' }}>
                      {formatExpiry(voucher.expired_at)}
                    </div>

                    {/* Status badge */}
                    <div
                      style={{
                        ...STATUS_STYLES[voucher.status],
                        borderRadius: 99,
                        padding: '2px 10px',
                        fontSize: 12,
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {voucher.status}
                    </div>

                    {/* Source label */}
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--ink-3)',
                        minWidth: 100,
                        textAlign: 'right',
                      }}
                    >
                      {voucher.source}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Run tests to verify all 12 pass**

```bash
cd apps/web && npm test -- --reporter=verbose 2>&1 | grep -E "WalletPage|✓|✗|PASS|FAIL"
```

Expected: all 12 WalletPage tests pass. All pre-existing tests still pass.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/WalletPage.tsx
git commit -m "$(cat <<'EOF'
feat: implement WalletPage — voucher wallet grouped by product

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Wire route, add routing test, mark PAGES.md

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/__tests__/routing.test.tsx`
- Modify: `PAGES.md`

- [ ] **Step 1: Add route to App.tsx**

Replace the contents of `apps/web/src/App.tsx` with:

```tsx
import { Routes, Route } from 'react-router-dom'
import { DiscoveryPage } from './pages/DiscoveryPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { WalletPage } from './pages/WalletPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DiscoveryPage />} />
      <Route path="/programs/:id" element={<ProgramDetailPage />} />
      <Route path="/programs/:id/products/:productId" element={<ProductDetailPage />} />
      <Route path="/programs/:id/packages/:packageId/checkout" element={<CheckoutPage />} />
      <Route path="/wallet" element={<WalletPage />} />
    </Routes>
  )
}
```

- [ ] **Step 2: Add routing test**

Append to `apps/web/src/__tests__/routing.test.tsx` (inside the existing `describe('routing', ...)` block, before the closing `}`):

```tsx
  it('renders WalletPage at /wallet', () => {
    render(
      <MemoryRouter initialEntries={['/wallet']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /my wallet/i })).toBeInTheDocument()
  })
```

- [ ] **Step 3: Run all tests to verify everything passes**

```bash
cd apps/web && npm test -- --reporter=verbose 2>&1 | tail -30
```

Expected: all tests pass, including the new routing test.

- [ ] **Step 4: Mark PAGES.md**

In `PAGES.md`, change:

```
- [ ] **WalletPage** — `/wallet` — Authenticated member's vouchers grouped by product, sorted by `expiredAt` (soonest first). Toggle to show/hide expired vouchers. Each row shows product, expiry date, status badge (`active | claimed | expired | refunded`), source (`purchase | compensation | giveaway`).
```

to:

```
- [x] **WalletPage** — `/wallet` — Authenticated member's vouchers grouped by product, sorted by `expiredAt` (soonest first). Toggle to show/hide expired vouchers. Each row shows product, expiry date, status badge (`active | claimed | expired | refunded`), source (`purchase | compensation | giveaway`).
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/__tests__/routing.test.tsx PAGES.md
git commit -m "$(cat <<'EOF'
feat: wire /wallet route and mark WalletPage complete in PAGES.md

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 12 tests from spec covered. All UI requirements (grouping, sorting, toggle, Book → link, status badges, source labels, empty state, opacity) implemented.
- [x] **No placeholders:** All steps contain complete code.
- [x] **Type consistency:** `VoucherMock` defined in Task 1, used identically in Tasks 2, 3, 4. `firstActiveExpiry` computed in Task 3 and referenced in JSX correctly.
- [x] **Mock data:** 11 vouchers, 3 products, all 4 statuses, all 3 sources.
- [x] **PAGES.md:** Marked `[x]` in Task 4.
