import { useState } from 'react'
import { CATEGORIES } from './categories.js'
import { parseAmount, todayISO } from './money.js'

const MAX_CENTS = 10_000_000

function validate(type, values, balance) {
  const errors = {}
  const cents = parseAmount(values.amount)
  if (Number.isNaN(cents)) errors.amount = 'amount'
  else if (cents <= 0) errors.amount = 'zero'
  else if (cents > MAX_CENTS) errors.amount = 'big'
  else if (type === 'withdrawal' && cents > balance) errors.amount = 'tooMuch'
  if (!values.date || values.date > todayISO()) errors.date = 'date'
  if (values.note.length > 80) errors.note = 'note'
  return { errors, cents }
}

const TransactionForm = ({ balance, onAdd, fmt, t }) => {
  const [type, setType] = useState('deposit')
  const [values, setValues] = useState(() => ({
    amount: '',
    category: CATEGORIES.deposit[0].key,
    date: todayISO(),
    note: '',
  }))
  const [submitted, setSubmitted] = useState(false)
  const [lastAdded, setLastAdded] = useState(null)

  const { errors, cents } = validate(type, values, balance)
  const show = (field) => (submitted && errors[field] ? t.errors[errors[field]] : undefined)
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const changeType = (next) => {
    setType(next)
    // Categories differ per type, so pick the first one of the new type.
    setValues((v) => ({ ...v, category: CATEGORIES[next][0].key }))
  }

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    const first = ['amount', 'date', 'note'].find((f) => errors[f])
    if (first) {
      e.currentTarget.elements[first]?.focus()
      return
    }
    // Everything random or time-based happens here, outside the pure reducer.
    const transaction = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      type,
      amount: cents,
      category: values.category,
      date: values.date,
      note: values.note.trim(),
    }
    onAdd(transaction)
    setLastAdded(transaction)
    setValues((v) => ({ ...v, amount: '', note: '' }))
    setSubmitted(false)
  }

  const f = t.form
  const describe = (field) => (show(field) ? `pb-err-${field}` : undefined)

  return (
    <form className="pb-card pb-form" onSubmit={submit} noValidate>
      <h3>{f.title}</h3>

      <fieldset className="pb-seg">
        <legend className="visually-hidden">{f.type}</legend>
        {Object.keys(CATEGORIES).map((key) => (
          <label key={key} className={`pb-seg__option is-${key}`}>
            <input type="radio" name="type" value={key} checked={type === key} onChange={() => changeType(key)} />
            <span>
              <span aria-hidden="true">{key === 'deposit' ? '+' : '−'}</span> {t.types[key]}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="pb-form__row">
        <label className="field">
          <span>{f.amount}</span>
          <span className="pb-amount">
            <span aria-hidden="true">€</span>
            <input
              className="input"
              name="amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder={f.amountPlaceholder}
              value={values.amount}
              onChange={set('amount')}
              aria-invalid={Boolean(show('amount'))}
              aria-describedby={describe('amount')}
            />
          </span>
          {show('amount') && (
            <small id="pb-err-amount" className="pb-error">
              {show('amount')}
            </small>
          )}
        </label>

        <label className="field">
          <span>{f.date}</span>
          <input
            className="input"
            type="date"
            name="date"
            max={todayISO()}
            value={values.date}
            onChange={set('date')}
            aria-invalid={Boolean(show('date'))}
            aria-describedby={describe('date')}
          />
          {show('date') && (
            <small id="pb-err-date" className="pb-error">
              {show('date')}
            </small>
          )}
        </label>
      </div>

      <label className="field">
        <span>{f.category}</span>
        <select className="input" name="category" value={values.category} onChange={set('category')}>
          {CATEGORIES[type].map((c) => (
            <option key={c.key} value={c.key}>
              {c.icon} {t.categories[c.key]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>
          {f.note} <small>({f.optional})</small>
        </span>
        <input
          className="input"
          name="note"
          maxLength={120}
          placeholder={f.notePlaceholder}
          value={values.note}
          onChange={set('note')}
          aria-invalid={Boolean(show('note'))}
          aria-describedby={describe('note')}
        />
        {show('note') && (
          <small id="pb-err-note" className="pb-error">
            {show('note')}
          </small>
        )}
      </label>

      <button type="submit" className="btn pb-form__submit">
        {f.add[type]}
      </button>

      <p className="pb-form__status" role="status">
        {lastAdded && f.added(`${fmt.signed(lastAdded.amount, lastAdded.type)} · ${t.categories[lastAdded.category]}`)}
      </p>
    </form>
  )
}

export default TransactionForm
