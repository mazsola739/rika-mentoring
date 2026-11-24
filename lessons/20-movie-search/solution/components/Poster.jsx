import { useState } from 'react'
import { PEACOCK } from '@shared/ui/palette.js'

// Placeholder colours from the peacock palette: [background, text].
const COLORS = [
  [PEACOCK.night, PEACOCK.tealLight],
  [PEACOCK.teal, '#FFFFFF'],
  [PEACOCK.blue, '#FFFFFF'],
  [PEACOCK.plum, '#FFFFFF'],
  [PEACOCK.ruby, '#FFFFFF'],
  [PEACOCK.gold, PEACOCK.night],
  [PEACOCK.tealLight, PEACOCK.night],
]

// Same name, same colour: a tiny string hash picks one pair, so a show keeps its colour.
function colorsFor(seed = '') {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.codePointAt(0)) >>> 0
  return COLORS[hash % COLORS.length]
}

// A poster, or a flat colour tile with a TV icon when the API has no image (or it fails to load).
// `seed` (the show's name) picks the tile colour.
export default function Poster({ src, label, seed = label, className = '' }) {
  const [broken, setBroken] = useState(false)

  if (!src || broken) {
    const [background, color] = colorsFor(seed)
    return (
      <div className={`ms-poster ms-poster--empty ${className}`} style={{ background, color }}>
        <svg className="ms-poster__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="2.5" y="7" width="19" height="13.5" rx="2.5" />
          <path d="m8 2.5 4 4.5 4-4.5" />
        </svg>
        <span>{label}</span>
      </div>
    )
  }

  // alt="" because the series title is always written right next to the poster.
  return <img className={`ms-poster ${className}`} src={src} alt="" loading="lazy" onError={() => setBroken(true)} />
}
