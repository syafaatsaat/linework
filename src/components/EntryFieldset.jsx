import Field from './Field.jsx'

export default function EntryFieldset({ sectionKey, type, row, index, onChange, onRemove }) {
  const legend = type.multi ? `Entry ${index + 1}` : 'Details'

  return (
    <fieldset className="entry">
      <legend>{legend}</legend>
      {type.fields.map((field) => (
        <Field
          key={field.key}
          id={`${sectionKey}-${index}-${field.key}`}
          field={field}
          value={row[field.key] ?? ''}
          onChange={(value) => onChange(index, field.key, value)}
        />
      ))}
      {type.multi && (
        <button type="button" onClick={() => onRemove(index)}>
          Remove {type.noun} {index + 1}
        </button>
      )}
    </fieldset>
  )
}
