// A pretend server for the advanced level of the guide: logging in, loading and saving tasks.
//
// A real app would send these requests over the internet to a server that keeps every user's data
// in a database. This file only pretends: its "database" is a single entry in this browser's
// localStorage. But it behaves like a server: every answer takes a moment to arrive, requests are
// handled one by one, and now and then the server does not answer at all, so you can practise
// showing loading and error states.
//
// Do not use a real password here: this pretend server keeps passwords as plain text.
// (A real server never does that; it stores only a "hash" of the password.)

const DATABASE_KEY = 'todo-fake-server'
const FAIL_RATE = 0.15 // the share of requests that fail: 0 = never, 1 = always
const DELAY = [300, 800] // how long an answer takes, in milliseconds (shortest, longest)

function readDatabase() {
  try {
    const saved = localStorage.getItem(DATABASE_KEY)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // Blocked or broken storage: start with an empty database.
  }
  return { users: {} }
}

function writeDatabase(database) {
  try {
    localStorage.setItem(DATABASE_KEY, JSON.stringify(database))
  } catch {
    // Full or blocked storage: this change is lost, like on a broken server.
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// An error with an HTTP status code, the way a real server reports problems:
// 400 = something is missing from the request, 401 = wrong password or unknown user,
// 503 = the server is not available right now.
function serverError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

// Requests wait in line and are handled one at a time, in the order they arrived,
// so a later save can never be overtaken by an earlier one.
let queue = Promise.resolve()

function request(work) {
  const answer = queue.then(async () => {
    const [shortest, longest] = DELAY
    await wait(shortest + Math.random() * (longest - shortest))
    if (Math.random() < FAIL_RATE) throw serverError(503, 'The server is not responding.')
    return work(readDatabase())
  })
  queue = answer.catch(() => {}) // a failed request does not hold up the ones behind it
  return answer
}

// Logs in with a name and a password. The first login with a new name creates the account.
// Answers { name }, or fails with status 401 if the password is wrong.
export function logIn(name, password) {
  return request((database) => {
    if (!name || !password) throw serverError(400, 'A name and a password are needed.')
    const account = database.users[name]
    if (!account) {
      database.users[name] = { password, todos: [] }
      writeDatabase(database)
    } else if (account.password !== password) {
      throw serverError(401, 'Wrong password.')
    }
    return { name }
  })
}

// Answers the user's tasks: an array, empty for a new account.
export function fetchTodos(name) {
  return request((database) => {
    const account = database.users[name]
    if (!account) throw serverError(401, 'Unknown user. Please log in again.')
    return account.todos
  })
}

// Replaces the user's tasks with the array it gets. Answers { ok: true }.
export function saveTodos(name, todos) {
  return request((database) => {
    const account = database.users[name]
    if (!account) throw serverError(401, 'Unknown user. Please log in again.')
    account.todos = todos
    writeDatabase(database)
    return { ok: true }
  })
}
