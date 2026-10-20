// Names the required fields a submit was blocked on, using their labels.
export default function ValidationAlert({ type, missing }) {
  if (missing.length === 0) return null

  const labels = type.fields.filter((f) => missing.includes(f.key)).map((f) => f.label.toLowerCase())
  const list = labels.length > 1 ? `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}` : labels[0]

  return (
    <p role="alert" className="alert">
      Add your {list} to submit. Everything else in this section is optional.
    </p>
  )
}
