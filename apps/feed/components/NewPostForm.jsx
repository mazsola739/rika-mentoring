import { useEffect, useRef, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { COMMUNITIES } from '../seed.js'
import { TEXT } from '../text.js'

const NewPostForm = ({ defaultCommunity, onSubmit, onClose }) => {
  const t = useText(TEXT)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [community, setCommunity] = useState(defaultCommunity)
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'error'
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const titleOk = title.trim().length >= 5 && title.trim().length <= 120
  const showError = touched && !titleOk

  const submit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (!titleOk) {
      titleRef.current?.focus()
      return
    }
    setStatus('sending')
    try {
      await onSubmit({ title: title.trim(), body: body.trim(), community, author: null })
      onClose()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="fd-new" onSubmit={submit} noValidate>
      <div className="fd-new__row">
        <label className="field fd-new__title">
          <span>{t.titleLabel}</span>
          <input
            ref={titleRef}
            className="input"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={showError}
            aria-describedby={showError ? 'fd-title-error' : undefined}
            disabled={status === 'sending'}
          />
          {showError && (
            <small id="fd-title-error" className="fd-error">
              {t.titleError}
            </small>
          )}
        </label>
        <label className="field">
          <span>{t.communityField}</span>
          <select className="input" value={community} onChange={(e) => setCommunity(e.target.value)} disabled={status === 'sending'}>
            {COMMUNITIES.map((c) => (
              <option key={c} value={c}>
                r/{c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>{t.bodyLabel}</span>
        <textarea
          className="input fd-new__body"
          rows={4}
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={status === 'sending'}
        />
      </label>
      {status === 'error' && (
        <p className="fd-error" role="alert">
          {t.postFailed}
        </p>
      )}
      <div className="fd-reply__actions">
        <button type="submit" className="btn" disabled={status === 'sending'}>
          {status === 'sending' ? t.publishing : t.publish}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          {t.cancel}
        </button>
      </div>
    </form>
  )
}

export default NewPostForm
