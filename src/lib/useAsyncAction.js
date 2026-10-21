import { useEffect, useState } from 'react'

const DONE_MS = 1500

// Wraps an async action with flags for the button that runs it: busy while
// it runs, failed if it threw, and done for a moment after it succeeds (to
// show "✓ Saved").
export function useAsyncAction(action) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => setDone(false), DONE_MS)
    return () => clearTimeout(timer)
  }, [done])

  const run = async () => {
    setBusy(true)
    setFailed(false)
    setDone(false)
    try {
      await action()
      setDone(true)
    } catch (error) {
      console.error(error)
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return { run, busy, failed, done }
}
