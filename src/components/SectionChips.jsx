import { useEffect, useRef } from 'react'
import { SECTION_TYPES } from '../sections/types.js'
import { ReorderIcon } from './Icons.jsx'

// Horizontally scrolling section chips (● editing / ✓ submitted / ! check), with the
// Sections chip pinned outside the scroller so it's always visible. It opens
// the sheet for reordering and adding optional sections.
export default function SectionChips({ order, active, sections, onSelect, onOpenSections }) {
  const chips = useRef({})

  // Keep the active chip in view when Prev/Next moves past the visible ones.
  useEffect(() => {
    chips.current[active]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active])

  return (
    <div className="m-chip-row">
      <nav className="m-chips" aria-label="CV sections">
        {order.map((key) => {
          const { editing, review } = sections[key]
          const [mark, status] = review ? ['!', 'needs checking'] : editing ? ['●', 'editing'] : ['✓', 'submitted']
          return (
            <button
              key={key}
              ref={(el) => {
                chips.current[key] = el
              }}
              type="button"
              className="chip"
              aria-pressed={key === active}
              onClick={() => onSelect(key)}
            >
              <span className="chip-mark" aria-hidden="true">
                {mark}
              </span>
              {SECTION_TYPES[key].short}
              <span className="sr-only">, {status}</span>
            </button>
          )
        })}
      </nav>
      <button
        type="button"
        className="chip chip--sections"
        aria-haspopup="dialog"
        aria-label="Sections: reorder or add"
        onClick={onOpenSections}
      >
        <ReorderIcon size={14} />
        Sections
      </button>
    </div>
  )
}
