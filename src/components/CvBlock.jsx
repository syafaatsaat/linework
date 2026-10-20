// Renders one block from buildBlocks(). Markup follows the ATS rules: plain
// headings, real lists, no tables or columns.
export default function CvBlock({ block }) {
  if (block.kind === 'header') {
    return (
      <div className="cv-block cv-block--header" data-blk>
        <header className="cv-header">
          <h1 className="cv-name">{block.name}</h1>
          {block.contact && <p className="cv-contact">{block.contact}</p>}
          {block.links && <p className="cv-contact">{block.links}</p>}
        </header>
      </div>
    )
  }

  if (block.kind === 'heading') {
    return (
      <div className="cv-block cv-block--heading" data-blk>
        <h2 className="cv-heading">{block.label}</h2>
      </div>
    )
  }

  const { primary, meta, secondary, lead, body, bullets } = block
  return (
    <div className="cv-block cv-block--item" data-blk>
      {primary && (
        <div className="cv-item-head">
          <h3 className="cv-item-title">{primary}</h3>
          {meta && <span className="cv-meta">{meta}</span>}
        </div>
      )}
      {lead ? (
        <p className="cv-text">
          <strong>{lead}:</strong> {secondary}
        </p>
      ) : (
        secondary && <p className="cv-text cv-text--muted">{secondary}</p>
      )}
      {body && <p className="cv-text">{body}</p>}
      {bullets.length > 0 && (
        <ul className="cv-bullets">
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
