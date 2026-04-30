# SessionsPage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the SessionsPage at `/programs/:id/products/:productId/sessions` — a paginated schedule list for session-type products with open/full/out-of-window/past states.

**Architecture:** Single-file component (`SessionsPage.tsx`) that reads program/product from `PROGRAM_DETAILS` via URL params and sessions from an injected `sessions` prop (falling back to a new `SESSION_INSTANCES` export). All helper functions (`SessionRow`, view toggle, pagination) live in the same file. Tests inject controlled mock data via props following the WalletPage pattern.

**Tech Stack:** React 18 + TypeScript, react-router-dom v6 (`useParams`), Vitest + Testing Library, inline CSS with design-token vars.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `apps/web/src/data/programs.ts` | Modify | Extend `SessionInstanceMock.status` union + add `SESSION_INSTANCES` export |
| `apps/web/src/pages/SessionsPage.tsx` | Create | Page component |
| `apps/web/src/__tests__/SessionsPage.test.tsx` | Create | 12 component tests |
| `apps/web/src/App.tsx` | Modify | Add route + import |
| `apps/web/src/__tests__/routing.test.tsx` | Modify | Add SessionsPage routing test |
| `PAGES.md` | Modify | Mark SessionsPage `[x]` |

---

## Task 1: Extend `SessionInstanceMock` and add `SESSION_INSTANCES`

**Files:**
- Modify: `apps/web/src/data/programs.ts:34` (status union)
- Modify: `apps/web/src/data/programs.ts` (add export at end of file)
- Modify: `apps/web/src/__tests__/programs.test.ts` (add data-shape test)

- [ ] **Step 1.1: Write the failing test**

Add to `apps/web/src/__tests__/programs.test.ts`:

```ts
import { SESSION_INSTANCES } from '../data/programs'
import type { SessionInstanceMock } from '../data/programs'

it('SESSION_INSTANCES has entries for prod-p1-1 covering all four status values', () => {
  const sessions: SessionInstanceMock[] = SESSION_INSTANCES['prod-p1-1']
  expect(sessions).toBeDefined()
  const statuses = sessions.map(s => s.status)
  expect(statuses).toContain('open')
  expect(statuses).toContain('full')
  expect(statuses).toContain('out-of-window')
  expect(statuses).toContain('past')
})

it('SESSION_INSTANCES entries have all required SessionInstanceMock fields', () => {
  const sessions: SessionInstanceMock[] = SESSION_INSTANCES['prod-p1-1']
  for (const s of sessions) {
    expect(s.id).toBeTruthy()
    expect(s.product_id).toBe('prod-p1-1')
    expect(s.start_time).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(s.end_time).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(['open', 'full', 'out-of-window', 'past']).toContain(s.status)
    expect(typeof s.is_active).toBe('boolean')
    expect(s.created_at).toBeTruthy()
    expect(s.coach).toBeTruthy()
    expect(s.taken).toBeGreaterThanOrEqual(0)
    expect(s.capacity).toBeGreaterThan(0)
  }
})
```

- [ ] **Step 1.2: Run to verify failure**

```bash
cd apps/web && npx vitest run src/__tests__/programs.test.ts
```

Expected: FAIL — `SESSION_INSTANCES` is not exported / `out-of-window` is not a valid status.

- [ ] **Step 1.3: Extend the status union**

In `apps/web/src/data/programs.ts`, change line 34 from:

```ts
  status: 'open' | 'full' | 'past'
```

to:

```ts
  status: 'open' | 'full' | 'out-of-window' | 'past'
```

- [ ] **Step 1.4: Add `SESSION_INSTANCES` export**

Append to the end of `apps/web/src/data/programs.ts`:

