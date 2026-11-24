import { useEffect, useState } from 'react'

// Works like useState, but keeps the value in localStorage, so it survives a reload.
// Storage can be blocked or full: then the value still works, it only lives until the page is closed.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Blocked storage or a broken save: keep the initial value.
    }
    return initialValue
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Full or blocked: nothing to do, the state itself is fine.
    }
  }, [key, value])

  return [value, setValue]
}
