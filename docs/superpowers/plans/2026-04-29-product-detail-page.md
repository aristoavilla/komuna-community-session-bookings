# ProductDetailPage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `ProductDetailPage` at `/programs/:id/products/:productId` showing a product hero, upcoming sessions (session-type only), and purchase packages.

**Architecture:** Scoped stacked-section layout (hero → sessions → packages) following the same two-column hero and `§0n ·` section header pattern as `ProgramDetailPage`. Sub-components live in a new `pages/product-detail/` directory. Mock data is extended in `data/programs.ts`.

**Tech Stack:** React 19, react-router-dom v7, TypeScript, Vitest, @testing-library/react, inline styles (no Tailwind), CSS variables from `globals.css`.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `apps/web/src/data/programs.ts` | Add 3 new types; extend `ProductMock`; add `PACKAGES` and sessions mock data |
| Modify | `apps/web/src/App.tsx` | Add `/programs/:id/products/:productId` route |
| Create | `apps/web/src/pages/ProductDetailPage.tsx` | Page shell; `useParams`; not-found fallback; filter packages |
| Create | `apps/web/src/pages/product-detail/Breadcrumb.tsx` | 3-level breadcrumb (Discover → Program → Product) |
| Create | `apps/web/src/pages/product-detail/HeroSection.tsx` | Placeholder image, type tag, capacity chip, stats strip, CTA |
| Create | `apps/web/src/pages/product-detail/SessionsSection.tsx` | Sessions list with capacity bar; hidden for simple products |
| Create | `apps/web/src/pages/product-detail/PackagesSection.tsx` | Section header + `PackageCard` grid |
| Create | `apps/web/src/pages/product-detail/PackageCard.tsx` | Single package card: name, price, entries, checkout link |
| Create | `apps/web/src/__tests__/ProductDetailPage.test.tsx` | 13 tests covering all spec requirements |

---

## Task 1: Extend data model

**Files:**
- Modify: `apps/web/src/data/programs.ts`

- [ ] **Step 1: Add three new types after the existing `ProgramDetailMock` type**

Open `apps/web/src/data/programs.ts`. After the `ProgramDetailMock` type definition (around line 44), insert:

```ts
export type SessionInstanceMock = {
  // ERD: SESSION table fields
  id: string
  product_id: string
  start_time: string    // ISO-8601 UTC
  end_time: string      // ISO-8601 UTC
  status: 'open' | 'full' | 'past'
  is_active: boolean
  created_at: string    // ISO-8601 UTC

  // UI-only extras
  coach: string
  taken: number
  capacity: number      // copied from product for row display
  day: string           // pre-formatted in program tz, e.g. "SAT"
  date: string          // pre-formatted, e.g. "02"
  time: string          // pre-formatted, e.g. "7:00 AM"
}

export type PackageEntryMock = {
  // ERD: PACKAGE_ENTRY table fields
  id: string
  package_id: string
  product_id: string
  quantity: number
  validity_rule: string  // display string, e.g. "60 days from purchase"

  // UI-only
  product_name: string   // denormalized for display
}

export type PackageMock = {
  // ERD: PURCHASE_PACKAGE table fields
  id: string
  program_id: string
  name: string
  price: string          // display string, e.g. "$240"
  status: 'active' | 'archived'
  created_at: string     // ISO-8601 UTC

  // UI-only
  entries: PackageEntryMock[]
}
```

- [ ] **Step 2: Add `sessions` and `validityDays` to `ProductMock`**

In the existing `ProductMock` type, add two optional fields after `imageLabel`:

```ts
export type ProductMock = {
  // ERD: PRODUCT table fields
  id: string
  program_id: string
  name: string
  description: string
  type: 'session' | 'simple'
  status: 'active' | 'archived'
  created_at: string            // ISO-8601

  // UI-only extras
  capacity?: number             // session-type only
  sessionsPerWeek?: number      // session-type only
  lowestPrice: string
  imageTone: 'warm' | 'cool' | 'ink' | 'accent'
  imageLabel: string
  validityDays?: number         // displayed in hero stats strip
  sessions?: SessionInstanceMock[]  // session-type only; 3–5 entries
}
```

- [ ] **Step 3: Add sessions and validityDays to p1's session products**

Find the `prod-p1-1` object inside `PROGRAM_DETAILS.p1.products` (around line 167). Add two new fields alongside the existing ones:

