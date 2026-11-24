import { useCallback, useEffect, useRef, useState } from 'react'
import { useStoredState } from './useStoredState.js'
import { renderDemoTracks } from './demoTracks.js'

const AUDIO_EXT = /\.(mp3|wav|ogg|oga|opus|m4a|aac|flac|webm)$/i
const REPEAT_MODES = ['off', 'all', 'one']

const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Reads only the metadata of a file to learn its length; null if the browser cannot decode it.
function probeDuration(url) {
  return new Promise((resolve) => {
    const probe = new Audio()
    probe.preload = 'metadata'
    probe.onloadedmetadata = () => {
      resolve(Number.isFinite(probe.duration) ? probe.duration : 0)
      probe.removeAttribute('src')
    }
    probe.onerror = () => resolve(null)
    probe.src = url
  })
}

// All player logic: one <audio> element (via ref), the playlist, and a Web Audio graph
// (element → analyser → gain → speakers) that feeds the visualizer.
export const usePlayer = () => {
  const audioRef = useRef(null)
  const graphRef = useRef(null) // { ctx, analyser, gain } after the first play
  const currentRef = useRef(null) // id of the loaded track, readable inside event handlers right away
  const historyRef = useRef([]) // played ids, so "previous" works in shuffle mode too
  const tracksRef = useRef([])

  const [tracks, setTracks] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [demoState, setDemoState] = useState('loading') // 'loading' | 'ready' | 'error'
  const [notice, setNotice] = useState(null) // { type, ... } – shown in the playlist footer
  const [volume, setVolume] = useStoredState('rika:winamp:volume', 0.8)
  const [shuffle, setShuffle] = useStoredState('rika:winamp:shuffle', false)
  const [repeat, setRepeat] = useStoredState('rika:winamp:repeat', 'off')

  useEffect(() => {
    tracksRef.current = tracks
  }, [tracks])

  // Stable function (same identity every render), so the visualizer effect does not restart.
  const getAnalyser = useCallback(() => graphRef.current?.analyser ?? null, [])

  // Generate the demo songs once. The cleanup revokes their object URLs (and ignores a
  // result that arrives after unmount – StrictMode runs this effect twice in development).
  useEffect(() => {
    let cancelled = false
    const urls = []
    renderDemoTracks()
      .then((songs) => {
        if (cancelled) return
        const demos = songs.map((song) => {
          const url = URL.createObjectURL(song.blob)
          urls.push(url)
          return {
            id: uid(),
            title: song.title,
            url,
            duration: song.duration,
            kind: 'demo',
            format: `${song.sampleRate / 1000} kHz · mono`,
          }
        })
        setTracks((list) => [...demos, ...list])
        setDemoState('ready')
      })
      .catch(() => !cancelled && setDemoState('error'))
    return () => {
      cancelled = true
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  // On unmount: stop playback, close the AudioContext, free the uploaded files.
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      audio?.pause()
      graphRef.current?.ctx.close()
      graphRef.current = null
      tracksRef.current.filter((t) => t.kind === 'file').forEach((t) => URL.revokeObjectURL(t.url))
    }
  }, [])

  // Volume goes through the gain node once the graph exists, otherwise through the element.
  useEffect(() => {
    const graph = graphRef.current
    if (graph) graph.gain.gain.setTargetAtTime(volume * volume, graph.ctx.currentTime, 0.02)
    else if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // Must run inside a click handler: browsers only start an AudioContext after a user gesture.
  function ensureGraph() {
    if (graphRef.current) {
      if (graphRef.current.ctx.state === 'suspended') graphRef.current.ctx.resume()
      return
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      if (ctx.state === 'suspended') ctx.resume()
      const source = ctx.createMediaElementSource(audioRef.current)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.72
      const gain = ctx.createGain()
      gain.gain.value = volume * volume
      source.connect(analyser).connect(gain).connect(ctx.destination)
      audioRef.current.volume = 1
      graphRef.current = { ctx, analyser, gain }
    } catch {
      graphRef.current = null // no visualizer, but playback still works
    }
  }

  const find = (id) => tracksRef.current.find((t) => t.id === id)

  function load(track) {
    const audio = audioRef.current
    audio.src = track.url
    currentRef.current = track.id
    setCurrentId(track.id)
    setTime(0)
    setDuration(track.duration || 0)
    setNotice(null)
  }

  function playTrack(track) {
    if (!track) return
    ensureGraph()
    if (currentRef.current !== track.id) load(track)
    audioRef.current.play().catch((err) => {
      if (err.name !== 'AbortError') setNotice({ type: 'cannotPlay', title: track.title })
    })
  }

  function play() {
    const current = find(currentRef.current)
    if (current) playTrack(current)
    else playTrack(shuffle ? pick(tracksRef.current) : tracksRef.current[0])
  }

  function pause() {
    const audio = audioRef.current
    if (!currentRef.current) return
    // Like the classic players: pause again resumes.
    if (audio.paused) play()
    else audio.pause()
  }

  function stop() {
    const audio = audioRef.current
    audio.pause()
    if (currentRef.current) audio.currentTime = 0
    setTime(0)
  }

  function next(auto = false) {
    const list = tracksRef.current
    if (!list.length) return
    const audio = audioRef.current
    const index = list.findIndex((t) => t.id === currentRef.current)
    if (auto && repeat === 'one' && index >= 0) {
      audio.currentTime = 0
      audio.play().catch(() => {})
      return
    }
    let target
    if (shuffle && list.length > 1) {
      target = pick(list.filter((t) => t.id !== currentRef.current))
    } else if (index + 1 < list.length) {
      target = list[index + 1]
    } else if (auto && repeat === 'off') {
      stop()
      return
    } else {
      target = list[0]
    }
    if (currentRef.current) historyRef.current.push(currentRef.current)
    playTrack(target)
  }

  function prev() {
    const list = tracksRef.current
    const audio = audioRef.current
    if (!list.length) return
    if (audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    if (shuffle) {
      while (historyRef.current.length) {
        const previous = find(historyRef.current.pop())
        if (previous) return playTrack(previous)
      }
    }
    const index = list.findIndex((t) => t.id === currentRef.current)
    playTrack(list[(index - 1 + list.length) % list.length])
  }

  function seek(seconds) {
    const audio = audioRef.current
    if (!currentRef.current || !Number.isFinite(audio.duration)) return
    audio.currentTime = seconds
    setTime(seconds)
  }

  function addFiles(fileList) {
    const all = [...fileList]
    const files = all.filter((f) => f.type.startsWith('audio/') || AUDIO_EXT.test(f.name))
    const added = files.map((file) => ({
      id: uid(),
      title: file.name.replace(/\.[^.]+$/, ''),
      url: URL.createObjectURL(file),
      duration: 0,
      kind: 'file',
      format: (file.name.match(/\.([^.]+)$/)?.[1] ?? 'audio').toUpperCase(),
    }))
    setTracks((list) => [...list, ...added])
    setNotice({ type: 'added', count: added.length, skipped: all.length - files.length })
    added.forEach((track) =>
      probeDuration(track.url).then((seconds) =>
        setTracks((list) => list.map((t) => (t.id === track.id ? { ...t, duration: seconds ?? 0, broken: seconds === null } : t))),
      ),
    )
  }

  function remove(id) {
    const track = find(id)
    if (!track) return
    if (id === currentRef.current) {
      const audio = audioRef.current
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      currentRef.current = null
      setCurrentId(null)
      setTime(0)
      setDuration(0)
    }
    URL.revokeObjectURL(track.url)
    historyRef.current = historyRef.current.filter((x) => x !== id)
    setTracks((list) => list.filter((t) => t.id !== id))
  }

  // Props for the <audio> element: its events keep React state in sync.
  const audioProps = {
    ref: audioRef,
    preload: 'metadata',
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onTimeUpdate: (e) => setTime(e.currentTarget.currentTime),
    onDurationChange: (e) => {
      const d = e.currentTarget.duration
      if (Number.isFinite(d)) setDuration(d)
    },
    onEnded: () => next(true),
    onError: () => {
      if (!currentRef.current) return
      setPlaying(false)
      const track = find(currentRef.current)
      setNotice({ type: 'cannotPlay', title: track?.title ?? '' })
      setTracks((list) => list.map((t) => (t.id === currentRef.current ? { ...t, broken: true } : t)))
    },
  }

  return {
    audioProps,
    tracks,
    current: tracks.find((t) => t.id === currentId) ?? null,
    currentIndex: tracks.findIndex((t) => t.id === currentId),
    playing,
    time,
    duration,
    volume,
    shuffle,
    repeat,
    demoState,
    notice,
    getAnalyser,
    play,
    pause,
    stop,
    next: () => next(false),
    prev,
    seek,
    setVolume,
    toggleShuffle: () => setShuffle((s) => !s),
    cycleRepeat: () => setRepeat((r) => REPEAT_MODES[(REPEAT_MODES.indexOf(r) + 1) % REPEAT_MODES.length]),
    playTrack,
    addFiles,
    remove,
  }
}
