import { useEffect, useReducer } from 'react'

export const SHELVES = ['want', 'reading', 'read']
const STORAGE_KEY = 'rika:book-library:shelves'

// A few books to start with, so the shelves are not empty on the first visit.
const SEED = [
  { id: 'bk034', title: 'The Hobbit', authors: ['J. R. R. Tolkien'], year: 1937, coverId: 7034, shelf: 'read', rating: 5 },
  { id: 'bk035', title: 'Dune', authors: ['Frank Herbert'], year: 1965, coverId: 7035, shelf: 'reading', rating: 0 },
  {
    id: 'bk036',
    title: 'Le Petit Prince',
    authors: ['Antoine de Saint-Exupéry'],
    year: 1943,
    coverId: 7036,
    shelf: 'want',
    rating: 0,
  },
]

// Saved data can be older than the code. The first version of this app used Open Library ids ("OL…W"):
// the sample books get their new ids, other such books keep their data without the old cover.
const OLD_SAMPLE_IDS = { OL27482W: 'bk034', OL893414W: 'bk035', OL10263W: 'bk036' }

function upgrade(book) {
  if (!/^OL\d+W$/.test(book.id)) return book
  const sample = SEED.find((s) => s.id === OLD_SAMPLE_IDS[book.id])
  return sample ? { ...book, id: sample.id, title: sample.title, coverId: sample.coverId } : { ...book, coverId: null }
}

// All changes to the shelves go through one reducer: each action says what happened, the reducer decides how.
function shelvesReducer(books, action) {
  switch (action.type) {
    case 'add': {
      if (books.some((b) => b.id === action.book.id)) {
        return books.map((b) => (b.id === action.book.id ? { ...b, shelf: action.shelf } : b))
      }
      return [{ ...action.book, shelf: action.shelf, rating: 0 }, ...books]
    }
    case 'move':
      return books.map((b) => (b.id === action.id ? { ...b, shelf: action.shelf } : b))
    case 'rate':
      return books.map((b) => (b.id === action.id ? { ...b, rating: action.rating } : b))
    case 'remove':
      return books.filter((b) => b.id !== action.id)
    case 'restore': // undo a remove: the book comes back exactly as it was
      return books.some((b) => b.id === action.book.id) ? books : [action.book, ...books]
    default:
      return books
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) return saved.filter((b) => b && b.id && SHELVES.includes(b.shelf)).map(upgrade)
  } catch {
    // broken or blocked storage: start with the sample books
  }
  return SEED
}

export function useShelves() {
  // The third argument runs load() only once, on the first render.
  const [books, dispatch] = useReducer(shelvesReducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
    } catch {
      // not saved, the app still works
    }
  }, [books])

  return [books, dispatch]
}
