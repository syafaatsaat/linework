import { useState } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Most recent first: a few years ahead (expected graduation) back 60 years.
function yearOptions(selected) {
  const now = new Date().getFullYear()
  const years = []
  for (let y = now + 5; y >= now - 60; y--) years.push(String(y))
  if (selected && !years.includes(selected)) years.push(selected)
  return years
}

// Month + year selects in place of <input type="month">, which Firefox and
// desktop Safari show as a plain text box. The value stays "YYYY-MM", or
// "YYYY" when only the year is known; formatMonth handles both.
export default function MonthField({ id, labelId, label, value, required, invalid, describedBy, onChange }) {
  const [year = '', month = ''] = String(value || '').split('-')
  // A month picked before any year has nowhere to live in the value yet.
  const [pendingMonth, setPendingMonth] = useState('')
  const shownMonth = year ? month : pendingMonth

  const pickMonth = (m) => {
    if (year) onChange(m ? `${year}-${m}` : year)
    else setPendingMonth(m)
  }

  const pickYear = (y) => {
    const m = month || pendingMonth
    if (!y) {
      setPendingMonth(m)
      onChange('')
    } else {
      onChange(m ? `${y}-${m}` : y)
    }
  }

  return (
    <div className="month-field" role="group" aria-labelledby={labelId} aria-describedby={describedBy}>
      <select
        id={id}
        aria-label={`${label}: month`}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        value={shownMonth}
        onChange={(e) => pickMonth(e.target.value)}
      >
        <option value="">Month</option>
        {MONTHS.map((name, i) => (
          <option key={name} value={String(i + 1).padStart(2, '0')}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label={`${label}: year`}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        value={year}
        onChange={(e) => pickYear(e.target.value)}
      >
        <option value="">Year</option>
        {yearOptions(year).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}
