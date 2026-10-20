import { SECTION_TYPES } from '../sections/types.js'
import EntryFieldset from './EntryFieldset.jsx'
import SubmittedSummary from './SubmittedSummary.jsx'

export default function SectionPanel({ sectionKey, position, section, error, actions }) {
  const type = SECTION_TYPES[sectionKey]
  const { editing, draft, committed } = section
  const status = editing ? 'EDITING' : 'SUBMITTED'

  const submit = (e) => {
    e.preventDefault()
    actions.submit(sectionKey)
  }

  return (
    <section className="panel" aria-labelledby={`${sectionKey}-title`}>
      <p className="panel-meta">
        SECTION {String(position).padStart(2, '0')} · {status}
      </p>
      <h2 id={`${sectionKey}-title`}>{type.label}</h2>

      {type.optional && (
        <button type="button" onClick={() => actions.removeSection(sectionKey)}>
          Remove section
        </button>
      )}

      {editing ? (
        <form onSubmit={submit} noValidate>
          {type.hint && <p className="panel-hint">{type.hint}</p>}
          {error && <p role="alert">{error}</p>}

          {draft.map((row, i) => (
            <EntryFieldset
              key={i}
              sectionKey={sectionKey}
              type={type}
              row={row}
              index={i}
              onChange={(index, field, value) => actions.updateField(sectionKey, index, field, value)}
              onRemove={(index) => actions.removeEntry(sectionKey, index)}
            />
          ))}

          {type.multi && (
            <button type="button" onClick={() => actions.addEntry(sectionKey)}>
              + Add {type.noun}
            </button>
          )}

          <div className="panel-actions">
            {committed.length > 0 && (
              <button type="button" onClick={() => actions.cancel(sectionKey)}>
                Cancel
              </button>
            )}
            <button type="submit">Submit</button>
          </div>
        </form>
      ) : (
        <>
          <SubmittedSummary type={type} rows={committed} />
          <div className="panel-actions">
            <button type="button" onClick={() => actions.edit(sectionKey)}>
              Edit
            </button>
          </div>
        </>
      )}
    </section>
  )
}
