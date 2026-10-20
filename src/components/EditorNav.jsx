export default function EditorNav({ order, active, sections, onSelect }) {
  const index = order.indexOf(active)
  const submitted = order.filter((key) => !sections[key].editing).length

  return (
    <div className="editor-nav">
      <button type="button" className="btn-outline" disabled={index <= 0} onClick={() => onSelect(order[index - 1])}>
        ← Prev
      </button>
      <span className="mono-meta">
        {submitted} / {order.length} submitted
      </span>
      <button
        type="button"
        className="btn-outline"
        disabled={index >= order.length - 1}
        onClick={() => onSelect(order[index + 1])}
      >
        Next →
      </button>
    </div>
  )
}
