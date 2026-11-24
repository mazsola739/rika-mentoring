// Days are local "YYYY-MM-DD" strings: they work as object keys and sort correctly as text.

const pad = (n) => String(n).padStart(2, '0')
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const todayISO = () => toISODate(new Date())

export function addDays(iso, days) {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export const monthOf = (iso) => {
  const d = fromISODate(iso)
  return { year: d.getFullYear(), month: d.getMonth() }
}

export const shiftMonth = ({ year, month }, delta) => {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

export const daysInMonth = ({ year, month }) => new Date(year, month + 1, 0).getDate()

export const dayOfMonth = ({ year, month }, day) => toISODate(new Date(year, month, day))

// The calendar grid: weeks of 7 cells, Monday first, with null for the padding days.
export function monthGrid(view) {
  const first = new Date(view.year, view.month, 1)
  const offset = (first.getDay() + 6) % 7 // Sunday (0) → 6, Monday (1) → 0
  const cells = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= daysInMonth(view); day++) cells.push(dayOfMonth(view, day))
  while (cells.length % 7) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
}

// Weekday names in the current language, Monday first (1 Jan 2024 was a Monday).
export const weekdayNames = (locale, format = 'short') =>
  Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: format }).format(new Date(2024, 0, 1 + i)))

// Days in a row with an entry, ending today. If today is not logged yet, the streak
// that ended yesterday still counts (the day is not over).
export function currentStreak(entries, today) {
  let day = entries[today] ? today : addDays(today, -1)
  let count = 0
  while (entries[day]) {
    count += 1
    day = addDays(day, -1)
  }
  return count
}

export function longestStreak(entries) {
  const days = Object.keys(entries).sort()
  let best = 0
  let run = 0
  days.forEach((day, i) => {
    run = i > 0 && addDays(days[i - 1], 1) === day ? run + 1 : 1
    best = Math.max(best, run)
  })
  return best
}
