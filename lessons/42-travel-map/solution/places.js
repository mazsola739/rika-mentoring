// Data helpers for the travel map.

export const STATUSES = ['been', 'want']

export const localeOf = (lang) => (lang === 'hu' ? 'hu-HU' : 'en-GB')

// Sample names and notes are bilingual until the user edits them.
export const localize = (value, lang) =>
  value && typeof value === 'object' ? (value[lang] ?? value.en ?? '') : (value ?? '')

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const isNumber = (n) => typeof n === 'number' && Number.isFinite(n)

// The world is the Huebloom Isles, the made-up sky islands of the Fan Wiki lesson.
// Places use the map's own coordinates: x from the left edge, y from the top edge, in map units
// (the whole map is MAP.width x MAP.height), not latitude and longitude.
export const MAP = { width: 1000, height: 700, square: 100 }

export function isPlaceList(value) {
  return (
    Array.isArray(value) &&
    value.every((p) => p && typeof p.id === 'string' && isNumber(p.x) && isNumber(p.y) && STATUSES.includes(p.status))
  )
}

// The map is divided into 100-unit squares: columns A–J from the left, rows 1–7 from the top.
export function gridSquare(x, y) {
  const col = Math.min(MAP.width / MAP.square - 1, Math.max(0, Math.floor(x / MAP.square)))
  const row = Math.min(MAP.height / MAP.square - 1, Math.max(0, Math.floor(y / MAP.square)))
  return `${String.fromCharCode(65 + col)}${row + 1}`
}

// Square C4 · x 312, y 405  ·  Mező: C4 · x 312, y 405
export function formatCoords(x, y, lang) {
  const square = gridSquare(x, y)
  return lang === 'hu'
    ? `Mező: ${square} · x ${Math.round(x)}, y ${Math.round(y)}`
    : `Square ${square} · x ${Math.round(x)}, y ${Math.round(y)}`
}

export function samplePlaces() {
  const place = (name, x, y, status, note) => ({ id: createId(), name, x, y, status, note, photo: null })
  return [
    place({ en: 'Plumage Point', hu: 'Tollazat-fok' }, 190, 130, 'been', {
      en: 'Watched the lighthouse send its colours out at dusk.',
      hu: 'Alkonyatkor néztük, ahogy a világítótorony szétküldi a színeit.',
    }),
    place({ en: 'Marigold Market', hu: 'Körömvirág-piac' }, 320, 330, 'been', {
      en: 'Bought a jar of bottled sunset. Worth every coin.',
      hu: 'Vettem egy üveg palackozott naplementét. Minden fillért megért.',
    }),
    place({ en: 'Tangerine Terraces', hu: 'Mandarin-teraszok' }, 540, 300, 'been', {
      en: 'Tea on the top terrace, above the clouds.',
      hu: 'Tea a legfelső teraszon, a felhők fölött.',
    }),
    place({ en: 'Sky Harbour', hu: 'Égi kikötő' }, 440, 95, 'want', {
      en: 'Ride a cloudwhale ferry to the Upper Isles.',
      hu: 'Felhőbálna-komppal a Felső-szigetekre.',
    }),
    place({ en: 'Crayon Caverns', hu: 'Zsírkréta-barlangok' }, 380, 560, 'want', {
      en: 'Walls that change colour as you walk past.',
      hu: 'Falak, amelyek színt váltanak, ahogy elsétálsz mellettük.',
    }),
    place({ en: 'Rosepetal Reef', hu: 'Rózsaszirom-zátony' }, 860, 540, 'want', {
      en: 'Snorkel through the pink clouds at sunrise.',
      hu: 'Búvárkodás a rózsaszín felhők között napfelkeltekor.',
    }),
    place({ en: 'Cobalt Cliffs', hu: 'Kobalt-sziklák' }, 810, 330, 'want', {
      en: 'The bluest view in all the isles, they say.',
      hu: 'Azt mondják, innen a legkékebb a kilátás a szigeteken.',
    }),
  ]
}
