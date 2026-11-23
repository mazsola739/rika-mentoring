import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { usePhotos } from './usePhotos.js'
import AlbumFilter from './AlbumFilter.jsx'
import Carousel from './Carousel.jsx'
import Lightbox from './Lightbox.jsx'
import Thumbnail from './Thumbnail.jsx'
import './app.css'

const PAGE_SIZE = 12 // the grid grows by this many pictures at a time

const TEXT = {
  en: {
    albums: { all: 'All', landscapes: 'Landscapes', shapes: 'Shapes', patterns: 'Patterns', uploads: 'My uploads' },
    albumsLabel: 'Albums',
    carousel: 'carousel',
    slideshow: 'Featured pictures',
    play: 'Play',
    pause: 'Pause',
    prev: 'Previous picture',
    next: 'Next picture',
    counter: (i, n) => `${i} / ${n}`,
    openLarge: (caption) => `Open ${caption} in large view`,
    viewer: 'Picture viewer',
    close: 'Close',
    colors: 'Colors in this picture',
    drop: 'Drop pictures here',
    choose: 'or choose files',
    dropHint: 'JPG, PNG, WebP, GIF… They stay in this browser tab only.',
    added: (n) => (n === 1 ? '1 picture added.' : `${n} pictures added.`),
    skipped: (n) => (n === 1 ? '1 file skipped: it is not a picture.' : `${n} files skipped: they are not pictures.`),
    remove: (name) => `Remove ${name}`,
    removed: (name) => `${name} removed.`,
    moveEarlier: (name) => `Move ${name} earlier`,
    moveLater: (name) => `Move ${name} later`,
    moved: (name, place, count) => `${name} moved to place ${place} of ${count}.`,
    noUploads: 'No uploads yet. Drop a few photos above and they will join the slideshow.',
    emptyAlbum: 'No pictures in this album yet.',
    more: 'More pictures on the way…',
    keys: 'In the large view: ← → to browse, Esc to close. To reorder, drag a picture onto another one, or use its ‹ › buttons.',
  },
  hu: {
    albums: { all: 'Mind', landscapes: 'Tájak', shapes: 'Formák', patterns: 'Minták', uploads: 'Feltöltéseim' },
    albumsLabel: 'Albumok',
    carousel: 'képváltó',
    slideshow: 'Kiemelt képek',
    play: 'Lejátszás',
    pause: 'Szünet',
    prev: 'Előző kép',
    next: 'Következő kép',
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
    moveEarlier: (name) => `${name} mozgatása előrébb`,
    moveLater: (name) => `${name} mozgatása hátrébb`,
    moved: (name, place, count) => `${name} új helye: ${place} / ${count}.`,
    noUploads: 'Még nincs feltöltés. Húzz ide néhány fotót, és bekerülnek a diavetítésbe is.',
    emptyAlbum: 'Ebben az albumban még nincs kép.',
    more: 'Még több kép érkezik…',
    keys: 'Nagy nézetben: ← → lapozás, Esc bezárás. Átrendezéshez húzz egy képet egy másikra, vagy használd a ‹ › gombjait.',
  },
}

