// Pure functions: easy to test, and independent of React.
export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
}

// No l, q, w, x or y: they are easy to mix up or hard to say.
const CONSONANTS = 'bcdfghjkmnprstvz'
const VOWELS = 'aeiou'

// A cryptographically secure random whole number from 0 to max - 1 (without modulo bias).
function randomInt(max) {
  const buffer = new Uint32Array(1)
  const limit = Math.floor(2 ** 32 / max) * max
  let value
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)
  return value % max
}

export function generatePassword(length, options) {
  const sets = Object.keys(CHARSETS)
    .filter((key) => options[key])
    .map((key) => CHARSETS[key])
  if (!sets.length) return ''

  const pool = sets.join('')
  // At least one character from every chosen set…
  const chars = sets.map((set) => set[randomInt(set.length)])
  // …and the rest from the whole pool.
  while (chars.length < length) chars.push(pool[randomInt(pool.length)])

  // Fisher–Yates shuffle, so the guaranteed characters are not always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

// Consonant, vowel, consonant, vowel…: like "ka-mo-ri-tu".
export function generatePronounceable(length) {
  let password = ''
  for (let i = 0; i < length; i++) {
    const letters = i % 2 === 0 ? CONSONANTS : VOWELS
    password += letters[randomInt(letters.length)]
  }
  return password
}

// Entropy in bits: length × log2(pool size).
export function entropy(length, options) {
  const poolSize = Object.keys(CHARSETS)
    .filter((key) => options[key])
    .reduce((sum, key) => sum + CHARSETS[key].length, 0)
  return poolSize ? Math.round(length * Math.log2(poolSize)) : 0
}

// Each consonant (1 of 16) is worth 4 bits, each vowel (1 of 5) about 2.3 bits.
export function pronounceableEntropy(length) {
  const consonants = Math.ceil(length / 2)
  const vowels = Math.floor(length / 2)
  return Math.round(consonants * Math.log2(CONSONANTS.length) + vowels * Math.log2(VOWELS.length))
}

// Turns bits into a level: 0 = weak … 3 = very strong.
export function strengthLevel(bits) {
  if (bits < 45) return 0
  if (bits < 65) return 1
  if (bits < 90) return 2
  return 3
}
