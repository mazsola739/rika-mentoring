import { MAX_TRIES, dailyAnswer, dateKey, previousDay, randomAnswer } from './logic.js'
import { WORD_LISTS } from './wordLists.js'

const PREFIX = 'rika:wordle:'

function read(name) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + name))
  } catch {
    return null
  }
}

function write(name, value) {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(value))
  } catch {
    // storage blocked: the game still works, it just is not remembered
  }
}

// ── The chosen word list ('en' or 'hu') ───────────────────
export function loadWordList() {
  const saved = read('list')
  return saved in WORD_LISTS ? saved : null
}

export function saveWordList(words) {
  write('list', words)
}

// A save only counts if every guess is a word of this list, so the two lists never mix.
const validGuesses = (list, guesses) => Array.isArray(guesses) && guesses.every((g) => list.valid.has(g))

// Every word list has its own daily game, practice game and statistics.
// Daily: today's word, plus today's guesses if there are any. Practice: the saved word or a new one.
export function loadGame(mode, words) {
  const list = WORD_LISTS[words]
  const saved = read(`${words}:${mode}`)
  if (mode === 'daily') {
    const date = dateKey()
    const guesses = saved?.date === date && validGuesses(list, saved.guesses) ? saved.guesses : []
    return { date, answer: dailyAnswer(date, list.answers), guesses }
  }
  if (saved && list.answers.includes(saved.answer) && validGuesses(list, saved.guesses)) {
    return { answer: saved.answer, guesses: saved.guesses }
  }
  return { answer: randomAnswer(null, list.answers), guesses: [] } // pure: the Game's effect saves it
}

export function saveGame(mode, words, game) {
  if (mode === 'daily') write(`${words}:daily`, { date: game.date, guesses: game.guesses })
  else write(`${words}:practice`, { answer: game.answer, guesses: game.guesses })
}

// Called from the "New word" button: stores a fresh practice word before the board remounts.
export function startNewPracticeGame(previous, words) {
  saveGame('practice', words, { answer: randomAnswer(previous, WORD_LISTS[words].answers), guesses: [] })
}

// ── Statistics ────────────────────────────────────────────
const EMPTY = { played: 0, wins: 0, streak: 0, maxStreak: 0, dist: Array(MAX_TRIES).fill(0), lastWin: null }

// { daily, practice } for one word list.
export function loadStats(words) {
  const saved = read(`${words}:stats`) ?? {}
  return { daily: { ...EMPTY, ...saved.daily }, practice: { ...EMPTY, ...saved.practice } }
}

export function saveStats(words, stats) {
  write(`${words}:stats`, stats)
}

// A daily streak continues only if yesterday's word was also solved; a practice streak counts wins in a row.
export function addResult(stats, { won, tries, date }) {
  const next = { ...stats, dist: [...stats.dist], played: stats.played + 1 }
  if (won) {
    next.wins += 1
    next.dist[tries - 1] += 1
    next.streak = date && stats.lastWin !== previousDay(date) ? 1 : stats.streak + 1
    next.maxStreak = Math.max(next.maxStreak, next.streak)
    if (date) next.lastWin = date
  } else {
    next.streak = 0
  }
  return next
}

// A daily streak shown today is broken if the last win was before yesterday.
export function visibleStreak(stats, mode) {
  if (mode !== 'daily' || !stats.lastWin) return stats.streak
  const today = dateKey()
  return stats.lastWin === today || stats.lastWin === previousDay(today) ? stats.streak : 0
}
