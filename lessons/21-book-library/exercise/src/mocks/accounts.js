// The pretend server's account service, for the advanced level: logging in, and keeping every
// user's shelves "in the cloud". Its database is a single localStorage key (book-library-server),
// but it behaves like a server: every answer takes a moment, and it only hands out a user's shelves
// to a request that brings that user's token.
//
//   POST /api/login    body { name, password }          → { name, token, created }
//                      (the first login with a new name creates the account, with that password)
//   GET  /api/shelves  header Authorization: Bearer <token>        → { books }  (null: nothing saved yet)
//   PUT  /api/shelves  header Authorization: Bearer <token>, body { books }  → { savedAt }
//
// Errors use the { error, message } shape: 400 for a bad request, 401 for a wrong password or a
// missing or unknown token, and 503 when FAIL_RATE (below) decides that the server is "down".
import { http, HttpResponse } from 'msw'
import { errorResponse, networkDelay } from './helpers.js'

// The share of requests that fail with 503 Service Unavailable: 0 = none, 1 = all of them.
// Set it to 1 for a while to see how your app copes when the server is down.
const FAIL_RATE = 0

const DB_KEY = 'book-library-server'

function readDb() {
  try {
    const saved = JSON.parse(localStorage.getItem(DB_KEY))
    if (saved && saved.users && saved.sessions) return saved
  } catch {
    // a broken database: start a new one
  }
  return { users: {}, sessions: {} }
}

function writeDb(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    // storage is full or blocked: the change is lost, as with a broken disk
  }
}

const serverDown = () => Math.random() < FAIL_RATE
const unavailable = () => errorResponse(503, 'unavailable', 'The server is not available right now. Try again later.')

// The user whose token the request brings in its Authorization header, or null.
function userOf(request, db) {
  const match = /^Bearer\s+(\S+)$/.exec(request.headers.get('Authorization') ?? '')
  const key = match ? db.sessions[match[1]] : undefined
  return key ? db.users[key] : null
}

async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export const accountHandlers = [
  http.post('/api/login', async ({ request }) => {
    await networkDelay(300, 800)
    if (serverDown()) return unavailable()
    const body = await readJson(request)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    if (!name || !password) {
      return errorResponse(400, 'bad_request', 'Send the name and the password as JSON: { "name": "…", "password": "…" }')
    }

    const db = readDb()
    const key = name.toLowerCase() // "Anna" and "anna" are the same account
    const created = !db.users[key]
    // A real server never stores the password itself, only a hash of it. This one is only for practice.
    if (created) db.users[key] = { name, password, books: null }
    else if (db.users[key].password !== password) return errorResponse(401, 'unauthorized', 'Wrong name or password.')

    const token = crypto.randomUUID()
    db.sessions[token] = key
    writeDb(db)
    return HttpResponse.json({ name: db.users[key].name, token, created }, { status: created ? 201 : 200 })
  }),

  http.get('/api/shelves', async ({ request }) => {
    await networkDelay(250, 700)
    if (serverDown()) return unavailable()
    const user = userOf(request, readDb())
    if (!user) return errorResponse(401, 'unauthorized', 'Log in first: send your token in the Authorization header.')
    return HttpResponse.json({ books: user.books })
  }),

  http.put('/api/shelves', async ({ request }) => {
    const body = await readJson(request)
    const db = readDb()
    const user = userOf(request, db)
    let answer
    if (serverDown()) answer = unavailable()
    else if (!user) answer = errorResponse(401, 'unauthorized', 'Log in first: send your token in the Authorization header.')
    else if (!Array.isArray(body?.books)) answer = errorResponse(400, 'bad_request', 'Send the shelves as JSON: { "books": [ … ] }')
    else {
      // Stored as soon as it arrives (the wait comes after), so quick saves are kept in the order they were sent.
      user.books = body.books
      writeDb(db)
      answer = HttpResponse.json({ savedAt: new Date().toISOString() })
    }
    await networkDelay(250, 700)
    return answer
  }),
]
