import { useEffect, useRef, useState } from 'react'

// This API's videos are short animations in SVG format, which an <img> plays by itself.
// Other formats (an .mp4, a link to a video site) would need a <video> element or an embed.
const isSvgAnimation = (url) => /\.svg(?:[?#]|$)/i.test(url ?? '')

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// The full-size picture in a modal <dialog>: Esc, the close button or a click outside closes it.
function FullSizeDialog({ src, title, onClose, t }) {
  const ref = useRef(null)

  // Removing the element on unmount closes it too, so the effect needs no cleanup.
  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className="sx-zoom"
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
    >
      <img src={src} alt={title} />
      <button type="button" className="btn sx-zoom__close" onClick={() => ref.current?.close()}>
        {t.close}
      </button>
    </dialog>
  )
}

function ImageView({ apod, onBroken, t }) {
  const [zoomed, setZoomed] = useState(false)
  return (
    <figure className="sx-media">
      <img src={apod.url} alt={apod.title} onError={onBroken} />
      <figcaption>
        <button type="button" className="sx-media__link" onClick={() => setZoomed(true)}>
          {t.openFull}
        </button>
      </figcaption>
      {zoomed && <FullSizeDialog src={apod.hdurl || apod.url} title={apod.title} onClose={() => setZoomed(false)} t={t} />}
    </figure>
  )
}

function AnimationView({ apod, onBroken, t }) {
  // People who asked their system for less motion get the still frame first.
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  // A paused animation shows the still thumbnail instead (the API sends one when asked with thumbs=true).
  const still = apod.thumbnail_url
  return (
    <figure className="sx-media sx-media--video">
      <img src={playing || !still ? apod.url : still} alt={apod.title} onError={onBroken} />
      <figcaption>
        <span className="sx-media__badge">{t.animation}</span>
        {still && (
          <button type="button" className="sx-media__link" aria-pressed={!playing} onClick={() => setPlaying((p) => !p)}>
            {playing ? t.pause : t.play}
          </button>
        )}
      </figcaption>
    </figure>
  )
}

// Rendering by media type: an image, an animation the page can play, or a note for everything else.
export default function ApodMedia({ apod, t }) {
  const [broken, setBroken] = useState(false)
  const onBroken = () => setBroken(true)

  if (!broken && apod.media_type === 'image') return <ImageView apod={apod} onBroken={onBroken} t={t} />
  if (!broken && apod.media_type === 'video' && isSvgAnimation(apod.url)) {
    return <AnimationView apod={apod} onBroken={onBroken} t={t} />
  }

  let note = t.otherMedia
  if (broken) note = t.mediaError
  else if (apod.media_type === 'video') note = t.videoUnsupported
  return (
    <div className="sx-media sx-media--note">
      {apod.thumbnail_url && !broken && <img className="sx-media__thumb" src={apod.thumbnail_url} alt="" />}
      <p>{note}</p>
    </div>
  )
}
