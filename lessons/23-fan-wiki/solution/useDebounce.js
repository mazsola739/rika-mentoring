import { useEffect, useState } from 'react'

// Returns `value` only after it has stopped changing for `delay` ms.
// Every keystroke restarts the timer (the cleanup clears the previous one), so a search
// request goes out once the user pauses, not for every letter.
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
