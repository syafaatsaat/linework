// "Ada Tan" → "Ada_Tan_CV". Shared by the PDF title and the DOCX download.
export function cvFileBase(name) {
  const safe = String(name || '')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_')
  return safe ? `${safe}_CV` : 'CV'
}
