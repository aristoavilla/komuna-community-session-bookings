# BookingsPage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `/my/bookings` — a member-facing page showing active (upcoming) and past (completed/cancelled) session bookings with an inline cancel flow.

**Architecture:** `BookingsPage` manages tab state and a `cancelledIds` set (optimistic cancel); `BookingCard` handles per-card confirming state; `CancelConfirmStrip` is a pure presentational component. Mock data lives in `programs.ts`. All components follow the existing WalletPage design system (inline styles, CSS variables).

**Tech Stack:** React 18, TypeScript, React Router v6, Vitest + @testing-library/react, inline styles with CSS custom properties.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `apps/web/src/data/programs.ts` | Add `CustomFieldAnswerMock`, `VoucherClaimMock` types + `BOOKINGS` export |
| Create | `apps/web/src/__tests__/BookingsPage.test.tsx` | All BookingsPage tests |
| Create | `apps/web/src/pages/bookings/CancelConfirmStrip.tsx` | Inline cancel confirmation UI (pure/presentational) |
| Create | `apps/web/src/pages/bookings/BookingCard.tsx` | Single booking card (active or past mode) |
| Create | `apps/web/src/pages/BookingsPage.tsx` | Page shell: tab state, cancel state, list filtering |
| Modify | `apps/web/src/App.tsx` | Add `/my/bookings` route |

---

### Task 1: Add mock data types and `BOOKINGS` to `programs.ts`

**Files:**
- Modify: `apps/web/src/data/programs.ts` (append to end of file)

- [ ] **Step 1: Append `CustomFieldAnswerMock` and `VoucherClaimMock` types**

Add after the last export in `apps/web/src/data/programs.ts`:

```typescript
// ─── Bookings mock data ──────────────────────────────────────────────────────

export type CustomFieldAnswerMock = {
  // ERD: CUSTOM_FIELD_ANSWER fields
  id: string
  claim_id: string
  value: string

  // UI-only
  field_name: string
  field_required: boolean
}

export type VoucherClaimMock = {
  // ERD: VOUCHER_CLAIM fields
  id: string
  voucher_id: string
  session_id: string
  claimed_at: string            // ISO-8601
  alias: string | null
  attendance_status: 'pending' | 'attended' | 'no-show'
  grievance_status: 'none' | 'pending' | 'resolved'
  cancelled_at: string | null   // ISO-8601

  // UI-only
  product_id: string
  product_name: string
  program_id: string
  program_name: string
  session_start_time: string    // ISO-8601
  session_end_time: string      // ISO-8601
  coach: string
  session_capacity: number
  session_taken: number
  custom_field_answers: CustomFieldAnswerMock[]
  compensation_voucher_expires_at: string | null
}

// TODAY = 2026-04-30. Sessions dated after 2026-04-30 are upcoming (active).
export const BOOKINGS: VoucherClaimMock[] = [
  // Active 1 — Saturday Bag Work, future session, no custom fields
  {
    id: 'bc-1',
    voucher_id: 'v1',
    session_id: 'si-p1-1-1',
    claimed_at: '2026-04-28T10:00:00Z',
    alias: null,
    attendance_status: 'pending',
    grievance_status: 'none',
    cancelled_at: null,
    product_id: 'prod-p1-1',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
    session_start_time: '2026-05-02T13:00:00Z',
    session_end_time: '2026-05-02T14:30:00Z',
    coach: 'Coach Marcus',
    session_capacity: 14,
    session_taken: 5,
    custom_field_answers: [],
    compensation_voucher_expires_at: null,
  },
  // Active 2 — Morning Vinyasa, future session, with a custom field answer
  {
    id: 'bc-2',
    voucher_id: 'v8',
    session_id: 'si-p2-1-1',
    claimed_at: '2026-04-29T08:30:00Z',
    alias: null,
    attendance_status: 'pending',
    grievance_status: 'none',
    cancelled_at: null,
    product_id: 'prod-p2-1',
    product_name: 'Morning Vinyasa',
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
    session_start_time: '2026-05-05T07:00:00Z',
    session_end_time: '2026-05-05T08:00:00Z',
    coach: 'Ines',
    session_capacity: 12,
    session_taken: 4,
    custom_field_answers: [
      {
        id: 'cfa-1',
        claim_id: 'bc-2',
        value: 'No injuries',
        field_name: 'Any injuries we should know about?',
        field_required: false,
      },
    ],
    compensation_voucher_expires_at: null,
  },
  // Active 3 — Barbell Fundamentals, future session, no custom fields
  {
    id: 'bc-3',
    voucher_id: 'v3',
    session_id: 'si-p3-1-2',
    claimed_at: '2026-04-28T15:00:00Z',
    alias: null,
    attendance_status: 'pending',
    grievance_status: 'none',
    cancelled_at: null,
    product_id: 'prod-p3-1',
    product_name: 'Barbell Fundamentals',
    program_id: 'p3',
    program_name: 'Strong Together',
    session_start_time: '2026-05-07T17:00:00Z',
    session_end_time: '2026-05-07T18:30:00Z',
    coach: 'Coach Stefan',
    session_capacity: 18,
    session_taken: 11,
    custom_field_answers: [],
    compensation_voucher_expires_at: null,
  },
  // Past — completed (attended, session already passed)
  {
    id: 'bc-4',
    voucher_id: 'v4',
    session_id: 'si-p1-1-past-1',
    claimed_at: '2026-04-20T10:00:00Z',
    alias: null,
    attendance_status: 'attended',
    grievance_status: 'none',
    cancelled_at: null,
    product_id: 'prod-p1-1',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
    session_start_time: '2026-04-23T13:00:00Z',
    session_end_time: '2026-04-23T14:30:00Z',
    coach: 'Coach Marcus',
    session_capacity: 14,
    session_taken: 14,
    custom_field_answers: [],
    compensation_voucher_expires_at: null,
  },
  // Past — cancelled, with compensation voucher
  {
    id: 'bc-5',
    voucher_id: 'v9',
    session_id: 'si-p2-1-past',
    claimed_at: '2026-04-15T08:00:00Z',
    alias: null,
    attendance_status: 'pending',
    grievance_status: 'none',
    cancelled_at: '2026-04-17T10:00:00Z',
    product_id: 'prod-p2-1',
    product_name: 'Morning Vinyasa',
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
    session_start_time: '2026-04-20T07:00:00Z',
    session_end_time: '2026-04-20T08:00:00Z',
    coach: 'Ines',
    session_capacity: 12,
    session_taken: 7,
    custom_field_answers: [],
    compensation_voucher_expires_at: '2026-06-17T00:00:00Z',
  },
]
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/data/programs.ts
git commit -m "feat: add VoucherClaimMock types and BOOKINGS mock data"
```

