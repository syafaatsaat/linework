import { keepFocusInGroup } from '../lib/focus.js'

export default function EditorNav({ order, active, sections, onSelect }) {
  const index = order.indexOf(active)
  const submitted = order.filter((key) => !sections[key].editing).length

  return (
    <div className="editor-nav" data-focus-group>
      <button
        type="button"
        className="btn-outline"
        disabled={index <= 0}
        onClick={(e) => {
          onSelect(order[index - 1])
          keepFocusInGroup(e.currentTarget)
        }}
      >
        ← Prev
      </button>
      <span className="mono-meta">
        {submitted} / {order.length} submitted
      </span>
      <button
        type="button"
        className="btn-outline"
        disabled={index >= order.length - 1}
        onClick={(e) => {
          onSelect(order[index + 1])
          keepFocusInGroup(e.currentTarget)
        }}
      >
        Next →
      </button>
    </div>
  )
}
