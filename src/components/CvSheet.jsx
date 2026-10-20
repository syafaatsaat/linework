import CvBlock from './CvBlock.jsx'
import './CvSheet.css'

// The A4 sheet. Shows every block on one sheet for now; pagination arrives in step 4.
export default function CvSheet({ blocks }) {
  return (
    <article className="cv-sheet" aria-label="CV preview">
      {blocks.map((block) => (
        <CvBlock key={block.id} block={block} />
      ))}
    </article>
  )
}
