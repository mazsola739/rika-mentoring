import { useId, useState } from 'react'
import { resizeImage } from './resizeImage.js'
import { tx } from './text.js'
import PlantAvatar, { plantColor } from './PlantAvatar.jsx'

const pad = (n) => String(n).padStart(2, '0')
const toDateInput = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// A date from <input type="date"> → ISO time. Today means "right now", earlier days count as noon.
function dateInputToISO(value) {
  const [y, m, d] = value.split('-').map(Number)
  const now = new Date()
  if (value === toDateInput(now)) return now.toISOString()
  return new Date(y, m - 1, d, 12).toISOString()
}

function validate({ name, every, last }, isEdit) {
  const e = {}
  const n = Number(every)
  if (!name.trim()) e.name = 'name'
  if (!Number.isInteger(n) || n < 1 || n > 60) e.every = 'interval'
  if (!isEdit && (!last || last > toDateInput(new Date()))) e.last = 'last'
  return e
}

const PlantForm = ({ plant, lang, t, onSave, onCancel }) => {
  const isEdit = Boolean(plant)
  const [values, setValues] = useState(() => ({
    name: tx(plant?.name, lang),
    every: String(plant?.interval ?? 7),
    last: toDateInput(new Date()),
  }))
  const [photo, setPhoto] = useState(plant?.photo ?? null)
  const [photoState, setPhotoState] = useState('idle') // 'idle' | 'processing' | 'type' | 'decode'
  const [submitted, setSubmitted] = useState(false)
  const [fileKey, setFileKey] = useState(0) // remounts the file input to clear it
  const id = useId()
  const f = t.form

  const errors = validate(values, isEdit)
  const show = (field) => (submitted && errors[field] ? t.errors[errors[field]] : undefined)
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoState('processing')
    try {
      setPhoto(await resizeImage(file))
      setPhotoState('idle')
    } catch (err) {
      setPhotoState(err.message === 'type' ? 'type' : 'decode')
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoState('idle')
    setFileKey((k) => k + 1)
  }

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    const first = ['name', 'every', 'last'].find((field) => errors[field])
    if (first) {
      e.currentTarget.elements[first]?.focus()
      return
    }
    if (photoState === 'processing') return

    const base = { name: values.name.trim(), interval: Number(values.every), photo }
    if (isEdit) {
      onSave({ ...plant, ...base })
    } else {
      const lastWatered = dateInputToISO(values.last)
      onSave({ id: crypto.randomUUID(), ...base, lastWatered, log: [lastWatered] })
      setValues({ name: '', every: values.every, last: toDateInput(new Date()) })
      removePhoto()
      setSubmitted(false)
    }
  }

  const err = (field) =>
    show(field) && (
      <small id={`${id}-${field}-err`} className="pc-error">
        {show(field)}
      </small>
    )
  const aria = (field) => ({
    'aria-invalid': Boolean(show(field)),
    'aria-describedby': show(field) ? `${id}-${field}-err` : undefined,
  })

  return (
    <form className={`pc-form${isEdit ? ' pc-form--inline' : ' pc-card'}`} onSubmit={submit} noValidate>
      <h3>{isEdit ? f.editTitle : f.addTitle}</h3>

      <label className="field">
        <span>{f.name}</span>
        <input
          className="input"
          name="name"
          maxLength={40}
          placeholder={f.namePlaceholder}
          value={values.name}
          onChange={set('name')}
          {...aria('name')}
        />
        {err('name')}
      </label>

      <div className="pc-form__row">
        <label className="field">
          <span>{f.interval}</span>
          <span className="pc-suffix">
            <input
              className="input"
              name="every"
              type="number"
              min={1}
              max={60}
              inputMode="numeric"
              value={values.every}
              onChange={set('every')}
              {...aria('every')}
            />
            <span aria-hidden="true">{f.days}</span>
          </span>
          {err('every')}
        </label>
        {!isEdit && (
          <label className="field">
            <span>{f.last}</span>
            <input
              className="input"
              name="last"
              type="date"
              max={toDateInput(new Date())}
              value={values.last}
              onChange={set('last')}
              {...aria('last')}
            />
            {err('last')}
          </label>
        )}
      </div>

      <div className="pc-photo">
        <div className="pc-photo__preview" aria-hidden="true">
          {photo ? <img src={photo} alt="" /> : <PlantAvatar color={plant ? plantColor(plant) : undefined} />}
        </div>
        <div className="pc-photo__controls">
          <span className="pc-photo__label">
            {f.photo} <small>({f.optional})</small>
          </span>
          <label className="btn btn--ghost pc-file">
            <input key={fileKey} type="file" accept="image/*" onChange={pickPhoto} aria-describedby={`${id}-photo-hint`} />
            {photo ? f.change : f.choose}
          </label>
          {photo && (
            <button type="button" className="pc-link" onClick={removePhoto}>
              {f.remove}
            </button>
          )}
          <small id={`${id}-photo-hint`} className="pc-hint" aria-live="polite">
            {photoState === 'processing'
              ? f.processing
              : photoState === 'idle'
                ? f.photoHint
                : t.errors[photoState]}
          </small>
        </div>
      </div>

      <div className="pc-row">
        <button type="submit" className="btn" disabled={photoState === 'processing'}>
          {isEdit ? f.save : f.add}
        </button>
        {isEdit && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {f.cancel}
          </button>
        )}
      </div>
    </form>
  )
}

export default PlantForm
