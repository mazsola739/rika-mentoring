import { useRef, useState } from 'react'
import { SORTERS, summarize, tx } from './stats.js'
import { Stars } from './StarRating.jsx'
import ProductVisual from './ProductVisual.jsx'
import RatingSummary from './RatingSummary.jsx'
import ReviewForm from './ReviewForm.jsx'
import { useFocusOnMount } from './useHashRoute.js'

function ReviewItem({ review, voted, pending, onHelpful, fmt, lang, t }) {
  const helpful = review.helpful ?? 0
  return (
    <li className="rr-review">
      <div className="rr-review__head">
        <Stars value={review.rating} size={15} label={t.starsLabel(review.rating)} />
        <h5>{tx(review.title, lang)}</h5>
      </div>
      <p className="rr-review__meta">
        {review.author} · <time dateTime={review.createdAt}>{fmt.date(review.createdAt)}</time>
      </p>
      <p className="rr-review__body">{tx(review.body, lang)}</p>
      <button
        type="button"
        className="rr-helpful"
        aria-pressed={voted}
        aria-label={t.helpfulLabel(helpful)}
        disabled={pending}
        onClick={() => onHelpful(review)}
      >
        <span aria-hidden="true">👍</span> {t.helpful(helpful)}
      </button>
    </li>
  )
}

export default function ProductPage({ product, data, fmt, lang, t, focusOnMount }) {
  const [sort, setSort] = useState('newest')
  const [filter, setFilter] = useState(0) // 0 = every star count
  const [voteError, setVoteError] = useState('')
  const headingRef = useRef(null)
  useFocusOnMount(headingRef, focusOnMount)

  const name = tx(product.name, lang)
  const reviews = data.reviews.filter((r) => r.productId === product.id)
  const stats = summarize(reviews)
  // .filter() returns a new array, so sorting it never mutates the state.
  const visible = reviews.filter((r) => !filter || r.rating === filter).sort(SORTERS[sort])

  const vote = async (review) => {
    setVoteError('')
    try {
      await data.toggleHelpful(review)
    } catch {
      setVoteError(t.voteFailed)
    }
  }

  return (
    <div className="rr-page">
      <a className="rr-back" href="#/">
        <span aria-hidden="true">←</span> {t.back}
      </a>

      <article className="rr-product">
        <ProductVisual product={product} label={t.imageAlt(name)} className="rr-product__img" />
        <div className="rr-product__info">
          <h3 ref={headingRef} tabIndex={-1}>
            {name}
          </h3>
          <p className="rr-product__price">{fmt.price(product.price)}</p>
          {data.status === 'ready' && stats.count > 0 && (
            <p className="rr-product__rating">
              <Stars value={stats.average} size={18} label={t.starsLabel(fmt.rating(stats.average))} />
              <span>
                {fmt.rating(stats.average)} · {t.reviewsCount(stats.count)}
              </span>
            </p>
          )}
          <p>{tx(product.description, lang)}</p>
        </div>
      </article>

      {data.status === 'ready' && (
        <>
          <section className="rr-reviews" aria-labelledby="rr-reviews-title">
            <h4 id="rr-reviews-title">{t.reviewsTitle}</h4>
            <RatingSummary stats={stats} filter={filter} onFilter={setFilter} fmt={fmt} t={t} />

            {stats.count > 0 && (
              <div className="rr-toolbar">
                <label className="rr-select">
                  <span>{t.sortLabel}</span>
                  <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
                    {Object.keys(SORTERS).map((key) => (
                      <option key={key} value={key}>
                        {t.sorts[key]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rr-chips" role="group" aria-label={t.filterLabel}>
                  {[0, 5, 4, 3, 2, 1].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="chip"
                      aria-pressed={filter === n}
                      aria-label={n ? t.starChipLabel(n) : undefined}
                      onClick={() => setFilter(n)}
                    >
                      {n ? t.starChip(n) : t.all}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="rr-count" aria-live="polite">
              {stats.count > 0 && t.showing(visible.length, stats.count)}
            </p>
            {voteError && (
              <p className="rr-alert" role="alert">
                {voteError}
              </p>
            )}

            {stats.count === 0 ? (
              <p className="rr-empty">{t.beFirst}</p>
            ) : visible.length === 0 ? (
              <div className="rr-empty">
                <p>{t.noMatch}</p>
                <button type="button" className="btn btn--ghost" onClick={() => setFilter(0)}>
                  {t.clearFilter}
                </button>
              </div>
            ) : (
              <ul className="rr-list">
                {visible.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    voted={data.votes.includes(review.id)}
                    pending={data.pending.includes(review.id)}
                    onHelpful={vote}
                    fmt={fmt}
                    lang={lang}
                    t={t}
                  />
                ))}
              </ul>
            )}
          </section>

          <ReviewForm productId={product.id} onSubmit={data.addReview} t={t} />
        </>
      )}
    </div>
  )
}
