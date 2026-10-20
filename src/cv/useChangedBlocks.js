import { useEffect, useRef, useState } from 'react'

const HIGHLIGHT_MS = 1800

// Ids of CV blocks that are new or changed since the previous render, kept
// for long enough to play the preview's highlight. Reordering alone changes
// no block, so it highlights nothing (it has its own animation).
export function useChangedBlocks(blocks) {
  const previous = useRef(null)
  const [changed, setChanged] = useState(() => new Set())

  useEffect(() => {
    const now = new Map(blocks.map((block) => [block.id, JSON.stringify(block)]))
    const before = previous.current
    previous.current = now
    if (!before) return // first render: nothing has "changed" yet

    const ids = [...now].filter(([id, json]) => before.get(id) !== json).map(([id]) => id)
    if (ids.length === 0) return
    setChanged(new Set(ids))
    const timer = setTimeout(() => setChanged(new Set()), HIGHLIGHT_MS)
    return () => clearTimeout(timer)
  }, [blocks])

  return changed
}
