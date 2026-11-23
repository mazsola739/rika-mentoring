// Inline marks in guide text, rendered as React elements (never as HTML):
//   `code`   **bold**   [text](url)   [[term]] or [[shown text|term]] (glossary)   ++Ctrl++ (a key)
const INLINE = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\+\+([^+]+)\+\+/g

// Only site-relative links and plain web links; anything else is shown as text.
const safeHref = (href) => (/^(https?:\/\/|\.{0,2}\/|#)/.test(href) ? href : null)

export function Inline({ text }) {
  const out = []
  let last = 0
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = m.index
    const [, code, bold, linkText, href, termText, termKey, kbd] = m
    if (code !== undefined) out.push(<code key={key}>{code}</code>)
    else if (bold !== undefined) out.push(<strong key={key}>{bold}</strong>)
    else if (linkText !== undefined) {
      const url = safeHref(href)
      const external = url && /^https?:/.test(url)
      out.push(
        url ? (
          <a key={key} href={url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {linkText}
          </a>
        ) : (
          linkText
        ),
      )
    } else if (termText !== undefined) {
      // A concept that the glossary explains; it becomes a link once the glossary exists.
      out.push(
        <dfn key={key} className="gd-term" data-term={(termKey ?? termText).toLowerCase()}>
          {termText}
        </dfn>,
      )
    } else if (kbd !== undefined) out.push(<kbd key={key}>{kbd}</kbd>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
