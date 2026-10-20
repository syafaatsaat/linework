import { useState } from 'react'
import CvSheet from './CvSheet.jsx'
import DimensionLine from './DimensionLine.jsx'
import ParserView from './ParserView.jsx'

export default function PreviewStage({ blocks }) {
  const [parser, setParser] = useState(false)

  return (
    <main className="stage">
      <div className="stage-bar">
        <span className="mono-meta">ATS-ready · single column · text-based</span>
        <button type="button" className="btn-accent-outline" aria-pressed={parser} onClick={() => setParser(!parser)}>
          {parser ? 'Show design' : 'Parser view'}
        </button>
      </div>
      <DimensionLine />
      <div className="stage-holder">{parser ? <ParserView blocks={blocks} /> : <CvSheet blocks={blocks} />}</div>
      <p className="mono-meta">Preview shows submitted sections only · prints on white in both themes</p>
    </main>
  )
}
