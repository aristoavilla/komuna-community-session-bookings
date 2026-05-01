import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StatCard } from '../pages/admin-dashboard/StatCard'
import { RevenueSparkline } from '../pages/admin-dashboard/RevenueSparkline'
import { SessionsBarSparkline } from '../pages/admin-dashboard/SessionsBarSparkline'

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
