// Full-text search over the sample catalogue, roughly like a real search engine:
// - accents and case do not matter ("jokai" finds "Jókai", "dune" finds "A Dűne"),
// - every word of the query must match the beginning of a word in the title (or another title),
//   an author name, a subject (in either language) or the year,
// - title matches rank higher than author matches, and those higher than subject matches.
import { SUBJECTS } from './catalogue.js'

// "Jókai Mór" → "jokai mor": strip the accents (ő, ű as well) and lower the case.
const fold = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const words = (text) =>
  fold(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)

// The searchable words of each book are computed once, not for every request.
const indexCache = new Map()
function indexOf(book) {
  if (!indexCache.has(book.id)) {
    indexCache.set(book.id, {
      titles: [book.title, ...(book.alt ?? [])].map((title) => words(title).join(' ')),
      title: [book.title, ...(book.alt ?? [])].flatMap(words),
      author: book.authors.flatMap(words),
      subject: book.subjects.flatMap((key) => [...words(SUBJECTS[key].en), ...words(SUBJECTS[key].hu)]),
      year: String(book.year),
    })
  }
  return indexCache.get(book.id)
}

const WEIGHT = { title: 3, author: 2, subject: 1 }

// The relevance of one book for the query words, or 0 when a word matches nothing.
function score(book, terms, phrase) {
  const index = indexOf(book)
  let total = 0
  for (const term of terms) {
    const hits = Object.keys(WEIGHT).filter((field) => index[field].some((word) => word.startsWith(term)))
    const best = Math.max(0, ...hits.map((field) => WEIGHT[field]), term === index.year ? 1 : 0)
    if (!best) return 0
    total += best
  }
  // Bonus for the exact title, a smaller one for the beginning of a title.
  if (index.titles.includes(phrase)) total += 10
  else if (index.titles.some((title) => title.startsWith(phrase))) total += 4
  return total
}

// The matching books, best first; books with the same score in title order.
export function searchBooks(books, query) {
  const terms = words(query)
  if (!terms.length) return []
  const phrase = terms.join(' ')
  return books
    .map((book) => ({ book, score: score(book, terms, phrase) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title, 'en'))
    .map((hit) => hit.book)
}
