import { useCallback, useEffect, useRef, useState } from 'react'
import { createChannel } from '@shared/mock-api/index.js'
import * as store from './chatStore.js'

const HEARTBEAT_MS = 4000 // "I am still here" every 4 seconds
const OFFLINE_AFTER_MS = 11000 // no heartbeat for 11 seconds = gone
const TYPING_MS = 3500 // a typing signal is shown this long
const TYPING_THROTTLE_MS = 1500 // send at most one typing signal per 1.5 s

const without = (map, key) => {
  if (!(key in map)) return map
  const next = { ...map }
  delete next[key]
  return next
}

// Returns the same object when nothing expired, so React can skip the re-render.
const prune = (map, keep) => {
  const entries = Object.entries(map)
  const kept = entries.filter(([, value]) => keep(value))
  return kept.length === entries.length ? map : Object.fromEntries(kept)
}

// Everything real-time in one custom hook. The BroadcastChannel plays the role a WebSocket
// (or Socket.io / Supabase Realtime) connection would have in a real app.
export function useChat(user) {
  const [tabId] = useState(() => crypto.randomUUID()) // one id per open tab
  const [messages, setMessages] = useState(store.loadMessages)
  const [channels, setChannels] = useState(store.loadChannels)
  const [peers, setPeers] = useState({}) // tabId → { user, lastSeen }
  const [typing, setTyping] = useState({}) // tabId → { user, channel, until }
  const connection = useRef(null)
  const lastTypingSent = useRef(0)

  // Connect: listen to the other tabs, announce ourselves, then send a heartbeat regularly.
  // The cleanup says goodbye and closes the channel (StrictMode runs this twice in development).
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return // very old browsers: local-only chat
    const seen = (id, name) => setPeers((p) => ({ ...p, [id]: { user: name, lastSeen: Date.now() } }))

    const channel = createChannel('chat', (event) => {
      switch (event.type) {
        case 'message':
          setMessages((list) => (list.some((m) => m.id === event.message.id) ? list : [...list, event.message]))
          setTyping((t) => without(t, event.tabId))
          seen(event.tabId, event.message.user)
          break
        case 'typing':
          setTyping((t) =>
            event.stop ? without(t, event.tabId) : { ...t, [event.tabId]: { user: event.user, channel: event.channel, until: Date.now() + TYPING_MS } },
          )
          break
        case 'hello':
          // A new tab joined: answer right away, so it does not wait for our next heartbeat.
          seen(event.tabId, event.user)
          channel.send({ type: 'presence', tabId, user })
          break
        case 'presence':
          seen(event.tabId, event.user)
          break
        case 'leave':
          setPeers((p) => without(p, event.tabId))
          setTyping((t) => without(t, event.tabId))
          break
        case 'channel':
          setChannels((list) => (list.includes(event.name) ? list : [...list, event.name]))
          break
        case 'reset':
          setMessages(store.loadMessages())
          setChannels(store.loadChannels())
          break
        default:
      }
    })
    connection.current = channel

    channel.send({ type: 'hello', tabId, user })
    const heartbeat = setInterval(() => channel.send({ type: 'presence', tabId, user }), HEARTBEAT_MS)
    const leave = () => channel.send({ type: 'leave', tabId })
    window.addEventListener('pagehide', leave)

    return () => {
      clearInterval(heartbeat)
      window.removeEventListener('pagehide', leave)
      leave()
      channel.close()
      connection.current = null
    }
  }, [tabId, user])

  // Forget tabs that stopped sending heartbeats (closed without saying goodbye) and old typing signals.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      setPeers((p) => prune(p, (peer) => now - peer.lastSeen < OFFLINE_AFTER_MS))
      setTyping((t) => prune(t, (entry) => entry.until > now))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const send = useCallback(
    (channelName, text) => {
      const message = { id: crypto.randomUUID(), channel: channelName, user, text, at: Date.now() }
      setMessages((list) => [...list, message])
      store.appendMessage(message)
      connection.current?.send({ type: 'message', message, tabId })
      lastTypingSent.current = 0
    },
    [user, tabId],
  )

  const notifyTyping = useCallback(
    (channelName) => {
      const now = Date.now()
      if (now - lastTypingSent.current < TYPING_THROTTLE_MS) return
      lastTypingSent.current = now
      connection.current?.send({ type: 'typing', tabId, user, channel: channelName })
    },
    [tabId, user],
  )

  const stopTyping = useCallback(() => {
    if (!lastTypingSent.current) return
    lastTypingSent.current = 0
    connection.current?.send({ type: 'typing', tabId, stop: true })
  }, [tabId])

  const addChannel = useCallback((name) => {
    store.addChannel(name)
    setChannels((list) => (list.includes(name) ? list : [...list, name]))
    connection.current?.send({ type: 'channel', name })
  }, [])

  const resetHistory = useCallback(() => {
    store.clearHistory()
    setMessages(store.loadMessages())
    setChannels(store.loadChannels())
    connection.current?.send({ type: 'reset' })
  }, [])

  // Everyone online: this tab plus every tab with a fresh heartbeat (same name in two tabs counts once).
  const online = [...new Set([user, ...Object.values(peers).map((p) => p.user)])]
  const typingIn = (channelName) => [
    ...new Set(Object.values(typing).filter((t) => t.channel === channelName && t.user !== user).map((t) => t.user)),
  ]

  return { messages, channels, online, typingIn, send, notifyTyping, stopTyping, addChannel, resetHistory, tabCount: Object.keys(peers).length + 1 }
}
