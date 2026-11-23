import { useLang, useText } from '@shared/i18n.js'
import { formatDate, interviewDays, localeOf, relativeDays } from './jobs.js'
import { TEXT } from './text.js'

// Derived data: everything here is calculated from `jobs` during render, nothing is stored twice.
export function computeStats(jobs) {
  const count = (status) => jobs.filter((job) => job.status === status).length
  const replied = jobs.filter((job) => job.status !== 'applied').length
  const upcoming = jobs
    .map((job) => ({ job, days: interviewDays(job) }))
    .filter(({ days }) => days !== null && days >= 0)
    .sort((a, b) => a.days - b.days)

  return {
    total: jobs.length,
    replied,
    responseRate: jobs.length ? replied / jobs.length : 0,
    interviews: count('interview'),
    offers: count('offer'),
    next: upcoming[0] ?? null,
  }
}

export default function Stats({ jobs }) {
  const lang = useLang()
  const t = useText(TEXT)
  const stats = computeStats(jobs)
  const percent = new Intl.NumberFormat(localeOf(lang), { style: 'percent', maximumFractionDigits: 0 })

  return (
    <section className="jt-stats" aria-label={t.stats}>
      <dl className="jt-stats__tiles">
        <div className="jt-tile">
          <dt>{t.total}</dt>
          <dd>{stats.total}</dd>
        </div>
        <div className="jt-tile">
          <dt>{t.responseRate}</dt>
          <dd>{percent.format(stats.responseRate)}</dd>
          <small>{t.replied(stats.replied, stats.total)}</small>
        </div>
        <div className="jt-tile">
          <dt>{t.interviews}</dt>
          <dd>{stats.interviews}</dd>
        </div>
        <div className="jt-tile">
          <dt>{t.offers}</dt>
          <dd>{stats.offers}</dd>
        </div>
      </dl>

      <p className={`jt-next${stats.next && stats.next.days <= 2 ? ' is-soon' : ''}`}>
        <span className="jt-next__label">{t.nextInterview}</span>
        {stats.next ? (
          <span>
            <strong>{stats.next.job.company}</strong> · {stats.next.job.role} —{' '}
            {relativeDays(stats.next.days, lang)} ({formatDate(stats.next.job.interview, lang)})
          </span>
        ) : (
          <span>{t.noUpcoming}</span>
        )}
      </p>
    </section>
  )
}
