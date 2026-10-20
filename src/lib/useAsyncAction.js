import { useState } from 'react'

// Wraps an async action with busy/failed flags for the button that runs it.
export function useAsyncAction(action) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const run = async () => {
    setBusy(true)
    setFailed(false)
    try {
      await action()
    } catch (error) {
      console.error(error)
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return { run, busy, failed }
}
