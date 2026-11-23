import { useState } from 'react'
import { SHELVES } from '../useShelves.js'
import { bookUrl } from '../bookApi.js'
import BookCover from './BookCover.jsx'
import BookDetails from './BookDetails.jsx'

function Rating({ value, onChange, t }) {
  return (
    <span className="bl-rating" role="group" aria-label={t.rating}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={t.rate(n)}
          aria-pressed={value === n}
          data-on={n <= value}
          onClick={() => onChange(value === n ? 0 : n)}
        >
          <span aria-hidden="true">★</span>
        </button>
      ))}
    </span>
  )
}

function ShelfBook({ book, onMove, onRemove, onRate, t }) {
  const [open, setOpen] = useState(false)
  // Books typed in by hand have no page in the API, so they have no details either.
  const hasDetails = Boolean(bookUrl(book.id, 'en'))
  const detailsId = `bl-details-${book.id}`

  return (
    <li className="bl-book">
      <BookCover coverId={book.coverId} title={book.title} size="S" className="bl-book__cover" />
      <div className="bl-book__body">
        <strong className="bl-book__title">{book.title}</strong>
        <span className="bl-book__meta">
          {[book.authors?.join(', ') || t.unknownAuthor, book.year].filter(Boolean).join(' · ')}
        </span>
        {book.shelf === 'read' && <Rating value={book.rating ?? 0} onChange={(r) => onRate(book, r)} t={t} />}
        <div className="bl-book__actions">
          {hasDetails && (
            <button
              type="button"
              className="bl-move bl-move--details"
              aria-expanded={open}
              aria-controls={detailsId}
              aria-label={t.detailsLabel(book.title)}
              onClick={() => setOpen((value) => !value)}
            >
              <span aria-hidden="true">{open ? '▴' : '▾'}</span> {t.details}
            </button>
          )}
          {SHELVES.filter((s) => s !== book.shelf).map((shelf) => (
            <button key={shelf} type="button" className="bl-move" onClick={() => onMove(book, shelf)}>
              <span aria-hidden="true">→</span> {t.moveTo(t.shelfNames[shelf])}
            </button>
          ))}
          <button
            type="button"
            className="bl-move bl-move--remove"
            aria-label={t.removeLabel(book.title)}
            onClick={() => onRemove(book)}
          >
            {t.remove}
          </button>
        </div>
      </div>
      {/* The details are fetched only while they are open (BookDetails mounts and unmounts). */}
      {hasDetails && (
        <div id={detailsId} className="bl-book__details" hidden={!open}>
          {open && <BookDetails id={book.id} t={t} />}
        </div>
      )}
    </li>
  )
}

export default function ShelfView({ books, active, onSelect, onMove, onRemove, onRate, t }) {
  const list = books.filter((b) => b.shelf === active)

  return (
    <section className="bl-shelves" aria-labelledby="bl-shelves-title">
      <div className="bl-shelves__head">
        <h3 id="bl-shelves-title" className="bl-title">
          {t.myShelves}
        </h3>
        <span className="bl-muted">{t.total(books.length)}</span>
      </div>

      <div className="bl-tabs" role="group" aria-label={t.shelvesLabel}>
        {SHELVES.map((shelf) => (
          <button key={shelf} type="button" className="chip" aria-pressed={shelf === active} onClick={() => onSelect(shelf)}>
            {t.shelfNames[shelf]}
            <span className="bl-tabs__count">{books.filter((b) => b.shelf === shelf).length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="bl-state">{t.emptyShelf}</p>
      ) : (
        <ul className="bl-shelf">
          {list.map((book) => (
            <ShelfBook key={book.id} book={book} onMove={onMove} onRemove={onRemove} onRate={onRate} t={t} />
          ))}
        </ul>
      )}
    </section>
  )
}
