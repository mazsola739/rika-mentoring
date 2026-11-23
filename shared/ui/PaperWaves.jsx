import { useId } from 'react'
import { FRONT_LAYERS } from './card-art.js'

// The paper-cut waves of the lesson card front (traced from the business-card reference),
// for the lesson page header. Colors come from CSS variables:
//   --wave-1 (darkest layer) · --wave-2 (middle) · --wave-3 (lightest, at the card's edge)
// The box shows the card's left part (its waves), not the plain base on the right; the shapes
// scale evenly and are cropped, never stretched, so they look like the card at any header size.
const BOX = '0 0 1100 1000'
const FILL = { f1: 'var(--wave-1)', f2: 'var(--wave-2)', f3: 'var(--wave-3)' }

export default function PaperWaves({ className = '' }) {
  const id = 'pw' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg className={`waves ${className}`} viewBox={BOX} preserveAspectRatio="xMinYMid slice" aria-hidden="true" focusable="false">
      <defs>
        {/* The same soft shadow as on the card: each layer casts it downward. */}
        <filter id={id} filterUnits="userSpaceOnUse" x="-200" y="-200" width="1500" height="1400">
          <feGaussianBlur in="SourceAlpha" stdDeviation="30" />
          <feOffset dx="0" dy="44.9" />
          <feComponentTransfer result="sh">
            <feFuncA type="linear" slope="0.6" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {FRONT_LAYERS.map((layer) => (
        <g key={layer.tone}>
          <path d={layer.d} fill={FILL[layer.tone]} filter={`url(#${id})`} />
          <path
            d={layer.rim}
            transform="translate(-2.2 0)"
            fill="none"
            stroke="rgb(255 255 255 / 0.18)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
    </svg>
  )
}
