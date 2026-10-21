import { expect, test } from '@playwright/test'
import { open, sample } from './helpers.js'

test('reset from the Sections sheet can be undone, above the bottom bar', async ({ page }) => {
  await open(page, sample)
  await page.getByRole('button', { name: 'Sections: reorder or add' }).click()
  await page.getByRole('button', { name: 'Reset CV' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Reset CV' }).click()

  const toast = page.locator('.undo-toast')
  await expect(toast).toContainText('Cleared your CV.')
  const toastBox = await toast.boundingBox()
  const barBox = await page.locator('.m-bar').boundingBox()
  expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(barBox.y)

  await toast.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('button', { name: /^General\s*, submitted$/ })).toBeVisible()
})
