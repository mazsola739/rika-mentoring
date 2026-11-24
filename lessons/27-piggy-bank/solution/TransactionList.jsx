import { useEffect, useState } from 'react'
import { ALL_CATEGORIES, CATEGORIES, iconOf } from './categories.js'
import { monthKeyOf, todayISO } from './money.js'
import { byNewest, signedAmount, totalsOf } from './walletReducer.js'
import { downloadCsv } from './csv.js'
import { tx } from './text.js'

const TransactionList = ({ transactions, dispatch, fmt, lang, t }) => {
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [month, setMonth] = useState('all')
  const [lastDeleted, setLastDeleted] = useState(null)

  // The undo offer disappears after a few seconds; the cleanup cancels the old timer.
  useEffect(() => {
    if (!lastDeleted) return
    const timer = setTimeout(() => setLastDeleted(null), 8000)
    return () => clearTimeout(timer)
  }, [lastDeleted])

  const months = [...new Set(transactions.map((x) => monthKeyOf(x.date)))].sort().reverse()
  const categoryOptions = type === 'all' ? ALL_CATEGORIES : CATEGORIES[type]

  // Filtering is derived data: no copy of the list is ever kept in state.
  const visible = transactions
    .filter((x) => type === 'all' || x.type === type)
    .filter((x) => category === 'all' || x.category === category)
    .filter((x) => month === 'all' || monthKeyOf(x.date) === month)
    .sort(byNewest)
  const totals = totalsOf(visible)
  const filtered = type !== 'all' || category !== 'all' || month !== 'all'

  const changeType = (next) => {
    setType(next)
    if (next !== 'all' && !CATEGORIES[next].some((c) => c.key === category)) setCategory('all')
  }

  const clearFilters = () => {
    setType('all')
    setCategory('all')
    setMonth('all')
  }

  const remove = (item) => {
    dispatch({ type: 'removed', id: item.id })
    setLastDeleted(item)
  }

  const undo = () => {
    dispatch({ type: 'added', transaction: lastDeleted })
    setLastDeleted(null)
  }

  const exportCsv = () => {
    const header = [t.csv.date, t.csv.type, t.csv.category, t.csv.note, t.csv.amount]
    const rows = visible.map((x) => [
      x.date,
      t.types[x.type],
      t.categories[x.category],
      tx(x.note, lang),
      (signedAmount(x) / 100).toFixed(2),
    ])
    downloadCsv(`piggy-bank-${todayISO()}.csv`, [header, ...rows])
  }

  const l = t.list

  return (
    <section className="pb-card pb-list" aria-labelledby="pb-list-title">
      <div className="pb-list__head">
        <h3 id="pb-list-title">{l.title}</h3>
        <button type="button" className="btn btn--ghost" onClick={exportCsv} disabled={!visible.length} title={l.exportHint}>
          <span aria-hidden="true">⤓</span> {l.export}
        </button>
      </div>

      <div className="pb-filters" role="group" aria-label={l.filters}>
        <div className="pb-chips" role="group" aria-label={l.type}>
          {['all', 'deposit', 'withdrawal'].map((key) => (
            <button key={key} type="button" className="chip" aria-pressed={type === key} onClick={() => changeType(key)}>
              {t.typesPlural[key]}
            </button>
          ))}
        </div>
        <div className="pb-filters__selects">
          <label className="field">
            <span>{l.category}</span>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">{l.allCategories}</option>
              {categoryOptions.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.icon} {t.categories[c.key]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{l.month}</span>
            <select className="input" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="all">{l.allMonths}</option>
              {months.map((key) => (
                <option key={key} value={key}>
                  {fmt.monthLong(key)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="pb-list__summary" aria-live="polite">
        {l.summary(visible.length, fmt.money(totals.income), fmt.money(totals.expense))}
      </p>

      {lastDeleted && (
        <div className="pb-undo" role="status">
          <span>{l.deleted}</span>
          <button type="button" className="pb-link" onClick={undo}>
            {l.undo}
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="pb-empty">
          <p>{transactions.length ? l.empty : l.emptyAll}</p>
          {filtered && (
            <button type="button" className="btn btn--ghost" onClick={clearFilters}>
              {l.clearFilters}
            </button>
          )}
        </div>
      ) : (
        <ul className="pb-items">
          {visible.map((x) => {
            const label = t.categories[x.category]
            const note = tx(x.note, lang)
            const amount = fmt.signed(x.amount, x.type)
            return (
              <li key={x.id} className="pb-item">
                <span className={`pb-item__icon is-${x.type}`} aria-hidden="true">
                  {iconOf(x.category)}
                </span>
                <span className="pb-item__main">
                  <span className="pb-item__title">{note || label}</span>
                  <span className="pb-item__meta">
                    {note ? `${label} · ` : ''}
                    <time dateTime={x.date}>{fmt.day(x.date)}</time>
                  </span>
                </span>
                <span className={`pb-item__amount is-${x.type}`}>{amount}</span>
                <button
                  type="button"
                  className="pb-icon-btn"
                  aria-label={l.delete(`${note || label}, ${amount}`)}
                  onClick={() => remove(x)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default TransactionList
