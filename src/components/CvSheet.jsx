import { useLayoutEffect, useState } from 'react'
import CvBlock from './CvBlock.jsx'
import './CvSheet.css'

// CSS px per mm at the 96 dpi reference.
const PX_PER_MM = 96 / 25.4
const A4_WIDTH = 210 * PX_PER_MM
const A4_HEIGHT = 297 * PX_PER_MM

// One A4 page of the preview. The page is laid out at true A4 size with the
// print margins, then scaled to fit its container, so it wraps exactly like
// the printed PDF.
export default function CvSheet({ blocks, label }) {
  const [frame, setFrame] = useState(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    if (!frame) return
    const fit = () => setScale(frame.clientWidth / A4_WIDTH)
    fit()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fit)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [frame])

  return (
    <div
      ref={setFrame}
      className="cv-sheet-frame no-print"
      style={{ height: `calc(${A4_HEIGHT * scale}px + 2 * var(--border))` }}
    >
      <article className="cv cv-sheet" style={{ transform: `scale(${scale})` }} aria-label={label}>
        {blocks.map((block) => (
          <CvBlock key={block.id} block={block} />
        ))}
      </article>
    </div>
  )
}
