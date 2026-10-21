import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { open, sample, sheet } from './helpers.js'

// Computed-style checks against the design tokens and CV rules in CLAUDE.md.
// They catch a stylesheet that silently stops applying (an emptied file, a
// broken import, a renamed class), which unit tests and click-throughs miss.

const TOKENS = {
  light: { bg: 'rgb(244, 247, 251)', ink: 'rgb(11, 42, 91)', panel: 'rgb(255, 255, 255)', strong: 'rgb(11, 42, 91)', accent: 'rgb(30, 91, 184)' },
  dark: { bg: 'rgb(10, 20, 36)', ink: 'rgb(220, 231, 247)', panel: 'rgb(15, 28, 49)', strong: 'rgb(127, 163, 219)', accent: 'rgb(127, 174, 245)' },
}

const style = (locator, props) =>
  locator.evaluate((el, props) => {
    const cs = getComputedStyle(el)
    return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]))
  }, props)

for (const theme of ['light', 'dark']) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await open(page, sample, { theme })
    })

    test('app chrome uses the theme tokens', async ({ page }) => {
      const t = TOKENS[theme]
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)

      const body = await style(page.locator('body'), ['background-color', 'color', 'background-image'])
      expect(body['background-color']).toBe(t.bg)
      expect(body.color).toBe(t.ink)
      // Blueprint grid: four layered gradients.
      expect(body['background-image'].match(/linear-gradient/g)).toHaveLength(4)

      const panel = await style(page.locator('.panel'), ['background-color', 'border-top-width', 'border-top-style', 'border-top-color', 'border-top-left-radius'])
      expect(panel).toEqual({
        'background-color': t.panel,
        'border-top-width': '1px',
        'border-top-style': 'solid',
        'border-top-color': t.strong,
        'border-top-left-radius': '4px',
      })

      const meta = await style(page.locator('.panel .mono-meta').first(), ['font-family'])
      expect(meta['font-family']).toMatch(/Space Mono/)

      const add = await style(page.locator('.tab-add, .btn-add').first(), ['border-top-style'])
      expect(add['border-top-style']).toBe('dashed')
    })

    test('the CV sheet stays black on white with the locked template', async ({ page }) => {
      const cv = await style(sheet(page), ['background-color', 'font-family', 'font-size'])
      expect(cv['background-color']).toBe('rgb(255, 255, 255)')
      expect(cv['font-family']).toMatch(/^"?Hanken Grotesk"?, Arial/)
      expect(cv['font-size']).toBe('13px')

      const heading = await style(sheet(page).locator('.cv-heading').first(), [
        'font-size', 'font-weight', 'letter-spacing', 'text-transform',
      ])
      expect(heading).toEqual({ 'font-size': '14px', 'font-weight': '700', 'letter-spacing': 'normal', 'text-transform': 'none' })

      const text = await style(sheet(page).locator('.cv-text').first(), ['color'])
      // Near-black text, whatever the site theme.
      const [r, g, b] = text.color.match(/\d+/g).map(Number)
      expect(Math.max(r, g, b)).toBeLessThan(80)
    })

    test('has no detectable accessibility violations', async ({ page }) => {
      // The hidden print copy isn't on screen.
      const results = await new AxeBuilder({ page }).exclude('.cv-flow-clip').analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
    })
  })
}

test('the print copy keeps the real heading rule', async ({ page }) => {
  await open(page, sample)
  await page.emulateMedia({ media: 'print' })
  const heading = await style(page.locator('.cv-flow .cv-heading').first(), ['border-bottom-width', 'border-bottom-style'])
  expect(heading).toEqual({ 'border-bottom-width': '1px', 'border-bottom-style': 'solid' })
  const headingBlock = await style(page.locator('.cv-flow .cv-block--heading').first(), ['break-after'])
  expect(headingBlock['break-after']).toBe('avoid')
  const entry = await style(page.locator('.cv-flow .cv-block--item').first(), ['break-inside'])
  expect(entry['break-inside']).toBe('avoid')
  await expect(page.locator('header').first()).toBeHidden()
})

test('the theme toggle switches and remembers the choice', async ({ page }) => {
  await open(page, sample, { theme: 'light' })
  const toggle = page.getByRole('button', { name: 'Dark mode' })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true')
})
