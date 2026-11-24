import { useEffect, useState } from 'react'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

// useState + localStorage. The third value tells if the last save failed (e.g. storage is full
// because of too many photos), so the UI can warn instead of silently losing data.
export const useStoredState = (key, initial) => {
  const [value, setValue] = useState(() => read(key, initial))
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      setSaveFailed(false)
    } catch {
      setSaveFailed(true)
    }
  }, [key, value])

  return [value, setValue, saveFailed]
}
