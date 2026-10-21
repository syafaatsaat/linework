import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { headings, open, sample, sheet, tab } from './helpers.js'

const toast = (page) => page.locator('.undo-toast')

test.beforeEach(async ({ page }) => {
  await open(page, sample)
})

test('removing a section can be undone', async ({ page }) => {
  await tab(page, 'Projects').click()
  await page.getByRole('button', { name: 'Remove section' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Removed Projects.' })).toBeVisible()
  await expect.poll(() => headings(page)).not.toContain('Projects')

  await toast(page).getByRole('button', { name: 'Undo' }).click()
  await expect.poll(() => headings(page)).toContain('Projects')
  await expect(toast(page)).toBeHidden()
  await expect(page.locator('.panel-title')).toHaveText('Projects')
  await expect(page.locator('.panel-title')).toBeFocused()
})

test('removing an entry can be undone, keeping unsaved edits', async ({ page }) => {
  await tab(page, 'Experience').click()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByLabel('Company').nth(1).fill('Globex Corp')
  await page.getByRole('button', { name: 'Remove entry 2' }).click()
  await expect(toast(page)).toContainText('Removed experience 2.')
  await expect(page.getByLabel('Company')).toHaveCount(1)

  await toast(page).getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByLabel('Company').nth(1)).toHaveValue('Globex Corp')
})

test('reset can be undone', async ({ page }) => {
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await page.getByRole('button', { name: 'Reset CV' }).click()
  await expect(sheet(page).locator('.cv-name')).toHaveText('[Your name]')
  await toast(page).getByRole('button', { name: 'Undo' }).click()
  await expect(sheet(page).locator('.cv-name')).toHaveText('Ada Tan')
  // The restored CV is saved again.
  await page.reload()
  await expect(sheet(page).locator('.cv-name')).toHaveText('Ada Tan')
})

test('the next change ends the chance to undo', async ({ page }) => {
  await tab(page, 'Projects').click()
  await page.getByRole('button', { name: 'Remove section' }).click()
  await expect(toast(page)).toBeVisible()
  await tab(page, 'Skills').click()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await expect(toast(page)).toBeHidden()
})

test('dismisses itself, but not while focused', async ({ page }) => {
  await page.clock.install()
  await page.reload()
  await tab(page, 'Projects').click()
  await page.getByRole('button', { name: 'Remove section' }).click()

  await toast(page).getByRole('button', { name: 'Undo' }).focus()
  await page.clock.runFor(10_000)
  await expect(toast(page)).toBeVisible()

  await toast(page).getByRole('button', { name: 'Dismiss' }).click()
  await expect(toast(page)).toBeHidden()

  await tab(page, 'Experience').click()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByRole('button', { name: 'Remove entry 1' }).click()
  await expect(toast(page)).toBeVisible()
  await page.clock.runFor(8_500)
  await expect(toast(page)).toBeHidden()
})

test('has no detectable accessibility violations', async ({ page }) => {
  await tab(page, 'Projects').click()
  await page.getByRole('button', { name: 'Remove section' }).click()
  await expect(toast(page)).toBeVisible()
  const results = await new AxeBuilder({ page }).exclude('.cv-flow-clip').analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
})
