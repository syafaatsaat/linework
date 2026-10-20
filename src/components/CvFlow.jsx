import CvBlock from './CvBlock.jsx'
import './CvSheet.css'

// Every block at full page width, invisible on screen. The paginator measures
// block heights here, and it's the copy that prints, with the browser doing
// the page breaks.
export default function CvFlow({ blocks, flowRef }) {
  return (
    <div className="cv-flow-clip">
      <div ref={flowRef} className="cv cv-flow" aria-hidden="true">
        {blocks.map((block) => (
          <CvBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}
