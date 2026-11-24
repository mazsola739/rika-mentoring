import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT, useFormat } from '../text.js'

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

export const BookingSummary = ({ service, start, end }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const format = useFormat()
  return (
    <dl className="bk-summary">
      <div>
        <dt>{t.steps[0]}</dt>
        <dd>
          {service.name[lang]} · {t.minutes(service.duration)} · {format.money(service.price)}
        </dd>
      </div>
      <div>
        <dt>{t.steps[1]}</dt>
        <dd>
          {format.fullDate(start)}, {format.range(start, end)}
        </dd>
      </div>
    </dl>
  )
}

const BookingForm = ({ service, start, end, onSubmit, onBack, error }) => {
  const t = useText(TEXT)
  const [values, setValues] = useState({ name: '', email: '', note: '' })
  const [touched, setTouched] = useState({})
  const [sending, setSending] = useState(false)

  const errors = { name: values.name.trim().length < 2, email: !isEmail(values.email) }
  const show = (f) => touched[f] && errors[f]

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true })
    if (errors.name || errors.email) return
    setSending(true)
    try {
      await onSubmit({ name: values.name.trim(), email: values.email.trim(), note: values.note.trim() })
    } finally {
      setSending(false)
    }
  }

  const input = (name, props) => (
    <label className="field">
      <span>{t[name]}</span>
      <input
        className="input"
        value={values[name]}
        onChange={(e) => setValues({ ...values, [name]: e.target.value })}
        onBlur={() => setTouched({ ...touched, [name]: true })}
        aria-invalid={Boolean(show(name))}
        aria-describedby={show(name) ? `bk-err-${name}` : undefined}
        disabled={sending}
        {...props}
      />
      {show(name) && (
        <small id={`bk-err-${name}`} className="bk-error">
          {t.errors[name]}
        </small>
      )}
    </label>
  )

  return (
    <form className="bk-form" onSubmit={submit} noValidate>
      <BookingSummary service={service} start={start} end={end} />
      <div className="bk-form__row">
        {input('name', { autoComplete: 'name' })}
        {input('email', { type: 'email', inputMode: 'email', autoComplete: 'email' })}
      </div>
      <label className="field">
        <span>{t.note}</span>
        <textarea
          className="input bk-form__note"
          rows={3}
          maxLength={500}
          value={values.note}
          onChange={(e) => setValues({ ...values, note: e.target.value })}
          disabled={sending}
        />
      </label>
      {error && (
        <p className="bk-alert" role="alert">
          {error}
        </p>
      )}
      <div className="bk-actions">
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={sending}>
          ← {t.back}
        </button>
        <button type="submit" className="btn" disabled={sending}>
          {sending ? t.confirming : t.confirm}
        </button>
      </div>
    </form>
  )
}

export default BookingForm
