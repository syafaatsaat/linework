// Renders one block from buildBlocks(). Markup follows the ATS rules: plain
// headings, real lists, no tables or columns.
//
// The preview sheet also passes `changed` (play the "just edited" highlight),
// `transitionName` (its view-transition-name, so reordering animates) and
// `drawDelay` (when a heading's rule starts drawing). The hidden print copy
// passes none of them.
export default function CvBlock({ block, changed = false, transitionName, drawDelay }) {
  const style = {}
  if (transitionName) style.viewTransitionName = transitionName
  if (drawDelay !== undefined) style['--draw-delay'] = `${drawDelay}ms`
  const wrapper = (kind) => ({
    className: `cv-block cv-block--${kind}${changed ? ' cv-block--changed' : ''}`,
    style: Object.keys(style).length ? style : undefined,
    'data-blk': true,
  })

  if (block.kind === 'header') {
    return (
      <div {...wrapper('header')}>
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
      <div {...wrapper('heading')}>
        <h2 className="cv-heading">{block.label}</h2>
      </div>
    )
  }

  const { primary, meta, secondary, lead, body, bullets } = block
  return (
    <div {...wrapper('item')}>
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
