// Turns PDF.js text items into reading-order lines for parseCv.
//
// Line shape (shared with readDocx):
//   { text, parts, bullet, heading?, title?, size? }
// `parts` are the line's visually separate runs, e.g. a job title on the left
// and its dates pushed to the right, so parsers can tell them apart.

const BULLET_GLYPH = /^[•●▪■◦‣∙·*–-]\s+/

// pages: [{ items: [{ str, transform, width, height }] }]
export function pdfItemsToLines(pages) {
  const raw = []

  for (const page of pages) {
    const items = page.items
      .filter((item) => item.str && item.str.trim())
      .map((item) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        size: Math.hypot(item.transform[2], item.transform[3]) || item.height || 10,
      }))
      .sort((a, b) => b.y - a.y || a.x - b.x)

    // Group into rows by baseline, then split each row where there's a wide gap.
    const rows = []
    for (const item of items) {
      const row = rows.at(-1)
      if (row && Math.abs(row.y - item.y) <= Math.max(2, item.size * 0.3)) row.items.push(item)
      else rows.push({ y: item.y, items: [item] })
    }

    for (const row of rows) {
      row.items.sort((a, b) => a.x - b.x)
      const parts = []
      let prev = null
      for (const item of row.items) {
        const gap = prev ? item.x - (prev.x + prev.width) : 0
        if (!prev || gap > prev.size * 1.5) parts.push(item.str.trim())
        else parts[parts.length - 1] += (gap > prev.size * 0.15 && !/\s$/.test(prev.str) ? ' ' : '') + item.str.trim()
        prev = item
      }
      const text = parts.join(' ').replace(/\s+/g, ' ').trim()
      if (!text || /^(page\s*)?\d+(\s*(of|\/)\s*\d+)?$/i.test(text)) continue // page numbers
      raw.push({ text, parts, x: row.items[0].x, size: Math.max(...row.items.map((i) => i.size)) })
    }
  }

  return markBullets(raw)
}

// List markers usually aren't in the text layer, so a line indented past the
// body's left edge counts as a bullet. Wrapped bullet lines (starting in
// lowercase) are joined back onto the bullet they continue.
function markBullets(lines) {
  const counts = new Map()
  for (const line of lines) {
    const x = Math.round(line.x)
    counts.set(x, (counts.get(x) ?? 0) + 1)
  }
  const baseX = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0

  const out = []
  for (const line of lines) {
    let { text } = line
    let bullet = false
    if (BULLET_GLYPH.test(text)) {
      text = text.replace(BULLET_GLYPH, '')
      bullet = true
    } else if (line.x > baseX + line.size * 0.8 && line.parts.length === 1) {
      bullet = true
    }

    const prev = out.at(-1)
    if (bullet && prev?.bullet && /^[a-z]/.test(text) && !BULLET_GLYPH.test(line.text)) {
      prev.text += ' ' + text
      prev.parts = [prev.text]
      continue
    }
    const parts = bullet ? [text] : line.parts
    out.push({ text, parts, bullet, size: line.size })
  }
  return out
}
