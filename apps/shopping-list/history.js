import { CATEGORIES, UNITS, normalize } from './items.js'

// The history: every item that was ever added, how it was bought last time, and how many times.
// For example: [{ name: 'Eggs', category: 'dairy', unit: 'pcs', qty: 10, count: 5 }, …]
// Seed names are bilingual ({ en, hu }), names the user types are plain strings.

const MAX_ENTRIES = 40

const names = (value) => (typeof value === 'string' ? [value] : [value.en, value.hu])

// A name is a non-empty string, or a bilingual { en, hu } pair.
const isName = (name) =>
  (typeof name === 'string' && name.trim() !== '') || (typeof name?.en === 'string' && typeof name?.hu === 'string')

// The same item, ignoring upper and lower case and accents, in either language? ("tej", "Tej", "Milk": yes)
export function sameName(a, b) {
  const keys = names(a).map(normalize)
  return names(b).some((n) => keys.includes(normalize(n)))
}

// Brings saved entries into today's shape. Older versions of this app stored only names.
export function cleanHistory(saved) {
  if (!Array.isArray(saved)) return []
  const result = []
  for (const raw of saved) {
    const entry = typeof raw === 'string' ? { name: raw } : raw
    const name = entry?.name
    if (!isName(name)) continue
    if (result.some((e) => sameName(e.name, name))) continue
    result.push({
      name,
      category: CATEGORIES[entry.category] ? entry.category : 'other',
      unit: UNITS[entry.unit] ? entry.unit : 'pcs',
      qty: entry.qty > 0 ? entry.qty : 1,
      count: entry.count > 0 ? entry.count : 1,
    })
  }
  return result
}

// Notes that an item was added (again). Returns a new array with the fresh entry first; nothing is changed in place.
export function remember(history, { name, category, unit, qty }) {
  const old = history.find((e) => sameName(e.name, name))
  const others = history.filter((e) => !sameName(e.name, name))
  // A bilingual seed name stays bilingual, so the suggestion keeps following the language switch.
  const kept = old && typeof old.name !== 'string' ? old.name : name
  return [{ name: kept, category, unit, qty, count: (old?.count ?? 0) + 1 }, ...others].slice(0, MAX_ENTRIES)
}

// Earlier items that are not on the list now: the most frequent first, at most max of them.
// sort() works on the new array that filter() made, so the state is never sorted in place.
export function suggest(history, items, max) {
  return history
    .filter((e) => !items.some((item) => sameName(item.name, e.name)))
    .sort((a, b) => b.count - a.count)
    .slice(0, max)
}

// A few things "bought before", so the suggestions are not empty on the first visit.
export function seedHistory() {
  const entry = (en, hu, category, unit, qty, count) => ({ name: { en, hu }, category, unit, qty, count })
  return [
    entry('Milk', 'Tej', 'dairy', 'l', 2, 7),
    entry('Apples', 'Alma', 'produce', 'pcs', 6, 6),
    entry('Eggs', 'Tojás', 'dairy', 'pcs', 10, 5),
    entry('Bananas', 'Banán', 'produce', 'pcs', 6, 4),
    entry('Tomatoes', 'Paradicsom', 'produce', 'kg', 1, 3),
    entry('Coffee beans', 'Szemes kávé', 'pantry', 'g', 500, 3),
    entry('Butter', 'Vaj', 'dairy', 'pack', 1, 2),
    entry('Pasta', 'Tészta', 'pantry', 'pack', 2, 2),
    entry('Orange juice', 'Narancslé', 'drinks', 'l', 1, 1),
  ]
}
