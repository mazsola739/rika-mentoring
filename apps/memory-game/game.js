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

// Pick `pairs` random faces of the theme, put every one in twice, then shuffle the deck.
// turn and scores belong to the two-player mode: whose turn it is (0 or 1) and how many pairs each player found.
export function newGame(pairs, faceKeys) {
  const keys = shuffle(faceKeys).slice(0, pairs)
  const cards = shuffle([...keys, ...keys]).map((key, i) => ({ id: `${key}-${i}`, key, matched: false }))
  return { cards, flipped: [], moves: 0, startedAt: null, finishedAt: null, last: null, turn: 0, scores: [0, 0] }
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

  // A miss passes the turn to the other player (1 - 0 = 1, 1 - 1 = 0).
  if (game.cards[first].key !== card.key) {
    return { ...game, flipped: [first, index], moves, startedAt, turn: 1 - game.turn, last: { type: 'miss', moves } }
  }

  // A found pair scores a point for the player whose turn it is, and the same player goes again.
  const cards = game.cards.map((c, i) => (i === first || i === index ? { ...c, matched: true } : c))
  const scores = game.scores.map((score, i) => (i === game.turn ? score + 1 : score))
  const done = cards.every((c) => c.matched)
  return {
    ...game,
    cards,
    flipped: [],
    moves,
    scores,
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
