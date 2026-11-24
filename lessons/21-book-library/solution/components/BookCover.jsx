import { useState } from 'react'
import { PEACOCK } from '@shared/ui/palette.js'
import { coverUrl } from '../bookApi.js'

// Placeholder colours from the peacock palette: [background, text].
const COLORS = [
  [PEACOCK.teal, '#FFFFFF'],
  [PEACOCK.night, PEACOCK.tealLight],
  [PEACOCK.blue, '#FFFFFF'],
  [PEACOCK.plum, '#FFFFFF'],
  [PEACOCK.ruby, '#FFFFFF'],
  [PEACOCK.gold, PEACOCK.night],
  [PEACOCK.tealLight, PEACOCK.night],
]

// Same title, same colour: a tiny string hash picks one pair, so a book keeps its colour.
function colorsFor(title = '') {
  let hash = 0
  for (const ch of title) hash = (hash * 31 + ch.codePointAt(0)) >>> 0
  return COLORS[hash % COLORS.length]
}

// A cover image from the book API, or a flat colour tile with a book icon and the title when there is none
// (or when the image cannot be loaded).
export default function BookCover({ coverId, title, size = 'M', className = '' }) {
  const [broken, setBroken] = useState(false)
  const src = coverUrl(coverId, size)

  if (!src || broken) {
    const [background, color] = colorsFor(title)
    return (
      <span className={`bl-cover bl-cover--empty ${className}`} style={{ background, color }} aria-hidden="true">
        <svg className="bl-cover__icon" viewBox="0 0 24 24" focusable="false">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h8M8 11h5" />
        </svg>
        <span className="bl-cover__title">{title}</span>
      </span>
    )
  }

  // alt="" because the title is always printed next to the cover.
  return <img className={`bl-cover ${className}`} src={src} alt="" loading="lazy" onError={() => setBroken(true)} />
}
