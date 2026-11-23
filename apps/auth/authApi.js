import { createMockApi } from '@shared/mock-api/index.js'

// A seeded demo account (password: Pattern-2026), so the login can be tried right away.
const DEMO_USER = {
  id: 'demo-user',
  name: 'Demo Designer',
  email: 'demo@example.com',
  salt: 'f3a9c1d27b4e8a60',
  passwordHash: '1413757020cd7889a7c2fed9bc0a7de5bee5cc17558f1d4f2a5e634f9b6a3a5b',
  createdAt: '2026-01-12T09:30:00.000Z',
}

export const DEMO = { email: DEMO_USER.email, password: 'Pattern-2026' }

// Fake "auth server" in localStorage, with latency and the occasional failure.
const api = createMockApi('auth', { seed: { users: [DEMO_USER] }, latency: [450, 950], failRate: 0.08 })

// Error codes the UI turns into friendly, translated messages.
export class AuthError extends Error {
  constructor(code) {
    super(code)
    this.name = 'AuthError'
    this.code = code
  }
}

const toHex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')

// SHA-256 with the browser's built-in SubtleCrypto.
// IMPORTANT: a real app never hashes passwords in the browser. The plain password goes to the
// server over HTTPS, and the *server* stores a slow, salted hash (bcrypt, scrypt or Argon2).
// We only do it here because this demo has no server at all.
export async function sha256(text) {
  if (!crypto?.subtle) throw new AuthError('noCrypto')
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))
}

const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(8)))
const normalizeEmail = (email) => email.trim().toLowerCase()

// Only these fields ever leave the "server": never the hash or the salt.
const publicUser = ({ id, name, email, createdAt }) => ({ id, name, email, createdAt })

export async function register({ name, email, password }) {
  const address = normalizeEmail(email)
  const existing = await api.list('users', (u) => u.email === address)
  if (existing.length) throw new AuthError('emailTaken')

  const salt = newSalt()
  const passwordHash = await sha256(`${salt}:${password}`)
  const user = await api.create('users', { name: name.trim(), email: address, salt, passwordHash })
  return publicUser(user)
}

export async function login({ email, password }) {
  const [user] = await api.list('users', (u) => u.email === normalizeEmail(email))
  // Teaching note: many production apps show one generic "wrong email or password" message,
  // so attackers cannot find out which emails are registered. We show both cases separately here.
  if (!user) throw new AuthError('noAccount')
  const hash = await sha256(`${user.salt}:${password}`)
  if (hash !== user.passwordHash) throw new AuthError('wrongPassword')
  return publicUser(user)
}

export async function updateName(id, name) {
  return publicUser(await api.update('users', id, { name: name.trim() }))
}

// For the "what the server stored" panel: the raw record, including the hash.
export const storedRecord = (id) => api.get('users', id)
