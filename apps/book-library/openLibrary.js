const API = 'https://openlibrary.org/search.json'
const FIELDS = 'key,title,author_name,first_publish_year,cover_i'

// `fields` asks only for what we show, so the answer stays small and fast.
export const searchUrl = (query) => `${API}?q=${encodeURIComponent(query)}&limit=12&fields=${FIELDS}`

export const coverUrl = (coverId, size = 'M') =>
  coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null

// Transforming API data: Open Library's field names → the shape our shelves use.
export function toBook(doc) {
  return {
    id: doc.key.replace('/works/', ''),
    title: doc.title,
    authors: doc.author_name?.slice(0, 3) ?? [],
    year: doc.first_publish_year ?? null,
    coverId: doc.cover_i ?? null,
  }
}

export const workUrl = (id) => (id.startsWith('OL') ? `https://openlibrary.org/works/${id}` : null)
