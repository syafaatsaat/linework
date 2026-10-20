import { SECTION_TYPES } from '../sections/types.js'

export default function SectionTabs({ order, active, sections, onSelect }) {
  return (
    <nav className="tabs" aria-label="CV sections">
      {order.map((key, i) => {
        const type = SECTION_TYPES[key]
        const status = type.pinned ? 'pinned' : sections[key].editing ? 'editing' : 'submitted'
        return (
          <button
            key={key}
            type="button"
            className="tab"
            aria-pressed={key === active}
            onClick={() => onSelect(key)}
          >
            <span className="tab-meta">
              {String(i + 1).padStart(2, '0')} · {status}
            </span>
            <span className="tab-label">{type.short}</span>
          </button>
        )
      })}
    </nav>
  )
}
