import { useEffect, useState } from 'react'

function read(key, initialValue, revive) {
  try {
    const saved = localStorage.getItem(key)
    if (saved !== null) return revive(JSON.parse(saved))
  } catch {
    // blocked storage or broken JSON: start from the initial value
  }
  return typeof initialValue === 'function' ? initialValue() : initialValue
}

const keep = (value) => value

// Works like useState, but the value survives a page reload.
// The lazy initializer reads localStorage only once, on the first render; `revive` may repair an old saved value.
export function useLocalStorage(key, initialValue, revive = keep) {
  const [value, setValue] = useState(() => read(key, initialValue, revive))

  // Every change is written back. The effect runs after rendering, so typing stays fast.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or private mode: the app keeps working in memory
    }
  }, [key, value])

  return [value, setValue]
}
