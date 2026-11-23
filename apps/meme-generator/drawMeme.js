// Pure canvas drawing: given an image and the settings, paint the meme. No React in here.

export const FONTS = {
  impact: { label: 'Impact', css: (px) => `${px}px Impact, Haettenschweiler, 'Arial Narrow Bold', 'Arial Black', sans-serif` },
  sans: { label: 'DM Sans', css: (px) => `700 ${px}px 'DM Sans', system-ui, sans-serif` },
  display: { label: 'Plus Jakarta Sans', css: (px) => `800 ${px}px 'Plus Jakarta Sans', system-ui, sans-serif` },
}

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

function drawBlock(ctx, text, { width, y, fromBottom, px, font, color }) {
  if (!text.trim()) return
  const maxWidth = width * 0.92
  let size = px
  let lines = []
  // A very long word would stick out: shrink the text step by step until every line fits.
  for (let i = 0; i < 8; i++) {
    ctx.font = FONTS[font].css(size)
    lines = wrap(ctx, text, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size *= 0.88
  }

  const lineHeight = size * 1.1
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.lineWidth = Math.max(2, size / 7)
  ctx.strokeStyle = outlineFor(color)
  ctx.fillStyle = color

  const startY = fromBottom ? y - lines.length * lineHeight : y
  lines.forEach((line, i) => {
    const lineY = startY + i * lineHeight
    // Outline first, fill on top: the classic meme look.
    ctx.strokeText(line, width / 2, lineY)
    ctx.fillText(line, width / 2, lineY)
  })
}

export function drawMeme(canvas, image, { top, bottom, font, size, color, caps }) {
  const { width, height } = canvasSize(image)
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(image, 0, 0, width, height)

  const px = (size * width) / REFERENCE_WIDTH
  const padding = Math.round(width * 0.035)
  const style = { width, px, font, color }
  const prepare = (text) => (caps ? text.toLocaleUpperCase() : text)

  drawBlock(ctx, prepare(top), { ...style, y: padding, fromBottom: false })
  drawBlock(ctx, prepare(bottom), { ...style, y: height - padding, fromBottom: true })
}
