import { useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { buildBlocks } from '../cv/blocks.js'
import { exportDocx } from '../cv/exportDocx.js'
import { printPdf } from '../cv/printPdf.js'
import { useChangedBlocks } from '../cv/useChangedBlocks.js'
import { usePagination } from '../cv/usePagination.js'
import { turnPage, withViewTransition } from '../lib/motion.js'
import { useMediaQuery } from '../lib/useMediaQuery.js'
import { useCv } from '../state/useCv.js'
import { useTheme } from '../state/useTheme.js'
import CvFlow from './CvFlow.jsx'
import DesktopLayout from './DesktopLayout.jsx'
import MobileLayout from './MobileLayout.jsx'

// Below this the app switches to the mobile layout. Between it and ~960px the
// desktop columns stack.
const MOBILE_QUERY = '(max-width: 719px)'

export default function App() {
  const [state, rawActions, submitted] = useCv()
  const [theme, toggleTheme] = useTheme()
  const [parser, setParser] = useState(false)
  const [requestedPage, setPage] = useState(0)
  const mobile = useMediaQuery(MOBILE_QUERY)

  // Reordering animates: tabs, chips, sheet rows and preview blocks glide to
  // their new places (see lib/motion.js).
  const actions = useMemo(
    () => ({ ...rawActions, move: (key, to) => withViewTransition(() => rawActions.move(key, to)) }),
    [rawActions],
  )

  const blocks = useMemo(() => buildBlocks(submitted), [submitted])
  const { flowRef, pages } = usePagination(blocks)
  const changed = useChangedBlocks(blocks)

  // Clamp rather than reset, so removing content keeps you near where you were.
  const page = Math.min(requestedPage, pages.length - 1)
  const pageBlocks = useMemo(() => {
    const onPage = new Set(pages[page])
    return blocks.filter((block) => onPage.has(block.id))
  }, [blocks, pages, page])

  // Show where an edit landed: when a new set of changes arrives and it's on
  // another page, go there. (Adjusting state during render, once per change set.)
  const [jumpedFor, setJumpedFor] = useState(changed)
  if (jumpedFor !== changed) {
    setJumpedFor(changed)
    const target = pages.findIndex((ids) => ids.some((id) => changed.has(id)))
    if (target >= 0 && target !== page) setPage(target)
  }

  const name = submitted.committed.general[0]?.name
  const hasData = submitted.order.some((key) => submitted.committed[key]?.length > 0)

  const layoutProps = {
    cv: { state, actions },
    preview: {
      blocks,
      pageBlocks,
      changed,
      page,
      pageCount: pages.length,
      // Prev/Next slides the page in the direction of travel (lib/motion.js).
      goToPage: (target) => turnPage(target > page ? 'next' : 'prev', () => setPage(target)),
      parser,
      toggleParser: () => setParser(!parser),
    },
    theme: { value: theme, toggle: toggleTheme },
    reset: () => {
      actions.reset()
      setPage(0)
      setParser(false)
    },
    importCv: {
      hasData,
      run: (result) => {
        actions.importCv({ ...result.data, review: result.review })
        setPage(0)
        setParser(false)
      },
    },
    exports: {
      pdf: () => {
        // Leave parser view (and flush any closing sheet) before the print dialog opens.
        flushSync(() => setParser(false))
        printPdf(name)
      },
      docx: () => exportDocx(blocks, name, { order: submitted.order, committed: submitted.committed }),
    },
  }

  return (
    <>
      {mobile ? <MobileLayout {...layoutProps} /> : <DesktopLayout {...layoutProps} />}
      <CvFlow blocks={blocks} flowRef={flowRef} />
    </>
  )
}
