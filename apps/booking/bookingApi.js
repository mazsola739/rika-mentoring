import { createMockApi } from '@shared/mock-api/index.js'
import { addDays, overlaps, startOfDay } from './dates.js'
import { OPENING_HOURS, SERVICES } from './services.js'

// Some bookings by "other clients", so the calendar has busy slots from the start.
// A tiny deterministic pseudo-random generator keeps the pattern the same on every load.
function seedBookings() {
  const today = startOfDay(new Date())
  const bookings = []
  let n = 7
  const random = () => ((n = (n * 9301 + 49297) % 233280) / 233280)
  for (let d = 0; d < 40; d++) {
    const day = addDays(today, d)
    const hours = OPENING_HOURS[day.getDay()]
    if (!hours) continue
    const count = d % 9 === 4 ? 12 : Math.floor(random() * 4) // every ninth day is nearly fully booked
    let minute = hours[0] * 60
    for (let i = 0; i < count && minute < hours[1] * 60; i++) {
      const service = SERVICES[Math.floor(random() * SERVICES.length)]
      minute += Math.floor(random() * 3) * 30
      if (minute + service.duration > hours[1] * 60) break
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minute)
      bookings.push({
        id: `seed-${d}-${i}`,
        serviceId: service.id,
        start: start.toISOString(),
        end: new Date(start.getTime() + service.duration * 60_000).toISOString(),
        mine: false,
      })
      minute += service.duration
    }
  }
  return bookings
}

const api = createMockApi('booking', { seed: { bookings: seedBookings() }, latency: [300, 750], failRate: 0.1 })

export class BookingError extends Error {
  constructor(code) {
    super(code)
    this.code = code
  }
}

// Reads are retried once before giving up: a common pattern for flaky networks.
export async function listBookings(retries = 1) {
  try {
    return await api.list('bookings')
  } catch (err) {
    if (retries > 0) return listBookings(retries - 1)
    throw err
  }
}

export async function createBooking(booking) {
  // The "server" checks for conflicts again right before saving: another visitor (or another tab)
  // may have taken the slot after our calendar was loaded. A real database would use a transaction
  // or a unique constraint for this.
  const start = new Date(booking.start).getTime()
  const end = new Date(booking.end).getTime()
  const existing = await api.list('bookings')
  if (existing.some((b) => overlaps(start, end, new Date(b.start).getTime(), new Date(b.end).getTime()))) {
    throw new BookingError('conflict')
  }
  // In a real app the server would know who is logged in; here `mine` marks bookings made in this browser.
  return api.create('bookings', { ...booking, mine: true })
}

export const cancelBooking = (id) => api.remove('bookings', id)
