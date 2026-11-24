import { useEffect, useState } from 'react'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

// useState that also lives in localStorage (e.g. the mixer levels).
export const useStoredState = (key, initial) => {
  const [value, setValue] = useState(() => read(key, initial))

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or blocked: the value still works for this visit
    }
  }, [key, value])

  return [value, setValue]
}
