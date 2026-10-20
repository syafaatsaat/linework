import { useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { buildBlocks } from '../cv/blocks.js'
import { exportDocx } from '../cv/exportDocx.js'
import { printPdf } from '../cv/printPdf.js'
import { usePagination } from '../cv/usePagination.js'
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
  const [state, actions, submitted] = useCv()
  const [theme, toggleTheme] = useTheme()
  const [parser, setParser] = useState(false)
  const [requestedPage, setPage] = useState(0)
  const mobile = useMediaQuery(MOBILE_QUERY)

  const blocks = useMemo(() => buildBlocks(submitted), [submitted])
  const { flowRef, pages } = usePagination(blocks)

  // Clamp rather than reset, so removing content keeps you near where you were.
  const page = Math.min(requestedPage, pages.length - 1)
  const pageBlocks = useMemo(() => {
    const onPage = new Set(pages[page])
    return blocks.filter((block) => onPage.has(block.id))
  }, [blocks, pages, page])

  const name = submitted.committed.general[0]?.name

  const layoutProps = {
    cv: { state, actions },
    preview: {
      blocks,
      pageBlocks,
      page,
      pageCount: pages.length,
      setPage,
      parser,
      toggleParser: () => setParser(!parser),
    },
    theme: { value: theme, toggle: toggleTheme },
    reset: () => {
      actions.reset()
      setPage(0)
      setParser(false)
    },
    exports: {
      pdf: () => {
        // Leave parser view (and flush any closing sheet) before the print dialog opens.
        flushSync(() => setParser(false))
        printPdf(name)
      },
      docx: () => exportDocx(blocks, name),
    },
  }

  return (
    <>
      {mobile ? <MobileLayout {...layoutProps} /> : <DesktopLayout {...layoutProps} />}
      <CvFlow blocks={blocks} flowRef={flowRef} />
    </>
  )
}
