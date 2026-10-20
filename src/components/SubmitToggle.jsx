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
export default function SubmitToggle({ editing, onEdit, className, submitLabel = 'Submit', editLabel = 'Edit' }) {
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
      {editLabel}
    </button>
  )
}
