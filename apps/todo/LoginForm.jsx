import { useState } from 'react'
import { logIn } from './server.js'

// Name + password. The error is kept as a code ('missing', 'wrong', 'offline'), not as text,
// so it is shown in the right language even if the language changes while it is on screen.
export default function LoginForm({ onLogin, t }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false) // true while we wait for the server: the button is disabled

  async function handleSubmit(e) {
    e.preventDefault()
    if (name.trim() === '' || password === '') {
      setError('missing')
      return
    }
    setBusy(true)
    setError(null)
    try {
      onLogin(await logIn(name.trim(), password)) // the form disappears, so busy needs no reset here
    } catch (err) {
      setError(err.status === 401 ? 'wrong' : 'offline')
      setBusy(false)
    }
  }

  return (
    <form className="td-login" onSubmit={handleSubmit} noValidate>
      <h2 className="td-login__title">{t.login.title}</h2>
      <p className="td-login__hint">{t.login.hint}</p>
      <label className="field">
        <span>{t.login.name}</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" />
      </label>
      <label className="field">
        <span>{t.login.password}</span>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error && (
        <p className="td-login__error" role="alert">
          {t.login.errors[error]}
        </p>
      )}
      <button type="submit" className="btn" disabled={busy}>
        {busy ? t.login.busy : t.login.submit}
      </button>
    </form>
  )
}
