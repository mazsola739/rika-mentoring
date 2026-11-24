import { PEACOCK } from '@shared/ui/palette.js'

// Flat SVG drawings of the shop items. Each drawing takes the product's main colour (c)
// and accent colour (a); the viewBox is 100 × 100 and the SVG is centred in its box.
const SHAPES = {
  scarf: (c, a) => (
    <g transform="rotate(-8 50 50)">
      <rect x="22" y="22" width="56" height="56" rx="3" fill={c} />
      <polygon points="22,22 78,22 78,78" fill="#fff" fillOpacity="0.14" />
      <rect x="26" y="26" width="48" height="48" rx="1.5" fill="none" stroke={a} strokeWidth="1.5" />
    </g>
  ),
  notebook: (c, a) => (
    <>
      <rect x="31" y="17" width="40" height="66" rx="3" fill={c} />
      <rect x="31" y="17" width="5" height="66" fill={PEACOCK.night} fillOpacity="0.2" />
      <rect x="40" y="29" width="18" height="9" rx="1.5" fill="#fff" />
      <rect x="62" y="17" width="3" height="66" fill={a} />
    </>
  ),
  tote: (c, a) => (
    <>
      <path d="M38 40v-8a12 12 0 0 1 24 0v8" fill="none" stroke={a} strokeWidth="4" strokeLinecap="round" />
      <rect x="26" y="38" width="48" height="46" rx="3" fill={c} />
      <rect x="26" y="70" width="48" height="5" fill={a} />
    </>
  ),
  print: (c, a) => (
    <>
      <rect x="28" y="15" width="44" height="66" fill="#fff" stroke={PEACOCK.night} strokeOpacity="0.12" />
      <rect x="32" y="19" width="36" height="58" fill={c} />
      <circle cx="50" cy="58" r="11" fill={a} />
      <rect x="32" y="58" width="36" height="19" fill={PEACOCK.night} />
    </>
  ),
  phone: (c, a) => (
    <>
      <rect x="35" y="14" width="30" height="72" rx="7" fill={c} />
      <rect x="38.5" y="17.5" width="12" height="12" rx="3.5" fill={a} />
      <circle cx="42" cy="21" r="2" fill="#fff" fillOpacity="0.35" />
      <circle cx="42" cy="26" r="2" fill="#fff" fillOpacity="0.35" />
      <circle cx="47" cy="23.5" r="1" fill="#fff" />
    </>
  ),
  umbrella: (c, a) => (
    <>
      <path d="M50 50v28a5 5 0 0 1-10 0" fill="none" stroke={PEACOCK.night} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 16v-5" stroke={PEACOCK.night} strokeWidth="3" strokeLinecap="round" />
      <path d="M16 50a34 34 0 0 1 68 0z" fill={c} />
      {/* Every second panel of the canopy in the accent colour. */}
      <path d="M50 50L25.96 25.96A34 34 0 0 1 50 16z" fill={a} />
      <path d="M50 50L74.04 25.96A34 34 0 0 1 84 50z" fill={a} />
    </>
  ),
}

export default function ProductVisual({ product, label, className = '' }) {
  const color = PEACOCK[product.color]
  const accent = PEACOCK[product.accent]
  const draw = SHAPES[product.kind] ?? SHAPES.notebook

  return (
    <div
      className={`rr-visual ${className}`}
      style={{ '--rr-color': color }}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        {draw(color, accent)}
      </svg>
    </div>
  )
}
