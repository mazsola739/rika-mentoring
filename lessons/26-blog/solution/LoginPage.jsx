import { useState } from 'react'
import { logIn } from './api.js'
import { usePageMeta } from './usePageMeta.js'

// The login form. It is also drawn in place of the writing and edit pages while nobody is logged in.
export default function LoginPage({ t, onLogin }) {
  const l = t.login
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false) // is the login on its way?
  const [error, setError] = useState('')
  usePageMeta(l.title, l.intro)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      // The answer is { id, name }: the password never goes into the page's state.
      onLogin(await logIn(name.trim(), password))
    } catch (err) {
      setError(err.status === 401 ? l.wrong : l.failed)
      setBusy(false)
    }
  }

  return (
    <form className="bl-page bl-login" onSubmit={submit}>
      <div>
        <h3>{l.title}</h3>
        <p className="bl-note">{l.intro}</p>
      </div>
      <p className="bl-login__hint">{l.hint}</p>
      <fieldset className="bl-editor__fields" disabled={busy}>
        <label className="field">
          <span>{l.name}</span>
          <input
            className="input"
            value={name}
            autoComplete="username"
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>{l.password}</span>
          <input
            className="input"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && (
          <p className="bl-alert" role="alert">
            {error}
          </p>
        )}
        <div className="bl-row">
          <button type="submit" className="btn" aria-busy={busy}>
            {busy && <span className="bl-spinner" aria-hidden="true" />}
            {busy ? l.busy : l.submit}
          </button>
        </div>
      </fieldset>
    </form>
  )
}
