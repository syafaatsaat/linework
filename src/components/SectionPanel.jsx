import { SECTION_TYPES } from '../sections/types.js'
import EntryFieldset from './EntryFieldset.jsx'
import SubmittedSummary from './SubmittedSummary.jsx'
import ValidationAlert from './ValidationAlert.jsx'

export default function SectionPanel({ sectionKey, position, section, missing, actions }) {
  const type = SECTION_TYPES[sectionKey]
  const { editing, draft, committed } = section

  const submit = (e) => {
    e.preventDefault()
    actions.submit(sectionKey)
  }

  return (
    <form className="panel" onSubmit={submit} noValidate aria-labelledby={`${sectionKey}-title`}>
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
          {/* While editing, this is the form's submit button, so Enter in an input submits too.
              Distinct keys stop React reusing one element and flipping its type mid-click, and
              preventDefault stops the browser from treating the Edit click as a submit once the
              re-render has already swapped in the Submit button. */}
          {editing ? (
            <button key="submit" type="submit" className="btn-toggle btn-toggle--on">
              Submit
            </button>
          ) : (
            <button
              key="edit"
              type="button"
              className="btn-toggle"
              onClick={(e) => {
                e.preventDefault()
                actions.edit(sectionKey)
              }}
            >
              Edit
            </button>
          )}
        </div>
      </div>

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
        <SubmittedSummary type={type} rows={committed} />
      )}
    </form>
  )
}
