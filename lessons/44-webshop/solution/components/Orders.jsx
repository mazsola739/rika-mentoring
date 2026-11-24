import { useEffect, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { api } from '../api.js'
import { TEXT, useDateTime, useMoney } from '../text.js'

const shortId = (id) => id.slice(0, 8).toUpperCase()

// A small data-fetching hook: loading / error / data, plus a retry function.
// The `ignore` flag drops a late answer if the component already unmounted or the id changed.
const useRequest = (request, deps) => {
  const [state, setState] = useState({ status: 'loading', data: null, error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    setState((s) => ({ ...s, status: 'loading' }))
    request()
      .then((data) => !ignore && setState({ status: 'done', data, error: '' }))
      .catch((err) => !ignore && setState({ status: 'error', data: null, error: err.message }))
    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  return { ...state, retry: () => setAttempt((n) => n + 1) }
}

const RequestState = ({ state, t }) => {
  if (state.status === 'loading') {
    return (
      <p className="ws-loading" role="status">
        <span className="ws-spinner" aria-hidden="true" /> {t.loading}
      </p>
    )
  }
  return (
    <div className="ws-alert" role="alert">
      <strong>{t.loadFailed}</strong> {state.error}{' '}
      <button type="button" className="btn btn--ghost" onClick={state.retry}>
        {t.retry}
      </button>
    </div>
  )
}

export const OrderPage = ({ id, initialOrder }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const money = useMoney()
  const date = useDateTime()
  // Right after checkout we already have the order in memory; otherwise we ask the "server".
  const fetched = useRequest(() => (initialOrder?.id === id ? Promise.resolve(initialOrder) : api.get('orders', id)), [id])
  const order = fetched.data

  if (fetched.status !== 'done') return <RequestState state={fetched} t={t} />

  const { customer } = order
  return (
    <div className="ws-order">
      <div className="ws-order__head solid">
        <span className="ws-order__check" aria-hidden="true">
          ✓
        </span>
        <div>
          <h2 className="ws-title">{t.thanks(customer.name.split(' ')[0])}</h2>
          <p>
            {t.orderPlaced} <strong>{customer.email}</strong>
          </p>
        </div>
      </div>

      <dl className="ws-order__meta">
        <div>
          <dt>{t.orderNumber}</dt>
          <dd>#{shortId(order.id)}</dd>
        </div>
        <div>
          <dt>{t.placedAt}</dt>
          <dd>{date(order.createdAt)}</dd>
        </div>
        <div>
          <dt>{t.shipTo}</dt>
          <dd>
            {customer.street}, {customer.postcode} {customer.city}, {t.countries[customer.country]}
          </dd>
        </div>
      </dl>

      <h3 className="ws-subtitle">{t.items}</h3>
      <ul className="ws-summary__items">
        {order.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.qty} × {item.name[lang]}
            </span>
            <span>{money(item.qty * item.price)}</span>
          </li>
        ))}
      </ul>
      <dl className="ws-totals">
        <div>
          <dt>{t.shipping}</dt>
          <dd>{order.shipping === 0 ? t.free : money(order.shipping)}</dd>
        </div>
        <div className="ws-totals__total">
          <dt>{t.total}</dt>
          <dd>{money(order.total)}</dd>
        </div>
      </dl>

      <div className="ws-actions">
        <a className="btn" href="#/">
          {t.continueShopping}
        </a>
        <a className="btn btn--ghost" href="#/orders">
          {t.ordersTitle}
        </a>
      </div>
    </div>
  )
}

export const OrdersPage = () => {
  const t = useText(TEXT)
  const money = useMoney()
  const date = useDateTime()
  const orders = useRequest(() => api.list('orders'), [])

  return (
    <div className="ws-orders">
      <h2 className="ws-title">{t.ordersTitle}</h2>
      {orders.status !== 'done' ? (
        <RequestState state={orders} t={t} />
      ) : orders.data.length === 0 ? (
        <div className="ws-empty">
          <p>{t.noOrders}</p>
          <a className="btn" href="#/">
            {t.startShopping}
          </a>
        </div>
      ) : (
        <ul className="ws-lines">
          {[...orders.data].reverse().map((order) => (
            <li key={order.id} className="ws-orderrow">
              <div>
                <strong>#{shortId(order.id)}</strong>
                <span className="ws-small">
                  {date(order.createdAt)} · {t.orderItems(order.items.reduce((n, i) => n + i.qty, 0))}
                </span>
              </div>
              <strong>{money(order.total)}</strong>
              <a className="btn btn--ghost" href={`#/order/${order.id}`}>
                {t.viewOrder}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
