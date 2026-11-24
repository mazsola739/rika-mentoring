// The characters' pictures, drawn in code as SVG (a 200 × 200 canvas).
// Each species has its own simple body; a character's "look" picks the colours, the eyes,
// the mouth and a few accessories. Faded characters (touched by the Grey Drizzle) are drawn
// in washed-out colours with a little grey rain around them.

const INK = '#1F2440'
const GREY = '#C3C8D0'

// ── Colour helpers ─────────────────────────────────────
const rgb = (hex) => {
  const n = Number.parseInt(hex.slice(1), 16)
  return [n >> 16, (n >> 8) & 255, n & 255]
}
const toHex = (channels) => '#' + channels.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const mix = (a, b, amount) => {
  const x = rgb(a)
  const y = rgb(b)
  return toHex(x.map((v, i) => v + (y[i] - v) * amount))
}
const darker = (c, amount = 0.2) => mix(c, '#000000', amount)
const lighter = (c, amount = 0.4) => mix(c, '#FFFFFF', amount)

// ── Small drawing helpers ──────────────────────────────
const f = (n) => Math.round(n * 10) / 10
const circle = (cx, cy, r, fill, extra = '') => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}"${extra}/>`
const ellipse = (cx, cy, rx, ry, fill, extra = '') =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${extra}/>`
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const line = (d, stroke, width) =>
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${f(width)}" stroke-linecap="round" stroke-linejoin="round"/>`
const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)]

// A closed, smooth shape through points (quadratic curves between the midpoints).
function smooth(points) {
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const start = mid(points.at(-1), points[0])
  let d = `M${f(start[0])} ${f(start[1])}`
  points.forEach((p, i) => {
    const m = mid(p, points[(i + 1) % points.length])
    d += ` Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`
  })
  return d + ' Z'
}

// A four-pointed sparkle.
const sparkle = (x, y, r, fill) =>
  path(
    `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`,
    fill,
  )

// ── Faces ──────────────────────────────────────────────
function eyes({ cx, cy, gap, r }, kind, c) {
  const one = (x, k) => {
    if (k === 'happy')
      return line(
        `M${f(x - r * 1.2)} ${f(cy + r * 0.5)} Q${f(x)} ${f(cy - r * 1.3)} ${f(x + r * 1.2)} ${f(cy + r * 0.5)}`,
        c.ink,
        r * 0.75,
      )
    if (k === 'sleepy')
      return line(
        `M${f(x - r * 1.2)} ${f(cy - r * 0.2)} Q${f(x)} ${f(cy + r * 1.2)} ${f(x + r * 1.2)} ${f(cy - r * 0.2)}`,
        c.ink,
        r * 0.7,
      )
    if (k === 'wide')
      return (
        circle(x, cy, r * 1.75, '#FFFFFF', ` stroke="${c.ink}" stroke-width="${f(r * 0.3)}"`) +
        circle(x + r * 0.25, cy + r * 0.15, r * 0.95, c.ink) +
        circle(x - r * 0.1, cy - r * 0.3, r * 0.36, '#FFFFFF')
      )
    return circle(x, cy, r, c.ink) + circle(x - r * 0.35, cy - r * 0.4, r * 0.38, '#FFFFFF')
  }
  if (kind === 'wink') return one(cx - gap, 'dot') + one(cx + gap, 'happy')
  return one(cx - gap, kind) + one(cx + gap, kind)
}

function mouth({ cx, cy, w }, kind, c) {
  const stroke = Math.min(w * 0.3, 4.2)
  switch (kind) {
    case 'grin':
      return (
        path(
          `M${f(cx - w)} ${f(cy)} Q${f(cx)} ${f(cy + w * 1.5)} ${f(cx + w)} ${f(cy)} Z`,
          c.ink,
          ` stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"`,
        ) +
        path(
          `M${f(cx - w * 0.45)} ${f(cy + w * 0.5)} Q${f(cx)} ${f(cy + w * 0.25)} ${f(cx + w * 0.45)} ${f(cy + w * 0.5)} Q${f(cx)} ${f(cy + w * 0.8)} ${f(cx - w * 0.45)} ${f(cy + w * 0.5)} Z`,
          c.tongue,
        )
      )
    case 'o':
      return ellipse(cx, cy + w * 0.35, w * 0.42, w * 0.52, c.ink)
    case 'cat':
      return line(
        `M${f(cx - w)} ${f(cy)} Q${f(cx - w / 2)} ${f(cy + w * 0.9)} ${f(cx)} ${f(cy)} Q${f(cx + w / 2)} ${f(cy + w * 0.9)} ${f(cx + w)} ${f(cy)}`,
        c.ink,
        stroke,
      )
    case 'flat':
      return line(`M${f(cx - w * 0.7)} ${f(cy + 2)} Q${f(cx)} ${f(cy + w * 0.3)} ${f(cx + w * 0.7)} ${f(cy + 2)}`, c.ink, stroke)
    case 'beak':
      return path(
        `M${f(cx - w)} ${f(cy - 2)} Q${f(cx)} ${f(cy - 6)} ${f(cx + w)} ${f(cy - 2)} L${f(cx)} ${f(cy + w * 1.1)} Z`,
        c.beak,
        ` stroke="${darker(c.beak, 0.15)}" stroke-width="2" stroke-linejoin="round"`,
      )
    default:
      return line(`M${f(cx - w)} ${f(cy)} Q${f(cx)} ${f(cy + w * 1.1)} ${f(cx + w)} ${f(cy)}`, c.ink, stroke)
  }
}

function cheeks(a, c) {
  const { cx, cy, gap, r } = a.eyes
  const [y, dx] = a.cheeks ?? [cy + r * 2.3, gap + r * 1.5]
  const x = a.cheekX ?? cx
  return (
    ellipse(x - dx, y, r * 1.35, r * 0.8, c.cheek, ' opacity="0.7"') +
    ellipse(x + dx, y, r * 1.35, r * 0.8, c.cheek, ' opacity="0.7"')
  )
}

