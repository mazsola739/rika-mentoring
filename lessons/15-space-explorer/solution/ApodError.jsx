import { apodErrorKind } from './api.js'

// A failed request: a friendly message by the kind of error, "Try again", and for today's picture a way to yesterday's.
export default function ApodError({ error, isToday = false, onRetry, onYesterday, t }) {
  const kind = apodErrorKind(error)
  return (
    <div className="sx-error" role="alert">
      <p>{t.errors[kind]}</p>
      {isToday && kind !== 'rate' && kind !== 'offline' && <p>{t.todayMissing}</p>}
      <div className="sx-error__actions">
        <button type="button" className="btn" onClick={onRetry}>
          {t.retry}
        </button>
        {isToday && onYesterday && (
          <button type="button" className="btn btn--ghost" onClick={onYesterday}>
            {t.yesterday}
          </button>
        )}
      </div>
    </div>
  )
}
