// Space art drawn in code for the lesson's picture API. Every picture is an SVG text built from
// gradients, SVG filters (feTurbulence makes the cloudy and rocky textures) and many small dots.
// A seeded random generator makes each picture come out exactly the same every time it is requested.
// The animated pictures ("videos") use CSS and SMIL animations, which also play inside an <img>.
// No imports: these are plain functions that return strings.

const W = 1200
const H = 800
const TAU = Math.PI * 2

const n1 = (v) => Math.round(v * 10) / 10 // shorter numbers make a smaller SVG
const n2 = (v) => Math.round(v * 100) / 100
const n4 = (v) => Math.round(v * 10000) / 10000 // noise frequencies are small numbers

// A small seeded random generator (mulberry32): the same text always gives the same sequence.
function seeded(text) {
  let h = 2166136261
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  let state = h >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const range = (min, max) => min + next() * (max - min)
  return {
    next,
    range,
    int: (min, max) => Math.floor(range(min, max + 1)),
    pick: (list) => list[Math.floor(next() * list.length)],
    // Roughly normal (bell-shaped) numbers, for star clouds that thin out toward the edges.
    gauss: () => (next() + next() + next() + next() - 2) * 1.73,
  }
}

// Collects <defs> and the visible elements of one picture, and hands out unique ids.
function createScene(seed) {
  const defs = []
  const body = []
  const glows = new Map()
  let counter = 0
  const scene = {
    r: seeded(seed),
    id: (prefix = 'x') => `${prefix}${++counter}`,
    def: (markup) => defs.push(markup),
    add: (markup) => body.push(markup),
    // A round glow: the color fades out from the middle of whatever shape uses it.
    glow(color, strength = 1) {
      const key = `${color}|${strength}`
      if (!glows.has(key)) {
        const id = scene.id('glow')
        scene.def(
          `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${strength}"/>` +
            `<stop offset=".18" stop-color="${color}" stop-opacity="${n2(strength * 0.55)}"/>` +
            `<stop offset=".5" stop-color="${color}" stop-opacity="${n2(strength * 0.16)}"/>` +
            `<stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`,
        )
        glows.set(key, id)
      }
      return `url(#${glows.get(key)})`
    },
    gradient(stops, attrs = '') {
      const id = scene.id('lg')
      scene.def(`<linearGradient id="${id}" ${attrs}>${stopsMarkup(stops)}</linearGradient>`)
      return `url(#${id})`
    },
    radial(stops, attrs = '') {
      const id = scene.id('rg')
      scene.def(`<radialGradient id="${id}" ${attrs}>${stopsMarkup(stops)}</radialGradient>`)
      return `url(#${id})`
    },
    blur(std) {
      const id = scene.id('blur')
      scene.def(
        `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${std}"/></filter>`,
      )
      return `url(#${id})`
    },
    toSvg({ width = W, height = H, style = '' } = {}) {
      return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${W} ${H}">` +
        (style ? `<style>${style}</style>` : '') +
        `<defs>${defs.join('')}</defs>${body.join('')}</svg>`
      )
    },
  }
  return scene
}

// [offset, color, opacity?] → <stop> elements
function stopsMarkup(stops) {
  return stops
    .map(([offset, color, opacity = 1]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${n2(opacity)}"/>`)
    .join('')
}

// ---------------------------------------------------------------- building blocks

function spaceBackground(s, { inner = '#0b1433', outer = '#02030a', x = 0.5, y = 0.45 } = {}) {
  const fill = s.radial(
    [
      [0, inner],
      [1, outer],
    ],
    `cx="${x}" cy="${y}" r="0.85"`,
  )
  s.add(`<rect width="${W}" height="${H}" fill="${fill}"/>`)
}

function skyGradient(s, stops, height = H) {
  s.add(`<rect width="${W}" height="${height}" fill="${s.gradient(stops, 'x1="0" y1="0" x2="0" y2="1"')}"/>`)
}

// Many dots in one go. Dots with the same color and similar opacity share one <path>, which keeps the SVG small.
function dots(list) {
  const groups = new Map()
  for (const { x, y, r, color, o = 1 } of list) {
    const level = Math.round(o * 8) / 8
    if (!level) continue
    const key = `${color}|${level}`
    const d = `M${n1(x - r)} ${n1(y)}a${n2(r)} ${n2(r)} 0 1 0 ${n2(2 * r)} 0a${n2(r)} ${n2(r)} 0 1 0 ${n2(-2 * r)} 0`
    groups.set(key, (groups.get(key) ?? '') + d)
  }
  let out = ''
  for (const [key, d] of groups) {
    const [color, o] = key.split('|')
    out += `<path d="${d}" fill="${color}"${o === '1' ? '' : ` opacity="${o}"`}/>`
  }
  return out
}

const STAR_COLORS = ['#ffffff', '#ffffff', '#e4ecff', '#cddcff', '#fff3dc', '#ffe3bd']

function starList(s, { count = 300, x = 0, y = 0, w = W, h = H, size = 1.3, colors = STAR_COLORS, keep } = {}) {
  const { r } = s
  const list = []
  for (let i = 0; i < count; i++) {
    const px = x + r.next() * w
    const py = y + r.next() * h
    const star = { x: px, y: py, r: 0.4 + r.next() ** 3 * size, color: r.pick(colors), o: 0.3 + r.next() * 0.7 }
    if (!keep || keep(star)) list.push(star)
  }
  return list
}

function starfield(s, options) {
  s.add(dots(starList(s, options)))
}

// A bright star with a soft glow and four thin diffraction spikes.
function brightStar(s, x, y, size = 2, color = '#ffffff', spikes = true) {
  let out = `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(size * 8)}" fill="${s.glow(color, 0.85)}"/>`
  if (spikes) {
    const l = size * 10
    const w = size * 0.2
    out +=
      `<path d="M${n1(x - l)} ${n1(y)}L${n1(x)} ${n1(y - w)}L${n1(x + l)} ${n1(y)}L${n1(x)} ${n1(y + w)}Z` +
      `M${n1(x)} ${n1(y - l)}L${n1(x + w)} ${n1(y)}L${n1(x)} ${n1(y + l)}L${n1(x - w)} ${n1(y)}Z" fill="${color}" opacity=".75"/>`
  }
  out += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(size * 0.8)}" fill="#ffffff"/>`
  s.add(out)
}

// A cloud of gas: an elliptical glow that a noise texture (feTurbulence) breaks up into wisps.
// `cut` decides how much of the noise is kept, `sharp` how crisp the edges are.
// With `veins`, only the thin creases of the noise are kept: a network of filaments.
function cloud(
  s,
  {
    x,
    y,
    rx,
    ry,
    color,
    stops,
    freq = 0.006,
    octaves = 5,
    cut = 0.42,
    sharp = 3,
    opacity = 1,
    angle = 0,
    blend = 'screen',
    veins = false,
  },
) {
  const fill = s.radial(
    stops ?? [
      [0, color, opacity],
      [0.55, color, opacity * 0.6],
      [1, color, 0],
    ],
  )
  const filter = s.id('cloud')
  s.def(
    `<filter id="${filter}" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="${veins ? 'turbulence' : 'fractalNoise'}" baseFrequency="${freq}" numOctaves="${octaves}" seed="${s.r.int(1, 9999)}"/>` +
      `<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 ${veins ? -sharp : sharp} 0 0 0 ${n2(veins ? cut * sharp : -cut * sharp)}" result="mask"/>` +
      `<feComposite in="SourceGraphic" in2="mask" operator="in"/></filter>`,
  )
  const rotate = angle ? ` transform="rotate(${n1(angle)} ${n1(x)} ${n1(y)})"` : ''
  const mix = blend === 'normal' ? '' : ` style="mix-blend-mode:${blend}"`
  s.add(
    `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${fill}" filter="url(#${filter})"${rotate}${mix}/>`,
  )
}

// A noise texture colored with a ramp of colors (dark → light), e.g. a planet's surface.
function surfaceFilter(s, { ramp, freq = 0.01, octaves = 5, contrast = 2.2 }) {
  const id = s.id('surface')
  const channel = (i) => ramp.map((hex) => n2(Number.parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16) / 255)).join(' ')
  const k = contrast
  const b = n2(0.5 - k / 2)
  s.def(
    `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${s.r.int(1, 9999)}"/>` +
      `<feColorMatrix type="matrix" values="${k} 0 0 0 ${b} ${k} 0 0 0 ${b} ${k} 0 0 0 ${b} 0 0 0 0 1"/>` +
      `<feComponentTransfer><feFuncR type="table" tableValues="${channel(0)}"/><feFuncG type="table" tableValues="${channel(1)}"/>` +
      `<feFuncB type="table" tableValues="${channel(2)}"/></feComponentTransfer>` +
      `<feComposite in2="SourceGraphic" operator="in"/></filter>`,
  )
  return `url(#${id})`
}

// Turns a shape into patches: only where the noise is above `cut` does the shape stay visible.
function patchFilter(s, { freq, octaves = 4, cut = 0.5, sharp = 6, blur = 0 }) {
  const id = s.id('patch')
  s.def(
    `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${s.r.int(1, 9999)}"/>` +
      `<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 ${sharp} 0 0 0 ${n2(-cut * sharp)}" result="mask"/>` +
      `<feComposite in="SourceGraphic" in2="mask" operator="in"${blur ? ' result="p"/>' : '/>'}` +
      (blur ? `<feGaussianBlur in="p" stdDeviation="${blur}"/>` : '') +
      `</filter>`,
  )
  return `url(#${id})`
}

// Rough, wavy edges: the noise pushes every pixel of the shape a little sideways.
function warpFilter(s, { freq = 0.02, octaves = 3, scale = 30, blur = 0, seed } = {}) {
  const id = s.id('warp')
  s.def(
    `<filter id="${id}" filterUnits="userSpaceOnUse" x="-100" y="-100" width="${W + 200}" height="${H + 200}" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed ?? s.r.int(1, 9999)}" result="n"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G"${blur ? ' result="d"/>' : '/>'}` +
      (blur ? `<feGaussianBlur in="d" stdDeviation="${blur}"/>` : '') +
      `</filter>`,
  )
  return `url(#${id})`
}

// Night side and limb darkening of a sphere lit from the direction `light` ([-1..1, -1..1]).
function sphereShade(s, x, y, R, { light = [-0.5, -0.4], night = 0.95, soft = 0.3 } = {}) {
  const fill = s.radial(
    [
      [0, '#000', 0],
      [soft, '#000', 0],
      [0.6, '#000', night * 0.5],
      [0.82, '#000', night * 0.88],
      [1, '#000', night],
    ],
    `cx="${n2(0.5 + light[0] * 0.5)}" cy="${n2(0.5 + light[1] * 0.5)}" r="0.95"`,
  )
  s.add(`<circle cx="${x}" cy="${y}" r="${R}" fill="${fill}"/>`)
}

// A smooth ridge line (hills or mountains) as a dark silhouette, optionally with pine trees on top.
function landscape(s, options) {
  const { markup, ridge } = landscapeMarkup(s, options)
  s.add(markup)
  return ridge
}

