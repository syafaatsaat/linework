// Writing hints for bullet fields (one point per line): suggestions only,
// never errors, so they never block Submit. Lines are numbered as the user
// sees them in the textarea, blank lines included.
//
// Returns [{ kind, message }], kind one of: weak, long, repeat, numbers.

const MAX_WORDS = 30

// Openings that describe a duty rather than what you did.
const WEAK_OPENING =
  /^(responsible for|was responsible for|duties (?:included|include)|my role was|tasked with|in charge of|involved in|participated in|worked on|helped(?: with| to)?|assisted(?: with| in)?|handled)\b/i

// Digits, percentages and number words all count as a measurable result.
const NUMBER =
  /\d|%|\b(one|two|three|four|five|six|seven|eight|nine|ten|twice|double[sd]?|tripled?|half|halved|dozens?|hundreds?|thousands?|millions?|billions?)\b/i

const joinWithAnd = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])
const capitalize = (s) => s[0].toUpperCase() + s.slice(1)

export function bulletHints(text) {
  const lines = String(text || '')
    .split('\n')
    .map((raw, i) => ({ n: i + 1, text: raw.replace(/^\s*[-•*]\s*/, '').trim() }))
    .filter((line) => line.text)
  if (lines.length === 0) return []

  const hints = []
  const weak = new Set()

  for (const line of lines) {
    const opening = line.text.match(WEAK_OPENING)
    if (opening) {
      weak.add(line.n)
      hints.push({
        kind: 'weak',
        message: `Line ${line.n} starts with “${capitalize(opening[0])}”. Start with what you did instead, e.g. “Led”, “Built”, “Cut”.`,
      })
    }
    const words = line.text.split(/\s+/).length
    if (words > MAX_WORDS) {
      hints.push({ kind: 'long', message: `Line ${line.n} is ${words} words. Aim for under ${MAX_WORDS}: one achievement per line.` })
    }
  }

  // The same opening verb on several lines (weak openings are already flagged).
  const byVerb = new Map()
  for (const line of lines) {
    if (weak.has(line.n)) continue
    const verb = line.text.split(/\s+/)[0].replace(/[^\p{L}'-]/gu, '')
    if (verb.length < 3) continue
    const key = verb.toLowerCase()
    if (!byVerb.has(key)) byVerb.set(key, { verb: capitalize(verb), lines: [] })
    byVerb.get(key).lines.push(line.n)
  }
  for (const { verb, lines: at } of byVerb.values()) {
    if (at.length > 1) hints.push({ kind: 'repeat', message: `“${verb}” starts lines ${joinWithAnd(at)}. Vary the verbs.` })
  }

  if (!lines.some((line) => NUMBER.test(line.text))) {
    hints.push({ kind: 'numbers', message: 'No numbers yet. Add a result where you can: how many, how much, how fast.' })
  }

  return hints
}
