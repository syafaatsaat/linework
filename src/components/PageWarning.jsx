export default function PageWarning({ count }) {
  if (count < 3) return null

  return (
    <p className="page-warn no-print" role="status">
      {count} pages. Most recruiters expect 1–2: trim older roles or bullets.
    </p>
  )
}
