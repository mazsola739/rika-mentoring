import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const SPEED = 34 // px per second while it drifts
const EASE = 6 // how fast it speeds up and slows down (per second)
const DRAG_START = 6 // px before a press counts as a drag, not a click

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
const easeOut = (p) => 1 - (1 - p) ** 3

// An endless, slowly drifting row of cards ("körhinta").
// It slows to a stop while the mouse is over it, while a card is flipped, and while a card
// has keyboard focus. Arrows step one card, the row can be dragged or swiped, and the
// pause button stops it for good. With reduced motion it starts paused.
// The items are repeated so the loop never shows an end. The second round holds the real
// cards (the first one in view); the other rounds are marked as copies.
export default function Carousel({ items, getKey, renderItem, label, head, t }) {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const [copies, setCopies] = useState(2)
  const [playing, setPlaying] = useState(() => !reducedMotion())
  const playingRef = useRef(playing)
  playingRef.current = playing
  const s = useRef({
    x: 0,
    v: 0,
    loop: 0,
    step: 0,
    pad: 0,
    fresh: true,
    tween: null,
    drag: null,
    dragged: false,
    hover: false,
    focus: false,
    visible: true,
    open: new Set(),
  }).current

  // A new set of cards starts from the beginning.
  useLayoutEffect(() => {
    s.fresh = true
    s.v = 0
    s.tween = null
    s.open.clear()
  }, [items, s])

  // Measure one full round (where the first copy starts again) and one card step.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    const measure = () => {
      const kids = track.children
      if (kids.length < 2) return
      s.step = kids[1].offsetLeft - kids[0].offsetLeft
      s.loop = kids[items.length] ? kids[items.length].offsetLeft - kids[0].offsetLeft : 0
      // Where the page's content column starts, so a card can line up with the text above.
      s.pad = viewport.parentElement.getBoundingClientRect().left - viewport.getBoundingClientRect().left
      if (s.loop) setCopies(Math.max(2, Math.ceil(viewport.clientWidth / s.loop) + 1))
      // Start on the second round, so there are always cards on both sides of the view.
      if (s.fresh && s.loop) {
        s.x = s.loop - s.pad
        s.fresh = false
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [items, copies, s])

  // Only move while it can be seen.
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting
    })
    io.observe(viewportRef.current)
    return () => io.disconnect()
  }, [s])

  // The animation loop.
  useEffect(() => {
    let raf
    let last = performance.now()
    let shown = null
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const running = playingRef.current && s.visible && !s.hover && !s.focus && !s.drag && s.open.size === 0
      s.v += ((running ? SPEED : 0) - s.v) * Math.min(1, dt * EASE)
      if (Math.abs(s.v) < 0.5 && !running) s.v = 0
      if (s.tween) {
        const p = Math.min(1, (now - s.tween.t0) / s.tween.dur)
        s.x = s.tween.from + (s.tween.to - s.tween.from) * easeOut(p)
        if (p === 1) s.tween = null
      } else if (!s.drag) {
        s.x += s.v * dt
      }
      if (s.loop > 0) {
        const wrapped = ((s.x % s.loop) + s.loop) % s.loop
        if (s.tween) {
          const shift = wrapped - s.x
          s.tween.from += shift
          s.tween.to += shift
        }
        if (s.drag) s.drag.x0 += wrapped - s.x
        s.x = wrapped
      }
      if (shown !== s.x) {
        trackRef.current.style.transform = `translate3d(${-s.x}px,0,0)`
        shown = s.x
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [s])

  const glideTo = (to) => {
    s.v = 0
    s.tween = { from: s.x, to, t0: performance.now(), dur: reducedMotion() ? 1 : 520 }
  }

  // Step one card, lining the row up with a card edge.
  const stepBy = (dir) => {
    if (!s.step) return
    const base = (s.tween ? s.tween.to : s.x) + s.pad
    glideTo((Math.round(base / s.step) + dir) * s.step - s.pad)
  }

  // Keep a card that gets keyboard focus fully in view.
  const onFocus = (e) => {
    if (!e.target.matches(':focus-visible')) return
    s.focus = true
    const item = e.target.closest('.carousel__item')
    const viewport = viewportRef.current
    if (!item) return
    const left = item.offsetLeft - s.x
    if (left < 0 || left + item.offsetWidth > viewport.clientWidth) {
      glideTo(item.offsetLeft - Math.max(0, (viewport.clientWidth - item.offsetWidth) / 2))
    }
  }

  const onBlur = (e) => {
    if (!viewportRef.current.contains(e.relatedTarget)) s.focus = false
  }

  // Drag and swipe. A press that moves less than a few pixels stays a normal click.
  const onPointerDown = (e) => {
    if (e.button !== 0) return
    s.drag = null
    s.dragged = false
    s.press = { id: e.pointerId, x: e.clientX, x0: s.x, t: performance.now(), last: e.clientX }
  }

  const onPointerMove = (e) => {
    const press = s.press
    if (!press || press.id !== e.pointerId) return
    const dx = e.clientX - press.x
    if (!s.drag) {
      if (Math.abs(dx) < DRAG_START) return
      s.drag = press
      s.tween = null
      viewportRef.current.setPointerCapture(e.pointerId)
      viewportRef.current.classList.add('is-dragging')
    }
    const now = performance.now()
    const dt = Math.max(1, now - press.t) / 1000
    press.vel = -(e.clientX - press.last) / dt
    press.t = now
    press.last = e.clientX
    s.x = s.drag.x0 - dx
  }

  const onPointerUp = (e) => {
    if (s.press?.id !== e.pointerId) return
    if (s.drag) {
      s.v = Math.max(-2400, Math.min(2400, s.drag.vel || 0))
      s.dragged = true
      viewportRef.current.classList.remove('is-dragging')
    }
    s.drag = null
    s.press = null
  }

  // A drag must not also flip the card it ended on.
  const onClickCapture = (e) => {
    if (s.dragged) {
      e.preventDefault()
      e.stopPropagation()
      s.dragged = false
    }
  }

  const all = []
  for (let c = 0; c < copies; c++) {
    for (const item of items) {
      const key = getKey(item)
      all.push(
        <li key={`${c}-${key}`} className="carousel__item">
          {renderItem(item, {
            copy: c !== 1,
            onFlipChange: (open) => (open ? s.open.add(`${c}-${key}`) : s.open.delete(`${c}-${key}`)),
          })}
        </li>,
      )
    }
  }

  return (
    <section className="carousel" aria-roledescription={t.carousel} aria-label={label}>
      <div className="carousel__bar">
        {head}
        <div className="carousel__controls">
          <button type="button" className="carousel__btn" onClick={() => stepBy(-1)} aria-label={t.prev} title={t.prev}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="carousel__btn"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? t.pause : t.play}
            title={playing ? t.pause : t.play}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {playing ? <path d="M9 6v12M15 6v12" /> : <path d="M8 5.5v13l10.5-6.5z" className="is-filled" />}
            </svg>
          </button>
          <button type="button" className="carousel__btn" onClick={() => stepBy(1)} aria-label={t.next} title={t.next}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={viewportRef}
        className="carousel__viewport"
        onPointerEnter={(e) => e.pointerType === 'mouse' && (s.hover = true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && (s.hover = false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <ul ref={trackRef} className="carousel__track">
          {all}
        </ul>
      </div>
    </section>
  )
}
