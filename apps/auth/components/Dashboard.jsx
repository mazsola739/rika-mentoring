import { useEffect, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { useAuth } from '../AuthContext.jsx'
import { storedRecord } from '../authApi.js'
import { TEXT, locale } from '../text.js'

function useFormat() {
  const lang = useLang()
  const dateTime = new Intl.DateTimeFormat(locale(lang), { dateStyle: 'medium', timeStyle: 'short' })
  const date = new Intl.DateTimeFormat(locale(lang), { dateStyle: 'long' })
  return { dateTime: (v) => dateTime.format(new Date(v)), date: (v) => date.format(new Date(v)) }
}

// Loads the raw user record from the fake server, with loading / error / retry states.
function StoredRecord({ userId }) {
  const t = useText(TEXT)
  const [state, setState] = useState({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    setState({ status: 'loading' })
    storedRecord(userId)
      .then((record) => !ignore && setState({ status: 'done', record }))
      .catch(() => !ignore && setState({ status: 'error' }))
    return () => {
      ignore = true
    }
  }, [userId, attempt])

  if (state.status === 'loading') return <p className="au-muted" role="status">{t.loading}</p>
  if (state.status === 'error') {
    return (
      <p className="au-alert" role="alert">
        {t.loadFailed}
        <button type="button" className="au-link" onClick={() => setAttempt((n) => n + 1)}>
          {t.retry}
        </button>
      </p>
    )
  }
  const { name, email, salt, passwordHash } = state.record
  return <pre className="au-code">{JSON.stringify({ name, email, salt, passwordHash }, null, 2)}</pre>
}

export function Dashboard() {
  const t = useText(TEXT)
  const { session, user } = useAuth()
  const format = useFormat()

  return (
    <div className="au-dash">
      <div className="au-hero">
        <span className="au-avatar solid" aria-hidden="true">
          {user.name.trim().charAt(0).toUpperCase()}
        </span>
        <div>
          <h2 className="au-title">{t.hello(user.name)}</h2>
          <p className="au-muted">{t.dashIntro}</p>
        </div>
      </div>

      <div className="au-cards">
        <section className="au-card" aria-labelledby="au-profile-title">
          <h3 id="au-profile-title">{t.profileTitle}</h3>
          <dl>
            <dt>{t.email}</dt>
            <dd>{user.email}</dd>
            <dt>{t.memberSince}</dt>
            <dd>{format.date(user.createdAt)}</dd>
          </dl>
        </section>
        <section className="au-card" aria-labelledby="au-session-title">
          <h3 id="au-session-title">{t.sessionTitle}</h3>
          <p className="au-pill">{t.sessionKind(session.remember)}</p>
          <dl>
            <dt>{t.signedInAt}</dt>
            <dd>{format.dateTime(session.createdAt)}</dd>
            <dt>{t.expiresAt}</dt>
            <dd>{format.dateTime(session.expiresAt)}</dd>
            <dt>{t.token}</dt>
            <dd>
              <code>{session.token.slice(0, 13)}…</code>
            </dd>
          </dl>
        </section>
      </div>

      <section className="au-card" aria-labelledby="au-stored-title">
        <h3 id="au-stored-title">{t.storedTitle}</h3>
        <p className="au-muted">{t.storedIntro}</p>
        <StoredRecord userId={user.id} />
      </section>

      <p className="au-muted au-try">
        {t.tryProtected} <a href="#/account">#/account</a>
      </p>
    </div>
  )
}

export function Account() {
  const t = useText(TEXT)
  const { user, rename } = useAuth()
  const [name, setName] = useState(user.name)
  const [status, setStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const valid = name.trim().length >= 2

  const submit = async (e) => {
    e.preventDefault()
    if (!valid) return
    setStatus('saving')
    try {
      await rename(name)
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="au-card au-account" onSubmit={submit} noValidate>
      <h2 className="au-title">{t.accountTitle}</h2>
      <p className="au-muted">{t.accountIntro}</p>
      <div className="field">
        <label htmlFor="au-display-name">
          <span className="au-label">{t.displayName}</span>
        </label>
        <input
          id="au-display-name"
          className="input"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setStatus('idle')
          }}
          aria-invalid={!valid}
          aria-describedby={!valid ? 'au-display-name-error' : undefined}
          disabled={status === 'saving'}
        />
        {!valid && (
          <small id="au-display-name-error" className="au-error">
            {t.errors.name}
          </small>
        )}
      </div>
      <div className="au-row">
        <button type="submit" className="btn" disabled={status === 'saving' || !valid || name.trim() === user.name}>
          {status === 'saving' ? t.saving : t.save}
        </button>
        <span aria-live="polite" className={status === 'error' ? 'au-error' : 'au-ok'}>
          {status === 'saved' && t.saved}
          {status === 'error' && t.saveFailed}
        </span>
      </div>
    </form>
  )
}
