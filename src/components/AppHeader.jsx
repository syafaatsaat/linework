import ExportButtons from './ExportButtons.jsx'
import { LogoIcon } from './Icons.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function AppHeader({ theme, onToggleTheme, onExportPdf, onExportDocx }) {
  return (
    <header className="app-header no-print">
      <div className="app-header-inner">
        <div className="logo">
          <LogoIcon />
          <span className="logo-text">linework/cv</span>
        </div>
        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <ExportButtons onPdf={onExportPdf} onDocx={onExportDocx} />
        </div>
      </div>
    </header>
  )
}
