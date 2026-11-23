import { useState } from 'react'
import { CATEGORIES, CATEGORY_KEYS, fullDate, label, relativeTime } from './notes.js'

export default function NoteEditor({ note, now, autoFocus, onChange, onDelete, onBack, lang, t }) {
  const [confirming, setConfirming] = useState(false)
  const title = label(note.title, lang)
  const body = label(note.body, lang)
  const words = body.trim() ? body.trim().split(/\s+/).length : 0

  return (
    <article className="nt-editor">
      <div className="nt-editor__bar">
        <button type="button" className="btn btn--ghost nt-back" onClick={onBack}>
          ← {t.allNotes}
        </button>
        <label className="nt-editor__cat">
          <span className="visually-hidden">{t.category}</span>
          <select className="input" value={note.category} onChange={(e) => onChange(note.id, { category: e.target.value })}>
            {CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {CATEGORIES[key][lang]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Controlled fields: every keystroke goes straight into the notes state (and from there to localStorage). */}
      <label className="visually-hidden" htmlFor="nt-title">
        {t.title}
      </label>
      <input
        id="nt-title"
        className="nt-editor__title"
        value={title}
        placeholder={t.untitled}
        autoFocus={autoFocus}
        maxLength={120}
        onChange={(e) => onChange(note.id, { title: e.target.value })}
      />
      <label className="visually-hidden" htmlFor="nt-body">
        {t.body}
      </label>
      <textarea
        id="nt-body"
        className="nt-editor__body"
        value={body}
        placeholder={t.bodyPlaceholder}
        onChange={(e) => onChange(note.id, { body: e.target.value })}
      />

      <footer className="nt-editor__foot">
        <span title={fullDate(note.updatedAt, lang)}>
          {t.edited(relativeTime(note.updatedAt, now, lang))} · {t.words(words)}
        </span>
        {confirming ? (
          <span className="nt-confirm">
            <button type="button" className="btn nt-small nt-danger" onClick={() => onDelete(note.id)}>
              {t.confirmDelete}
            </button>
            <button type="button" className="btn btn--ghost nt-small" onClick={() => setConfirming(false)}>
              {t.cancel}
            </button>
          </span>
        ) : (
          <button type="button" className="btn btn--ghost nt-small" onClick={() => setConfirming(true)}>
            {t.delete}
          </button>
        )}
      </footer>
    </article>
  )
}
