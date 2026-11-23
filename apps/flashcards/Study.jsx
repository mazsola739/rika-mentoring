import { useEffect, useState } from 'react'
import { label, shuffled } from './deck.js'

// Shortcuts work on the page itself and inside this app, but never while typing in a field
// and never on controls of the surrounding page (e.g. the language switch).
const ownsShortcut = (el) =>
  el === document.body || (Boolean(el.closest?.('.fc')) && !el.closest('input, textarea, select, [contenteditable="true"]'))

// One card with two faces. The flip is pure CSS: rotateY(180deg) + backface-visibility.
function FlipCard({ card, flipped, onFlip, lang, t }) {
  return (
    <button type="button" className={`fc-card${flipped ? ' is-flipped' : ''}`} onClick={onFlip}>
      <span className="fc-card__inner">
        <span className="fc-card__face fc-card__front" aria-hidden={flipped}>
          <span className="fc-card__tag">{t.question}</span>
          <span className="fc-card__text">{label(card.q, lang)}</span>
          <span className="fc-card__hint">{t.tapToFlip}</span>
        </span>
        <span className="fc-card__face fc-card__back solid" aria-hidden={!flipped}>
          <span className="fc-card__tag">{t.answer}</span>
          <span className="fc-card__text">{label(card.a, lang)}</span>
        </span>
      </span>
    </button>
  )
}

function ProgressBar({ known, total, t }) {
  const percent = total ? Math.round((known / total) * 100) : 0
  return (
    <div className="fc-progress">
      <div className="fc-progress__labels">
        <span>{t.knownOf(known, total)}</span>
        <span>{percent}%</span>
      </div>
      <div
        className="fc-progress__track"
        role="progressbar"
        aria-label={t.progress}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={known}
        aria-valuetext={t.knownOf(known, total)}
      >
        <span className="fc-progress__bar" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default function Study({ deck, marks, onMark, onResetProgress, onEditCards, lang, t }) {
  const [order, setOrder] = useState(null) // null = the deck's own order
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [onlyLearning, setOnlyLearning] = useState(false)
  const [finished, setFinished] = useState(false)

  // Everything below is derived from props and state on each render, nothing is stored twice.
  const byId = new Map(deck.cards.map((c) => [c.id, c]))
  const ids = order
    ? [...order.filter((id) => byId.has(id)), ...deck.cards.map((c) => c.id).filter((id) => !order.includes(id))]
    : deck.cards.map((c) => c.id)
  const queue = ids.map((id) => byId.get(id)).filter((c) => !onlyLearning || marks[c.id] !== 'known')
  const position = Math.min(index, Math.max(queue.length - 1, 0))
  const current = queue[position]
  const known = deck.cards.filter((c) => marks[c.id] === 'known').length
  const learning = deck.cards.length - known

  const goTo = (i) => {
    setIndex(i)
    setFlipped(false)
  }
  const next = () => position < queue.length - 1 && goTo(position + 1)
  const prev = () => position > 0 && goTo(position - 1)

  const restart = (learningOnly) => {
    setOnlyLearning(learningOnly)
    setFinished(false)
    goTo(0)
  }

  const shuffle = () => {
    setOrder(shuffled(deck.cards.map((c) => c.id)))
    restart(onlyLearning)
  }

  const mark = (value) => {
    onMark(current.id, value)
    const isLast = position === queue.length - 1
    if (isLast) {
      setFinished(true)
      setFlipped(false)
    } else if (onlyLearning && value === 'known') {
      // The card leaves the "still learning" queue, so the next one slides into this position.
      setFlipped(false)
    } else {
      goTo(position + 1)
    }
  }

  // Keyboard shortcuts. Space always flips (we cancel its default button "click" and page scroll),
  // except while typing in a text field. The cleanup removes the listener on every re-run.
  const active = Boolean(current) && !finished
  useEffect(() => {
    if (!active) return
    const onKeyDown = (e) => {
      if (!ownsShortcut(e.target) || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (!e.repeat) setFlipped((f) => !f)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIndex((i) => Math.min(i + 1, queue.length - 1))
        setFlipped(false)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndex((i) => Math.max(Math.min(i, queue.length - 1) - 1, 0))
        setFlipped(false)
      }
    }
    const onKeyUp = (e) => {
      if (e.code === 'Space' && ownsShortcut(e.target)) e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [active, queue.length])

  if (deck.cards.length === 0) {
    return (
      <div className="fc-empty">
        <h3>{t.emptyDeck}</h3>
        <p>{t.emptyDeckText}</p>
        <button type="button" className="btn" onClick={onEditCards}>
          {t.addCards}
        </button>
      </div>
    )
  }

  const toolbar = (
    <div className="fc-toolbar">
      <button
        type="button"
        className="chip"
        aria-pressed={onlyLearning}
        onClick={() => restart(!onlyLearning)}
        disabled={!onlyLearning && learning === 0}
      >
        {t.onlyLearning(learning)}
      </button>
      <button type="button" className="chip" onClick={shuffle}>
        {t.shuffle}
      </button>
      <button type="button" className="chip" onClick={onResetProgress} disabled={Object.keys(marks).length === 0}>
        {t.resetProgress}
      </button>
    </div>
  )

  if (finished || queue.length === 0) {
    const allKnown = learning === 0
    return (
      <div className="fc-study">
        <ProgressBar known={known} total={deck.cards.length} t={t} />
        <div className="fc-summary" role="status">
          <h3>{allKnown ? t.allKnown : t.roundDone}</h3>
          <p>{t.summary(known, learning)}</p>
          <div className="fc-summary__actions">
            {!allKnown && (
              <button type="button" className="btn" onClick={() => restart(true)}>
                {t.practiceLearning(learning)}
              </button>
            )}
            <button type="button" className={allKnown ? 'btn' : 'btn btn--ghost'} onClick={() => restart(false)}>
              {t.studyAll}
            </button>
          </div>
        </div>
        {toolbar}
      </div>
    )
  }

  const status = marks[current.id]

  return (
    <div className="fc-study">
      <ProgressBar known={known} total={deck.cards.length} t={t} />

      <div className="fc-stage">
        <p className="fc-counter">
          <span>{t.cardOf(position + 1, queue.length)}</span>
          {status && (
            <span className={`fc-badge fc-badge--${status}`}>{status === 'known' ? t.markedKnown : t.markedLearning}</span>
          )}
        </p>
        <FlipCard card={current} flipped={flipped} onFlip={() => setFlipped((f) => !f)} lang={lang} t={t} />
        <p className="visually-hidden" aria-live="polite">
          {flipped ? `${t.answer}: ${label(current.a, lang)}` : ''}
        </p>
      </div>

      <div className="fc-controls">
        <button type="button" className="btn btn--ghost fc-nav" onClick={prev} disabled={position === 0} aria-label={t.prev}>
          ←
        </button>
        <div className="fc-marks">
          <button type="button" className="btn btn--ghost fc-mark fc-mark--learning" onClick={() => mark('learning')}>
            {t.dontKnow}
          </button>
          <button type="button" className="btn fc-mark" onClick={() => mark('known')}>
            {t.know}
          </button>
        </div>
        <button
          type="button"
          className="btn btn--ghost fc-nav"
          onClick={next}
          disabled={position === queue.length - 1}
          aria-label={t.next}
        >
          →
        </button>
      </div>

      <p className="fc-keys">{t.keys}</p>
      {toolbar}
    </div>
  )
}
