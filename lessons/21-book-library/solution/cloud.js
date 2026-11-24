// The account service of the lesson's pretend server (mocks/accounts.js): logging in, loading and saving the shelves.

// One request to the server. Gives back the JSON answer, or throws an error that carries the status code.
async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.message ?? `HTTP ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}

// The first login with a new name creates the account. The answer: { name, token, created }.
export function logIn(name, password) {
  return request('/login', { method: 'POST', body: { name, password } })
}

// The books saved in the account (null if nothing has been saved in it yet).
export async function loadShelves(token) {
  const data = await request('/shelves', { token })
  return data?.books ?? null
}

// Saves the whole list in the account.
export function saveShelves(token, books) {
  return request('/shelves', { method: 'PUT', token, body: { books } })
}
