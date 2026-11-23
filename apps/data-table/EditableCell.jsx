import { useEffect, useId, useRef, useState } from 'react'

function PencilIcon() {
  return (
    <svg className="dt-cell-btn__icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

// The editor keeps its own draft; the table only hears about the final value.
// Enter saves, Escape cancels, leaving the field saves (or cancels if the value is invalid).
function CellEditor({ kind, initial, options, optionLabel, label, validate, onDone }) {
  const errorId = useId()
  const [draft, setDraft] = useState(initial)
  const [showError, setShowError] = useState(false)
  const closed = useRef(false) // Enter/Escape unmount the editor, which also fires blur: close only once
  const error = validate ? validate(draft) : null
  const invalid = showError && error

  const close = (value, viaKeyboard) => {
    if (closed.current) return
    closed.current = true
    onDone(value, viaKeyboard)
  }

  const props = {
    className: `dt-editor${invalid ? ' is-invalid' : ''}`,
    autoFocus: true,
    value: draft,
    'aria-label': label,
    'aria-invalid': invalid ? true : undefined,
    'aria-describedby': invalid ? errorId : undefined,
    onChange: (e) => setDraft(e.target.value),
    onBlur: () => close(error ? null : draft, false),
    onKeyDown: (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (error) setShowError(true)
        else close(draft, true)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        close(null, true)
      }
    },
  }

  return (
    <div className="dt-editwrap">
      {kind === 'select' ? (
        <select {...props}>
          {options.map((option) => (
            <option key={option} value={option}>
              {optionLabel(option)}
            </option>
          ))}
        </select>
      ) : (
        <input {...props} type={kind === 'email' ? 'email' : 'text'} spellCheck={false} />
      )}
      {invalid && (
        <span id={errorId} className="dt-cell-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default function EditableCell({ kind = 'text', value, display, label, editing, options, optionLabel, validate, onStart, onSave, onCancel }) {
  const buttonRef = useRef(null)
  const returnFocus = useRef(false)

  // After Enter/Escape, put the keyboard focus back on the cell (not after a click elsewhere).
  useEffect(() => {
    if (!editing && returnFocus.current) {
      returnFocus.current = false
      buttonRef.current?.focus()
    }
  }, [editing])

  if (editing) {
    return (
      <CellEditor
        kind={kind}
        initial={value}
        options={options}
        optionLabel={optionLabel}
        label={label}
        validate={validate}
        onDone={(next, viaKeyboard) => {
          returnFocus.current = viaKeyboard
          const cleaned = typeof next === 'string' ? next.trim() : next
          if (cleaned === null || cleaned === value) onCancel()
          else onSave(cleaned)
        }}
      />
    )
  }

  return (
    <button ref={buttonRef} type="button" className="dt-cell-btn" aria-label={label} onClick={onStart}>
      <span className="dt-cell-btn__text">{display}</span>
      <PencilIcon />
    </button>
  )
}
