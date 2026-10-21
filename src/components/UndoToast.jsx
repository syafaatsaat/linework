import { useEffect, useState } from 'react'
import { CloseIcon } from './Icons.jsx'

const DISMISS_MS = 8000

// "Removed Certifications. Undo" after a removal, reset or import. The live
// region is always mounted so screen readers announce each new message. It
// dismisses itself after a few seconds, but not while the pointer or focus
// is on it, so there's time to reach the button.
export default function UndoToast({ undo, onUndo, onDismiss, mobile = false }) {
  const [paused, setPaused] = useState(false)
  // A new message gets a fresh timer. (Adjusting state during render.)
  const [shown, setShown] = useState(undo)
  if (shown !== undo) {
    setShown(undo)
    setPaused(false)
  }

  useEffect(() => {
    if (!undo || paused) return
    const timer = setTimeout(onDismiss, DISMISS_MS)
    return () => clearTimeout(timer)
  }, [undo, paused, onDismiss])

  return (
    <div className={mobile ? 'undo-region undo-region--mobile no-print' : 'undo-region no-print'} role="status">
      {undo && (
        <div
          className="undo-toast"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
          }}
        >
          <span className="undo-message">{undo.message}</span>
          <button type="button" className="undo-action" onClick={onUndo}>
            Undo
          </button>
          <button type="button" className="btn-icon undo-close" aria-label="Dismiss" onClick={onDismiss}>
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  )
}
