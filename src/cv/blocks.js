import { bareUrl, joinParts } from '../lib/format.js'
import { SECTION_TYPES } from '../sections/types.js'

// The one source the preview sheet, parser view and exports all read from.
// Takes the submitted snapshot from useCv ({ order, committed }), so drafts
// can't leak in, and follows the user's section order.
//
// Block kinds:
//   header  { name, contact, links }
//   heading { label }
//   item    { primary, meta, secondary, lead, body, bullets }
//
// Each block has a stable `id` so React and the paginator can track it.

function itemBlock(id, view) {
  return {
    id,
    kind: 'item',
    primary: view.primary || '',
    meta: view.meta || '',
    secondary: view.secondary || '',
    lead: view.lead || '',
    body: view.body || '',
    bullets: view.bullets || [],
  }
}

export function buildBlocks({ order, committed }) {
  const general = committed.general[0] || {}
  const blocks = [
    {
      id: 'header',
      kind: 'header',
      name: general.name || '[Your name]',
      contact: joinParts([general.email, general.phone, general.country]),
      links: joinParts([bareUrl(general.linkedin), bareUrl(general.portfolio)]),
    },
  ]

  if (general.summary) {
    blocks.push({ id: 'heading-summary', kind: 'heading', label: 'Summary' })
    blocks.push(itemBlock('item-summary', { body: general.summary }))
  }

  for (const key of order) {
    const type = SECTION_TYPES[key]
    const rows = committed[key]
    if (key === 'general' || rows.length === 0) continue

    blocks.push({ id: `heading-${key}`, kind: 'heading', label: type.sheet || type.label })
    rows.forEach((row, i) => blocks.push(itemBlock(`item-${key}-${i}`, type.view(row))))
  }

  return blocks
}

// Plain text in the order an ATS reads the sheet. Headings keep their sheet
// casing, since that's what text extraction from the PDF returns.
export function blocksToText(blocks) {
  const lines = []

  for (const block of blocks) {
    if (block.kind === 'header') {
      lines.push(block.name)
      if (block.contact) lines.push(block.contact)
      if (block.links) lines.push(block.links)
      lines.push('')
    } else if (block.kind === 'heading') {
      lines.push(block.label)
    } else {
      const head = joinParts([block.primary, block.meta])
      if (head) lines.push(head)
      if (block.lead) lines.push(`${block.lead}: ${block.secondary}`)
      else if (block.secondary) lines.push(block.secondary)
      if (block.body) lines.push(block.body)
      for (const bullet of block.bullets) lines.push(`• ${bullet}`)
      lines.push('')
    }
  }

  return lines.join('\n').trim()
}
