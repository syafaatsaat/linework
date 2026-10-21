import { useState } from 'react'
import { focusAfterRender, keepFocusInGroup } from '../lib/focus.js'
import { swapWithTransition } from '../lib/motion.js'
import { SECTION_TYPES } from '../sections/types.js'
import EntryFieldset from './EntryFieldset.jsx'
import SubmittedSummary from './SubmittedSummary.jsx'
import SubmitToggle from './SubmitToggle.jsx'
import ValidationAlert from './ValidationAlert.jsx'
import { SECTION_ERROR_ID, SECTION_FORM_ID } from './formIds.js'

// Compact is the mobile panel: Submit/Edit live in the bottom bar and order
// changes in the Sections sheet, so the panel drops those controls.
//
// Actions that replace the focused control hand focus on (see lib/focus.js):
// submit → Edit button, or the first invalid field; cancel → Edit button;
// add/remove entry → the new entry's first field / the add button;
// move entry → the same button on the moved entry (or its pair at the ends);
// remove section → the next section's title.
export default function SectionPanel({ sectionKey, position, count, section, errors, attempt = 0, actions, compact = false }) {
  const type = SECTION_TYPES[sectionKey]
  const { editing, draft, committed } = section

  // Animate the form ↔ summary swap, but only once this panel has actually
  // toggled: switching tabs mounts a fresh panel, which should appear at once.
  const [shownEditing, setShownEditing] = useState(editing)
  const [toggled, setToggled] = useState(false)
  if (shownEditing !== editing) {
    setShownEditing(editing)
    setToggled(true)
  }
  const enter = toggled ? ' panel-enter' : ''

  const [announcement, setAnnouncement] = useState('')
  const toggle = () => document.querySelector('[data-section-toggle]')

  const submit = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    actions.submit(sectionKey)
    focusAfterRender(() => form.querySelector('[aria-invalid="true"]') ?? toggle())
  }

  const cancel = () => {
    actions.cancel(sectionKey)
    focusAfterRender(toggle)
  }

  const addEntry = (e) => {
    const form = e.currentTarget.form
    actions.addEntry(sectionKey)
    focusAfterRender(() => form.querySelector('.entry:last-of-type').querySelector('input, textarea, select'))
  }

  const removeEntry = (index, e) => {
    const form = e.currentTarget.form
    actions.removeEntry(sectionKey, index)
    focusAfterRender(() => form.querySelector('.btn-add'))
  }

  const moveEntry = (index, to, e) => {
    const form = e.currentTarget.form
    const dir = to < index ? 'earlier' : 'later'
    const entries = form.querySelectorAll('.entry')
    const update = () => actions.moveEntry(sectionKey, index, to)
    swapWithTransition(entries[index], entries[to], update).then(() => {
      setAnnouncement(`${type.noun[0].toUpperCase()}${type.noun.slice(1)} moved to entry ${to + 1} of ${draft.length}.`)
      focusAfterRender(() => {
        const moved = form.querySelectorAll('.entry')[to]
        const same = moved?.querySelector(`[data-move="${dir}"]`)
        return same && !same.disabled ? same : moved?.querySelector('[data-move]:not(:disabled)')
      })
    })
  }

  const removeSection = () => {
    actions.removeSection(sectionKey)
    focusAfterRender(() => document.querySelector('.panel-title'))
  }

  const move = (to, e) => {
    const button = e.currentTarget
    // move runs in a View Transition; check focus once the DOM has updated.
    Promise.resolve(actions.move(sectionKey, to)).then(() => keepFocusInGroup(button))
  }

  return (
    <form
      id={SECTION_FORM_ID}
      // Alternates per blocked submit so the error animation replays (ValidationAlert.css, Field.css).
      data-attempt={attempt % 2 ? 'odd' : 'even'}
      className={compact ? 'panel panel--compact' : 'panel'}
      onSubmit={submit}
      noValidate
      aria-labelledby={`${sectionKey}-title`}
    >
      <div className="panel-head">
        <div>
          <p className="mono-meta">
            SECTION {String(position).padStart(2, '0')} · {editing ? 'EDITING' : 'SUBMITTED'}
          </p>
          <h2 id={`${sectionKey}-title`} className="panel-title" tabIndex={-1}>
            {type.label}
          </h2>
        </div>
        <div className="panel-controls">
          {type.optional && (
            <button type="button" className="btn-link" onClick={removeSection}>
              Remove section
            </button>
          )}
          {editing && committed.length > 0 && (
            <button type="button" className="btn-link" onClick={cancel}>
              Cancel
            </button>
          )}
          {!compact && (
            <SubmitToggle editing={editing} onEdit={() => actions.edit(sectionKey)} className="btn-toggle" />
          )}
        </div>
      </div>

      {!compact && !type.pinned && (
        <div className="panel-position" data-focus-group>
          <span>POSITION ON CV</span>
          {/* Accessible fallback for dragging the tabs. Position 1 belongs to General. */}
          <button
            type="button"
            className="btn-small"
            aria-label="Move section earlier on the CV"
            disabled={position <= 2}
            onClick={(e) => move(position - 2, e)}
          >
            ← Earlier
          </button>
          <button
            type="button"
            className="btn-small"
            aria-label="Move section later on the CV"
            disabled={position >= count}
            onClick={(e) => move(position, e)}
          >
            Later →
          </button>
        </div>
      )}

      {editing ? (
        <div className={`panel-body${enter}`}>
          <ValidationAlert id={SECTION_ERROR_ID} type={type} rows={draft} errors={errors} />
          {type.hint && <p className="panel-hint">{type.hint}</p>}

          {draft.map((row, i) => (
            <EntryFieldset
              key={i}
              sectionKey={sectionKey}
              type={type}
              row={row}
              index={i}
              count={draft.length}
              errors={errors}
              errorId={SECTION_ERROR_ID}
              onChange={(index, field, value) => actions.updateField(sectionKey, index, field, value)}
              onRemove={removeEntry}
              onMove={draft.length > 1 ? moveEntry : undefined}
            />
          ))}
          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>

          {type.multi && (
            <button type="button" className="btn-add" onClick={addEntry}>
              + Add {type.noun}
            </button>
          )}
        </div>
      ) : (
        <>
          {section.review && (
            <div className={`review-note${enter}`} role="note">
              <p>Imported automatically. Check these entries against your original CV.</p>
              <button
                type="button"
                className="btn-small"
                onClick={() => {
                  actions.markReviewed(sectionKey)
                  focusAfterRender(toggle)
                }}
              >
                Looks right
              </button>
            </div>
          )}
          <SubmittedSummary type={type} rows={committed} verb={compact ? 'Tap' : 'Press'} animate={toggled} />
        </>
      )}
    </form>
  )
}
