import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { BASES, INSTRUMENTS, KEY_OFFSETS, LAST_NOTE, OCTAVE_DOWN, OCTAVE_UP, fallbackLabel, noteName } from './notes.js'
import { useSynth } from './useSynth.js'
import { useRecorder } from './useRecorder.js'
import PianoKeys from './PianoKeys.jsx'
import './app.css'

const TEXT = {
  en: {
    intro: 'Play with the mouse, a touch screen or your computer keyboard. The letters on the keys show which computer key plays which note.',
    sound: 'Sound',
    instruments: { piano: 'Soft piano', organ: 'Organ', synth: 'Synth', flute: 'Flute' },
    waves: { triangle: 'triangle wave', square: 'square wave', sawtooth: 'sawtooth wave', sine: 'sine wave' },
    volume: 'Volume',
    octave: 'Computer keys play',
    lower: 'Lower octave',
    higher: 'Higher octave',
    octaveHint: (down, up) => `${down} and ${up} switch the octave.`,
    keys: 'Piano keys',
    keyLabel: (note, key) => (key ? `${note}, key ${key}` : note),
    recorder: 'Recorder',
    record: 'Record',
    stopRecording: 'Stop recording',
    play: 'Play back',
    stop: 'Stop',
    clear: 'Delete take',
    recording: (n) => `Recording… ${n} ${n === 1 ? 'note' : 'notes'}`,
    take: (n, time) => `Saved take: ${n} ${n === 1 ? 'note' : 'notes'}, ${time}`,
    empty: 'Press Record, play a melody, stop, then play it back.',
    silence: 'Stop all sound',
    noAudio: 'This browser cannot play Web Audio sound.',
    tip: 'Sound starts with your first click or key press: browsers do not let a page make noise on its own.',
  },
  hu: {
    intro: 'Játssz egérrel, érintőképernyőn vagy a számítógép billentyűzetén. A billentyűkön lévő betűk mutatják, melyik gomb melyik hangot szólaltatja meg.',
    sound: 'Hangszín',
    instruments: { piano: 'Lágy zongora', organ: 'Orgona', synth: 'Szintetizátor', flute: 'Fuvola' },
    waves: { triangle: 'háromszögjel', square: 'négyszögjel', sawtooth: 'fűrészfogjel', sine: 'szinuszjel' },
    volume: 'Hangerő',
    octave: 'A gépi billentyűk hangjai',
    lower: 'Mélyebb oktáv',
    higher: 'Magasabb oktáv',
    octaveHint: (down, up) => `Oktávváltás: ${down} és ${up}.`,
    keys: 'Zongorabillentyűk',
    keyLabel: (note, key) => (key ? `${note}, ${key} billentyű` : note),
    recorder: 'Felvevő',
    record: 'Felvétel',
    stopRecording: 'Felvétel leállítása',
    play: 'Visszajátszás',
    stop: 'Leállítás',
    clear: 'Felvétel törlése',
    recording: (n) => `Felvétel folyamatban… ${n} hang`,
    take: (n, time) => `Mentett felvétel: ${n} hang, ${time}`,
    empty: 'Nyomd meg a Felvétel gombot, játssz egy dallamot, állítsd le, aztán játszd vissza.',
    silence: 'Minden hang leállítása',
    noAudio: 'Ez a böngésző nem tud Web Audio hangot lejátszani.',
    tip: 'A hang az első kattintással vagy billentyűleütéssel indul: a böngészők nem engedik, hogy egy oldal magától hangot adjon.',
  },
}

const SETTINGS_KEY = 'rika:piano:settings'
const TAP_MS = 320 // a key pressed with Enter/Space sounds this long

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY))
    return {
      instrument: INSTRUMENTS.some((i) => i.id === saved?.instrument) ? saved.instrument : 'piano',
      volume: Number.isFinite(saved?.volume) ? Math.min(100, Math.max(0, saved.volume)) : 70,
    }
  } catch {
    return { instrument: 'piano', volume: 70 }
  }
}

// The browser can tell what is printed on each physical key (Chromium only); otherwise we guess.
function useKeyboardLayout() {
  const [layout, setLayout] = useState(null)
  useEffect(() => {
    let cancelled = false
    try {
      navigator.keyboard
        ?.getLayoutMap?.()
        .then((map) => !cancelled && setLayout(map))
        .catch(() => {})
    } catch {
      // not allowed here (e.g. inside an iframe): keep the fallback labels
    }
    return () => {
      cancelled = true
    }
  }, [])
  return layout
}

