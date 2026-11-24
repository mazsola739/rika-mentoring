import { useEffect, useState } from 'react'
import { label } from './deck.js'
import { getEntry, isDue } from './leitner.js'

// Shortcuts work on the page itself and inside this app, but never while typing in a field
// and never on controls of the surrounding page (e.g. the language switch).
const ownsShortcut = (el) =>
  el === document.body || (Boolean(el.closest?.('.fc')) && !el.closest('input, textarea, select, [contenteditable="true"]'))

// One card with two faces. The flip is pure CSS: rotateY(180deg) + backface-visibility.
function FlipCard({ card, flipped, onFlip, lang, t }) {
  return (
    <button
      type="button"
      className={`fc-card${card.image ? ' has-image' : ''}${flipped ? ' is-flipped' : ''}`}
      onClick={onFlip}
    >
      <span className="fc-card__inner">
        <span className="fc-card__face fc-card__front" aria-hidden={flipped}>
          <span className="fc-card__tag">{t.question}</span>
          {/* An empty alt when the card has no description: then the question text says it all. */}
          {card.image && <img className="fc-card__image" src={card.image} alt={card.imageAlt || ''} />}
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

export default function Study({ deck, progress, round, onAnswer, onNextRound, onShuffle, onResetProgress, onEditCards, lang, t }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Everything below is derived from props and state on each render, nothing is stored twice.
  // Only the cards due in this round come up, in the deck's own (possibly shuffled) order.
  const queue = deck.cards.filter((c) => isDue(getEntry(progress, c.id), round))
  const position = Math.min(index, Math.max(queue.length - 1, 0))
  const current = queue[position]
  // A card counts as known once it has moved on from box 1.
  const known = deck.cards.filter((c) => getEntry(progress, c.id).box > 1).length
  const dueNext = deck.cards.filter((c) => isDue(getEntry(progress, c.id), round + 1)).length
  const started = deck.cards.some((c) => progress[c.id])

  const goTo = (i) => {
    setIndex(i)
    setFlipped(false)
  }
  const next = () => position < queue.length - 1 && goTo(position + 1)
  const prev = () => position > 0 && goTo(position - 1)

  const answer = (knew) => {
    onAnswer(current.id, knew)
    // The answered card leaves the round and the next one slides into its place.
    // After the last card of the queue we step back by one.
    goTo(Math.max(Math.min(position, queue.length - 2), 0))
  }

  const shuffle = () => {
    onShuffle()
    goTo(0)
  }

  const nextRound = () => {
    onNextRound()
    goTo(0)
  }

  const reset = () => {
    onResetProgress()
    goTo(0)
  }

  // Keyboard shortcuts. Space always flips (we cancel its default button "click" and page scroll),
  // except while typing in a text field. The cleanup removes the listener on every re-run.
  const active = Boolean(current)
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
      <button type="button" className="chip" onClick={shuffle}>
        {t.shuffle}
      </button>
      <button type="button" className="chip" onClick={reset} disabled={!started}>
        {t.resetProgress}
      </button>
    </div>
  )

  // The cards of this round have run out: a summary, and the next round on a click.
  if (!current) {
    return (
      <div className="fc-study">
        <ProgressBar known={known} total={deck.cards.length} t={t} />
        <div className="fc-summary" role="status">
          <h3>{t.roundDone}</h3>
          <p>{known === deck.cards.length ? t.allKnown : t.roundText}</p>
          <p>{t.dueNext(dueNext)}</p>
          <div className="fc-summary__actions">
            <button type="button" className="btn" onClick={nextRound}>
              {t.nextRound}
            </button>
          </div>
        </div>
        {toolbar}
      </div>
    )
  }

  const box = getEntry(progress, current.id).box

  return (
    <div className="fc-study">
      <ProgressBar known={known} total={deck.cards.length} t={t} />

      <div className="fc-stage">
        <p className="fc-counter">
          <span>{t.roundCard(round, position + 1, queue.length)}</span>
          <span className={`fc-badge fc-badge--box${box}`}>{t.box(box)}</span>
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
          <button type="button" className="btn btn--ghost fc-mark" onClick={() => answer(false)}>
            {t.dontKnow}
          </button>
          <button type="button" className="btn fc-mark" onClick={() => answer(true)}>
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
