import { useMemo, useRef, useState } from 'react'
import { useDebounce } from '../useDebounce.js'
import { useFetch } from '../useFetch.js'
import { replaceRoute, searchHref } from '../useHashRoute.js'
import { searchUrl, toShow } from '../tvApi.js'
import { SUGGESTIONS } from '../text.js'
import ShowCard, { CardSkeletons } from './ShowCard.jsx'
import { EmptyState, ErrorState } from './StateMessage.jsx'

const MIN_LENGTH = 2

// Keyed by the search term in the parent, so the genre filter starts fresh for every new search.
function Results({ shows, isFavorite, onToggleFavorite, t }) {
  const [genre, setGenre] = useState(null)
  const genres = useMemo(() => [...new Set(shows.flatMap((s) => s.genres))].sort(), [shows])
  const visible = genre ? shows.filter((s) => s.genres.includes(genre)) : shows

  return (
    <>
      {genres.length > 1 && (
        <div className="ms-genres" role="group" aria-label={t.genreFilter}>
          <button type="button" className="chip" aria-pressed={genre === null} onClick={() => setGenre(null)}>
            {t.allGenres}
          </button>
          {genres.map((g) => (
            <button key={g} type="button" className="chip" aria-pressed={genre === g} onClick={() => setGenre(g)}>
              {t.genre(g)}
            </button>
          ))}
        </div>
      )}
      <ul className="ms-grid">
        {visible.map((show) => (
          <ShowCard key={show.id} show={show} isFavorite={isFavorite(show.id)} onToggleFavorite={onToggleFavorite} t={t} />
        ))}
      </ul>
    </>
  )
}

export default function SearchPage({ query, favorites, isFavorite, onToggleFavorite, t }) {
  const inputRef = useRef(null)
  // The input writes straight into the URL; only the request waits until typing pauses.
  const term = useDebounce(query.trim(), 450)
  const url = term.length >= MIN_LENGTH ? searchUrl(term) : null
  const { status, data, error, retry } = useFetch(url)

  const shows = useMemo(() => (Array.isArray(data) ? data.map((hit) => toShow(hit.show)) : []), [data])
  const typing = query.trim() !== term
  const tooShort = query.trim().length < MIN_LENGTH

  let message = ''
  if (!tooShort && typing) message = t.waiting
  else if (status === 'loading') message = t.loading
  else if (status === 'success') message = shows.length ? t.found(shows.length, term) : t.none(term)

  const setQuery = (value) => replaceRoute(searchHref(value))

  return (
    <div className="ms-search">
      <p className="ms-intro">{t.intro}</p>

      <form className="ms-form" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="field">
          <span>{t.searchLabel}</span>
          <input
            ref={inputRef}
            className="input ms-form__input"
            type="search"
            value={query}
            placeholder={t.placeholder}
            autoComplete="off"
            spellCheck="false"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {query && (
          <button
            type="button"
            className="ms-form__clear"
            aria-label={t.clear}
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </form>

      <p className="ms-status" aria-live="polite">
        {message}
      </p>

      {tooShort ? (
        <>
          {query.trim() ? (
            <p className="ms-muted">{t.tooShort}</p>
          ) : (
            <div className="ms-suggest">
              <span>{t.tryThese}</span>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip" onClick={() => setQuery(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <section className="ms-section" aria-labelledby="ms-fav-title">
            <h3 id="ms-fav-title" className="ms-section__title">
              {t.favoritesTitle}
            </h3>
            {favorites.length ? (
              <ul className="ms-grid">
                {favorites.map((show) => (
                  <ShowCard key={show.id} show={show} isFavorite onToggleFavorite={onToggleFavorite} t={t} />
                ))}
              </ul>
            ) : (
              <p className="ms-muted">{t.favoritesEmpty}</p>
            )}
          </section>
        </>
      ) : status === 'loading' ? (
        <CardSkeletons />
      ) : status === 'error' ? (
        <ErrorState error={error} onRetry={retry} t={t} />
      ) : status === 'success' && shows.length === 0 ? (
        <EmptyState title={t.none(term)}>
          <p>{t.noneTip}</p>
        </EmptyState>
      ) : status === 'success' ? (
        <Results key={term} shows={shows} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} t={t} />
      ) : null}
    </div>
  )
}
