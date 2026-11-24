// Minesweeper rules as pure functions over an array of 81 cells. No React in here.
export const SIZE = 9
export const MINES = 10

const index = (row, col) => row * SIZE + col

export function neighbours(i) {
  const row = Math.floor(i / SIZE)
  const col = i % SIZE
  const result = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr
      const c = col + dc
      if ((dr || dc) && r >= 0 && r < SIZE && c >= 0 && c < SIZE) result.push(index(r, c))
    }
  }
  return result
}

export const emptyBoard = () =>
  Array.from({ length: SIZE * SIZE }, () => ({ mine: false, count: 0, open: false, flag: false }))

// A small seeded random generator (mulberry32): the same seed always gives the same numbers.
function seededRandom(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Mines are placed after the first click, never on or next to that cell, so the first click is always safe.
function placeMines(board, safeIndex, seed) {
  const random = seededRandom(seed)
  const forbidden = new Set([safeIndex, ...neighbours(safeIndex)])
  const candidates = board.map((_, i) => i).filter((i) => !forbidden.has(i))
  for (let k = candidates.length - 1; k > 0; k--) {
    const j = Math.floor(random() * (k + 1))
    ;[candidates[k], candidates[j]] = [candidates[j], candidates[k]]
  }
  const mines = new Set(candidates.slice(0, MINES))
  return board.map((cell, i) => ({
    ...cell,
    mine: mines.has(i),
    count: neighbours(i).filter((n) => mines.has(n)).length,
  }))
}

// Opening a 0 cell opens its neighbours too (flood fill with a queue).
function flood(board, start) {
  const next = board.map((c) => ({ ...c }))
  const queue = [start]
  while (queue.length) {
    const i = queue.shift()
    const cell = next[i]
    if (cell.open || cell.flag) continue
    cell.open = true
    if (cell.count === 0 && !cell.mine) queue.push(...neighbours(i))
  }
  return next
}

export const initialGame = () => ({ board: emptyBoard(), status: 'ready', startedAt: null, endedAt: null })

// The reducer stays pure: randomness (`seed`) and time (`now`) arrive inside the action,
// they are created in the click handler. (StrictMode calls reducers twice to check this.)
export function gameReducer(game, action) {
  const done = game.status === 'won' || game.status === 'lost'
  switch (action.type) {
    case 'reveal': {
      const cell = game.board[action.i]
      if (done || cell.open || cell.flag) return game
      let board = game.status === 'ready' ? placeMines(game.board, action.i, action.seed) : game.board
      const startedAt = game.startedAt ?? action.now
      if (board[action.i].mine) {
        board = board.map((c, i) => (c.mine || i === action.i ? { ...c, open: true } : c))
        return { board, status: 'lost', startedAt, endedAt: action.now, hit: action.i }
      }
      board = flood(board, action.i)
      const won = board.every((c) => c.mine || c.open)
      if (won) board = board.map((c) => (c.mine ? { ...c, flag: true } : c))
      return { board, status: won ? 'won' : 'playing', startedAt, endedAt: won ? action.now : null }
    }
    case 'flag': {
      const cell = game.board[action.i]
      if (done || cell.open) return game
      return { ...game, board: game.board.map((c, i) => (i === action.i ? { ...c, flag: !c.flag } : c)) }
    }
    case 'reset':
      return initialGame()
    default:
      return game
  }
}
