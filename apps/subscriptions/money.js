// Prices are stored in minor units (cents, fillér) as integers, so sums never drift.
export const CURRENCIES = ['HUF', 'EUR', 'USD']

// Fixed sample rates (units per 1 EUR). A real app would load these from an API.
export const RATES = { EUR: 1, USD: 1.08, HUF: 395 }

export const convert = (amount, from, to) => Math.round((amount / RATES[from]) * RATES[to])

// Monthly or yearly equivalent of one subscription, in its own currency.
export function costPer(view, sub) {
  if (view === 'monthly') return sub.cycle === 'monthly' ? sub.amount : Math.round(sub.amount / 12)
  return sub.cycle === 'yearly' ? sub.amount : sub.amount * 12
}

// "12", "12.5", "12,50" → 1250. Anything else → NaN.
export function parseAmount(text) {
  const clean = text.trim().replace(/\s/g, '')
  if (!/^\d+([.,]\d{1,2})?$/.test(clean)) return NaN
  return Math.round(Number(clean.replace(',', '.')) * 100)
}

export const amountToInput = (amount, currency) =>
  currency === 'HUF' ? String(Math.round(amount / 100)) : (amount / 100).toFixed(2)

export function moneyFormatter(lang) {
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const cache = {}
  return (amount, currency) => {
    cache[currency] ??= new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      // Forint prices are shown without fillér.
      maximumFractionDigits: currency === 'HUF' ? 0 : 2,
      minimumFractionDigits: currency === 'HUF' ? 0 : 2,
    })
    return cache[currency].format(amount / 100)
  }
}
