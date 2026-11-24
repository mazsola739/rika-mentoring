// The wiki's own REST API: the "pretend server". It runs in the browser with Mock Service Worker (see msw.js).
// It is shaped like a typical public fan-wiki API:
//   GET /api                                  → links to the three resources
//   GET /api/character?page=2&name=ju&status=bright&gender=female&species=…&type=…
//                                             → { info: { count, pages, next, prev }, results: [...] }
//   GET /api/character/3                      → one character    GET /api/character/1,2,3 → an array
//   GET /api/character/avatar/3.svg           → the character's picture (an SVG drawn in code)
//   GET /api/location, /api/location/:ids     → places (filters: name, type, region)
//   GET /api/episode, /api/episode/:ids       → episodes (filters: name, episode, e.g. S01)
// Every JSON endpoint takes ?lang=en|hu for its text fields (character names stay as they are).
// Like many real APIs it answers 404 when a filter matches nothing, 400 for a malformed query,
// and 429 when it is called too often.
import { http, HttpResponse } from 'msw'
import { errorResponse, networkDelay, svgResponse } from './msw.js'
import { CHARACTERS, EPISODES, LOCATIONS, SPECIES } from './universe.js'
import { avatarSvg } from './avatars.js'

const PAGE_SIZE = 12
const LANGS = ['en', 'hu']
const STATUSES = ['bright', 'faded', 'unknown']
const GENDERS = ['female', 'male', 'genderless', 'unknown']

const byId = (list) => new Map(list.map((item) => [item.id, item]))
const CHARACTER = byId(CHARACTERS)
const LOCATION = byId(LOCATIONS)
const EPISODE = byId(EPISODES)

// ── Rate limit: at most 60 JSON requests in 10 seconds (pictures do not count) ──
const WINDOW_MS = 10_000
const LIMIT = 60
let recent = []

function tooManyRequests() {
  const now = Date.now()
  recent = recent.filter((time) => now - time < WINDOW_MS)
  if (recent.length < LIMIT) {
    recent.push(now)
    return null
  }
  const wait = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000)
  return HttpResponse.json(
    { error: 'too_many_requests', message: `Too many requests. Try again in ${wait} s.` },
    { status: 429, headers: { 'Retry-After': String(wait) } },
  )
}

// Every JSON endpoint: rate limit, a short "network" wait, then the answer.
const endpoint = (resolver) => async (info) => {
  const limited = tooManyRequests()
  if (limited) return limited
  await networkDelay()
  const url = new URL(info.request.url)
  const lang = LANGS.includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'en'
  return resolver({ ...info, url, lang })
}

// ── Turning records into JSON, with absolute links like a real API ──
const link = (url, path) => new URL(`/api/${path}`, url.origin).href

const place = (url, lang, id) =>
  id ? { name: LOCATION.get(id).name[lang], url: link(url, `location/${id}`) } : { name: 'unknown', url: '' }

const characterJson = (url, lang) => (c) => ({
  id: c.id,
  name: c.name,
  status: c.status,
  species: SPECIES[c.species][lang],
  type: c.type?.[lang] ?? '',
  gender: c.gender,
  origin: place(url, lang, c.origin),
  location: place(url, lang, c.location),
  image: link(url, `character/avatar/${c.id}.svg`),
  episode: c.episodes.map((id) => link(url, `episode/${id}`)),
  url: link(url, `character/${c.id}`),
  created: c.created,
})

const locationJson = (url, lang) => (l) => ({
  id: l.id,
  name: l.name[lang],
  type: l.type[lang],
  region: l.region[lang],
  residents: l.residents.map((id) => link(url, `character/${id}`)),
  url: link(url, `location/${l.id}`),
  created: l.created,
})

const airDate = (iso, lang) =>
  new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  )

const episodeJson = (url, lang) => (e) => ({
  id: e.id,
  name: e.name[lang],
  air_date: airDate(e.air, lang),
  episode: e.episode,
  characters: e.cast.map((id) => link(url, `character/${id}`)),
  url: link(url, `episode/${e.id}`),
  created: e.created,
})

// ── Filters, paging and look-up by ids ──
const contains = (text, query) => String(text).toLowerCase().includes(query.trim().toLowerCase())
const either = (value, query) =>
  typeof value === 'object' ? Object.values(value).some((v) => contains(v, query)) : contains(value, query)

function checkChoice(url, key, allowed) {
  const value = url.searchParams.get(key)
  if (value && !allowed.includes(value.toLowerCase()))
    return errorResponse(400, 'bad_request', `${key} must be one of: ${allowed.join(', ')}`)
  return null
}

