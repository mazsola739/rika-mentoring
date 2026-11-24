import { useState } from 'react'
import { logIn } from '../cloud.js'

// Logging in to the pretend server. The first login with a new name creates the account.
export default function LoginForm({ onLogin, t }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('') // a key of t: 'loginMissing', 'loginWrong' or 'loginDown'
  const [busy, setBusy] = useState(false) // is the login on its way?

  async function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '' || password === '') {
      setError('loginMissing')
      return
    }
    setBusy(true)
    setError('')
    try {
      const user = await logIn(name.trim(), password)
      // App may have work to do too (a new account gets this browser's shelves); its errors show here as well.
      await onLogin(user)
    } catch (err) {
      setError(err.status === 401 ? 'loginWrong' : 'loginDown')
      setBusy(false)
    }
  }

  return (
    <form className="bl-login" onSubmit={handleSubmit}>
      <p className="bl-muted">{t.loginIntro}</p>
      <div className="bl-login__fields">
        <label className="field">
          <span>{t.nameField}</span>
          <input
            className="input"
            value={name}
            autoComplete="username"
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t.passwordField}</span>
          <input
            className="input"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
      </div>
      {error && (
        <p className="bl-login__error" role="alert">
          {t[error]}
        </p>
      )}
      <button type="submit" className="btn bl-login__submit" disabled={busy}>
        {busy ? t.loggingIn : t.logIn}
      </button>
    </form>
  )
}
