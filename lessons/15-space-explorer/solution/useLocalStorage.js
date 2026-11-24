import { useEffect, useState } from 'react'

// useState that survives a reload: the value is read from localStorage once and written back on every change.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or blocked: the app keeps working without saving
    }
  }, [key, value])

  return [value, setValue]
}
