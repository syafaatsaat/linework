import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { open, sample, sheet, tab } from './helpers.js'

const titles = (page) => sheet(page).locator('.cv-item-title').allTextContents()
const companies = (page) => page.getByLabel('Company').evaluateAll((els) => els.map((el) => el.value))

test.beforeEach(async ({ page }) => {
  await open(page, sample)
  await tab(page, 'Experience').click()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
})

test('Earlier/Later move an entry; the CV follows on submit', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Move entry 1 earlier' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Move entry 2 later' })).toBeDisabled()

  await page.getByRole('button', { name: 'Move entry 2 earlier' }).click()
  await expect.poll(() => companies(page)).toEqual(['Globex', 'Acme Pte Ltd'])
  // Focus follows the moved entry; at the top, Earlier is disabled so it lands on Later.
  await expect(page.getByRole('button', { name: 'Move entry 1 later' })).toBeFocused()
  await expect(page.getByText('Experience moved to entry 1 of 2.')).toBeAttached()
  // The preview shows committed data only until Submit.
  expect((await titles(page)).slice(0, 2)).toEqual(['Senior Frontend Engineer', 'Frontend Developer'])

  await page.getByRole('button', { name: 'Submit', exact: true }).click()
  await expect.poll(async () => (await titles(page)).slice(0, 2)).toEqual(['Frontend Developer', 'Senior Frontend Engineer'])
  // Reordering alone highlights nothing.
  await expect(sheet(page).locator('.cv-block--changed')).toHaveCount(0)

  await page.reload()
  expect((await titles(page)).slice(0, 2)).toEqual(['Frontend Developer', 'Senior Frontend Engineer'])
})

test('Cancel discards an entry move', async ({ page }) => {
  await page.getByRole('button', { name: 'Move entry 1 later' }).click()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  expect(await companies(page)).toEqual(['Acme Pte Ltd', 'Globex'])
})

test('unsaved edits move with their entry', async ({ page }) => {
  await page.getByLabel('Company').nth(1).fill('Globex Corp')
  await page.getByRole('button', { name: 'Move entry 2 earlier' }).click()
  await expect.poll(() => companies(page)).toEqual(['Globex Corp', 'Acme Pte Ltd'])
})

test('a single entry has no move buttons', async ({ page }) => {
  await tab(page, 'Education').click()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await expect(page.locator('[data-move]')).toHaveCount(0)
})

test('the editing view has no detectable accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).exclude('.cv-flow-clip').analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
})

test.describe('with motion', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('the swap animates and leaves no transition names behind', async ({ page }) => {
    await page.getByRole('button', { name: 'Move entry 1 later' }).click()
    await expect.poll(() => companies(page)).toEqual(['Globex', 'Acme Pte Ltd'])
    await expect(page.getByRole('button', { name: 'Move entry 2 earlier' })).toBeFocused()
    await expect
      .poll(() => page.locator('.entry').evaluateAll((els) => els.map((el) => el.style.viewTransitionName)))
      .toEqual(['', ''])
  })
})
