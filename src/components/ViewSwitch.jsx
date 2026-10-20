// Segmented control: Edit | Preview · Np
export default function ViewSwitch({ view, pageCount, onChange }) {
  return (
    <div className="m-switch" role="group" aria-label="View">
      <button type="button" aria-pressed={view === 'edit'} onClick={() => onChange('edit')}>
        Edit
      </button>
      <button type="button" aria-pressed={view === 'preview'} onClick={() => onChange('preview')}>
        Preview · {pageCount}p
      </button>
    </div>
  )
}
