import { useEffect, useState } from 'react'
import { revealTheme } from '../lib/motion.js'
import { loadJSON, saveText } from '../lib/storage.js'

// Must match the pre-paint script in index.html.
export const THEME_KEY = 'linework:theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function systemTheme() {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light'
}

function savedTheme() {
  const theme = loadJSON(THEME_KEY)
  return theme === 'dark' || theme === 'light' ? theme : null
}

// Follows the OS setting until the user picks a theme; the pick is saved and
// wins from then on.
export function useTheme() {
  const [chosen, setChosen] = useState(savedTheme)
  const [system, setSystem] = useState(systemTheme)
  const theme = chosen ?? system

  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY)
    if (!media) return
    const onChange = (e) => setSystem(e.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // `origin` is the toggle button: the new theme is revealed from it.
  const toggle = (origin) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    revealTheme(origin, () => {
      setChosen(next)
      // Set it here too, not just in the effect above, so the transition's
      // "after" snapshot already has the new theme.
      document.documentElement.dataset.theme = next
    })
    saveText(THEME_KEY, JSON.stringify(next))
  }

  return [theme, toggle]
}
