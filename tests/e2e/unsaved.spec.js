import { expect, test } from '@playwright/test'
import { open, sample, tab } from './helpers.js'

// Closes the page as a user closing the tab would, and reports whether the
// browser asked first (the beforeunload prompt), dismissing it if so.
async function closeAsks(page) {
  const prompt = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null)
  await page.close({ runBeforeUnload: true })
  const dialog = await prompt
  await dialog?.dismiss()
  return dialog?.type() === 'beforeunload'
}

test('asks before closing with unsubmitted edits', async ({ page }) => {
  await open(page)
  await page.getByLabel('Full name').fill('Ada Tan')
  expect(await closeAsks(page)).toBe(true)
})

test('does not ask once the edits are submitted', async ({ page }) => {
  await open(page)
  await page.getByLabel('Full name').fill('Ada Tan')
  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Phone').fill('123')
  await page.getByRole('button', { name: 'Submit', exact: true }).click()
  expect(await closeAsks(page)).toBe(false)
})

test('does not ask after opening Edit without changes', async ({ page }) => {
  await open(page, sample)
  await tab(page, 'Experience').click()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByLabel('Company').first().click()
  expect(await closeAsks(page)).toBe(false)
})
