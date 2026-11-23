import { useEffect, useMemo, useRef } from 'react'
import { useFetch } from '../useFetch.js'
import { showUrl, toShow } from '../tvmaze.js'
import Poster from './Poster.jsx'
import { EmptyState, ErrorState } from './StateMessage.jsx'

function DetailSkeleton() {
  return (
    <div className="ms-detail__card" aria-hidden="true">
      <span className="ms-skel ms-skel--poster ms-detail__poster" />
      <div className="ms-detail__info">
        <span className="ms-skel ms-skel--line ms-skel--short" />
        <span className="ms-skel ms-skel--title" />
        <span className="ms-skel ms-skel--line" />
        <span className="ms-skel ms-skel--line" />
      </div>
    </div>
  )
}

// The page for #/show/:id. The id comes from the URL, so the page also works after a reload or from a shared link.
export default function ShowDetails({ id, backHref, isFavorite, onToggleFavorite, t }) {
  const { status, data, error, retry } = useFetch(showUrl(id))
  const headingRef = useRef(null)

  const show = useMemo(() => (data ? toShow(data) : null), [data])
  const cast = data?._embedded?.cast?.slice(0, 8) ?? []
  const seasons = data?._embedded?.seasons?.length ?? null

  // Move keyboard and screen reader focus to the new page's title once it has loaded.
  useEffect(() => {
    if (show) headingRef.current?.focus({ preventScroll: true })
  }, [show])

  const years = show?.year ? `${show.year}–${show.status === 'Ended' && show.endYear ? show.endYear : ''}` : null
  const facts = show
    ? [
        [t.facts.status, show.status ? (t.status[show.status] ?? show.status) : null],
        [t.facts.channel, show.channel],
        [t.facts.language, show.language],
        [t.facts.runtime, show.runtime ? t.minutes(show.runtime) : null],
        [t.facts.seasons, seasons],
        [t.facts.rating, show.rating != null ? `★ ${show.rating.toFixed(1)} / 10` : null],
      ].filter(([, value]) => value != null && value !== '')
    : []

  return (
    <div className="ms-detail">
      <a className="ms-back" href={backHref}>
        <span aria-hidden="true">←</span> {t.back}
      </a>

      <p className="visually-hidden" aria-live="polite">
        {status === 'loading' ? t.detailLoading : ''}
      </p>

      {status === 'loading' && <DetailSkeleton />}

      {status === 'error' &&
        (error?.status === 404 ? (
          <EmptyState title={t.notFound}>
            <a className="btn" href={backHref}>
              {t.backToSearch}
            </a>
          </EmptyState>
        ) : (
          <ErrorState error={error} onRetry={retry} t={t} />
        ))}

      {show && (
        <>
          <article className="ms-detail__card">
            <Poster src={show.image} label={t.noPoster} seed={show.name} className="ms-detail__poster" />
            <div className="ms-detail__info">
              {years && <p className="ms-detail__years">{years}</p>}
              <h3 ref={headingRef} tabIndex={-1} className="ms-detail__title">
                {show.name}
              </h3>
              {show.genres.length > 0 && (
                <ul className="ms-tags">
                  {show.genres.map((g) => (
                    <li key={g}>{t.genre(g)}</li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="ms-save"
                data-on={isFavorite}
                onClick={() => onToggleFavorite(show)}
              >
                <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span> {isFavorite ? t.unsave : t.save}
              </button>
              <dl className="ms-facts">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>

          <section className="ms-section">
            {t.englishOnly && show.summary && <p className="ms-note">{t.englishOnly}</p>}
            <p className="ms-summary" lang={show.summary ? 'en' : undefined}>
              {show.summary || t.noSummary}
            </p>
            <a className="ms-external" href={show.url} target="_blank" rel="noreferrer">
              {t.openTvmaze} <span aria-hidden="true">↗</span>
            </a>
          </section>

          {cast.length > 0 && (
            <section className="ms-section" aria-labelledby="ms-cast-title">
              <h4 id="ms-cast-title" className="ms-section__title">
                {t.cast}
              </h4>
              <ul className="ms-cast">
                {cast.map(({ person, character }) => (
                  <li key={`${person.id}-${character?.id}`}>
                    {person.image?.medium ? (
                      <img src={person.image.medium} alt="" loading="lazy" />
                    ) : (
                      <span className="ms-cast__initial" aria-hidden="true">
                        {person.name.charAt(0)}
                      </span>
                    )}
                    <span>
                      <strong>{person.name}</strong>
                      {character?.name && <small>{t.as(character.name)}</small>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
