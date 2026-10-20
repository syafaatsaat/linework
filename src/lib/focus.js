// Focus helpers for actions that re-render or remove the focused control.
// Without them focus falls back to <body> and keyboard / screen reader users
// are thrown to the top of the page.

// Focus whatever `find` returns once React has committed the update.
export function focusAfterRender(find) {
  requestAnimationFrame(() => find()?.focus())
}

// For paired buttons (Prev/Next, Earlier/Later): if the pressed one just got
// disabled or removed, move focus to an enabled button in the same
// [data-focus-group].
export function keepFocusInGroup(button) {
  const group = button.closest('[data-focus-group]')
  focusAfterRender(() => {
    if (button.isConnected && !button.disabled) return null
    return group?.querySelector('button:not(:disabled)')
  })
}
