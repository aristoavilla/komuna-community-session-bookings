# ProgramDetailPage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **ERD is mandatory:** Read `mermaid-diagram.png` at the project root before touching any data types. All entity types must include every field present in the ERD. You may add UI-only extras, but must not omit ERD fields.

**Goal:** Implement `ProgramDetailPage` at `/programs/:id` — program hero, products grid, visibility-gated join CTA — wired into client-side routing via react-router-dom.

**Architecture:** Install react-router-dom and wrap the app in `BrowserRouter`. `App.tsx` declares two routes (`/` and `/programs/:id`). Mock data is extended with ERD-compliant `ProductMock` and `ProgramDetailMock` types. The page is built from focused sub-components (Breadcrumb, HeroSection, ProductsSection) that live inside `pages/program-detail/`.

**Tech Stack:** React 19, TypeScript, react-router-dom v7, Vitest + Testing Library, inline styles with CSS custom properties (no Tailwind utility classes in components).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `apps/web/src/data/programs.ts` | Add `created_at` to `ProgramListItem`; add `ProductMock`, `ProgramDetailMock` types; add `PROGRAM_DETAILS` map |
| Modify | `apps/web/src/main.tsx` | Wrap app in `<BrowserRouter>` |
| Modify | `apps/web/src/App.tsx` | Declare routes for `/` and `/programs/:id` |
| Modify | `apps/web/src/components/discovery/ProgramCard.tsx` | Wrap card in `<Link to="/programs/:id">` |
| Create | `apps/web/src/pages/ProgramDetailPage.tsx` | Page shell — reads `:id` param, looks up mock, renders sections |
| Create | `apps/web/src/pages/program-detail/Breadcrumb.tsx` | Discover → Program name nav |
| Create | `apps/web/src/pages/program-detail/HeroSection.tsx` | Two-col hero: image + name/stats/CTA |
| Create | `apps/web/src/pages/program-detail/ProductsSection.tsx` | Section header + 3-col product grid |
| Create | `apps/web/src/pages/program-detail/ProductCard.tsx` | Single product card with type badge + link |
| Create | `apps/web/src/__tests__/ProgramDetailPage.test.tsx` | Integration tests for the page |

---

## Task 1: Install react-router-dom

**Files:**
- Modify: `apps/web/package.json` (via npm install)

- [ ] **Step 1.1: Install the package**

```bash
cd apps/web && npm install react-router-dom
```

Expected: `react-router-dom` added to `dependencies` in `package.json`. No errors.

- [ ] **Step 1.2: Verify types are available**

```bash
npx tsc --noEmit
```

Expected: exits 0 (no new errors).

- [ ] **Step 1.3: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json
git commit -m "feat: install react-router-dom"
```

---

## Task 2: Extend mock data types to match ERD

**Files:**
- Modify: `apps/web/src/data/programs.ts`

The ERD has these fields for PROGRAM: `id, name, description, visibility, timezone, created_at`.
`ProgramListItem` is missing `created_at`. Add it and the two new types.

- [ ] **Step 2.1: Write failing type-check test**

Add to `apps/web/src/__tests__/programs.test.ts` (file already exists — append to it):

```ts
import type { ProgramDetailMock, ProductMock } from '../data/programs'

it('ProgramDetailMock has required ERD fields', () => {
  const p: ProgramDetailMock = PROGRAM_DETAILS['p1']
  expect(p.id).toBeDefined()
  expect(p.name).toBeDefined()
  expect(p.description).toBeDefined()
  expect(p.visibility).toBeDefined()
  expect(p.timezone).toBeDefined()
  expect(p.created_at).toBeDefined()
  expect(p.products.length).toBeGreaterThan(0)
})

it('ProductMock has required ERD fields', () => {
  const prod: ProductMock = PROGRAM_DETAILS['p1'].products[0]
  expect(prod.id).toBeDefined()
  expect(prod.program_id).toBeDefined()
  expect(prod.name).toBeDefined()
  expect(prod.description).toBeDefined()
  expect(prod.type).toMatch(/^(session|simple)$/)
  expect(prod.status).toMatch(/^(active|archived)$/)
  expect(prod.created_at).toBeDefined()
})
```

Also add the import at the top of the test file:

```ts
import { PROGRAM_DETAILS } from '../data/programs'
```

- [ ] **Step 2.2: Run tests — expect failure**

```bash
cd apps/web && npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: TypeScript compile error — `ProgramDetailMock`, `ProductMock`, `PROGRAM_DETAILS` not exported.

- [ ] **Step 2.3: Update `programs.ts`**

Replace the full file content with:

