// The lessons' TV API, answered in the browser by Mock Service Worker (see ./msw.js).
// A copy of the Rika Mentoring site's own TV API: it speaks like a typical public TV API (TVmaze-style JSON),
// so the app's code is ordinary fetch() code:
//
//   GET /api/tv/shows?page=1                    → one page of shows, 40 per page, pages start at 1 (404 past the last page)
//   GET /api/tv/search/shows?q=lighthouse       → [{ score, show }], best matches first, at most 10 (400 without q)
//   GET /api/tv/shows/:id                       → one show (404 for an unknown id)
//       ?embed[]=cast&embed[]=seasons           → …with _embedded.cast and _embedded.seasons
//   GET /api/tv/shows/:id/cast                  → [{ person, character, self, voice }]
//   GET /api/tv/shows/:id/seasons               → [{ id, number, episodeOrder, premiereDate, endDate }]
//   GET /api/tv/posters/:id/medium.svg          → the poster (also original.svg), drawn in code
//   GET /api/tv/people/:id/medium.svg           → a person's portrait (also original.svg), drawn in code
//
// Like a real public API it has a rate limit: more than 20 JSON requests in 10 seconds get 429 Too Many Requests.
// ./handlers.js picks the handlers this app uses.
import { http, HttpResponse } from 'msw'
import { errorResponse, networkDelay, svgResponse, xml } from './msw.js'
import { CHANNELS, SHOWS, castOf, endedOf, findPerson, findShow, premieredOf, seasonsOf, seeded, statusOf } from './shows.js'

const BASE = '/api/tv'
const PAGE_SIZE = 40
const MAX_RESULTS = 10

// ── Rate limit: a sliding window of the last 10 seconds ─────────────────
const WINDOW_MS = 10_000
const MAX_CALLS = 20
const calls = []

function overLimit() {
  const now = Date.now()
  while (calls.length && now - calls[0] > WINDOW_MS) calls.shift()
  if (calls.length >= MAX_CALLS) return true
  calls.push(now)
  return false
}

const tooManyRequests = () =>
  HttpResponse.json(
    { error: 'too_many_requests', message: 'Slow down: at most 20 requests per 10 seconds.' },
    { status: 429, headers: { 'Retry-After': '10' } },
  )

// ── JSON shapes ─────────────────────────────────────────────────────────
const url = (request, path) => new URL(`${BASE}${path}`, request.url).href

function channelOf(s) {
  const c = CHANNELS[s.channel]
  if (!c) return { network: null, webChannel: null }
  const base = { id: c.id, name: c.name, officialSite: null }
  return c.kind === 'web'
    ? { network: null, webChannel: { ...base, country: null } }
    : { network: { ...base, country: c.country }, webChannel: null }
}

// Summaries come as a little HTML, the way TV APIs usually send them.
function summaryHtml(s) {
  if (!s.summary) return null
  const text = xml(s.summary)
  const name = xml(s.name)
  return `<p>${text.includes(name) ? text.replace(name, `<b>${name}</b>`) : text}</p>`
}

function scheduleOf(s) {
  if (CHANNELS[s.channel]?.kind !== 'network' || statusOf(s) === 'In Development') return { time: '', days: [] }
  const random = seeded(s.id * 41)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  if (s.type === 'Animation' || s.type === 'Talk Show')
    return { time: s.type === 'Animation' ? '07:30' : '22:30', days: days.slice(0, 5) }
  return { time: ['19:00', '20:00', '21:00', '21:30'][Math.floor(random() * 4)], days: [days[Math.floor(random() * 7)]] }
}

function apiShow(s, request) {
  return {
    id: s.id,
    url: url(request, `/shows/${s.id}`),
    name: s.name,
    type: s.type,
    language: s.language,
    genres: s.genres,
    status: statusOf(s),
    runtime: s.runtime,
    averageRuntime: s.runtime,
    premiered: premieredOf(s),
    ended: endedOf(s),
    officialSite: null,
    schedule: scheduleOf(s),
    rating: { average: s.rating },
    weight: s.rating ? Math.round(s.rating * 10 + (s.id % 7)) : 10,
    ...channelOf(s),
    image: s.poster
      ? { medium: url(request, `/posters/${s.id}/medium.svg`), original: url(request, `/posters/${s.id}/original.svg`) }
      : null,
    summary: summaryHtml(s),
    updated: Date.UTC(2026, 9, 1) / 1000 + s.id * 5003,
    _links: { self: { href: url(request, `/shows/${s.id}`) } },
  }
}

function apiCast(s, request) {
  return castOf(s).map(({ person, character, self, voice }) => ({
    person: {
      id: person.id,
      url: url(request, `/people/${person.id}`),
      name: person.name,
      country: null,
      birthday: null,
      gender: null,
      image: person.hasImage
        ? { medium: url(request, `/people/${person.id}/medium.svg`), original: url(request, `/people/${person.id}/original.svg`) }
        : null,
    },
    character: { id: character.id, name: character.name, image: null },
    self,
    voice,
  }))
}

// ── Search ──────────────────────────────────────────────────────────────
// Accents, case and punctuation do not matter: "Café", "cafe" and "CAFE!" are the same word.
const fold = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const SMALL_WORDS = new Set([
  'the',
  'a',
  'an',
  'of',
  'and',
  'at',
  'to',
  'in',
  'on',
  'for',
  'with',
  'de',
  'des',
  'la',
  'las',
  'le',
])

// Edit distance, to forgive a typo or two ("lighthose" still finds "Lighthouse").
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = current
    }
  }
  return row[b.length]
}

// Short words and a wrong first letter are not forgiven, so "light" does not find "Night".
function typoOf(word, target) {
  if (word.length < 5 || word[0] !== target[0]) return false
  if (distance(word, target) <= (word.length >= 8 ? 2 : 1)) return true
  // A half-typed word with a typo: compare it with the start of the title word.
  return target.length > word.length && distance(word, target.slice(0, word.length)) <= 1
}

// How well a show matches: the title counts most, then the genres and description, then a title with a typo.
function scoreOf(s, query) {
  const name = fold(s.name)
  if (name === query) return 1
  const words = query.split(' ')
  const meaningful = words.filter((w) => !SMALL_WORDS.has(w))
  const terms = meaningful.length ? meaningful : words
  const nameWords = name.split(' ')
  if (name.startsWith(query)) return 0.95
  if (terms.every((w) => nameWords.some((n) => n.startsWith(w)))) return 0.85
  if (name.includes(query)) return 0.75
  const about = fold([s.type, s.language, ...s.genres, s.summary ?? ''].join(' ')).split(' ')
  if (terms.every((w) => w.length >= 3 && about.some((n) => n.startsWith(w)))) return 0.5
  if (terms.every((w) => nameWords.some((n) => typoOf(w, n)))) return 0.45
  return 0
}

function search(text) {
  const query = fold(text)
  if (!query) return []
  return SHOWS.map((s) => {
    const base = scoreOf(s, query)
    // Shorter titles rank a little higher than long ones with the same kind of match.
    return { s, score: base && Number((base - Math.min(0.09, Math.max(0, s.name.length - query.length) * 0.002)).toFixed(4)) }
  })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || (b.s.rating ?? 0) - (a.s.rating ?? 0))
    .slice(0, MAX_RESULTS)
}

// ── Handlers ────────────────────────────────────────────────────────────
const notFound = (what) => errorResponse(404, 'not_found', what)

export const showList = http.get(`${BASE}/shows`, async ({ request }) => {
  await networkDelay()
  if (overLimit()) return tooManyRequests()
  const raw = new URL(request.url).searchParams.get('page') ?? '1'
  const page = Number(raw)
  if (!Number.isInteger(page) || page < 1) return errorResponse(400, 'bad_request', 'page must be a whole number from 1')
  const pages = Math.ceil(SHOWS.length / PAGE_SIZE)
  if (page > pages) return notFound(`There is no page ${page}; the last page is ${pages}.`)
  const headers = { 'X-Total-Count': String(SHOWS.length) }
  if (page < pages) headers.Link = `<${url(request, `/shows?page=${page + 1}`)}>; rel="next"`
  const shows = SHOWS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((s) => apiShow(s, request))
  return HttpResponse.json(shows, { headers })
})

export const showSearch = http.get(`${BASE}/search/shows`, async ({ request }) => {
  await networkDelay()
  if (overLimit()) return tooManyRequests()
  const q = new URL(request.url).searchParams.get('q')?.trim()
  if (!q) return errorResponse(400, 'bad_request', 'Add what to search for: /api/tv/search/shows?q=…')
  return HttpResponse.json(search(q).map(({ s, score }) => ({ score, show: apiShow(s, request) })))
})

