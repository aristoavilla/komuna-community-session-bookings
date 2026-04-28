import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSearch } from '../components/discovery/HeroSearch'

describe('HeroSearch', () => {
  it('renders the headline', () => {
    render(<HeroSearch searchValue="" onSearchChange={() => {}} />)
    expect(screen.getByText(/book your meeting/i)).toBeInTheDocument()
    expect(screen.getByText(/trainer\./i)).toBeInTheDocument()
  })

  it('renders the search bar', () => {
    render(<HeroSearch searchValue="" onSearchChange={() => {}} />)
    expect(screen.getByPlaceholderText(/search programs/i)).toBeInTheDocument()
  })

  it('renders the quick-filter chips', () => {
    render(<HeroSearch searchValue="" onSearchChange={() => {}} />)
    expect(screen.getByText('Boxing near me')).toBeInTheDocument()
    expect(screen.getByText('Morning yoga')).toBeInTheDocument()
    expect(screen.getByText('Open today')).toBeInTheDocument()
  })
})
