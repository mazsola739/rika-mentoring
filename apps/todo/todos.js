// Seed text is bilingual ({ en, hu }); tasks the user types are plain strings.
export const label = (value, lang) => (typeof value === 'string' ? value : value[lang])

export const PRIORITY_LEVEL = { low: 1, normal: 2, high: 3 }

// "YYYY-MM-DD" in local time (what <input type="date"> uses).
export function isoDate(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const addDays = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return isoDate(d)
}

/** Due date as display info: state (overdue / today / tomorrow / later) and a formatted date. */
export function dueInfo(due, lang) {
  if (!due) return null
  const [y, m, d] = due.split('-').map(Number)
  const date = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { month: 'short', day: 'numeric' }).format(
    new Date(y, m - 1, d),
  )
  const today = isoDate(new Date())
  const state = due < today ? 'overdue' : due === today ? 'today' : due === addDays(1) ? 'tomorrow' : 'later'
  return { state, date }
}

export function seedTodos() {
  const now = Date.now()
  const todo = (i, text, extra) => ({
    id: `seed-${i}`,
    text,
    done: false,
    priority: 'normal',
    due: '',
    createdAt: now - i * 60_000,
    ...extra,
  })
  return [
    todo(1, { en: 'Build the to-do app', hu: 'Építsd meg a teendőlista appot' }, { priority: 'high', due: addDays(1) }),
    todo(2, { en: 'Add filters: all, active, done', hu: 'Szűrők: összes, aktív, kész' }),
    todo(3, { en: 'Save tasks with a useLocalStorage hook', hu: 'Mentés egy useLocalStorage hookkal' }, { priority: 'low' }),
    todo(4, { en: 'Read about lists and keys in React', hu: 'Olvass a listákról és a key-ről Reactben' }, { done: true }),
  ]
}

const byNewest = (a, b) => b.createdAt - a.createdAt

export const SORTS = {
  newest: byNewest,
  due: (a, b) => (a.due || '9999').localeCompare(b.due || '9999') || byNewest(a, b),
  priority: (a, b) => PRIORITY_LEVEL[b.priority] - PRIORITY_LEVEL[a.priority] || byNewest(a, b),
}

export const FILTERS = {
  all: () => true,
  active: (todo) => !todo.done,
  done: (todo) => todo.done,
}
