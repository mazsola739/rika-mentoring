// The lesson's own exchange-rate API (runs in the browser via MSW, see @shared/mock-api).
// It answers like a typical rates service (Frankfurter-style):
//   GET /api/rates/latest?from=EUR            → { amount, base, date, rates }
//   GET /api/rates/currencies                 → { USD: 'United States Dollar', … }
//   GET /api/rates/2026-10-24..?from=EUR&to=USD → { base, start_date, end_date, rates: { date: { USD: … } } }
// The rates are sample data: a small, repeatable daily movement around fixed reference values,
// published on working days only (like central-bank reference rates).
import { http, HttpResponse } from 'msw'
import { errorResponse, networkDelay } from '@shared/mock-api/msw.js'
import { FALLBACK_RATES } from '../rates.js'

const NAMES = {
  AUD: 'Australian Dollar',
  BRL: 'Brazilian Real',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Renminbi Yuan',
  CZK: 'Czech Koruna',
  DKK: 'Danish Krone',
  EUR: 'Euro',
  GBP: 'British Pound',
  HKD: 'Hong Kong Dollar',
  HUF: 'Hungarian Forint',
  IDR: 'Indonesian Rupiah',
  ILS: 'Israeli New Sheqel',
  INR: 'Indian Rupee',
  ISK: 'Icelandic Króna',
  JPY: 'Japanese Yen',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit',
  NOK: 'Norwegian Krone',
  NZD: 'New Zealand Dollar',
  PHP: 'Philippine Peso',
  PLN: 'Polish Złoty',
  RON: 'Romanian Leu',
  SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',
  THB: 'Thai Baht',
  TRY: 'Turkish Lira',
  USD: 'United States Dollar',
  ZAR: 'South African Rand',
}

const BASE = 'EUR'
const DAY = 86_400_000
const iso = (d) => d.toISOString().slice(0, 10)
const utcDay = (s) => new Date(`${s}T00:00:00Z`)
const isWeekday = (d) => d.getUTCDay() !== 0 && d.getUTCDay() !== 6

// The latest publishing day: today, or the last working day before it.
function latestDay() {
  const now = new Date()
  let d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  while (!isWeekday(d)) d = new Date(d - DAY)
  return d
}

// A repeatable pseudo-random number in [-1, 1] for a currency on a day (same input, same output).
function wobble(code, dayNumber) {
  let h = 2166136261
  for (const ch of `${code}:${dayNumber}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return ((h >>> 0) / 0xffffffff) * 2 - 1
}

// 1 EUR = ? on a given day: the reference value with a gentle wave and a little daily noise.
function rateOn(code, day) {
  const ref = FALLBACK_RATES.rates[code]
  const n = Math.floor(day / DAY)
  const wave = Math.sin(n / 23 + code.charCodeAt(0)) * 0.012 + Math.sin(n / 7 + code.charCodeAt(1)) * 0.004
  const value = ref * (1 + wave + wobble(code, n) * 0.003)
  return Number(value.toPrecision(6))
}

function table(day, from = BASE, codes = [BASE, ...Object.keys(FALLBACK_RATES.rates)]) {
  const perEuro = (code) => (code === BASE ? 1 : rateOn(code, day))
  const rates = {}
  for (const code of codes) if (code !== from) rates[code] = Number((perEuro(code) / perEuro(from)).toPrecision(6))
  return rates
}

const known = (code) => code === BASE || code in FALLBACK_RATES.rates

export const handlers = [
  http.get('/api/rates/latest', async ({ request }) => {
    await networkDelay()
    const from = new URL(request.url).searchParams.get('from') ?? BASE
    if (!known(from)) return errorResponse(404, 'not_found', `Unknown currency: ${from}`)
    const day = latestDay()
    return HttpResponse.json({ amount: 1, base: from, date: iso(day), rates: table(day, from) })
  }),

  http.get('/api/rates/currencies', async () => {
    await networkDelay(150, 400)
    return HttpResponse.json(NAMES)
  }),

  // A time series: "/api/rates/2026-10-24.." (until the latest day) or "/api/rates/2026-10-01..2026-10-31".
  http.get('/api/rates/:range', async ({ request, params }) => {
    await networkDelay()
    const match = /^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})?$/.exec(params.range)
    if (!match) return errorResponse(400, 'bad_request', 'Use a date range like 2026-10-24.. or 2026-10-01..2026-10-31')
    const query = new URL(request.url).searchParams
    const from = query.get('from') ?? BASE
    const to = query.get('to')?.split(',').filter(Boolean)
    if (![from, ...(to ?? [])].every(known)) return errorResponse(404, 'not_found', 'Unknown currency')

    const last = latestDay()
    const end = match[2] ? utcDay(match[2]) : last
    const start = utcDay(match[1])
    if (start > end || end - start > 400 * DAY) return errorResponse(400, 'bad_request', 'The range must be at most 400 days')

    const rates = {}
    for (let d = start; d <= end && d <= last; d = new Date(+d + DAY)) if (isWeekday(d)) rates[iso(d)] = table(d, from, to)
    const days = Object.keys(rates)
    return HttpResponse.json({ amount: 1, base: from, start_date: days[0] ?? iso(start), end_date: days.at(-1) ?? iso(end), rates })
  }),
]