function DropZone({ onFiles, t }) {
  const [over, setOver] = useState(false)
  // Only files are welcome here; a thumbnail dragged across the page is not.
  const hasFiles = (e) => e.dataTransfer.types.includes('Files')
  return (
    <label
      className={`ig-drop${over ? ' is-over' : ''}`}
      onDragOver={(e) => {
        if (!hasFiles(e)) return
        e.preventDefault() // without this the browser would open the file instead
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (!hasFiles(e)) return
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
  const { photos, add, remove, move } = usePhotos()
  const [album, setAlbum] = useState('all')
  // How many pictures of the album the grid shows: infinite scroll adds PAGE_SIZE more at a time.
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  // The picture open in the large view: its id, and whether it was opened from the carousel
  // (then the large view browses every picture) or from the grid (then only the album).
  const [open, setOpen] = useState(null)
  const [message, setMessage] = useState('')
  // The sentinel under the grid: when it gets near the screen, the next batch comes.
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  // Captions and alt texts are picked here, on every render, so they follow the language switch.
  const all = photos.map((photo) =>
    photo.upload
      ? { ...photo, caption: photo.name, alt: photo.name, bg: 'var(--ink)' }
      : { ...photo, caption: photo.title, alt: photo.alt[lang], bg: 'var(--paper-2)' },
  )
  // Derived values: worked out from the state on every render, never stored.
  const albumPhotos = album === 'all' ? all : all.filter((photo) => photo.album === album)
  const shownPhotos = albumPhotos.slice(0, shownCount)
  const hasMore = shownCount < albumPhotos.length
  const viewList = open?.fromCarousel ? all : albumPhotos
  const openIndex = open ? viewList.findIndex((photo) => photo.id === open.id) : -1

  useEffect(() => {
    if (!hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setShownCount((count) => count + PAGE_SIZE)
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinelRef.current)
    // shownCount is a dependency on purpose: a fresh observer reports at once whether the sentinel is still
    // near the screen after a batch, so a tall screen keeps filling up instead of getting stuck.
    return () => observer.disconnect()
  }, [hasMore, shownCount])

  function changeAlbum(next) {
    setAlbum(next)
    // A new album starts again with the first batch; done here, not in an effect, so no render shows the old count.
    setShownCount(PAGE_SIZE)
  }

  function addFiles(files) {
    const { added, skipped } = add(files)
    setMessage([added && t.added(added), skipped && t.skipped(skipped)].filter(Boolean).join(' '))
  }

  function dropOn(draggedId, index) {
    const dragged = albumPhotos.find((photo) => photo.id === draggedId)
    if (!dragged || dragged.id === albumPhotos[index].id) return
    move(dragged.id, albumPhotos[index].id)
    setMessage(t.moved(dragged.caption, index + 1, albumPhotos.length))
  }

  function shift(photo, index, step, button) {
    // The neighbour in the list the grid shows, not in the whole list: inside an album the next picture
    // of the whole list often belongs to another album.
    const neighbor = albumPhotos[index + step]
    if (!neighbor) return
    // flushSync draws the new order right away, so the button can get the focus back if React moved it.
    flushSync(() => {
      move(photo.id, neighbor.id)
      setShownCount((count) => Math.max(count, index + step + 1))
    })
    button.focus()
    setMessage(t.moved(photo.caption, index + step + 1, albumPhotos.length))
  }

  return (
    <div className="ig">
      <Carousel images={all} paused={open !== null} onOpen={(id) => setOpen({ id, fromCarousel: true })} t={t} />

      <AlbumFilter album={album} photos={all} t={t} onChange={changeAlbum} />

      <DropZone onFiles={addFiles} t={t} />
      <p className="ig-message" role="status" aria-live="polite">
        {message}
      </p>

      {albumPhotos.length === 0 ? (
        <p className="ig-empty">{album === 'uploads' ? t.noUploads : t.emptyAlbum}</p>
      ) : (
        <ul className="ig-grid">
          {shownPhotos.map((photo, index) => (
            <Thumbnail
              key={photo.id}
              photo={photo}
              t={t}
              canEarlier={index > 0}
              canLater={index < albumPhotos.length - 1}
              onOpen={() => setOpen({ id: photo.id, fromCarousel: false })}
              onDropOn={(draggedId) => dropOn(draggedId, index)}
              onShift={(step, button) => shift(photo, index, step, button)}
              onRemove={
                photo.upload
                  ? () => {
                      remove(photo.id)
                      setMessage(t.removed(photo.caption))
                    }
                  : null
              }
            />
          ))}
        </ul>
      )}
      {hasMore && (
        <p ref={sentinelRef} className="ig-more">
          {t.more}
        </p>
      )}
      <p className="ig-keys">{t.keys}</p>

      <Lightbox
        images={viewList}
        index={openIndex === -1 ? null : openIndex}
        onClose={() => setOpen(null)}
        onIndex={(i) => setOpen({ id: viewList[i].id, fromCarousel: open.fromCarousel })}
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
