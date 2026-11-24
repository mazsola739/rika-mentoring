// A deliberately small Markdown reader, in two parts:
//   - parseBlocks (here) cuts the text into blocks: paragraphs, headings, lists, quotes, code blocks and rules;
//   - Markdown.jsx turns every block into React elements.
// It never builds HTML. Whatever a post contains, even <script> or <img onerror=…>, stays text on the screen,
// because React escapes every piece of text it draws.

const FENCE = /^```/
const HEADING = /^(#{1,4})\s+(.+)$/
const RULE = /^(-{3,}|\*{3,})\s*$/
const BULLET = /^\s*[-*+]\s+/
const NUMBERED = /^\s*\d+[.)]\s+/
const QUOTE = /^>\s?/

// Every block is { type, lines }, where type is the name of the element that draws it:
// p, h4, h5, h6, ul, ol, blockquote, pre or hr.
export function parseBlocks(source = '') {
  const blocks = []
  let current = null // the open block: the next line may continue it

  // Adds the line to the open block if it has this type; otherwise opens a new block.
  function add(type, line) {
    if (current?.type !== type) {
      current = { type, lines: [] }
      blocks.push(current)
    }
    current.lines.push(line)
  }

  for (const line of source.replace(/\r\n?/g, '\n').split('\n')) {
    const heading = line.match(HEADING)
    if (current?.type === 'pre') {
      // Inside a code block every line stays as it is, until the closing fence.
      if (FENCE.test(line)) current = null
      else current.lines.push(line)
    } else if (FENCE.test(line)) {
      current = { type: 'pre', lines: [] }
      blocks.push(current)
    } else if (heading) {
      // The post title is an <h3> on this page, so "#" inside a post starts at <h4>.
      blocks.push({ type: `h${Math.min(heading[1].length + 3, 6)}`, lines: [heading[2]] })
      current = null
    } else if (RULE.test(line)) {
      blocks.push({ type: 'hr', lines: [] })
      current = null
    } else if (BULLET.test(line)) {
      add('ul', line.replace(BULLET, ''))
    } else if (NUMBERED.test(line)) {
      add('ol', line.replace(NUMBERED, ''))
    } else if (QUOTE.test(line)) {
      add('blockquote', line.replace(QUOTE, ''))
    } else if (line.trim() === '') {
      current = null // an empty line closes the paragraph, the list or the quote
    } else {
      add('p', line.trim())
    }
  }
  return blocks
}

// Plain-text preview for the cards and the page description: the first ordinary paragraph
// (not a heading, list, quote or code block), without Markdown marks, at most `length` characters.
export function excerpt(source = '', length = 160) {
  const paragraphs = source.replace(/\r\n?/g, '\n').split(/\n\s*\n/)
  const first = paragraphs.find((p) => !/^\s*(#|>|```|[-*+]\s|\d+[.)]\s)/.test(p)) ?? ''
  const text = first
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|\*|`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, '')}…` : text
}

export const readingMinutes = (source = '') => Math.max(1, Math.round(source.split(/\s+/).filter(Boolean).length / 200))
