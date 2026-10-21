import { describe, expect, it } from 'vitest'
import { cvReducer, hasUnsavedChanges, toStorage } from '../../src/state/cvState.js'
import { sample } from '../fixtures.js'

// Applies actions in order, starting from a CV built from `data` (or blank).
function run(actions, data = null) {
  const start = cvReducer(undefined, data ? { type: 'import', data } : { type: 'reset' })
  return actions.reduce(cvReducer, start)
}

const fill = (key, values, index = 0) =>
  Object.entries(values).map(([field, value]) => ({ type: 'updateField', key, index, field, value }))

describe('initial state', () => {
  it('starts blank in the default order, with every section editing', () => {
    const state = run([])
    expect(state.order).toEqual(['general', 'skills', 'exp', 'edu', 'projects'])
    expect(state.active).toBe('general')
    expect(Object.values(state.sections).every((s) => s.editing && s.committed.length === 0)).toBe(true)
  })

  it('sanitizes imported or stored data', () => {
    const state = run([], {
      order: ['exp', 'bogus', 'exp', 'general'],
      committed: { general: [{ name: 'Ada', extra: 'x', email: 5 }, { name: 'second' }], exp: 'nope' },
    })
    // General is pinned first, unknown and duplicate keys dropped, required sections restored.
    expect(state.order).toEqual(['general', 'exp', 'skills', 'edu'])
    // Single-entry sections keep one row; unknown fields and non-strings are dropped.
    expect(state.sections.general.committed).toHaveLength(1)
    expect(state.sections.general.committed[0]).toMatchObject({ name: 'Ada', email: '' })
    expect(state.sections.general.committed[0]).not.toHaveProperty('extra')
    expect(state.sections.exp.committed).toEqual([])
  })
})

describe('draft and committed', () => {
  it('typing changes the draft only', () => {
    const state = run(fill('general', { name: 'Ada' }))
    expect(state.sections.general.draft[0].name).toBe('Ada')
    expect(state.sections.general.committed).toEqual([])
  })

  it('submit with missing required fields is blocked and counted', () => {
    const state = run([...fill('general', { name: 'Ada' }), { type: 'submit', key: 'general' }])
    expect(state.sections.general.editing).toBe(true)
    expect(state.errors.map((e) => e.fields[0])).toEqual(['email', 'phone'])
    expect(state.attempt).toBe(1)
  })

  it('errors update as they are fixed, without bumping the attempt counter', () => {
    const state = run([
      { type: 'submit', key: 'general' },
      ...fill('general', { name: 'Ada', email: 'a@b.co' }),
    ])
    expect(state.errors.map((e) => e.fields[0])).toEqual(['phone'])
    expect(state.attempt).toBe(1)
  })

  it('counts successful submits only', () => {
    const blocked = run([{ type: 'submit', key: 'general' }])
    expect(blocked.submits).toBe(0)
    const ok = run([...fill('general', { name: 'Ada', email: 'a@b.co', phone: '1' }), { type: 'submit', key: 'general' }])
    expect(ok.submits).toBe(1)
  })

  it('submit commits the draft', () => {
    const state = run([
      ...fill('general', { name: 'Ada', email: 'a@b.co', phone: '123' }),
      { type: 'submit', key: 'general' },
    ])
    expect(state.sections.general.editing).toBe(false)
    expect(state.sections.general.committed[0]).toMatchObject({ name: 'Ada', email: 'a@b.co', phone: '123' })
    expect(state.errors).toEqual([])
  })

  it('cancel and switching sections discard unsaved edits', () => {
    const edited = [{ type: 'edit', key: 'general' }, ...fill('general', { name: 'Changed' })]
    const cancelled = run([...edited, { type: 'cancel', key: 'general' }], sample)
    expect(cancelled.sections.general.draft[0].name).toBe('Ada Tan')
    expect(cancelled.sections.general.editing).toBe(false)

    const switched = run([...edited, { type: 'select', key: 'skills' }], sample)
    expect(switched.active).toBe('skills')
    expect(switched.sections.general.draft[0].name).toBe('Ada Tan')
  })

  it('a section with nothing submitted stays in editing on cancel', () => {
    const state = run([{ type: 'cancel', key: 'skills' }])
    expect(state.sections.skills.editing).toBe(true)
  })

  it('moves entries within the draft only', () => {
    const state = run([{ type: 'edit', key: 'exp' }, { type: 'moveEntry', key: 'exp', index: 1, to: 0 }], sample)
    expect(state.sections.exp.draft.map((r) => r.company)).toEqual(['Globex', 'Acme Pte Ltd'])
    expect(state.sections.exp.committed.map((r) => r.company)).toEqual(['Acme Pte Ltd', 'Globex'])
    const submitted = cvReducer(state, { type: 'submit', key: 'exp' })
    expect(submitted.sections.exp.committed.map((r) => r.company)).toEqual(['Globex', 'Acme Pte Ltd'])
  })

  it('ignores entry moves out of range', () => {
    const state = run([{ type: 'edit', key: 'exp' }], sample)
    for (const [index, to] of [[0, 0], [0, -1], [1, 2], [5, 0]]) {
      expect(cvReducer(state, { type: 'moveEntry', key: 'exp', index, to })).toBe(state)
    }
  })

  it('errors follow a moved entry', () => {
    const state = run([
      { type: 'addEntry', key: 'skills' },
      ...fill('skills', { category: 'Done', items: 'x' }, 1),
      { type: 'submit', key: 'skills' },
      { type: 'moveEntry', key: 'skills', index: 1, to: 0 },
    ])
    expect(state.errors.map((e) => e.index)).toEqual([1, 1])
  })

  it('adds and removes entries in the draft', () => {
    const state = run([
      { type: 'addEntry', key: 'skills' },
      { type: 'addEntry', key: 'skills' },
      ...fill('skills', { category: 'Second' }, 1),
      { type: 'removeEntry', key: 'skills', index: 0 },
    ])
    expect(state.sections.skills.draft.map((r) => r.category)).toEqual(['Second', ''])
  })
})

