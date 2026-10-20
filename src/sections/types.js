import {
  bareUrl,
  formatMonth,
  formatRange,
  joinParts,
  splitBullets,
  splitList,
} from '../lib/format.js'

export const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic']

export const SUMMARY_MAX = 400

// Field shape: { key, label, type, half?, placeholder?, options?, maxLength?, required?, hint? }
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
    label: 'General information',
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
      { key: 'category', label: 'Group', type: 'text', placeholder: 'e.g. Frontend, Languages, Design' },
      { key: 'items', label: 'Skills', type: 'text', placeholder: 'React, TypeScript, CSS' },
    ],
    view: (r) => ({ lead: r.category, secondary: splitList(r.items).join(', ') }),
  },

  exp: {
    label: 'Practical experience',
    short: 'Experience',
    sheet: 'Work Experience',
    noun: 'experience',
    multi: true,
    fields: [
      { key: 'company', label: 'Company', type: 'text', half: true, placeholder: 'Company name' },
      { key: 'position', label: 'Position title', type: 'text', half: true, placeholder: 'Your role' },
      { key: 'responsibilities', label: 'Main responsibilities', type: 'textarea', placeholder: 'One responsibility per line' },
      { key: 'from', label: 'From', type: 'month', half: true },
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
    fields: [
      { key: 'school', label: 'School', type: 'text', placeholder: 'School or university' },
      { key: 'titleOfStudy', label: 'Title of study', type: 'text', placeholder: 'e.g. BSc Computer Science' },
      { key: 'from', label: 'From', type: 'month', half: true },
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
      { key: 'name', label: 'Project name', type: 'text', half: true, placeholder: 'Project name' },
      { key: 'link', label: 'Link', type: 'text', half: true, placeholder: 'github.com/you/project' },
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
      { key: 'name', label: 'Certification', type: 'text', placeholder: 'e.g. AWS Certified Developer' },
      { key: 'issuer', label: 'Issuer', type: 'text', half: true, placeholder: 'Issuing body' },
      { key: 'dateEarned', label: 'Date earned', type: 'month', half: true },
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
      { key: 'language', label: 'Language', type: 'text', half: true, placeholder: 'e.g. Mandarin' },
      { key: 'proficiency', label: 'Proficiency', type: 'select', half: true, options: PROFICIENCY_LEVELS },
    ],
    view: (r) => ({ primary: r.language || '[Language]', meta: r.proficiency }),
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

// Returns the keys of required fields left empty. Only single-row sections
// (general) declare required fields, so the first row is the one to check.
export function missingRequired(sectionKey, rows) {
  const required = SECTION_TYPES[sectionKey].fields.filter((f) => f.required)
  const row = rows[0] || {}
  return required.filter((f) => !String(row[f.key] || '').trim()).map((f) => f.key)
}
