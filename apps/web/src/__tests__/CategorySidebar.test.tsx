import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategorySidebar } from '../components/discovery/CategorySidebar'
import { CATEGORIES } from '../data/programs'

describe('CategorySidebar', () => {
  it('renders all 9 categories', () => {
    render(<CategorySidebar activeId="all" onSelect={() => {}} />)
    // Check that each category label appears in a list item
    for (const cat of CATEGORIES) {
      const elements = screen.getAllByText(cat.label)
      const inLi = elements.some(el => el.closest('li') !== null)
      expect(inLi).toBe(true)
    }
  })

  it('calls onSelect with category id when clicked', async () => {
    const onSelect = vi.fn()
    render(<CategorySidebar activeId="all" onSelect={onSelect} />)
    const elements = screen.getAllByText('Boxing')
    const boxingInLi = elements.find(el => el.closest('li') !== null)!
    await userEvent.click(boxingInLi)
    expect(onSelect).toHaveBeenCalledWith('Boxing')
  })

  it('highlights the active category', () => {
    render(<CategorySidebar activeId="Boxing" onSelect={() => {}} />)
    const boxing = screen.getByText('Boxing').closest('li')
    expect(boxing).toHaveStyle({ fontWeight: '500' })
  })
})
