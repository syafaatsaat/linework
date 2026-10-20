import { parseCv } from './parseCv.js'
import { readDocx } from './readDocx.js'

// Errors whose message is written for the user.
export class ImportError extends Error {}

const MAX_BYTES = 10 * 1024 * 1024

function kindOf(file) {
  const name = file.name.toLowerCase()
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (name.endsWith('.docx')) return 'docx'
  if (name.endsWith('.doc')) {
    throw new ImportError('Old Word (.doc) files can’t be read. Save it as .docx or PDF and try again.')
  }
  throw new ImportError('Choose a PDF or Word (.docx) file.')
}

// Returns { data: { order, committed }, review: [sectionKey], notes: [string], exact }.
export async function readCvFile(file) {
  const kind = kindOf(file)
  if (file.size > MAX_BYTES) throw new ImportError('That file is over 10 MB. A CV should be much smaller.')
  const buffer = await file.arrayBuffer()

  let lines
  if (kind === 'docx') {
    let docx
    try {
      docx = await readDocx(buffer)
    } catch {
      throw new ImportError('That doesn’t look like a valid Word file.')
    }
    // Exported by Linework: restore it exactly, nothing to check.
    if (docx.embedded) return { data: docx.embedded, review: [], notes: [], exact: true }
    lines = docx.lines
  } else {
    const { readPdf } = await import('./readPdf.js')
    try {
      lines = await readPdf(buffer)
    } catch (error) {
      console.error(error)
      if (error?.name === 'PasswordException') throw new ImportError('That PDF is password-protected. Remove the password and try again.')
      throw new ImportError('That doesn’t look like a valid PDF.')
    }
  }

  if (!lines.some((line) => /[a-z]{2}/i.test(line.text))) {
    throw new ImportError(
      kind === 'pdf'
        ? 'No text found in that PDF. It may be a scanned image, which Linework can’t read. Try the Word version instead.'
        : 'No text found in that file.',
    )
  }
  return { ...parseCv(lines), exact: false }
}
