import { PEACOCK, PEACOCK_COLORS } from '@shared/ui/palette.js'

// Bilingual names for the peacock colors, used in labels such as "Add color tile: Gold".
const NAMES = {
  [PEACOCK.night]: { en: 'Night blue', hu: 'Éjkék' },
  [PEACOCK.teal]: { en: 'Teal', hu: 'Türkiz' },
  [PEACOCK.tealLight]: { en: 'Turquoise', hu: 'Világostürkiz' },
  [PEACOCK.blue]: { en: 'Peacock blue', hu: 'Pávakék' },
  [PEACOCK.plum]: { en: 'Plum', hu: 'Szilva' },
  [PEACOCK.ruby]: { en: 'Ruby', hu: 'Rubin' },
  [PEACOCK.gold]: { en: 'Gold', hu: 'Arany' },
  '#FFFFFF': { en: 'White', hu: 'Fehér' },
}

export const colorName = (hex, lang) => NAMES[hex?.toUpperCase()]?.[lang] ?? hex

// Older saved boards contain image items that pointed to pattern pictures which no longer exist.
// Each old key always gets the same peacock color, so a saved board keeps its look between visits.
export function legacyColor(key) {
  let hash = 0
  for (const char of String(key ?? '')) hash = (hash * 31 + char.codePointAt(0)) >>> 0
  return PEACOCK_COLORS[hash % PEACOCK_COLORS.length]
}
