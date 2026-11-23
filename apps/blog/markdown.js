// A deliberately small Markdown renderer.
//
// Safety rule: escape the whole raw text FIRST. After that, anything a user typed, like
// <script> or <img onerror=…>, is plain text, and the only tags in the output are the
// handful we add ourselves below. Links get one more check: only http(s), mailto and
// in-page/relative URLs are allowed, so "javascript:" links can never appear.

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const SAFE_URL = /^(https?:\/\/|mailto:|#|\/|\.{1,2}\/)/i

// Block patterns (they run on already escaped text, so ">" is "&gt;" here).
const FENCE = /^```/
const HEADING = /^(#{1,4})\s+(.+)$/
const BULLET = /^\s*[-*+]\s+/
const NUMBERED = /^\s*\d+[.)]\s+/
const QUOTE = /^&gt;\s?/
const RULE = /^(-{3,}|\*{3,})\s*$/

const isBlockStart = (line) =>
  FENCE.test(line) || HEADING.test(line) || BULLET.test(line) || NUMBERED.test(line) || QUOTE.test(line) || RULE.test(line)

// Inline formatting: `code`, [links](url), **bold**, *italic* / _italic_.
function inline(text) {
  // Code spans first, parked as placeholders, so nothing inside them is formatted.
  const codes = []
  let out = text.replace(/`([^`]+)`/g, (_, code) => `\u0000${codes.push(code) - 1}\u0000`)

  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    if (!SAFE_URL.test(url)) return label
    const external = /^https?:/i.test(url)
    return `<a href="${url}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`
  })

  out = out
    .replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(?=\S)(.+?)(?<=\S)\*/g, '<em>$1</em>')
    .replace(/(^|[^\w])_(?=\S)(.+?)(?<=\S)_(?!\w)/g, '$1<em>$2</em>')

  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`)
}

function collect(lines, start, pattern) {
  const items = []
  let i = start
  while (i < lines.length && pattern.test(lines[i])) items.push(lines[i++].replace(pattern, ''))
  return [items, i]
}

export function renderMarkdown(source = '') {
  const lines = escapeHtml(source.replace(/\r\n?/g, '\n')).split('\n')
  const html = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
    } else if (FENCE.test(line)) {
      const lang = line.slice(3).trim()
      const code = []
      i++
      while (i < lines.length && !FENCE.test(lines[i])) code.push(lines[i++])
      i++ // skip the closing fence
      const label = /^[\w-]+$/.test(lang) ? ` data-lang="${lang}"` : ''
      html.push(`<pre${label}><code>${code.join('\n')}</code></pre>`)
    } else if (HEADING.test(line)) {
      const [, hashes, content] = line.match(HEADING)
      // The post title is an <h3>, so "#" inside a post starts at <h4>.
      const level = Math.min(hashes.length + 3, 6)
      html.push(`<h${level}>${inline(content)}</h${level}>`)
      i++
    } else if (RULE.test(line)) {
      html.push('<hr>')
      i++
    } else if (BULLET.test(line) || NUMBERED.test(line)) {
      const ordered = NUMBERED.test(line)
      const [items, next] = collect(lines, i, ordered ? NUMBERED : BULLET)
      const tag = ordered ? 'ol' : 'ul'
      html.push(`<${tag}>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</${tag}>`)
      i = next
    } else if (QUOTE.test(line)) {
      const [items, next] = collect(lines, i, QUOTE)
      html.push(`<blockquote><p>${inline(items.join(' '))}</p></blockquote>`)
      i = next
    } else {
      const paragraph = []
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) paragraph.push(lines[i++].trim())
      html.push(`<p>${inline(paragraph.join(' '))}</p>`)
    }
  }

  return html.join('\n')
}

// Plain-text preview for the post list: drop code blocks and Markdown symbols.
export function excerpt(source = '', length = 160) {
  const text = source
    .replace(/```[\s\S]*?(```|$)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/^\s*([-*+]|\d+[.)]|>)\s+/gm, '')
    .replace(/\*\*|\*|`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, '')}…` : text
}

export const readingMinutes = (source = '') => Math.max(1, Math.round(source.split(/\s+/).filter(Boolean).length / 200))
