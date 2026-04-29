import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrderSummaryCard } from '../pages/checkout/OrderSummaryCard'
import { PACKAGES } from '../data/programs'

function renderAtPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/programs/:id/packages/:packageId/checkout" element={<CheckoutPage />} />
      </Routes>
    </MemoryRouter>
  )
}

const pkg = PACKAGES.find((p) => p.id === 'pkg-p1-1')!

function renderCard(onPay?: () => Promise<'success' | 'failure'>) {
  return render(
    <MemoryRouter>
      <OrderSummaryCard pkg={pkg} onPay={onPay} />
    </MemoryRouter>
  )
}

describe('CheckoutPage', () => {
  it('Renders package name for a known packageId', () => {
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    expect(screen.getByText(/10-class pass/i)).toBeInTheDocument()
  })

  it('Renders all package entries (product names and quantities)', () => {
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    expect(screen.getByText(/saturday bag work/i)).toBeInTheDocument()
    expect(screen.getByText(/friday pad rounds/i)).toBeInTheDocument()
    expect(screen.getByText(/×10/)).toBeInTheDocument()
    expect(screen.getByText(/×5/)).toBeInTheDocument()
  })

  it('Renders validity rule for each entry', () => {
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    const validityItems = screen.getAllByText(/60 days from purchase/i)
    expect(validityItems.length).toBeGreaterThan(0)
  })

  it('Shows correct base price from package data', () => {
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    expect(screen.getByText('$240')).toBeInTheDocument()
  })

  it('Computes service fee correctly — percentage case', () => {
    // 5% of $240 = $12.00 > $3.00 min → fee = $12.00
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    expect(screen.getByText('$12.00')).toBeInTheDocument()
  })

  it('Computes service fee correctly — minimum case', () => {
    // 5% of $19 = $0.95 < $3.00 min → fee = $3.00
    renderAtPath('/programs/p4/packages/pkg-p4-3/checkout')
    expect(screen.getByText('$3.00')).toBeInTheDocument()
  })

  it('Shows correct total (base + fee)', () => {
    // total = $240 + $12 = $252.00
    renderAtPath('/programs/p1/packages/pkg-p1-1/checkout')
    expect(screen.getByText('$252.00')).toBeInTheDocument()
  })

  describe('OrderSummaryCard interactions', () => {
    beforeEach(() => {
      // no fake timers needed — we inject a never-resolving promise for paying state
    })

    afterEach(() => {
      // cleanup is handled by @testing-library/react automatically
    })

    it('Clicking "Pay with Xendit" transitions to paying state', async () => {
      // Inject a never-resolving promise so state stays at 'paying'
      renderCard(() => new Promise(() => {}))
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /pay with xendit/i }))
      expect(screen.getByText(/processing payment/i)).toBeInTheDocument()
    })

    it('After simulated success, success state renders vouchers issued', async () => {
      renderCard(() => Promise.resolve('success'))
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /pay with xendit/i }))
      await waitFor(() => {
        expect(screen.getByText(/payment confirmed/i)).toBeInTheDocument()
      })
      expect(
        screen.getByText(/10× Saturday Bag Work — valid 60 days from purchase/i)
      ).toBeInTheDocument()
    })

    it('Failure state shows "Payment failed." and "Try again" button', async () => {
      renderCard(() => Promise.resolve('failure'))
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /pay with xendit/i }))
      await waitFor(() => {
        expect(screen.getByText(/payment failed/i)).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('Clicking "Try again" resets to idle state', async () => {
      renderCard(() => Promise.resolve('failure'))
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /pay with xendit/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /try again/i }))
      expect(screen.getByRole('button', { name: /pay with xendit/i })).toBeInTheDocument()
    })
  })

  it('Renders "Package not found." for an unknown packageId', () => {
    renderAtPath('/programs/p1/packages/does-not-exist/checkout')
    expect(screen.getByText(/package not found/i)).toBeInTheDocument()
  })
})