---

### Task 2: Write failing tests for BookingsPage

**Files:**
- Create: `apps/web/src/__tests__/BookingsPage.test.tsx`

- [ ] **Step 1: Create the test file**

Create `apps/web/src/__tests__/BookingsPage.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { BookingsPage } from '../pages/BookingsPage'
import type { VoucherClaimMock } from '../data/programs'

const now = new Date('2026-04-30T00:00:00Z')

const activeBooking: VoucherClaimMock = {
  id: 'bc-1',
  voucher_id: 'v1',
  session_id: 'si-1',
  claimed_at: '2026-04-28T10:00:00Z',
  alias: null,
  attendance_status: 'pending',
  grievance_status: 'none',
  cancelled_at: null,
  product_id: 'prod-p1-1',
  product_name: 'Saturday Bag Work',
  program_id: 'p1',
  program_name: 'Eastside Boxing Club',
  session_start_time: '2026-05-02T13:00:00Z',
  session_end_time: '2026-05-02T14:30:00Z',
  coach: 'Coach Marcus',
  session_capacity: 14,
  session_taken: 5,
  custom_field_answers: [],
  compensation_voucher_expires_at: null,
}

const activeBookingWithAnswers: VoucherClaimMock = {
  id: 'bc-2',
  voucher_id: 'v8',
  session_id: 'si-2',
  claimed_at: '2026-04-29T08:00:00Z',
  alias: null,
  attendance_status: 'pending',
  grievance_status: 'none',
  cancelled_at: null,
  product_id: 'prod-p2-1',
  product_name: 'Morning Vinyasa',
  program_id: 'p2',
  program_name: 'Slow Flow with Ines',
  session_start_time: '2026-05-05T07:00:00Z',
  session_end_time: '2026-05-05T08:00:00Z',
  coach: 'Ines',
  session_capacity: 12,
  session_taken: 4,
  custom_field_answers: [
    {
      id: 'cfa-1',
      claim_id: 'bc-2',
      value: 'No injuries',
      field_name: 'Any injuries we should know about?',
      field_required: false,
    },
  ],
  compensation_voucher_expires_at: null,
}

const completedBooking: VoucherClaimMock = {
  id: 'bc-4',
  voucher_id: 'v4',
  session_id: 'si-past',
  claimed_at: '2026-04-20T10:00:00Z',
  alias: null,
  attendance_status: 'attended',
  grievance_status: 'none',
  cancelled_at: null,
  product_id: 'prod-p1-1',
  product_name: 'Saturday Bag Work',
  program_id: 'p1',
  program_name: 'Eastside Boxing Club',
  session_start_time: '2026-04-23T13:00:00Z',
  session_end_time: '2026-04-23T14:30:00Z',
  coach: 'Coach Marcus',
  session_capacity: 14,
  session_taken: 14,
  custom_field_answers: [],
  compensation_voucher_expires_at: null,
}

const cancelledBooking: VoucherClaimMock = {
  id: 'bc-5',
  voucher_id: 'v9',
  session_id: 'si-cancelled',
  claimed_at: '2026-04-15T08:00:00Z',
  alias: null,
  attendance_status: 'pending',
  grievance_status: 'none',
  cancelled_at: '2026-04-17T10:00:00Z',
  product_id: 'prod-p2-1',
  product_name: 'Morning Vinyasa',
  program_id: 'p2',
  program_name: 'Slow Flow with Ines',
  session_start_time: '2026-04-20T07:00:00Z',
  session_end_time: '2026-04-20T08:00:00Z',
  coach: 'Ines',
  session_capacity: 12,
  session_taken: 7,
  custom_field_answers: [],
  compensation_voucher_expires_at: '2026-06-17T00:00:00Z',
}

function renderBookings(
  bookings: VoucherClaimMock[] = [activeBooking, completedBooking, cancelledBooking],
) {
  return render(
    <MemoryRouter>
      <BookingsPage bookings={bookings} now={now} />
    </MemoryRouter>,
  )
}

describe('BookingsPage', () => {
  it('renders page heading "My bookings"', () => {
    renderBookings()
    expect(screen.getByRole('heading', { name: /my bookings/i })).toBeInTheDocument()
  })

  it('shows Active tab by default', () => {
    renderBookings()
    expect(screen.getByTestId('booking-card-bc-1')).toBeInTheDocument()
  })

  it('Active tab shows only non-cancelled upcoming bookings', () => {
    renderBookings()
    expect(screen.getByTestId('booking-card-bc-1')).toBeInTheDocument()
    expect(screen.queryByTestId('booking-card-bc-4')).not.toBeInTheDocument()
    expect(screen.queryByTestId('booking-card-bc-5')).not.toBeInTheDocument()
  })

  it('Past tab shows completed and cancelled bookings', async () => {
    const user = userEvent.setup()
    renderBookings()

    await user.click(screen.getByRole('button', { name: /^past$/i }))

    expect(screen.getByTestId('booking-card-bc-4')).toBeInTheDocument()
    expect(screen.getByTestId('booking-card-bc-5')).toBeInTheDocument()
    expect(screen.queryByTestId('booking-card-bc-1')).not.toBeInTheDocument()
  })

  it('shows "completed" badge on past attended bookings', async () => {
    const user = userEvent.setup()
    renderBookings()
    await user.click(screen.getByRole('button', { name: /^past$/i }))

    const card = screen.getByTestId('booking-card-bc-4')
    expect(within(card).getByTestId('status-badge')).toHaveTextContent(/completed/i)
  })

  it('shows "cancelled" badge on cancelled bookings in Past tab', async () => {
    const user = userEvent.setup()
    renderBookings()
    await user.click(screen.getByRole('button', { name: /^past$/i }))

    const card = screen.getByTestId('booking-card-bc-5')
    expect(within(card).getByTestId('status-badge')).toHaveTextContent(/cancelled/i)
  })

  it('shows compensation voucher expiry for cancelled bookings', async () => {
    const user = userEvent.setup()
    renderBookings()
    await user.click(screen.getByRole('button', { name: /^past$/i }))

    const card = screen.getByTestId('booking-card-bc-5')
    expect(within(card).getByTestId('compensation-ref')).toHaveTextContent(/17 Jun 2026/i)
  })

  it('shows Cancel button on active bookings', () => {
    renderBookings()
    const card = screen.getByTestId('booking-card-bc-1')
    expect(within(card).getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  it('shows cancel confirmation strip when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderBookings()

    const card = screen.getByTestId('booking-card-bc-1')
    await user.click(within(card).getByRole('button', { name: /^cancel$/i }))

    expect(within(card).getByTestId('cancel-confirm-strip')).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: /confirm cancel/i })).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: /keep booking/i })).toBeInTheDocument()
  })

  it('dismisses cancel strip when "Keep booking" is clicked', async () => {
    const user = userEvent.setup()
    renderBookings()

    const card = screen.getByTestId('booking-card-bc-1')
    await user.click(within(card).getByRole('button', { name: /^cancel$/i }))
    await user.click(within(card).getByRole('button', { name: /keep booking/i }))

    expect(within(card).queryByTestId('cancel-confirm-strip')).not.toBeInTheDocument()
  })

  it('moves booking to Past tab after confirming cancel', async () => {
    const user = userEvent.setup()
    renderBookings()

    const card = screen.getByTestId('booking-card-bc-1')
    await user.click(within(card).getByRole('button', { name: /^cancel$/i }))
    await user.click(within(card).getByRole('button', { name: /confirm cancel/i }))

    expect(screen.queryByTestId('booking-card-bc-1')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^past$/i }))
    expect(screen.getByTestId('booking-card-bc-1')).toBeInTheDocument()
  })

  it('renders custom field answers when present', () => {
    renderBookings([activeBookingWithAnswers])

    const card = screen.getByTestId('booking-card-bc-2')
    expect(within(card).getByTestId('custom-field-answers')).toBeInTheDocument()
    expect(within(card).getByText('No injuries')).toBeInTheDocument()
  })

  it('renders active empty state with Browse programs link', () => {
    renderBookings([completedBooking])

    expect(screen.getByText(/no upcoming bookings/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse programs/i })).toHaveAttribute('href', '/')
  })

  it('renders past empty state without Browse programs link', async () => {
    const user = userEvent.setup()
    renderBookings([activeBooking])

    await user.click(screen.getByRole('button', { name: /^past$/i }))

    expect(screen.getByText(/no past bookings yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /browse programs/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — verify they all fail with import error**

```bash
cd apps/web && npx vitest run --reporter=verbose src/__tests__/BookingsPage.test.tsx
```

Expected: all tests FAIL with `Cannot find module '../pages/BookingsPage'`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/__tests__/BookingsPage.test.tsx
git commit -m "test: add failing BookingsPage tests"
```

