import { useState } from 'react'
import { label } from './deck.js'

// A controlled form. The parent gives it a `key`, so switching to another card starts with fresh state.
function CardForm({ initial, editing, onSave, onCancel, t }) {
  const [q, setQ] = useState(initial.q)
  const [a, setA] = useState(initial.a)
  const valid = q.trim() && a.trim()

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    onSave({ q: q.trim(), a: a.trim() })
    if (!editing) {
      setQ('')
      setA('')
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

export default function Editor({ deck, marks, onAdd, onUpdate, onDelete, onRestore, lang, t }) {
  const [editingId, setEditingId] = useState(null)
  const editing = deck.cards.find((c) => c.id === editingId)
  const initial = editing ? { q: label(editing.q, lang), a: label(editing.a, lang) } : { q: '', a: '' }

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
          {deck.cards.map((c) => (
            <li key={c.id} className={c.id === editingId ? 'is-editing' : undefined}>
              <div className="fc-list__text">
                <strong>{label(c.q, lang)}</strong>
                <span>{label(c.a, lang)}</span>
              </div>
              {marks[c.id] && (
                <span className={`fc-badge fc-badge--${marks[c.id]}`}>
                  {marks[c.id] === 'known' ? t.markedKnown : t.markedLearning}
                </span>
              )}
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
          ))}
        </ol>
      )}
    </div>
  )
}
