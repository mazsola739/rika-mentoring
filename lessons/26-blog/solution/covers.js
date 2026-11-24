import { PEACOCK } from '@shared/ui/palette.js'

// Flat colour covers from the peacock palette. A post stores only the cover *key*;
// the colours are looked up here when rendering. `bg` fills the cover, `ink` draws on it.
export const COVERS = [
  { key: 'teal', bg: PEACOCK.teal, ink: PEACOCK.gold, name: { en: 'Teal', hu: 'Türkiz' } },
  { key: 'night', bg: PEACOCK.night, ink: PEACOCK.tealLight, name: { en: 'Midnight', hu: 'Éjkék' } },
  { key: 'blue', bg: PEACOCK.blue, ink: '#FFFFFF', name: { en: 'Peacock blue', hu: 'Pávakék' } },
  { key: 'lagoon', bg: PEACOCK.tealLight, ink: PEACOCK.night, name: { en: 'Lagoon', hu: 'Lagúnakék' } },
  { key: 'plum', bg: PEACOCK.plum, ink: PEACOCK.gold, name: { en: 'Plum', hu: 'Szilva' } },
  { key: 'ruby', bg: PEACOCK.ruby, ink: '#FFFFFF', name: { en: 'Ruby', hu: 'Rubin' } },
  { key: 'gold', bg: PEACOCK.gold, ink: PEACOCK.night, name: { en: 'Gold', hu: 'Arany' } },
]

// Posts saved before the redesign store an old picture key; each one maps to a colour.
const LEGACY_KEYS = { dinnye: 'ruby', kolibri: 'teal', meduza: 'blue', citrom: 'gold', beach: 'lagoon', hullam: 'plum' }

// Always returns a cover, so unknown or missing keys still render (as the first colour).
export function coverFor(key) {
  const current = LEGACY_KEYS[key] ?? key
  return COVERS.find((c) => c.key === current) ?? COVERS[0]
}
