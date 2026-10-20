import { DownloadIcon, LogoIcon } from './Icons.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function MobileHeader({ theme, onToggleTheme, onExport }) {
  return (
    <header className="m-header">
      <div className="logo logo--compact">
        <LogoIcon size={24} />
        <span className="logo-text">linework/cv</span>
      </div>
      <div className="m-header-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
        <button type="button" className="m-export-btn" aria-haspopup="dialog" onClick={onExport}>
          <DownloadIcon />
          Export
        </button>
      </div>
    </header>
  )
}
