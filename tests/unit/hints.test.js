import { describe, expect, it } from 'vitest'
import { bulletHints } from '../../src/lib/hints.js'

const kinds = (text) => bulletHints(text).map((h) => h.kind)
const messages = (text) => bulletHints(text).map((h) => h.message)

describe('bulletHints', () => {
  it('says nothing for strong bullets or an empty field', () => {
    expect(bulletHints('Led a team of 5\nCut load time by 40%\nShipped the new checkout')).toEqual([])
    expect(bulletHints('')).toEqual([])
    expect(bulletHints('\n  \n')).toEqual([])
  })

  it('flags weak openings, with the line number as typed', () => {
    expect(messages('Built the app in 3 weeks\n\n- responsible for testing')).toEqual([
      'Line 3 starts with “Responsible for”. Start with what you did instead, e.g. “Led”, “Built”, “Cut”.',
    ])
    expect(kinds('Helped with 2 launches\nWorked on 3 apps\nAssisted in 4 audits')).toEqual(['weak', 'weak', 'weak'])
    // Only at the start of a line.
    expect(kinds('Led 4 engineers who were responsible for testing')).toEqual([])
  })

  it('flags lines over 30 words', () => {
    const long = Array.from({ length: 31 }, () => 'word').join(' ') + ' 5'
    expect(messages(long)).toEqual(['Line 1 is 32 words. Aim for under 30: one achievement per line.'])
    expect(kinds(Array.from({ length: 30 }, () => 'word').join(' ') + '1')).toEqual([])
  })

  it('flags the same opening verb on several lines', () => {
    expect(messages('Led 2 teams\nBuilt 3 apps\nled the migration\nLed hiring')).toEqual([
      '“Led” starts lines 1, 3 and 4. Vary the verbs.',
    ])
    // Weak openings are reported once, as weak.
    expect(kinds('Responsible for 2 apps\nResponsible for 3 apps')).toEqual(['weak', 'weak'])
  })

  it('asks for a number when no line has one', () => {
    expect(kinds('Built the checkout\nImproved onboarding')).toEqual(['numbers'])
    for (const text of ['Cut costs by 10%', 'Doubled sign-ups', 'Served thousands of users', 'Saved $2k']) {
      expect(kinds(text)).toEqual([])
    }
  })
})
