import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
    render(<MemoryRouter><ProgramCard program={base} /></MemoryRouter>)
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
  })

  it('renders Open badge for public visibility', () => {
    render(<MemoryRouter><ProgramCard program={base} /></MemoryRouter>)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders Apply badge for need-approval visibility', () => {
    render(<MemoryRouter><ProgramCard program={{ ...base, visibility: 'need-approval' }} /></MemoryRouter>)
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('renders the price', () => {
    render(<MemoryRouter><ProgramCard program={base} /></MemoryRouter>)
    expect(screen.getByText('$28')).toBeInTheDocument()
  })

  it('renders the category tag', () => {
    render(<MemoryRouter><ProgramCard program={base} /></MemoryRouter>)
    expect(screen.getByText('Boxing')).toBeInTheDocument()
  })

  it('renders location and member count', () => {
    render(<MemoryRouter><ProgramCard program={base} /></MemoryRouter>)
    expect(screen.getByText(/Brooklyn, NY/)).toBeInTheDocument()
    expect(screen.getByText(/412 members/)).toBeInTheDocument()
  })
})
