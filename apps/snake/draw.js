import { DIRS, GRID } from './engine.js'

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// Blends two hex colours: t = 0 gives `a`, t = 1 gives `b`.
function mix(a, b, t) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return `rgb(${ca.map((v, i) => Math.round(v + (cb[i] - v) * t)).join(', ')})`
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h) // older browsers
  ctx.fill()
}

// Draws one frame. The canvas is redrawn from the game object every time; React does not touch it.
export function drawGame(ctx, game, colors) {
  const size = ctx.canvas.width
  const cell = size / GRID

  ctx.fillStyle = colors.board
  ctx.fillRect(0, 0, size, size)

  // A very light checkerboard helps to judge distances.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)'
  for (let y = 0; y < GRID; y++) {
    for (let x = y % 2; x < GRID; x += 2) ctx.fillRect(x * cell, y * cell, cell, cell)
  }

  if (game.food) {
    const cx = (game.food.x + 0.5) * cell
    const cy = (game.food.y + 0.5) * cell
    ctx.save()
    ctx.shadowColor = colors.food
    ctx.shadowBlur = cell * 0.8
    ctx.fillStyle = colors.food
    ctx.beginPath()
    ctx.arc(cx, cy, cell * 0.36, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    ctx.fillStyle = colors.spark
    ctx.beginPath()
    ctx.arc(cx - cell * 0.12, cy - cell * 0.12, cell * 0.1, 0, Math.PI * 2)
    ctx.fill()
  }

  const last = Math.max(1, game.snake.length - 1)
  // Tail first, so the head is painted on top.
  for (let i = game.snake.length - 1; i >= 0; i--) {
    const s = game.snake[i]
    const inset = i === 0 ? cell * 0.04 : cell * 0.1
    ctx.fillStyle = mix(colors.head, colors.tail, i / last)
    roundRect(ctx, s.x * cell + inset, s.y * cell + inset, cell - inset * 2, cell - inset * 2, cell * 0.3)
  }

  // Eyes look in the direction of travel.
  const head = game.snake[0]
  const d = DIRS[game.dir]
  const cx = (head.x + 0.5) * cell
  const cy = (head.y + 0.5) * cell
  const side = { x: -d.y, y: d.x }
  for (const sign of [-1, 1]) {
    const ex = cx + d.x * cell * 0.14 + side.x * sign * cell * 0.2
    const ey = cy + d.y * cell * 0.14 + side.y * sign * cell * 0.2
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(ex, ey, cell * 0.12, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = colors.board
    ctx.beginPath()
    ctx.arc(ex + d.x * cell * 0.04, ey + d.y * cell * 0.04, cell * 0.06, 0, Math.PI * 2)
    ctx.fill()
  }
}
