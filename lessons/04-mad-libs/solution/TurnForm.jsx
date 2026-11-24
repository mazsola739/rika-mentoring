import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { HINTS, wordFor } from './templates.js'

// Two players take turns: only one field shows at a time, so nobody sees what the other one wrote.
// The words themselves live in MadLib; this form only knows which field we are at.
function TurnForm({ fields, words, onUpdate, onDone }) {
  const lang = useLang()
  const t = useText(TEXT)
  const [turn, setTurn] = useState(0)

  const field = fields[turn]
  const word = wordFor(words, field)
  const player = (turn % 2) + 1 // fields 0, 2, 4… are player 1's, 1, 3, 5… player 2's
  const isLast = turn === fields.length - 1

  function next(event) {
    event.preventDefault()
    if (word.trim() === '') return
    if (isLast) onDone()
    else setTurn(turn + 1)
  }

  return (
    <form className={`ml__turn ml__player-${player}`} onSubmit={next}>
      <p className="ml__turn-player" aria-live="polite">
        {t.turn(player)}
      </p>
      <p className="ml__hint">{t.noPeek(turn + 1, fields.length)}</p>
      <label className="field">
        <span className="ml__label">{field}</span>
        {/* key={field}: a new input on every turn, so autoFocus puts the cursor in it again. */}
        <input
          key={field}
          className="input"
          name={field}
          value={word}
          placeholder={HINTS[lang][field]}
          onChange={onUpdate}
          autoFocus
        />
      </label>
      <div className="ml__actions">
        <button type="submit" className="btn" disabled={word.trim() === ''}>
          {isLast ? t.tell : t.next}
        </button>
      </div>
    </form>
  )
}

export default TurnForm
