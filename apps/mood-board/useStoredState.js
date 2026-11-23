import { useEffect, useState } from 'react'

function read(key, fallback, isValid, upgrade) {
  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      const value = JSON.parse(raw)
      if (isValid(value)) return upgrade(value)
    }
  } catch {
    // unreadable or blocked storage: start fresh
  }
  return typeof fallback === 'function' ? fallback() : fallback
}

// useState + localStorage. `saveFailed` becomes true when the browser refuses to store
// the value (usually because uploaded images filled the ~5 MB quota).
// `upgrade` turns data saved by an older version of the app into the current shape.
export const useStoredState = (key, initial, isValid = () => true, upgrade = (value) => value) => {
  const [value, setValue] = useState(() => read(key, initial, isValid, upgrade))
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
