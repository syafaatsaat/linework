const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "2020-07" → "Jul 2020". Blank stays blank.
export function formatMonth(value) {
  if (!value) return ''
  const [year, month] = String(value).split('-')
  const m = Number(month)
  return (m ? MONTHS[m - 1] + ' ' : '') + year
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
