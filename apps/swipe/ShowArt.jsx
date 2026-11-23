import { PEACOCK } from '@shared/ui/palette.js'

// Flat colour pairs from the peacock palette: [background, letters].
const PAIRS = [
  [PEACOCK.teal, PEACOCK.gold],
  [PEACOCK.night, PEACOCK.tealLight],
  [PEACOCK.plum, PEACOCK.gold],
  [PEACOCK.blue, '#FFFFFF'],
  [PEACOCK.ruby, '#FFFFFF'],
  [PEACOCK.gold, PEACOCK.night],
  [PEACOCK.tealLight, PEACOCK.night],
]

// Same name, same colours: a tiny string hash picks the pair, so a show never changes colour.
function pairFor(text) {
  let hash = 0
  for (const ch of text) hash = (hash * 31 + ch.codePointAt(0)) >>> 0
  return PAIRS[hash % PAIRS.length]
}

// "Avatar: The Last Airbender" → "AT": the first letter of the first two words.
function initialsOf(name) {
  const words = name.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}]/gu, '')).filter(Boolean)
  return words
    .slice(0, 2)
    .map((w) => Array.from(w)[0])
    .join('')
    .toLocaleUpperCase()
}

// A stand-in for a poster: flat colour with the show's initials.
// The name is always written on the card too, so this picture is decorative.
export default function ShowArt({ name, className = '' }) {
  const [bg, ink] = pairFor(name)
  return (
    <div className={`sw-art ${className}`} style={{ background: bg, color: ink }} aria-hidden="true">
      <span className="sw-art__initials">{initialsOf(name)}</span>
    </div>
  )
}
