import { useId, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { CATEGORIES, OCCASIONS, SEASONS, uid } from './data.js'
import { downscaleImage } from './image.js'
import ColorPicker from './ColorPicker.jsx'

const EMPTY = { name: '', category: 'top', color: 'black', season: 'all', occasion: 'casual', photo: null }

export default function ItemForm({ onAdd, onCancel, canCancel }) {
  const t = useText(TEXT)
  const f = t.form
  const id = useId()
  const [draft, setDraft] = useState(EMPTY)
  const [photoState, setPhotoState] = useState('idle') // 'idle' | 'processing' | 'notImage' | 'readFailed'

  const set = (field) => (value) => setDraft((d) => ({ ...d, [field]: value }))

  const pickPhoto = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // so choosing the same file again still fires onChange
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoState('notImage')
      return
    }
    setPhotoState('processing')
    try {
      const photo = await downscaleImage(file, 400)
      setDraft((d) => ({ ...d, photo }))
      setPhotoState('idle')
    } catch {
      setPhotoState('readFailed')
    }
  }

  const submit = (event) => {
    event.preventDefault()
    const name = draft.name.trim()
    if (!name || photoState === 'processing') return
    onAdd({ ...draft, name, id: uid(), createdAt: Date.now() })
    setDraft((d) => ({ ...EMPTY, category: d.category, season: d.season, occasion: d.occasion }))
  }

  return (
    <form className="wr-form" onSubmit={submit} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="wr-form__title">
        {f.title}
      </h3>

      <div className="wr-form__grid">
        <div className="wr-photo">
          <span className="wr-label">{f.photo}</span>
          <div className="wr-photo__preview">
            {draft.photo ? <img src={draft.photo} alt="" /> : <span className="wr-photo__empty" aria-hidden="true" />}
          </div>
          <label className="btn btn--ghost wr-photo__pick">
            {draft.photo ? f.changePhoto : f.choosePhoto}
            <input type="file" accept="image/*" className="visually-hidden" onChange={pickPhoto} />
          </label>
          {draft.photo && (
            <button type="button" className="wr-link" onClick={() => set('photo')(null)}>
              {f.removePhoto}
            </button>
          )}
          <p className={`wr-hint${photoState === 'notImage' || photoState === 'readFailed' ? ' is-error' : ''}`} aria-live="polite">
            {photoState === 'processing'
              ? f.processing
              : photoState === 'notImage'
                ? f.notImage
                : photoState === 'readFailed'
                  ? f.readFailed
                  : f.photoHint}
          </p>
        </div>

        <div className="wr-form__fields">
          <label className="field">
            <span>{f.name}</span>
            <input
              className="input"
              value={draft.name}
              onChange={(e) => set('name')(e.target.value)}
              placeholder={f.namePlaceholder}
              maxLength={60}
              required
            />
          </label>

          <fieldset className="wr-chipset">
            <legend>{f.category}</legend>
            <div className="wr-chipset__list">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="wr-chip">
                  <input type="radio" name={`${id}-cat`} checked={draft.category === cat} onChange={() => set('category')(cat)} />
                  <span>{t.categories[cat]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <ColorPicker name={`${id}-color`} legend={f.color} value={draft.color} onChange={set('color')} />

          <div className="wr-form__row">
            <label className="field">
              <span>{f.season}</span>
              <select className="input" value={draft.season} onChange={(e) => set('season')(e.target.value)}>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {t.seasons[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{f.occasion}</span>
              <select className="input" value={draft.occasion} onChange={(e) => set('occasion')(e.target.value)}>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {t.occasions[o]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="wr-actions">
        <button type="submit" className="btn" disabled={!draft.name.trim() || photoState === 'processing'}>
          {f.submit}
        </button>
        {canCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {f.cancel}
          </button>
        )}
      </div>
    </form>
  )
}
