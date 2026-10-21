import { describe, expect, it } from 'vitest'
import { SECTION_TYPES, blankRow, validateRows } from '../../src/sections/types.js'

describe('section definitions', () => {
  it('every section has fields and a view that returns an object', () => {
    for (const [key, type] of Object.entries(SECTION_TYPES)) {
      expect(type.fields.length, key).toBeGreaterThan(0)
      expect(typeof type.view(blankRow(key)), key).toBe('object')
    }
  })

  it('blankRow fills every field, with select defaults', () => {
    expect(blankRow('languages')).toEqual({ language: '', proficiency: 'Fluent' })
    expect(Object.keys(blankRow('general'))).toEqual(SECTION_TYPES.general.fields.map((f) => f.key))
  })
})

describe('validateRows', () => {
  const today = '2026-10'

  it('requires name, email and phone in General', () => {
    const errors = validateRows('general', [blankRow('general')], today)
    expect(errors.map((e) => e.fields[0])).toEqual(['name', 'email', 'phone'])
    expect(errors.every((e) => e.kind === 'required')).toBe(true)
  })

  it('treats whitespace as empty', () => {
    const row = { ...blankRow('skills'), category: '  ', items: 'React' }
    expect(validateRows('skills', [row], today)).toEqual([{ index: 0, fields: ['category'], kind: 'required' }])
  })

  it('flags an end date before the start date', () => {
    const row = { company: 'A', position: 'B', responsibilities: '', from: '2022-05', until: '2021-01' }
    expect(validateRows('exp', [row], today)).toEqual([{ index: 0, fields: ['from', 'until'], kind: 'range' }])
  })

  it('flags an ongoing entry that starts in the future', () => {
    const row = { company: 'A', position: 'B', responsibilities: '', from: '2027-01', until: '' }
    expect(validateRows('exp', [row], today)).toEqual([{ index: 0, fields: ['from', 'until'], kind: 'future', today }])
  })

  it('reports errors per entry index', () => {
    const ok = { category: 'A', items: 'b' }
    const errors = validateRows('skills', [ok, { category: '', items: '' }], today)
    expect(errors.every((e) => e.index === 1)).toBe(true)
  })
})