```ts
// ─── ERD-aligned types ───────────────────────────────────────────────────────
// Fields marked "UI-only" are not in the DB schema but are needed for the
// frontend mock layer. ERD fields must not be removed.

export type ProgramListItem = {
  // ERD: PROGRAM table fields
  id: string
  name: string
  description: string
  visibility: 'public' | 'need-approval' | 'invitation-only' | 'private'
  timezone: string
  created_at: string            // ISO-8601

  // UI-only extras
  memberCount: number
  lowestPrice: string
  location?: string
  category?: string
  rating?: number
  sessionsPerWeek?: number
  imageTone: 'warm' | 'cool' | 'ink' | 'accent'
  imageLabel: string
}

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
}

export type ProgramDetailMock = ProgramListItem & {
  longDescription: string       // UI-only: expanded copy for detail page
  products: ProductMock[]
}

// ─── Discovery list data ──────────────────────────────────────────────────────

export const PROGRAMS: ProgramListItem[] = [
  {
    id: 'p1',
    name: 'Eastside Boxing Club',
    description: 'High-intensity bag work, pad rounds, and conditioning in Brooklyn.',
    visibility: 'public',
    timezone: 'America/New_York',
    created_at: '2024-01-15T10:00:00Z',
    memberCount: 412,
    lowestPrice: '$28',
    location: 'Brooklyn, NY',
    category: 'Boxing',
    rating: 4.9,
    sessionsPerWeek: 6,
    imageTone: 'warm',
    imageLabel: 'BAG WORK · COACH',
  },
  {
    id: 'p2',
    name: 'Slow Flow with Ines',
    description: 'Gentle vinyasa and yin yoga for all levels, morning sessions.',
    visibility: 'need-approval',
    timezone: 'Europe/Lisbon',
    created_at: '2024-03-01T08:00:00Z',
    memberCount: 86,
    lowestPrice: '€22',
    location: 'Lisbon',
    category: 'Yoga',
    rating: 5.0,
    sessionsPerWeek: 3,
    imageTone: 'cool',
    imageLabel: 'MAT · MORNING LIGHT',
  },
  {
    id: 'p3',
    name: 'Strong Together',
    description: 'Barbell strength program built around progressive overload and community.',
    visibility: 'public',
    timezone: 'Europe/Berlin',
    created_at: '2024-02-10T09:00:00Z',
    memberCount: 240,
    lowestPrice: '€34',
    location: 'Berlin',
    category: 'Strength',
    rating: 4.8,
    sessionsPerWeek: 8,
    imageTone: 'ink',
    imageLabel: 'BARBELL · LIFT',
  },
  {
    id: 'p4',
    name: 'Sprint Lab',
    description: 'Online HIIT program with track intervals and timed circuits.',
    visibility: 'invitation-only',
    timezone: 'America/New_York',
    created_at: '2023-11-20T12:00:00Z',
    memberCount: 1124,
    lowestPrice: '$19',
    location: 'Online',
    category: 'HIIT',
    rating: 4.7,
    sessionsPerWeek: 12,
    imageTone: 'accent',
    imageLabel: 'TRACK · INTERVAL',
  },
  {
    id: 'p5',
    name: 'Roundhouse Muay Thai',
    description: 'Technical Muay Thai with pad work, clinch, and conditioning rounds.',
    visibility: 'public',
    timezone: 'America/Chicago',
    created_at: '2024-04-01T11:00:00Z',
    memberCount: 178,
    lowestPrice: '$32',
    location: 'Austin, TX',
    category: 'Boxing',
    rating: 4.9,
    sessionsPerWeek: 5,
    imageTone: 'warm',
    imageLabel: 'RING · PADWORK',
  },
  {
    id: 'p6',
    name: 'Sunrise Vinyasa',
    description: 'Open-air yoga retreat in Bali. Flow at sunrise, meditate at dusk.',
    visibility: 'need-approval',
    timezone: 'Asia/Makassar',
    created_at: '2024-05-05T06:00:00Z',
    memberCount: 64,
    lowestPrice: '$24',
    location: 'Bali',
    category: 'Yoga',
    rating: 5.0,
    sessionsPerWeek: 4,
    imageTone: 'cool',
    imageLabel: 'RETREAT · OUTDOOR',
  },
]

export const CATEGORIES = [
  { id: 'all',          label: 'All programs',   count: 248 },
  { id: 'Boxing',       label: 'Boxing',          count: 34  },
  { id: 'Yoga',         label: 'Yoga & mobility', count: 71  },
  { id: 'Strength',     label: 'Strength',        count: 52  },
  { id: 'HIIT',         label: 'HIIT & cardio',   count: 28  },
  { id: 'Running',      label: 'Running',          count: 19  },
  { id: 'Pilates',      label: 'Pilates',          count: 22  },
  { id: 'Martial arts', label: 'Martial arts',     count: 14  },
  { id: 'Online only',  label: 'Online only',      count: 88  },
] as const

// ─── Program detail data (one entry per program) ──────────────────────────────

export const PROGRAM_DETAILS: Record<string, ProgramDetailMock> = {
  p1: {
    ...PROGRAMS[0],
    longDescription:
      'Eastside Boxing Club has trained fighters and fitness enthusiasts out of Williamsburg since 2019. Coach Marcus runs tight, structured classes — heavy bag rounds, pad work with rotating trainers, and conditioning finishers. No sparring unless you ask for it. Gloves and wraps provided for your first session.',
    products: [
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
      },
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
      },
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
      },
    ],
  },
  p2: {
    ...PROGRAMS[1],
    longDescription:
      'Ines brings a slow, meditative approach to vinyasa — long holds, breath-first cues, and genuine attention to alignment. Held in a light-filled studio in Mouraria. Morning sessions run Tuesday, Thursday, and Sunday. All levels welcome; props provided.',
    products: [
      {
        id: 'prod-p2-1',
        program_id: 'p2',
        name: 'Morning Vinyasa',
        description: 'A 60-minute flow focused on breath and steady movement. Tuesday, Thursday, Sunday.',
        type: 'session',
        status: 'active',
        created_at: '2024-03-05T08:00:00Z',
        capacity: 12,
        sessionsPerWeek: 3,
        lowestPrice: '€22',
        imageTone: 'cool',
        imageLabel: 'FLOW · MORNING',
      },
      {
        id: 'prod-p2-2',
        program_id: 'p2',
        name: 'Class Pass (5×)',
        description: 'Five sessions bundled. Valid for 45 days from purchase.',
        type: 'simple',
        status: 'active',
        created_at: '2024-03-05T08:00:00Z',
        lowestPrice: '€95',
        imageTone: 'cool',
        imageLabel: 'PASS · 5×',
      },
    ],
  },
  p3: {
    ...PROGRAMS[2],
    longDescription:
      'Strong Together runs a 12-week progressive overload program out of a warehouse gym in Neukölln. The community lifts together three times a week — squat, press, and pull days — with an optional conditioning add-on on Saturdays. Beginners get a form-check session in week one.',
    products: [
      {
        id: 'prod-p3-1',
        program_id: 'p3',
        name: 'Barbell Fundamentals',
        description: 'Three lifts, three days a week. Mon / Wed / Fri, 7 AM and 6 PM slots.',
        type: 'session',
        status: 'active',
        created_at: '2024-02-15T09:00:00Z',
        capacity: 18,
        sessionsPerWeek: 6,
        lowestPrice: '€34',
        imageTone: 'ink',
        imageLabel: 'LIFT · BARBELL',
      },
      {
        id: 'prod-p3-2',
        program_id: 'p3',
        name: 'Saturday Conditioning',
        description: 'Optional add-on. Kettlebell and carry circuits, 45 min.',
        type: 'session',
        status: 'active',
        created_at: '2024-02-15T09:00:00Z',
        capacity: 20,
        sessionsPerWeek: 1,
        lowestPrice: '€18',
        imageTone: 'ink',
        imageLabel: 'CONDITIONING · SAT',
      },
      {
        id: 'prod-p3-3',
        program_id: 'p3',
        name: 'Form Check Drop-in',
        description: 'One-on-one form review with a coach. Redeemable any weekday.',
        type: 'simple',
        status: 'active',
        created_at: '2024-02-15T09:00:00Z',
        lowestPrice: '€40',
        imageTone: 'accent',
        imageLabel: 'FORM CHECK',
      },
    ],
  },
  p4: {
    ...PROGRAMS[3],
    longDescription:
      'Sprint Lab is an invitation-only online HIIT program running live sessions via Zoom. Coach Priya leads 12 sessions a week across time zones — track intervals, timed circuits, and threshold work. Equipment-free options available for every session.',
    products: [
      {
        id: 'prod-p4-1',
        program_id: 'p4',
        name: 'Live HIIT Session',
        description: 'A 45-minute live session via Zoom. Join any of the 12 weekly slots.',
        type: 'session',
        status: 'active',
        created_at: '2023-11-25T12:00:00Z',
        capacity: 30,
        sessionsPerWeek: 12,
        lowestPrice: '$19',
        imageTone: 'accent',
        imageLabel: 'HIIT · LIVE',
      },
      {
        id: 'prod-p4-2',
        program_id: 'p4',
        name: 'Monthly Unlimited',
        description: 'Unlimited live sessions for 30 days. Auto-renew optional.',
        type: 'simple',
        status: 'active',
        created_at: '2023-11-25T12:00:00Z',
        lowestPrice: '$59',
        imageTone: 'accent',
        imageLabel: 'UNLIMITED · MONTH',
      },
    ],
  },
  p5: {
    ...PROGRAMS[4],
    longDescription:
      'Roundhouse runs technical Muay Thai out of a dedicated ring gym in East Austin. Classes cover stance, guard, kicks, clinch work, and pad rounds with rotating coaches. Competitive fighters train here alongside complete beginners — the gym culture makes it work.',
    products: [
      {
        id: 'prod-p5-1',
        program_id: 'p5',
        name: 'Technique Class',
        description: 'Fundamentals + pad work. Mon / Wed / Fri / Sat / Sun.',
        type: 'session',
        status: 'active',
        created_at: '2024-04-05T11:00:00Z',
        capacity: 16,
        sessionsPerWeek: 5,
        lowestPrice: '$32',
        imageTone: 'warm',
        imageLabel: 'TECHNIQUE · PADS',
      },
      {
        id: 'prod-p5-2',
        program_id: 'p5',
        name: 'Sparring (Advanced)',
        description: 'Light controlled sparring. Invite from coach required.',
        type: 'session',
        status: 'active',
        created_at: '2024-04-05T11:00:00Z',
        capacity: 8,
        sessionsPerWeek: 1,
        lowestPrice: '$20',
        imageTone: 'warm',
        imageLabel: 'SPARRING · ADV',
      },
      {
        id: 'prod-p5-3',
        program_id: 'p5',
        name: 'Gear Rental Pass',
        description: 'Borrow gloves and shin guards for a session. Redeemable at front desk.',
        type: 'simple',
        status: 'active',
        created_at: '2024-04-05T11:00:00Z',
        lowestPrice: '$5',
        imageTone: 'ink',
        imageLabel: 'GEAR · RENTAL',
      },
    ],
  },
  p6: {
    ...PROGRAMS[5],
    longDescription:
      'Sunrise Vinyasa is an intimate yoga program set in an open-air shala in Canggu. Sessions run at sunrise and dusk, capped at 12 students. The program runs year-round; accommodation is not included but the team can recommend nearby homestays.',
    products: [
      {
        id: 'prod-p6-1',
        program_id: 'p6',
        name: 'Sunrise Flow',
        description: '75-minute vinyasa at sunrise. Daily, 06:00 WITA.',
        type: 'session',
        status: 'active',
        created_at: '2024-05-10T06:00:00Z',
        capacity: 12,
        sessionsPerWeek: 4,
        lowestPrice: '$24',
        imageTone: 'cool',
        imageLabel: 'SUNRISE · FLOW',
      },
      {
        id: 'prod-p6-2',
        program_id: 'p6',
        name: 'Week Pass',
        description: '7-day unlimited access. Valid for any session during the week.',
        type: 'simple',
        status: 'active',
        created_at: '2024-05-10T06:00:00Z',
        lowestPrice: '$120',
        imageTone: 'cool',
        imageLabel: 'WEEK · PASS',
      },
    ],
  },
}
```

