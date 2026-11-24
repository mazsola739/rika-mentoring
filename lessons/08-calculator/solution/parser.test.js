// Tests for the formula parser. Run them with: node --test apps/calculator/*.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { evaluate, tokenize } from './parser.js'

// Checks that the formula fails with this error code.
function failsWith(text, code) {
  assert.throws(() => evaluate(text), (error) => error.code === code)
}

test('splits the formula into numbers, symbols and parentheses', () => {
  assert.deepEqual(tokenize('12+3*(4-1)'), ['12', '+', '3', '*', '(', '4', '-', '1', ')'])
})

test('skips spaces and keeps a decimal number in one piece', () => {
  assert.deepEqual(tokenize(' 2.5 * 40 '), ['2.5', '*', '40'])
})

test('throws an error on an unknown character', () => {
  assert.throws(() => tokenize('2 # 3'), (error) => error.code === 'unknown' && error.detail === '#')
})

test('multiplication and division come before addition and subtraction', () => {
  assert.equal(evaluate('2+3*4'), 14)
  assert.equal(evaluate('10-6/2'), 7)
})

test('parentheses override the order', () => {
  assert.equal(evaluate('(2+3)*4'), 20)
  assert.equal(evaluate('2*(3+(4-1))'), 12)
})

test('operations of the same strength go from left to right', () => {
  assert.equal(evaluate('10-4-3'), 3)
  assert.equal(evaluate('16/4/2'), 2)
})

test('understands negative numbers, and rounds', () => {
  assert.equal(evaluate('-2*-3'), 6)
  assert.equal(evaluate('0.1+0.2'), 0.3)
})

test('throws an error on a broken formula', () => {
  failsWith('2+', 'incomplete')
  failsWith('(1+2', 'missing')
  failsWith('2 3', 'unexpected')
  failsWith('1/0', 'divZero')
})

test('raises to powers, from right to left', () => {
  assert.equal(evaluate('2^10'), 1024)
  assert.equal(evaluate('2^3^2'), 512)
  assert.equal(evaluate('2*3^2'), 18)
})

test('knows the functions and pi', () => {
  assert.equal(evaluate('sqrt(16)+1'), 5)
  assert.equal(evaluate('sin(30)'), 0.5)
  assert.equal(evaluate('cos(90)'), 0)
  assert.equal(evaluate('2*pi'), 6.28318530718)
  assert.equal(evaluate('tan(45)'), 1)
  assert.equal(evaluate('log(1000)'), 3)
})

test('throws an error on an unknown name and on a meaningless result', () => {
  failsWith('foo(2)', 'unknownName')
  failsWith('sqrt(-1)', 'cannot')
  failsWith('tan(90)', 'cannot')
  failsWith('10^400', 'cannot')
})

test('accepts the symbols of the keypad and a decimal comma', () => {
  assert.equal(evaluate('6 × 7'), 42)
  assert.equal(evaluate('9 ÷ 3 − 1'), 2)
  assert.equal(evaluate('2,5 * 2'), 5)
  assert.equal(evaluate('2*π'), 6.28318530718)
})
