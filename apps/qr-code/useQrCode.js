import { useEffect, useState } from 'react'
import { buildSvg, isTooLong } from './qr.js'

// Turns the text and the settings into an SVG QR code.
// Returns { markup, version, modules }, { error: 'tooLong' | 'failed' } or null before the first answer.
function useQrCode(value, { color, level, size, badge }) {
  const [result, setResult] = useState(null)

  // The library works asynchronously. `ignore` drops answers that arrive after the input changed again.
  useEffect(() => {
    if (!value) return
    let ignore = false
    buildSvg(value, { color, level, size, badge })
      .then((qr) => {
        if (!ignore) setResult(qr)
      })
      .catch((error) => {
        if (!ignore) setResult({ error: isTooLong(error) ? 'tooLong' : 'failed' })
      })
    return () => {
      ignore = true
    }
  }, [value, color, level, size, badge])

  return result
}

export default useQrCode
