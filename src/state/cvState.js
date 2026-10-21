import { loadJSON } from '../lib/storage.js'
import {
  DEFAULT_ORDER,
  SECTION_TYPES,
  blankRow,
  validateRows,
} from '../sections/types.js'

export const STORAGE_KEY = 'linework:cv:v1'

// State shape:
//   order:    section keys in CV order; 'general' is always first
//   active:   key of the section shown in the editor
//   sections: { [key]: { committed: Row[], draft: Row[], editing: boolean, review: boolean } }
//   errors:   what blocked the last submit of the active section (see validateRows)
//   attempt:  counts blocked submits, so the UI can replay its error animation
//   undo:     { message, snapshot } after a removal, reset or import, or null
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
  return { order, active: 'general', sections, errors: [], attempt: 0, undo: null }
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

// True when a section's form holds edits that Submit hasn't committed: what
// a reload or closing the tab would lose. Opening Edit without changing
// anything doesn't count, and neither does an untouched blank form.
export function hasUnsavedChanges(state) {
  return state.order.some((key) => {
    const { editing, draft, committed } = state.sections[key]
    return editing && JSON.stringify(draft) !== JSON.stringify(draftFrom(key, committed))
  })
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

function reduce(state, action) {
  switch (action.type) {
    case 'select': {
      if (!state.sections[action.key] || action.key === state.active) return state
      return { ...discardDraft(state, state.active), active: action.key, errors: [] }
    }

    case 'updateField': {
      const { key, index, field, value } = action
      const draft = state.sections[key].draft.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      )
      const next = updateSection(state, key, { draft })
      // Once a submit has flagged problems, keep the list current as they're fixed.
      return state.errors.length ? { ...next, errors: validateRows(key, draft) } : next
    }

    case 'addEntry': {
      const draft = [...state.sections[action.key].draft, blankRow(action.key)]
      return updateSection(state, action.key, { draft })
    }

    case 'removeEntry': {
      const draft = state.sections[action.key].draft.filter((_, i) => i !== action.index)
      return updateSection(state, action.key, { draft })
    }

    case 'moveEntry': {
      // Move entry `index` to position `to` within the section's draft.
      const { key, index, to } = action
      const rows = state.sections[key].draft
      if (index === to || index < 0 || to < 0 || index >= rows.length || to >= rows.length) return state
      const draft = [...rows]
      const [row] = draft.splice(index, 1)
      draft.splice(to, 0, row)
      const next = updateSection(state, key, { draft })
      // Errors point at entries by index, so they move with them.
      return state.errors.length ? { ...next, errors: validateRows(key, draft) } : next
    }

    case 'submit': {
      const { key } = action
      const errors = validateRows(key, state.sections[key].draft)
      if (errors.length) {
        return { ...state, errors, attempt: state.attempt + 1 }
      }
      const committed = clone(state.sections[key].draft)
      return { ...updateSection(state, key, { committed, editing: false, review: false }), errors: [] }
    }

    case 'edit': {
      const { committed } = state.sections[action.key]
      return updateSection(state, action.key, { draft: draftFrom(action.key, committed), editing: true })
    }

    case 'cancel':
      return { ...discardDraft(state, action.key), errors: [] }

    case 'addSection': {
      const { key } = action
      if (!SECTION_TYPES[key]?.optional || state.order.includes(key)) return state
      return {
        ...discardDraft(state, state.active),
        order: [...state.order, key],
        sections: { ...state.sections, [key]: freshSection(key) },
        active: key,
        errors: [],
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
      return { ...state, order, sections, active, errors: [] }
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

// Actions that throw work away offer Undo, with the message the toast shows.
const UNDOABLE = {
  removeEntry: (state, { key, index }) => `Removed ${SECTION_TYPES[key].noun} ${index + 1}.`,
  removeSection: (state, { key }) => `Removed ${SECTION_TYPES[key].label}.`,
  reset: () => 'Cleared your CV.',
  import: () => 'Replaced your CV with the import.',
}

// Undo restores the state from just before the action. Any later change
// clears it, so Undo can never wipe out edits made after the removal.
export function cvReducer(state, action) {
  if (action.type === 'undo') return state.undo ? { ...state.undo.snapshot, undo: null } : state
  if (action.type === 'dismissUndo') return state.undo ? { ...state, undo: null } : state

  const next = reduce(state, action)
  if (next === state) return state
  const message = UNDOABLE[action.type]?.(state, action)
  return { ...next, undo: message ? { message, snapshot: { ...state, undo: null } } : null }
}
