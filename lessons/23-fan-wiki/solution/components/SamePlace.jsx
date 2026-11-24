import { errorKind, useFetch } from '../useFetch.js'
import { asList, characterUrl, idFromUrl, locationUrl } from '../api.js'
import CharacterCard, { CardSkeletons } from './CharacterCard.jsx'

// Who else was last seen at the same place? Two requests, one after the other (a dependent request):
// 1. the place, whose residents are character URLs, 2. the other residents, all in one call (/character/3,4,6).
export default function SamePlace({ character, lang, t }) {
  const place = useFetch(locationUrl(idFromUrl(character.location.url), lang))

  // Until the place has arrived there is nothing to ask for: the URL stays null and the hook stays 'idle'.
  // (A hook cannot be called inside an `if`, but its argument can say "not yet".)
  const otherIds =
    place.status === 'success'
      ? (place.data.residents ?? []).map(idFromUrl).filter((id) => Number(id) !== character.id)
      : []
  const others = useFetch(otherIds.length > 0 ? characterUrl(otherIds.join(','), lang) : null)

  const loading = place.status === 'loading' || others.status === 'loading'
  const failed = place.status === 'error' ? place : others.status === 'error' ? others : null

  return (
    <section className="fw-same" aria-labelledby="fw-same-title">
      <h4 id="fw-same-title" className="fw-section-title">
        {t.samePlace(character.location.name)}
      </h4>

      {loading && <CardSkeletons count={Math.min(Math.max(otherIds.length, 2), 4)} small />}

      {failed && (
        <div className="fw-state fw-state--error" role="alert">
          <p className="fw-state__title">
            {t.errors[errorKind(failed.error)]} {t.samePlaceError}
          </p>
          <button type="button" className="btn btn--ghost" onClick={failed.retry}>
            {t.retry}
          </button>
        </div>
      )}

      {place.status === 'success' && otherIds.length === 0 && <p className="fw-same__alone">{t.alone}</p>}

      {others.status === 'success' && (
        <ul className="fw-grid fw-grid--small">
          {asList(others.data).map((other) => (
            <CharacterCard key={other.id} character={other} t={t} showSeen={false} />
          ))}
        </ul>
      )}
    </section>
  )
}
