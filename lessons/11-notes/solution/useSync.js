import { useEffect, useRef, useState } from 'react'
import { getNotes, saveNotes } from './fakeApi.js'
import { useLocalStorage } from './useLocalStorage.js'
import { useOnline } from './useOnline.js'

// Two lists become one: of every note, the version changed later wins ("last write wins").
// Tombstones ({ deleted: true }) take part like any other note, so a deletion spreads to every device.
function mergeNotes(local, remote) {
  const newest = {}
  for (const note of [...remote, ...local]) {
    const seen = newest[note.id]
    if (!seen || note.updatedAt > seen.updatedAt) newest[note.id] = note
  }
  return Object.values(newest)
}

export function useSync(notes, setNotes) {
  const online = useOnline()
  const [status, setStatus] = useState('idle') // 'idle', 'syncing' or 'error'
  const [lastSync, setLastSync] = useLocalStorage('rika:notes:last-sync', 0)
  // The freshest notes for a sync that starts from an effect, and a guard so two syncs never overlap.
  const latest = useRef(notes)
  const running = useRef(false)

  useEffect(() => {
    latest.current = notes
  }, [notes])

  // Derived value: how many notes changed since the last successful sync started?
  const pending = notes.filter((note) => note.updatedAt > lastSync).length

  async function sync() {
    if (running.current) return
    running.current = true
    // Our side of the sync is the list as it is right now: whatever changes after `startedAt` waits for the next one.
    const startedAt = Date.now()
    const local = latest.current
    setStatus('syncing')
    try {
      const serverNotes = await getNotes()
      const merged = mergeNotes(local, serverNotes)
      await saveNotes(merged)
      // The user may have typed during the two requests: merge into the freshest state instead of overwriting it.
      setNotes((current) => mergeNotes(current, merged))
      setLastSync(startedAt)
      setStatus('idle')
    } catch {
      setStatus('error')
    } finally {
      running.current = false
    }
  }

  // At startup, and whenever the connection comes back: sync by itself.
  useEffect(() => {
    if (online) sync()
    // sync is a new function on every render; only a change of `online` should start one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online])

  return { online, status, pending, lastSync, sync }
}
