import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { api } from '../api.js'
import { useCart } from '../CartContext.jsx'
import { TEXT, useMoney } from '../text.js'
import { CartTotals } from './CartPage.jsx'

const EMPTY = { name: '', email: '', street: '', postcode: '', city: '', country: 'HU' }
const COUNTRIES = ['HU', 'AT', 'DE', 'SK', 'RO', 'OTHER']

// Validation is a pure function of the values: it runs on every render, nothing to keep in sync.
function validate(v) {
  const errors = {}
  if (v.name.trim().split(/\s+/).filter(Boolean).length < 2) errors.name = true
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errors.email = true
  if (v.street.trim().length < 4) errors.street = true
  if (!/^[\w\s-]{3,10}$/.test(v.postcode.trim())) errors.postcode = true
  if (v.city.trim().length < 2) errors.city = true
  return errors
}

export default function Checkout({ onPlaced }) {
  const lang = useLang()
  const t = useText(TEXT)
  const money = useMoney()
  const cart = useCart()
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'error'
  const [error, setError] = useState('')

  if (cart.items.length === 0) {
    return (
      <div className="ws-empty ws-empty--big">
        <h2 className="ws-title">{t.cartEmpty}</h2>
        <a className="btn" href="#/">
          {t.startShopping}
        </a>
      </div>
    )
  }

  const errors = validate(values)
  const show = (field) => touched[field] && errors[field]

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, street: true, postcode: true, city: true })
    if (Object.keys(errors).length) {
      // Move focus to the first invalid field so keyboard and screen reader users find it.
      e.currentTarget.querySelector('[aria-invalid="true"], [data-invalid="true"]')?.focus()
      return
    }

    setStatus('sending')
    setError('')
    try {
      // The order is a snapshot: names and prices are copied, so later catalogue changes
      // do not alter an order that has already been placed.
      const order = await api.create('orders', {
        customer: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])),
        items: cart.items.map(({ id, qty, product }) => ({ id, qty, price: product.price, name: product.name })),
        subtotal: cart.subtotal,
        shipping: cart.shipping,
        total: cart.total,
      })
      cart.clear()
      onPlaced(order)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  const field = (name, props = {}) => (
    <label className={`field ws-field--${name}`}>
      <span>{t.fields[name]}</span>
      <input
        className="input"
        value={values[name]}
        onChange={(e) => setValues({ ...values, [name]: e.target.value })}
        onBlur={() => setTouched({ ...touched, [name]: true })}
        aria-invalid={Boolean(show(name))}
        data-invalid={Boolean(errors[name])}
        aria-describedby={show(name) ? `ws-err-${name}` : undefined}
        disabled={status === 'sending'}
        {...props}
      />
      {show(name) && (
        <small id={`ws-err-${name}`} className="ws-error">
          {t.errors[name]}
        </small>
      )}
    </label>
  )

  return (
    <div className="ws-checkout">
      <a className="ws-back" href="#/cart">
        ← {t.nav.cart}
      </a>
      <h2 className="ws-title">{t.checkoutTitle}</h2>
      <div className="ws-checkout__layout">
        <form className="ws-form" onSubmit={submit} noValidate>
          <fieldset>
            <legend>{t.contact}</legend>
            {field('name', { autoComplete: 'name' })}
            {field('email', { type: 'email', autoComplete: 'email', inputMode: 'email' })}
          </fieldset>
          <fieldset>
            <legend>{t.delivery}</legend>
            {field('street', { autoComplete: 'street-address' })}
            <div className="ws-form__row">
              {field('postcode', { autoComplete: 'postal-code' })}
              {field('city', { autoComplete: 'address-level2' })}
            </div>
            <label className="field">
              <span>{t.fields.country}</span>
              <select
                className="input"
                value={values.country}
                onChange={(e) => setValues({ ...values, country: e.target.value })}
                disabled={status === 'sending'}
              >
                {COUNTRIES.map((code) => (
                  <option key={code} value={code}>
                    {t.countries[code]}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>

          <p className="ws-small ws-demo">{t.demoNote}</p>

          {status === 'error' && (
            <div className="ws-alert" role="alert">
              <strong>{t.orderFailed}</strong> {error} <span>{t.tryAgain}</span>
            </div>
          )}

          <button type="submit" className="btn ws-form__submit" disabled={status === 'sending'}>
            {status === 'sending' ? t.placing : t.placeOrder(money(cart.total))}
          </button>
        </form>

        <aside className="ws-summary" aria-label={t.summary}>
          <h3 className="ws-subtitle">{t.summary}</h3>
          <ul className="ws-summary__items">
            {cart.items.map(({ id, qty, product }) => (
              <li key={id}>
                <span>
                  {qty} × {product.name[lang]}
                </span>
                <span>{money(qty * product.price)}</span>
              </li>
            ))}
          </ul>
          <CartTotals />
        </aside>
      </div>
    </div>
  )
}