---

### Task 3: Create `CancelConfirmStrip`

**Files:**
- Create: `apps/web/src/pages/bookings/CancelConfirmStrip.tsx`

- [ ] **Step 1: Create directory and file**

Create `apps/web/src/pages/bookings/CancelConfirmStrip.tsx`:

```tsx
type CancelConfirmStripProps = {
  productName: string
  onConfirm: () => void
  onDismiss: () => void
}

export function CancelConfirmStrip({ productName, onConfirm, onDismiss }: CancelConfirmStripProps) {
  return (
    <div
      data-testid="cancel-confirm-strip"
      style={{
        marginTop: 16,
        padding: 16,
        borderTop: '1px solid var(--rule)',
        background: 'var(--paper-3)',
        borderRadius: '0 0 6px 6px',
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          color: 'var(--ink-2)',
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        Cancel your booking for <strong>{productName}</strong>? A compensation voucher will be
        issued automatically.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            background: 'var(--accent)',
            color: 'var(--paper-1)',
            border: 0,
            fontSize: 13,
            fontFamily: 'var(--font-sans, sans-serif)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Confirm cancel
        </button>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            background: 'transparent',
            color: 'var(--ink-2)',
            border: '1px solid var(--rule)',
            fontSize: 13,
            fontFamily: 'var(--font-sans, sans-serif)',
            cursor: 'pointer',
          }}
        >
          Keep booking
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

---

### Task 4: Create `BookingCard`

**Files:**
- Create: `apps/web/src/pages/bookings/BookingCard.tsx`

- [ ] **Step 1: Create the file**

Create `apps/web/src/pages/bookings/BookingCard.tsx`:

```tsx
import { useState } from 'react'
import type { VoucherClaimMock } from '../../data/programs'
import { CancelConfirmStrip } from './CancelConfirmStrip'

