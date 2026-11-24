import { applyFilterPixels, canvasSupportsFilter, cssFilter } from './filters.js'

const PHOTO_RATIO = 3 / 4 // height / width

// Copies the current video frame into a 4:3 canvas: centered crop, mirrored like the
// preview (a selfie camera feels natural that way), with the chosen filter applied.
export function grabFrame(video, filterKey, mirror = true) {
  const vw = video.videoWidth
  const vh = video.videoHeight
  let sw = vw
  let sh = vw * PHOTO_RATIO
  if (sh > vh) {
    sh = vh
    sw = vh / PHOTO_RATIO
  }
  const sx = (vw - sw) / 2
  const sy = (vh - sh) / 2

  const width = Math.round(Math.min(sw, 960))
  const height = Math.round(width * PHOTO_RATIO)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: !canvasSupportsFilter })
  if (canvasSupportsFilter) ctx.filter = cssFilter(filterKey)
  if (mirror) {
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height)
  if (!canvasSupportsFilter) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    applyFilterPixels(ctx, width, height, filterKey)
  }
  return canvas
}

// Readable caption color on the frame: dark text on light frames, white on dark ones.
function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#1d1a16' : '#ffffff'
}

function caption(ctx, { title, date }, x, y, width, color) {
  ctx.fillStyle = inkFor(color)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `600 ${Math.round(width * 0.06)}px Fraunces, Georgia, serif`
  ctx.fillText(title, x + width / 2, y)
  ctx.globalAlpha = 0.75
  ctx.font = `500 ${Math.round(width * 0.032)}px "DM Sans", system-ui, sans-serif`
  ctx.fillText(date, x + width / 2, y + width * 0.065)
  ctx.globalAlpha = 1
}

// One photo in a frame with a wider bottom edge for the caption.
export function composeSingle(photo, color, text) {
  const pad = Math.round(photo.width * 0.05)
  const bottom = Math.round(photo.width * 0.2)
  const canvas = document.createElement('canvas')
  canvas.width = photo.width + pad * 2
  canvas.height = photo.height + pad + bottom
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(photo, pad, pad)
  caption(ctx, text, 0, photo.height + pad + bottom * 0.42, canvas.width, color)
  return canvas
}

// Four photos stacked vertically, like a classic booth strip.
export function composeStrip(photos, color, text) {
  const width = 480
  const height = Math.round(width * PHOTO_RATIO)
  const pad = 26
  const gap = 16
  const bottom = 120
  const canvas = document.createElement('canvas')
  canvas.width = width + pad * 2
  canvas.height = pad + photos.length * height + (photos.length - 1) * gap + bottom
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  photos.forEach((photo, i) => ctx.drawImage(photo, pad, pad + i * (height + gap), width, height))
  caption(ctx, text, 0, canvas.height - bottom * 0.56, canvas.width, color)
  return canvas
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('export-failed'))), 'image/png'))
}
