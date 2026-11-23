import { useEffect, useRef, useState } from 'react'

export const DURATIONS = { focus: 25 * 60 * 1000, break: 5 * 60 * 1000 }

// A 25/5 focus timer. While running we store the moment it ends, not a counter:
// intervals in background tabs can be delayed, but Date.now() is always right.
export function useFocusTimer(onComplete) {
  const [mode, setMode] = useState('focus')
  const [endsAt, setEndsAt] = useState(null) // timestamp while running, null while paused
  const [left, setLeft] = useState(DURATIONS.focus) // ms left while paused
  const [now, setNow] = useState(() => Date.now())

  // Keep the latest callback without restarting the interval when it changes.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    if (endsAt === null) return
    const tick = () => {
      if (Date.now() < endsAt) {
        setNow(Date.now())
        return
      }
      const next = mode === 'focus' ? 'break' : 'focus'
      setEndsAt(null)
      setMode(next)
      setLeft(DURATIONS[next])
      onCompleteRef.current?.(mode)
    }
    const id = setInterval(tick, 250)
    // The cleanup stops the interval on pause, on reset and when the component unmounts.
    return () => clearInterval(id)
  }, [endsAt, mode])

  const running = endsAt !== null
  const remaining = running ? Math.max(0, endsAt - now) : left

  return {
    mode,
    running,
    remaining,
    progress: 1 - remaining / DURATIONS[mode],
    start() {
      if (running) return
      setNow(Date.now())
      setEndsAt(Date.now() + left)
    },
    pause() {
      if (!running) return
      setLeft(Math.max(0, endsAt - Date.now()))
      setEndsAt(null)
    },
    reset() {
      setEndsAt(null)
      setLeft(DURATIONS[mode])
    },
    switchTo(nextMode) {
      setEndsAt(null)
      setMode(nextMode)
      setLeft(DURATIONS[nextMode])
    },
  }
}
