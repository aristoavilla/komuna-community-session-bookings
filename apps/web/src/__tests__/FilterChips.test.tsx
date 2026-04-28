import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterChips } from '../components/discovery/FilterChips'

const chips = ['Open today', 'Within 5mi', 'Under $30']

describe('FilterChips', () => {
  it('renders all chips', () => {
    render(<FilterChips chips={chips} onRemove={() => {}} />)
    for (const chip of chips) {
      expect(screen.getByText(new RegExp(chip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument()
    }
  })

  it('calls onRemove with chip label when × is clicked', async () => {
    const onRemove = vi.fn()
    render(<FilterChips chips={chips} onRemove={onRemove} />)
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await userEvent.click(removeButtons[0])
    expect(onRemove).toHaveBeenCalledWith('Open today')
  })

  it('renders nothing when chips array is empty', () => {
    const { container } = render(<FilterChips chips={[]} onRemove={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
