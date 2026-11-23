import { useState } from 'react'
import { centsToInput, parseAmount } from './money.js'
import { tx } from './text.js'

function GoalForm({ goal, lang, t, onSave, onCancel }) {
  const [name, setName] = useState(() => tx(goal?.name, lang))
  const [target, setTarget] = useState(() => (goal ? centsToInput(goal.target) : ''))
  const [submitted, setSubmitted] = useState(false)

  const cents = parseAmount(target)
  const errors = {
    name: name.trim() ? undefined : t.goal.errors.name,
    target: Number.isNaN(cents) || cents <= 0 ? t.goal.errors.target : undefined,
  }

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (errors.name || errors.target) {
      e.currentTarget.elements[errors.name ? 'goalName' : 'goalTarget']?.focus()
      return
    }
    onSave({ name: name.trim(), target: cents })
  }

  return (
    <form className="pb-goal__form" onSubmit={submit} noValidate>
      <label className="field">
        <span>{t.goal.name}</span>
        <input
          className="input"
          name="goalName"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={submitted && Boolean(errors.name)}
        />
        {submitted && errors.name && <small className="pb-error">{errors.name}</small>}
      </label>
      <label className="field">
        <span>{t.goal.target}</span>
        <span className="pb-amount">
          <span aria-hidden="true">€</span>
          <input
            className="input"
            name="goalTarget"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            aria-invalid={submitted && Boolean(errors.target)}
          />
        </span>
        {submitted && errors.target && <small className="pb-error">{errors.target}</small>}
      </label>
      <div className="pb-row">
        <button type="submit" className="btn">
          {t.goal.save}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          {t.goal.cancel}
        </button>
      </div>
    </form>
  )
}

export default function GoalCard({ goal, balance, dispatch, fmt, lang, t }) {
  const [editing, setEditing] = useState(false)

  let content
  if (editing) {
    content = (
      <GoalForm
        goal={goal}
        lang={lang}
        t={t}
        onCancel={() => setEditing(false)}
        onSave={(next) => {
          dispatch({ type: 'goalSet', goal: next })
          setEditing(false)
        }}
      />
    )
  } else if (!goal) {
    content = (
      <>
        <p className="pb-muted">{t.goal.none}</p>
        <button type="button" className="btn btn--ghost" onClick={() => setEditing(true)}>
          {t.goal.set}
        </button>
      </>
    )
  } else {
    const saved = Math.max(0, balance)
    const ratio = Math.min(1, saved / goal.target)
    const reached = saved >= goal.target
    const progressText = t.goal.progress(fmt.money(saved), fmt.money(goal.target))
    content = (
      <>
        <p className="pb-goal__name">{tx(goal.name, lang)}</p>
        <div
          className="pb-progress"
          role="progressbar"
          aria-label={t.goal.title}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuetext={`${fmt.percent(ratio)}, ${progressText}`}
        >
          <span style={{ width: `${ratio * 100}%` }} />
        </div>
        <p className="pb-goal__numbers">
          <strong>{fmt.percent(ratio)}</strong>
          <span>{progressText}</span>
        </p>
        <p className={reached ? 'pb-goal__reached' : 'pb-muted'} aria-live="polite">
          {reached ? t.goal.reached : t.goal.toGo(fmt.money(goal.target - saved))}
        </p>
        <div className="pb-row">
          <button type="button" className="btn btn--ghost" onClick={() => setEditing(true)}>
            {t.goal.edit}
          </button>
          <button type="button" className="pb-link" onClick={() => dispatch({ type: 'goalCleared' })}>
            {t.goal.remove}
          </button>
        </div>
      </>
    )
  }

  return (
    <section className="pb-card pb-goal" aria-labelledby="pb-goal-title">
      <h3 id="pb-goal-title">{t.goal.title}</h3>
      {content}
    </section>
  )
}
