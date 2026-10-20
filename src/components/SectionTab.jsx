import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SECTION_TYPES } from '../sections/types.js'

// One tab. The tile itself starts a pointer drag (after a few px, so a click
// still selects), while keyboard dragging lives on the ⠿ handle so Enter and
// Space on the tab keep selecting it. General is pinned and never sortable.
export default function SectionTab({ sectionKey, position, status, active, onSelect }) {
  const type = SECTION_TYPES[sectionKey]
  const pinned = !!type.pinned
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: sectionKey,
    disabled: pinned,
  })

  const style = { transform: CSS.Translate.toString(transform), transition }
  const className = ['tab', active && 'tab--active', isDragging && 'tab--dragging', pinned && 'tab--pinned']
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={setNodeRef} className={className} style={style} onPointerDown={pinned ? undefined : listeners?.onPointerDown}>
      <button type="button" className="tab-select" aria-pressed={active} onClick={() => onSelect(sectionKey)}>
        <span className="tab-meta">
          {String(position).padStart(2, '0')} · {status}
        </span>
        <span className="tab-label">{type.short}</span>
      </button>
      {!pinned && (
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="tab-handle"
          {...attributes}
          aria-label={`Reorder ${type.short}`}
          onKeyDown={listeners?.onKeyDown}
        >
          <span aria-hidden="true">⠿</span>
        </button>
      )}
    </div>
  )
}
