import { STORAGE_KEY } from '../../src/state/cvState.js'

export { sample } from '../fixtures.js'

// Opens the app with `data` ({ order, committed, review? }) already saved, as
// if the user had built it in an earlier visit. Blank CV when omitted.
export async function open(page, data = null, { theme } = {}) {
  await page.goto('/')
  await page.evaluate(
    ([key, value, theme]) => {
      localStorage.clear()
      if (value) localStorage.setItem(key, JSON.stringify(value))
      if (theme) localStorage.setItem('linework:theme', JSON.stringify(theme))
    },
    [STORAGE_KEY, data, theme],
  )
  await page.reload()
  // The print copy is always mounted; the preview sheet isn't (mobile edit view).
  await page.locator('.cv-flow').waitFor({ state: 'attached' })
}

// The preview sheet (not the hidden print copy).
export const sheet = (page) => page.locator('.cv-sheet')

export const headings = (page) => sheet(page).locator('.cv-heading').allTextContents()

export const tab = (page, label) => page.locator('.tab-select', { hasText: label })

// Month fields are a month select and a year select. '' clears either.
export async function pickMonth(page, label, month, year) {
  await page.getByLabel(`${label}: month`).selectOption(month ? { label: month } : '')
  await page.getByLabel(`${label}: year`).selectOption(year)
}
