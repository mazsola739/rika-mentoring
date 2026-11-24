import { useEffect, useState } from 'react'

// Like useState, but the value is also saved in localStorage, so it survives a reload.
// Reading and writing are wrapped in try/catch: storage can be blocked, full or hold something unreadable.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? initialValue : JSON.parse(saved)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // not saved: the value still works for this visit
    }
  }, [key, value])

  return [value, setValue]
}
