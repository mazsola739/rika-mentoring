// One card: a real <button>, so Tab, Enter and Space work without extra code.
// Both sides are always in the DOM; CSS rotates the inner box to show one or the other.
export default function Card({ index, face, faceUp, matched, label, onFlip }) {
  return (
    <button
      type="button"
      className={`mg-card${faceUp ? ' is-up' : ''}${matched ? ' is-matched' : ''}`}
      data-index={index}
      aria-label={label}
      aria-disabled={matched || undefined}
      onClick={() => onFlip(index)}
    >
      <span className="mg-card__inner">
        <span className="mg-card__side mg-card__back" aria-hidden="true">
          <span className="mg-card__mark" />
        </span>
        {/* The button's aria-label already names the card, so the emoji itself is hidden from screen readers. */}
        <span className="mg-card__side mg-card__face" style={{ '--face': face.color }} aria-hidden="true">
          <span className="mg-card__emoji">{face.emoji}</span>
          {matched && <span className="mg-card__check">✓</span>}
        </span>
      </span>
    </button>
  )
}
