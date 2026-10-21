import CvSheet from './CvSheet.jsx'
import PageNav from './PageNav.jsx'
import PageWarning from './PageWarning.jsx'
import JobMatch from './JobMatch.jsx'
import ParserView from './ParserView.jsx'
import PreviewModes from './PreviewModes.jsx'

// The real A4 page scaled to the screen width (not reflowed).
export default function MobilePreview({ blocks, pageBlocks, changed, scanning, page, pageCount, onPageChange, mode, onToggleMode }) {
  return (
    <>
      <main className="m-main m-preview">
        <div className="m-preview-bar">
          <span className="mono-meta">A4 · submitted sections only</span>
          <PreviewModes mode={mode} onToggle={onToggleMode} />
        </div>
        {mode === 'parser' ? (
          <ParserView blocks={blocks} />
        ) : mode === 'match' ? (
          <JobMatch blocks={blocks} />
        ) : (
          <>
            <CvSheet blocks={pageBlocks} changed={changed} scanning={scanning} label={`CV preview, page ${page + 1} of ${pageCount}`} />
            <PageWarning count={pageCount} />
          </>
        )}
      </main>
      {mode === 'sheet' && <PageNav page={page} count={pageCount} onChange={onPageChange} compact />}
    </>
  )
}
