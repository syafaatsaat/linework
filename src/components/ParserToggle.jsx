export default function ParserToggle({ on, onToggle }) {
  return (
    <button type="button" className="btn-accent-outline" aria-pressed={on} onClick={onToggle}>
      {on ? 'Show design' : 'Parser view'}
    </button>
  )
}
