// A small JS/JSX, CSS and shell highlighter for the guide's code blocks: no library, no network.
const JS = new RegExp(
  [
    String.raw`(?<comment>\/\/.*$|\{\/\*.*?\*\/\})`,
    String.raw`(?<string>'[^'\n]*'|"[^"\n]*"|` + '`[^`]*`)',
    String.raw`(?<tag><\/?[A-Za-z][\w.]*|(?<!=)\/?>)`,
    String.raw`(?<attr>\b[a-zA-Z-]+(?==))`,
    String.raw`(?<keyword>\b(?:import|from|export|default|function|return|const|let|var|class|extends|this|new|if|else|async|await|try|catch|for|of|in|null|undefined|true|false)\b)`,
    String.raw`(?<fn>\b[a-zA-Z_$][\w$]*(?=\())`,
    String.raw`(?<number>\b\d+(?:\.\d+)?\b)`,
  ].join('|'),
  'gm',
)
const CSS =
  /(?<comment>\/\*.*?\*\/)|(?<string>'[^'\n]*'|"[^"\n]*")|(?<tag>^[^{}:;]+(?=\{))|(?<attr>[\w-]+(?=\s*:))|(?<number>-?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|fr)?)/gm
const SHELL = /(?<comment>#.*$)|(?<keyword>^\s*(?:npm|npx|git|cd|node|code)\b)|(?<string>'[^'\n]*'|"[^"\n]*")/gm
const RULES = { js: JS, jsx: JS, javascript: JS, css: CSS, shell: SHELL, bash: SHELL, sh: SHELL }

function tokens(line, re) {
  if (!re) return [[null, line]]
  const out = []
  let last = 0
  re.lastIndex = 0
  for (const m of line.matchAll(re)) {
    if (m.index > last) out.push([null, line.slice(last, m.index)])
    const kind = Object.entries(m.groups).find(([, v]) => v !== undefined)?.[0]
    out.push([kind, m[0]])
    last = m.index + m[0].length
  }
  if (last < line.length) out.push([null, line.slice(last)])
  return out
}

export function Highlighted({ code, lang = 'jsx', marks = [] }) {
  const re = RULES[lang]
  return code.split('\n').map((line, i) => (
    <span key={i} className={`gd-line${marks.includes(i + 1) ? ' is-marked' : ''}`}>
      {tokens(line, re).map(([kind, text], j) =>
        kind ? (
          <span key={j} className={`tk-${kind}`}>
            {text}
          </span>
        ) : (
          text
        ),
      )}
      {'\n'}
    </span>
  ))
}
