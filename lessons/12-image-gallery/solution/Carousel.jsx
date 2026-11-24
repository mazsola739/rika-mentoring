import { useEffect, useState } from 'react'

const DELAY = 4000
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Carousel({ images, paused, onOpen, t }) {
  const [index, setIndex] = useState(0)
  // Autoplay starts only for people who have not asked their system for less motion.
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [hovering, setHovering] = useState(false)
  const count = images.length
  const current = Math.min(index, count - 1)
  const image = images[current]
  const running = playing && !hovering && !paused && count > 1

  // The heart of the lesson: start an interval, and clear it in the cleanup. It re-runs when
  // `current` changes too, so after a manual click the next slide waits a full DELAY again.
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setIndex((i) => (Math.min(i, count - 1) + 1) % count), DELAY)
    return () => clearInterval(id)
  }, [running, count, current])

  if (!image) return null

  const go = (i) => setIndex((i + count) % count)

  return (
    <section
      className="ig-carousel"
      aria-roledescription={t.carousel}
      aria-label={t.slideshow}
      // Pause while a mouse is over the slideshow (touch taps should not pause it forever).
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(current + 1)
        if (e.key === 'ArrowLeft') go(current - 1)
      }}
    >
      <div className="ig-stage" style={{ background: image.bg }}>
        <button type="button" className="ig-stage__open" onClick={() => onOpen(image.id)} aria-label={t.openLarge(image.caption)}>
          <img key={image.id} className="ig-stage__img" src={image.src} alt={image.alt} />
        </button>
        <button
          type="button"
          className="ig-round ig-stage__prev"
          onClick={() => go(current - 1)}
          aria-label={t.prev}
          disabled={count < 2}
        >
          ←
        </button>
        <button
          type="button"
          className="ig-round ig-stage__next"
          onClick={() => go(current + 1)}
          aria-label={t.next}
          disabled={count < 2}
        >
          →
        </button>
        {running && (
          <span key={`${image.id}-${current}`} className="ig-stage__timer" style={{ animationDuration: `${DELAY}ms` }} />
        )}
      </div>

      <div className="ig-carousel__bar">
        <button
          type="button"
          className="btn btn--ghost ig-play"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          disabled={count < 2}
        >
          {playing ? `❚❚ ${t.pause}` : `▶ ${t.play}`}
        </button>
        {/* Screen readers hear the slide change only while the show is paused (APG carousel pattern). */}
        <p className="ig-carousel__caption" aria-live={running ? 'off' : 'polite'}>
          <strong>{image.caption}</strong> <span>{t.counter(current + 1, count)}</span>
        </p>
      </div>
    </section>
  )
}
