import { useEffect, useId, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion.js'

// Modal bottom sheet. The layout marks everything behind it `inert`, so focus
// can't wander out; this handles Escape, initial focus, and handing focus back
// to whatever opened it.
//
// It slides up on open. Closing by the user (Done, backdrop, Escape) plays the
// slide down first and calls onClose when it ends; a parent closing it after
// an action (import, export) just unmounts it.
export default function BottomSheet({ title, onClose, children }) {
  const titleId = useId()
  const sheet = useRef(null)
  const [closing, setClosing] = useState(false)
  // Read during the first render: by the time effects run, the commit has
  // made the opener inert and focus has already dropped to <body>.
  const [opener] = useState(() => document.activeElement)

  const requestClose = () => (prefersReducedMotion() ? onClose() : setClosing(true))
  const latestRequestClose = useRef(requestClose)
  useEffect(() => {
    latestRequestClose.current = requestClose
  })

  useEffect(() => {
    sheet.current?.querySelector('button')?.focus()

    const onKey = (e) => {
      // A confirm dialog opened from the sheet handles its own Escape.
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
        e.preventDefault()
        latestRequestClose.current()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [opener])

  return (
    <div className={closing ? 'sheet-layer sheet-layer--closing no-print' : 'sheet-layer no-print'}>
      <button type="button" className="sheet-backdrop" aria-label="Close" tabIndex={-1} onClick={requestClose} />
      <div
        ref={sheet}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onAnimationEnd={(e) => {
          if (closing && e.target === e.currentTarget) onClose()
        }}
      >
        <span className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head">
          <h2 id={titleId} className="sheet-title">
            {title}
          </h2>
          <button type="button" className="sheet-done" onClick={requestClose}>
            Done
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
