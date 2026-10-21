import { describe, expect, it } from 'vitest'
import {
  bareUrl,
  compareMonths,
  currentMonth,
  formatMonth,
  formatRange,
  joinParts,
  splitBullets,
  splitList,
} from '../../src/lib/format.js'
import { cvFileBase } from '../../src/cv/fileName.js'

describe('formatMonth', () => {
  it('formats YYYY-MM and bare years', () => {
    expect(formatMonth('2020-07')).toBe('Jul 2020')
    expect(formatMonth('2020')).toBe('2020')
    expect(formatMonth('')).toBe('')
  })
})

describe('formatRange', () => {
  it('uses Present for a blank end date', () => {
    expect(formatRange('2020-07', '')).toBe('Jul 2020 – Present')
    expect(formatRange('2018-01', '2020-12')).toBe('Jan 2018 – Dec 2020')
  })
})

describe('compareMonths', () => {
  it('orders by year, then month', () => {
    expect(compareMonths('2020-03', '2021-01')).toBeLessThan(0)
    expect(compareMonths('2020-05', '2020-03')).toBeGreaterThan(0)
  })

  it('treats a bare year as equal to any month in it', () => {
    expect(compareMonths('2020', '2020-03')).toBe(0)
  })
})

describe('currentMonth', () => {
  it('pads the month', () => {
    expect(currentMonth(new Date(2026, 0, 15))).toBe('2026-01')
  })
})

describe('bareUrl', () => {
  it('strips the scheme, www. and a trailing slash', () => {
    expect(bareUrl('https://www.linkedin.com/in/ada/')).toBe('linkedin.com/in/ada')
    expect(bareUrl('http://ada.dev')).toBe('ada.dev')
    expect(bareUrl(undefined)).toBe('')
  })
})

describe('splitList / splitBullets / joinParts', () => {
  it('splits comma lists and drops blanks', () => {
    expect(splitList(' React,  CSS ,, ')).toEqual(['React', 'CSS'])
  })

  it('removes typed bullet characters from each line', () => {
    expect(splitBullets('- one\n• two\n* three\n\nfour')).toEqual(['one', 'two', 'three', 'four'])
  })

  it('joins only non-empty parts', () => {
    expect(joinParts(['a', '', 'b', null])).toBe('a | b')
  })
})

describe('cvFileBase', () => {
  it('builds First_Last_CV and strips unsafe characters', () => {
    expect(cvFileBase('Ada Tan')).toBe('Ada_Tan_CV')
    expect(cvFileBase(' Ada / Tan? ')).toBe('Ada_Tan_CV')
    expect(cvFileBase('')).toBe('CV')
  })
})
