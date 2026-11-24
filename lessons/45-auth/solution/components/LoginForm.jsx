import { useRef, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { useAuth } from '../AuthContext.jsx'
import { DEMO } from '../authApi.js'
import { navigate } from '../useHashRoute.js'
import { isEmail } from '../validation.js'
import { TEXT } from '../text.js'
import { FormAlert, PasswordField, TextField, errorCode } from './FormBits.jsx'

const LoginForm = ({ next, notice }) => {
  const t = useText(TEXT)
  const { login } = useAuth()
  const [values, setValues] = useState({ email: '', password: '', remember: false })
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'sending'
  const [failure, setFailure] = useState(null) // error code from the "server"
  const passwordRef = useRef(null)

  const errors = {
    email: !isEmail(values.email) && t.errors.email,
    password: !values.password && t.errors.passwordRequired,
  }
  const show = (field) => (touched[field] ? errors[field] || undefined : undefined)
  const change = (field) => (e) => {
    setValues({ ...values, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
    setFailure(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (errors.email || errors.password) return
    setStatus('sending')
    setFailure(null)
    try {
      await login({ email: values.email, password: values.password }, values.remember)
      // Go back to the page the guard sent us away from, or to the dashboard.
      navigate(next || '/dashboard', { replace: true })
    } catch (err) {
      const code = errorCode(err)
      setFailure(code)
      setStatus('idle')
      if (code === 'wrongPassword') {
        setValues((v) => ({ ...v, password: '' }))
        passwordRef.current?.focus()
      }
    }
  }

  const sending = status === 'sending'

  return (
    <form className="au-form" onSubmit={submit} noValidate>
      <div>
        <h2 className="au-title">{t.loginTitle}</h2>
        <p className="au-muted">{t.loginIntro}</p>
      </div>

      {notice && (
        <p className="au-notice" role="status">
          {notice}
        </p>
      )}

      <TextField
        id="au-login-email"
        label={t.email}
        type="email"
        inputMode="email"
        autoComplete="email"
        value={values.email}
        onChange={change('email')}
        onBlur={() => setTouched({ ...touched, email: true })}
        error={show('email')}
        disabled={sending}
      />
      <PasswordField
        id="au-login-password"
        label={t.password}
        autoComplete="current-password"
        value={values.password}
        onChange={change('password')}
        onBlur={() => setTouched({ ...touched, password: true })}
        error={show('password')}
        disabled={sending}
        ref={passwordRef}
      />

      <label className="au-check">
        <input type="checkbox" checked={values.remember} onChange={change('remember')} disabled={sending} />
        <span>
          {t.remember}
          <small>{t.rememberHint}</small>
        </span>
      </label>

      <FormAlert code={failure} onFix={() => navigate('/register')} />

      <button type="submit" className="btn au-submit" disabled={sending}>
        {sending ? t.signingIn : t.submitLogin}
      </button>

      <button
        type="button"
        className="au-demo"
        disabled={sending}
        onClick={() => {
          setValues({ ...values, email: DEMO.email, password: DEMO.password })
          setFailure(null)
        }}
      >
        <strong>{t.demo}</strong>
        <span>{t.demoHint(DEMO.email, DEMO.password)}</span>
      </button>

      <p className="au-switch">
        {t.noAccountYet} <a href="#/register">{t.tabs.register}</a>
      </p>
    </form>
  )
}

export default LoginForm
