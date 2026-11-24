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

// ── Trouble, like a real network ────────────────────────────────────────────
// The same practice switch as in the starter's handlers.js:
//   'normal'   answers in about half a second
//   'slow'     takes 3 seconds for every answer
//   'flaky'    about every second answer is an error (503 Service Unavailable)
//   'broken'   every answer is an error (503 Service Unavailable)
//   'offline'  never answers, as if the network was gone (fetch itself fails)
const SERVER_MODE = 'normal'

// Runs before every answer: waits like a real network, and misbehaves when SERVER_MODE asks for it.
// A Service Worker keeps answering even when the browser is offline, so "offline" in the developer tools
// (navigator.onLine === false) is treated as no connection too: then the app falls back to the last known rates.
async function practiceTrouble() {
  if (SERVER_MODE === 'offline' || navigator.onLine === false) return HttpResponse.error()
  if (SERVER_MODE === 'slow') await networkDelay(3000, 3000)
  else await networkDelay()
  if (SERVER_MODE === 'broken' || (SERVER_MODE === 'flaky' && Math.random() < 0.5)) {
    return errorResponse(503, 'unavailable', 'The rates service is not available right now. Try again later.')
  }
  return null
}

// A gentle rate limit on the time series, like many free rate APIs: at most 12 requests a minute.
// Switching pairs very quickly shows the chart's "rate limited" error and its "Try again" button.
const HISTORY_LIMIT = 12
const historyRequests = []

function historyRateLimited() {
  const now = Date.now()
  while (historyRequests.length > 0 && now - historyRequests[0] >= 60_000) historyRequests.shift()
  if (historyRequests.length >= HISTORY_LIMIT) return true
  historyRequests.push(now)
  return false
}

export const handlers = [
  http.get('/api/rates/latest', async ({ request }) => {
    const trouble = await practiceTrouble()
    if (trouble) return trouble
    const from = new URL(request.url).searchParams.get('from') ?? BASE
    if (!known(from)) return errorResponse(404, 'not_found', `Unknown currency: ${from}`)
    const day = latestDay()
    return HttpResponse.json({ amount: 1, base: from, date: iso(day), rates: table(day, from) })
  }),

  http.get('/api/rates/currencies', async () => {
    const trouble = await practiceTrouble()
    if (trouble) return trouble
    return HttpResponse.json(NAMES)
  }),

  // A time series: "/api/rates/2026-10-24.." (until the latest day) or "/api/rates/2026-10-01..2026-10-31".
  http.get('/api/rates/:range', async ({ request, params }) => {
    const trouble = await practiceTrouble()
    if (trouble) return trouble
    if (historyRateLimited()) {
      return HttpResponse.json(
        { error: 'rate_limited', message: `Too many requests: at most ${HISTORY_LIMIT} a minute. Try again shortly.` },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }
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
