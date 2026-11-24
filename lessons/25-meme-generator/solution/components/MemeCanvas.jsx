import { useEffect, useRef } from 'react'
import { clamp, drawMeme, isInside } from '../drawMeme.js'

// Arrow keys nudge the selected item by 1% of the canvas (5% with Shift).
const NUDGE = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

export default function MemeCanvas({ canvasRef, image, scene, label, hintId, onSelect, onMove, onNudge, onDeleteSelected }) {
  // After drawing, the boxes of the captions and stickers; while dragging, what we drag. Neither is shown on the
  // screen, so they are refs, not state: changing them does not render the component again.
  const boxesRef = useRef([])
  const dragRef = useRef(null)

  // Canvas drawing is a side effect: React renders the <canvas>, the effect paints on it.
  useEffect(() => {
    if (image.status !== 'ready' || !canvasRef.current) return
    boxesRef.current = drawMeme(canvasRef.current, image.image, scene)
  }, [canvasRef, image.status, image.image, scene])

  // The pointer's position in the canvas's own pixels (on the screen the canvas is usually smaller).
  function toCanvasPoint(event) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function handlePointerDown(event) {
    if (image.status !== 'ready') return
    // Search from the back: what was drawn last is on top.
    const box = boxesRef.current.findLast((item) => isInside(toCanvasPoint(event), item))
    if (!box) return
    // Every move of this pointer now comes here, even when it slips off the canvas.
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: box.id, startX: event.clientX, startY: event.clientY, x: box.x, y: box.y }
    onSelect(box.id)
  }

  function handlePointerMove(event) {
    const drag = dragRef.current
    if (!drag) return
    const rect = canvasRef.current.getBoundingClientRect()
    // The movement as a fraction of the canvas's size on the screen, added to where the drag started.
    onMove(drag.id, {
      x: clamp(drag.x + (event.clientX - drag.startX) / rect.width),
      y: clamp(drag.y + (event.clientY - drag.startY) / rect.height),
    })
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  function handleKeyDown(event) {
    if (NUDGE[event.key]) {
      event.preventDefault() // the arrow keys would scroll the page
      const step = event.shiftKey ? 0.05 : 0.01
      const [dx, dy] = NUDGE[event.key]
      onNudge(dx * step, dy * step)
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      onDeleteSelected()
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="mg-canvas mg-canvas--draggable"
      data-ready={image.status === 'ready'}
      role="img"
      tabIndex={0}
      aria-label={label}
      aria-describedby={hintId}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    />
  )
}
