// Drafting-style "210 mm" width marker drawn above the sheet.
export default function DimensionLine() {
  return (
    <div className="dimension no-print" aria-hidden="true">
      <span className="dimension-arrow dimension-arrow--left" />
      <span className="dimension-rule" />
      <span className="dimension-label">210 mm</span>
      <span className="dimension-rule" />
      <span className="dimension-arrow dimension-arrow--right" />
    </div>
  )
}
