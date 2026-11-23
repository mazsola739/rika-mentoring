import { PEACOCK } from '@shared/ui/palette.js'

// Placeholder for plants without a photo: a flat colored circle with a leaf.
const COLORS = [PEACOCK.teal, PEACOCK.tealLight, PEACOCK.blue, PEACOCK.plum, PEACOCK.ruby, PEACOCK.gold]
// Light circles get a dark leaf, dark circles a white one.
const LIGHT = new Set([PEACOCK.tealLight, PEACOCK.gold])

// A plant keeps its color: samples store one, other plants get one from their id.
// (Plants saved by an older version may still have a `pattern` key; it is not needed any more.)
export function plantColor(plant) {
  if (plant?.color) return plant.color
  let hash = 0
  for (const char of String(plant?.id ?? '')) hash = (hash * 31 + char.codePointAt(0)) >>> 0
  return COLORS[hash % COLORS.length]
}

// Without a color (a plant that is not saved yet) the lesson's own accent is used.
export default function PlantAvatar({ color, className = '' }) {
  const style = color ? { '--pc-avatar': color, '--pc-leaf': LIGHT.has(color) ? PEACOCK.night : '#FFFFFF' } : undefined
  return (
    <span className={`pc-avatar ${className}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 48 48" focusable="false">
        <path className="pc-avatar__leaf" d="M38 8C20 8 9 17 9 30c0 4 1 7 3 10 2-9 8-16 17-21-7 6-11 12-13 22 3 1 5 1 8 1 13 0 17-14 14-34Z" />
      </svg>
    </span>
  )
}
