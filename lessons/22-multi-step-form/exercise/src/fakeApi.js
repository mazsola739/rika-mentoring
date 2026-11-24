// A pretend back end for the advanced level ("submission to an API"). You do not need it before that.
//
// A real sign-up form sends its data to a server, which saves the new account in a database and answers.
// This course uses no outside services, so this file plays the server inside the browser:
//   - every request takes a little time, like a real one over the internet,
//   - with failRate, some requests fail on purpose, so you can see what your app does then,
//   - its "database" is one localStorage key, so what it saved is still there after a reload.
//
// How to use it:
//   const api = createMockApi('code-club', { latency: [700, 1400], failRate: 0.25 })
//   const account = await api.create('accounts', { email: 'ada@example.com' })
//
// Every method returns a Promise, so use it with await, inside try/catch:
//   list(collection)                 every item of a collection (an array)
//   get(collection, id)              one item; fails with status 404 if there is no such item
//   create(collection, data)         saves a new item with an id and a createdAt date, and returns it
//   update(collection, id, changes)  changes some fields of an item, and returns it
//   remove(collection, id)           deletes an item
//   reset()                          forgets everything and starts again from the seed
// A failed request throws an Error with a status field (503: the server did not answer, 404: no such item).

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const copy = (value) => (value === undefined ? value : structuredClone(value))

// crypto.randomUUID works on localhost and https:// pages; elsewhere a simpler random id will do.
const newId = () =>
  crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)

function apiError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

/**
 * @param {string} name   the name of the database (part of its localStorage key)
 * @param {object} options { seed: starting data for each collection, latency: [min, max] in ms, failRate: 0–1 }
 */
export function createMockApi(name, { seed = {}, latency = [250, 700], failRate = 0 } = {}) {
  const key = `fake-api:${name}`

  const load = () => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : copy(seed)
    } catch {
      return copy(seed)
    }
  }

  let db = load()

  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(db))
    } catch {
      // storage full or blocked (private mode): the data lives on in memory until a reload
    }
  }

  const collection = (c) => (db[c] ??= [])

  // Every request goes through here: a short wait, sometimes a failure, then the work.
  async function request(work) {
    const [min, max] = latency
    await wait(min + Math.random() * (max - min))
    if (Math.random() < failRate) throw apiError('The server is not responding. Please try again.', 503)
    return copy(work())
  }

  const find = (c, id) => {
    const item = collection(c).find((x) => x.id === id)
    if (!item) throw apiError('Item not found (404).', 404)
    return item
  }

  return {
    list: (c, filter) => request(() => (filter ? collection(c).filter(filter) : collection(c))),
    get: (c, id) => request(() => find(c, id)),
    create: (c, data) =>
      request(() => {
        const item = { id: newId(), createdAt: new Date().toISOString(), ...data }
        collection(c).push(item)
        save()
        return item
      }),
    update: (c, id, changes) =>
      request(() => {
        const item = find(c, id)
        Object.assign(item, changes, { updatedAt: new Date().toISOString() })
        save()
        return item
      }),
    remove: (c, id) =>
      request(() => {
        find(c, id)
        db[c] = collection(c).filter((x) => x.id !== id)
        save()
        return { ok: true }
      }),
    reset: () => {
      db = copy(seed)
      save()
    },
  }
}