- [ ] **Step 2.4: Run tests — expect pass**

```bash
cd apps/web && npm test -- --reporter=verbose 2>&1 | tail -30
```

Expected: all tests pass including the two new ones.

- [ ] **Step 2.5: Commit**

```bash
git add apps/web/src/data/programs.ts apps/web/src/__tests__/programs.test.ts
git commit -m "feat: add ProductMock/ProgramDetailMock types and PROGRAM_DETAILS mock data"
```

---

## Task 3: Wire routing

**Files:**
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/discovery/ProgramCard.tsx`

- [ ] **Step 3.1: Write failing routing test**

Create `apps/web/src/__tests__/routing.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('routing', () => {
  it('renders DiscoveryPage at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Available programs')).toBeInTheDocument()
  })

  it('renders ProgramDetailPage at /programs/p1', () => {
    render(
      <MemoryRouter initialEntries={['/programs/p1']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
  })

  it('renders 404 message for unknown program id', () => {
    render(
      <MemoryRouter initialEntries={['/programs/unknown']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText(/program not found/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3.2: Run test — expect failure**

```bash
cd apps/web && npm test -- routing --reporter=verbose 2>&1 | tail -20
```

Expected: FAIL — `react-router-dom` exports not available in App / ProgramDetailPage not defined.

- [ ] **Step 3.3: Update `main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './globals.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 3.4: Create a stub `ProgramDetailPage.tsx` (just enough to pass the routing test)**

Create `apps/web/src/pages/ProgramDetailPage.tsx`:

```tsx
import { useParams } from 'react-router-dom'
import { PROGRAM_DETAILS } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const detail = id ? PROGRAM_DETAILS[id] : undefined

  if (!detail) {
    return (
      <div style={{ background: 'var(--paper-1)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Program not found.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />
      <p>{detail.name}</p>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3.5: Update `App.tsx` to use Routes**

```tsx
import { Routes, Route } from 'react-router-dom'
import { DiscoveryPage } from './pages/DiscoveryPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DiscoveryPage />} />
      <Route path="/programs/:id" element={<ProgramDetailPage />} />
    </Routes>
  )
}
```

- [ ] **Step 3.6: Make ProgramCard navigate on click**

In `apps/web/src/components/discovery/ProgramCard.tsx`, wrap the outer `<div>` in a `<Link>`:

```tsx
import { Link } from 'react-router-dom'
import type { ProgramListItem } from '../../data/programs'

// ... (VIS and TONE_STYLES constants unchanged) ...

export function ProgramCard({ program: p }: { program: ProgramListItem }) {
  const vis = VIS[p.visibility]
  return (
    <Link
      to={`/programs/${p.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          background: 'var(--paper-1)',
          border: '1px solid var(--rule)',
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
        }}
      >
        {/* rest of card JSX unchanged */}
      </div>
    </Link>
  )
}
```

Full replacement of ProgramCard.tsx (keep all existing JSX inside the outer div, just add the Link wrapper and cursor style):

```tsx
import { Link } from 'react-router-dom'
import type { ProgramListItem } from '../../data/programs'

const VIS = {
  public:            { text: 'Open',    dot: 'var(--ok)'     },
  'need-approval':   { text: 'Apply',   dot: 'var(--accent)' },
  'invitation-only': { text: 'Invite',  dot: 'var(--ink-2)'  },
  private:           { text: 'Private', dot: 'var(--ink-3)'  },
} as const

const TONE_STYLES: Record<ProgramListItem['imageTone'], { bg: string; stripe: string; fg: string }> = {
  warm:   { bg: 'var(--placeholder-warm)',   stripe: 'var(--placeholder-warm-stripe)',  fg: 'var(--ink-2)' },
  cool:   { bg: 'var(--placeholder-cool)',   stripe: 'var(--placeholder-cool-stripe)',  fg: 'var(--ink-2)' },
  ink:    { bg: 'var(--ink-1)',              stripe: 'var(--ink-2)',                    fg: 'var(--paper-1)' },
  accent: { bg: 'var(--accent-soft)',        stripe: 'var(--accent-soft-stripe)',       fg: 'var(--accent-ink)' },
}

function ImagePlaceholder({ label, tone }: { label: string; tone: ProgramListItem['imageTone'] }) {
  const t = TONE_STYLES[tone]
  return (
    <div
      style={{
        aspectRatio: '4 / 3',
        background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 15px)`,
        color: t.fg,
        display: 'flex',
        alignItems: 'flex-end',
        padding: 14,
        position: 'relative',
        overflow: 'hidden',
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
        {label}
      </span>
    </div>
  )
}

export function ProgramCard({ program: p }: { program: ProgramListItem }) {
  const vis = VIS[p.visibility]
  return (
    <Link to={`/programs/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: 'var(--paper-1)',
          border: '1px solid var(--rule)',
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
        }}
      >
        <div style={{ position: 'relative' }}>
          <ImagePlaceholder label={p.imageLabel} tone={p.imageTone} />
          <div
            style={{
              position: 'absolute', top: 12, left: 12,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--paper-1)', padding: '4px 9px',
              borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'var(--ink-1)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 3, background: vis.dot }} />
            {vis.text}
          </div>
          {p.category && (
            <div
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'var(--paper-1)', padding: '4px 9px',
                borderRadius: 999, fontSize: 11, fontWeight: 500, color: 'var(--ink-1)',
              }}
            >
              {p.category}
            </div>
          )}
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 19, color: 'var(--ink-1)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
              {p.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>
              {p.location} · {p.memberCount} members
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--rule)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 20, color: 'var(--ink-1)' }}>{p.lowestPrice}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>/ session</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--ink-2)' }}>
              {p.rating && <span>★ {p.rating}</span>}
              {p.sessionsPerWeek && <><span style={{ color: 'var(--ink-3)' }}>·</span><span>{p.sessionsPerWeek} sessions/wk</span></>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3.7: Run all tests — expect pass**

```bash
cd apps/web && npm test -- --reporter=verbose 2>&1 | tail -30
```

Expected: all tests pass including the 3 routing tests.

- [ ] **Step 3.8: Commit**

```bash
git add apps/web/src/main.tsx apps/web/src/App.tsx \
        apps/web/src/components/discovery/ProgramCard.tsx \
        apps/web/src/pages/ProgramDetailPage.tsx \
        apps/web/src/__tests__/routing.test.tsx
git commit -m "feat: wire react-router-dom routing and link ProgramCard"
```

---

## Task 4: Build sub-components for ProgramDetailPage

**Files:**
- Create: `apps/web/src/pages/program-detail/Breadcrumb.tsx`
- Create: `apps/web/src/pages/program-detail/HeroSection.tsx`
- Create: `apps/web/src/pages/program-detail/ProductsSection.tsx`
- Create: `apps/web/src/pages/program-detail/ProductCard.tsx`

These components are created first (no tests yet — tests come in Task 5 at page level).

- [ ] **Step 4.1: Create `Breadcrumb.tsx`**

```tsx
import { Link } from 'react-router-dom'

interface BreadcrumbProps {
  programName: string
}

export function Breadcrumb({ programName }: BreadcrumbProps) {
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
      <span style={{ color: 'var(--ink-1)' }}>{programName}</span>
    </div>
  )
}
```

- [ ] **Step 4.2: Create `ProductCard.tsx`**

```tsx
import { Link } from 'react-router-dom'
import type { ProductMock } from '../../data/programs'

const TONE_STYLES: Record<ProductMock['imageTone'], { bg: string; stripe: string; fg: string }> = {
  warm:   { bg: 'var(--placeholder-warm)',   stripe: 'var(--placeholder-warm-stripe)',  fg: 'var(--ink-2)' },
  cool:   { bg: 'var(--placeholder-cool)',   stripe: 'var(--placeholder-cool-stripe)',  fg: 'var(--ink-2)' },
  ink:    { bg: 'var(--ink-1)',              stripe: 'var(--ink-2)',                    fg: 'var(--paper-1)' },
  accent: { bg: 'var(--accent-soft)',        stripe: 'var(--accent-soft-stripe)',       fg: 'var(--accent-ink)' },
}

interface ProductCardProps {
  product: ProductMock
  programId: string
}

export function ProductCard({ product: p, programId }: ProductCardProps) {
  const t = TONE_STYLES[p.imageTone]
  const href = `/programs/${programId}/products/${p.id}`

  return (
    <div
      style={{
        border: '1px solid var(--rule)',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--paper-1)',
      }}
    >
      {/* Image placeholder with type badge */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            aspectRatio: '16 / 9',
            background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 15px)`,
            color: t.fg,
            display: 'flex',
            alignItems: 'flex-end',
            padding: 14,
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
        {/* Type badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '4px 9px',
            background: 'var(--ink-1)',
            color: 'var(--paper-1)',
            borderRadius: 6,
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {p.type}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 19,
              color: 'var(--ink-1)',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
            }}
          >
            {p.name}
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--ink-2)',
              marginTop: 6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {p.description}
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTop: '1px solid var(--rule)',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 20, color: 'var(--ink-1)' }}>
              {p.lowestPrice}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {p.type === 'session' ? '/ session' : '/ pass'}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
            {p.type === 'session' && p.sessionsPerWeek
              ? `${p.sessionsPerWeek} sessions/wk`
              : 'Redeemable'}
          </span>
        </div>

        {/* Link */}
        <Link
          to={href}
          style={{
            fontSize: 13,
            color: 'var(--accent)',
            textDecoration: 'none',
            marginTop: 4,
          }}
        >
          {p.type === 'session' ? '→ View sessions' : '→ View details'}
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 4.3: Create `ProductsSection.tsx`**

```tsx
import type { ProductMock } from '../../data/programs'
import { ProductCard } from './ProductCard'

interface ProductsSectionProps {
  products: ProductMock[]
  programId: string
}

export function ProductsSection({ products, programId }: ProductsSectionProps) {
  return (
    <section style={{ padding: '56px 64px 80px', borderTop: '1px solid var(--rule)' }}>
      {/* Section header */}
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
          §02 · Products
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 36,
            letterSpacing: '-0.02em',
            color: 'var(--ink-1)',
            margin: 0,
          }}
        >
          What's offered
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>
          {products.length} product{products.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Product grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
      >
        {products.map(p => (
          <ProductCard key={p.id} product={p} programId={programId} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4.4: Create `HeroSection.tsx`**

```tsx
import type { ProgramDetailMock } from '../../data/programs'

const VIS_CONFIG = {
  public:            { text: 'Open',    dot: 'var(--ok)'     },
  'need-approval':   { text: 'Apply',   dot: 'var(--accent)' },
  'invitation-only': { text: 'Invite',  dot: 'var(--ink-2)'  },
  private:           { text: 'Private', dot: 'var(--ink-3)'  },
} as const

const TONE_STYLES: Record<ProgramDetailMock['imageTone'], { bg: string; stripe: string; fg: string }> = {
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

function JoinCTA({ visibility }: { visibility: ProgramDetailMock['visibility'] }) {
  if (visibility === 'public') {
    return (
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
        Join program →
      </button>
    )
  }

  if (visibility === 'need-approval') {
    return (
      <div>
        <button
          type="button"
          style={{
            padding: '16px 28px',
            background: 'transparent',
            color: 'var(--ink-1)',
            border: '1px solid var(--ink-1)',
            borderRadius: 10,
            fontSize: 15,
            fontFamily: 'var(--font-sans, sans-serif)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Request to join
        </button>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 10 }}>
          Admin reviews all requests
        </p>
      </div>
    )
  }

  if (visibility === 'invitation-only') {
    return (
      <div>
        <button
          type="button"
          disabled
          style={{
            padding: '16px 28px',
            background: 'var(--paper-3)',
            color: 'var(--ink-3)',
            border: 0,
            borderRadius: 10,
            fontSize: 15,
            fontFamily: 'var(--font-sans, sans-serif)',
            cursor: 'not-allowed',
          }}
        >
          Invitation only
        </button>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 10 }}>
          Contact the admin to request access
        </p>
      </div>
    )
  }

  return null
}

interface HeroSectionProps {
  program: ProgramDetailMock
}

export function HeroSection({ program: p }: HeroSectionProps) {
  const vis = VIS_CONFIG[p.visibility]
  const t = TONE_STYLES[p.imageTone]

  // Split name: all words except last are normal, last word is italic + accent
  const words = p.name.split(' ')
  const lastWord = words.pop()!
  const restOfName = words.join(' ')

  return (
    <section
      style={{
        padding: '0 64px 56px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 56,
        alignItems: 'stretch',
      }}
    >
      {/* Left: image placeholder */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            aspectRatio: '4 / 5',
            background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 15px)`,
            color: t.fg,
            display: 'flex',
            alignItems: 'flex-end',
            padding: 14,
            borderRadius: 4,
            overflow: 'hidden',
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

        {/* Visibility badge */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--paper-1)',
            padding: '6px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--ink-1)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 3, background: vis.dot }} />
          {vis.text}
        </div>

        {/* Location + timezone chip */}
        {(p.location || p.timezone) && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              padding: '8px 14px',
              background: 'var(--ink-1)',
              color: 'var(--paper-1)',
              borderRadius: 8,
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {[p.location, p.timezone].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>

      {/* Right: name, description, stats, CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 8 }}>
        <div>
          {/* Category pill */}
          {p.category && (
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
                {p.category}
              </span>
            </div>
          )}

          {/* Program name */}
          <h1
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 72,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: 'var(--ink-1)',
              margin: 0,
            }}
          >
            {restOfName && <>{restOfName}<br /></>}
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{lastWord}.</em>
          </h1>

          {/* Long description */}
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--ink-2)',
              marginTop: 24,
              maxWidth: 540,
            }}
          >
            {p.longDescription}
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
          <StatCell label="Members" value={String(p.memberCount)} sub="Active this month" />
          {p.sessionsPerWeek && (
            <StatCell label="Sessions / wk" value={String(p.sessionsPerWeek)} sub="Across all products" />
          )}
          <StatCell label="From" value={p.lowestPrice} sub="Per session" />
          <StatCell label="Timezone" value={p.timezone.split('/')[1]?.replace('_', ' ') ?? p.timezone} sub={p.timezone} />
        </div>

        {/* Join CTA */}
        <div style={{ marginTop: 28 }}>
          <JoinCTA visibility={p.visibility} />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4.5: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 4.6: Commit sub-components**

```bash
git add apps/web/src/pages/program-detail/
git commit -m "feat: add ProgramDetailPage sub-components (Breadcrumb, HeroSection, ProductsSection, ProductCard)"
```

---

## Task 5: Wire sub-components into `ProgramDetailPage` + write tests

**Files:**
- Modify: `apps/web/src/pages/ProgramDetailPage.tsx`
- Create: `apps/web/src/__tests__/ProgramDetailPage.test.tsx`

- [ ] **Step 5.1: Write the full test file first**

Create `apps/web/src/__tests__/ProgramDetailPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProgramDetailPage } from '../pages/ProgramDetailPage'
import { PROGRAM_DETAILS } from '../data/programs'

function renderAtPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/programs/:id" element={<ProgramDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProgramDetailPage', () => {
  it('renders program name and long description for p1', () => {
    renderAtPath('/programs/p1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Eastside Boxing')
    expect(screen.getByText(/Coach Marcus runs tight/)).toBeInTheDocument()
  })

  it('renders all products for p1', () => {
    renderAtPath('/programs/p1')
    const detail = PROGRAM_DETAILS['p1']
    for (const product of detail.products) {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    }
  })

  it('shows "Join program →" button for a public program (p1)', () => {
    renderAtPath('/programs/p1')
    expect(screen.getByRole('button', { name: /join program/i })).toBeInTheDocument()
  })

  it('shows "Request to join" button for a need-approval program (p2)', () => {
    renderAtPath('/programs/p2')
    expect(screen.getByRole('button', { name: /request to join/i })).toBeInTheDocument()
    expect(screen.getByText(/admin reviews all requests/i)).toBeInTheDocument()
  })

  it('shows disabled "Invitation only" button for invitation-only program (p4)', () => {
    renderAtPath('/programs/p4')
    const btn = screen.getByRole('button', { name: /invitation only/i })
    expect(btn).toBeDisabled()
    expect(screen.getByText(/contact the admin/i)).toBeInTheDocument()
  })

  it('shows product type badges (SESSION / SIMPLE)', () => {
    renderAtPath('/programs/p1')
    expect(screen.getAllByText('session').length).toBeGreaterThan(0)
    expect(screen.getAllByText('simple').length).toBeGreaterThan(0)
  })

  it('shows "Program not found." for an unknown id', () => {
    renderAtPath('/programs/does-not-exist')
    expect(screen.getByText(/program not found/i)).toBeInTheDocument()
  })

  it('renders breadcrumb with program name', () => {
    renderAtPath('/programs/p1')
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
    expect(screen.getByText('Discover')).toBeInTheDocument()
  })

  it('product cards link to /programs/:id/products/:productId', () => {
    renderAtPath('/programs/p1')
    const links = screen.getAllByRole('link', { name: /view sessions/i })
    expect(links[0]).toHaveAttribute('href', '/programs/p1/products/prod-p1-1')
  })
})
```

- [ ] **Step 5.2: Run tests — expect failure**

```bash
cd apps/web && npm test -- ProgramDetailPage --reporter=verbose 2>&1 | tail -30
```

Expected: FAIL — heading / buttons / products not rendered because page is still the stub.

- [ ] **Step 5.3: Replace stub `ProgramDetailPage.tsx` with full implementation**

```tsx
import { useParams } from 'react-router-dom'
import { PROGRAM_DETAILS } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'
import { Breadcrumb } from './program-detail/Breadcrumb'
import { HeroSection } from './program-detail/HeroSection'
import { ProductsSection } from './program-detail/ProductsSection'

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const detail = id ? PROGRAM_DETAILS[id] : undefined

  if (!detail) {
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
        <p style={{ color: 'var(--ink-2)', fontSize: 16 }}>Program not found.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />
      <Breadcrumb programName={detail.name} />
      <HeroSection program={detail} />
      <ProductsSection products={detail.products} programId={detail.id} />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 5.4: Run tests — expect all pass**

```bash
cd apps/web && npm test -- --reporter=verbose 2>&1 | tail -40
```

Expected: all tests pass (existing + new ProgramDetailPage suite).

- [ ] **Step 5.5: Commit**

```bash
git add apps/web/src/pages/ProgramDetailPage.tsx \
        apps/web/src/__tests__/ProgramDetailPage.test.tsx
git commit -m "feat: implement ProgramDetailPage with hero, products grid, and join CTA"
```

---

## Task 6: Mark page done and final verification

**Files:**
- Modify: `PAGES.md`

- [ ] **Step 6.1: Run the full test suite one final time**

```bash
cd apps/web && npm test -- --reporter=verbose 2>&1 | tail -50
```

Expected: all tests pass, 0 failures.

- [ ] **Step 6.2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 6.3: Mark `ProgramDetailPage` done in PAGES.md**

In `PAGES.md`, change:

```
- [ ] **ProgramDetailPage**
```

to:

```
- [x] **ProgramDetailPage**
```

- [ ] **Step 6.4: Commit**

```bash
git add PAGES.md
git commit -m "chore: mark ProgramDetailPage complete in PAGES.md"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task covering it |
|---|---|
| Install react-router-dom | Task 1 |
| `created_at` added to `ProgramListItem` | Task 2 |
| `ProductMock` with all ERD fields | Task 2 |
| `ProgramDetailMock` type | Task 2 |
| `PROGRAM_DETAILS` mock (p1–p6, session + simple per program) | Task 2 |
| `BrowserRouter` in `main.tsx` | Task 3 |
| Routes `/` and `/programs/:id` in `App.tsx` | Task 3 |
| `ProgramCard` navigates to `/programs/:id` | Task 3 |
| Breadcrumb: Discover → Program name | Task 4 |
| Hero: image placeholder, visibility badge, location+timezone chip | Task 4 |
| Hero: serif program name, last word italic accent | Task 4 |
| Hero: stats strip (members, sessions/wk, price, timezone) | Task 4 |
| Join CTA: 3 visibility states (public/need-approval/invitation-only) | Task 4 |
| Products section: 3-col grid, type badge, footer stats, link | Task 4 |
| 9 test scenarios | Task 5 |
| PAGES.md updated to `[x]` | Task 6 |

No gaps found.

**Placeholder scan:** No TBD, TODO, or incomplete sections.

**Type consistency:** `ProductMock` defined in Task 2, imported in Tasks 4 (`ProductCard`, `ProductsSection`) and 5 (tests). `ProgramDetailMock` defined in Task 2, used in Task 4 (`HeroSection`) and 5 (tests). `PROGRAM_DETAILS` record keys match product ids used in test assertions (`prod-p1-1`). All consistent.
