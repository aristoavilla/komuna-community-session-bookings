import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgramGrid } from '../components/discovery/ProgramGrid'
import { PROGRAMS } from '../data/programs'

describe('ProgramGrid', () => {
  it('renders all programs', () => {
    render(<ProgramGrid programs={PROGRAMS} />)
    for (const p of PROGRAMS) {
      expect(screen.getByText(p.name)).toBeInTheDocument()
    }
  })

  it('renders only the provided subset', () => {
    const subset = PROGRAMS.filter(p => p.category === 'Boxing')
    render(<ProgramGrid programs={subset} />)
    expect(screen.getAllByText(/Open|Apply|Invite/)).toHaveLength(subset.length)
    expect(screen.queryByText('Slow Flow with Ines')).not.toBeInTheDocument()
  })

  it('shows the show-more button', () => {
    render(<ProgramGrid programs={PROGRAMS} />)
    expect(screen.getByRole('button', { name: /show .* more/i })).toBeInTheDocument()
  })
})
