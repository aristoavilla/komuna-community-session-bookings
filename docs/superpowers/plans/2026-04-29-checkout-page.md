# CheckoutPage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the CheckoutPage at `/programs/:id/packages/:packageId/checkout` with a two-column editorial layout, service fee breakdown, and inline payment state machine (idle → paying → success/failure).

**Architecture:** Three components — `PackageSummary` (left column, package display), `OrderSummaryCard` (right column, fee table + state machine via `onPay` prop), and `CheckoutPage` (shell that wires route params, data lookup, and layout). Mock data additions and helpers go in `programs.ts`. All styling uses inline CSS with CSS variables, matching the existing pattern throughout the app.

**Tech Stack:** React 18, React Router v6, TypeScript, Vitest, React Testing Library (`@testing-library/react`)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `apps/web/src/data/programs.ts` | Add `SERVICE_FEE_CONFIG`, `parsePriceAmount`, `CheckoutPurchaseMock`, `IssuedVoucherMock` |
| Create | `apps/web/src/pages/checkout/PackageSummary.tsx` | Left column: placeholder image, package name (serif + italic last word), entry list |
| Create | `apps/web/src/pages/checkout/OrderSummaryCard.tsx` | Right column sticky card: fee table + idle/paying/success/failure states |
| Create | `apps/web/src/pages/CheckoutPage.tsx` | Page shell: TopNav, breadcrumb, two-column grid, Footer |
| Modify | `apps/web/src/App.tsx` | Add checkout route |
| Create | `apps/web/src/__tests__/CheckoutPage.test.tsx` | 12 tests |
| Modify | `apps/web/src/__tests__/routing.test.tsx` | Add 1 routing test for checkout |
| Modify | `PAGES.md` | Mark CheckoutPage `[x]` |

---

### Task 1: Add mock data, types, and helpers to `programs.ts`

**Files:**
- Modify: `apps/web/src/data/programs.ts`

- [ ] **Step 1: Append to the bottom of `apps/web/src/data/programs.ts`**

```ts
// ─── Checkout / payment mock ──────────────────────────────────────────────────

export const SERVICE_FEE_CONFIG = {
  percentage: 0.05,  // 5%
  minimum: 3.00,     // $3.00 minimum fee
}

export function parsePriceAmount(price: string): number {
  const match = price.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

// ERD: PURCHASE table (simulated)
export type CheckoutPurchaseMock = {
  id: string
  program_member_id: string
  created_at: string       // ISO-8601
  total_amount: string     // display string e.g. "$252.00"
  status: 'paid' | 'failed'
}

// ERD: VOUCHER table (issued on purchase)
export type IssuedVoucherMock = {
  id: string
  product_id: string
  product_name: string     // UI-only
  source: 'purchase'
  status: 'active'
  expired_at: string       // ISO-8601
  quantity: number         // UI-only: count issued
  validity_rule: string    // UI-only: display string
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/data/programs.ts
git commit -m "feat: add SERVICE_FEE_CONFIG, parsePriceAmount, and checkout mock types"
```

---

### Task 2: Write failing CheckoutPage tests

**Files:**
- Create: `apps/web/src/__tests__/CheckoutPage.test.tsx`

- [ ] **Step 1: Create the test file**

