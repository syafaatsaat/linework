import CvSheet from './CvSheet.jsx'
import DimensionLine from './DimensionLine.jsx'
import PageNav from './PageNav.jsx'
import PageWarning from './PageWarning.jsx'
import ParserView from './ParserView.jsx'
import ParserToggle from './ParserToggle.jsx'

// Desktop preview column.
export default function PreviewStage({ blocks, pageBlocks, changed, scanning, page, pageCount, onPageChange, parser, onToggleParser }) {
  return (
    <main className="stage">
      <div className="stage-bar no-print">
        <span className="mono-meta">ATS-ready · single column · text-based</span>
        <ParserToggle on={parser} onToggle={onToggleParser} />
      </div>
      <DimensionLine />
      <div className="stage-holder">
        {parser ? (
          <ParserView blocks={blocks} />
        ) : (
          <CvSheet blocks={pageBlocks} changed={changed} scanning={scanning} label={`CV preview, page ${page + 1} of ${pageCount}`} />
        )}
      </div>
      {!parser && (
        <>
          <PageNav page={page} count={pageCount} onChange={onPageChange} />
          <PageWarning count={pageCount} />
        </>
      )}
      <p className="mono-meta no-print">Preview shows submitted sections only · prints on white in both themes</p>
    </main>
  )
}
