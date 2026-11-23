// Seed names are bilingual ({ en, hu }); items the user adds are plain strings.
export const label = (value, lang) => (typeof value === 'string' ? value : value[lang])

export const normalize = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase()

export const CATEGORIES = {
  produce: { en: 'Fruit & vegetables', hu: 'Zöldség, gyümölcs' },
  bakery: { en: 'Bakery', hu: 'Pékáru' },
  dairy: { en: 'Dairy & eggs', hu: 'Tejtermék, tojás' },
  meat: { en: 'Meat & fish', hu: 'Hús, hal' },
  pantry: { en: 'Pantry', hu: 'Kamra' },
  frozen: { en: 'Frozen', hu: 'Fagyasztott' },
  drinks: { en: 'Drinks', hu: 'Italok' },
  household: { en: 'Household', hu: 'Háztartás' },
  other: { en: 'Other', hu: 'Egyéb' },
}

export const CATEGORY_KEYS = Object.keys(CATEGORIES)

// step = how much the − / + buttons change the quantity
export const UNITS = {
  pcs: { en: 'pcs', hu: 'db', step: 1 },
  pack: { en: 'pack', hu: 'csomag', step: 1 },
  kg: { en: 'kg', hu: 'kg', step: 0.5 },
  g: { en: 'g', hu: 'g', step: 100 },
  l: { en: 'l', hu: 'l', step: 0.5 },
}

export function seedItems() {
  const item = (i, name, qty, unit, category, done = false) => ({
    id: `seed-${i}`,
    name,
    qty,
    unit,
    category,
    done,
    addedAt: Date.now() - i * 60_000,
  })
  return [
    item(1, { en: 'Apples', hu: 'Alma' }, 6, 'pcs', 'produce'),
    item(2, { en: 'Spinach', hu: 'Spenót' }, 1, 'pack', 'produce'),
    item(3, { en: 'Milk', hu: 'Tej' }, 2, 'l', 'dairy'),
    item(4, { en: 'Sourdough bread', hu: 'Kovászos kenyér' }, 1, 'pcs', 'bakery'),
    item(5, { en: 'Coffee beans', hu: 'Szemes kávé' }, 500, 'g', 'pantry', true),
    item(6, { en: 'Dish soap', hu: 'Mosogatószer' }, 1, 'pcs', 'household'),
  ]
}

/** Active items grouped by category (in the store's order), each group sorted by name. */
export function groupByCategory(items, lang) {
  const collator = new Intl.Collator(lang === 'hu' ? 'hu' : 'en')
  return CATEGORY_KEYS.map((key) => ({
    key,
    items: items
      .filter((i) => (CATEGORIES[i.category] ? i.category : 'other') === key)
      .sort((a, b) => collator.compare(label(a.name, lang), label(b.name, lang))),
  })).filter((group) => group.items.length > 0)
}
