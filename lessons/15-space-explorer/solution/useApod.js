import { useCallback, useEffect, useMemo, useState } from 'react'
import { apodError, requestApod } from './api.js'

const CACHE_KEY = 'rika:space-explorer:apod-cache'
const MAX_CACHED_DAYS = 40

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

// A day that arrived some other way (in a gallery page, for example) goes into the cache too,
// so opening it as the picture of the day needs no new request.
export function cacheDay(lang, apod) {
  saveToCache(`${lang}:${apod.date}`, apod)
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

    requestApod({ date }, { lang, signal: controller.signal })
      .then(({ data, remaining }) => {
        if (controller.signal.aborted) return
        saveToCache(cacheKey, data)
        setResult({ key, data, remaining })
      })
      .catch((error) => {
        if (controller.signal.aborted && !timedOut) return
        setResult({ key, error: timedOut ? apodError(0, 'timeout') : error })
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
