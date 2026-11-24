// Money is stored in cents (integers): 0.1 + 0.2 !== 0.3 in JavaScript, but 10 + 20 === 30.

export const CURRENCY = 'EUR'

export const localeOf = (lang) => (lang === 'hu' ? 'hu-HU' : 'en-GB')

export function makeFormatters(lang) {
  const locale = localeOf(lang)
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: CURRENCY })
  const whole = new Intl.NumberFormat(locale, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 })
  const day = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })
  const monthShort = new Intl.DateTimeFormat(locale, { month: 'short' })
  const monthLong = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })
  return {
    money: (cents) => money.format(cents / 100),
    whole: (cents) => whole.format(cents / 100),
    signed: (cents, type) => `${type === 'deposit' ? '+' : '−'}${money.format(cents / 100)}`,
    day: (iso) => day.format(fromISODate(iso)),
    monthShort: (key) => monthShort.format(fromISODate(`${key}-01`)),
    monthLong: (key) => monthLong.format(fromISODate(`${key}-01`)),
    percent: (ratio) => percent.format(ratio),
  }
}

// "12", "12.5", "12,50" → 1250 cents. Anything else → NaN.
export function parseAmount(text) {
  const clean = text.trim().replace(/\s/g, '')
  if (!/^\d+([.,]\d{1,2})?$/.test(clean)) return NaN
  return Math.round(Number(clean.replace(',', '.')) * 100)
}

export const centsToInput = (cents) => (cents / 100).toFixed(2)

// Dates are local calendar days as "YYYY-MM-DD" strings: easy to sort, compare and store.
const pad = (n) => String(n).padStart(2, '0')
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const todayISO = () => toISODate(new Date())
export const monthKeyOf = (iso) => iso.slice(0, 7)

// The last `count` month keys, oldest first, e.g. ["2026-06", …, "2026-11"].
export function lastMonths(count, today = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (count - 1 - i), 1)
    return toISODate(d).slice(0, 7)
  })
}
