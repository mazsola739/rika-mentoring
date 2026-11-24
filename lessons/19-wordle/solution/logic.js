export const WORD_LENGTH = 5
export const MAX_TRIES = 6
const RANK = { absent: 1, present: 2, correct: 3 }

// Two passes, so repeated letters are handled like in the original game:
// first the exact hits, then "wrong spot" only while that letter is still left in the answer.
export function evaluate(guess, answer) {
  const result = Array(WORD_LENGTH).fill('absent')
  const left = {}
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) result[i] = 'correct'
    else left[answer[i]] = (left[answer[i]] ?? 0) + 1
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] !== 'correct' && left[guess[i]] > 0) {
      result[i] = 'present'
      left[guess[i]]--
    }
  }
  return result
}

// The best known state of every letter, for colouring the on-screen keyboard.
export function letterStates(guesses, answer) {
  const states = {}
  for (const guess of guesses) {
    evaluate(guess, answer).forEach((state, i) => {
      const letter = guess[i]
      if (!states[letter] || RANK[state] > RANK[states[letter]]) states[letter] = state
    })
  }
  return states
}

export function statusOf(guesses, answer) {
  if (guesses.at(-1) === answer) return 'won'
  return guesses.length >= MAX_TRIES ? 'lost' : 'playing'
}

// Local calendar date as YYYY-MM-DD (these strings also sort correctly).
export function dateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function previousDay(key) {
  const [y, m, d] = key.split('-').map(Number)
  return dateKey(new Date(y, m - 1, d - 1))
}

// The same date always gives the same word: 37 words on per day, as in the guide.
export function dailyAnswer(key, answers) {
  const [y, m, d] = key.split('-').map(Number)
  const day = Date.UTC(y, m - 1, d) / 86400000
  return answers[(day * 37) % answers.length]
}

export function randomAnswer(except, answers) {
  let word
  do word = answers[Math.floor(Math.random() * answers.length)]
  while (word === except && answers.length > 1)
  return word
}

const EMOJI = { correct: '🟩', present: '🟨', absent: '⬛' }

export function emojiGrid(guesses, answer) {
  return guesses.map((g) => evaluate(g, answer).map((s) => EMOJI[s]).join('')).join('\n')
}