```ts
{
  id: 'prod-p1-1',
  program_id: 'p1',
  name: 'Saturday Bag Work',
  description: 'Six rounds of heavy bag, two of conditioning, one of stretching. Saturdays at 8 AM.',
  type: 'session',
  status: 'active',
  created_at: '2024-01-20T10:00:00Z',
  capacity: 14,
  sessionsPerWeek: 2,
  lowestPrice: '$28',
  imageTone: 'warm',
  imageLabel: 'BAG WORK · SAT',
  validityDays: 60,
  sessions: [
    { id: 's-p1-1-1', product_id: 'prod-p1-1', start_time: '2026-05-02T11:00:00Z', end_time: '2026-05-02T12:00:00Z', status: 'open', is_active: true, created_at: '2024-01-20T10:00:00Z', coach: 'Marcus Vlahos', taken: 11, capacity: 14, day: 'SAT', date: '02', time: '7:00 AM' },
    { id: 's-p1-1-2', product_id: 'prod-p1-1', start_time: '2026-05-09T11:00:00Z', end_time: '2026-05-09T12:00:00Z', status: 'full', is_active: true, created_at: '2024-01-20T10:00:00Z', coach: 'Marcus Vlahos', taken: 14, capacity: 14, day: 'SAT', date: '09', time: '7:00 AM' },
    { id: 's-p1-1-3', product_id: 'prod-p1-1', start_time: '2026-05-16T11:00:00Z', end_time: '2026-05-16T12:00:00Z', status: 'open', is_active: true, created_at: '2024-01-20T10:00:00Z', coach: 'Lina Park', taken: 4, capacity: 14, day: 'SAT', date: '16', time: '7:00 AM' },
    { id: 's-p1-1-4', product_id: 'prod-p1-1', start_time: '2026-04-26T11:00:00Z', end_time: '2026-04-26T12:00:00Z', status: 'past', is_active: false, created_at: '2024-01-20T10:00:00Z', coach: 'Marcus Vlahos', taken: 14, capacity: 14, day: 'SAT', date: '26', time: '7:00 AM' },
  ],
},
```

Also add `validityDays: 60` and a short sessions array to `prod-p1-2` (Friday Pad Rounds):

```ts
{
  id: 'prod-p1-2',
  program_id: 'p1',
  name: 'Friday Pad Rounds',
  description: 'Partner pad work with rotating coaches. All levels welcome. Fridays at 7 PM.',
  type: 'session',
  status: 'active',
  created_at: '2024-01-20T10:00:00Z',
  capacity: 10,
  sessionsPerWeek: 1,
  lowestPrice: '$32',
  imageTone: 'warm',
  imageLabel: 'PAD ROUNDS · FRI',
  validityDays: 60,
  sessions: [
    { id: 's-p1-2-1', product_id: 'prod-p1-2', start_time: '2026-05-01T23:00:00Z', end_time: '2026-05-02T00:00:00Z', status: 'open', is_active: true, created_at: '2024-01-20T10:00:00Z', coach: 'Marcus Vlahos', taken: 7, capacity: 10, day: 'FRI', date: '01', time: '7:00 PM' },
    { id: 's-p1-2-2', product_id: 'prod-p1-2', start_time: '2026-05-08T23:00:00Z', end_time: '2026-05-09T00:00:00Z', status: 'open', is_active: true, created_at: '2024-01-20T10:00:00Z', coach: 'Lina Park', taken: 3, capacity: 10, day: 'FRI', date: '08', time: '7:00 PM' },
  ],
},
```

And add `validityDays: 60` to `prod-p1-3` (Drop-in Pass, simple type — no sessions needed):

```ts
{
  id: 'prod-p1-3',
  program_id: 'p1',
  name: 'Drop-in Pass',
  description: 'Single-use pass valid for any open class. No expiry within 60 days of purchase.',
  type: 'simple',
  status: 'active',
  created_at: '2024-01-20T10:00:00Z',
  lowestPrice: '$28',
  imageTone: 'accent',
  imageLabel: 'DROP-IN · PASS',
  validityDays: 60,
},
```

- [ ] **Step 4: Add the `PACKAGES` export at the bottom of `programs.ts`**

After the closing `}` of `PROGRAM_DETAILS`, add:

