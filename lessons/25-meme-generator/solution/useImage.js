import { useEffect, useState } from 'react'

/**
 * Loads an image for drawing on a canvas: { status, image, cors }.
 *
 * crossOrigin = 'anonymous' asks the server for permission (CORS). With it, a remote image can be
 * drawn AND exported. If the server refuses, we load it again without CORS: it still shows up on the
 * canvas, but the canvas becomes "tainted" and the browser blocks downloading it. `cors: false` tells
 * the UI to explain that.
 */
export function useImage(src) {
  const [state, setState] = useState({ src: null, status: 'idle', image: null, cors: true })

  useEffect(() => {
    if (!src) return undefined
    let cancelled = false
    let current = null

    const load = (withCors) => {
      const image = new Image()
      current = image
      if (withCors) image.crossOrigin = 'anonymous'
      image.onload = () => {
        if (!cancelled) setState({ src, status: 'ready', image, cors: withCors })
      }
      image.onerror = () => {
        if (cancelled) return
        if (withCors && /^https?:/.test(src)) load(false)
        else setState({ src, status: 'error', image: null, cors: withCors })
      }
      image.src = src
    }

    load(true)
    // Cleanup: a newer src (or unmount) wins, and a pending download is dropped.
    return () => {
      cancelled = true
      if (current) {
        current.onload = null
        current.onerror = null
      }
    }
  }, [src])

  if (!src) return { status: 'idle', image: null, cors: true }
  if (state.src !== src) return { status: 'loading', image: null, cors: true }
  return state
}
