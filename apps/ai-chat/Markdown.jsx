import { useEffect, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'

// A deliberately small Markdown renderer: headings, paragraphs, lists, quotes, code blocks,
// and inline `code`, **bold** and *italic*. It builds React elements (no innerHTML), so any text
// is always escaped. It also copes with half-written Markdown while a reply is streaming in.

const isBlockStart = (line) => /^(```|#{1,3}\s|\s*[-*]\s+|\s*\d+\.\s+|>\s?)/.test(line)

function parseBlocks(source) {
  const lines = source.split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const fence = line.match(/^```(\w*)\s*$/)
    if (fence) {
      const code = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++])
      blocks.push({ type: 'code', lang: fence[1], text: code.join('\n'), open: i >= lines.length })
      i++
      continue
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] })
      i++
      continue
    }
    const listType = /^\s*[-*]\s+/.test(line) ? 'ul' : /^\s*\d+\.\s+/.test(line) ? 'ol' : null
    if (listType) {
      const marker = listType === 'ul' ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/
      const items = []
      while (i < lines.length && marker.test(lines[i])) items.push(lines[i++].replace(marker, ''))
      blocks.push({ type: listType, items })
      continue
    }
    if (/^>\s?/.test(line)) {
      const quote = []
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''))
      blocks.push({ type: 'quote', text: quote.join(' ') })
      continue
    }
    if (!line.trim()) {
      i++
      continue
    }
    const paragraph = []
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) paragraph.push(lines[i++])
    blocks.push({ type: 'p', text: paragraph.join(' ') })
  }
  return blocks
}

// Inline formatting: split on `code`, **bold** and *italic*, keep everything else as text.
const Inline = ({ text }) => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
  return parts.map((part, i) => {
    if (/^`[^`]+`$/.test(part)) return <code key={i}>{part.slice(1, -1)}</code>
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (/^\*[^*\s][^*]*\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

// A tiny syntax highlighter for JS / JSX: comments, strings, keywords, tags and numbers.
const TOKEN =
  /(\/\/[^\n]*)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|import|from|export|default|if|else|for|while|switch|case|new|await|async|try|catch|throw|break)\b|(<\/?[A-Za-z][\w.]*)|\b(\d+(?:\.\d+)?)\b/g
const KINDS = ['comment', 'string', 'keyword', 'tag', 'number']

function highlight(code) {
  const out = []
  let last = 0
  for (const match of code.matchAll(TOKEN)) {
    if (match.index > last) out.push(code.slice(last, match.index))
    const kind = KINDS[match.slice(1).findIndex((group) => group !== undefined)]
    out.push(
      <span key={match.index} className={`ac-tok ac-tok--${kind}`}>
        {match[0]}
      </span>,
    )
    last = match.index + match[0].length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

const CodeBlock = ({ lang, code }) => {
  const t = useText(TEXT)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      // clipboard blocked: nothing to do
    }
  }

  return (
    <figure className="ac-code">
      <figcaption>
        <span>{lang || 'code'}</span>
        <button type="button" onClick={copy}>
          {copied ? t.copied : t.copy}
        </button>
      </figcaption>
      <pre>
        <code>{highlight(code)}</code>
      </pre>
    </figure>
  )
}

const Markdown = ({ text }) => {
  return parseBlocks(text).map((block, i) => {
    switch (block.type) {
      case 'code':
        return <CodeBlock key={i} lang={block.lang} code={block.text} />
      case 'heading': {
        const Tag = `h${block.level + 2}` // h3–h5 inside a chat bubble
        return (
          <Tag key={i}>
            <Inline text={block.text} />
          </Tag>
        )
      }
      case 'ul':
      case 'ol': {
        const Tag = block.type
        return (
          <Tag key={i}>
            {block.items.map((item, j) => (
              <li key={j}>
                <Inline text={item} />
              </li>
            ))}
          </Tag>
        )
      }
      case 'quote':
        return (
          <blockquote key={i}>
            <Inline text={block.text} />
          </blockquote>
        )
      default:
        return (
          <p key={i}>
            <Inline text={block.text} />
          </p>
        )
    }
  })
}

export default Markdown
