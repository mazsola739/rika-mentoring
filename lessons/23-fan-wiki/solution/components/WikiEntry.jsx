import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../useLocalStorage.js'

// The lesson's API is read-only, so the fans' entries live in this browser: one object, by character id.
const ENTRIES_KEY = 'rika:fan-wiki:entries'

// A fan entry on a character's page: read it, write or edit it, save or cancel.
export default function WikiEntry({ character, t }) {
  const [stored, setEntries] = useLocalStorage(ENTRIES_KEY, {})
  const entries = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
  const text = typeof entries[character.id] === 'string' ? entries[character.id] : ''

  const [editing, setEditing] = useState(false)
  // The draft is kept apart from the saved text, so Cancel simply drops it.
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState('')

  // After Save or Cancel, put the keyboard focus back on the button that opened the form.
  const toggleRef = useRef(null)
  const wasEditing = useRef(false)
  useEffect(() => {
    if (wasEditing.current && !editing) toggleRef.current?.focus()
    wasEditing.current = editing
  }, [editing])

  function startEditing() {
    setDraft(text)
    setNotice('')
    setEditing(true)
  }

  function save(event) {
    event.preventDefault()
    const clean = draft.trim()
    const next = { ...entries }
    // An empty box clears the entry.
    if (clean) next[character.id] = clean
    else delete next[character.id]
    setEntries(next)
    setNotice(clean ? t.entrySaved : text ? t.entryCleared : '')
    setEditing(false)
  }

  function cancel() {
    setEditing(false)
  }

  return (
    <section className="fw-entry" aria-labelledby="fw-entry-title">
      <h4 id="fw-entry-title" className="fw-section-title">
        {t.entryTitle}
      </h4>

      {editing ? (
        <form className="fw-entry__form" onSubmit={save}>
          <label className="field">
            <span>{t.entryLabel(character.name)}</span>
            <textarea
              className="input fw-entry__input"
              value={draft}
              rows={5}
              maxLength={2000}
              autoFocus
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && cancel()}
            />
            <small>{t.entryHint}</small>
          </label>
          <div className="fw-entry__actions">
            <button type="submit" className="btn">
              {t.entrySave}
            </button>
            <button type="button" className="btn btn--ghost" onClick={cancel}>
              {t.entryCancel}
            </button>
          </div>
        </form>
      ) : (
        <>
          {text ? <p className="fw-entry__text">{text}</p> : <p className="fw-entry__empty">{t.entryEmpty}</p>}
          <button ref={toggleRef} type="button" className="btn btn--ghost" onClick={startEditing}>
            {text ? t.entryEdit : t.entryWrite}
          </button>
        </>
      )}

      <p className="visually-hidden" aria-live="polite">
        {notice}
      </p>
    </section>
  )
}