Create `apps/web/src/__tests__/CheckoutPage.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CheckoutPage } from '../pages/CheckoutPage'

function renderAtPath(
  path: string,
  onPay?: () => Promise<'success' | 'failure'>
) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/programs/:id/packages/:packageId/checkout"
          element={<CheckoutPage onPay={onPay} />}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('CheckoutPage', () => {
  it('renders package name for a known packageId', () => {
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/10-Class Pass/i)
  })

  it('renders all entry product names', () => {
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    expect(screen.getByText(/Saturday Bag Work/i)).toBeInTheDocument()
    expect(screen.getByText(/Friday Pad Rounds/i)).toBeInTheDocument()
  })

  it('renders ∞ quantity for unlimited entries', () => {
    // pkg-p1-3 is Monthly Unlimited — entries have quantity 999 → rendered as ∞
    renderAtPath('/programs/p1/packages/pkg-p1-3/checkout')
    expect(screen.getAllByText(/×∞/).length).toBeGreaterThan(0)
  })

  it('renders validity rule for each entry', () => {
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    // Both entries in pkg-p1-1 have "60 days from purchase"
    const rules = screen.getAllByText(/60 days from purchase/i)
    expect(rules.length).toBeGreaterThanOrEqual(1)
  })

  it('shows the base price from the package', () => {
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    expect(screen.getByText('$240')).toBeInTheDocument()
  })

  it('shows service fee using percentage when it exceeds the minimum', () => {
    // pkg-p1-1: $240 × 5% = $12.00 which is > $3.00 minimum → fee shown = $12.00
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    expect(screen.getByText('$12.00')).toBeInTheDocument()
  })

  it('shows service fee using minimum when percentage is below it', () => {
    // pkg-p4-3: $19 × 5% = $0.95 which is < $3.00 minimum → fee shown = $3.00
    renderAtPath('/programs/p4/packages/pkg-p4-3/checkout')
    expect(screen.getByText('$3.00')).toBeInTheDocument()
  })

  it('shows correct total (base + fee)', () => {
    // pkg-p1-1: $240 + $12.00 = $252.00
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    expect(screen.getByText('$252.00')).toBeInTheDocument()
  })

  it('transitions to paying state when Pay button is clicked', () => {
    // Inject a promise that never resolves so we can observe the paying state
    const neverResolve = new Promise<'success' | 'failure'>(() => {})
    const onPay = vi.fn().mockReturnValue(neverResolve)
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout', onPay)
    fireEvent.click(screen.getByRole('button', { name: /pay with xendit/i }))
    expect(screen.getByText(/processing payment/i)).toBeInTheDocument()
  })

  it('shows success state with vouchers after onPay resolves success', async () => {
    const onPay = vi.fn().mockResolvedValue('success' as const)
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout', onPay)
    fireEvent.click(screen.getByRole('button', { name: /pay with xendit/i }))
    expect(await screen.findByText(/payment confirmed/i)).toBeInTheDocument()
    // At least one voucher entry visible
    expect(screen.getAllByText(/Saturday Bag Work/i).length).toBeGreaterThan(0)
  })

  it('shows failure state after onPay resolves failure', async () => {
    const onPay = vi.fn().mockResolvedValue('failure' as const)
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout', onPay)
    fireEvent.click(screen.getByRole('button', { name: /pay with xendit/i }))
    expect(await screen.findByText(/payment failed/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('resets to idle state when Try Again is clicked', async () => {
    const onPay = vi.fn().mockResolvedValue('failure' as const)
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout', onPay)
    fireEvent.click(screen.getByRole('button', { name: /pay with xendit/i }))
    await screen.findByText(/payment failed/i)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.getByRole('button', { name: /pay with xendit/i })).toBeInTheDocument()
  })

  it('renders "Package not found." for an unknown packageId', () => {
    renderAtPath('/programs/p1/packages/does-not-exist/checkout')
    expect(screen.getByText(/package not found/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they all fail**

```bash
cd apps/web && npx vitest run src/__tests__/CheckoutPage.test.tsx 2>&1 | tail -20
```

Expected: all 12 tests fail with "Cannot find module '../pages/CheckoutPage'" or similar import error.

- [ ] **Step 3: Commit the failing tests**

```bash
git add apps/web/src/__tests__/CheckoutPage.test.tsx
git commit -m "test: add 12 failing CheckoutPage tests"
```

---

### Task 3: Build `PackageSummary.tsx`

**Files:**
- Create: `apps/web/src/pages/checkout/PackageSummary.tsx`

- [ ] **Step 1: Create the file**

```tsx
import type { PackageMock, ProgramDetailMock } from '../../data/programs'

interface PackageSummaryProps {
  pkg: PackageMock
  program: ProgramDetailMock
}

