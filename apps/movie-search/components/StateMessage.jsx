import { errorKind } from '../useFetch.js'

// Empty and error states look alike: a short message and, when it helps, an action.
export function EmptyState({ title, children }) {
  return (
    <div className="ms-state">
      <p className="ms-state__title">{title}</p>
      {children}
    </div>
  )
}

export function ErrorState({ error, onRetry, t }) {
  return (
    <div className="ms-state ms-state--error" role="alert">
      <p className="ms-state__title">{t.errors[errorKind(error)]}</p>
      <button type="button" className="btn" onClick={onRetry}>
        {t.retry}
      </button>
    </div>
  )
}