function landscapeMarkup(s, { base = 700, amp = 70, color = '#02040a', points = 9, trees = 0, treeHeight = [14, 40] } = {}) {
  const { r } = s
  const pts = Array.from({ length: points + 1 }, (_, i) => [(i * W) / points, base - r.next() * amp])
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  // Quadratic curves through the midpoints; the samples let us find the ridge height for the trees.
  const samples = []
  let start = pts[0]
  let d = `M0 ${H + 2}L${n1(start[0])} ${n1(start[1])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const end = mid(pts[i], pts[i + 1])
    for (let t = 0; t <= 1; t += 0.1) {
      const u = 1 - t
      samples.push([
        u * u * start[0] + 2 * u * t * pts[i][0] + t * t * end[0],
        u * u * start[1] + 2 * u * t * pts[i][1] + t * t * end[1],
      ])
    }
    d += `Q${n1(pts[i][0])} ${n1(pts[i][1])} ${n1(end[0])} ${n1(end[1])}`
    start = end
  }
  const last = pts.at(-1)
  d += `L${n1(last[0])} ${n1(last[1])}L${W} ${H + 2}Z`
  samples.push(last)
  const ridge = (x) => {
    const i = samples.findIndex((p) => p[0] >= x)
    if (i <= 0) return samples[Math.max(0, i)][1]
    const [a, b] = [samples[i - 1], samples[i]]
    return a[1] + ((b[1] - a[1]) * (x - a[0])) / Math.max(1, b[0] - a[0])
  }
  let forest = ''
  if (trees) {
    for (let x = r.range(0, 10); x < W; x += r.range(5, 26) / trees) {
      if (r.next() < 0.25) continue
      forest += pine(x, ridge(x) + 6, r.range(...treeHeight))
    }
  }
  return { markup: `<path d="${d}${forest}" fill="${color}"/>`, ridge }
}

function pine(x, y, h) {
  const w = h * 0.42
  return (
    `M${n1(x)} ${n1(y - h)}L${n1(x + w * 0.28)} ${n1(y - h * 0.62)}H${n1(x + w * 0.13)}L${n1(x + w * 0.4)} ${n1(y - h * 0.32)}` +
    `H${n1(x + w * 0.22)}L${n1(x + w * 0.5)} ${n1(y)}H${n1(x - w * 0.5)}L${n1(x - w * 0.22)} ${n1(y - h * 0.32)}` +
    `H${n1(x - w * 0.4)}L${n1(x - w * 0.13)} ${n1(y - h * 0.62)}H${n1(x - w * 0.28)}Z`
  )
}

function clipCircle(s, x, y, R) {
  const id = s.id('clip')
  s.def(`<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${R}"/></clipPath>`)
  return `url(#${id})`
}

// ---------------------------------------------------------------- nebulae and clusters

function nebula(s, p) {
  const { r } = s
  const [glowColor, mainColor, coreColor] = p.colors
  const x = p.x ?? 600
  const y = p.y ?? 400
  const angle = p.angle ?? r.range(-30, 30)
  spaceBackground(s, { inner: p.bg ?? '#0a1030' })
  starfield(s, { count: 420, size: 1.1 })
  cloud(s, { x, y, rx: 720, ry: 480, color: glowColor, freq: 0.0035, cut: 0.3, sharp: 1.7, opacity: 0.8, angle })
  cloud(s, {
    x: x + r.range(-80, 80),
    y: y + r.range(-50, 50),
    rx: 540,
    ry: 340,
    color: mainColor,
    freq: 0.0062,
    cut: 0.42,
    sharp: 2.6,
    angle: angle + r.range(-25, 25),
  })
  cloud(s, {
    x: x + r.range(-40, 40),
    y: y + r.range(-30, 30),
    rx: 280,
    ry: 200,
    color: coreColor,
    freq: 0.011,
    cut: 0.47,
    sharp: 3.2,
    opacity: 0.95,
    angle,
  })
  if (p.dust !== false) {
    cloud(s, {
      x: x + r.range(-220, 220),
      y: y + r.range(-120, 120),
      rx: 560,
      ry: 250,
      color: '#04050c',
      freq: 0.008,
      cut: 0.52,
      sharp: 5,
      opacity: 0.92,
      angle: angle + r.range(-40, 40),
      blend: 'normal',
    })
  }
  for (let i = 0; i < (p.bright ?? 5); i++) {
    brightStar(s, x + r.range(-240, 240), y + r.range(-160, 160), r.range(1.1, 2.4), r.pick(['#ffffff', '#dfe9ff', '#fff0dd']))
  }
  starfield(s, { count: 50, size: 1.8 })
}

function pillars(s) {
  const { r } = s
  spaceBackground(s, { inner: '#16424e', outer: '#04101a', y: 0.3 })
  starfield(s, { count: 380, size: 1.1 })
  cloud(s, { x: 600, y: 300, rx: 760, ry: 520, color: '#3fb7a0', freq: 0.0035, cut: 0.3, sharp: 1.6, opacity: 0.75 })
  cloud(s, { x: 640, y: 260, rx: 520, ry: 330, color: '#e8b25a', freq: 0.006, cut: 0.42, sharp: 2.4, opacity: 0.8 })
  cloud(s, { x: 600, y: 200, rx: 300, ry: 180, color: '#ffe6b0', freq: 0.01, cut: 0.48, sharp: 3, opacity: 0.6 })
  const columns = [
    { x: 360, top: 250, wb: 190, wt: 70, lean: 30 },
    { x: 640, top: 130, wb: 230, wt: 90, lean: -20 },
    { x: 900, top: 390, wb: 150, wt: 56, lean: 14 },
  ]
  const seed = r.int(1, 9999)
  const rough = warpFilter(s, { freq: 0.022, octaves: 4, scale: 46, seed })
  const roughGlow = warpFilter(s, { freq: 0.022, octaves: 4, scale: 46, seed, blur: 9 })
  const body = s.gradient(
    [
      [0, '#9a5528'],
      [0.25, '#5a2c14'],
      [1, '#160904'],
    ],
    'x1="0" y1="0" x2="0" y2="1"',
  )
  for (const c of columns) {
    const d = pillarPath(c)
    s.add(`<path d="${d}" fill="none" stroke="#ffd59a" stroke-width="16" opacity=".75" filter="${roughGlow}"/>`)
    s.add(`<path d="${d}" fill="${body}" filter="${rough}"/>`)
    s.add(
      `<ellipse cx="${c.x + c.lean}" cy="${c.top}" rx="${c.wt}" ry="${c.wt * 0.7}" fill="${s.glow('#ffe1a8', 0.55)}" style="mix-blend-mode:screen"/>`,
    )
  }
  starfield(s, { count: 40, size: 1.6 })
}

function pillarPath({ x, top, wb, wt, lean }) {
  const xl = x - wb / 2
  const xr = x + wb / 2
  const tx = x + lean
  return (
    `M${xl} ${H + 40}C${xl + wb * 0.12} ${top + (H - top) * 0.5} ${tx - wt * 0.7} ${top + 90} ${tx - wt / 2} ${top + 30}` +
    `Q${tx - wt * 0.4} ${top - 12} ${tx} ${top - 14}Q${tx + wt * 0.45} ${top - 10} ${tx + wt / 2} ${top + 36}` +
    `C${tx + wt * 0.8} ${top + 100} ${xr - wb * 0.12} ${top + (H - top) * 0.55} ${xr} ${H + 40}Z`
  )
}

function rosette(s) {
  const { r } = s
  spaceBackground(s, { inner: '#170a1c', outer: '#04030a' })
  starfield(s, { count: 420, size: 1.1 })
  const ring = (c, a) => [
    [0, c, 0],
    [0.3, c, a * 0.12],
    [0.52, c, a],
    [0.75, c, a * 0.7],
    [1, c, 0],
  ]
  cloud(s, { x: 600, y: 400, rx: 560, ry: 520, stops: ring('#ff3b5c', 0.95), freq: 0.006, cut: 0.38, sharp: 2.2 })
  cloud(s, { x: 610, y: 395, rx: 470, ry: 430, stops: ring('#ff8f6a', 0.7), freq: 0.012, cut: 0.48, sharp: 3.2 })
  cloud(s, {
    x: 590,
    y: 410,
    rx: 540,
    ry: 480,
    color: '#05030a',
    freq: 0.009,
    cut: 0.56,
    sharp: 6,
    opacity: 0.9,
    blend: 'normal',
  })
  for (let i = 0; i < 12; i++) {
    brightStar(s, 600 + r.gauss() * 70, 400 + r.gauss() * 60, r.range(1, 2.3), r.pick(['#e8f0ff', '#d4e2ff', '#ffffff']), i < 6)
  }
}

function darkGlobule(s) {
  const { r } = s
  spaceBackground(s, { inner: '#1e1712', outer: '#060507' })
  cloud(s, { x: 600, y: 400, rx: 1000, ry: 660, color: '#8a7055', freq: 0.004, cut: 0.25, sharp: 1.3, opacity: 0.75 })
  const [cx, cy, R0] = [600, 400, 215]
  const [p1, p2, p3] = [r.range(0, TAU), r.range(0, TAU), r.range(0, TAU)]
  const edge = (a) => R0 * (1 + 0.09 * Math.sin(3 * a + p1) + 0.05 * Math.sin(5 * a + p2) + 0.03 * Math.sin(8 * a + p3))
  // The cloud itself: a soft dark blob that hides the glow of the Milky Way behind it.
  let blob = ''
  for (let a = 0; a < TAU; a += 0.1)
    blob += `${blob ? 'L' : 'M'}${n1(cx + Math.cos(a) * edge(a) * 1.02)} ${n1(cy + Math.sin(a) * edge(a) * 1.02)}`
  s.add(`<path d="${blob}Z" fill="#040304" filter="${s.blur(22)}"/>`)
  const list = starList(s, { count: 3600, size: 1.05 })
    .map((star) => {
      const q = Math.hypot(star.x - cx, star.y - cy) / edge(Math.atan2(star.y - cy, star.x - cx))
      if (q < 0.95) return null
      // Near the edge the dust lets some light through, dimmed and reddened.
      if (q < 1.35)
        return { ...star, color: r.pick(['#ffb48a', '#ff9a6a', '#ffc7a0']), o: star.o * ((q - 0.95) / 0.4), r: star.r * 0.85 }
      return star
    })
    .filter(Boolean)
  s.add(dots(list))
  brightStar(s, 250, 180, 1.6, '#fff1dd')
  brightStar(s, 980, 640, 1.4)
  brightStar(s, 1010, 170, 1.1, '#e4ecff')
}

function filaments(s) {
  const { r } = s
  spaceBackground(s, { inner: '#0a1422', outer: '#03050b' })
  starfield(s, { count: 520, size: 1.2 })
  const veil = s.id('veil')
  s.def(
    `<filter id="${veil}" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="${r.int(1, 9999)}" result="warp"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="warp" scale="85" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
      `<feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="${r.int(1, 9999)}" result="fine"/>` +
      `<feColorMatrix in="fine" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 3 0 0 0 -0.9" result="mask"/>` +
      `<feComposite in="d" in2="mask" operator="in" result="broken"/>` +
      `<feGaussianBlur in="broken" stdDeviation="1.2" result="soft"/><feGaussianBlur in="broken" stdDeviation="10" result="halo"/>` +
      `<feMerge><feMergeNode in="halo"/><feMergeNode in="soft"/></feMerge></filter>`,
  )
  const arcs = (color, count, offset) => {
    let d = ''
    for (let i = 0; i < count; i++) {
      const R = 560 + i * 22 + r.range(-10, 10) + offset
      const a0 = r.range(-1.75, -1.2)
      const a1 = a0 + r.range(0.5, 1.1)
      const [cx, cy] = [180, 980]
      d += `M${n1(cx + R * Math.cos(a0))} ${n1(cy + R * Math.sin(a0))}A${R} ${R} 0 0 1 ${n1(cx + R * Math.cos(a1))} ${n1(cy + R * Math.sin(a1))}`
    }
    s.add(
      `<path d="${d}" fill="none" stroke="${color}" stroke-width="${r.int(4, 7)}" stroke-linecap="round" opacity=".9" filter="url(#${veil})" style="mix-blend-mode:screen"/>`,
    )
  }
  cloud(s, { x: 520, y: 420, rx: 560, ry: 380, color: '#3a6a8a', freq: 0.004, cut: 0.3, sharp: 1.5, opacity: 0.35 })
  arcs('#ff4d6d', 9, 30)
  arcs('#45e0d0', 10, 0)
  arcs('#7aa8ff', 6, -40)
  starfield(s, { count: 40, size: 1.6 })
}

function crab(s) {
  spaceBackground(s, { inner: '#0a0f22', outer: '#03040a' })
  starfield(s, { count: 450, size: 1.1 })
  const shape = { x: 600, y: 400, angle: -22 }
  cloud(s, { ...shape, rx: 350, ry: 250, color: '#6f8cff', freq: 0.006, cut: 0.22, sharp: 1.4, opacity: 0.85 })
  cloud(s, { ...shape, rx: 390, ry: 285, color: '#ff8a3d', freq: 0.009, octaves: 4, cut: 0.26, sharp: 6, veins: true })
  cloud(s, {
    ...shape,
    rx: 370,
    ry: 270,
    color: '#ff4d5a',
    freq: 0.014,
    octaves: 4,
    cut: 0.2,
    sharp: 7,
    opacity: 0.9,
    veins: true,
  })
  cloud(s, {
    ...shape,
    rx: 300,
    ry: 220,
    color: '#ffd9a0',
    freq: 0.02,
    octaves: 3,
    cut: 0.12,
    sharp: 9,
    opacity: 0.6,
    veins: true,
  })
  cloud(s, { ...shape, rx: 150, ry: 110, color: '#eef3ff', freq: 0.01, cut: 0.32, sharp: 2, opacity: 0.7 })
  brightStar(s, 606, 396, 1.6, '#e6eeff')
  starfield(s, { count: 40, size: 1.6 })
}

