// A button label that briefly swaps to a confirmation ("Saved") after an
// action. Both labels share one grid cell (interaction.css), so the button
// keeps its width; the hidden one is out of the accessibility tree too.
export default function FlashLabel({ on, label, done = 'Saved' }) {
  return (
    <span className="flash-label">
      <span data-hidden={on || undefined}>{label}</span>
      <span data-hidden={!on || undefined} className={on ? 'flash-in' : undefined}>
        {done}
      </span>
    </span>
  )
}
