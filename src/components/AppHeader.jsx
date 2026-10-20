// Theme toggle and export buttons join the logo in later build steps.
export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="logo">
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="22" height="22" />
            <path d="M3 10h22M10 10v15" />
          </svg>
          <span className="logo-text">linework/cv</span>
        </div>
      </div>
    </header>
  )
}
