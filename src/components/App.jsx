import { useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { buildBlocks } from '../cv/blocks.js'
import { printPdf } from '../cv/printPdf.js'
import { useCv } from '../state/useCv.js'
import AppHeader from './AppHeader.jsx'
import Editor from './Editor.jsx'
import PreviewStage from './PreviewStage.jsx'

export default function App() {
  const [state, actions, submitted] = useCv()
  const [parser, setParser] = useState(false)

  const blocks = useMemo(() => buildBlocks(submitted), [submitted])

  const exportPdf = () => {
    // Leave parser view before the print dialog opens, so print matches the design.
    flushSync(() => setParser(false))
    printPdf(submitted.committed.general[0]?.name)
  }

  return (
    <div className="app">
      <AppHeader onExportPdf={exportPdf} />
      <div className="workspace">
        <Editor state={state} actions={actions} />
        <PreviewStage blocks={blocks} parser={parser} onToggleParser={() => setParser(!parser)} />
      </div>
    </div>
  )
}
