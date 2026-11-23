// Szintjelző: egyre magasabb oszlopok, a kitöltöttek száma az érték (pl. nehézség, készségszint).
export default function LevelMeter({ value, max = 4, label, className = '' }) {
  return (
    <span className={`meter ${className}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`meter__bar${i < value ? ' is-on' : ''}`}
          style={{ height: `${Math.round(6 + (i * 10) / Math.max(max - 1, 1))}px` }}
        />
      ))}
    </span>
  )
}
