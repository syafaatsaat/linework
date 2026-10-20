import CvBlock from './CvBlock.jsx'
import './CvSheet.css'

// Every block at A4 print width, invisible on screen and always mounted.
// usePagination measures block heights here (and the page height from the
// probe), and it's the copy that prints, with the browser doing page breaks.
//
// No aria-hidden here: visibility:hidden already keeps it out of the
// accessibility tree on screen, and Chrome builds the PDF's tag structure
// from that tree, so aria-hidden would print an untagged PDF.
export default function CvFlow({ blocks, flowRef }) {
  return (
    <div ref={flowRef} className="cv-flow-clip">
      <div className="cv cv-page-probe" />
      <div className="cv cv-flow">
        {blocks.map((block) => (
          <CvBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}
