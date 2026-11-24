// A pretend back end: it plays the blog's server and its database, inside the browser.
//
// A real blog keeps its posts on a server, in a database, and the page asks the server for them over the internet.
// This course uses no outside services, so this file plays the server inside the browser:
//   - every request takes a little time, like a real one over the internet,
//   - with failRate, some requests fail on purpose, so you can see what your app does then,
//   - its "database" is one localStorage key, so what it saved is still there after a reload,
//     and every tab of the app talks to the same "server".
//
// How to use it:
//   const api = createMockApi('my-blog', { seed: { posts: [...] }, latency: [300, 800], failRate: 0 })
//   const posts = await api.list('posts')
//
// The database is made of collections (like the tables of a real database): arrays of items with an id.
// Every method returns a Promise, so use it with await, inside try/catch:
//   list(collection)                 every item of a collection (an array)
//   list(collection, filter)         only the items for which filter(item) is true
//   get(collection, id)              one item; fails with status 404 if there is no such item
//   create(collection, data)         saves a new item with an id and a createdAt date, and returns it
//   update(collection, id, changes)  changes some fields of an item, adds an updatedAt date, and returns it
//   remove(collection, id)           deletes an item
//   reset()                          forgets every change and starts again from the seed (not a Promise)
// A failed request throws an Error with a status field (503: the server did not answer, 404: no such item).
//
// To start again from the sample data by hand: DevTools (F12) → Application → Local storage →
// delete the "fake-api:…" key, then reload the page.

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
 * @param {string} name    the name of the database (part of its localStorage key)
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
    // The answer is a copy: changing it in the app never changes the "database" by accident.
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

// A real-time channel between the browser tabs of the same site (BroadcastChannel): what one tab sends,
// the others receive at once. This lesson does not need it; the chat lessons use it.
//   const channel = createChannel('news', (message) => console.log('from another tab:', message))
//   channel.send({ text: 'Hello!' })
//   channel.close()
export function createChannel(name, onMessage) {
  const channel = new BroadcastChannel(`fake-api:${name}`)
  channel.onmessage = (event) => onMessage(event.data)
  return {
    send: (message) => channel.postMessage(message),
    close: () => channel.close(),
  }
}
