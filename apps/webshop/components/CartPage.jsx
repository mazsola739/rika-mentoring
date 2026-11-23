import { useLang, useText } from '@shared/i18n.js'
import { FREE_SHIPPING_FROM } from '../cartReducer.js'
import { useCart } from '../CartContext.jsx'
import { TEXT, useMoney } from '../text.js'
import ProductVisual from './ProductVisual.jsx'
import QtyStepper from './QtyStepper.jsx'

// The totals box is shared by the cart and the checkout page.
export const CartTotals = () => {
  const t = useText(TEXT)
  const money = useMoney()
  const { subtotal, shipping, total } = useCart()
  return (
    <dl className="ws-totals">
      <div>
        <dt>{t.subtotal}</dt>
        <dd>{money(subtotal)}</dd>
      </div>
      <div>
        <dt>{t.shipping}</dt>
        <dd>{shipping === 0 ? t.free : money(shipping)}</dd>
      </div>
      <div className="ws-totals__total">
        <dt>{t.total}</dt>
        <dd>{money(total)}</dd>
      </div>
    </dl>
  )
}

const CartPage = () => {
  const lang = useLang()
  const t = useText(TEXT)
  const money = useMoney()
  const { items, subtotal, setQty, remove, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="ws-empty ws-empty--big">
        <h2 className="ws-title">{t.cartEmpty}</h2>
        <p>{t.cartEmptyHint}</p>
        <a className="btn" href="#/">
          {t.startShopping}
        </a>
      </div>
    )
  }

  const missing = FREE_SHIPPING_FROM - subtotal

  return (
    <div className="ws-cart">
      <h2 className="ws-title">{t.cartTitle}</h2>
      <ul className="ws-lines">
        {items.map(({ id, qty, product }) => {
          const name = product.name[lang]
          return (
            <li key={id} className="ws-line">
              <a href={`#/product/${id}`} className="ws-line__thumb" tabIndex={-1} aria-hidden="true">
                <ProductVisual product={product} label="" />
              </a>
              <div className="ws-line__info">
                <a href={`#/product/${id}`} className="ws-line__name">
                  {name}
                </a>
                <span className="ws-line__unit">
                  {money(product.price)} {t.each}
                </span>
              </div>
              <QtyStepper value={qty} onChange={(next) => setQty(id, next)} label={`${t.quantity}: ${name}`} />
              <strong className="ws-line__total">{money(qty * product.price)}</strong>
              <button type="button" className="ws-line__remove" onClick={() => remove(id)} aria-label={t.removeItem(name)}>
                {t.remove}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="ws-cart__summary">
        <p className="ws-cart__shipping" aria-live="polite">
          {missing > 0 ? t.freeShippingLeft(money(missing)) : t.freeShippingOk}
        </p>
        <CartTotals />
        <p className="ws-small">{t.vat}</p>
        <div className="ws-actions">
          <a className="btn" href="#/checkout">
            {t.checkout}
          </a>
          <a className="btn btn--ghost" href="#/">
            {t.continueShopping}
          </a>
          <button type="button" className="ws-link" onClick={clear}>
            {t.clearCart}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartPage
