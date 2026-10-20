import CharCounter from './CharCounter.jsx'

export default function Field({ id, field, value, invalid, onChange }) {
  const { label, type, placeholder, options, maxLength } = field
  const counterId = maxLength ? `${id}-count` : undefined
  const handle = (e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)

  const shared = {
    id,
    value,
    onChange: handle,
    'aria-invalid': invalid || undefined,
    'aria-describedby': counterId,
  }

  let control
  if (type === 'textarea') {
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
    <div className={field.half ? 'field field--half' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {control}
      {maxLength && <CharCounter id={counterId} length={value.length} max={maxLength} />}
    </div>
  )
}
