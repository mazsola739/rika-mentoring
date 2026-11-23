import { useState } from 'react'
import { SHELVES } from '../useShelves.js'

// The beginner version of the app: a book typed in by hand, with a reading status.
export default function AddBookForm({ defaultShelf, onAdd, t }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [shelf, setShelf] = useState(defaultShelf)

  const submit = (event) => {
    event.preventDefault()
    if (!title.trim()) return
    onAdd(
      {
        id: `manual-${Date.now()}`,
        title: title.trim(),
        authors: author.trim() ? [author.trim()] : [],
        year: null,
        coverId: null,
      },
      shelf,
    )
    setTitle('')
    setAuthor('')
  }

  return (
    <details className="bl-manual">
      <summary>{t.manualTitle}</summary>
      <form className="bl-manual__form" onSubmit={submit}>
        <p className="bl-muted">{t.manualIntro}</p>
        <label className="field">
          <span>{t.titleField}</span>
          <input className="input" value={title} required onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          <span>{t.authorField}</span>
          <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </label>
        <label className="field">
          <span>{t.shelfField}</span>
          <select className="input" value={shelf} onChange={(e) => setShelf(e.target.value)}>
            {SHELVES.map((s) => (
              <option key={s} value={s}>
                {t.shelfNames[s]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn" disabled={!title.trim()}>
          {t.addManual}
        </button>
      </form>
    </details>
  )
}
