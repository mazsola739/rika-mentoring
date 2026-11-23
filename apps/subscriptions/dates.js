// Date math on plain "YYYY-MM-DD" strings (local calendar days, no time zones involved).

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

// Adding months is tricky: Jan 31 + 1 month must be Feb 28 (or 29), not March 3.
// So we clamp the day to the last day of the target month.
export function addMonths(iso, months) {
  const d = fromISODate(iso)
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(d.getDate(), lastDay))
  return toISODate(target)
}

// Whole days from `fromIso` to `toIso`. UTC avoids the 23/25-hour days around DST changes.
export function daysBetween(fromIso, toIso) {
  const utc = (iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((utc(toIso) - utc(fromIso)) / 86_400_000)
}

// The next charge on or after today. Always counted from the start date
// (start + k cycles), so a short month never shifts later renewals.
export function nextRenewal(startIso, cycle, today = todayISO()) {
  if (startIso >= today) return startIso
  const step = cycle === 'yearly' ? 12 : 1
  const [sy, sm] = startIso.split('-').map(Number)
  const [ty, tm] = today.split('-').map(Number)
  let k = Math.max(0, Math.floor(((ty - sy) * 12 + (tm - sm)) / step) - 1)
  let candidate = addMonths(startIso, k * step)
  while (candidate < today) {
    k += 1
    candidate = addMonths(startIso, k * step)
  }
  return candidate
}
