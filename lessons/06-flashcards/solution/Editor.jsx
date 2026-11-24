import { useState } from 'react'
import { label } from './deck.js'
import { readImage } from './images.js'

// A controlled form. The parent gives it a `key`, so switching to another card starts with fresh state.
// A file field cannot be controlled from state, so it gets a `key` of its own: a new key empties it.
function CardForm({ initial, editing, onSave, onCancel, t }) {
  const [q, setQ] = useState(initial.q)
  const [a, setA] = useState(initial.a)
  const [image, setImage] = useState(initial.image)
  const [imageAlt, setImageAlt] = useState(initial.imageAlt)
  const [error, setError] = useState('')
  const [fileKey, setFileKey] = useState(0)
  const valid = q.trim() && a.trim()

  const chooseImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setImage(await readImage(file))
      setError('')
    } catch {
      setImage('')
      setError(t.imageError)
    }
  }

  const removeImage = () => {
    setImage('')
    setImageAlt('')
    setFileKey((k) => k + 1)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    onSave({ q: q.trim(), a: a.trim(), image, imageAlt: image ? imageAlt.trim() : '' })
    setError('')
    if (!editing) {
      setQ('')
      setA('')
      removeImage()
    }
  }

  return (
    <form className="fc-form" onSubmit={submit}>
      <h3>{editing ? t.editCard : t.newCard}</h3>
      <label className="field">
        <span>{t.question}</span>
        <textarea className="input" rows={2} value={q} onChange={(e) => setQ(e.target.value)} required />
      </label>
      <label className="field">
        <span>{t.answer}</span>
        <textarea className="input" rows={3} value={a} onChange={(e) => setA(e.target.value)} required />
      </label>
      <label className="field">
        <span>
          {t.picture} <small>{t.optional}</small>
        </span>
        <input key={fileKey} className="input fc-form__file" type="file" accept="image/*" onChange={chooseImage} />
      </label>
      {error && (
        <p className="fc-message fc-message--error" role="alert">
          {error}
        </p>
      )}
      {image && (
        <div className="fc-form__picture">
          <img className="fc-form__preview" src={image} alt={imageAlt.trim() || t.previewAlt} />
          <div className="fc-form__picture-side">
            <label className="field">
              <span>
                {t.pictureAlt} <small>{t.pictureAltHint}</small>
              </span>
              <input className="input" value={imageAlt} maxLength={150} onChange={(e) => setImageAlt(e.target.value)} />
            </label>
            <button type="button" className="btn btn--ghost fc-small" onClick={removeImage}>
              {t.removePicture}
            </button>
          </div>
        </div>
      )}
      <div className="fc-form__actions">
        <button type="submit" className="btn" disabled={!valid}>
          {editing ? t.saveCard : t.addCard}
        </button>
        {editing && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {t.cancel}
          </button>
        )}
      </div>
    </form>
  )
}

export default function Editor({ deck, boxOf, onAdd, onUpdate, onDelete, onRestore, lang, t }) {
  const [editingId, setEditingId] = useState(null)
  const editing = deck.cards.find((c) => c.id === editingId)
  const initial = editing
    ? { q: label(editing.q, lang), a: label(editing.a, lang), image: editing.image ?? '', imageAlt: editing.imageAlt ?? '' }
    : { q: '', a: '', image: '', imageAlt: '' }

  return (
    <div className="fc-editor">
      <CardForm
        key={editingId ?? 'new'}
        initial={initial}
        editing={Boolean(editing)}
        t={t}
        onCancel={() => setEditingId(null)}
        onSave={(values) => {
          if (editing) {
            onUpdate(editing.id, values)
            setEditingId(null)
          } else {
            onAdd(values)
          }
        }}
      />

      <div className="fc-list-head">
        <h3>{t.cardsInDeck(deck.cards.length)}</h3>
        {deck.builtIn && (
          <button type="button" className="chip" onClick={onRestore}>
            {t.restore}
          </button>
        )}
      </div>

      {deck.cards.length === 0 ? (
        <p className="fc-muted">{t.noCards}</p>
      ) : (
        <ol className="fc-list">
          {deck.cards.map((c) => {
            const box = boxOf(c.id)
            return (
              <li key={c.id} className={c.id === editingId ? 'is-editing' : undefined}>
                <div className="fc-list__main">
                  {c.image && <img className="fc-list__thumb" src={c.image} alt="" />}
                  <div className="fc-list__text">
                    <strong>{label(c.q, lang)}</strong>
                    <span>{label(c.a, lang)}</span>
                  </div>
                </div>
                {box && <span className={`fc-badge fc-badge--box${box}`}>{t.box(box)}</span>}
                <div className="fc-list__actions">
                  <button
                    type="button"
                    className="btn btn--ghost fc-small"
                    onClick={() => setEditingId(c.id)}
                    aria-label={`${t.edit}: ${label(c.q, lang)}`}
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost fc-small"
                    onClick={() => {
                      if (editingId === c.id) setEditingId(null)
                      onDelete(c.id)
                    }}
                    aria-label={`${t.delete}: ${label(c.q, lang)}`}
                  >
                    {t.delete}
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
