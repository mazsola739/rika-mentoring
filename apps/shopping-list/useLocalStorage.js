import { useEffect, useState } from 'react'

function read(key, initialValue) {
  try {
    const saved = localStorage.getItem(key)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // blocked storage or broken JSON: start from the initial value
  }
  return typeof initialValue === 'function' ? initialValue() : initialValue
}

// Works like useState, but the value survives a page reload,
// and also updates at once in the other open windows of the same browser.
// The lazy initializer reads localStorage only once, on the first render.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => read(key, initialValue))

  // Every change is written back. The effect runs after rendering, so typing stays fast.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or private mode: the app keeps working in memory
    }
  }, [key, value])

  // Another window changed the same key: the browser sends a storage event, and we take over the new value.
  // Writing the same text back does not fire another event, so the windows do not ping-pong.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== key || event.newValue === null) return
      try {
        setValue(JSON.parse(event.newValue))
      } catch {
        // broken data from another window: keep ours
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  return [value, setValue]
}
