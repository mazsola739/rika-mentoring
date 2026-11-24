import { PEACOCK } from '@shared/ui/palette.js'

// Sample plants have no photo; each gets its own placeholder color.
// [name, placeholder color, water every N days, last watered N days ago]
const SAMPLES = [
  [{ en: 'Monstera', hu: 'Könnyezőpálma' }, PEACOCK.teal, 7, 8],
  [{ en: 'Boston fern', hu: 'Kardpáfrány' }, PEACOCK.blue, 4, 4],
  [{ en: 'Basil', hu: 'Bazsalikom' }, PEACOCK.gold, 2, 1],
  [{ en: 'Snake plant', hu: 'Anyósnyelv' }, PEACOCK.plum, 14, 3],
]

const daysAgo = (n, hour = 9) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export function createSamplePlants() {
  return SAMPLES.map(([name, color, interval, last], i) => ({
    id: `sample-${i}`,
    name,
    color,
    photo: null,
    interval,
    lastWatered: daysAgo(last),
    // A short history: the last three waterings, one interval apart.
    log: [0, 1, 2].map((k) => daysAgo(last + k * interval)),
  }))
}