function ringNebula(s, p) {
  const { r } = s
  const { size = 230, aspect = 0.8, angle = 0, inner = '#7fd8ff', ring = '#3fe0a0', edge = '#ff5a4a', knots = false } = p
  spaceBackground(s, { inner: '#080d22', outer: '#02030a' })
  starfield(s, { count: 460, size: 1.1 })
  cloud(s, {
    x: 600,
    y: 400,
    rx: size * 1.9,
    ry: size * 1.9 * aspect,
    color: edge,
    freq: 0.008,
    cut: 0.35,
    sharp: 1.8,
    opacity: 0.35,
    angle,
  })
  const stops = [
    [0, inner, 0.5],
    [0.42, inner, 0.45],
    [0.6, ring, 0.85],
    [0.76, edge, 0.95],
    [0.9, edge, 0.35],
    [1, edge, 0],
  ]
  cloud(s, { x: 600, y: 400, rx: size, ry: size * aspect, stops, freq: 0.012, cut: 0.28, sharp: 2, angle })
  cloud(s, { x: 600, y: 400, rx: size * 1.02, ry: size * aspect * 1.02, stops, freq: 0.035, cut: 0.5, sharp: 4, angle })
  if (knots) {
    let d = ''
    for (let i = 0; i < 220; i++) {
      const a = r.range(0, TAU)
      const k = r.range(0.48, 0.62)
      const len = r.range(8, 22)
      const [ux, uy] = [Math.cos(a), Math.sin(a) * aspect]
      d += `M${n1(600 + ux * size * k)} ${n1(400 + uy * size * k)}l${n1(ux * len)} ${n1(uy * len)}`
    }
    s.add(
      `<path d="${d}" stroke="#ffd2b8" stroke-width="2" stroke-linecap="round" opacity=".2" transform="rotate(${angle} 600 400)"/>`,
    )
  }
  brightStar(s, 600, 400, 1.5, '#dff0ff', false)
}

function openCluster(s) {
  spaceBackground(s, { inner: '#081335', outer: '#02040d' })
  starfield(s, { count: 380, size: 1.1 })
  cloud(s, { x: 640, y: 400, rx: 650, ry: 440, color: '#4f7dff', freq: 0.004, cut: 0.3, sharp: 1.5, opacity: 0.75 })
  cloud(s, {
    x: 620,
    y: 380,
    rx: 440,
    ry: 300,
    color: '#8fb4ff',
    freq: '0.004 0.012',
    cut: 0.48,
    sharp: 3,
    opacity: 0.55,
    angle: 28,
  })
  cloud(s, { x: 660, y: 420, rx: 380, ry: 280, color: '#bcd2ff', freq: 0.012, cut: 0.5, sharp: 3.5, opacity: 0.6 })
  const sisters = [
    [600, 420, 3.2],
    [430, 445, 2.6],
    [452, 404, 1.8],
    [790, 362, 2.8],
    [722, 268, 2.5],
    [660, 212, 2.1],
    [752, 486, 2.4],
    [560, 566, 1.5],
    [884, 248, 1.4],
  ]
  for (const [x, y, size] of sisters) brightStar(s, x, y, size * 1.5, '#dde8ff')
}

function globular(s) {
  const { r } = s
  spaceBackground(s, { inner: '#0b0c16', outer: '#030308' })
  starfield(s, { count: 280, size: 1 })
  s.add(`<circle cx="600" cy="400" r="360" fill="${s.glow('#ffe2b0', 0.55)}"/>`)
  const colors = ['#fff6e5', '#ffe2b0', '#ffd08a', '#ffffff', '#cfe0ff', '#ffb27a']
  const list = []
  for (let i = 0; i < 2400; i++) {
    const spread = r.next() < 0.72 ? 95 : 210
    list.push({
      x: 600 + r.gauss() * spread,
      y: 400 + r.gauss() * spread,
      r: 0.45 + r.next() ** 3 * 1.4,
      color: r.pick(colors),
      o: r.range(0.45, 1),
    })
  }
  s.add(dots(list))
  s.add(`<circle cx="600" cy="400" r="110" fill="${s.glow('#fff4da', 0.7)}"/>`)
  for (let i = 0; i < 6; i++)
    brightStar(s, 600 + r.gauss() * 150, 400 + r.gauss() * 150, r.range(1.2, 2), r.pick(['#ffd9a8', '#e4ecff']))
}

// ---------------------------------------------------------------- galaxies

function spiral(s, p) {
  const { r } = s
  const {
    x = 600,
    y = 400,
    size = 330,
    tilt = 0.45,
    angle = -25,
    arms = 2,
    winding = 1.1,
    armColor = '#bcd2ff',
    core = '#ffe6bd',
    companion = false,
  } = p
  spaceBackground(s, { inner: '#0a1028', outer: '#02030a' })
  starfield(s, { count: 360, size: 1.1 })
  const armDots = []
  const dust = []
  let ridges = ''
  // A logarithmic spiral: the radius grows by the same factor on every turn, like in real galaxies.
  const turn = winding * TAU
  const grow = Math.log(1 / 0.12) / turn
  const at = (base, t) => [base + t * turn, size * 0.12 * Math.exp(grow * t * turn)]
  for (let k = 0; k < arms; k++) {
    const base = (k * TAU) / arms + r.range(-0.1, 0.1)
    let ridge = ''
    for (let t = 0; t <= 1.001; t += 0.02) {
      const [th, rho] = at(base, t)
      ridge += `${ridge ? 'L' : 'M'}${n1(Math.cos(th) * rho)} ${n1(Math.sin(th) * rho)}`
    }
    ridges += ridge
    for (let i = 0; i < 1800 / arms; i++) {
      const t = r.next() ** 0.8
      const [th, rho] = at(base, t)
      const spread = size * 0.045 * (0.4 + t)
      armDots.push({
        x: Math.cos(th) * rho + r.gauss() * spread,
        y: Math.sin(th) * rho + r.gauss() * spread,
        r: r.range(0.6, 2.1),
        color: r.next() < 0.06 ? '#ff8fc8' : r.pick([armColor, '#ffffff', '#dfe8ff']),
        o: r.range(0.35, 0.95),
      })
      if (i % 3 === 0 && t > 0.12) {
        const dth = th - 0.2
        dust.push({
          x: Math.cos(dth) * rho * 0.97 + r.gauss() * spread * 0.6,
          y: Math.sin(dth) * rho * 0.97 + r.gauss() * spread * 0.6,
          r: r.range(1.4, 3.6),
          color: '#160b06',
          o: 0.5,
        })
      }
    }
  }
  for (let i = 0; i < 600; i++) {
    const rho = size * Math.min(1.15, -Math.log(1 - r.next() * 0.97) * 0.28)
    const th = r.range(0, TAU)
    armDots.push({
      x: Math.cos(th) * rho,
      y: Math.sin(th) * rho,
      r: r.range(0.5, 1.4),
      color: r.pick(['#fff3dc', '#ffffff', '#e4ecff']),
      o: r.range(0.25, 0.7),
    })
  }
  const armsId = s.id('arms')
  s.def(`<g id="${armsId}">${dots(armDots)}</g>`)
  const blur = s.blur(5)
  s.add(
    `<g transform="translate(${x} ${y}) rotate(${angle}) scale(1 ${tilt})">` +
      `<circle r="${n1(size * 1.2)}" fill="${s.glow('#8fb0ff', 0.45)}"/>` +
      `<path d="${ridges}" fill="none" stroke="${armColor}" stroke-width="${n1(size * 0.2)}" stroke-linecap="round" opacity=".22" filter="${s.blur(n1(size * 0.06))}"/>` +
      `<path d="${ridges}" fill="none" stroke="#e8efff" stroke-width="${n1(size * 0.07)}" stroke-linecap="round" opacity=".25" filter="${s.blur(n1(size * 0.025))}"/>` +
      `<use href="#${armsId}" filter="${blur}" opacity=".85"/><use href="#${armsId}"/>` +
      `<g filter="${s.blur(1.4)}">${dots(dust)}</g>` +
      `<circle r="${n1(size * 0.42)}" fill="${s.glow(core, 0.95)}"/><circle r="${n1(size * 0.13)}" fill="${s.glow('#ffffff', 1)}"/></g>`,
  )
  if (companion) {
    const [cx, cy] = [x + Math.cos(((angle + 40) * Math.PI) / 180) * size * 0.95, y + size * 0.62]
    s.add(
      `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="120" fill="${s.glow('#ffd9a8', 0.75)}"/><circle cx="${n1(cx)}" cy="${n1(cy)}" r="34" fill="${s.glow('#fff6e6', 1)}"/>`,
    )
  }
  starfield(s, { count: 30, size: 1.6 })
}

function sombrero(s) {
  const { r } = s
  spaceBackground(s, { inner: '#090b1c', outer: '#020309' })
  starfield(s, { count: 340, size: 1.1 })
  const halo = []
  for (let i = 0; i < 220; i++)
    halo.push({
      x: 600 + r.gauss() * 300,
      y: 400 + r.gauss() * 210,
      r: r.range(0.6, 1.4),
      color: '#ffe9c8',
      o: r.range(0.4, 0.9),
    })
  s.add(dots(halo))
  const bulge = s.radial([
    [0, '#fff6e2', 1],
    [0.18, '#ffe6c2', 0.9],
    [0.5, '#d9b48a', 0.35],
    [1, '#b08a60', 0],
  ])
  const disk = s.radial([
    [0, '#fff1d8', 0.9],
    [0.6, '#e8cfa8', 0.6],
    [0.9, '#d8b88a', 0.4],
    [1, '#d8b88a', 0],
  ])
  const front = s.id('front')
  s.def(`<clipPath id="${front}"><rect x="0" y="396" width="${W}" height="${H}"/></clipPath>`)
  s.add(
    `<g transform="rotate(-9 600 400)">` +
      `<ellipse cx="600" cy="400" rx="360" ry="230" fill="${bulge}"/>` +
      `<ellipse cx="600" cy="400" rx="440" ry="70" fill="${disk}" filter="${s.blur(3)}"/>` +
      `<ellipse cx="600" cy="404" rx="420" ry="56" fill="none" stroke="#f7e3c4" stroke-width="4" opacity=".2" filter="${s.blur(2)}"/>` +
      `<ellipse cx="600" cy="402" rx="405" ry="50" fill="none" stroke="#150c06" stroke-width="22" opacity=".92" clip-path="url(#${front})" filter="${s.blur(2.5)}"/>` +
      `<circle cx="600" cy="398" r="40" fill="${s.glow('#ffffff', 0.9)}"/></g>`,
  )
}

function irregular(s) {
  const { r } = s
  spaceBackground(s, { inner: '#0a1230', outer: '#02040c' })
  starfield(s, { count: 320, size: 1.1 })
  cloud(s, { x: 600, y: 410, rx: 470, ry: 260, color: '#9fb8ff', freq: 0.004, cut: 0.25, sharp: 1.4, opacity: 0.7, angle: -20 })
  const bar = []
  const a = (-20 * Math.PI) / 180
  for (let i = 0; i < 1800; i++) {
    const [u, v] = [r.gauss() * 230, r.gauss() * 75 + (r.next() < 0.3 ? r.gauss() * 90 : 0)]
    bar.push({
      x: 600 + u * Math.cos(a) - v * Math.sin(a),
      y: 410 + u * Math.sin(a) + v * Math.cos(a),
      r: r.range(0.5, 1.5),
      color: r.pick(['#ffffff', '#dfe8ff', '#cddcff', '#fff1dc']),
      o: r.range(0.4, 1),
    })
  }
  s.add(dots(bar))
  for (let i = 0; i < 7; i++) {
    s.add(
      `<circle cx="${n1(600 + r.range(-320, 320))}" cy="${n1(410 + r.range(-120, 120))}" r="${n1(r.range(30, 60))}" fill="${s.glow('#ff4f8a', 0.75)}" style="mix-blend-mode:screen"/>`,
    )
  }
  cloud(s, { x: 820, y: 330, rx: 130, ry: 105, color: '#ff5d7a', freq: 0.014, cut: 0.36, sharp: 2.4 })
  cloud(s, { x: 820, y: 330, rx: 60, ry: 50, color: '#ffd1dc', freq: 0.02, cut: 0.4, sharp: 3 })
  brightStar(s, 818, 332, 1.6, '#e8f0ff')
}

