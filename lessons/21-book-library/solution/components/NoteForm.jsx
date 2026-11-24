import { useState } from 'react'

// Writing a note works on a draft of its own: the book changes only on "Save", so "Cancel" can drop the draft.
// The form is on the page only while you write, so every opening starts again from the book's current note.
export default function NoteForm({ note, onSave, onCancel, t }) {
  const [draft, setDraft] = useState(note)

  function handleSubmit(event) {
    event.preventDefault()
    onSave(draft.trim())
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') onCancel()
  }

  return (
    <form className="bl-note-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <label className="field">
        <span>{t.noteField}</span>
        <textarea
          className="input bl-note-form__text"
          value={draft}
          rows={3}
          maxLength={500}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <div className="bl-note-form__actions">
        <button type="submit" className="btn bl-small-btn">
          {t.save}
        </button>
        <button type="button" className="btn btn--ghost bl-small-btn" onClick={onCancel}>
          {t.cancel}
        </button>
      </div>
    </form>
  )
}
