import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { serviceById } from '../services.js'
import { TEXT, useFormat } from '../text.js'

const BookingRow = ({ booking, isPast, onCancel }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const format = useFormat()
  const [step, setStep] = useState('idle') // 'idle' | 'confirm' | 'cancelling' | 'error'
  const service = serviceById(booking.serviceId)
  const start = new Date(booking.start)
  const end = new Date(booking.end)

  const cancel = async () => {
    setStep('cancelling')
    try {
      await onCancel(booking.id) // on success the row disappears from the list
    } catch {
      setStep('error')
    }
  }

  return (
    <li className={`bk-booking${isPast ? ' is-past' : ''}`}>
      <div className="bk-booking__date" aria-hidden="true">
        <span>{format.weekdayOf(start.getDay())}</span>
        <strong>{start.getDate()}</strong>
      </div>
      <div className="bk-booking__info">
        <strong>{service?.name[lang] ?? booking.serviceId}</strong>
        <span>
          {format.fullDate(start)} · {format.range(start, end)}
        </span>
        <span className="bk-muted">
          {t.with}: {booking.name}
        </span>
        {step === 'error' && (
          <span className="bk-error" role="alert">
            {t.cancelFailed}
          </span>
        )}
      </div>
      {!isPast && (
        <div className="bk-booking__actions">
          {step === 'confirm' || step === 'cancelling' ? (
            <>
              <span className="bk-booking__question">{t.cancelConfirm}</span>
              <button type="button" className="btn bk-btn-danger" onClick={cancel} disabled={step === 'cancelling'}>
                {step === 'cancelling' ? t.cancelling : t.yesCancel}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setStep('idle')} disabled={step === 'cancelling'}>
                {t.keep}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--ghost" onClick={() => setStep('confirm')}>
              {t.cancel}
            </button>
          )}
        </div>
      )}
    </li>
  )
}

const MyBookings = ({ bookings, onCancel, onBook }) => {
  const t = useText(TEXT)
  const [notice, setNotice] = useState(false)
  const now = Date.now()
  const mine = bookings.filter((b) => b.mine).sort((a, b) => a.start.localeCompare(b.start))
  const upcoming = mine.filter((b) => new Date(b.end).getTime() > now)
  const past = mine.filter((b) => new Date(b.end).getTime() <= now).reverse()

  const cancel = async (id) => {
    await onCancel(id)
    setNotice(true)
  }

  return (
    <div className="bk-mine">
      <div aria-live="polite">{notice && <p className="bk-notice">{t.cancelled}</p>}</div>
      {mine.length === 0 ? (
        <div className="bk-empty">
          <p>{t.mineEmpty}</p>
          <button type="button" className="btn" onClick={onBook}>
            {t.tabs.book}
          </button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h3 className="bk-h3">{t.upcoming}</h3>
              <ul className="bk-bookings">
                {upcoming.map((b) => (
                  <BookingRow key={b.id} booking={b} onCancel={cancel} />
                ))}
              </ul>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h3 className="bk-h3">{t.past}</h3>
              <ul className="bk-bookings">
                {past.map((b) => (
                  <BookingRow key={b.id} booking={b} isPast onCancel={cancel} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default MyBookings
