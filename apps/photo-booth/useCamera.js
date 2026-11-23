import { useCallback, useEffect, useRef, useState } from 'react'

// Turns a getUserMedia error into one of our message keys.
function errorKey(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return 'denied'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'notFound'
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'busy'
    default:
      return 'unknown'
  }
}

// Camera lifecycle: idle → requesting → live, or error. The stream lives in a ref;
// every track is stopped when the camera is turned off and when the component unmounts.
export function useCamera(videoRef) {
  const [status, setStatus] = useState('idle') // 'idle' | 'requesting' | 'live' | 'error'
  const [error, setError] = useState(null)
  const streamRef = useRef(null)
  const mountedRef = useRef(false)

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [videoRef])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      release()
    }
  }, [release])

  const fail = (key) => {
    setError(key)
    setStatus('error')
  }

  const start = useCallback(async () => {
    if (!window.isSecureContext) return fail('insecure')
    if (!navigator.mediaDevices?.getUserMedia) return fail('unsupported')
    setError(null)
    setStatus('requesting')
    try {
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        })
      } catch (err) {
        // Some cameras reject the ideal size: try again with no wishes at all.
        if (err.name !== 'OverconstrainedError') throw err
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }
      // The user may have left the page while the permission prompt was open.
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      const video = videoRef.current
      video.srcObject = stream
      await video.play().catch(() => {})
      // Unplugged camera or permission revoked in the browser settings.
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        release()
        fail('ended')
      })
      setStatus('live')
    } catch (err) {
      release()
      fail(errorKey(err))
    }
  }, [videoRef, release])

  const stop = useCallback(() => {
    release()
    setStatus('idle')
  }, [release])

  return { status, error, start, stop }
}
