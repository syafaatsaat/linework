import { useCv } from '../state/useCv.js'
import Editor from './Editor.jsx'

// Header, preview stage and exports arrive in later build steps.
export default function App() {
  const [state, actions] = useCv()

  return (
    <div className="app">
      <div className="workspace">
        <Editor state={state} actions={actions} />
      </div>
    </div>
  )
}
