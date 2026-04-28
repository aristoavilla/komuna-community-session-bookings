import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../components/discovery/SearchBar'

describe('SearchBar', () => {
  it('renders the placeholder text', () => {
    render(<SearchBar value="" onChange={() => {}} />)
    expect(screen.getByPlaceholderText(/search programs/i)).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    await userEvent.type(screen.getByPlaceholderText(/search programs/i), 'boxing')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders the Search button', () => {
    render(<SearchBar value="" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })
})
