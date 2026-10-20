import { SECTION_TYPES } from '../sections/types.js'
import EntryFieldset from './EntryFieldset.jsx'
import SubmittedSummary from './SubmittedSummary.jsx'
import SubmitToggle from './SubmitToggle.jsx'
import ValidationAlert from './ValidationAlert.jsx'
import { SECTION_FORM_ID } from './formIds.js'

// Compact is the mobile panel: Submit/Edit live in the bottom bar and order
// changes in the Reorder sheet, so the panel drops those controls.
export default function SectionPanel({ sectionKey, position, count, section, missing, actions, compact = false }) {
  const type = SECTION_TYPES[sectionKey]
  const { editing, draft, committed } = section

  const submit = (e) => {
    e.preventDefault()
    actions.submit(sectionKey)
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
          <h2 id={`${sectionKey}-title`} className="panel-title">
            {type.label}
          </h2>
        </div>
        <div className="panel-controls">
          {type.optional && (
            <button type="button" className="btn-link" onClick={() => actions.removeSection(sectionKey)}>
              Remove section
            </button>
          )}
          {editing && committed.length > 0 && (
            <button type="button" className="btn-link" onClick={() => actions.cancel(sectionKey)}>
              Cancel
            </button>
          )}
          {!compact && (
            <SubmitToggle editing={editing} onEdit={() => actions.edit(sectionKey)} className="btn-toggle" />
          )}
        </div>
      </div>

      {!compact && !type.pinned && (
        <div className="panel-position">
          <span>POSITION ON CV</span>
          {/* Accessible fallback for dragging the tabs. Position 1 belongs to General. */}
          <button
            type="button"
            className="btn-small"
            aria-label="Move section earlier on the CV"
            disabled={position <= 2}
            onClick={() => actions.move(sectionKey, position - 2)}
          >
            ← Earlier
          </button>
          <button
            type="button"
            className="btn-small"
            aria-label="Move section later on the CV"
            disabled={position >= count}
            onClick={() => actions.move(sectionKey, position)}
          >
            Later →
          </button>
        </div>
      )}

      {editing ? (
        <div className="panel-body">
          <ValidationAlert type={type} missing={missing} />
          {type.hint && <p className="panel-hint">{type.hint}</p>}

          {draft.map((row, i) => (
            <EntryFieldset
              key={i}
              sectionKey={sectionKey}
              type={type}
              row={row}
              index={i}
              missing={missing}
              onChange={(index, field, value) => actions.updateField(sectionKey, index, field, value)}
              onRemove={(index) => actions.removeEntry(sectionKey, index)}
            />
          ))}

          {type.multi && (
            <button type="button" className="btn-add" onClick={() => actions.addEntry(sectionKey)}>
              + Add {type.noun}
            </button>
          )}
        </div>
      ) : (
        <SubmittedSummary type={type} rows={committed} verb={compact ? 'Tap' : 'Press'} />
      )}
    </form>
  )
}
