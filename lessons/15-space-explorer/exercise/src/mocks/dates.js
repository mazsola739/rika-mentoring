// The pretend server's own date helpers (your app gets its own, in src/dates.js).
// Dates are plain 'YYYY-MM-DD' strings. Calculations run in UTC, so a time zone or a
// daylight-saving switch can never shift a day.

export const FIRST_DAY = '1995-06-16' // the first day of the archive

// The API starts a new day at midnight in New York (like NASA's APOD, which it imitates).
export function apodToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
}

const toDate = (iso) => new Date(`${iso}T00:00:00Z`)
const toIso = (date) => date.toISOString().slice(0, 10)

export const isIsoDay = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toDate(value).getTime())

export function shiftDay(iso, days) {
  const date = toDate(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return toIso(date)
}

export function randomDay(min, max) {
  const start = toDate(min).getTime()
  const end = toDate(max).getTime()
  return toIso(new Date(start + Math.floor(Math.random() * ((end - start) / 86400000 + 1)) * 86400000))
}

export function formatDay(iso, locale, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(toDate(iso))
}