```ts
// ─── Session instances (full schedule, keyed by product_id) ───────────────────
// Used by SessionsPage. Covers all four status values.
// Sorted by start_time ascending. TODAY = 2026-04-30T00:00:00Z.
// Booking window = 14 days → OOW after 2026-05-14.

export const SESSION_INSTANCES: Record<string, SessionInstanceMock[]> = {
  'prod-p1-1': [
    // Past
    {
      id: 'si-p1-1-past-1',
      product_id: 'prod-p1-1',
      start_time: '2026-04-23T13:00:00Z',
      end_time:   '2026-04-23T14:30:00Z',
      status: 'past',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 14,
      capacity: 14,
    },
    {
      id: 'si-p1-1-past-2',
      product_id: 'prod-p1-1',
      start_time: '2026-04-28T13:00:00Z',
      end_time:   '2026-04-28T14:30:00Z',
      status: 'past',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 10,
      capacity: 14,
    },
    // Open (within booking window)
    {
      id: 'si-p1-1-1',
      product_id: 'prod-p1-1',
      start_time: '2026-05-02T13:00:00Z',
      end_time:   '2026-05-02T14:30:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 5,
      capacity: 14,
    },
    // Full (within booking window)
    {
      id: 'si-p1-1-2',
      product_id: 'prod-p1-1',
      start_time: '2026-05-05T13:00:00Z',
      end_time:   '2026-05-05T14:30:00Z',
      status: 'full',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 14,
      capacity: 14,
    },
    // Open (within booking window)
    {
      id: 'si-p1-1-3',
      product_id: 'prod-p1-1',
      start_time: '2026-05-09T13:00:00Z',
      end_time:   '2026-05-09T14:30:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 11,
      capacity: 14,
    },
    // Open (within booking window)
    {
      id: 'si-p1-1-4',
      product_id: 'prod-p1-1',
      start_time: '2026-05-12T13:00:00Z',
      end_time:   '2026-05-12T14:30:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 3,
      capacity: 14,
    },
    // Out-of-window (beyond 14-day booking window)
    {
      id: 'si-p1-1-5',
      product_id: 'prod-p1-1',
      start_time: '2026-05-16T13:00:00Z',
      end_time:   '2026-05-16T14:30:00Z',
      status: 'out-of-window',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 0,
      capacity: 14,
    },
    {
      id: 'si-p1-1-6',
      product_id: 'prod-p1-1',
      start_time: '2026-05-19T13:00:00Z',
      end_time:   '2026-05-19T14:30:00Z',
      status: 'out-of-window',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 0,
      capacity: 14,
    },
    {
      id: 'si-p1-1-7',
      product_id: 'prod-p1-1',
      start_time: '2026-05-23T13:00:00Z',
      end_time:   '2026-05-23T14:30:00Z',
      status: 'out-of-window',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Coach Marcus',
      taken: 0,
      capacity: 14,
    },
  ],
  'prod-p2-1': [
    {
      id: 'si-p2-1-1',
      product_id: 'prod-p2-1',
      start_time: '2026-05-05T07:00:00Z',
      end_time:   '2026-05-05T08:00:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Ines Mendes',
      taken: 4,
      capacity: 12,
    },
    {
      id: 'si-p2-1-2',
      product_id: 'prod-p2-1',
      start_time: '2026-05-07T07:00:00Z',
      end_time:   '2026-05-07T08:00:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Ines Mendes',
      taken: 9,
      capacity: 12,
    },
    {
      id: 'si-p2-1-3',
      product_id: 'prod-p2-1',
      start_time: '2026-05-12T07:00:00Z',
      end_time:   '2026-05-12T08:00:00Z',
      status: 'open',
      is_active: true,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Ines Mendes',
      taken: 2,
      capacity: 12,
    },
    {
      id: 'si-p2-1-4',
      product_id: 'prod-p2-1',
      start_time: '2026-05-17T07:00:00Z',
      end_time:   '2026-05-17T08:00:00Z',
      status: 'out-of-window',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Ines Mendes',
      taken: 0,
      capacity: 12,
    },
    {
      id: 'si-p2-1-5',
      product_id: 'prod-p2-1',
      start_time: '2026-05-19T07:00:00Z',
      end_time:   '2026-05-19T08:00:00Z',
      status: 'out-of-window',
      is_active: false,
      created_at: '2026-04-01T10:00:00Z',
      coach: 'Ines Mendes',
      taken: 0,
      capacity: 12,
    },
  ],
}
```

