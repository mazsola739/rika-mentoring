// The site palette: "Páva / Peacock" — the deep night blue of the web-development mood image
// with the neon colors of the peacock feather. The same colors are saved for design tools in
// resources/pava-szinek/ (CSS, JSON, PNG).
import lessons from '../lessons.json'

export const PEACOCK_PALETTE = [
  { key: 'night', hex: '#070B1A', name: { en: 'Night', hu: 'Éjszaka' } },
  { key: 'surface', hex: '#111E3D', name: { en: 'Surface', hu: 'Felület' } },
  { key: 'deepTeal', hex: '#083F58', name: { en: 'Deep teal', hu: 'Mélytürkiz' } },
  { key: 'peacockGreen', hex: '#017B6B', name: { en: 'Peacock green', hu: 'Pávazöld' } },
  { key: 'turquoise', hex: '#01C5AC', name: { en: 'Turquoise', hu: 'Türkiz' } },
  { key: 'sky', hex: '#0197D8', name: { en: 'Sky blue', hu: 'Égkék' } },
  { key: 'peacockBlue', hex: '#013E8E', name: { en: 'Peacock blue', hu: 'Pávakék' } },
  { key: 'violet', hex: '#9A03B7', name: { en: 'Violet', hu: 'Ibolya' } },
  { key: 'magenta', hex: '#F70677', name: { en: 'Magenta', hu: 'Magenta' } },
  { key: 'orange', hex: '#FD7701', name: { en: 'Orange', hu: 'Narancs' } },
  { key: 'gold', hex: '#FEB800', name: { en: 'Gold', hu: 'Arany' } },
]

const hexOf = (key) => PEACOCK_PALETTE.find((c) => c.key === key).hex

// Named shortcuts used by the apps. The older names (teal, plum, ruby…) are kept so existing apps keep working.
export const PEACOCK = {
  night: hexOf('night'),
  surface: hexOf('surface'),
  deepTeal: hexOf('deepTeal'),
  teal: hexOf('peacockGreen'),
  tealLight: hexOf('turquoise'),
  sky: hexOf('sky'),
  blue: hexOf('peacockBlue'),
  plum: hexOf('violet'),
  ruby: hexOf('magenta'),
  orange: hexOf('orange'),
  gold: hexOf('gold'),
}

// Seven colors in a fixed order (apps index into it): night, green, turquoise, blue, violet, magenta, gold.
export const PEACOCK_COLORS = [
  PEACOCK.night,
  PEACOCK.teal,
  PEACOCK.tealLight,
  PEACOCK.blue,
  PEACOCK.plum,
  PEACOCK.ruby,
  PEACOCK.gold,
]

// ── Color math, so any color can become a full accent ──────────────────────
const toRgb = (hex) => {
  const h = hex.replace('#', '')
  const v = h.length === 3 ? h.replace(/./g, '$&$&') : h
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16))
}
const toHex = (rgb) =>
  '#' +
  rgb
    .map((v) =>
      Math.round(Math.min(255, Math.max(0, v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
    .toUpperCase()
const mix = (a, b, t) => {
  const [x, y] = [toRgb(a), toRgb(b)]
  return toHex(x.map((v, i) => v + (y[i] - v) * t))
}
const luminance = (hex) => {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

// Turns one color into everything the UI needs: surfaces, readable text on it, and a text shade for white pages.
export function accentFromHex(hex, name) {
  const solid = toHex(toRgb(hex))
  const ink = contrast(solid, '#FFFFFF') >= 3 ? '#FFFFFF' : PEACOCK.night
  let text = solid
  for (let t = 0.1; contrast(text, '#FFFFFF') < 4.5 && t <= 0.9; t += 0.1) text = mix(solid, PEACOCK.night, t)
  return {
    key: solid,
    name: name ?? { en: solid, hu: solid },
    solid,
    dark: mix(solid, PEACOCK.night, 0.35),
    light: mix(solid, '#FFFFFF', 0.45),
    ink,
    text,
    accent: solid === PEACOCK.gold ? PEACOCK.teal : PEACOCK.gold,
    colors: PEACOCK_COLORS,
  }
}

// The bright peacock accents, ordered so similar colors are never neighbours
// (used for the main page's "how it's built" boxes and as a fallback).
export const ACCENT_KEYS = ['peacockGreen', 'sky', 'violet', 'orange', 'turquoise', 'magenta', 'peacockBlue', 'gold']
export const PALETTES = ACCENT_KEYS.map((key) => {
  const c = PEACOCK_PALETTE.find((x) => x.key === key)
  return accentFromHex(c.hex, c.name)
})

export const MAIN_PALETTE = PALETTES[0]

// ── Lesson colors: one rainbow through the accents ─────────────────────────
// The rainbow order of the accents (chosen by the site owner).
export const RAINBOW_KEYS = ['magenta', 'orange', 'gold', 'peacockGreen', 'turquoise', 'sky', 'peacockBlue', 'violet']

// sRGB <-> OKLab, so blends between two accents keep their brightness and saturation.
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
function toOklch(hex) {
  const [r, g, b] = toRgb(hex).map((v) => toLinear(v / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [L, Math.hypot(A, B), Math.atan2(B, A)]
}
function fromOklch([L, C, h]) {
  const [A, B] = [C * Math.cos(h), C * Math.sin(h)]
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return toHex(rgb.map((c) => fromLinear(Math.min(1, Math.max(0, c))) * 255))
}

// A blend of two colors along the color wheel (the short way round).
function blend(a, b, t) {
  const [x, y] = [toOklch(a), toOklch(b)]
  let dh = y[2] - x[2]
  if (dh > Math.PI) dh -= 2 * Math.PI
  if (dh < -Math.PI) dh += 2 * Math.PI
  return fromOklch([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + dh * t])
}

// The color at t (0 = magenta … 1 = violet) on the rainbow through the accents.
export function rainbowAt(t) {
  const stops = RAINBOW_KEYS.map(hexOf)
  const p = Math.min(1, Math.max(0, t)) * (stops.length - 1)
  const k = Math.min(stops.length - 2, Math.floor(p))
  return blend(stops[k], stops[k + 1], p - k)
}

// The lessons along the rainbow in their own order, easiest first: lesson 1 is magenta, the last one violet,
// and every lesson is one even step further along, so neighbours blend gradually.
const RAINBOW_ORDER = lessons.map((l) => l.n).sort((a, b) => a - b)
const LESSON_PALETTES = new Map(
  RAINBOW_ORDER.map((n, i) => [n, accentFromHex(rainbowAt(RAINBOW_ORDER.length > 1 ? i / (RAINBOW_ORDER.length - 1) : 0))]),
)

// Lesson n's color: the same on its card, in the gallery and on its own page.
export function paletteFor(n) {
  return LESSON_PALETTES.get(n) ?? PALETTES[(n - 1) % PALETTES.length]
}

// Where lesson n stands on the rainbow (0 = first), for listing lessons by color.
export function rainbowRank(n) {
  return RAINBOW_ORDER.indexOf(n)
}

// CSS variables used by .solid, .btn, .chip and the apps.
export function paletteVars(palette) {
  return {
    '--solid': palette.solid,
    '--solid-dark': palette.dark,
    '--solid-light': palette.light,
    '--solid-ink': palette.ink,
    '--solid-text': palette.text,
    '--accent': palette.accent,
  }
}
