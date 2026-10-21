import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { blocksToText } from '../cv/blocks.js'
import { extractKeywords, matchKeywords } from '../cv/keywords.js'
import { loadJSON, saveText } from '../lib/storage.js'

const STORAGE_KEY = 'linework:job-ad'

// Paste a job ad, see which of its key terms the CV uses. Reads the same
// text as the parser view (submitted sections only), so it checks what an
// ATS would actually see. The ad is kept in this browser only.
export default function JobMatch({ blocks }) {
  const [ad, setAd] = useState(() => {
    const saved = loadJSON(STORAGE_KEY)
    return typeof saved === 'string' ? saved : ''
  })
  useEffect(() => {
    saveText(STORAGE_KEY, JSON.stringify(ad))
  }, [ad])

  // Long ads stay responsive to type into; the match catches up.
  const deferredAd = useDeferredValue(ad)
  const keywords = useMemo(() => extractKeywords(deferredAd), [deferredAd])
  const cvText = useMemo(() => blocksToText(blocks), [blocks])
  const { found, missing } = useMemo(() => matchKeywords(keywords, cvText), [keywords, cvText])
  const total = keywords.length

  return (
    <section className="job-match no-print" aria-labelledby="job-match-title">
      <h2 id="job-match-title" className="job-match-title">
        Match a job ad
      </h2>
      <p className="job-match-text">
        Paste a job description to see which of its key terms your CV already uses. Only submitted sections are
        checked, and the ad stays in this browser.
      </p>
      <div className="field">
        <label htmlFor="job-ad">Job description</label>
        <textarea
          id="job-ad"
          rows={8}
          value={ad}
          placeholder="Paste the job ad here"
          onChange={(e) => setAd(e.target.value)}
        />
      </div>

      <p className="job-match-score" aria-live="polite">
        {total > 0
          ? `${found.length} of ${total} key terms found`
          : ad.trim()
            ? 'No key terms found in this text yet.'
            : ''}
      </p>
      {total > 0 && (
        <>
          <div className="job-match-meter" aria-hidden="true">
            <span style={{ width: `${(found.length / total) * 100}%` }} />
          </div>
          <TermList title="Missing" terms={missing} mark="✕" kind="missing" empty="Nothing missing." />
          <TermList title="Found" terms={found} mark="✓" kind="found" empty="None yet." />
          <p className="job-match-text">
            Add a missing term only where it’s true for you, in the ad’s own wording: Skills and Work Experience bullets
            are the usual places. Submit the section to update the match.
          </p>
        </>
      )}
    </section>
  )
}

function TermList({ title, terms, mark, kind, empty }) {
  const id = `job-match-${kind}`
  return (
    <div className="job-match-group">
      <h3 id={id} className="mono-meta">
        {title.toUpperCase()} · {terms.length}
      </h3>
      {terms.length ? (
        <ul className="term-list" aria-labelledby={id}>
          {terms.map((term) => (
            <li key={term} className={`term term--${kind}`}>
              <span className="term-mark" aria-hidden="true">
                {mark}
              </span>
              {term}
            </li>
          ))}
        </ul>
      ) : (
        <p className="job-match-text">{empty}</p>
      )}
    </div>
  )
}