export const showDetails = http.get(`${BASE}/shows/:id`, async ({ request, params }) => {
  await networkDelay()
  if (overLimit()) return tooManyRequests()
  const s = findShow(params.id)
  if (!s) return notFound(`No show with id ${params.id}.`)
  const query = new URL(request.url).searchParams
  const embed = new Set([...query.getAll('embed[]'), ...query.getAll('embed')])
  const body = apiShow(s, request)
  if (embed.size) {
    body._embedded = {}
    if (embed.has('cast')) body._embedded.cast = apiCast(s, request)
    if (embed.has('seasons')) body._embedded.seasons = seasonsOf(s)
  }
  return HttpResponse.json(body)
})

export const showCast = http.get(`${BASE}/shows/:id/cast`, async ({ request, params }) => {
  await networkDelay()
  if (overLimit()) return tooManyRequests()
  const s = findShow(params.id)
  return s ? HttpResponse.json(apiCast(s, request)) : notFound(`No show with id ${params.id}.`)
})

export const showSeasons = http.get(`${BASE}/shows/:id/seasons`, async ({ params }) => {
  await networkDelay()
  if (overLimit()) return tooManyRequests()
  const s = findShow(params.id)
  return s ? HttpResponse.json(seasonsOf(s)) : notFound(`No show with id ${params.id}.`)
})

// Pictures are SVG drawn on request (and remembered). Images do not count towards the rate limit.
const SIZES = { 'medium.svg': 'medium', 'original.svg': 'original' }
const drawn = new Map()
const remember = (key, draw) => {
  if (!drawn.has(key)) drawn.set(key, draw())
  return drawn.get(key)
}

export const posterImages = http.get(`${BASE}/posters/:id/:file`, async ({ params }) => {
  await networkDelay(60, 260)
  const s = findShow(params.id)
  const size = SIZES[params.file]
  if (!s?.poster || !size) return notFound('No such poster.')
  return svgResponse(remember(`poster:${s.id}:${size}`, () => posterSvg(s, size)))
})

export const peopleImages = http.get(`${BASE}/people/:id/:file`, async ({ params }) => {
  await networkDelay(60, 260)
  const person = findPerson(params.id)
  const size = SIZES[params.file]
  if (!person?.hasImage || !size) return notFound('No such picture.')
  return svgResponse(remember(`person:${person.id}:${size}`, () => portraitSvg(person, size)))
})

export const tvHandlers = [showList, showSearch, showDetails, showCast, showSeasons, posterImages, peopleImages]

// ════════════════════════════════════════════════════════════════════════
// Posters, drawn in code: flat shapes and title typography, tinted by genre.
// ════════════════════════════════════════════════════════════════════════
const W = 420
const H = 590
const r1 = (n) => Math.round(n * 10) / 10

// [background, main, accent, ink (text)]
const PALETTES = {
  Drama: ['#083F58', '#01C5AC', '#FEB800', '#F4FFFB'],
  Comedy: ['#FEB800', '#F70677', '#013E8E', '#13121F'],
  'Science-Fiction': ['#070B1A', '#01C5AC', '#9A03B7', '#E6FFFA'],
  Crime: ['#111E3D', '#F70677', '#FEB800', '#FFFFFF'],
  Mystery: ['#24103A', '#9A03B7', '#01C5AC', '#F3E8FF'],
  Food: ['#FFF1DC', '#FD7701', '#017B6B', '#3B1B00'],
  Nature: ['#017B6B', '#B8F2E6', '#FEB800', '#FFFFFF'],
  Children: ['#0197D8', '#FEB800', '#F70677', '#FFFFFF'],
  Family: ['#01C5AC', '#FFFFFF', '#F70677', '#072A33'],
  Fantasy: ['#2E0A4F', '#FEB800', '#F70677', '#FFF4DC'],
  History: ['#F2E5CA', '#013E8E', '#A23B12', '#1E1A14'],
  Romance: ['#FFD3E6', '#F70677', '#9A03B7', '#4A0628'],
  Music: ['#9A03B7', '#F70677', '#FEB800', '#FFFFFF'],
  Sports: ['#FD7701', '#013E8E', '#FFFFFF', '#FFFFFF'],
  Travel: ['#0197D8', '#FD7701', '#FFF1DC', '#FFFFFF'],
  Medical: ['#E3F6F3', '#017B6B', '#F70677', '#083F58'],
  Legal: ['#013E8E', '#FEB800', '#FFFFFF', '#FFFFFF'],
  Supernatural: ['#0D2B2B', '#B8F2E6', '#9A03B7', '#E9FFFB'],
  Espionage: ['#16161C', '#F70677', '#E8E8E8', '#FFFFFF'],
  Western: ['#F4C27A', '#8A3300', '#FD7701', '#3A1500'],
  DIY: ['#FEB800', '#070B1A', '#01C5AC', '#070B1A'],
  Adventure: ['#013E8E', '#FEB800', '#01C5AC', '#FFFFFF'],
  Anime: ['#BFE9FF', '#F70677', '#0197D8', '#18264A'],
  Thriller: ['#070B1A', '#FD7701', '#F70677', '#FFFFFF'],
  // Palettes for single posters
  Pickle: ['#FEB800', '#3F8F3A', '#F70677', '#14210F'],
  Storm: ['#0F2236', '#7FD3FF', '#FEB800', '#FFFFFF'],
  Frost: ['#0E2340', '#BFE6FF', '#01C5AC', '#FFFFFF'],
  Robot: ['#E9F7FF', '#0197D8', '#FD7701', '#0B2540'],
  Ocean: ['#013E8E', '#01C5AC', '#FEB800', '#FFFFFF'],
  Snow: ['#9FD8F5', '#013E8E', '#F70677', '#0B1F3A'],
  Inn: ['#3A1F4F', '#FEB800', '#F70677', '#FFF4DC'],
  Royal: ['#13245C', '#FEB800', '#F70677', '#FFF4DC'],
  Ice: ['#DDF3FF', '#013E8E', '#01C5AC', '#0B1F3A'],
  Chili: ['#F70677', '#FEB800', '#070B1A', '#FFFFFF'],
  Soup: ['#FFE8C7', '#FD7701', '#017B6B', '#3B1B00'],
  Dusk: ['#2B1650', '#FD7701', '#FEB800', '#FFFFFF'],
  Night: ['#0A1230', '#FEB800', '#F70677', '#FFFFFF'],
  Owl: ['#3E1C64', '#FD7701', '#FEB800', '#FFFFFF'],
  Volcano: ['#1A0F1F', '#FD7701', '#F70677', '#FFFFFF'],
  Candy: ['#FFD3E6', '#F70677', '#0197D8', '#3A0A2A'],
  Lagoon: ['#BFF3EA', '#017B6B', '#FD7701', '#073B3A'],
  Ranch: ['#FD7701', '#5A1E00', '#FEB800', '#FFF4DC'],
  Cafe: ['#3B2416', '#FEB800', '#01C5AC', '#FFF1DC'],
  Glass: ['#07131F', '#01C5AC', '#F70677', '#E6FFFA'],
  Garden: ['#C7F1D3', '#017B6B', '#F70677', '#073B2A'],
  Clay: ['#F3D6BE', '#B4532A', '#013E8E', '#3A1A0A'],
  Moss: ['#E9EFD9', '#4E7A3A', '#017B6B', '#1F2A14'],
  Witch: ['#3B1066', '#B8F2E6', '#FEB800', '#FFFFFF'],
  Stage: ['#14142B', '#FEB800', '#F70677', '#FFFFFF'],
}

function paletteOf(s) {
  const [bg, main, accent, ink] = PALETTES[s.poster.palette] ?? PALETTES[s.genres.find((g) => PALETTES[g])] ?? PALETTES.Drama
  return { bg, main, accent, ink }
}

