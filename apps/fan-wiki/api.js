const API = 'https://rickandmortyapi.com/api'

export const STATUSES = ['alive', 'dead', 'unknown']
export const GENDERS = ['female', 'male', 'genderless', 'unknown']

// Only the filters that are set go into the request, e.g. /character?page=2&name=rick&status=alive
export function charactersUrl({ page, name, status, gender }) {
  const params = new URLSearchParams({ page: String(page) })
  if (name) params.set('name', name)
  if (status) params.set('status', status)
  if (gender) params.set('gender', gender)
  return `${API}/character?${params}`
}

export const characterUrl = (id) => `${API}/character/${id}`

// A character lists its episodes as URLs; the API can return many episodes in one request: /episode/1,2,3
export const idFromUrl = (url) => url.split('/').pop()
export const episodesUrl = (episodeUrls) =>
  episodeUrls.length ? `${API}/episode/${episodeUrls.map(idFromUrl).join(',')}` : null

// …but for a single id it answers with an object instead of an array.
export const asList = (data) => (Array.isArray(data) ? data : data ? [data] : [])

// The API answers 404 when nothing matches a filter. For a list that simply means "no results".
export const isNoMatch = (error) => error?.status === 404
