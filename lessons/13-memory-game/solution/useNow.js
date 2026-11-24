import { useEffect, useState } from 'react'

// Returns the current time and refreshes it while `active` is true.
// Only the component that calls this hook re-renders on every tick, not the whole board.
export function useNow(active, every = 250) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), every)
    return () => clearInterval(id)
  }, [active, every])

  return now
}
