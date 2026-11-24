import { parseBlocks } from './markdown.js'

// Links may point only to web pages, e-mail addresses and pages of this blog (#/…).
// Anything else, for example javascript:alert(1), stays a plain label.
const SAFE_LINK = /^(https?:\/\/|mailto:|#)/

// The marks inside one line: `code`, [links](address), **bold**, *italic* and _italic_.
// Thanks to the round brackets, split keeps the marked parts too, at the odd places (1, 3, 5…).
const INLINE = /(`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|(?<!\w)_[^_\s][^_]*_(?!\w))/

function renderInline(text) {
  return text.split(INLINE).map((part, i) => {
    if (i % 2 === 0) return part // the even places hold plain text
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') || part.startsWith('_')) return <em key={i}>{part.slice(1, -1)}</em>
    // What is left is a link: [label](address).
    const label = part.slice(1, part.indexOf(']'))
    const href = part.slice(part.indexOf('](') + 2, -1)
    if (!SAFE_LINK.test(href)) return label
    const external = /^https?:/.test(href)
    return (
      <a key={i} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {label}
      </a>
    )
  })
}

// Every block becomes one element. No HTML strings anywhere: React draws the text as text.
export default function Markdown({ source, className = '' }) {
  const blocks = parseBlocks(source)

  return (
    <div className={`bl-md ${className}`}>
      {blocks.map((block, i) => {
        // A variable with a capital letter can stand for an element name: <Tag> draws a p, an h4, a ul…
        const Tag = block.type
        if (Tag === 'hr') return <hr key={i} />
        if (Tag === 'pre') {
          return (
            <pre key={i}>
              <code>{block.lines.join('\n')}</code>
            </pre>
          )
        }
        if (Tag === 'ul' || Tag === 'ol') {
          return (
            <Tag key={i}>
              {block.lines.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </Tag>
          )
        }
        if (Tag === 'blockquote') {
          return (
            <blockquote key={i}>
              <p>{renderInline(block.lines.join(' '))}</p>
            </blockquote>
          )
        }
        // p, h4, h5 and h6: the lines of the block joined into one.
        return <Tag key={i}>{renderInline(block.lines.join(' '))}</Tag>
      })}
    </div>
  )
}
