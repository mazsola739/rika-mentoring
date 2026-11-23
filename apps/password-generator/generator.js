// Tiszta függvények: könnyű őket tesztelni, és nem függnek a Reacttől.
export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
}

// Kriptográfiailag biztonságos véletlen egész 0 és max-1 között (torzítás nélkül).
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
  // Minden kiválasztott készletből legalább egy karakter kerüljön bele…
  const chars = sets.map((set) => set[randomInt(set.length)])
  // …a többi a teljes készletből.
  while (chars.length < length) chars.push(pool[randomInt(pool.length)])

  // Fisher–Yates keverés, hogy a „kötelező” karakterek ne az elején legyenek.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

// Entrópia bitben: hossz × log2(készletméret). Ebből becsüljük az erősséget (0–3).
export function strength(length, options) {
  const poolSize = Object.keys(CHARSETS)
    .filter((key) => options[key])
    .reduce((sum, key) => sum + CHARSETS[key].length, 0)
  const bits = poolSize ? Math.round(length * Math.log2(poolSize)) : 0
  const level = bits < 45 ? 0 : bits < 65 ? 1 : bits < 90 ? 2 : 3
  return { bits, level }
}