function Piano() {
  const t = useText(TEXT)
  const lang = useLang()
  const [settings] = useState(loadSettings)
  const [instrumentId, setInstrumentId] = useState(settings.instrument)
  const [volume, setVolume] = useState(settings.volume)
  const [base, setBase] = useState(BASES[0])
  const [active, setActive] = useState(() => new Set())
  const layout = useKeyboardLayout()

  const instrument = INSTRUMENTS.find((i) => i.id === instrumentId)
  const synth = useSynth(instrument, volume)
  const heldKeysRef = useRef(new Map()) // KeyboardEvent.code → midi
  const pointersRef = useRef(new Map()) // pointerId → midi
  const tapTimersRef = useRef(new Set())

  // Playback uses the same note functions as live playing (but is not recorded again).
  const recorder = useRecorder((type, midi) => (type === 'on' ? sound(midi) : mute(midi)))

  function sound(midi) {
    if (!synth.noteOn(midi)) return false
    setActive((s) => new Set(s).add(midi))
    return true
  }

  function mute(midi) {
    synth.noteOff(midi)
    setActive((s) => {
      if (!s.has(midi)) return s
      const next = new Set(s)
      next.delete(midi)
      return next
    })
  }

  const press = (midi) => {
    if (sound(midi)) recorder.log('on', midi)
  }
  const release = (midi) => {
    mute(midi)
    recorder.log('off', midi)
  }

  const releaseEverything = () => {
    heldKeysRef.current.forEach(release)
    heldKeysRef.current.clear()
    pointersRef.current.forEach(release)
    pointersRef.current.clear()
    synth.stopAll()
    setActive(new Set())
  }

  const shiftOctave = (dir) => setBase((b) => BASES[Math.min(BASES.length - 1, Math.max(0, BASES.indexOf(b) + dir))])

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ instrument: instrumentId, volume }))
    } catch {
      // settings are optional
    }
  }, [instrumentId, volume])

  // Window-level listeners are attached once; the ref always calls the handlers of the latest render.
  const handlersRef = useRef(null)
  useLayoutEffect(() => {
    handlersRef.current = {
      keydown(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return
        const target = e.target instanceof Element ? e.target : null
        if (target?.closest('textarea, select, [contenteditable="true"], input:not([type="range"])')) return
        if (e.code === OCTAVE_DOWN || e.code === OCTAVE_UP) {
          e.preventDefault()
          if (!e.repeat) shiftOctave(e.code === OCTAVE_UP ? 1 : -1)
          return
        }
        const offset = KEY_OFFSETS[e.code]
        if (offset === undefined) return
        e.preventDefault()
        if (e.repeat || heldKeysRef.current.has(e.code)) return // holding a key must not retrigger it
        const midi = base + offset
        if (midi > LAST_NOTE) return
        heldKeysRef.current.set(e.code, midi) // remembered, in case the octave changes while held
        press(midi)
      },
      keyup(e) {
        const midi = heldKeysRef.current.get(e.code)
        if (midi === undefined) return
        heldKeysRef.current.delete(e.code)
        release(midi)
      },
      pointerup(e) {
        const midi = pointersRef.current.get(e.pointerId)
        if (midi === undefined) return
        pointersRef.current.delete(e.pointerId)
        release(midi)
      },
      // Switching tabs or windows would otherwise leave notes hanging.
      stopAll: releaseEverything,
    }
  })

  useEffect(() => {
    const call = (name) => (e) => handlersRef.current[name](e)
    const onKeyDown = call('keydown')
    const onKeyUp = call('keyup')
    const onPointerUp = call('pointerup')
    const onBlur = () => handlersRef.current.stopAll()
    const onVisibility = () => document.hidden && handlersRef.current.stopAll()
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    const taps = tapTimersRef.current
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
      taps.forEach(clearTimeout)
    }
  }, [])

  // Mouse and touch: pressing starts a note; sliding to another key (glissando) moves the note there.
  const keyHandlers = {
    down(e, midi) {
      if (e.button !== 0) return // left button, finger or pen only
      e.preventDefault()
      // Touch captures the pointer on the first key; releasing it lets the finger glide to other keys.
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
      const previous = pointersRef.current.get(e.pointerId)
      if (previous !== undefined) release(previous)
      pointersRef.current.set(e.pointerId, midi)
      press(midi)
    },
    enter(e, midi) {
      const previous = pointersRef.current.get(e.pointerId)
      if (previous === undefined || previous === midi) return
      release(previous)
      pointersRef.current.set(e.pointerId, midi)
      press(midi)
    },
    // Leaving the keyboard with the button still held ends the note.
    leave(e) {
      const previous = pointersRef.current.get(e.pointerId)
      if (previous === undefined) return
      pointersRef.current.delete(e.pointerId)
      release(previous)
    },
    // Enter or Space on a focused key plays a short note.
    tap(midi) {
      press(midi)
      const timer = setTimeout(() => {
        tapTimersRef.current.delete(timer)
        release(midi)
      }, TAP_MS)
      tapTimersRef.current.add(timer)
    },
  }

  // Which computer key plays a given note right now (for the labels on the keys).
  const keyFor = {}
  Object.entries(KEY_OFFSETS).forEach(([code, offset]) => {
    if (base + offset <= LAST_NOTE) keyFor[base + offset] = code
  })
  const labelOf = (code) => (layout?.get(code) ?? fallbackLabel(code, lang)).toUpperCase()
  const labelFor = (midi) => (keyFor[midi] ? labelOf(keyFor[midi]) : null)
  const topOfRange = Math.min(LAST_NOTE, base + Math.max(...Object.values(KEY_OFFSETS)))

  const seconds = recorder.take
    ? new Intl.NumberFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { style: 'unit', unit: 'second', unitDisplay: 'long', maximumFractionDigits: 1 }).format(
        recorder.take.duration / 1000,
      )
    : ''

  return (
    <div className="pn">
      <p className="pn__intro">{t.intro}</p>
      {!synth.supported && <p className="pn__warning">{t.noAudio}</p>}

      <div className="pn-controls">
        <div className="pn-control" role="group" aria-label={t.sound}>
          <span className="pn-control__label">{t.sound}</span>
          <div className="pn-control__chips">
            {INSTRUMENTS.map((ins) => (
              <button key={ins.id} type="button" className="chip" aria-pressed={ins.id === instrumentId} onClick={() => setInstrumentId(ins.id)}>
                {t.instruments[ins.id]}
              </button>
            ))}
          </div>
          <span className="pn-control__note">{t.waves[instrument.wave]}</span>
        </div>

        <label className="pn-control pn-control--volume">
          <span className="pn-control__label">
            {t.volume}: {volume}%
          </span>
          <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
        </label>

        <div className="pn-control">
          <span className="pn-control__label">{t.octave}</span>
          <div className="pn-octave-switch">
            <button type="button" className="btn btn--ghost" aria-label={t.lower} onClick={() => shiftOctave(-1)} disabled={base === BASES[0]}>
              −
            </button>
            <strong>
              {noteName(base, lang)} – {noteName(topOfRange, lang)}
            </strong>
            <button type="button" className="btn btn--ghost" aria-label={t.higher} onClick={() => shiftOctave(1)} disabled={base === BASES.at(-1)}>
              +
            </button>
          </div>
          <span className="pn-control__note">{t.octaveHint(labelOf(OCTAVE_DOWN), labelOf(OCTAVE_UP))}</span>
        </div>
      </div>

      <PianoKeys active={active} labelFor={labelFor} lang={lang} handlers={keyHandlers} t={t} />
      <p className="pn__tip">{t.tip}</p>

      <section className="pn-recorder" aria-label={t.recorder}>
        <div className="pn-recorder__buttons">
          {recorder.recording ? (
            <button type="button" className="btn pn-rec is-on" onClick={recorder.stopRecording}>
              <span className="pn-rec__dot" aria-hidden="true" /> {t.stopRecording}
            </button>
          ) : (
            <button type="button" className="btn pn-rec" onClick={recorder.startRecording}>
              <span className="pn-rec__dot" aria-hidden="true" /> {t.record}
            </button>
          )}
          {recorder.playing ? (
            <button type="button" className="btn btn--ghost" onClick={recorder.stopPlayback}>
              {t.stop}
            </button>
          ) : (
            <button type="button" className="btn btn--ghost" onClick={recorder.play} disabled={!recorder.take || recorder.recording}>
              {t.play}
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={recorder.clear} disabled={!recorder.take || recorder.recording}>
            {t.clear}
          </button>
          <button type="button" className="btn btn--ghost" onClick={releaseEverything}>
            {t.silence}
          </button>
        </div>
        <p className="pn-recorder__status" aria-live="polite">
          {recorder.recording ? t.recording(recorder.count) : recorder.take ? t.take(recorder.notes, seconds) : t.empty}
        </p>
      </section>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="piano">
      <Piano />
    </AppFrame>
  )
}
