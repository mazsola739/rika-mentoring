import { useEffect, useRef } from 'react'

const BARS = 20
const BLOCK = 4 // px per LED block

// Spectrum analyser / oscilloscope drawn on a canvas. The AnalyserNode does the FFT;
// we only read its numbers every animation frame and paint them.
const Visualizer = ({ getAnalyser, playing, mode, colors, label, onToggle }) => {
  const canvasRef = useRef(null)
  const peaksRef = useRef(new Array(BARS).fill(0))

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let dims = { width: 0, height: 0 }
    let frame = 0
    let freq = null
    let wave = null
    // After a pause we keep drawing a moment, so the bars can fall down smoothly.
    const stopAt = playing ? Infinity : performance.now() + 1500

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dims = { width, height }
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const drawBars = (analyser, w, h) => {
      if (analyser && (!freq || freq.length !== analyser.frequencyBinCount)) freq = new Uint8Array(analyser.frequencyBinCount)
      if (analyser) analyser.getByteFrequencyData(freq)
      const gap = 2
      const barW = (w - gap * (BARS - 1)) / BARS
      const gradient = ctx.createLinearGradient(0, h, 0, 0)
      colors.forEach((c, i) => gradient.addColorStop(i / (colors.length - 1), c))
      const maxBin = freq ? Math.min(freq.length - 1, Math.round(freq.length * 0.75)) : 1

      for (let i = 0; i < BARS; i++) {
        // Logarithmic bands: low frequencies get narrow bands, like our ears hear them.
        let value = 0
        if (freq) {
          const from = Math.floor(maxBin ** (i / BARS))
          const to = Math.max(from + 1, Math.floor(maxBin ** ((i + 1) / BARS)))
          for (let b = from; b < to; b++) value = Math.max(value, freq[b])
        }
        const level = value / 255
        const blocks = Math.floor(h / BLOCK)
        const lit = Math.round(level * blocks)
        const x = i * (barW + gap)

        ctx.fillStyle = 'rgb(255 255 255 / 0.06)'
        for (let k = 0; k < blocks; k++) ctx.fillRect(x, h - (k + 1) * BLOCK + 1, barW, BLOCK - 1)
        ctx.fillStyle = gradient
        for (let k = 0; k < lit; k++) ctx.fillRect(x, h - (k + 1) * BLOCK + 1, barW, BLOCK - 1)

        // Peak marker that falls slowly
        const peaks = peaksRef.current
        peaks[i] = Math.max(level, peaks[i] - 0.012)
        if (peaks[i] > 0.02) {
          ctx.fillStyle = '#fff'
          ctx.fillRect(x, h - Math.round(peaks[i] * blocks) * BLOCK - 1, barW, 2)
        }
      }
    }

    const drawWave = (analyser, w, h) => {
      ctx.strokeStyle = colors[0]
      ctx.lineWidth = 1.5
      ctx.beginPath()
      if (analyser) {
        if (!wave || wave.length !== analyser.fftSize) wave = new Uint8Array(analyser.fftSize)
        analyser.getByteTimeDomainData(wave)
        for (let i = 0; i < wave.length; i++) {
          const x = (i / (wave.length - 1)) * w
          const y = (wave[i] / 255) * h
          if (i) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
        }
      } else {
        ctx.moveTo(0, h / 2)
        ctx.lineTo(w, h / 2)
      }
      ctx.stroke()
    }

    const draw = () => {
      const { width: w, height: h } = dims
      ctx.clearRect(0, 0, w, h)
      const analyser = getAnalyser()
      if (mode === 'bars') drawBars(analyser, w, h)
      else drawWave(analyser, w, h)
      if (performance.now() < stopAt) frame = requestAnimationFrame(draw)
    }
    draw()

    // Cleanup: stop the animation loop when paused, when the mode changes and on unmount.
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [getAnalyser, playing, mode, colors])

  return (
    <button type="button" className="wa-vis" onClick={onToggle} title={label} aria-label={label}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </button>
  )
}

export default Visualizer
