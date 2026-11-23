// Nehézségi sávok: a kártyákon a szintjelző oszlopok száma mutatja a szintet.
export const TIERS = [
  { key: 'kezdo', buttons: 1, upTo: 13, label: { hu: 'Kezdő', en: 'Beginner' } },
  { key: 'kezdo-plus', buttons: 2, upTo: 26, label: { hu: 'Kezdő+', en: 'Beginner+' } },
  { key: 'kozep', buttons: 3, upTo: 42, label: { hu: 'Közép', en: 'Intermediate' } },
  { key: 'halado', buttons: 4, upTo: Infinity, label: { hu: 'Haladó', en: 'Advanced' } },
]

export function tierFor(n) {
  return TIERS.find((t) => n <= t.upTo)
}

export function tierByKey(key) {
  return TIERS.find((t) => t.key === key)
}
