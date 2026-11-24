import { useEffect, useState } from 'react'

// Current time, refreshed while `active` is true. Only the component that uses it re-renders on each tick.
export function useNow(active, every = 200) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), every)
    return () => clearInterval(id)
  }, [active, every])

  return now
}
