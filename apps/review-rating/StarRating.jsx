import { useId, useState } from 'react'

const STAR_PATH = 'M12 2.6l2.9 6 6.6.8-4.9 4.6 1.2 6.5L12 17.3l-5.8 3.2 1.2-6.5-4.9-4.6 6.6-.8z'

export function StarIcon() {
  return (
    <svg className="rr-star" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={STAR_PATH} />
    </svg>
  )
}

const row = (max) => Array.from({ length: max }, (_, i) => <StarIcon key={i} />)

// Read-only stars. Fractions (e.g. 4.3) are drawn by clipping a filled row on top of an empty one.
export function Stars({ value, max = 5, size = 18, label }) {
  const percent = Math.max(0, Math.min(1, value / max)) * 100
  return (
    <span className="rr-stars" role="img" aria-label={label} style={{ '--rr-star-size': `${size}px` }}>
      <span className="rr-stars__row">{row(max)}</span>
      <span className="rr-stars__row rr-stars__row--on" style={{ width: `${percent}%` }}>
        {row(max)}
      </span>
    </span>
  )
}

// Interactive stars = a real radio group. Native radios give us keyboard support for free:
// Tab moves into the group, arrow keys change the value, and screen readers announce "3 of 5".
export function StarRating({ name, value, onChange, legend, words, optionLabel, emptyText, error, errorId }) {
  const [hover, setHover] = useState(0)
  const groupId = useId()
  const shown = hover || value

  return (
    <fieldset
      className="rr-rate"
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : undefined}
      onMouseLeave={() => setHover(0)}
    >
      <legend>{legend}</legend>
      <div className="rr-rate__row">
        <div className="rr-rate__stars">
          {words.map((word, i) => {
            const n = i + 1
            const id = `${groupId}-${n}`
            return (
              <span key={n} className={`rr-rate__star${n <= shown ? ' is-on' : ''}`} onMouseEnter={() => setHover(n)}>
                <input
                  id={id}
                  type="radio"
                  name={name}
                  value={n}
                  checked={value === n}
                  onChange={() => onChange(n)}
                />
                <label htmlFor={id}>
                  <StarIcon />
                  <span className="visually-hidden">{optionLabel(n, word)}</span>
                </label>
              </span>
            )
          })}
        </div>
        <span className="rr-rate__word" aria-hidden="true">
          {shown ? words[shown - 1] : emptyText}
        </span>
      </div>
    </fieldset>
  )
}
