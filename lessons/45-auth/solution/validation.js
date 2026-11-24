// Pure validation helpers: no React here, so they are easy to reuse and test.

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

// Rules shown as a live checklist under the password field. `required: false` is a bonus.
export const PASSWORD_RULES = [
  { key: 'length', required: true, test: (p) => p.length >= 8 },
  { key: 'case', required: true, test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { key: 'digit', required: true, test: (p) => /\d/.test(p) },
  { key: 'symbol', required: false, test: (p) => /[^A-Za-z0-9]/.test(p) },
]

const COMMON = ['password', 'password1', '12345678', '123456789', 'qwerty123', 'iloveyou', 'admin123', 'letmein1']

export const meetsRequiredRules = (password) => PASSWORD_RULES.every((rule) => !rule.required || rule.test(password))

// A simple 0–4 score: length and variety of characters. (Real apps often use a library like zxcvbn.)
export function passwordStrength(password) {
  if (!password) return 0
  if (COMMON.includes(password.toLowerCase())) return 1
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (variety >= 3) score++
  if (variety === 4) score++
  return Math.max(1, Math.min(4, score))
}
