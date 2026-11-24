import { useState } from 'react'
import { MOODS, moodOf } from './moods.js'
import { dayOfMonth, daysInMonth } from './dates.js'
import { tx } from './text.js'

// Hand-made SVG line chart: day of the month on x, mood (1–5) on y.
const W = 640
const H = 220
const M = { top: 16, right: 56, bottom: 28, left: 40 }
const PLOT_W = W - M.left - M.right
const PLOT_H = H - M.top - M.bottom

const MoodChart = ({ view, entries, colors, fmt, lang, t, onSelect }) => {
  const [active, setActive] = useState(null)
  const total = daysInMonth(view)
  const x = (day) => M.left + ((day - 1) / (total - 1)) * PLOT_W
  const y = (mood) => M.top + ((5 - mood) / 4) * PLOT_H

  const points = []
  for (let day = 1; day <= total; day++) {
    const iso = dayOfMonth(view, day)
    if (entries[iso]) points.push({ day, iso, ...entries[iso] })
  }
  const average = points.length ? points.reduce((sum, p) => sum + p.mood, 0) / points.length : 0
  const ticks = [1, 5, 10, 15, 20, 25, total]
  const current = points.find((p) => p.iso === active)

  if (!points.length) {
    return (
      <section className="md-card md-chart" aria-labelledby="md-chart-title">
        <h3 id="md-chart-title">{t.chart.title}</h3>
        <p className="md-muted">{t.chart.empty}</p>
      </section>
    )
  }

  return (
    <section className="md-card md-chart" aria-labelledby="md-chart-title">
      <h3 id="md-chart-title">{t.chart.title}</h3>
      <div className="md-chart__plot" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.chart.summary(fmt.month(view), points.length, fmt.decimal(average))}>
          {/* Recessive grid with an emoji for every mood level */}
          {MOODS.map((m) => (
            <g key={m.value} className="md-chart__level">
              <line x1={M.left} x2={W - M.right} y1={y(m.value)} y2={y(m.value)} />
              <text x={M.left - 14} y={y(m.value)} dy="0.35em" textAnchor="middle">
                {m.emoji}
              </text>
            </g>
          ))}
          {ticks.map((day) => (
            <text key={day} className="md-chart__day" x={x(day)} y={H - 6} textAnchor="middle">
              {day}
            </text>
          ))}

          {/* Monthly average as a dashed reference line, labelled on the right */}
          <line className="md-chart__avg" x1={M.left} x2={W - M.right} y1={y(average)} y2={y(average)} />
          <text className="md-chart__avg-label" x={W - M.right + 6} y={y(average)} dy="0.35em">
            {t.chart.average(fmt.decimal(average))}
          </text>

          {/* Solid line between neighbouring days, dashed when days are missing */}
          {points.slice(1).map((p, i) => {
            const prev = points[i]
            return (
              <line
                key={p.iso}
                className={`md-chart__line${p.day - prev.day > 1 ? ' is-gap' : ''}`}
                x1={x(prev.day)}
                y1={y(prev.mood)}
                x2={x(p.day)}
                y2={y(p.mood)}
              />
            )
          })}

          {points.map((p) => (
            <g key={p.iso}>
              <circle className="md-chart__dot" cx={x(p.day)} cy={y(p.mood)} r={active === p.iso ? 7 : 5} fill={colors[p.mood]} />
              {/* Bigger invisible hit area for hover and tap */}
              <circle
                cx={x(p.day)}
                cy={y(p.mood)}
                r="13"
                fill="transparent"
                className="md-chart__hit"
                onMouseEnter={() => setActive(p.iso)}
                onClick={() => onSelect(p.iso)}
              />
            </g>
          ))}
        </svg>

        {current && (
          <div
            className="md-tooltip"
            style={{
              left: `${(x(current.day) / W) * 100}%`,
              top: `${(y(current.mood) / H) * 100}%`,
              transform: `translate(${current.day < total / 3 ? '-10%' : current.day > (total * 2) / 3 ? '-90%' : '-50%'}, calc(-100% - 14px))`,
            }}
            aria-hidden="true"
          >
            <strong>{fmt.longDate(current.iso)}</strong>
            <span>
              {moodOf(current.mood).emoji} {t.moods[current.mood - 1]}
            </span>
            {tx(current.note, lang) && <em>{tx(current.note, lang)}</em>}
          </div>
        )}
      </div>
      <p className="md-muted md-chart__note">{t.chart.gapNote}</p>
    </section>
  )
}

export default MoodChart
