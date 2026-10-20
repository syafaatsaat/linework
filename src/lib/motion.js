import { flushSync } from 'react-dom'

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

const canTransition = () => Boolean(document.startViewTransition) && !prefersReducedMotion()

// Runs a state update inside a View Transition, so elements with a
// view-transition-name glide from their old position to their new one.
// Browsers without the API (or users who prefer reduced motion) just get
// the update.
//
// The browser runs the update a frame later, so this returns a promise for
// when it has happened; focus handling that depends on the new DOM waits on it.
export function withViewTransition(update) {
  if (!canTransition()) {
    update()
    return Promise.resolve()
  }
  return document.startViewTransition(() => flushSync(update)).updateCallbackDone
}

// A page turn in the preview: the whole sheet slides out one way and the new
// page in from the other ('next' or 'prev'). The data attribute switches the
// CSS from per-block names to one name for the page (motion.css).
let latestTurn = null
export function turnPage(direction, update) {
  if (!canTransition()) {
    update()
    return Promise.resolve()
  }
  const root = document.documentElement
  root.dataset.pageTurn = direction
  const transition = document.startViewTransition(() => flushSync(update))
  latestTurn = transition
  // A quick second click starts a new turn; only the latest clears the flag.
  transition.finished.finally(() => {
    if (latestTurn === transition) delete root.dataset.pageTurn
  })
  return transition.updateCallbackDone
}
