import { useEffect, useRef, useState } from 'react'
import { CATEGORIES } from './categories.js'
import { CURRENCIES, amountToInput, parseAmount } from './money.js'
import { todayISO } from './dates.js'

function validate(v) {
  const e = {}
  const amount = parseAmount(v.price)
  if (!v.name.trim()) e.name = 'name'
  if (Number.isNaN(amount)) e.price = 'price'
  else if (amount <= 0) e.price = 'zero'
  if (!v.startDate) e.start = 'start'
  return { errors: e, amount }
}

export default function SubscriptionForm({ initial, defaultCurrency, onSave, onCancel, t }) {
  const [values, setValues] = useState(() =>
    initial
      ? {
          name: initial.name,
          price: amountToInput(initial.amount, initial.currency),
          currency: initial.currency,
          cycle: initial.cycle,
          startDate: initial.startDate,
          category: initial.category,
        }
      : { name: '', price: '', currency: defaultCurrency, cycle: 'monthly', startDate: todayISO(), category: 'streaming' },
  )
  const [submitted, setSubmitted] = useState(false)
  const nameRef = useRef(null)
  const isEdit = Boolean(initial)

  // Opening the form in edit mode moves focus (and the scroll position) to it.
  useEffect(() => {
    if (isEdit) nameRef.current?.focus()
  }, [isEdit])

  const { errors, amount } = validate(values)
  const show = (field) => (submitted && errors[field] ? t.errors[errors[field]] : undefined)
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))
  const f = t.form

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    const first = ['name', 'price', 'start'].find((key) => errors[key])
    if (first) {
      e.currentTarget.elements[first === 'start' ? 'startDate' : first]?.focus()
      return
    }
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name: values.name.trim(),
      amount,
      currency: values.currency,
      cycle: values.cycle,
      startDate: values.startDate,
      category: values.category,
    })
    if (!initial) {
      // Keep currency, cycle and category: people often add several similar ones in a row.
      setValues((v) => ({ ...v, name: '', price: '', startDate: todayISO() }))
      setSubmitted(false)
    }
  }

  const err = (field) =>
    show(field) && (
      <small id={`sb-err-${field}`} className="sb-error">
        {show(field)}
      </small>
    )
  const aria = (field, hint) => ({
    'aria-invalid': Boolean(show(field)),
    'aria-describedby': [hint, show(field) && `sb-err-${field}`].filter(Boolean).join(' ') || undefined,
  })

  return (
    <form className="sb-card sb-form" onSubmit={submit} noValidate aria-labelledby="sb-form-title">
      <h3 id="sb-form-title">{initial ? f.editTitle(initial.name) : f.addTitle}</h3>

      <label className="field">
        <span>{f.name}</span>
        <input
          ref={nameRef}
          className="input"
          name="name"
          maxLength={40}
          placeholder={f.namePlaceholder}
          value={values.name}
          onChange={set('name')}
          {...aria('name')}
        />
        {err('name')}
      </label>

      <div className="sb-form__row">
        <label className="field">
          <span>{f.price}</span>
          <input className="input" name="price" inputMode="decimal" value={values.price} onChange={set('price')} {...aria('price')} />
          {err('price')}
        </label>
        <label className="field">
          <span>{f.currency}</span>
          <select className="input" name="currency" value={values.currency} onChange={set('currency')}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="sb-seg">
        <legend>{f.cycle}</legend>
        <div className="sb-seg__options">
          {['monthly', 'yearly'].map((cycle) => (
            <label key={cycle}>
              <input type="radio" name="cycle" value={cycle} checked={values.cycle === cycle} onChange={set('cycle')} />
              <span>{t.cycles[cycle]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="sb-form__row">
        <label className="field">
          <span>{f.start}</span>
          <input
            className="input"
            type="date"
            name="startDate"
            value={values.startDate}
            onChange={set('startDate')}
            {...aria('start', 'sb-start-hint')}
          />
          <small id="sb-start-hint">{f.startHint}</small>
          {err('start')}
        </label>
        <label className="field">
          <span>{f.category}</span>
          <select className="input" name="category" value={values.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {t.categories[c.key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sb-row">
        <button type="submit" className="btn">
          {initial ? f.save : f.add}
        </button>
        {initial && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {f.cancel}
          </button>
        )}
      </div>
    </form>
  )
}
