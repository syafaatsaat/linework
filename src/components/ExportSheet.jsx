import { useAsyncAction } from '../lib/useAsyncAction.js'
import FlashLabel from './FlashLabel.jsx'
import { CheckIcon, DocxIcon, PdfIcon } from './Icons.jsx'

// Contents of the mobile "Export CV" sheet: two large choices.
export default function ExportSheet({ pageCount, onPdf, onDocx }) {
  const docx = useAsyncAction(onDocx)

  return (
    <>
      <button type="button" className="export-choice export-choice--primary" onClick={onPdf}>
        <PdfIcon size={28} strokeWidth={1.8} />
        <span className="export-choice-text">
          <span className="export-choice-title">
            PDF · {pageCount} {pageCount === 1 ? 'page' : 'pages'}
          </span>
          <span className="export-choice-sub">Best for most applications and emailing</span>
        </span>
      </button>
      <button type="button" className="export-choice" onClick={docx.run} disabled={docx.busy} aria-busy={docx.busy}>
        {docx.done ? <CheckIcon size={28} strokeWidth={1.8} /> : <DocxIcon size={28} strokeWidth={1.8} />}
        <span className="export-choice-text">
          <span className="export-choice-title">
            <FlashLabel on={docx.done} label="Word · DOCX" done="Saved to Downloads" />
          </span>
          <span className="export-choice-sub">For job portals that ask for a Word file</span>
        </span>
      </button>
      <p className="sr-only" role="status">
        {docx.done ? 'DOCX saved to your downloads.' : ''}
      </p>
      {docx.failed && (
        <p className="export-error" role="alert">
          DOCX export failed. Try again.
        </p>
      )}
      <p className="sheet-text">Both files use the same single-column, ATS-ready layout and save to your Downloads.</p>
    </>
  )
}
