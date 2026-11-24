import { useLang } from '@shared/i18n.js'
import { readingStats } from '../stats.js'

// The yearly reading goal and a few numbers, all worked out from the one list of books.
export default function ReadingStats({ books, goal, onGoalChange, t }) {
  const lang = useLang()
  const year = new Date().getFullYear()
  const stats = readingStats(books, year)
  // The field holds text and may be empty for a moment while you type: then the goal counts as 1.
  const target = Math.max(1, Math.round(Number(goal)) || 1)
  const percent = Math.min(100, Math.round((stats.readThisYear / target) * 100))
  const number = new Intl.NumberFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { maximumFractionDigits: 1 })

  return (
    <section className="bl-stats" aria-labelledby="bl-stats-title">
      <h3 id="bl-stats-title" className="bl-title bl-title--small">
        {t.statsTitle(year)}
      </h3>
      <div className="bl-goal">
        <label className="bl-goal__field">
          <span>{t.goalBefore}</span>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min="1"
            max="999"
            value={goal}
            onChange={(event) => onGoalChange(event.target.value)}
          />
          <span>{t.goalAfter}</span>
        </label>
        <progress className="bl-goal__bar" value={stats.readThisYear} max={target} aria-label={t.goalLabel} />
        <p className="bl-muted">{t.goalProgress(stats.readThisYear, target, percent)}</p>
      </div>
      <dl className="bl-stats__grid">
        <div className="bl-stat">
          <dt>{t.statShelves}</dt>
          <dd>{stats.total}</dd>
        </div>
        <div className="bl-stat">
          <dt>{t.statRead}</dt>
          <dd>{stats.read}</dd>
        </div>
        <div className="bl-stat">
          <dt>{t.statAverage}</dt>
          <dd>{stats.averageRating === null ? '–' : `${number.format(stats.averageRating)} ★`}</dd>
        </div>
      </dl>
    </section>
  )
}
