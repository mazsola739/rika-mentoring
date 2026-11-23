import { useEffect, useRef } from 'react'

// A native <dialog> opened with showModal(): it traps focus, closes on Esc and returns
// focus to the button that opened it. React only syncs the `open` prop to the element.
export default function ConfirmDialog({ open, title, children, cancelLabel, confirmLabel, busy, error, onCancel, onConfirm }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="bl-dialog"
      aria-labelledby="bl-dialog-title"
      onCancel={(e) => {
        // Esc: let React decide, so the state and the element never disagree.
        e.preventDefault()
        if (!busy) onCancel()
      }}
    >
      <h4 id="bl-dialog-title">{title}</h4>
      <div className="bl-dialog__body">{children}</div>
      {error && (
        <p className="bl-alert" role="alert">
          {error}
        </p>
      )}
      <div className="bl-dialog__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
        <button type="button" className="btn bl-btn-danger" onClick={onConfirm} disabled={busy} aria-busy={busy}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
