import { useCv } from '../state/useCv.js'
import SectionPanel from './SectionPanel.jsx'
import SectionTabs from './SectionTabs.jsx'

// Step 1 shell: wires the store to the tabs and the active section panel.
// Styling, preview and layout arrive in later build steps.
export default function App() {
  const [state, actions] = useCv()
  const { order, active, sections, error } = state

  return (
    <main className="app">
      <SectionTabs order={order} active={active} sections={sections} onSelect={actions.select} />
      <SectionPanel
        key={active}
        sectionKey={active}
        position={order.indexOf(active) + 1}
        section={sections[active]}
        error={error}
        actions={actions}
      />
    </main>
  )
}
