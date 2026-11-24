import { useEffect, useRef, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { useCamera } from './useCamera.js'
import { FILTER_KEYS, cssFilter } from './filters.js'
import { canvasToBlob, composeSingle, composeStrip, grabFrame } from './compose.js'
import Gallery from './Gallery.jsx'
import './app.css'

const SHOTS = { single: 1, strip: 4 }

// A timer as a Promise that can be cancelled with an AbortController.
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(id)
        reject(new DOMException('Cancelled', 'AbortError'))
      },
      { once: true },
    )
  })
}

const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

const CameraOverlay = ({ camera, t }) => {
  if (camera.status === 'live') return null
  if (camera.status === 'requesting') {
    return (
      <div className="pb-overlay" role="status">
        <span className="pb-spinner" aria-hidden="true" />
        <h3>{t.requesting.title}</h3>
        <p>{t.requesting.text}</p>
      </div>
    )
  }
  if (camera.status === 'error') {
    return (
      <div className="pb-overlay" role="alert">
        <h3>{t.errorTitle}</h3>
        <p>{t.errors[camera.error] ?? t.errors.unknown}</p>
        {camera.error !== 'insecure' && camera.error !== 'unsupported' && (
          <button type="button" className="btn" onClick={camera.start}>
            {t.retry}
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="pb-overlay">
      <svg className="pb-overlay__icon" viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
        <path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
      <h3>{t.intro.title}</h3>
      <p>{t.intro.text}</p>
      <button type="button" className="btn" onClick={camera.start}>
        {t.intro.button}
      </button>
    </div>
  )
}

const PhotoBooth = () => {
  const t = useText(TEXT)
  const lang = useLang()
  const { palette } = useLesson()
  // The <video> element shows the camera stream; we also read frames from it for photos.
  const videoRef = useRef(null)
  const camera = useCamera(videoRef)

  const [mode, setMode] = useState('single')
  const [filter, setFilter] = useState('none')
  const [frameColor, setFrameColor] = useState(palette.solid)
  const [busy, setBusy] = useState(false)
  const [count, setCount] = useState(null) // 3, 2, 1 during the countdown
  const [shot, setShot] = useState(0) // which shot of the strip is being taken
  const [flash, setFlash] = useState(0) // increases on every shot to replay the flash animation
  const [photos, setPhotos] = useState([]) // { id, url, kind, createdAt } – this session only
  const [selectedId, setSelectedId] = useState(null)
  const [message, setMessage] = useState(null)

  const abortRef = useRef(null)
  const photosRef = useRef(photos)
  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  // On unmount: cancel a running countdown and free every photo's object URL.
  useEffect(
    () => () => {
      abortRef.current?.abort()
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.url))
    },
    [],
  )

  // Turning the camera off in the middle of a countdown cancels it.
  useEffect(() => {
    if (camera.status !== 'live') abortRef.current?.abort()
  }, [camera.status])

  const shoot = async () => {
    const controller = new AbortController()
    abortRef.current = controller
    const total = SHOTS[mode]
    const shots = []
    setBusy(true)
    setMessage(null)
    try {
      for (let i = 0; i < total; i++) {
        setShot(i + 1)
        for (let n = 3; n > 0; n--) {
          setCount(n)
          await sleep(1000, controller.signal)
        }
        setCount(null)
        const video = videoRef.current
        if (!video?.videoWidth) throw new Error('no-frame')
        shots.push(grabFrame(video, filter))
        setFlash((f) => f + 1)
        if (i < total - 1) await sleep(800, controller.signal)
      }
      const date = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { dateStyle: 'long' }).format(new Date())
      const text = { title: t.caption, date }
      // Make sure the display font is loaded before the canvas writes the caption.
      await document.fonts?.load('600 28px Fraunces').catch(() => {})
      const canvas = total === 1 ? composeSingle(shots[0], frameColor, text) : composeStrip(shots, frameColor, text)
      const blob = await canvasToBlob(canvas)
      const photo = { id: uid(), url: URL.createObjectURL(blob), kind: mode, createdAt: Date.now() }
      setPhotos((list) => [photo, ...list])
      setSelectedId(photo.id)
      setMessage('saved')
    } catch (err) {
      if (err.name !== 'AbortError') setMessage('exportFailed')
    } finally {
      setBusy(false)
      setCount(null)
      setShot(0)
    }
  }

  const removePhoto = (id) => {
    const photo = photos.find((p) => p.id === id)
    if (photo) URL.revokeObjectURL(photo.url)
    setPhotos((list) => list.filter((p) => p.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const live = camera.status === 'live'
  const total = SHOTS[mode]

  return (
    <div className="pb">
      {/* The stage shows the chosen frame color around the live preview. */}
      <div className="pb-stage" style={{ '--frame': frameColor }}>
        <div className="pb-screen">
          <video
            ref={videoRef}
            className="pb-video"
            style={{ filter: cssFilter(filter) }}
            playsInline
            muted
            hidden={!live}
            aria-label={t.preview}
          />
          <CameraOverlay camera={camera} t={t} />

          {count !== null && (
            <div className="pb-count" aria-hidden="true" key={`${shot}-${count}`}>
              {count}
            </div>
          )}
          {busy && total > 1 && <span className="pb-badge">{t.shotOf(shot, total)}</span>}
          {flash > 0 && <span key={flash} className="pb-flash" aria-hidden="true" />}
          <p className="visually-hidden" aria-live="assertive">
            {count !== null ? t.countdown(count) : ''}
          </p>
        </div>
      </div>

      <div className="pb-controls">
        <fieldset className="pb-group" disabled={busy}>
          <legend>{t.mode}</legend>
          <div className="pb-chips">
            {Object.keys(SHOTS).map((key) => (
              <button key={key} type="button" className="chip" aria-pressed={mode === key} onClick={() => setMode(key)}>
                {t.modes[key]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="pb-group" disabled={busy}>
          <legend>{t.filter}</legend>
          <div className="pb-chips">
            {FILTER_KEYS.map((key) => (
              <button key={key} type="button" className="chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>
                {t.filters[key]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="pb-group" disabled={busy}>
          <legend>{t.frame}</legend>
          <div className="pb-swatches">
            {palette.colors.map((color) => (
              <button
                key={color}
                type="button"
                className="pb-swatch"
                style={{ background: color }}
                aria-pressed={frameColor === color}
                aria-label={t.frameColor(color)}
                title={color}
                onClick={() => setFrameColor(color)}
              />
            ))}
          </div>
        </fieldset>

        <div className="pb-actions">
          {busy ? (
            <button type="button" className="btn btn--ghost" onClick={() => abortRef.current?.abort()}>
              {t.cancel}
            </button>
          ) : (
            <button type="button" className="btn pb-shoot" onClick={shoot} disabled={!live}>
              <span className="pb-shoot__dot" aria-hidden="true" />
              {t.shoot[mode]}
            </button>
          )}
          {live && !busy && (
            <button type="button" className="btn btn--ghost" onClick={camera.stop}>
              {t.turnOff}
            </button>
          )}
        </div>
      </div>

      <p className={`pb-message${message === 'exportFailed' ? ' is-error' : ''}`} aria-live="polite">
        {message ? (message === 'saved' ? t.saved : t.exportFailed) : ''}
      </p>

      <Gallery photos={photos} selectedId={selectedId} onSelect={setSelectedId} onRemove={removePhoto} />
    </div>
  )
}

const App = () => {
  return (
    <AppFrame slug="photo-booth">
      <PhotoBooth />
    </AppFrame>
  )
}

export default App
