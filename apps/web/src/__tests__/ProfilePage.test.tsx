import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProfilePage } from '../pages/ProfilePage'

function renderProfile(props: React.ComponentProps<typeof ProfilePage> = {}) {
  render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route path="/profile" element={<ProfilePage {...props} />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  it('renders page heading "My profile"', () => {
    renderProfile()
    expect(screen.getByRole('heading', { name: /my profile/i })).toBeInTheDocument()
  })

  it('identity panel is shown by default', () => {
    renderProfile()
    expect(screen.getByText('Your details')).toBeInTheDocument()
  })

  it('clicking "Notifications" sidebar item shows notifications panel', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^notifications$/i }))
    expect(screen.getByText('Email preferences')).toBeInTheDocument()
  })

  it('clicking "Account" sidebar item shows account panel', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^account$/i }))
    expect(screen.getByText('Account settings')).toBeInTheDocument()
  })

  it('identity panel renders display name and email', () => {
    renderProfile({ userName: 'Maya Alinejad', userEmail: 'maya@example.com' })
    expect(screen.getByText('Maya Alinejad')).toBeInTheDocument()
    expect(screen.getByText('maya@example.com')).toBeInTheDocument()
  })

  it('identity panel shows "read-only" badge on both fields', () => {
    renderProfile()
    expect(screen.getAllByText(/read-only/i)).toHaveLength(2)
  })

  it('notifications panel renders all 6 toggle rows', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^notifications$/i }))
    expect(screen.getAllByRole('switch')).toHaveLength(6)
  })

  it('toggles reflect correct default on/off state (4 on, 2 off)', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^notifications$/i }))
    const on = screen.getAllByRole('switch').filter(t => t.getAttribute('aria-checked') === 'true')
    expect(on).toHaveLength(4)
  })

  it('clicking a toggle flips its state', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^notifications$/i }))
    const toggle = screen.getByRole('switch', { name: /booking confirmed/i })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('account panel renders "Sign out" button', async () => {
    const user = userEvent.setup()
    renderProfile()
    await user.click(screen.getByRole('button', { name: /^account$/i }))
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('account panel shows signed-in email in meta line', async () => {
    const user = userEvent.setup()
    renderProfile({ userEmail: 'maya@example.com' })
    await user.click(screen.getByRole('button', { name: /^account$/i }))
    expect(screen.getByText(/maya@example\.com/)).toBeInTheDocument()
  })

  it('switching sections unmounts the previous panel content', async () => {
    const user = userEvent.setup()
    renderProfile()
    expect(screen.getByText('Your details')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^notifications$/i }))
    expect(screen.queryByText('Your details')).not.toBeInTheDocument()
    expect(screen.getByText('Email preferences')).toBeInTheDocument()
  })

  it('renders notifications panel when initialSection="notifications"', () => {
    renderProfile({ initialSection: 'notifications' })
    expect(screen.getByText('Email preferences')).toBeInTheDocument()
    expect(screen.queryByText('Your details')).not.toBeInTheDocument()
  })
})
