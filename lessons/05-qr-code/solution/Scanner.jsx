import { useEffect, useRef, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'

// Switches the camera off: stops every track of the stream (a camera only has a video track).
function stopCamera(stream) {
  stream.getTracks().forEach((track) => track.stop())
}

// Reads a QR code with the camera. The found text goes to the parent through onResult.
function Scanner({ onResult }) {
  const t = useText(TEXT)
  const videoRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [found, setFound] = useState('')
  // A key of TEXT ('cameraFailed' or 'noDetector'), so the message follows a language switch.
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!scanning) return

    let ignore = false
    let stream = null
    let timer = null

    async function start() {
      try {
        // No mediaDevices (an http:// address that is not localhost) throws here too and lands in catch.
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      } catch {
        if (ignore) return
        setMessage('cameraFailed')
        setScanning(false)
        return
      }
      // The scanner was stopped while the browser was asking for permission.
      if (ignore) {
        stopCamera(stream)
        return
      }
      videoRef.current.srcObject = stream

      // Feature detection: BarcodeDetector only exists in some browsers.
      if (!('BarcodeDetector' in window)) {
        setMessage('noDetector')
        return
      }
      const detector = new BarcodeDetector({ formats: ['qr_code'] })
      timer = setInterval(async () => {
        let codes = []
        try {
          codes = await detector.detect(videoRef.current)
        } catch {
          return // a frame that could not be read: the next round tries again
        }
        if (ignore || codes.length === 0) return
        setFound(codes[0].rawValue)
        setScanning(false)
      }, 300)
    }

    start()

    // Cleanup: the timer stops and the camera goes off when scanning stops or the component disappears.
    return () => {
      ignore = true
      clearInterval(timer)
      if (stream) stopCamera(stream)
    }
  }, [scanning])

  function startScanning() {
    setFound('')
    setMessage('')
    setScanning(true)
  }

  return (
    <section className="qr__scanner" aria-labelledby="qr-scanner-title">
      <h2 id="qr-scanner-title" className="qr__subtitle">
        {t.scanner}
      </h2>
      {scanning ? (
        <div className="qr__camera">
          <video ref={videoRef} className="qr__video" aria-label={t.video} autoPlay playsInline muted />
          <button type="button" className="btn btn--ghost" onClick={() => setScanning(false)}>
            {t.stopCamera}
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn--ghost qr__start" onClick={startScanning}>
          {t.startCamera}
        </button>
      )}
      {message !== '' && (
        <p className="qr__note" role="status">
          {t[message]}
        </p>
      )}
      {found !== '' && (
        <div className="qr__found" role="status">
          <p>
            {t.found} <strong>{found}</strong>
          </p>
          <button type="button" className="btn" onClick={() => onResult(found)}>
            {t.open}
          </button>
        </div>
      )}
    </section>
  )
}

export default Scanner