function collision(s) {
  const { r } = s
  spaceBackground(s, { inner: '#0b1026', outer: '#02030a' })
  starfield(s, { count: 380, size: 1.1 })
  const tail = (d, x1, y1, x2, y2) => {
    const stroke = s.gradient(
      [
        [0, '#d5e0ff', 0.75],
        [1, '#a9bfff', 0],
      ],
      `gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`,
    )
    s.add(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="70" stroke-linecap="round" filter="${s.blur(22)}"/>`)
    s.add(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="18" stroke-linecap="round" filter="${s.blur(6)}"/>`)
  }
  tail('M520 380C420 300 300 180 160 120', 520, 380, 160, 120)
  tail('M690 430C800 520 930 640 1110 690', 690, 430, 1110, 690)
  s.add(
    `<circle cx="520" cy="380" r="150" fill="${s.glow('#ffd9a0', 0.8)}"/><circle cx="690" cy="430" r="140" fill="${s.glow('#ffcf96', 0.8)}"/>`,
  )
  const knots = []
  for (let i = 0; i < 140; i++) {
    const [cx, cy] = r.next() < 0.5 ? [520, 380] : [690, 430]
    knots.push({
      x: cx + r.gauss() * 85,
      y: cy + r.gauss() * 70,
      r: r.range(1, 2.8),
      color: r.next() < 0.35 ? '#ff7ab8' : '#a9c8ff',
      o: r.range(0.5, 1),
    })
  }
  s.add(dots(knots))
  cloud(s, {
    x: 605,
    y: 405,
    rx: 170,
    ry: 70,
    color: '#0b0604',
    freq: 0.02,
    cut: 0.48,
    sharp: 4,
    opacity: 0.85,
    angle: 25,
    blend: 'normal',
  })
  s.add(
    `<circle cx="520" cy="380" r="34" fill="${s.glow('#fff6e6', 1)}"/><circle cx="690" cy="430" r="30" fill="${s.glow('#fff6e6', 1)}"/>`,
  )
}

function elliptical(s) {
  const { r } = s
  spaceBackground(s, { inner: '#0d0b18', outer: '#030308' })
  starfield(s, { count: 260, size: 1 })
  s.add(`<ellipse cx="600" cy="420" rx="520" ry="470" fill="${s.glow('#f5d6a8', 0.6)}"/>`)
  const gcs = []
  for (let i = 0; i < 500; i++)
    gcs.push({
      x: 600 + r.gauss() * 240,
      y: 420 + r.gauss() * 220,
      r: r.range(0.5, 1.2),
      color: '#ffe8c0',
      o: r.range(0.4, 0.85),
    })
  s.add(dots(gcs))
  s.add(`<ellipse cx="600" cy="420" rx="210" ry="195" fill="${s.glow('#ffeed2', 0.95)}"/>`)
  const jet = s.gradient(
    [
      [0, '#eaf2ff', 1],
      [0.6, '#a8c8ff', 0.6],
      [1, '#7fa8ff', 0],
    ],
    'gradientUnits="userSpaceOnUse" x1="600" y1="420" x2="960" y2="170"',
  )
  s.add(`<path d="M600 420L960 170" stroke="${jet}" stroke-width="14" stroke-linecap="round" filter="${s.blur(4)}"/>`)
  s.add(`<path d="M600 420L960 170" stroke="${jet}" stroke-width="4" stroke-linecap="round"/>`)
  for (const t of [0.25, 0.42, 0.6, 0.74])
    s.add(`<circle cx="${n1(600 + 360 * t)}" cy="${n1(420 - 250 * t)}" r="${n1(26 - t * 14)}" fill="${s.glow('#dbe8ff', 0.9)}"/>`)
  brightStar(s, 600, 420, 2.2, '#fff6e6', false)
}

function milkyWay(s) {
  const { r } = s
  skyGradient(s, [
    [0, '#03040b'],
    [0.55, '#0a1330'],
    [0.85, '#1b2f4a'],
    [1, '#2c3f55'],
  ])
  starfield(s, { count: 320, size: 1.1 })
  const band = []
  for (let i = 0; i < 2400; i++)
    band.push({
      x: r.range(-900, 900),
      y: r.gauss() * (r.next() < 0.7 ? 70 : 150),
      r: 0.4 + r.next() ** 3 * 1.3,
      color: r.pick(STAR_COLORS),
      o: r.range(0.35, 1),
    })
  s.add(`<g transform="translate(600 430) rotate(-32)">`)
  cloud(s, { x: 0, y: 0, rx: 950, ry: 170, color: '#c6d3ff', freq: '0.0025 0.008', cut: 0.3, sharp: 1.5, opacity: 0.6 })
  cloud(s, { x: 180, y: 10, rx: 420, ry: 140, color: '#ffcf9a', freq: '0.004 0.01', cut: 0.36, sharp: 2, opacity: 0.85 })
  s.add(dots(band))
  cloud(s, {
    x: 60,
    y: 6,
    rx: 820,
    ry: 64,
    color: '#05060c',
    freq: '0.003 0.014',
    cut: 0.5,
    sharp: 4,
    opacity: 0.9,
    blend: 'normal',
  })
  s.add('</g>')
  s.add(
    `<rect y="560" width="${W}" height="240" fill="${s.gradient(
      [
        [0, '#2f6a56', 0],
        [1, '#2f6a56', 0.3],
      ],
      'x1="0" y1="0" x2="0" y2="1"',
    )}"/>`,
  )
  landscape(s, { base: 705, amp: 80, trees: 1, color: '#020409' })
}

function blackHole(s) {
  spaceBackground(s, { inner: '#0a0a16', outer: '#020205' })
  starfield(s, { count: 460, size: 1.1 })
  const [cx, cy, Rs] = [600, 400, 105]
  s.add(`<circle cx="${cx}" cy="${cy}" r="560" fill="${s.glow('#ff8a3a', 0.28)}"/>`)
  const colors = ['#fff4d8', '#ffd27a', '#ffb347', '#ff8a2a', '#e8551a', '#a8300f', '#5a1808']
  let rings = ''
  for (let i = 0; i < 38; i++) {
    const t = i / 37
    const rr = 150 + i * 9
    const color = colors[Math.min(colors.length - 1, Math.floor(t * colors.length))]
    rings += `<ellipse cx="${cx}" cy="${cy}" rx="${rr}" ry="${n1(rr * 0.22)}" fill="none" stroke="${color}" stroke-width="10" opacity="${n2((1 - t * 0.85) * s.r.range(0.65, 1))}"/>`
  }
  const disk = s.id('disk')
  const beam = s.id('beam')
  s.def(
    `<mask id="${beam}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${s.gradient(
      [
        [0, '#fff'],
        [1, '#777'],
      ],
      'x1="0" y1="0" x2="1" y2="0"',
    )}"/></mask>`,
  )
  s.def(`<g id="${disk}" mask="url(#${beam})">${rings}</g>`)
  const top = s.id('top')
  const bottom = s.id('bottom')
  s.def(
    `<clipPath id="${top}"><rect width="${W}" height="${cy}"/></clipPath><clipPath id="${bottom}"><rect y="${cy}" width="${W}" height="${H - cy}"/></clipPath>`,
  )
  const glow = s.blur(6)
  s.add(`<use href="#${disk}" clip-path="url(#${top})" filter="${glow}"/><use href="#${disk}" clip-path="url(#${top})"/>`)
  const lensed = s.radial([
    [0, '#000', 0],
    [0.53, '#000', 0],
    [0.56, '#fff2cc', 1],
    [0.64, '#ffb347', 0.85],
    [0.8, '#ff6a1a', 0.35],
    [1, '#ff6a1a', 0],
  ])
  s.add(`<circle cx="${cx}" cy="${cy}" r="205" fill="${lensed}"/>`)
  s.add(`<circle cx="${cx}" cy="${cy}" r="${Rs + 5}" fill="none" stroke="#fff7e0" stroke-width="4" filter="${s.blur(2)}"/>`)
  s.add(`<circle cx="${cx}" cy="${cy}" r="${Rs}" fill="#000"/>`)
  s.add(`<use href="#${disk}" clip-path="url(#${bottom})" filter="${glow}"/><use href="#${disk}" clip-path="url(#${bottom})"/>`)
}

// ---------------------------------------------------------------- the Sun and eclipses

function sun(s) {
  const { r } = s
  spaceBackground(s, { inner: '#1a0904', outer: '#050203', y: 0.9 })
  const [cx, cy, R] = [600, 1030, 770]
  s.add(`<circle cx="${cx}" cy="${cy}" r="${R + 380}" fill="${s.glow('#ff8a2a', 0.55)}"/>`)
  // Prominences: loops of glowing gas that stand on the edge of the disk.
  const loops = []
  for (const [a, span, h, w] of [
    [-122, 7, 150, 22],
    [-118, 4, 90, 14],
    [-76, 6, 120, 18],
    [-55, 9, 200, 26],
    [-53, 5, 110, 12],
  ]) {
    const [a0, a1] = [((a - span / 2) * Math.PI) / 180, ((a + span / 2) * Math.PI) / 180]
    const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)]
    const p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)]
    const k = (R + h * 1.6) / R
    loops.push({
      d: `M${n1(p0[0])} ${n1(p0[1])}C${n1(cx + (p0[0] - cx) * k)} ${n1(cy + (p0[1] - cy) * k)} ${n1(cx + (p1[0] - cx) * k)} ${n1(cy + (p1[1] - cy) * k)} ${n1(p1[0])} ${n1(p1[1])}`,
      w,
    })
  }
  const fire = warpFilter(s, { freq: 0.02, octaves: 3, scale: 16, blur: 3 })
  for (const { d, w } of loops) {
    s.add(`<path d="${d}" fill="none" stroke="#ff5a1a" stroke-width="${w * 2}" opacity=".45" filter="${fire}"/>`)
    s.add(`<path d="${d}" fill="none" stroke="#ff9a4a" stroke-width="${w}" filter="${fire}"/>`)
  }
  s.add(`<circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="none" stroke="#ff4a1a" stroke-width="12" filter="${s.blur(4)}"/>`)
  s.add(
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#f06a0a" filter="${surfaceFilter(s, { ramp: ['#8a2400', '#c94200', '#ee6a0a', '#ff922a', '#ffbe55'], freq: 0.045, octaves: 3, contrast: 2.6 })}"/>`,
  )
  for (let i = 0; i < 4; i++) {
    const [x, y, size] = [r.range(380, 860), r.range(420, 640), r.range(10, 24)]
    s.add(
      `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(size * 1.8)}" ry="${n1(size * 1.3)}" fill="#7a2200" opacity=".7"/><ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(size * 0.9)}" ry="${n1(size * 0.7)}" fill="#2a0700"/>`,
    )
  }
  const limb = s.radial([
    [0, '#5a1000', 0],
    [0.72, '#5a1000', 0],
    [0.93, '#4a0c00', 0.5],
    [1, '#300600', 0.85],
  ])
  s.add(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${limb}"/>`)
}