- [ ] **Step 1.5: Run to verify tests pass**

```bash
cd apps/web && npx vitest run src/__tests__/programs.test.ts
```

Expected: all programs tests pass including the two new ones.

- [ ] **Step 1.6: Commit**

```bash
git add apps/web/src/data/programs.ts apps/web/src/__tests__/programs.test.ts
git commit -m "feat: extend SessionInstanceMock status and add SESSION_INSTANCES mock data"
```

---

## Task 2: Create `SessionsPage.tsx` with tests

**Files:**
- Create: `apps/web/src/__tests__/SessionsPage.test.tsx`
- Create: `apps/web/src/pages/SessionsPage.tsx`

- [ ] **Step 2.1: Write the test file**

Create `apps/web/src/__tests__/SessionsPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SessionsPage } from '../pages/SessionsPage'
import type { SessionInstanceMock } from '../data/programs'

// Four status variants — 1 past + 3 non-past
const baseSessions: SessionInstanceMock[] = [
  {
    id: 'si-past',
    product_id: 'prod-p1-1',
    start_time: '2026-04-23T13:00:00Z',
    end_time:   '2026-04-23T14:30:00Z',
    status: 'past',
    is_active: false,
    created_at: '2026-04-01T10:00:00Z',
    coach: 'Coach Marcus',
    taken: 14,
    capacity: 14,
  },
  {
    id: 'si-open',
    product_id: 'prod-p1-1',
    start_time: '2026-05-02T13:00:00Z',
    end_time:   '2026-05-02T14:30:00Z',
    status: 'open',
    is_active: true,
    created_at: '2026-04-01T10:00:00Z',
    coach: 'Coach Marcus',
    taken: 5,
    capacity: 14,
  },
  {
    id: 'si-full',
    product_id: 'prod-p1-1',
    start_time: '2026-05-05T13:00:00Z',
    end_time:   '2026-05-05T14:30:00Z',
    status: 'full',
    is_active: true,
    created_at: '2026-04-01T10:00:00Z',
    coach: 'Coach Marcus',
    taken: 14,
    capacity: 14,
  },
  {
    id: 'si-oow',
    product_id: 'prod-p1-1',
    start_time: '2026-05-16T13:00:00Z',
    end_time:   '2026-05-16T14:30:00Z',
    status: 'out-of-window',
    is_active: false,
    created_at: '2026-04-01T10:00:00Z',
    coach: 'Coach Marcus',
    taken: 0,
    capacity: 14,
  },
]

// 9 open sessions — triggers pagination (PAGE_SIZE = 8)
const manySessions: SessionInstanceMock[] = Array.from({ length: 9 }, (_, i) => ({
  id: `si-many-${i}`,
  product_id: 'prod-p1-1',
  start_time: new Date(Date.UTC(2026, 4, 1) + i * 7 * 24 * 60 * 60 * 1000).toISOString(),
  end_time:   new Date(Date.UTC(2026, 4, 1, 1, 30) + i * 7 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'open' as const,
  is_active: true,
  created_at: '2026-04-01T10:00:00Z',
  coach: 'Coach Marcus',
  taken: 5,
  capacity: 14,
}))

function renderSessions(
  sessions = baseSessions,
  { programId = 'p1', productId = 'prod-p1-1' }: { programId?: string; productId?: string } = {},
) {
  render(
    <MemoryRouter initialEntries={[`/programs/${programId}/products/${productId}/sessions`]}>
      <Routes>
        <Route
          path="/programs/:id/products/:productId/sessions"
          element={<SessionsPage sessions={sessions} />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SessionsPage', () => {
  it('renders page heading with product name', () => {
    renderSessions()
    expect(screen.getByRole('heading', { name: /saturday bag work/i })).toBeInTheDocument()
  })

  it('renders SimpleProductGate for simple-type products', () => {
    // prod-p1-3 is a 'simple' type (Drop-in Pass)
    renderSessions([], { productId: 'prod-p1-3' })
    expect(screen.getByText(/no sessions to show/i)).toBeInTheDocument()
  })

  it('renders one row per upcoming session instance (excludes past by default)', () => {
    renderSessions()
    // baseSessions: 1 past (hidden) + 3 non-past → 3 rows
    expect(screen.getAllByTestId('session-row')).toHaveLength(3)
  })

  it('hides past rows by default', () => {
    renderSessions()
    // No element with "Past" action text should be in the DOM
    expect(screen.queryByText('Past')).not.toBeInTheDocument()
  })

  it('reveals past rows after toggling "Show past"', async () => {
    const user = userEvent.setup()
    renderSessions()
    await user.click(screen.getByRole('button', { name: /show past/i }))
    expect(screen.getAllByTestId('session-row')).toHaveLength(4)
  })

  it('renders "Reserve →" button for open sessions', () => {
    renderSessions()
    expect(screen.getByRole('button', { name: /reserve/i })).toBeInTheDocument()
  })

  it('renders "Join waitlist" button for full sessions', () => {
    renderSessions()
    expect(screen.getByRole('button', { name: /join waitlist/i })).toBeInTheDocument()
  })

  it('renders "Request booking" button for out-of-window sessions', () => {
    renderSessions()
    expect(screen.getByRole('button', { name: /request booking/i })).toBeInTheDocument()
  })

  it('out-of-window rows show "Outside booking window" tag', () => {
    renderSessions()
    expect(screen.getByText(/outside booking window/i)).toBeInTheDocument()
  })

  it('renders empty state when no sessions exist for product', () => {
    renderSessions([])
    expect(screen.getByText(/no upcoming sessions scheduled/i)).toBeInTheDocument()
  })

  it('pagination is hidden when session count is 8 or fewer', () => {
    renderSessions()
    // baseSessions has 3 non-past rows — no pagination
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
  })

  it('Next button advances to the second page', async () => {
    const user = userEvent.setup()
    renderSessions(manySessions)
    // 9 open sessions → page 1 of 2
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2.2: Run to verify all tests fail**

```bash
cd apps/web && npx vitest run src/__tests__/SessionsPage.test.tsx
```

Expected: all 12 tests FAIL — `Cannot find module '../pages/SessionsPage'`.

- [ ] **Step 2.3: Create `SessionsPage.tsx`**

Create `apps/web/src/pages/SessionsPage.tsx`:

```tsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PROGRAM_DETAILS, SESSION_INSTANCES } from '../data/programs'
import type { SessionInstanceMock } from '../data/programs'
import { TopNav } from '../components/layout/TopNav'
import { Footer } from '../components/layout/Footer'

