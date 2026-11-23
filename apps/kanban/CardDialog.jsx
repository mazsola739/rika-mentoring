import { useEffect, useRef, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { COLUMNS, PRIORITIES, localize } from './boardReducer.js'
import { TEXT } from './text.js'

// Add / edit form in a native modal <dialog> (focus trap and Esc come with the platform).
export default function CardDialog({ card, column, onSave, onDelete, onClose }) {
  const lang = useLang()
  const t = useText(TEXT)
  const f = t.form
  const dialogRef = useRef(null)
  const pressedBackdrop = useRef(false)
  const [form, setForm] = useState(() => ({
    title: card ? localize(card.title, lang) : '',
    description: card ? localize(card.description, lang) : '',
    priority: card?.priority ?? 'medium',
    column,
  }))
  const [submitted, setSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))
  const titleMissing = !form.title.trim()
  const close = () => dialogRef.current?.close()

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (titleMissing) {
      e.currentTarget.elements.title.focus()
      return
    }
    onSave({ title: form.title.trim(), description: form.description.trim(), priority: form.priority, column: form.column })
    close() // native close() also gives focus back to the button that opened the dialog
  }

  return (
    <dialog
      ref={dialogRef}
      className="kb-dialog"
      aria-labelledby="kb-dialog-title"
      onClose={onClose}
      onPointerDown={(e) => (pressedBackdrop.current = e.target === e.currentTarget)}
      onClick={(e) => {
        if (pressedBackdrop.current && e.target === e.currentTarget) close()
      }}
    >
      <form className="kb-form" noValidate onSubmit={submit}>
        <div className="kb-form__head">
          <h3 id="kb-dialog-title">{card ? f.editTitle : f.addTitle}</h3>
          <button type="button" className="kb-icon-btn" aria-label={f.close} onClick={close}>
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <label className="field">
          <span>{f.title}</span>
          <input
            className="input"
            name="title"
            value={form.title}
            onChange={set('title')}
            aria-invalid={submitted && titleMissing ? true : undefined}
            aria-describedby={submitted && titleMissing ? 'kb-title-error' : undefined}
          />
          {submitted && titleMissing && (
            <small id="kb-title-error" className="kb-error">
              {f.required}
            </small>
          )}
        </label>

        <label className="field">
          <span>
            {f.description} <small>({f.optional})</small>
          </span>
          <textarea className="input kb-textarea" name="description" rows="3" value={form.description} onChange={set('description')} />
        </label>

        <div className="kb-form__row">
          <fieldset className="kb-radios">
            <legend>{t.priority}</legend>
            <div className="kb-radios__options">
              {PRIORITIES.map((p) => (
                <label key={p} className="kb-radio">
                  <input type="radio" name="priority" value={p} checked={form.priority === p} onChange={set('priority')} />
                  <span>{t.priorities[p]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>{f.column}</span>
            <select className="input" name="column" value={form.column} onChange={set('column')}>
              {COLUMNS.map((c) => (
                <option key={c} value={c}>
                  {t.columns[c]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {confirming ? (
          <div className="kb-confirm" role="alert">
            <p>{f.confirm}</p>
            <div className="kb-form__actions">
              <button
                type="button"
                className="btn kb-btn-danger"
                onClick={() => {
                  onDelete()
                  close()
                }}
              >
                {f.confirmYes}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)}>
                {f.confirmNo}
              </button>
            </div>
          </div>
        ) : (
          <div className="kb-form__actions">
            <button type="submit" className="btn">
              {f.save}
            </button>
            <button type="button" className="btn btn--ghost" onClick={close}>
              {f.cancel}
            </button>
            {card && (
              <button type="button" className="btn btn--ghost kb-form__delete" onClick={() => setConfirming(true)}>
                {f.delete}
              </button>
            )}
          </div>
        )}
      </form>
    </dialog>
  )
}
