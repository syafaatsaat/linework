const SunIcon = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

const MoonIcon = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </svg>
)

// Shows the theme you'd switch to. Announced as a "Dark mode" toggle with
// aria-pressed, so the visible label changing doesn't confuse screen readers.
export default function ThemeToggle({ theme, onToggle }) {
  const dark = theme === 'dark'

  return (
    <button type="button" className="btn-theme" aria-label="Dark mode" aria-pressed={dark} onClick={onToggle}>
      {dark ? <SunIcon /> : <MoonIcon />}
      <span aria-hidden="true">{dark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