```ts
export const PACKAGES: PackageMock[] = [
  // ── Eastside Boxing Club (p1) ──────────────────────────────────────────
  {
    id: 'pkg-p1-1',
    program_id: 'p1',
    name: '10-class pass',
    price: '$240',
    status: 'active',
    created_at: '2024-01-20T10:00:00Z',
    entries: [
      { id: 'pe-p1-1-1', package_id: 'pkg-p1-1', product_id: 'prod-p1-1', quantity: 10, validity_rule: '60 days from purchase', product_name: 'Saturday Bag Work' },
      { id: 'pe-p1-1-2', package_id: 'pkg-p1-1', product_id: 'prod-p1-2', quantity: 5, validity_rule: '60 days from purchase', product_name: 'Friday Pad Rounds' },
    ],
  },
  {
    id: 'pkg-p1-2',
    program_id: 'p1',
    name: 'Drop-in single',
    price: '$28',
    status: 'active',
    created_at: '2024-01-20T10:00:00Z',
    entries: [
      { id: 'pe-p1-2-1', package_id: 'pkg-p1-2', product_id: 'prod-p1-1', quantity: 1, validity_rule: '60 days from purchase', product_name: 'Saturday Bag Work' },
    ],
  },
  {
    id: 'pkg-p1-3',
    program_id: 'p1',
    name: 'Monthly unlimited',
    price: '$99',
    status: 'active',
    created_at: '2024-01-20T10:00:00Z',
    entries: [
      { id: 'pe-p1-3-1', package_id: 'pkg-p1-3', product_id: 'prod-p1-1', quantity: 999, validity_rule: '30 days from purchase', product_name: 'Saturday Bag Work' },
      { id: 'pe-p1-3-2', package_id: 'pkg-p1-3', product_id: 'prod-p1-2', quantity: 999, validity_rule: '30 days from purchase', product_name: 'Friday Pad Rounds' },
    ],
  },
  // ── Slow Flow with Ines (p2) ───────────────────────────────────────────
  {
    id: 'pkg-p2-1',
    program_id: 'p2',
    name: 'Class pass 5×',
    price: '€95',
    status: 'active',
    created_at: '2024-03-05T08:00:00Z',
    entries: [
      { id: 'pe-p2-1-1', package_id: 'pkg-p2-1', product_id: 'prod-p2-1', quantity: 5, validity_rule: '45 days from purchase', product_name: 'Morning Vinyasa' },
    ],
  },
  {
    id: 'pkg-p2-2',
    program_id: 'p2',
    name: 'Single session',
    price: '€22',
    status: 'active',
    created_at: '2024-03-05T08:00:00Z',
    entries: [
      { id: 'pe-p2-2-1', package_id: 'pkg-p2-2', product_id: 'prod-p2-1', quantity: 1, validity_rule: '30 days from purchase', product_name: 'Morning Vinyasa' },
    ],
  },
]
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /home/aristo/dev/komuna-community-session-bookings/apps/web && npx tsc --noEmit
```

Expected: no errors. If there are errors, they will be in `programs.ts` — fix type mismatches before continuing.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/data/programs.ts
git commit -m "feat: add SessionInstanceMock, PackageMock types and mock data"
```

---

## Task 2: Test file + route + page scaffold

**Files:**
- Create: `apps/web/src/__tests__/ProductDetailPage.test.tsx`
- Modify: `apps/web/src/App.tsx`
- Create: `apps/web/src/pages/ProductDetailPage.tsx`

- [ ] **Step 1: Create the test file with all 12 tests**

Create `apps/web/src/__tests__/ProductDetailPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProductDetailPage } from '../pages/ProductDetailPage'

function renderAtPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/programs/:id/products/:productId" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProductDetailPage', () => {
  it('renders "Product not found." for an unknown product id', () => {
    renderAtPath('/programs/p1/products/does-not-exist')
    expect(screen.getByText(/product not found/i)).toBeInTheDocument()
  })

  it('renders product name in the heading for a known product', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Saturday Bag')
  })

  it('renders the product description', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByText(/six rounds of heavy bag/i)).toBeInTheDocument()
  })

  it('shows "Session product" type tag for a session-type product', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByText('Session product')).toBeInTheDocument()
  })

  it('shows "Simple product" type tag for a simple-type product', () => {
    renderAtPath('/programs/p1/products/prod-p1-3')
    expect(screen.getByText('Simple product')).toBeInTheDocument()
  })

  it('renders the sessions section (§03) for a session-type product', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByText('§03 · Schedule')).toBeInTheDocument()
  })

  it('does not render the sessions section for a simple-type product', () => {
    renderAtPath('/programs/p1/products/prod-p1-3')
    expect(screen.queryByText('§03 · Schedule')).toBeNull()
  })

  it('renders session rows with coach names', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getAllByText(/marcus vlahos/i).length).toBeGreaterThan(0)
  })

  it('shows "Join waitlist" button for a full session', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByRole('button', { name: /join waitlist/i })).toBeInTheDocument()
  })

  it('renders the packages section with correct package names', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByText('10-class pass')).toBeInTheDocument()
    expect(screen.getByText('Drop-in single')).toBeInTheDocument()
  })

  it('package card CTA links point to /programs/:id/packages/:packageId/checkout', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    const links = screen.getAllByRole('link', { name: /buy this package/i })
    expect(links[0]).toHaveAttribute('href', expect.stringMatching(/^\/programs\/p1\/packages\/pkg-p1-\d+\/checkout$/))
  })

  it('breadcrumb "Discover" link points to "/"', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/')
  })

  it('breadcrumb program name links to /programs/:id', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByRole('link', { name: 'Eastside Boxing Club' })).toHaveAttribute('href', '/programs/p1')
  })
})
```

- [ ] **Step 2: Run tests — expect all to fail with "Cannot find module"**

```bash
cd /home/aristo/dev/komuna-community-session-bookings/apps/web && npx vitest run src/__tests__/ProductDetailPage.test.tsx
```

Expected: FAIL — `Error: Cannot find module '../pages/ProductDetailPage'`. This confirms the test infrastructure works.

- [ ] **Step 3: Add route in App.tsx**

Replace the contents of `apps/web/src/App.tsx` with:

```tsx
import { Routes, Route } from 'react-router-dom'
import { DiscoveryPage } from './pages/DiscoveryPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'
import { ProductDetailPage } from './pages/ProductDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DiscoveryPage />} />
      <Route path="/programs/:id" element={<ProgramDetailPage />} />
      <Route path="/programs/:id/products/:productId" element={<ProductDetailPage />} />
    </Routes>
  )
}
```

- [ ] **Step 4: Create the page scaffold — handles not-found, leaves room for sub-components**

Create `apps/web/src/pages/ProductDetailPage.tsx`:

```tsx
import { useParams } from 'react-router-dom'
import { PROGRAM_DETAILS, PACKAGES } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'

export function ProductDetailPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>()
  const program = id ? PROGRAM_DETAILS[id] : undefined
  const product = program?.products.find(p => p.id === productId)

  if (!program || !product) {
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
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Product not found.</p>
      </div>
    )
  }

  const packages = PACKAGES.filter(
    pkg => pkg.program_id === id && pkg.entries.some(e => e.product_id === productId),
  )

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 5: Run tests — expect "not found" test to pass, rest to fail**

```bash
cd /home/aristo/dev/komuna-community-session-bookings/apps/web && npx vitest run src/__tests__/ProductDetailPage.test.tsx
```

Expected: 1 test passes (`renders "Product not found."`), 12 fail. The failures should all be "Unable to find an element" rather than import errors — this means the scaffold is wired correctly.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/__tests__/ProductDetailPage.test.tsx apps/web/src/App.tsx apps/web/src/pages/ProductDetailPage.tsx
git commit -m "feat: scaffold ProductDetailPage with route and not-found fallback"
```

---

## Task 3: Breadcrumb

**Files:**
- Create: `apps/web/src/pages/product-detail/Breadcrumb.tsx`
- Modify: `apps/web/src/pages/ProductDetailPage.tsx`

This breadcrumb is separate from `program-detail/Breadcrumb.tsx` — it has three levels.

- [ ] **Step 1: Create `apps/web/src/pages/product-detail/Breadcrumb.tsx`**

```tsx
import { Link } from 'react-router-dom'

interface BreadcrumbProps {
  programId: string
  programName: string
  productName: string
}

