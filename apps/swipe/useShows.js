import { useCallback, useEffect, useState } from 'react'
import { FALLBACK_SHOWS } from './fallbackShows.js'

// The lesson's own TV API (it runs in the browser, see mocks/handlers.js); VITE_TV_API in a .env file can point elsewhere.
const API = import.meta.env.VITE_TV_API ?? '/api/tv'
const API_URL = `${API}/shows?page=1`
const LIMIT = 30

// The API sends summaries as HTML (<p>, <b>…). DOMParser turns them into plain text without running anything.
function toPlainText(html) {
  if (!html) return ''
  return new DOMParser().parseFromString(html, 'text/html').body.textContent.trim()
}

// Keep only what the cards need, in our own shape.
function toShow(raw) {
  return {
    id: `show-${raw.id}`,
    name: raw.name,
    year: raw.premiered ? raw.premiered.slice(0, 4) : '',
    genres: Array.isArray(raw.genres) ? raw.genres : [],
    rating: raw.rating?.average ?? null,
    image: raw.image.original ?? raw.image.medium,
    thumb: raw.image.medium ?? raw.image.original,
    summary: { en: toPlainText(raw.summary) }, // the API only has English text
  }
}

// Loads the shows once (and again on retry). The AbortController cancels the request
// if the component unmounts – StrictMode does exactly that once in development.
export const useShows = () => {
  const [state, setState] = useState({ status: 'loading', shows: [], error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetch(API_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const shows = (Array.isArray(data) ? data : [])
          .filter((raw) => raw?.name && (raw.image?.medium || raw.image?.original))
          .sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0))
          .slice(0, LIMIT)
          .map(toShow)
        if (shows.length === 0) throw new Error('Empty response')
        setState({ status: 'ready', shows, error: null })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setState({ status: 'fallback', shows: FALLBACK_SHOWS, error })
      })

    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading' }))
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, retry }
}
