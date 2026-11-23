import { FACE_KEYS } from './faces.js'

export const DIFFICULTIES = [6, 8, 12]

// Fisher–Yates shuffle: returns a new array, the original stays untouched.
export function shuffle(list) {
  const result = [...list]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Pick `pairs` random faces, put every one in twice, then shuffle the deck.
export function newGame(pairs) {
  const keys = shuffle(FACE_KEYS).slice(0, pairs)
  const cards = shuffle([...keys, ...keys]).map((key, i) => ({ id: `${key}-${i}`, key, matched: false }))
  return { cards, flipped: [], moves: 0, startedAt: null, finishedAt: null, last: null }
}

// Pure game logic: takes the current game and returns the next one (or the same object if nothing changes).
export function flipCard(game, index, now) {
  const card = game.cards[index]
  if (!card || card.matched || game.finishedAt || game.flipped.includes(index)) return game

  // A third click while a wrong pair is still showing turns that pair back right away.
  const open = game.flipped.length === 2 ? [] : game.flipped
  const startedAt = game.startedAt ?? now

  if (open.length === 0) {
    return { ...game, flipped: [index], startedAt, last: null }
  }

  const first = open[0]
  const moves = game.moves + 1

  if (game.cards[first].key !== card.key) {
    return { ...game, flipped: [first, index], moves, startedAt, last: { type: 'miss', moves } }
  }

  const cards = game.cards.map((c, i) => (i === first || i === index ? { ...c, matched: true } : c))
  const done = cards.every((c) => c.matched)
  return {
    ...game,
    cards,
    flipped: [],
    moves,
    startedAt,
    finishedAt: done ? now : null,
    last: { type: 'match', key: card.key, moves },
  }
}

export function hideFlipped(game) {
  return game.flipped.length === 2 ? { ...game, flipped: [] } : game
}

// Fewer moves wins; on equal moves the faster time wins.
export function isBetter(result, best) {
  if (!best) return true
  if (result.moves !== best.moves) return result.moves < best.moves
  return result.time < best.time
}

export function formatTime(ms) {
  const total = Math.floor(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = String(total % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
