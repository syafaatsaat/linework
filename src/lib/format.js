const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "2020-07" → "Jul 2020". Blank stays blank.
export function formatMonth(value) {
  if (!value) return ''
  const [year, month] = String(value).split('-')
  const m = Number(month)
  return (m ? MONTHS[m - 1] + ' ' : '') + year
}

// Orders two month values ("YYYY-MM" or "YYYY"). When either lacks a month
// and the years match, they count as equal: "2020" isn't after "2020-03".
export function compareMonths(a, b) {
  const [ya, ma] = String(a).split('-').map(Number)
  const [yb, mb] = String(b).split('-').map(Number)
  if (ya !== yb) return ya - yb
  return ma && mb ? ma - mb : 0
}

// This month as "YYYY-MM".
export function currentMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// "Jul 2020 – Present". A blank end date means the role is ongoing.
export function formatRange(from, to) {
  return (formatMonth(from) || '—') + ' – ' + (formatMonth(to) || 'Present')
}

// Strip protocol, "www." and a trailing slash so links print as readable text.
export function bareUrl(url) {
  return String(url || '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

export function splitList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// One responsibility per line, with any typed bullet character removed.
export function splitBullets(value) {
  return String(value || '')
    .split('\n')
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

export function joinParts(parts, separator = ' | ') {
  return parts.filter(Boolean).join(separator)
}
