import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ASPECT, drawEnd, drawSegments, drawStart, redraw } from './render.js'

// The canvas element itself. Pointer events cover mouse, touch and pen with one API.
const Canvas = ({ canvasRef, history, tool, color, size, label, onStroke }) => {
  const wrapRef = useRef(null)
  const cursorRef = useRef(null)
  const strokeRef = useRef(null) // the stroke being drawn right now (no re-render per move)
  const pointerRef = useRef(null) // id of the pointer that draws; other fingers are ignored
  const [width, setWidth] = useState(0) // CSS pixels

  // Keep the canvas backing store at CSS size × devicePixelRatio, so lines are sharp on
  // high-density screens. We draw in CSS pixels thanks to setTransform(dpr, …).
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    observer.observe(wrapRef.current)
    return () => observer.disconnect()
  }, [])

  // Resize and repaint before the browser shows the frame (no flicker). Resizing a canvas
  // clears it, so we replay the history every time.
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!width || !canvas) return
    const dpr = window.devicePixelRatio || 1
    const height = Math.round(width * ASPECT)
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    redraw(ctx, history, width)
  }, [canvasRef, history, width])

  const toPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    // Pens report pressure (0–1); mouse and touch report 0.5 or 0, so they get a steady width.
    const factor = event.pointerType === 'pen' && event.pressure > 0 ? 0.35 + event.pressure * 1.3 : 1
    return [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.width, factor]
  }

  const moveCursor = (event) => {
    const cursor = cursorRef.current
    if (!cursor) return
    const rect = canvasRef.current.getBoundingClientRect()
    cursor.style.translate = `${event.clientX - rect.left}px ${event.clientY - rect.top}px`
  }

  const showCursor = (visible) => {
    if (cursorRef.current) cursorRef.current.hidden = !visible
  }

  const onPointerDown = (event) => {
    if (pointerRef.current !== null || !width) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointerRef.current = event.pointerId
    const stroke = { tool, color, size: size / width, points: [toPoint(event)] }
    strokeRef.current = stroke
    drawStart(canvasRef.current.getContext('2d'), stroke, width)
  }

  const onPointerMove = (event) => {
    moveCursor(event)
    const stroke = strokeRef.current
    if (!stroke || event.pointerId !== pointerRef.current) return
    // Coalesced events: all the positions the pointer passed since the last frame,
    // so fast strokes stay smooth instead of becoming straight lines.
    const events = event.nativeEvent.getCoalescedEvents?.() ?? []
    const from = stroke.points.length
    ;(events.length ? events : [event.nativeEvent]).forEach((e) => stroke.points.push(toPoint(e)))
    drawSegments(canvasRef.current.getContext('2d'), stroke, from, width)
  }

  const finish = (event) => {
    const stroke = strokeRef.current
    if (!stroke || event.pointerId !== pointerRef.current) return
    drawEnd(canvasRef.current.getContext('2d'), stroke, width)
    strokeRef.current = null
    pointerRef.current = null
    onStroke(stroke)
  }

  const cursorSize = Math.max(size, 4)

  return (
    <div ref={wrapRef} className="dr-canvas">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onPointerEnter={(e) => showCursor(e.pointerType === 'mouse')}
        onPointerLeave={() => showCursor(false)}
      />
      {/* A circle that shows the brush size under the mouse. */}
      <span
        ref={cursorRef}
        className={`dr-cursor${tool === 'eraser' ? ' is-eraser' : ''}`}
        style={{ width: cursorSize, height: cursorSize, margin: -cursorSize / 2 }}
        hidden
        aria-hidden="true"
      />
    </div>
  )
}

export default Canvas
