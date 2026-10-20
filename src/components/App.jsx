import { buildBlocks } from '../cv/blocks.js'
import { useCv } from '../state/useCv.js'
import AppHeader from './AppHeader.jsx'
import Editor from './Editor.jsx'
import PreviewStage from './PreviewStage.jsx'

export default function App() {
  const [state, actions] = useCv()

  const blocks = buildBlocks(state)

  return (
    <div className="app">
      <AppHeader />
      <div className="workspace">
        <Editor state={state} actions={actions} />
        <PreviewStage blocks={blocks} />
      </div>
    </div>
  )
}
