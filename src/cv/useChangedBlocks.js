import { useEffect, useRef, useState } from 'react'

const HIGHLIGHT_MS = 1800

// Ids of CV blocks that are new or changed since the previous render, kept
// for long enough to play the preview's highlight. Blocks are compared by
// content, not id: reordering sections or entries changes no block's
// content, so it highlights nothing (section moves have their own animation).
const content = (block) => JSON.stringify({ ...block, id: undefined })

export function useChangedBlocks(blocks) {
  const previous = useRef(null)
  const [changed, setChanged] = useState(() => new Set())

  useEffect(() => {
    const before = previous.current
    previous.current = new Set(blocks.map(content))
    if (!before) return // first render: nothing has "changed" yet

    const ids = blocks.filter((block) => !before.has(content(block))).map((block) => block.id)
    if (ids.length === 0) return
    setChanged(new Set(ids))
    const timer = setTimeout(() => setChanged(new Set()), HIGHLIGHT_MS)
    return () => clearTimeout(timer)
  }, [blocks])

  return changed
}
