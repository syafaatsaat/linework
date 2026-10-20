import { SECTION_TYPES } from '../sections/types.js'
import { SECTION_FORM_ID } from './formIds.js'
import { ChevronLeft, ChevronRight } from './Icons.jsx'
import SubmitToggle from './SubmitToggle.jsx'

// ‹  [Submit / Edit {section}]  ›
export default function MobileEditBar({ order, active, editing, onSelect, onEdit }) {
  const index = order.indexOf(active)
  const name = SECTION_TYPES[active].short.toLowerCase()

  return (
    <footer className="m-bar">
      <button
        type="button"
        className="btn-icon-box"
        aria-label="Previous section"
        disabled={index <= 0}
        onClick={() => onSelect(order[index - 1])}
      >
        <ChevronLeft />
      </button>
      <SubmitToggle
        editing={editing}
        form={SECTION_FORM_ID}
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
        onClick={() => onSelect(order[index + 1])}
      >
        <ChevronRight />
      </button>
    </footer>
  )
}
