import { expect, test } from '@playwright/test'
import { headings, open, pickMonth, sample, sheet, tab } from './helpers.js'

test.describe('editing', () => {
  test.beforeEach(async ({ page }) => {
    await open(page)
  })

  test('General needs name, email and phone before it submits', async ({ page }) => {
    await page.getByLabel('Full name').fill('Ada Tan')
    await page.getByRole('button', { name: 'Submit', exact: true }).click()

    await expect(page.getByRole('alert')).toHaveText('Add your email and phone to submit. Optional fields are indicated.')
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByLabel('Email')).toBeFocused()
    await expect(sheet(page).locator('.cv-name')).toHaveText('[Your name]')
  })

  test('submit shows a summary and updates the preview; edit and cancel discard changes', async ({ page }) => {
    await page.getByLabel('Full name').fill('Ada Tan')
    await page.getByLabel('Email').fill('ada@example.com')
    await page.getByLabel('Phone').fill('+65 8123 4567')
    await page.getByLabel('Portfolio website (optional)').fill('https://www.adatan.dev/')
    await page.getByRole('button', { name: 'Submit', exact: true }).click()

    await expect(page.getByText('SECTION 01 · SUBMITTED')).toBeVisible()
    await expect(sheet(page).locator('.cv-name')).toHaveText('Ada Tan')
    // Blank optional fields leave no stray separators; links print bare.
    await expect(sheet(page).locator('.cv-contact')).toHaveText(['ada@example.com | +65 8123 4567', 'adatan.dev'])

    await page.getByRole('button', { name: 'Edit', exact: true }).click()
    await page.getByLabel('Full name').fill('Someone Else')
    // The preview shows committed data only.
    await expect(sheet(page).locator('.cv-name')).toHaveText('Ada Tan')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await page.getByRole('button', { name: 'Edit', exact: true }).click()
    await expect(page.getByLabel('Full name')).toHaveValue('Ada Tan')
  })

  test('summary counter warns near the limit and stops at 400', async ({ page }) => {
    const summary = page.getByLabel('Summary (optional)')
    const counter = page.locator('#general-0-summary-count')

    await summary.fill('x'.repeat(359))
    await expect(counter).toHaveText('359 / 400')
    await expect(counter).not.toHaveClass(/counter--warn/)

    await summary.fill('x'.repeat(360))
    await expect(counter).toHaveClass(/counter--warn/)

    await summary.fill('x'.repeat(450))
    await expect(summary).toHaveValue('x'.repeat(400))
    await expect(counter).toHaveText('400 / 400 · limit reached')
  })

  test('submitted data survives a reload; drafts do not', async ({ page }) => {
    await page.getByLabel('Full name').fill('Ada Tan')
    await page.getByLabel('Email').fill('ada@example.com')
    await page.getByLabel('Phone').fill('123')
    await page.getByRole('button', { name: 'Submit', exact: true }).click()
    await tab(page, 'Skills').click()
    await page.getByLabel('Group', { exact: true }).fill('Unsaved draft')

    await page.reload()
    await expect(sheet(page).locator('.cv-name')).toHaveText('Ada Tan')
    await tab(page, 'Skills').click()
    await expect(page.getByLabel('Group', { exact: true })).toHaveValue('')
  })

  test('experience bullets, dates and range validation', async ({ page }) => {
    await tab(page, 'Experience').click()
    await page.getByLabel('Company').fill('Acme')
    await page.getByLabel('Position title').fill('Engineer')
    await page.getByLabel('Main responsibilities').fill('- Shipped things\n• Fixed things')
    await pickMonth(page, 'From', 'Mar', '2022')
    await pickMonth(page, 'Until', 'Jan', '2021')
    await page.getByRole('button', { name: 'Submit', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('Until (Jan 2021) is before From (Mar 2022)')

    await pickMonth(page, 'Until', '', '')
    await page.getByRole('button', { name: 'Submit', exact: true }).click()

    const job = sheet(page).locator('.cv-block', { hasText: 'Engineer' })
    await expect(job.locator('.cv-meta')).toHaveText('Mar 2022 – Present')
    await expect(job.locator('li')).toHaveText(['Shipped things', 'Fixed things'])
  })
})

test.describe('sections and preview', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, sample)
  })

  test('Earlier/Later reorders the tabs and the CV; General stays first', async ({ page }) => {
    await tab(page, 'Projects').click()
    await page.getByRole('button', { name: 'Move section earlier on the CV' }).click()
    await expect.poll(() => headings(page)).toEqual(['Summary', 'Skills', 'Work Experience', 'Projects', 'Education'])
    await expect(page.locator('.tab-label')).toHaveText(['General', 'Skills', 'Experience', 'Projects', 'Education'])

    await tab(page, 'Skills').click()
    await expect(page.getByRole('button', { name: 'Move section earlier on the CV' })).toBeDisabled()
    await page.getByRole('button', { name: 'Move section later on the CV' }).click()
    await expect.poll(() => headings(page)).toEqual(['Summary', 'Work Experience', 'Skills', 'Projects', 'Education'])
  })

  test('dragging a tab reorders the CV', async ({ page }) => {
    const handle = page.getByRole('button', { name: 'Reorder Education' })
    const target = page.locator('.tab', { hasText: 'Skills' })
    const from = await handle.boundingBox()
    const to = await target.boundingBox()
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    // dnd-kit needs a few moves past its activation distance.
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(from.x + ((to.x - from.x) * i) / 10, to.y + to.height / 2)
    }
    await page.mouse.up()
    await expect.poll(() => headings(page)).toEqual(['Summary', 'Education', 'Skills', 'Work Experience', 'Projects'])
  })

  test('optional sections can be added and removed', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add section' }).click()
    await page.getByRole('button', { name: 'Certifications' }).click()
    await expect(page.getByRole('heading', { name: 'Certifications', level: 2 })).toBeVisible()
    await page.getByLabel('Certification', { exact: true }).fill('AWS Developer')
    await page.getByLabel('Issuer').fill('Amazon')
    await pickMonth(page, 'Date earned', '', '2023')
    await page.getByRole('button', { name: 'Submit', exact: true }).click()
    await expect.poll(() => headings(page)).toContain('Certifications')

    await page.getByRole('button', { name: 'Remove section' }).click()
    await expect.poll(() => headings(page)).not.toContain('Certifications')
  })

  test('parser view shows the plain text an ATS would read', async ({ page }) => {
    await page.getByRole('button', { name: 'Parser view' }).click()
    const text = await page.locator('pre').textContent()
    expect(text).toMatch(/^Ada Tan\nada@example.com \| \+65 8123 4567 \| Singapore\n/)
    expect(text).toContain('Work Experience\nSenior Frontend Engineer | Mar 2021 – Present\nAcme Pte Ltd\n• Led the design system rebuild')
    await page.getByRole('button', { name: 'Show design' }).click()
    await expect(sheet(page)).toBeVisible()
  })

  test('long CVs paginate and warn at 3+ pages', async ({ page }) => {
    const job = sample.committed.exp[0]
    const many = Array.from({ length: 14 }, (_, i) => ({
      ...job,
      company: `Company ${i + 1}`,
      responsibilities: Array.from({ length: 5 }, (_, j) => `Responsibility ${j + 1} described in enough words to wrap`).join('\n'),
    }))
    await open(page, { ...sample, committed: { ...sample.committed, exp: many } })

    const counter = page.locator('.page-count')
    await expect(counter).toHaveText(/Page 1 of [3-9]/)
    const total = Number((await counter.textContent()).match(/of (\d+)/)[1])
    await expect(page.locator('.page-warn')).toHaveText(`${total} pages. Most recruiters expect 1–2: trim older roles or bullets.`)
    await expect(page.getByRole('button', { name: 'Prev', exact: true })).toBeDisabled()

    // Each block appears on exactly one page, and no page ends on a heading.
    const seen = []
    for (let p = 1; p <= total; p++) {
      await expect(counter).toHaveText(`Page ${p} of ${total}`)
      await expect(sheet(page).locator(':scope > .cv-block').last()).not.toHaveClass(/cv-block--heading/)
      seen.push(...(await sheet(page).locator('.cv-item-title, .cv-name').allTextContents()))
      if (p < total) await page.getByRole('button', { name: 'Next', exact: true }).click()
    }
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled()
    expect(seen.filter((t) => t === 'Senior Frontend Engineer')).toHaveLength(14)
  })

  test('reset clears the CV after confirming', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset', exact: true }).click()
    await page.getByRole('button', { name: 'Reset CV' }).click()
    await expect(sheet(page).locator('.cv-name')).toHaveText('[Your name]')
  })
})
