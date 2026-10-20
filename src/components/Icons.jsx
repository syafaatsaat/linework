// Inline stroke icons. All decorative: the button around them carries the label.

function Icon({ size = 16, strokeWidth = 2, children }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

export const LogoIcon = ({ size = 28 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="22" height="22" />
    <path d="M3 10h22M10 10v15" />
  </svg>
)

export const SunIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
)

export const MoonIcon = (props) => (
  <Icon {...props}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </Icon>
)

export const PdfIcon = (props) => (
  <Icon {...props}>
    <path d="M14 3H6v18h12V7z" />
    <path d="M14 3v4h4" />
    <path d="M12 11v6M9 14l3 3 3-3" />
  </Icon>
)

export const DocxIcon = (props) => (
  <Icon {...props}>
    <path d="M14 3H6v18h12V7z" />
    <path d="M14 3v4h4" />
    <path d="M9 12l1 5 2-4 2 4 1-5" />
  </Icon>
)

export const DownloadIcon = (props) => (
  <Icon {...props}>
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M4 20h16" />
  </Icon>
)

export const ReorderIcon = (props) => (
  <Icon strokeWidth={2.2} {...props}>
    <path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" />
  </Icon>
)

export const ChevronLeft = (props) => (
  <Icon size={18} {...props}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
)

export const ChevronRight = (props) => (
  <Icon size={18} {...props}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
)

export const ChevronUp = (props) => (
  <Icon size={18} {...props}>
    <path d="M6 15l6-6 6 6" />
  </Icon>
)

export const ChevronDown = (props) => (
  <Icon size={18} {...props}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
)
