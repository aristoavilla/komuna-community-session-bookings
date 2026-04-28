import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgramCard } from '../components/discovery/ProgramCard'
import type { ProgramListItem } from '../data/programs'

const base: ProgramListItem = {
  id: 'p1',
  name: 'Eastside Boxing Club',
  description: 'High-intensity bag work.',
  visibility: 'public',
  timezone: 'America/New_York',
  memberCount: 412,
  lowestPrice: '$28',
  location: 'Brooklyn, NY',
  category: 'Boxing',
  rating: 4.9,
  sessionsPerWeek: 6,
  imageTone: 'warm',
  imageLabel: 'BAG WORK · COACH',
}

describe('ProgramCard', () => {
  it('renders the program name', () => {
    render(<ProgramCard program={base} />)
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
  })

  it('renders Open badge for public visibility', () => {
    render(<ProgramCard program={base} />)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders Apply badge for need-approval visibility', () => {
    render(<ProgramCard program={{ ...base, visibility: 'need-approval' }} />)
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('renders the price', () => {
    render(<ProgramCard program={base} />)
    expect(screen.getByText('$28')).toBeInTheDocument()
  })

  it('renders the category tag', () => {
    render(<ProgramCard program={base} />)
    expect(screen.getByText('Boxing')).toBeInTheDocument()
  })

  it('renders location and member count', () => {
    render(<ProgramCard program={base} />)
    expect(screen.getByText(/Brooklyn, NY/)).toBeInTheDocument()
    expect(screen.getByText(/412 members/)).toBeInTheDocument()
  })
})
