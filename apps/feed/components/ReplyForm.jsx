import { useEffect, useRef, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from '../text.js'

// Used for top-level comments and for replies. The parent decides what happens on submit.
export default function ReplyForm({ id, label, submitLabel, onSubmit, onCancel, autoFocus = false }) {
  const t = useText(TEXT)
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'error'
  const ref = useRef(null)

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setStatus('sending')
    try {
      await onSubmit(text.trim())
      setText('')
      setStatus('idle')
    } catch {
      setStatus('error') // keep the text, so nothing typed is lost
    }
  }

  return (
    <form className="fd-reply" onSubmit={submit}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        className="input fd-reply__input"
        rows={2}
        maxLength={1000}
        value={text}
        placeholder={t.commentPlaceholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && onCancel) onCancel()
        }}
        disabled={status === 'sending'}
      />
      {status === 'error' && (
        <p className="fd-error" role="alert">
          {t.commentFailed}
        </p>
      )}
      <div className="fd-reply__actions">
        <button type="submit" className="btn fd-btn-sm" disabled={!text.trim() || status === 'sending'}>
          {status === 'sending' ? t.sending : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--ghost fd-btn-sm" onClick={onCancel}>
            {t.cancel}
          </button>
        )}
      </div>
    </form>
  )
}
