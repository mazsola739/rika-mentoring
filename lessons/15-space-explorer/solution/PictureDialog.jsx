import { useEffect, useRef } from 'react'
import { formatDay } from './dates.js'
import ApodMedia from './ApodMedia.jsx'

// One gallery day, large, in a modal <dialog>. picture is null while nothing is open.
// Esc, the Close button and a click on the dark backdrop close it; the browser then puts focus back on the card.
export default function PictureDialog({ picture, locale, onClose, onOpenDay, t }) {
  const dialogRef = useRef(null)
  const isOpen = picture !== null

  // The browser opens and closes a <dialog>: after drawing, we tell it which one we want.
  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  // Only this dialog's own events count: the full-size view inside ApodMedia is a <dialog> too,
  // and React passes its close event and its clicks up to us as well.
  function handleClose(event) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="sx-big"
      aria-label={isOpen ? picture.title : undefined}
      onClose={handleClose}
      onClick={handleClose}
    >
      {isOpen && (
        // The inner box scrolls, so a click on its scrollbar never counts as a click on the backdrop.
        <div className="sx-big__inner">
          {/* The key gives every day a fresh ApodMedia: a paused video does not stay paused for the next one. */}
          <ApodMedia key={picture.date} apod={picture} t={t} />
          <div className="sx-big__body">
            <p className="sx-card__date">
              {formatDay(picture.date, locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h3 className="sx-card__title">{picture.title}</h3>
            {picture.copyright && (
              <p className="sx-card__credit">
                {t.credit}: {picture.copyright.replace(/\s+/g, ' ').trim()}
              </p>
            )}
            <p className="sx-card__text">{picture.explanation?.trim()}</p>
            <div className="sx-big__actions">
              <button type="button" className="btn" onClick={() => onOpenDay(picture)}>
                {t.openAsDay}
              </button>
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
