import { createMockApi, MockApiError } from '@shared/mock-api/index.js'
import { seedTodos } from './todos.js'

// A pretend server with a tiny database: one record per account, with its name, password and task list.
// createMockApi keeps the data in this browser's localStorage, but behaves like a real back end:
// every answer takes a moment, and now and then a request fails (status 503).
const api = createMockApi('todo-accounts', { latency: [300, 800], failRate: 0.1 })

// Requests are handled one at a time, in the order they were sent,
// so an older save can never land after (and overwrite) a newer one.
let queue = Promise.resolve()
function inOrder(work) {
  const answer = queue.then(work)
  queue = answer.catch(() => {}) // a failed request does not hold up the ones behind it
  return answer
}

// Logs in with a name and a password. The first login with a new name creates the account,
// with a few sample tasks. Answers { id, name }, or fails with status 401 if the password is wrong.
export function logIn(name, password) {
  return inOrder(async () => {
    const [account] = await api.list('accounts', (item) => item.name === name)
    if (!account) {
      const created = await api.create('accounts', { name, password, todos: seedTodos() })
      return { id: created.id, name }
    }
    if (account.password !== password) throw new MockApiError('Wrong password', 401)
    return { id: account.id, name: account.name }
  })
}

// Answers the account's tasks. Fails with status 404 if there is no such account (any more).
export function fetchTodos(accountId) {
  return inOrder(async () => (await api.get('accounts', accountId)).todos)
}

// Replaces the account's tasks with the array it gets.
export function saveTodos(accountId, todos) {
  return inOrder(() => api.update('accounts', accountId, { todos }))
}
