// The lesson's own "picture of the day" API (runs in the browser via MSW, see @shared/mock-api).
// It answers in the same shape as NASA's APOD API, so the app code is ordinary REST client code:
//   GET /api/apod?api_key=DEMO_KEY&date=2026-11-23&thumbs=true&lang=en
//       → { date, title, explanation, url, hdurl?, media_type, copyright?, thumbnail_url?, service_version }
//   GET /api/apod?api_key=DEMO_KEY&start_date=2026-11-01&end_date=2026-11-07 → [ …one entry per day ]
//   GET /api/apod?api_key=DEMO_KEY&count=5                                    → [ …5 random days ]
//   GET /api/apod/image/<id>.svg, /api/apod/image/<id>-hd.svg, /api/apod/video/<id>.svg → the pictures
// Every /api/apod request needs an api_key (403 without a valid one). The demo key has a small hourly
// quota, reported in the X-RateLimit-* headers; when it is used up the answer is 429 Too Many Requests.
// The pictures (like images on a real image host) need no key and do not count toward the quota.
import { http, HttpResponse } from 'msw'
import { errorResponse, networkDelay, svgResponse } from '@shared/mock-api/msw.js'
import { FIRST_DAY, apodToday, formatDay, isIsoDay, randomDay, shiftDay } from '../dates.js'
import { PICTURES } from './pictures.js'
import { drawPicture } from './art.js'

const DAY = 86_400_000
const DEMO_KEY = 'DEMO_KEY'
// A personal key (VITE_APOD_KEY in .env) is accepted too, and so is anything shaped like a real key.
const isValidKey = (key) => key === DEMO_KEY || key === import.meta.env.VITE_APOD_KEY || /^[A-Za-z0-9]{40}$/.test(key)
const HOURLY_LIMIT = { demo: 30, personal: 1000 }

// Request times per key during the last hour. This practice quota lives in memory: reloading the page resets it.
const recent = new Map()
function takeFromQuota(key) {
  const limit = key === DEMO_KEY ? HOURLY_LIMIT.demo : HOURLY_LIMIT.personal
  const now = Date.now()
  const times = (recent.get(key) ?? []).filter((t) => now - t < 3_600_000)
  const allowed = times.length < limit
  if (allowed) times.push(now)
  recent.set(key, times)
  return {
    allowed,
    headers: { 'X-RateLimit-Limit': String(limit), 'X-RateLimit-Remaining': String(Math.max(0, limit - times.length)) },
  }
}

// Every day of the archive gets one picture; the 50 pictures repeat in the same order.
const dayNumber = (iso) => Math.round((new Date(`${iso}T00:00:00Z`) - new Date(`${FIRST_DAY}T00:00:00Z`)) / DAY)
const pictureOn = (iso) => PICTURES[((dayNumber(iso) % PICTURES.length) + PICTURES.length) % PICTURES.length]

function entryFor(iso, { lang, thumbs, origin }) {
  const picture = pictureOn(iso)
  const text = picture[lang] ?? picture.en
  const media = (kind, name) => new URL(`/api/apod/${kind}/${name}.svg`, origin).href
  const entry = {
    ...(picture.copyright && { copyright: picture.copyright }),
    date: iso,
    explanation: text.explanation,
    media_type: picture.video ? 'video' : 'image',
    service_version: 'v1',
    title: text.title,
    url: picture.video ? media('video', picture.id) : media('image', picture.id),
  }
  if (!picture.video) entry.hdurl = media('image', `${picture.id}-hd`)
  if (picture.video && thumbs) entry.thumbnail_url = media('image', picture.id)
  return entry
}

const outOfRange = (today) =>
  errorResponse(
    400,
    'bad_request',
    `Date must be between ${formatDay(FIRST_DAY, 'en-US', { dateStyle: 'medium' })} and ${formatDay(today, 'en-US', { dateStyle: 'medium' })}.`,
  )

