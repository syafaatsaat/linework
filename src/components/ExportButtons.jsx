import { useState } from 'react'

const FileIcon = ({ children }) => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H6v18h12V7z" />
    <path d="M14 3v4h4" />
    {children}
  </svg>
)

// Split button group in the header: [Export PDF][DOCX].
export default function ExportButtons({ onPdf, onDocx }) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const docx = async () => {
    setBusy(true)
    setFailed(false)
    try {
      await onDocx()
    } catch (error) {
      console.error(error)
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="export">
      <div className="export-group" role="group" aria-label="Export CV">
        <button type="button" className="btn-solid btn-split-start" onClick={onPdf}>
          <FileIcon>
            <path d="M12 11v6M9 14l3 3 3-3" />
          </FileIcon>
          Export PDF
        </button>
        <button type="button" className="btn-split-end" onClick={docx} disabled={busy} aria-busy={busy}>
          <FileIcon>
            <path d="M9 12l1 5 2-4 2 4 1-5" />
          </FileIcon>
          DOCX
        </button>
      </div>
      {failed && (
        <p className="export-error" role="alert">
          DOCX export failed. Try again.
        </p>
      )}
    </div>
  )
}
