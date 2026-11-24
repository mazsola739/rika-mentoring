import { useState } from 'react'

// Label + control + hint + error, wired together with ids for screen readers.
// The control comes from a render prop, so one wrapper works for inputs, selects and textareas.
export function Field({ name, label, hint, optional, error, wide = false, children }) {
  const id = `msf-${name}`
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

  return (
    <div className={`msf-field${wide ? ' msf-field--wide' : ''}`}>
      <label className="msf-field__label" htmlFor={id}>
        {label}
        {optional && <span className="msf-field__optional"> ({optional})</span>}
      </label>
      {children({ id, name, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && (
        <small id={`${id}-hint`} className="msf-field__hint">
          {hint}
        </small>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

export function FieldError({ id, message }) {
  if (!message) return null
  return (
    <small id={id} className="msf-field__error">
      <span aria-hidden="true">!</span> {message}
    </small>
  )
}

export function PasswordInput({ inputProps, labels, ...rest }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="msf-password">
      <input {...inputProps} {...rest} className="input" type={visible ? 'text' : 'password'} spellCheck={false} />
      <button
        type="button"
        className="msf-password__toggle"
        aria-controls={inputProps.id}
        aria-label={visible ? labels.hidePassword : labels.showPassword}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? labels.hide : labels.show}
      </button>
    </div>
  )
}