// The drawings take a moment to build, so each one is made only once per page load.
const drawn = new Map()
function pictureSvg(id, options) {
  const key = `${id}:${options.hd}:${options.animate}`
  if (!drawn.has(key)) {
    const entry = PICTURES.find((p) => p.id === id)
    drawn.set(key, entry ? drawPicture(entry, options) : null)
  }
  return drawn.get(key)
}

export const handlers = [
  http.get('/api/apod', async ({ request }) => {
    await networkDelay()
    const url = new URL(request.url)
    const query = url.searchParams
    const key = query.get('api_key')
    if (!key) return errorResponse(403, 'API_KEY_MISSING', 'No api_key was supplied. Add ?api_key=DEMO_KEY to the request.')
    if (!isValidKey(key)) return errorResponse(403, 'API_KEY_INVALID', 'An invalid api_key was supplied.')

    const quota = takeFromQuota(key)
    if (!quota.allowed) {
      return HttpResponse.json(
        { error: 'OVER_RATE_LIMIT', message: 'You have exceeded the rate limit for this key. Try again later.' },
        { status: 429, headers: quota.headers },
      )
    }

    const today = apodToday()
    const options = { lang: query.get('lang') === 'hu' ? 'hu' : 'en', thumbs: query.get('thumbs') === 'true', origin: url.origin }
    const answer = (body) => HttpResponse.json(body, { headers: quota.headers })
    const [date, start, end, count] = ['date', 'start_date', 'end_date', 'count'].map((name) => query.get(name))

    if (count !== null) {
      if (date || start || end)
        return errorResponse(400, 'bad_request', 'count cannot be combined with date, start_date or end_date.')
      const n = Number(count)
      if (!Number.isInteger(n) || n < 1 || n > 100)
        return errorResponse(400, 'bad_request', 'count must be a whole number from 1 to 100.')
      return answer(Array.from({ length: n }, () => entryFor(randomDay(FIRST_DAY, today), options)))
    }

    if (start || end) {
      if (date) return errorResponse(400, 'bad_request', 'date cannot be combined with start_date or end_date.')
      const first = start ?? today
      const last = end ?? today
      if (![first, last].every(isIsoDay)) return errorResponse(400, 'bad_request', 'Dates must look like YYYY-MM-DD.')
      if (first > last) return errorResponse(400, 'bad_request', 'start_date must be before end_date.')
      if (first < FIRST_DAY || last > today) return outOfRange(today)
      if (dayNumber(last) - dayNumber(first) >= 100)
        return errorResponse(400, 'bad_request', 'Ask for at most 100 days at a time.')
      const days = []
      for (let d = first; d <= last; d = shiftDay(d, 1)) days.push(entryFor(d, options))
      return answer(days)
    }

    const day = date ?? today
    if (!isIsoDay(day)) return errorResponse(400, 'bad_request', `time data '${day}' does not match format '%Y-%m-%d'`)
    if (day < FIRST_DAY || day > today) return outOfRange(today)
    return answer(entryFor(day, options))
  }),

  // Still pictures and video thumbnails: <id>.svg, and <id>-hd.svg at twice the size.
  http.get('/api/apod/image/:file', async ({ params }) => {
    await networkDelay(80, 250)
    const match = /^([\w-]+?)(-hd)?\.svg$/.exec(params.file)
    const svg = match && pictureSvg(match[1], { hd: Boolean(match[2]), animate: false })
    return svg ? svgResponse(svg) : errorResponse(404, 'not_found', 'No such picture')
  }),

  // The "videos": animated SVGs, which an <img> plays on its own.
  http.get('/api/apod/video/:file', async ({ params }) => {
    await networkDelay(80, 250)
    const match = /^([\w-]+)\.svg$/.exec(params.file)
    const entry = match && PICTURES.find((p) => p.id === match[1] && p.video)
    const svg = entry && pictureSvg(entry.id, { hd: false, animate: true })
    return svg ? svgResponse(svg) : errorResponse(404, 'not_found', 'No such video')
  }),
]
