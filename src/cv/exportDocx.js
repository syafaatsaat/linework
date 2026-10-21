import { downloadBlob } from '../lib/download.js'
import { cvFileBase } from './fileName.js'

// docx is large, so it's only fetched the first time someone exports.
export async function exportDocx(blocks, name, data) {
  const { buildDocument, Packer } = await import('./docx.js')
  downloadBlob(await Packer.toBlob(buildDocument(blocks, name, data)), `${cvFileBase(name)}.docx`)
}
