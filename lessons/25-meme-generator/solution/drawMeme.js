// Pure canvas drawing: given an image and the settings, paint the meme. No React in here.

// System fonts only: the canvas can draw with a font only once it is loaded, and these are always ready.
export const FONTS = {
  impact: { label: 'Impact', family: "Impact, Haettenschweiler, 'Arial Narrow Bold', 'Arial Black', sans-serif" },
  arial: { label: 'Arial Black', family: "'Arial Black', 'Arial Bold', Arial, sans-serif" },
  comic: { label: 'Comic Sans', family: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" },
  georgia: { label: 'Georgia', family: "Georgia, 'Times New Roman', serif" },
}

// The stickers' emojis, in the system's colourful emoji fonts (Windows, Apple, Android and Linux).
const EMOJI_FONT = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif"

// Text size is set for an 800 px wide meme and scales with the real canvas width.
const REFERENCE_WIDTH = 800
const MAX_WIDTH = 800
const MAX_HEIGHT = 1000

// The canvas keeps the image's own proportions: nothing is cropped or stretched.
export function canvasSize(image) {
  const w = image.naturalWidth || image.width
  const h = image.naturalHeight || image.height
  const scale = Math.min(MAX_WIDTH / w, MAX_HEIGHT / h)
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}

function wrap(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

// Light text gets a black outline, dark text a white one, so it stays readable on any picture.
function outlineFor(hex) {
  const n = Number.parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 140 ? '#000000' : '#ffffff'
}

// The canvas rotates in radians (a full turn is 2π); people think in degrees.
function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

// One caption block, rotated by `angle` degrees around its own centre. Returns its box for hit testing.
// The top caption hangs down from y, the bottom caption stands up from y.
function drawBlock(ctx, text, { x, y, angle, fromBottom, px, font, color, maxWidth }) {
  let size = px
  let lines = []
  // A very long word would stick out: shrink the text step by step until every line fits.
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px ${FONTS[font].family}`
    lines = wrap(ctx, text, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size *= 0.88
  }

  const lineHeight = size * 1.1
  const height = lines.length * lineHeight
  const top = fromBottom ? y - height : y
  const centerY = top + height / 2
  // An empty caption has width 0: there is nothing to grab.
  const width = Math.max(0, ...lines.map((line) => ctx.measureText(line).width))

  ctx.save()
  // Move the origin to the block's centre and rotate there, then draw the lines around (0, 0).
  ctx.translate(x, centerY)
  ctx.rotate(toRadians(angle))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.lineWidth = Math.max(2, size / 7)
  ctx.strokeStyle = outlineFor(color)
  ctx.fillStyle = color
  lines.forEach((line, i) => {
    const lineY = -height / 2 + i * lineHeight
    // Outline first, fill on top: the classic meme look.
    ctx.strokeText(line, 0, lineY)
    ctx.fillText(line, 0, lineY)
  })
  ctx.restore()

  return { cx: x, cy: centerY, width, height, angle }
}

// One emoji sticker with its centre at (x, y), rotated by `angle` degrees. Returns its box.
function drawSticker(ctx, emoji, { x, y, angle, size }) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(toRadians(angle))
  ctx.font = `${size}px ${EMOJI_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 0, 0)
  ctx.restore()
  return { cx: x, cy: y, width: size, height: size, angle }
}

/**
 * Paints the meme and returns the boxes of everything on it, in drawing order:
 * [{ id, x, y, cx, cy, width, height, angle }]. Positions (x, y) are fractions of the canvas (0..1),
 * the box (cx, cy, width, height) is in canvas pixels.
 */
export function drawMeme(canvas, image, { text, style, positions, stickers }) {
  const { width, height } = canvasSize(image)
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(image, 0, 0, width, height)

  const common = {
    px: (style.size * width) / REFERENCE_WIDTH,
    font: style.font,
    color: style.color,
    maxWidth: width * 0.92,
  }
  const boxes = []
  for (const id of ['top', 'bottom']) {
    const { x, y, angle } = positions[id]
    const caption = style.caps ? text[id].toLocaleUpperCase() : text[id]
    const box = drawBlock(ctx, caption, { ...common, x: x * width, y: y * height, angle, fromBottom: id === 'bottom' })
    boxes.push({ id, x, y, ...box })
  }
  // Stickers go on top of the captions, so their boxes come last and are found first when grabbing.
  for (const sticker of stickers) {
    const box = drawSticker(ctx, sticker.emoji, {
      x: sticker.x * width,
      y: sticker.y * height,
      angle: sticker.angle,
      size: width * 0.18,
    })
    boxes.push({ id: sticker.id, x: sticker.x, y: sticker.y, ...box })
  }
  return boxes
}

// Keeps a position on the canvas: 0 is the left or top edge, 1 the right or bottom edge.
export function clamp(value) {
  return Math.min(1, Math.max(0, value))
}

// Is the point (in canvas pixels) inside the possibly rotated box? 12 px to spare, so it is easy to grab.
export function isInside(point, box) {
  if (box.width === 0) return false
  // Turn the point back around the box's centre: then a straight rectangle test is enough.
  const dx = point.x - box.cx
  const dy = point.y - box.cy
  const turn = toRadians(-box.angle)
  const localX = dx * Math.cos(turn) - dy * Math.sin(turn)
  const localY = dx * Math.sin(turn) + dy * Math.cos(turn)
  return Math.abs(localX) <= box.width / 2 + 12 && Math.abs(localY) <= box.height / 2 + 12
}
