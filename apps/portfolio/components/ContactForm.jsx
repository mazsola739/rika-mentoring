import { useEffect, useState } from 'react'
import { createMockApi } from '@shared/mock-api/index.js'

// Kamu backend: 0,5–1,1 mp késleltetés, és minden ötödik kérés szándékosan elbukik,
// hogy a hibakezelést is lássuk.
const api = createMockApi('portfolio', { latency: [500, 1100], failRate: 0.2 })

const EMPTY = { name: '', email: '', message: '' }

function validate(values) {
  const errors = {}
  if (values.name.trim().length < 2) errors.name = 'name'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'email'
  if (values.message.trim().length < 10) errors.message = 'message'
  return errors
}

export default function ContactForm({ t }) {
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [error, setError] = useState('')
  const [count, setCount] = useState(null)

  // Betöltéskor lekérjük, hány üzenet van már a „szerveren”. Hiba esetén kétszer újrapróbáljuk.
  useEffect(() => {
    let ignore = false
    const load = (attempt = 0) =>
      api
        .list('messages')
        .then((messages) => {
          if (!ignore) setCount(messages.length)
        })
        .catch(() => {
          if (!ignore && attempt < 2) load(attempt + 1)
        })
    load()
    return () => {
      ignore = true
    }
  }, [])

  const errors = validate(values)
  const showError = (field) => touched[field] && errors[field]

  const change = (field) => (e) => setValues({ ...values, [field]: e.target.value })
  const blur = (field) => () => setTouched({ ...touched, [field]: true })

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (Object.keys(errors).length) return

    setStatus('sending')
    setError('')
    try {
      await api.create('messages', {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      })
      setStatus('sent')
      setCount((c) => (c ?? 0) + 1)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  const reset = () => {
    setValues(EMPTY)
    setTouched({})
    setStatus('idle')
  }

  if (status === 'sent') {
    return (
      <div className="pf-form pf-form--sent" role="status">
        <span className="pf-form__check solid" aria-hidden="true">
          ✓
        </span>
        <h3>{t.form.sentTitle}</h3>
        <p>{t.form.sentText}</p>
        <button type="button" className="btn btn--ghost" onClick={reset}>
          {t.form.another}
        </button>
      </div>
    )
  }

  const field = (name, label, props = {}) => {
    const Tag = props.multiline ? 'textarea' : 'input'
    const { multiline, ...rest } = props
    return (
      <label className="field">
        <span>{label}</span>
        <Tag
          className={`input${multiline ? ' pf-form__textarea' : ''}`}
          value={values[name]}
          onChange={change(name)}
          onBlur={blur(name)}
          aria-invalid={Boolean(showError(name))}
          aria-describedby={showError(name) ? `pf-err-${name}` : undefined}
          disabled={status === 'sending'}
          {...rest}
        />
        {showError(name) && (
          <small id={`pf-err-${name}`} className="pf-form__error">
            {t.form.errors[name]}
          </small>
        )}
      </label>
    )
  }

  return (
    <form className="pf-form" onSubmit={submit} noValidate>
      <h3>{t.form.title}</h3>
      <div className="pf-form__row">
        {field('name', t.form.name, { autoComplete: 'name' })}
        {field('email', t.form.email, { type: 'email', autoComplete: 'email' })}
      </div>
      {field('message', t.form.message, { multiline: true, rows: 5 })}

      {status === 'error' && (
        <p className="pf-form__alert" role="alert">
          {t.form.failed} {error}
        </p>
      )}

      <div className="pf-form__actions">
        <button type="submit" className="btn" disabled={status === 'sending'}>
          {status === 'sending' ? t.form.sending : t.form.send}
        </button>
        {count !== null && <small className="pf-form__note">{t.form.demoNote(count)}</small>}
      </div>
    </form>
  )
}
