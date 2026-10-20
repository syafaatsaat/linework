import { useEffect, useId, useRef, useState } from 'react'

// Modal bottom sheet. The layout marks everything behind it `inert`, so focus
// can't wander out; this handles Escape, initial focus, and handing focus back
// to whatever opened it.
export default function BottomSheet({ title, onClose, children }) {
  const titleId = useId()
  const sheet = useRef(null)
  const close = useRef(onClose)
  // Read during the first render: by the time effects run, the commit has
  // made the opener inert and focus has already dropped to <body>.
  const [opener] = useState(() => document.activeElement)

  useEffect(() => {
    close.current = onClose
  })

  useEffect(() => {
    sheet.current?.querySelector('button')?.focus()

    const onKey = (e) => {
      // A confirm dialog opened from the sheet handles its own Escape.
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
        e.preventDefault()
        close.current()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [opener])

  return (
    <div className="sheet-layer no-print">
      <button type="button" className="sheet-backdrop" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <div ref={sheet} className="sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <span className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head">
          <h2 id={titleId} className="sheet-title">
            {title}
          </h2>
          <button type="button" className="sheet-done" onClick={onClose}>
            Done
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
