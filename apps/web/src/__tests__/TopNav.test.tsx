import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopNav } from '../components/layout/TopNav'

describe('TopNav', () => {
  it('renders the komuna wordmark', () => {
    render(<TopNav loggedIn={false} />)
    expect(screen.getByText('komuna')).toBeInTheDocument()
  })

  it('shows My bookings and notification bell when logged in', () => {
    render(<TopNav loggedIn={true} />)
    expect(screen.getByText('My bookings')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('shows Get started button when logged out', () => {
    render(<TopNav loggedIn={false} />)
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
    expect(screen.queryByText('My bookings')).not.toBeInTheDocument()
  })

  it('shows Discover as the active nav link', () => {
    render(<TopNav loggedIn={false} />)
    expect(screen.getByText('Discover')).toBeInTheDocument()
  })
})
