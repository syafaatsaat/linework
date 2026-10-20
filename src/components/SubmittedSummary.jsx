import { joinParts } from '../lib/format.js'

// Collapse a row's view parts into a title line and a detail line.
function summarize(view) {
  if (view.lead) return { title: view.lead, detail: view.secondary || '' }
  if (view.primary) return { title: view.primary, detail: joinParts([view.secondary, view.meta], ' · ') }
  return { title: view.secondary || '—', detail: view.meta || '' }
}

// `animate` plays the entry animation, rows appearing one after another.
export default function SubmittedSummary({ type, rows, verb = 'Press', animate = false }) {
  if (rows.length === 0) {
    return (
      <p className={animate ? 'summary-empty panel-enter' : 'summary-empty'}>
        Nothing submitted yet. {verb} Edit to add entries.
      </p>
    )
  }

  return (
    <ul className={animate ? 'summary summary--enter' : 'summary'}>
      {rows.map((row, i) => {
        const { title, detail } = summarize(type.view(row))
        return (
          <li key={i} style={animate ? { '--i': i } : undefined}>
            <p className="summary-title">{title}</p>
            {detail && <p className="summary-detail">{detail}</p>}
          </li>
        )
      })}
    </ul>
  )
}
