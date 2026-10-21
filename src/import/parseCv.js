import { PROFICIENCY_LEVELS, SECTION_TYPES, SUMMARY_MAX } from '../sections/types.js'

// Rule-based mapping from extracted lines (see pdfLines.js) to Linework's
// sections. Works well on single-column CVs with standard headings, including
// Linework's own PDFs; layouts with columns or tables come out rougher, which
// is why imported sections are flagged for the user to check.
//
// Returns { data: { order, committed }, review: [sectionKey], notes: [string] }.

const HEADINGS = {
  summary: ['summary', 'profile', 'professional summary', 'career summary', 'about', 'about me', 'objective', 'career objective', 'personal statement', 'overview', 'personal profile'],
  exp: ['work experience', 'experience', 'professional experience', 'employment', 'employment history', 'work history', 'career history', 'practical experience', 'relevant experience', 'working experience'],
  edu: ['education', 'academic background', 'education and training', 'academic qualifications', 'qualifications', 'academic history'],
  skills: ['skills', 'technical skills', 'key skills', 'core skills', 'skills and abilities', 'competencies', 'core competencies', 'technologies', 'tech stack', 'skills and tools', 'tools and technologies'],
  projects: ['projects', 'personal projects', 'selected projects', 'side projects', 'key projects', 'academic projects'],
  certs: ['certifications', 'certificates', 'certification', 'licenses and certifications', 'licences and certifications', 'courses and certifications', 'certifications and courses', 'courses', 'training'],
  languages: ['languages', 'language skills', 'spoken languages', 'language'],
  // Recognised so their content isn't mixed into the section before them,
  // but Linework has nowhere to put it.
  skip: ['references', 'referees', 'interests', 'hobbies', 'hobbies and interests', 'volunteering', 'volunteer experience', 'volunteer work', 'awards', 'achievements', 'awards and achievements', 'honours and awards', 'publications', 'activities', 'extracurricular activities', 'leadership', 'memberships', 'additional information'],
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }
const MONTH = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)'
const DATE = `(?:${MONTH}\\.?\\s+\\d{4}|\\d{1,2}[/.]\\d{4}|\\d{4}-\\d{2}|(?:19|20)\\d{2})`
const PRESENT = '(?:present|current|now|today|ongoing)'
const RANGE = new RegExp(`(${DATE})\\s*(?:–|—|-|to|until|till)\\s*(${DATE}|${PRESENT})`, 'i')
const ONLY_DATE = new RegExp(`^(${DATE})$`, 'i')

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/
const PHONE = /\+?\d[\d\s().-]{6,}\d/
// A link needs a scheme, www., or a common domain ending, so "Node.js" isn't one.
const URL = /\bhttps?:\/\/[^\s|,]+|\b(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|dev|io|org|net|app|me|co|ai|sg|uk|us|ca|au|de|xyz|site|page|tech|edu|gov|info|so|design)\b(?:\/[^\s|,]*)?/gi
const DEGREE = /\b(b\.?sc|b\.?a|b\.?eng|b\.?com|m\.?sc|m\.?a|m\.?eng|mba|ph\.?d|bachelor|master|doctor|diploma|degree|certificate|associate|a[- ]levels?|o[- ]levels?|high school|gce|igcse|honours|hons)\b/i

// Words that mark a line as a job title rather than a company name.
const JOB_TITLE = /\b(engineer|developer|manager|designer|analyst|intern|lead|director|consultant|specialist|officer|assistant|architect|scientist|coordinator|administrator|head|executive|associate|technician|teacher|lecturer|nurse|researcher|programmer|founder|ceo|cto|cfo|vp|president|accountant|editor|writer|producer|supervisor|representative|advisor|trainee|apprentice|owner|partner|tutor|instructor|strategist|marketer|recruiter|planner|operator|agent|clerk)s?\b/i

const words = (s) => s.split(/\s+/).filter(Boolean).length

// "JAMIE RIVERA" → "Jamie Rivera"; mixed-case names are left alone.
const fixCaps = (s) => (/[a-z]/.test(s) ? s : s.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (c) => c.toUpperCase()))

