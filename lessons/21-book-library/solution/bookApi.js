// The lesson's own book API (mocks/handlers.js), which runs in the browser. Every address is built
// here, so the components never need to know what the URLs look like.
const API = '/api'
const FIELDS = 'key,title,author_name,first_publish_year,cover_i'
export const PAGE_SIZE = 12

// `fields` asks only for what we show, so the answer stays small and fast.
export const searchUrl = (query, page = 1) =>
  `${API}/books/search?q=${encodeURIComponent(query)}&page=${page}&limit=${PAGE_SIZE}&fields=${FIELDS}`

// Sizes: S (thumbnail), M, L.
export const coverUrl = (coverId, size = 'M') => (coverId ? `${API}/covers/${coverId}-${size}.svg` : null)

// Only books that came from the API have a details page (not the ones added by hand).
export const bookUrl = (id, lang) => (/^bk\d+$/.test(id) ? `${API}/books/${id}?lang=${lang}` : null)

// Transforming API data: the API's field names → the shape our shelves use.
export function toBook(doc) {
  return {
    id: doc.key.replace('/books/', ''),
    title: doc.title,
    authors: doc.author_name?.slice(0, 3) ?? [],
    year: doc.first_publish_year ?? null,
    coverId: doc.cover_i ?? null,
  }
}

export function toDetails(doc) {
  return {
    description: doc.description ?? '',
    year: doc.first_publish_year ?? null,
    pages: doc.number_of_pages ?? null,
    language: doc.original_language ?? null,
    subjects: doc.subject ?? [],
    otherTitles: doc.alternative_titles ?? [],
  }
}
