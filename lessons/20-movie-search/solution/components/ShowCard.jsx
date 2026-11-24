import { showHref } from '../useHashRoute.js'
import Poster from './Poster.jsx'

export function FavoriteToggle({ show, isFavorite, onToggle, t }) {
  return (
    <button
      type="button"
      className="ms-star"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? t.removeFavorite(show.name) : t.addFavorite(show.name)}
      title={isFavorite ? t.unsave : t.save}
      onClick={() => onToggle(show)}
    >
      <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
    </button>
  )
}

// One result: the whole card is a link to #/show/:id, the star sits on top as its own button.
// `query` (optional) is the search the card was found with: the link carries it to the series page.
export default function ShowCard({ show, query, isFavorite, onToggleFavorite, t }) {
  return (
    <li className="ms-card">
      <a className="ms-card__link" href={showHref(show.id, query)}>
        <Poster src={show.image} label={t.noPoster} seed={show.name} />
        <span className="ms-card__body">
          <strong className="ms-card__title">{show.name}</strong>
          <span className="ms-card__meta">
            {[show.year, ...(show.genres ?? []).slice(0, 2).map(t.genre)].filter(Boolean).join(' · ')}
          </span>
          {show.rating != null && (
            <span className="ms-card__rating">
              <span aria-hidden="true">★</span> {show.rating.toFixed(1)}
              <span className="visually-hidden"> {t.rating}</span>
            </span>
          )}
        </span>
      </a>
      <FavoriteToggle show={show} isFavorite={isFavorite} onToggle={onToggleFavorite} t={t} />
    </li>
  )
}

export function CardSkeletons({ count = 6 }) {
  return (
    <ul className="ms-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="ms-card ms-card--skeleton">
          <span className="ms-skel ms-skel--poster" />
          <span className="ms-skel ms-skel--line" />
          <span className="ms-skel ms-skel--line ms-skel--short" />
        </li>
      ))}
    </ul>
  )
}
