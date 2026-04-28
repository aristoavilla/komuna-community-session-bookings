import { describe, it, expect } from 'vitest'
import { PROGRAMS, CATEGORIES } from '../data/programs'

describe('mock programs', () => {
  it('has exactly 6 programs', () => {
    expect(PROGRAMS).toHaveLength(6)
  })

  it('every program has required fields', () => {
    for (const p of PROGRAMS) {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(['public', 'need-approval', 'invitation-only', 'private']).toContain(p.visibility)
      expect(p.memberCount).toBeGreaterThan(0)
      expect(p.lowestPrice).toBeTruthy()
      expect(['warm', 'cool', 'ink', 'accent']).toContain(p.imageTone)
    }
  })

  it('has 9 categories including "all"', () => {
    expect(CATEGORIES).toHaveLength(9)
    expect(CATEGORIES[0].id).toBe('all')
  })
})
