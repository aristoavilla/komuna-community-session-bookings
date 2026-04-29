import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { PROGRAM_DETAILS, PACKAGES } from '../data/programs'

function renderAtPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/programs/:id/products/:productId" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProductDetailPage', () => {
  it('Renders product name and description for a known product id', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    const product = PROGRAM_DETAILS['p1'].products.find((p) => p.id === 'prod-p1-1')!
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/saturday\s*bag\s*work/i)
    expect(screen.getByText(new RegExp(product.description, 'i'))).toBeInTheDocument()
  })

  it('Shows `session` type badge for a session-type product', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByText('Session product')).toBeInTheDocument()
  })

  it('Shows `simple` type badge for a simple-type product', () => {
    renderAtPath('/programs/p1/products/prod-p1-3')
    expect(screen.getByText('Simple product')).toBeInTheDocument()
    expect(screen.queryByText(/session product/i)).toBeNull()
  })

  it('Renders the sessions section for a session-type product', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByText(/upcoming/i)).toBeInTheDocument()
  })

  it('Does not render the sessions section for a simple-type product', () => {
    renderAtPath('/programs/p1/products/prod-p1-3')
    expect(screen.queryByText(/upcoming/i)).toBeNull()
  })

  it('Renders correct session rows (date, coach name present)', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    const product = PROGRAM_DETAILS['p1'].products.find((p) => p.id === 'prod-p1-1')!
    const coachName = product.sessions![0].coach
    expect(screen.getAllByText(new RegExp(`with ${coachName}`, 'i'))[0]).toBeInTheDocument()
  })

  it('Shows "Join waitlist" button for a full session', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    expect(screen.getByText(/join waitlist/i)).toBeInTheDocument()
  })

  it('Renders the packages section with correct package names', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    const product = PROGRAM_DETAILS['p1'].products.find((p) => p.id === 'prod-p1-1')!
    const relevantPackages = PACKAGES.filter(
      (pkg) =>
        pkg.program_id === 'p1' &&
        pkg.entries.some((e) => e.product_id === product.id)
    )
    for (const pkg of relevantPackages) {
      expect(screen.getByText(pkg.name)).toBeInTheDocument()
    }
  })

  it('Package card CTA links point to `/programs/:id/packages/:packageId/checkout`', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    const links = screen.getAllByRole('link', { name: /buy this package/i })
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('/checkout'))
    expect(links[0]).toHaveAttribute('href', expect.stringMatching(/\/programs\/p1\/packages\/.+\/checkout/))
  })

  it('Breadcrumb "Discover" link points to `/`', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    const discoverLink = screen.getByRole('link', { name: /discover/i })
    expect(discoverLink).toHaveAttribute('href', '/')
  })

  it('Breadcrumb program name links to `/programs/:id`', () => {
    renderAtPath('/programs/p1/products/prod-p1-1')
    const programLink = screen.getByRole('link', { name: /eastside boxing/i })
    expect(programLink).toHaveAttribute('href', '/programs/p1')
  })

  it('Renders "Product not found." for an unknown product id', () => {
    renderAtPath('/programs/p1/products/does-not-exist')
    expect(screen.getByText(/product not found/i)).toBeInTheDocument()
  })
})
