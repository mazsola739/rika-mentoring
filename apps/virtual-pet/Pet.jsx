// The creature, drawn from simple SVG shapes. Its face and pose follow the mood; CSS adds the motion.
const INK = '#111111'
const CREAM = '#EDE7DD'

// Darkens a hex colour by `amount` (0–1), for feet and arms.
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (shift) => Math.round(((n >> shift) & 255) * (1 - amount))
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`
}

function Eyes({ mood }) {
  const stroke = { fill: 'none', stroke: INK, strokeWidth: 5, strokeLinecap: 'round' }
  if (mood === 'happy') {
    return (
      <g>
        <path d="M84 114 Q95 101 106 114" {...stroke} />
        <path d="M134 114 Q145 101 156 114" {...stroke} />
      </g>
    )
  }
  if (mood === 'sleeping') {
    return (
      <g>
        <path d="M84 112 Q95 121 106 112" {...stroke} />
        <path d="M134 112 Q145 121 156 112" {...stroke} />
      </g>
    )
  }
  if (mood === 'tired') {
    return (
      <g>
        <path d="M85 110 A10 10 0 0 0 105 110 Z" fill={INK} />
        <path d="M135 110 A10 10 0 0 0 155 110 Z" fill={INK} />
        <path d="M83 110 H107 M133 110 H157" {...stroke} strokeWidth={3.5} />
      </g>
    )
  }
  const r = mood === 'hungry' ? 11 : 9
  return (
    <g className="vp-eyes--open">
      <circle cx="95" cy="112" r={r} fill={INK} />
      <circle cx="145" cy="112" r={r} fill={INK} />
      <circle cx="98.5" cy="108" r="3.2" fill="#fff" />
      <circle cx="148.5" cy="108" r="3.2" fill="#fff" />
      {mood === 'sad' && <path d="M81 95 L104 101 M159 95 L136 101" {...stroke} strokeWidth={4} />}
    </g>
  )
}

function Mouth({ mood }) {
  const stroke = { fill: 'none', stroke: INK, strokeWidth: 4.5, strokeLinecap: 'round' }
  switch (mood) {
    case 'happy':
      return (
        <g>
          <path d="M101 133 Q120 160 139 133 Z" fill={INK} strokeLinejoin="round" />
          <ellipse cx="120" cy="146" rx="8" ry="4.5" fill="#D97B66" />
        </g>
      )
    case 'hungry':
      return <ellipse cx="120" cy="141" rx="7" ry="8.5" fill={INK} />
    case 'sad':
      return <path d="M106 146 Q120 134 134 146" {...stroke} />
    case 'tired':
      return <path d="M107 141 Q113.5 137 120 141 Q126.5 145 133 141" {...stroke} />
    case 'sleeping':
      return <ellipse cx="120" cy="140" rx="4.5" ry="3.5" fill={INK} />
    default:
      return <path d="M106 136 Q120 147 134 136" {...stroke} />
  }
}

export default function Pet({ color, mood, stage, last, label }) {
  const droopy = mood === 'tired' || mood === 'sleeping'
  const cheekColor = color === '#D97B66' ? CREAM : '#D97B66'
  const cheekOpacity = mood === 'happy' ? 0.6 : mood === 'okay' ? 0.4 : 0.22
  const armsUp = mood === 'happy'
  const tip = color === '#7FD3D5' ? '#B995FF' : '#7FD3D5'

  return (
    <svg className="vp-svg" viewBox="0 0 240 240" role="img" aria-label={label}>
      <ellipse cx="120" cy="214" rx="64" ry="9" fill={INK} opacity="0.12" />

      <g className={`vp-pet is-${mood} is-${stage}`}>
        <g className="vp-pet__body">
          {/* antennae: upright when lively, drooping when tired or asleep */}
          <g fill="none" stroke={shade(color, 0.25)} strokeWidth="5" strokeLinecap="round">
            <path d={droopy ? 'M100 70 Q84 56 70 62' : 'M100 70 Q92 46 84 32'} />
            <path d={droopy ? 'M140 70 Q156 56 170 62' : 'M140 70 Q148 46 156 32'} />
          </g>
          <circle cx={droopy ? 70 : 84} cy={droopy ? 62 : 32} r="9" fill={tip} />
          <circle cx={droopy ? 170 : 156} cy={droopy ? 62 : 32} r="9" fill={tip} />

          <ellipse cx="92" cy="202" rx="21" ry="11" fill={shade(color, 0.3)} />
          <ellipse cx="148" cy="202" rx="21" ry="11" fill={shade(color, 0.3)} />

          <ellipse
            cx="50"
            cy={armsUp ? 118 : 146}
            rx="13"
            ry="22"
            fill={shade(color, 0.15)}
            transform={`rotate(${armsUp ? 40 : 18} 50 ${armsUp ? 118 : 146})`}
          />
          <ellipse
            cx="190"
            cy={armsUp ? 118 : 146}
            rx="13"
            ry="22"
            fill={shade(color, 0.15)}
            transform={`rotate(${armsUp ? -40 : -18} 190 ${armsUp ? 118 : 146})`}
          />

          <path d="M120 60 C172 60 198 100 198 142 C198 184 166 206 120 206 C74 206 42 184 42 142 C42 100 68 60 120 60 Z" fill={color} />
          <ellipse cx="120" cy="166" rx="46" ry="32" fill={CREAM} opacity="0.7" />

          <ellipse cx="78" cy="140" rx="11" ry="7" fill={cheekColor} opacity={cheekOpacity} />
          <ellipse cx="162" cy="140" rx="11" ry="7" fill={cheekColor} opacity={cheekOpacity} />
          <Eyes mood={mood} />
          <Mouth mood={mood} />
          {mood === 'sad' && <path className="vp-tear" d="M84 124 Q80 132 84 136 Q88 132 84 124 Z" fill="#7FD3D5" />}
        </g>

        {mood === 'sleeping' && (
          <g className="vp-zzz" fill={INK} fontFamily="Fraunces, Georgia, serif" fontWeight="700">
            <text x="176" y="70" fontSize="22">z</text>
            <text x="192" y="50" fontSize="17">z</text>
            <text x="204" y="34" fontSize="13">z</text>
          </g>
        )}
      </g>

      {/* A short effect after an action. The key restarts the CSS animation for every new action. */}
      {last?.type === 'feed' && last.result === 'ok' && (
        <g key={last.at} className="vp-fx vp-fx--berry">
          <circle cx="120" cy="140" r="11" fill="#D97B66" />
          <path d="M120 129 Q124 121 131 122" fill="none" stroke="#3A3A3A" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {last?.type === 'play' && last.result === 'ok' && (
        <g key={last.at} className="vp-fx vp-fx--ball">
          <circle cx="206" cy="196" r="14" fill="#7FD3D5" />
          <path d="M192 196 Q206 186 220 196" fill="none" stroke="#fff" strokeWidth="3" />
        </g>
      )}
    </svg>
  )
}
