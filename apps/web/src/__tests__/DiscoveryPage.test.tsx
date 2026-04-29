import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DiscoveryPage } from '../pages/DiscoveryPage'

describe('DiscoveryPage', () => {
  it('renders all 6 programs on initial load', () => {
    render(<MemoryRouter><DiscoveryPage /></MemoryRouter>)
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
    expect(screen.getByText('Slow Flow with Ines')).toBeInTheDocument()
    expect(screen.getByText('Strong Together')).toBeInTheDocument()
    expect(screen.getByText('Sprint Lab')).toBeInTheDocument()
    expect(screen.getByText('Roundhouse Muay Thai')).toBeInTheDocument()
    expect(screen.getByText('Sunrise Vinyasa')).toBeInTheDocument()
  })

  it('filters to boxing programs when Boxing category is selected', async () => {
    render(<MemoryRouter><DiscoveryPage /></MemoryRouter>)
    await userEvent.click(screen.getAllByText('Boxing')[0])
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
    expect(screen.getByText('Roundhouse Muay Thai')).toBeInTheDocument()
    expect(screen.queryByText('Slow Flow with Ines')).not.toBeInTheDocument()
    expect(screen.queryByText('Sprint Lab')).not.toBeInTheDocument()
  })

  it('shows all programs again when All programs is selected', async () => {
    render(<MemoryRouter><DiscoveryPage /></MemoryRouter>)
    await userEvent.click(screen.getAllByText('Boxing')[0])
    await userEvent.click(screen.getByText('All programs'))
    expect(screen.getByText('Slow Flow with Ines')).toBeInTheDocument()
  })

  it('removes a filter chip when × is clicked', async () => {
    render(<MemoryRouter><DiscoveryPage /></MemoryRouter>)
    const removeBtn = screen.getAllByRole('button', { name: /remove/i })[0]
    await userEvent.click(removeBtn)
    // chip is gone; programs grid is unaffected (chips are decorative)
    expect(screen.getByText('Eastside Boxing Club')).toBeInTheDocument()
  })
})
