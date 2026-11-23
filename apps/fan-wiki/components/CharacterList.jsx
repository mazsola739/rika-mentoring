import { useEffect, useRef } from 'react'
import { useDebounce } from '../useDebounce.js'
import { errorKind, useFetch } from '../useFetch.js'
import { listHref, replaceRoute } from '../useHashRoute.js'
import { GENDERS, STATUSES, charactersUrl, isNoMatch } from '../api.js'
import CharacterCard, { CardSkeletons } from './CharacterCard.jsx'
import Filters from './Filters.jsx'

// Reads the filters from the URL and only accepts values the API knows.
export function filtersFrom(params) {
  const status = params.get('status') ?? ''
  const gender = params.get('gender') ?? ''
  return {
    name: params.get('name') ?? '',
    status: STATUSES.includes(status) ? status : '',
    gender: GENDERS.includes(gender) ? gender : '',
    page: Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1),
  }
}

function Pagination({ page, pages, onPage, t }) {
  if (pages <= 1) return null
  return (
    <nav className="fw-pages" aria-label={t.page(page, pages)}>
      <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <span aria-hidden="true">←</span> {t.prev}
      </button>
      <span className="fw-pages__info">{t.page(page, pages)}</span>
      <button type="button" className="btn btn--ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        {t.next} <span aria-hidden="true">→</span>
      </button>
    </nav>
  )
}

export default function CharacterList({ params, t }) {
  const filters = filtersFrom(params)
  const listRef = useRef(null)

  // The name waits until typing pauses; status, gender and page apply at once.
  const name = useDebounce(filters.name.trim(), 400)
  const { status, data, error, retry } = useFetch(charactersUrl({ ...filters, name }))

  // Any filter change starts again from page 1; a page change keeps the filters.
  const update = (patch) => replaceRoute(listHref({ ...filters, page: 1, ...patch }))
  const hasFilters = Boolean(filters.name || filters.status || filters.gender)

  // After paging, bring the top of the grid back into view.
  useEffect(() => {
    const top = listRef.current?.getBoundingClientRect().top ?? 0
    if (top < 0) listRef.current.scrollIntoView({ block: 'start' })
  }, [filters.page])

  const noMatch = status === 'error' && isNoMatch(error)
  let message = ''
  if (status === 'loading') message = t.loading
  else if (status === 'success') message = t.count(data.info?.count ?? data.results?.length ?? 0)
  else if (noMatch) message = t.none

  return (
    <div className="fw-list" ref={listRef}>
      <p className="fw-intro">{t.intro}</p>
      <Filters filters={filters} onChange={update} t={t} />

      <div className="fw-bar">
        <p className="fw-bar__count" aria-live="polite">
          {message}
        </p>
        {hasFilters && (
          <button type="button" className="fw-link" onClick={() => replaceRoute('#/')}>
            {t.resetFilters}
          </button>
        )}
      </div>

      {status === 'loading' && <CardSkeletons />}

      {noMatch && (
        <div className="fw-state">
          <p className="fw-state__title">{t.none}</p>
          <p>{t.noneTip}</p>
          <button type="button" className="btn btn--ghost" onClick={() => replaceRoute('#/')}>
            {t.resetFilters}
          </button>
        </div>
      )}

      {status === 'error' && !noMatch && (
        <div className="fw-state fw-state--error" role="alert">
          <p className="fw-state__title">{t.errors[errorKind(error)]}</p>
          <button type="button" className="btn" onClick={retry}>
            {t.retry}
          </button>
        </div>
      )}

      {status === 'success' && (
        <>
          <ul className="fw-grid">
            {(data.results ?? []).map((character) => (
              <CharacterCard key={character.id} character={character} t={t} />
            ))}
          </ul>
          <Pagination
            page={filters.page}
            pages={data.info?.pages ?? 1}
            onPage={(page) => update({ ...filters, page })}
            t={t}
          />
        </>
      )}
    </div>
  )
}
