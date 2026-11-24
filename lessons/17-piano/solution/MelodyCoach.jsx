import { MELODIES } from './melodies.js'
import { noteName, pitchName } from './notes.js'

// The class of a note in the list: played already, the next one, or still to come.
function stepClass(index, position) {
  if (index < position) return 'is-done'
  if (index === position) return 'is-next'
  return undefined
}

// The teaching mode: choose a melody, see its notes, and follow the gold key. `coach` is what useMelodyCoach returns.
export default function MelodyCoach({ coach, lang, t, onChoose }) {
  const { melody, position, mistakes, finished } = coach

  let status = t.idle
  if (melody && finished) status = t.done(mistakes)
  else if (melody) status = t.progress(position, melody.notes.length, noteName(melody.notes[position], lang), mistakes)

  return (
    <section className="pn-panel" aria-labelledby="pn-coach-title">
      <h2 id="pn-coach-title" className="pn-panel__title">
        {t.title}
      </h2>
      <label className="field pn-panel__field">
        <span>{t.melody}</span>
        <select className="input" value={melody ? melody.id : ''} onChange={(e) => onChoose(e.target.value)}>
          <option value="">{t.none}</option>
          {MELODIES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title[lang]}
            </option>
          ))}
        </select>
      </label>
      {melody && (
        <>
          {/* The same note comes many times in a melody, and the list never changes while practising: index is a fine key. */}
          <ol className="pn-melody" aria-label={t.notes}>
            {melody.notes.map((midi, index) => (
              <li key={index} className={stepClass(index, position)} aria-current={index === position ? 'step' : undefined}>
                {pitchName(midi, lang)}
              </li>
            ))}
          </ol>
          <div className="pn-panel__buttons">
            <button type="button" className="btn btn--ghost" onClick={() => onChoose(melody.id)}>
              {t.again}
            </button>
          </div>
        </>
      )}
      <p className="pn-panel__status" aria-live="polite">
        {status}
      </p>
    </section>
  )
}
