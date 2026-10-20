import { loadJSON } from '../lib/storage.js'
import {
  DEFAULT_ORDER,
  SECTION_TYPES,
  blankRow,
  missingRequired,
} from '../sections/types.js'

export const STORAGE_KEY = 'linework:cv:v1'

// State shape:
//   order:    section keys in CV order; 'general' is always first
//   active:   key of the section shown in the editor
//   sections: { [key]: { committed: Row[], draft: Row[], editing: boolean } }
//   error:    validation message for the active section ('' when none)
//
// `committed` is what the preview and exports read. `draft` is what the form
// edits. Submit copies draft → committed; Edit and Cancel copy committed → draft.

const clone = (rows) => rows.map((row) => ({ ...row }))

function draftFrom(key, committed) {
  return committed.length ? clone(committed) : [blankRow(key)]
}

function freshSection(key, committed = []) {
  return { committed, draft: draftFrom(key, committed), editing: committed.length === 0 }
}

// Keep only known fields, coerced to strings, so a stale or hand-edited
// storage entry can't break rendering.
function sanitizeRows(key, rows) {
  if (!Array.isArray(rows)) return []
  const blank = blankRow(key)
  const clean = rows
    .filter((row) => row && typeof row === 'object')
    .map((row) => {
      const out = { ...blank }
      for (const field of Object.keys(blank)) {
        if (typeof row[field] === 'string') out[field] = row[field]
      }
      return out
    })
  return SECTION_TYPES[key].multi ? clean : clean.slice(0, 1)
}

function sanitizeOrder(order) {
  const known = Array.isArray(order)
    ? order.filter((key, i) => SECTION_TYPES[key] && order.indexOf(key) === i)
    : DEFAULT_ORDER
  // Required sections can't be removed, so restore any that went missing.
  const required = DEFAULT_ORDER.filter((key) => !SECTION_TYPES[key].optional)
  const merged = [...known, ...required.filter((key) => !known.includes(key))]
  return ['general', ...merged.filter((key) => key !== 'general')]
}

export function createInitialState() {
  const saved = loadJSON(STORAGE_KEY)
  const order = sanitizeOrder(saved?.order)
  const sections = {}
  for (const key of order) {
    sections[key] = freshSection(key, sanitizeRows(key, saved?.committed?.[key]))
  }
  return { order, active: 'general', sections, error: '' }
}

// Only committed data and order persist; unsaved drafts are discarded on reload.
export function toStorage(state) {
  const committed = {}
  for (const key of state.order) committed[key] = state.sections[key].committed
  return { order: state.order, committed }
}

function updateSection(state, key, patch) {
  return {
    ...state,
    sections: { ...state.sections, [key]: { ...state.sections[key], ...patch } },
  }
}

// Throw away unsaved edits in a section, leaving its editing flag alone.
function discardDraft(state, key) {
  const section = state.sections[key]
  if (!section) return state
  return updateSection(state, key, { draft: draftFrom(key, section.committed) })
}

export function cvReducer(state, action) {
  switch (action.type) {
    case 'select': {
      if (!state.sections[action.key] || action.key === state.active) return state
      return { ...discardDraft(state, state.active), active: action.key, error: '' }
    }

    case 'updateField': {
      const { key, index, field, value } = action
      const draft = state.sections[key].draft.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      )
      return updateSection(state, key, { draft })
    }

    case 'addEntry': {
      const draft = [...state.sections[action.key].draft, blankRow(action.key)]
      return updateSection(state, action.key, { draft })
    }

    case 'removeEntry': {
      const draft = state.sections[action.key].draft.filter((_, i) => i !== action.index)
      return updateSection(state, action.key, { draft })
    }

    case 'submit': {
      const { key } = action
      const missing = missingRequired(key, state.sections[key].draft)
      if (missing.length) {
        return {
          ...state,
          error: `Add your ${missing.join(', ')} to submit. Everything else in this section is optional.`,
        }
      }
      const committed = clone(state.sections[key].draft)
      return { ...updateSection(state, key, { committed, editing: false }), error: '' }
    }

    case 'edit': {
      const { committed } = state.sections[action.key]
      return updateSection(state, action.key, { draft: draftFrom(action.key, committed), editing: true })
    }

    case 'cancel': {
      const { committed } = state.sections[action.key]
      return {
        ...updateSection(state, action.key, {
          draft: draftFrom(action.key, committed),
          // Nothing submitted yet means there's no summary to fall back to.
          editing: committed.length === 0,
        }),
        error: '',
      }
    }

    case 'addSection': {
      const { key } = action
      if (!SECTION_TYPES[key]?.optional || state.order.includes(key)) return state
      return {
        ...discardDraft(state, state.active),
        order: [...state.order, key],
        sections: { ...state.sections, [key]: freshSection(key) },
        active: key,
        error: '',
      }
    }

    case 'removeSection': {
      const { key } = action
      if (!SECTION_TYPES[key]?.optional) return state
      const index = state.order.indexOf(key)
      const order = state.order.filter((k) => k !== key)
      const sections = { ...state.sections }
      delete sections[key]
      const active = state.active === key ? order[Math.max(0, index - 1)] : state.active
      return { ...state, order, sections, active, error: '' }
    }

    case 'move': {
      // Move `key` to position `to`. Index 0 belongs to general.
      const from = state.order.indexOf(action.key)
      const to = action.to
      if (from < 1 || to < 1 || to >= state.order.length || from === to) return state
      const order = [...state.order]
      order.splice(from, 1)
      order.splice(to, 0, action.key)
      return { ...state, order }
    }

    default:
      return state
  }
}
