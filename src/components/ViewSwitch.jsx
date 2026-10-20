// Segmented control: Edit | Preview · Np. A nav, since it switches between
// the app's two views (and so sits in a landmark).
export default function ViewSwitch({ view, pageCount, onChange }) {
  return (
    <nav className="m-switch" aria-label="View">
      <button type="button" aria-pressed={view === 'edit'} onClick={() => onChange('edit')}>
        Edit
      </button>
      <button type="button" aria-pressed={view === 'preview'} onClick={() => onChange('preview')}>
        Preview · {pageCount}p
      </button>
    </nav>
  )
}
