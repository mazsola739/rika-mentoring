import { useCallback, useEffect, useMemo, useState } from 'react'

// The API address and key come from environment variables (VITE_APOD_API and VITE_APOD_KEY in a .env file)
// when there are any. The defaults are the lesson's own picture API (mocks/handlers.js, it runs in the browser)
// and its DEMO_KEY, which allows only a few requests per hour: exactly why every answer is cached below.
// Remember that every VITE_ variable ends up in the browser bundle, so only public keys belong there.
const API = import.meta.env.VITE_APOD_API ?? '/api/apod'
const API_KEY = import.meta.env.VITE_APOD_KEY || 'DEMO_KEY'
const CACHE_KEY = 'rika:space-explorer:apod-cache'
const MAX_CACHED_DAYS = 40

export class ApodError extends Error {
  constructor(status, message) {
    super(message || `HTTP ${status}`)
    this.name = 'ApodError'
    this.status = status
  }
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {}
  } catch {
    return {}
  }
}

// A picture never changes once it is published, so a cached day is valid forever.
// Only the newest entries are kept, so the cache cannot grow without limit.
function saveToCache(cacheKey, entry) {
  const cache = readCache()
  delete cache[cacheKey]
  cache[cacheKey] = entry
  const keys = Object.keys(cache)
  keys.slice(0, Math.max(0, keys.length - MAX_CACHED_DAYS)).forEach((old) => delete cache[old])
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage full or blocked: we simply ask the API again next time
  }
}

/**
 * The picture of the day for one date and language: { status, data, error, fromCache, remaining, retry }.
 * A cached day is answered instantly without a request; otherwise we fetch, and the effect's
 * cleanup aborts the request when the date changes before the answer arrives.
 */
export function useApod(date, lang) {
  const cacheKey = `${lang}:${date}`
  const cached = useMemo(() => readCache()[cacheKey] ?? null, [cacheKey])
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null })
  const key = `${attempt}:${cacheKey}`

  useEffect(() => {
    if (cached) return undefined
    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 20000)

    // URLSearchParams builds the query string and escapes every value for us.
    const query = new URLSearchParams({ api_key: API_KEY, date, thumbs: 'true', lang })
    fetch(`${API}?${query}`, { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json().catch(() => null)
        if (!res.ok) throw new ApodError(res.status, body?.message ?? body?.msg)
        // The API tells us how many requests are left for this key in a response header.
        const remaining = res.headers.get('X-RateLimit-Remaining')
        return { data: body, remaining: remaining === null ? null : Number(remaining) }
      })
      .then(({ data, remaining }) => {
        saveToCache(cacheKey, data)
        setResult({ key, data, remaining })
      })
      .catch((error) => {
        if (controller.signal.aborted && !timedOut) return
        setResult({ key, error: timedOut ? new ApodError(0, 'timeout') : error })
      })
      .finally(() => clearTimeout(timer))

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [date, lang, cacheKey, key, cached])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  if (cached) return { status: 'success', data: cached, fromCache: true, remaining: null, retry }
  if (result.key !== key) return { status: 'loading', retry }
  if (result.error) return { status: 'error', error: result.error, retry }
  return { status: 'success', data: result.data, fromCache: false, remaining: result.remaining, retry }
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
