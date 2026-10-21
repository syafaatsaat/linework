import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { buildBlocks } from '../../src/cv/blocks.js'
import { Packer, buildDocument } from '../../src/cv/docx.js'
import { fromCustomProperties, toCustomProperties } from '../../src/cv/embedded.js'
import { sample } from '../fixtures.js'

describe('embedded data', () => {
  it('splits into properties under Word’s 255-character limit and joins back', () => {
    const props = toCustomProperties(sample)
    expect(props.every((p) => p.value.length <= 255)).toBe(true)
    const map = Object.fromEntries(props.map((p) => [p.name, p.value]))
    expect(fromCustomProperties(map)).toEqual({ order: sample.order, committed: sample.committed })
  })

  it('returns null for files that weren’t exported by Linework or are incomplete', () => {
    expect(fromCustomProperties({})).toBeNull()
    expect(fromCustomProperties({ 'linework.v1.count': '2', 'linework.v1.0': '{}' })).toBeNull()
    expect(fromCustomProperties({ 'linework.v1.count': '1', 'linework.v1.0': '{not json' })).toBeNull()
  })
})

describe('buildDocument', async () => {
  const buffer = await Packer.toBuffer(buildDocument(buildBlocks(sample), 'Ada Tan', sample))
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  const text = (fragment) => [...fragment.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('')
  const paragraphs = [...xml.matchAll(/<w:p>.*?<\/w:p>|<w:p [^>]*>.*?<\/w:p>/gs)].map((m) => m[0])

  it('uses real Word headings for section titles', () => {
    const headings = paragraphs.filter((p) => p.includes('w:val="Heading1"')).map(text)
    expect(headings).toEqual(['Summary', 'Skills', 'Work Experience', 'Education', 'Projects'])
    expect(paragraphs.filter((p) => p.includes('w:val="Title"')).map(text)).toEqual(['Ada Tan'])
  })

  it('uses a real bullet list for responsibilities', () => {
    const bullets = paragraphs.filter((p) => p.includes('<w:numPr>')).map(text)
    expect(bullets).toEqual(['Led the design system rebuild', 'Cut bundle size by 40%', 'Built the checkout flow'])
  })

  it('has a single A4 column with no tables, text boxes or images', () => {
    expect(xml).not.toMatch(/<w:tbl>|<w:txbxContent|<w:drawing|<w:cols w:num="[2-9]"/)
    expect(xml).toMatch(/<w:pgSz w:w="11906" w:h="16838"/)
    expect(zip.file(/^word\/header/)).toHaveLength(0)
  })

  it('embeds the CV data as custom properties', async () => {
    const custom = await zip.file('docProps/custom.xml').async('string')
    const props = {}
    for (const m of custom.matchAll(/name="([^"]+)"[^>]*>\s*<vt:lpwstr>([^<]*)<\/vt:lpwstr>/g)) {
      props[m[1]] = m[2].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    }
    expect(fromCustomProperties(props)).toEqual({ order: sample.order, committed: sample.committed })
  })
})
