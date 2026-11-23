import { useEffect, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { SAMPLES } from './samples.js'
import { useUploads } from './useUploads.js'
import Carousel from './Carousel.jsx'
import Lightbox from './Lightbox.jsx'
import './app.css'

const TEXT = {
  en: {
    filters: { all: 'All', sample: 'Samples', upload: 'My uploads' },
    filterLabel: 'Show',
    carousel: 'carousel',
    slideshow: 'Slideshow',
    play: 'Play',
    pause: 'Pause',
    prev: 'Previous image',
    next: 'Next image',
    chooseSlide: 'Choose a slide',
    slide: (n, caption) => `Slide ${n}: ${caption}`,
    counter: (i, n) => `${i} / ${n}`,
    openLarge: (caption) => `Open ${caption} in large view`,
    viewer: 'Image viewer',
    close: 'Close',
    colors: 'Colors in this image',
    drop: 'Drop images here',
    choose: 'or choose files',
    dropHint: 'JPG, PNG, WebP, GIF… They stay in this browser tab only.',
    added: (n) => (n === 1 ? '1 image added.' : `${n} images added.`),
    skipped: (n) => (n === 1 ? '1 file skipped: it is not an image.' : `${n} files skipped: they are not images.`),
    remove: (name) => `Remove ${name}`,
    removed: (name) => `${name} removed.`,
    noUploads: 'No uploads yet. Drop a few photos above and they will join the slideshow.',
    keys: 'In the large view: ← → to browse, Esc to close.',
  },
  hu: {
    filters: { all: 'Mind', sample: 'Bemutatóképek', upload: 'Feltöltéseim' },
    filterLabel: 'Mutasd',
    carousel: 'képváltó',
    slideshow: 'Diavetítés',
    play: 'Lejátszás',
    pause: 'Szünet',
    prev: 'Előző kép',
    next: 'Következő kép',
    chooseSlide: 'Dia választása',
    slide: (n, caption) => `${n}. dia: ${caption}`,
    counter: (i, n) => `${i} / ${n}`,
    openLarge: (caption) => `${caption} megnyitása nagy nézetben`,
    viewer: 'Képnézegető',
    close: 'Bezárás',
    colors: 'A kép színei',
    drop: 'Húzd ide a képeket',
    choose: 'vagy válassz fájlokat',
    dropHint: 'JPG, PNG, WebP, GIF… Csak ebben a böngészőlapban maradnak meg.',
    added: (n) => `${n} kép hozzáadva.`,
    skipped: (n) => `${n} fájl kimaradt, mert nem kép.`,
    remove: (name) => `${name} eltávolítása`,
    removed: (name) => `${name} eltávolítva.`,
    noUploads: 'Még nincs feltöltés. Húzz ide néhány fotót, és bekerülnek a diavetítésbe is.',
    keys: 'Nagy nézetben: ← → lapozás, Esc bezárás.',
  },
}

function DropZone({ onFiles, t }) {
  const [over, setOver] = useState(false)
  return (
    <label
      className={`ig-drop${over ? ' is-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault() // without this the browser would open the file instead
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        onFiles(e.dataTransfer.files)
      }}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        onChange={(e) => {
          onFiles(e.target.files)
          e.target.value = '' // lets you pick the same file again
        }}
      />
      <strong>{t.drop}</strong> <span className="ig-drop__link">{t.choose}</span>
      <small>{t.dropHint}</small>
    </label>
  )
}

function Gallery() {
  const lang = useLang()
  const t = useText(TEXT)
  const { uploads, add, remove } = useUploads()
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  // Captions and alt texts are computed here, so they follow the language switch.
  const all = [
    ...SAMPLES.map((img) => ({ ...img, caption: img.caption[lang], alt: img.alt[lang], bg: 'var(--paper-2)' })),
    ...uploads.map((img) => ({ ...img, caption: img.name, alt: img.name, bg: 'var(--ink)' })),
  ]
  const images = filter === 'all' ? all : all.filter((img) => img.kind === filter)
  const openIndex = images.findIndex((img) => img.id === openId)

  const addFiles = (files) => {
    const { added, skipped } = add(files)
    setMessage([added && t.added(added), skipped && t.skipped(skipped)].filter(Boolean).join(' '))
  }

  return (
    <div className="ig">
      <div className="ig-filters" role="group" aria-label={t.filterLabel}>
        {Object.entries(t.filters).map(([key, name]) => (
          <button key={key} type="button" className="chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {name}
            <span className="ig-count">{key === 'all' ? all.length : all.filter((img) => img.kind === key).length}</span>
          </button>
        ))}
      </div>

      {/* key: a different filter means a different set of slides, so the carousel starts over. */}
      {images.length > 0 && <Carousel key={filter} images={images} paused={openId !== null} onOpen={setOpenId} t={t} />}

      <DropZone onFiles={addFiles} t={t} />
      <p className="ig-message" role="status" aria-live="polite">
        {message}
      </p>

      {images.length === 0 ? (
        <p className="ig-empty">{t.noUploads}</p>
      ) : (
        <ul className="ig-grid">
          {images.map((img) => (
            <li key={img.id} className="ig-grid__item">
              <button type="button" className="ig-thumb" onClick={() => setOpenId(img.id)} aria-label={t.openLarge(img.caption)}>
                <img src={img.thumb} alt="" loading="lazy" />
                <span className="ig-thumb__caption">{img.caption}</span>
              </button>
              {img.kind === 'upload' && (
                <button
                  type="button"
                  className="ig-remove"
                  aria-label={t.remove(img.caption)}
                  title={t.remove(img.caption)}
                  onClick={() => {
                    remove(img.id)
                    setMessage(t.removed(img.caption))
                  }}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="ig-keys">{t.keys}</p>

      <Lightbox
        images={images}
        index={openIndex === -1 ? null : openIndex}
        onClose={() => setOpenId(null)}
        onIndex={(i) => setOpenId(images[i].id)}
        t={t}
      />
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="image-gallery">
      <Gallery />
    </AppFrame>
  )
}
