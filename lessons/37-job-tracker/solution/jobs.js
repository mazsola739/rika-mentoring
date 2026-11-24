// Data helpers for the job tracker: statuses, dates, sample data and filtering.

export const STATUSES = ['applied', 'interview', 'offer', 'rejected']

// Which lesson palette color marks each column (index into palette.colors).
export const STATUS_COLOR = { applied: 1, interview: 5, offer: 4, rejected: 2 }

export const localeOf = (lang) => (lang === 'hu' ? 'hu-HU' : 'en-GB')

// Sample notes are bilingual objects until the user edits them; then they become plain strings.
export const localize = (value, lang) => (value && typeof value === 'object' ? (value[lang] ?? value.en ?? '') : (value ?? ''))

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// Dates are stored as local "YYYY-MM-DD" strings, exactly what <input type="date"> uses.
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const isISODate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

export function shiftDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

// Whole days between today and the given date (negative = in the past).
export function daysFromToday(iso) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((parseISODate(iso) - today) / 86_400_000)
}

export function formatDate(iso, lang) {
  const date = parseISODate(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return new Intl.DateTimeFormat(localeOf(lang), {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date)
}

// "tomorrow", "in 3 days", "holnap", "3 nap múlva" – the browser knows the grammar.
export function relativeDays(days, lang) {
  return new Intl.RelativeTimeFormat(localeOf(lang), { numeric: 'auto' }).format(days, 'day')
}

// Interviews only matter while the application is still open.
export function interviewDays(job) {
  if (!job.interview || !isISODate(job.interview)) return null
  if (job.status !== 'applied' && job.status !== 'interview') return null
  return daysFromToday(job.interview)
}

export function isJobList(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (job) =>
        job &&
        typeof job.id === 'string' &&
        typeof job.company === 'string' &&
        typeof job.role === 'string' &&
        isISODate(job.applied) &&
        STATUSES.includes(job.status),
    )
  )
}

// Sample data is built relative to today, so the "interview in N days" badges always make sense.
export function sampleJobs() {
  const job = (company, role, appliedDaysAgo, status, extra = {}) => ({
    id: createId(),
    company,
    role,
    applied: shiftDays(-appliedDaysAgo),
    status,
    salary: '',
    interview: '',
    notes: '',
    ...extra,
  })

  return [
    job('Northwind Labs', 'Frontend Developer', 16, 'interview', {
      salary: '€58k / year',
      interview: shiftDays(2),
      notes: {
        en: 'Second round with the team lead. Prepare a short React demo.',
        hu: 'Második kör a csapatvezetővel. Készíts egy rövid React-demót.',
      },
    }),
    job('Lumen Studio', 'UI Engineer', 4, 'applied', {
      notes: { en: 'Referred by a former colleague.', hu: 'Egy volt kolléga ajánlott.' },
    }),
    job('Aurora Health', 'React Developer', 27, 'offer', {
      salary: '€62k / year',
      notes: { en: 'The offer is valid for one more week.', hu: 'Az ajánlat még egy hétig érvényes.' },
    }),
    job('Bluefin Maps', 'Frontend Engineer', 9, 'interview', {
      salary: '1.1M HUF / month',
      interview: shiftDays(6),
      notes: { en: 'Technical interview: maps and performance.', hu: 'Szakmai interjú: térképek és teljesítmény.' },
    }),
    job('Cobalt Bank', 'Web Developer', 2, 'applied'),
    job('Orbit Games', 'TypeScript Developer', 21, 'rejected', {
      notes: {
        en: 'They chose a candidate with more backend experience.',
        hu: 'Több backendes tapasztalattal rendelkező jelöltet választottak.',
      },
    }),
    job('Meadow Analytics', 'Junior Frontend Developer', 35, 'applied'),
  ]
}

export const NO_FILTERS = { query: '', period: 'any', upcoming: false }

export function matchesFilters(job, filters, lang) {
  const query = filters.query.trim().toLocaleLowerCase()
  if (query) {
    const text = [job.company, job.role, localize(job.notes, lang)].join(' ').toLocaleLowerCase()
    if (!text.includes(query)) return false
  }
  if (filters.period !== 'any' && daysFromToday(job.applied) < -Number(filters.period)) return false
  if (filters.upcoming) {
    const days = interviewDays(job)
    if (days === null || days < 0) return false
  }
  return true
}

export const byAppliedDesc = (a, b) => b.applied.localeCompare(a.applied)
