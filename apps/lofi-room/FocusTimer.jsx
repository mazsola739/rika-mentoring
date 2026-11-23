import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { DURATIONS } from './useFocusTimer.js'
import Icon from './Icon.jsx'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const pad = (n) => String(n).padStart(2, '0')

export default function FocusTimer({ timer, sessionsToday, doneMode, onStart }) {
  const t = useText(TEXT)
  const totalSeconds = Math.ceil(timer.remaining / 1000)
  const min = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  const untouched = !timer.running && timer.remaining === DURATIONS[timer.mode]

  return (
    <section className="lr-card lr-timer" aria-labelledby="lr-timer-title">
      <h2 id="lr-timer-title" className="lr-card__title">
        {t.timer}
      </h2>

      <div className="lr-modes" role="group" aria-label={t.timer}>
        {['focus', 'break'].map((mode) => (
          <button key={mode} type="button" className="lr-mode" aria-pressed={timer.mode === mode} onClick={() => timer.switchTo(mode)}>
            {t.modes[mode]} · {DURATIONS[mode] / 60000}′
          </button>
        ))}
      </div>

      <div className="lr-ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="lr-ring__track" cx="60" cy="60" r={RADIUS} />
          <circle
            className="lr-ring__bar"
            cx="60"
            cy="60"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - timer.progress)}
          />
        </svg>
        <div className="lr-ring__label">
          <span className="lr-ring__time" role="timer" aria-label={t.timeLeft(min, sec)}>
            {pad(min)}:{pad(sec)}
          </span>
          <span className="lr-ring__mode">{t.modes[timer.mode]}</span>
        </div>
      </div>

      <div className="lr-actions">
        {timer.running ? (
          <button type="button" className="btn lr-btn" onClick={timer.pause}>
            <Icon name="pause" /> {t.pause}
          </button>
        ) : (
          <button type="button" className="btn lr-btn" onClick={onStart}>
            <Icon name="play" /> {untouched ? t.start : t.resume}
          </button>
        )}
        <button type="button" className="btn lr-btn--ghost" onClick={timer.reset} disabled={untouched}>
          <Icon name="reset" /> {t.reset}
        </button>
      </div>

      <p className="lr-sessions">{t.sessions(sessionsToday)}</p>
      <p className="lr-done" aria-live="polite">
        {doneMode ? t.done[doneMode] : ''}
      </p>
    </section>
  )
}
