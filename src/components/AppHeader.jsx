import ExportButtons from './ExportButtons.jsx'

// The theme toggle joins the logo and export buttons in step 7.
export default function AppHeader({ onExportPdf }) {
  return (
    <header className="app-header no-print">
      <div className="app-header-inner">
        <div className="logo">
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="22" height="22" />
            <path d="M3 10h22M10 10v15" />
          </svg>
          <span className="logo-text">linework/cv</span>
        </div>
        <ExportButtons onPdf={onExportPdf} />
      </div>
    </header>
  )
}
