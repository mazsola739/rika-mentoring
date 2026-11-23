import { useEffect, useRef, useState } from 'react'
import { errorKind, useFetch } from '../useFetch.js'
import { asList, characterUrl, episodesUrl } from '../api.js'
import { keyOf } from '../text.js'
import { StatusBadge } from './CharacterCard.jsx'

const FIRST_EPISODES = 8

function DetailSkeleton() {
  return (
    <div className="fw-detail" aria-hidden="true">
      <span className="fw-skel fw-skel--image fw-detail__img" />
      <div className="fw-detail__info">
        <span className="fw-skel fw-skel--line fw-skel--short" />
        <span className="fw-skel fw-skel--title" />
        <span className="fw-skel fw-skel--line" />
        <span className="fw-skel fw-skel--line" />
      </div>
    </div>
  )
}

// Second request, started only once we know the character: all of its episodes in one call.
function EpisodeList({ episodeUrls, t }) {
  const { status, data, error, retry } = useFetch(episodesUrl(episodeUrls))
  const [showAll, setShowAll] = useState(false)
  const episodes = asList(data)
  const visible = showAll ? episodes : episodes.slice(0, FIRST_EPISODES)

  return (
    <section className="fw-episodes" aria-labelledby="fw-episodes-title">
      <h4 id="fw-episodes-title" className="fw-section-title">
        {t.episodeList}
      </h4>
      {status === 'loading' && (
        <ul className="fw-episodes__list" aria-hidden="true">
          {Array.from({ length: Math.min(episodeUrls.length, 4) }, (_, i) => (
            <li key={i}>
              <span className="fw-skel fw-skel--line" />
            </li>
          ))}
        </ul>
      )}
      {status === 'error' && (
        <div className="fw-state fw-state--error" role="alert">
          <p className="fw-state__title">
            {t.errors[errorKind(error)]} {t.episodesError}
          </p>
          <button type="button" className="btn btn--ghost" onClick={retry}>
            {t.retry}
          </button>
        </div>
      )}
      {status === 'success' && (
        <>
          <ol className="fw-episodes__list">
            {visible.map((episode) => (
              <li key={episode.id}>
                <code>{episode.episode}</code>
                <span className="fw-episodes__name" lang="en">
                  {episode.name}
                </span>
                <small>{episode.air_date}</small>
              </li>
            ))}
          </ol>
          {episodes.length > FIRST_EPISODES && (
            <button type="button" className="fw-link" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}>
              {showAll ? t.showLess : t.showAll(episodes.length)}
            </button>
          )}
        </>
      )}
    </section>
  )
}

// The page for #/character/:id. The id comes from the URL, so a reload or a shared link opens the same character.
export default function CharacterDetail({ id, backHref, t }) {
  const { status, data, error, retry } = useFetch(characterUrl(id))
  const headingRef = useRef(null)

  // Move focus to the new page's title, so keyboard and screen reader users start reading there.
  useEffect(() => {
    if (data) headingRef.current?.focus({ preventScroll: true })
  }, [data])

  const facts = data
    ? [
        [t.facts.species, data.species],
        [t.facts.type, data.type],
        [t.facts.gender, t.gender[keyOf(data.gender)] ?? data.gender],
        [t.facts.origin, data.origin?.name],
        [t.facts.location, data.location?.name],
      ].filter(([, value]) => value && value !== 'unknown')
    : []

  return (
    <div className="fw-page">
      <div className="fw-page__nav">
        <a className="fw-back" href={backHref}>
          <span aria-hidden="true">←</span> {t.back}
        </a>
        <span className="fw-neighbours">
          {id > 1 && (
            <a href={`#/character/${id - 1}`} aria-label={`#${id - 1}`}>
              ‹ #{id - 1}
            </a>
          )}
          <a href={`#/character/${id + 1}`} aria-label={`#${id + 1}`}>
            #{id + 1} ›
          </a>
        </span>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {status === 'loading' ? t.detailLoading : ''}
      </p>

      {status === 'loading' && <DetailSkeleton />}

      {status === 'error' &&
        (error?.status === 404 ? (
          <div className="fw-state">
            <p className="fw-state__title">{t.notFound}</p>
            <a className="btn btn--ghost" href={backHref}>
              {t.back}
            </a>
          </div>
        ) : (
          <div className="fw-state fw-state--error" role="alert">
            <p className="fw-state__title">{t.errors[errorKind(error)]}</p>
            <button type="button" className="btn" onClick={retry}>
              {t.retry}
            </button>
          </div>
        ))}

      {status === 'success' && (
        <>
          <article className="fw-detail">
            <img className="fw-detail__img" src={data.image} alt={data.name} width="300" height="300" />
            <div className="fw-detail__info">
              <p className="fw-detail__number">#{data.id}</p>
              <h3 ref={headingRef} tabIndex={-1} className="fw-detail__name">
                {data.name}
              </h3>
              <StatusBadge value={data.status} t={t} />
              <p className="fw-detail__lead">{t.episodeCount(data.episode.length)}</p>
              <dl className="fw-facts">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
          {t.dataNote && <p className="fw-note">{t.dataNote}</p>}
          <EpisodeList key={data.id} episodeUrls={data.episode} t={t} />
        </>
      )}
    </div>
  )
}
