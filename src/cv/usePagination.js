import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { paginate } from './paginate.js'

// Measures every block in the hidden flow (CvFlow) and packs them into pages.
// The usable page height comes from CvFlow's probe element, which CSS sizes
// to A4 minus the print margins, so no visible sheet needs to be mounted —
// the page count is known even on mobile's Edit view.
export function usePagination(blocks) {
  const flowRef = useRef(null)
  const [pages, setPages] = useState(() => [blocks.map((b) => b.id)])

  const measure = useCallback(() => {
    const root = flowRef.current
    const probe = root?.querySelector('.cv-page-probe')
    if (!probe) return

    const heights = Array.from(root.querySelectorAll('[data-blk]'), (el) => el.offsetHeight)
    const next = paginate(blocks, heights, probe.offsetHeight)

    setPages((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
  }, [blocks])

  // Data change: measure before paint so the sheet never flashes overflow.
  useLayoutEffect(measure, [measure])

  // The flow is a fixed A4 width, so window resizes don't rewrap it, but
  // anything that does change its height (text zoom, minimum font size
  // settings, late layout) is caught by watching the flow itself.
  useEffect(() => {
    const flow = flowRef.current?.querySelector('.cv-flow')
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

  return { flowRef, pages }
}
