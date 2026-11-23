// Clickable progress indicator. Steps you already passed (or can safely reach) are buttons;
// the current one carries aria-current="step" so screen readers announce where you are.
export default function StepIndicator({ steps, current, onSelect, t }) {
  const progress = (current / (steps.length - 1)) * 100

  return (
    <nav className="msf-progress" aria-label={t.progressLabel}>
      <ol className="msf-progress__list">
        {steps.map(({ key, done, reachable }, i) => {
          const isCurrent = i === current
          return (
            <li key={key} className={`msf-progress__item${done ? ' is-done' : ''}${isCurrent ? ' is-current' : ''}`}>
              <button
                type="button"
                className="msf-progress__step"
                aria-current={isCurrent ? 'step' : undefined}
                disabled={!isCurrent && !reachable}
                onClick={() => !isCurrent && onSelect(i)}
              >
                <span className="msf-progress__dot" aria-hidden="true">
                  {done && !isCurrent ? '✓' : i + 1}
                </span>
                <span className="msf-progress__name">
                  {t.steps[key]}
                  {done && <span className="visually-hidden"> ({t.completed})</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="msf-progress__track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </nav>
  )
}
