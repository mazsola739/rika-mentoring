import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from './authApi.js'

const KEY = 'rika:auth:session'
const DAY = 24 * 60 * 60 * 1000
const REMEMBER_FOR = 30 * DAY
const SESSION_FOR = 8 * 60 * 60 * 1000

// "Remember me" decides where the session lives:
// localStorage survives closing the browser, sessionStorage is cleared when the tab is closed.
const stores = () => [window.localStorage, window.sessionStorage]

function readSession() {
  try {
    for (const store of stores()) {
      const session = JSON.parse(store.getItem(KEY))
      if (session?.token && session.expiresAt > Date.now()) return session
      if (session) store.removeItem(KEY) // expired or broken: clean it up
    }
  } catch {
    // storage blocked: start logged out
  }
  return null
}

function writeSession(session) {
  try {
    stores().forEach((store) => store.removeItem(KEY))
    if (session) (session.remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session))
  } catch {
    // the session still works until the page is reloaded
  }
}

function createSession(user, remember) {
  return {
    // A real server would sign a token (e.g. a JWT) or set an httpOnly cookie. Here it is a random id.
    token: crypto.randomUUID(),
    user,
    remember,
    createdAt: Date.now(),
    expiresAt: Date.now() + (remember ? REMEMBER_FOR : SESSION_FOR),
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  const login = useCallback(async (credentials, remember) => {
    const user = await authApi.login(credentials)
    const next = createSession(user, remember)
    writeSession(next)
    setSession(next)
  }, [])

  const register = useCallback(async (data) => {
    const user = await authApi.register(data)
    const next = createSession(user, false)
    writeSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    writeSession(null)
    setSession(null)
  }, [])

  const rename = useCallback(
    async (name) => {
      const updated = await authApi.updateName(session.user.id, name)
      const next = { ...session, user: updated }
      writeSession(next)
      setSession(next)
    },
    [session],
  )

  // Log out automatically when the session expires while the page is open. Timers max out at
  // about 24 days, so when the timer fires we simply re-read the session: expired → null.
  useEffect(() => {
    if (!session) return
    const delay = Math.max(0, Math.min(session.expiresAt - Date.now() + 50, 2 ** 31 - 1))
    const timer = setTimeout(() => setSession(readSession()), delay)
    return () => clearTimeout(timer)
  }, [session])

  // Logging out (or in) in another tab updates this tab too. The `storage` event only covers localStorage.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === KEY || event.key === null) setSession(readSession())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => ({ session, user: session?.user ?? null, login, register, logout, rename }), [
    session,
    login,
    register,
    logout,
    rename,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>')
  return auth
}
