import { useCallback, useEffect, useRef, useState } from 'react'
import { createChannel } from '@shared/mock-api/index.js'

// Every open window gets its own random id, for example 'k3j9x2ab'.
const MY_ID = Math.random().toString(36).slice(2, 10)

function without(map, key) {
  if (!(key in map)) return map
  const next = { ...map }
  delete next[key]
  return next
}

// A race between browser windows over a BroadcastChannel: every window tells the others how far it has got.
// A new window says hello and the others answer with their latest state; a closing window says goodbye.
export function useRace() {
  const [rivals, setRivals] = useState({}) // id → { id, name, progress, wpm, finished }
  const channelRef = useRef(null)
  const lastRef = useRef(null) // our latest update, sent again when a new window joins

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const channel = createChannel('typing-test-race', (message) => {
      if (!message || message.id === MY_ID) return
      if (message.type === 'hello' && lastRef.current) channel.send({ type: 'update', id: MY_ID, ...lastRef.current })
      if (message.type === 'update') setRivals((current) => ({ ...current, [message.id]: message }))
      if (message.type === 'leave') setRivals((current) => without(current, message.id))
    })
    channelRef.current = channel
    channel.send({ type: 'hello', id: MY_ID })
    if (lastRef.current) channel.send({ type: 'update', id: MY_ID, ...lastRef.current })

    const leave = () => channel.send({ type: 'leave', id: MY_ID })
    window.addEventListener('pagehide', leave)
    // Cleanup (also on StrictMode's test unmount): say goodbye and close the channel.
    return () => {
      window.removeEventListener('pagehide', leave)
      leave()
      channel.close()
      channelRef.current = null
    }
  }, [])

  // Stable, because it is a dependency of TypingRun's effect.
  const send = useCallback((update) => {
    lastRef.current = update
    channelRef.current?.send({ type: 'update', id: MY_ID, ...update })
  }, [])

  return { rivals: Object.values(rivals), send }
}
