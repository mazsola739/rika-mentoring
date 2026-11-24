import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { HINTS, fieldsOf, wordFor } from './templates.js'
import Story from './Story.jsx'
import TurnForm from './TurnForm.jsx'

// One game with one story. It is rendered with a key (language, story, players), so a new key means
// a brand-new MadLib with empty words: that is how switching stories gives a clean slate.
function MadLib({ story, players }) {
  const lang = useLang()
  const t = useText(TEXT)
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // The fields come from the template; the counter and the button are derived from the words.
  const fields = fieldsOf(story.text)
  const filledCount = fields.filter((field) => wordFor(words, field).trim() !== '').length
  const complete = filledCount === fields.length

  // One function for every field: the input's name says which word it updates.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault()
    if (complete) setRevealed(true)
  }

  function restart() {
    setWords({})
    setRevealed(false)
  }

  if (revealed) {
    return (
      <Story story={story} words={words} players={players} onEdit={() => setRevealed(false)} onRestart={restart} />
    )
  }

  // With two players they take turns, one field at a time.
  if (players === 2) {
    return <TurnForm fields={fields} words={words} onUpdate={update} onDone={() => setRevealed(true)} />
  }

  return (
    <form className="ml__form" onSubmit={reveal}>
      <p className="ml__hint">{t.intro}</p>
      <div className="ml__fields">
        {fields.map((field) => (
          <label key={field} className="field">
            <span className="ml__label">{field}</span>
            <input
              className="input"
              name={field}
              value={wordFor(words, field)}
              placeholder={HINTS[lang][field]}
              onChange={update}
            />
          </label>
        ))}
      </div>
      <div className="ml__actions">
        <button type="submit" className="btn" disabled={!complete}>
          {t.tell}
        </button>
        <span className="ml__progress" aria-live="polite">
          {t.progress(filledCount, fields.length)}
        </span>
      </div>
    </form>
  )
}

export default MadLib
