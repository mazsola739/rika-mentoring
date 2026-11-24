import { useCallback, useEffect, useState } from 'react'
import { requestApod } from './api.js'
import { FIRST_DAY, shiftDay } from './dates.js'

const PAGE_SIZE = 12 // the pictures of this many days come in one request

// The days of page number `page`, counted back from today, as API parameters.
// Page 0 is today and the 11 days before it, page 1 the 12 days before those, and so on.
function pageRange(today, page) {
  const end = shiftDay(today, -page * PAGE_SIZE)
  const start = shiftDay(end, -(PAGE_SIZE - 1))
  // There are no pictures before the first day of the archive, so we stop there.
  return { start_date: start < FIRST_DAY ? FIRST_DAY : start, end_date: end }
}

// The old list with the new pictures at its end. Random days can repeat: a day already in the list is skipped,
// so two cards never get the same key.
function addNew(old, incoming) {
  const seen = new Set(old.map((picture) => picture.date))
  const result = [...old]
  for (const picture of incoming) {
    if (!seen.has(picture.date)) {
      seen.add(picture.date)
      result.push(picture)
    }
  }
  return result
}

/**
 * The gallery's pictures, page by page: { mode, changeMode, pictures, status, error, hasMore, loadMore, retry }.
 * mode 'archive' goes back from today with date ranges (start_date, end_date); mode 'random' asks for
 * count=12 random days per page and never runs out. The status is 'loading', 'ready' or 'error'.
 */
export function useGallery(today, lang) {
  const [mode, setMode] = useState('archive')
  const [page, setPage] = useState(0)
  const [pictures, setPictures] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // "Try again" increases it, which asks for the same page again

  useEffect(() => {
    const controller = new AbortController()
    const params = mode === 'random' ? { count: PAGE_SIZE } : pageRange(today, page)
    requestApod(params, { lang, signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return
        // A date range comes oldest first; the gallery shows the newest first.
        const newestFirst = [...data].reverse()
        // An updater function: the new page goes to the end of the latest list.
        setPictures((old) => addNew(old, newestFirst))
        setStatus('ready')
      })
      .catch((problem) => {
        if (controller.signal.aborted) return // the page changed, or the gallery closed: this answer is not needed
        setError(problem)
        setStatus('error')
      })
    return () => controller.abort()
  }, [mode, today, page, attempt, lang])

  // Is there another page? Random pictures never run out; the archive has a first day.
  const hasMore = mode === 'random' || pageRange(today, page).start_date > FIRST_DAY

  // Only updater functions inside, so the same function works for every drawing (the observer keeps it).
  const loadMore = useCallback(() => {
    setStatus('loading')
    setPage((current) => current + 1)
  }, [])

  function changeMode(newMode) {
    if (newMode === mode) return
    // A new source starts again from the beginning, with an empty list (in the event handler, not in an effect).
    setMode(newMode)
    setPage(0)
    setPictures([])
    setStatus('loading')
  }

  function retry() {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  return { mode, changeMode, pictures, status, error, hasMore, loadMore, retry }
}
