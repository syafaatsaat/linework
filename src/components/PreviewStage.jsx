import { useState } from 'react'
import { usePagination } from '../cv/usePagination.js'
import CvFlow from './CvFlow.jsx'
import CvSheet from './CvSheet.jsx'
import DimensionLine from './DimensionLine.jsx'
import PageNav from './PageNav.jsx'
import ParserView from './ParserView.jsx'

export default function PreviewStage({ blocks, parser, onToggleParser }) {
  const { flowRef, sheetRef, pages } = usePagination(blocks)
  const [requestedPage, setPage] = useState(0)

  // Clamp rather than reset, so removing content keeps you near where you were.
  const page = Math.min(requestedPage, pages.length - 1)
  const onPage = new Set(pages[page])
  const pageBlocks = blocks.filter((block) => onPage.has(block.id))

  return (
    <main className="stage">
      <div className="stage-bar no-print">
        <span className="mono-meta">ATS-ready · single column · text-based</span>
        <button type="button" className="btn-accent-outline" aria-pressed={parser} onClick={onToggleParser}>
          {parser ? 'Show design' : 'Parser view'}
        </button>
      </div>
      <DimensionLine />
      <div className="stage-holder">
        {parser ? (
          <ParserView blocks={blocks} />
        ) : (
          <CvSheet
            blocks={pageBlocks}
            sheetRef={sheetRef}
            label={`CV preview, page ${page + 1} of ${pages.length}`}
          />
        )}
        <CvFlow blocks={blocks} flowRef={flowRef} />
      </div>
      {!parser && <PageNav page={page} count={pages.length} onChange={setPage} />}
      <p className="mono-meta no-print">Preview shows submitted sections only · prints on white in both themes</p>
    </main>
  )
}
