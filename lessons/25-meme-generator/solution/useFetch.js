import { useCallback, useEffect, useState } from 'react'

// An HTTP error that keeps the status code, so the UI can tell "rate limited" (429) from "server down" (5xx).
export class HttpError extends Error {
  constructor(status) {
    super(`HTTP ${status}`)
    this.name = 'HttpError'
    this.status = status
  }
}

/**
 * Loads JSON from `url` and describes the request as { status, data, error, retry }.
 * status: 'idle' (no url yet) | 'loading' | 'success' | 'error'
 *
 * - A new url starts a new request. The effect's cleanup aborts the old one, so a slow answer
 *   can never overwrite a newer one (and StrictMode's double mount is harmless).
 * - retry() repeats the same request, e.g. after a network error.
 */
export function useFetch(url, { timeout = 12000 } = {}) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, data: undefined, error: null })

  // Every request has a key. While the stored result belongs to another key, we are loading.
  const key = url ? `${attempt}:${url}` : null

  useEffect(() => {
    if (!url) return undefined
    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, timeout)

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new HttpError(res.status)
        return res.json()
      })
      .then((data) => setResult({ key, data, error: null }))
      .catch((error) => {
        // Aborted by the cleanup: a newer request (or the unmount) took over, so stay quiet.
        if (controller.signal.aborted && !timedOut) return
        const reason = timedOut ? Object.assign(new Error('Request timed out'), { name: 'TimeoutError' }) : error
        setResult({ key, data: undefined, error: reason })
      })
      .finally(() => clearTimeout(timer))

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [url, key, timeout])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  if (!key) return { status: 'idle', data: undefined, error: null, retry }
  if (result.key !== key) return { status: 'loading', data: undefined, error: null, retry }
  if (result.error) return { status: 'error', data: undefined, error: result.error, retry }
  return { status: 'success', data: result.data, error: null, retry }
}

// Sorts an error into a few kinds the UI has a friendly sentence for.
export function errorKind(error) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline'
  if (error?.name === 'TimeoutError') return 'timeout'
  if (error?.status === 429) return 'rate'
  if (error?.status >= 500) return 'server'
  if (error instanceof TypeError) return 'server' // fetch() rejects with a TypeError when the host is unreachable
  return 'other'
}
