import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { paginate } from './paginate.js'

// Measures every block in the hidden full-width flow and packs them into
// page-height buckets sized from the visible sheet.
//
// Returns refs for both elements plus the page list. The sheet ref is a
// callback ref so measuring resumes when the sheet remounts (e.g. after
// leaving parser view).
export function usePagination(blocks) {
  const flowRef = useRef(null)
  const [sheet, setSheet] = useState(null)
  const [pages, setPages] = useState(() => [blocks.map((b) => b.id)])

  const measure = useCallback(() => {
    const flow = flowRef.current
    if (!flow || !sheet) return

    const style = getComputedStyle(sheet)
    const capacity = sheet.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
    const heights = Array.from(flow.querySelectorAll('[data-blk]'), (el) => el.offsetHeight)
    const next = paginate(blocks, heights, capacity)

    setPages((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
  }, [blocks, sheet])

  // Data change: measure before paint so the sheet never flashes overflow.
  useLayoutEffect(measure, [measure])

  // Resize: the flow is a fixed A4 width, so window resizes don't rewrap it,
  // but anything that does change its height (text zoom, minimum font size
  // settings, late layout) is caught by watching the flow itself.
  useEffect(() => {
    const flow = flowRef.current
    if (!flow || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => measure())
    observer.observe(flow)
    return () => observer.disconnect()
  }, [measure])

  // Web fonts change line heights once they load.
  useEffect(() => {
    let live = true
    document.fonts?.ready.then(() => live && measure())
    return () => {
      live = false
    }
  }, [measure])

  return { flowRef, sheetRef: setSheet, pages }
}
