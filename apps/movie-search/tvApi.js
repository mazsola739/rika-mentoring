// The lesson's own TV API (it runs in the browser, see mocks/handlers.js). The address can come from an
// environment variable (VITE_TV_API in a .env file), so the same code could talk to a real server later.
export const API = import.meta.env.VITE_TV_API ?? '/api/tv'

export const searchUrl = (query) => `${API}/search/shows?q=${encodeURIComponent(query)}`
export const showUrl = (id) => `${API}/shows/${id}?embed[]=cast&embed[]=seasons`

// The API sends summaries as HTML (<p>, <b>…). DOMParser turns them into plain text without running anything,
// so we never need dangerouslySetInnerHTML.
export function stripHtml(html) {
  if (!html) return ''
  return new DOMParser().parseFromString(html, 'text/html').body.textContent.trim()
}

const yearOf = (date) => (date ? date.slice(0, 4) : null)

// The API object is big and nested; the UI only needs a small, flat shape.
export function toShow(raw) {
  return {
    id: raw.id,
    name: raw.name,
    image: raw.image?.medium ?? null,
    year: yearOf(raw.premiered),
    endYear: yearOf(raw.ended),
    genres: raw.genres ?? [],
    rating: raw.rating?.average ?? null,
    status: raw.status ?? null,
    language: raw.language ?? null,
    runtime: raw.averageRuntime ?? raw.runtime ?? null,
    channel: raw.network?.name ?? raw.webChannel?.name ?? null,
    summary: stripHtml(raw.summary),
  }
}

// What a favorite remembers: enough to draw a card without asking the API again.
export const toFavorite = (show) => ({
  id: show.id,
  name: show.name,
  image: show.image,
  year: show.year,
  genres: (show.genres ?? []).slice(0, 2),
  rating: show.rating ?? null,
})

export const GENRES_HU = {
  Action: 'Akció',
  Adult: 'Felnőtt',
  Adventure: 'Kaland',
  Anime: 'Anime',
  Children: 'Gyerek',
  Comedy: 'Vígjáték',
  Crime: 'Krimi',
  DIY: 'Barkács',
  Drama: 'Dráma',
  Espionage: 'Kém',
  Family: 'Családi',
  Fantasy: 'Fantasy',
  Food: 'Gasztro',
  History: 'Történelmi',
  Horror: 'Horror',
  Legal: 'Jogi',
  Medical: 'Orvosi',
  Music: 'Zenés',
  Mystery: 'Rejtély',
  Nature: 'Természet',
  Romance: 'Romantikus',
  'Science-Fiction': 'Sci-fi',
  Sports: 'Sport',
  Supernatural: 'Természetfeletti',
  Thriller: 'Thriller',
  Travel: 'Utazás',
  War: 'Háborús',
  Western: 'Western',
}
