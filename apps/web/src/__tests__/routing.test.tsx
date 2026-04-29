import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('routing', () => {
  it('renders DiscoveryPage at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Available programs')).toBeInTheDocument()
  })

  it('renders ProgramDetailPage at /programs/p1', () => {
    render(
      <MemoryRouter initialEntries={['/programs/p1']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
  })

  it('renders 404 message for unknown program id', () => {
    render(
      <MemoryRouter initialEntries={['/programs/unknown']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText(/program not found/i)).toBeInTheDocument()
  })
})
