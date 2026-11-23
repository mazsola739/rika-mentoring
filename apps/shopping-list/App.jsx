import { useEffect, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { CATEGORIES, CATEGORY_KEYS, UNITS, groupByCategory, label, normalize, seedItems } from './items.js'
import './app.css'

const TEXT = {
  en: {
    item: 'Item',
    placeholder: 'e.g. Tomatoes',
    quantity: 'Quantity',
    unit: 'Unit',
    category: 'Category',
    add: 'Add to list',
    added: (name) => `Added: ${name}`,
    merged: (name) => `${name} was already on the list, so the quantity went up.`,
    progress: (done, total) => `${done} of ${total} in the basket`,
    basket: 'In the basket',
    clearBasket: 'Remove checked items',
    empty: 'Your list is empty. Add what you need above.',
    allDone: 'Everything is in the basket. Happy cooking!',
    check: (name) => `In the basket: ${name}`,
    less: (name) => `Less ${name}`,
    more: (name) => `More ${name}`,
    remove: (name) => `Remove ${name}`,
  },
  hu: {
    item: 'Tétel',
    placeholder: 'pl. Paradicsom',
    quantity: 'Mennyiség',
    unit: 'Egység',
    category: 'Kategória',
    add: 'Hozzáadás a listához',
    added: (name) => `Hozzáadva: ${name}`,
    merged: (name) => `${name}: már szerepelt a listán, ezért nőtt a mennyiség.`,
    progress: (done, total) => `${total} tételből ${done} a kosárban`,
    basket: 'A kosárban',
    clearBasket: 'Kipipáltak törlése',
    empty: 'Üres a lista. Írd fel fent, amire szükséged van.',
    allDone: 'Minden a kosárban van. Jó főzést!',
    check: (name) => `A kosárban: ${name}`,
    less: (name) => `Kevesebb: ${name}`,
    more: (name) => `Több: ${name}`,
    remove: (name) => `${name} törlése`,
  },
}

const round = (n) => Math.round(n * 100) / 100

// Very light palette colors would vanish as dots on white, so they are skipped.
const isVeryLight = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 225
}

function AddItemForm({ onAdd, suggestions, t, lang }) {
  const [name, setName] = useState('')
  const [qty, setQty] = useState('1')
  const [unit, setUnit] = useState('pcs')
  const [category, setCategory] = useState('produce')
  const amount = Number(qty.replace(',', '.'))
  const valid = name.trim() && amount > 0

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    onAdd({ name: name.trim(), qty: round(amount), unit, category })
    setName('')
    setQty('1')
  }

  return (
    <form className="sl-form" onSubmit={submit}>
      <label className="field sl-form__name">
        <span>{t.item}</span>
        <input
          className="input"
          value={name}
          placeholder={t.placeholder}
          onChange={(e) => setName(e.target.value)}
          list="sl-suggestions"
          autoComplete="off"
          maxLength={60}
        />
        <datalist id="sl-suggestions">
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>
      <label className="field">
        <span>{t.quantity}</span>
        <input className="input" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
      </label>
      <label className="field">
        <span>{t.unit}</span>
        <select className="input" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {Object.entries(UNITS).map(([key, u]) => (
            <option key={key} value={key}>
              {u[lang]}
            </option>
          ))}
        </select>
      </label>
      <label className="field sl-form__cat">
        <span>{t.category}</span>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_KEYS.map((key) => (
            <option key={key} value={key}>
              {CATEGORIES[key][lang]}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn sl-form__btn" disabled={!valid}>
        {t.add}
      </button>
    </form>
  )
}

function ItemRow({ item, onToggle, onQty, onRemove, t, lang, format }) {
  const name = label(item.name, lang)
  const unit = UNITS[item.unit] ?? UNITS.pcs
  return (
    <li className={`sl-item${item.done ? ' is-done' : ''}`}>
      <label className="sl-item__check">
        <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} aria-label={t.check(name)} />
        <span className="sl-item__name">{name}</span>
      </label>
      <div className="sl-qty">
        <button
          type="button"
          onClick={() => onQty(item.id, -unit.step)}
          disabled={item.qty <= unit.step}
          aria-label={t.less(name)}
        >
          −
        </button>
        <span className="sl-qty__value">
          {format(item.qty)} {unit[lang]}
        </span>
        <button type="button" onClick={() => onQty(item.id, unit.step)} aria-label={t.more(name)}>
          +
        </button>
      </div>
      <button type="button" className="sl-remove" onClick={() => onRemove(item.id)} aria-label={t.remove(name)}>
        ×
      </button>
    </li>
  )
}