// Mixes two colours: t = 0 gives a, t = 1 gives b.
function mix(a, b, t) {
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const [x, y] = [rgb(a), rgb(b)]
  return `#${x
    .map((v, i) =>
      Math.round(v + (y[i] - v) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

// ── Type ────────────────────────────────────────────────────────────────
// An image cannot load web fonts, so posters use fonts that come with the operating system.
// `up` and `low` are rough widths compared with Arial; `cap` is the height of a capital letter.
const FONTS = {
  heavy: {
    family: "'Arial Black', 'Segoe UI Black', 'Helvetica Neue', Arial, sans-serif",
    weight: 900,
    up: 1.13,
    low: 1.28,
    cap: 0.72,
  },
  condensed: { family: "Impact, Haettenschweiler, 'Arial Narrow', sans-serif", weight: 400, up: 0.84, low: 0.98, cap: 0.79 },
  sans: { family: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", weight: 700, up: 1.02, low: 1.08, cap: 0.7 },
  serif: { family: "Georgia, 'Times New Roman', serif", weight: 700, up: 1.12, low: 1.18, cap: 0.69 },
  rounded: { family: "'Trebuchet MS', 'Segoe UI', sans-serif", weight: 700, up: 1.0, low: 1.05, cap: 0.71 },
  mono: { family: "'Courier New', Courier, monospace", weight: 700, mono: 0.6, cap: 0.6 },
}

// Arial's character widths (in 1/1000 em), the base for estimating how wide a line will be.
const WIDTHS = Object.fromEntries([
  ...[...' .,:;!|'].map((c) => [c, 278]),
  ["'", 191],
  ['’', 222],
  ['?', 556],
  ['&', 667],
  ['-', 333],
  ['(', 333],
  [')', 333],
  ...[...'abdeghnopqu0123456789'].map((c) => [c, 556]),
  ...[...'cksvxyz'].map((c) => [c, 500]),
  ...[...'ijl'].map((c) => [c, 222]),
  ...[...'ft'].map((c) => [c, 278]),
  ['r', 333],
  ['m', 833],
  ['w', 722],
  ...[...'ABEKPSVXY'].map((c) => [c, 667]),
  ...[...'CDHNRU'].map((c) => [c, 722]),
  ...[...'FTZ'].map((c) => [c, 611]),
  ...[...'GOQ'].map((c) => [c, 778]),
  ['I', 278],
  ['J', 500],
  ['L', 556],
  ['M', 833],
  ['W', 944],
])

const plain = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '')

// Estimated width of a line in em.
function measure(text, font, spacing = 0) {
  const chars = [...plain(text)]
  if (font.mono) return chars.length * font.mono + spacing * (chars.length - 1)
  let em = 0
  for (const ch of chars) {
    const upper = ch !== ch.toLowerCase() || /[0-9&?]/.test(ch)
    em += ((WIDTHS[ch] ?? (upper ? 700 : 556)) / 1000) * (upper ? font.up : font.low)
  }
  return em + spacing * (chars.length - 1)
}

// Greedy word wrap by characters.
function wrap(text, maxChars) {
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (line && `${line} ${word}`.length > maxChars) {
      lines.push(line)
      line = word
    } else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines
}

// One word per line, but small words ("a", "of", "&"…) stay with the next one.
function stack(text) {
  const lines = []
  let carry = ''
  for (const word of text.split(/\s+/)) {
    if (word.length <= 2 || /^(the|and|of)$/i.test(word)) carry = carry ? `${carry} ${word}` : word
    else {
      lines.push(carry ? `${carry} ${word}` : word)
      carry = ''
    }
  }
  if (carry && lines.length) lines[lines.length - 1] += ` ${carry}`
  else if (carry) lines.push(carry)
  return lines
}

// One line of text. Lines that nearly fill their space get a fixed textLength, so they fit with any system font.
function text(str, { x, y, size, font, fill, anchor = 'middle', width = Infinity, spacing = 0, stroke, transform, opacity }) {
  const natural = measure(str, font, spacing) * size
  const attrs = [
    transform ? `transform="${transform}"` : `x="${r1(x)}" y="${r1(y)}"`,
    `font-family="${font.family}"`,
    `font-weight="${font.weight}"`,
    `font-size="${r1(size)}"`,
    `text-anchor="${anchor}"`,
    spacing ? `letter-spacing="${r1(spacing * size)}"` : '',
    stroke ? `fill="none" stroke="${stroke}" stroke-width="${r1(Math.max(1.5, size * 0.035))}"` : `fill="${fill}"`,
    opacity != null ? `opacity="${opacity}"` : '',
    natural > width * 0.8 ? `textLength="${r1(Math.min(natural, width))}" lengthAdjust="spacingAndGlyphs"` : '',
  ]
  return `<text ${attrs.filter(Boolean).join(' ')}>${xml(str)}</text>`
}

// A block of title lines, sized so the longest line fits `width`. Give `top` or `bottom` (or `middle`).
function title(
  lines,
  {
    x = W / 2,
    top,
    bottom,
    middle,
    width,
    maxSize,
    font,
    fill,
    anchor = 'middle',
    lineHeight = 1.08,
    upper = false,
    spacing = 0,
  },
) {
  const shown = lines.map((l) => (upper ? l.toUpperCase() : l))
  const size = Math.min(maxSize, width / Math.max(...shown.map((l) => measure(l, font, spacing))))
  const cap = font.cap * size
  const step = size * lineHeight
  const height = cap + step * (shown.length - 1)
  const y0 = top ?? (middle != null ? middle - height / 2 : bottom - height)
  const svg = shown.map((l, i) => text(l, { x, y: y0 + cap + i * step, size, font, fill, anchor, width, spacing })).join('')
  return { svg, top: y0, height, size }
}

// Small spaced capitals: channel names, genres.
function label(str, { x = W / 2, y, fill, size = 13, anchor = 'middle', maxWidth = W - 80, opacity }) {
  const font = FONTS.sans
  const s = str.toUpperCase()
  const fitted = Math.min(size, maxWidth / measure(s, font, 0.18))
  return text(s, { x, y, size: fitted, font, fill, anchor, spacing: 0.18, opacity })
}

const channelName = (s) => CHANNELS[s.channel]?.name ?? ''
const genreLine = (s) => s.genres.slice(0, 3).join(' · ')

// ── Shape helpers ───────────────────────────────────────────────────────
const op = (o) => (o != null && o < 1 ? ` opacity="${r1(o * 100) / 100}"` : '')
const rect = (x, y, w, h, fill, o, extra = '') =>
  `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"${op(o)}${extra}/>`
const circle = (cx, cy, r, fill, o, extra = '') =>
  `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${fill}"${op(o)}${extra}/>`
const ring = (cx, cy, r, stroke, width, o, extra = '') =>
  `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="none" stroke="${stroke}" stroke-width="${r1(width)}"${op(o)}${extra}/>`
const ellipse = (cx, cy, rx, ry, fill, o, extra = '') =>
  `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${fill}"${op(o)}${extra}/>`
// Points as a flat list: [x1, y1, x2, y2, …]
const poly = (points, fill, o, extra = '') => {
  const pairs = []
  for (let i = 0; i < points.length; i += 2) pairs.push(`${r1(points[i])},${r1(points[i + 1])}`)
  return `<polygon points="${pairs.join(' ')}" fill="${fill}"${op(o)}${extra}/>`
}
const path = (d, fill, o, extra = '') => `<path d="${d}" fill="${fill}"${op(o)}${extra}/>`
const line = (x1, y1, x2, y2, stroke, width, o, extra = '') =>
  `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${stroke}" stroke-width="${r1(width)}" stroke-linecap="round"${op(o)}${extra}/>`
const background = (fill) => rect(0, 0, W, H, fill)

function stars(random, count, fill, area = [0, 0, W, H]) {
  let out = ''
  for (let i = 0; i < count; i++) {
    const [x0, y0, x1, y1] = area
    out += circle(x0 + random() * (x1 - x0), y0 + random() * (y1 - y0), 0.8 + random() * 1.8, fill, 0.35 + random() * 0.6)
  }
  return out
}

// A row of mountain peaks between baseY and baseY - height.
function ridge(random, baseY, height, fill, step = 90) {
  const points = [[-20, H]]
  let x = -20
  let up = random() < 0.5
  while (x < W + 20) {
    points.push([x, up ? baseY - height * (0.55 + random() * 0.45) : baseY - height * random() * 0.25])
    x += step * (0.6 + random() * 0.6)
    up = !up
  }
  points.push([W + 20, baseY - height * 0.2], [W + 20, H])
  return { svg: poly(points.flat(), fill), peaks: points.filter(([, y], i) => i > 0 && y < baseY - height * 0.5) }
}

// A wavy band from y downwards.
function wave(y, amplitude, length, phase, fill, o) {
  let d = `M -20 ${r1(y)}`
  for (let x = -20; x < W + 40; x += length / 2) {
    const up = Math.round((x + phase) / (length / 2)) % 2 === 0
    d += ` Q ${r1(x + length / 4)} ${r1(y + (up ? -amplitude : amplitude))} ${r1(x + length / 2)} ${r1(y)}`
  }
  d += ` L ${W + 40} ${H} L -20 ${H} Z`
  return path(d, fill, o)
}

// ── The styles ──────────────────────────────────────────────────────────
// Each one draws the whole poster for a show `s` with palette `p`, its own random numbers and options `o`.
const STYLES = {
  // A light (lighthouse lamp, stage spotlights) cutting through the dark.
  beam(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'serif']
    if (o.twin) {
      // Two spotlights from the top corners meeting on a stage
      out += rect(0, 400, W, H - 400, mix(p.bg, '#000000', 0.35))
      out += poly([50, 0, W / 2 - 120, 420, W / 2 + 40, 420], p.main, 0.35)
      out += poly([W - 50, 0, W / 2 - 40, 420, W / 2 + 120, 420], p.accent, 0.3)
      out += ellipse(W / 2, 420, 150, 22, p.ink, 0.25) + ellipse(W / 2, 420, 90, 12, p.ink, 0.35)
      out += circle(50, 0, 34, p.main) + circle(W - 50, 0, 34, p.accent)
      const t = title(wrap(s.name, 12), { top: 110, width: W - 80, maxSize: 64, font, fill: p.ink, upper: true })
      out += t.svg
    } else {
      const left = random() < 0.5
      const sx = left ? 92 : W - 92
      const sy = 128
      const far = left ? W + 30 : -30
      out += rect(0, 330, W, H - 330, mix(p.bg, '#000000', 0.3))
      out += poly([sx, sy, far, 20, far, 290], p.main, 0.18)
      out += poly([sx, sy, far, 95, far, 200], p.main, 0.3)
      out += circle(sx, sy, 70, p.main, 0.1) + circle(sx, sy, 40, p.main, 0.22) + circle(sx, sy, 17, p.ink)
      // Light dancing on the water
      for (let i = 0; i < 6; i++) {
        const w = 40 + i * 26
        out += rect(left ? sx + 30 + i * 18 : sx - 30 - i * 18 - w, 352 + i * 15, w, 3, p.main, 0.5 - i * 0.06)
      }
      const t = title(wrap(s.name, 13), { bottom: H - 78, width: W - 70, maxSize: 62, font, fill: p.ink })
      out += t.svg + rect(W / 2 - 30, t.top - 26, 60, 3, p.accent)
    }
    return out + label(channelName(s), { y: H - 36, fill: p.ink, opacity: 0.75 })
  },

  // A striped retro sun over the horizon.
  sun(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'heavy']
    const cy = 318
    out += circle(W / 2, cy, 138, p.main)
    for (let i = 0; i < 5; i++) out += rect(0, cy + 14 + i * 20, W, 3 + i * 2.4, p.bg)
    const ground = mix(p.main, '#000000', 0.25)
    if (o.hills) {
      out += rect(0, 470, W, H - 470, ground)
      out += ellipse(90, 470, 240, 90, mix(p.main, p.bg, 0.35)) + ellipse(360, 500, 260, 100, ground)
    } else if (o.road) {
      out += rect(0, 400, W, H - 400, p.accent)
      out += poly([W / 2 - 14, 400, W / 2 + 14, 400, W / 2 + 190, H, W / 2 - 190, H], mix(p.bg, '#000000', 0.35))
      for (let i = 0; i < 4; i++) {
        const y = 412 + i * i * 14 + i * 20
        const h = 8 + i * 9
        out += poly([W / 2 - 2 - i, y, W / 2 + 2 + i, y, W / 2 + 3 + i * 1.6, y + h, W / 2 - 3 - i * 1.6, y + h], p.ink)
      }
    } else {
      out += rect(0, 400, W, H - 400, ground)
      // Flat-topped hills on the horizon
      out += poly([20, 400, 50, 364, 130, 364, 160, 400], ground) + poly([290, 400, 312, 376, 372, 376, 396, 400], ground)
    }
    const t = title(wrap(s.name, 12), { top: 46, width: W - 64, maxSize: 66, font, fill: p.ink, upper: true })
    out += t.svg
    return out + label(channelName(s), { y: H - 34, fill: o.road || o.hills ? p.ink : p.bg, opacity: 0.85 })
  },

  // The title is the picture: one word per line, each as wide as the poster.
  bigtype(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'heavy']
    const lines = stack(s.name).map((l) => l.toUpperCase())
    const width = W - 52
    const gap = 12
    let sizes = lines.map((l) => Math.min(160, width / measure(l, font)))
    const room = H - 170
    const total = () => sizes.reduce((sum, size) => sum + size * font.cap, 0) + gap * (lines.length - 1)
    if (total() > room) {
      const k = (room - gap * (lines.length - 1)) / (total() - gap * (lines.length - 1))
      sizes = sizes.map((size) => size * k)
    }
    let y = 40 + (room - total()) / 2
    const colors = [p.ink, p.main]
    let type = ''
    lines.forEach((l, i) => {
      y += sizes[i] * font.cap
      const outline = o.outline && i % 2 === 1
      type += text(l, { x: W / 2, y, size: sizes[i], font, fill: colors[i % 2], stroke: outline ? p.main : null, width })
      y += gap
    })
    out += o.tilt ? `<g transform="rotate(-5 ${W / 2} ${H / 2 - 40})">${type}</g>` : type
    out += rect(0, H - 96, W, 96, p.main)
    out += circle(40, H - 96, 9, p.accent) + circle(64, H - 96, 9, p.ink) + circle(88, H - 96, 9, p.accent)
    out += label(genreLine(s), { y: H - 56, fill: p.bg, size: 14 })
    return out + label(channelName(s), { y: H - 30, fill: p.bg, size: 11, opacity: 0.8 })
  },

  // Circles: a target, a Ferris wheel, a clock or radio waves.
  rings(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'sans']
    const cx = W / 2
    const cy = 228
    if (o.spokes) {
      out += line(cx, cy, cx - 90, 420, p.ink, 8) + line(cx, cy, cx + 90, 420, p.ink, 8)
      out += ring(cx, cy, 150, p.main, 10) + ring(cx, cy, 104, p.main, 3, 0.7)
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2
        out += line(cx, cy, cx + Math.cos(a) * 150, cy + Math.sin(a) * 150, p.main, 3, 0.8)
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + Math.PI / 12
        out += circle(cx + Math.cos(a) * 150, cy + Math.sin(a) * 150 + 12, 14, i % 3 ? p.accent : p.ink)
      }
      out += circle(cx, cy, 16, p.accent)
    } else if (o.ticks) {
      out += circle(cx, cy, 168, p.main) + circle(cx, cy, 150, p.bg)
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2
        const long = i % 5 === 0
        const r0 = long ? 122 : 136
        out += line(
          cx + Math.cos(a) * r0,
          cy + Math.sin(a) * r0,
          cx + Math.cos(a) * 142,
          cy + Math.sin(a) * 142,
          p.main,
          long ? 6 : 2,
        )
      }
      const hand = (turns, length, width, color) => {
        const a = turns * Math.PI * 2 - Math.PI / 2
        return line(cx, cy, cx + Math.cos(a) * length, cy + Math.sin(a) * length, color, width)
      }
      out +=
        hand(10 / 12 + 10 / 720, 72, 9, p.ink) +
        hand(10 / 60, 108, 5, p.ink) +
        hand(0.52, 118, 2, p.accent) +
        circle(cx, cy, 10, p.accent)
    } else if (o.waves) {
      const ox = 92
      const oy = 330
      out += stars(random, 30, p.ink, [0, 0, W, 300])
      for (let i = 5; i >= 0; i--) out += ring(ox, oy, 46 + i * 52, i % 2 ? p.accent : p.main, 14, 1 - i * 0.13)
      out += circle(ox, oy, 24, p.ink)
      // The rooftop edge
      out += rect(0, 430, W, H - 430, p.bg) + rect(0, 430, W, 4, p.main)
    } else {
      const colors = [p.main, p.bg, p.accent, p.bg]
      for (let i = 0; i < 7; i++) out += circle(cx, cy, 190 - i * 27, i === 6 ? p.ink : colors[i % 4])
    }
    const t = title(wrap(s.name, 14), { bottom: H - 72, width: W - 64, maxSize: 58, font, fill: p.ink })
    out += t.svg
    return out + label(channelName(s), { y: H - 34, fill: p.ink, opacity: 0.7 })
  },

  // Bold diagonal bands with the title in a box, or a treasure-map route.
  stripes(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'heavy']
    if (o.route) {
      for (let x = 30; x < W; x += 60) out += line(x, 0, x, H, p.ink, 1, 0.12)
      for (let y = 30; y < H; y += 60) out += line(0, y, W, y, p.ink, 1, 0.12)
      out += `<path d="M 40 520 C 120 420, 40 340, 170 300 S 260 160, 340 120" fill="none" stroke="${p.main}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>`
      out += circle(40, 520, 10, p.accent) + circle(170, 300, 8, p.accent)
      out += line(322, 102, 358, 138, p.accent, 9) + line(358, 102, 322, 138, p.accent, 9)
      out +=
        ring(W - 70, H - 150, 38, p.ink, 2, 0.6) +
        poly([W - 70, H - 196, W - 62, H - 150, W - 70, H - 104, W - 78, H - 150], p.ink, 0.6)
      const t = title(wrap(s.name, 10), { top: 44, x: 36, anchor: 'start', width: 220, maxSize: 56, font, fill: p.ink })
      out += t.svg
      return out + label(channelName(s), { y: H - 36, fill: p.ink, opacity: 0.75 })
    }
    const colors = [p.main, p.accent, p.bg, p.main, p.ink, p.bg]
    let bands = ''
    for (let i = -6; i < 16; i++) bands += rect(-400, i * 52, 1300, 30, colors[(i + 12) % colors.length])
    out += `<g transform="rotate(-28 ${W / 2} ${H / 2})">${bands}</g>`
    const lines = wrap(s.name, 11)
    const t = title(lines, { middle: H * 0.58, width: W - 120, maxSize: 60, font, fill: p.ink, upper: true })
    out += rect(34, t.top - 34, W - 68, t.height + 94, p.bg, 1, ` stroke="${p.ink}" stroke-width="5"`)
    out += t.svg
    return out + label(channelName(s), { y: t.top + t.height + 42, fill: p.ink, size: 12, opacity: 0.75 })
  },

  // A city at night (or one big courtyard house) with lit windows.
  skyline(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'condensed']
    out += stars(random, 26, p.ink, [0, 0, W, 260])
    out += circle(W - 92, 236, 42, p.accent) + circle(W - 76, 226, 38, p.bg)
    const dark = mix(p.bg, '#000000', 0.45)
    const unlit = mix(p.bg, '#FFFFFF', 0.08)
    if (o.courtyard) {
      const top = 262
      out += rect(30, top, W - 60, H - top, dark)
      for (let floor = 0; floor < 5; floor++) {
        const y = top + 20 + floor * 62
        out += rect(30, y + 44, W - 60, 5, p.main, 0.9)
        for (let i = 0; i < 6; i++) out += rect(50 + i * 58, y, 34, 36, random() < 0.35 ? p.accent : unlit, 1, ' rx="4"')
      }
      // The gate to the courtyard
      out += path(`M 70 ${H} V ${H - 50} A 40 40 0 0 1 150 ${H - 50} V ${H} Z`, p.bg)
    } else {
      let x = -8
      while (x < W) {
        const w = 46 + random() * 52
        const h = 150 + random() * 180
        const top = H - 40 - h
        out += rect(x, top, w - 4, h + 40, random() < 0.5 ? dark : mix(p.bg, p.main, 0.12))
        for (let wy = top + 14; wy < H - 54; wy += 20) {
          for (let wx = x + 9; wx < x + w - 18; wx += 14) out += rect(wx, wy, 7, 10, random() < 0.22 ? p.accent : unlit)
        }
        x += w
      }
      out += rect(0, H - 40, W, 40, p.main)
    }
    const t = title(wrap(s.name, 13), { top: 46, width: W - 64, maxSize: 70, font, fill: p.ink, upper: true, lineHeight: 1.02 })
    out += t.svg
    return out + label(channelName(s), { y: H - 15, fill: o.courtyard ? p.ink : p.bg, size: 11, opacity: 0.9 })
  },

  // Mountain ranges: snowy, volcanic, or over a cold harbour.
  peaks(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'heavy']
    out += stars(random, o.snow ? 0 : 30, p.ink, [0, 0, W, 300])
    if (!o.lava) out += circle(W * 0.7, 262, o.moon ? 58 : 46, o.moon ? p.main : p.accent)
    if (o.lava) {
      out += circle(W / 2, 250, 120, p.main, 0.12) + circle(W / 2, 250, 70, p.accent, 0.18)
      // Smoke
      for (let i = 0; i < 4; i++)
        out += circle(W / 2 - 24 + i * 20 + random() * 10, 246 - i * 20, 16 + i * 6, '#FFFFFF', 0.1 + i * 0.03)
      out += ridge(random, 470, 150, mix(p.bg, p.main, 0.25)).svg
      out += poly([40, H, W / 2 - 46, 268, W / 2 + 46, 268, W - 40, H], mix(p.bg, '#000000', 0.2))
      out += poly([W / 2 - 46, 268, W / 2 + 46, 268, W / 2 + 30, 300, W / 2 - 30, 300], p.main)
      out += path(
        `M ${W / 2 - 10} 296 C ${W / 2 - 30} 360, ${W / 2 + 20} 420, ${W / 2 - 16} ${H} L ${W / 2 + 10} ${H} C ${W / 2 + 40} 430, ${W / 2} 360, ${W / 2 + 14} 296 Z`,
        p.main,
      )
    } else {
      const back = ridge(random, 380, 170, mix(p.bg, p.main, 0.3), 110)
      const mid = ridge(random, 440, 150, mix(p.bg, p.main, 0.55), 90)
      out += back.svg
      if (o.snow) for (const [x, y] of back.peaks) out += poly([x, y, x + 18, y + 26, x - 18, y + 26], '#FFFFFF')
      out += mid.svg
      if (o.snow) for (const [x, y] of mid.peaks) out += poly([x, y, x + 16, y + 22, x - 16, y + 22], '#FFFFFF')
      if (o.moon) {
        // A tiny night train crossing the valley
        out += rect(0, 470, W, H - 470, mix(p.bg, '#000000', 0.35))
        for (let i = 0; i < 5; i++)
          out += rect(70 + i * 52, 452, 46, 22, p.main, 1, ' rx="4"') + rect(78 + i * 52, 458, 30, 8, p.bg)
        out += rect(0, 476, W, 3, p.main, 0.6)
      } else {
        out += rect(0, 480, W, H - 480, o.snow ? '#FFFFFF' : mix(p.bg, '#000000', 0.3))
        if (!o.snow) for (let i = 0; i < 5; i++) out += rect(W * 0.7 - 50 + i * 8, 494 + i * 14, 100 - i * 16, 3, p.accent, 0.6)
      }
    }
    // Mixed-case titles may run longer per line than capitals.
    const fill = o.snow ? p.main : p.ink
    const t = title(wrap(s.name, o.moon ? 16 : 13), {
      top: 46,
      width: W - 64,
      maxSize: o.moon ? 54 : 64,
      font,
      fill,
      upper: !o.moon,
    })
    out += t.svg
    return out + label(channelName(s), { y: H - 26, fill: o.snow ? p.main : p.ink, opacity: 0.8 })
  },

  // Layers of waves under the sky; storms and islands optional.
  waves(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'sans']
    if (o.storm) {
      for (let i = 0; i < 6; i++) out += circle(60 + i * 62, 210 + (i % 2) * 18, 54, mix(p.bg, '#FFFFFF', 0.12))
      out += poly([232, 250, 196, 330, 222, 330, 200, 410, 262, 310, 234, 310, 258, 250], p.accent)
    } else {
      out += circle(W * 0.72, 250, 48, p.accent)
    }
    if (o.island) {
      out +=
        ellipse(130, 352, 96, 46, p.main) +
        circle(108, 316, 18, mix(p.main, '#000000', 0.2)) +
        circle(140, 308, 22, mix(p.main, '#000000', 0.2))
    }
    for (let i = 0; i < 5; i++) {
      out += wave(330 + i * 50, 12 + i * 3, 120 - i * 8, i * 37, mix(p.main, mix(p.bg, '#000000', 0.4), i * 0.18), 0.95)
    }
    const t = title(wrap(s.name, 13), { top: 50, width: W - 70, maxSize: 66, font, fill: p.ink, upper: font === FONTS.condensed })
    out += t.svg
    return out + label(channelName(s), { y: H - 28, fill: p.ink, opacity: 0.8 })
  },

  // A grid: lit windows, a stone wall or a dotted halftone.
  dots(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'heavy']
    if (o.shape === 'window') {
      out += rect(40, 40, W - 80, 360, mix(p.bg, '#000000', 0.25), 1, ' rx="12"')
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          const lit = random() < 0.45
          out += rect(64 + col * 78, 62 + row * 66, 56, 46, lit ? p.main : mix(p.bg, '#000000', 0.45), 1, ' rx="6"')
          if (lit && random() < 0.4) out += rect(64 + col * 78, 62 + row * 66, 56, 12, p.accent, 1, ' rx="4"')
        }
      }
    } else if (o.shape === 'stone') {
      for (let row = 0; row < 8; row++) {
        let x = row % 2 ? -30 : -6
        while (x < W) {
          const w = 54 + random() * 46
          out += rect(x, 24 + row * 48, w - 8, 40, mix(p.bg, p.main, 0.15 + random() * 0.35), 1, ' rx="14"')
          if (random() < 0.3) out += ellipse(x + w / 2, 24 + row * 48 + 4, w * 0.3, 9, p.main)
          x += w
        }
      }
      out += rect(0, 410, W, H - 410, p.bg)
    } else {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 8; col++) {
          const x = 36 + col * 50
          const y = 40 + row * 42
          const wave = (Math.sin(col * 0.9 + row * 0.6) + 1) / 2
          const color = random() < 0.12 ? p.accent : wave > 0.6 ? p.main : mix(p.bg, p.ink, 0.18)
          out += circle(x, y, 6 + wave * 12, color)
        }
      }
    }
    const t = title(wrap(s.name, 13), { bottom: H - 80, width: W - 70, maxSize: 60, font, fill: p.ink })
    out += t.svg
    return out + label(channelName(s), { y: H - 40, fill: p.ink, opacity: 0.75 })
  },

  // A classic framed poster with a centred title: crowns, case files, old documents.
  frame(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'serif']
    if (o.dossier) {
      for (let y = 120; y < H - 60; y += 26) out += rect(56, y, W - 112, 1.5, p.ink, 0.12)
      out += rect(40, 40, 140, 36, p.main, 1, ' rx="6"')
      out += label('File 07', { x: 110, y: 64, fill: p.ink, size: 14, maxWidth: 120 })
      out += `<g transform="rotate(-12 ${W / 2} 430)">${rect(W / 2 - 120, 400, 240, 62, 'none', 1, ` stroke="${p.main}" stroke-width="5" rx="8"`)}${label('Top secret', { y: 442, fill: p.main, size: 26, maxWidth: 210 })}</g>`
    } else {
      out += rect(22, 22, W - 44, H - 44, 'none', 1, ` stroke="${p.main}" stroke-width="6"`)
      out += rect(36, 36, W - 72, H - 72, 'none', 1, ` stroke="${p.main}" stroke-width="1.5"`)
      for (const [x, y] of [
        [36, 36],
        [W - 36, 36],
        [36, H - 36],
        [W - 36, H - 36],
      ])
        out += poly([x, y - 10, x + 10, y, x, y + 10, x - 10, y], p.accent)
      out += label(channelName(s), { y: 78, fill: p.main, size: 12 })
    }
    const lines = wrap(s.name, o.dossier ? 12 : 11)
    const t = title(lines, {
      middle: o.dossier ? 250 : 306,
      width: W - 110,
      maxSize: 60,
      font,
      fill: p.ink,
      upper: Boolean(o.dossier),
    })
    if (o.crown) {
      const y = t.top - 40
      out += poly(
        [
          W / 2 - 60,
          y,
          W / 2 - 60,
          y - 48,
          W / 2 - 30,
          y - 22,
          W / 2,
          y - 62,
          W / 2 + 30,
          y - 22,
          W / 2 + 60,
          y - 48,
          W / 2 + 60,
          y,
        ],
        p.main,
      )
      out +=
        circle(W / 2 - 60, y - 52, 7, p.accent) + circle(W / 2, y - 66, 8, p.accent) + circle(W / 2 + 60, y - 52, 7, p.accent)
    } else if (!o.dossier) {
      const y = t.top - 36
      out += line(W / 2 - 90, y, W / 2 - 18, y, p.main, 2) + line(W / 2 + 18, y, W / 2 + 90, y, p.main, 2)
      out += poly([W / 2, y - 9, W / 2 + 9, y, W / 2, y + 9, W / 2 - 9, y], p.accent)
    }
    out += t.svg
    out += label(genreLine(s), {
      y: t.top + t.height + 44,
      fill: o.dossier ? p.ink : p.main,
      size: 12,
      opacity: o.dossier ? 0.7 : 1,
    })
    return out + (o.dossier ? label(channelName(s), { y: H - 40, fill: p.ink, opacity: 0.6 }) : '')
  },

  // Space: a ringed planet, a comet, a moon base or a ring of satellites.
  orbit(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'sans']
    out += stars(random, 70, p.ink)
    let titleAt = 'bottom'
    if (o.comet) {
      for (let i = 0; i < 4; i++) {
        out += poly(
          [300 + i * 4, 140 - i * 6, 60 - i * 10, 360 + i * 30, 80, 400, 310 - i * 2, 172 + i * 4],
          i % 2 ? p.accent : p.main,
          0.22 + i * 0.08,
        )
      }
      out += circle(306, 156, 28, p.ink) + circle(306, 156, 46, p.ink, 0.15)
      out += circle(90, 120, 30, p.accent) + ring(90, 120, 44, p.main, 3, 0.7)
    } else if (o.craters) {
      titleAt = 'top'
      out += circle(80, 250, 34, p.main) + circle(70, 242, 34, p.bg, 0.25)
      out += circle(W / 2, H + 140, 330, p.main)
      for (const [x, y, r] of [
        [90, 470, 30],
        [250, 440, 22],
        [330, 520, 36],
        [170, 540, 18],
      ])
        out += circle(x, y, r, mix(p.main, '#000000', 0.15))
      out += path(`M 210 ${H - 200} a 70 70 0 0 1 140 0 Z`, p.ink, 0.95) + path(`M 120 ${H - 176} a 44 44 0 0 1 88 0 Z`, p.accent)
      out += circle(280, H - 226, 14, p.accent) + circle(164, H - 196, 10, p.ink)
      out += line(280, H - 270, 280, H - 310, p.ink, 3) + poly([280, H - 310, 312, H - 300, 280, H - 290], p.accent)
    } else if (o.satellites) {
      out += circle(W + 20, H - 90, 210, p.main, 0.85) + circle(W + 50, H - 70, 200, p.bg, 0.25)
      out += `<ellipse cx="${W / 2}" cy="230" rx="180" ry="70" fill="none" stroke="${p.ink}" stroke-width="1.5" stroke-dasharray="3 9" opacity="0.6" transform="rotate(-14 ${W / 2} 230)"/>`
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2
        const x = W / 2 + Math.cos(a) * 180
        const y = 230 + Math.sin(a) * 70
        const rot = `rotate(-14 ${W / 2} 230)`
        const color = i === 6 ? p.accent : p.ink
        out += `<g transform="${rot}">${rect(x - 6, y - 6, 12, 12, color)}${rect(x - 22, y - 3, 13, 6, color, 0.7)}${rect(x + 9, y - 3, 13, 6, color, 0.7)}</g>`
      }
      out += circle(W / 2, 230, 26, p.accent, 0.2) + circle(W / 2, 230, 8, p.accent)
    } else {
      const cx = W / 2 + (random() - 0.5) * 50
      const cy = 236
      const tilt = `rotate(-16 ${r1(cx)} ${cy})`
      const ringAttrs = `fill="none" stroke="${p.accent}" stroke-width="12"${o.ring === 'dashed' ? ' stroke-dasharray="18 10"' : ''}`
      out += `<path d="M ${r1(cx - 190)} ${cy} A 190 46 0 0 1 ${r1(cx + 190)} ${cy}" ${ringAttrs} transform="${tilt}"/>`
      // The planet's cloud bands stay inside its outline thanks to a clip path.
      const clip = `planet-${s.id}`
      out += `<clipPath id="${clip}">${circle(cx, cy, 104, '#000000')}</clipPath>`
      out += circle(cx, cy, 104, p.main)
      out += `<g clip-path="url(#${clip})">${[0, 1, 2, 3].map((i) => rect(cx - 110, cy - 70 + i * 44, 220, 14 + (i % 2) * 10, mix(p.main, i % 2 ? p.bg : '#FFFFFF', 0.22))).join('')}${circle(cx + 50, cy + 40, 104, '#000000', 0.12)}</g>`
      out += `<path d="M ${r1(cx - 190)} ${cy} A 190 46 0 0 0 ${r1(cx + 190)} ${cy}" ${ringAttrs} transform="${tilt}"/>`
      out += circle(cx + 150, cy - 120, 16, p.ink, 0.9)
    }
    const t =
      titleAt === 'top'
        ? title(wrap(s.name, 12), { top: 48, width: W - 64, maxSize: 62, font, fill: p.ink })
        : title(wrap(s.name, 14), {
            bottom: H - 76,
            width: W - 64,
            maxSize: 60,
            font,
            fill: p.ink,
            upper: font !== FONTS.rounded,
          })
    out += t.svg
    return out + label(channelName(s), { y: titleAt === 'top' ? t.top + t.height + 34 : H - 36, fill: p.ink, opacity: 0.75 })
  },

  // A tall band with the title running upwards, and a slanted coloured panel.
  split(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'heavy']
    const lines = wrap(s.name.toUpperCase(), 14).slice(0, 3)
    const n = lines.length
    const length = H - 96
    let size = Math.min(84, length / Math.max(...lines.map((l) => measure(l, font))))
    size = Math.min(size, 150 / (font.cap + (n - 1) * 1.04))
    const band = 40 + size * (font.cap + (n - 1) * 1.04) + 26
    out += poly([band + 40, 0, W, 0, W, H, band, H], p.main)
    const cx = (band + 20 + W) / 2
    if (o.cross) {
      out += circle(cx, 210, 80, p.accent) + rect(cx - 16, 160, 32, 100, '#FFFFFF') + rect(cx - 50, 194, 100, 32, '#FFFFFF')
      for (let i = 0; i < 3; i++) out += ring(cx, 210, 104 + i * 26, p.bg, 2, 0.5 - i * 0.14)
    } else if (o.umbrella) {
      for (let i = 0; i < 26; i++) {
        const x = band + 30 + random() * (W - band - 30)
        const y = random() * H
        out += line(x, y, x - 8, y + 22, p.bg, 2, 0.6)
      }
      out += path(`M ${cx - 90} 250 A 90 90 0 0 1 ${cx + 90} 250 Z`, p.accent)
      for (let i = 0; i < 4; i++) out += path(`M ${cx - 90 + i * 45} 250 a 22.5 16 0 0 0 45 0 Z`, p.main)
      out +=
        line(cx, 160, cx, 340, p.ink, 6) +
        `<path d="M ${cx} 340 a 16 16 0 0 1 -32 0" fill="none" stroke="${p.ink}" stroke-width="6" stroke-linecap="round"/>`
    } else if (o.duel) {
      // A bowl of noodles and two pairs of chopsticks going for it from both sides
      for (const side of [-1, 1]) {
        for (const k of [0, 14]) out += line(cx + side * (118 - k), 118 + k, cx + side * (16 + k * 0.5), 262, p.accent, 7)
      }
      for (let i = 0; i < 3; i++) {
        out += `<path d="M ${cx - 88} ${290 - i * 12} q 22 -14 44 0 t 44 0 t 44 0 t 44 0" fill="none" stroke="#FFF1B8" stroke-width="6" stroke-linecap="round"/>`
      }
      out += path(`M ${cx - 112} 296 A 112 112 0 0 0 ${cx + 112} 296 Z`, p.bg)
      out += rect(cx - 120, 290, 240, 12, mix(p.bg, '#000000', 0.2), 1, ' rx="6"')
    } else if (o.skate) {
      for (let i = 0; i < 5; i++) {
        out += `<path d="M ${band + 20} ${360 + i * 40} C ${cx - 40} ${300 + i * 30}, ${cx + 40} ${440 + i * 20}, ${W + 10} ${330 + i * 44}" fill="none" stroke="#FFFFFF" stroke-width="${3 - i * 0.4}" opacity="0.7"/>`
      }
      out += circle(cx, 200, 70, p.accent) + circle(cx + 40, 170, 30, p.bg, 0.9)
    } else {
      out += circle(cx, 220, 80, p.accent) + circle(cx + 34, 190, 26, p.ink)
    }
    lines.forEach((l, i) => {
      const x = 40 + size * font.cap + i * size * 1.04
      out += text(l, {
        size,
        font,
        fill: p.ink,
        anchor: 'start',
        width: length,
        transform: `translate(${r1(x)} ${H - 48}) rotate(-90)`,
      })
    })
    return out + label(channelName(s), { x: (band + 40 + W) / 2, y: H - 36, fill: p.bg, maxWidth: W - band - 60 })
  },

  // Bauhaus-style tiles: quarter circles, halves, triangles and squares.
  blocks(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'heavy']
    const colors = [p.main, p.accent, p.ink, mix(p.bg, p.main, 0.4)]
    const c = 112
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = 42 + col * c
        const y = 38 + row * c
        const fill = colors[Math.floor(random() * colors.length)]
        const tile = random() < 0.45 ? colors[Math.floor(random() * colors.length)] : null
        if (tile && tile !== fill) out += rect(x, y, c, c, tile)
        const turn = `rotate(${Math.floor(random() * 4) * 90} ${x + c / 2} ${y + c / 2})`
        const kind = Math.floor(random() * 5)
        const shape = [
          `<path d="M ${x} ${y} H ${x + c} A ${c} ${c} 0 0 1 ${x} ${y + c} Z" fill="${fill}"/>`,
          `<path d="M ${x} ${y + c / 2} A ${c / 2} ${c / 2} 0 0 1 ${x + c} ${y + c / 2} Z" fill="${fill}"/>`,
          circle(x + c / 2, y + c / 2, c * 0.38, fill),
          poly([x, y + c, x + c / 2, y, x + c, y + c], fill),
          rect(x + c * 0.18, y + c * 0.18, c * 0.64, c * 0.64, fill),
        ][kind]
        out += kind === 2 ? shape : `<g transform="${turn}">${shape}</g>`
      }
    }
    const t = title(wrap(s.name, 12), {
      x: 42,
      anchor: 'start',
      bottom: H - 74,
      width: W - 84,
      maxSize: 66,
      font,
      fill: p.ink,
      upper: true,
      lineHeight: 1.02,
    })
    out += t.svg
    return out + label(channelName(s), { x: 42, anchor: 'start', y: H - 40, fill: p.ink, opacity: 0.75 })
  },

  // Floating circles: spices, bubbles, clouds.
  bubbles(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'rounded']
    if (o.clouds) {
      const cloud = (x, y, k, fill, alpha) =>
        circle(x - 34 * k, y + 8 * k, 26 * k, fill, alpha) +
        circle(x, y - 6 * k, 38 * k, fill, alpha) +
        circle(x + 36 * k, y + 6 * k, 28 * k, fill, alpha) +
        rect(x - 60 * k, y + 6 * k, 124 * k, 28 * k, fill, alpha, ` rx="${r1(14 * k)}"`)
      if (o.rain) {
        for (let i = 0; i < 16; i++) {
          const x = 70 + random() * 280
          const y = 230 + random() * 150
          out += line(x, y, x - 6, y + 18, p.main, 3, 0.8)
        }
        out += cloud(210, 190, 1.6, p.main) + cloud(330, 120, 0.8, p.ink, 0.5)
        // A witch's hat
        out +=
          poly([290, 356, 350, 356, 338, 270], p.accent) +
          ellipse(320, 358, 54, 11, p.accent) +
          rect(298, 338, 46, 9, mix(p.accent, '#000000', 0.3))
      } else {
        out += cloud(110, 130, 1, '#FFFFFF') + cloud(320, 210, 1.2, '#FFFFFF') + cloud(150, 330, 0.9, '#FFFFFF', 0.85)
        // A floating island and a flying letter
        out += path(`M 230 330 a 70 34 0 0 0 140 0 Z`, '#8A5A2B') + rect(226, 318, 148, 16, '#3FA34D', 1, ' rx="8"')
        out += `<g transform="rotate(-12 180 236)">${rect(150, 216, 64, 42, p.main, 1, ' rx="4"')}<path d="M 152 219 L 182 242 L 212 219" fill="none" stroke="#FFFFFF" stroke-width="3"/></g>`
        out += `<path d="M 226 220 q 30 -30 70 -10" fill="none" stroke="${p.accent}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>`
      }
    } else {
      const colors = [p.main, p.accent, p.ink, mix(p.bg, p.main, 0.45)]
      const bubbles = Array.from({ length: 24 }, () => ({
        x: 20 + random() * (W - 40),
        y: 24 + random() * 360,
        r: 10 + random() ** 2 * 70,
      }))
      bubbles.sort((a, b) => b.r - a.r)
      for (const b of bubbles) {
        const color = colors[Math.floor(random() * colors.length)]
        out += o.outlined
          ? ring(b.x, b.y, b.r, color === p.ink ? p.main : color, 3 + b.r / 18, 0.9)
          : circle(b.x, b.y, b.r, color, 0.92)
      }
    }
    const t = title(wrap(s.name, 16), { bottom: H - 80, width: W - 70, maxSize: 60, font, fill: p.ink })
    out += t.svg
    return out + label(channelName(s), { y: H - 40, fill: p.ink, opacity: 0.75 })
  },

  // A friendly character for the youngest viewers.
  critter(s, p, random, o) {
    let out = background(p.bg)
    const font = FONTS[o.font ?? 'rounded']
    const cx = W / 2
    const eye = (x, y, r) =>
      circle(x, y, r, '#FFFFFF') +
      circle(x + r * 0.2, y + r * 0.15, r * 0.48, '#14141F') +
      circle(x + r * 0.35, y - r * 0.1, r * 0.16, '#FFFFFF')
    const smile = (y, w) =>
      `<path d="M ${cx - w} ${y} Q ${cx} ${y + w * 0.8} ${cx + w} ${y}" fill="none" stroke="#14141F" stroke-width="6" stroke-linecap="round"/>`
    out += ellipse(cx, 512, 150, 20, mix(p.bg, '#000000', 0.18))
    switch (o.critter) {
      case 'gherkin':
        out += ellipse(cx, 352, 92, 158, p.main)
        for (let i = 0; i < 14; i++)
          out += circle(cx - 60 + random() * 120, 240 + random() * 250, 4 + random() * 4, mix(p.main, '#000000', 0.25))
        out +=
          ellipse(cx, 220, 112, 18, '#3A2A1E') +
          rect(cx - 64, 160, 128, 60, '#3A2A1E', 1, ' rx="10"') +
          rect(cx - 64, 196, 128, 12, p.accent)
        out += eye(cx - 34, 280, 24) + eye(cx + 34, 280, 24) + smile(336, 30)
        out +=
          line(cx + 100, 380, cx + 150, 440, '#3A2A1E', 12) +
          ring(cx + 82, 356, 34, '#3A2A1E', 9) +
          circle(cx + 82, 356, 28, '#FFFFFF', 0.45)
        break
      case 'robot': {
        // Drawn a little lower, so the antenna stays clear of the title
        let robot = line(cx, 168, cx, 128, p.ink, 6) + circle(cx, 120, 14, p.accent)
        robot += rect(cx - 82, 168, 164, 116, p.main, 1, ' rx="26"') + rect(cx - 100, 296, 200, 170, p.main, 1, ' rx="34"')
        robot +=
          rect(cx - 58, 196, 116, 60, '#0B2540', 1, ' rx="18"') +
          circle(cx - 26, 226, 13, p.accent) +
          circle(cx + 26, 226, 13, p.accent)
        robot += rect(cx - 60, 330, 120, 60, mix(p.main, '#FFFFFF', 0.35), 1, ' rx="16"')
        for (let i = 0; i < 3; i++) robot += circle(cx - 30 + i * 30, 360, 9, [p.accent, p.ink, '#01C5AC'][i])
        robot += ellipse(cx + 138, 360, 18, 34, '#017B6B', 1, ` transform="rotate(30 ${cx + 138} 360)"`)
        robot += ellipse(cx + 112, 384, 14, 28, '#01C5AC', 1, ` transform="rotate(-30 ${cx + 112} 384)"`)
        robot += rect(cx + 100, 400, 52, 46, p.accent, 1, ' rx="8"')
        out += `<g transform="translate(0 36)">${robot}</g>`
        break
      }
      case 'penguin':
        out += ellipse(cx, 352, 110, 150, '#0B1F3A') + ellipse(cx, 376, 76, 118, '#FFFFFF')
        out += ellipse(cx - 60, 496, 34, 14, p.accent) + ellipse(cx + 60, 496, 34, 14, p.accent)
        out += eye(cx - 30, 272, 20) + eye(cx + 30, 272, 20) + poly([cx - 18, 300, cx + 18, 300, cx, 324], '#FD7701')
        out +=
          rect(cx - 64, 380, 128, 92, p.main, 1, ' rx="8"') +
          rect(cx - 8, 380, 16, 92, p.accent) +
          rect(cx - 64, 418, 128, 16, p.accent)
        break
      case 'owl':
        out +=
          poly([cx - 104, 230, cx - 70, 150, cx - 40, 230], p.main) + poly([cx + 104, 230, cx + 70, 150, cx + 40, 230], p.main)
        out += ellipse(cx, 350, 120, 150, p.main) + ellipse(cx, 400, 76, 92, mix(p.main, '#FFFFFF', 0.45))
        for (let i = 0; i < 3; i++)
          out += `<path d="M ${cx - 30} ${380 + i * 26} l 15 12 l 15 -12 l 15 12 l 15 -12" fill="none" stroke="${p.main}" stroke-width="5" stroke-linejoin="round"/>`
        out +=
          circle(cx - 46, 284, 38, p.accent) + circle(cx + 46, 284, 38, p.accent) + eye(cx - 46, 284, 28) + eye(cx + 46, 284, 28)
        out += poly([cx - 14, 318, cx + 14, 318, cx, 344], p.accent)
        out += poly([cx, 140, cx + 84, 168, cx, 196, cx - 84, 168], '#14141F') + rect(cx - 40, 176, 80, 26, '#14141F')
        out += line(cx + 60, 168, cx + 72, 222, p.accent, 4) + circle(cx + 72, 226, 7, p.accent)
        break
      default: {
        // 'gnome': a tall pointed hat, a big beard
        out += rect(cx - 86, 340, 172, 150, '#013E8E', 1, ' rx="40"')
        out += poly([cx - 96, 250, cx + 10, 146, cx + 96, 250], p.accent)
        out += circle(cx, 278, 64, '#F6C9A4')
        out += path(
          `M ${cx - 80} 290 Q ${cx - 70} 440 ${cx} 452 Q ${cx + 70} 440 ${cx + 80} 290 Q ${cx} 330 ${cx - 80} 290 Z`,
          '#FFFFFF',
        )
        out += eye(cx - 26, 268, 14) + eye(cx + 26, 268, 14) + circle(cx, 296, 16, '#F08CA0')
        out += rect(cx - 110, 248, 220, 18, mix(p.accent, '#000000', 0.2), 1, ' rx="9"')
        out +=
          rect(cx + 90, 380, 16, 90, '#8A5A2B', 1, ' rx="6"') +
          circle(cx + 98, 372, 18, 'none', 1, ` stroke="#8A5A2B" stroke-width="8"`)
      }
    }
    const t = title(wrap(s.name, 14), { top: 36, width: W - 64, maxSize: 54, font, fill: p.ink })
    out += t.svg
    return out + label(channelName(s), { y: H - 36, fill: p.ink, opacity: 0.75 })
  },
}

