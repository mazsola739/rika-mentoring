// Tests for the keypad logic. Run them with: node --test apps/calculator/*.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { INITIAL, press } from './calculator.js'

// The label of a key → the action that key sends.
function actionFor(label) {
  if ('0123456789'.includes(label)) return { type: 'digit', value: label }
  if ('+−×÷'.includes(label)) return { type: 'operator', value: label }
  if (label === '.') return { type: 'decimal' }
  if (label === '%') return { type: 'percent' }
  if (label === '=') return { type: 'equals' }
  if (label === 'C') return { type: 'clear' }
  if (label === '⌫') return { type: 'backspace' }
  throw new Error(`No key for ${label}`)
}

// Presses the keys one after the other and returns the final state: pressAll('12+3=').
function pressAll(keys, state = INITIAL) {
  let current = state
  for (const label of keys) current = press(current, actionFor(label))
  return current
}

test('adds', () => {
  assert.equal(pressAll('12+3=').display, '15')
})

test('works from left to right, like a pocket calculator, and keeps every step', () => {
  const state = pressAll('2+3×4=')
  assert.equal(state.display, '20')
  assert.deepEqual(
    state.history.map((entry) => `${entry.expression} = ${entry.result}`),
    ['5 × 4 = 20', '2 + 3 = 5'],
  )
})

test('0.1 + 0.2 is exactly 0.3', () => {
  assert.equal(pressAll('0.1+0.2=').display, '0.3')
})

test('50 + 10 % adds ten percent of 50, and an operator after % keeps the pending step', () => {
  assert.equal(pressAll('50+10%=').display, '55')
  assert.equal(pressAll('50+10%×2=').display, '110')
})

test('dividing by zero is an error, and after C the screen shows 0 again', () => {
  const state = pressAll('7÷0=')
  assert.equal(state.error, 'divZero')
  assert.equal(pressAll('C', state).display, '0')
})

test('Backspace deletes the last digit, but not a result', () => {
  assert.equal(pressAll('123⌫').display, '12')
  assert.equal(pressAll('5⌫').display, '0')
  assert.equal(pressAll('2+3=⌫').display, '5')
})

test('an earlier result can be the second number of a waiting operation', () => {
  const state = pressAll('12+3=')
  const recalled = press(pressAll('10+', state), { type: 'recall', value: state.history[0].result })
  assert.equal(pressAll('+1=', recalled).display, '26')
})
