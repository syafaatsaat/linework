import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted static font files, one per weight. Google Fonts serves Hanken
// Grotesk as a variable font, which Chrome embeds in printed PDFs as Type 3,
// a font type some ATS parsers read poorly.
import '@fontsource/hanken-grotesk/400.css'
import '@fontsource/hanken-grotesk/600.css'
import '@fontsource/hanken-grotesk/700.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import App from './components/App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
