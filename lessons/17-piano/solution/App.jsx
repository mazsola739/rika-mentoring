import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import {
  HIGHEST_OCTAVE,
  INSTRUMENTS,
  KEY_OFFSETS,
  LOWEST_OCTAVE,
  OCTAVE_DOWN,
  OCTAVE_UP,
  START_OCTAVE,
  fallbackLabel,
  noteName,
  octaveStart,
} from './notes.js'
import { useSynth } from './useSynth.js'
import { useRecorder } from './useRecorder.js'
import { useMidi } from './useMidi.js'
import { useMelodyCoach } from './useMelodyCoach.js'
import PianoKeys from './PianoKeys.jsx'
import MidiPanel from './MidiPanel.jsx'
import MelodyCoach from './MelodyCoach.jsx'
import './app.css'

const TEXT = {
  en: {
    intro: 'Play with the mouse, a touch screen or your computer keyboard. The letters on the keys show which computer key plays which note.',
    sound: 'Sound',
    instruments: { piano: 'Soft piano', organ: 'Organ', synth: 'Synth', flute: 'Flute' },
    waves: { triangle: 'triangle wave', square: 'square wave', sawtooth: 'sawtooth wave', sine: 'sine wave' },
    volume: 'Volume',
    octave: 'Octave',
    lower: 'Lower octave',
    higher: 'Higher octave',
    octaveHint: (down, up) => `${down} and ${up} switch the octave.`,
    keys: 'Piano keys',
    keyLabel: (note, key) => (key ? `${note}, key ${key}` : note),
    nextNote: 'next note',
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
    midi: {
      title: 'MIDI keyboard',
      connect: 'Connect',
      idle: 'Have a MIDI keyboard? Plug it into the computer, then click Connect.',
      unsupported: 'This browser does not support the Web MIDI API. Try Chrome, Edge or Firefox.',
      asking: 'Waiting for permission…',
      denied: 'The browser did not allow access to MIDI devices.',
      none: 'No MIDI keyboard is connected. Plug one in and start playing.',
      connected: (names) => `Connected: ${names}`,
    },
    coach: {
      title: 'Melody teacher',
      melody: 'Melody',
      none: 'None, free play',
      notes: 'Notes of the melody',
      again: 'Start again',
      idle: 'Choose a melody: the key of the next note glows gold.',
      progress: (done, total, next, mistakes) => `Next note: ${next}. Done: ${done} / ${total}. Mistakes: ${mistakes}.`,
      done: (mistakes) => `Well done, you played it all! Mistakes: ${mistakes}.`,
    },
  },
  hu: {
    intro: 'Játssz egérrel, érintőképernyőn vagy a számítógép billentyűzetén. A billentyűkön lévő betűk mutatják, melyik gomb melyik hangot szólaltatja meg.',
    sound: 'Hangszín',
    instruments: { piano: 'Lágy zongora', organ: 'Orgona', synth: 'Szintetizátor', flute: 'Fuvola' },
    waves: { triangle: 'háromszögjel', square: 'négyszögjel', sawtooth: 'fűrészfogjel', sine: 'szinuszjel' },
    volume: 'Hangerő',
    octave: 'Oktáv',
    lower: 'Mélyebb oktáv',
    higher: 'Magasabb oktáv',
    octaveHint: (down, up) => `Oktávváltás: ${down} és ${up}.`,
    keys: 'Zongorabillentyűk',
    keyLabel: (note, key) => (key ? `${note}, ${key} billentyű` : note),
    nextNote: 'következő hang',
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
    midi: {
      title: 'MIDI-billentyűzet',
      connect: 'Csatlakoztatás',
      idle: 'Van MIDI-billentyűzeted? Csatlakoztasd a géphez, aztán kattints a Csatlakoztatás gombra.',
      unsupported: 'Ez a böngésző nem ismeri a Web MIDI API-t. Próbáld ki Chrome-ban, Edge-ben vagy Firefoxban.',
      asking: 'Engedélyre vár…',
      denied: 'A böngésző nem engedte a MIDI-eszközök használatát.',
      none: 'Nincs csatlakoztatott MIDI-billentyűzet. Dugd be, és máris játszhatsz.',
      connected: (names) => `Csatlakoztatva: ${names}`,
    },
    coach: {
      title: 'Dallamtanító',
      melody: 'Dallam',
      none: 'Nincs, szabad játék',
      notes: 'A dallam hangjai',
      again: 'Elölről',
      idle: 'Válassz egy dallamot: a következő hang billentyűje sárgán világít.',
      progress: (done, total, next, mistakes) => `Következő hang: ${next}. Kész: ${done} / ${total}. Hibák száma: ${mistakes}.`,
      done: (mistakes) => `Bravó, végigjátszottad! Hibák száma: ${mistakes}.`,
    },
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
  const [octave, setOctave] = useState(START_OCTAVE)
  const [active, setActive] = useState(() => new Set())
  const layout = useKeyboardLayout()

  // The screen shows two octaves from the C of `octave`, and the computer keys start at the same C.
  const base = octaveStart(octave)
  const top = base + 24
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

  const coach = useMelodyCoach()

  // What the player plays (mouse, touch, computer keys, MIDI): it sounds, is recorded, and the teacher checks it.
  // Playback calls sound and mute directly, so it is neither recorded again nor checked.
  const press = (midi) => {
    if (sound(midi)) recorder.log('on', midi)
    coach.check(midi)
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

  const midiInput = useMidi(
    (midi) => press(midi),
    (midi) => release(midi),
  )

  const shiftOctave = (dir) => setOctave((o) => Math.min(HIGHEST_OCTAVE, Math.max(LOWEST_OCTAVE, o + dir)))

  const chooseMelody = (id) => {
    coach.choose(id)
    if (id) setOctave(START_OCTAVE) // every melody is between C4 and C5
  }

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
        // In text fields the letters are for typing. A focused <select> still plays: preventDefault below stops
        // its type-ahead, so a letter does not jump to another melody.
        if (target?.closest('textarea, [contenteditable="true"], input:not([type="range"])')) return
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
    keyFor[base + offset] = code
  })
  const labelOf = (code) => (layout?.get(code) ?? fallbackLabel(code, lang)).toUpperCase()
  const labelFor = (midi) => (keyFor[midi] ? labelOf(keyFor[midi]) : null)

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
            <button type="button" className="btn btn--ghost" aria-label={t.lower} onClick={() => shiftOctave(-1)} disabled={octave === LOWEST_OCTAVE}>
              −
            </button>
            <strong aria-live="polite">
              {noteName(base, lang)} – {noteName(top, lang)}
            </strong>
            <button type="button" className="btn btn--ghost" aria-label={t.higher} onClick={() => shiftOctave(1)} disabled={octave === HIGHEST_OCTAVE}>
              +
            </button>
          </div>
          <span className="pn-control__note">{t.octaveHint(labelOf(OCTAVE_DOWN), labelOf(OCTAVE_UP))}</span>
        </div>
      </div>

      <PianoKeys octave={octave} active={active} hint={coach.target} labelFor={labelFor} lang={lang} handlers={keyHandlers} t={t} />
      <p className="pn__tip">{t.tip}</p>

      <section className="pn-panel" aria-labelledby="pn-recorder-title">
        <h2 id="pn-recorder-title" className="pn-panel__title">
          {t.recorder}
        </h2>
        <div className="pn-panel__buttons">
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
        <p className="pn-panel__status" aria-live="polite">
          {recorder.recording ? t.recording(recorder.count) : recorder.take ? t.take(recorder.notes, seconds) : t.empty}
        </p>
      </section>

      <MidiPanel midi={midiInput} t={t.midi} />
      <MelodyCoach coach={coach} lang={lang} t={t.coach} onChoose={chooseMelody} />
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
