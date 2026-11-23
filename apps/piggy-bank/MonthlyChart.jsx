import { useState } from 'react'

// Hand-made SVG bar chart: no library, just scales (value → pixels) and a few shapes.
const W = 640
const H = 240
const M = { top: 14, right: 8, bottom: 30, left: 56 }
const PLOT_W = W - M.left - M.right
const PLOT_H = H - M.top - M.bottom
const BASE = M.top + PLOT_H

// A "nice" axis step (1, 2 or 5 × 10ⁿ cents) so the labels are round euro amounts.
function niceStep(max, ticks = 4) {
  const raw = max / ticks
  const power = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 5, 10].map((m) => m * power).find((step) => step >= raw)
}

// A bar with 4px rounded top corners, anchored flat on the baseline.
function barPath(x, y, w, h) {
  const r = Math.min(4, h, w / 2)
  return `M${x},${BASE} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${BASE} Z`
}

const MonthlyChart = ({ series, fmt, t }) => {
  const [active, setActive] = useState(null)
  const [asTable, setAsTable] = useState(false)

  const peak = Math.max(...series.flatMap((m) => [m.income, m.expense]))
  const top = Math.max(peak, 1000) // at least a €10 scale, also for an empty chart
  const step = niceStep(top)
  const max = step * Math.ceil(top / step)
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step)

  const y = (cents) => BASE - (cents / max) * PLOT_H
  const groupW = PLOT_W / series.length
  const barW = Math.min(26, groupW * 0.3)

  const totalIn = series.reduce((s, m) => s + m.income, 0)
  const totalOut = series.reduce((s, m) => s + m.expense, 0)
  const current = active === null ? null : series[active]
  const tooltipX = active === null ? 0 : ((M.left + groupW * (active + 0.5)) / W) * 100

  return (
    <section className="pb-card pb-chart" aria-labelledby="pb-chart-title">
      <div className="pb-chart__head">
        <h3 id="pb-chart-title">{t.chart.title}</h3>
        <ul className="pb-legend">
          <li>
            <span className="pb-legend__dot is-income" aria-hidden="true" /> {t.income}
          </li>
          <li>
            <span className="pb-legend__dot is-expense" aria-hidden="true" /> {t.expenses}
          </li>
        </ul>
        <button type="button" className="pb-link" aria-pressed={asTable} onClick={() => setAsTable((v) => !v)}>
          {asTable ? t.chart.showChart : t.chart.showTable}
        </button>
      </div>

      {asTable ? (
        <div className="pb-table-wrap">
          <table className="pb-table">
            <caption className="visually-hidden">{t.chart.title}</caption>
            <thead>
              <tr>
                <th scope="col">{t.chart.month}</th>
                <th scope="col">{t.income}</th>
                <th scope="col">{t.expenses}</th>
                <th scope="col">{t.chart.net}</th>
              </tr>
            </thead>
            <tbody>
              {series.map((m) => (
                <tr key={m.key}>
                  <th scope="row">{fmt.monthLong(m.key)}</th>
                  <td>{fmt.money(m.income)}</td>
                  <td>{fmt.money(m.expense)}</td>
                  <td>{fmt.money(m.income - m.expense)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="pb-chart__plot" onMouseLeave={() => setActive(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.chart.summary(fmt.money(totalIn), fmt.money(totalOut))}>
            {/* Recessive grid + y-axis labels */}
            {ticks.map((v) => (
              <g key={v} className="pb-chart__tick">
                <line x1={M.left} x2={W - M.right} y1={y(v)} y2={y(v)} />
                <text x={M.left - 10} y={y(v)} dy="0.32em" textAnchor="end">
                  {fmt.whole(v)}
                </text>
              </g>
            ))}

            {series.map((m, i) => {
              const x0 = M.left + groupW * i
              const center = x0 + groupW / 2
              return (
                <g key={m.key}>
                  {active === i && <rect className="pb-chart__band" x={x0 + 4} y={M.top} width={groupW - 8} height={PLOT_H} rx="8" />}
                  {m.income > 0 && (
                    <path className="pb-chart__bar is-income" d={barPath(center - barW - 1, y(m.income), barW, BASE - y(m.income))} />
                  )}
                  {m.expense > 0 && (
                    <path className="pb-chart__bar is-expense" d={barPath(center + 1, y(m.expense), barW, BASE - y(m.expense))} />
                  )}
                  <text className="pb-chart__month" x={center} y={H - 8} textAnchor="middle">
                    {fmt.monthShort(m.key)}
                  </text>
                  {/* Invisible hit area, wider than the bars, for hover and tap */}
                  <rect
                    x={x0}
                    y={M.top}
                    width={groupW}
                    height={PLOT_H + M.bottom}
                    fill="transparent"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                  />
                </g>
              )
            })}
            <line className="pb-chart__base" x1={M.left} x2={W - M.right} y1={BASE} y2={BASE} />
          </svg>

          {current && (
            <div
              className="pb-tooltip"
              style={{
                left: `${tooltipX}%`,
                transform: `translateX(${active === 0 ? '-20%' : active === series.length - 1 ? '-80%' : '-50%'})`,
              }}
              aria-hidden="true"
            >
              <strong>{fmt.monthLong(current.key)}</strong>
              <span>
                <i className="pb-legend__dot is-income" /> {t.income}: {fmt.money(current.income)}
              </span>
              <span>
                <i className="pb-legend__dot is-expense" /> {t.expenses}: {fmt.money(current.expense)}
              </span>
              <span className="pb-tooltip__net">
                {t.chart.net}: {fmt.money(current.income - current.expense)}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default MonthlyChart
