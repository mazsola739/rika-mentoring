// Seed text is bilingual ({ en, hu }); notes the user writes are plain strings.
export const label = (value, lang) => (typeof value === 'string' ? value : value[lang])

export const CATEGORIES = {
  personal: { en: 'Personal', hu: 'Személyes' },
  work: { en: 'Work', hu: 'Munka' },
  ideas: { en: 'Ideas', hu: 'Ötletek' },
  learning: { en: 'Learning', hu: 'Tanulás' },
}

export const CATEGORY_KEYS = Object.keys(CATEGORIES)

// "Hétfő" and "hetfo" should match: NFD splits each letter from its accents, then \p{M} removes the accent marks.
export const normalize = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export const localeOf = (lang) => (lang === 'hu' ? 'hu-HU' : 'en-GB')

const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

/** "5 minutes ago" / "5 perce" with Intl.RelativeTimeFormat. */
export function relativeTime(timestamp, now, lang) {
  const seconds = Math.round((timestamp - now) / 1000)
  const rtf = new Intl.RelativeTimeFormat(localeOf(lang), { numeric: 'auto' })
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return rtf.format(0, 'second') // "now" / "most"
}

export const fullDate = (timestamp, lang) =>
  new Intl.DateTimeFormat(localeOf(lang), { dateStyle: 'long', timeStyle: 'short' }).format(new Date(timestamp))

export function seedNotes() {
  const now = Date.now()
  const hour = 3600 * 1000
  const note = (id, category, ago, title, body) => ({
    id,
    category,
    title,
    body,
    createdAt: now - ago - hour,
    updatedAt: now - ago,
  })
  return [
    note(
      'seed-hooks',
      'learning',
      2 * hour,
      { en: 'React hooks cheat sheet', hu: 'React hookok – puska' },
      {
        en: 'useState – values that change over time\nuseEffect – sync with the outside world, and always clean up\nuseRef – a box that survives re-renders\nuseMemo – remember an expensive result',
        hu: 'useState – időben változó értékek\nuseEffect – szinkron a külvilággal, és mindig takaríts el magad után\nuseRef – egy doboz, ami túléli az újrarenderelést\nuseMemo – egy drága számítás eredményének megjegyzése',
      },
    ),
    note(
      'seed-ideas',
      'ideas',
      26 * hour,
      { en: 'Portfolio ideas', hu: 'Ötletek a portfólióhoz' },
      {
        en: 'A short case study for every project\nShow the code next to the live demo\nSmall animations – but respect reduced motion',
        hu: 'Rövid esettanulmány minden projekthez\nA kód az élő demó mellett\nApró animációk – de figyelve a csökkentett mozgásra',
      },
    ),
    note(
      'seed-weekend',
      'personal',
      3 * 24 * hour,
      { en: 'Weekend', hu: 'Hétvége' },
      {
        en: 'Farmers’ market on Saturday morning\nCall Grandma\nFinish the book I started',
        hu: 'Szombat reggel termelői piac\nFelhívni a nagyit\nBefejezni az elkezdett könyvet',
      },
    ),
    note(
      'seed-meeting',
      'work',
      6 * 24 * hour,
      { en: 'Meeting notes – Monday', hu: 'Megbeszélés – hétfő' },
      {
        en: 'Release on Friday\nAnna reviews the pull request\nAsk about the new design tokens',
        hu: 'Kiadás pénteken\nAnna nézi át a pull requestet\nRákérdezni az új design tokenekre',
      },
    ),
  ]
}
