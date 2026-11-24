// The pretend rates server. Mock Service Worker (MSW) runs it in the browser: it answers the app's
// fetch('/api/rates/…') calls like a real exchange-rate service would (the address, the JSON, the waiting,
// the error codes), but nothing leaves your computer. It answers three kinds of requests:
//
//   GET /api/rates/latest?from=EUR                     the latest rates  → { amount, base, date, rates }
//   GET /api/rates/currencies                          currency names    → { USD: 'United States Dollar', … }
//   GET /api/rates/2026-10-24..?from=EUR&to=USD        one rate per day  → { base, start_date, end_date, rates: { date: { USD: … } } }
//
// The rates are sample data: a small, repeatable daily movement around fixed reference values,
// published on working days only (like the reference rates of a central bank).
import { http, HttpResponse } from 'msw'
import { errorResponse, networkDelay } from './helpers.js'
import { CURRENCY_NAMES, REFERENCE_RATES } from './referenceRates.js'

// ── Practice switch ─────────────────────────────────────────────────────────
// Change it, save the file, and the page reloads with a server that behaves like this:
//   'normal'   answers in about half a second
//   'slow'     takes 3 seconds for every answer
//   'flaky'    about every second answer is an error (503 Service Unavailable)
//   'broken'   every answer is an error (503 Service Unavailable)
//   'offline'  never answers, as if the network was gone (fetch itself fails)
const SERVER_MODE = 'normal'

// Runs before every answer: waits like a real network, and misbehaves when SERVER_MODE asks for it.
async function practiceTrouble() {
  if (SERVER_MODE === 'offline') return HttpResponse.error()
  if (SERVER_MODE === 'slow') await networkDelay(3000, 3000)
  else await networkDelay()
  if (SERVER_MODE === 'broken' || (SERVER_MODE === 'flaky' && Math.random() < 0.5)) {
    return errorResponse(503, 'unavailable', 'The rates service is not available right now. Try again later.')
  }
  return null
}

// ── The sample data behind the answers ──────────────────────────────────────
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
  const ref = REFERENCE_RATES.rates[code]
  const n = Math.floor(day / DAY)
  const wave = Math.sin(n / 23 + code.charCodeAt(0)) * 0.012 + Math.sin(n / 7 + code.charCodeAt(1)) * 0.004
  const value = ref * (1 + wave + wobble(code, n) * 0.003)
  return Number(value.toPrecision(6))
}

// The rates of one day, seen from the `from` currency (every currency except `from` itself).
function table(day, from = BASE, codes = [BASE, ...Object.keys(REFERENCE_RATES.rates)]) {
  const perEuro = (code) => (code === BASE ? 1 : rateOn(code, day))
  const rates = {}
  for (const code of codes) if (code !== from) rates[code] = Number((perEuro(code) / perEuro(from)).toPrecision(6))
  return rates
}

const known = (code) => code === BASE || code in REFERENCE_RATES.rates

// ── The answers ─────────────────────────────────────────────────────────────
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
    return HttpResponse.json(CURRENCY_NAMES)
  }),

  // A time series: "/api/rates/2026-10-24.." (until the latest day) or "/api/rates/2026-10-01..2026-10-31".
  http.get('/api/rates/:range', async ({ request, params }) => {
    const trouble = await practiceTrouble()
    if (trouble) return trouble
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
