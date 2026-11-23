// Derived data: nothing here is stored in state, it is recalculated from the reviews.

export function summarize(reviews) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const total = reviews.reduce((sum, r) => {
    counts[r.rating] += 1
    return sum + r.rating
  }, 0)
  return {
    count: reviews.length,
    average: reviews.length ? total / reviews.length : 0,
    counts,
  }
}

export const SORTERS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  highest: (a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt),
  lowest: (a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt),
  helpful: (a, b) => (b.helpful ?? 0) - (a.helpful ?? 0) || b.createdAt.localeCompare(a.createdAt),
}

// Seed text is { en, hu }; text written by users is a plain string.
export const tx = (value, lang) => (value && typeof value === 'object' ? value[lang] ?? value.en : value)
