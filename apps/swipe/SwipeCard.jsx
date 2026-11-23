import { useRef, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT, genreLabel } from './text.js'
import ShowArt from './ShowArt.jsx'

const SWIPE_DISTANCE = 110 // px: dragging farther than this decides
const FLICK_SPEED = 0.6 // px/ms: a quick flick decides even over a short distance

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// One card of the stack. Only the top card listens to the pointer.
// `leaving` ('like' | 'nope') makes the card fly out; the parent commits the decision afterwards.
export default function SwipeCard({ show, depth, layer, leaving, locked, onSwipe }) {
  const lang = useLang()
  const t = useText(TEXT)
  const [offset, setOffset] = useState(null) // { x, y } while the pointer is down
  const [broken, setBroken] = useState(false)
  const start = useRef(null)
  const interactive = depth === 0 && !leaving && !locked

  const handlers = interactive
    ? {
        onPointerDown(e) {
          if (e.button !== 0) return
          // Pointer capture: the card keeps getting events even if the pointer leaves it.
          e.currentTarget.setPointerCapture(e.pointerId)
          start.current = { x: e.clientX, y: e.clientY, time: performance.now(), pointerId: e.pointerId }
          setOffset({ x: 0, y: 0 })
        },
        onPointerMove(e) {
          const s = start.current
          if (!s || s.pointerId !== e.pointerId) return
          setOffset({ x: e.clientX - s.x, y: (e.clientY - s.y) * 0.35 })
        },
        onPointerUp(e) {
          const s = start.current
          if (!s || s.pointerId !== e.pointerId) return
          start.current = null
          const dx = e.clientX - s.x
          const speed = Math.abs(dx) / Math.max(1, performance.now() - s.time)
          if (Math.abs(dx) > SWIPE_DISTANCE || (speed > FLICK_SPEED && Math.abs(dx) > 30)) {
            // Keep the offset so the card flies on from where it is; spring back if the swipe was refused.
            if (!onSwipe(dx > 0 ? 'like' : 'nope')) setOffset(null)
          } else {
            setOffset(null) // not far enough: spring back
          }
        },
        onPointerCancel() {
          start.current = null
          setOffset(null)
        },
      }
    : {}

  // -1 … 1: how far the card is towards "nope" or "like". Drives rotation and the stamps.
  const progress = leaving ? (leaving === 'like' ? 1 : -1) : offset ? clamp(offset.x / SWIPE_DISTANCE, -1, 1) : 0

  let transform
  if (leaving) {
    const dir = leaving === 'like' ? 1 : -1
    transform = `translate(${dir * 150}%, ${offset?.y ?? 0}px) rotate(${dir * 24}deg)`
  } else if (offset) {
    transform = `translate(${offset.x}px, ${offset.y}px) rotate(${clamp(offset.x * 0.07, -20, 20)}deg)`
  } else {
    transform = `translateY(${depth * 14}px) scale(${1 - depth * 0.05})`
  }

  const summary = show.summary?.[lang] || show.summary?.en || ''
  const summaryLang = show.summary?.[lang] ? undefined : 'en'

  return (
    <article
      className={`sw-card${offset && !leaving ? ' is-dragging' : ''}${leaving ? ' is-leaving' : ''}${interactive ? ' is-top' : ''}`}
      style={{ transform, zIndex: layer }}
      aria-hidden={depth > 0 || leaving ? true : undefined}
      inert={!interactive}
      {...handlers}
    >
      <div className="sw-card__media">
        {/* No poster (offline list) or a poster that failed to load: flat colour with initials. */}
        {broken || !show.image ? (
          <ShowArt name={show.name} className="sw-card__fallback" />
        ) : (
          <img src={show.image} alt={t.poster(show.name)} draggable={false} onError={() => setBroken(true)} />
        )}
      </div>

      <span className="sw-stamp sw-stamp--like" style={{ opacity: Math.max(0, progress) }} aria-hidden="true">
        {t.likeStamp}
      </span>
      <span className="sw-stamp sw-stamp--nope" style={{ opacity: Math.max(0, -progress) }} aria-hidden="true">
        {t.nopeStamp}
      </span>

      <div className="sw-card__info">
        <h3 className="sw-card__name">{show.name}</h3>
        <p className="sw-card__meta">
          {show.year && <span>{show.year}</span>}
          {show.rating && (
            <span aria-label={t.rating(show.rating)}>
              <span aria-hidden="true">★ {show.rating}</span>
            </span>
          )}
        </p>
        {show.genres.length > 0 && (
          <ul className="sw-genres">
            {show.genres.slice(0, 3).map((genre) => (
              <li key={genre}>{genreLabel(genre, lang)}</li>
            ))}
          </ul>
        )}
        {summary && (
          <p className="sw-card__summary" lang={summaryLang}>
            {summary}
          </p>
        )}
      </div>
    </article>
  )
}
