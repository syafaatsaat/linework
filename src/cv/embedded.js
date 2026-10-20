// The CV's own data, stored inside exported DOCX files as custom document
// properties, so importing a Linework export restores it exactly instead of
// re-parsing the text. Word limits a property value to 255 characters, so the
// JSON is split across numbered properties.

const PREFIX = 'linework.v1.'
const CHUNK = 240

export function toCustomProperties({ order, committed }) {
  const json = JSON.stringify({ order, committed })
  const chunks = []
  for (let i = 0; i < json.length; i += CHUNK) chunks.push(json.slice(i, i + CHUNK))
  return [
    { name: `${PREFIX}count`, value: String(chunks.length) },
    ...chunks.map((value, i) => ({ name: `${PREFIX}${i}`, value })),
  ]
}

// `properties` maps property name → string value. Returns null when the file
// wasn't exported by Linework or the data is incomplete.
export function fromCustomProperties(properties) {
  const count = Number(properties[`${PREFIX}count`])
  if (!(count > 0)) return null
  let json = ''
  for (let i = 0; i < count; i++) {
    const chunk = properties[`${PREFIX}${i}`]
    if (typeof chunk !== 'string') return null
    json += chunk
  }
  try {
    const data = JSON.parse(json)
    return data && Array.isArray(data.order) && data.committed ? data : null
  } catch {
    return null
  }
}
