// The formula parser behind the formula field. It works in two steps, without eval():
// tokenize() splits the text into tokens, then evaluate() works out the result with recursive descent.
// One function per level of strength, weakest first: + −, then × ÷, then ^, then a single factor.
// Errors carry a code (and sometimes the symbol), so the app can show them in either language.

const DIGITS = '0123456789.'
const SYMBOLS = '+-*/()^'
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

// Symbols people type or paste that mean the same as ours.
const SAME_AS = { '×': '*', '·': '*', '÷': '/', ':': '/', '−': '-', ',': '.', π: 'pi' }

// Trigonometry in degrees, like on a calculator. toFixed(12) rounds away the floating-point noise:
// cos(90) is 6.1e-17 in JavaScript, and 12 significant digits would keep it; 12 decimals make it 0.
function sinDegrees(x) {
  return Number(Math.sin((x * Math.PI) / 180).toFixed(12))
}

function cosDegrees(x) {
  return Number(Math.cos((x * Math.PI) / 180).toFixed(12))
}

// A Map knows only the names we put into it (a plain object would also "know" constructor and co.).
const FUNCTIONS = new Map([
  ['sqrt', (x) => Math.sqrt(x)],
  ['sin', sinDegrees],
  ['cos', cosDegrees],
  ['tan', (x) => sinDegrees(x) / cosDegrees(x)], // tan(90) divides by 0: Infinity, an error below
  ['log', (x) => Math.log10(x)],
])

function formulaError(code, detail) {
  return Object.assign(new Error(code), { code, detail })
}

// 12 significant digits, like the keypad: 0.1 + 0.2 gives 0.3.
function roundResult(value) {
  return Number(value.toPrecision(12))
}

// '12+3*(4-1)' → ['12', '+', '3', '*', '(', '4', '-', '1', ')']
export function tokenize(text) {
  const tokens = []
  let i = 0
  while (i < text.length) {
    const char = SAME_AS[text[i]] ?? text[i].toLowerCase()
    if (char.trim() === '') {
      i++
    } else if (DIGITS.includes(char)) {
      let number = ''
      while (i < text.length && DIGITS.includes(SAME_AS[text[i]] ?? text[i])) {
        number += SAME_AS[text[i]] ?? text[i]
        i++
      }
      tokens.push(number)
    } else if (char === 'pi') {
      tokens.push('pi')
      i++
    } else if (LETTERS.includes(char)) {
      let name = ''
      while (i < text.length && LETTERS.includes(text[i].toLowerCase())) {
        name += text[i].toLowerCase()
        i++
      }
      tokens.push(name)
    } else if (SYMBOLS.includes(char)) {
      tokens.push(char)
      i++
    } else {
      throw formulaError('unknown', text[i])
    }
  }
  return tokens
}

// Works out the formula, respecting operator precedence and parentheses.
export function evaluate(text) {
  const tokens = tokenize(text)
  let position = 0

  // The inner functions share tokens and position (a closure), so they all read from the same place.
  function peek() {
    return tokens[position]
  }

  function next() {
    const token = tokens[position]
    position++
    return token
  }

  function expect(symbol) {
    if (next() !== symbol) throw formulaError('missing', symbol)
  }

  // Expression: terms added or subtracted. The weakest level, so it holds the others together.
  function parseExpression() {
    let value = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const operator = next()
      const right = parseTerm()
      value = operator === '+' ? value + right : value - right
    }
    return value
  }

  // Term: powers multiplied or divided. Stronger, so it is worked out before + and −.
  function parseTerm() {
    let value = parsePower()
    while (peek() === '*' || peek() === '/') {
      const operator = next()
      const right = parsePower()
      if (operator === '/' && right === 0) throw formulaError('divZero')
      value = operator === '*' ? value * right : value / right
    }
    return value
  }

  // Power: the strongest operation, from right to left: 2^3^2 is 2^(3^2) = 512.
  function parsePower() {
    const base = parseFactor()
    if (peek() === '^') {
      next()
      return base ** parsePower()
    }
    return base
  }

  // Factor: a number, pi, a function call, a part in parentheses, or a minus sign.
  function parseFactor() {
    const token = next()
    if (token === undefined) throw formulaError('incomplete')
    if (token === '-') return -parseFactor()
    if (token === '+') return parseFactor()
    if (token === '(') {
      const value = parseExpression()
      expect(')')
      return value
    }
    if (token === 'pi') return Math.PI
    if (FUNCTIONS.has(token)) {
      expect('(')
      const value = parseExpression()
      expect(')')
      return FUNCTIONS.get(token)(value)
    }
    if (LETTERS.includes(token[0])) throw formulaError('unknownName', token)
    const value = Number(token)
    if (Number.isNaN(value)) throw formulaError('unexpected', token)
    return value
  }

  const result = parseExpression()
  // A token left over could not be placed, like the end of "2 3" or "(1+2))".
  if (position < tokens.length) throw formulaError('unexpected', peek())
  // sqrt(-1) is NaN, 10^400 is Infinity: no result we could show.
  if (!Number.isFinite(result)) throw formulaError('cannot')
  return roundResult(result)
}
