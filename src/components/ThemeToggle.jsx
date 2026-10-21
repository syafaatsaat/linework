import { MoonIcon, SunIcon } from './Icons.jsx'

// Icon-only, announced as a "Dark mode" toggle with aria-pressed. The icon
// shows the theme you'd switch to. Compact is the mobile header version.
export default function ThemeToggle({ theme, onToggle, compact = false }) {
  const dark = theme === 'dark'
  const size = compact ? 20 : 16

  return (
    <button
      type="button"
      className={compact ? 'btn-icon' : 'btn-ghost btn-ghost--icon'}
      aria-label="Dark mode"
      aria-pressed={dark}
      onClick={(e) => onToggle(e.currentTarget)}
    >
      {dark ? <SunIcon size={size} /> : <MoonIcon size={size} />}
    </button>
  )
}
