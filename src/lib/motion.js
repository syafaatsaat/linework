import { flushSync } from 'react-dom'

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

// Runs a state update inside a View Transition, so elements with a
// view-transition-name glide from their old position to their new one.
// Browsers without the API (or users who prefer reduced motion) just get
// the update.
export function withViewTransition(update) {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}