function normalizeHeading(text) {
  let t = text.trim()
  if (/^([A-Za-z] )+[A-Za-z]:?$/.test(t)) t = t.replace(/ /g, '') // "E D U C A T I O N"
  return t
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function headingKey(line, bodySize) {
  if (line.bullet) return null
  // Count words after normalizing, so a letter-spaced heading counts as one.
  const name = normalizeHeading(line.text)
  if (words(name) > 5) return null
  for (const [key, names] of Object.entries(HEADINGS)) if (names.includes(name)) return key
  // An unrecognised heading: a Word heading style, or (in a PDF) a short
  // all-caps line set larger than the body text. Size matters so a company
  // name written in capitals isn't mistaken for a heading.
  const caps = /^[A-Z][A-Z &/]{5,}$/.test(line.text.trim()) && line.size > bodySize * 1.05
  return line.heading || caps ? 'skip' : null
}

// "Jul 2020" / "07/2020" / "2020-07" → "2020-07"; a bare year stays "2020".
function toMonth(text) {
  const t = text.trim().toLowerCase()
  let m = t.match(new RegExp(`^(${MONTH})\\.?\\s+(\\d{4})$`))
  if (m) return `${m[2]}-${String(MONTHS[m[1].slice(0, 3)]).padStart(2, '0')}`
  if ((m = t.match(/^(\d{1,2})[/.](\d{4})$/))) return `${m[2]}-${m[1].padStart(2, '0')}`
  if (/^\d{4}-\d{2}$/.test(t)) return t
  if (/^\d{4}$/.test(t)) return t
  return ''
}

function parseRange(text) {
  const m = text.match(RANGE)
  if (!m) return null
  const end = new RegExp(`^${PRESENT}$`, 'i').test(m[2]) ? '' : toMonth(m[2])
  return { from: toMonth(m[1]), to: end, raw: m[0] }
}

function splitSections(lines) {
  const buckets = { header: [] }
  const appearance = []
  const skipped = []
  let current = 'header'
  const sizes = lines.map((l) => l.size).filter(Boolean).sort((a, b) => a - b)
  const bodySize = sizes[Math.floor(sizes.length / 2)] ?? Infinity
  for (const line of lines) {
    const key = headingKey(line, bodySize)
    if (key) {
      current = key
      if (key === 'skip') skipped.push(fixCaps(line.text.trim()))
      else if (!appearance.includes(key)) appearance.push(key)
      buckets[key] ??= []
      continue
    }
    buckets[current].push(line)
  }
  return { buckets, appearance, skipped }
}

// ---------- Header (name and contact details) ----------

function parseHeader(lines, notes) {
  const row = { name: '', email: '', phone: '', country: '', linkedin: '', portfolio: '', summary: '' }
  const isContact = (l) => EMAIL.test(l.text) || PHONE.test(l.text) || /linkedin\.com|https?:\/\/|www\./i.test(l.text)

  const nameLine =
    lines.find((l) => l.title) ??
    [...lines]
      .filter((l) => !isContact(l) && words(l.text) <= 5)
      .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))[0]
  row.name = fixCaps(nameLine?.text.trim() ?? '')

  const contactLines = lines.filter(isContact)
  const contact = contactLines.map((l) => l.text).join(' | ')
  row.email = contact.match(EMAIL)?.[0] ?? ''
  row.phone = contact.replace(EMAIL, ' ').match(PHONE)?.[0].trim() ?? ''
  const urls = contact.replace(new RegExp(EMAIL.source, 'g'), ' ').match(URL) ?? []
  row.linkedin = urls.find((u) => /linkedin\.com/i.test(u)) ?? ''
  row.portfolio = urls.find((u) => !/linkedin\.com/i.test(u)) ?? ''

  // Country: a short plain-word token on a contact line, e.g. "… | Singapore".
  for (const line of contactLines) {
    for (const token of line.text.split(/\s*[|•·]\s*/)) {
      if (!EMAIL.test(token) && !/\d|\.|\//.test(token) && /^[A-Za-z][A-Za-z ,'-]*$/.test(token) && words(token) <= 3) {
        row.country = token.trim()
        break
      }
    }
    if (row.country) break
  }

  // A paragraph under the name with no Summary heading is usually the summary.
  // It starts at the first long line; the lines after it are its wrapped rest.
  const rest = lines.filter((l) => l !== nameLine && !contactLines.includes(l))
  const start = rest.findIndex((l) => words(l.text) >= 8)
  if (start >= 0) row.summary = rest.slice(start).map((l) => l.text).join(' ')

  const missing = ['name', 'email', 'phone'].filter((k) => !row[k])
  if (missing.length) notes.add(`Couldn't find your ${missing.join(', ')}. Add ${missing.length > 1 ? 'them' : 'it'} in General.`)
  return row
}

