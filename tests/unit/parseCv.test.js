import { describe, expect, it } from 'vitest'
import { buildBlocks } from '../../src/cv/blocks.js'
import { parseCv } from '../../src/import/parseCv.js'
import { full, sample } from '../fixtures.js'

// Lines in the shape readDocx produces (see pdfLines.js), here built from
// Linework's own blocks: what importing one of its exports without the
// embedded data looks like.
function blocksToLines(blocks) {
  const line = (text, extra = {}) => ({ text, parts: [text], bullet: false, ...extra })
  const lines = []
  for (const b of blocks) {
    if (b.kind === 'header') {
      lines.push(line(b.name, { title: true }))
      if (b.contact) lines.push(line(b.contact))
      if (b.links) lines.push(line(b.links))
    } else if (b.kind === 'heading') {
      lines.push(line(b.label, { heading: true }))
    } else {
      if (b.primary) {
        const parts = [b.primary, b.meta].filter(Boolean)
        lines.push({ text: parts.join(' '), parts, bullet: false })
      }
      if (b.lead) lines.push(line(`${b.lead}: ${b.secondary}`))
      else if (b.secondary) lines.push(line(b.secondary))
      if (b.body) lines.push(line(b.body))
      for (const bullet of b.bullets) lines.push(line(bullet, { bullet: true }))
    }
  }
  return lines
}

describe('parseCv', () => {
  const { data, review, notes } = parseCv(blocksToLines(buildBlocks(sample)))

  it('reads the header', () => {
    expect(data.committed.general[0]).toEqual({
      name: 'Ada Tan',
      email: 'ada@example.com',
      phone: '+65 8123 4567',
      country: 'Singapore',
      linkedin: 'linkedin.com/in/adatan',
      portfolio: 'adatan.dev',
      summary: sample.committed.general[0].summary,
    })
    expect(notes).toEqual([])
  })

  it('keeps the section order and flags imported sections for review', () => {
    expect(data.order).toEqual(sample.order)
    expect(review).toEqual(sample.order)
  })

  it('reads skills, experience, education and projects', () => {
    expect(data.committed.skills).toEqual(sample.committed.skills)
    expect(data.committed.exp).toEqual([
      { company: 'Acme Pte Ltd', position: 'Senior Frontend Engineer', responsibilities: 'Led the design system rebuild\nCut bundle size by 40%', from: '2021-03', until: '' },
      { company: 'Globex', position: 'Frontend Developer', responsibilities: 'Built the checkout flow', from: '2018-07', until: '2021-02' },
    ])
    expect(data.committed.edu).toEqual(sample.committed.edu)
    expect(data.committed.projects).toEqual([{ name: 'Linework', link: 'github.com/ada/linework', description: 'A CV builder.' }])
  })

  it('reads volunteering, awards and publications', () => {
    const result = parseCv(blocksToLines(buildBlocks(full)))
    expect(result.data.order).toEqual(full.order)
    expect(result.data.committed.volunteer).toEqual(full.committed.volunteer)
    expect(result.data.committed.awards).toEqual(full.committed.awards)
    expect(result.data.committed.publications).toEqual([{ ...full.committed.publications[0], link: 'example.com/tokens' }])
    expect(result.notes).toEqual([])
  })

  it('maps heading variants of the new sections and puts the role first', () => {
    const line = (text, extra = {}) => ({ text, parts: [text], bullet: false, ...extra })
    const result = parseCv([
      line('Sam Lee', { title: true }),
      line('sam@example.com | 555 0100 200'),
      line('Community Involvement', { heading: true }),
      { text: 'Red Cross | Volunteer 2018 - 2020', parts: ['Red Cross | Volunteer', '2018 - 2020'], bullet: false },
      line('Honours and Awards', { heading: true }),
      { text: 'Best Paper Award, IEEE 2021', parts: ['Best Paper Award, IEEE', '2021'], bullet: false },
    ])
    expect(result.data.committed.volunteer).toEqual([
      { organization: 'Red Cross', role: 'Volunteer', description: '', from: '2018', until: '2020' },
    ])
    expect(result.data.committed.awards).toEqual([{ name: 'Best Paper Award', issuer: 'IEEE', date: '2021', description: '' }])
    expect(result.notes.join(' ')).not.toMatch(/Skipped/)
  })

  it('recognises common heading variants and letter-spaced headings', () => {
    const line = (text, extra = {}) => ({ text, parts: [text], bullet: false, ...extra })
    const result = parseCv([
      line('JAMIE RIVERA'),
      line('jamie@example.com | +1 555 010 2030'),
      line('E X P E R I E N C E'),
      { text: 'Designer at Initech Jan 2019 - Present', parts: ['Designer at Initech', 'Jan 2019 - Present'], bullet: false },
      line('Technical Skills'),
      line('Figma, Sketch; HTML'),
      line('Hobbies'),
      line('Climbing'),
      line('Languages'),
      line('English (native), Spanish: conversational'),
    ])
    expect(result.data.committed.general[0].name).toBe('Jamie Rivera')
    expect(result.data.committed.exp).toEqual([
      { company: 'Initech', position: 'Designer', responsibilities: '', from: '2019-01', until: '' },
    ])
    expect(result.data.committed.skills).toEqual([{ category: '', items: 'Figma, Sketch, HTML' }])
    expect(result.data.committed.languages).toEqual([
      { language: 'English', proficiency: 'Native' },
      { language: 'Spanish', proficiency: 'Conversational' },
    ])
    // Required sections that weren't found still appear, empty.
    expect(result.data.order).toEqual(['general', 'exp', 'skills', 'languages', 'edu'])
    expect(result.notes).toContain("Skipped sections Linework doesn't have: Hobbies.")
  })

  it('notes missing contact details', () => {
    const result = parseCv([{ text: 'Sam Lee', parts: ['Sam Lee'], bullet: false, title: true }])
    expect(result.notes).toContain("Couldn't find your email, phone. Add them in General.")
  })
})
