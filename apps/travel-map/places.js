// Data helpers for the travel map.

export const STATUSES = ['been', 'want']

export const localeOf = (lang) => (lang === 'hu' ? 'hu-HU' : 'en-GB')

// Sample names and notes are bilingual until the user edits them.
export const localize = (value, lang) => (value && typeof value === 'object' ? (value[lang] ?? value.en ?? '') : (value ?? ''))

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const isNumber = (n) => typeof n === 'number' && Number.isFinite(n)

export function isPlaceList(value) {
  return (
    Array.isArray(value) &&
    value.every((p) => p && typeof p.id === 'string' && isNumber(p.lat) && isNumber(p.lng) && STATUSES.includes(p.status))
  )
}

// 47.50° N, 19.04° E  ·  47,50° É, 19,04° K
export function formatCoords(lat, lng, lang) {
  const num = new Intl.NumberFormat(localeOf(lang), { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const [n, s, e, w] = lang === 'hu' ? ['É', 'D', 'K', 'Ny'] : ['N', 'S', 'E', 'W']
  return `${num.format(Math.abs(lat))}° ${lat >= 0 ? n : s}, ${num.format(Math.abs(lng))}° ${lng >= 0 ? e : w}`
}

export function samplePlaces() {
  const place = (name, lat, lng, status, note) => ({ id: createId(), name, lat, lng, status, note, photo: null })
  return [
    place({ en: 'Lisbon', hu: 'Lisszabon' }, 38.7223, -9.1393, 'been', {
      en: 'Tram 28, custard tarts and the view from the Alfama.',
      hu: 'A 28-as villamos, pastel de nata és a kilátás az Alfamából.',
    }),
    place('Budapest', 47.4979, 19.0402, 'been', {
      en: 'Home. Sunset from Gellért Hill.',
      hu: 'Itthon. Naplemente a Gellért-hegyről.',
    }),
    place({ en: 'Lake Bled', hu: 'Bledi-tó' }, 46.3683, 14.1146, 'been', {
      en: 'A rowing boat out to the island.',
      hu: 'Csónakkal ki a szigetre.',
    }),
    place('Reykjavík', 64.1466, -21.9426, 'want', {
      en: 'Northern lights in winter.',
      hu: 'Északi fény télen.',
    }),
    place({ en: 'Kyoto', hu: 'Kiotó' }, 35.0116, 135.7681, 'want', {
      en: 'Temples and gardens in autumn colours.',
      hu: 'Templomok és kertek őszi színekben.',
    }),
    place({ en: 'Cape Town', hu: 'Fokváros' }, -33.9249, 18.4241, 'want', {
      en: 'Table Mountain at sunrise.',
      hu: 'A Tábla-hegy napfelkeltekor.',
    }),
    place({ en: 'Mexico City', hu: 'Mexikóváros' }, 19.4326, -99.1332, 'want', {
      en: 'Murals, markets and street food.',
      hu: 'Falfestmények, piacok és utcai ételek.',
    }),
  ]
}
