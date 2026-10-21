import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { full } from '../fixtures.js'
import { open } from './helpers.js'

const saved = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('linework:cv:v1')))

async function importFile(page, file) {
  await page.locator('input[type=file]').setInputFiles(file)
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  return dialog
}

test('Back up saves a file that Import restores exactly', async ({ page }) => {
  await open(page, { ...full, review: ['awards'] })
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Back up' }).click()])
  expect(download.suggestedFilename()).toMatch(/^Ada_Tan_CV_backup_\d{4}-\d{2}-\d{2}\.json$/)
  const buffer = await readFile(await download.path())

  await open(page)
  const dialog = await importFile(page, { name: download.suggestedFilename(), mimeType: 'application/json', buffer })
  await expect(dialog).toContainText('This is a Linework backup, so everything comes back exactly.')
  await dialog.getByRole('button', { name: 'Import' }).click()

  expect(await saved(page)).toEqual({ ...full, review: ['awards'] })
})

test('other JSON files are rejected with a message', async ({ page }) => {
  await open(page)
  const dialog = await importFile(page, { name: 'data.json', mimeType: 'application/json', buffer: Buffer.from('{"a":1}') })
  await expect(dialog).toContainText('That file isn’t a Linework backup.')
})
