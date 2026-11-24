import { useEffect, useState } from 'react'

// useState that survives a page reload. The initial value can be a function (lazy init).
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw)
    } catch {
      // broken JSON or blocked storage: fall back to the initial value
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or blocked: keep the value in memory
    }
  }, [key, value])

  return [value, setValue]
}