const PAGE_SIZE = 8
type ViewMode = 'list' | 'week' | 'month'

interface SessionsPageProps {
  sessions?: SessionInstanceMock[]
}

function formatTime(iso: string, tz: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz,
  })
}

function formatDateParts(iso: string, tz: string) {
  const d = new Date(iso)
  return {
    dow: d.toLocaleDateString('en-US', { weekday: 'short', timeZone: tz }),
    day: d.toLocaleDateString('en-US', { day: 'numeric', timeZone: tz }),
    mon: d.toLocaleDateString('en-US', { month: 'short', timeZone: tz }),
    yr:  d.toLocaleDateString('en-US', { year: '2-digit', timeZone: tz }),
  }
}

function SessionRow({ s, isFirst, tz }: { s: SessionInstanceMock; isFirst: boolean; tz: string }) {
  const { dow, day, mon, yr } = formatDateParts(s.start_time, tz)
  const timeRange = `${formatTime(s.start_time, tz)} – ${formatTime(s.end_time, tz)}`
  const durationMin = Math.round(
    (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000,
  )
  const fillPct = Math.min((s.taken / s.capacity) * 100, 100)
  const open = s.capacity - s.taken

  return (
    <div
      data-testid="session-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '72px 1fr auto auto',
        gap: 24,
        padding: '20px 24px',
        borderTop: isFirst ? 'none' : '1px solid var(--rule)',
        alignItems: 'center',
        opacity: s.status === 'past' ? 0.45 : 1,
        background: s.status === 'out-of-window' ? 'var(--accent-soft)' : 'transparent',
      }}
    >
      {/* Date */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 2 }}>
          {dow}
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--ink-1)', lineHeight: 1 }}>
          {day}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 3 }}>
          {mon} '{yr}
        </div>
      </div>

      {/* Time + coach */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-1)', fontFamily: 'var(--font-sans)' }}>
          {timeRange}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, fontFamily: 'var(--font-sans)' }}>
          with {s.coach} · {durationMin} min
        </div>
        {s.status === 'out-of-window' && (
          <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 6, padding: '2px 8px', background: 'var(--accent-soft-stripe)', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent-ink)' }}>
            Outside booking window
          </div>
        )}
      </div>

      {/* Capacity */}
      {s.status !== 'out-of-window' && s.status !== 'past' ? (
        <div style={{ minWidth: 160 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span>{s.taken}/{s.capacity} taken</span>
            <span style={{ color: s.status === 'full' ? 'var(--ink-3)' : 'var(--ink-2)' }}>
              {s.status === 'full' ? 'full' : `${open} open`}
            </span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--paper-3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${fillPct}%`, height: '100%', background: s.status === 'full' ? 'var(--ink-3)' : 'var(--accent)', borderRadius: 2 }} />
          </div>
        </div>
      ) : (
        <div style={{ minWidth: 160 }} />
      )}

      {/* Action */}
      <div style={{ minWidth: 136 }}>
        {s.status === 'open' && (
          <button type="button" style={{ width: '100%', padding: '8px 16px', background: 'var(--ink-1)', color: 'var(--paper-1)', border: 0, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Reserve →
          </button>
        )}
        {s.status === 'full' && (
          <button type="button" style={{ width: '100%', padding: '8px 16px', background: 'transparent', color: 'var(--ink-1)', border: '1px solid var(--ink-1)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Join waitlist
          </button>
        )}
        {s.status === 'out-of-window' && (
          <button type="button" style={{ width: '100%', padding: '8px 16px', background: 'transparent', color: 'var(--accent-ink)', border: '1px solid var(--accent)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Request booking
          </button>
        )}
        {s.status === 'past' && (
          <span style={{ padding: '8px 16px', color: 'var(--ink-3)', fontSize: 13, fontFamily: 'var(--font-sans)', display: 'block' }}>
            Past
          </span>
        )}
      </div>
    </div>
  )
}

export function SessionsPage({ sessions: sessionsProp }: SessionsPageProps) {
  const { id, productId } = useParams<{ id: string; productId: string }>()
  const [showPast, setShowPast] = useState(false)
  const [page, setPage] = useState(0)
  const [view, setView] = useState<ViewMode>('list')

  const program = id ? PROGRAM_DETAILS[id] : undefined
  const product = program?.products.find((p) => p.id === productId)

  if (!id || !program || !productId || !product) {
    return (
      <div style={{ background: 'var(--paper-1)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-2)', fontSize: 16, fontFamily: 'var(--font-sans)' }}>
          Product not found.
        </p>
      </div>
    )
  }

  if (product.type === 'simple') {
    return (
      <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
        <TopNav loggedIn={true} />
        <div style={{ padding: '20px 64px', fontSize: 13, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-sans)' }}>
          <Link to="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Discover</Link>
          <span>→</span>
          <Link to={`/programs/${id}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{program.name}</Link>
          <span>→</span>
          <Link to={`/programs/${id}/products/${productId}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{product.name}</Link>
          <span>→</span>
          <span style={{ color: 'var(--ink-1)' }}>Sessions</span>
        </div>
        <div style={{ padding: '120px 64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            Simple product
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 44, letterSpacing: '-0.02em', color: 'var(--ink-1)', margin: 0 }}>
            No sessions to show.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', maxWidth: 420, lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: 'var(--ink-1)' }}>{product.name}</strong> is a simple product — redeem it directly from your wallet.
          </p>
          <Link to={`/programs/${id}/products/${productId}`} style={{ marginTop: 8, padding: '10px 20px', background: 'var(--ink-1)', color: 'var(--paper-1)', borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', textDecoration: 'none' }}>
            ← Back to product
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const allSessions = sessionsProp ?? SESSION_INSTANCES[productId] ?? []
  const upcomingCount = allSessions.filter((s) => s.status !== 'past').length
  const filtered = showPast ? allSessions : allSessions.filter((s) => s.status !== 'past')
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  const handleShowPastToggle = () => { setShowPast((v) => !v); setPage(0) }
  const handleViewChange = (v: ViewMode) => { setView(v); setPage(0) }

  return (
    <div style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', minHeight: '100vh' }}>
      <TopNav loggedIn={true} />

      {/* Breadcrumb */}
      <div style={{ padding: '20px 64px', fontSize: 13, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-sans)' }}>
        <Link to="/" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Discover</Link>
        <span>→</span>
        <Link to={`/programs/${id}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{program.name}</Link>
        <span>→</span>
        <Link to={`/programs/${id}/products/${productId}`} style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>{product.name}</Link>
        <span>→</span>
        <span style={{ color: 'var(--ink-1)' }}>Sessions</span>
      </div>

      {/* Product header */}
      <div style={{ padding: '0 64px 40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ padding: '4px 10px', background: 'var(--accent-soft)', color: 'var(--accent-ink)', borderRadius: 999, fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
              Session product
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
              {program.name}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 52, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--ink-1)', margin: '0 0 14px' }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', margin: 0, maxWidth: 560, lineHeight: 1.6 }}>
            {product.description}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, flexShrink: 0 }}>
          <Link to={`/programs/${id}/products/${productId}`} style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', textDecoration: 'none' }}>
            ← Back to product
          </Link>
          <div style={{ display: 'flex', gap: 24 }}>
            {product.capacity != null && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>Capacity</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink-1)', lineHeight: 1 }}>{product.capacity}</div>
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>Upcoming</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink-1)', lineHeight: 1 }}>{upcomingCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule section */}
      <section style={{ padding: '32px 64px 72px', background: 'var(--paper-2)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
              §03 · Schedule
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 44, letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1 }}>
              Full <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>schedule.</em>
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)' }}>
              Times shown in{' '}
              <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>{program.timezone}</span>{' '}
              (program timezone)
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={handleShowPastToggle}
              style={{ padding: '7px 14px', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500, border: '1px solid var(--rule-2)', background: showPast ? 'var(--paper-3)' : 'transparent', color: showPast ? 'var(--ink-1)' : 'var(--ink-2)', borderRadius: 8, cursor: 'pointer' }}
            >
              {showPast ? '↑ Hide past' : '↓ Show past'}
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['week', 'month', 'list'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleViewChange(v)}
                  style={{ padding: '7px 14px', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500, border: view === v ? '1px solid var(--ink-1)' : '1px solid var(--rule-2)', background: view === v ? 'var(--ink-1)' : 'transparent', color: view === v ? 'var(--paper-1)' : 'var(--ink-2)', borderRadius: 8, cursor: 'pointer' }}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar placeholder */}
        {view !== 'list' && (
          <div style={{ background: 'var(--paper-1)', border: '1px solid var(--rule)', borderRadius: 14, padding: '80px 40px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', margin: 0 }}>
              Calendar view coming soon.{' '}
              <button
                type="button"
                onClick={() => setView('list')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)', fontWeight: 500 }}
              >
                Switch to List view →
              </button>
            </p>
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <>
            {filtered.length === 0 ? (
              <div style={{ background: 'var(--paper-1)', border: '1px solid var(--rule)', borderRadius: 14, padding: '60px 40px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', fontFamily: 'var(--font-sans)', margin: 0 }}>
                  No upcoming sessions scheduled.
                </p>
              </div>
            ) : (
              <div style={{ background: 'var(--paper-1)', border: '1px solid var(--rule)', borderRadius: 14, overflow: 'hidden' }}>
                {paginated.map((s, i) => (
                  <SessionRow key={s.id} s={s} isFirst={i === 0} tz={program.timezone} />
                ))}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid var(--rule)', fontFamily: 'var(--font-sans)' }}>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, border: '1px solid var(--rule-2)', background: 'transparent', color: currentPage === 0 ? 'var(--ink-3)' : 'var(--ink-1)', borderRadius: 8, cursor: currentPage === 0 ? 'default' : 'pointer', opacity: currentPage === 0 ? 0.45 : 1 }}
                    >
                      ← Previous
                    </button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                      style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, border: '1px solid var(--rule-2)', background: 'transparent', color: currentPage >= totalPages - 1 ? 'var(--ink-3)' : 'var(--ink-1)', borderRadius: 8, cursor: currentPage >= totalPages - 1 ? 'default' : 'pointer', opacity: currentPage >= totalPages - 1 ? 0.45 : 1 }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Legend */}
            <div style={{ marginTop: 20, display: 'flex', gap: 24, fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' }}>
              <span>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', marginRight: 5 }} />
                Open — reserve a spot
              </span>
              <span>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--ink-3)', marginRight: 5 }} />
                Full — join waitlist for manager approval
              </span>
              <span>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--accent-soft-stripe)', marginRight: 5 }} />
                Outside booking window — request approval
              </span>
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 2.4: Run to verify all 12 tests pass**

```bash
cd apps/web && npx vitest run src/__tests__/SessionsPage.test.tsx
```

Expected: all 12 tests PASS.

- [ ] **Step 2.5: Run the full test suite to verify no regressions**

```bash
cd apps/web && npm test
```

Expected: all existing tests still pass.

- [ ] **Step 2.6: Commit**

```bash
git add apps/web/src/pages/SessionsPage.tsx apps/web/src/__tests__/SessionsPage.test.tsx
git commit -m "feat: add SessionsPage with schedule list, status states, and pagination"
```

---

## Task 3: Wire routing and mark PAGES.md done

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/__tests__/routing.test.tsx`
- Modify: `PAGES.md`

- [ ] **Step 3.1: Write the failing routing test**

Add to the `describe('routing', ...)` block in `apps/web/src/__tests__/routing.test.tsx`:

```tsx
  it('renders SessionsPage at /programs/p1/products/prod-p1-1/sessions', () => {
    render(
      <MemoryRouter initialEntries={['/programs/p1/products/prod-p1-1/sessions']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /saturday bag work/i })).toBeInTheDocument()
  })
```

- [ ] **Step 3.2: Run to verify it fails**

```bash
cd apps/web && npx vitest run src/__tests__/routing.test.tsx
```

Expected: FAIL — route not found, heading not in document.

- [ ] **Step 3.3: Wire the route in `App.tsx`**

In `apps/web/src/App.tsx`, add the import after the `WalletPage` import:

```tsx
import { SessionsPage } from './pages/SessionsPage'
```

Add the route after the `/wallet` route inside `<Routes>`:

```tsx
<Route path="/programs/:id/products/:productId/sessions" element={<SessionsPage />} />
```

- [ ] **Step 3.4: Run the routing test to verify it passes**

```bash
cd apps/web && npx vitest run src/__tests__/routing.test.tsx
```

Expected: all routing tests pass including the new one.

- [ ] **Step 3.5: Run the full test suite**

```bash
cd apps/web && npm test
```

Expected: all tests pass.

- [ ] **Step 3.6: Mark SessionsPage done in `PAGES.md`**

In `PAGES.md`, change:

```markdown
- [ ] **SessionsPage** — `/programs/:id/products/:productId/sessions`
```

to:

```markdown
- [x] **SessionsPage** — `/programs/:id/products/:productId/sessions`
```

- [ ] **Step 3.7: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/__tests__/routing.test.tsx PAGES.md
git commit -m "feat: wire SessionsPage route and mark done in PAGES.md"
```
