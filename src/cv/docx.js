import { BorderStyle, Document, HeadingLevel, Paragraph, TabStopType, TextRun } from 'docx'

export { Packer } from 'docx'

// Builds the Word version of the CV from the same blocks as the preview.
// ATS rules: one column, real Word headings and bullet lists, no tables,
// text boxes or header/footer content.

// Word measures in twips (1/1440 in) and half-points. CSS px are 1/96 in.
const twips = (px) => Math.round(px * 15)
const halfPoints = (px) => Math.round(px * 1.5)
const mmToTwips = (mm) => Math.round((mm / 25.4) * 1440)

// A4 with the same margins as the print stylesheet.
const PAGE = { width: mmToTwips(210), height: mmToTwips(297) }
const MARGIN = { y: mmToTwips(16), x: mmToTwips(18) }
const CONTENT_WIDTH = PAGE.width - 2 * MARGIN.x

const COLOR = { text: '16181D', muted: '3A4250', heading: '0B2A5B', rule: '1E5BB8' }

// Hanken Grotesk isn't on most machines that open the file; Arial is the
// fallback the template already names, and renders the same everywhere.
const FONT = 'Arial'

const styles = {
  default: {
    document: { run: { font: FONT, size: halfPoints(13), color: COLOR.text } },
    title: {
      run: { font: FONT, size: halfPoints(30), bold: true, color: COLOR.text },
      paragraph: { spacing: { after: twips(4) } },
    },
    heading1: {
      run: { font: FONT, size: halfPoints(14), bold: true, color: COLOR.heading },
      paragraph: {
        spacing: { before: twips(18), after: twips(4) },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.rule, space: 2 } },
        keepNext: true,
      },
    },
  },
}

// Paragraphs of one entry stay on one page: every paragraph but the last
// keeps with the next, and none splits across lines.
function keepTogether(paragraphs) {
  return paragraphs.map(
    (options, i) => new Paragraph({ ...options, keepLines: true, keepNext: i < paragraphs.length - 1 }),
  )
}

function headerParagraphs(block) {
  const contact = (text) => ({
    children: [new TextRun({ text, size: halfPoints(12.5), color: COLOR.muted })],
    spacing: { after: twips(2) },
  })
  return keepTogether([
    { heading: HeadingLevel.TITLE, children: [new TextRun(block.name)] },
    ...(block.contact ? [contact(block.contact)] : []),
    ...(block.links ? [contact(block.links)] : []),
  ])
}

function itemParagraphs(block, isFirstInSection) {
  const { primary, meta, secondary, lead, body, bullets } = block
  const parts = []

  if (primary) {
    // Title left, dates right-aligned with a tab stop: still one line of text.
    parts.push({
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
      children: [
        new TextRun({ text: primary, bold: true, size: halfPoints(13.5) }),
        ...(meta ? [new TextRun({ text: `\t${meta}`, size: halfPoints(12), color: COLOR.muted })] : []),
      ],
    })
  }
  if (lead) {
    parts.push({ children: [new TextRun({ text: `${lead}:`, bold: true }), new TextRun(` ${secondary}`)] })
  } else if (secondary) {
    parts.push({ children: [new TextRun({ text: secondary, color: COLOR.muted })] })
  }
  if (body) parts.push({ children: [new TextRun(body)] })
  for (const bullet of bullets) {
    parts.push({ bullet: { level: 0 }, children: [new TextRun(bullet)], spacing: { before: twips(2) } })
  }

  if (parts.length) {
    parts[0] = { ...parts[0], spacing: { ...parts[0].spacing, before: twips(isFirstInSection ? 6 : 8) } }
  }
  return keepTogether(parts)
}

export function buildDocument(blocks, name) {
  const children = []
  let afterHeading = false

  for (const block of blocks) {
    if (block.kind === 'header') {
      children.push(...headerParagraphs(block))
    } else if (block.kind === 'heading') {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(block.label)] }))
      afterHeading = true
      continue
    } else {
      children.push(...itemParagraphs(block, afterHeading))
    }
    afterHeading = false
  }

  return new Document({
    creator: name || 'Linework',
    title: name ? `${name} CV` : 'CV',
    styles,
    sections: [
      {
        properties: {
          page: {
            size: PAGE,
            margin: { top: MARGIN.y, bottom: MARGIN.y, left: MARGIN.x, right: MARGIN.x },
          },
        },
        children,
      },
    ],
  })
}
