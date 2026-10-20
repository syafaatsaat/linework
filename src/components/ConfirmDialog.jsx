import { useEffect, useId, useRef } from 'react'

// Native modal <dialog>: the browser traps focus, makes the page behind it
// inert, closes on Escape and returns focus to the opener. The safe choice
// gets autofocus so a stray Enter doesn't confirm.
export default function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  const dialog = useRef(null)
  const titleId = useId()
  const bodyId = useId()

  useEffect(() => {
    const el = dialog.current
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className="confirm no-print"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={(e) => {
        // Escape: let React state close it so the two never disagree.
        e.preventDefault()
        onCancel()
      }}
    >
      <h2 id={titleId} className="confirm-title">
        {title}
      </h2>
      <div id={bodyId} className="confirm-body">
        {children}
      </div>
      <div className="confirm-actions">
        <button type="button" className="btn-outline" autoFocus onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