export function PackageSummary({ pkg, program }: PackageSummaryProps) {
  const firstEntry = pkg.entries[0]
  const firstProduct = program.products.find((p) => p.id === firstEntry?.product_id)
  const imageTone = firstProduct?.imageTone ?? 'warm'

  const tones: Record<string, { bg: string; stripe: string }> = {
    warm: { bg: 'var(--placeholder-warm)', stripe: 'var(--placeholder-warm-stripe)' },
    cool: { bg: 'var(--placeholder-cool)', stripe: 'var(--placeholder-cool-stripe)' },
    accent: { bg: 'var(--accent-soft)', stripe: 'var(--accent-soft-stripe)' },
    ink: { bg: 'var(--ink-1)', stripe: 'var(--ink-2)' },
  }
  const t = tones[imageTone] ?? tones.warm

  // Split name: last word gets italic accent treatment
  const words = pkg.name.split(' ')
  const lastWord = words[words.length - 1]
  const restWords = words.slice(0, -1).join(' ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color: 'var(--ink-3)',
        }}
      >
        §01 · Package
      </div>

      {/* Placeholder image with program badge */}
      <div
        style={{
          aspectRatio: '16 / 9',
          background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 15px)`,
          borderRadius: 12,
          position: 'relative' as const,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute' as const,
            top: 14,
            left: 14,
            padding: '5px 11px',
            borderRadius: 999,
            background: 'var(--accent-soft)',
            color: 'var(--accent-ink)',
            fontSize: 12,
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
          }}
        >
          {program.name}
        </span>
      </div>

      {/* Package name */}
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 56,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: 'var(--ink-1)',
          margin: 0,
        }}
      >
        {restWords ? `${restWords} ` : ''}
        <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{lastWord}</em>
      </h1>

      {/* Entry list */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {pkg.entries.map((entry) => {
          const qty = entry.quantity >= 999 ? '∞' : String(entry.quantity)
          return (
            <div
              key={entry.id}
              style={{
                borderTop: '1px solid var(--rule)',
                padding: '16px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: 'var(--ink-1)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {entry.product_name} · ×{qty}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--ink-3)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {entry.validity_rule}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

### Task 4: Build `OrderSummaryCard.tsx`

**Files:**
- Create: `apps/web/src/pages/checkout/OrderSummaryCard.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { PackageMock, IssuedVoucherMock } from '../../data/programs'
import { parsePriceAmount, SERVICE_FEE_CONFIG } from '../../data/programs'

type PayState = 'idle' | 'paying' | 'success' | 'failure'

interface OrderSummaryCardProps {
  pkg: PackageMock
  programId: string
  onPay?: () => Promise<'success' | 'failure'>
}

function defaultOnPay(): Promise<'success' | 'failure'> {
  return new Promise((resolve) => setTimeout(() => resolve('success'), 1500))
}

export function OrderSummaryCard({ pkg, programId, onPay = defaultOnPay }: OrderSummaryCardProps) {
  const [state, setState] = useState<PayState>('idle')

  const amount = parsePriceAmount(pkg.price)
  const fee = Math.max(amount * SERVICE_FEE_CONFIG.percentage, SERVICE_FEE_CONFIG.minimum)
  const total = amount + fee
  // Detect currency symbol from the price string (e.g. "$240" → "$", "€95" → "€")
  const currencySymbol = pkg.price.replace(/[\d.,\s]/g, '')[0] ?? '$'
  const fmt = (n: number) => `${currencySymbol}${n.toFixed(2)}`

  const issuedVouchers: IssuedVoucherMock[] = pkg.entries.map((entry) => ({
    id: `issued-${entry.id}`,
    product_id: entry.product_id,
    product_name: entry.product_name,
    source: 'purchase' as const,
    status: 'active' as const,
    expired_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    quantity: entry.quantity,
    validity_rule: entry.validity_rule,
  }))

  async function handlePay() {
    setState('paying')
    const result = await onPay()
    setState(result === 'success' ? 'success' : 'failure')
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 24,
        border: '1px solid var(--rule)',
        borderRadius: 14,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        background: 'var(--paper-1)',
      }}
    >
      {state === 'idle' && (
        <>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: 'var(--ink-3)',
            }}
          >
            §02 · Order summary
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { label: 'Package price', value: pkg.price },
              {
                label: `Service fee (${SERVICE_FEE_CONFIG.percentage * 100}% · min ${currencySymbol}${SERVICE_FEE_CONFIG.minimum.toFixed(2)})`,
                value: fmt(fee),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px dashed var(--rule)',
                  fontSize: 14,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--ink-2)',
                }}
              >
                <span>{label}</span>
                <span style={{ color: 'var(--ink-1)' }}>{value}</span>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 0 0',
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  color: 'var(--ink-1)',
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 28,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink-1)',
                }}
              >
                {fmt(total)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePay}
            style={{
              width: '100%',
              padding: '16px 0',
              background: 'var(--accent)',
              color: 'var(--paper-1)',
              border: 0,
              borderRadius: 10,
              fontSize: 15,
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pay with Xendit →
          </button>

          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.5,
            }}
          >
            Secure payment via Xendit. Vouchers issued immediately on confirmation.
          </p>
        </>
      )}

      {state === 'paying' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: '32px 0',
          }}
        >
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              width: 32,
              height: 32,
              border: '3px solid var(--rule)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.06em',
              color: 'var(--ink-2)',
            }}
          >
            Processing payment…
          </span>
        </div>
      )}

      {state === 'success' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: 28,
              color: 'var(--ok)',
              textAlign: 'center' as const,
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--ink-1)',
              textAlign: 'center' as const,
            }}
          >
            Payment confirmed.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {issuedVouchers.map((v) => {
              const qty = v.quantity >= 999 ? '∞' : String(v.quantity)
              return (
                <div
                  key={v.id}
                  style={{
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--ink-2)',
                    padding: '10px 0',
                    borderBottom: '1px dashed var(--rule)',
                  }}
                >
                  <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>
                    {qty}× {v.product_name}
                  </span>{' '}
                  — valid {v.validity_rule}
                </div>
              )
            })}
          </div>
          <Link
            to="/wallet"
            style={{
              display: 'block',
              width: '100%',
              padding: '14px 0',
              background: 'var(--ink-1)',
              color: 'var(--paper-1)',
              borderRadius: 10,
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              textAlign: 'center' as const,
              textDecoration: 'none',
            }}
          >
            Go to my wallet →
          </Link>
          <Link
            to={`/programs/${programId}`}
            style={{
              display: 'block',
              textAlign: 'center' as const,
              fontSize: 13,
              color: 'var(--ink-2)',
              fontFamily: 'var(--font-sans)',
              textDecoration: 'none',
            }}
          >
            Back to program →
          </Link>
        </div>
      )}

      {state === 'failure' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: 'var(--accent)',
              textAlign: 'center' as const,
            }}
          >
            ✕
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--ink-1)',
              textAlign: 'center' as const,
            }}
          >
            Payment failed.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--ink-2)',
              fontFamily: 'var(--font-sans)',
              textAlign: 'center' as const,
            }}
          >
            No charges were made. Please try again.
          </p>
          <button
            onClick={() => setState('idle')}
            style={{
              width: '100%',
              padding: '14px 0',
              background: 'var(--ink-1)',
              color: 'var(--paper-1)',
              border: 0,
              borderRadius: 10,
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
```

---

### Task 5: Build `CheckoutPage.tsx`

**Files:**
- Create: `apps/web/src/pages/CheckoutPage.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useParams, Link } from 'react-router-dom'
import { PACKAGES, PROGRAM_DETAILS } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { PackageSummary } from './checkout/PackageSummary'
import { OrderSummaryCard } from './checkout/OrderSummaryCard'

interface CheckoutPageProps {
  onPay?: () => Promise<'success' | 'failure'>
}

export function CheckoutPage({ onPay }: CheckoutPageProps) {
  const { id, packageId } = useParams<{ id: string; packageId: string }>()

  const program = id ? PROGRAM_DETAILS[id] : undefined
  const pkg = PACKAGES.find((p) => p.id === packageId && p.program_id === id)

  if (!id || !program || !packageId || !pkg) {
    return (
      <div
        style={{
          background: 'var(--paper-1)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Package not found.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />

      {/* Breadcrumb */}
      <div
        style={{
          padding: '20px 64px',
          fontSize: 13,
          color: 'var(--ink-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--font-sans, sans-serif)',
        }}
      >
        <Link to="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>
          Discover
        </Link>
        <span>→</span>
        <Link to={`/programs/${id}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>
          {program.name}
        </Link>
        <span>→</span>
        <span style={{ color: 'var(--ink-1)' }}>{pkg.name}</span>
        <span>→</span>
        <span style={{ color: 'var(--ink-1)' }}>Checkout</span>
      </div>

      {/* Two-column body */}
      <div
        style={{
          padding: '0 64px 80px',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 56,
          alignItems: 'start',
        }}
      >
        <PackageSummary pkg={pkg} program={program} />
        <OrderSummaryCard pkg={pkg} programId={id} onPay={onPay} />
      </div>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Run the CheckoutPage tests**

```bash
cd apps/web && npx vitest run src/__tests__/CheckoutPage.test.tsx 2>&1 | tail -30
```

Expected: all 12 tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/checkout/PackageSummary.tsx \
        apps/web/src/pages/checkout/OrderSummaryCard.tsx \
        apps/web/src/pages/CheckoutPage.tsx
git commit -m "feat: implement CheckoutPage with two-column layout and payment state machine"
```

---

### Task 6: Wire the route and add routing test

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/__tests__/routing.test.tsx`

- [ ] **Step 1: Add checkout import and route to `App.tsx`**

Replace the full content of `apps/web/src/App.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom'
import { DiscoveryPage } from './pages/DiscoveryPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CheckoutPage } from './pages/CheckoutPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DiscoveryPage />} />
      <Route path="/programs/:id" element={<ProgramDetailPage />} />
      <Route path="/programs/:id/products/:productId" element={<ProductDetailPage />} />
      <Route path="/programs/:id/packages/:packageId/checkout" element={<CheckoutPage />} />
    </Routes>
  )
}
```

- [ ] **Step 2: Add the routing test**

In `apps/web/src/__tests__/routing.test.tsx`, add this test inside the `describe('routing', ...)` block:

```ts
it('renders CheckoutPage at /programs/p1/packages/pkg-p1-1/checkout', () => {
  render(
    <MemoryRouter initialEntries={['/programs/p1/packages/pkg-p1-1/checkout']}>
      <App />
    </MemoryRouter>
  )
  expect(screen.getByText(/10-Class Pass/i)).toBeInTheDocument()
})
```

- [ ] **Step 3: Run the full test suite**

```bash
cd apps/web && npx vitest run 2>&1 | tail -20
```

Expected: all tests pass with no regressions.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/__tests__/routing.test.tsx
git commit -m "feat: wire CheckoutPage route and add routing test"
```

---

### Task 7: Mark PAGES.md and final verification

**Files:**
- Modify: `PAGES.md`

- [ ] **Step 1: Mark CheckoutPage done**

In `PAGES.md`, change:

```
- [ ] **CheckoutPage** — `/programs/:id/packages/:packageId/checkout` — Package summary, service fee breakdown ...
```

to:

```
- [x] **CheckoutPage** — `/programs/:id/packages/:packageId/checkout` — Package summary, service fee breakdown ...
```

- [ ] **Step 2: Run the full test suite one final time**

```bash
cd apps/web && npx vitest run 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 3: Final commit**

```bash
git add PAGES.md
git commit -m "chore: mark CheckoutPage complete in PAGES.md"
```