type BookingCardProps = {
  booking: VoucherClaimMock
  mode: 'active' | 'past'
  onCancel?: (id: string) => void
}

const statusBadgeStyles: Record<'completed' | 'cancelled', React.CSSProperties> = {
  completed: {
    background: 'oklch(0.78 0.12 150 / 15%)',
    color: 'var(--ok)',
  },
  cancelled: {
    background: 'var(--paper-3)',
    color: 'var(--ink-3)',
  },
}

function formatDateTime(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const date = s.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const startTime = s.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const endTime = e.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${startTime}–${endTime}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function BookingCard({ booking, mode, onCancel }: BookingCardProps) {
  const [confirming, setConfirming] = useState(false)

  const isCancelled = booking.cancelled_at !== null
  const statusBadge: 'completed' | 'cancelled' | null =
    mode === 'past' ? (isCancelled ? 'cancelled' : 'completed') : null

  return (
    <section
      data-testid={`booking-card-${booking.id}`}
      style={{
        padding: 24,
        border: '1px solid var(--rule)',
        borderRadius: 8,
        background: 'var(--paper-1)',
        opacity: mode === 'past' && isCancelled ? 0.7 : 1,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        <div>
          <h2
            style={{
              margin: '0 0 4px',
              color: 'var(--ink-1)',
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            {booking.product_name}
          </h2>
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{booking.program_name}</div>
        </div>

        {statusBadge && (
          <span
            data-testid="status-badge"
            style={{
              ...statusBadgeStyles[statusBadge],
              borderRadius: 99,
              padding: '2px 10px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 12,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {statusBadge}
          </span>
        )}

        {mode === 'active' && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            style={{
              padding: '4px 12px',
              border: '1px solid var(--rule)',
              borderRadius: 999,
              background: 'transparent',
              color: 'var(--ink-2)',
              fontSize: 13,
              fontFamily: 'var(--font-sans, sans-serif)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, margin: '16px 0 12px', background: 'var(--rule)' }} />

      {/* Session details row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ color: 'var(--ink-1)', fontSize: 14 }}>
          {formatDateTime(booking.session_start_time, booking.session_end_time)}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 4 }}>{booking.coach}</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
            {booking.session_taken} / {booking.session_capacity} booked
          </div>
        </div>
      </div>

      {/* Custom field answers */}
      {booking.custom_field_answers.length > 0 && (
        <div
          data-testid="custom-field-answers"
          style={{
            marginTop: 12,
            padding: 12,
            background: 'var(--paper-2)',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {booking.custom_field_answers.map((answer) => (
            <div key={answer.id} style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--ink-3)' }}>{answer.field_name}: </span>
              <span style={{ color: 'var(--ink-1)' }}>{answer.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Compensation voucher reference */}
      {booking.compensation_voucher_expires_at && (
        <div
          data-testid="compensation-ref"
          style={{
            marginTop: 10,
            color: 'var(--ink-3)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 12,
            letterSpacing: '0.04em',
          }}
        >
          Compensation voucher: expires {formatDate(booking.compensation_voucher_expires_at)}
        </div>
      )}

      {/* Inline cancel confirmation */}
      {confirming && (
        <CancelConfirmStrip
          productName={booking.product_name}
          onConfirm={() => {
            setConfirming(false)
            onCancel?.(booking.id)
          }}
          onDismiss={() => setConfirming(false)}
        />
      )}
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

---

### Task 5: Create `BookingsPage`

**Files:**
- Create: `apps/web/src/pages/BookingsPage.tsx`

- [ ] **Step 1: Create the file**

Create `apps/web/src/pages/BookingsPage.tsx`:

```tsx
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'
import { TopNav } from '../components/layout/TopNav'
import { BOOKINGS } from '../data/programs'
import type { VoucherClaimMock } from '../data/programs'
import { BookingCard } from './bookings/BookingCard'

type Tab = 'active' | 'past'

type BookingsPageProps = {
  bookings?: VoucherClaimMock[]
  now?: Date
}

export function BookingsPage({ bookings = BOOKINGS, now = new Date() }: BookingsPageProps) {
  const [tab, setTab] = useState<Tab>('active')
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set())

  const { activeBookings, pastBookings } = useMemo(() => {
    const active: VoucherClaimMock[] = []
    const past: VoucherClaimMock[] = []

    for (const b of bookings) {
      const isCancelledLocally = cancelledIds.has(b.id)
      const isSessionPast = new Date(b.session_start_time) <= now
      const isCancelled = b.cancelled_at !== null || isCancelledLocally

      if (!isCancelled && !isSessionPast) {
        active.push(b)
      } else {
        past.push(b)
      }
    }

    return { activeBookings: active, pastBookings: past }
  }, [bookings, now, cancelledIds])

  function handleCancel(id: string) {
    setCancelledIds((prev) => new Set([...prev, id]))
  }

  function tabStyle(t: Tab): React.CSSProperties {
    return {
      padding: '8px 0',
      border: 0,
      background: 'transparent',
      color: tab === t ? 'var(--ink-1)' : 'var(--ink-3)',
      fontFamily: 'var(--font-sans, sans-serif)',
      fontSize: 14,
      fontWeight: tab === t ? 500 : 400,
      borderBottom: tab === t ? '2px solid var(--ink-1)' : '2px solid transparent',
      cursor: 'pointer',
    }
  }

  const currentList = tab === 'active' ? activeBookings : pastBookings
  const emptyText = tab === 'active' ? 'No upcoming bookings.' : 'No past bookings yet.'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-1)', color: 'var(--ink-1)' }}>
      <TopNav loggedIn={true} />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 72px' }}>
        <header style={{ marginBottom: 40 }}>
          <div
            style={{
              marginBottom: 8,
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            §06 · My bookings
          </div>
          <h1
            style={{
              margin: 0,
              color: 'var(--ink-1)',
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 36,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            My bookings
          </h1>
        </header>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginBottom: 32,
            borderBottom: '1px solid var(--rule)',
          }}
        >
          <button type="button" style={tabStyle('active')} onClick={() => setTab('active')}>
            Active
          </button>
          <button type="button" style={tabStyle('past')} onClick={() => setTab('past')}>
            Past
          </button>
        </div>

        {/* Content */}
        {currentList.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ margin: '0 0 16px', color: 'var(--ink-2)', fontSize: 16 }}>{emptyText}</p>
            {tab === 'active' && (
              <Link
                to="/"
                style={{ color: 'var(--accent)', fontSize: 14, textDecoration: 'none' }}
              >
                Browse programs →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {currentList.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                mode={tab}
                onCancel={tab === 'active' ? handleCancel : undefined}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Run tests — verify they pass**

```bash
cd apps/web && npx vitest run --reporter=verbose src/__tests__/BookingsPage.test.tsx
```

Expected: all 13 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/bookings/CancelConfirmStrip.tsx apps/web/src/pages/bookings/BookingCard.tsx apps/web/src/pages/BookingsPage.tsx
git commit -m "feat: implement BookingsPage with active/past tabs and cancel flow"
```

---

### Task 6: Wire route and mark page done

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `PAGES.md`

- [ ] **Step 1: Add route to `App.tsx`**

In `apps/web/src/App.tsx`, add the import and route:

```tsx
import { Routes, Route } from 'react-router-dom'
import { DiscoveryPage } from './pages/DiscoveryPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { WalletPage } from './pages/WalletPage'
import { BookingsPage } from './pages/BookingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DiscoveryPage />} />
      <Route path="/programs/:id" element={<ProgramDetailPage />} />
      <Route path="/programs/:id/products/:productId" element={<ProductDetailPage />} />
      <Route path="/programs/:id/packages/:packageId/checkout" element={<CheckoutPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/my/bookings" element={<BookingsPage />} />
    </Routes>
  )
}
```

- [ ] **Step 2: Run the full test suite to confirm no regressions**

```bash
cd apps/web && npx vitest run --reporter=verbose
```

Expected: all tests PASS (existing + new BookingsPage tests).

- [ ] **Step 3: Mark `BookingsPage` done in `PAGES.md`**

In `PAGES.md`, change:

```
- [ ] **BookingsPage** — `/my/bookings` — ...
```

to:

```
- [x] **BookingsPage** — `/my/bookings` — ...
```

- [ ] **Step 4: Final commit**

```bash
git add apps/web/src/App.tsx PAGES.md
git commit -m "feat: wire BookingsPage route at /my/bookings"
```
