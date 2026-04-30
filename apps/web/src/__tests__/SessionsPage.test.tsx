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
    // matches both the row tag and the legend — both should be present
    expect(screen.getAllByText(/outside booking window/i).length).toBeGreaterThanOrEqual(1)
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
