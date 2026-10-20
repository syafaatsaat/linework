import { cvFileBase } from './fileName.js'

// Text-based PDF via the browser's print dialog, so ATS can read it.
// Browsers suggest the document title as the PDF name.
export function printPdf(name) {
  const previous = document.title
  document.title = cvFileBase(name)
  const restore = () => {
    document.title = previous
  }
  window.addEventListener('afterprint', restore, { once: true })
  window.print()
}
