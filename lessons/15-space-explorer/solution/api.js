// Everything that talks to the space API: the address, the key, one request and the kinds of errors.
// The address and the key come from environment variables when there are any (VITE_APOD_API, and VITE_APOD_KEY in a
// .env.local file). The defaults are the lesson's own picture API (mocks/handlers.js, it runs in the browser) and its
// DEMO_KEY, which allows only a few requests per hour: exactly why every day is cached (useApod.js).
// Remember that every VITE_ variable ends up in the browser bundle, so only public keys belong there.
const API = import.meta.env.VITE_APOD_API ?? '/api/apod'
const API_KEY = import.meta.env.VITE_APOD_KEY || 'DEMO_KEY'

// An error that remembers the HTTP status code of the answer (0 when there was no answer at all).
export function apodError(status, message) {
  const error = new Error(message || `HTTP ${status}`)
  error.status = status
  return error
}

// One request. params is the rest of the query: { date }, { start_date, end_date } or { count }.
// Resolves to { data, remaining }; a status code outside 200–299 rejects with an apodError.
export async function requestApod(params, { lang, signal }) {
  // URLSearchParams builds the query string and escapes every value for us.
  const query = new URLSearchParams({ api_key: API_KEY, thumbs: 'true', lang, ...params })
  const res = await fetch(`${API}?${query}`, { signal })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw apodError(res.status, body?.message ?? body?.msg)
  // The API tells us how many requests are left for this key in a response header.
  const remaining = res.headers.get('X-RateLimit-Remaining')
  return { data: body, remaining: remaining === null ? null : Number(remaining) }
}

// The small picture of a day: the picture itself for an image, the still for a video (null if there is none).
export function thumbnailOf(apod) {
  return apod.media_type === 'image' ? apod.url : (apod.thumbnail_url ?? null)
}

// Friendly categories for the UI.
export function apodErrorKind(error) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline'
  if (error?.message === 'timeout') return 'timeout'
  if (error?.status === 403) return 'key' // missing or wrong api_key
  if (error?.status === 429) return 'rate'
  if (error?.status === 400 || error?.status === 404) return 'notFound'
  return 'server' // 5xx, or fetch() could not reach the API at all
}
