export default function PageNav({ page, count, onChange }) {
  const atFirst = page <= 0
  const atLast = page >= count - 1

  return (
    <>
      <nav className="page-nav no-print" aria-label="CV pages">
        <button type="button" className="btn-outline" aria-label="Previous page" disabled={atFirst} onClick={() => onChange(page - 1)}>
          ‹ Prev
        </button>
        <span className="page-count" aria-live="polite">
          Page {page + 1} of {count}
        </span>
        <button type="button" className="btn-outline" aria-label="Next page" disabled={atLast} onClick={() => onChange(page + 1)}>
          Next ›
        </button>
      </nav>
      {count > 2 && (
        <p className="page-warn no-print" role="status">
          {count} pages. Most recruiters expect 1–2: trim older roles or bullets.
        </p>
      )}
    </>
  )
}
