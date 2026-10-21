// Keyword match: which key terms from a pasted job ad appear in the CV.
// Rule-based and client-side. Terms are single words and two-word phrases,
// ranked by how often the ad uses them, with a boost for names written with
// capitals or symbols (TypeScript, AWS, CI/CD), which are usually the tools
// and skills an ATS filters on.

const STOP_WORDS = new Set(
  `a about above across after again against all also am among an and any are as at be because been before being
  below between both but by can could did do does doing down during each either else etc even ever every few for
  from further get gets got had has have having he her here hers him his how i if in into is it its itself just
  least less like may me might more most must my no nor not now of off on once one only or other our ours out over
  own per rather same shall she should since so some such than that the their theirs them then there these they
  this those through thus to too under until up upon us very via was we were what when where whether which while
  who whom whose why will with within without would yet you your yours`.split(/\s+/),
)

// Words every job ad uses that say nothing about the job itself.
const AD_WORDS = new Set(
  `ability able across apply applicant applicants application benefit benefits bonus candidate candidates career
  company competitive culture day days environment equal ensure excellent experience experienced expertise familiar
  familiarity fast good great help hire hiring ideal include includes including job join knowledge looking level
  location make need needs new offer offers opportunity opportunities paced passion passionate plus position
  preferred proven provide qualification qualifications range related relevant requirement requirements required
  responsibilities responsibility responsible role salary seeking skill skills strong success successful take team
  teams understanding use using want well work working world year years`.split(/\s+/),
)

const MAX_TERMS = 25
const MAX_WORDS = 3 // longest phrase

// Words, keeping tech names and hyphenated words whole: "node.js", "ci/cd",
// "c++", "c#", "front-end". A
// sentence's final full stop isn't part of a word, since a dot must be
// followed by a letter or digit. Apostrophes are kept so contractions
// ("we're") stay one word instead of leaving fragments.
const WORD = /[a-z0-9][a-z0-9+#]*(?:['’][a-z]+)?(?:[./-][a-z0-9+#]+)*/gi
// Punctuation between two words that ends a phrase.
const BREAK = /[,.;:!?()[\]{}\n•|]/

// "designs" / "designed" / "designing" → "design", so wording differences
// between the ad and the CV still match. Applied to both sides alike.
function stem(word) {
  if (!/^[a-z]+$/.test(word)) return word
  if (word.length <= 4) return /^[a-z]{2,}[^su]s$/.test(word) ? word.slice(0, -1) : word // "APIs" → "api"
  if (/ing$/.test(word) && word.length > 6) return word.slice(0, -3)
  if (/ed$/.test(word) && word.length > 5) return word.slice(0, -2)
  if (/ies$/.test(word)) return word.slice(0, -3) + 'y'
  if (/[^su]s$/.test(word)) return word.slice(0, -1)
  return word
}

// "Node.js" and "NodeJS", "front end" and "front-end" and "frontend".
const squash = (key) => key.replace(/[\s./-]/g, '')

function tokenize(text) {
  const tokens = []
  let last = 0
  for (const match of text.matchAll(WORD)) {
    // "company's" → "company"; other contractions ("we're") get no key.
    const word = match[0].replace(/['’]s$/i, '')
    const contraction = /['’]/.test(word)
    tokens.push({
      word,
      // "front-end" and "frontend" are one term.
      key: contraction ? '' : stem(word.toLowerCase().replace(/-/g, '')),
      // A phrase can't span punctuation like a comma or full stop.
      joined: tokens.length > 0 && !BREAK.test(text.slice(last, match.index)),
      // Capitalised mid-sentence, or written with capitals inside / symbols / digits.
      marked: /[A-Z].*[A-Z]|[+#/.\d]/.test(word) || (/^[A-Z]/.test(word) && !startsSentence(text, match.index)),
      capital: /^[A-Z]/.test(word),
    })
    last = match.index + match[0].length
  }
  return tokens
}

function startsSentence(text, index) {
  const before = text.slice(0, index).trimEnd()
  return before === '' || /[.!?:\n•*-]$/.test(before)
}

const isCandidate = (token) =>
  token.key.length > 1 &&
  !/^\d+[+%]?$/.test(token.key) && // "5", "5+", "40%"
  // Checked on the word as written, since stemming can change it ("this" → "thi").
  !STOP_WORDS.has(token.word.toLowerCase()) &&
  !AD_WORDS.has(token.word.toLowerCase())

// The phrases of 1–3 candidate words starting at token i: [{ key, term, n, marked }].
// A phrase is a name when every word is capitalised, even at the start of a
// line ("Senior Frontend Engineer" as the ad's title).
function phrasesAt(tokens, i, candidate = isCandidate) {
  const phrases = []
  let key = ''
  let term = ''
  let marked = true
  for (let n = 1; n <= MAX_WORDS; n++) {
    const token = tokens[i + n - 1]
    if (!token || !candidate(token) || (n > 1 && !token.joined)) break
    key += (n > 1 ? ' ' : '') + token.key
    term += (n > 1 ? ' ' : '') + token.word
    marked &&= token.marked || token.capital
    phrases.push({ key, term, n, marked: n > 1 ? marked : token.marked })
  }
  return phrases
}

// Ranked key terms of a job ad: [{ term, key }].
export function extractKeywords(adText) {
  const tokens = tokenize(String(adText || ''))
  const terms = new Map() // key → { term, key, n, at: [token index], marked }

  tokens.forEach((_, i) => {
    for (const { key, term, n, marked } of phrasesAt(tokens, i)) {
      const entry = terms.get(key) ?? terms.set(key, { term, key, n, at: [], marked: false }).get(key)
      entry.at.push(i)
      entry.marked ||= marked
    }
  })

  // A phrase counts when the ad repeats it or writes it as a name ("Google
  // Cloud"). Longest first: a phrase or word only counts its uses outside a
  // longer phrase that was kept ("Senior Frontend Engineer" absorbs
  // "Frontend Engineer", but "frontend testing" still counts for "frontend").
  const covered = new Set() // "tokenIndex" covered by a kept phrase
  const kept = []
  for (const entry of [...terms.values()].sort((a, b) => b.n - a.n)) {
    const free = entry.at.filter((i) => !covered.has(i))
    if (free.length === 0) continue
    if (entry.n > 1 && free.length < 2 && !entry.marked) continue
    entry.count = free.length
    kept.push(entry)
    if (entry.n > 1) for (const i of free) for (let k = 0; k < entry.n; k++) covered.add(i + k)
  }

  const score = (t) => t.count * t.n + (t.marked ? 2 : 0)
  return kept
    .sort((a, b) => score(b) - score(a) || a.at[0] - b.at[0])
    .slice(0, MAX_TERMS)
    .map(({ term, key }) => ({ term, key }))
}

// Which of `keywords` the CV text uses. Returns { found: [term], missing: [term] }
// in ranked order.
export function matchKeywords(keywords, cvText) {
  const tokens = tokenize(String(cvText || ''))
  const present = new Set()
  tokens.forEach((token, i) => {
    // Unstemmed too: "NodeJS" stems to "nodej" but should match "Node.js".
    present.add(token.word.toLowerCase().replace(/-/g, ''))
    for (const { key } of phrasesAt(tokens, i, (t) => t.key !== '')) {
      present.add(key)
      present.add(squash(key))
    }
  })

  const found = []
  const missing = []
  for (const keyword of keywords) {
    const hit = present.has(keyword.key) || present.has(squash(keyword.key))
    ;(hit ? found : missing).push(keyword.term)
  }
  return { found, missing }
}
