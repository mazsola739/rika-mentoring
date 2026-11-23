import { useEffect, useRef } from 'react'
import { addDays, dayOfMonth, monthGrid, monthOf, shiftMonth, weekdayNames } from './dates.js'
import { moodOf } from './moods.js'

const KEY_STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

export default function Calendar({ view, onView, selected, onSelect, entries, today, colors, fmt, locale, t }) {
  const gridRef = useRef(null)
  const focusPending = useRef(false)
  const weeks = monthGrid(view)
  const short = weekdayNames(locale, 'short')
  const long = weekdayNames(locale, 'long')
  const todayView = monthOf(today)
  const isCurrentMonth = view.year === todayView.year && view.month === todayView.month

  // Roving tabindex: only one day is in the Tab order, the arrow keys move between days.
  const selectedView = monthOf(selected)
  const tabbable =
    selectedView.year === view.year && selectedView.month === view.month ? selected : dayOfMonth(view, 1)

  // After a keyboard move, focus the newly selected day once it has rendered.
  useEffect(() => {
    if (!focusPending.current) return
    focusPending.current = false
    gridRef.current?.querySelector(`[data-date="${selected}"]`)?.focus()
  }, [selected, view])

  const onKeyDown = (e) => {
    const step = KEY_STEPS[e.key]
    if (!step) return
    e.preventDefault()
    const next = addDays(e.currentTarget.dataset.date, step)
    if (next > today) return
    focusPending.current = true
    onSelect(next)
  }

  return (
    <section className="md-card md-calendar" aria-labelledby="md-cal-title">
      <div className="md-calendar__head">
        <button type="button" className="md-nav" aria-label={t.prevMonth} onClick={() => onView(shiftMonth(view, -1))}>
          <span aria-hidden="true">‹</span>
        </button>
        <h3 id="md-cal-title" aria-live="polite">
          {fmt.month(view)}
        </h3>
        <button
          type="button"
          className="md-nav"
          aria-label={t.nextMonth}
          disabled={isCurrentMonth}
          onClick={() => onView(shiftMonth(view, 1))}
        >
          <span aria-hidden="true">›</span>
        </button>
        {!isCurrentMonth && (
          <button type="button" className="md-link md-calendar__today" onClick={() => onSelect(today)}>
            {t.thisMonth}
          </button>
        )}
      </div>

      <table ref={gridRef} className="md-grid" aria-labelledby="md-cal-title" aria-describedby="md-cal-help">
        <thead>
          <tr>
            {short.map((name, i) => (
              <th key={name} scope="col" abbr={long[i]}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((iso, d) => {
                if (!iso) return <td key={d} />
                const day = Number(iso.slice(8))
                if (iso > today) {
                  return (
                    <td key={d}>
                      <span className="md-day is-future">{day}</span>
                    </td>
                  )
                }
                const entry = entries[iso]
                const mood = entry && moodOf(entry.mood)
                const label = `${fmt.longDate(iso)}${iso === today ? `, ${t.today}` : ''}: ${mood ? `${mood.emoji} ${t.moods[mood.value - 1]}` : t.noEntry}`
                return (
                  <td key={d}>
                    <button
                      type="button"
                      data-date={iso}
                      className={`md-day${mood ? ' has-entry' : ''}${iso === today ? ' is-today' : ''}`}
                      style={mood ? { '--md-color': colors[mood.value], '--md-ink': mood.ink } : undefined}
                      tabIndex={iso === tabbable ? 0 : -1}
                      aria-pressed={iso === selected}
                      aria-current={iso === today ? 'date' : undefined}
                      aria-label={label}
                      onClick={() => onSelect(iso)}
                      onKeyDown={onKeyDown}
                    >
                      <span className="md-day__num">{day}</span>
                      {mood && (
                        <span className="md-day__emoji" aria-hidden="true">
                          {mood.emoji}
                        </span>
                      )}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p id="md-cal-help" className="md-muted md-calendar__help">
        {t.calendarHelp}
      </p>
    </section>
  )
}
