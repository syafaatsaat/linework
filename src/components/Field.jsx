import CharCounter from './CharCounter.jsx'
import MonthField from './MonthField.jsx'

export default function Field({ id, field, value, invalid, errorId, onChange }) {
  const { label, type, placeholder, options, maxLength, hint, review } = field
  const labelId = `${id}-label`
  const counterId = maxLength ? `${id}-count` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const suggestions = review ? review(value) : []
  const suggestionsId = suggestions.length ? `${id}-suggestions` : undefined
  const describedBy = [hintId, counterId, suggestionsId, invalid && errorId].filter(Boolean).join(' ') || undefined
  const handle = (e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)

  const shared = {
    id,
    value,
    onChange: handle,
    'aria-invalid': invalid || undefined,
    'aria-required': field.required || undefined,
    'aria-describedby': describedBy,
  }

  let control
  if (type === 'month') {
    control = (
      <MonthField
        id={id}
        labelId={labelId}
        label={label}
        value={value}
        required={field.required}
        invalid={invalid}
        describedBy={describedBy}
        onChange={onChange}
      />
    )
  } else if (type === 'textarea') {
    control = <textarea {...shared} rows={maxLength ? 4 : 3} placeholder={placeholder} maxLength={maxLength} />
  } else if (type === 'select') {
    control = (
      <select {...shared}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    )
  } else {
    control = <input {...shared} type={type} placeholder={placeholder} />
  }

  return (
    <div className={['field', field.half && 'field--half', type === 'month' && 'field--month'].filter(Boolean).join(' ')}>
      <label id={labelId} htmlFor={id}>
        {label}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {maxLength && <CharCounter id={counterId} length={value.length} max={maxLength} />}
      {suggestions.length > 0 && <Suggestions id={suggestionsId} items={suggestions} />}
    </div>
  )
}

// Writing hints under a field: advice, not errors, so no alert role and no
// live region (they'd interrupt while typing). The field's aria-describedby
// points here, so they're read when the field is focused.
function Suggestions({ id, items }) {
  return (
    <div id={id} className="suggestions">
      <p className="suggestions-title">SUGGESTIONS</p>
      <ul>
        {items.map((item) => (
          <li key={item.message}>{item.message}</li>
        ))}
      </ul>
    </div>
  )
}
