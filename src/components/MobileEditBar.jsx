import { keepFocusInGroup } from '../lib/focus.js'
import { SECTION_TYPES } from '../sections/types.js'
import { ChevronLeft, ChevronRight } from './Icons.jsx'
import SubmitToggle from './SubmitToggle.jsx'

// ‹  [Submit / Edit {section}]  ›
export default function MobileEditBar({ order, active, editing, submits, onSelect, onEdit }) {
  const index = order.indexOf(active)
  const name = SECTION_TYPES[active].short.toLowerCase()

  return (
    <footer className="m-bar" data-focus-group>
      <button
        type="button"
        className="btn-icon-box"
        aria-label="Previous section"
        disabled={index <= 0}
        onClick={(e) => {
          onSelect(order[index - 1])
          keepFocusInGroup(e.currentTarget)
        }}
      >
        <ChevronLeft />
      </button>
      <SubmitToggle
        editing={editing}
        submits={submits}
        onEdit={onEdit}
        className="m-bar-main"
        submitLabel={`Submit ${name}`}
        editLabel={`Edit ${name}`}
      />
      <button
        type="button"
        className="btn-icon-box"
        aria-label="Next section"
        disabled={index >= order.length - 1}
        onClick={(e) => {
          onSelect(order[index + 1])
          keepFocusInGroup(e.currentTarget)
        }}
      >
        <ChevronRight />
      </button>
    </footer>
  )
}
