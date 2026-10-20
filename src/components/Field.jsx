export default function Field({ id, field, value, onChange }) {
  const { label, type, placeholder, options, maxLength } = field
  const handle = (e) => onChange(e.target.value)

  let control
  if (type === 'textarea') {
    control = (
      <textarea id={id} value={value} placeholder={placeholder} maxLength={maxLength} onChange={handle} />
    )
  } else if (type === 'select') {
    control = (
      <select id={id} value={value} onChange={handle}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    )
  } else {
    control = <input id={id} type={type} value={value} placeholder={placeholder} onChange={handle} />
  }

  return (
    <div className={field.half ? 'field field--half' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {control}
    </div>
  )
}
