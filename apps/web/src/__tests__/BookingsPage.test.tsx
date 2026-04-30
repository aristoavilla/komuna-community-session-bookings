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
