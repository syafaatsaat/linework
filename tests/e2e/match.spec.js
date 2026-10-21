import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { open, sample, sheet, tab } from './helpers.js'

const AD = 'Senior Frontend Engineer\n\nWork with React, TypeScript and GraphQL. Testing with Jest and Playwright.'

const terms = (page, kind) => page.locator(`.term--${kind}`).allTextContents()

test.beforeEach(async ({ page }) => {
  await open(page, sample)
  await page.getByRole('button', { name: 'Job match' }).click()
})

test('shows which key terms of a pasted ad the CV uses', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Show design' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByLabel('Job description').fill(AD)

  await expect(page.getByText('4 of 7 key terms found')).toBeVisible()
  expect(await terms(page, 'missing')).toEqual(['✕GraphQL', '✕Jest', '✕Testing'])
  expect(await terms(page, 'found')).toEqual(['✓Senior Frontend Engineer', '✓React', '✓TypeScript', '✓Playwright'])
})

test('updates when a section is submitted, and keeps the ad', async ({ page }) => {
  await page.getByLabel('Job description').fill(AD)
  await expect(page.getByText('4 of 7 key terms found')).toBeVisible()

  await tab(page, 'Skills').click()
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.locator('#skills-0-items').fill('React, TypeScript, CSS, GraphQL')
  // Drafts don't count until submitted.
  await expect(page.getByText('4 of 7 key terms found')).toBeVisible()
  await page.getByRole('button', { name: 'Submit', exact: true }).click()
  await expect(page.getByText('5 of 7 key terms found')).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: 'Job match' }).click()
  await expect(page.getByLabel('Job description')).toHaveValue(AD)
})

test('Show design goes back to the sheet', async ({ page }) => {
  await page.getByRole('button', { name: 'Show design' }).click()
  await expect(sheet(page)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Job match' })).toHaveAttribute('aria-pressed', 'false')
})

test('has no detectable accessibility violations', async ({ page }) => {
  await page.getByLabel('Job description').fill(AD)
  const results = await new AxeBuilder({ page }).exclude('.cv-flow-clip').analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
})
