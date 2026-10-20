import { formatMonth } from '../lib/format.js'

const joinWithAnd = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])

// Explains what blocked Submit (see validateRows), naming fields by their labels.
export default function ValidationAlert({ id, type, rows, errors }) {
  if (errors.length === 0) return null

  const label = (key) => type.fields.find((f) => f.key === key).label
  const messages = []

  // Required fields: one sentence for General, one per entry elsewhere.
  const required = errors.filter((e) => e.kind === 'required')
  if (required.length && !type.multi) {
    const labels = required.map((e) => label(e.fields[0]).toLowerCase())
    messages.push(`Add your ${joinWithAnd(labels)} to submit. Optional fields are indicated.`)
  } else {
    for (const index of new Set(required.map((e) => e.index))) {
      const labels = required.filter((e) => e.index === index).map((e) => label(e.fields[0]))
      messages.push(`Entry ${index + 1}: ${joinWithAnd(labels)} ${labels.length > 1 ? 'are' : 'is'} required.`)
    }
  }

  for (const { index, fields, kind, today } of errors.filter((e) => e.kind !== 'required')) {
    const [from, to] = fields
    const row = rows[index]
    const entry = type.multi ? `Entry ${index + 1}: ` : ''
    if (kind === 'range') {
      messages.push(
        `${entry}${label(to)} (${formatMonth(row[to])}) is before ${label(from)} (${formatMonth(row[from])}). ` +
          `Pick a later ${label(to)} date, or leave it blank if it's ongoing.`,
      )
    } else if (kind === 'future') {
      messages.push(
        `${entry}${label(from)} (${formatMonth(row[from])}) is after this month, so it can't be ongoing. ` +
          `Use a ${label(from)} date up to ${formatMonth(today)}, or fill in ${label(to)}.`,
      )
    }
  }

  return (
    <div id={id} role="alert" className="alert">
      {messages.length === 1 ? (
        <p>{messages[0]}</p>
      ) : (
        <ul>
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
