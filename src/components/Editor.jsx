import { useState } from 'react'
import { OPTIONAL_SECTIONS } from '../sections/types.js'
import AddSectionMenu from './AddSectionMenu.jsx'
import EditorNav from './EditorNav.jsx'
import SectionPanel from './SectionPanel.jsx'
import SectionTabs from './SectionTabs.jsx'

export default function Editor({ state, actions }) {
  const { order, active, sections, missing } = state
  const [adding, setAdding] = useState(false)
  const addable = OPTIONAL_SECTIONS.filter((key) => !order.includes(key))
  const menuOpen = adding && addable.length > 0

  const addSection = (key) => {
    setAdding(false)
    actions.addSection(key)
  }

  return (
    <aside className="editor no-print" aria-label="CV editor">
      <SectionTabs order={order} active={active} sections={sections} onSelect={actions.select} onMove={actions.move}>
        {addable.length > 0 && (
          <button
            type="button"
            className="tab-add"
            aria-expanded={menuOpen}
            aria-controls="add-section-menu"
            onClick={() => setAdding(!adding)}
          >
            + Add section
          </button>
        )}
      </SectionTabs>
      <p className="mono-meta editor-hint">Drag tabs to reorder the CV. General stays at the top.</p>
      {menuOpen && <AddSectionMenu id="add-section-menu" addable={addable} onAdd={addSection} />}
      <SectionPanel
        key={active}
        sectionKey={active}
        position={order.indexOf(active) + 1}
        count={order.length}
        section={sections[active]}
        missing={missing}
        actions={actions}
      />
      <EditorNav order={order} active={active} sections={sections} onSelect={actions.select} />
    </aside>
  )
}
