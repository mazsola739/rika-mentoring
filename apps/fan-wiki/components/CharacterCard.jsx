import { keyOf } from '../text.js'

export function StatusBadge({ value, t }) {
  const key = keyOf(value)
  return (
    <span className={`fw-status fw-status--${key}`}>
      <span className="fw-status__dot" aria-hidden="true" />
      {t.status[key] ?? value}
    </span>
  )
}

// One character in the grid; the whole card links to its page (#/character/:id).
export default function CharacterCard({ character, t }) {
  return (
    <li className="fw-card">
      <a className="fw-card__link" href={`#/character/${character.id}`}>
        <img src={character.image} alt="" width="300" height="300" loading="lazy" />
        <span className="fw-card__body">
          <strong className="fw-card__name">{character.name}</strong>
          <span className="fw-card__meta">
            <StatusBadge value={character.status} t={t} />
            <span aria-hidden="true">·</span>
            <span>{character.species}</span>
          </span>
          <small className="fw-card__seen">
            {t.lastSeen}: {character.location?.name}
          </small>
        </span>
      </a>
    </li>
  )
}

export function CardSkeletons({ count = 8 }) {
  return (
    <ul className="fw-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="fw-card fw-card--skeleton">
          <span className="fw-skel fw-skel--image" />
          <span className="fw-skel fw-skel--line" />
          <span className="fw-skel fw-skel--line fw-skel--short" />
        </li>
      ))}
    </ul>
  )
}
