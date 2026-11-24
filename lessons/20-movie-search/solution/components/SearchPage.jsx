import { useMemo, useRef } from 'react'
import { useDebounce } from '../useDebounce.js'
import { useFetch } from '../useFetch.js'
import { replaceRoute, searchHref } from '../useHashRoute.js'
import { searchUrl, toShow } from '../tvApi.js'
import { SUGGESTIONS } from '../text.js'
import BrowseAll from './BrowseAll.jsx'
import ShowCard, { CardSkeletons } from './ShowCard.jsx'
import { EmptyState, ErrorState } from './StateMessage.jsx'

const MIN_LENGTH = 2

// 2017 → 2010: the first year of its decade. toShow gives the year as text ('2017').
function decadeOf(year) {
  return Math.floor(Number(year) / 10) * 10
}

// The two filters live in the address next to the search (#/?q=the&genre=Mystery&decade=2010), so a reload
// or a shared link keeps them. Typing a new search writes an address without them: every search starts fresh.
// `query` and the filters go on to the cards, whose links carry them to the series page and back.
function Results({ shows, query, filters, onFiltersChange, isFavorite, onToggleFavorite, t }) {
  const genres = useMemo(() => [...new Set(shows.flatMap((s) => s.genres))].sort(), [shows])
  const decades = useMemo(
    () => [...new Set(shows.filter((s) => s.year).map((s) => decadeOf(s.year)))].sort((a, b) => b - a),
    [shows],
  )
  // A value that does not fit these results (an old or hand-edited link) is simply ignored.
  const genre = genres.includes(filters.genre) ? filters.genre : null
  const decade = decades.includes(Number(filters.decade)) ? filters.decade : '' // '' = any time; <select> gives text
  const setGenre = (value) => onFiltersChange({ genre: value ?? '', decade })
  const setDecade = (value) => onFiltersChange({ genre: genre ?? '', decade: value })
  // A series without a premiere year has no decade, so it only shows while the decade filter is "Any time".
  const visible = shows.filter(
    (s) => (!genre || s.genres.includes(genre)) && (decade === '' || (s.year && decadeOf(s.year) === Number(decade))),
  )

  return (
    <>
      {(genres.length > 1 || decades.length > 1) && (
        <div className="ms-filters">
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
          {decades.length > 1 && (
            <label className="field ms-decade">
              <span>{t.premiered}</span>
              <select className="input" value={decade} onChange={(e) => setDecade(e.target.value)}>
                <option value="">{t.anyTime}</option>
                {decades.map((d) => (
                  <option key={d} value={d}>
                    {d}–{d + 9}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
      {visible.length === 0 ? (
        <p className="ms-muted">{t.noMatch}</p>
      ) : (
        <ul className="ms-grid">
          {visible.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              query={query}
              filters={{ genre: genre ?? '', decade }}
              isFavorite={isFavorite(show.id)}
              onToggleFavorite={onToggleFavorite}
              t={t}
            />
          ))}
        </ul>
      )}
    </>
  )
}

export default function SearchPage({ query, filters, favorites, isFavorite, onToggleFavorite, t }) {
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

  // A new search is written without filters; a filter change keeps the search.
  const setQuery = (value) => replaceRoute(searchHref(value))
  const setFilters = (next) => replaceRoute(searchHref(query, next))

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
          {/* An empty box shows the whole catalogue to browse, page by page. */}
          {!query.trim() && <BrowseAll isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} t={t} />}
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
        <Results
          shows={shows}
          query={term}
          filters={filters}
          onFiltersChange={setFilters}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          t={t}
        />
      ) : null}
    </div>
  )
}
