import { useEffect, useState } from 'react'

// Works like useState, but the value survives a page reload.
// `isValid` protects the app from old or hand-edited data in storage.
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

  // Save after every change. The effect runs after render, so typing stays fast.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable: the app keeps working in memory
    }
  }, [key, value])

  return [value, setValue]
}
