import { useId } from 'react'
import { PEACOCK } from '@shared/ui/palette.js'

// Simple flat silhouettes, one per category, drawn on a 64 × 64 grid.
const SHAPES = {
  top: ['M22 8 10 14 4 28l10 4 2-6v32h32V26l2 6 10-4-6-14-12-6c-2.5 4-6 6-10 6s-7.5-2-10-6Z'],
  bottom: ['M17 6h30l4 52H37L32 24l-5 34H13Z'],
  shoes: ['M4 44v-8c0-6 4-12 10-14l8 6c4 3 10 3 14 3l14 4c6 2 10 5 10 9Z', 'M4 46h56v6H4Z'],
  accessory: ['M22 26v-6a10 10 0 0 1 20 0v6h-4v-6a6 6 0 0 0-12 0v6Z', 'M12 26h40l-4 30H16Z'],
}

// The icon is filled with the current CSS `fill` (the item's color). For multicolor items
// a two-color gradient is used instead; useId keeps the gradient id unique on the page.
const CategoryIcon = ({ category, multi = false, className = '' }) => {
  const gradientId = `wr-multi-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const paths = SHAPES[category] ?? SHAPES.top

  return (
    <svg className={`wr-icon ${className}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {multi && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={PEACOCK.ruby} />
            <stop offset="1" stopColor={PEACOCK.blue} />
          </linearGradient>
        </defs>
      )}
      {paths.map((d) => (
        <path key={d} d={d} style={multi ? { fill: `url(#${gradientId})` } : undefined} />
      ))}
    </svg>
  )
}

export default CategoryIcon
