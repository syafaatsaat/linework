// Submit while editing, Edit once submitted. Used in the desktop panel header
// and the mobile bottom bar (which sits outside the form, hence `form`).
//
// Submit is a real submit button, so Enter in an input submits too. Distinct
// keys stop React reusing one element and flipping its type mid-click, and
// preventDefault stops the browser treating the Edit click as a submit once
// the re-render has already swapped in the Submit button.
export default function SubmitToggle({ editing, form, onEdit, className, submitLabel = 'Submit', editLabel = 'Edit' }) {
  return editing ? (
    <button key="submit" type="submit" form={form} className={`${className} btn-toggle--on`}>
      {submitLabel}
    </button>
  ) : (
    <button
      key="edit"
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault()
        onEdit()
      }}
    >
      {editLabel}
    </button>
  )
}
