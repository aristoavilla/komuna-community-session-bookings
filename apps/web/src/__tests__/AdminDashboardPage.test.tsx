import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StatCard } from '../pages/admin-dashboard/StatCard'
import { RevenueSparkline } from '../pages/admin-dashboard/RevenueSparkline'
import { SessionsBarSparkline } from '../pages/admin-dashboard/SessionsBarSparkline'
import { RevenueChart } from '../pages/admin-dashboard/RevenueChart'
import { AttendanceChart } from '../pages/admin-dashboard/AttendanceChart'
import { VoucherStatusChart } from '../pages/admin-dashboard/VoucherStatusChart'

describe('StatCard', () => {
  it('renders label, value, and meta', () => {
    render(
      <MemoryRouter>
        <StatCard label="Revenue" value="$12,480" meta="+18% vs last month" />
      </MemoryRouter>
    )
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$12,480')).toBeInTheDocument()
    expect(screen.getByText('+18% vs last month')).toBeInTheDocument()
  })

  it('renders sparkline slot when provided', () => {
    render(
      <MemoryRouter>
        <StatCard
          label="Members"
          value="84"
          meta="+3 this month"
          sparkline={<svg data-testid="sparkline" />}
        />
      </MemoryRouter>
    )
    expect(screen.getByTestId('sparkline')).toBeInTheDocument()
  })
})

describe('RevenueSparkline', () => {
  it('renders an SVG with a filled path', () => {
    const { container } = render(
      <RevenueSparkline values={[1, 2, 3, 4, 5]} stroke="var(--accent)" />
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelector('path')).toBeInTheDocument()
  })
})

describe('SessionsBarSparkline', () => {
  it('renders exactly 7 rect elements', () => {
    const { container } = render(
      <SessionsBarSparkline values={[0, 2, 2, 3, 0, 1, 1]} />
    )
    expect(container.querySelectorAll('rect')).toHaveLength(7)
  })
})

const SIX_MONTHS = [
  { month: 'Dec', amount: 520000 },
  { month: 'Jan', amount: 650000 },
  { month: 'Feb', amount: 800000 },
  { month: 'Mar', amount: 880000 },
  { month: 'Apr', amount: 1050000 },
  { month: 'May', amount: 1248000 },
]

describe('RevenueChart', () => {
  it('renders 6 bars by default (6M period)', () => {
    const { container } = render(
      <MemoryRouter><RevenueChart data={SIX_MONTHS} /></MemoryRouter>
    )
    expect(container.querySelectorAll('[data-bar]')).toHaveLength(6)
  })

  it('3M toggle shows 3 bars', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter><RevenueChart data={SIX_MONTHS} /></MemoryRouter>
    )
    await user.click(screen.getByRole('button', { name: '3M' }))
    expect(container.querySelectorAll('[data-bar]')).toHaveLength(3)
  })

  it('1Y toggle shows all entries when fewer than 12 exist', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter><RevenueChart data={SIX_MONTHS} /></MemoryRouter>
    )
    await user.click(screen.getByRole('button', { name: '1Y' }))
    expect(container.querySelectorAll('[data-bar]')).toHaveLength(6)
  })
})

describe('AttendanceChart', () => {
  it('renders one progress bar per product', () => {
    const products = [
      { product_id: 'a', product_name: 'Boxing', taken: 14, capacity: 16 },
      { product_id: 'b', product_name: 'Sparring', taken: 8, capacity: 12 },
      { product_id: 'c', product_name: 'Bag Work', taken: 10, capacity: 10 },
    ]
    const { container } = render(<AttendanceChart products={products} />)
    expect(container.querySelectorAll('[data-fill]')).toHaveLength(3)
  })
})

describe('VoucherStatusChart', () => {
  it('renders 4 segments whose widths sum to 100%', () => {
    const counts = { claimed: 384, active: 224, expired: 112, refunded: 80 }
    const { container } = render(<VoucherStatusChart counts={counts} />)
    const segments = container.querySelectorAll('[data-segment]')
    expect(segments).toHaveLength(4)
    const total = Array.from(segments).reduce((sum, el) => {
      const w = parseFloat((el as HTMLElement).style.width)
      return sum + w
    }, 0)
    expect(Math.round(total)).toBe(100)
  })
})
