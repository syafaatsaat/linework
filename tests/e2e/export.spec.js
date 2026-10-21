import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { headings, open, sample, sheet } from './helpers.js'

// Text of each page as an ATS would extract it (one string per page).
async function pdfText(buffer) {
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const content = await (await pdf.getPage(i)).getTextContent()
    pages.push(content.items.map((item) => item.str + (item.hasEOL ? '\n' : '')).join(''))
  }
  return pages
}

async function importFile(page, file) {
  await page.locator('input[type=file]').setInputFiles(file)
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  return dialog
}

test.beforeEach(async ({ page }) => {
  await open(page, sample)
})

test('PDF prints the CV only, as real text with standard headings', async ({ page }) => {
  // page.pdf() renders with print media, like the browser's Save as PDF.
  const buffer = await page.pdf({ preferCSSPageSize: true })
  const pages = await pdfText(buffer)
  expect(pages).toHaveLength(1)
  const text = pages[0]

  for (const heading of ['Summary', 'Skills', 'Work Experience', 'Education', 'Projects']) {
    expect(text).toContain(heading)
  }
  expect(text).toContain('ada@example.com | +65 8123 4567 | Singapore')
  expect(text).toContain('Mar 2021 – Present')
  // No app UI, and headings aren't letter-spaced.
  expect(text).not.toMatch(/Export PDF|Parser view|Drag tabs|210 mm/)
  expect(text).not.toMatch(/E D U C A T I O N/)
})

test('PDF export suggests First_Last_CV as the file name', async ({ page }) => {
  await page.evaluate(() => {
    window.print = () => {
      window.__printedTitle = document.title
    }
  })
  await page.getByRole('button', { name: 'Export PDF' }).click()
  expect(await page.evaluate(() => window.__printedTitle)).toBe('Ada_Tan_CV')
})

test('a printed PDF imports back into the same sections', async ({ page }) => {
  const buffer = await page.pdf({ preferCSSPageSize: true })
  await open(page)

  const dialog = await importFile(page, { name: 'Ada_Tan_CV.pdf', mimeType: 'application/pdf', buffer })
  await expect(dialog).toContainText('General: Ada Tan · ada@example.com · +65 8123 4567')
  await expect(dialog).toContainText('Work Experience: 2 entries')
  await dialog.getByRole('button', { name: 'Import' }).click()

  await expect.poll(() => headings(page)).toEqual(['Summary', 'Skills', 'Work Experience', 'Education', 'Projects'])
  await expect(sheet(page).locator('.cv-item-title').first()).toHaveText('Senior Frontend Engineer')
})

test('DOCX downloads as First_Last_CV.docx and imports back exactly', async ({ page }) => {
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'DOCX' }).click()])
  expect(download.suggestedFilename()).toBe('Ada_Tan_CV.docx')
  const buffer = await readFile(await download.path())

  await open(page)
  const dialog = await importFile(page, { name: download.suggestedFilename(), mimeType: 'application/octet-stream', buffer })
  await expect(dialog).toContainText('This is a Linework export, so everything comes back exactly.')
  await dialog.getByRole('button', { name: 'Import' }).click()

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('linework:cv:v1')))
  expect(saved.order).toEqual(sample.order)
  expect(saved.committed).toEqual(sample.committed)
  expect(saved.review).toEqual([])
})

test('import rejects unsupported files with a message', async ({ page }) => {
  const dialog = await importFile(page, { name: 'cv.doc', mimeType: 'application/msword', buffer: Buffer.from('x') })
  await expect(dialog).toContainText('Old Word (.doc) files can’t be read.')
})
