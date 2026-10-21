import {
  bareUrl,
  compareMonths,
  currentMonth,
  formatMonth,
  formatRange,
  joinParts,
  splitBullets,
  splitList,
} from '../lib/format.js'
import { bulletHints } from '../lib/hints.js'

export const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic']

export const SUMMARY_MAX = 400

// Section shape adds `range: [fromKey, toKey]` when an entry has a date span.
//
// Field shape: { key, label, type, half?, placeholder?, options?, maxLength?, required?, hint?, review? }
// review(value) returns writing suggestions ([{ kind, message }]) shown under
// the field as you type; they never block Submit.
// type is one of: text, email, tel, month, textarea, select. Month values are
// "YYYY-MM", or "YYYY" when only the year is known.
//
// view(row) returns display parts used by the submitted summary and, later,
// the CV block builder:
//   { primary, secondary, meta, lead, body, bullets }
//
// Adding a section type means adding one entry here.
export const SECTION_TYPES = {
  general: {
    label: 'General Information',
    short: 'General',
    multi: false,
    pinned: true,
    fields: [
      { key: 'name', label: 'Full name', type: 'text', placeholder: 'Your full name', required: true },
      { key: 'email', label: 'Email', type: 'email', half: true, placeholder: 'name@example.com', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', half: true, placeholder: '+65 0000 0000', required: true },
      { key: 'country', label: 'Country (optional)', type: 'text', half: true, placeholder: 'e.g. Singapore' },
      { key: 'linkedin', label: 'LinkedIn (optional)', type: 'text', half: true, placeholder: 'linkedin.com/in/you' },
      { key: 'portfolio', label: 'Portfolio website (optional)', type: 'text', placeholder: 'yourname.dev' },
      {
        key: 'summary',
        label: 'Summary (optional)',
        type: 'textarea',
        placeholder: '2–3 sentences: your role, years of experience and strongest skills',
        maxLength: SUMMARY_MAX,
      },
    ],
    view: (r) => ({
      primary: r.name,
      secondary: joinParts([r.email, r.phone, r.country]),
      meta: joinParts([bareUrl(r.linkedin), bareUrl(r.portfolio)]),
    }),
  },

  skills: {
    label: 'Skills',
    short: 'Skills',
    sheet: 'Skills',
    noun: 'skill group',
    multi: true,
    hint: 'Group related skills and separate them with commas. They print as plain text, so an ATS can read every keyword. Use the exact terms from the job ad.',
    fields: [
      { key: 'category', label: 'Group', type: 'text', placeholder: 'e.g. Frontend, Languages, Design', required: true },
      { key: 'items', label: 'Skills', type: 'text', placeholder: 'React, TypeScript, CSS', required: true },
    ],
    view: (r) => ({ lead: r.category, secondary: splitList(r.items).join(', ') }),
  },

  exp: {
    label: 'Work Experience',
    short: 'Experience',
    sheet: 'Work Experience',
    noun: 'experience',
    multi: true,
    range: ['from', 'until'],
    fields: [
      { key: 'company', label: 'Company', type: 'text', half: true, placeholder: 'Company name', required: true },
      { key: 'position', label: 'Position title', type: 'text', half: true, placeholder: 'Your role', required: true },
      { key: 'responsibilities', label: 'Main responsibilities', type: 'textarea', placeholder: 'One responsibility per line', review: bulletHints },
      { key: 'from', label: 'From', type: 'month', half: true, required: true },
      { key: 'until', label: 'Until', type: 'month', half: true, hint: 'Leave blank if you still work here.' },
    ],
    view: (r) => ({
      primary: r.position || '[Position title]',
      secondary: r.company,
      meta: formatRange(r.from, r.until),
      bullets: splitBullets(r.responsibilities),
    }),
  },

  edu: {
    label: 'Education',
    short: 'Education',
    sheet: 'Education',
    noun: 'education',
    multi: true,
    range: ['from', 'to'],
    fields: [
      { key: 'school', label: 'School', type: 'text', placeholder: 'School or university', required: true },
      { key: 'titleOfStudy', label: 'Title of study', type: 'text', placeholder: 'e.g. BSc Computer Science', required: true },
      { key: 'from', label: 'From', type: 'month', half: true, required: true },
      { key: 'to', label: 'To', type: 'month', half: true, hint: 'Leave blank if you’re still studying.' },
    ],
    view: (r) => ({
      primary: r.titleOfStudy || '[Title of study]',
      secondary: r.school,
      meta: formatRange(r.from, r.to),
    }),
  },

  projects: {
    label: 'Projects',
    short: 'Projects',
    sheet: 'Projects',
    noun: 'project',
    multi: true,
    optional: true,
    fields: [
      { key: 'name', label: 'Project name', type: 'text', half: true, placeholder: 'Project name', required: true },
      { key: 'link', label: 'Link', type: 'text', half: true, placeholder: 'github.com/you/project', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What it does and your part in it' },
    ],
    view: (r) => ({
      primary: r.name || '[Project name]',
      secondary: bareUrl(r.link),
      body: r.description,
    }),
  },

  certs: {
    label: 'Certifications',
    short: 'Certifications',
    sheet: 'Certifications',
    noun: 'certification',
    multi: true,
    optional: true,
    fields: [
      { key: 'name', label: 'Certification', type: 'text', placeholder: 'e.g. AWS Certified Developer', required: true },
      { key: 'issuer', label: 'Issuer', type: 'text', half: true, placeholder: 'Issuing body', required: true },
      { key: 'dateEarned', label: 'Date earned', type: 'month', half: true, required: true },
    ],
    view: (r) => ({
      primary: r.name || '[Certification]',
      secondary: r.issuer,
      meta: formatMonth(r.dateEarned),
    }),
  },

  languages: {
    label: 'Languages',
    short: 'Languages',
    sheet: 'Languages',
    noun: 'language',
    multi: true,
    optional: true,
    fields: [
      { key: 'language', label: 'Language', type: 'text', half: true, placeholder: 'e.g. Mandarin', required: true },
      { key: 'proficiency', label: 'Proficiency', type: 'select', half: true, options: PROFICIENCY_LEVELS, required: true },
    ],
    view: (r) => ({ primary: r.language || '[Language]', meta: r.proficiency }),
  },

  volunteer: {
    label: 'Volunteer Experience',
    short: 'Volunteering',
    sheet: 'Volunteer Experience',
    noun: 'role',
    multi: true,
    optional: true,
    range: ['from', 'until'],
    fields: [
      { key: 'organization', label: 'Organisation', type: 'text', half: true, placeholder: 'e.g. Food Bank Singapore', required: true },
      { key: 'role', label: 'Role', type: 'text', half: true, placeholder: 'e.g. Volunteer coordinator', required: true },
      { key: 'description', label: 'What you did', type: 'textarea', placeholder: 'One point per line', review: bulletHints },
      { key: 'from', label: 'From', type: 'month', half: true, required: true },
      { key: 'until', label: 'Until', type: 'month', half: true, hint: 'Leave blank if you still volunteer here.' },
    ],
    view: (r) => ({
      primary: r.role || '[Role]',
      secondary: r.organization,
      meta: formatRange(r.from, r.until),
      bullets: splitBullets(r.description),
    }),
  },

  awards: {
    label: 'Awards',
    short: 'Awards',
    sheet: 'Awards',
    noun: 'award',
    multi: true,
    optional: true,
    fields: [
      { key: 'name', label: 'Award', type: 'text', placeholder: 'e.g. Dean’s List, Employee of the Year', required: true },
      { key: 'issuer', label: 'Awarded by', type: 'text', half: true, placeholder: 'Organisation' },
      { key: 'date', label: 'Date', type: 'month', half: true, required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What it recognised, in a sentence' },
    ],
    view: (r) => ({
      primary: r.name || '[Award]',
      secondary: r.issuer,
      meta: formatMonth(r.date),
      body: r.description,
    }),
  },

  publications: {
    label: 'Publications',
    short: 'Publications',
    sheet: 'Publications',
    noun: 'publication',
    multi: true,
    optional: true,
    fields: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Title of the paper, article or book', required: true },
      { key: 'publisher', label: 'Publisher or venue', type: 'text', half: true, placeholder: 'e.g. ACM CHI, Smashing Magazine', required: true },
      { key: 'date', label: 'Date', type: 'month', half: true, required: true },
      { key: 'link', label: 'Link', type: 'text', placeholder: 'doi.org/… or a web address' },
    ],
    view: (r) => ({
      primary: r.title || '[Title]',
      secondary: joinParts([r.publisher, bareUrl(r.link)]),
      meta: formatMonth(r.date),
    }),
  },
}

export const DEFAULT_ORDER = ['general', 'skills', 'exp', 'edu', 'projects']

export const OPTIONAL_SECTIONS = Object.keys(SECTION_TYPES).filter(
  (key) => SECTION_TYPES[key].optional,
)

// Select fields default to their first sensible value; everything else is blank.
const FIELD_DEFAULTS = { proficiency: 'Fluent' }

export function blankRow(sectionKey) {
  const row = {}
  for (const field of SECTION_TYPES[sectionKey].fields) {
    row[field.key] = FIELD_DEFAULTS[field.key] ?? ''
  }
  return row
}

// Problems that block Submit, as [{ index, fields, kind }]:
//   required — a required field is empty, checked on every entry.
//   range    — an entry's end date is before its start date.
//   future   — the end date is blank (Present) but the start date is after
//              this month, so the entry can't be ongoing yet.
// `today` ("YYYY-MM") is injectable for tests.
export function validateRows(sectionKey, rows, today = currentMonth()) {
  const type = SECTION_TYPES[sectionKey]
  const errors = []

  rows.forEach((row, index) => {
    for (const field of type.fields) {
      if (field.required && !String(row[field.key] || '').trim()) {
        errors.push({ index, fields: [field.key], kind: 'required' })
      }
    }
  })

  if (type.range) {
    const [from, to] = type.range
    rows.forEach((row, index) => {
      if (row[from] && row[to] && compareMonths(row[from], row[to]) > 0) {
        errors.push({ index, fields: [from, to], kind: 'range' })
      } else if (row[from] && !row[to] && compareMonths(row[from], today) > 0) {
        errors.push({ index, fields: [from, to], kind: 'future', today })
      }
    })
  }

  return errors
}
