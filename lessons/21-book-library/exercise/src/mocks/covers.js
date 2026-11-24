// Book covers drawn in code: every book gets an SVG image made from its title and author.
// Five layouts and twelve colour schemes from the site's peacock palette; the book's number picks
// one of each, so a book always has the same cover and neighbours in a list look different.
import { xml } from './helpers.js'

// Like a real cover service, one picture in three sizes. The drawing is the same, only its pixel size
// changes; the small one leaves out the author, so the title stays readable as a thumbnail.
export const SIZES = { S: [100, 150], M: [200, 300], L: [400, 600] }

// An <img> cannot use the page's web fonts, so the covers use fonts every system has.
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

// bg: background, ink: text on it, accent: shapes and rules, soft: a calm second shade of bg.
const SCHEMES = [
  { bg: '#070B1A', ink: '#FFFFFF', accent: '#FEB800', soft: '#17254A' },
  { bg: '#083F58', ink: '#FFFFFF', accent: '#01C5AC', soft: '#0F5878' },
  { bg: '#017B6B', ink: '#FFFFFF', accent: '#FEB800', soft: '#0B9480' },
  { bg: '#013E8E', ink: '#FFFFFF', accent: '#01C5AC', soft: '#1756AC' },
  { bg: '#9A03B7', ink: '#FFFFFF', accent: '#FEB800', soft: '#AF2ECA' },
  { bg: '#F70677', ink: '#070B1A', accent: '#FFFFFF', soft: '#FA4C9B' },
  { bg: '#FD7701', ink: '#070B1A', accent: '#013E8E', soft: '#FE9840' },
  { bg: '#FEB800', ink: '#070B1A', accent: '#9A03B7', soft: '#FFCB47' },
  { bg: '#0197D8', ink: '#070B1A', accent: '#FFFFFF', soft: '#38AEE2' },
  { bg: '#01C5AC', ink: '#070B1A', accent: '#013E8E', soft: '#41D5C2' },
  { bg: '#F3ECDF', ink: '#111E3D', accent: '#F70677', soft: '#E4D8C4' },
  { bg: '#111E3D', ink: '#FFFFFF', accent: '#F70677', soft: '#1E2F5A' },
]

// ── Text ────────────────────────────────────────────────────────────────────
// SVG has no automatic line breaks, so the title is wrapped here. The width of a line is estimated
// from typical letter widths (in em), which is close enough for Georgia, Segoe UI and Arial.
function textWidth(text, size, { bold = false, sans = false, spacing = 0 } = {}) {
  let em = 0
  for (const ch of text) {
    if (ch === ' ') em += 0.27
    else if ("il.,:;'’!|jI".includes(ch)) em += 0.3
    else if ('ftr()-'.includes(ch)) em += 0.38
    else if ('mwMW'.includes(ch)) em += 0.86
    else if (ch !== ch.toLowerCase()) em += 0.7
    else em += 0.53
  }
  return em * size * (bold ? 1.12 : 1) * (sans ? 1.04 : 1) + spacing * [...text].length
}

