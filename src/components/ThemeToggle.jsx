import { MoonIcon, SunIcon } from './Icons.jsx'

// Announced as a "Dark mode" toggle with aria-pressed, so the visible label
// (the theme you'd switch to) changing doesn't confuse screen readers.
// Compact is the icon-only button in the mobile header.
export default function ThemeToggle({ theme, onToggle, compact = false }) {
  const dark = theme === 'dark'
  const size = compact ? 20 : 16

  return (
    <button
      type="button"
      className={compact ? 'btn-icon' : 'btn-theme'}
      aria-label="Dark mode"
      aria-pressed={dark}
      onClick={onToggle}
    >
      {dark ? <SunIcon size={size} /> : <MoonIcon size={size} />}
      {!compact && <span aria-hidden="true">{dark ? 'Light' : 'Dark'}</span>}
    </button>
  )
}
