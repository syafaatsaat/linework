import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { pdfItemsToLines } from './pdfLines.js'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

// PDF.js is large, so this module is only loaded when someone imports a PDF.
export async function readPdf(buffer) {
  const task = pdfjs.getDocument({ data: new Uint8Array(buffer) })
  const doc = await task.promise
  try {
    const pages = []
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n)
      pages.push(await page.getTextContent())
    }
    return pdfItemsToLines(pages)
  } finally {
    task.destroy()
  }
}
