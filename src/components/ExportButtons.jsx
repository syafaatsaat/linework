import { useAsyncAction } from '../lib/useAsyncAction.js'
import { DocxIcon, PdfIcon } from './Icons.jsx'

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
          <DocxIcon />
          DOCX
        </button>
      </div>
      {docx.failed && (
        <p className="export-error" role="alert">
          DOCX export failed. Try again.
        </p>
      )}
    </div>
  )
}
