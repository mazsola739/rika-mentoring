import { useState } from 'react'
import { useText } from '@shared/i18n.js'
import LevelMeter from '@shared/ui/LevelMeter.jsx'
import { useAuth } from '../AuthContext.jsx'
import { navigate } from '../useHashRoute.js'
import { PASSWORD_RULES, isEmail, meetsRequiredRules, passwordStrength } from '../validation.js'
import { TEXT } from '../text.js'
import { FormAlert, PasswordField, TextField, errorCode } from './FormBits.jsx'

const EMPTY = { name: '', email: '', password: '', confirm: '' }

function validate(values, t) {
  return {
    name: values.name.trim().length < 2 && t.errors.name,
    email: !isEmail(values.email) && t.errors.email,
    password: !meetsRequiredRules(values.password) && t.errors.passwordRules,
    confirm: (values.confirm !== values.password || !values.confirm) && t.errors.confirm,
  }
}

const PasswordRules = ({ password }) => {
  const t = useText(TEXT)
  const score = passwordStrength(password)
  return (
    <div className="au-rules" id="au-rules">
      <div className="au-strength" aria-live="polite">
        <span className="au-strength__label">{t.strength}</span>
        <LevelMeter value={score} max={4} label={`${t.strength}: ${t.levels[score]}`} className={`au-meter au-meter--${score}`} />
        <strong>{t.levels[score]}</strong>
      </div>
      <ul aria-label={t.rulesLabel}>
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password)
          return (
            <li key={rule.key} className={ok ? 'is-ok' : undefined}>
              <span aria-hidden="true">{ok ? '✓' : '•'}</span>
              {t.rules[rule.key]}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const RegisterForm = () => {
  const t = useText(TEXT)
  const { register } = useAuth()
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle')
  const [failure, setFailure] = useState(null)

  const errors = validate(values, t)
  const show = (field) => (touched[field] ? errors[field] || undefined : undefined)
  const bind = (field) => ({
    value: values[field],
    onChange: (e) => {
      setValues({ ...values, [field]: e.target.value })
      setFailure(null)
    },
    onBlur: () => setTouched({ ...touched, [field]: true }),
    error: show(field),
    disabled: status === 'sending',
  })

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirm: true })
    if (Object.values(errors).some(Boolean)) return
    setStatus('sending')
    setFailure(null)
    try {
      await register({ name: values.name, email: values.email, password: values.password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFailure(errorCode(err))
      setStatus('idle')
    }
  }

  return (
    <form className="au-form" onSubmit={submit} noValidate>
      <div>
        <h2 className="au-title">{t.registerTitle}</h2>
        <p className="au-muted">{t.registerIntro}</p>
      </div>

      <TextField id="au-reg-name" label={t.name} autoComplete="name" {...bind('name')} />
      <TextField id="au-reg-email" label={t.email} type="email" inputMode="email" autoComplete="email" {...bind('email')} />
      <PasswordField id="au-reg-password" label={t.password} autoComplete="new-password" describedBy="au-rules" {...bind('password')} />
      <PasswordRules password={values.password} />
      <PasswordField id="au-reg-confirm" label={t.confirm} autoComplete="new-password" {...bind('confirm')} />

      <FormAlert code={failure} onFix={() => navigate('/login')} />

      <button type="submit" className="btn au-submit" disabled={status === 'sending'}>
        {status === 'sending' ? t.creating : t.submitRegister}
      </button>

      <p className="au-switch">
        {t.haveAccount} <a href="#/login">{t.tabs.login}</a>
      </p>
    </form>
  )
}

export default RegisterForm
