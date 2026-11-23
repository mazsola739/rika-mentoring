import { useEffect, useState } from 'react'

// Works like useState, but the value survives a page reload.
// The third value tells the UI when saving failed (photos can fill the few megabytes of storage).
export function useLocalStorage(key, initialValue, isValid = () => true) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        const parsed = JSON.parse(raw)
        if (isValid(parsed)) return parsed
      }
    } catch {
      // unreadable or blocked storage: start from the initial value
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })
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
