// Pack blocks into pages by measured height. Returns arrays of block ids.
//
// - Blocks are atomic, so an entry never splits across pages. One taller
//   than a page gets a page of its own and is clipped.
// - A heading only goes on a page if the block after it fits too, so a
//   heading is never the last thing on a page.
export function paginate(blocks, heights, capacity) {
  if (!(capacity > 0) || heights.length !== blocks.length) return [blocks.map((b) => b.id)]

  const pages = []
  let page = []
  let used = 0

  blocks.forEach((block, i) => {
    const height = heights[i]
    const keepWithNext = block.kind === 'heading' && i + 1 < blocks.length ? heights[i + 1] : 0

    if (page.length && used + height + keepWithNext > capacity) {
      pages.push(page)
      page = []
      used = 0
    }
    page.push(block.id)
    used += height
  })

  if (page.length) pages.push(page)
  return pages.length ? pages : [[]]
}
