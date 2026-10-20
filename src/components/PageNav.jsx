import { keepFocusInGroup } from '../lib/focus.js'
import { ChevronLeft, ChevronRight } from './Icons.jsx'

// ‹ Page X of Y ›. Desktop shows text labels; the mobile bottom bar is icon-only.
export default function PageNav({ page, count, onChange, compact = false }) {
  return (
    <nav className={compact ? 'page-nav page-nav--bar no-print' : 'page-nav no-print'} aria-label="CV pages" data-focus-group>
      <button
        type="button"
        className={compact ? 'btn-icon-box' : 'btn-outline btn-with-icon'}
        aria-label="Previous page"
        disabled={page <= 0}
        onClick={(e) => {
          onChange(page - 1)
          keepFocusInGroup(e.currentTarget)
        }}
      >
        <ChevronLeft size={compact ? 18 : 16} />
        {!compact && 'Prev'}
      </button>
      <span className="page-count" aria-live="polite">
        Page {page + 1} of {count}
      </span>
      <button
        type="button"
        className={compact ? 'btn-icon-box' : 'btn-outline btn-with-icon'}
        aria-label="Next page"
        disabled={page >= count - 1}
        onClick={(e) => {
          onChange(page + 1)
          keepFocusInGroup(e.currentTarget)
        }}
      >
        {!compact && 'Next'}
        <ChevronRight size={compact ? 18 : 16} />
      </button>
    </nav>
  )
}
