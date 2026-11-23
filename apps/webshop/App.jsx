import { useEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { CartProvider, useCart } from './CartContext.jsx'
import { matchRoute, navigate, useHashRoute } from './useHashRoute.js'
import { TEXT } from './text.js'
import Catalogue from './components/Catalogue.jsx'
import ProductPage from './components/ProductPage.jsx'
import CartPage from './components/CartPage.jsx'
import Checkout from './components/Checkout.jsx'
import { OrderPage, OrdersPage } from './components/Orders.jsx'
import './app.css'

const ShopHeader = ({ route }) => {
  const t = useText(TEXT)
  const { count } = useCart()
  const current = (name) => (route.name === name ? 'page' : undefined)

  return (
    <header className="ws-header">
      <a className="ws-logo" href="#/">
        <span className="ws-logo__mark" aria-hidden="true" />
        {t.brand}
      </a>
      <nav className="ws-nav" aria-label={t.brand}>
        <a href="#/" aria-current={current('catalogue')}>
          {t.nav.shop}
        </a>
        <a href="#/orders" aria-current={current('orders')}>
          {t.nav.orders}
        </a>
        <a href="#/cart" className="ws-nav__cart" aria-current={current('cart')} aria-label={t.cartCount(count)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 7h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" />
            <path d="M9 9V6a3 3 0 0 1 6 0v3" />
          </svg>
          {t.nav.cart}
          <span className="ws-badge" aria-hidden="true">
            {count}
          </span>
        </a>
      </nav>
    </header>
  )
}

const Shop = () => {
  const t = useText(TEXT)
  const route = matchRoute(useHashRoute())
  const rootRef = useRef(null)
  // Filters live here, above the router, so they survive a visit to a product page.
  const [filters, setFilters] = useState({ q: '', category: 'all', sort: 'featured' })
  const [lastOrder, setLastOrder] = useState(null)
  const routeKey = `${route.name}:${route.id ?? ''}`

  // After a page change, bring the top of the shop into view if it was scrolled away.
  const previousRoute = useRef(routeKey)
  useEffect(() => {
    if (previousRoute.current === routeKey) return
    previousRoute.current = routeKey
    const top = rootRef.current?.getBoundingClientRect().top ?? 0
    if (top < 0) rootRef.current.scrollIntoView({ block: 'start' })
  }, [routeKey])

  let page
  switch (route.name) {
    case 'catalogue':
      page = <Catalogue filters={filters} setFilters={setFilters} />
      break
    case 'product':
      // `key` gives every product a fresh page state (quantity, notice).
      page = <ProductPage key={route.id} id={route.id} />
      break
    case 'cart':
      page = <CartPage />
      break
    case 'checkout':
      page = (
        <Checkout
          onPlaced={(order) => {
            setLastOrder(order)
            navigate(`/order/${order.id}`)
          }}
        />
      )
      break
    case 'order':
      page = <OrderPage key={route.id} id={route.id} initialOrder={lastOrder} />
      break
    case 'orders':
      page = <OrdersPage />
      break
    default:
      page = (
        <div className="ws-empty">
          <p>{t.notFound}</p>
          <a className="btn btn--ghost" href="#/">
            {t.back}
          </a>
        </div>
      )
  }

  return (
    <div className="ws" ref={rootRef}>
      <ShopHeader route={route} />
      <main className="ws-main">{page}</main>
    </div>
  )
}

const App = () => {
  return (
    <AppFrame slug="webshop">
      <CartProvider>
        <Shop />
      </CartProvider>
    </AppFrame>
  )
}

export default App