describe('sections', () => {
  it('adds optional sections at the end and makes them active', () => {
    const state = run([{ type: 'addSection', key: 'certs' }])
    expect(state.order.at(-1)).toBe('certs')
    expect(state.active).toBe('certs')
  })

  it('refuses to add a required or duplicate section', () => {
    const once = run([{ type: 'addSection', key: 'certs' }])
    expect(cvReducer(once, { type: 'addSection', key: 'certs' })).toBe(once)
    expect(cvReducer(once, { type: 'addSection', key: 'skills' })).toBe(once)
  })

  it('removes optional sections only, moving the active section back one', () => {
    const state = run([{ type: 'select', key: 'projects' }, { type: 'removeSection', key: 'projects' }])
    expect(state.order).not.toContain('projects')
    expect(state.active).toBe('edu')
    expect(cvReducer(state, { type: 'removeSection', key: 'exp' })).toBe(state)
  })

  it('moves sections but keeps general first', () => {
    const state = run([{ type: 'move', key: 'projects', to: 1 }])
    expect(state.order).toEqual(['general', 'projects', 'skills', 'exp', 'edu'])
    expect(cvReducer(state, { type: 'move', key: 'skills', to: 0 })).toBe(state)
    expect(cvReducer(state, { type: 'move', key: 'general', to: 2 })).toBe(state)
  })

  it('markReviewed clears the import flag', () => {
    const imported = run([], { ...sample, review: ['exp'] })
    expect(imported.sections.exp.review).toBe(true)
    expect(cvReducer(imported, { type: 'markReviewed', key: 'exp' }).sections.exp.review).toBe(false)
  })
})

describe('hasUnsavedChanges', () => {
  it('is false for an untouched CV, blank or submitted', () => {
    expect(hasUnsavedChanges(run([]))).toBe(false)
    expect(hasUnsavedChanges(run([], sample))).toBe(false)
  })

  it('is false after opening Edit without changing anything', () => {
    expect(hasUnsavedChanges(run([{ type: 'edit', key: 'exp' }], sample))).toBe(false)
  })

  it('is true while a form has edits, and false again after submit or cancel', () => {
    const typed = run(fill('general', { name: 'Ada', email: 'a@b.co', phone: '1' }))
    expect(hasUnsavedChanges(typed)).toBe(true)
    expect(hasUnsavedChanges(cvReducer(typed, { type: 'submit', key: 'general' }))).toBe(false)

    const moved = run([{ type: 'edit', key: 'exp' }, { type: 'moveEntry', key: 'exp', index: 0, to: 1 }], sample)
    expect(hasUnsavedChanges(moved)).toBe(true)
    expect(hasUnsavedChanges(cvReducer(moved, { type: 'cancel', key: 'exp' }))).toBe(false)
  })

  it('is false once you switch away, since that discards the draft', () => {
    expect(hasUnsavedChanges(run([...fill('general', { name: 'Ada' }), { type: 'select', key: 'skills' }]))).toBe(false)
  })
})

describe('toStorage', () => {
  it('saves committed data, order and review flags, never drafts', () => {
    const state = run([{ type: 'edit', key: 'general' }, ...fill('general', { name: 'Draft' })], { ...sample, review: ['skills'] })
    const saved = toStorage(state)
    expect(saved.order).toEqual(sample.order)
    expect(saved.committed.general[0].name).toBe('Ada Tan')
    expect(saved.review).toEqual(['skills'])
  })

  it('round-trips through import', () => {
    const state = run([], sample)
    expect(toStorage(run([], toStorage(state)))).toEqual(toStorage(state))
  })
})

describe('undo', () => {
  it('restores a removed section, entry or reset CV', () => {
    for (const [action, message] of [
      [{ type: 'removeSection', key: 'projects' }, 'Removed Projects.'],
      [{ type: 'reset' }, 'Cleared your CV.'],
    ]) {
      const before = run([], sample)
      const after = cvReducer(before, action)
      expect(after.undo.message).toBe(message)
      expect(toStorage(cvReducer(after, { type: 'undo' }))).toEqual(toStorage(before))
    }

    const editing = run([{ type: 'edit', key: 'exp' }], sample)
    const removed = cvReducer(editing, { type: 'removeEntry', key: 'exp', index: 1 })
    expect(removed.undo.message).toBe('Removed experience 2.')
    expect(cvReducer(removed, { type: 'undo' }).sections.exp.draft).toEqual(editing.sections.exp.draft)
  })

  it('offers undo after an import replaces the CV', () => {
    const imported = cvReducer(run([], sample), { type: 'import', data: { order: ['general'], committed: {} } })
    expect(imported.undo.message).toBe('Replaced your CV with the import.')
    expect(cvReducer(imported, { type: 'undo' }).sections.general.committed[0].name).toBe('Ada Tan')
  })

  it('expires on the next change, so later edits are never undone', () => {
    const removed = run([{ type: 'removeSection', key: 'projects' }], sample)
    const edited = cvReducer(removed, { type: 'edit', key: 'skills' })
    expect(edited.undo).toBeNull()
    expect(cvReducer(edited, { type: 'undo' })).toBe(edited)
  })

  it('survives no-op actions, and can be dismissed', () => {
    const removed = run([{ type: 'removeSection', key: 'projects' }], sample)
    expect(cvReducer(removed, { type: 'select', key: removed.active })).toBe(removed)
    expect(cvReducer(removed, { type: 'dismissUndo' }).undo).toBeNull()
  })

  it('is never saved', () => {
    const removed = run([{ type: 'removeSection', key: 'projects' }], sample)
    expect(toStorage(removed)).not.toHaveProperty('undo')
  })
})
