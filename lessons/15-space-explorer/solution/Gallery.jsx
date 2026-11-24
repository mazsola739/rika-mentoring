import { useEffect, useRef, useState } from 'react'
import { thumbnailOf } from './api.js'
import { formatDay } from './dates.js'
import { useGallery } from './useGallery.js'
import ApodError from './ApodError.jsx'
import PictureDialog from './PictureDialog.jsx'

const MODES = ['archive', 'random']
const FILTERS = ['all', 'image', 'video']

// Many days in a grid, newest first. Scrolling down brings the next page (infinite scroll),
// the filter only hides cards that are already loaded, and a click opens a day large.
export default function Gallery({ today, lang, locale, onOpenDay, t }) {
  const { mode, changeMode, pictures, status, error, hasMore, loadMore, retry } = useGallery(today, lang)
  const [filter, setFilter] = useState('all') // 'all', 'image' or 'video'
  const [openPicture, setOpenPicture] = useState(null) // the day open in the large view, or null
  // The sentinel: the line of text under the grid. When it comes near the screen, the next page can come.
  const sentinelRef = useRef(null)

  // A derived value: the cards that pass the filter. Worked out on every drawing, never stored.
  const visible = filter === 'all' ? pictures : pictures.filter((picture) => picture.media_type === filter)

  useEffect(() => {
    // While a page is on its way, after an error, or when there are no more pages, nobody watches.
    if (status !== 'ready' || !hasMore || !sentinelRef.current) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '300px' },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [status, hasMore, loadMore])

  return (
    <section className="sx-gal" aria-label={t.gallery}>
      <div className="sx-gal__toolbar">
        <div className="sx-gal__chips" role="group" aria-label={t.sourceLabel}>
          {MODES.map((value) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={mode === value}
              onClick={() => changeMode(value)}
            >
              {t.modes[value]}
            </button>
          ))}
        </div>
        <div className="sx-gal__chips" role="group" aria-label={t.filterLabel}>
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {t.filters[value]}
            </button>
          ))}
        </div>
      </div>

      <ul className="sx-gal__grid">
        {visible.map((picture) => {
          const thumb = thumbnailOf(picture)
          return (
            <li key={picture.date}>
              <button type="button" className="sx-gal__item" onClick={() => setOpenPicture(picture)}>
                {thumb ? (
                  <img src={thumb} alt="" loading="lazy" />
                ) : (
                  <span className="sx-gal__fallback" aria-hidden="true" />
                )}
                {picture.media_type === 'video' && <span className="sx-gal__badge">{t.video}</span>}
                <span className="sx-gal__date">
                  {formatDay(picture.date, locale, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span className="sx-gal__title">{picture.title}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="visually-hidden" aria-live="polite">
        {status === 'loading' ? t.galleryLoading : t.galleryCount(visible.length)}
      </p>

      {status === 'error' && <ApodError error={error} onRetry={retry} t={t} />}
      {status !== 'error' && hasMore && (
        <p ref={sentinelRef} className="sx-gal__more" data-loading={status === 'loading'}>
          {status === 'loading' ? t.galleryLoading : t.galleryMore}
        </p>
      )}
      {!hasMore && <p className="sx-gal__more">{t.galleryEnd}</p>}

      <PictureDialog
        picture={openPicture}
        locale={locale}
        onClose={() => setOpenPicture(null)}
        onOpenDay={onOpenDay}
        t={t}
      />
    </section>
  )
}
