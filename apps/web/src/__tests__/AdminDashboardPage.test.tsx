import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StatCard } from '../pages/admin-dashboard/StatCard'

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