export function Breadcrumb({ programId, programName, productName }: BreadcrumbProps) {
  return (
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
      <Link to={`/programs/${programId}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>
        {programName}
      </Link>
      <span>→</span>
      <span style={{ color: 'var(--ink-1)' }}>{productName}</span>
    </div>
  )
}
```

- [ ] **Step 2: Add Breadcrumb to ProductDetailPage**

Update `apps/web/src/pages/ProductDetailPage.tsx` — add the import and render it after `<TopNav>`:

```tsx
import { useParams } from 'react-router-dom'
import { PROGRAM_DETAILS, PACKAGES } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { Breadcrumb } from './product-detail/Breadcrumb'

export function ProductDetailPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>()
  const program = id ? PROGRAM_DETAILS[id] : undefined
  const product = program?.products.find(p => p.id === productId)

  if (!program || !product) {
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
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Product not found.</p>
      </div>
    )
  }

  const packages = PACKAGES.filter(
    pkg => pkg.program_id === id && pkg.entries.some(e => e.product_id === productId),
  )

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />
      <Breadcrumb programId={program.id} programName={program.name} productName={product.name} />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Run tests — expect breadcrumb tests to now pass**

```bash
cd /home/aristo/dev/komuna-community-session-bookings/apps/web && npx vitest run src/__tests__/ProductDetailPage.test.tsx
```

Expected: tests 1, 12, 13 pass (`not found`, `Discover link`, `program name link`). Rest still fail.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/product-detail/Breadcrumb.tsx apps/web/src/pages/ProductDetailPage.tsx
git commit -m "feat: add Breadcrumb to ProductDetailPage"
```

---

## Task 4: HeroSection

**Files:**
- Create: `apps/web/src/pages/product-detail/HeroSection.tsx`
- Modify: `apps/web/src/pages/ProductDetailPage.tsx`

- [ ] **Step 1: Create `apps/web/src/pages/product-detail/HeroSection.tsx`**

```tsx
import type { ProductMock, ProgramDetailMock } from '../../data/programs'

const TONE_STYLES: Record<ProductMock['imageTone'], { bg: string; stripe: string; fg: string }> = {
  warm:   { bg: 'var(--placeholder-warm)',   stripe: 'var(--placeholder-warm-stripe)',  fg: 'var(--ink-2)' },
  cool:   { bg: 'var(--placeholder-cool)',   stripe: 'var(--placeholder-cool-stripe)',  fg: 'var(--ink-2)' },
  ink:    { bg: 'var(--ink-1)',              stripe: 'var(--ink-2)',                    fg: 'var(--paper-1)' },
  accent: { bg: 'var(--accent-soft)',        stripe: 'var(--accent-soft-stripe)',       fg: 'var(--accent-ink)' },
}

function StatCell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-serif, serif)',
          fontSize: 32,
          letterSpacing: '-0.02em',
          color: 'var(--ink-1)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 6 }}>{sub}</div>
    </div>
  )
}

interface HeroSectionProps {
  product: ProductMock
  program: ProgramDetailMock
}

export function HeroSection({ product: p, program }: HeroSectionProps) {
  const t = TONE_STYLES[p.imageTone]
  const words = p.name.split(' ')
  const lastWord = words.pop()!
  const restOfName = words.join(' ')

  return (
    <section
      style={{
        padding: '0 64px 56px',
        display: 'grid',
        gridTemplateColumns: '1fr 1.05fr',
        gap: 56,
        alignItems: 'stretch',
      }}
    >
      {/* Left: placeholder image */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            aspectRatio: '4 / 5',
            background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 15px)`,
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 14,
            color: t.fg,
          }}
        >
          <span
            style={{
              background: t.bg,
              padding: '3px 7px',
              border: `1px solid ${t.stripe}`,
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {p.imageLabel}
          </span>
        </div>

        {/* Type tag */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            padding: '8px 14px',
            background: 'var(--paper-1)',
            border: '1px solid var(--rule)',
            borderRadius: 999,
            fontSize: 12,
            fontFamily: 'var(--font-sans, sans-serif)',
            fontWeight: 500,
            color: 'var(--ink-1)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'var(--ink-3)',
            }}
          >
            §02
          </span>
          {p.type === 'session' ? 'Session product' : 'Simple product'}
        </div>

        {/* Capacity chip — session-type only */}
        {p.type === 'session' && p.capacity != null && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              padding: '12px 16px',
              background: 'var(--ink-1)',
              color: 'var(--paper-1)',
              borderRadius: 12,
              fontSize: 12,
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.08em',
            }}
          >
            CAP · {p.capacity} PEOPLE
          </div>
        )}
      </div>

      {/* Right: info */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 8 }}>
        <div>
          {program.category && (
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  padding: '5px 11px',
                  borderRadius: 999,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent-ink)',
                  fontSize: 12,
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontWeight: 500,
                }}
              >
                {program.category}
              </span>
            </div>
          )}

          <h1
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 76,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: 'var(--ink-1)',
              margin: 0,
            }}
          >
            {restOfName && <>{restOfName}<br /></>}
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{lastWord}.</em>
          </h1>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--ink-2)',
              marginTop: 24,
              maxWidth: 540,
            }}
          >
            {p.description}
          </p>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            padding: '28px 0',
            borderTop: '1px solid var(--rule)',
            borderBottom: '1px solid var(--rule)',
            marginTop: 36,
          }}
        >
          {p.type === 'session' ? (
            <>
              <StatCell label="Per session" value={p.lowestPrice} sub="Or use a pass" />
              {p.capacity != null && (
                <StatCell label="Capacity" value={String(p.capacity)} sub="Hard cap" />
              )}
              {p.sessionsPerWeek != null && (
                <StatCell label="Sessions / wk" value={String(p.sessionsPerWeek)} sub="Recurring" />
              )}
              {p.validityDays != null && (
                <StatCell label="Voucher valid" value={String(p.validityDays)} sub="days from purchase" />
              )}
            </>
          ) : (
            <>
              <StatCell label="Price" value={p.lowestPrice} sub="Per pass" />
              {p.validityDays != null && (
                <StatCell label="Voucher valid" value={String(p.validityDays)} sub="days from purchase" />
              )}
            </>
          )}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28, alignItems: 'center' }}>
          {p.type === 'session' ? (
            <>
              <button
                type="button"
                style={{
                  padding: '16px 28px',
                  background: 'var(--accent)',
                  color: 'var(--paper-1)',
                  border: 0,
                  borderRadius: 10,
                  fontSize: 15,
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reserve a session →
              </button>
              <button
                type="button"
                style={{
                  padding: '16px 22px',
                  background: 'transparent',
                  color: 'var(--ink-1)',
                  border: '1px solid var(--ink-1)',
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Buy a package →
              </button>
            </>
          ) : (
            <button
              type="button"
              style={{
                padding: '16px 28px',
                background: 'var(--accent)',
                color: 'var(--paper-1)',
                border: 0,
                borderRadius: 10,
                fontSize: 15,
                fontFamily: 'var(--font-sans, sans-serif)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Get this product →
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add HeroSection to ProductDetailPage**

Update `apps/web/src/pages/ProductDetailPage.tsx`:

```tsx
import { useParams } from 'react-router-dom'
import { PROGRAM_DETAILS, PACKAGES } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { Breadcrumb } from './product-detail/Breadcrumb'
import { HeroSection } from './product-detail/HeroSection'

export function ProductDetailPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>()
  const program = id ? PROGRAM_DETAILS[id] : undefined
  const product = program?.products.find(p => p.id === productId)

  if (!program || !product) {
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
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Product not found.</p>
      </div>
    )
  }

  const packages = PACKAGES.filter(
    pkg => pkg.program_id === id && pkg.entries.some(e => e.product_id === productId),
  )

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />
      <Breadcrumb programId={program.id} programName={program.name} productName={product.name} />
      <HeroSection product={product} program={program} />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Run tests — expect hero tests to now pass**

```bash
cd /home/aristo/dev/komuna-community-session-bookings/apps/web && npx vitest run src/__tests__/ProductDetailPage.test.tsx
```

Expected: tests 1–5, 12, 13 pass (`not found`, `heading`, `description`, `session type tag`, `simple type tag`, `Discover link`, `program name link`). Tests 6–11 still fail.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/product-detail/HeroSection.tsx apps/web/src/pages/ProductDetailPage.tsx
git commit -m "feat: add HeroSection to ProductDetailPage"
```

---

## Task 5: SessionsSection

**Files:**
- Create: `apps/web/src/pages/product-detail/SessionsSection.tsx`
- Modify: `apps/web/src/pages/ProductDetailPage.tsx`

- [ ] **Step 1: Create `apps/web/src/pages/product-detail/SessionsSection.tsx`**

```tsx
import type { SessionInstanceMock } from '../../data/programs'

function SessionRow({ s }: { s: SessionInstanceMock }) {
  const past = s.status === 'past'
  const full = s.status === 'full'
  const pct = (s.taken / s.capacity) * 100

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '64px 1fr auto auto',
        alignItems: 'center',
        gap: 24,
        padding: '20px 24px',
        borderTop: '1px solid var(--rule)',
        opacity: past ? 0.45 : 1,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
          }}
        >
          {s.day}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 32,
            letterSpacing: '-0.02em',
            color: 'var(--ink-1)',
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          {s.date}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 15, color: 'var(--ink-1)', fontWeight: 500 }}>{s.time}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>
          with {s.coach} · 60 min
        </div>
      </div>

      <div style={{ width: 160 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            fontFamily: 'var(--font-mono, monospace)',
            color: full ? 'var(--ink-3)' : 'var(--ink-2)',
            marginBottom: 6,
          }}
        >
          <span>{s.taken}/{s.capacity} TAKEN</span>
          <span>{full ? 'WAITLIST' : `${s.capacity - s.taken} OPEN`}</span>
        </div>
        <div
          style={{
            height: 4,
            background: 'var(--paper-3)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: full ? 'var(--ink-3)' : 'var(--accent)',
            }}
          />
        </div>
      </div>

      <button
        type="button"
        style={{
          padding: '10px 18px',
          background: past ? 'transparent' : full ? 'transparent' : 'var(--ink-1)',
          color: past ? 'var(--ink-3)' : full ? 'var(--ink-1)' : 'var(--paper-1)',
          border: past ? '1px solid var(--rule)' : full ? '1px solid var(--ink-1)' : 0,
          borderRadius: 8,
          fontSize: 13,
          fontFamily: 'var(--font-sans, sans-serif)',
          fontWeight: 500,
          cursor: past ? 'default' : 'pointer',
          minWidth: 110,
        }}
      >
        {past ? 'Past' : full ? 'Join waitlist' : 'Reserve →'}
      </button>
    </div>
  )
}

interface SessionsSectionProps {
  sessions: SessionInstanceMock[]
  timezone: string
}

export function SessionsSection({ sessions, timezone }: SessionsSectionProps) {
  return (
    <section
      style={{
        padding: '32px 64px 72px',
        background: 'var(--paper-2)',
        borderTop: '1px solid var(--rule)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginBottom: 10,
          }}
        >
          §03 · Schedule
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 44,
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1,
          }}
        >
          Upcoming <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>instances.</em>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 8 }}>
          Times shown in{' '}
          <span style={{ color: 'var(--ink-1)' }}>{timezone}</span>{' '}
          (program timezone).
        </p>
      </div>

      <div
        style={{
          background: 'var(--paper-1)',
          border: '1px solid var(--rule)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {sessions.map(s => (
          <SessionRow key={s.id} s={s} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add SessionsSection to ProductDetailPage**

Update `apps/web/src/pages/ProductDetailPage.tsx`:

```tsx
import { useParams } from 'react-router-dom'
import { PROGRAM_DETAILS, PACKAGES } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { Breadcrumb } from './product-detail/Breadcrumb'
import { HeroSection } from './product-detail/HeroSection'
import { SessionsSection } from './product-detail/SessionsSection'

export function ProductDetailPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>()
  const program = id ? PROGRAM_DETAILS[id] : undefined
  const product = program?.products.find(p => p.id === productId)

  if (!program || !product) {
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
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Product not found.</p>
      </div>
    )
  }

  const packages = PACKAGES.filter(
    pkg => pkg.program_id === id && pkg.entries.some(e => e.product_id === productId),
  )

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />
      <Breadcrumb programId={program.id} programName={program.name} productName={product.name} />
      <HeroSection product={product} program={program} />
      {product.type === 'session' && product.sessions?.length ? (
        <SessionsSection sessions={product.sessions} timezone={program.timezone} />
      ) : null}
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Run tests — expect sessions tests to now pass**

```bash
cd /home/aristo/dev/komuna-community-session-bookings/apps/web && npx vitest run src/__tests__/ProductDetailPage.test.tsx
```

Expected: tests 1–9 pass (all previous + sessions section present, sessions hidden for simple, coach names, join waitlist button). Tests 10–11 still fail (packages).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/product-detail/SessionsSection.tsx apps/web/src/pages/ProductDetailPage.tsx
git commit -m "feat: add SessionsSection to ProductDetailPage"
```

---

## Task 6: PackageCard and PackagesSection

**Files:**
- Create: `apps/web/src/pages/product-detail/PackageCard.tsx`
- Create: `apps/web/src/pages/product-detail/PackagesSection.tsx`
- Modify: `apps/web/src/pages/ProductDetailPage.tsx`

- [ ] **Step 1: Create `apps/web/src/pages/product-detail/PackageCard.tsx`**

```tsx
import { Link } from 'react-router-dom'
import type { PackageMock } from '../../data/programs'

interface PackageCardProps {
  pkg: PackageMock
  programId: string
}

export function PackageCard({ pkg, programId }: PackageCardProps) {
  return (
    <div
      style={{
        border: '1px solid var(--rule)',
        borderRadius: 14,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'var(--paper-1)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-serif, serif)',
          fontSize: 22,
          letterSpacing: '-0.01em',
          color: 'var(--ink-1)',
          lineHeight: 1.15,
        }}
      >
        {pkg.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 36,
            letterSpacing: '-0.02em',
            color: 'var(--ink-1)',
          }}
        >
          {pkg.price}
        </span>
        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>/ package</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pkg.entries.map(e => (
          <div key={e.id}>
            <div style={{ fontSize: 13, color: 'var(--ink-1)' }}>
              {e.product_name} · ×{e.quantity}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--ink-3)',
                fontFamily: 'var(--font-mono, monospace)',
                marginTop: 2,
              }}
            >
              {e.validity_rule}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px dashed var(--rule)' }} />

      <Link
        to={`/programs/${programId}/packages/${pkg.id}/checkout`}
        style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}
      >
        Buy this package →
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Create `apps/web/src/pages/product-detail/PackagesSection.tsx`**

```tsx
import type { PackageMock } from '../../data/programs'
import { PackageCard } from './PackageCard'

interface PackagesSectionProps {
  packages: PackageMock[]
  programId: string
}

export function PackagesSection({ packages, programId }: PackagesSectionProps) {
  return (
    <section style={{ padding: '56px 64px 80px' }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginBottom: 10,
          }}
        >
          §04 · Purchase packages
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 36,
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1,
          }}
        >
          How to <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>buy in.</em>
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 10 }}>
          {packages.length} {packages.length === 1 ? 'package includes' : 'packages include'} this product
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }}
      >
        {packages.map(pkg => (
          <PackageCard key={pkg.id} pkg={pkg} programId={programId} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add PackagesSection to ProductDetailPage**

Replace `apps/web/src/pages/ProductDetailPage.tsx` with the final version:

```tsx
import { useParams } from 'react-router-dom'
import { PROGRAM_DETAILS, PACKAGES } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { Breadcrumb } from './product-detail/Breadcrumb'
import { HeroSection } from './product-detail/HeroSection'
import { SessionsSection } from './product-detail/SessionsSection'
import { PackagesSection } from './product-detail/PackagesSection'

export function ProductDetailPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>()
  const program = id ? PROGRAM_DETAILS[id] : undefined
  const product = program?.products.find(p => p.id === productId)

  if (!program || !product) {
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
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Product not found.</p>
      </div>
    )
  }

  const packages = PACKAGES.filter(
    pkg => pkg.program_id === id && pkg.entries.some(e => e.product_id === productId),
  )

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />
      <Breadcrumb programId={program.id} programName={program.name} productName={product.name} />
      <HeroSection product={product} program={program} />
      {product.type === 'session' && product.sessions?.length ? (
        <SessionsSection sessions={product.sessions} timezone={program.timezone} />
      ) : null}
      <PackagesSection packages={packages} programId={program.id} />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 4: Run all tests — expect all 13 to pass**

```bash
cd /home/aristo/dev/komuna-community-session-bookings/apps/web && npx vitest run src/__tests__/ProductDetailPage.test.tsx
```

Expected: all 13 tests PASS.

- [ ] **Step 5: Run the full test suite to check for regressions**

```bash
cd /home/aristo/dev/komuna-community-session-bookings/apps/web && npm test
```

Expected: all tests across all test files pass. If any existing test fails, fix the regression before committing.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/pages/product-detail/PackageCard.tsx apps/web/src/pages/product-detail/PackagesSection.tsx apps/web/src/pages/ProductDetailPage.tsx
git commit -m "feat: add PackagesSection and complete ProductDetailPage"
```

---

## Task 7: Mark complete in PAGES.md

**Files:**
- Modify: `PAGES.md`

- [ ] **Step 1: Mark ProductDetailPage as done**

In `PAGES.md`, change:

```
- [ ] **ProductDetailPage** — `/programs/:id/products/:productId` — ...
```

to:

```
- [x] **ProductDetailPage** — `/programs/:id/products/:productId` — ...
```

- [ ] **Step 2: Final commit**

```bash
git add PAGES.md
git commit -m "chore: mark ProductDetailPage complete in PAGES.md"
```
