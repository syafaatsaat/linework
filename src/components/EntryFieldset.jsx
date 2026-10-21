import Field from './Field.jsx'

// onMove(index, to, event) is passed when the section has more than one
// entry; it adds Earlier/Later buttons that move this entry by one place.
export default function EntryFieldset({ sectionKey, type, row, index, count, errors, errorId, onChange, onRemove, onMove }) {
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
            invalid={errors.some((e) => e.index === index && e.fields.includes(field.key))}
            errorId={errorId}
            onChange={(value) => onChange(index, field.key, value)}
          />
        ))}
      </div>
      {type.multi && (
        <div className="entry-actions">
          {onMove && (
            <div className="entry-move" data-focus-group>
              <button
                type="button"
                className="btn-small"
                data-move="earlier"
                aria-label={`Move entry ${index + 1} earlier`}
                disabled={index === 0}
                onClick={(e) => onMove(index, index - 1, e)}
              >
                <span aria-hidden="true">↑ </span>Earlier
              </button>
              <button
                type="button"
                className="btn-small"
                data-move="later"
                aria-label={`Move entry ${index + 1} later`}
                disabled={index === count - 1}
                onClick={(e) => onMove(index, index + 1, e)}
              >
                <span aria-hidden="true">↓ </span>Later
              </button>
            </div>
          )}
          <button
            type="button"
            className="btn-link"
            aria-label={`Remove entry ${index + 1}`}
            onClick={(e) => onRemove(index, e)}
          >
            Remove entry
          </button>
        </div>
      )}
    </fieldset>
  )
}
