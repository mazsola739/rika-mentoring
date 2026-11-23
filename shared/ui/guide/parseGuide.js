// Parses a lesson guide written in a small Markdown dialect (content/guides/<slug>/<lang>.md).
// See docs/guide-format.md for the format. The result is plain data; GuideView renders it.
//
//   # Title                      the guide's title (optional, the page header shows the lesson title)
//   paragraphs, lists, code      the introduction, until the first level heading
//   :::levels … :::              "- what this level builds | time" lines, one per lesson level
//   ## Level name {level=1}      a level section (1 = beginner, 2 = intermediate, 3 = advanced)
//   ### Step title               a step; steps are numbered across the whole guide, starting at 0
//   ```jsx file=src/App.jsx mark=2,4-6 label="Today"   a code block
//   :::check|mistake|try|concept Title … :::           a callout box
//   :::compare … :::             code blocks side by side
//
// Blocks: { type: 'p', text } | { type: 'list', ordered, items } | { type: 'code', lang, file, label, now, marks, code }
//         | { type: 'callout', kind, title, blocks } | { type: 'compare', blocks } | { type: 'levels', items }

const CALLOUTS = new Set(['check', 'mistake', 'try', 'concept'])

// file=src/App.jsx mark=2,4-6 label="Ma: függvény" now  →  { file, marks: [2,4,5,6], label, now: true }
function parseAttrs(text) {
  const attrs = {}
  for (const m of text.matchAll(/(\w+)(?:=("([^"]*)"|\S+))?/g)) attrs[m[1]] = m[3] ?? m[2] ?? true
  const marks = []
  for (const part of String(attrs.mark ?? '')
    .split(',')
    .filter(Boolean)) {
    const [a, b = a] = part.split('-').map(Number)
    for (let n = a; n <= b; n++) marks.push(n)
  }
  return { file: attrs.file ?? null, label: attrs.label ?? null, now: attrs.now === true, marks }
}

function parseBlocks(lines) {
  const blocks = []
  let para = []
  let list = null
  const flushPara = () => {
    if (para.length) blocks.push({ type: 'p', text: para.join(' ') })
    para = []
  }
  const flushList = () => {
    if (list) blocks.push(list)
    list = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fence = /^```(\w*)\s*(.*)$/.exec(line)
    const container = /^:::(\w+)\s*(.*)$/.exec(line)
    const item = /^\s*(?:([-*])|(\d+)\.)\s+(.*)$/.exec(line)

    if (fence) {
      flushPara()
      flushList()
      const body = []
      for (i++; i < lines.length && !/^```\s*$/.test(lines[i]); i++) body.push(lines[i])
      blocks.push({ type: 'code', lang: fence[1] || 'text', ...parseAttrs(fence[2]), code: body.join('\n') })
    } else if (container) {
      flushPara()
      flushList()
      // Collect until the matching ::: (code fences inside may contain anything).
      const body = []
      let inFence = false
      for (i++; i < lines.length; i++) {
        if (/^```/.test(lines[i])) inFence = !inFence
        if (!inFence && /^:::\s*$/.test(lines[i])) break
        body.push(lines[i])
      }
      const [, name, rest] = container
      if (name === 'levels') {
        const items = body
          .map((l) => /^\s*[-*]\s+(.*)$/.exec(l)?.[1])
          .filter(Boolean)
          .map((l) => {
            const [text, time = ''] = l.split('|').map((s) => s.trim())
            return { text, time }
          })
        blocks.push({ type: 'levels', items })
      } else if (name === 'compare') {
        blocks.push({ type: 'compare', blocks: parseBlocks(body).filter((b) => b.type === 'code') })
      } else if (CALLOUTS.has(name)) {
        blocks.push({ type: 'callout', kind: name, title: rest.trim(), blocks: parseBlocks(body) })
      } else {
        throw new Error(`Unknown guide container ":::${name}"`)
      }
    } else if (item) {
      flushPara()
      const ordered = Boolean(item[2])
      if (!list || list.ordered !== ordered) {
        flushList()
        list = { type: 'list', ordered, items: [] }
      }
      list.items.push(item[3])
    } else if (/^\s*$/.test(line)) {
      flushPara()
      flushList()
    } else if (list && /^\s{2,}\S/.test(line)) {
      // A wrapped list item continues on an indented line.
      list.items[list.items.length - 1] += ' ' + line.trim()
    } else {
      flushList()
      para.push(line.trim())
    }
  }
  flushPara()
  flushList()
  return blocks
}

export function parseGuide(source) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const guide = { title: null, intro: [], sections: [] }
  let section = null
  let step = null
  let buffer = []
  let stepNumber = 0

  const flush = () => {
    const blocks = parseBlocks(buffer)
    buffer = []
    if (step) step.blocks = blocks
    else if (section) section.blocks = blocks
    else guide.intro.push(...blocks)
  }

  let inFence = false
  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence
    const heading = inFence ? null : /^(#{1,3})\s+(.*?)\s*(?:\{([^}]*)\})?\s*$/.exec(line)
    if (!heading) {
      buffer.push(line)
      continue
    }
    flush()
    const [, hashes, text, attrText = ''] = heading
    if (hashes === '#') {
      guide.title = text
      step = null
    } else if (hashes === '##') {
      const level = Number(/level=(\d)/.exec(attrText)?.[1] ?? guide.sections.length + 1)
      section = { title: text, level, blocks: [], steps: [] }
      guide.sections.push(section)
      step = null
    } else {
      if (!section) throw new Error(`Step "${text}" comes before the first level heading (## …)`)
      step = { id: `s${stepNumber}`, n: stepNumber, title: text, blocks: [] }
      stepNumber++
      section.steps.push(step)
    }
  }
  flush()
  guide.steps = guide.sections.flatMap((s) => s.steps)
  return guide
}
