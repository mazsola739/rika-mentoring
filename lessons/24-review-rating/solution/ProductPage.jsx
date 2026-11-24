import { useRef, useState } from 'react'
import { SORTERS, helpfulCount, summarize, tx } from './stats.js'
import { Stars } from './StarRating.jsx'
import ProductVisual from './ProductVisual.jsx'
import RatingSummary from './RatingSummary.jsx'
import ReviewForm from './ReviewForm.jsx'
import { useFocusOnMount } from './useHashRoute.js'

function ReviewItem({ review, user, pending, onHelpful, onModerate, fmt, lang, t }) {
  const helpful = helpfulCount(review)
  const voted = user !== null && (review.helpfulBy ?? []).includes(user.id)
  // Voting needs an account, and nobody can vote for their own review.
  const canVote = user !== null && review.userId !== user.id
  const isModerator = user !== null && user.role === 'moderator'

  return (
    <li className={review.hidden ? 'rr-review rr-review--hidden' : 'rr-review'}>
      {review.hidden && <p className="rr-review__badge">{t.hiddenBadge}</p>}
      <div className="rr-review__head">
        <Stars value={review.rating} size={15} label={t.starsLabel(review.rating)} />
        <h5>{tx(review.title, lang)}</h5>
      </div>
      <p className="rr-review__meta">
        {review.author} · <time dateTime={review.createdAt}>{fmt.date(review.createdAt)}</time>
      </p>
      <p className="rr-review__body">{tx(review.body, lang)}</p>
      <div className="rr-review__actions">
        <button
          type="button"
          className="rr-pill"
          aria-pressed={voted}
          aria-label={t.helpfulLabel(helpful)}
          aria-busy={pending}
          disabled={!canVote || pending}
          onClick={() => onHelpful(review)}
        >
          <span aria-hidden="true">👍</span> {t.helpful(helpful)}
        </button>
        {isModerator && (
          <button
            type="button"
            className="rr-pill rr-pill--moderate"
            aria-busy={pending}
            disabled={pending}
            onClick={() => onModerate(review)}
          >
            {review.hidden ? t.showAgain : t.hide}
          </button>
        )}
      </div>
    </li>
  )
}

export default function ProductPage({ product, data, user, fmt, lang, t, focusOnMount }) {
  const [sort, setSort] = useState('newest')
  const [filter, setFilter] = useState(0) // 0 = every star count
  const [changeError, setChangeError] = useState('')
  const [justSent, setJustSent] = useState(false)
  const headingRef = useRef(null)
  useFocusOnMount(headingRef, focusOnMount)

  const name = tx(product.name, lang)
  const isModerator = user !== null && user.role === 'moderator'
  const reviews = data.reviews.filter((r) => r.productId === product.id)
  // Hidden reviews count for nobody's summary, and only the moderator sees them.
  const publicReviews = reviews.filter((r) => !r.hidden)
  const shown = isModerator ? reviews : publicReviews
  const stats = summarize(publicReviews)
  // .filter() returns a new array, so sorting it never mutates the state.
  const visible = shown.filter((r) => !filter || r.rating === filter).sort(SORTERS[sort])
  // One review per account and product. Hidden ones count too: a hidden review cannot be replaced by a new one.
  const myReview = user === null ? undefined : reviews.find((r) => r.userId === user.id)

  const vote = async (review) => {
    setChangeError('')
    try {
      await data.toggleHelpful(review, user.id)
    } catch {
      setChangeError(t.changeFailed)
    }
  }

  const moderate = async (review) => {
    setChangeError('')
    try {
      await data.setHidden(review, !review.hidden)
    } catch {
      setChangeError(t.changeFailed)
    }
  }

  const sendReview = async (review) => {
    await data.addReview(review)
    setJustSent(true)
  }

  let formArea
  if (user === null) {
    formArea = <p className="rr-note">{t.loginToReview}</p>
  } else if (myReview) {
    formArea = (
      <p className="rr-note" role="status">
        {justSent && <strong>{t.form.thanks(user.name)} </strong>}
        {t.alreadyRated(myReview.rating)}
        {myReview.hidden && ` ${t.hiddenOwn}`}
      </p>
    )
  } else {
    formArea = <ReviewForm productId={product.id} user={user} onSubmit={sendReview} t={t} />
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

            {shown.length > 0 && (
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
              {shown.length > 0 && t.showing(visible.length, shown.length)}
            </p>
            {changeError && (
              <p className="rr-alert" role="alert">
                {changeError}
              </p>
            )}

            {shown.length === 0 ? (
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
                    user={user}
                    pending={data.pending.includes(review.id)}
                    onHelpful={vote}
                    onModerate={moderate}
                    fmt={fmt}
                    lang={lang}
                    t={t}
                  />
                ))}
              </ul>
            )}
          </section>

          {formArea}
        </>
      )}
    </div>
  )
}
