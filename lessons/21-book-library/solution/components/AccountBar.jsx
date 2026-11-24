import LoginForm from './LoginForm.jsx'

// Logged out: one line that opens into the login form (<details>). Logged in: the name, how saving goes, and "Log out".
export default function AccountBar({ session, status, onLogin, onLogout, onRetry, t }) {
  if (!session) {
    return (
      <details className="bl-account">
        <summary>{t.loginSummary}</summary>
        <LoginForm onLogin={onLogin} t={t} />
      </details>
    )
  }

  const failed = status === 'load-failed' || status === 'save-failed'
  return (
    <div className="bl-account bl-account--in">
      <span className="bl-account__name">
        {t.loggedInAs} <strong>{session.name}</strong>
      </span>
      {/* The class follows the status, so failures are shown in the accent colour. */}
      <span className={`bl-account__status bl-account__status--${status}`} aria-live="polite">
        {t.sync[status]}
      </span>
      <span className="bl-account__actions">
        {failed && (
          <button type="button" className="bl-move" onClick={onRetry}>
            {t.retry}
          </button>
        )}
        <button type="button" className="bl-move" onClick={onLogout}>
          {t.logOut}
        </button>
      </span>
    </div>
  )
}
