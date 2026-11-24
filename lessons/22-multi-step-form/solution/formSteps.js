// The wizard is driven by data. Every step names its fields; one schema holds the rules of
// every field, the way Zod describes data and React Hook Form checks it. A step with `showIf`
// is a conditional step: it is part of the form only when `showIf` returns true for the answers.
// Rules return error *codes* instead of sentences, so the messages can be translated (and
// switch language live) in the UI layer.

export const STEPS = [
  { key: 'account', fields: ['email', 'password', 'confirm'] },
  { key: 'profile', fields: ['fullName', 'username', 'role', 'bio'] },
  { key: 'preferences', fields: ['topics', 'frequency', 'reminders', 'wantsMentor'] },
  { key: 'mentor', fields: ['goal', 'hours'], showIf: (values) => values.wantsMentor },
  { key: 'review', fields: ['agree'] },
]

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
  wantsMentor: false,
  goal: '',
  hours: '',
  agree: false,
}

// Passwords never go into localStorage.
export const SECRET_FIELDS = ['password', 'confirm']

export const ROLES = ['student', 'developer', 'designer', 'other']
export const TOPICS = ['react', 'css', 'a11y', 'testing', 'design']
export const FREQUENCIES = ['daily', 'weekly', 'monthly']
export const HOURS = ['1-2', '3-5', '6+']
export const BIO_MAX = 160
export const GOAL_MIN = 10

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME = /^[a-z0-9_]{3,20}$/i

// The schema: a list of rules for every field. A rule is a test and an error code; the first
// rule whose test fails gives the field its error. The second parameter is the whole form,
// so a rule can compare two fields.
const SCHEMA = {
  email: [
    { test: (v) => v.trim() !== '', code: 'required' },
    { test: (v) => EMAIL.test(v.trim()), code: 'email' },
  ],
  password: [
    { test: (v) => v !== '', code: 'required' },
    { test: (v) => v.length >= 8, code: 'passwordShort' },
    { test: (v) => /[a-z]/i.test(v) && /\d/.test(v), code: 'passwordMix' },
  ],
  confirm: [
    { test: (v) => v !== '', code: 'required' },
    { test: (v, values) => v === values.password, code: 'mismatch' },
  ],
  fullName: [
    { test: (v) => v.trim() !== '', code: 'required' },
    { test: (v) => v.trim().length >= 2, code: 'nameShort' },
  ],
  username: [
    { test: (v) => v.trim() !== '', code: 'required' },
    { test: (v) => USERNAME.test(v.trim()), code: 'username' },
  ],
  role: [{ test: (v) => v !== '', code: 'choose' }],
  bio: [{ test: (v) => v.length <= BIO_MAX, code: 'bioLong' }],
  topics: [{ test: (v) => v.length > 0, code: 'topics' }],
  goal: [
    { test: (v) => v.trim() !== '', code: 'required' },
    { test: (v) => v.trim().length >= GOAL_MIN, code: 'goalShort' },
  ],
  hours: [{ test: (v) => v !== '', code: 'choose' }],
  agree: [{ test: (v) => v === true, code: 'agree' }],
}

// The steps this user goes through with these answers.
export function visibleSteps(values) {
  return STEPS.filter((step) => !step.showIf || step.showIf(values))
}

// The errors of some fields, as { field: code of its first broken rule }.
export function validateFields(fields, values) {
  const errors = {}
  for (const name of fields) {
    const broken = (SCHEMA[name] ?? []).find((rule) => !rule.test(values[name], values))
    if (broken) errors[name] = broken.code
  }
  return errors
}

export function validateStep(step, values) {
  return validateFields(step.fields, values)
}

export function isStepValid(step, values) {
  return Object.keys(validateStep(step, values)).length === 0
}

// The index of the first step (before `upTo`) that still has errors, or `upTo` itself when all are fine.
export function firstInvalidStep(steps, values, upTo = steps.length - 1) {
  for (let i = 0; i < upTo; i++) {
    if (!isStepValid(steps[i], values)) return i
  }
  return upTo
}

export function withoutSecrets(values) {
  const copy = { ...values }
  SECRET_FIELDS.forEach((field) => delete copy[field])
  return copy
}
