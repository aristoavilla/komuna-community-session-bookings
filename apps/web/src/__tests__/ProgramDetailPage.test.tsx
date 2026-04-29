import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProgramDetailPage } from '../pages/ProgramDetailPage'
import { PROGRAM_DETAILS } from '../data/programs'

function renderAtPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/programs/:id" element={<ProgramDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProgramDetailPage', () => {
  it('renders program name and long description for p1', () => {
    renderAtPath('/programs/p1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Eastside Boxing')
    expect(screen.getByText(/Coach Marcus runs tight/)).toBeInTheDocument()
  })

  it('renders all products for p1', () => {
    renderAtPath('/programs/p1')
    const detail = PROGRAM_DETAILS['p1']
    for (const product of detail.products) {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    }
  })

  it('shows "Join program →" button for a public program (p1)', () => {
    renderAtPath('/programs/p1')
    expect(screen.getByRole('button', { name: /join program/i })).toBeInTheDocument()
  })

  it('shows "Request to join" button for a need-approval program (p2)', () => {
    renderAtPath('/programs/p2')
    expect(screen.getByRole('button', { name: /request to join/i })).toBeInTheDocument()
    expect(screen.getByText(/admin reviews all requests/i)).toBeInTheDocument()
  })

  it('shows disabled "Invitation only" button for invitation-only program (p4)', () => {
    renderAtPath('/programs/p4')
    const btn = screen.getByRole('button', { name: /invitation only/i })
    expect(btn).toBeDisabled()
    expect(screen.getByText(/contact the admin/i)).toBeInTheDocument()
  })

  it('shows product type badges (SESSION / SIMPLE)', () => {
    renderAtPath('/programs/p1')
    expect(screen.getAllByText('session').length).toBeGreaterThan(0)
    expect(screen.getAllByText('simple').length).toBeGreaterThan(0)
  })

  it('shows "Program not found." for an unknown id', () => {
    renderAtPath('/programs/does-not-exist')
    expect(screen.getByText(/program not found/i)).toBeInTheDocument()
  })

  it('renders breadcrumb with program name', () => {
    renderAtPath('/programs/p1')
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
    expect(screen.getAllByText('Discover').length).toBeGreaterThan(0)
  })

  it('product cards link to /programs/:id/products/:productId', () => {
    renderAtPath('/programs/p1')
    const links = screen.getAllByRole('link', { name: /view sessions/i })
    expect(links[0]).toHaveAttribute('href', '/programs/p1/products/prod-p1-1')
  })
})
