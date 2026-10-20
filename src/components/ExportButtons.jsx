// Split button group in the header. DOCX joins PDF in step 5.
export default function ExportButtons({ onPdf }) {
  return (
    <div className="export-group" role="group" aria-label="Export CV">
      <button type="button" className="btn-solid" onClick={onPdf}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3H6v18h12V7z" />
          <path d="M14 3v4h4" />
          <path d="M12 11v6M9 14l3 3 3-3" />
        </svg>
        Export PDF
      </button>
    </div>
  )
}
