// "Ada Tan" → "Ada_Tan_CV". Browsers suggest the document title as the PDF name.
export function cvFileBase(name) {
  const safe = String(name || '')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_')
  return safe ? `${safe}_CV` : 'CV'
}

// Text-based PDF via the browser's print dialog, so ATS can read it.
export function printPdf(name) {
  const previous = document.title
  document.title = cvFileBase(name)
  const restore = () => {
    document.title = previous
  }
  window.addEventListener('afterprint', restore, { once: true })
  window.print()
}
