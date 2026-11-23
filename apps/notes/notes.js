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

/** "5 minutes ago" / "5 perccel ezelőtt" with Intl.RelativeTimeFormat. */
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

// A #tag: a hash at the start or after a space, then letters, digits, hyphens or underscores (#work, #2026-plans).
const TAG_PATTERN = /(^|\s)#([\p{L}\p{N}_-]+)/gu

// The tags are a derived value: worked out from the text, lowercase, each one only once.
export function findTags(text) {
  const tags = []
  for (const match of text.matchAll(TAG_PATTERN)) {
    const tag = match[2].toLowerCase()
    if (!tags.includes(tag)) tags.push(tag)
  }
  return tags
}

// The first line of the text for the list, without the Markdown marks.
export function excerpt(text) {
  const first = text.trim().split('\n')[0] ?? ''
  return first.replace(/^(#{1,2}|-)\s+/, '').replace(/\*\*|\*|`/g, '')
}

// Deleting leaves a tombstone: the note stays in the list with deleted: true and a fresh timestamp,
// so the next sync carries the deletion to the other devices instead of bringing the note back.
export function tombstone(note) {
  return { ...note, title: '', body: '', deleted: true, updatedAt: Date.now() }
}

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
        en: 'Three hooks I use all the time:\n- **useState**: values that change while the page is open\n- **useEffect**: work outside of drawing, always with a cleanup\n- *custom hooks*: my own `use…` functions\n\n#react #learning',
        hu: 'Három hook, amit folyton használok:\n- **useState**: értékek, amelyek változnak, amíg nyitva van az oldal\n- **useEffect**: munka a rajzoláson kívül, mindig takarítással\n- *saját hookok*: a saját `use…` függvényeim\n\n#react #tanulás',
      },
    ),
    note(
      'seed-meeting',
      'work',
      27 * hour,
      { en: 'Meeting notes – Monday', hu: 'Megbeszélés – hétfő' },
      {
        en: 'Short meeting with the whole team.\n## Decisions\n- Release on **Friday**\n- Anna reviews the pull request\n\nAsk about the new design tokens. #release',
        hu: 'Rövid megbeszélés az egész csapattal.\n## Döntések\n- Kiadás **pénteken**\n- Anna nézi át a pull requestet\n\nRákérdezni az új design tokenekre. #kiadás',
      },
    ),
    note(
      'seed-weekend',
      'personal',
      3 * 24 * hour,
      { en: 'Weekend plans', hu: 'Hétvégi tervek' },
      {
        en: 'Farmers’ market on Saturday morning\nCall Grandma\nFinish the book I started\n\n#weekend',
        hu: 'Szombat reggel termelői piac\nFelhívni a nagyit\nBefejezni az elkezdett könyvet\n\n#hétvége',
      },
    ),
    note(
      'seed-portfolio',
      'ideas',
      6 * 24 * hour,
      { en: 'Ideas for my portfolio', hu: 'Ötletek a portfólióhoz' },
      {
        en: 'A short case study for every project.\n- show the code next to the live demo\n- small animations, but respect *reduced motion*\n\n#portfolio',
        hu: 'Rövid esettanulmány minden projekthez.\n- a kód az élő demó mellett\n- apró animációk, de figyelve a *csökkentett mozgásra*\n\n#portfólió',
      },
    ),
  ]
}
