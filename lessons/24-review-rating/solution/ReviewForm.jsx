import { useState } from 'react'
import { StarRating } from './StarRating.jsx'

const EMPTY = { author: '', rating: 0, heading: '', body: '' }
const BODY_MAX = 600

function validate(v) {
  const e = {}
  if (v.author.trim().length < 2) e.author = 'author'
  if (!v.rating) e.rating = 'rating'
  if (v.heading.trim().length < 3) e.heading = 'heading'
  if (v.body.trim().length < 20) e.body = 'body'
  else if (v.body.length > BODY_MAX) e.body = 'bodyLong'
  return e
}

export default function ReviewForm({ productId, onSubmit, t }) {
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'error'
  const [error, setError] = useState('')
  const [thanks, setThanks] = useState('')

  const errors = validate(values)
  const show = (field) => (touched[field] && errors[field] ? t.errors[errors[field]] : undefined)
  const set = (field, value) => setValues((v) => ({ ...v, [field]: value }))
  const blur = (field) => () => setTouched((x) => ({ ...x, [field]: true }))

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ author: true, rating: true, heading: true, body: true })
    setThanks('')
    const first = Object.keys(errors)[0]
    if (first) {
      // Jump to the first problem (radio groups: the first star).
      e.currentTarget.querySelector(`[name="${first}"]`)?.focus()
      return
    }
    setStatus('sending')
    try {
      await onSubmit({
        productId,
        author: values.author.trim(),
        rating: values.rating,
        title: values.heading.trim(),
        body: values.body.trim(),
      })
      setThanks(t.form.thanks(values.author.trim()))
      setValues(EMPTY)
      setTouched({})
      setStatus('idle')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const describe = (field, extra) =>
    [extra, show(field) && `rr-err-${field}`].filter(Boolean).join(' ') || undefined
  const sending = status === 'sending'

  return (
    <form className="rr-form" onSubmit={submit} noValidate aria-labelledby="rr-form-title">
      <h4 id="rr-form-title">{t.form.title}</h4>

      <fieldset className="rr-form__fields" disabled={sending}>
        <StarRating
          name="rating"
          value={values.rating}
          onChange={(n) => {
            set('rating', n)
            setTouched((x) => ({ ...x, rating: true }))
          }}
          legend={t.form.rating}
          words={t.stars.words}
          optionLabel={t.stars.option}
          emptyText={t.stars.empty}
          error={show('rating')}
          errorId="rr-err-rating"
        />
        {show('rating') && (
          <small id="rr-err-rating" className="rr-error">
            {show('rating')}
          </small>
        )}

        <div className="rr-form__row">
          <label className="field">
            <span>{t.form.author}</span>
            <input
              className="input"
              name="author"
              autoComplete="name"
              value={values.author}
              onChange={(e) => set('author', e.target.value)}
              onBlur={blur('author')}
              aria-invalid={Boolean(show('author'))}
              aria-describedby={describe('author')}
            />
            {show('author') && (
              <small id="rr-err-author" className="rr-error">
                {show('author')}
              </small>
            )}
          </label>
          <label className="field">
            <span>{t.form.heading}</span>
            <input
              className="input"
              name="heading"
              value={values.heading}
              maxLength={80}
              onChange={(e) => set('heading', e.target.value)}
              onBlur={blur('heading')}
              aria-invalid={Boolean(show('heading'))}
              aria-describedby={describe('heading')}
            />
            {show('heading') && (
              <small id="rr-err-heading" className="rr-error">
                {show('heading')}
              </small>
            )}
          </label>
        </div>

        <label className="field">
          <span>{t.form.body}</span>
          <textarea
            className="input rr-form__textarea"
            name="body"
            rows={4}
            value={values.body}
            onChange={(e) => set('body', e.target.value)}
            onBlur={blur('body')}
            aria-invalid={Boolean(show('body'))}
            aria-describedby={describe('body', 'rr-body-count')}
          />
          <small id="rr-body-count" className="rr-form__count">
            {values.body.length} / {BODY_MAX}
          </small>
          {show('body') && (
            <small id="rr-err-body" className="rr-error">
              {show('body')}
            </small>
          )}
        </label>

        {status === 'error' && (
          <p className="rr-alert" role="alert">
            <strong>{t.form.failed}</strong> {error}
          </p>
        )}

        <div className="rr-form__actions">
          <button type="submit" className="btn" aria-busy={sending}>
            {sending && <span className="rr-spinner" aria-hidden="true" />}
            {sending ? t.form.sending : t.form.submit}
          </button>
          <p className="rr-form__thanks" role="status">
            {thanks}
          </p>
        </div>
      </fieldset>
    </form>
  )
}
