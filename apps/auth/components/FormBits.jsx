import { useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from '../text.js'

// We keep an error *code* in state, not the message, so it is re-translated when the language changes.
export const errorCode = (err) => err?.code ?? 'network'

export function TextField({ id, label, error, ...inputProps }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        <span className="au-label">{label}</span>
      </label>
      <input
        id={id}
        className="input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && (
        <small id={`${id}-error`} className="au-error">
          {error}
        </small>
      )}
    </div>
  )
}

// A password input with a show / hide toggle. Extra description ids (e.g. the rule list) can be passed in.
// In React 19 `ref` is a normal prop, so the parent can focus the inner <input> without forwardRef.
export function PasswordField({ id, label, error, describedBy, ref, ...inputProps }) {
  const t = useText(TEXT)
  const [visible, setVisible] = useState(false)
  const ids = [error && `${id}-error`, describedBy].filter(Boolean).join(' ') || undefined

  return (
    <div className="field">
      <label htmlFor={id}>
        <span className="au-label">{label}</span>
      </label>
      <span className="au-password">
        <input
          ref={ref}
          id={id}
          className="input"
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={ids}
          {...inputProps}
        />
        <button
          type="button"
          className="au-password__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t.hidePassword : t.showPassword}
          aria-pressed={visible}
        >
          {visible ? t.hide : t.show}
        </button>
      </span>
      {error && (
        <small id={`${id}-error`} className="au-error">
          {error}
        </small>
      )}
    </div>
  )
}

export function FormAlert({ code, onFix }) {
  const t = useText(TEXT)
  if (!code) return null
  return (
    <div className="au-alert" role="alert">
      <span>{t.authErrors[code] ?? t.authErrors.network}</span>
      {t.fixLinks[code] && (
        <button type="button" className="au-link" onClick={onFix}>
          {t.fixLinks[code]}
        </button>
      )}
    </div>
  )
}
