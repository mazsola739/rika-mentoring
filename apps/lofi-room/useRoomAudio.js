import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoomAudio } from './engine.js'

// Holds one audio engine for the room. `ensure()` must be called from an event handler
// (a user gesture): that is the moment the AudioContext is allowed to start.
export function useRoomAudio() {
  const engineRef = useRef(null)
  const [error, setError] = useState(false)

  // Closing the AudioContext on unmount stops every sound and frees the audio device.
  useEffect(
    () => () => {
      engineRef.current?.close()
      engineRef.current = null
    },
    [],
  )

  const ensure = useCallback(() => {
    try {
      engineRef.current ??= createRoomAudio()
      engineRef.current.resume()
      return engineRef.current
    } catch {
      setError(true)
      return null
    }
  }, [])

  const get = useCallback(() => engineRef.current, [])

  return { ensure, get, error }
}
