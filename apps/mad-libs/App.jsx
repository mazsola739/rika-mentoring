import { useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { HINTS, TEMPLATES, fieldsOf, fill } from './templates.js'
import './app.css'

const TEXT = {
  hu: {
    choose: 'Válassz történetet',
    random: 'Véletlen',
    intro: 'Töltsd ki a mezőket anélkül, hogy tudnád, hová kerülnek. A végén összeáll belőlük a történet.',
    progress: (done, total) => `${done} / ${total} mező kitöltve`,
    tell: 'Mutasd a történetet',
    edit: 'Szavak módosítása',
    again: 'Új történet',
  },
  en: {
    choose: 'Choose a story',
    random: 'Random',
    intro: 'Fill in the fields without knowing where they will go. At the end, they come together into a story.',
    progress: (done, total) => `${done} / ${total} fields filled`,
    tell: 'Reveal the story',
    edit: 'Edit words',
    again: 'New story',
  },
}

const capitalize = (s) => s.charAt(0).toLocaleUpperCase() + s.slice(1)

function MadLib({ template, hints, t }) {
  const fields = fieldsOf(template.text)
  const [values, setValues] = useState({})
  const [revealed, setRevealed] = useState(false)

  const filled = fields.filter((f) => values[f]?.trim()).length
  const complete = filled === fields.length

  if (revealed) {
    return (
      <article className="ml__story">
        <h3>{template.title}</h3>
        <p>
          {fill(template.text, values).map((part, i) =>
            part.field ? (
              <mark key={i} title={capitalize(part.field)}>
                {part.value.trim()}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </p>
        <div className="ml__actions">
          <button type="button" className="btn" onClick={() => setRevealed(false)}>
            {t.edit}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setValues({})
              setRevealed(false)
            }}
          >
            {t.again}
          </button>
        </div>
      </article>
    )
  }

  return (
    <form
      className="ml__form"
      onSubmit={(e) => {
        e.preventDefault()
        if (complete) setRevealed(true)
      }}
    >
      <p className="ml__intro">{t.intro}</p>
      <div className="ml__fields">
        {fields.map((field) => (
          <label key={field} className="field">
            <span>{capitalize(field)}</span>
            <input
              className="input"
              value={values[field] ?? ''}
              placeholder={hints[field]}
              onChange={(e) => setValues({ ...values, [field]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <div className="ml__actions">
        <button type="submit" className="btn" disabled={!complete}>
          {t.tell}
        </button>
        <span className="ml__progress" aria-live="polite">
          {t.progress(filled, fields.length)}
        </span>
      </div>
    </form>
  )
}

function MadLibs() {
  const lang = useLang()
  const t = useText(TEXT)
  const [index, setIndex] = useState(0)
  const templates = TEMPLATES[lang]
  const template = templates[index]

  const pickRandom = () => {
    const others = templates.map((_, i) => i).filter((i) => i !== index)
    setIndex(others[Math.floor(Math.random() * others.length)])
  }

  return (
    <div className="ml">
      <div className="ml__picker">
        <span className="ml__picker-label">{t.choose}</span>
        <div className="ml__chips">
          {templates.map((tpl, i) => (
            <button key={tpl.id} type="button" className="chip" aria-pressed={i === index} onClick={() => setIndex(i)}>
              {tpl.title}
            </button>
          ))}
          <button type="button" className="chip ml__random" onClick={pickRandom}>
            {t.random}
          </button>
        </div>
      </div>

      {/* A key miatt sablon- vagy nyelvváltáskor tiszta lappal indul az űrlap. */}
      <MadLib key={`${lang}-${template.id}`} template={template} hints={HINTS[lang]} t={t} />
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="mad-libs">
      <MadLibs />
    </AppFrame>
  )
}
