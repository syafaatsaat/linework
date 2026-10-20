import EditorNav from './EditorNav.jsx'
import SectionPanel from './SectionPanel.jsx'
import SectionTabs from './SectionTabs.jsx'

export default function Editor({ state, actions }) {
  const { order, active, sections, missing } = state

  return (
    <aside className="editor" aria-label="CV editor">
      <SectionTabs order={order} active={active} sections={sections} onSelect={actions.select} />
      <SectionPanel
        key={active}
        sectionKey={active}
        position={order.indexOf(active) + 1}
        section={sections[active]}
        missing={missing}
        actions={actions}
      />
      <EditorNav order={order} active={active} sections={sections} onSelect={actions.select} />
    </aside>
  )
}
