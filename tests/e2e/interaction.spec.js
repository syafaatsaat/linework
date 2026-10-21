import { expect, test } from '@playwright/test'
import { open, sample, tab } from './helpers.js'

const style = (locator, prop) => locator.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), prop)
const ACCENT = 'rgb(30, 91, 184)'

test.beforeEach(async ({ page }) => {
  await open(page, sample, { theme: 'light' })
})

test('outline buttons tint and take the accent border on hover', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Import' })
  expect(await style(button, 'border-top-color')).not.toBe(ACCENT)
  await button.hover()
  await expect.poll(() => style(button, 'border-top-color')).toBe(ACCENT)
  expect(await style(button, 'box-shadow')).toMatch(/rgba\(30, 91, 184, 0\.08\) 0px 0px 0px 999px inset/)
  expect(await style(button, 'cursor')).toBe('pointer')
})

test('disabled buttons show no hover and a not-allowed cursor', async ({ page }) => {
  const prev = page.getByRole('button', { name: 'Prev section' })
  await expect(prev).toBeDisabled()
  await prev.hover({ force: true })
  expect(await style(prev, 'cursor')).toBe('not-allowed')
  expect(await style(prev, 'border-top-color')).not.toBe(ACCENT)
})

test('primary buttons sit on an offset shadow and press down into it', async ({ page }) => {
  const group = page.locator('.export-group')
  expect(await style(group, 'box-shadow')).toBe('rgba(30, 91, 184, 0.4) 3px 3px 0px 0px')

  const docx = page.getByRole('button', { name: 'DOCX' })
  const box = await docx.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  // Polled: the transition (instant under reduced motion) lands a frame later.
  await expect.poll(() => style(group, 'transform')).toBe('matrix(1, 0, 0, 1, -1, -1)')
  await page.mouse.down()
  await expect.poll(() => style(group, 'transform')).toBe('matrix(1, 0, 0, 1, 3, 3)')
  await expect.poll(() => style(group, 'box-shadow')).toBe('rgba(30, 91, 184, 0.4) 0px 0px 0px 0px')
  await page.mouse.up()
})

test('direction icons nudge toward where the button goes', async ({ page }) => {
  await page.getByRole('button', { name: 'Next section' }).hover()
  await expect.poll(() => style(page.locator('.editor-nav button:last-child .arrow'), 'transform')).toBe('matrix(1, 0, 0, 1, 2, 0)')
})

test('a successful submit shows a check on Edit; switching sections does not', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByRole('button', { name: 'Submit', exact: true }).click()
  const check = page.locator('.toggle-check')
  await expect(check).toBeVisible()
  // The check is decoration: the button is still just "Edit".
  await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible()
  await expect(check).toBeHidden({ timeout: 3000 })

  await tab(page, 'Skills').click()
  await expect(check).toHaveCount(0)
})

test('DOCX and Back up confirm the download', async ({ page }) => {
  await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'DOCX' }).click()])
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible()
  await expect(page.getByText('DOCX saved to your downloads.')).toBeAttached()
  await expect(page.getByRole('button', { name: 'DOCX' })).toBeVisible({ timeout: 3000 })

  const backup = page.getByRole('button', { name: 'Back up' })
  const width = (await backup.boundingBox()).width
  await Promise.all([page.waitForEvent('download'), backup.click()])
  await expect(page.getByRole('button', { name: '✓ Saved' })).toBeVisible()
  // Both labels share one cell, so the button doesn't change width.
  expect((await page.getByRole('button', { name: '✓ Saved' }).boundingBox()).width).toBe(width)
})
