import { useEffect, useRef, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { formatTime } from './formatTime.js'
import { useResumePosition } from './useResumePosition.js'
import Icon from './Icon.jsx'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const STEP = 5 // seconds for ← / →

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// End of the buffered range that contains the current time (0 if nothing is loaded there yet).
function bufferedEnd(video) {
  const { buffered, currentTime } = video
  for (let i = 0; i < buffered.length; i++) {
    if (buffered.start(i) <= currentTime + 0.25 && currentTime <= buffered.end(i)) return buffered.end(i)
  }
  return 0
}

export default function VideoPlayer({ src, storageKey }) {
  const t = useText(TEXT)
  // useRef gives us the real <video> DOM element, so we can call its methods (play, pause, …).
  const videoRef = useRef(null)
  // The wrapper goes full screen, so our own controls stay visible there too.
  const frameRef = useRef(null)

  // React state only mirrors the video element. The element's events keep it up to date.
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'waiting' | 'error'
  const [fullscreen, setFullscreen] = useState(false)
  const [pip, setPip] = useState(false)
  const [flash, setFlash] = useState(null) // { id, text } – short on-screen feedback

  const resume = useResumePosition(videoRef, storageKey)
  const pipSupported = typeof document !== 'undefined' && document.pictureInPictureEnabled === true

  const showFlash = (text) => setFlash({ id: Date.now(), text })

  // The on-screen message disappears after a moment; the cleanup cancels the old timer.
  useEffect(() => {
    if (!flash) return
    const timer = setTimeout(() => setFlash(null), 900)
    return () => clearTimeout(timer)
  }, [flash])

  // Full screen and picture-in-picture can also be left with Esc or the browser's own UI,
  // so we listen to the events instead of assuming our button was used.
  useEffect(() => {
    const video = videoRef.current
    const onFullscreen = () => setFullscreen(document.fullscreenElement === frameRef.current)
    const onEnterPip = () => setPip(true)
    const onLeavePip = () => setPip(false)
    document.addEventListener('fullscreenchange', onFullscreen)
    video.addEventListener('enterpictureinpicture', onEnterPip)
    video.addEventListener('leavepictureinpicture', onLeavePip)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen)
      video.removeEventListener('enterpictureinpicture', onEnterPip)
      video.removeEventListener('leavepictureinpicture', onLeavePip)
    }
  }, [])

  // ── Actions: they talk to the DOM element; the events above update the UI ──
  const togglePlay = () => {
    const video = videoRef.current
    if (video.paused || video.ended) {
      // play() returns a Promise that rejects e.g. when the source failed.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  const seekTo = (seconds) => {
    const video = videoRef.current
    if (!Number.isFinite(video.duration)) return
    video.currentTime = clamp(seconds, 0, video.duration)
    setTime(video.currentTime)
  }

  const seekBy = (delta) => {
    seekTo(videoRef.current.currentTime + delta)
    showFlash(t.seconds(delta))
  }

  const toggleMute = () => {
    const video = videoRef.current
    // Unmuting at volume 0 would stay silent, so bring the volume back.
    if (video.muted && video.volume === 0) video.volume = 0.5
    video.muted = !video.muted
    showFlash(video.muted ? t.muted : `${t.volume} ${Math.round(video.volume * 100)}%`)
  }

  const changeVolume = (value) => {
    const video = videoRef.current
    video.volume = value
    video.muted = value === 0
  }

  const changeRate = (value) => {
    videoRef.current.playbackRate = value
    showFlash(`${value}×`)
  }

  const toggleFullscreen = async () => {
    const video = videoRef.current
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (frameRef.current.requestFullscreen) await frameRef.current.requestFullscreen()
      else if (video.webkitEnterFullscreen)
        video.webkitEnterFullscreen() // iPhone Safari
      else showFlash(t.fullscreenFailed)
    } catch {
      showFlash(t.fullscreenFailed)
    }
  }

  const togglePip = async () => {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await videoRef.current.requestPictureInPicture()
    } catch {
      showFlash(t.pipFailed)
    }
  }

  const retry = () => {
    setStatus('loading')
    videoRef.current.load()
  }

  const startOver = () => {
    seekTo(0)
    resume.clear()
    resume.dismiss()
  }

  // ── Keyboard shortcuts ──
  // Space on a button or arrows on the volume slider keep their normal meaning.
  const onShortcut = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return
    const target = e.target
    const onButton = target.tagName === 'BUTTON'
    const native = target.closest?.('[data-native-keys]')
    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        if (e.key === ' ' && (onButton || native)) return
        e.preventDefault()
        togglePlay()
        // play() / pause() update `paused` synchronously, so we can read the new state here.
        showFlash(videoRef.current.paused ? t.paused : t.playing)
        break
      case 'ArrowLeft':
      case 'ArrowRight':
        if (native) return
        e.preventDefault()
        seekBy(e.key === 'ArrowLeft' ? -STEP : STEP)
        break
      case 'm':
      case 'M':
        e.preventDefault()
        toggleMute()
        break
      case 'f':
      case 'F':
        e.preventDefault()
        toggleFullscreen()
        break
      default:
    }
  }

  // The shortcuts work on the whole page, unless the user is typing somewhere else.
  // A ref always holds the latest handler, so the listener is added only once.
  const shortcutRef = useRef(onShortcut)
  shortcutRef.current = onShortcut
  useEffect(() => {
    const onKeyDown = (e) => {
      const inPlayer = frameRef.current?.contains(e.target)
      const onPage = e.target === document.body || e.target === document.documentElement
      if (inPlayer || onPage) shortcutRef.current(e)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const playLabel = ended ? t.replay : playing ? t.pause : t.play
  const playIcon = ended ? 'replay' : playing ? 'pause' : 'play'
  const progress = duration ? (time / duration) * 100 : 0
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0
  const effectiveVolume = muted ? 0 : volume

  return (
    <div className="vp">
      <div ref={frameRef} className={`vp-frame${fullscreen ? ' is-fullscreen' : ''}`} tabIndex={-1} aria-label={t.player} role="group">
        <div className="vp-stage">
          <video
            ref={videoRef}
            className="vp-video"
            src={src}
            preload="metadata"
            playsInline
            onClick={togglePlay}
            onDoubleClick={toggleFullscreen}
            onPlay={() => {
              setPlaying(true)
              setEnded(false)
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setEnded(true)
              resume.clear()
            }}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration)
              resume.restore()
            }}
            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => {
              setTime(e.currentTarget.currentTime)
              setBuffered(bufferedEnd(e.currentTarget))
              resume.save()
            }}
            onProgress={(e) => setBuffered(bufferedEnd(e.currentTarget))}
            onVolumeChange={(e) => {
              setVolume(e.currentTarget.volume)
              setMuted(e.currentTarget.muted)
            }}
            onRateChange={(e) => setRate(e.currentTarget.playbackRate)}
            onWaiting={() => setStatus('waiting')}
            onCanPlay={() => setStatus('ready')}
            onPlaying={() => setStatus('ready')}
            onError={() => setStatus('error')}
          />

          {!playing && status !== 'error' && (
            // Mouse/touch convenience only; the labelled play button in the bar is the accessible one.
            <button type="button" className="vp-bigplay" tabIndex={-1} aria-hidden="true" onClick={togglePlay}>
              <Icon name={playIcon} />
            </button>
          )}

          {(status === 'loading' || status === 'waiting') && playing && (
            <div className="vp-spinner" role="status">
              <span className="visually-hidden">{t.loading}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="vp-error" role="alert">
              <p>{t.error}</p>
              <button type="button" className="btn" onClick={retry}>
                {t.retry}
              </button>
            </div>
          )}

          <div className="vp-flash" role="status" aria-live="polite">
            {flash && (
              <span key={flash.id} className="vp-flash__text">
                {flash.text}
              </span>
            )}
          </div>
        </div>

        <div className="vp-bar">
          <div className="vp-seek" style={{ '--played': `${progress}%`, '--buffered': `${bufferedPercent}%` }}>
            <div className="vp-seek__track" aria-hidden="true">
              <span className="vp-seek__buffered" />
              <span className="vp-seek__played" />
            </div>
            <input
              type="range"
              className="vp-seek__input"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(time, duration || 0)}
              disabled={!duration}
              aria-label={t.seek}
              aria-valuetext={t.timeOf(formatTime(time), formatTime(duration))}
              onChange={(e) => seekTo(Number(e.target.value))}
            />
          </div>

          <div className="vp-controls">
            <button type="button" className="vp-btn" onClick={togglePlay} aria-label={playLabel} title={`${playLabel} (Space)`}>
              <Icon name={playIcon} />
            </button>

            <span className="vp-time" aria-hidden="true">
              {formatTime(time)} <span className="vp-time__sep">/</span> {formatTime(duration)}
            </span>

            <span className="vp-spacer" />

            <div className="vp-volume">
              <button
                type="button"
                className="vp-btn"
                onClick={toggleMute}
                aria-label={muted ? t.unmute : t.mute}
                aria-pressed={muted}
                title={`${muted ? t.unmute : t.mute} (M)`}
              >
                <Icon name={muted || volume === 0 ? 'mute' : 'volume'} />
              </button>
              <input
                type="range"
                className="vp-volume__input"
                min="0"
                max="1"
                step="0.05"
                value={effectiveVolume}
                style={{ '--level': `${effectiveVolume * 100}%` }}
                aria-label={t.volume}
                aria-valuetext={`${Math.round(effectiveVolume * 100)}%`}
                data-native-keys=""
                onChange={(e) => changeVolume(Number(e.target.value))}
              />
            </div>

            <label className="vp-speed">
              <span className="visually-hidden">{t.speed}</span>
              <select value={rate} onChange={(e) => changeRate(Number(e.target.value))} data-native-keys="" title={t.speed}>
                {SPEEDS.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}×
                  </option>
                ))}
              </select>
            </label>

            {pipSupported && (
              <button
                type="button"
                className="vp-btn"
                onClick={togglePip}
                aria-label={pip ? t.exitPip : t.pip}
                aria-pressed={pip}
                title={pip ? t.exitPip : t.pip}
              >
                <Icon name="pip" />
              </button>
            )}

            <button
              type="button"
              className="vp-btn"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? t.exitFullscreen : t.fullscreen}
              title={`${fullscreen ? t.exitFullscreen : t.fullscreen} (F)`}
            >
              <Icon name={fullscreen ? 'exitFullscreen' : 'fullscreen'} />
            </button>
          </div>
        </div>
      </div>

      {resume.resumedAt !== null && (
        <div className="vp-resume" role="status">
          <span>{t.resumed(formatTime(resume.resumedAt))}</span>
          <span className="vp-resume__actions">
            <button type="button" className="btn btn--ghost vp-small" onClick={startOver}>
              {t.startOver}
            </button>
            <button type="button" className="btn btn--ghost vp-small" onClick={resume.dismiss}>
              {t.dismiss}
            </button>
          </span>
        </div>
      )}
    </div>
  )
}
