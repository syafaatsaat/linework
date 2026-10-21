import { useEffect, useState } from 'react'
import { focusAfterRender } from '../lib/focus.js'
import { SECTION_FORM_ID } from './formIds.js'

// Submit while editing, Edit once submitted. Used in the desktop panel header
// and the mobile bottom bar (which sits outside the form, hence `form`).
//
// Submit is a real submit button, so Enter in an input submits too. Distinct
// keys stop React reusing one element and flipping its type mid-click, and
// preventDefault stops the browser treating the Edit click as a submit once
// the re-render has already swapped in the Submit button.
//
// data-section-toggle lets the panel return focus here after submit/cancel.
const CHECK_MS = 1200

// `submits` counts successful submits (cvState). When it goes up, the Edit
// button that replaces Submit shows a ✓ for a moment. Switching sections
// doesn't change it, so arriving at a submitted section shows no check.
export default function SubmitToggle({ editing, onEdit, submits = 0, className, submitLabel = 'Submit', editLabel = 'Edit' }) {
  const [seen, setSeen] = useState(submits)
  const [check, setCheck] = useState(false)
  // Adjusting state during render, once per new submit. Only an increase
  // counts: Undo, reset and import can take the count back down.
  if (seen !== submits) {
    setSeen(submits)
    if (submits > seen) setCheck(true)
  }
  useEffect(() => {
    if (!check) return
    const timer = setTimeout(() => setCheck(false), CHECK_MS)
    return () => clearTimeout(timer)
  }, [check])

  return editing ? (
    <button key="submit" type="submit" form={SECTION_FORM_ID} className={`${className} btn-toggle--on`} data-section-toggle>
      {submitLabel}
    </button>
  ) : (
    <button
      key="edit"
      type="button"
      className={className}
      data-section-toggle
      onClick={(e) => {
        e.preventDefault()
        onEdit()
        // The fields replace the summary; start the user in the first one.
        focusAfterRender(() => document.getElementById(SECTION_FORM_ID)?.querySelector('input, textarea, select'))
      }}
    >
      {check && (
        <span className="toggle-check" aria-hidden="true">
          ✓
        </span>
      )}
      {editLabel}
    </button>
  )
}
