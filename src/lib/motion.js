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

// Two elements trade places in a View Transition: an entry moving one step
// earlier or later. The entry fieldsets are positional (React keeps the
// elements and swaps what's in them), so the names are set by hand and
// swapped with the content: each entry keeps its name and glides to the
// other's place.
export function swapWithTransition(first, second, update) {
  if (!canTransition() || !first || !second) {
    update()
    return Promise.resolve()
  }
  first.style.viewTransitionName = 'swap-a'
  second.style.viewTransitionName = 'swap-b'
  const transition = document.startViewTransition(() => {
    flushSync(update)
    first.style.viewTransitionName = 'swap-b'
    second.style.viewTransitionName = 'swap-a'
  })
  transition.finished.finally(() => {
    first.style.viewTransitionName = ''
    second.style.viewTransitionName = ''
  })
  return transition.updateCallbackDone
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

// The theme switch spreads out in a circle from `origin` (the toggle button).
// Sets the circle's centre and radius as CSS variables and flags the root so
// motion.css animates the whole page as one image (no per-element names).
export function revealTheme(origin, update) {
  if (!canTransition() || !origin) {
    update()
    return Promise.resolve()
  }
  const root = document.documentElement
  const box = origin.getBoundingClientRect()
  const x = box.left + box.width / 2
  const y = box.top + box.height / 2
  // Far enough to reach the furthest corner of the viewport.
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  root.style.setProperty('--reveal-x', `${x}px`)
  root.style.setProperty('--reveal-y', `${y}px`)
  root.style.setProperty('--reveal-r', `${radius}px`)
  root.dataset.themeReveal = ''
  const transition = document.startViewTransition(() => flushSync(update))
  transition.finished.finally(() => {
    delete root.dataset.themeReveal
  })
  return transition.updateCallbackDone
}