function wrap(text, size, width, style) {
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (line && textWidth(next, size, style) > width) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

const fits = (lines, size, width, style) => lines.every((line) => textWidth(line, size, style) <= width)

// The biggest font size at which the text fits the box (at most `lines` lines and `height` units tall),
// with lines of similar length: the box is narrowed as long as the number of lines stays the same.
function fit(text, { max, min, width, height = Infinity, lines: maxLines, leading = 1.16, ...style }) {
  const tall = (size, count) => Math.round(size * leading) * (count - 1) + Math.round(size * 1.02)
  for (let size = max; size >= min; size -= 2) {
    let lines = wrap(text, size, width, style)
    if (lines.length > maxLines || tall(size, lines.length) > height || !fits(lines, size, width, style)) continue
    for (let w = width - 8; w > width / 2; w -= 8) {
      const narrower = wrap(text, size, w, style)
      if (narrower.length !== lines.length || !fits(narrower, size, w, style)) break
      lines = narrower
    }
    return { size, lines, style, leading, height: tall(size, lines.length) }
  }
  // Still too long at the smallest size: as many lines as fit, the last one cut with an ellipsis.
  let lines = wrap(text, min, width, style)
  while (lines.length > 1 && (lines.length > maxLines || tall(min, lines.length) > height)) lines = lines.slice(0, -1)
  if (lines.join(' ') !== text) lines[lines.length - 1] += '…'
  return { size: min, lines, style, leading, height: tall(min, lines.length) }
}

// Draws a fitted block. `top` is the top edge of the first line; returns the SVG and the bottom edge.
function draw(block, { x, top, anchor = 'middle', family = SERIF, fill, italic = false, opacity = 1 }) {
  const { size, lines, style, leading } = block
  const step = Math.round(size * leading)
  const attrs = [
    `x="${x}"`,
    `text-anchor="${anchor}"`,
    `font-family="${family}"`,
    `font-size="${size}"`,
    `font-weight="${style.bold ? 700 : 400}"`,
    italic && 'font-style="italic"',
    style.spacing && `letter-spacing="${style.spacing}"`,
    `fill="${fill}"`,
    opacity < 1 && `fill-opacity="${opacity}"`,
  ]
    .filter(Boolean)
    .join(' ')
  const first = top + Math.round(size * 0.78)
  const svg = lines.map((line, i) => `<text ${attrs} y="${first + i * step}">${xml(line)}</text>`).join('')
  return { svg, bottom: top + block.height }
}

const authorOf = (book) => book.authors.join(', ')

// Names stay on one line if they can (a bit smaller), and only then wrap to two.
function fitName(text, options) {
  const one = fit(text, { ...options, lines: 1 })
  return one.lines[0].endsWith('…') ? fit(text, { ...options, lines: 2 }) : one
}

// The first letter that is not part of an article: "The Hobbit" → H, "A Pál utcai fiúk" → P.
const initialOf = (title) =>
  (title.replace(/^(the|an?|az|le|la|les|el|die|der|das)\s+/i, '').match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase()

// ── Layouts ─────────────────────────────────────────────────────────────────
// Each one gets the book, a colour scheme and whether this is the small thumbnail
// (bigger title, no author). Sizes are in the 400 × 600 units of the viewBox.

// A cloth-bound classic: a double frame, small diamonds, a centred serif title.
function framed(book, c, small) {
  const diamond = (y) => `<path d="M200 ${y - 11}l11 11-11 11-11-11z" fill="${c.accent}"/>`
  const title = small
    ? fit(book.title, { max: 84, min: 40, width: 290, height: 330, lines: 4 })
    : fit(book.title, { max: 68, min: 26, width: 280, height: 250, lines: 5 })
  const author = small ? null : fitName(authorOf(book), { max: 30, min: 21, width: 260 })
  // Title, rule and author are centred together between the two diamonds.
  const group = title.height + (author ? 56 + author.height : 0)
  const text = draw(title, { x: 200, top: Math.round(312 - group / 2), fill: c.ink })
  let svg =
    `<rect x="28" y="28" width="344" height="544" fill="none" stroke="${c.accent}" stroke-width="3"/>` +
    `<rect x="40" y="40" width="320" height="520" fill="none" stroke="${c.accent}" stroke-width="1.2" stroke-opacity=".7"/>` +
    diamond(112) +
    `<path d="M118 112h66M216 112h66" stroke="${c.accent}" stroke-width="1.5"/>` +
    text.svg +
    diamond(512)
  if (author) {
    svg +=
      `<path d="M176 ${text.bottom + 28}h48" stroke="${c.accent}" stroke-width="2"/>` +
      draw(author, { x: 200, top: text.bottom + 56, fill: c.ink, italic: true, opacity: 0.85 }).svg
  }
  return svg
}

// A retro sunrise: a striped sun over a calm horizon, the title in bold sans below it.
function sunrise(book, c, small) {
  const bands = [244, 270, 292].map((y, i) => `<rect x="0" y="${y}" width="400" height="${5 + i * 4}" fill="${c.bg}"/>`).join('')
  const style = { width: 316, lines: 4, leading: 1.1, bold: true, sans: true }
  const title = small
    ? fit(book.title, { ...style, max: 80, min: 40, height: 230 })
    : fit(book.title, { ...style, max: 60, min: 26, height: 160 })
  let svg =
    `<circle cx="250" cy="318" r="138" fill="${c.accent}"/>` +
    bands +
    `<rect x="0" y="318" width="400" height="282" fill="${c.soft}"/>` +
    `<rect x="0" y="318" width="400" height="4" fill="${c.accent}"/>` +
    draw(title, { x: 40, top: small ? 350 : 360, anchor: 'start', family: SANS, fill: c.ink }).svg
  if (!small) {
    const author = fit(authorOf(book).toUpperCase(), { max: 22, min: 13, width: 320, lines: 1, sans: true, spacing: 2 })
    svg += draw(author, { x: 40, top: 542, anchor: 'start', family: SANS, fill: c.ink, opacity: 0.85 }).svg
  }
  return svg
}

// A modern band: a simple emblem on top, a light panel with the title and author below.
function panel(book, c, small) {
  const light = c.ink === '#FFFFFF'
  const paper = light ? '#FFFDF7' : '#0B1222'
  const paperInk = light ? '#0B1222' : '#FFFFFF'
  const style = { width: 316, lines: 4, leading: 1.12, bold: true }
  const title = small
    ? fit(book.title, { ...style, max: 78, min: 40, height: 230 })
    : fit(book.title, { ...style, max: 60, min: 24, height: 162 })
  let svg =
    `<circle cx="196" cy="168" r="96" fill="${c.soft}"/>` +
    `<circle cx="240" cy="134" r="40" fill="${c.accent}"/>` +
    `<rect x="0" y="318" width="400" height="282" fill="${paper}"/>` +
    `<rect x="0" y="318" width="400" height="10" fill="${c.accent}"/>` +
    draw(title, { x: 40, top: small ? 352 : 358, anchor: 'start', fill: paperInk }).svg
  if (!small) {
    const author = fit(authorOf(book), { max: 26, min: 15, width: 320, lines: 1, sans: true })
    svg += draw(author, { x: 40, top: 540, anchor: 'start', family: SANS, fill: paperInk, opacity: 0.72 }).svg
  }
  return svg
}

// A big initial letter in the background, the title in spaced capitals above it.
function initial(book, c, small) {
  const style = { width: 320, leading: 1.18, bold: true, sans: true, spacing: 1.5 }
  const title = small
    ? fit(book.title.toUpperCase(), { ...style, max: 64, min: 34, height: 260, lines: 4 })
    : fit(book.title.toUpperCase(), { ...style, max: 44, min: 20, height: 150, lines: 3 })
  const text = draw(title, { x: 200, top: 72, family: SANS, fill: c.ink })
  let svg =
    `<text x="200" y="500" text-anchor="middle" font-family="${SERIF}" font-size="430" font-weight="700" fill="${c.soft}">${xml(initialOf(book.title))}</text>` +
    `<path d="M170 ${text.bottom + 22}h60" stroke="${c.accent}" stroke-width="4"/>` +
    text.svg
  if (!small) {
    const author = fitName(authorOf(book), { max: 30, min: 21, width: 300 })
    svg += draw(author, { x: 200, top: 584 - author.height, fill: c.ink, italic: true, opacity: 0.9 }).svg
  }
  return svg
}

// Rainbow arches rising from the bottom edge, a serif title above them.
function arches(book, c, small) {
  const rings = [
    [236, c.accent],
    [184, c.soft],
    [132, c.ink],
    [80, c.accent],
  ]
  const style = { width: 320, leading: 1.12, bold: true }
  const title = small
    ? fit(book.title, { ...style, max: 80, min: 38, height: 270, lines: 4 })
    : fit(book.title, { ...style, max: 58, min: 24, height: 210, lines: 5 })
  const text = draw(title, { x: 200, top: 72, fill: c.ink })
  let svg = rings.map(([r, fill]) => `<circle cx="200" cy="600" r="${r}" fill="${fill}"/>`).join('') + text.svg
  if (!small) {
    const author = fit(authorOf(book).toUpperCase(), { max: 22, min: 13, width: 300, lines: 1, sans: true, spacing: 2 })
    svg += draw(author, { x: 200, top: Math.min(text.bottom + 26, 318), family: SANS, fill: c.ink, opacity: 0.85 }).svg
  }
  return svg
}

const LAYOUTS = [framed, sunrise, panel, initial, arches]

// A shadow and a highlight on the left edge make the flat picture look like a book.
const SPINE =
  '<rect width="16" height="600" fill="#000" fill-opacity=".16"/><rect x="16" width="3" height="600" fill="#FFF" fill-opacity=".14"/>'

const cache = new Map()

export function drawCover(book, size = 'M') {
  const key = `${book.id}-${size}`
  if (!cache.has(key)) {
    const n = Number(book.id.replace(/\D/g, ''))
    const colors = SCHEMES[(n * 7) % SCHEMES.length]
    const layout = LAYOUTS[n % LAYOUTS.length]
    const [width, height] = SIZES[size]
    const label = xml(`${book.title} – ${authorOf(book)}`)
    cache.set(
      key,
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 400 600" role="img" aria-label="${label}">` +
        `<title>${label}</title><rect width="400" height="600" fill="${colors.bg}"/>${layout(book, colors, size === 'S')}${SPINE}</svg>`,
    )
  }
  return cache.get(key)
}