// ── Species ────────────────────────────────────────────
// Each returns the body as SVG and the anchors where the face and the accessories go.
const SPECIES_ART = {
  peafolk(c, look) {
    let s = ''
    // The tail fan behind: the peacock "eyes" are this world's favourite pattern.
    const [x0, y0] = [100, 166]
    s += path(
      `M${x0} ${y0} L${polar(x0, y0, 92, -84).map(f).join(' ')} A92 92 0 0 1 ${polar(x0, y0, 92, 84).map(f).join(' ')} Z`,
      lighter(c.accent, 0.55),
    )
    for (const deg of [-72, -48, -24, 0, 24, 48, 72]) {
      const [x, y] = polar(x0, y0, 80, deg)
      s += line(`M${x0} ${y0} L${f(x)} ${f(y)}`, darker(c.accent, 0.1), 3)
      s += ellipse(x, y, 13, 16, c.accent, ` transform="rotate(${deg} ${f(x)} ${f(y)})"`)
      s += ellipse(x, y + 1.5, 8, 10, c.body, ` transform="rotate(${deg} ${f(x)} ${f(y)})"`)
      s += circle(x, y + 2, 4, c.eyeSpot)
    }
    s += ellipse(100, 176, 40, 36, c.body)
    s += ellipse(100, 182, 24, 22, lighter(c.body, 0.25))
    // A small crest of three feathers, unless a hat covers it.
    if (!look.hat) {
      for (const deg of [-24, 0, 24]) {
        const [x, y] = polar(100, 64, 26, deg)
        s += line(`M100 64 L${f(x)} ${f(y)}`, darker(c.body, 0.25), 3)
        s += circle(x, y, 6, c.accent) + circle(x, y, 2.8, c.eyeSpot)
      }
    }
    s += circle(100, 100, 38, c.body)
    s += ellipse(100, 110, 26, 20, lighter(c.body, 0.3))
    return {
      art: s,
      a: {
        eyes: { cx: 100, cy: 96, gap: 15, r: 5.5 },
        mouth: { cx: 100, cy: 108, w: 8 },
        top: { x: 100, y: 66, w: 70 },
        side: { x: 130, y: 72 },
        neck: { x: 100, y: 140, w: 62 },
      },
    }
  },

  cloudwhale(c, look) {
    let s = ''
    // A spout of three little drops (moved aside when a hat sits on top).
    const [sx, sy] = look.hat ? [144, 24] : [100, 0]
    for (const [x, y, r] of [
      [sx - 12, sy + 32, 5],
      [sx, sy + 24, 6],
      [sx + 12, sy + 32, 5],
    ])
      s += path(`M${x} ${y - r * 1.6} Q${x + r} ${y} ${x} ${y + r} Q${x - r} ${y} ${x} ${y - r * 1.6} Z`, c.accent)
    s += line(`M${sx} ${sy + 52} L${sx} ${sy + 38}`, c.accent, 4)
    // The tail, then the cloudy body.
    s += path(
      'M148 126 Q170 118 176 96 Q190 104 194 96 Q192 120 176 132 Q190 142 194 158 Q180 152 170 150 Q160 144 146 140 Z',
      darker(c.body, 0.08),
    )
    s += path(
      smooth([
        [40, 150],
        [22, 128],
        [30, 100],
        [52, 86],
        [62, 66],
        [92, 52],
        [124, 60],
        [140, 82],
        [160, 100],
        [166, 130],
        [150, 156],
        [100, 166],
      ]),
      c.body,
    )
    s += path('M44 146 Q100 176 154 146 Q150 160 128 164 Q100 170 70 164 Q50 158 44 146 Z', c.belly)
    return {
      art: s,
      a: {
        eyes: { cx: 82, cy: 112, gap: 17, r: 5.5 },
        mouth: { cx: 82, cy: 128, w: 9 },
        top: { x: 96, y: 60, w: 60 },
        side: { x: 122, y: 62 },
        neck: { x: 90, y: 150, w: 70 },
      },
    }
  },

  robot(c, look) {
    let s = ''
    if (look.variant === 'teapot') {
      s += path('M50 112 Q24 106 18 80 L30 74 Q38 96 54 98 Z', darker(c.body, 0.08))
      s += line('M150 92 Q186 100 150 142', darker(c.body, 0.08), 12)
      s += `<rect x="48" y="70" width="104" height="96" rx="32" fill="${c.body}"/>`
      s += ellipse(100, 72, 42, 11, darker(c.body, 0.15))
      s += circle(100, 56, 9, c.accent)
      s += `<rect x="70" y="166" width="20" height="14" rx="5" fill="${darker(c.body, 0.2)}"/><rect x="110" y="166" width="20" height="14" rx="5" fill="${darker(c.body, 0.2)}"/>`
      s += `<rect x="64" y="92" width="72" height="50" rx="16" fill="${c.screen}"/>`
      return {
        art: s,
        a: {
          eyes: { cx: 100, cy: 110, gap: 15, r: 5.5 },
          mouth: { cx: 100, cy: 124, w: 9 },
          top: { x: 100, y: 60, w: 60 },
          side: { x: 128, y: 70 },
          neck: { x: 100, y: 160, w: 80 },
        },
      }
    }
    s += line('M100 62 L100 38', darker(c.body, 0.25), 4)
    s += circle(100, 34, 9, c.accent)
    s += `<rect x="62" y="146" width="76" height="54" rx="16" fill="${darker(c.body, 0.12)}"/>`
    s += `<rect x="40" y="88" width="16" height="32" rx="6" fill="${c.accent}"/><rect x="144" y="88" width="16" height="32" rx="6" fill="${c.accent}"/>`
    s += `<rect x="52" y="60" width="96" height="88" rx="22" fill="${c.body}"/>`
    s += `<rect x="64" y="74" width="72" height="56" rx="14" fill="${c.screen}"/>`
    s += circle(84, 170, 6, c.accent) + circle(100, 170, 6, lighter(c.accent, 0.4)) + circle(116, 170, 6, c.accent)
    return {
      art: s,
      a: {
        eyes: { cx: 100, cy: 96, gap: 16, r: 5.5 },
        mouth: { cx: 100, cy: 112, w: 10 },
        top: { x: 100, y: 62, w: 80 },
        side: { x: 136, y: 64 },
        neck: { x: 100, y: 150, w: 70 },
      },
    }
  },

  blotling(c, look) {
    let s = ''
    const R = look.small ? 46 : 58
    const cy = look.small ? 120 : 112
    const pts = Array.from({ length: 14 }, (_, i) => {
      const deg = i * (360 / 14)
      return polar(100, cy, R + (i % 2 ? 7 : -3), deg)
    })
    // Drips and splashes of ink.
    s +=
      ellipse(70, cy + R + 12, 7, 10, c.body) +
      circle(132, cy + R + 16, 6, c.body) +
      circle(40, cy + 30, 5, c.body) +
      circle(162, cy - 26, 4, c.body)
    s += path(smooth(pts), c.body)
    s += ellipse(80, cy - R * 0.45, R * 0.28, R * 0.16, lighter(c.body, 0.3), ' transform="rotate(-25 80 80)"')
    const k = look.small ? 0.85 : 1
    return {
      art: s,
      a: {
        eyes: { cx: 100, cy: cy - 8, gap: 20 * k, r: 6 * k },
        mouth: { cx: 100, cy: cy + 18, w: 11 * k },
        top: { x: 100, y: cy - R + 4, w: 70 },
        side: { x: 136, y: cy - R + 14 },
        neck: { x: 100, y: cy + R - 8, w: 70 },
      },
    }
  },

  prismite(c) {
    let s = ''
    s += path('M100 26 L152 72 L140 162 L100 188 L60 162 L48 72 Z', c.body)
    s += path('M100 26 L152 72 L100 82 L48 72 Z', lighter(c.body, 0.35))
    s += path('M48 72 L100 82 L100 188 L60 162 Z', darker(c.body, 0.08))
    s += path('M100 82 L152 72 L140 162 L100 188 Z', c.body)
    s += path('M62 82 L72 84 L78 150 L70 152 Z', lighter(c.body, 0.45), ' opacity="0.7"')
    s += sparkle(160, 44, 9, c.accent) + sparkle(38, 150, 7, c.accent)
    return {
      art: s,
      a: {
        eyes: { cx: 104, cy: 112, gap: 17, r: 5.5 },
        mouth: { cx: 104, cy: 132, w: 10 },
        top: { x: 100, y: 70, w: 84 },
        side: { x: 128, y: 56 },
        neck: { x: 100, y: 168, w: 70 },
      },
    }
  },

  human(c, look) {
    let s = ''
    const hair = c.hair
    // Hair that falls behind the head comes first.
    if (look.hair === 'long') s += path('M50 104 Q46 50 100 48 Q154 50 150 104 L156 176 Q100 188 44 176 Z', hair)
    if (look.hair === 'bob') s += path('M48 118 Q42 50 100 50 Q158 50 152 118 Q152 136 140 140 L60 140 Q48 136 48 118 Z', hair)
    if (look.hair === 'curly') for (let deg = -110; deg <= 110; deg += 22) s += circle(...polar(100, 98, 46, deg), 19, hair)
    if (look.hair === 'bun') s += circle(100, 50, 18, hair)
    s += path('M34 200 Q36 152 100 148 Q164 152 166 200 Z', c.clothes)
    if (look.hair === 'long')
      s += path('M52 150 Q60 160 70 200 L50 200 Q44 170 52 150 Z M148 150 Q140 160 130 200 L150 200 Q156 170 148 150 Z', hair)
    s += `<rect x="88" y="132" width="24" height="22" rx="6" fill="${darker(c.skin, 0.1)}"/>`
    s += path('M84 150 L100 166 L116 150 Z', darker(c.skin, 0.1))
    s += circle(57, 106, 9, c.skin) + circle(143, 106, 9, c.skin)
    s += circle(100, 100, 44, c.skin)
    // Hair in front: a fringe or a cap of hair.
    if (look.hair === 'bun' || look.hair === 'short')
      s += path('M56 104 Q52 54 100 54 Q148 54 144 104 Q138 80 118 74 Q100 84 76 76 Q60 84 56 104 Z', hair)
    if (look.hair === 'long') s += path('M56 100 Q58 56 100 56 Q142 56 144 100 Q130 80 110 72 Q96 86 70 82 Q60 88 56 100 Z', hair)
    if (look.hair === 'bob') s += path('M56 92 Q58 56 100 56 Q142 56 144 92 Q122 80 100 82 Q78 80 56 92 Z', hair)
    if (look.hair === 'curly') for (let x = 70; x <= 130; x += 15) s += circle(x, 64 + Math.abs(x - 100) * 0.12, 12, hair)
    s += line('M96 109 Q100 115 104 109', darker(c.skin, 0.28), 3)
    if (look.moustache) s += path('M100 116 Q88 112 78 120 Q86 124 100 119 Q114 124 122 120 Q112 112 100 116 Z', hair)
    return {
      art: s,
      a: {
        eyes: { cx: 100, cy: 100, gap: 17, r: 5 },
        mouth: { cx: 100, cy: look.moustache ? 126 : 122, w: look.moustache ? 7 : 10 },
        top: { x: 100, y: 60, w: 86 },
        side: { x: 134, y: 66 },
        neck: { x: 100, y: 150, w: 80 },
      },
    }
  },

  brushfox(c) {
    let s = ''
    // The tail is a paintbrush, dipped in paint.
    s += line('M120 176 Q186 170 172 100', c.body, 30)
    s += path('M158 104 Q156 64 180 46 Q196 70 186 104 Z', c.accent)
    s += circle(186, 120, 4, c.accent) + circle(178, 134, 3, c.accent)
    s += ellipse(100, 190, 44, 28, c.body)
    s += path('M56 84 L56 28 L94 66 Z', c.body) + path('M144 84 L144 28 L106 66 Z', c.body)
    s += path('M62 74 L62 42 L84 64 Z', c.inner) + path('M138 74 L138 42 L116 64 Z', c.inner)
    s += path('M48 96 Q50 60 100 60 Q150 60 152 96 Q152 132 100 164 Q48 132 48 96 Z', c.body)
    s += path('M64 112 Q84 102 100 112 Q116 102 136 112 Q130 142 100 164 Q70 142 64 112 Z', c.muzzle)
    s += ellipse(100, 128, 8, 6, c.line)
    return {
      art: s,
      a: {
        eyes: { cx: 100, cy: 96, gap: 22, r: 5.5 },
        mouth: { cx: 100, cy: 137, w: 7 },
        top: { x: 100, y: 66, w: 64 },
        side: { x: 136, y: 64 },
        neck: { x: 100, y: 168, w: 60 },
        cheeks: [116, 34],
      },
    }
  },

  puddlefrog(c, look) {
    let s = ''
    if (look.variant === 'tadpole') {
      s += line('M140 150 Q172 168 168 132 Q166 112 184 104', c.body, 14)
      s += ellipse(96, 128, 60, 48, c.body)
      s += circle(68, 92, 20, c.body) + circle(124, 92, 20, c.body)
      s += ellipse(96, 146, 36, 18, c.belly)
      return {
        art: s,
        a: {
          eyes: { cx: 96, cy: 92, gap: 28, r: 7 },
          mouth: { cx: 96, cy: 132, w: 10 },
          top: { x: 96, y: 72, w: 80 },
          side: { x: 124, y: 70 },
          neck: { x: 96, y: 168, w: 60 },
          cheeks: [120, 36],
        },
      }
    }
    s += ellipse(100, 182, 58, 32, c.body)
    s += ellipse(100, 124, 70, 48, c.body)
    s += circle(66, 84, 25, c.body) + circle(134, 84, 25, c.body)
    s += ellipse(100, 152, 42, 18, c.belly)
    s += ellipse(70, 194, 14, 7, darker(c.body, 0.15)) + ellipse(130, 194, 14, 7, darker(c.body, 0.15))
    return {
      art: s,
      a: {
        eyes: { cx: 100, cy: 84, gap: 34, r: 8 },
        mouth: { cx: 100, cy: 124, w: 22 },
        top: { x: 100, y: 64, w: 100 },
        side: { x: 134, y: 58 },
        neck: { x: 100, y: 166, w: 70 },
        cheeks: [116, 44],
      },
    }
  },

  glowmoth(c) {
    let s = ''
    s += circle(100, 104, 74, c.glow, ' opacity="0.55"')
    s +=
      ellipse(58, 92, 42, 30, c.accent, ' transform="rotate(-25 58 92)"') +
      ellipse(142, 92, 42, 30, c.accent, ' transform="rotate(25 142 92)"')
    s +=
      ellipse(70, 146, 28, 22, darker(c.accent, 0.12), ' transform="rotate(25 70 146)"') +
      ellipse(130, 146, 28, 22, darker(c.accent, 0.12), ' transform="rotate(-25 130 146)"')
    s += circle(52, 88, 11, lighter(c.accent, 0.5)) + circle(148, 88, 11, lighter(c.accent, 0.5))
    s += circle(52, 88, 5, c.tips) + circle(148, 88, 5, c.tips)
    s += ellipse(100, 146, 18, 36, darker(c.body, 0.1))
    s += line('M86 140 Q100 146 114 140 M88 156 Q100 162 112 156 M92 171 Q100 176 108 171', darker(c.body, 0.25), 3)
    s += line('M92 72 Q86 46 70 36', c.line, 3) + line('M108 72 Q114 46 130 36', c.line, 3)
    s += circle(70, 36, 7, c.tips) + circle(130, 36, 7, c.tips)
    for (let deg = 0; deg < 360; deg += 40) s += circle(...polar(100, 98, 28, deg), 8, c.body)
    s += circle(100, 98, 29, c.body)
    return {
      art: s,
      a: {
        eyes: { cx: 100, cy: 96, gap: 12, r: 4.5 },
        mouth: { cx: 100, cy: 108, w: 7 },
        top: { x: 100, y: 72, w: 46 },
        side: { x: 122, y: 76 },
        neck: { x: 100, y: 126, w: 44 },
      },
    }
  },

  capling(c, look) {
    let s = ''
    s += ellipse(100, 186, 40, 7, darker(c.bg, 0.08))
    s += `<rect x="62" y="90" width="76" height="94" rx="32" fill="${c.stem}"/>`
    s += path('M26 104 Q26 32 100 32 Q174 32 174 104 Q100 120 26 104 Z', c.body)
    if (look.spots !== false)
      for (const [x, y, r] of [
        [66, 62, 10],
        [104, 48, 7],
        [140, 70, 11],
        [46, 92, 6],
        [116, 90, 6],
        [86, 84, 5],
      ])
        s += circle(x, y, r, c.spots)
    else s += path('M40 96 Q100 108 160 96 Q100 116 40 96 Z', darker(c.body, 0.15))
    return {
      art: s,
      a: {
        eyes: { cx: 100, cy: 132, gap: 16, r: 5.5 },
        mouth: { cx: 100, cy: 150, w: 9 },
        top: { x: 100, y: 34, w: 90 },
        side: { x: 140, y: 40 },
        neck: { x: 100, y: 176, w: 64 },
      },
    }
  },

  snail(c, look) {
    let s = ''
    s += path('M30 182 Q28 160 60 156 L150 158 Q184 160 186 182 Z', c.body)
    // The shell with its spiral.
    s += circle(126, 116, 52, c.shell)
    const spiral = Array.from({ length: 40 }, (_, i) => polar(126, 116, 4 + i * 1.05, i * 22))
    s += line('M' + spiral.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L'), darker(c.shell, 0.22), 5)
    if (look.mark === 'bolt')
      s += path(
        'M130 82 L110 120 L126 120 L116 152 L144 108 L128 108 Z',
        c.accent,
        ` stroke="${darker(c.accent, 0.2)}" stroke-width="2" stroke-linejoin="round"`,
      )
    // Head and eye stalks.
    s += line('M44 104 L38 62', c.body, 7) + line('M64 104 L70 62', c.body, 7)
    s += `<rect x="28" y="96" width="52" height="88" rx="26" fill="${c.body}"/>`
    s +=
      circle(38, 60, 10, '#FFFFFF', ` stroke="${c.body}" stroke-width="4"`) +
      circle(70, 60, 10, '#FFFFFF', ` stroke="${c.body}" stroke-width="4"`)
    return {
      art: s,
      a: {
        eyes: { cx: 54, cy: 60, gap: 16, r: 4.8 },
        mouth: { cx: 54, cy: 132, w: 9 },
        top: { x: 54, y: 102, w: 52 },
        side: { x: 76, y: 98 },
        neck: { x: 54, y: 156, w: 52 },
        cheeks: [126, 16],
        cheekX: 54,
      },
    }
  },

  huewisp(c) {
    let s = ''
    s +=
      sparkle(40, 50, 10, c.accent) +
      sparkle(162, 70, 8, c.accent) +
      sparkle(150, 170, 6, c.accent) +
      sparkle(36, 150, 6, c.accent)
    s += path('M100 22 Q120 62 144 92 Q170 128 152 162 Q134 192 100 192 Q66 192 48 162 Q30 128 56 92 Q80 62 100 22 Z', c.body)
    s += path('M100 66 Q114 92 130 112 Q146 140 132 162 Q118 180 100 180 Q82 180 68 162 Q54 140 70 112 Q86 92 100 66 Z', c.inner)
    return {
      art: s,
      a: {
        eyes: { cx: 100, cy: 136, gap: 18, r: 6 },
        mouth: { cx: 100, cy: 154, w: 10 },
        top: { x: 100, y: 60, w: 50 },
        side: { x: 124, y: 84 },
        neck: { x: 100, y: 176, w: 70 },
      },
    }
  },
}

// ── Accessories ────────────────────────────────────────
const ACCESSORIES = {
  cap({ top: { x, y, w } }, o) {
    const r = w * 0.5
    return (
      path(
        `M${f(x - r)} ${f(y + 4)} Q${f(x - r)} ${f(y - r * 0.9)} ${f(x)} ${f(y - r * 0.95)} Q${f(x + r)} ${f(y - r * 0.9)} ${f(x + r)} ${f(y + 4)} Z`,
        o.color,
      ) +
      `<rect x="${f(x - r - 2)}" y="${f(y - 6)}" width="${f(w + 4)}" height="12" rx="4" fill="${o.band}"/>` +
      path(`M${f(x - r + 4)} ${f(y + 6)} Q${f(x + 6)} ${f(y + 22)} ${f(x + r + 8)} ${f(y + 6)} Z`, darker(o.band, 0.25)) +
      circle(x, y - r * 0.4, 6, o.badge ?? '#FEB800')
    )
  },
  tophat({ top: { x, y, w } }, o) {
    return (
      ellipse(x, y, w * 0.62, 8, o.color) +
      `<rect x="${f(x - w * 0.36)}" y="${f(y - w * 0.66)}" width="${f(w * 0.72)}" height="${f(w * 0.66)}" rx="5" fill="${o.color}"/>` +
      `<rect x="${f(x - w * 0.36)}" y="${f(y - 16)}" width="${f(w * 0.72)}" height="9" fill="${o.band}"/>`
    )
  },
  bowler({ top: { x, y, w } }, o) {
    return (
      ellipse(x, y, w * 0.62, 8, o.color) +
      path(
        `M${f(x - w * 0.42)} ${f(y)} Q${f(x - w * 0.42)} ${f(y - w * 0.5)} ${f(x)} ${f(y - w * 0.5)} Q${f(x + w * 0.42)} ${f(y - w * 0.5)} ${f(x + w * 0.42)} ${f(y)} Z`,
        o.color,
      ) +
      `<rect x="${f(x - w * 0.42)}" y="${f(y - 10)}" width="${f(w * 0.84)}" height="7" fill="${o.band}"/>`
    )
  },
  beret({ top: { x, y, w } }, o) {
    return (
      ellipse(x + 6, y - 6, w * 0.58, 15, o.color, ` transform="rotate(-10 ${x + 6} ${y - 6})"`) +
      circle(x + 4, y - 22, 4.5, o.color)
    )
  },
  rainhat({ top: { x, y, w } }, o) {
    return (
      path(
        `M${f(x - w * 0.68)} ${f(y + 10)} Q${f(x)} ${f(y - 12)} ${f(x + w * 0.68)} ${f(y + 10)} Q${f(x)} ${f(y + 2)} ${f(x - w * 0.68)} ${f(y + 10)} Z`,
        darker(o.color, 0.1),
      ) +
      path(
        `M${f(x - w * 0.34)} ${f(y + 1)} Q${f(x - w * 0.3)} ${f(y - w * 0.42)} ${f(x)} ${f(y - w * 0.42)} Q${f(x + w * 0.3)} ${f(y - w * 0.42)} ${f(x + w * 0.34)} ${f(y + 1)} Z`,
        o.color,
      )
    )
  },
  dome({ top: { x, y, w } }, o) {
    const r = w * 0.48
    let s = path(`M${f(x - r)} ${f(y + 6)} A${f(r)} ${f(r * 0.9)} 0 0 1 ${f(x + r)} ${f(y + 6)} Z`, o.color)
    s += `<rect x="${f(x - r - 4)}" y="${f(y + 2)}" width="${f(r * 2 + 8)}" height="9" rx="4" fill="${darker(o.color, 0.18)}"/>`
    if (o.lamp) s += circle(x, y - r * 0.45, 9, '#FEB800') + circle(x, y - r * 0.45, 4.5, '#FFF6C9')
    if (o.stripe)
      s += path(
        `M${f(x - 5)} ${f(y - r * 0.88)} L${f(x + 5)} ${f(y - r * 0.88)} L${f(x + 5)} ${f(y + 3)} L${f(x - 5)} ${f(y + 3)} Z`,
        o.stripe,
      )
    return s
  },
  crown({ top: { x, y, w } }, o) {
    const h = 26
    const l = x - w * 0.3
    const r = x + w * 0.3
    return (
      path(
        `M${f(l)} ${f(y + 4)} L${f(l - 4)} ${f(y - h)} L${f(x - w * 0.15)} ${f(y - h * 0.4)} L${f(x)} ${f(y - h - 6)} L${f(x + w * 0.15)} ${f(y - h * 0.4)} L${f(r + 4)} ${f(y - h)} L${f(r)} ${f(y + 4)} Z`,
        o.color ?? '#FEB800',
        ' stroke="#E0A000" stroke-width="2" stroke-linejoin="round"',
      ) +
      circle(x, y - 6, 4.5, o.gem ?? '#F70677') +
      circle(l - 4, y - h, 3.5, o.color ?? '#FEB800') +
      circle(r + 4, y - h, 3.5, o.color ?? '#FEB800') +
      circle(x, y - h - 6, 3.5, o.color ?? '#FEB800')
    )
  },
  flower({ side: { x, y } }, o) {
    let s = ''
    for (let deg = 0; deg < 360; deg += 72) s += circle(...polar(x, y, 9, deg), 8, o.color)
    return s + circle(x, y, 6, o.center ?? '#FFFFFF')
  },
  bow({ side: { x, y } }, o) {
    return (
      path(
        `M${x} ${y} L${x - 18} ${y - 12} Q${x - 22} ${y} ${x - 18} ${y + 12} Z M${x} ${y} L${x + 18} ${y - 12} Q${x + 22} ${y} ${x + 18} ${y + 12} Z`,
        o.color,
        ' stroke-linejoin="round"',
      ) + circle(x, y, 6, darker(o.color, 0.15))
    )
  },
  bowtie({ neck: { x, y } }, o) {
    return (
      path(
        `M${x} ${y} L${x - 18} ${y - 11} L${x - 18} ${y + 11} Z M${x} ${y} L${x + 18} ${y - 11} L${x + 18} ${y + 11} Z`,
        o.color,
        ' stroke-linejoin="round"',
      ) + circle(x, y, 5.5, darker(o.color, 0.2))
    )
  },
  scarf({ neck: { x, y, w } }, o) {
    return (
      `<rect x="${f(x + w * 0.12)}" y="${f(y)}" width="16" height="40" rx="6" fill="${darker(o.color, 0.12)}" transform="rotate(12 ${f(x + w * 0.12)} ${f(y)})"/>` +
      `<rect x="${f(x - w / 2)}" y="${f(y - 9)}" width="${f(w)}" height="18" rx="9" fill="${o.color}"/>` +
      `<rect x="${f(x - w / 2 + 12)}" y="${f(y - 9)}" width="8" height="18" fill="${o.stripe ?? lighter(o.color, 0.45)}"/>` +
      `<rect x="${f(x + w / 2 - 22)}" y="${f(y - 9)}" width="8" height="18" fill="${o.stripe ?? lighter(o.color, 0.45)}"/>`
    )
  },
  glasses({ eyes: { cx, cy, gap, r } }, o) {
    const R = r * 2.3
    return (
      circle(cx - gap, cy, R, '#FFFFFF', ` fill-opacity="0.25" stroke="${o.color}" stroke-width="3.5"`) +
      circle(cx + gap, cy, R, '#FFFFFF', ` fill-opacity="0.25" stroke="${o.color}" stroke-width="3.5"`) +
      line(`M${f(cx - gap + R)} ${f(cy - 1)} Q${f(cx)} ${f(cy - 5)} ${f(cx + gap - R)} ${f(cy - 1)}`, o.color, 3.5)
    )
  },
  monocle({ eyes: { cx, cy, gap, r } }, o) {
    const x = cx + gap
    return (
      circle(x, cy, r * 2.4, '#FFFFFF', ` fill-opacity="0.25" stroke="${o.color}" stroke-width="3.5"`) +
      line(
        `M${f(x + r * 1.6)} ${f(cy + r * 1.8)} Q${f(x + r * 3.2)} ${f(cy + r * 6)} ${f(x + r * 1.2)} ${f(cy + r * 9)}`,
        o.color,
        2,
      )
    )
  },
  goggles({ eyes: { cx, cy, gap, r }, top: { w } }, o) {
    const y = cy - r * 4.2
    return (
      `<rect x="${f(cx - w * 0.52)}" y="${f(y - 4)}" width="${f(w * 1.04)}" height="8" rx="4" fill="${darker(o.color, 0.2)}"/>` +
      circle(cx - gap, y, 11, o.lens ?? '#9FE3F5', ` stroke="${o.color}" stroke-width="5"`) +
      circle(cx + gap, y, 11, o.lens ?? '#9FE3F5', ` stroke="${o.color}" stroke-width="5"`) +
      circle(cx - gap - 3, y - 3, 3, '#FFFFFF') +
      circle(cx + gap - 3, y - 3, 3, '#FFFFFF')
    )
  },
}

// Accessories drawn under the face (around the neck) and over it (hats, glasses).
const UNDER_FACE = new Set(['scarf', 'bowtie'])

// ── The characters' looks ──────────────────────────────
// bg: background, body: main colour, accent: second colour; the rest depends on the species.
const LOOKS = {
  1: { bg: '#CDEFF7', body: '#0197D8', accent: '#01C5AC', eyeSpot: '#013E8E', eyes: 'wide', mouth: 'beak', cheeks: true },
  2: {
    bg: '#FFE9C7',
    body: '#8DB4EE',
    belly: '#F4F8FF',
    accent: '#0197D8',
    eyes: 'happy',
    mouth: 'smile',
    cheeks: true,
    acc: [['cap', { color: '#FFFFFF', band: '#013E8E' }]],
  },
  3: {
    bg: '#FFE3C2',
    body: '#FD7701',
    accent: '#FEB800',
    screen: '#18264A',
    ink: '#FFD25E',
    eyes: 'happy',
    mouth: 'smile',
    variant: 'teapot',
  },
  4: { bg: '#F2E0FF', body: '#6A2BD9', eyes: 'wide', mouth: 'grin', cheeks: true },
  5: { bg: '#E3F4FF', body: '#9C82FF', accent: '#01C5AC', eyes: 'dot', mouth: 'smile', acc: [['glasses', { color: INK }]] },
  6: {
    bg: '#FFE2EC',
    skin: '#F1C7A3',
    hair: '#D5DAE1',
    clothes: '#017B6B',
    hairStyle: 'bun',
    eyes: 'happy',
    mouth: 'smile',
    cheeks: true,
    acc: [['glasses', { color: '#9A03B7' }]],
  },
  7: {
    bg: '#DDF1FF',
    body: '#E8662C',
    accent: '#0197D8',
    inner: '#FFC7A8',
    muzzle: '#FFF4E8',
    eyes: 'dot',
    mouth: 'cat',
    acc: [['beret', { color: '#F70677' }]],
  },
  8: {
    bg: '#E3F5DA',
    body: '#4FB35A',
    belly: '#CDEFB8',
    eyes: 'wide',
    mouth: 'smile',
    cheeks: true,
    acc: [['rainhat', { color: '#FEB800' }]],
  },
  9: {
    bg: '#24306B',
    body: '#F6E7C8',
    accent: '#B59CFF',
    glow: '#4A57A8',
    tips: '#FEB800',
    eyes: 'dot',
    mouth: 'smile',
    cheeks: true,
  },
  10: {
    bg: '#E2F0FB',
    body: '#F2C9A0',
    shell: '#0197D8',
    eyes: 'dot',
    mouth: 'smile',
    cheeks: true,
    acc: [['cap', { color: '#F70677', band: '#9A0350', badge: '#FFFFFF' }]],
  },
  11: {
    bg: '#E6F4E8',
    body: '#D9622B',
    stem: '#FFF1DC',
    spots: '#FFF6EA',
    eyes: 'dot',
    mouth: 'smile',
    cheeks: true,
    acc: [['bowtie', { color: '#013E8E' }]],
  },
  12: {
    bg: '#E4E6EC',
    skin: '#E9C1A0',
    hair: '#5B5F6B',
    clothes: '#4A5368',
    hairStyle: 'bald',
    moustache: true,
    eyes: 'sleepy',
    mouth: 'flat',
    acc: [
      ['tophat', { color: '#363B4C', band: '#8A90A0' }],
      ['monocle', { color: '#C9A227' }],
    ],
  },
  13: { bg: '#D6EBFA', body: '#0197D8', inner: '#7FD3FF', accent: '#0197D8', eyes: 'sleepy', mouth: 'o' },
  14: {
    bg: '#FFF0C2',
    skin: '#8D5A3B',
    hair: '#2B1A12',
    clothes: '#FD7701',
    hairStyle: 'curly',
    eyes: 'dot',
    mouth: 'grin',
    cheeks: true,
    acc: [['flower', { color: '#FEB800', center: '#FD7701' }]],
  },
  15: { bg: '#D9F5EF', body: '#017B6B', eyes: 'wide', mouth: 'o', small: true, cheeks: true },
  16: { bg: '#DCE0F7', body: '#4D5FA8', belly: '#C9D2F2', accent: '#8FA2E8', eyes: 'sleepy', mouth: 'smile' },
  17: { bg: '#D8F3FF', body: '#A3B1C4', accent: '#01C5AC', screen: '#18264A', ink: '#7FF5E2', eyes: 'dot', mouth: 'smile' },
  18: {
    bg: '#E0F7F2',
    body: '#FF6F61',
    accent: '#01C5AC',
    eyeSpot: '#083F58',
    eyes: 'happy',
    mouth: 'beak',
    cheeks: true,
    acc: [['flower', { color: '#FF8FB8', center: '#FEB800' }]],
  },
  19: {
    bg: '#FFF0C9',
    body: '#F2A33A',
    accent: '#F70677',
    inner: '#FFD9A8',
    muzzle: '#FFF8EC',
    eyes: 'happy',
    mouth: 'smile',
    cheeks: true,
    acc: [['bow', { color: '#9A03B7' }]],
  },
  20: { bg: '#2C2A4A', body: '#EADFC8', accent: '#FF8FB8', glow: '#58507E', tips: '#FEB800', eyes: 'sleepy', mouth: 'flat' },
  21: {
    bg: '#FFF6B8',
    body: '#2FA36B',
    belly: '#D8F5C0',
    eyes: 'dot',
    mouth: 'grin',
    acc: [['cap', { color: '#FFFFFF', band: '#0197D8' }]],
  },
  22: {
    bg: '#E2F0FF',
    skin: '#C68B5E',
    hair: '#7A3E1D',
    clothes: '#013E8E',
    hairStyle: 'long',
    eyes: 'dot',
    mouth: 'smile',
    cheeks: true,
    acc: [['scarf', { color: '#01C5AC' }]],
  },
  23: { bg: '#FCE7D6', body: '#E9BD8F', shell: '#C47A3D', accent: '#FEB800', mark: 'bolt', eyes: 'wide', mouth: 'grin' },
  24: { bg: '#E9E4FF', body: '#FEB800', stem: '#FFF6E5', spots: false, eyes: 'happy', mouth: 'o', cheeks: true },
  25: {
    bg: '#FFE6F1',
    body: '#F70677',
    accent: '#FEB800',
    eyes: 'sleepy',
    mouth: 'flat',
    acc: [['dome', { color: '#FEB800', lamp: true }]],
  },
  26: { bg: '#FFF3C4', body: '#FEB800', inner: '#FFE98A', accent: '#FD7701', eyes: 'happy', mouth: 'grin', cheeks: true },
  27: {
    bg: '#FDE0EC',
    body: '#E0157A',
    accent: '#FEB800',
    eyeSpot: '#013E8E',
    eyes: 'dot',
    mouth: 'beak',
    acc: [['cap', { color: '#013E8E', band: '#0A2A66' }]],
  },
  28: {
    bg: '#E3E4EA',
    skin: '#D8B49A',
    hair: '#3A3F4B',
    clothes: '#3A3F4B',
    hairStyle: 'short',
    eyes: 'wink',
    mouth: 'smile',
    acc: [
      ['scarf', { color: '#8A90A0' }],
      ['bowler', { color: '#2A2E3A', band: '#6B7182' }],
    ],
  },
  29: { bg: '#E6F6DD', body: '#C8553D', accent: '#5CC65C', inner: '#FFB9A3', muzzle: '#FFF4E8', eyes: 'wide', mouth: 'grin' },
  30: { bg: '#FFF6B8', body: '#01C5AC', accent: '#F70677', screen: '#18264A', ink: '#FFFFFF', eyes: 'happy', mouth: 'grin' },
  31: {
    bg: '#E8F6E0',
    body: '#017B6B',
    accent: '#FEB800',
    eyeSpot: '#9A03B7',
    eyes: 'dot',
    mouth: 'beak',
    acc: [['cap', { color: '#0197D8', band: '#013E8E' }]],
  },
  32: {
    bg: '#F0E4FF',
    skin: '#F3D2B5',
    hair: '#9A03B7',
    clothes: '#6C2BB8',
    hairStyle: 'bob',
    eyes: 'happy',
    mouth: 'smile',
    cheeks: true,
    acc: [['crown', {}]],
  },
  33: { bg: '#DDF3F7', body: '#5DBFD6', belly: '#CFF0F7', eyes: 'wide', mouth: 'o', variant: 'tadpole' },
  34: {
    bg: '#E4F6FF',
    body: '#F6B8D1',
    belly: '#FFF4F8',
    accent: '#F70677',
    eyes: 'wide',
    mouth: 'grin',
    cheeks: true,
    acc: [['bow', { color: '#F70677' }]],
  },
  35: { bg: '#E6E9EF', body: '#3B3F58', eyes: 'sleepy', mouth: 'flat' },
  36: {
    bg: '#E9F4FF',
    body: '#8A5432',
    stem: '#F7E7D0',
    spots: '#F3DDBA',
    eyes: 'dot',
    mouth: 'smile',
    acc: [['glasses', { color: INK }]],
  },
  37: { bg: '#D9F7EC', body: '#17B890', inner: '#A8F2D6', accent: '#017B6B', eyes: 'dot', mouth: 'smile', cheeks: true },
  38: { bg: '#E0F7F7', body: '#6FD8CF', accent: '#FF8FC8', eyes: 'sleepy', mouth: 'o' },
  39: {
    bg: '#FFE5D9',
    body: '#F4C27A',
    shell: '#F70677',
    accent: '#FEB800',
    mark: 'bolt',
    eyes: 'happy',
    mouth: 'grin',
    cheeks: true,
    acc: [['dome', { color: '#0197D8', stripe: '#FFFFFF' }]],
  },
  40: {
    bg: '#FFE6D2',
    body: '#FD7701',
    accent: '#9A03B7',
    eyeSpot: '#FEB800',
    eyes: 'dot',
    mouth: 'beak',
    acc: [['goggles', { color: '#8A5432' }]],
  },
}

const FALLBACK_LOOK = { bg: '#E4F1FB', body: '#0197D8', eyes: 'dot', mouth: 'smile' }
const HATS = new Set(['cap', 'tophat', 'bowler', 'beret', 'rainhat', 'dome', 'crown'])
const isDark = (hex) => {
  const [r, g, b] = rgb(hex)
  return 0.299 * r + 0.587 * g + 0.114 * b < 90
}

export function avatarSvg(character) {
  const look = LOOKS[character.id] ?? FALLBACK_LOOK
  const faded = character.status === 'Faded'
  // Faded characters keep a hint of their colour, mixed with the drizzle's grey.
  const tone = faded ? (colour) => mix(colour, GREY, 0.62) : (colour) => colour
  const c = { cheek: '#FF8FB0', tongue: '#FF6F8E', beak: '#FEB800', muzzle: '#FFF4E8', inner: '#FFFFFF', eyeSpot: INK, line: INK }
  for (const [key, value] of Object.entries(look)) if (typeof value === 'string' && value.startsWith('#')) c[key] = value
  for (const key of Object.keys(c)) c[key] = tone(c[key])
  c.accent ??= c.body
  // Face lines stay dark enough to read, even on a faded character (robots have their own LED colour).
  c.ink = look.ink ?? (faded ? mix(INK, GREY, 0.3) : INK)

  const acc = look.acc ?? []
  const draw = SPECIES_ART[character.species] ?? SPECIES_ART.blotling
  const { art, a } = draw(c, { ...look, hair: look.hairStyle, hat: acc.some(([kind]) => HATS.has(kind)) })
  const accessories = acc.map(([kind, options]) => {
    const toned = Object.fromEntries(Object.entries(options).map(([k, v]) => [k, typeof v === 'string' ? tone(v) : v]))
    return [kind, ACCESSORIES[kind](a, toned)]
  })
  const layer = (under) =>
    accessories
      .filter(([kind]) => UNDER_FACE.has(kind) === under)
      .map(([, svg]) => svg)
      .join('')

  let s = `<rect width="200" height="200" fill="${c.bg}"/>`
  s += circle(100, 106, 84, lighter(c.bg, isDark(c.bg) ? 0.08 : 0.4))
  if (faded)
    for (const [x, y] of [
      [26, 34],
      [174, 28],
      [18, 118],
      [182, 150],
      [56, 14],
      [150, 186],
    ])
      s += path(`M${x} ${y - 8} Q${x + 6} ${y + 2} ${x} ${y + 6} Q${x - 6} ${y + 2} ${x} ${y - 8} Z`, darker(c.bg, 0.18))
  s += art + layer(true)
  if (look.cheeks) s += cheeks(a, c)
  s += eyes(a.eyes, look.eyes, c) + mouth(a.mouth, look.mouth, c) + layer(false)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="300" height="300">${s}</svg>`
}
