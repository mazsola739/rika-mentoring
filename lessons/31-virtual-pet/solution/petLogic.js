// Everything that happens to the pet, as pure functions: the reducer, the decay over time and the mood.
const HOUR = 3600 * 1000
const MAX_AWAY = 7 * 24 * HOUR // after a week away we stop counting
const STORAGE_KEY = 'rika:virtual-pet:pet'

export const STATS = ['fullness', 'happiness', 'energy']
export const PET_COLORS = ['#B995FF', '#7FD3D5', '#D97B66'] // from the Ink Marble palette

// Change per hour of pet time. Sleeping slows hunger and recharges energy.
const RATES = {
  awake: { fullness: -12, happiness: -9, energy: -8 },
  asleep: { fullness: -6, happiness: -2, energy: 25 },
}

const clamp = (v) => Math.min(100, Math.max(0, v))

export function newPet(name, color, now) {
  return {
    name,
    color,
    stats: { fullness: 80, happiness: 80, energy: 80 },
    sleeping: false,
    age: 0, // pet time in ms (runs faster in fast-forward mode)
    updatedAt: now,
  }
}

// Moves the pet forward by `ms` of pet time, in one-minute chunks, so a long sleep
// can end halfway (full energy wakes the pet up) and the rest of the time counts as awake.
export function advance(pet, ms) {
  let { stats, sleeping } = pet
  let woke = false
  let left = ms
  while (left > 0) {
    const chunk = Math.min(left, 60 * 1000)
    left -= chunk
    const rate = RATES[sleeping ? 'asleep' : 'awake']
    const hours = chunk / HOUR
    // A hungry or exhausted pet gets sad faster.
    const gloom = !sleeping && (stats.fullness < 25 || stats.energy < 20) ? -8 : 0
    stats = {
      fullness: clamp(stats.fullness + rate.fullness * hours),
      happiness: clamp(stats.happiness + (rate.happiness + gloom) * hours),
      energy: clamp(stats.energy + rate.energy * hours),
    }
    if (sleeping && stats.energy >= 100) {
      sleeping = false
      woke = true
    }
  }
  return { pet: { ...pet, stats, sleeping, age: pet.age + ms }, woke }
}

export function moodOf(pet) {
  if (pet.sleeping) return 'sleeping'
  const { fullness, happiness, energy } = pet.stats
  if (fullness < 25) return 'hungry'
  if (energy < 20) return 'tired'
  if (happiness < 30) return 'sad'
  if (happiness >= 65 && fullness >= 45 && energy >= 35) return 'happy'
  return 'okay'
}

export function stageOf(pet) {
  if (pet.age < 12 * HOUR) return 'baby'
  if (pet.age < 72 * HOUR) return 'child'
  return 'adult'
}

export function levelOf(value) {
  if (value >= 75) return 3
  if (value >= 45) return 2
  if (value >= 25) return 1
  return 0
}

// ── Reducer ───────────────────────────────────────────────
// State: { pet, away, last }. `away` describes what happened while the page was closed,
// `last` is the latest event (for the message and the little animation).
export function petReducer(state, action) {
  const { pet } = state
  const now = action.now
  const event = (type, result = 'ok') => ({ type, result, at: now })

  switch (action.type) {
    case 'adopt':
      return { pet: newPet(action.name, action.color, now), away: null, last: event('adopt') }

    case 'tick': {
      if (!pet) return state
      const { pet: next, woke } = advance(pet, Math.max(0, now - pet.updatedAt) * action.speed)
      return { ...state, pet: { ...next, updatedAt: now }, last: woke ? event('woke') : state.last }
    }

    case 'feed': {
      if (!pet || pet.sleeping) return state
      if (pet.stats.fullness >= 95) return { ...state, last: event('feed', 'full') }
      const stats = { ...pet.stats, fullness: clamp(pet.stats.fullness + 25), happiness: clamp(pet.stats.happiness + 3) }
      return { ...state, pet: { ...pet, stats }, last: event('feed') }
    }

    case 'play': {
      if (!pet || pet.sleeping) return state
      if (pet.stats.energy < 15) return { ...state, last: event('play', 'tired') }
      const { fullness, happiness, energy } = pet.stats
      const stats = { fullness: clamp(fullness - 6), happiness: clamp(happiness + 20), energy: clamp(energy - 12) }
      return { ...state, pet: { ...pet, stats }, last: event('play') }
    }

    case 'sleep':
      return pet ? { ...state, pet: { ...pet, sleeping: true }, last: event('sleep') } : state

    case 'wake':
      return pet ? { ...state, pet: { ...pet, sleeping: false }, last: event('wake') } : state

    case 'rename':
      return pet ? { ...state, pet: { ...pet, name: action.name }, last: event('rename') } : state

    case 'recolor':
      return pet ? { ...state, pet: { ...pet, color: action.color } } : state

    case 'dismissAway':
      return { ...state, away: null }

    case 'reset':
      return { pet: null, away: null, last: null }

    default:
      return state
  }
}

// ── Saving and the time spent away ───────────────────────
export function savePet(pet) {
  try {
    if (pet) localStorage.setItem(STORAGE_KEY, JSON.stringify(pet))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage blocked: the pet lives until the tab is closed
  }
}

function loadPet() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && typeof saved.name === 'string' && saved.stats && Number.isFinite(saved.updatedAt)) return saved
  } catch {
    // broken or missing data: start with the adoption form
  }
  return null
}

// Lazy initial state for useReducer: load the pet and replay the time that passed since the last save.
export function restore(now = Date.now()) {
  const saved = loadPet()
  if (!saved) return { pet: null, away: null, last: null }
  const ms = Math.min(MAX_AWAY, Math.max(0, now - saved.updatedAt))
  const { pet } = advance(saved, ms)
  const away =
    ms >= 60 * 1000
      ? {
          ms,
          drops: STATS.filter((key) => saved.stats[key] - pet.stats[key] >= 10),
          wokeUp: saved.sleeping && !pet.sleeping,
        }
      : null
  return { pet: { ...pet, updatedAt: now }, away, last: null }
}