function eclipse(s, { mode = 'total' }) {
  const { r } = s
  if (mode === 'annular') return annular(s)
  const [cx, cy, R] = [600, 400, 150]
  spaceBackground(s, { inner: '#0f1a38', outer: '#03050c' })
  starfield(s, { count: 160, size: 1 })
  const faint = mode === 'diamond' ? 0.6 : 1
  s.add(`<circle cx="${cx}" cy="${cy}" r="560" fill="${s.glow('#e9f0ff', 0.55 * faint)}"/>`)
  // Streamers of the corona: thin wedges pointing away from the Sun, longest near the Sun's equator.
  let d = ''
  for (let i = 0; i < 80; i++) {
    const a = r.range(0, TAU)
    const len = (120 + r.next() * 380) * (0.45 + 0.55 * Math.abs(Math.cos(a)))
    const w = r.range(0.04, 0.12)
    const p = (ang, rad) => `${n1(cx + rad * Math.cos(ang))} ${n1(cy + rad * Math.sin(ang))}`
    d += `M${p(a - w, R - 4)}L${p(a, R + len)}L${p(a + w, R - 4)}Z`
  }
  s.add(`<path d="${d}" fill="#f2f6ff" opacity="${n2(0.16 * faint)}" filter="${s.blur(5)}"/>`)
  cloud(s, {
    x: cx,
    y: cy,
    rx: 330,
    ry: 330,
    stops: [
      [0, '#ffffff', 0.9],
      [0.42, '#ffffff', 0.8],
      [0.6, '#dfe8ff', 0.35],
      [1, '#dfe8ff', 0],
    ],
    freq: 0.012,
    cut: 0.25,
    sharp: 1.5,
  })
  s.add(
    `<circle cx="${cx}" cy="${cy}" r="${R + 14}" fill="none" stroke="#ffffff" stroke-width="14" opacity="${n2(0.7 * faint)}" filter="${s.blur(6)}"/>`,
  )
  for (const a of [-2.3, -0.4, 1.9, 2.6]) {
    const [x, y] = [cx + (R + 2) * Math.cos(a), cy + (R + 2) * Math.sin(a)]
    s.add(
      `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${r.int(6, 12)}" ry="${r.int(4, 7)}" transform="rotate(${n1((a * 180) / Math.PI + 90)} ${n1(x)} ${n1(y)})" fill="#ff4f7a" filter="${s.blur(1.2)}"/>`,
    )
  }
  s.add(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#020306"/>`)
  brightStar(s, 960, 220, 1.8, '#fff6e0')
  if (mode === 'diamond') {
    const a = -0.75
    const [x, y] = [cx + R * Math.cos(a), cy + R * Math.sin(a)]
    s.add(`<circle cx="${n1(x)}" cy="${n1(y)}" r="230" fill="${s.glow('#ffffff', 1)}"/>`)
    brightStar(s, x, y, 9, '#ffffff')
  }
}

function annular(s) {
  skyGradient(s, [
    [0, '#1c1030'],
    [0.45, '#4a2440'],
    [0.75, '#b0503a'],
    [1, '#f0a050'],
  ])
  s.add(`<circle cx="600" cy="420" r="520" fill="${s.glow('#ffb347', 0.85)}"/>`)
  s.add(`<circle cx="600" cy="420" r="128" fill="#fff3cf"/>`)
  s.add(`<circle cx="600" cy="420" r="150" fill="none" stroke="#ffe2a0" stroke-width="22" opacity=".6" filter="${s.blur(8)}"/>`)
  s.add(`<circle cx="604" cy="423" r="117" fill="#1d0c10"/>`)
  s.add(
    `<rect y="520" width="${W}" height="280" fill="${s.gradient(
      [
        [0, '#ff9a50', 0],
        [1, '#ff9a50', 0.35],
      ],
      'x1="0" y1="0" x2="0" y2="1"',
    )}"/>`,
  )
  landscape(s, { base: 690, amp: 40, trees: 1.4, color: '#120608', treeHeight: [18, 60] })
}

// ---------------------------------------------------------------- the Moon and Earth

// The Moon's face as a reusable <g>: gray texture, dark "seas", craters and one rayed crater.
function moonSurface(s, cx, cy, R) {
  const { r } = s
  const id = s.id('moon')
  const clip = clipCircle(s, cx, cy, R)
  const k = 260 / R
  const seas = patchFilter(s, { freq: n4(0.0045 * k), octaves: 4, cut: 0.52, sharp: 7, blur: 2 })
  let craters = ''
  for (let i = 0; i < 90; i++) {
    const rad = R * Math.sqrt(r.next()) * 0.98
    const a = r.range(0, TAU)
    const [x, y] = [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]
    const size = (2.5 + r.next() ** 4 * 26) / k
    craters +=
      `<circle cx="${n1(x + size * 0.12)}" cy="${n1(y + size * 0.12)}" r="${n1(size)}" fill="#2e2c29" opacity=".16"/>` +
      `<circle cx="${n1(x - size * 0.1)}" cy="${n1(y - size * 0.1)}" r="${n1(size * 0.92)}" fill="none" stroke="#ffffff" stroke-width="${n1(size * 0.16)}" opacity=".12"/>`
  }
  const [tx, ty] = [cx + R * 0.18, cy + R * 0.55]
  let rays = ''
  for (let i = 0; i < 16; i++) {
    const a = r.range(0, TAU)
    const len = R * r.range(0.25, 0.8)
    rays += `M${n1(tx)} ${n1(ty)}l${n1(Math.cos(a) * len)} ${n1(Math.sin(a) * len)}`
  }
  s.def(
    `<g id="${id}"><circle cx="${cx}" cy="${cy}" r="${R}" fill="#b9b5ad" filter="${surfaceFilter(s, { ramp: ['#77736d', '#99958e', '#b9b5ad', '#d3cfc7', '#e9e6df'], freq: n4(0.012 * k), contrast: 2 })}"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#57544f" opacity=".8" filter="${seas}"/>` +
      `<g clip-path="${clip}">${craters}<path d="${rays}" stroke="#ffffff" stroke-width="${n1(5 / k)}" opacity=".1" stroke-linecap="round" filter="${s.blur(n1(2 / k))}"/>` +
      `<circle cx="${n1(tx)}" cy="${n1(ty)}" r="${n1(9 / k)}" fill="${s.glow('#ffffff', 0.9)}"/></g></g>`,
  )
  return id
}

function moon(s, { mode = 'full' }) {
  if (mode === 'crescent') {
    skyGradient(s, [
      [0, '#02040c'],
      [0.6, '#0a1a3a'],
      [1, '#24456a'],
    ])
    starfield(s, { count: 220, size: 1.1, h: 600 })
    const [cx, cy, R] = [600, 360, 210]
    const face = moonSurface(s, cx, cy, R)
    const lit = s.id('lit')
    s.def(
      `<mask id="${lit}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff"/>` +
        `<circle cx="${cx - R * 0.24}" cy="${cy - R * 0.05}" r="${R * 1.01}" fill="#000" filter="${s.blur(4)}"/></mask>`,
    )
    const earthshine = s.id('shine')
    s.def(
      `<filter id="${earthshine}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.08 0 0 0 0.01 0 0.095 0 0 0.015 0 0 0.14 0 0.04 0 0 0 1 0"/></filter>`,
    )
    s.add(`<circle cx="${cx}" cy="${cy}" r="${R * 1.5}" fill="${s.glow('#9fb8e8', 0.25)}"/>`)
    s.add(`<use href="#${face}" filter="url(#${earthshine})"/><use href="#${face}" mask="url(#${lit})"/>`)
    brightStar(s, 930, 560, 2, '#fff8e8')
    landscape(s, { base: 760, amp: 50, trees: 1, color: '#02050b' })
    return
  }
  const [cx, cy, R] = [600, 400, 300]
  spaceBackground(s, { inner: mode === 'blood' ? '#0d0812' : '#0a0f1e', outer: '#020306' })
  starfield(s, { count: mode === 'blood' ? 520 : 140, size: 1.1 })
  const face = moonSurface(s, cx, cy, R)
  if (mode === 'blood') {
    const red = s.id('red')
    s.def(
      `<filter id="${red}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.85 0.25 0.08 0 0.04 0.22 0.16 0.04 0 0 0.1 0.06 0.05 0 0.01 0 0 0 1 0"/></filter>`,
    )
    s.add(`<circle cx="${cx}" cy="${cy}" r="${R * 1.7}" fill="${s.glow('#ff5a2a', 0.22)}"/>`)
    s.add(`<use href="#${face}" filter="url(#${red})"/>`)
    sphereShade(s, cx, cy, R, { light: [0.55, 0.5], night: 0.75, soft: 0.2 })
    s.add(
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${s.radial(
        [
          [0, '#ffb070', 0.45],
          [0.6, '#ffb070', 0],
        ],
        'cx="0.85" cy="0.8" r="0.7"',
      )}" style="mix-blend-mode:screen"/>`,
    )
  } else {
    s.add(`<circle cx="${cx}" cy="${cy}" r="${R * 1.55}" fill="${s.glow('#e8eef5', 0.32)}"/>`)
    s.add(`<use href="#${face}"/>`)
    sphereShade(s, cx, cy, R, { light: [0, 0], night: 0.3, soft: 0.6 })
  }
}

function earthSphere(s, cx, cy, R, { light = [-0.5, -0.35], night = 0.96 } = {}) {
  const k = 300 / R
  s.add(
    `<circle cx="${cx}" cy="${cy}" r="${R * 1.08}" fill="${s.radial([
      [0.88, '#6fb8ff', 0],
      [0.93, '#8fd0ff', 0.55],
      [1, '#6fb8ff', 0],
    ])}"/>`,
  )
  s.add(
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${s.radial(
      [
        [0, '#3a8fe8'],
        [1, '#0a2a66'],
      ],
      'cx="0.35" cy="0.35" r="0.8"',
    )}"/>`,
  )
  const land = s.id('land')
  const ramp = ['#2d5a26', '#3c6a2a', '#577832', '#86884a', '#b8a26c']
  const ch = (i) => ramp.map((hex) => n2(Number.parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16) / 255)).join(' ')
  s.def(
    `<filter id="${land}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="${n4(0.004 * k)}" numOctaves="5" seed="${s.r.int(1, 9999)}"/>` +
      `<feColorMatrix type="matrix" values="3.5 0 0 0 -1.55 3.5 0 0 0 -1.55 3.5 0 0 0 -1.55 9 0 0 0 -4.65"/>` +
      `<feComponentTransfer><feFuncR type="table" tableValues="${ch(0)}"/><feFuncG type="table" tableValues="${ch(1)}"/><feFuncB type="table" tableValues="${ch(2)}"/></feComponentTransfer>` +
      `<feComposite in2="SourceGraphic" operator="in"/></filter>`,
  )
  s.add(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" filter="url(#${land})"/>`)
  const clip = clipCircle(s, cx, cy, R)
  s.add(
    `<g clip-path="${clip}" filter="${s.blur(6 / k)}" opacity=".9"><ellipse cx="${cx}" cy="${cy - R}" rx="${R * 0.7}" ry="${R * 0.16}" fill="#f4f8ff"/><ellipse cx="${cx}" cy="${cy + R}" rx="${R * 0.6}" ry="${R * 0.13}" fill="#f4f8ff"/></g>`,
  )
  s.add(
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#ffffff" opacity=".92" filter="${patchFilter(s, { freq: `${n4(0.012 * k)} ${n4(0.022 * k)}`, octaves: 4, cut: 0.53, sharp: 4, blur: n1(0.8 / k) })}"/>`,
  )
  sphereShade(s, cx, cy, R, { light, night })
}

function earth(s) {
  spaceBackground(s, { inner: '#050a18', outer: '#010205' })
  starfield(s, { count: 220, size: 1 })
  earthSphere(s, 600, 400, 300)
}

function earthrise(s) {
  const { r } = s
  s.add(`<rect width="${W}" height="${H}" fill="#010103"/>`)
  starfield(s, { count: 60, size: 0.8, h: 480 })
  earthSphere(s, 640, 250, 118, { light: [0.85, 0.15], night: 1 })
  const [cx, cy, R] = [600, 2400, 1900]
  s.add(
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#8a8378" filter="${surfaceFilter(s, { ramp: ['#3e3a35', '#5e5850', '#7e776c', '#9c9488', '#bdb5a8'], freq: '0.006 0.03', contrast: 2.2 })}"/>`,
  )
  let craters = ''
  for (let i = 0; i < 70; i++) {
    const y = r.range(510, 800)
    const depth = (y - 500) / 300
    const rx = (6 + r.next() ** 3 * 70) * (0.3 + depth)
    const x = r.range(0, W)
    craters += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(rx * 0.22)}" fill="#1a1815" opacity=".45"/><ellipse cx="${n1(x + rx * 0.12)}" cy="${n1(y + rx * 0.04)}" rx="${n1(rx * 0.85)}" ry="${n1(rx * 0.16)}" fill="none" stroke="#d8d0c2" stroke-width="${n1(Math.max(1, rx * 0.06))}" opacity=".3"/>`
  }
  s.add(`<g clip-path="${clipCircle(s, cx, cy, R)}">${craters}</g>`)
  s.add(
    `<rect y="490" width="${W}" height="310" fill="${s.gradient(
      [
        [0, '#000', 0],
        [1, '#000', 0.55],
      ],
      'x1="0" y1="0" x2="0" y2="1"',
    )}"/>`,
  )
}

// ---------------------------------------------------------------- planets, moons and a red supergiant

function rocky(s, p) {
  const { r } = s
  const { x = 600, y = 400, R = 280, ramp, freq = 0.01, contrast = 2.2, light = [-0.5, -0.4], haze, features } = p
  spaceBackground(s, { inner: '#080c1c', outer: '#020306' })
  starfield(s, { count: 300, size: 1.1 })
  if (haze) s.add(`<circle cx="${x}" cy="${y}" r="${R * 1.35}" fill="${s.glow(haze, 0.45)}"/>`)
  s.add(`<circle cx="${x}" cy="${y}" r="${R}" fill="${ramp[2]}" filter="${surfaceFilter(s, { ramp, freq, contrast })}"/>`)
  const clip = clipCircle(s, x, y, R)
  let extra = ''
  if (features === 'mars') {
    extra +=
      `<g filter="${s.blur(5)}"><ellipse cx="${x - 20}" cy="${y - R + 10}" rx="${R * 0.42}" ry="${R * 0.14}" fill="#f6f2ec"/>` +
      `<ellipse cx="${x + 30}" cy="${y + R - 6}" rx="${R * 0.25}" ry="${R * 0.07}" fill="#f6f2ec" opacity=".8"/></g>` +
      `<path d="M${x - R * 0.7} ${y + 10}C${x - R * 0.3} ${y - 20} ${x + R * 0.1} ${y + 30} ${x + R * 0.55} ${y + 5}" fill="none" stroke="#4a1a08" stroke-width="12" opacity=".35" filter="${s.blur(5)}"/>`
  }
  if (features === 'io') {
    let halos = ''
    let vents = ''
    for (let i = 0; i < 15; i++) {
      const [vx, vy] = [x + r.range(-R, R) * 0.85, y + r.range(-R, R) * 0.85]
      halos += `<circle cx="${n1(vx)}" cy="${n1(vy)}" r="${n1(r.range(14, 34))}" fill="none" stroke="${r.pick(['#ff6a3a', '#fff3a0', '#d8401a', '#ffffff'])}" stroke-width="${n1(r.range(6, 12))}" opacity=".35"/>`
      vents += `<circle cx="${n1(vx)}" cy="${n1(vy)}" r="${n1(r.range(3, 7))}" fill="#3a1a0a" opacity=".8"/>`
    }
    extra += `<g filter="${s.blur(3)}">${halos}</g><g filter="${s.blur(1)}">${vents}</g>`
  }
  if (features === 'europa') {
    let d = ''
    for (let i = 0; i < 16; i++) {
      const a = r.range(0, Math.PI)
      const [mx, my] = [x + r.range(-R, R) * 0.7, y + r.range(-R, R) * 0.7]
      const [dx, dy] = [Math.cos(a) * R * r.range(0.6, 1.3), Math.sin(a) * R * r.range(0.6, 1.3)]
      const bend = r.range(-0.5, 0.5)
      d += `M${n1(mx - dx)} ${n1(my - dy)}Q${n1(mx - dy * bend)} ${n1(my + dx * bend)} ${n1(mx + dx)} ${n1(my + dy)}`
    }
    extra += `<path d="${d}" fill="none" stroke="#b0683e" stroke-width="12" opacity=".2" filter="${s.blur(3)}"/><path d="${d}" fill="none" stroke="#8a4a2e" stroke-width="2.5" opacity=".5"/>`
  }
  if (features === 'pluto') {
    const heart = warpFilter(s, { freq: 0.03, scale: 30, blur: 2 })
    extra +=
      `<g filter="${heart}"><ellipse cx="${x + 70}" cy="${y + 40}" rx="${R * 0.32}" ry="${R * 0.4}" fill="#f4e6d2"/><ellipse cx="${x + 170}" cy="${y + 30}" rx="${R * 0.26}" ry="${R * 0.34}" fill="#efdcc4"/>` +
      `<path d="M${x + 40} ${y + 120}Q${x + 120} ${y + 210} ${x + 160} ${y + 120}Z" fill="#f4e6d2"/></g>` +
      `<ellipse cx="${x - 150}" cy="${y + 70}" rx="${R * 0.5}" ry="${R * 0.18}" fill="#4a1e12" opacity=".7" filter="${s.blur(10)}"/>`
  }
  if (features === 'titan') {
    extra += `<circle cx="${x}" cy="${y}" r="${R}" fill="${s.radial([
      [0, '#ffb35a', 0.15],
      [1, '#ffb35a', 0.55],
    ])}"/>`
  }
  if (extra) s.add(`<g clip-path="${clip}">${extra}</g>`)
  sphereShade(s, x, y, R, { light, night: 0.96 })
  if (features === 'titan')
    s.add(
      `<circle cx="${x}" cy="${y}" r="${R + 8}" fill="none" stroke="#8fb8ff" stroke-width="7" opacity=".55" filter="${s.blur(4)}"/>`,
    )
  if (features === 'venus')
    s.add(
      `<circle cx="${x}" cy="${y}" r="${R + 5}" fill="none" stroke="#fff2c8" stroke-width="6" opacity=".35" filter="${s.blur(5)}"/>`,
    )
}

function supergiant(s) {
  const { r } = s
  spaceBackground(s, { inner: '#12070a', outer: '#040205' })
  starfield(s, { count: 340, size: 1.1 })
  cloud(s, {
    x: 600,
    y: 400,
    rx: 560,
    ry: 520,
    stops: [
      [0, '#a04030', 0],
      [0.45, '#a04030', 0.15],
      [0.7, '#c05a3a', 0.5],
      [1, '#c05a3a', 0],
    ],
    freq: 0.008,
    cut: 0.4,
    sharp: 2.5,
  })
  s.add(`<circle cx="600" cy="400" r="470" fill="${s.glow('#ff7a3a', 0.75)}"/>`)
  s.add(
    `<circle cx="600" cy="400" r="250" fill="#d84a10" filter="${surfaceFilter(s, { ramp: ['#6a0e00', '#a82a00', '#dc4e10', '#ff7e2a', '#ffb85a'], freq: 0.011, octaves: 4, contrast: 2.4 })}"/>`,
  )
  for (let i = 0; i < 3; i++)
    s.add(
      `<circle cx="${n1(600 + r.range(-120, 120))}" cy="${n1(400 + r.range(-120, 120))}" r="${n1(r.range(40, 80))}" fill="${s.glow('#ffd08a', 0.6)}" style="mix-blend-mode:screen"/>`,
    )
  s.add(
    `<circle cx="600" cy="400" r="250" fill="${s.radial([
      [0, '#3a0400', 0],
      [0.6, '#3a0400', 0.1],
      [1, '#2a0300', 0.85],
    ])}"/>`,
  )
}

function gasGiant(s, p) {
  const { r } = s
  const {
    x = 600,
    y = 400,
    R = 250,
    palette,
    spot = false,
    rings = false,
    axis = 0,
    ringTilt = 0.28,
    ringColors,
    storms = 0,
    stormColors = ['#ffffff'],
    smooth = false,
    streaks = true,
  } = p
  spaceBackground(s, { inner: '#080c1e', outer: '#020306' })
  starfield(s, { count: 320, size: 1.1 })
  s.add(`<g transform="rotate(${axis} ${x} ${y})">`)
  if (rings) ringSystem(s, { x, y, R, tilt: ringTilt, colors: ringColors, half: 'back', faint: rings === 'faint' })
  const clip = clipCircle(s, x, y, R)
  let bands = ''
  for (let by = y - R - 40; by < y + R + 40;) {
    const h = smooth ? r.range(30, 70) : r.range(12, 44)
    bands += `<rect x="${x - R - 60}" y="${n1(by)}" width="${R * 2 + 120}" height="${n1(h + 2)}" fill="${r.pick(palette)}"/>`
    by += h
  }
  const wavy = warpFilter(s, { freq: '0.0016 0.03', octaves: 3, scale: smooth ? 10 : 24, blur: 1.2 })
  let marks = ''
  if (spot) {
    const [sx, sy] = [x + R * 0.28, y + R * 0.34]
    marks += `<ellipse cx="${sx}" cy="${sy}" rx="${R * 0.19}" ry="${R * 0.11}" fill="#f0d2b0" opacity=".6"/><ellipse cx="${sx}" cy="${sy}" rx="${R * 0.16}" ry="${R * 0.088}" fill="#c4553a"/><ellipse cx="${sx}" cy="${sy}" rx="${R * 0.08}" ry="${R * 0.045}" fill="#e07a52"/>`
  }
  for (let i = 0; i < storms; i++) {
    marks += `<ellipse cx="${n1(x + r.range(-R, R) * 0.8)}" cy="${n1(y + r.range(-R, R) * 0.7)}" rx="${n1(r.range(8, 22))}" ry="${n1(r.range(4, 9))}" fill="${r.pick(stormColors)}" opacity=".75"/>`
  }
  s.add(`<g clip-path="${clip}"><g filter="${wavy}">${bands}${marks}</g>`)
  if (streaks)
    s.add(
      `<rect x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" fill="#ffffff" opacity=".12" filter="${patchFilter(s, { freq: '0.003 0.05', octaves: 3, cut: 0.55, sharp: 4 })}"/>`,
    )
  s.add('</g>')
  sphereShade(s, x, y, R, { light: [-0.45, -0.25], night: 0.95 })
  if (rings) ringSystem(s, { x, y, R, tilt: ringTilt, colors: ringColors, half: 'front', faint: rings === 'faint' })
  s.add('</g>')
}

function ringSystem(s, { x, y, R, tilt, colors = ['#d8c8a8', '#bfa882', '#e8dcc4', '#a89272'], half, faint }) {
  const id = `${half}-${x}`
  const clip = s.id(id)
  s.def(
    `<clipPath id="${clip}"><rect x="0" y="${half === 'back' ? y - 1000 : y}" width="${W * 2}" height="1000" transform="translate(${-W / 2} 0)"/></clipPath>`,
  )
  // The same seed for both halves, so the front and the back of the rings match.
  const rr = seeded(`rings-${x}-${R}`)
  let ellipses = ''
  const [inner, outer, steps] = faint ? [1.5, 1.78, 3] : [1.22, 2.25, 46]
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const rad = R * (inner + (outer - inner) * t)
    const gap = !faint && t > 0.6 && t < 0.66
    const o = faint ? (i === steps - 1 ? 0.6 : 0.22) : gap ? 0.08 : rr.range(0.45, 0.95)
    ellipses += `<ellipse cx="${x}" cy="${y}" rx="${n1(rad)}" ry="${n1(rad * tilt)}" fill="none" stroke="${colors[Math.floor(rr.next() * colors.length)]}" stroke-width="${faint ? (i === steps - 1 ? 3 : 1.5) : n1(((outer - inner) * R) / steps + 1.5)}" opacity="${n2(o)}"/>`
  }
  s.add(`<g clip-path="url(#${clip})">${ellipses}</g>`)
}