function setSummary(row, lines, notes) {
  const text = lines.map((l) => l.text).join(' ').replace(/\s+/g, ' ').trim()
  if (!text) return
  if (text.length <= SUMMARY_MAX) {
    row.summary = text
    return
  }
  const cut = text.slice(0, SUMMARY_MAX)
  const sentenceEnd = cut.lastIndexOf('. ')
  row.summary = sentenceEnd > SUMMARY_MAX * 0.6 ? cut.slice(0, sentenceEnd + 1) : cut
  notes.add(`Your summary was longer than ${SUMMARY_MAX} characters, so it was shortened.`)
}

// ---------- Entries (experience, education, projects, certifications) ----------

// Groups a section's lines into entries: short header lines (title, company,
// school…), longer body text, bullets, and any dates found along the way.
function toEntries(lines) {
  const entries = []
  let cur = null
  const start = () => {
    cur = { head: [], body: [], bullets: [], range: null, date: '' }
    entries.push(cur)
  }

  for (const line of lines) {
    if (line.bullet) {
      if (!cur) start()
      cur.bullets.push(line.text)
      continue
    }

    let text = line.text
    const range = parseRange(text)
    if (range) text = text.replace(range.raw, ' ')
    const datePart = !range && line.parts.find((p) => ONLY_DATE.test(p.trim()))
    if (datePart) text = text.replace(datePart, ' ')
    text = text.replace(/\s+/g, ' ').replace(/^[\s|,·–—-]+|[\s|,·–—-]+$/g, '').trim()

    const lastBody = cur?.body.at(-1)
    if (text && lastBody && (!/[.!?]$/.test(lastBody) || /^[a-z]/.test(text)) && !range && !datePart) {
      cur.body[cur.body.length - 1] += ' ' + text // wrapped paragraph line
      continue
    }

    const isBody = words(text) > 12 || (/[.!?]$/.test(text) && words(text) > 6)
    const hasDate = range || datePart
    if (!cur || cur.bullets.length || (cur.body.length && !isBody) || (hasDate && (cur.range || cur.date))) start()
    if (range) cur.range = range
    if (datePart) cur.date = toMonth(datePart)
    if (text) (isBody ? cur.body : cur.head).push(text)
  }
  return entries.filter((e) => e.head.length || e.body.length || e.bullets.length)
}

// "Engineer at Acme" / "Engineer | Acme" / "Engineer, Acme" → ["Engineer", "Acme"]
function splitPair(text) {
  for (const sep of [/\s+at\s+/i, /\s+[|–—]\s+/, /\s+-\s+/, /,\s+/]) {
    const i = text.search(sep)
    if (i > 0) {
      const [first, ...rest] = text.split(sep)
      return [first.trim(), rest.join(', ').trim()]
    }
  }
  return [text, '']
}

function headPair(head) {
  if (head.length >= 2) return [head[0], head.slice(1).join(', ')]
  return head.length ? splitPair(head[0]) : ['', '']
}

