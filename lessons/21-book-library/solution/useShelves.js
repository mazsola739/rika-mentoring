import { useEffect, useState } from 'react'

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

// Books from storage or from the server: only what looks like a book on one of our shelves.
export function cleanBooks(list) {
  if (!Array.isArray(list)) return []
  return list.filter((b) => b && b.id && typeof b.title === 'string' && SHELVES.includes(b.shelf)).map(upgrade)
}

// A book that lands on "Read" remembers when (`at`, an ISO date text): the reading goal counts it.
function finished(book, shelf, at) {
  return shelf === 'read' && at ? { ...book, shelf, finishedAt: at } : { ...book, shelf }
}

// All changes to the shelves go through one reducer: each action says what happened, the reducer decides how.
// It is a pure function, so App can work out the new list first, then show it and send it to the account.
export function shelvesReducer(books, action) {
  switch (action.type) {
    case 'add': {
      if (books.some((b) => b.id === action.book.id)) {
        return books.map((b) => (b.id === action.book.id ? finished(b, action.shelf, action.at) : b))
      }
      return [finished({ ...action.book, rating: 0 }, action.shelf, action.at), ...books]
    }
    case 'move':
      return books.map((b) => (b.id === action.id ? finished(b, action.shelf, action.at) : b))
    case 'rate':
      return books.map((b) => (b.id === action.id ? { ...b, rating: action.rating } : b))
    case 'note':
      return books.map((b) => (b.id === action.id ? { ...b, note: action.note } : b))
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
    if (Array.isArray(saved)) return cleanBooks(saved)
  } catch {
    // broken or blocked storage: start with the sample books
  }
  return SEED
}

// The books of this browser: kept in localStorage, so they are there at once on the next visit
// (also while the account's copy is still on its way from the server).
export function useShelves() {
  // The function runs load() only once, on the first render.
  const [books, setBooks] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
    } catch {
      // not saved, the app still works
    }
  }, [books])

  return [books, setBooks]
}
