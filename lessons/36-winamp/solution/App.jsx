import { useEffect, useMemo, useRef, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { usePlayer } from './usePlayer.js'
import { formatTime } from './formatTime.js'
import Visualizer from './Visualizer.jsx'
import Playlist from './Playlist.jsx'
import './app.css'

const ICONS = {
  prev: 'M6 5h2v14H6zM20 5v14L9 12z',
  play: 'M7 5v14l12-7z',
  pause: 'M6 5h4v14H6zM14 5h4v14h-4z',
  stop: 'M6 6h12v12H6z',
  next: 'M16 5h2v14h-2zM4 5v14l11-7z',
}

const isTyping = (el) => el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)

const TransportButton = ({ icon, label, onClick, keyHint }) => {
  return (
    <button type="button" className="wa-btn wa-transport" onClick={onClick} aria-label={label} title={`${label} (${keyHint})`}>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path d={ICONS[icon]} fill="currentColor" />
      </svg>
    </button>
  )
}

const RetroPlayer = () => {
  const t = useText(TEXT)
  const { palette } = useLesson()
  const player = usePlayer()
  const { current, currentIndex, playing, time, duration, volume, shuffle, repeat } = player
  const [showRemaining, setShowRemaining] = useState(false)
  const [visMode, setVisMode] = useState('bars')

  // Bottom → top colors of the spectrum bars, taken from the lesson palette.
  const [black, pink, blue, orange, yellow, cyan] = palette.colors
  const visColors = useMemo(() => (visMode === 'bars' ? [cyan, yellow, orange, pink] : [cyan]), [visMode, cyan, yellow, orange, pink])

  // Classic shortcuts: Z X C V B. A ref holds the latest player so the listener is added once.
  const playerRef = useRef(player)
  useEffect(() => {
    playerRef.current = player
  })
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return
      const p = playerRef.current
      const actions = { z: p.prev, x: p.play, c: p.pause, v: p.stop, b: p.next }
      const action = actions[e.key.toLowerCase()]
      if (action) {
        e.preventDefault()
        action()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const shownTime = showRemaining && duration ? `-${formatTime(duration - time)}` : formatTime(time)
  const title = current ? `${currentIndex + 1}. ${current.title}` : t.noTrack
  const state = playing ? 'play' : current && time > 0 ? 'pause' : 'stop'

  return (
    <div
      className="wa"
      style={{ '--wa-black': black, '--wa-pink': pink, '--wa-blue': blue, '--wa-orange': orange, '--wa-led': yellow, '--wa-lcd': cyan }}
    >
      <section className="wa-window wa-main" aria-label={t.player}>
        <div className="wa-titlebar">
          <span className="wa-titlebar__text">RETRO·AMP</span>
          <span className="wa-titlebar__lines" aria-hidden="true" />
        </div>

        <div className="wa-display">
          <div className="wa-lcd">
            <div className="wa-lcd__row">
              <span className={`wa-state is-${state}`} aria-hidden="true" />
              <button
                type="button"
                className="wa-time"
                onClick={() => setShowRemaining((v) => !v)}
                aria-label={`${showRemaining ? t.remaining : t.elapsed}: ${shownTime}`}
                title={showRemaining ? t.remaining : t.elapsed}
              >
                {shownTime}
              </button>
            </div>
            <Visualizer
              getAnalyser={player.getAnalyser}
              playing={playing}
              mode={visMode}
              colors={visColors}
              label={t.visualizer[visMode]}
              onToggle={() => setVisMode((m) => (m === 'bars' ? 'wave' : 'bars'))}
            />
          </div>

          <div className="wa-info">
            <div className={`wa-marquee${playing ? ' is-running' : ''}`} aria-live="polite">
              <span className="visually-hidden">{title}</span>
              <span className="wa-marquee__track" aria-hidden="true">
                <span>{title}</span>
                {playing && <span>{title}</span>}
              </span>
            </div>
            <div className="wa-meta">
              <span>{current?.format ?? '–'}</span>
              <span className={`wa-led${shuffle ? ' is-on' : ''}`}>SHUF</span>
              <span className={`wa-led${repeat !== 'off' ? ' is-on' : ''}`}>{repeat === 'one' ? 'REP 1' : 'REP'}</span>
            </div>
          </div>
        </div>

        <input
          type="range"
          className="wa-seek"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(time, duration || 0)}
          disabled={!current || !duration}
          onChange={(e) => player.seek(Number(e.target.value))}
          aria-label={t.seek}
          aria-valuetext={t.timeOf(formatTime(time), formatTime(duration))}
          style={{ '--progress': `${duration ? (time / duration) * 100 : 0}%` }}
        />

        <div className="wa-controls">
          <div className="wa-transports">
            <TransportButton icon="prev" label={t.prev} onClick={player.prev} keyHint="Z" />
            <TransportButton icon="play" label={t.play} onClick={player.play} keyHint="X" />
            <TransportButton icon="pause" label={t.pause} onClick={player.pause} keyHint="C" />
            <TransportButton icon="stop" label={t.stop} onClick={player.stop} keyHint="V" />
            <TransportButton icon="next" label={t.next} onClick={player.next} keyHint="B" />
          </div>

          <div className="wa-toggles">
            <button type="button" className="wa-btn wa-toggle" aria-pressed={shuffle} onClick={player.toggleShuffle}>
              <span className="wa-toggle__led" aria-hidden="true" />
              {t.shuffle}
            </button>
            <button
              type="button"
              className="wa-btn wa-toggle"
              aria-pressed={repeat !== 'off'}
              onClick={player.cycleRepeat}
              title={t.repeat[repeat]}
            >
              <span className="wa-toggle__led" aria-hidden="true" />
              {t.repeat[repeat]}
            </button>
          </div>

          <label className="wa-volume">
            <span className="visually-hidden">{t.volume}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z" fill="currentColor" />
              <path d="M15.5 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => player.setVolume(Number(e.target.value))}
              aria-valuetext={`${Math.round(volume * 100)}%`}
              style={{ '--progress': `${volume * 100}%` }}
            />
          </label>
        </div>

        <audio {...player.audioProps} />
      </section>

      <Playlist player={player} />

      <p className="wa-hint">{t.keys}</p>
      <p className="wa-hint">{t.privacy}</p>
    </div>
  )
}

const App = () => {
  return (
    <AppFrame slug="winamp">
      <RetroPlayer />
    </AppFrame>
  )
}

export default App
