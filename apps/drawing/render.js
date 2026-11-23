// Drawing helpers shared by live drawing and by replaying the history.
// A stroke stores its points relative to the canvas width ([x / w, y / w, widthFactor]),
// so it can be redrawn at any size: after a resize, an undo, or for a sharper export.

export const PAPER = '#ffffff'
export const ASPECT = 3 / 4 // height / width

const point = (stroke, i, w) => {
  const [x, y, f] = stroke.points[i]
  return { x: x * w, y: y * w, f }
}
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, f: (a.f + b.f) / 2 })

function style(ctx, stroke) {
  // The eraser paints with the paper color, so the exported PNG stays opaque.
  const color = stroke.tool === 'eraser' ? PAPER : stroke.color
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

// A round dot where the stroke starts (a single click/tap is a dot).
export function drawStart(ctx, stroke, w) {
  style(ctx, stroke)
  const p = point(stroke, 0, w)
  ctx.beginPath()
  ctx.arc(p.x, p.y, (stroke.size * w * p.f) / 2, 0, Math.PI * 2)
  ctx.fill()
}

// Smooth curve: from the middle of the previous segment to the middle of this one,
// bending through the real point in between (quadratic Bézier).
export function drawSegments(ctx, stroke, from, w) {
  style(ctx, stroke)
  for (let i = Math.max(1, from); i < stroke.points.length; i++) {
    const control = point(stroke, i - 1, w)
    const start = i >= 2 ? mid(point(stroke, i - 2, w), control) : control
    const end = mid(control, point(stroke, i, w))
    ctx.lineWidth = stroke.size * w * control.f
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.quadraticCurveTo(control.x, control.y, end.x, end.y)
    ctx.stroke()
  }
}

// The last half segment, drawn when the pointer is released.
export function drawEnd(ctx, stroke, w) {
  const n = stroke.points.length
  if (n < 2) return
  style(ctx, stroke)
  const last = point(stroke, n - 1, w)
  const start = mid(point(stroke, n - 2, w), last)
  ctx.lineWidth = stroke.size * w * last.f
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(last.x, last.y)
  ctx.stroke()
}

export function drawStroke(ctx, stroke, w) {
  drawStart(ctx, stroke, w)
  drawSegments(ctx, stroke, 1, w)
  drawEnd(ctx, stroke, w)
}

// Only what comes after the last "clear" is visible.
export function visibleStrokes(history) {
  const lastClear = history.findLastIndex((entry) => entry.type === 'clear')
  return history.slice(lastClear + 1)
}

export function redraw(ctx, history, w) {
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, w, w * ASPECT)
  visibleStrokes(history).forEach((stroke) => drawStroke(ctx, stroke, w))
}
