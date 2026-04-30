import { describe, it, expect } from 'vitest'
import { PROGRAMS, CATEGORIES, PROGRAM_DETAILS, VOUCHERS } from '../data/programs'
import type { ProgramDetailMock, ProductMock, VoucherMock } from '../data/programs'

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

it('ProgramDetailMock has required ERD fields', () => {
  const p: ProgramDetailMock = PROGRAM_DETAILS['p1']
  expect(p.id).toBeDefined()
  expect(p.name).toBeDefined()
  expect(p.description).toBeDefined()
  expect(p.visibility).toBeDefined()
  expect(p.timezone).toBeDefined()
  expect(p.created_at).toBeDefined()
  expect(p.products.length).toBeGreaterThan(0)
})

it('ProductMock has required ERD fields', () => {
  const prod: ProductMock = PROGRAM_DETAILS['p1'].products[0]
  expect(prod.id).toBeDefined()
  expect(prod.program_id).toBeDefined()
  expect(prod.name).toBeDefined()
  expect(prod.description).toBeDefined()
  expect(prod.type).toMatch(/^(session|simple)$/)
  expect(prod.status).toMatch(/^(active|archived)$/)
  expect(prod.created_at).toBeDefined()
})

it('VoucherMock has all required ERD fields', () => {
  const v: VoucherMock = VOUCHERS[0]
  expect(v.id).toBeDefined()
  expect(v.program_member_id).toBeDefined()
  expect(v.product_id).toBeDefined()
  // purchase_id is nullable for compensation/giveaway
  expect('purchase_id' in v).toBe(true)
  expect('issued_by' in v).toBe(true)
  expect(v.source).toMatch(/^(purchase|compensation|giveaway)$/)
  expect(v.status).toMatch(/^(active|claimed|expired|refunded)$/)
  expect(v.expired_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
})

it('VOUCHERS covers all four statuses', () => {
  const statuses = new Set(VOUCHERS.map((v) => v.status))
  expect(statuses.has('active')).toBe(true)
  expect(statuses.has('claimed')).toBe(true)
  expect(statuses.has('expired')).toBe(true)
  expect(statuses.has('refunded')).toBe(true)
})

it('VOUCHERS covers all three sources', () => {
  const sources = new Set(VOUCHERS.map((v) => v.source))
  expect(sources.has('purchase')).toBe(true)
  expect(sources.has('compensation')).toBe(true)
  expect(sources.has('giveaway')).toBe(true)
})
