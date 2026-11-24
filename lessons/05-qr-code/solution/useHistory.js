import { useEffect, useState } from 'react'

const STORAGE_KEY = 'rika:qr-code:history'
const MAX_ITEMS = 8

// Reads the saved list. Nothing saved, a broken save or a blocked storage all start with an empty list.
function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) return saved.filter((item) => typeof item === 'string').slice(0, MAX_ITEMS)
  } catch {
    // no history then
  }
  return []
}

// The texts of the downloaded codes, newest first, without duplicates, kept in localStorage.
function useHistory() {
  // Lazy initial state: localStorage is read only once, on the first render.
  const [items, setItems] = useState(readHistory)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // never mind if it cannot be saved
    }
  }, [items])

  function remember(text) {
    setItems((list) => [text, ...list.filter((item) => item !== text)].slice(0, MAX_ITEMS))
  }

  function clear() {
    setItems([])
  }

  return { items, remember, clear }
}

export default useHistory
