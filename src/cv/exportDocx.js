import { cvFileBase } from './fileName.js'

// docx is large, so it's only fetched the first time someone exports.
export async function exportDocx(blocks, name) {
  const { buildDocument, Packer } = await import('./docx.js')
  const blob = await Packer.toBlob(buildDocument(blocks, name))

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${cvFileBase(name)}.docx`
  document.body.append(link)
  link.click()
  link.remove()
  // Give the browser a moment to start the download before freeing the blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
