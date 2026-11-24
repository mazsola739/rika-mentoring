import { MAX_TRIES, WORD_LENGTH, evaluate } from './logic.js'

function Row({ letters = '', states, className = '', label, t }) {
  return (
    <div className={`wd-row ${className}`} role="group" aria-label={label}>
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        const letter = letters[i] ?? ''
        const state = states?.[i]
        const cls = state ? ` is-${state}` : letter ? ' is-filled' : ''
        return (
          <div key={i} className={`wd-tile${cls}`} style={{ '--i': i }}>
            {letter}
            {state && <span className="visually-hidden">, {t.states[state]}</span>}
          </div>
        )
      })}
    </div>
  )
}

// The grid is derived from state on every render: finished guesses, the row being typed, empty rows.
export default function Board({ guesses, current, answer, playing, revealRow, won, shake, t }) {
  return (
    <div className="wd-board" role="group" aria-label={t.board}>
      {Array.from({ length: MAX_TRIES }, (_, r) => {
        const label = t.row(r + 1)
        if (r < guesses.length) {
          const winRow = won && r === guesses.length - 1 && revealRow == null
          const cls = `${r === revealRow ? 'is-revealing' : ''}${winRow ? ' is-win' : ''}`
          return <Row key={r} letters={guesses[r]} states={evaluate(guesses[r], answer)} className={cls} label={label} t={t} />
        }
        if (r === guesses.length && playing) {
          // A new key on every invalid guess remounts the row, which replays the shake animation.
          return <Row key={`current-${shake}`} letters={current} className={shake ? 'is-shaking' : ''} label={label} t={t} />
        }
        return <Row key={r} label={label} t={t} />
      })}
    </div>
  )
}