// ---------------------------------------------------------------- night-sky scenes

function comet(s) {
  skyGradient(s, [
    [0, '#030714'],
    [0.5, '#0b1a3a'],
    [0.8, '#1e3f66'],
    [0.93, '#56688a'],
    [1, '#c08060'],
  ])
  starfield(s, { count: 300, size: 1.1, h: 640 })
  const [hx, hy] = [830, 310]
  const dust = s.gradient(
    [
      [0, '#fff3d0', 0.95],
      [0.25, '#ffdfa8', 0.55],
      [1, '#ffd9a0', 0],
    ],
    `gradientUnits="userSpaceOnUse" x1="${hx}" y1="${hy}" x2="0" y2="420"`,
  )
  s.add(
    `<path d="M${hx} ${hy - 5}C600 250 300 240 -30 300L-30 540C300 430 620 340 ${hx} ${hy + 6}Z" fill="${dust}" filter="${s.blur(14)}"/>`,
  )
  s.add(`<path d="M${hx} ${hy}C600 290 320 300 -20 390" fill="none" stroke="${dust}" stroke-width="30" filter="${s.blur(12)}"/>`)
  const ion = s.gradient(
    [
      [0, '#bfe4ff', 0.95],
      [1, '#7fc0ff', 0],
    ],
    `gradientUnits="userSpaceOnUse" x1="${hx}" y1="${hy}" x2="120" y2="-20"`,
  )
  s.add(`<path d="M${hx} ${hy - 3}L110 -40L150 -10L${hx} ${hy + 3}Z" fill="${ion}" filter="${s.blur(4)}"/>`)
  let streaks = ''
  for (let i = 0; i < 6; i++) streaks += `M${hx} ${hy}L${n1(120 + s.r.range(-30, 50))} ${n1(-30 + s.r.range(-20, 40))}`
  s.add(`<path d="${streaks}" stroke="#d0ecff" stroke-width="1.6" opacity=".3" filter="${s.blur(1.5)}"/>`)
  s.add(
    `<circle cx="${hx}" cy="${hy}" r="60" fill="${s.glow('#c8ffe0', 0.9)}"/><circle cx="${hx}" cy="${hy}" r="5" fill="#ffffff"/>`,
  )
  landscape(s, { base: 705, amp: 55, trees: 1, color: '#020409' })
}

