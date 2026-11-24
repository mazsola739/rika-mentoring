import { useMemo, useRef, useState } from 'react'
import { errorKind, useFetch } from '../useFetch.js'
import { PAGE_SIZE, searchUrl, toBook } from '../bookApi.js'
import { SHELVES } from '../useShelves.js'
import BookCover from './BookCover.jsx'

function ResultCard({ book, shelf, target, onAdd, onShow, t }) {
  return (
    <li className="bl-result">
      <BookCover coverId={book.coverId} title={book.title} />
      <span className="bl-result__body">
        <strong>{book.title}</strong>
        <span>{book.authors.join(', ') || t.unknownAuthor}</span>
        {book.year && <span className="bl-result__year">{book.year}</span>}
      </span>
      {shelf ? (
        <button type="button" className="bl-result__on" onClick={() => onShow(shelf)}>
          <span aria-hidden="true">✓</span> {t.onShelf(t.shelfNames[shelf])}
        </button>
      ) : (
        <button type="button" className="btn bl-result__add" onClick={() => onAdd(book, target)}>
          <span aria-hidden="true">+</span> {t.add(t.shelfNames[target])}
        </button>
      )}
    </li>
  )
}

// The search runs on submit (not on every keystroke): like most free APIs, ours limits how many
// requests a client may send in a short time (see mocks/handlers.js).
export default function SearchPanel({ books, onAdd, onShow, t }) {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [target, setTarget] = useState('want')
  const [hint, setHint] = useState(false)
  const statusRef = useRef(null)
  // The page is part of the URL, so a new page is simply a new request.
  const { status, data, error, retry } = useFetch(query ? searchUrl(query, page) : null, { timeout: 15000 })

  const results = useMemo(() => (Array.isArray(data?.docs) ? data.docs.map(toBook) : []), [data])
  const total = data?.numFound ?? results.length
  const first = data?.start ?? 0
  const pages = Math.max(1, Math.ceil(total / (data?.limit ?? PAGE_SIZE)))
  const shelfOf = (id) => books.find((b) => b.id === id)?.shelf

  const submit = (event) => {
    event.preventDefault()
    const q = text.trim()
    setHint(q.length < 2)
    if (q.length < 2) return
    // The same search again: repeat the request (e.g. after an error). A new search starts on page 1.
    if (q === query && page === 1) {
      retry()
    } else {
      setQuery(q)
      setPage(1)
    }
  }

  const goTo = (next) => {
    setPage(next)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    statusRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' })
  }

  let message = ''
  if (status === 'loading') message = t.loading
  else if (status === 'success' && results.length) message = t.found(first + 1, first + results.length, total)

  return (
    <section className="bl-search" aria-labelledby="bl-search-title">
      <h3 id="bl-search-title" className="bl-title">
        {t.searchTitle}
      </h3>
      <form className="bl-search__form" role="search" onSubmit={submit}>
        <label className="field">
          <span>{t.searchLabel}</span>
          <input
            className="input"
            type="search"
            value={text}
            placeholder={t.placeholder}
            autoComplete="off"
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button type="submit" className="btn" disabled={status === 'loading'}>
          {t.search}
        </button>
      </form>
      {hint && <p className="bl-muted">{t.tooShort}</p>}

      {query && (
        <div className="bl-target" role="group" aria-label={t.addTarget}>
          <span>{t.addTarget}:</span>
          {SHELVES.map((shelf) => (
            <button key={shelf} type="button" className="chip" aria-pressed={target === shelf} onClick={() => setTarget(shelf)}>
              {t.shelfNames[shelf]}
            </button>
          ))}
        </div>
      )}

      <p className="bl-status" aria-live="polite" ref={statusRef}>
        {message}
      </p>

      {status === 'loading' && (
        <ul className="bl-results" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="bl-result bl-result--skeleton">
              <span className="bl-skel bl-skel--cover" />
              <span className="bl-skel bl-skel--line" />
              <span className="bl-skel bl-skel--line bl-skel--short" />
            </li>
          ))}
        </ul>
      )}

      {status === 'error' && (
        <div className="bl-state bl-state--error" role="alert">
          <p>{t.errors[errorKind(error)]}</p>
          <button type="button" className="btn" onClick={retry}>
            {t.retry}
          </button>
        </div>
      )}

      {status === 'success' && results.length === 0 && (
        <div className="bl-state">
          <p>
            <strong>{t.none(query)}</strong>
          </p>
          <p>{t.noneTip}</p>
        </div>
      )}

      {status === 'success' && results.length > 0 && (
        <ul className="bl-results">
          {results.map((book) => (
            <ResultCard key={book.id} book={book} shelf={shelfOf(book.id)} target={target} onAdd={onAdd} onShow={onShow} t={t} />
          ))}
        </ul>
      )}

      {status === 'success' && pages > 1 && (
        <nav className="bl-pager" aria-label={t.pagesLabel}>
          <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => goTo(page - 1)}>
            <span aria-hidden="true">←</span> {t.prev}
          </button>
          <span className="bl-pager__info">{t.pageOf(page, pages)}</span>
          <button type="button" className="btn btn--ghost" disabled={page >= pages} onClick={() => goTo(page + 1)}>
            {t.next} <span aria-hidden="true">→</span>
          </button>
        </nav>
      )}
    </section>
  )
}