// One page of results: { info: { count, pages, next, prev }, results }. No match at all is a 404.
function pageOf(url, items, toJson, what) {
  const raw = url.searchParams.get('page') ?? '1'
  if (!/^\d+$/.test(raw) || Number(raw) < 1) return errorResponse(400, 'bad_request', 'page must be a whole number from 1')
  const page = Number(raw)
  const pages = Math.ceil(items.length / PAGE_SIZE)
  if (!items.length) return errorResponse(404, 'not_found', `No ${what} match these filters`)
  if (page > pages) return errorResponse(404, 'not_found', `There are only ${pages} pages`)

  const pageUrl = (n) => {
    if (n < 1 || n > pages) return null
    const query = new URLSearchParams(url.searchParams)
    query.set('page', String(n))
    return `${url.origin}${url.pathname}?${query}`
  }
  return HttpResponse.json({
    info: { count: items.length, pages, next: pageUrl(page + 1), prev: pageUrl(page - 1) },
    results: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toJson),
  })
}

// "/character/3" answers one object, "/character/1,2,3" an array (only the ids that exist).
function byIds(params, table, toJson, what) {
  const parts = String(params.ids).split(',')
  if (!parts.every((part) => /^\d+$/.test(part.trim())))
    return errorResponse(400, 'bad_request', `Use a number like /api/${what}/3 or a list like /api/${what}/1,2,3`)
  const ids = parts.map(Number)
  if (ids.length === 1) {
    const item = table.get(ids[0])
    return item ? HttpResponse.json(toJson(item)) : errorResponse(404, 'not_found', `There is no ${what} with id ${ids[0]}`)
  }
  return HttpResponse.json(
    ids
      .map((id) => table.get(id))
      .filter(Boolean)
      .map(toJson),
  )
}

export const handlers = [
  http.get(
    '/api',
    endpoint(({ url }) =>
      HttpResponse.json({ characters: link(url, 'character'), locations: link(url, 'location'), episodes: link(url, 'episode') }),
    ),
  ),

  http.get(
    '/api/character',
    endpoint(({ url, lang }) => {
      const invalid = checkChoice(url, 'status', STATUSES) ?? checkChoice(url, 'gender', GENDERS)
      if (invalid) return invalid
      const q = Object.fromEntries(
        ['name', 'status', 'gender', 'species', 'type'].map((key) => [key, url.searchParams.get(key) ?? '']),
      )
      const found = CHARACTERS.filter(
        (c) =>
          (!q.name || contains(c.name, q.name)) &&
          (!q.status || c.status.toLowerCase() === q.status.toLowerCase()) &&
          (!q.gender || c.gender.toLowerCase() === q.gender.toLowerCase()) &&
          (!q.species || either(SPECIES[c.species], q.species)) &&
          (!q.type || (c.type && either(c.type, q.type))),
      )
      return pageOf(url, found, characterJson(url, lang), 'characters')
    }),
  ),

  // Pictures are served like files from a CDN: no rate limit, a quicker answer.
  http.get('/api/character/avatar/:file', async ({ params }) => {
    await networkDelay(60, 220)
    const character = CHARACTER.get(Number(/^(\d+)\.svg$/.exec(params.file)?.[1]))
    return character ? svgResponse(avatarSvg(character)) : errorResponse(404, 'not_found', 'There is no such picture')
  }),

  http.get(
    '/api/character/:ids',
    endpoint(({ url, lang, params }) => byIds(params, CHARACTER, characterJson(url, lang), 'character')),
  ),

  http.get(
    '/api/location',
    endpoint(({ url, lang }) => {
      const q = Object.fromEntries(['name', 'type', 'region'].map((key) => [key, url.searchParams.get(key) ?? '']))
      const found = LOCATIONS.filter(
        (l) =>
          (!q.name || either(l.name, q.name)) && (!q.type || either(l.type, q.type)) && (!q.region || either(l.region, q.region)),
      )
      return pageOf(url, found, locationJson(url, lang), 'locations')
    }),
  ),

  http.get(
    '/api/location/:ids',
    endpoint(({ url, lang, params }) => byIds(params, LOCATION, locationJson(url, lang), 'location')),
  ),

  http.get(
    '/api/episode',
    endpoint(({ url, lang }) => {
      const name = url.searchParams.get('name') ?? ''
      const code = url.searchParams.get('episode') ?? ''
      const found = EPISODES.filter((e) => (!name || either(e.name, name)) && (!code || contains(e.episode, code)))
      return pageOf(url, found, episodeJson(url, lang), 'episodes')
    }),
  ),

  http.get(
    '/api/episode/:ids',
    endpoint(({ url, lang, params }) => byIds(params, EPISODE, episodeJson(url, lang), 'episode')),
  ),
]
