import { useEffect } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import { navigate, useHashRoute } from './useHashRoute.js'
import { TEXT } from './text.js'
import LoginForm from './components/LoginForm.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import { Account, Dashboard } from './components/Dashboard.jsx'
import './app.css'

const PROTECTED = ['/dashboard', '/account']

// Redirects run in an effect: rendering must stay free of side effects.
const Redirect = ({ to }) => {
  useEffect(() => navigate(to, { replace: true }), [to])
  return null
}

// The route guard: render the page only with a session, otherwise send the visitor to the login
// form and remember where they wanted to go (?next=…).
const RequireAuth = ({ path, children }) => {
  const { user } = useAuth()
  if (!user) return <Redirect to={`/login?next=${encodeURIComponent(path)}`} />
  return children
}

const SignedOutLayout = ({ children }) => {
  const t = useText(TEXT)
  return (
    <div className="au-split">
      <aside className="au-side">
        <div className="au-side__card">
          <p className="au-side__brand">{t.brand}</p>
          <p>{t.tagline}</p>
          <ul>
            {t.perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="au-main">{children}</div>
    </div>
  )
}

const SignedInLayout = ({ path, children }) => {
  const t = useText(TEXT)
  const { logout } = useAuth()
  return (
    <div className="au-shell">
      <header className="au-bar">
        <span className="au-bar__brand">
          <span className="au-bar__mark" aria-hidden="true" />
          {t.brand}
        </span>
        <nav className="au-tabs" aria-label={t.brand}>
          {PROTECTED.map((p) => (
            <a key={p} href={`#${p}`} aria-current={path === p ? 'page' : undefined}>
              {t.nav[p.slice(1)]}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          {t.logout}
        </button>
      </header>
      {children}
    </div>
  )
}

const AuthDemo = () => {
  const t = useText(TEXT)
  const { user } = useAuth()
  const { path, query } = useHashRoute()
  // Only allow internal, known paths as redirect targets (never an arbitrary URL).
  const next = PROTECTED.includes(query.next) ? query.next : null

  if (PROTECTED.includes(path)) {
    return (
      <RequireAuth path={path}>
        <SignedInLayout path={path}>{path === '/account' ? <Account key={user?.id} /> : <Dashboard />}</SignedInLayout>
      </RequireAuth>
    )
  }

  if (user) return <Redirect to={next ?? '/dashboard'} />

  if (path === '/register') {
    return (
      <SignedOutLayout>
        <RegisterForm />
      </SignedOutLayout>
    )
  }
  if (path === '/login') {
    return (
      <SignedOutLayout>
        <LoginForm next={next} notice={next ? t.protectedNotice : null} />
      </SignedOutLayout>
    )
  }
  return <Redirect to="/login" />
}

const App = () => {
  return (
    <AppFrame slug="auth">
      <AuthProvider>
        <div className="au">
          <AuthDemo />
        </div>
      </AuthProvider>
    </AppFrame>
  )
}

export default App
