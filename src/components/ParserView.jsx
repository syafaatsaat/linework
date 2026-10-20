import { blocksToText } from '../cv/blocks.js'

export default function ParserView({ blocks }) {
  return (
    <pre className="parser-view no-print" aria-label="Plain text an ATS parser would extract">
      {blocksToText(blocks)}
    </pre>
  )
}
