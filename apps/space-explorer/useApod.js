import { useCallback, useEffect, useMemo, useState } from 'react'

// The key comes from an environment variable (VITE_NASA_KEY in a .env file) when there is one.
// DEMO_KEY works without registering, but NASA allows only a few requests per hour with it,
// which is exactly why every answer is cached below.
const API_KEY = import.meta.env.VITE_NASA_KEY || 'DEMO_KEY'
const API = 'https://api.nasa.gov/planetary/apod'
const CACHE_KEY = 'rika:space-explorer:cache'
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
function saveToCache(date, entry) {
  const cache = readCache()
  delete cache[date]
  cache[date] = entry
  const dates = Object.keys(cache)
  dates.slice(0, Math.max(0, dates.length - MAX_CACHED_DAYS)).forEach((old) => delete cache[old])
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage full or blocked: we simply ask NASA again next time
  }
}

/**
 * The Astronomy Picture of the Day for one date: { status, data, error, fromCache, remaining, retry }.
 * A cached date is answered instantly without a request; otherwise we fetch, and the effect's
 * cleanup aborts the request when the date changes before the answer arrives.
 */
export function useApod(date) {
  const cached = useMemo(() => readCache()[date] ?? null, [date])
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null })
  const key = `${attempt}:${date}`

  useEffect(() => {
    if (cached) return undefined
    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 20000)

    fetch(`${API}?api_key=${API_KEY}&date=${date}&thumbs=true`, { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json().catch(() => null)
        if (!res.ok) throw new ApodError(res.status, body?.msg ?? body?.error?.message)
        // NASA tells us how many requests are left for this key (the header is exposed via CORS).
        const remaining = res.headers.get('X-RateLimit-Remaining')
        return { data: body, remaining: remaining === null ? null : Number(remaining) }
      })
      .then(({ data, remaining }) => {
        saveToCache(date, data)
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
  }, [date, key, cached])

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
  if (error?.status === 429) return 'rate'
  if (error?.status === 400 || error?.status === 404) return 'notFound'
  return 'server' // 5xx, or fetch() could not reach the host at all
}
