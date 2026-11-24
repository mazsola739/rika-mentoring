import { LEAD_TIME, OPENING_HOURS, SLOT_STEP } from './services.js'

// Small date helpers instead of a library (date-fns would do the same).
// Everything is in the visitor's local time zone; bookings are stored as ISO strings (UTC).

const pad = (n) => String(n).padStart(2, '0')

export const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

// Cells of a month view, starting on Monday: null for the empty cells before the 1st.
export function monthCells(year, month) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = (first.getDay() + 6) % 7 // Monday = 0
  return [...Array(leading).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))]
}

// Two time ranges overlap if each one starts before the other ends.
export const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd

// All possible start times of a service on a day, each marked as free or not (and why).
export function slotsFor(day, service, bookings, now = Date.now()) {
  const hours = OPENING_HOURS[day.getDay()]
  if (!hours || !service) return []
  const [open, close] = hours
  const dayBookings = bookings.map((b) => [new Date(b.start).getTime(), new Date(b.end).getTime()])
  const slots = []
  for (let minute = open * 60; minute + service.duration <= close * 60; minute += SLOT_STEP) {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minute)
    const end = new Date(start.getTime() + service.duration * 60_000)
    const booked = dayBookings.some(([s, e]) => overlaps(start.getTime(), end.getTime(), s, e))
    const tooSoon = start.getTime() < now + LEAD_TIME
    slots.push({ start, end, status: booked ? 'booked' : tooSoon ? 'past' : 'free' })
  }
  return slots
}

// The status of a whole day in the calendar.
export function dayStatus(day, service, bookings, now = Date.now()) {
  if (startOfDay(day) < startOfDay(new Date(now))) return 'past'
  if (!OPENING_HOURS[day.getDay()]) return 'closed'
  const slots = slotsFor(day, service, bookings, now)
  if (slots.every((s) => s.status === 'past')) return 'past' // e.g. today, after the last bookable time
  return slots.some((s) => s.status === 'free') ? 'free' : 'full'
}
