import { SECTION_TYPES } from '../sections/types.js'

// Panel listing the optional sections that aren't on the CV yet.
export default function AddSectionMenu({ id, addable, onAdd }) {
  return (
    <div id={id} className="add-menu">
      <p className="mono-meta">ADD AN OPTIONAL SECTION</p>
      <div className="add-menu-options">
        {addable.map((key) => (
          <button key={key} type="button" className="btn-option" onClick={() => onAdd(key)}>
            {SECTION_TYPES[key].label}
          </button>
        ))}
      </div>
    </div>
  )
}
