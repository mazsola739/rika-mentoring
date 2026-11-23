import { useEffect, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { PEACOCK } from '@shared/ui/palette.js'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { useRoomAudio } from './useRoomAudio.js'
import { useFocusTimer } from './useFocusTimer.js'
import { useStoredState } from './useStoredState.js'
import FocusTimer from './FocusTimer.jsx'
import MusicCard from './MusicCard.jsx'
import Mixer from './Mixer.jsx'
import './app.css'

// Local calendar day, e.g. "2026-11-21" (toISOString would use UTC and switch days at the wrong hour).
const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function LofiRoom() {
  const t = useText(TEXT)
  // `ensure` and `get` are stable callbacks, so effects that use them do not re-run every render.
  const { ensure, get, error: audioError } = useRoomAudio()

  const [levels, setLevels] = useStoredState('rika:lofi-room:levels', { rain: 0.6, cafe: 0, fire: 0.35 })
  const [musicVolume, setMusicVolume] = useStoredState('rika:lofi-room:music-volume', 0.7)
  const [sessions, setSessions] = useStoredState('rika:lofi-room:sessions', { day: today(), count: 0 })
  const [ambienceOn, setAmbienceOn] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [musicLoading, setMusicLoading] = useState(false)
  const [musicError, setMusicError] = useState(false)
  const [chord, setChord] = useState(-1)
  const [doneMode, setDoneMode] = useState(null)

  const timer = useFocusTimer((finished) => {
    get()?.chime()
    setDoneMode(finished)
    if (finished === 'focus') {
      setSessions((s) => ({ day: today(), count: (s.day === today() ? s.count : 0) + 1 }))
    }
  })

  // React state is the source of truth; this effect pushes it into the audio engine.
  // Until the first click there is no engine yet, and nothing happens.
  useEffect(() => {
    const engine = get()
    if (!engine) return
    if (ambienceOn) Object.entries(levels).forEach(([name, value]) => engine.setLevel(name, value))
    engine.setAmbience(ambienceOn)
  }, [get, levels, ambienceOn])

  useEffect(() => {
    get()?.setMusicVolume(musicVolume)
  }, [get, musicVolume])

  // While the music plays, ask the engine 5×/s which chord is sounding.
  useEffect(() => {
    if (!musicOn) return
    const id = setInterval(() => setChord(get()?.currentChord() ?? -1), 200)
    return () => clearInterval(id)
  }, [get, musicOn])

  // ── Event handlers: the user gesture that is allowed to start audio ──
  const toggleAmbience = () => {
    if (!ensure()) return
    setAmbienceOn((on) => !on)
  }

  const changeLevel = (name, value) => {
    if (!ensure()) return
    setLevels((prev) => ({ ...prev, [name]: value }))
    if (value > 0) setAmbienceOn(true)
  }

  const toggleMusic = async () => {
    const engine = ensure()
    if (!engine) return
    if (musicOn) {
      engine.pauseMusic()
      setMusicOn(false)
      return
    }
    setMusicOn(true)
    setMusicError(false)
    setMusicLoading(true)
    engine.setMusicVolume(musicVolume)
    try {
      await engine.playMusic()
    } catch {
      setMusicError(true)
      setMusicOn(false)
    } finally {
      setMusicLoading(false)
    }
  }

  const startTimer = () => {
    ensure() // so the end-of-session chime is allowed to play later
    setDoneMode(null)
    timer.start()
  }

  const sessionsToday = sessions.day === today() ? sessions.count : 0
  const live = (name) => (ambienceOn ? levels[name] : 0)

  return (
    <div
      className="lr"
      style={{
        // The scene is painted only with peacock colors, handed to CSS as variables.
        '--lr-night': PEACOCK.night,
        '--lr-teal': PEACOCK.teal,
        '--lr-teal-light': PEACOCK.tealLight,
        '--lr-blue': PEACOCK.blue,
        '--lr-plum': PEACOCK.plum,
        '--lr-ruby': PEACOCK.ruby,
        '--lr-gold': PEACOCK.gold,
        '--rain': live('rain'),
        '--cafe': live('cafe'),
        '--fire': live('fire'),
      }}
    >
      {/* A flat night scene made of CSS gradients; extra layers add rain, café light and fire glow. */}
      <div className="lr-room">
        <div className="lr-room__sky" aria-hidden="true" />
        <div className="lr-room__cafe" aria-hidden="true" />
        <div className="lr-room__rain" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="lr-room__glow" aria-hidden="true" />

        <div className="lr-room__content">
          <FocusTimer timer={timer} sessionsToday={sessionsToday} doneMode={doneMode} onStart={startTimer} />
          <div className="lr-side">
            <MusicCard
              playing={musicOn}
              loading={musicLoading}
              error={musicError}
              chord={musicOn ? chord : -1}
              volume={musicVolume}
              onToggle={toggleMusic}
              onVolume={setMusicVolume}
            />
            <Mixer levels={levels} playing={ambienceOn} onToggle={toggleAmbience} onLevel={changeLevel} />
          </div>
        </div>
      </div>

      {audioError && (
        <p className="lr-error" role="alert">
          {t.audioError}
        </p>
      )}
      <p className="lr-note">{t.note}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="lofi-room">
      <LofiRoom />
    </AppFrame>
  )
}
