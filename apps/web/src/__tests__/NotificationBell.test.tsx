import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationBell } from '../components/discovery/NotificationBell'

describe('NotificationBell', () => {
  it('renders the bell button', () => {
    render(<NotificationBell count={0} />)
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('shows count badge when count > 0', () => {
    render(<NotificationBell count={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not show badge when count is 0', () => {
    render(<NotificationBell count={0} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
