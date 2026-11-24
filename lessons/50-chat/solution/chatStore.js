// History and channels live in localStorage, shared by every tab of this browser.
// Each tab only *appends* its own messages (read, add, write), so tabs never overwrite each other.

const MESSAGES_KEY = 'rika:chat:messages'
const CHANNELS_KEY = 'rika:chat:channels'
const PER_CHANNEL = 150 // keep the history small

export const DEFAULT_CHANNELS = ['general', 'react', 'random']
export const BOT = 'Rika bot'

const minutesAgo = (m) => Date.now() - m * 60_000

const SEED = [
  {
    id: 'seed-1',
    channel: 'general',
    user: BOT,
    at: minutesAgo(90),
    text: {
      en: 'Welcome to the chat! Open this page in a second tab, pick another name there, and the two tabs can talk in real time.',
      hu: 'Üdv a chatben! Nyisd meg ezt az oldalt egy második lapon is, válassz ott másik nevet, és a két lap valós időben beszélgethet.',
    },
  },
  {
    id: 'seed-2',
    channel: 'general',
    user: BOT,
    at: minutesAgo(89),
    text: {
      en: 'Behind the scenes it is a BroadcastChannel: the browser passes messages between tabs, like a tiny WebSocket server would.',
      hu: 'A háttérben egy BroadcastChannel dolgozik: a böngésző adja át az üzeneteket a lapok között, ahogy egy kis WebSocket-szerver tenné.',
    },
  },
  {
    id: 'seed-3',
    channel: 'react',
    user: BOT,
    at: minutesAgo(60),
    text: {
      en: 'Question of the day: where should the message list live, in a component, in a custom hook or in Context?',
      hu: 'A nap kérdése: hol éljen az üzenetlista: egy komponensben, egy saját hookban vagy Contextben?',
    },
  },
  {
    id: 'seed-4',
    channel: 'random',
    user: BOT,
    at: minutesAgo(30),
    text: {
      en: 'Share your favourite lesson from the site here.',
      hu: 'Ide oszd meg a kedvenc leckédet az oldalról.',
    },
  },
]

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return value ?? fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or blocked: the chat still works in memory
  }
}

export const loadMessages = () => {
  const saved = read(MESSAGES_KEY, null)
  return Array.isArray(saved) ? saved : SEED
}

export function appendMessage(message) {
  const all = [...loadMessages(), message]
  // Trim each channel to its newest PER_CHANNEL messages.
  const counts = {}
  const trimmed = all
    .slice()
    .reverse()
    .filter((m) => (counts[m.channel] = (counts[m.channel] ?? 0) + 1) <= PER_CHANNEL)
    .reverse()
  write(MESSAGES_KEY, trimmed)
}

export const loadChannels = () => {
  const saved = read(CHANNELS_KEY, [])
  return [...DEFAULT_CHANNELS, ...saved.filter((c) => typeof c === 'string' && !DEFAULT_CHANNELS.includes(c))]
}

export function addChannel(name) {
  const custom = loadChannels().filter((c) => !DEFAULT_CHANNELS.includes(c))
  if (!custom.includes(name)) write(CHANNELS_KEY, [...custom, name])
}

export const clearHistory = () => {
  try {
    localStorage.removeItem(MESSAGES_KEY)
    localStorage.removeItem(CHANNELS_KEY)
  } catch {
    // ignore
  }
}
