// The wiki's REST API. Here it is the lesson's own API (mocks/handlers.js), which runs in the browser;
// a real one would be an address like https://example.com/api, and the code below would stay the same.
const API = '/api'

export const STATUSES = ['bright', 'faded', 'unknown']
export const GENDERS = ['female', 'male', 'genderless', 'unknown']

// Only the filters that are set go into the request, e.g. /character?page=2&name=ju&status=bright&lang=en
// The API translates its texts (species, places, episode titles) when it gets a `lang`.
export function charactersUrl({ page, name, status, gender, lang }) {
  const params = new URLSearchParams({ page: String(page) })
  if (name) params.set('name', name)
  if (status) params.set('status', status)
  if (gender) params.set('gender', gender)
  params.set('lang', lang)
  return `${API}/character?${params}`
}

export const characterUrl = (id, lang) => `${API}/character/${id}?lang=${lang}`

// A character lists its episodes as URLs; the API can return many episodes in one request: /episode/1,2,3
export const idFromUrl = (url) => url.split('/').pop()
export const episodesUrl = (episodeUrls, lang) =>
  episodeUrls.length ? `${API}/episode/${episodeUrls.map(idFromUrl).join(',')}?lang=${lang}` : null

// …but for a single id it answers with an object instead of an array.
export const asList = (data) => (Array.isArray(data) ? data : data ? [data] : [])

// The API answers 404 when nothing matches a filter. For a list that simply means "no results".
export const isNoMatch = (error) => error?.status === 404
