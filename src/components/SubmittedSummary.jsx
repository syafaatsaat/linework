import { joinParts } from '../lib/format.js'

// Collapse a row's view parts into a title line and a detail line.
function summarize(view) {
  if (view.lead) return { title: view.lead, detail: view.secondary || '' }
  if (view.primary) return { title: view.primary, detail: joinParts([view.secondary, view.meta], ' · ') }
  return { title: view.secondary || '—', detail: view.meta || '' }
}

export default function SubmittedSummary({ type, rows }) {
  if (rows.length === 0) return <p className="summary-empty">Nothing added yet.</p>

  return (
    <ul className="summary">
      {rows.map((row, i) => {
        const { title, detail } = summarize(type.view(row))
        return (
          <li key={i}>
            <strong>{title}</strong>
            {detail && <span>{detail}</span>}
          </li>
        )
      })}
    </ul>
  )
}
