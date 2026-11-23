import { useEffect, useRef, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { STATUSES, formatCoords } from './places.js'
import { resizeImage } from './resizeImage.js'
import { TEXT } from './text.js'

// A controlled form: the draft lives in the parent, because clicks on the map move its pin too.
const PlaceForm = ({ draft, onChange, onSave, onCancel }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const f = t.form
  const nameRef = useRef(null)
  const [submitted, setSubmitted] = useState(false)
  const [photoState, setPhotoState] = useState('idle') // 'idle' | 'busy' | 'error'
  const missing = !draft.name.trim()

  // Opening the form moves focus to the first field.
  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // lets the same file be picked again
    if (!file) return
    setPhotoState('busy')
    try {
      onChange({ photo: await resizeImage(file) })
      setPhotoState('idle')
    } catch {
      setPhotoState('error')
    }
  }

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (missing) {
      nameRef.current?.focus()
      return
    }
    onSave()
  }

  return (
    <form className="tm-form" noValidate onSubmit={submit} aria-labelledby="tm-form-title">
      <div className="tm-form__head">
        <h3 id="tm-form-title">{draft.id ? f.editTitle : f.newTitle}</h3>
        <p className="tm-form__coords">
          <span className="tm-dot tm-dot--draft" aria-hidden="true" />
          {formatCoords(draft.x, draft.y, lang)}
        </p>
        <p className="tm-form__hint">{f.moveHint}</p>
      </div>

      <label className="field">
        <span>{f.name}</span>
        <input
          ref={nameRef}
          className="input"
          value={draft.name}
          placeholder={f.namePlaceholder}
          onChange={(e) => onChange({ name: e.target.value })}
          aria-invalid={submitted && missing ? true : undefined}
          aria-describedby={submitted && missing ? 'tm-name-error' : undefined}
        />
        {submitted && missing && (
          <small id="tm-name-error" className="tm-error">
            {f.required}
          </small>
        )}
      </label>

      <fieldset className="tm-radios">
        <legend>{f.status}</legend>
        <div className="tm-radios__options">
          {STATUSES.map((status) => (
            <label key={status} className={`tm-radio tm-radio--${status}`}>
              <input type="radio" name="tm-status" value={status} checked={draft.status === status} onChange={() => onChange({ status })} />
              <span>{t.statuses[status]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>
          {f.note} <small>({f.optional})</small>
        </span>
        <textarea className="input tm-textarea" rows="2" value={draft.note} onChange={(e) => onChange({ note: e.target.value })} />
      </label>

      <div className="tm-photo">
        <span className="tm-photo__label">
          {f.photo} <small>({f.optional})</small>
        </span>
        {draft.photo && <img className="tm-photo__preview" src={draft.photo} alt={f.photoAlt(draft.name.trim())} />}
        <div className="tm-photo__actions">
          <label className={`btn btn--ghost tm-file${photoState === 'busy' ? ' is-busy' : ''}`}>
            <input type="file" accept="image/*" className="visually-hidden" onChange={pickPhoto} disabled={photoState === 'busy'} />
            {draft.photo ? f.changePhoto : f.addPhoto}
          </label>
          {draft.photo && (
            <button type="button" className="tm-link" onClick={() => onChange({ photo: null })}>
              {f.removePhoto}
            </button>
          )}
        </div>
        {photoState === 'error' && (
          <small className="tm-error" role="alert">
            {f.photoError}
          </small>
        )}
      </div>

      <div className="tm-form__actions">
        <button type="submit" className="btn">
          {f.save}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          {f.cancel}
        </button>
      </div>
    </form>
  )
}

export default PlaceForm
