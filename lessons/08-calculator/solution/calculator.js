// The calculator as a small state machine, without eval().
// press(state, action) is a pure function: it returns the next state and never changes the old one.

export const OPERATORS = ['+', '−', '×', '÷']
const MAX_DIGITS = 15

export const INITIAL = {
  display: '0', // the number on screen, as a string (so "0." and "2.50" survive typing)
  exact: null, // the full-precision value behind a rounded result on screen
  stored: null, // the left operand
  operator: null,
  overwrite: true, // the next digit starts a new number
  waiting: false, // an operator was pressed, but no second number yet
  expression: '', // the small line above the result
  error: null, // 'divZero' | 'overflow'
  history: [],
}

// 12 significant digits hide floating-point noise: 0.1 + 0.2 shows 0.3.
export function toText(n) {
  const abs = Math.abs(n)
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-6)) {
    return n.toExponential(8).replace(/\.?0+e/, 'e')
  }
  return String(Number.parseFloat(n.toPrecision(12)))
}

function compute(a, operator, b) {
  switch (operator) {
    case '+':
      return a + b
    case '−':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? null : a / b
    default:
      return b
  }
}

const digitCount = (s) => s.replace(/[^0-9]/g, '').length
const valueOf = (state) => state.exact ?? Number(state.display)

function fail(state, error, expression) {
  return { ...INITIAL, history: state.history, display: '0', error, expression }
}

// A new entry at the front of the history: a new array, the old one stays as it was.
// The newest entry has the biggest id, so the next one is always a new number.
function addEntry(history, expression, result) {
  const id = (history[0]?.id ?? 0) + 1
  return [{ id, expression, result }, ...history].slice(0, 20)
}

export function press(state, action) {
  // After an error only digits, C and history recall do something.
  if (state.error && !['digit', 'decimal', 'clear', 'recall'].includes(action.type)) return state
  const base = state.error ? { ...INITIAL, history: state.history } : state

  switch (action.type) {
    case 'digit': {
      if (base.overwrite) {
        return {
          ...base,
          display: action.value,
          exact: null,
          overwrite: false,
          waiting: false,
          expression: base.operator ? base.expression : '',
        }
      }
      if (digitCount(base.display) >= MAX_DIGITS) return base
      return { ...base, exact: null, display: base.display === '0' ? action.value : base.display + action.value }
    }

    case 'decimal': {
      if (base.overwrite) {
        return {
          ...base,
          display: '0.',
          exact: null,
          overwrite: false,
          waiting: false,
          expression: base.operator ? base.expression : '',
        }
      }
      return base.display.includes('.') ? base : { ...base, exact: null, display: `${base.display}.` }
    }

    case 'operator': {
      const current = valueOf(base)
      let stored = base.stored
      let history = base.history

      if (base.operator && !base.waiting) {
        // A chain like 2 + 3 × … : finish the previous step first (left to right),
        // and put that step on the history too.
        const result = compute(base.stored, base.operator, current)
        const expression = `${toText(base.stored)} ${base.operator} ${toText(current)}`
        if (result === null) return fail(base, 'divZero', expression)
        if (!Number.isFinite(result)) return fail(base, 'overflow', expression)
        stored = result
        history = addEntry(history, expression, toText(result))
      } else if (!base.operator) {
        stored = current
      }

      return {
        ...base,
        stored,
        display: toText(stored),
        exact: stored,
        operator: action.value,
        overwrite: true,
        waiting: true,
        expression: `${toText(stored)} ${action.value}`,
        history,
      }
    }

    case 'equals': {
      if (!base.operator) return base
      const b = valueOf(base)
      const result = compute(base.stored, base.operator, b)
      const expression = `${toText(base.stored)} ${base.operator} ${toText(b)}`
      if (result === null) return fail(base, 'divZero', expression)
      if (!Number.isFinite(result)) return fail(base, 'overflow', expression)
      const text = toText(result)
      return {
        ...base,
        display: text,
        exact: result,
        stored: null,
        operator: null,
        overwrite: true,
        waiting: false,
        expression: `${expression} =`,
        history: addEntry(base.history, expression, text),
      }
    }

    case 'percent': {
      const value = valueOf(base)
      // 50 + 10 % means "50 plus 10 percent of 50" (= 55), like on most pocket calculators.
      const percent =
        base.operator && base.stored !== null && ['+', '−'].includes(base.operator) ? (base.stored * value) / 100 : value / 100
      return { ...base, display: toText(percent), exact: percent, overwrite: true, waiting: false }
    }

    case 'negate': {
      if (base.display === '0' || base.display === '0.') return base
      const display = base.display.startsWith('-') ? base.display.slice(1) : `-${base.display}`
      return { ...base, display, exact: base.exact === null ? null : -base.exact, waiting: false }
    }

    case 'backspace': {
      if (base.overwrite) return base
      const display = base.display.slice(0, -1)
      return { ...base, exact: null, display: display === '' || display === '-' ? '0' : display }
    }

    case 'clear':
      return { ...INITIAL, history: base.history }

    case 'recall':
      return { ...base, display: action.value, exact: null, overwrite: true, waiting: false }

    case 'clearHistory':
      return { ...base, history: [] }

    default:
      return base
  }
}

/** "1234.5" → "1,234.5" (en) or "1234,5" (hu), without losing a trailing "." while typing. */
export function formatNumber(text, locale) {
  if (/e/i.test(text)) return text.replace('.', locale.startsWith('hu') ? ',' : '.')
  const negative = text.startsWith('-')
  const [int, frac] = (negative ? text.slice(1) : text).split('.')
  const parts = new Intl.NumberFormat(locale).formatToParts(1000.5)
  const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.'
  const grouped = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(int))
  return `${negative ? '−' : ''}${grouped}${frac !== undefined ? decimal + frac : ''}`
}