function aurora(s) {
  const { r } = s
  const shore = 560
  const skyId = s.id('sky')
  const curtainsId = s.id('curtains')
  const curtains = [
    [300, 260, '#3dff9a', '#b04dff'],
    [390, 170, '#2fe0a0', '#3dff9a'],
  ]
    .map(([base, height, color, top]) => auroraRays(s, { base, height, color, top }).join(''))
    .join('')
  s.def(`<g id="${curtainsId}" style="mix-blend-mode:screen">${curtains}</g>`)
  const sky = s.gradient(
    [
      [0, '#02040c'],
      [0.6, '#061826'],
      [1, '#0b2a36'],
    ],
    'x1="0" y1="0" x2="0" y2="1"',
  )
  const stars = dots(starList(s, { count: 260, size: 1.1, h: shore }))
  // Sky, aurora and mountains form one group, so it can be drawn again upside down as the reflection.
  const mountains = landscapeMarkup(s, { base: shore - 20, amp: 110, color: '#03080d', points: 7 }).markup
  const glow = `<use href="#${curtainsId}" filter="${s.blur(12)}" opacity=".7"/><use href="#${curtainsId}"/>`
  s.def(`<g id="${skyId}"><rect width="${W}" height="${shore}" fill="${sky}"/>${stars}${glow}${mountains}</g>`)
  s.add(`<use href="#${skyId}"/>`)
  const water = s.id('water')
  s.def(`<clipPath id="${water}"><rect y="${shore}" width="${W}" height="${H - shore}"/></clipPath>`)
  s.add(
    `<g clip-path="url(#${water})"><rect y="${shore}" width="${W}" height="${H - shore}" fill="#030a10"/><use href="#${skyId}" transform="matrix(1 0 0 -1 0 ${shore * 2})" opacity=".5" filter="${s.blur(2.5)}"/></g>`,
  )
  let ripples = ''
  for (let i = 0; i < 26; i++) ripples += `M${n1(r.range(0, W))} ${n1(r.range(shore + 12, H))}h${n1(r.range(40, 200))}`
  s.add(`<path d="${ripples}" stroke="#9fffd0" stroke-width="1.5" opacity=".1"/>`)
  let forest = `M0 ${shore + 6}H${W}V${shore - 2}H0Z`
  for (let x = 0; x < W; x += r.range(6, 22)) if (r.next() > 0.35) forest += pine(x, shore + 4, r.range(16, 54))
  s.add(`<path d="${forest}" fill="#010406"/>`)
}

// One curtain of aurora: many thin vertical rays whose lower edge waves across the sky.
// Returns two groups of rays, so an animation can make half of them flicker.
function auroraRays(s, { base, height, color, top }) {
  const { r } = s
  const fill = s.gradient(
    [
      [0, top, 0],
      [0.5, top, 0.35],
      [0.86, color, 0.85],
      [0.95, '#e8fff0', 0.9],
      [1, color, 0],
    ],
    'x1="0" y1="0" x2="0" y2="1"',
  )
  const [f1, p1] = [r.range(0.004, 0.008), r.range(0, TAU)]
  const groups = ['', '']
  for (let x = -60; x < W + 60; x += 7) {
    const bottom = base + 48 * Math.sin(x * f1 + p1) + 16 * Math.sin(x * 0.02 + p1)
    const h = height * (0.55 + 0.45 * Math.abs(Math.sin(x * 0.006 + p1 * 2)))
    groups[r.next() < 0.5 ? 0 : 1] +=
      `<rect x="${x}" y="${n1(bottom - h)}" width="8" height="${n1(h)}" fill="${fill}" opacity="${n2(r.range(0.2, 0.55))}"/>`
  }
  return groups
}

function conjunction(s) {
  skyGradient(s, [
    [0, '#081230'],
    [0.45, '#1a3466'],
    [0.72, '#4a5a86'],
    [0.86, '#c97a5a'],
    [1, '#f4b066'],
  ])
  starfield(s, { count: 110, size: 1, h: 330 })
  const [mx, my, R] = [500, 470, 38]
  const mask = s.id('crescent')
  s.def(
    `<mask id="${mask}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><circle cx="${mx}" cy="${my}" r="${R}" fill="#fff"/>` +
      `<circle cx="${mx - 11}" cy="${my - 10}" r="${R}" fill="#000"/></mask>`,
  )
  s.add(
    `<circle cx="${mx}" cy="${my}" r="${R * 2.6}" fill="${s.glow('#ffe8c8', 0.35)}"/><circle cx="${mx}" cy="${my}" r="${R}" fill="#3a4466" opacity=".55"/>`,
  )
  s.add(`<circle cx="${mx}" cy="${my}" r="${R}" fill="#fff4dc" mask="url(#${mask})"/>`)
  brightStar(s, 640, 400, 3, '#fffbe8')
  brightStar(s, 712, 352, 2.1, '#fff1d0')
  landscape(s, { base: 670, amp: 50, color: '#1c2236', points: 6 })
  landscape(s, { base: 712, amp: 60, trees: 0.8, color: '#07080f' })
}

function starTrails(s) {
  const { r } = s
  skyGradient(s, [
    [0, '#02030a'],
    [0.7, '#0a1428'],
    [1, '#1a2a44'],
  ])
  const [px, py] = [840, 200]
  const colors = ['#ffffff', '#e4ecff', '#bcd2ff', '#ffe2bd', '#ffc48a']
  const groups = new Map()
  for (let i = 0; i < 340; i++) {
    const rad = 14 + Math.sqrt(r.next()) * 1150
    const a0 = r.range(0, TAU)
    const a1 = a0 + 0.66
    const key = `${r.pick(colors)}|${r.pick([0.8, 1.2, 1.6, 2.2])}|${r.pick([0.4, 0.6, 0.85])}`
    const d = `M${n1(px + rad * Math.cos(a0))} ${n1(py + rad * Math.sin(a0))}A${n1(rad)} ${n1(rad)} 0 0 1 ${n1(px + rad * Math.cos(a1))} ${n1(py + rad * Math.sin(a1))}`
    groups.set(key, (groups.get(key) ?? '') + d)
  }
  for (const [key, d] of groups) {
    const [color, width, o] = key.split('|')
    s.add(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${o}"/>`)
  }
  brightStar(s, px + 3, py - 2, 1.6, '#ffffff', false)
  s.add(
    `<rect y="520" width="${W}" height="280" fill="${s.gradient(
      [
        [0, '#2a3a5a', 0],
        [1, '#3a4a6a', 0.5],
      ],
      'x1="0" y1="0" x2="0" y2="1"',
    )}"/>`,
  )
  landscape(s, { base: 700, amp: 90, trees: 1, color: '#020409' })
}

// ---------------------------------------------------------------- animations ("videos")

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }'

function moonPhases(s, animate) {
  spaceBackground(s, { inner: '#080c1c', outer: '#020306' })
  starfield(s, { count: 220, size: 1.1 })
  const [cx, cy, R] = [600, 400, 260]
  const face = moonSurface(s, cx, cy, R)
  const dark = s.id('dark')
  s.def(
    `<filter id="${dark}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.1 0 0 0 0.01 0 0.11 0 0 0.015 0 0 0.15 0 0.03 0 0 0 1 0"/></filter>`,
  )
  // The lit part = one half of the disk plus or minus an ellipse whose width follows the phase.
  const steps = 24
  const rx = Array.from({ length: steps + 1 }, (_, i) => n1(R * Math.abs(Math.cos((i / steps) * TAU))))
  const times = Array.from({ length: steps + 1 }, (_, i) => n2(i / steps)).join(';')
  const anim = (attr, values, keyTimes, mode = 'linear') =>
    animate
      ? `<animate attributeName="${attr}" values="${values}" keyTimes="${keyTimes}" calcMode="${mode}" dur="10s" repeatCount="indefinite"/>`
      : ''
  const phase = s.id('phase')
  const still = 0.37 // the frame used for the still picture: a waxing gibbous Moon
  s.def(
    `<mask id="${phase}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">` +
      `<rect x="${cx}" y="${cy - R}" width="${R}" height="${R * 2}" fill="#fff">${anim('opacity', '1;0', '0;0.5', 'discrete')}</rect>` +
      `<rect x="${cx - R}" y="${cy - R}" width="${R}" height="${R * 2}" fill="#fff" opacity="0">${anim('opacity', '0;1', '0;0.5', 'discrete')}</rect>` +
      `<ellipse cx="${cx}" cy="${cy}" rx="${n1(R * Math.abs(Math.cos(still * TAU)))}" ry="${R}" fill="#fff">` +
      anim('rx', rx.join(';'), times) +
      anim('fill', '#000;#fff;#000', '0;0.25;0.75', 'discrete') +
      `</ellipse></mask>`,
  )
  s.add(`<circle cx="${cx}" cy="${cy}" r="${R * 1.5}" fill="${s.glow('#cfd8e8', 0.18)}"/>`)
  s.add(`<use href="#${face}" filter="url(#${dark})"/><use href="#${face}" mask="url(#${phase})"/>`)
  return ''
}

