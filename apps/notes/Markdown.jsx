// A small Markdown reader: # heading, ## subheading, - list, **bold**, *italic* and `code`.
// It never produces HTML, only React elements: whatever is in a note stays text, so no script can sneak in (XSS).

// 1. Split the text into blocks, line by line.
function parseBlocks(text) {
  const blocks = []
  for (const line of text.split('\n')) {
    const last = blocks[blocks.length - 1]
    if (line.startsWith('- ')) {
      // List items that follow each other go into one list.
      if (last && last.type === 'list') last.items.push(line.slice(2))
      else blocks.push({ type: 'list', items: [line.slice(2)] })
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'subheading', text: line.slice(3) })
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', text: line.slice(2) })
    } else if (line.trim() !== '') {
      blocks.push({ type: 'paragraph', text: line })
    }
  }
  return blocks
}

// 2. Inside a line: the capturing brackets make split keep the matches, always at the odd places.
function renderInline(text) {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*|`.+?`)/)
  return parts.map((part, i) => {
    if (i % 2 === 0) return part
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    return <em key={i}>{part.slice(1, -1)}</em>
  })
}

// 3. Blocks become elements. The note's own headings sit below the app's headings, so they start at h3.
export default function Markdown({ text, emptyText }) {
  const blocks = parseBlocks(text)
  if (blocks.length === 0) return <p className="nt-md nt-md--empty">{emptyText}</p>

  return (
    <div className="nt-md">
      {blocks.map((block, i) => {
        if (block.type === 'heading') return <h3 key={i}>{renderInline(block.text)}</h3>
        if (block.type === 'subheading') return <h4 key={i}>{renderInline(block.text)}</h4>
        if (block.type === 'list') {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{renderInline(block.text)}</p>
      })}
    </div>
  )
}
