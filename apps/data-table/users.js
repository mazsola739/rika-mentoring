// 500 fake users from a seeded random generator: every visitor (and every reload) gets exactly the same data.

export const ROLES = ['admin', 'editor', 'viewer', 'billing']
export const STATUSES = ['active', 'invited', 'suspended']
export const COUNTRIES = ['HU', 'AT', 'DE', 'GB', 'IE', 'FR', 'IT', 'ES', 'PT', 'NL', 'SE', 'PL', 'CZ', 'RO', 'US', 'CA', 'BR', 'JP', 'IN', 'AU']

const FIRST = [
  'Anna', 'Bence', 'Zsófia', 'Máté', 'Réka', 'Dávid', 'Eszter', 'Levente', 'Noémi', 'Ádám',
  'Lili', 'Gergő', 'Emma', 'Lukas', 'Sofia', 'Liam', 'Mia', 'Noah', 'Chloé', 'Mateo',
  'Yuki', 'Aarav', 'Freya', 'Olivia', 'Jonas', 'Elena', 'Marco', 'Sara', 'Tomás', 'Hana',
  'Oskar', 'Inês', 'Leo', 'Maya', 'Viktor', 'Nóra', 'Ben', 'Iris', 'Dominik', 'Petra',
]

const LAST = [
  'Kovács', 'Nagy', 'Tóth', 'Szabó', 'Horváth', 'Varga', 'Kiss', 'Molnár', 'Németh', 'Farkas',
  'Balogh', 'Papp', 'Müller', 'Schmidt', 'Rossi', 'García', 'Silva', 'Martin', 'Dubois', 'Novák',
  'Kowalski', 'Jensen', 'Smith', 'Brown', 'Tanaka', 'Sato', 'Patel', 'Murphy', 'Fischer', 'Weber',
  'Costa', 'Lindqvist', 'Bakker', 'Popescu', 'Dvořák',
]

// example.com/.org/.net are reserved for documentation, so these addresses never reach a real person.
const DOMAINS = ['example.com', 'example.org', 'example.net']

// mulberry32: a tiny, fast pseudo-random generator. Same seed → same sequence.
function mulberry32(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// "Dvořák" → "dvorak": strip the accents for the e-mail address.
const asciiLower = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function generateUsers(count = 500, seed = 43) {
  const random = mulberry32(seed)
  const pick = (list) => list[Math.floor(random() * list.length)]
  const weighted = (entries) => {
    let r = random()
    for (const [value, weight] of entries) {
      r -= weight
      if (r < 0) return value
    }
    return entries[0][0]
  }

  const from = Date.UTC(2019, 0, 1)
  const to = Date.UTC(2026, 9, 31)
  const taken = new Map()

  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST)
    const last = pick(LAST)
    const local = `${asciiLower(first)}.${asciiLower(last)}`
    const n = (taken.get(local) ?? 0) + 1
    taken.set(local, n)

    return {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${local}${n > 1 ? n : ''}@${pick(DOMAINS)}`,
      role: weighted([
        ['viewer', 0.5],
        ['editor', 0.28],
        ['billing', 0.12],
        ['admin', 0.1],
      ]),
      country: pick(COUNTRIES),
      status: weighted([
        ['active', 0.72],
        ['invited', 0.16],
        ['suspended', 0.12],
      ]),
      joined: new Date(from + random() * (to - from)).toISOString().slice(0, 10),
    }
  })
}

export const BASE_USERS = generateUsers()
