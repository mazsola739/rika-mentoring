import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { COLORS, colorName, productById } from '../products.js'
import { useCart } from '../CartContext.jsx'
import { TEXT, useMoney } from '../text.js'
import ProductVisual from './ProductVisual.jsx'
import QtyStepper from './QtyStepper.jsx'

const ProductPage = ({ id }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const money = useMoney()
  const { add, qtyOf } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(null) // how many were added last time
  const product = productById(id)

  if (!product) {
    return (
      <div className="ws-empty">
        <p>{t.productNotFound}</p>
        <a className="btn btn--ghost" href="#/">
          {t.back}
        </a>
      </div>
    )
  }

  const name = product.name[lang]

  return (
    <article className="ws-product">
      <a className="ws-back" href="#/">
        {t.back}
      </a>
      <div className="ws-product__layout">
        <div className="ws-product__media">
          <ProductVisual product={product} label={name} large />
        </div>
        <div className="ws-product__info">
          <p className="ws-eyebrow">{t.categories[product.category]}</p>
          <h2 className="ws-title">{name}</h2>
          <p className="ws-product__price">{money(product.price)}</p>
          <p>{product.description[lang]}</p>

          <dl className="ws-product__colors">
            <dt>{t.colors}</dt>
            {[product.color, product.accent].map((key) => (
              <dd key={key}>
                <span className="ws-swatch" style={{ background: COLORS[key].hex }} aria-hidden="true" />
                {colorName(key, lang)}
              </dd>
            ))}
          </dl>

          <div className="ws-product__buy">
            <QtyStepper value={qty} onChange={setQty} />
            <button
              type="button"
              className="btn"
              onClick={() => {
                add(product.id, qty)
                setAdded(qty)
              }}
            >
              {t.add}
            </button>
          </div>

          <div aria-live="polite">
            {added !== null && (
              <p className="ws-notice">
                {t.addedToCart(name, added)} <span>{t.inCart(qtyOf(product.id))}</span> ·{' '}
                <a href="#/cart">{t.goToCart}</a>
              </p>
            )}
          </div>

          <h3 className="ws-subtitle">{t.details}</h3>
          <ul className="ws-details">
            {product.details[lang].map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

export default ProductPage
