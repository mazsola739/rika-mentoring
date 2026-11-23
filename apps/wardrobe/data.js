export const CATEGORIES = ['top', 'bottom', 'shoes', 'accessory']
export const SEASONS = ['all', 'spring', 'summer', 'autumn', 'winter']
export const OCCASIONS = ['casual', 'work', 'sport', 'party']

// Real clothing colors (data, not UI colors).
export const COLORS = [
  { key: 'black', hex: '#1f1f1f', en: 'Black', hu: 'Fekete' },
  { key: 'white', hex: '#f7f6f1', en: 'White', hu: 'Fehér' },
  { key: 'grey', hex: '#9b9b9b', en: 'Grey', hu: 'Szürke' },
  { key: 'beige', hex: '#e2cda9', en: 'Beige', hu: 'Bézs' },
  { key: 'brown', hex: '#7a4b2a', en: 'Brown', hu: 'Barna' },
  { key: 'red', hex: '#d23a3a', en: 'Red', hu: 'Piros' },
  { key: 'pink', hex: '#f29ab8', en: 'Pink', hu: 'Rózsaszín' },
  { key: 'orange', hex: '#f08a3c', en: 'Orange', hu: 'Narancs' },
  { key: 'yellow', hex: '#f2cf3d', en: 'Yellow', hu: 'Sárga' },
  { key: 'green', hex: '#4f9a54', en: 'Green', hu: 'Zöld' },
  { key: 'blue', hex: '#3a6fc4', en: 'Blue', hu: 'Kék' },
  { key: 'purple', hex: '#8a5cc2', en: 'Purple', hu: 'Lila' },
  { key: 'multi', hex: 'conic-gradient(#d23a3a, #f2cf3d, #4f9a54, #3a6fc4, #8a5cc2, #d23a3a)', en: 'Multicolor', hu: 'Színes' },
]

export const colorByKey = (key) => COLORS.find((c) => c.key === key) ?? COLORS[0]

// Sample pieces. Without a photo every item is drawn as a flat tile with its category icon.
const SAMPLES = [
  { category: 'top', color: 'white', season: 'all', occasion: 'work', name: { en: 'White cotton shirt', hu: 'Fehér pamuting' } },
  { category: 'top', color: 'blue', season: 'summer', occasion: 'casual', name: { en: 'Blue linen T-shirt', hu: 'Kék lenvászon póló' } },
  { category: 'bottom', color: 'yellow', season: 'summer', occasion: 'casual', name: { en: 'Yellow pleated skirt', hu: 'Sárga rakott szoknya' } },
  { category: 'bottom', color: 'black', season: 'autumn', occasion: 'work', name: { en: 'Black tailored trousers', hu: 'Fekete szövetnadrág' } },
  { category: 'shoes', color: 'green', season: 'spring', occasion: 'casual', name: { en: 'Green sneakers', hu: 'Zöld tornacipő' } },
  { category: 'shoes', color: 'beige', season: 'all', occasion: 'work', name: { en: 'Beige loafers', hu: 'Bézs félcipő' } },
  { category: 'accessory', color: 'purple', season: 'all', occasion: 'party', name: { en: 'Purple silk scarf', hu: 'Lila selyemsál' } },
  { category: 'accessory', color: 'multi', season: 'summer', occasion: 'casual', name: { en: 'Colorful tote bag', hu: 'Színes vászontáska' } },
]

export function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function sampleItems() {
  return SAMPLES.map((s, i) => ({ ...s, id: uid(), createdAt: Date.now() + i }))
}

// Sample names are bilingual objects; names typed by the user are plain strings.
export const itemName = (item, lang) => (typeof item.name === 'string' ? item.name : item.name[lang])

export function matches(item, filters, lang) {
  const query = filters.query.trim().toLocaleLowerCase()
  return (
    (filters.category === 'all' || item.category === filters.category) &&
    (filters.color === 'all' || item.color === filters.color) &&
    (filters.season === 'all' || item.season === filters.season || item.season === 'all') &&
    (filters.occasion === 'all' || item.occasion === filters.occasion) &&
    (!query || itemName(item, lang).toLocaleLowerCase().includes(query))
  )
}

export const EMPTY_FILTERS = { category: 'all', color: 'all', season: 'all', occasion: 'all', query: '' }

// Northern-hemisphere season of a date.
export function seasonOf(date = new Date()) {
  const month = date.getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}
