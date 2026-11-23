// Small color helpers: HSL ↔ hex, harmonies and WCAG contrast.

const rand = (min, max) => min + Math.random() * (max - min)
const wrapHue = (h) => ((h % 360) + 360) % 360

export function hslToHex(h, s, l) {
  const sat = s / 100
  const light = l / 100
  const k = (n) => (n + h / 30) % 12
  const a = sat * Math.min(light, 1 - light)
  const f = (n) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const hex = (x) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`.toUpperCase()
}

export function hexToHue(hex) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255)
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  if (d === 0) return 0
  if (max === r) return wrapHue(60 * (((g - b) / d) % 6))
  if (max === g) return wrapHue(60 * ((b - r) / d + 2))
  return wrapHue(60 * ((r - g) / d + 4))
}

// Five [hue, saturation, lightness] triples for each harmony, built around one base hue.
const HARMONIES = {
  random: () => Array.from({ length: 5 }, () => [rand(0, 360), rand(45, 85), rand(32, 80)]),
  analogous: (h) => [-40, -20, 0, 20, 40].map((d, i) => [h + d, rand(55, 75), [30, 44, 56, 68, 82][i]]),
  complementary: (h) => [
    [h, rand(55, 75), 28],
    [h, rand(55, 75), 48],
    [h, rand(30, 50), 82],
    [h + 180, rand(55, 75), 62],
    [h + 180, rand(60, 80), 42],
  ],
  monochrome: (h) => [18, 34, 50, 66, 84].map((l) => [h, rand(45, 70), l]),
}

export const HARMONY_KEYS = Object.keys(HARMONIES)

/** A full new palette. Locked colors stay, and the harmony is built around the first locked one. */
export function generatePalette(current, mode) {
  const anchor = current.find((c) => c.locked)
  const baseHue = anchor ? hexToHue(anchor.hex) : rand(0, 360)
  const fresh = HARMONIES[mode](baseHue).map(([h, s, l]) => hslToHex(wrapHue(h), s, l))
  return current.map((c, i) => (c.locked ? c : { hex: fresh[i], locked: false }))
}

const channel = (value) => {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const DARK = '#111111'
const LIGHT = '#FFFFFF'

/** Dark or light text, whichever is easier to read on this background. */
export function readableInk(hex) {
  return contrast(hex, DARK) >= contrast(hex, LIGHT) ? DARK : LIGHT
}

/** WCAG rating of a contrast ratio for normal-size text (null = below AA). */
export const rating = (ratio) => (ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : null)

/** The palette as the end of an address: ['#3FA2C7', '#F0C808', …] → '#3FA2C7-F0C808-…'. */
export function paletteToHash(hexes) {
  return '#' + hexes.map((hex) => hex.slice(1)).join('-')
}

/** Five color codes from the end of an address, or null if it does not hold five valid codes. */
export function paletteFromHash(hash) {
  const hexes = hash
    .slice(1)
    .split('-')
    .map((part) => '#' + part.toUpperCase())
  return hexes.length === 5 && hexes.every((hex) => /^#[0-9A-F]{6}$/.test(hex)) ? hexes : null
}
