import { useEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { OPENING_HOURS, SERVICES, serviceById } from './services.js'
import { TEXT, useFormat } from './text.js'
import { useBookings } from './useBookings.js'
import Calendar from './components/Calendar.jsx'
import SlotPicker from './components/SlotPicker.jsx'
import BookingForm, { BookingSummary } from './components/BookingForm.jsx'
import MyBookings from './components/MyBookings.jsx'
import './app.css'

const STEPS = ['service', 'time', 'details']
const thisMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function Steps({ step, onGo, canGo }) {
  const t = useText(TEXT)
  const current = STEPS.indexOf(step)
  return (
    <ol className="bk-steps">
      {STEPS.map((key, i) => (
        <li key={key} className={i < current ? 'is-done' : undefined} aria-current={i === current ? 'step' : undefined}>
          <button type="button" onClick={() => onGo(key)} disabled={i > current && !canGo(key)}>
            <span className="bk-steps__n">{i < current ? '✓' : i + 1}</span>
            <span className="bk-steps__label">{t.steps[i]}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function OpeningHours() {
  const t = useText(TEXT)
  const format = useFormat()
  const order = [1, 2, 3, 4, 5, 6, 0]
  return (
    <details className="bk-hours">
      <summary>{t.hoursTitle}</summary>
      <dl>
        {order.map((d) => (
          <div key={d}>
            <dt>{format.weekdayOf(d)}</dt>
            <dd>{OPENING_HOURS[d] ? OPENING_HOURS[d].map((h) => `${String(h).padStart(2, '0')}:00`).join(' – ') : t.closed}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

function BookingFlow({ data, onShowMine }) {
  const lang = useLang()
  const t = useText(TEXT)
  const format = useFormat()
  const [step, setStep] = useState('service')
  const [serviceId, setServiceId] = useState(null)
  const [dayKey, setDayKey] = useState(null)
  const [start, setStart] = useState(null) // ISO string of the chosen slot
  const [month, setMonth] = useState(thisMonth)
  const [error, setError] = useState(null) // 'conflict' | 'failed'
  const [done, setDone] = useState(null) // the saved booking
  const headingRef = useRef(null)
  const service = serviceById(serviceId)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Move keyboard focus to the new step's heading, so screen readers announce it.
  // We compare with the previous view, so nothing is focused on the first render.
  const view = `${step}:${done ? 'done' : ''}`
  const previousView = useRef(view)
  useEffect(() => {
    if (previousView.current !== view) headingRef.current?.focus()
    previousView.current = view
  }, [view])

  const canGo = (key) => (key === 'time' ? Boolean(service) : key === 'details' ? Boolean(service && start) : true)

  const chooseService = (id) => {
    if (id !== serviceId) {
      setServiceId(id)
      setStart(null) // a different duration can make the chosen time invalid
    }
    setStep('time')
  }

  const submit = async (details) => {
    setError(null)
    const startDate = new Date(start)
    try {
      const saved = await data.create({
        serviceId,
        start,
        end: new Date(startDate.getTime() + service.duration * 60_000).toISOString(),
        ...details,
      })
      setDone(saved)
    } catch (err) {
      if (err.code === 'conflict') {
        setError('conflict')
        setStart(null)
        setStep('time')
        data.reload()
      } else {
        setError('failed')
      }
    }
  }

  const restart = () => {
    setDone(null)
    setStart(null)
    setDayKey(null)
    setError(null)
    setStep('service')
  }

  if (done) {
    const s = serviceById(done.serviceId)
    return (
      <div className="bk-done">
        <span className="bk-done__check solid" aria-hidden="true">
          ✓
        </span>
        <h3 className="bk-h2" tabIndex={-1} ref={headingRef}>
          {t.confirmedTitle}
        </h3>
        <BookingSummary service={s} start={new Date(done.start)} end={new Date(done.end)} />
        <p className="bk-muted">{t.confirmedText(done.email)}</p>
        <div className="bk-actions">
          <button type="button" className="btn" onClick={onShowMine}>
            {t.seeMine}
          </button>
          <button type="button" className="btn btn--ghost" onClick={restart}>
            {t.bookAnother}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bk-flow">
      <Steps step={step} onGo={setStep} canGo={canGo} />

      {step === 'service' && (
        <section className="bk-section">
          <h3 className="bk-h2" tabIndex={-1} ref={headingRef}>
            {t.chooseService}
          </h3>
          <ul className="bk-services">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <button type="button" className="bk-service" aria-pressed={serviceId === s.id} onClick={() => chooseService(s.id)}>
                  <span className="bk-service__top">
                    <strong>{s.name[lang]}</strong>
                    <span className="bk-service__price">{format.money(s.price)}</span>
                  </span>
                  <span className="bk-service__desc">{s.description[lang]}</span>
                  <span className="bk-service__time">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="8.5" />
                      <path d="M12 7.5V12l3 2" />
                    </svg>
                    {t.minutes(s.duration)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 'time' && service && (
        <section className="bk-section">
          <div className="bk-section__head">
            <h3 className="bk-h2" tabIndex={-1} ref={headingRef}>
              {t.chooseDate}
            </h3>
            <span className="bk-pill">
              {service.name[lang]} · {t.minutes(service.duration)}
            </span>
          </div>

          {error === 'conflict' && (
            <p className="bk-alert" role="alert">
              {t.conflict}
            </p>
          )}

          {data.status === 'loading' && (
            <p className="bk-muted" role="status">
              <span className="bk-spinner" aria-hidden="true" /> {t.loading}
            </p>
          )}
          {data.status === 'error' && (
            <div className="bk-alert" role="alert">
              {t.loadFailed}{' '}
              <button type="button" className="btn btn--ghost" onClick={data.reload}>
                {t.retry}
              </button>
            </div>
          )}
          {data.status === 'ready' && (
            <div className="bk-picker">
              <Calendar
                month={month}
                onMonthChange={setMonth}
                selectedKey={dayKey}
                onSelect={(key) => {
                  setDayKey(key)
                  setStart(null)
                }}
                service={service}
                bookings={data.bookings}
              />
              <div className="bk-picker__side">
                <SlotPicker
                  dayKey={dayKey}
                  service={service}
                  bookings={data.bookings}
                  selectedStart={start}
                  onSelect={(iso) => {
                    setStart(iso)
                    setError(null)
                  }}
                />
                <p className="bk-tz">{t.timeZone(timeZone)}</p>
                <OpeningHours />
              </div>
            </div>
          )}

          <div className="bk-actions bk-actions--end">
            <button type="button" className="btn btn--ghost" onClick={() => setStep('service')}>
              ← {t.back}
            </button>
            <button type="button" className="btn" disabled={!start} onClick={() => setStep('details')}>
              {t.continue} →
            </button>
          </div>
        </section>
      )}

      {step === 'details' && service && start && (
        <section className="bk-section">
          <h3 className="bk-h2" tabIndex={-1} ref={headingRef}>
            {t.yourDetails}
          </h3>
          <BookingForm
            service={service}
            start={new Date(start)}
            end={new Date(new Date(start).getTime() + service.duration * 60_000)}
            onSubmit={submit}
            onBack={() => setStep('time')}
            error={error === 'failed' ? t.failed : null}
          />
        </section>
      )}
    </div>
  )
}

function Booking() {
  const t = useText(TEXT)
  const data = useBookings()
  const [tab, setTab] = useState('book')
  const mineCount = data.bookings.filter((b) => b.mine && new Date(b.end) > new Date()).length

  return (
    <div className="bk">
      <div className="bk-tabs" role="tablist" aria-label={t.tabs.book}>
        {['book', 'mine'].map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`bk-tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`bk-panel-${key}`}
            onClick={() => setTab(key)}
          >
            {t.tabs[key]}
            {key === 'mine' && mineCount > 0 && <span className="bk-count">{mineCount}</span>}
          </button>
        ))}
      </div>

      {/* Both panels stay mounted (hidden), so the booking flow keeps its state when switching tabs. */}
      <div id="bk-panel-book" role="tabpanel" aria-labelledby="bk-tab-book" hidden={tab !== 'book'}>
        <BookingFlow data={data} onShowMine={() => setTab('mine')} />
      </div>
      <div id="bk-panel-mine" role="tabpanel" aria-labelledby="bk-tab-mine" hidden={tab !== 'mine'}>
        {data.status === 'ready' ? (
          <MyBookings bookings={data.bookings} onCancel={data.cancel} onBook={() => setTab('book')} />
        ) : data.status === 'error' ? (
          <div className="bk-alert" role="alert">
            {t.loadFailed}{' '}
            <button type="button" className="btn btn--ghost" onClick={data.reload}>
              {t.retry}
            </button>
          </div>
        ) : (
          <p className="bk-muted">{t.loading}</p>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="booking">
      <Booking />
    </AppFrame>
  )
}
