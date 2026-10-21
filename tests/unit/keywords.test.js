import { describe, expect, it } from 'vitest'
import { blocksToText, buildBlocks } from '../../src/cv/blocks.js'
import { extractKeywords, matchKeywords } from '../../src/cv/keywords.js'
import { sample } from '../fixtures.js'

const terms = (ad) => extractKeywords(ad).map((k) => k.term)

const AD = `Senior Frontend Engineer

We're looking for a Senior Frontend Engineer to join our Design Systems team in Singapore.

What you'll do:
- Build and maintain our React component library and design system
- Work with TypeScript, Next.js and GraphQL to ship accessible, performant UIs
- Own frontend testing with Jest and Playwright, and improve our CI/CD pipelines

Requirements:
- 5+ years of experience in front-end development
- Strong knowledge of React, TypeScript and CSS
- Familiarity with AWS or Google Cloud is a plus`

describe('extractKeywords', () => {
  const found = terms(AD)

  it('ranks named tools and repeated terms first', () => {
    expect(found.slice(0, 6)).toEqual(['Senior Frontend Engineer', 'Design Systems', 'Frontend', 'React', 'TypeScript', 'Google Cloud'])
  })

  it('keeps tech names whole', () => {
    expect(found).toEqual(expect.arrayContaining(['Next.js', 'CI/CD', 'GraphQL', 'AWS', 'CSS']))
  })

  it('drops stop words, job-ad filler, numbers and contraction fragments', () => {
    for (const word of ['experience', 'years', 'Strong', 'team', '5+', 're', 'll', 'We', 'plus']) {
      expect(found).not.toContain(word)
    }
  })

  it('lets a longer phrase absorb the words inside it, but not their other uses', () => {
    expect(found).not.toContain('Frontend Engineer')
    expect(found).not.toContain('Senior')
    // "frontend testing" and "front-end development" still count for Frontend.
    expect(found).toContain('Frontend')
  })

  it('keeps a lowercase phrase only when the ad repeats it', () => {
    expect(terms('Experience with design tokens. You will own design tokens.')).toContain('design tokens')
    expect(terms('Experience with design tokens.')).not.toContain('design tokens')
  })

  it('caps the list and handles empty input', () => {
    const long = Array.from({ length: 60 }, (_, i) => `Tool${i}`).join(', ')
    expect(extractKeywords(long)).toHaveLength(25)
    expect(extractKeywords('')).toEqual([])
    expect(extractKeywords(undefined)).toEqual([])
  })
})

describe('matchKeywords', () => {
  const cv = blocksToText(buildBlocks(sample))

  it('splits terms into found and missing, keeping rank order', () => {
    const { found, missing } = matchKeywords(extractKeywords(AD), cv)
    expect(found.slice(0, 5)).toEqual(['Senior Frontend Engineer', 'Design Systems', 'Frontend', 'React', 'TypeScript'])
    expect(missing.slice(0, 3)).toEqual(['Google Cloud', 'Next.js', 'GraphQL'])
  })

  it('matches across word forms, hyphens, dots and spacing', () => {
    const match = (ad, text) => matchKeywords(extractKeywords(ad), text).found
    expect(match('Designing APIs, designing APIs', 'Designed API endpoints')).toEqual(['Designing APIs'])
    expect(match('Strong Node.js skills', 'Built services in NodeJS')).toEqual(['Node.js'])
    expect(match('Front-end performance, front-end performance', 'Frontend performance work')).toEqual([
      'Front-end performance',
    ])
    expect(match('Kubernetes', 'kubernetes')).toEqual(['Kubernetes'])
  })

  it('does not match across punctuation', () => {
    const keywords = extractKeywords('Google Cloud')
    expect(matchKeywords(keywords, 'Google, Cloud').found).toEqual([])
  })
})
