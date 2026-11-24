import { addDays, todayISO } from './dates.js'

// [name, category, amount in minor units, currency, cycle, start date as "days before today"]
const SAMPLE = [
  ['StreamBox', 'streaming', 349000, 'HUF', 'monthly', 88],
  ['Tunewave', 'music', 1099, 'EUR', 'monthly', 58],
  ['Pixel Studio', 'software', 2399, 'EUR', 'monthly', 29],
  ['Cloudnest 2 TB', 'cloud', 9999, 'USD', 'yearly', 340],
  ['Daily Ledger', 'news', 199000, 'HUF', 'monthly', 14],
  ['FitHub', 'fitness', 12000000, 'HUF', 'yearly', 200],
]

// Start dates are relative to today, so the demo always has a mix of near and far renewals.
export function createSamples(today = todayISO()) {
  return SAMPLE.map(([name, category, amount, currency, cycle, daysAgo], i) => ({
    id: `sample-${i}`,
    name,
    category,
    amount,
    currency,
    cycle,
    startDate: addDays(today, -daysAgo),
  }))
}
