import { focusAfterRender, keepFocusInGroup } from '../lib/focus.js'
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
// remove section → the next section's title.
export default function SectionPanel({ sectionKey, position, count, section, errors, actions, compact = false }) {
  const type = SECTION_TYPES[sectionKey]
  const { editing, draft, committed } = section

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

  const removeSection = () => {
    actions.removeSection(sectionKey)
    focusAfterRender(() => document.querySelector('.panel-title'))
  }

  const move = (to, e) => {
    actions.move(sectionKey, to)
    keepFocusInGroup(e.currentTarget)
  }

  return (
    <form
      id={SECTION_FORM_ID}
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
        <div className="panel-body">
          <ValidationAlert id={SECTION_ERROR_ID} type={type} rows={draft} errors={errors} />
          {type.hint && <p className="panel-hint">{type.hint}</p>}

          {draft.map((row, i) => (
            <EntryFieldset
              key={i}
              sectionKey={sectionKey}
              type={type}
              row={row}
              index={i}
              errors={errors}
              errorId={SECTION_ERROR_ID}
              onChange={(index, field, value) => actions.updateField(sectionKey, index, field, value)}
              onRemove={removeEntry}
            />
          ))}

          {type.multi && (
            <button type="button" className="btn-add" onClick={addEntry}>
              + Add {type.noun}
            </button>
          )}
        </div>
      ) : (
        <>
          {section.review && (
            <div className="review-note" role="note">
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
          <SubmittedSummary type={type} rows={committed} verb={compact ? 'Tap' : 'Press'} />
        </>
      )}
    </form>
  )
}
