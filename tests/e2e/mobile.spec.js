import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { headings, open, sample, sheet } from './helpers.js'

// Runs in the "mobile" project (Pixel 7 viewport, touch).

const preview = (page) => page.getByRole('button', { name: /^Preview · \d+p$/ })

test('submit from the bottom bar, with validation', async ({ page }) => {
  await open(page)
  await page.getByLabel('Full name').fill('Ada Tan')
  await page.getByRole('button', { name: 'Submit general' }).click()
  await expect(page.getByRole('alert')).toHaveText('Add your email and phone to submit. Optional fields are indicated.')

  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Phone').fill('123')
  await page.getByRole('button', { name: 'Submit general' }).click()
  await expect(page.getByRole('button', { name: 'Edit general' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^General\s*, submitted$/ })).toBeVisible()

  await page.getByRole('button', { name: 'Next section' }).click()
  await expect(page.getByRole('heading', { name: 'Skills', level: 2 })).toBeVisible()
})

test('the Sections sheet reorders and adds sections', async ({ page }) => {
  await open(page, sample)
  await page.getByRole('button', { name: 'Sections: reorder or add' }).click()
  const dialog = page.getByRole('dialog', { name: 'Sections' })
  await expect(dialog).toHaveAttribute('aria-modal', 'true')

  await expect(dialog.getByRole('button', { name: 'Move Skills up' })).toBeDisabled()
  await dialog.getByRole('button', { name: 'Move Projects up' }).click()
  await expect(dialog.getByRole('button', { name: 'Move Projects up' })).toBeFocused()
  await dialog.getByRole('button', { name: '+ Languages' }).click()
  await dialog.getByRole('button', { name: 'Done' }).click()
  await expect(dialog).toBeHidden()

  await expect(page.locator('.m-chips .chip')).toHaveText([
    /General/, /Skills/, /Experience/, /Projects/, /Education/, /Languages/,
  ])
  await preview(page).click()
  await expect.poll(() => headings(page)).toEqual(['Summary', 'Skills', 'Work Experience', 'Projects', 'Education'])
})

test('preview shows the real A4 page scaled to the screen width', async ({ page }) => {
  await open(page, sample)
  await preview(page).click()

  const viewport = page.viewportSize()
  const frame = page.locator('.cv-sheet-frame')
  // The fit to width settles after a ResizeObserver callback.
  await expect.poll(async () => {
    const box = await frame.boundingBox()
    return Math.round((box.height / box.width) * 100) / 100
  }).toBeCloseTo(297 / 210, 1)
  expect((await frame.boundingBox()).width).toBeLessThanOrEqual(viewport.width)
  // Not reflowed: the sheet keeps its A4 layout width and is scaled down.
  expect(await sheet(page).evaluate((el) => el.offsetWidth)).toBeGreaterThan(viewport.width)
  await expect(page.getByText('Page 1 of 1')).toBeVisible()

  await page.getByRole('button', { name: 'Parser view' }).click()
  await expect(page.locator('pre')).toContainText('Work Experience')
})

test('the Export sheet offers PDF and DOCX', async ({ page }) => {
  await open(page, sample)
  await page.getByRole('button', { name: 'Export' }).click()
  const dialog = page.getByRole('dialog', { name: 'Export CV' })
  await expect(dialog).toContainText('Best for most applications')
  await expect(dialog).toContainText('For job portals that ask for a Word file')

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: /Word · DOCX/ }).click(),
  ])
  expect(download.suggestedFilename()).toBe('Ada_Tan_CV.docx')
})

test('inputs are 16px and controls are at least 44px tall', async ({ page }) => {
  await open(page)
  const sizes = await page.locator('input, textarea, select').evaluateAll((els) => els.map((el) => getComputedStyle(el).fontSize))
  expect(new Set(sizes)).toEqual(new Set(['16px']))

  for (const target of ['.m-chips .chip', '.chip--sections', '.m-bar button', '.m-switch button']) {
    for (const box of await page.locator(target).evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))) {
      expect(box, target).toBeGreaterThanOrEqual(44)
    }
  }
})

for (const view of ['edit', 'preview']) {
  test(`${view} view has no detectable accessibility violations`, async ({ page }) => {
    await open(page, sample)
    if (view === 'preview') await preview(page).click()
    const results = await new AxeBuilder({ page }).exclude('.cv-flow-clip').analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
  })
}
