import { describe, expect, it } from 'vitest'
import { blocksToText, buildBlocks } from '../../src/cv/blocks.js'
import { paginate } from '../../src/cv/paginate.js'
import { sample } from '../fixtures.js'

describe('buildBlocks', () => {
  const blocks = buildBlocks(sample)

  it('builds the header with contact and bare links lines', () => {
    expect(blocks[0]).toEqual({
      id: 'header',
      kind: 'header',
      name: 'Ada Tan',
      contact: 'ada@example.com | +65 8123 4567 | Singapore',
      links: 'linkedin.com/in/adatan | adatan.dev',
    })
  })

  it('follows the section order with standard headings', () => {
    const headings = blocks.filter((b) => b.kind === 'heading').map((b) => b.label)
    expect(headings).toEqual(['Summary', 'Skills', 'Work Experience', 'Education', 'Projects'])

    const moved = buildBlocks({ ...sample, order: ['general', 'edu', 'skills', 'exp', 'projects'] })
    expect(moved.filter((b) => b.kind === 'heading').map((b) => b.label)).toEqual([
      'Summary', 'Education', 'Skills', 'Work Experience', 'Projects',
    ])
  })

  it('leaves out blank optional fields and empty sections', () => {
    const general = { ...sample.committed.general[0], country: '', linkedin: '', portfolio: '', summary: '' }
    const sparse = buildBlocks({ order: sample.order, committed: { ...sample.committed, general: [general], projects: [] } })
    expect(sparse[0].contact).toBe('ada@example.com | +65 8123 4567')
    expect(sparse[0].links).toBe('')
    expect(sparse.some((b) => b.id === 'heading-summary' || b.id === 'heading-projects')).toBe(false)
  })

  it('shows a placeholder name before General is submitted', () => {
    const empty = buildBlocks({ order: ['general'], committed: { general: [] } })
    expect(empty).toHaveLength(1)
    expect(empty[0].name).toBe('[Your name]')
  })

  it('turns responsibilities into clean bullets and dates into one format', () => {
    const job = blocks.find((b) => b.id === 'item-exp-0')
    expect(job.bullets).toEqual(['Led the design system rebuild', 'Cut bundle size by 40%'])
    expect(job.meta).toBe('Mar 2021 – Present')
  })
})

describe('blocksToText (parser view)', () => {
  it('matches the expected ATS text', () => {
    expect(blocksToText(buildBlocks(sample))).toMatchInlineSnapshot(`
      "Ada Tan
      ada@example.com | +65 8123 4567 | Singapore
      linkedin.com/in/adatan | adatan.dev

      Summary
      Frontend engineer with six years of experience building accessible web apps in React.

      Skills
      Frontend: React, TypeScript, CSS

      Tools: Vite, Playwright

      Work Experience
      Senior Frontend Engineer | Mar 2021 – Present
      Acme Pte Ltd
      • Led the design system rebuild
      • Cut bundle size by 40%

      Frontend Developer | Jul 2018 – Feb 2021
      Globex
      • Built the checkout flow

      Education
      BSc Computer Science | Aug 2014 – May 2018
      National University of Singapore

      Projects
      Linework
      github.com/ada/linework
      A CV builder."
    `)
  })
})

describe('paginate', () => {
  const block = (id, kind = 'item') => ({ id, kind })

  it('puts everything on one page when it fits', () => {
    expect(paginate([block('a'), block('b')], [100, 100], 300)).toEqual([['a', 'b']])
  })

  it('never splits an entry, starting a new page instead', () => {
    expect(paginate([block('a'), block('b'), block('c')], [100, 150, 100], 300)).toEqual([['a', 'b'], ['c']])
  })

  it('never leaves a heading last on a page', () => {
    const blocks = [block('a'), block('h', 'heading'), block('b')]
    expect(paginate(blocks, [250, 20, 100], 300)).toEqual([['a'], ['h', 'b']])
  })

  it('gives a block taller than a page its own page', () => {
    expect(paginate([block('a'), block('big')], [100, 500], 300)).toEqual([['a'], ['big']])
  })

  it('falls back to one page without usable measurements', () => {
    expect(paginate([block('a'), block('b')], [100], 300)).toEqual([['a', 'b']])
    expect(paginate([block('a')], [100], 0)).toEqual([['a']])
    expect(paginate([], [], 300)).toEqual([[]])
  })
})
