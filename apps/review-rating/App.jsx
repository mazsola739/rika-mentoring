import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { PRODUCTS } from './products.js'
import { useReviews } from './useReviews.js'
import { productIdFrom, useHashRoute } from './useHashRoute.js'
import ProductList from './ProductList.jsx'
import ProductPage from './ProductPage.jsx'
import { TEXT } from './text.js'
import './app.css'

// Intl formatters for the current language (plain function, recreated per render: cheap enough here).
function makeFormatters(lang) {
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' })
  const rating = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const date = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' })
  return {
    price: (n) => price.format(n),
    rating: (n) => rating.format(n),
    date: (iso) => date.format(new Date(iso)),
  }
}

function ReviewApp() {
  const t = useText(TEXT)
  const lang = useLang()
  const { path, navigated } = useHashRoute()
  const data = useReviews()
  const fmt = makeFormatters(lang)

  const productId = productIdFrom(path)
  const product = PRODUCTS.find((p) => p.id === productId)

  let page
  if (path === '/' || path === '') {
    page = <ProductList data={data} fmt={fmt} lang={lang} t={t} focusOnMount={navigated} />
  } else if (product) {
    // key: a different product gets a fresh page (sort, filter and form start over).
    page = <ProductPage key={product.id} product={product} data={data} fmt={fmt} lang={lang} t={t} focusOnMount={navigated} />
  } else {
    page = (
      <div className="rr-empty">
        <p>{t.notFound}</p>
        <a className="btn btn--ghost" href="#/">
          {t.back}
        </a>
      </div>
    )
  }

  return (
    <div className="rr">
      {data.status === 'loading' && (
        <p className="rr-status" role="status">
          <span className="rr-spinner" aria-hidden="true" /> {t.loading}
        </p>
      )}
      {data.status === 'error' && (
        <div className="rr-alert rr-alert--block" role="alert">
          <p>
            <strong>{t.loadFailed}</strong> {data.error}
          </p>
          <button type="button" className="btn btn--ghost" onClick={data.reload}>
            {t.retry}
          </button>
        </div>
      )}

      {page}

      <footer className="rr-foot">
        <p>{t.note}</p>
        <button type="button" className="rr-link" onClick={data.resetDemo}>
          {t.reset}
        </button>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="review-rating">
      <ReviewApp />
    </AppFrame>
  )
}
