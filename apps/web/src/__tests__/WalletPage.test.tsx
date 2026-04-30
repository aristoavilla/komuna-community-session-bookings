import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { WalletPage } from '../pages/WalletPage'
import type { VoucherMock } from '../data/programs'

const now = new Date('2026-04-30T00:00:00Z')

const vouchers: VoucherMock[] = [
  {
    id: 'v-late-active',
    program_member_id: 'pm-1',
    product_id: 'prod-bag',
    purchase_id: 'purchase-1',
    issued_by: null,
    source: 'purchase',
    status: 'active',
    expired_at: '2026-06-15T00:00:00Z',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v-early-active',
    program_member_id: 'pm-1',
    product_id: 'prod-bag',
    purchase_id: 'purchase-1',
    issued_by: null,
    source: 'purchase',
    status: 'active',
    expired_at: '2026-06-03T00:00:00Z',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v-claimed',
    program_member_id: 'pm-1',
    product_id: 'prod-bag',
    purchase_id: 'purchase-1',
    issued_by: null,
    source: 'purchase',
    status: 'claimed',
    expired_at: '2026-06-07T00:00:00Z',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v-expired-bag',
    program_member_id: 'pm-1',
    product_id: 'prod-bag',
    purchase_id: 'purchase-2',
    issued_by: null,
    source: 'purchase',
    status: 'expired',
    expired_at: '2026-03-01T00:00:00Z',
    product_name: 'Saturday Bag Work',
    program_id: 'p1',
    program_name: 'Eastside Boxing Club',
  },
  {
    id: 'v-vinyasa-purchase',
    program_member_id: 'pm-1',
    product_id: 'prod-vinyasa',
    purchase_id: 'purchase-3',
    issued_by: null,
    source: 'purchase',
    status: 'active',
    expired_at: '2026-05-20T00:00:00Z',
    product_name: 'Morning Vinyasa',
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
  },
  {
    id: 'v-vinyasa-comp',
    program_member_id: 'pm-1',
    product_id: 'prod-vinyasa',
    purchase_id: null,
    issued_by: 'admin-1',
    source: 'compensation',
    status: 'active',
    expired_at: '2026-05-25T00:00:00Z',
    product_name: 'Morning Vinyasa',
    program_id: 'p2',
    program_name: 'Slow Flow with Ines',
  },
  {
    id: 'v-refunded',
    program_member_id: 'pm-1',
    product_id: 'prod-refunded',
    purchase_id: 'purchase-4',
    issued_by: null,
    source: 'purchase',
    status: 'refunded',
    expired_at: '2026-06-10T00:00:00Z',
    product_name: 'Open Gym Credit',
    program_id: 'p4',
    program_name: 'North Pier Strength',
  },
  {
    id: 'v-barbell-expired-late',
    program_member_id: 'pm-1',
    product_id: 'prod-barbell',
    purchase_id: null,
    issued_by: 'admin-2',
    source: 'giveaway',
    status: 'expired',
    expired_at: '2026-02-15T00:00:00Z',
    product_name: 'Barbell Fundamentals',
    program_id: 'p3',
    program_name: 'Strong Together',
  },
  {
    id: 'v-barbell-expired-early',
    program_member_id: 'pm-1',
    product_id: 'prod-barbell',
    purchase_id: null,
    issued_by: 'admin-2',
    source: 'giveaway',
    status: 'expired',
    expired_at: '2026-02-01T00:00:00Z',
    product_name: 'Barbell Fundamentals',
    program_id: 'p3',
    program_name: 'Strong Together',
  },
]

function renderWallet(customVouchers = vouchers) {
  return render(
    <MemoryRouter>
      <WalletPage vouchers={customVouchers} now={now} />
    </MemoryRouter>,
  )
}

describe('WalletPage', () => {
  it('renders page heading "My wallet"', () => {
    renderWallet()

    expect(screen.getByRole('heading', { name: /my wallet/i })).toBeInTheDocument()
  })

  it('renders product cards for products with visible vouchers', () => {
    renderWallet()

    expect(screen.getByText('Saturday Bag Work')).toBeInTheDocument()
    expect(screen.getByText('Morning Vinyasa')).toBeInTheDocument()
    expect(screen.getByText('Open Gym Credit')).toBeInTheDocument()
  })

  it('hides expired vouchers by default', () => {
    renderWallet()

    expect(screen.queryByText(/Expired 01 Mar 2026/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^expired$/i)).not.toBeInTheDocument()
  })

  it('reveals expired vouchers after toggling "Show expired"', async () => {
    const user = userEvent.setup()
    renderWallet()

    await user.click(screen.getByRole('button', { name: /show expired/i }))

    expect(screen.getByText(/Expired 01 Mar 2026/i)).toBeInTheDocument()
    expect(screen.getAllByText(/^expired$/i)).toHaveLength(3)
    expect(screen.getByRole('button', { name: /hide expired/i })).toBeInTheDocument()
  })

  it('hides entire product card when all its vouchers are expired and toggle is off', () => {
    renderWallet()

    expect(screen.queryByText('Barbell Fundamentals')).not.toBeInTheDocument()
  })

  it('renders "Book →" link for products with at least one active voucher', () => {
    renderWallet()

    const bagWorkCard = screen.getByTestId('product-card-prod-bag')
    const vinyasaCard = screen.getByTestId('product-card-prod-vinyasa')
    expect(within(bagWorkCard).getByRole('link', { name: /book/i })).toHaveAttribute(
      'href',
      '/programs/p1/products/prod-bag/sessions',
    )
    expect(within(vinyasaCard).getByRole('link', { name: /book/i })).toHaveAttribute(
      'href',
      '/programs/p2/products/prod-vinyasa/sessions',
    )
  })

  it('does not render "Book →" link when no active vouchers', async () => {
    const user = userEvent.setup()
    renderWallet()

    await user.click(screen.getByRole('button', { name: /show expired/i }))

    const barbellCard = screen.getByTestId('product-card-prod-barbell')
    const refundedCard = screen.getByTestId('product-card-prod-refunded')
    expect(within(barbellCard).queryByRole('link', { name: /book/i })).not.toBeInTheDocument()
    expect(within(refundedCard).queryByRole('link', { name: /book/i })).not.toBeInTheDocument()
  })

  it('renders correct status badge label for each status', async () => {
    const user = userEvent.setup()
    renderWallet()

    await user.click(screen.getByRole('button', { name: /show expired/i }))

    expect(screen.getAllByText(/^active$/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/^claimed$/i)).toBeInTheDocument()
    expect(screen.getAllByText(/^expired$/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/^refunded$/i)).toBeInTheDocument()
  })

  it('renders correct source label for each source', async () => {
    const user = userEvent.setup()
    renderWallet()

    await user.click(screen.getByRole('button', { name: /show expired/i }))

    expect(screen.getAllByText(/^purchase$/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/^compensation$/i)).toBeInTheDocument()
    expect(screen.getAllByText(/^giveaway$/i).length).toBeGreaterThan(0)
  })

  it('treats past active vouchers as expired for visibility and bookability', async () => {
    const user = userEvent.setup()
    renderWallet([
      {
        ...vouchers[0],
        id: 'v-stale-active',
        expired_at: '2026-04-01T00:00:00Z',
        product_id: 'prod-stale',
        product_name: 'Stale Active Pass',
      },
    ])

    expect(screen.queryByText('Stale Active Pass')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show expired/i }))

    const staleCard = screen.getByTestId('product-card-prod-stale')
    expect(within(staleCard).queryByRole('link', { name: /book/i })).not.toBeInTheDocument()
    expect(within(staleCard).getByText(/Expired 01 Apr 2026/i)).toBeInTheDocument()
    expect(within(staleCard).getByTestId('voucher-row')).toHaveStyle('opacity: 0.5')
  })

  it('renders empty state when no vouchers exist', () => {
    renderWallet([])

    expect(screen.getByText(/no vouchers yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse programs/i })).toHaveAttribute('href', '/')
  })

  it('expired vouchers render with reduced opacity when showExpired is true', async () => {
    const user = userEvent.setup()
    renderWallet()

    await user.click(screen.getByRole('button', { name: /show expired/i }))

    const barbellCard = screen.getByTestId('product-card-prod-barbell')
    const rows = within(barbellCard).getAllByTestId('voucher-row')
    expect(rows[0]).toHaveStyle('opacity: 0.5')
  })

  it('voucher rows sorted by expired_at ascending within each product group', async () => {
    const user = userEvent.setup()
    renderWallet()

    await user.click(screen.getByRole('button', { name: /show expired/i }))

    const bagWorkCard = screen.getByTestId('product-card-prod-bag')
    const rows = within(bagWorkCard).getAllByTestId('voucher-row')
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('01 Mar 2026'),
      expect.stringContaining('03 Jun 2026'),
      expect.stringContaining('07 Jun 2026'),
      expect.stringContaining('15 Jun 2026'),
    ])
  })

  it('orders product groups by earliest active expiry, with no-active groups last', async () => {
    const user = userEvent.setup()
    renderWallet()

    await user.click(screen.getByRole('button', { name: /show expired/i }))

    const cards = screen.getAllByTestId(/^product-card-/)
    expect(cards.map((card) => card.getAttribute('data-testid'))).toEqual([
      'product-card-prod-vinyasa',
      'product-card-prod-bag',
      'product-card-prod-refunded',
      'product-card-prod-barbell',
    ])
  })
})
