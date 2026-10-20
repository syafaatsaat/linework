import { useEffect, useRef } from 'react'
import MobileEditBar from './MobileEditBar.jsx'
import SectionChips from './SectionChips.jsx'
import SectionPanel from './SectionPanel.jsx'

export default function MobileEditView({ state, actions, onOpenSections }) {
  const { order, active, sections, missing } = state
  const main = useRef(null)

  // A new section starts at the top of the form, not wherever the last one was scrolled.
  useEffect(() => {
    main.current?.scrollTo({ top: 0 })
  }, [active])

  return (
    <>
      <SectionChips order={order} active={active} sections={sections} onSelect={actions.select} onOpenSections={onOpenSections} />
      <main ref={main} className="m-main">
        <SectionPanel
          key={active}
          sectionKey={active}
          position={order.indexOf(active) + 1}
          count={order.length}
          section={sections[active]}
          missing={missing}
          actions={actions}
          compact
        />
      </main>
      <MobileEditBar
        order={order}
        active={active}
        editing={sections[active].editing}
        onSelect={actions.select}
        onEdit={() => actions.edit(active)}
      />
    </>
  )
}