function jupiterSpin(s, animate) {
  const { r } = s
  spaceBackground(s, { inner: '#080c1e', outer: '#020306' })
  starfield(s, { count: 220, size: 1.1 })
  const [cx, cy, R] = [600, 400, 210]
  const period = 700
  const palette = ['#e9d8bf', '#d9b58c', '#c99a6e', '#f1e6d4', '#b88459', '#e3c9a4']
  let stripes = ''
  for (let by = cy - R - 10; by < cy + R + 10;) {
    const h = r.range(14, 40)
    stripes += `<rect x="${cx - R}" y="${n1(by)}" width="${R * 2}" height="${n1(h + 1)}" fill="${r.pick(palette)}"/>`
    by += h
  }
  // Features repeat every `period` pixels, so sliding them by exactly one period loops seamlessly.
  const copies = (markup) => [-period, 0, period].map((dx) => `<g transform="translate(${dx} 0)">${markup}</g>`).join('')
  let one = `<ellipse cx="${cx - 40}" cy="${cy + R * 0.34}" rx="${R * 0.2}" ry="${R * 0.11}" fill="#f2d6b6" opacity=".7"/><ellipse cx="${cx - 40}" cy="${cy + R * 0.34}" rx="${R * 0.17}" ry="${R * 0.09}" fill="#c4553a"/>`
  for (let i = 0; i < 14; i++) {
    one += `<ellipse cx="${n1(cx - period / 2 + r.range(0, period))}" cy="${n1(cy + r.range(-R, R) * 0.8)}" rx="${n1(r.range(8, 24))}" ry="${n1(r.range(3, 8))}" fill="${r.pick(['#ffffff', '#8a5a3a', '#f6efe4'])}" opacity=".7"/>`
  }
  for (const [yy, color] of [
    [-0.42, '#a8754e'],
    [-0.12, '#f4ead8'],
    [0.18, '#9a6a44'],
    [0.55, '#f4ead8'],
  ]) {
    one += `<path d="M${cx - period / 2} ${n1(cy + R * yy)}h${period}" stroke="${color}" stroke-width="5" stroke-dasharray="${r.int(18, 40)} ${r.int(20, 50)}" opacity=".6"/>`
  }
  const features = copies(one)
  const clip = clipCircle(s, cx, cy, R)
  s.add(`<g clip-path="${clip}">${stripes}<g class="spin">${features}</g></g>`)
  sphereShade(s, cx, cy, R, { light: [-0.2, -0.15], night: 0.9, soft: 0.45 })
  const moons = [
    ['io', 1.32, 3.2, '#e8d27a', 7],
    ['eu', 1.68, 6.4, '#e6e2da', 6],
    ['ga', 2.15, 12.8, '#bfb3a4', 9],
    ['ca', 2.62, 22, '#8a8072', 8],
  ]
  let style = ''
  moons.forEach(([name, dist, dur, color, size], i) => {
    const amp = n1(R * dist)
    style += `@keyframes ${name} { from { transform: translateX(${-amp}px); } to { transform: translateX(${amp}px); } } .${name} { animation: ${name} ${dur / 2}s ease-in-out infinite alternate; animation-delay: -${n1(dur * 0.13 * (i + 1))}s; }`
    const startX = animate ? cx : n1(cx + amp * Math.sin(i * 1.7 + 0.6))
    s.add(`<circle class="${name}" cx="${startX}" cy="${cy + (i % 2 ? 6 : -6)}" r="${size}" fill="${color}"/>`)
  })
  return animate
    ? `@keyframes spin { from { transform: translateX(0); } to { transform: translateX(${period}px); } } .spin { animation: spin 9s linear infinite; } ${style} ${REDUCED_MOTION}`
    : ''
}

function auroraDance(s, animate) {
  skyGradient(s, [
    [0, '#02040c'],
    [0.65, '#061a28'],
    [1, '#0d2e3a'],
  ])
  starfield(s, { count: 300, size: 1.1, h: 600 })
  let style = ''
  ;[
    [330, 270, '#3dff9a', '#b04dff', 7],
    [410, 210, '#2fe0a0', '#3dff9a', 9],
    [280, 170, '#8affc0', '#ff4d8a', 11],
  ].forEach(([base, height, color, top, dur], k) => {
    const groups = auroraRays(s, { base, height, color, top })
    s.add(`<g class="c${k}" style="mix-blend-mode:screen"><g class="f${k}">${groups[0]}</g>${groups[1]}</g>`)
    style +=
      `@keyframes c${k} { 0%, 100% { transform: translateX(0) skewX(0deg); } 50% { transform: translateX(${40 + k * 15}px) skewX(${k % 2 ? 5 : -6}deg); } }` +
      `.c${k} { transform-origin: 600px ${base}px; animation: c${k} ${dur}s ease-in-out infinite; }` +
      `@keyframes f${k} { 0%, 100% { opacity: 1; } 40% { opacity: .35; } 70% { opacity: .85; } } .f${k} { animation: f${k} ${n1(1.7 + k * 0.6)}s ease-in-out infinite; }`
  })
  landscape(s, { base: 700, amp: 70, trees: 1.2, color: '#010407', treeHeight: [18, 56] })
  return animate ? `${style} ${REDUCED_MOTION}` : ''
}

function meteorShower(s, animate) {
  const { r } = s
  skyGradient(s, [
    [0, '#02030a'],
    [0.7, '#0a1530'],
    [1, '#1c2c48'],
  ])
  starfield(s, { count: 460, size: 1.2 })
  const [rx, ry] = [760, 170]
  let style = ''
  let meteors = ''
  for (let i = 0; i < 16; i++) {
    const angle = r.range(15, 170)
    const start = r.range(60, 320)
    const len = r.range(90, 230)
    const stroke = s.gradient(
      [
        [0, '#9fd0ff', 0],
        [0.8, '#e8f4ff', 0.9],
        [1, '#ffffff', 1],
      ],
      `gradientUnits="userSpaceOnUse" x1="${n1(start)}" y1="0" x2="${n1(start + len)}" y2="0"`,
    )
    const dur = n1(r.range(4.5, 9))
    const delay = n1(r.range(0, 8))
    const shown = animate || i % 3 === 0
    meteors += `<g transform="translate(${rx} ${ry}) rotate(${n1(angle)})"><path class="m${i}" d="M${n1(start)} 0h${n1(len)}" stroke="${stroke}" stroke-width="${n1(r.range(1.6, 3.4))}" stroke-linecap="round"${shown ? '' : ' opacity="0"'}/></g>`
    style += `.m${i} { opacity: 0; animation: fly ${dur}s linear ${delay}s infinite; }`
  }
  s.add(meteors)
  landscape(s, { base: 710, amp: 60, trees: 1, color: '#020409' })
  return animate
    ? `@keyframes fly { 0% { transform: translateX(0); opacity: 0; } 2% { opacity: 1; } 9% { transform: translateX(260px); opacity: 0; } 100% { transform: translateX(260px); opacity: 0; } } ${style} ${REDUCED_MOTION}`
    : ''
}

function transit(s, animate) {
  spaceBackground(s, { inner: '#0a0d1e', outer: '#020306' })
  starfield(s, { count: 220, size: 1.1, h: 540 })
  const [sx, sy, R, pr, py] = [600, 290, 190, 26, 318]
  s.add(`<circle cx="${sx}" cy="${sy}" r="330" fill="${s.glow('#ffb060', 0.55)}"/>`)
  s.add(
    `<circle cx="${sx}" cy="${sy}" r="${R}" fill="${s.radial([
      [0, '#fff6dc'],
      [0.7, '#ffd08a'],
      [1, '#ff8a3a'],
    ])}"/>`,
  )
  // The light curve: brightness against time while the planet crosses from x0 to x1.
  const [x0, x1, chartX, chartW, base, depth] = [240, 960, 140, 920, 640, 70]
  const covered = (px) => {
    const d = Math.hypot(px - sx, py - sy)
    if (d >= R + pr) return 0
    if (d <= R - pr) return 1
    return (R + pr - d) / (2 * pr)
  }
  const samples = Array.from({ length: 121 }, (_, i) => {
    const px = x0 + ((x1 - x0) * i) / 120
    return [n1(chartX + (chartW * i) / 120), n1(base + depth * covered(px))]
  })
  const curve = `M${samples.map(([x, y]) => `${x} ${y}`).join('L')}`
  s.add(
    `<rect x="${chartX - 30}" y="560" width="${chartW + 60}" height="190" rx="18" fill="#0a1226" opacity=".9" stroke="#24345a"/>`,
  )
  s.add(
    `<path d="M${chartX} ${base}h${chartW}M${chartX} ${base + depth}h${chartW}" stroke="#2c3c62" stroke-width="2" stroke-dasharray="6 8"/>`,
  )
  const reveal = s.id('reveal')
  const dur = 'dur="9s" repeatCount="indefinite"'
  s.def(
    `<clipPath id="${reveal}"><rect x="${chartX - 6}" y="560" height="190" width="${animate ? 0 : chartW + 12}">` +
      (animate ? `<animate attributeName="width" values="0;${chartW + 12}" ${dur}/>` : '') +
      `</rect></clipPath>`,
  )
  s.add(`<path d="${curve}" fill="none" stroke="#7fe3ff" stroke-width="4" stroke-linejoin="round" clip-path="url(#${reveal})"/>`)
  const mid = samples[60]
  s.add(
    `<circle cx="${animate ? samples[0][0] : mid[0]}" cy="${animate ? samples[0][1] : mid[1]}" r="8" fill="#ffffff">` +
      (animate
        ? `<animate attributeName="cx" values="${samples.map((p) => p[0]).join(';')}" ${dur}/><animate attributeName="cy" values="${samples.map((p) => p[1]).join(';')}" ${dur}/>`
        : '') +
      `</circle>`,
  )
  s.add(
    `<circle cx="${animate ? x0 : sx}" cy="${py}" r="${pr}" fill="#05060a">` +
      (animate ? `<animate attributeName="cx" values="${x0};${x1}" ${dur}/>` : '') +
      `</circle>`,
  )
  return ''
}

function pulsar(s, animate) {
  const { r } = s
  spaceBackground(s, { inner: '#0a0c22', outer: '#020309' })
  starfield(s, { count: 380, size: 1.1 })
  for (let i = 0; i < 7; i++) {
    s.add(
      `<circle cx="${n1(600 + r.range(-380, 380))}" cy="${n1(400 + r.range(-260, 260))}" r="${n1(r.range(120, 260))}" fill="${s.glow(r.pick(['#5a4dff', '#ff4fa0', '#3fb7ff']), 0.22)}"/>`,
    )
  }
  const [cx, cy] = [600, 400]
  const beam = (dir) => {
    const fill = s.gradient(
      [
        [0, '#e6f0ff', 0.95],
        [0.5, '#9fc0ff', 0.4],
        [1, '#9fc0ff', 0],
      ],
      `gradientUnits="userSpaceOnUse" x1="${cx}" y1="${cy}" x2="${cx + dir * 620}" y2="${cy}"`,
    )
    return `<path d="M${cx} ${cy}L${cx + dir * 640} ${cy - 70}L${cx + dir * 640} ${cy + 70}Z" fill="${fill}"/>`
  }
  let loops = ''
  for (const k of [60, 100, 150])
    loops += `<ellipse cx="${cx}" cy="${cy}" rx="${k * 0.45}" ry="${k}" fill="none" stroke="#7fb0ff" stroke-width="2" opacity=".3"/>`
  s.add(`<g class="spin" transform="${animate ? '' : `rotate(-28 ${cx} ${cy})`}">${beam(1)}${beam(-1)}${loops}</g>`)
  s.add(`<circle class="flash" cx="${cx}" cy="${cy}" r="230" fill="${s.glow('#cfe0ff', 0.9)}"/>`)
  s.add(
    `<circle cx="${cx}" cy="${cy}" r="46" fill="${s.glow('#ffffff', 1)}"/><circle cx="${cx}" cy="${cy}" r="9" fill="#ffffff"/>`,
  )
  return animate
    ? `@keyframes spin { to { transform: rotate(360deg); } } .spin { transform-origin: ${cx}px ${cy}px; animation: spin 3s linear infinite; }` +
        `@keyframes flash { 0%, 100% { opacity: 1; } 12%, 88% { opacity: .15; } } .flash { animation: flash 1.5s linear infinite; } ${REDUCED_MOTION}`
    : ''
}

// ---------------------------------------------------------------- public functions

const STILLS = {
  nebula,
  pillars,
  rosette,
  darkGlobule,
  filaments,
  crab,
  ringNebula,
  openCluster,
  globular,
  spiral,
  sombrero,
  irregular,
  collision,
  elliptical,
  milkyWay,
  blackHole,
  sun,
  eclipse,
  moon,
  earth,
  earthrise,
  rocky,
  supergiant,
  gasGiant,
  comet,
  aurora,
  conjunction,
  starTrails,
}

const ANIMATIONS = { moonPhases, jupiterSpin, auroraDance, meteorShower, transit, pulsar }

/**
 * The picture of an archive entry as SVG text.
 * - hd: twice the pixel size (the drawing is the same, SVG scales without losing detail)
 * - animate: for video entries, false gives the still frame used as the thumbnail
 */
export function drawPicture(picture, { hd = false, animate = false } = {}) {
  const s = createScene(picture.id)
  const { kind, ...params } = picture.art
  let style = ''
  if (ANIMATIONS[kind]) style = ANIMATIONS[kind](s, animate) ?? ''
  else STILLS[kind](s, params)
  return s.toSvg({ width: hd ? W * 2 : W, height: hd ? H * 2 : H, style })
}
