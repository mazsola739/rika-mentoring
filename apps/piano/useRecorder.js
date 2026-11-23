import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const KEY = 'rika:piano:take'

function loadTake() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved && Array.isArray(saved.events) && Number.isFinite(saved.duration)) return saved
  } catch {
    // no saved take
  }
  return null
}

function saveTake(take) {
  try {
    if (take) localStorage.setItem(KEY, JSON.stringify(take))
    else localStorage.removeItem(KEY)
  } catch {
    // storage blocked: the take lasts for this visit
  }
}

// Records note on/off events with their time, and plays them back with setTimeout.
// `playEvent(type, midi)` is called during playback; a ref always holds the latest version of it.
export function useRecorder(playEvent) {
  const [recording, setRecording] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [count, setCount] = useState(0)
  const [take, setTake] = useState(loadTake)
  const recRef = useRef(null) // { start, events } while recording
  const timersRef = useRef([])
  const heldRef = useRef(new Set()) // notes switched on by the playback
  const playRef = useRef(playEvent)

  useLayoutEffect(() => {
    playRef.current = playEvent
  })

  const log = (type, midi) => {
    const rec = recRef.current
    if (!rec) return
    rec.events.push({ t: Math.round(performance.now() - rec.start), type, midi })
    if (type === 'on') setCount((c) => c + 1)
  }

  const stopPlayback = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    heldRef.current.forEach((midi) => playRef.current('off', midi))
    heldRef.current.clear()
    setPlaying(false)
  }

  const startRecording = () => {
    stopPlayback()
    recRef.current = { start: performance.now(), events: [] }
    setCount(0)
    setRecording(true)
  }

  const stopRecording = () => {
    const rec = recRef.current
    recRef.current = null
    setRecording(false)
    if (!rec || rec.events.length === 0) return
    // Notes still held at the end get an "off" event; the silence before the first note is cut.
    const end = Math.round(performance.now() - rec.start)
    const open = new Set()
    rec.events.forEach((e) => (e.type === 'on' ? open.add(e.midi) : open.delete(e.midi)))
    const events = [...rec.events, ...[...open].map((midi) => ({ t: end, type: 'off', midi }))]
    const offset = events[0].t
    const next = { events: events.map((e) => ({ ...e, t: e.t - offset })), duration: end - offset }
    setTake(next)
    saveTake(next)
  }

  const play = () => {
    if (!take) return
    stopPlayback()
    setPlaying(true)
    timersRef.current = take.events.map((e) =>
      setTimeout(() => {
        if (e.type === 'on') heldRef.current.add(e.midi)
        else heldRef.current.delete(e.midi)
        playRef.current(e.type, e.midi)
      }, e.t),
    )
    timersRef.current.push(setTimeout(() => setPlaying(false), take.duration + 60))
  }

  const clear = () => {
    stopPlayback()
    setTake(null)
    saveTake(null)
  }

  // Unmount: no timer may fire after the component is gone.
  useEffect(() => {
    const timers = timersRef
    return () => timers.current.forEach(clearTimeout)
  }, [])

  const notes = take ? take.events.filter((e) => e.type === 'on').length : 0
  return { recording, playing, count, take, notes, log, startRecording, stopRecording, play, stopPlayback, clear }
}
