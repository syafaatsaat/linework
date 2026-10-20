import Field from './Field.jsx'

export default function EntryFieldset({ sectionKey, type, row, index, missing, onChange, onRemove }) {
  const legend = type.multi ? `Entry ${index + 1}` : 'Details'

  return (
    <fieldset className="entry">
      <legend>{legend}</legend>
      <div className="entry-grid">
        {type.fields.map((field) => (
          <Field
            key={field.key}
            id={`${sectionKey}-${index}-${field.key}`}
            field={field}
            value={row[field.key] ?? ''}
            invalid={missing.includes(field.key)}
            onChange={(value) => onChange(index, field.key, value)}
          />
        ))}
      </div>
      {type.multi && (
        <div className="entry-actions">
          <button
            type="button"
            className="btn-link"
            aria-label={`Remove ${type.noun} ${index + 1}`}
            onClick={() => onRemove(index)}
          >
            Remove entry
          </button>
        </div>
      )}
    </fieldset>
  )
}
