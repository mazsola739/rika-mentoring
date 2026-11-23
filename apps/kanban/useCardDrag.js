import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const THRESHOLD = 6 // px the pointer has to travel before a press becomes a drag
const EDGE = 70 // px from the top/bottom of the window where auto-scroll starts
const MAX_SPEED = 16 // px per frame

// Where would the card land if it was dropped at (x, y)?
// Columns carry data-column, cards carry data-card-id. The index skips the dragged card itself.
function hitTest(x, y, dragId) {
  const columnEl = document.elementFromPoint(x, y)?.closest('[data-column]')
  if (!columnEl) return null

  const cards = [...columnEl.querySelectorAll('[data-card-id]')].filter((el) => el.dataset.cardId !== dragId)
  let index = cards.length
  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect()
    if (y < rect.top + rect.height / 2) {
      index = i
      break
    }
  }
  return { column: columnEl.dataset.column, index }
}

const sameTarget = (a, b) => a?.column === b?.column && a?.index === b?.index

// Hand-made drag & drop with pointer events (mouse, pen and touch).
// High-frequency data (pointer position) lives in refs, so moving the pointer does not re-render React;
// only a change of the drop target updates state.
export const useCardDrag = (onDrop) => {
  const [drag, setDrag] = useState(null) // null | { id, width, over: { column, index } | null }
  const press = useRef(null) // the current press, before and during the drag
  const pointer = useRef({ x: 0, y: 0 })
  const target = useRef(null)
  const overlayRef = useRef(null)
  const onDropRef = useRef(onDrop)

  // Keep the latest callback without re-binding the pointer handlers.
  useEffect(() => {
    onDropRef.current = onDrop
  })

  const placeOverlay = () => {
    const el = overlayRef.current
    const p = press.current
    if (el && p) el.style.transform = `translate(${pointer.current.x - p.offsetX}px, ${pointer.current.y - p.offsetY}px) rotate(2deg)`
  }

  const updateTarget = () => {
    if (!press.current?.active) return
    const next = hitTest(pointer.current.x, pointer.current.y, press.current.id)
    if (sameTarget(next, target.current)) return
    target.current = next
    setDrag((d) => d && { ...d, over: next })
  }

  const stop = (shouldDrop) => {
    const p = press.current
    press.current = null
    if (!p?.active) return
    const over = target.current
    target.current = null
    setDrag(null)
    if (shouldDrop && over) onDropRef.current(p.id, over.column, over.index)
  }

  // The floating copy is rendered by React; position it as soon as it exists.
  useLayoutEffect(() => {
    if (drag) placeOverlay()
  })

  // While a drag is active: auto-scroll near the window edges and let Escape cancel.
  const isDragging = drag !== null
  useEffect(() => {
    if (!isDragging) return
    let frame = 0
    const tick = () => {
      const { y } = pointer.current
      const bottom = window.innerHeight - EDGE
      const speed = y < EDGE ? -((EDGE - y) / EDGE) * MAX_SPEED : y > bottom ? ((y - bottom) / EDGE) * MAX_SPEED : 0
      if (speed) {
        window.scrollBy(0, Math.round(speed))
        updateTarget()
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    const onKey = (e) => {
      if (e.key === 'Escape') stop(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
    }
    // updateTarget and stop only touch refs and setState, so the first versions stay valid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  // Props to spread on every draggable card element.
  const bind = (id) => ({
    onPointerDown: (e) => {
      if (e.button !== 0 || press.current) return
      const onHandle = e.target.closest('[data-drag-handle]')
      const onControl = e.target.closest('button, select, input, textarea, a, label')
      // Touch scrolls the page unless it starts on the handle; buttons keep working as buttons.
      if (!onHandle && (onControl || e.pointerType === 'touch')) return
      if (!onHandle) e.preventDefault() // no text selection while dragging with a mouse

      const rect = e.currentTarget.getBoundingClientRect()
      press.current = {
        id,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        active: false,
      }
      pointer.current = { x: e.clientX, y: e.clientY }
      // Capture: we keep receiving pointer events even when the pointer leaves the card.
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e) => {
      const p = press.current
      if (!p || p.pointerId !== e.pointerId) return
      pointer.current = { x: e.clientX, y: e.clientY }
      if (!p.active) {
        if (Math.hypot(e.clientX - p.startX, e.clientY - p.startY) < THRESHOLD) return
        p.active = true
        target.current = null
        setDrag({ id: p.id, width: p.width, over: null })
      }
      placeOverlay()
      updateTarget()
    },
    onPointerUp: (e) => {
      if (press.current?.pointerId === e.pointerId) stop(true)
    },
    onPointerCancel: (e) => {
      if (press.current?.pointerId === e.pointerId) stop(false)
    },
  })

  return { drag, bind, overlayRef }
}
