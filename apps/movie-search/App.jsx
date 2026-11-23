import { useEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { toFavorite } from './tvApi.js'
import { searchHref, showIdFrom, useHashRoute } from './useHashRoute.js'
import { useLocalStorage } from './useLocalStorage.js'
import SearchPage from './components/SearchPage.jsx'
import ShowDetails from './components/ShowDetails.jsx'
import ShowCard from './components/ShowCard.jsx'
import { EmptyState } from './components/StateMessage.jsx'
import './app.css'

// v2: favorites saved for an earlier catalogue are not reused (other ids, other shows).
const FAVORITES_KEY = 'rika:movie-search:favorites:v2'

function FavoritesPage({ favorites, onToggleFavorite, searchLink, t }) {
  if (favorites.length === 0) {
    return (
      <EmptyState title={t.favoritesEmpty}>
        <a className="btn" href={searchLink}>
          {t.backToSearch}
        </a>
      </EmptyState>
    )
  }
  return (
    <section className="ms-section" aria-labelledby="ms-favorites-title">
      <h3 id="ms-favorites-title" className="ms-section__title">
        {t.favoritesTitle}
      </h3>
      <ul className="ms-grid">
        {favorites.map((show) => (
          <ShowCard key={show.id} show={show} isFavorite onToggleFavorite={onToggleFavorite} t={t} />
        ))}
      </ul>
    </section>
  )
}

function MovieSearch() {
  const t = useText(TEXT)
  const { path, params } = useHashRoute()
  const [stored, setFavorites] = useLocalStorage(FAVORITES_KEY, [])
  const favorites = Array.isArray(stored) ? stored : []
  const rootRef = useRef(null)

  const showId = showIdFrom(path)
  const page = showId ? 'show' : path === '/favorites' ? 'favorites' : 'search'
  const query = params.get('q') ?? ''

  // Remember the last search, so "back to the results" can rebuild it from the URL.
  // (Updating state during render is fine when it only follows a changed value.)
  const [lastQuery, setLastQuery] = useState(query)
  if (page === 'search' && query !== lastQuery) setLastQuery(query)

  // On a page change, bring the top of the app back into view.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const top = rootRef.current?.getBoundingClientRect().top ?? 0
    if (top < 0) rootRef.current.scrollIntoView({ block: 'start' })
  }, [page, showId])

  const isFavorite = (id) => favorites.some((f) => f.id === id)
  const toggleFavorite = (show) =>
    setFavorites(isFavorite(show.id) ? favorites.filter((f) => f.id !== show.id) : [toFavorite(show), ...favorites])

  const searchLink = searchHref(lastQuery)

  return (
    <div className="ms" ref={rootRef}>
      <nav className="ms-tabs" aria-label={t.nav.label}>
        <a href={searchLink} aria-current={page === 'search' ? 'page' : undefined}>
          {t.nav.search}
        </a>
        <a href="#/favorites" aria-current={page === 'favorites' ? 'page' : undefined}>
          {t.nav.favorites}
          {favorites.length > 0 && <span className="ms-tabs__count">{favorites.length}</span>}
        </a>
      </nav>

      {page === 'show' && (
        <ShowDetails
          key={showId}
          id={showId}
          backHref={searchLink}
          isFavorite={isFavorite(showId)}
          onToggleFavorite={toggleFavorite}
          t={t}
        />
      )}
      {page === 'favorites' && (
        <FavoritesPage favorites={favorites} onToggleFavorite={toggleFavorite} searchLink={searchLink} t={t} />
      )}
      {page === 'search' && (
        <SearchPage query={query} favorites={favorites} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} t={t} />
      )}

      <p className="ms-credit">{t.credit}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="movie-search">
      <MovieSearch />
    </AppFrame>
  )
}
