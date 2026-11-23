// The lesson's own book API (runs in the browser via MSW, see @shared/mock-api/msw.js).
// It answers like a typical public catalogue API (Open Library-style field names):
//   GET /api/books/search?q=verne&page=1&limit=12&fields=key,title
//       → { q, numFound, start, page, limit, docs: [{ key, title, author_name, first_publish_year, cover_i, … }] }
//   GET /api/books/bk018?lang=hu        → one book with its description, subjects and other titles
//   GET /api/covers/7018-M.svg          → the cover picture (S, M or L), an SVG drawn in covers.js
// Errors use the { error, message } shape: 400 for a bad request, 404 for an unknown book or cover,
// and 429 when a client searches too often (like most free APIs, this one has a rate limit).
import { http, HttpResponse } from 'msw'
import { errorResponse, networkDelay, svgResponse } from '@shared/mock-api/msw.js'
import { BOOKS, SUBJECTS } from './catalogue.js'
import { drawCover } from './covers.js'
import { searchBooks } from './search.js'

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 50

// Covers are separate resources with their own ids; a few books have none (cover_i: null).
const coverIdOf = (book) => (book.noCover ? null : 7000 + Number(book.id.slice(2)))
const langOf = (url) => (url.searchParams.get('lang') === 'hu' ? 'hu' : 'en')

// A book as the API sends it: snake_case names, subjects in the requested language.
function toDoc(book, lang) {
  return {
    key: `/books/${book.id}`,
    title: book.title,
    author_name: book.authors,
    first_publish_year: book.year,
    cover_i: coverIdOf(book),
    subject: book.subjects.map((key) => SUBJECTS[key][lang]),
    original_language: book.language,
    number_of_pages: book.pages,
  }
}

// `fields=key,title` → only those properties, so the answer stays small.
function pick(doc, fields) {
  if (!fields?.length) return doc
  return Object.fromEntries(fields.filter((name) => name in doc).map((name) => [name, doc[name]]))
}

// The rate limit: at most 12 searches in any 10 seconds; after that 429 Too Many Requests.
const WINDOW_MS = 10_000
const MAX_SEARCHES = 12
let recentSearches = []

function rateLimited() {
  const now = Date.now()
  recentSearches = recentSearches.filter((time) => now - time < WINDOW_MS)
  if (recentSearches.length >= MAX_SEARCHES) return Math.ceil((recentSearches[0] + WINDOW_MS - now) / 1000)
  recentSearches.push(now)
  return 0
}

// A query parameter as a whole number: the fallback when it is missing, NaN when it is not a number.
const wholeNumber = (value, fallback) => (value === null ? fallback : /^\d+$/.test(value) ? Number(value) : NaN)

export const handlers = [
  http.get('/api/books/search', async ({ request }) => {
    await networkDelay(300, 800)
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') ?? '').trim()
    const page = wholeNumber(url.searchParams.get('page'), 1)
    const limit = wholeNumber(url.searchParams.get('limit'), DEFAULT_LIMIT)
    if (!q) return errorResponse(400, 'bad_request', 'The q parameter is required, e.g. /api/books/search?q=verne')
    if (!(page >= 1)) return errorResponse(400, 'bad_request', 'page must be a whole number from 1')
    if (!(limit >= 1 && limit <= MAX_LIMIT)) return errorResponse(400, 'bad_request', `limit must be between 1 and ${MAX_LIMIT}`)

    const retryAfter = rateLimited()
    if (retryAfter) {
      return HttpResponse.json(
        { error: 'too_many_requests', message: `Too many searches. Try again in ${retryAfter} s.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      )
    }

    const lang = langOf(url)
    const fields = url.searchParams.get('fields')?.split(',') // "key,title" → ['key', 'title']
    const matches = searchBooks(BOOKS, q)
    const start = (page - 1) * limit
    const docs = matches.slice(start, start + limit).map((book) => pick(toDoc(book, lang), fields))
    return HttpResponse.json({ q, numFound: matches.length, start, page, limit, docs })
  }),

  // Must come after /search, otherwise "search" would be taken for a book id.
  http.get('/api/books/:id', async ({ request, params }) => {
    await networkDelay(200, 500)
    const book = BOOKS.find((b) => b.id === params.id)
    if (!book) return errorResponse(404, 'not_found', `There is no book with the id ${params.id}`)
    const lang = langOf(new URL(request.url))
    return HttpResponse.json({ ...toDoc(book, lang), alternative_titles: book.alt ?? [], description: book.about[lang], lang })
  }),

  http.get('/api/covers/:file', async ({ params }) => {
    await networkDelay(80, 300)
    const match = /^(\d+)-([SML])\.svg$/.exec(params.file)
    if (!match) return errorResponse(400, 'bad_request', 'Use a cover address like /api/covers/7018-M.svg')
    const book = BOOKS.find((b) => coverIdOf(b) === Number(match[1]))
    if (!book) return errorResponse(404, 'not_found', `There is no cover with the id ${match[1]}`)
    return svgResponse(drawCover(book, match[2]))
  }),
]
