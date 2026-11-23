import { createSampleWallet } from './sampleData.js'
import { lastMonths, monthKeyOf } from './money.js'

export const STORAGE_KEY = 'rika:piggy-bank:wallet'

// Lazy initializer for useReducer: runs once, reads the saved wallet or builds the sample one.
export function loadWallet() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && Array.isArray(saved.transactions)) return { goal: null, ...saved }
  } catch {
    // broken JSON or blocked storage: start with the sample wallet
  }
  return createSampleWallet()
}

// The reducer is a pure function: same state + same action → same new state.
// That is why ids and dates are created *before* dispatching, not in here.
export function walletReducer(state, action) {
  switch (action.type) {
    case 'added':
      return { ...state, transactions: [...state.transactions, action.transaction] }
    case 'removed':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) }
    case 'goalSet':
      return { ...state, goal: action.goal }
    case 'goalCleared':
      return { ...state, goal: null }
    case 'cleared':
      return { ...state, transactions: [] }
    case 'sampleLoaded':
      return createSampleWallet()
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

// ── Derived data (selectors) ────────────────────────────────
export const signedAmount = (t) => (t.type === 'deposit' ? t.amount : -t.amount)

export const balanceOf = (transactions) => transactions.reduce((sum, t) => sum + signedAmount(t), 0)

export const totalsOf = (transactions) =>
  transactions.reduce(
    (acc, t) => {
      acc[t.type === 'deposit' ? 'income' : 'expense'] += t.amount
      return acc
    },
    { income: 0, expense: 0 },
  )

// Income and expense per month for the last `count` months, oldest first.
export function monthlySeries(transactions, count = 6, today = new Date()) {
  const months = lastMonths(count, today)
  const byMonth = Object.fromEntries(months.map((key) => [key, { key, income: 0, expense: 0 }]))
  for (const t of transactions) {
    const bucket = byMonth[monthKeyOf(t.date)]
    if (bucket) bucket[t.type === 'deposit' ? 'income' : 'expense'] += t.amount
  }
  return months.map((key) => byMonth[key])
}

// Newest first; same day → the one added later comes first.
export const byNewest = (a, b) => b.date.localeCompare(a.date) || (b.createdAt ?? 0) - (a.createdAt ?? 0)
