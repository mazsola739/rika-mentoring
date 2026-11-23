// Five mood levels. Colours come from the lesson palette (Beach): cool for low, warm for high.
// `paletteIndex` points into useLesson().palette.colors; `fallback` is the same colour.
export const MOODS = [
  { value: 1, emoji: '😣', paletteIndex: 0, fallback: '#376D8A', ink: '#FFFFFF' },
  { value: 2, emoji: '😕', paletteIndex: 2, fallback: '#42BEBD', ink: '#0B2530' },
  { value: 3, emoji: '😐', paletteIndex: 3, fallback: '#EBCEA4', ink: '#0B2530' },
  { value: 4, emoji: '🙂', paletteIndex: 4, fallback: '#FC927C', ink: '#0B2530' },
  { value: 5, emoji: '😄', paletteIndex: 5, fallback: '#F35D7A', ink: '#0B2530' },
]

export const moodOf = (value) => MOODS.find((m) => m.value === value)

export const colorsFrom = (palette) =>
  Object.fromEntries(MOODS.map((m) => [m.value, palette?.colors?.[m.paletteIndex] ?? m.fallback]))
