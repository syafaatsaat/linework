import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { SECTION_TYPES } from '../sections/types.js'
import SectionTab from './SectionTab.jsx'

// `children` is appended to the tab row (the "+ Add section" tile).
export default function SectionTabs({ order, active, sections, onSelect, onMove, children }) {
  const sensors = useSensors(
    // A small threshold so a plain click on a tab still selects it.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // General is pinned first, so only the rest are sortable.
  const sortable = order.slice(1)
  const label = (id) => SECTION_TYPES[id].short
  const place = (id) => order.indexOf(id) + 1

  const announcements = {
    onDragStart: ({ active }) => `Picked up ${label(active.id)}, position ${place(active.id)} of ${order.length}.`,
    onDragOver: ({ active, over }) =>
      over ? `${label(active.id)} is over position ${place(over.id)}.` : `${label(active.id)} is no longer over a position.`,
    onDragEnd: ({ active, over }) =>
      over ? `${label(active.id)} dropped at position ${place(over.id)}.` : `${label(active.id)} dropped.`,
    onDragCancel: ({ active }) => `Reorder cancelled. ${label(active.id)} stays at position ${place(active.id)}.`,
  }
  const screenReaderInstructions = {
    draggable:
      'To reorder, press Space or Enter to pick up the section, use the arrow keys to move it, then press Space or Enter to drop it, or Escape to cancel. General stays first.',
  }

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) onMove(active.id, order.indexOf(over.id))
  }

  const status = (key) => {
    if (sections[key].review) return 'check'
    if (SECTION_TYPES[key].pinned) return 'pinned'
    return sections[key].editing ? 'editing' : 'submitted'
  }
  const tab = (key) => (
    <SectionTab
      key={key}
      sectionKey={key}
      position={place(key)}
      status={status(key)}
      active={key === active}
      onSelect={onSelect}
    />
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{ announcements, screenReaderInstructions }}
    >
      <nav className="tabs" aria-label="CV sections, drag to reorder">
        {tab(order[0])}
        <SortableContext items={sortable} strategy={rectSortingStrategy}>
          {sortable.map(tab)}
        </SortableContext>
        {children}
      </nav>
    </DndContext>
  )
}