function ShoppingList() {
  const lang = useLang()
  const t = useText(TEXT)
  const { palette } = useLesson()
  const [items, setItems] = useLocalStorage('rika:shopping-list:items', seedItems)
  const [history, setHistory] = useLocalStorage('rika:shopping-list:history', [])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 3500)
    return () => clearTimeout(timer)
  }, [message])

  const number = new Intl.NumberFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { maximumFractionDigits: 2 })
  const active = items.filter((i) => !i.done)
  const done = items.filter((i) => i.done)
  const groups = groupByCategory(active, lang)
  const dotColors = palette.colors.filter((c) => !isVeryLight(c))
  const suggestions = [...new Set([...history, ...items.map((i) => label(i.name, lang))])]

  const add = (values) => {
    const key = normalize(values.name)
    const twin = items.find((i) => !i.done && i.unit === values.unit && normalize(label(i.name, lang)) === key)
    if (twin) {
      setItems((list) => list.map((i) => (i.id === twin.id ? { ...i, qty: round(i.qty + values.qty) } : i)))
      setMessage(t.merged(label(twin.name, lang)))
    } else {
      setItems((list) => [...list, { id: crypto.randomUUID(), done: false, addedAt: Date.now(), ...values }])
      setMessage(t.added(values.name))
    }
    setHistory((h) => [values.name, ...h.filter((n) => normalize(n) !== key)].slice(0, 30))
  }

  const toggle = (id) => setItems((list) => list.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  const changeQty = (id, delta) =>
    setItems((list) => list.map((i) => (i.id === id ? { ...i, qty: Math.max(round(i.qty + delta), 0.01) } : i)))
  const remove = (id) => setItems((list) => list.filter((i) => i.id !== id))
  const clearBasket = () => setItems((list) => list.filter((i) => !i.done))

  const rowProps = { onToggle: toggle, onQty: changeQty, onRemove: remove, t, lang, format: (n) => number.format(n) }
  const percent = items.length ? Math.round((done.length / items.length) * 100) : 0

  return (
    <div className="sl">
      <AddItemForm onAdd={add} suggestions={suggestions} t={t} lang={lang} />
      <p className="sl-message" role="status" aria-live="polite">
        {message}
      </p>

      {items.length > 0 && (
        <div className="sl-progress">
          <span>{t.progress(done.length, items.length)}</span>
          <span className="sl-progress__track" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </span>
        </div>
      )}

      {items.length === 0 && <p className="sl-empty">{t.empty}</p>}
      {items.length > 0 && active.length === 0 && <p className="sl-empty">{t.allDone}</p>}

      {groups.map((group) => (
        <section key={group.key} className="sl-group" aria-labelledby={`sl-${group.key}`}>
          <h3 id={`sl-${group.key}`}>
            <span className="sl-dot" style={{ background: dotColors[CATEGORY_KEYS.indexOf(group.key) % dotColors.length] }} />
            {CATEGORIES[group.key][lang]}
            <span className="sl-group__count">{group.items.length}</span>
          </h3>
          <ul className="sl-list">
            {group.items.map((item) => (
              <ItemRow key={item.id} item={item} {...rowProps} />
            ))}
          </ul>
        </section>
      ))}

      {/* Checked items sink to the bottom: they are simply rendered in a separate, last section. */}
      {done.length > 0 && (
        <section className="sl-group sl-group--done" aria-labelledby="sl-done">
          <h3 id="sl-done">
            {t.basket}
            <span className="sl-group__count">{done.length}</span>
          </h3>
          <ul className="sl-list">
            {done.map((item) => (
              <ItemRow key={item.id} item={item} {...rowProps} />
            ))}
          </ul>
          <button type="button" className="btn btn--ghost sl-clear" onClick={clearBasket}>
            {t.clearBasket}
          </button>
        </section>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="shopping-list">
      <ShoppingList />
    </AppFrame>
  )
}
