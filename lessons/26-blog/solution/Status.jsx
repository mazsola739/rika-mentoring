import { usePageMeta } from './usePageMeta.js'

// Small building blocks for the loading / error / not-found states every page needs.

export function Loading({ label, lines = 3 }) {
  return (
    <div className="bl-loading" role="status">
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="bl-skeleton" aria-hidden="true" />
      ))}
    </div>
  )
}

export function ErrorState({ title, message, onRetry, retryLabel }) {
  return (
    <div className="bl-alert bl-alert--block" role="alert">
      <p>
        <strong>{title}</strong> {message}
      </p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  )
}

// For an address with no page, or a post that does not exist. The title also goes on the browser tab.
export function NotFound({ title, text, backLabel }) {
  usePageMeta(title, text)

  return (
    <div className="bl-empty">
      <h3 className="bl-empty__title">{title}</h3>
      <p>{text}</p>
      <a className="btn btn--ghost" href="#/">
        <span aria-hidden="true">←</span> {backLabel}
      </a>
    </div>
  )
}
