import { useEffect, useRef, useState } from 'react'
import { useFetch } from '../useFetch.js'
import { PAGE_SIZE, pageUrl, toShow } from '../tvApi.js'
import ShowCard, { CardSkeletons } from './ShowCard.jsx'
import { ErrorState } from './StateMessage.jsx'

// One page of the catalogue, with its own request. Pages already open keep their data and never ask again.
// The last open page also gets the "Load more" button, but only if it was full (a shorter page is the last one).
function BrowsePage({ page, isLast, onLoadMore, isFavorite, onToggleFavorite, t }) {
  const { status, data, error, retry } = useFetch(pageUrl(page))
  const listRef = useRef(null)

  // The "Load more" button disappears once it is used, so keyboard focus moves on to the first new card.
  useEffect(() => {
    if (page > 1 && status === 'success') listRef.current?.querySelector('a')?.focus()
  }, [page, status])

  if (status === 'error') return <ErrorState error={error} onRetry={retry} t={t} />
  if (status !== 'success') return <CardSkeletons />

  return (
    <>
      <ul className="ms-grid" ref={listRef}>
        {data.map((raw) => {
          const show = toShow(raw)
          return (
            <ShowCard key={show.id} show={show} isFavorite={isFavorite(show.id)} onToggleFavorite={onToggleFavorite} t={t} />
          )
        })}
      </ul>
      {isLast && data.length === PAGE_SIZE && (
        <button type="button" className="btn ms-more" onClick={onLoadMore}>
          {t.loadMore}
        </button>
      )}
    </>
  )
}

// The whole catalogue for an empty search box: page 1 first, then one more page for every "Load more".
// The parent only counts the open pages; every page is its own component with its own request.
export default function BrowseAll({ isFavorite, onToggleFavorite, t }) {
  const [pageCount, setPageCount] = useState(1)
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  return (
    <section className="ms-section" aria-labelledby="ms-all-title">
      <h3 id="ms-all-title" className="ms-section__title">
        {t.allSeries}
      </h3>
      {pages.map((page) => (
        <BrowsePage
          key={page}
          page={page}
          isLast={page === pageCount}
          onLoadMore={() => setPageCount(pageCount + 1)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          t={t}
        />
      ))}
    </section>
  )
}
