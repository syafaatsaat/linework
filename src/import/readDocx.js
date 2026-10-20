import JSZip from 'jszip'
import { fromCustomProperties } from '../cv/embedded.js'

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const BULLET_GLYPH = /^[•●▪■◦‣∙·*–-]\s+/

// Reads a .docx: the Linework data embedded by our own export when present,
// otherwise its paragraphs as lines for parseCv (see pdfLines.js for the shape).
export async function readDocx(buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml')?.async('string')
  if (!xml) throw new Error('not-docx')

  return {
    embedded: await readEmbedded(zip),
    lines: paragraphsToLines(new DOMParser().parseFromString(xml, 'application/xml')),
  }
}

async function readEmbedded(zip) {
  const xml = await zip.file('docProps/custom.xml')?.async('string')
  if (!xml) return null
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const properties = {}
  for (const property of doc.getElementsByTagName('property')) {
    properties[property.getAttribute('name')] = property.textContent
  }
  return fromCustomProperties(properties)
}

// Every paragraph in document order, including those inside table cells.
function paragraphsToLines(doc) {
  const lines = []

  for (const p of doc.getElementsByTagNameNS(W, 'p')) {
    const style = p.getElementsByTagNameNS(W, 'pStyle')[0]?.getAttributeNS(W, 'val') ?? ''
    const listItem = p.getElementsByTagNameNS(W, 'numPr').length > 0

    // Text runs, tabs and line breaks, in order. A tab separates parts
    // (e.g. a title and its right-aligned dates); a break starts a new line.
    let text = ''
    for (const node of p.getElementsByTagNameNS(W, '*')) {
      if (node.localName === 't') text += node.textContent
      else if (node.localName === 'tab' && node.parentNode.localName === 'r') text += '\t'
      else if (node.localName === 'br' || node.localName === 'cr') text += '\n'
    }

    for (const piece of text.split('\n')) {
      const parts = piece
        .split(/\t+/)
        .map((s) => s.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
      if (!parts.length) continue
      let joined = parts.join(' ')
      const bullet = listItem || BULLET_GLYPH.test(joined)
      if (bullet) joined = joined.replace(BULLET_GLYPH, '')
      lines.push({
        text: joined,
        parts: bullet ? [joined] : parts,
        bullet,
        heading: /^heading/i.test(style),
        title: /^title$/i.test(style),
      })
    }
  }

  return lines
}
