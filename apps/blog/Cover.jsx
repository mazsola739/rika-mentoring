import { coverFor } from './covers.js'

// First letter of the title. Array.from splits by code points, so an emoji stays in one piece.
const initialOf = (title = '') => (Array.from(title.trim())[0] ?? '').toLocaleUpperCase()

// A post cover: flat colour, a soft circle and the big initial of the title.
// The title is always printed next to it, so the cover is decorative (aria-hidden).
export default function Cover({ cover, title, className = '' }) {
  const { bg, ink } = coverFor(cover)

  return (
    <span className={`bl-art ${className}`} style={{ '--bl-bg': bg, '--bl-ink': ink }} aria-hidden="true">
      <span className="bl-art__initial">{initialOf(title)}</span>
    </span>
  )
}
