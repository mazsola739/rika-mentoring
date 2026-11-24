// The API address comes from an environment variable when there is one (VITE_RATES_API in a .env file),
// otherwise the default is used. API keys are configured the same way; just remember that every
// VITE_ variable ends up in the browser bundle, so only public keys belong there.
// The default is the lesson's own rates API (mocks/handlers.js), which runs in the browser.
export const API = import.meta.env.VITE_RATES_API ?? '/api/rates'

// Fixed reference rates (1 EUR = …) for when the API cannot be reached. This is the "beginner" version
// of the converter: same maths, just a hard-coded table. The UI always marks these as not live.
export const FALLBACK_RATES = {
  base: 'EUR',
  date: '2026-11-20',
  rates: {
    AUD: 1.6487,
    BRL: 6.5259,
    CAD: 1.5723,
    CHF: 0.9223,
    CNY: 7.3388,
    CZK: 24.469,
    DKK: 7.4746,
    GBP: 0.83735,
    HKD: 8.615,
    HUF: 373.55,
    IDR: 20071.37,
    ILS: 3.6737,
    INR: 101.85,
    ISK: 137.2,
    JPY: 174.35,
    KRW: 1472.04,
    MXN: 20.9547,
    MYR: 4.5196,
    NOK: 10.718,
    NZD: 1.9968,
    PHP: 70.091,
    PLN: 4.4583,
    RON: 5.3493,
    SEK: 11.2125,
    SGD: 1.416,
    THB: 37.262,
    TRY: 55.5788,
    USD: 1.099,
    ZAR: 19.1987,
  },
}

// Every table is based on EUR, so any pair is a cross rate: (EUR → to) / (EUR → from).
export function rateOf(from, to, table) {
  const perEuro = (code) => (code === table.base ? 1 : table.rates[code])
  const a = perEuro(from)
  const b = perEuro(to)
  return a && b ? b / a : null
}

export function codesOf(table) {
  return [table.base, ...Object.keys(table.rates)].sort()
}

export function isRateTable(value) {
  return Boolean(value && value.base === 'EUR' && value.rates && typeof value.date === 'string')
}

// localStorage can be full or blocked (private mode), so every access is wrapped.
export function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // not saved, the app still works
  }
}
