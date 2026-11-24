import { useEffect, useState } from 'react'

function read(key, initialValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved === null ? initialValue : JSON.parse(saved)
  } catch {
    // storage blocked or a broken save: start with the initial value
    return initialValue
  }
}

// useState that is also saved in localStorage. With sync = true, a change made in another window of the
// same site (the storage event) is taken over, so two windows never write over each other's results.
export function useLocalStorage(key, initialValue, sync = false) {
  const [value, setValue] = useState(() => read(key, initialValue))

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage blocked: the value stays for this visit only
    }
  }, [key, value])

  useEffect(() => {
    if (!sync) return
    function handleStorage(event) {
      if (event.key !== key || event.newValue === null) return
      try {
        setValue(JSON.parse(event.newValue))
      } catch {
        // a broken value from elsewhere: keep ours
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key, sync])

  return [value, setValue]
}
