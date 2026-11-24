import { useCallback, useEffect, useRef, useState } from 'react'

function read(key) {
  try {
    const value = Number(localStorage.getItem(key))
    return Number.isFinite(value) ? value : 0
  } catch {
    return 0
  }
}

function write(key, value) {
  try {
    if (value > 0) localStorage.setItem(key, String(Math.round(value * 10) / 10))
    else localStorage.removeItem(key)
  } catch {
    // storage blocked: the player simply starts from the beginning next time
  }
}

// Remembers the playback position of one video in localStorage.
// The hook only needs the ref: it reads `currentTime` straight from the DOM element.
export function useResumePosition(videoRef, key) {
  const [resumedAt, setResumedAt] = useState(null)
  const lastSaved = useRef(0)
  // We never save before the saved value was read back, otherwise a 0 could overwrite it.
  const restored = useRef(false)

  // Call from onLoadedMetadata: only then is `duration` known.
  const restore = useCallback(() => {
    const video = videoRef.current
    const saved = read(key)
    restored.current = true
    if (video && saved > 1 && saved < video.duration - 1) {
      video.currentTime = saved
      setResumedAt(saved)
    }
  }, [videoRef, key])

  // Call from onTimeUpdate (fires ~4×/s); we write at most once per second.
  const save = useCallback(
    (force = false) => {
      const video = videoRef.current
      if (!video || !restored.current) return
      const now = Date.now()
      if (!force && now - lastSaved.current < 1000) return
      lastSaved.current = now
      write(key, video.ended ? 0 : video.currentTime)
    },
    [videoRef, key],
  )

  const clear = useCallback(() => write(key, 0), [key])

  // Also save when the tab is closed or hidden, and when the component unmounts.
  useEffect(() => {
    const onHide = () => save(true)
    window.addEventListener('pagehide', onHide)
    return () => {
      window.removeEventListener('pagehide', onHide)
      save(true)
    }
  }, [save])

  return { resumedAt, dismiss: () => setResumedAt(null), restore, save, clear }
}
