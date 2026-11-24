import { useEffect, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { CATEGORIES, PRODUCTS, colorName } from '../products.js'
import { useCart } from '../CartContext.jsx'
import { TEXT, useMoney } from '../text.js'
import ProductVisual from './ProductVisual.jsx'

const SORTS = {
  featured: () => 0,
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  name: (a, b, lang) => a.name[lang].localeCompare(b.name[lang], lang),
}

// Everything the search looks at, in the current language.
const searchText = (product, lang, t) =>
  [product.name[lang], product.description[lang], colorName(product.color, lang), t.categories[product.category]]
    .join(' ')
    .toLocaleLowerCase(lang)

const ProductCard = ({ product }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const money = useMoney()
  const { add, qtyOf } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const inCart = qtyOf(product.id)

  // "Added" feedback for a moment; the cleanup cancels the timer if the card unmounts.
  useEffect(() => {
    if (!justAdded) return
    const timer = setTimeout(() => setJustAdded(false), 1400)
    return () => clearTimeout(timer)
  }, [justAdded])

  const href = `#/product/${product.id}`
  return (
    <li className="ws-card">
      <a href={href} className="ws-card__media" tabIndex={-1} aria-hidden="true">
        <ProductVisual product={product} label="" />
        {product.tag && <span className="ws-tag">{t.tags[product.tag]}</span>}
      </a>
      <div className="ws-card__body">
        <h3 className="ws-card__name">
          <a href={href}>{product.name[lang]}</a>
        </h3>
        <p className="ws-card__meta">
          {t.categories[product.category]} · {colorName(product.color, lang)}
        </p>
        <div className="ws-card__foot">
          <strong className="ws-price">{money(product.price)}</strong>
          <button
            type="button"
            className="btn ws-card__add"
            onClick={() => {
              add(product.id)
              setJustAdded(true)
            }}
          >
            {justAdded ? `✓ ${t.added}` : t.add}
          </button>
        </div>
        {inCart > 0 && <p className="ws-card__incart">{t.inCart(inCart)}</p>}
      </div>
    </li>
  )
}

const Catalogue = ({ filters, setFilters }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const { q, category, sort } = filters
  const set = (patch) => setFilters({ ...filters, ...patch })

  // Derived data: the visible list is calculated during render, never stored in state.
  const query = q.trim().toLocaleLowerCase(lang)
  const visible = PRODUCTS.filter((p) => category === 'all' || p.category === category)
    .filter((p) => !query || searchText(p, lang, t).includes(query))
    .sort((a, b) => SORTS[sort](a, b, lang))

  return (
    <div className="ws-catalogue">
      <div className="ws-toolbar">
        <label className="field ws-search">
          <span>{t.search}</span>
          <span className="ws-search__box">
            <input
              className="input"
              type="search"
              value={q}
              placeholder={t.searchPlaceholder}
              onChange={(e) => set({ q: e.target.value })}
            />
            {q && (
              <button type="button" className="ws-search__clear" onClick={() => set({ q: '' })} aria-label={t.clearSearch}>
                ×
              </button>
            )}
          </span>
        </label>
        <label className="field ws-sort">
          <span>{t.sort}</span>
          <select className="input" value={sort} onChange={(e) => set({ sort: e.target.value })}>
            {Object.keys(SORTS).map((key) => (
              <option key={key} value={key}>
                {t.sorts[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="ws-chips" role="group" aria-label={t.categoriesLabel}>
        {['all', ...CATEGORIES].map((key) => (
          <button key={key} type="button" className="chip" aria-pressed={category === key} onClick={() => set({ category: key })}>
            {key === 'all' ? t.all : t.categories[key]}
          </button>
        ))}
      </div>

      <p className="ws-count" aria-live="polite">
        {t.results(visible.length)}
      </p>

      {visible.length === 0 ? (
        <div className="ws-empty">
          <p>{t.noResults}</p>
          <button type="button" className="btn btn--ghost" onClick={() => setFilters({ q: '', category: 'all', sort })}>
            {t.resetFilters}
          </button>
        </div>
      ) : (
        <ul className="ws-grid">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default Catalogue