const parsers = {
  exp(lines) {
    return toEntries(lines).map((e) => {
      let [position, company] = headPair(e.head)
      // "Acme — Senior Developer" puts the company first.
      if (company && JOB_TITLE.test(company) && !JOB_TITLE.test(position)) [position, company] = [company, position]
      return {
        company,
        position,
        responsibilities: [...e.bullets, ...e.body].join('\n'),
        from: e.range?.from ?? e.date,
        until: e.range?.to ?? '',
      }
    })
  },

  edu(lines, notes) {
    return toEntries(lines).map((e) => {
      let head = e.head
      if (head.length === 1) head = splitPair(head[0]).filter(Boolean)
      const title = head.find((h) => DEGREE.test(h)) ?? head[0] ?? ''
      if (e.body.length || e.bullets.length) notes.add('Extra education details (grades, modules) weren’t imported.')
      return {
        school: head.filter((h) => h !== title).join(', '),
        titleOfStudy: title,
        from: e.range?.from ?? '',
        to: e.range?.to ?? e.date,
      }
    })
  },

  projects(lines) {
    return toEntries(lines).map((e) => {
      const all = [...e.head, ...e.body, ...e.bullets]
      const link = all.join(' ').replace(new RegExp(EMAIL.source, 'g'), ' ').match(URL)?.[0] ?? ''
      const strip = (s) => (link ? s.replace(link, '') : s).replace(/^[\s|–—-]+|[\s|–—-]+$/g, '').trim()
      return {
        name: strip(e.head[0] ?? ''),
        link,
        description: [...e.head.slice(1), ...e.body, ...e.bullets].map(strip).filter(Boolean).join(' '),
      }
    })
  },

  certs(lines) {
    return toEntries(lines).map((e) => {
      const [name, issuer] = headPair(e.head)
      return { name, issuer, dateEarned: e.date || e.range?.to || e.range?.from || '' }
    })
  },

  skills(lines) {
    const rows = []
    const loose = []
    for (const line of lines) {
      const m = line.text.match(/^([^:]{1,40}):\s*(.+)$/)
      if (m) rows.push({ category: m[1].trim(), items: m[2].trim() })
      else if (line.parts.length === 2) rows.push({ category: line.parts[0], items: line.parts[1] })
      else loose.push(...line.text.split(/\s*[,;•|]\s*/).filter(Boolean))
    }
    if (loose.length) rows.push({ category: rows.length ? 'Other' : '', items: loose.join(', ') })
    return rows
  },

  // "English  Native" (two parts), or one line like
  // "English (native), Malay: conversational, Mandarin – basic".
  languages(lines) {
    const rows = []
    for (const line of lines) {
      const pairs =
        line.parts.length === 2
          ? [line.parts]
          : line.text.split(/\s*[,;]\s*(?![^()]*\))/).map((item) => {
              const m = item.match(/^(.+?)\s*(?:\((.+?)\)|[:|–—]\s*(.+)|\s-\s(.+))$/)
              return m ? [m[1], m[2] ?? m[3] ?? m[4]] : [item, '']
            })
      for (const [language, level = ''] of pairs) {
        if (language.trim()) rows.push({ language: language.trim(), proficiency: toLevel(level) })
      }
    }
    return rows
  },
}

function toLevel(text) {
  const t = text.toLowerCase()
  if (/native|mother|bilingual|first language/.test(t)) return 'Native'
  if (/fluent|advanced|\bc[12]\b/.test(t)) return 'Fluent'
  if (/professional|working|proficient|\bb2\b/.test(t)) return 'Professional'
  if (/conversational|intermediate|\bb1\b/.test(t)) return 'Conversational'
  if (/basic|elementary|beginner|\ba[12]\b/.test(t)) return 'Basic'
  return PROFICIENCY_LEVELS[1] // Fluent, the form's default
}

export function parseCv(lines) {
  const notes = new Set()
  const { buckets, appearance, skipped } = splitSections(lines)
  const general = parseHeader(buckets.header, notes)
  if (buckets.summary) setSummary(general, buckets.summary, notes)
  else if (general.summary) setSummary(general, [{ text: general.summary }], notes)

  const committed = { general: [general] }
  const order = ['general']
  for (const key of appearance) {
    if (key === 'summary' || !parsers[key]) continue
    const rows = parsers[key](buckets[key], notes)
    if (rows.length) {
      committed[key] = rows
      order.push(key)
    }
  }
  // Required sections that weren't found still appear, empty.
  for (const key of Object.keys(SECTION_TYPES)) {
    if (!SECTION_TYPES[key].optional && !committed[key]) {
      committed[key] = []
      order.push(key)
    }
  }

  if (skipped.length) notes.add(`Skipped sections Linework doesn't have: ${skipped.join(', ')}.`)
  const review = order.filter((key) => committed[key].length > 0)
  return { data: { order, committed }, review, notes: [...notes] }
}
