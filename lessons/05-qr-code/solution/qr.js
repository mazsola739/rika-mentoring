import QRCode from 'qrcode'

// The quiet zone around the code, in modules (the small squares). Scanners need some empty space.
const MARGIN = 2
const LIGHT = '#ffffff'
const FONT = 'Arial, Helvetica, sans-serif'
const EMOJI_FONT = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif"

// The same options object goes to every renderer of the library.
function optionsFor({ color, level, size }) {
  return {
    errorCorrectionLevel: level,
    margin: MARGIN,
    width: size,
    color: { dark: color, light: LIGHT },
  }
}

// An emoji badge sits on a plain white square; a text badge gets a colored square with white letters.
export function isEmoji(label) {
  return /\p{Extended_Pictographic}/u.test(label)
}

// Where the center logo sits, measured in modules, so it scales with the code.
function badgeGeometry(total, label) {
  const side = Math.round((total - MARGIN * 2) * 0.24)
  const start = (total - side) / 2
  const emoji = isEmoji(label)
  return {
    emoji,
    start,
    side,
    pad: 0.8,
    center: total / 2,
    outerRadius: side * 0.3,
    innerRadius: side * 0.22,
    fontSize: side * (emoji ? 0.62 : label.length > 2 ? 0.32 : 0.42),
  }
}

function escapeXml(s) {
  return s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

// The badge as SVG elements, in module units (the library's SVG uses one unit per module).
function badgeSvg(total, label, color) {
  const g = badgeGeometry(total, label)
  const outer = `<rect x="${g.start - g.pad}" y="${g.start - g.pad}" width="${g.side + g.pad * 2}" height="${g.side + g.pad * 2}" rx="${g.outerRadius}" fill="${LIGHT}"/>`
  const text = (fill, family, weight) =>
    `<text x="${g.center}" y="${g.center}" fill="${fill}" font-family="${family}" font-weight="${weight}" font-size="${g.fontSize}" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>`
  if (g.emoji) return outer + text('#000000', EMOJI_FONT.replace(/'/g, ''), 400)
  const inner = `<rect x="${g.start}" y="${g.start}" width="${g.side}" height="${g.side}" rx="${g.innerRadius}" fill="${color}"/>`
  return outer + inner + text(LIGHT, FONT, 700)
}

/** Builds the SVG markup and returns some facts about the code (version, module count). */
export async function buildSvg(text, opts) {
  const qr = QRCode.create(text, { errorCorrectionLevel: opts.level })
  const total = qr.modules.size + MARGIN * 2
  let markup = await QRCode.toString(text, { ...optionsFor(opts), type: 'svg' })
  if (opts.badge) markup = markup.replace('</svg>', `${badgeSvg(total, opts.badge, opts.color)}</svg>`)
  return { markup, version: qr.version, modules: qr.modules.size }
}

/** Draws the code on a canvas with the library, adds the logo, and returns a PNG Blob. */
export async function buildPng(text, opts) {
  const canvas = await QRCode.toCanvas(text, optionsFor(opts))

  if (opts.badge) {
    const total = QRCode.create(text, { errorCorrectionLevel: opts.level }).modules.size + MARGIN * 2
    const scale = canvas.width / total
    const g = badgeGeometry(total, opts.badge)
    const ctx = canvas.getContext('2d')
    function box(x, size, radius, fill) {
      ctx.beginPath()
      ctx.roundRect(x * scale, x * scale, size * scale, size * scale, radius * scale)
      ctx.fillStyle = fill
      ctx.fill()
    }
    box(g.start - g.pad, g.side + g.pad * 2, g.outerRadius, LIGHT)
    if (!g.emoji) box(g.start, g.side, g.innerRadius, opts.color)
    // Black paint for the emoji: symbols without a color glyph (♥, ★) would otherwise vanish on white.
    ctx.fillStyle = g.emoji ? '#000000' : LIGHT
    ctx.font = g.emoji ? `${g.fontSize * scale}px ${EMOJI_FONT}` : `700 ${g.fontSize * scale}px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(opts.badge, g.center * scale, g.center * scale)
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))), 'image/png')
  })
}

// The library throws this message when the data does not fit into the largest QR version.
export function isTooLong(error) {
  return /too big|amount of data/i.test(error?.message ?? '')
}

/** Starts a download in the browser: a temporary object URL on an invisible link. */
export function download(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  // Give the browser a moment to start the download before freeing the memory.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function fileNameFor(text) {
  const slug = text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
    .toLowerCase()
  return `qr-${slug || 'code'}`
}
