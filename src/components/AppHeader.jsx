import ExportButtons from './ExportButtons.jsx'
import ImportButton from './ImportButton.jsx'
import { LogoIcon } from './Icons.jsx'
import ResetButton from './ResetButton.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function AppHeader({ theme, onToggleTheme, onReset, importCv, onExportPdf, onExportDocx }) {
  return (
    <header className="app-header no-print">
      <h1 className="sr-only">Linework CV builder</h1>
      <div className="app-header-inner">
        <div className="logo">
          <LogoIcon />
          <span className="logo-text">linework/cv</span>
        </div>
        <div className="header-actions">
          <ImportButton
            onImport={importCv.run}
            onReadingChange={importCv.setReading}
            hasData={importCv.hasData}
            className="btn-ghost"
          />
          <ResetButton onReset={onReset} className="btn-ghost" />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <ExportButtons onPdf={onExportPdf} onDocx={onExportDocx} />
        </div>
      </div>
    </header>
  )
}
