import { useAsyncAction } from '../lib/useAsyncAction.js'
import FlashLabel from './FlashLabel.jsx'
import { CheckIcon, DocxIcon, PdfIcon } from './Icons.jsx'

// Split button group in the desktop header: [Export PDF][DOCX].
export default function ExportButtons({ onPdf, onDocx }) {
  const docx = useAsyncAction(onDocx)

  return (
    <div className="export">
      <div className="export-group" role="group" aria-label="Export CV">
        <button type="button" className="btn-solid btn-split-start" onClick={onPdf}>
          <PdfIcon />
          Export PDF
        </button>
        <button type="button" className="btn-split-end" onClick={docx.run} disabled={docx.busy} aria-busy={docx.busy}>
          {docx.done ? <CheckIcon /> : <DocxIcon />}
          <FlashLabel on={docx.done} label="DOCX" />
        </button>
      </div>
      <p className="sr-only" role="status">
        {docx.done ? 'DOCX saved to your downloads.' : ''}
      </p>
      {docx.failed && (
        <p className="export-error" role="alert">
          DOCX export failed. Try again.
        </p>
      )}
    </div>
  )
}
