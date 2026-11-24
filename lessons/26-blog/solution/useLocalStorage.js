import { useEffect, useState } from 'react'

// Works like useState, but the value survives a reload: it is kept in localStorage as JSON.
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
      // Never mind: the value still works, it just is not remembered.
    }
  }, [key, value])

  return [value, setValue]
}
