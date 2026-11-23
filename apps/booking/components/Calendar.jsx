import { useText } from '@shared/i18n.js'
import { dayStatus, monthCells, toKey } from '../dates.js'
import { MONTHS_AHEAD } from '../services.js'
import { TEXT, useFormat } from '../text.js'

// A month view. Every day is a real <button>; arrow keys move between days like in a date picker.
export default function Calendar({ month, onMonthChange, selectedKey, onSelect, service, bookings }) {
  const t = useText(TEXT)
  const format = useFormat()
  const today = new Date()
  const first = new Date(today.getFullYear(), today.getMonth(), 1)
  const last = new Date(today.getFullYear(), today.getMonth() + MONTHS_AHEAD, 1)
  const cells = monthCells(month.getFullYear(), month.getMonth())

  const shiftMonth = (delta) => onMonthChange(new Date(month.getFullYear(), month.getMonth() + delta, 1))

  // Arrow keys: ←/→ one day, ↑/↓ one week. Focus moves to that day if it is in this month.
  const onKeyDown = (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    const key = e.target.dataset?.key
    if (!step || !key) return
    e.preventDefault()
    const [y, m, d] = key.split('-').map(Number)
    const target = toKey(new Date(y, m - 1, d + step))
    e.currentTarget.querySelector(`[data-key="${target}"]`)?.focus()
  }

  return (
    <div className="bk-cal">
      <div className="bk-cal__head">
        <button type="button" className="bk-icon-btn" onClick={() => shiftMonth(-1)} disabled={month <= first} aria-label={t.prevMonth}>
          ‹
        </button>
        <h3 className="bk-cal__title" aria-live="polite">
          {format.month(month)}
        </h3>
        <button type="button" className="bk-icon-btn" onClick={() => shiftMonth(1)} disabled={month >= last} aria-label={t.nextMonth}>
          ›
        </button>
      </div>

      <div className="bk-cal__grid" onKeyDown={onKeyDown}>
        {format.weekdays.map((name) => (
          <span key={name} className="bk-cal__weekday" aria-hidden="true">
            {name}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} />
          const key = toKey(day)
          const status = dayStatus(day, service, bookings)
          const isToday = key === toKey(today)
          return (
            <button
              key={key}
              type="button"
              data-key={key}
              className={`bk-day bk-day--${status}${isToday ? ' is-today' : ''}`}
              aria-pressed={selectedKey === key}
              aria-label={`${format.fullDate(day)}, ${t.dayLabel[status]}`}
              aria-disabled={status === 'past' || status === 'closed' ? true : undefined}
              onClick={() => status !== 'past' && status !== 'closed' && onSelect(key)}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>

      <ul className="bk-legend">
        {Object.entries(t.legend).map(([key, label]) => (
          <li key={key}>
            <span className={`bk-legend__dot bk-legend__dot--${key}`} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}
