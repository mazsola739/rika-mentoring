import { Stars } from './StarRating.jsx'

// Average + distribution. Each bar is a button that filters the list to that star count.
export default function RatingSummary({ stats, filter, onFilter, fmt, t }) {
  const { average, count, counts } = stats

  return (
    <section className="rr-summary" aria-labelledby="rr-summary-title">
      <h4 id="rr-summary-title" className="visually-hidden">
        {t.summaryTitle}
      </h4>
      <div className="rr-summary__score">
        <strong>{count ? fmt.rating(average) : '–'}</strong>
        <Stars value={average} size={20} label={t.starsLabel(fmt.rating(average))} />
        <span>{t.basedOn(count)}</span>
      </div>

      <ul className="rr-bars">
        {[5, 4, 3, 2, 1].map((n) => {
          const pct = count ? Math.round((counts[n] / count) * 100) : 0
          return (
            <li key={n}>
              <button
                type="button"
                className="rr-bar"
                aria-pressed={filter === n}
                aria-label={t.barLabel(n, counts[n], pct)}
                disabled={counts[n] === 0}
                onClick={() => onFilter(filter === n ? 0 : n)}
              >
                <span className="rr-bar__label" aria-hidden="true">
                  {n}★
                </span>
                <span className="rr-bar__track" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </span>
                <span className="rr-bar__count" aria-hidden="true">
                  {counts[n]}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
