// Pure game logic: every function takes a game object and returns a new one. No React in here.
export const GRID = 20
export const MAX_LEVEL = 10

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }

const same = (a, b) => a.x === b.x && a.y === b.y

export function placeFood(snake) {
  const free = []
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y })
    }
  }
  return free.length ? free[Math.floor(Math.random() * free.length)] : null
}

export function createGame() {
  const snake = [
    { x: 7, y: 10 },
    { x: 6, y: 10 },
    { x: 5, y: 10 },
  ]
  return { snake, dir: 'right', queue: [], food: placeFood(snake), score: 0, eaten: 0, over: false }
}

// Every 3 pieces of food the snake gets a level faster.
export const levelOf = (game) => Math.min(MAX_LEVEL, 1 + Math.floor(game.eaten / 3))
export const tickMs = (game) => 150 - (levelOf(game) - 1) * 10

// Turns are queued (max. 2), so two quick key presses inside one tick both count.
// Reversing straight into your own neck is ignored.
export function turn(game, dir) {
  const last = game.queue.at(-1) ?? game.dir
  if (!DIRS[dir] || dir === last || OPPOSITE[dir] === last || game.queue.length >= 2) return game
  return { ...game, queue: [...game.queue, dir] }
}

export function step(game) {
  if (game.over) return game
  const [dir, ...queue] = game.queue.length ? game.queue : [game.dir]
  const head = game.snake[0]
  const next = { x: head.x + DIRS[dir].x, y: head.y + DIRS[dir].y }
  const eats = game.food != null && same(next, game.food)

  // The tail moves out of the way in the same tick, unless the snake grows.
  const body = eats ? game.snake : game.snake.slice(0, -1)
  const hitsWall = next.x < 0 || next.y < 0 || next.x >= GRID || next.y >= GRID
  const hitsSelf = body.some((s) => same(s, next))
  if (hitsWall || hitsSelf) return { ...game, dir, queue, over: true }

  const snake = [next, ...body]
  if (!eats) return { ...game, snake, dir, queue }

  const food = placeFood(snake)
  return {
    ...game,
    snake,
    dir,
    queue,
    food,
    eaten: game.eaten + 1,
    score: game.score + 10 * levelOf(game),
    over: food == null, // the whole board is full: nothing left to eat
  }
}
