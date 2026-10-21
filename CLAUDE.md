# CV Generator (working name: Linework)

A browser-based CV builder. Users fill in sections, submit each one, see a live A4 preview beside the editor, and export an ATS-friendly PDF or DOCX. Visual theme: technical drafting paper (blueprint grid) with light and dark modes.

Reference mockups live in `/design` (see "Design references" below). They are design specs, not production code.

## Stack (decided)

- Vite + React, in plain JavaScript (`.jsx`/`.js`), not TypeScript
- Plain CSS with custom properties (CSS variables) for theme tokens. No CSS framework.
- `docx` (npm) for DOCX export
- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-to-reorder (works with touch and keyboard, unlike native HTML5 drag)
- PDF export: `window.print()` with a print stylesheet (text-based PDF, ATS-readable). Do NOT use html2canvas/jsPDF (they produce image PDFs that ATS can't read).
- Persistence: `localStorage` (wrapped in try/catch). No backend for v1.

## Core interaction model

Each section has two states: **editing** (form inputs) and **submitted** (read-only summary).

- **Submit** commits the draft to the submitted copy and shows a summary of the values in HTML.
- **Edit** reopens the inputs, pre-filled with the submitted values.
- **Cancel/switching away** discards unsaved changes. Keep two copies of the data: `draft` and `committed`.
- Drafts aren't saved, so reloading or closing the tab with unsubmitted edits shows the browser's "Leave site?" prompt (`hasUnsavedChanges()` in `cvState.js`, `beforeunload` listener in `useCv.js`). Opening Edit without changing anything doesn't count.
- The **CV preview and both exports show committed data only**.

## Sections

| Key | Label on CV | Required | Fields |
|---|---|---|---|
| `general` | (CV header + "Summary") | Always present, pinned first | name*, email*, phone*, country, linkedin, portfolio, summary (max 400 chars) |
| `skills` | Skills | Always present | repeatable: category, items (comma-separated) |
| `exp` | Work Experience | Always present | repeatable: company, position, responsibilities (one per line → bullets), from (month), until (month, blank = "Present") |
| `edu` | Education | Always present | repeatable: school, titleOfStudy, from, to |
| `projects` | Projects | Optional (add/remove) | repeatable: name, link, description |
| `certs` | Certifications | Optional (add/remove) | repeatable: name, issuer, dateEarned |
| `languages` | Languages | Optional (add/remove) | repeatable: language, proficiency (Native / Fluent / Professional / Conversational / Basic) |

`*` = required. General can't be submitted without name, email and phone. Show an inline alert naming the missing fields.

- Optional general fields are labelled "(optional)". When they're blank, leave them off the CV with no empty lines or stray separators.
- Summary: hard cap of 400 characters (`maxLength`), plus a live counter `n / 400` that turns amber at 90% and says "limit reached" at 400.
- **Default section order:** general → skills → exp → edu → projects → (certs, languages appended when added).
- Model each section as a type definition (fields + a `view(row)` function that returns display parts). Adding a new section type means adding one definition.

## Reordering

- Users can reorder every section except `general`, which stays pinned first.
- **Desktop:** drag the section tabs (dnd-kit sortable). Also show "← Earlier / Later →" buttons in each section panel as an accessible fallback.
- **Mobile:** a "Sections" bottom sheet with up/down arrow buttons per row. The same sheet is where users add optional sections (and Import CV / Reset CV), which is why it's named "Sections" rather than "Reorder".
- The preview, PDF, DOCX and parser view all follow this one order.

## CV output rules (ATS: do not break these)

- Single column. No tables, columns, icons, images, text boxes, or headers/footers containing content.
- Standard section headings: "Summary", "Skills", "Work Experience", "Education", "Projects", "Certifications", "Languages".
- Contact line: `email | phone | country`. Links line: `linkedin | portfolio`, shown as visible URLs with `https://` and `www.` removed.
- Skills: `**Category:** item, item, item`. The category is bold; the skills are plain comma-separated text. Not chips or tags.
- Responsibilities: a real `<ul><li>` bullet list, with a leading `-`, `•` or `*` removed from each line.
- Dates: `Mon YYYY – Mon YYYY` / `– Present`, in one format throughout.
- No letter-spaced or all-caps-styled headings on the CV (they extract as "E D U C A T I O N").
- The CV is always black on white, in both site themes. Its template is locked: users can't change fonts, columns or icons on the CV.
- Font: Hanken Grotesk with an Arial fallback. Body 13px, headings 14px bold with a 1px accent rule underneath.

## Preview and pagination

- Show an A4 sheet (210:297) beside the editor on desktop and in a separate Preview view on mobile.
- Paginate by measuring rendered block heights (header, each heading, each entry) in a hidden full-width flow, then pack the blocks into page-height buckets.
  - Never split an entry across pages.
  - Never leave a heading as the last block on a page (move it to the next page).
  - Re-measure on resize, data change and `document.fonts.ready`.
- Below the sheet: `‹ Prev` · `Page X of Y` · `Next ›`, with the end buttons disabled.
- Warn at 3+ pages: "N pages. Most recruiters expect 1–2: trim older roles or bullets."
- Print CSS uses the same rules: `@page { size: A4; margin: 16mm 18mm }`, `break-inside: avoid` on entries and `break-after: avoid` on headings. Hide all app UI when printing.

## Parser view

A toggle next to the preview that swaps the designed sheet for a `<pre>` showing the plain text an ATS would extract, generated from the same data. Use one shared function so the preview, the DOCX and the parser view can't drift apart.

## Job match

A "Job match" toggle beside "Parser view" swaps the sheet for a panel where you paste a job ad and see which of its key terms the CV uses (found / missing, with an `n of N` count). The preview is in one of three modes: `sheet`, `parser` or `match` (`mode` in `App.jsx`, toggles in `PreviewModes.jsx`).

- It reads `blocksToText(blocks)`, the same text as the parser view, so only submitted sections count.
- Extraction and matching are rule-based, in `src/cv/keywords.js`. Terms are words and 2–3 word phrases, with stop words and job-ad filler ("experience", "team", "strong"…) dropped. They're ranked by frequency, plus a boost for names written with capitals or symbols (TypeScript, CI/CD). Matching handles simple word forms (design/designed/designing, API/APIs), hyphens, dots and spacing (front-end = frontend, Node.js = NodeJS). At most 25 terms are shown.
- The pasted ad is saved in localStorage (`linework:job-ad`). It never leaves the browser.

## Export

- **PDF:** `window.print()` (switch off parser view first). Suggested file name: `First_Last_CV.pdf`.
- **DOCX:** built with the `docx` package from the same block list. Use real Word headings and bullet lists, a single column and no tables. File name: `First_Last_CV.docx`.
- **Desktop:** a split button `[Export PDF][DOCX]` in the header. **Mobile:** an "Export" button opens a bottom sheet with two large choices (PDF: "Best for most applications"; DOCX: "For job portals that ask for a Word file").
- Known limitation: on iOS, print-to-PDF takes several taps. If mobile users matter, add a server-side PDF route later (headless Chromium rendering the same view).

## Layout

**Desktop (≥ ~960px):** header (logo `linework/cv`, theme toggle, export) → two columns: editor (`flex: 1 1 440px`) and preview stage (`flex: 999 1 560px`, sheet max-width 620px). Both columns wrap to stacked on narrower screens.

Editor column:
1. Section tabs (wrapping row, each showing `⠿ 01 · status` + label), then "+ Add section".
2. Hint: "Drag tabs to reorder the CV. General stays at the top."
3. Active section panel: `SECTION 0N · EDITING/SUBMITTED`, title, Remove section (optional sections only), Edit/Submit toggle, position buttons, then fields, entries (dashed fieldsets) and "+ Add {noun}".
4. ← Prev / `n / N submitted` / Next →

**Mobile (390px reference):** sticky 56px header (logo, theme icon button, Export) → segmented control `Edit | Preview · Np`.
- **Edit view:** a horizontally scrolling chip row (● editing / ✓ submitted / ! check) plus a "Sections" chip pinned outside the scroller so it's always visible, a single-column form, and a bottom bar with `‹`, a full-width "Submit/Edit {section}" button and `›`.
- **Preview view:** the real A4 page scaled to fit the width (not reflowed), "Parser view" at the top right, and a bottom bar `‹ Page X of Y ›`.
- Inputs use 16px text to prevent iOS zoom. Tap targets are at least 44px.

## Theme tokens

Apply them with `prefers-color-scheme`, add a toggle, and store the choice in localStorage.

| Token | Light | Dark |
|---|---|---|
| bg | `#F4F7FB` | `#0A1424` |
| grid major (80px) | `rgba(30,91,184,.16)` | `rgba(120,165,235,.14)` |
| grid minor (16px) | `rgba(30,91,184,.07)` | `rgba(120,165,235,.05)` |
| ink | `#0B2A5B` | `#DCE7F7` |
| muted | `#3D5A86` | `#9DB2D3` |
| line (input borders, dashed rules) | `#9DB4D6` | `#3A5682` |
| strong (panel borders) | `#0B2A5B` | `#7FA3DB` |
| accent | `#1E5BB8` | `#7FAEF5` |
| on-accent | `#FFFFFF` | `#0A1424` |
| panel / input | `#FFFFFF` | `#0F1C31` / `#0B1628` |
| solid (primary button) / on-solid | `#0B2A5B` / `#FFFFFF` | `#DCE7F7` / `#0A1424` |
| warn | `#9A4A00` | `#F2B544` |
| sheet shadow | `10px 10px 0 rgba(30,91,184,.18)` | `10px 10px 0 rgba(0,0,0,.5)` |

The grid background is four layered `linear-gradient`s (major and minor, horizontal and vertical).

**Type:**
- UI labels, buttons and meta text: Space Mono 400/700, 11–13px.
- UI body and headings: Hanken Grotesk 400–700.
- Borders are 1px with a 4px radius. Chips are fully rounded (radius 22px) on mobile.

**Drafting details:**
- A "210 mm" dimension line with arrowheads above the sheet.
- A dashed accent border for "add" buttons.
- Status labels in monospace.

## Accessibility

- Use real `<button>`, `<label for>` and `<fieldset>/<legend>` elements.
- Give icon-only buttons an `aria-label`. Use `aria-pressed` on the theme toggle, the parser toggle and the active tab.
- Use `aria-live` on the page counter and the character counter, and `role="alert"` on validation errors.
- Keep text contrast at 4.5:1 or higher in both themes. Mobile bottom sheets use `role="dialog" aria-modal="true"`.

## Motion

Rules for every animation:

- Short and purposeful: 150–250 ms for UI, up to ~600 ms for the drafting-line draws. Animation shows what changed; it never slows editing down.
- `prefers-reduced-motion: reduce` makes everything instant (`src/styles/motion.css`, plus `prefersReducedMotion()` in `src/lib/motion.js` for JS-driven motion).
- The CV output never animates: the hidden print copy (`CvFlow`), the PDF and the DOCX are untouched. Preview-only effects go on `.cv-sheet` or get props that only `CvSheet` passes to `CvBlock`.
- No animation library: CSS transitions/keyframes, plus the View Transitions API where it helps. Unsupported browsers just update instantly.
- Focus logic that depends on a View Transition's update waits for it: `withViewTransition()` and `turnPage()` return the transition's `updateCallbackDone` promise, because the browser applies the update a frame later.
- Entry animations use `animation-fill-mode: backwards`, not `both`, so nothing stays applied after they end (a lingering fill kept parts of the sheet on separate compositor layers and changed text rendering).

Built:

| Animation | What it does | Where |
|---|---|---|
| Change highlight | On submit, new or changed blocks on the A4 preview get a fading blue highlight (~1.6 s). If the change is on another page, the preview jumps there. Blocks are compared by content, not id, so reordering sections or entries highlights nothing. | `src/cv/useChangedBlocks.js`, page jump in `App.jsx`, `.cv-block--changed` in `CvSheet.css` |
| Entry swap | Earlier/Later on an entry swaps the two fieldsets in a View Transition. The fieldsets are positional (React keeps them and swaps their contents), so `swapWithTransition()` names the two elements by hand and swaps the names with the content. Focus follows the moved entry. | `swapWithTransition()` in `src/lib/motion.js`, `moveEntry` in `SectionPanel.jsx` |
| Smooth reorder | Every section move (Earlier/Later, mobile ↑/↓, dropping a dragged tab) runs in a View Transition: desktop tabs (`tab-*`), Sections sheet rows (`row-*`) and preview blocks (`cv-*`) glide to their new places in 220 ms. Mobile chips are deliberately unnamed: they sit behind the open sheet and would fly over it. | `withViewTransition()` in `src/lib/motion.js`, wrapped `move` in `App.jsx`, timing in `motion.css` |
| Bottom sheets | Slide up with a backdrop fade. Closing by the user (Done, backdrop, Escape) plays the slide down before unmounting; closing after an action (import, export) is instant. | `BottomSheet.jsx`, `BottomSheet.css` |
| Confirm dialog | Fades and scales in on `showModal()` and out on `close()`, in pure CSS (`@starting-style` + `transition-behavior: allow-discrete`). | `ConfirmDialog.css` |
| Edit ↔ Submit | The incoming form or summary fades up into place; summary rows arrive one after another (45 ms apart, capped at 360 ms). Only plays when the panel toggles; switching tabs stays instant. | `SectionPanel.jsx` (toggle detection), `SectionPanel.css`, `SubmittedSummary.css` |
| Page turns | Prev/Next (desktop and mobile) slides the A4 page: the old page fades out toward the side you're leaving and the new one fades in from the other (~220 ms). During a turn the blocks drop their own transition names (`html[data-page-turn]`) so the page moves as one piece. | `turnPage()` in `src/lib/motion.js`, `goToPage` in `App.jsx`, page-turn rules in `motion.css` |
| Validation feedback | On every blocked submit the alert slides down into view and each invalid field pulses once with a warning ring. A reducer `attempt` counter sets the form's `data-attempt` (odd/even), and alternating between two identical keyframes makes the animation replay; typing doesn't re-trigger it. | `attempt` in `cvState.js`, `ValidationAlert.css`, `Field.css` |
| Theme switch reveal | Switching light/dark spreads the new theme out in a circle from the toggle button (~450 ms, radius to the furthest corner). During the reveal no element keeps its own view-transition-name (`html[data-theme-reveal]`), so the page is revealed as one image. `useTheme` sets `data-theme` inside the transition so the "after" snapshot already has the new theme. | `revealTheme()` in `src/lib/motion.js`, `useTheme.js`, reveal rules in `motion.css` |
| Import "scan" | While Import CV is reading a file, a blueprint scan line with a soft glow sweeps down the A4 preview, repeating until the read finishes. It's an overlay on the sheet frame, not the CV, and is hidden (not frozen) under reduced motion. Fast reads may only show a flash; there's no artificial delay. | `onReadingChange` in `ImportButton.jsx`, `reading` state in `App.jsx`, `.cv-sheet-frame--scanning` in `CvSheet.css` |
| Drafting lines | The "210 mm" dimension line draws in sequence (arrow, rule, label, rule, arrow) when the preview appears. On the preview sheet, each heading rule draws left to right, 80 ms after the one above, whenever a heading appears (load, new section, page turn). The sheet swaps the heading border for an identical 1px line so it can animate; the print copy keeps the real border. | `DimensionLine.css`, `CvSheet.jsx`/`CvBlock.jsx` (`drawDelay`), `CvSheet.css` |

## Testing

- `npm test`: Vitest unit tests in `tests/unit` (format helpers, validation, reducer, block builder, parser text, pagination, DOCX structure and embedded data, import parser).
- `npm run test:e2e`: Playwright tests in `tests/e2e` against the production build (`vite preview`). There are two projects: `desktop` (1280×900) and `mobile` (Pixel 7, `*mobile*` files only). They run with reduced motion so View Transitions don't add timing noise; `entries.spec.js` has one test with motion on.
  - They cover editing flows, the unsaved-edits prompt, job match, reordering (buttons and drag), entry reordering, pagination, the parser view, PDF text extraction (`page.pdf()` + pdfjs), export→import round trips for PDF and DOCX, axe audits, and computed-style checks against the theme tokens and CV rules (`styles.spec.js`).
  - `open(page, data)` in `tests/e2e/helpers.js` seeds localStorage. The shared sample CV is in `tests/fixtures.js`.
- `npm run test:all` runs lint, unit and browser tests. CI (`.github/workflows/ci.yml`) runs lint, unit tests, build and browser tests on every push and PR.

## Design references (`/design`)

The mockups are in a custom canvas format (`.dc.html`: HTML templates with `{{holes}}` and a `class Component extends DCLogic` logic block). They won't run on their own. Use them for exact markup structure, copy, spacing and behaviour:

- `DraftingV2.dc.html`: desktop, light theme. The most complete reference (all features).
- `DraftingV2Dark.dc.html`: the same desktop design opening in dark mode, with all optional sections added.
- `Mobile.dc.html`: mobile edit view, preview view, and the reorder and export sheets (the `start` prop picks the initial screen).

Seed data in the mockups ("Ada Tan") is sample content only.

## Suggested build order

1. Data model, section type definitions, draft/committed state, localStorage
2. Editor: tabs, section panel, field types, validation, summary counter
3. CV block builder + preview sheet + parser view (one shared source)
4. Pagination + print CSS + PDF export
5. DOCX export
6. Reorder (dnd-kit + fallback buttons), add/remove optional sections
7. Theme tokens + dark mode
8. Mobile layout (segmented view, chips, bottom sheets)
9. Accessibility pass. Test real exports in an ATS checker and with `pdftotext`.

## Ideas (not built yet)

Candidates for future work, roughly by value. None of these are started.

**Gaps in existing features**

1. **More optional sections.** Volunteering, Awards and Publications are common and Import CV currently skips them (`HEADINGS.skip` in `parseCv.js`). Each is one new definition in `src/sections/types.js`, plus moving its headings out of `skip`.
2. **US Letter page size.** The CV is A4 only. An A4/Letter choice must reach the preview sheet, pagination probe, `@page` rule and DOCX page size together.

**Help writing a better CV**

3. **Writing hints.** Non-blocking suggestions on bullets: weak openings ("Responsible for…"), no numbers or outcomes, very long bullets, repeated verbs. Never blocks Submit.
4. **Gap detection.** Note long gaps between jobs (from the Experience date ranges) so the user can address them.

**Keeping work safe**

5. **Multiple CVs / versions.** Several saved CVs (e.g. one tailored per application) with duplicate and rename, still in localStorage under separate keys.
6. **Backup and restore.** Everything lives in one browser's storage; clearing site data loses it. Add an explicit backup file and restore. (The DOCX export already embeds the data via `src/cv/embedded.js`, but that isn't obvious to users.)
7. **Undo.** "Removed Certifications. Undo" for removing entries, sections and reset, alongside or instead of confirm dialogs.

**Engineering**

8. **Deploy.** Static site with no backend: host on GitHub Pages via a GitHub Actions workflow.
9. **Offline / installable (PWA).** Fonts are already self-hosted; add a web app manifest and a service worker.

Suggested next: 3 (writing hints).
