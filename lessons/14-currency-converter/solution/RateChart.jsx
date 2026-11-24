import { useId, useMemo, useState } from 'react'
import { errorKind, useFetch } from './useFetch.js'
import { API } from './rates.js'

const W = 600
const H = 200
const PAD = { top: 14, right: 10, bottom: 14, left: 10 }

const isoDay = (date) => date.toISOString().slice(0, 10)

function daysAgo(n) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - n)
  return isoDay(date)
}

// The same useFetch hook as the converter: a new pair means a new url, and the hook does the rest.
export default function RateChart({ from, to, locale, t, formatDate }) {
  const start = daysAgo(30)
  const url = from === to ? null : `${API}/${start}..?from=${from}&to=${to}`
  const { status, data, error, retry } = useFetch(url)
  const [active, setActive] = useState(null)
  // useId gives a unique id per chart; characters outside [A-Za-z0-9_-] are removed so it is safe inside url(#…).
  const gradientId = `cc${useId().replace(/[^\w-]/g, '')}`

  const points = useMemo(
    () =>
      data
        ? Object.entries(data.rates)
            .map(([date, rates]) => ({ date, value: rates[to] }))
            .filter((p) => typeof p.value === 'number')
        : [],
    [data, to],
  )

  const number = new Intl.NumberFormat(locale, { maximumSignificantDigits: 5 })
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2, signDisplay: 'exceptZero' })

  let body
  if (from === to) {
    body = <p className="cc-chart__note">{t.trendSame}</p>
  } else if (status === 'loading') {
    body = (
      <div className="cc-chart__skeleton" role="status">
        <span className="visually-hidden">{t.trendLoading}</span>
      </div>
    )
  } else if (status === 'error') {
    body = (
      <div className="cc-chart__note cc-chart__note--error" role="alert">
        <span>
          {t.errors[errorKind(error)]} {t.trendError}
        </span>
        <button type="button" className="btn btn--ghost" onClick={retry}>
          {t.retry}
        </button>
      </div>
    )
  } else if (points.length < 2) {
    body = <p className="cc-chart__note">{t.trendEmpty}</p>
  } else {
    const values = points.map((p) => p.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || max * 0.01 || 1
    const x = (i) => PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right)
    const y = (v) => PAD.top + (1 - (v - min) / span) * (H - PAD.top - PAD.bottom)
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
    const area = `${line} L${x(points.length - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`

    const first = points[0]
    const last = points[points.length - 1]
    const change = (last.value - first.value) / first.value
    const shown = points[active] ?? last
    const shownIndex = points[active] ? active : points.length - 1

    // Pointer position → nearest data point. Works for mouse, pen and touch.
    const pick = (event) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const px = ((event.clientX - rect.left) / rect.width) * W
      const i = Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * (points.length - 1))
      setActive(Math.min(points.length - 1, Math.max(0, i)))
    }

    body = (
      <>
        <div className="cc-chart__readout">
          <span>
            <small>{formatDate(shown.date)}</small>
            <strong>
              1 {from} = {number.format(shown.value)} {to}
            </strong>
          </span>
          <dl className="cc-chart__stats">
            <div>
              <dt>{t.low}</dt>
              <dd>{number.format(min)}</dd>
            </div>
            <div>
              <dt>{t.high}</dt>
              <dd>{number.format(max)}</dd>
            </div>
            <div>
              <dt>{t.change}</dt>
              <dd>{percent.format(change)}</dd>
            </div>
          </dl>
        </div>
        <div className="cc-chart__plot">
          <svg
            className="cc-chart__svg"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={t.trendSummary(from, to, number.format(first.value), number.format(last.value), percent.format(change))}
            onPointerMove={pick}
            onPointerDown={pick}
            onPointerLeave={() => setActive(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: 'var(--solid)', stopOpacity: 0.22 }} />
                <stop offset="100%" style={{ stopColor: 'var(--solid)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <line className="cc-chart__grid" x1="0" x2={W} y1={y(max)} y2={y(max)} />
            <line className="cc-chart__grid" x1="0" x2={W} y1={y(min)} y2={y(min)} />
            <path d={area} fill={`url(#${gradientId})`} />
            <path className="cc-chart__line" d={line} vectorEffect="non-scaling-stroke" />
            <line className="cc-chart__cursor" x1={x(shownIndex)} x2={x(shownIndex)} y1="0" y2={H} vectorEffect="non-scaling-stroke" />
          </svg>
          {/* A separate HTML dot stays round, while the SVG itself stretches to the panel width. */}
          <div className="cc-chart__dots" aria-hidden="true">
            <span
              className="cc-chart__dot"
              style={{ left: `${(x(shownIndex) / W) * 100}%`, top: `${(y(shown.value) / H) * 100}%` }}
            />
          </div>
        </div>
        <div className="cc-chart__axis" aria-hidden="true">
          <span>{formatDate(first.date)}</span>
          <span>{formatDate(last.date)}</span>
        </div>
      </>
    )
  }

  return (
    <section className="cc-chart" aria-labelledby={`${gradientId}-title`}>
      <h3 id={`${gradientId}-title`} className="cc-section-title">
        {t.trend} · {from} → {to}
      </h3>
      <div className="cc-chart__frame">{body}</div>
    </section>
  )
}
