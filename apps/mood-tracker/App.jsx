import { useEffect, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { createSampleEntries } from './sampleEntries.js'
import { currentStreak, daysInMonth, dayOfMonth, fromISODate, longestStreak, monthOf, todayISO } from './dates.js'
import { MOODS, colorsFrom, moodOf } from './moods.js'
import DayEditor from './DayEditor.jsx'
import Calendar from './Calendar.jsx'
import MoodChart from './MoodChart.jsx'
import { TEXT } from './text.js'
import './app.css'

function makeFormatters(lang) {
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const longDate = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' })
  const month = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
  const dateTime = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const decimal = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return {
    locale,
    longDate: (iso) => longDate.format(fromISODate(iso)),
    month: ({ year, month: m }) => month.format(new Date(year, m, 1)),
    dateTime: (iso) => dateTime.format(new Date(iso)),
    decimal: (n) => decimal.format(n),
  }
}

// "Today" that updates itself after midnight while the page stays open.
function useToday() {
  const [today, setToday] = useState(todayISO)
  useEffect(() => {
    const timer = setInterval(() => setToday(todayISO()), 60_000)
    return () => clearInterval(timer)
  }, [])
  return today
}

function MoodTracker() {
  const t = useText(TEXT)
  const lang = useLang()
  const { palette } = useLesson()
  const colors = colorsFrom(palette)
  const fmt = makeFormatters(lang)
  const today = useToday()
  // Entries are an object keyed by date: { '2026-11-21': { mood: 4, note: '…' } }.
  const [entries, setEntries] = useLocalStorage('rika:mood-tracker:entries', createSampleEntries)
  const [selected, setSelected] = useState(today)
  const [view, setView] = useState(() => monthOf(today))

  const select = (iso) => {
    setSelected(iso)
    setView(monthOf(iso))
  }

  const saveEntry = (date, entry) => setEntries((all) => ({ ...all, [date]: entry }))
  const deleteEntry = (date) =>
    setEntries((all) => {
      const { [date]: _removed, ...rest } = all
      return rest
    })

  const clearAll = () => {
    if (window.confirm(t.confirmClear)) setEntries({})
  }

  const loadSample = () => {
    if (!Object.keys(entries).length || window.confirm(t.confirmSample)) setEntries(createSampleEntries(today))
  }

  // Aggregates for the visible month, all derived with filter/reduce.
  const monthDays = Array.from({ length: daysInMonth(view) }, (_, i) => dayOfMonth(view, i + 1))
  const monthEntries = monthDays.map((iso) => entries[iso]).filter(Boolean)
  const average = monthEntries.length ? monthEntries.reduce((s, e) => s + e.mood, 0) / monthEntries.length : 0
  const counts = MOODS.map((m) => monthEntries.filter((e) => e.mood === m.value).length)
  const elapsed = monthDays.filter((iso) => iso <= today).length
  const streak = currentStreak(entries, today)
  const best = longestStreak(entries)
  const averageMood = average ? moodOf(Math.round(average)) : null

  return (
    <div className="md">
      <ul className="md-stats">
        <li>
          <span className="md-stats__label">{t.stats.streak}</span>
          <strong>
            {streak > 0 && <span aria-hidden="true">🔥 </span>}
            {t.stats.days(streak)}
          </strong>
        </li>
        <li>
          <span className="md-stats__label">{t.stats.best}</span>
          <strong>{t.stats.days(best)}</strong>
        </li>
        <li>
          <span className="md-stats__label">{t.stats.logged}</span>
          <strong>
            {monthEntries.length} / {elapsed}
          </strong>
        </li>
        <li>
          <span className="md-stats__label">{t.stats.average}</span>
          <strong>
            {averageMood ? (
              <>
                <span aria-hidden="true">{averageMood.emoji} </span>
                {fmt.decimal(average)} · {t.moods[averageMood.value - 1]}
              </>
            ) : (
              t.stats.none
            )}
          </strong>
        </li>
      </ul>

      <div className="md-columns">
        <DayEditor
          key={selected}
          date={selected}
          entry={entries[selected]}
          isToday={selected === today}
          colors={colors}
          fmt={fmt}
          lang={lang}
          t={t}
          onSave={saveEntry}
          onDelete={deleteEntry}
          onToday={() => select(today)}
        />

        <div className="md-stack">
          <Calendar
            view={view}
            onView={setView}
            selected={selected}
            onSelect={select}
            entries={entries}
            today={today}
            colors={colors}
            fmt={fmt}
            locale={fmt.locale}
            t={t}
          />
          <ul className="md-legend" aria-label={t.moodLegend}>
            {MOODS.map((m, i) => (
              <li key={m.value}>
                <span className="md-legend__swatch" style={{ background: colors[m.value] }} aria-hidden="true">
                  {m.emoji}
                </span>
                {t.moods[i]} <strong>{counts[i]}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <MoodChart view={view} entries={entries} colors={colors} fmt={fmt} lang={lang} t={t} onSelect={select} />

      <footer className="md-foot">
        <span>{t.savedNote}</span>
        <span className="md-row">
          <button type="button" className="md-link" onClick={loadSample}>
            {t.sample}
          </button>
          <button type="button" className="md-link md-link--danger" onClick={clearAll} disabled={!Object.keys(entries).length}>
            {t.clear}
          </button>
        </span>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="mood-tracker">
      <MoodTracker />
    </AppFrame>
  )
}
