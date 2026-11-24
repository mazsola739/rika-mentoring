import { useEffect, useMemo, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { createMockApi } from '@shared/mock-api/index.js'
import { INITIAL_VALUES, firstInvalidStep, isStepValid, validateStep, visibleSteps, withoutSecrets } from './formSteps.js'
import { clearDraft, readDraft, useDraft } from './useDraft.js'
import StepIndicator from './StepIndicator.jsx'
import { AccountStep, MentorStep, PreferencesStep, ProfileStep, ReviewStep } from './Steps.jsx'
import { TEXT } from './text.js'
import './app.css'

const DRAFT_KEY = 'rika:multi-step-form:draft'
const STEP_COMPONENTS = {
  account: AccountStep,
  profile: ProfileStep,
  preferences: PreferencesStep,
  mentor: MentorStep,
  review: ReviewStep,
}

// Fake backend: a bit slow, and about one request in four fails so the error state is visible.
const api = createMockApi('multi-step-form', { latency: [700, 1400], failRate: 0.25 })

// Lazy initial state: read the draft only once, on the first render.
function loadStart() {
  const draft = readDraft(DRAFT_KEY)
  if (!draft?.values) return { values: INITIAL_VALUES, step: 0, visited: {}, restored: false }
  const values = { ...INITIAL_VALUES, ...draft.values, password: '', confirm: '' }
  if (!Array.isArray(values.topics)) values.topics = []
  const steps = visibleSteps(values)
  const saved = Math.min(Math.max(Number(draft.step) || 0, 0), steps.length - 1)
  // Passwords are not in the draft, so we stop at the first step that needs input again.
  const step = firstInvalidStep(steps, values, saved)
  // The steps up to the saved one were reached before: the indicator ticks the valid ones.
  const visited = Object.fromEntries(steps.slice(0, saved + 1).map((s) => [s.key, true]))
  return { values, step, visited, restored: true }
}

function SignupWizard({ onRestart }) {
  const t = useText(TEXT)
  const lang = useLang()
  const [start] = useState(loadStart)
  const [values, setValues] = useState(start.values)
  const [step, setStep] = useState(start.step)
  const [visited, setVisited] = useState(start.visited) // keys of the steps the user has already reached
  const [attempted, setAttempted] = useState({}) // steps where "Next" was pressed
  const [touched, setTouched] = useState({}) // fields the user has left once
  const [status, setStatus] = useState('editing') // 'editing' | 'submitting' | 'error'
  const [submitError, setSubmitError] = useState('')
  const [account, setAccount] = useState(null)
  const [showRestored, setShowRestored] = useState(start.restored)
  const formRef = useRef(null)
  const headingRef = useRef(null)
  const shouldFocus = useRef(false)

  // The steps depend on the answers: the mentor step is there only when the user asked for one.
  const steps = visibleSteps(values)
  const last = steps.length - 1
  const stepIndex = Math.min(step, last)
  const current = steps[stepIndex]
  const stepKey = current.key
  const errors = validateStep(current, values)
  const errorCount = Object.keys(errors).length
  const busy = status === 'submitting'
  const errorFor = (field) =>
    (attempted[stepKey] || touched[field]) && errors[field] ? t.errors[errors[field]] : undefined

  // Autosave everything except the passwords. useMemo keeps the object stable between
  // renders, so the save effect runs only when the data really changes.
  const draft = useMemo(() => ({ step: stepIndex, values: withoutSecrets(values) }), [stepIndex, values])
  const isDirty = JSON.stringify(draft.values) !== JSON.stringify(withoutSecrets(INITIAL_VALUES))
  const savedAt = useDraft(DRAFT_KEY, draft, { enabled: isDirty && !account })

  // After a step change, move keyboard focus to the new heading (not on the first page load).
  useEffect(() => {
    if (!shouldFocus.current) return
    shouldFocus.current = false
    headingRef.current?.focus()
  }, [stepIndex, account])

  const change = (name, value) => setValues((v) => ({ ...v, [name]: value }))
  const bind = (name) => ({
    value: values[name],
    onChange: (e) => change(name, e.target.value),
    onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
  })

  const goTo = (index) => {
    if (busy) return // stay put while the request is on its way
    shouldFocus.current = true
    setStep(index)
    setVisited((v) => ({ ...v, [current.key]: true, [steps[index].key]: true }))
    setShowRestored(false)
    if (status === 'error') setStatus('editing')
  }

  // From the summary: back to the step with this key.
  const editStep = (key) => goTo(steps.findIndex((s) => s.key === key))

  const focusFirstError = (errs) => {
    const field = current.fields.find((name) => errs[name])
    const el = formRef.current?.elements[field]
    // A group of checkboxes with the same name comes back as a list: focus its first box.
    const target = el instanceof RadioNodeList ? el[0] : el
    target?.focus()
  }

  const next = () => {
    if (errorCount) {
      setAttempted((a) => ({ ...a, [stepKey]: true }))
      focusFirstError(errors)
      return
    }
    goTo(stepIndex + 1)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (stepIndex < last) return next() // Enter in a field acts as "Next"

    // A restored draft may have skipped a step, so every step is checked again.
    const invalid = firstInvalidStep(steps, values, last)
    if (invalid < last) {
      setAttempted((a) => ({ ...a, [steps[invalid].key]: true }))
      return goTo(invalid)
    }
    if (errorCount) {
      setAttempted((a) => ({ ...a, [stepKey]: true }))
      return focusFirstError(errors)
    }

    setStatus('submitting')
    setSubmitError('')
    try {
      // A real backend would receive the password over HTTPS. Our mock API writes to
      // localStorage, so we leave it out on purpose. The mentor answers go only when asked for.
      const { password, confirm, agree, goal, hours, ...profile } = values
      const mentor = values.wantsMentor ? { goal: goal.trim(), hours } : {}
      const created = await api.create('accounts', {
        ...profile,
        ...mentor,
        email: profile.email.trim(),
        username: profile.username.trim(),
        fullName: profile.fullName.trim(),
      })
      clearDraft(DRAFT_KEY)
      shouldFocus.current = true
      setAccount(created)
      setStatus('editing')
    } catch (err) {
      setStatus('error')
      setSubmitError(err.message)
    }
  }

  const discard = () => {
    clearDraft(DRAFT_KEY)
    onRestart()
  }

  const timeFormat = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { hour: '2-digit', minute: '2-digit' })

  if (account) {
    return (
      <div className="msf msf-success" role="status">
        <span className="msf-success__badge solid" aria-hidden="true">
          ✓
        </span>
        <h3 ref={headingRef} tabIndex={-1}>
          {t.success.title(account.fullName.split(' ')[0])}
        </h3>
        <p>{t.success.text(account.email)}</p>
        <p className="msf-success__id">
          {t.success.id}: <code>{account.id.slice(0, 8)}</code>
        </p>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          {t.success.again}
        </button>
      </div>
    )
  }

  const indicatorSteps = steps.map((s, i) => ({
    key: s.key,
    done: i !== stepIndex && Boolean(visited[s.key]) && isStepValid(s, values),
    // You may jump to any step whose previous steps are all valid.
    reachable: firstInvalidStep(steps, values, i) === i,
  }))

  const StepComponent = STEP_COMPONENTS[stepKey]

  return (
    <div className="msf">
      {showRestored && (
        <div className="msf-notice">
          <p>{t.draftRestored}</p>
          <button type="button" className="msf-link" onClick={discard}>
            {t.discard}
          </button>
        </div>
      )}

      <StepIndicator steps={indicatorSteps} current={stepIndex} onSelect={goTo} disabled={busy} t={t} />

      <form ref={formRef} className="msf-form" onSubmit={submit} noValidate>
        <fieldset className="msf-fieldset" disabled={busy}>
          <div className="msf-head">
            <p className="msf-head__count">{t.stepOf(stepIndex + 1, steps.length)}</p>
            <h3 ref={headingRef} tabIndex={-1}>
              {t.steps[stepKey]}
            </h3>
            <p className="msf-head__intro">{t.intro[stepKey]}</p>
          </div>

          <StepComponent
            values={values}
            bind={bind}
            change={change}
            errorFor={errorFor}
            onEdit={editStep}
            t={t}
          />

          {attempted[stepKey] && errorCount > 0 && (
            <p className="msf-summary-error" role="alert">
              {t.fixErrors(errorCount)}
            </p>
          )}

          {status === 'error' && (
            <div className="msf-alert" role="alert">
              <p>
                <strong>{t.submitFailed}</strong> {submitError}
              </p>
              <button type="submit" className="btn btn--ghost">
                {t.retry}
              </button>
            </div>
          )}

          <div className="msf-nav">
            {stepIndex > 0 && (
              <button type="button" className="btn btn--ghost" onClick={() => goTo(stepIndex - 1)}>
                <span aria-hidden="true">←</span> {t.back}
              </button>
            )}
            <button type="submit" className="btn msf-nav__primary" aria-busy={busy}>
              {busy && <span className="msf-spinner" aria-hidden="true" />}
              {stepIndex < last ? t.next : busy ? t.submitting : t.submit}
              {stepIndex < last && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </fieldset>
      </form>

      <footer className="msf-foot">
        {savedAt && <span className="msf-foot__saved">{t.draftSaved(timeFormat.format(savedAt))}</span>}
        <span>{t.note}</span>
      </footer>
    </div>
  )
}

export default function App() {
  // Bumping the key remounts the wizard: the cleanest way to reset every piece of state.
  const [run, setRun] = useState(0)
  return (
    <AppFrame slug="multi-step-form">
      <SignupWizard key={run} onRestart={() => setRun((r) => r + 1)} />
    </AppFrame>
  )
}
