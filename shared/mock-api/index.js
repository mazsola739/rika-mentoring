import { getLang } from '../i18n.js'

// „Kamu backend”: úgy viselkedik, mint egy REST szerver (késleltetés, hibák, azonosítók),
// de minden adat a böngésző localStorage-ében él – így a portfólió GitHub Pages-en is fut.

const ERRORS = {
  hu: { offline: 'A szerver most nem válaszol. Próbáld újra!', notFound: 'Nincs ilyen elem (404).' },
  en: { offline: 'The server is not responding. Please try again.', notFound: 'Item not found (404).' },
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = (value) => (value === undefined ? value : structuredClone(value))

export class MockApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'MockApiError'
    this.status = status
  }
}

/**
 * @param {string} name   az adatbázis neve (localStorage-kulcs része)
 * @param {object} opts   { seed: kezdőadatok gyűjteményenként, latency: [min, max] ms, failRate: 0–1 }
 */
export function createMockApi(name, { seed = {}, latency = [250, 700], failRate = 0 } = {}) {
  const key = `rika-mock:${name}`

  const load = () => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : clone(seed)
    } catch {
      return clone(seed)
    }
  }

  let db = load()

  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(db))
    } catch {
      // tele a tárhely vagy privát mód: memóriában tovább működik
    }
  }

  const collection = (c) => (db[c] ??= [])

  async function request(handler) {
    const [min, max] = latency
    await wait(min + Math.random() * (max - min))
    if (Math.random() < failRate) throw new MockApiError(ERRORS[getLang()].offline, 503)
    return clone(handler())
  }

  const find = (c, id) => {
    const item = collection(c).find((x) => x.id === id)
    if (!item) throw new MockApiError(ERRORS[getLang()].notFound, 404)
    return item
  }

  return {
    list: (c, filter) => request(() => (filter ? collection(c).filter(filter) : collection(c))),
    get: (c, id) => request(() => find(c, id)),
    create: (c, data) =>
      request(() => {
        const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data }
        collection(c).push(item)
        save()
        return item
      }),
    update: (c, id, patch) =>
      request(() => {
        const item = find(c, id)
        Object.assign(item, patch, { updatedAt: new Date().toISOString() })
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
      db = clone(seed)
      save()
    },
  }
}

// Valós idejű csatorna böngészőlapok között (pl. a chat leckéhez): két lap élőben „beszélget”.
export function createChannel(name, onMessage) {
  const channel = new BroadcastChannel(`rika:${name}`)
  channel.onmessage = (event) => onMessage(event.data)
  return {
    send: (message) => channel.postMessage(message),
    close: () => channel.close(),
  }
}
