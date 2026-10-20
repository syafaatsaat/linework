import CvSheet from './CvSheet.jsx'
import PageNav from './PageNav.jsx'
import PageWarning from './PageWarning.jsx'
import ParserToggle from './ParserToggle.jsx'
import ParserView from './ParserView.jsx'

// The real A4 page scaled to the screen width (not reflowed).
export default function MobilePreview({ blocks, pageBlocks, changed, scanning, page, pageCount, onPageChange, parser, onToggleParser }) {
  return (
    <>
      <main className="m-main m-preview">
        <div className="m-preview-bar">
          <span className="mono-meta">A4 · submitted sections only</span>
          <ParserToggle on={parser} onToggle={onToggleParser} />
        </div>
        {parser ? (
          <ParserView blocks={blocks} />
        ) : (
          <>
            <CvSheet blocks={pageBlocks} changed={changed} scanning={scanning} label={`CV preview, page ${page + 1} of ${pageCount}`} />
            <PageWarning count={pageCount} />
          </>
        )}
      </main>
      {!parser && <PageNav page={page} count={pageCount} onChange={onPageChange} compact />}
    </>
  )
}
