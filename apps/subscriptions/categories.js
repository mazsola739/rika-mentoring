// Category colours come from the lesson palette (Hummingbird). Labels are in text.js.
export const CATEGORIES = [
  { key: 'streaming', color: '#0098B1' },
  { key: 'music', color: '#F2415E' },
  { key: 'software', color: '#01465C' },
  { key: 'cloud', color: '#02A268' },
  { key: 'news', color: '#FDBF01' },
  { key: 'fitness', color: '#F05101' },
  { key: 'other', color: '#0B0F2C' },
]

export const colorOf = (key) => CATEGORIES.find((c) => c.key === key)?.color ?? '#0B0F2C'

// Text colour that stays readable on the category colour (yellow needs dark text).
export const inkOn = (key) => (key === 'news' ? '#0B0F2C' : '#FFFFFF')