const SIZE_PX = { medium: [210, 295], original: [680, 955] }

export function posterSvg(s, size = 'medium') {
  const [width, height] = SIZE_PX[size]
  const random = seeded(s.id * 7349 + 11)
  const draw = STYLES[s.poster.style] ?? STYLES.bigtype
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${W} ${H}"><title>${xml(s.name)}</title>${draw(s, paletteOf(s), random, s.poster)}</svg>`
}

// ── Portraits for the cast: a friendly face built from circles ─────────
const SKIN = ['#F7D7C1', '#EDBB99', '#D49A6A', '#B07548', '#8A5532', '#5E3A22']
const HAIR = ['#2B1B12', '#5A3A22', '#A0522D', '#D9A441', '#E6E1D6', '#1C1C1C', '#7B2D26']
const SHIRT = ['#017B6B', '#0197D8', '#013E8E', '#9A03B7', '#F70677', '#FD7701', '#FEB800', '#083F58']
const BACKDROP = ['#DDF3FF', '#FFE8C7', '#E3F6F3', '#FFD3E6', '#EDE3FF', '#FFF1B8', '#D6F5E3']

export function portraitSvg(person, size = 'medium') {
  const random = seeded(person.id * 7919 + 3)
  const pick = (list) => list[Math.floor(random() * list.length)]
  const [bg, skin, hair, shirt] = [pick(BACKDROP), pick(SKIN), pick(HAIR), pick(SHIRT)]
  const style = pick(['short', 'long', 'bun', 'curly', 'bald', 'side'])
  const glasses = random() < 0.25
  const [width, height] = size === 'medium' ? [210, 295] : [420, 590]
  const cx = 100
  let out = rect(0, 0, 200, 280, bg)
  if (style === 'long') out += rect(cx - 52, 100, 104, 120, hair, 1, ' rx="40"')
  out += path(`M 20 280 C 20 210, 60 196, ${cx} 196 C 140 196, 180 210, 180 280 Z`, shirt)
  out += rect(cx - 15, 168, 30, 36, skin, 1, ' rx="10"')
  out += circle(cx, 130, 48, skin)
  if (style === 'short' || style === 'long' || style === 'side')
    out += path(
      `M ${cx - 50} 128 C ${cx - 52} 70, ${cx + 52} 70, ${cx + 50} 128 C ${cx + 30} ${style === 'side' ? 96 : 104}, ${cx - 20} 112, ${cx - 50} 128 Z`,
      hair,
    )
  if (style === 'bun')
    out +=
      circle(cx, 72, 22, hair) +
      path(
        `M ${cx - 49} 122 C ${cx - 50} 76, ${cx + 50} 76, ${cx + 49} 122 C ${cx + 20} 100, ${cx - 20} 100, ${cx - 49} 122 Z`,
        hair,
      )
  if (style === 'curly')
    for (let i = 0; i < 9; i++) out += circle(cx - 48 + i * 12, 96 - Math.sin((i / 8) * Math.PI) * 22, 16, hair)
  out += circle(cx - 17, 134, 5, '#1C1C1C') + circle(cx + 17, 134, 5, '#1C1C1C')
  if (glasses)
    out +=
      ring(cx - 17, 134, 13, '#1C1C1C', 3) + ring(cx + 17, 134, 13, '#1C1C1C', 3) + line(cx - 4, 134, cx + 4, 134, '#1C1C1C', 3)
  out += `<path d="M ${cx - 14} 154 Q ${cx} 166 ${cx + 14} 154" fill="none" stroke="#7A3B2E" stroke-width="4" stroke-linecap="round"/>`
  out += circle(cx - 30, 150, 7, '#F08CA0', 0.45) + circle(cx + 30, 150, 7, '#F08CA0', 0.45)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 200 280"><title>${xml(person.name)}</title>${out}</svg>`
}
