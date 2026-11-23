// The wizard is driven by data: every step names its fields and has a validator.
// Validators return error *codes* instead of sentences, so the messages can be
// translated (and switch language live) in the UI layer.

export const STEPS = ['account', 'profile', 'preferences', 'review']

export const INITIAL_VALUES = {
  email: '',
  password: '',
  confirm: '',
  fullName: '',
  username: '',
  role: '',
  bio: '',
  topics: [],
  frequency: 'weekly',
  reminders: true,
  agree: false,
}

// Fields in visual order, used to focus the first invalid one.
export const STEP_FIELDS = {
  account: ['email', 'password', 'confirm'],
  profile: ['fullName', 'username', 'role', 'bio'],
  preferences: ['topics', 'frequency', 'reminders'],
  review: ['agree'],
}

// Passwords never go into localStorage.
export const SECRET_FIELDS = ['password', 'confirm']

export const ROLES = ['student', 'developer', 'designer', 'other']
export const TOPICS = ['react', 'css', 'a11y', 'testing', 'design']
export const FREQUENCIES = ['daily', 'weekly', 'monthly']
export const BIO_MAX = 160

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME = /^[a-z0-9_]{3,20}$/i

const validators = {
  account(v) {
    const e = {}
    if (!v.email.trim()) e.email = 'required'
    else if (!EMAIL.test(v.email.trim())) e.email = 'email'

    if (!v.password) e.password = 'required'
    else if (v.password.length < 8) e.password = 'passwordShort'
    else if (!/[a-z]/i.test(v.password) || !/\d/.test(v.password)) e.password = 'passwordMix'

    if (!v.confirm) e.confirm = 'required'
    else if (v.confirm !== v.password) e.confirm = 'mismatch'
    return e
  },
  profile(v) {
    const e = {}
    if (v.fullName.trim().length < 2) e.fullName = v.fullName.trim() ? 'nameShort' : 'required'
    if (!v.username.trim()) e.username = 'required'
    else if (!USERNAME.test(v.username.trim())) e.username = 'username'
    if (!v.role) e.role = 'role'
    if (v.bio.length > BIO_MAX) e.bio = 'bioLong'
    return e
  },
  preferences(v) {
    return v.topics.length === 0 ? { topics: 'topics' } : {}
  },
  review(v) {
    return v.agree ? {} : { agree: 'agree' }
  },
}

export function validateStep(step, values) {
  return validators[step](values)
}

export const isStepValid = (step, values) => Object.keys(validateStep(step, values)).length === 0

// The first step (before `upTo`) that still has errors, or `upTo` itself when all are fine.
export function firstInvalidStep(values, upTo = STEPS.length - 1) {
  for (let i = 0; i < upTo; i++) {
    if (!isStepValid(STEPS[i], values)) return i
  }
  return upTo
}

export function withoutSecrets(values) {
  const copy = { ...values }
  SECRET_FIELDS.forEach((field) => delete copy[field])
  return copy
}
