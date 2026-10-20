export default function CharCounter({ id, length, max }) {
  const atLimit = length >= max
  const nearLimit = length >= max * 0.9
  const className = nearLimit ? 'counter counter--warn' : 'counter'

  return (
    <p id={id} className={className} aria-live="polite">
      {length} / {max}
      {atLimit && ' · limit reached'}
    </p>
  )
}
