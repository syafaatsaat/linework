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
//   sections: { [key]: { committed: Row[], draft: Row[], editing: boolean, review: boolean } }
//   missing:  required field keys the last submit of the active section lacked
//
// `committed` is what the preview and exports read. `draft` is what the form
// edits. Submit copies draft → committed; Edit and Cancel copy committed → draft.
// `review` marks a section filled in by Import CV that the user hasn't checked
// yet; submitting the section or pressing "Looks right" clears it.

const clone = (rows) => rows.map((row) => ({ ...row }))

function draftFrom(key, committed) {
  return committed.length ? clone(committed) : [blankRow(key)]
}

function freshSection(key, committed = [], review = false) {
  return {
    committed,
    draft: draftFrom(key, committed),
    editing: committed.length === 0,
    review: review && committed.length > 0,
  }
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

// From a saved snapshot or an import ({ order, committed, review? }), or a
// blank CV in the default order when there's none.
function buildState(saved) {
  const order = sanitizeOrder(saved?.order)
  const review = Array.isArray(saved?.review) ? saved.review : []
  const sections = {}
  for (const key of order) {
    sections[key] = freshSection(key, sanitizeRows(key, saved?.committed?.[key]), review.includes(key))
  }
  return { order, active: 'general', sections, missing: [] }
}

export function createInitialState() {
  return buildState(loadJSON(STORAGE_KEY))
}

// Only committed data, order and review flags persist; unsaved drafts are
// discarded on reload.
export function toStorage(state) {
  const committed = {}
  for (const key of state.order) committed[key] = state.sections[key].committed
  const review = state.order.filter((key) => state.sections[key].review)
  return { order: state.order, committed, review }
}

function updateSection(state, key, patch) {
  return {
    ...state,
    sections: { ...state.sections, [key]: { ...state.sections[key], ...patch } },
  }
}

// Cancel, or leaving a section: throw away unsaved edits and fall back to the
// submitted summary. A section with nothing submitted stays in editing, since
// there's no summary to show.
function discardDraft(state, key) {
  const section = state.sections[key]
  if (!section) return state
  return updateSection(state, key, {
    draft: draftFrom(key, section.committed),
    editing: section.committed.length === 0,
  })
}

export function cvReducer(state, action) {
  switch (action.type) {
    case 'select': {
      if (!state.sections[action.key] || action.key === state.active) return state
      return { ...discardDraft(state, state.active), active: action.key, missing: [] }
    }

    case 'updateField': {
      const { key, index, field, value } = action
      const draft = state.sections[key].draft.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      )
      const next = updateSection(state, key, { draft })
      // Once a submit has flagged fields, keep the list current as they're filled in.
      return state.missing.length ? { ...next, missing: missingRequired(key, draft) } : next
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
        return { ...state, missing }
      }
      const committed = clone(state.sections[key].draft)
      return { ...updateSection(state, key, { committed, editing: false, review: false }), missing: [] }
    }

    case 'edit': {
      const { committed } = state.sections[action.key]
      return updateSection(state, action.key, { draft: draftFrom(action.key, committed), editing: true })
    }

    case 'cancel':
      return { ...discardDraft(state, action.key), missing: [] }

    case 'addSection': {
      const { key } = action
      if (!SECTION_TYPES[key]?.optional || state.order.includes(key)) return state
      return {
        ...discardDraft(state, state.active),
        order: [...state.order, key],
        sections: { ...state.sections, [key]: freshSection(key) },
        active: key,
        missing: [],
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
      return { ...state, order, sections, active, missing: [] }
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

    case 'reset':
      return buildState(null)

    // Replace the whole CV with imported data ({ order, committed, review }).
    case 'import':
      return buildState(action.data)

    case 'markReviewed':
      return updateSection(state, action.key, { review: false })

    default:
      return state
  }
}
