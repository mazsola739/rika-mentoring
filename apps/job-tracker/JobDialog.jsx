import { useEffect, useRef, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { STATUSES, localize, toISODate } from './jobs.js'
import { TEXT } from './text.js'

const REQUIRED = ['company', 'role', 'applied']

function emptyForm(status) {
  return { company: '', role: '', applied: toISODate(new Date()), status, salary: '', interview: '', notes: '' }
}

// Add / edit form in a native <dialog>: showModal() gives focus trapping and Esc for free.
const JobDialog = ({ job, defaultStatus = 'applied', onSave, onDelete, onClose }) => {
  const lang = useLang()
  const t = useText(TEXT).form
  const status = useText(TEXT).statuses
  const dialogRef = useRef(null)
  const pressedBackdrop = useRef(false)
  const [form, setForm] = useState(() =>
    job ? { ...emptyForm(job.status), ...job, notes: localize(job.notes, lang) } : emptyForm(defaultStatus),
  )
  const [submitted, setSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)

  // Open as a modal once mounted. The guard keeps StrictMode's double effect run harmless.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const errors = Object.fromEntries(REQUIRED.map((key) => [key, !String(form[key]).trim()]))
  const field = (key) => ({
    name: key,
    value: form[key],
    onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
    'aria-invalid': submitted && errors[key] ? true : undefined,
    'aria-describedby': submitted && errors[key] ? `jt-err-${key}` : undefined,
  })
  const errorFor = (key) =>
    submitted && errors[key] ? (
      <small id={`jt-err-${key}`} className="jt-error">
        {t.required}
      </small>
    ) : null

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    const firstInvalid = REQUIRED.find((key) => errors[key])
    if (firstInvalid) {
      e.currentTarget.elements[firstInvalid].focus()
      return
    }
    onSave({
      company: form.company.trim(),
      role: form.role.trim(),
      applied: form.applied,
      status: form.status,
      salary: form.salary.trim(),
      interview: form.interview,
      notes: form.notes.trim(),
    })
    dialogRef.current?.close() // native close() also gives focus back to the button that opened the dialog
  }

  const close = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      className="jt-dialog"
      aria-labelledby="jt-dialog-title"
      onClose={onClose}
      // Close when a click starts and ends on the backdrop (not when selecting text inside).
      onPointerDown={(e) => (pressedBackdrop.current = e.target === e.currentTarget)}
      onClick={(e) => {
        if (pressedBackdrop.current && e.target === e.currentTarget) close()
      }}
    >
      <form className="jt-form" noValidate onSubmit={submit}>
        <div className="jt-form__head">
          <h3 id="jt-dialog-title">{job ? t.editTitle : t.addTitle}</h3>
          <button type="button" className="jt-icon-btn" aria-label={t.close} onClick={close}>
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="jt-form__grid">
          <label className="field">
            <span>{t.company}</span>
            <input className="input" autoComplete="organization" {...field('company')} />
            {errorFor('company')}
          </label>
          <label className="field">
            <span>{t.role}</span>
            <input className="input" autoComplete="organization-title" {...field('role')} />
            {errorFor('role')}
          </label>
          <label className="field">
            <span>{t.applied}</span>
            <input className="input" type="date" {...field('applied')} />
            {errorFor('applied')}
          </label>
          <label className="field">
            <span>{t.status}</span>
            <select className="input" {...field('status')}>
              {STATUSES.map((key) => (
                <option key={key} value={key}>
                  {status[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>
              {t.salary} <small>({t.optional})</small>
            </span>
            <input className="input" placeholder={t.salaryHint} {...field('salary')} />
          </label>
          <label className="field">
            <span>
              {t.interview} <small>({t.optional})</small>
            </span>
            <input className="input" type="date" {...field('interview')} />
          </label>
          <label className="field jt-form__wide">
            <span>
              {t.notes} <small>({t.optional})</small>
            </span>
            <textarea className="input jt-textarea" rows="3" {...field('notes')} />
          </label>
        </div>

        {confirming ? (
          <div className="jt-confirm" role="alert">
            <p>{t.confirm}</p>
            <div className="jt-form__actions">
              <button
                type="button"
                className="btn jt-btn-danger"
                onClick={() => {
                  onDelete()
                  close()
                }}
              >
                {t.confirmYes}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)}>
                {t.confirmNo}
              </button>
            </div>
          </div>
        ) : (
          <div className="jt-form__actions">
            <button type="submit" className="btn">
              {t.save}
            </button>
            <button type="button" className="btn btn--ghost" onClick={close}>
              {t.cancel}
            </button>
            {job && (
              <button type="button" className="btn btn--ghost jt-form__delete" onClick={() => setConfirming(true)}>
                {t.delete}
              </button>
            )}
          </div>
        )}
      </form>
    </dialog>
  )
}

export default JobDialog
