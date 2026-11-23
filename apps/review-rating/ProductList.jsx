import { useRef, useState } from 'react'
import { PRODUCTS } from './products.js'
import ProductVisual from './ProductVisual.jsx'
import { summarize, tx } from './stats.js'
import { Stars } from './StarRating.jsx'
import { useFocusOnMount } from './useHashRoute.js'

const PRODUCT_SORTS = {
  rating: (a, b) => b.stats.average - a.stats.average || b.stats.count - a.stats.count,
  reviews: (a, b) => b.stats.count - a.stats.count || b.stats.average - a.stats.average,
  price: (a, b) => a.price - b.price,
}

const MIN_RATINGS = [0, 4, 3]

export default function ProductList({ data, fmt, lang, t, focusOnMount }) {
  const [sort, setSort] = useState('rating')
  const [minRating, setMinRating] = useState(0)
  const headingRef = useRef(null)
  useFocusOnMount(headingRef, focusOnMount)

  const loading = data.status === 'loading'

  // Derived list: stats per product, then filter, then sort. Recomputed on every render, no extra state.
  const items = PRODUCTS.map((p) => ({ ...p, stats: summarize(data.reviews.filter((r) => r.productId === p.id)) }))
    .filter((p) => p.stats.average >= minRating)
    .sort(PRODUCT_SORTS[sort])

  return (
    <div className="rr-page">
      <header className="rr-intro">
        <h3 ref={headingRef} tabIndex={-1}>
          {t.shopTitle}
        </h3>
        <p>{t.shopIntro}</p>
      </header>

      <div className="rr-toolbar">
        <label className="rr-select">
          <span>{t.sortLabel}</span>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.keys(PRODUCT_SORTS).map((key) => (
              <option key={key} value={key}>
                {t.productSorts[key]}
              </option>
            ))}
          </select>
        </label>
        <div className="rr-chips" role="group" aria-label={t.minRating}>
          {MIN_RATINGS.map((n) => (
            <button
              key={n}
              type="button"
              className="chip"
              aria-pressed={minRating === n}
              aria-label={n ? t.andUpLabel(n) : undefined}
              onClick={() => setMinRating(n)}
            >
              {n ? t.andUp(n) : t.any}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rr-empty">{t.noProducts}</p>
      ) : (
        <ul className="rr-grid" aria-busy={loading}>
          {items.map((p) => {
            const name = tx(p.name, lang)
            const { average, count } = p.stats
            return (
              <li key={p.id}>
                <a className="rr-card" href={`#/product/${p.id}`}>
                  <ProductVisual product={p} className="rr-card__img" />
                  <span className="rr-card__body">
                    <span className="rr-card__name">{name}</span>
                    {loading && <span className="rr-skeleton" aria-hidden="true" />}
                    {data.status === 'ready' && (
                      <span className="rr-card__rating">
                        {count > 0 && <Stars value={average} size={15} label={t.starsLabel(fmt.rating(average))} />}
                        <span>{count ? `${fmt.rating(average)} · ${t.reviewsCount(count)}` : t.noReviewsYet}</span>
                      </span>
                    )}
                    <span className="rr-card__price">{fmt.price(p.price)}</span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
