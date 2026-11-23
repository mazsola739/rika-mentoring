import { CATEGORIES } from './categories.js'
import { CURRENCIES, convert, costPer } from './money.js'

// Summary card: totals are derived from the list on every render with reduce().
export default function Totals({ subs, view, onView, currency, onCurrency, money, t }) {
  const total = subs.reduce((sum, s) => sum + convert(costPer(view, s), s.currency, currency), 0)
  const mixed = subs.some((s) => s.currency !== currency)

  const byCurrency = subs.reduce((acc, s) => {
    acc[s.currency] = (acc[s.currency] ?? 0) + costPer(view, s)
    return acc
  }, {})

  const byCategory = CATEGORIES.map((c) => ({
    ...c,
    amount: subs
      .filter((s) => s.category === c.key)
      .reduce((sum, s) => sum + convert(costPer(view, s), s.currency, currency), 0),
  })).filter((c) => c.amount > 0)

  return (
    <section className="sb-totals" aria-labelledby="sb-total-label">
      <div className="sb-totals__head solid">
        <div className="sb-totals__top">
          <fieldset className="sb-toggle">
            <legend className="visually-hidden">{t.view}</legend>
            {['monthly', 'yearly'].map((key) => (
              <label key={key}>
                <input type="radio" name="sb-view" value={key} checked={view === key} onChange={() => onView(key)} />
                <span>{t.views[key]}</span>
              </label>
            ))}
          </fieldset>
          <label className="sb-totals__currency">
            <span>{t.totalIn}</span>
            <select value={currency} onChange={(e) => onCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p id="sb-total-label" className="sb-totals__label">
          {t.total} · {t.count(subs.length)}
        </p>
        <p className="sb-totals__value" aria-live="polite">
          {mixed && <span aria-hidden="true">≈ </span>}
          {money(total, currency)} <small>{t.perView[view]}</small>
        </p>
        {mixed && <p className="sb-totals__note">{t.approx}</p>}

        {Object.keys(byCurrency).length > 1 && (
          <p className="sb-totals__split">
            <span className="visually-hidden">{t.byCurrency}: </span>
            {CURRENCIES.filter((c) => byCurrency[c]).map((c, i) => (
              <span key={c}>
                {i > 0 && ' + '}
                {money(byCurrency[c], c)}
              </span>
            ))}
          </p>
        )}
      </div>

      {byCategory.length > 0 && (
        <div className="sb-breakdown">
          <h3 className="sb-breakdown__title">{t.byCategory}</h3>
          {/* Stacked bar: each segment grows in proportion to its amount. */}
          <div className="sb-breakdown__bar" aria-hidden="true">
            {byCategory.map((c) => (
              <span key={c.key} style={{ flexGrow: c.amount, background: c.color }} />
            ))}
          </div>
          <ul className="sb-breakdown__legend">
            {byCategory.map((c) => (
              <li key={c.key}>
                <span className="sb-dot" style={{ background: c.color }} aria-hidden="true" />
                {t.categories[c.key]} <strong>{money(c.amount, currency)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
