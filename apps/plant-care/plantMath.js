// Time-based logic in one place: everything here is derived from `lastWatered`, `interval` and `now`.

const DAY = 86_400_000

const startOfDay = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Calendar days, not 24-hour blocks: watered last night at 22:00 is "1 day ago" this morning.
export const daysSince = (iso, now) => Math.round((startOfDay(now) - startOfDay(iso)) / DAY)

export function waterStatus(plant, now) {
  const days = Math.max(0, daysSince(plant.lastWatered, now))
  const dueIn = plant.interval - days
  return {
    days,
    dueIn,
    // 1 = just watered, 0 = completely dry. Drives the little water gauge.
    level: Math.min(1, Math.max(0, 1 - days / plant.interval)),
    state: dueIn <= 0 ? 'thirsty' : dueIn === 1 ? 'soon' : 'ok',
  }
}

export const byThirst = (now) => (a, b) => waterStatus(a, now).dueIn - waterStatus(b, now).dueIn

export const LOG_LIMIT = 30

// Returns a new plant object (never mutate state): watered now, with the log entry on top.
export const watered = (plant, at = new Date()) => ({
  ...plant,
  lastWatered: at.toISOString(),
  log: [at.toISOString(), ...(plant.log ?? [])].slice(0, LOG_LIMIT),
})
