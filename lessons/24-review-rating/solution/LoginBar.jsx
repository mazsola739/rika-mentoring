import { useState } from 'react'

// Pretend login by name. Hooks first, before the early return (the rules of hooks).
export default function LoginBar({ account, t }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const user = account.user

  async function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '') {
      setError(t.login.empty)
      return
    }
    setBusy(true)
    setError('')
    try {
      await account.logIn(name)
      setName('')
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  if (user !== null) {
    return (
      <div className="rr-login rr-login--in">
        <p className="rr-login__who">
          {t.login.loggedInAs} <strong>{user.name}</strong>{' '}
          {user.role === 'moderator' && <span className="rr-login__role">{t.login.moderator}</span>}
        </p>
        <button type="button" className="btn btn--ghost" onClick={account.logOut}>
          {t.login.logOut}
        </button>
      </div>
    )
  }

  return (
    <form className="rr-login" onSubmit={handleSubmit} noValidate>
      <label className="field rr-login__field">
        <span>{t.login.label}</span>
        <input
          className="input"
          value={name}
          maxLength={40}
          autoComplete="username"
          aria-invalid={Boolean(error)}
          aria-describedby="rr-login-hint"
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <button type="submit" className="btn" disabled={busy} aria-busy={busy}>
        {busy && <span className="rr-spinner" aria-hidden="true" />}
        {busy ? t.login.busy : t.login.submit}
      </button>
      {error && (
        <p className="rr-error rr-login__error" role="alert">
          {error}
        </p>
      )}
      <p id="rr-login-hint" className="rr-login__hint">
        {t.login.hint}
      </p>
    </form>
  )
}
