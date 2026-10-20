import { useEffect, useRef, useState } from 'react'
import { OPTIONAL_SECTIONS, SECTION_TYPES } from '../sections/types.js'
import { ChevronDown, ChevronUp } from './Icons.jsx'
import ImportButton from './ImportButton.jsx'
import ResetButton from './ResetButton.jsx'

// Contents of the mobile "Sections" sheet: up/down buttons per row to set
// the CV order, chips to add optional sections, then Import CV and Reset CV.
export default function SectionsSheet({ order, active, onMove, onAdd, onReset, onImport, hasData }) {
  const list = useRef(null)
  const [moved, setMoved] = useState(null) // { key, dir } of the last move
  const addable = OPTIONAL_SECTIONS.filter((key) => !order.includes(key))

  // Moving a row re-inserts its DOM node, which drops focus. Put it back on
  // the same button, or the other arrow if that one just became disabled.
  useEffect(() => {
    if (!moved) return
    const row = list.current?.querySelector(`[data-row="${moved.key}"]`)
    const same = row?.querySelector(`[data-dir="${moved.dir}"]`)
    const other = row?.querySelector(`[data-dir="${moved.dir === 'up' ? 'down' : 'up'}"]`)
    ;(same && !same.disabled ? same : other)?.focus()
  }, [moved, order])

  const move = (key, dir) => {
    onMove(key, order.indexOf(key) + (dir === 'up' ? -1 : 1))
    setMoved({ key, dir })
  }

  const label = (key) => SECTION_TYPES[key].short
  const announcement = moved ? `${label(moved.key)} moved to position ${order.indexOf(moved.key) + 1}.` : ''

  return (
    <>
      <p className="sheet-text">Sections print in this order. General stays at the top.</p>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <ol ref={list} className="order-list">
        {order.map((key, i) => (
          <li key={key} data-row={key} className={key === active ? 'order-row order-row--active' : 'order-row'}>
            <span className="order-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="order-label">{label(key)}</span>
            {!SECTION_TYPES[key].pinned && (
              <>
                <button
                  type="button"
                  className="btn-icon-line"
                  data-dir="up"
                  aria-label={`Move ${label(key)} up`}
                  disabled={i <= 1}
                  onClick={() => move(key, 'up')}
                >
                  <ChevronUp />
                </button>
                <button
                  type="button"
                  className="btn-icon-line"
                  data-dir="down"
                  aria-label={`Move ${label(key)} down`}
                  disabled={i >= order.length - 1}
                  onClick={() => move(key, 'down')}
                >
                  <ChevronDown />
                </button>
              </>
            )}
          </li>
        ))}
      </ol>
      {addable.length > 0 && (
        <>
          <p className="mono-meta sheet-subhead">ADD A SECTION</p>
          <div className="add-chips">
            {addable.map((key) => (
              <button key={key} type="button" className="chip chip--add" onClick={() => onAdd(key)}>
                + {SECTION_TYPES[key].label}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="sheet-footer">
        <ImportButton onImport={onImport} hasData={hasData} className="btn-accent-link" label="Import CV" />
        <ResetButton onReset={onReset} className="btn-danger-link" label="Reset CV" />
      </div>
    </>
  )
}
