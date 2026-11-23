import { useEffect, useState } from 'react'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

// useState that is remembered in localStorage (volume, shuffle, repeat).
export function useStoredState(key, initial) {
  const [value, setValue] = useState(() => read(key, initial))
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // not saved, still works for this visit
    }
  }, [key, value])
  return [value, setValue]
}
