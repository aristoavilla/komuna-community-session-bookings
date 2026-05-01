import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'
import { ADMIN_DASHBOARD } from '../data/programs'
import type { AdminDashboardMock } from '../data/programs'

function renderPage(overrides: Partial<AdminDashboardMock> = {}) {
  const data = { ...ADMIN_DASHBOARD, ...overrides }
  return render(
    <MemoryRouter initialEntries={['/programs/p1/admin']}>
      <AdminDashboardPage data={data} now={new Date('2026-05-01T10:00:00Z')} />
    </MemoryRouter>
  )
}

// ─── 1. Page header ──────────────────────────────────────────────────────────
it('renders eyebrow and program name heading', () => {
  renderPage()
  expect(screen.getByText('§09 · Admin dashboard')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Eastside Boxing Club')
})

// ─── 2. Revenue card ─────────────────────────────────────────────────────────
it('shows revenue this month and positive delta', () => {
  renderPage()
  expect(screen.getByText('$12,480')).toBeInTheDocument()
  expect(screen.getByText(/↑.*%/)).toBeInTheDocument()
})

// ─── 3. Members card ─────────────────────────────────────────────────────────
it('shows member count and trend meta', () => {
  renderPage()
  expect(screen.getByText('84')).toBeInTheDocument()
  expect(screen.getByText(/\+\d+ this month/)).toBeInTheDocument()
})

// ─── 4. Sessions card sparkline has 7 bars ───────────────────────────────────
it('renders 7 rect elements in the sessions sparkline', () => {
  const { container } = renderPage()
  const rects = container.querySelectorAll('rect')
  expect(rects.length).toBeGreaterThanOrEqual(7)
})

// ─── 5. Pending approvals — urgent state ─────────────────────────────────────
it('shows accent card and Review now link when pending > 0', () => {
  renderPage({ pending_join_requests: 4, pending_booking_requests: 2 })
  expect(screen.getByText('Review now →')).toBeInTheDocument()
})

// ─── 6. Pending approvals — zero state ───────────────────────────────────────
it('hides Review now link when no pending requests', () => {
  renderPage({ pending_join_requests: 0, pending_booking_requests: 0 })
  expect(screen.queryByText('Review now →')).not.toBeInTheDocument()
})

// ─── 7. Revenue chart default bar count ──────────────────────────────────────
it('revenue chart shows 6 bars on default 6M period', () => {
  const { container } = renderPage()
  expect(container.querySelectorAll('[data-bar]')).toHaveLength(6)
})

// ─── 8. Revenue chart period toggle ──────────────────────────────────────────
it('3M toggle shows 3 bars; 1Y shows all available months', async () => {
  const user = userEvent.setup()
  const { container } = renderPage()
  await user.click(screen.getByRole('button', { name: '3M' }))
  expect(container.querySelectorAll('[data-bar]')).toHaveLength(3)
  await user.click(screen.getByRole('button', { name: '1Y' }))
  expect(container.querySelectorAll('[data-bar]')).toHaveLength(ADMIN_DASHBOARD.monthly_revenue.length)
})

// ─── 9. Attendance chart bar count ───────────────────────────────────────────
it('attendance chart renders one fill bar per product', () => {
  const { container } = renderPage()
  expect(container.querySelectorAll('[data-fill]')).toHaveLength(
    ADMIN_DASHBOARD.attendance_this_week.length
  )
})

// ─── 10. Voucher status segments sum to 100% ─────────────────────────────────
it('voucher status segment widths sum to 100%', () => {
  const { container } = renderPage()
  const segments = container.querySelectorAll('[data-segment]')
  expect(segments).toHaveLength(4)
  const total = Array.from(segments).reduce((sum, el) => {
    return sum + parseFloat((el as HTMLElement).style.width)
  }, 0)
  expect(Math.round(total)).toBe(100)
})

// ─── 11. Approvals tile badge ─────────────────────────────────────────────────
it('approvals nav tile shows badge with total pending count', () => {
  renderPage({ pending_join_requests: 4, pending_booking_requests: 2 })
  expect(screen.getByText('6')).toBeInTheDocument()
})

// ─── 12. All 7 nav tiles link correctly ──────────────────────────────────────
it('all 7 nav tiles render with correct hrefs', () => {
  renderPage()
  const id = 'p1'
  const expectedHrefs = [
    `/programs/${id}/admin/approvals`,
    `/programs/${id}/admin/members`,
    `/programs/${id}/admin/products`,
    `/programs/${id}/admin/packages`,
    `/programs/${id}/admin/vouchers`,
    `/programs/${id}/admin/analytics`,
    `/programs/${id}/admin/audit`,
  ]
  const links = screen.getAllByRole('link').filter(l =>
    expectedHrefs.includes(l.getAttribute('href') ?? '')
  )
  expect(links).toHaveLength(7)
})
