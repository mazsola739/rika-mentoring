// All dates are plain 'YYYY-MM-DD' strings: easy to compare, store and put into a URL.
// Calculations run in UTC so a time zone or daylight-saving switch can never shift a day.

export const FIRST_DAY = '1995-06-16' // the first Astronomy Picture of the Day

// APOD is published in US Eastern time, so "today" is today in New York, not in the visitor's time zone.
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

export function clampDay(iso, min, max) {
  if (iso < min) return min
  if (iso > max) return max
  return iso
}

export function randomDay(min, max) {
  const start = toDate(min).getTime()
  const end = toDate(max).getTime()
  return toIso(new Date(start + Math.floor(Math.random() * ((end - start) / 86400000 + 1)) * 86400000))
}

export function formatDay(iso, locale, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(toDate(iso))
}

// The original page on apod.nasa.gov, e.g. https://apod.nasa.gov/apod/ap241231.html
export function apodPageUrl(iso) {
  return `https://apod.nasa.gov/apod/ap${iso.slice(2).replaceAll('-', '')}.html`
}
