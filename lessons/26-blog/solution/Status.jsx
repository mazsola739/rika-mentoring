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

export function NotFound({ text, backLabel }) {
  return (
    <div className="bl-empty">
      <p>{text}</p>
      <a className="btn btn--ghost" href="#/">
        <span aria-hidden="true">←</span> {backLabel}
      </a>
    </div>
  )
}
