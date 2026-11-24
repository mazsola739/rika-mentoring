import { useEffect, useState } from 'react'

export function readDraft(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearDraft(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // storage blocked: nothing to clear
  }
}

// Autosave with a small delay: typing quickly restarts the timer (the cleanup clears
// the previous one), so we write to localStorage only once the user pauses.
export function useDraft(key, data, { enabled = true, delay = 500 } = {}) {
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    if (!enabled) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data))
        setSavedAt(new Date())
      } catch {
        // storage full or blocked: the form still works, only the draft is lost
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [key, data, enabled, delay])

  return savedAt
}
