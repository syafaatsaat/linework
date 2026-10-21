// Toggles that swap the designed sheet for another view of the same CV:
// the plain text an ATS extracts, or the match against a pasted job ad.
// Pressing the active one goes back to the sheet.
const MODES = [
  ['parser', 'Parser view'],
  ['match', 'Job match'],
]

export default function PreviewModes({ mode, onToggle }) {
  return (
    <div className="preview-modes" role="group" aria-label="Preview view">
      {MODES.map(([key, label]) => (
        <button key={key} type="button" className="btn-accent-outline" aria-pressed={mode === key} onClick={() => onToggle(key)}>
          {mode === key ? 'Show design' : label}
        </button>
      ))}
    </div>
  )
}
