import { memo, useMemo } from 'react'

// One word with its trailing space. memo + plain string props: while you type, only the word
// under the caret gets new props, so the hundreds of other words skip re-rendering.
const Word = memo(function Word({ chars, typed, caret }) {
  return (
    <span className="tt-word">
      {[...chars].map((ch, i) => {
        let state = 'pending'
        if (i < typed.length) state = typed[i] === ch ? 'ok' : 'bad'
        const space = ch === ' '
        return (
          <span
            key={i}
            className={`tt-char is-${state}${space ? ' is-space' : ''}${i === caret ? ' is-current' : ''}`}
          >
            {ch}
          </span>
        )
      })}
    </span>
  )
})

// Splits the text into words once (useMemo), then hands every word only its own slice of the typed text.
export default function Passage({ text, typed, done }) {
  const words = useMemo(() => {
    const list = []
    let start = 0
    for (const chunk of text.match(/\S+\s*/g) ?? []) {
      list.push({ chars: chunk, start })
      start += chunk.length
    }
    return list
  }, [text])

  const caretAt = done ? -1 : typed.length

  return words.map(({ chars, start }) => {
    const end = start + chars.length
    const caret = caretAt >= start && caretAt < end ? caretAt - start : -1
    return <Word key={start} chars={chars} typed={typed.slice(start, end)} caret={caret} />
  })
}
