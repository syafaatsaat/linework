import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog.jsx'

// "Reset CV" with a confirmation step, since it clears everything. Undo is
// offered afterwards too, but only briefly and not after a reload.
export default function ResetButton({ onReset, className, label = 'Reset' }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <button type="button" className={className} aria-haspopup="dialog" onClick={() => setConfirming(true)}>
        {label}
      </button>
      <ConfirmDialog
        open={confirming}
        title="Reset your CV?"
        confirmLabel="Reset CV"
        cancelLabel="Keep my CV"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          onReset()
        }}
      >
        <p>This clears every section and restores the default section order.</p>
        <p>Back up first if you might want this version later.</p>
      </ConfirmDialog>
    </>
  )
}
