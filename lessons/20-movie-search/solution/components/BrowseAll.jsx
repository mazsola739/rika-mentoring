import { useEffect, useRef, useState } from 'react'
import { useFetch } from '../useFetch.js'
import { PAGE_SIZE, pageUrl, toShow } from '../tvApi.js'
import ShowCard, { CardSkeletons } from './ShowCard.jsx'
import { ErrorState } from './StateMessage.jsx'

// One page of the catalogue, with its own request. Pages already open keep their data and never ask again.
// The last open page also gets the "Load more" button, but only if it was full (a shorter page is the last one).
function BrowsePage({ page, isLast, onLoadMore, focusFirst, isFavorite, onToggleFavorite, t }) {
  const { status, data, error, retry } = useFetch(pageUrl(page))
  const listRef = useRef(null)
  const moreRef = useRef(null)
  const hasMore = isLast && status === 'success' && data.length === PAGE_SIZE

  // When the "Load more" button had the keyboard focus, it disappears: the focus moves on to the first new card.
  useEffect(() => {
    if (focusFirst && status === 'success') listRef.current?.querySelector('a')?.focus()
  }, [focusFirst, status])

  // Infinite scroll: once the button comes near the screen, the next page loads by itself.
  // The button stays as the way in for keyboards and for browsers without IntersectionObserver.
  useEffect(() => {
    const button = moreRef.current
    if (!hasMore || !button || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore(document.activeElement === button)
      },
      { rootMargin: '300px' },
    )
    observer.observe(button)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore])

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
      {hasMore && (
        <button ref={moreRef} type="button" className="btn ms-more" onClick={() => onLoadMore(true)}>
          {t.loadMore}
        </button>
      )}
    </>
  )
}

// The whole catalogue for an empty search box: page 1 first, then one more page for every "Load more"
// (a click, or the button scrolling into view). The parent only counts the open pages; every page is its own
// component with its own request.
export default function BrowseAll({ isFavorite, onToggleFavorite, t }) {
  const [pageCount, setPageCount] = useState(1)
  const [focusPage, setFocusPage] = useState(null)
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  // pageCount + 1, not an updater: if the button and the observer both fire, it still opens only one page.
  function loadMore(keepFocus) {
    setPageCount(pageCount + 1)
    if (keepFocus) setFocusPage(pageCount + 1)
  }

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
          onLoadMore={loadMore}
          focusFirst={page === focusPage}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          t={t}
        />
      ))}
    </section>
  )
}
