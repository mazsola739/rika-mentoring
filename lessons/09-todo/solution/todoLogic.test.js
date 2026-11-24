// Tests for the pure task-list functions, with Node's built-in test runner (nothing to install).
// Run from the project folder: node --test apps/todo/todoLogic.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  addTodo,
  clearDone,
  countTodos,
  deleteTodo,
  filterTodos,
  moveTodo,
  renameTodo,
  toggleTodo,
  updateTodo,
} from './todoLogic.js'

// A small sample list. Every test starts from it, and checks that it has not changed.
const SAMPLE = Object.freeze([
  Object.freeze({ id: 1, text: 'Milk', done: false, priority: 'normal', due: '' }),
  Object.freeze({ id: 2, text: 'Bread', done: true, priority: 'high', due: '2026-11-20' }),
  Object.freeze({ id: 3, text: 'Cheese', done: false, priority: 'low', due: '' }),
])

// Only the IDs, in order: easy to compare.
function ids(todos) {
  return todos.map((todo) => todo.id)
}

test('addTodo: the new task goes to the end, open, with the given values', () => {
  const result = addTodo(SAMPLE, { text: 'Apple', priority: 'high' })
  assert.equal(result.length, 4)
  assert.equal(result[3].text, 'Apple')
  assert.equal(result[3].priority, 'high')
  assert.equal(result[3].done, false)
  assert.equal(result[3].due, '')
  assert.equal(typeof result[3].id, 'string')
  assert.equal(SAMPLE.length, 3)
})

test('addTodo: two new tasks get different IDs', () => {
  const result = addTodo(addTodo(SAMPLE, { text: 'A' }), { text: 'B' })
  assert.notEqual(result[3].id, result[4].id)
})

test('toggleTodo: only the given task flips', () => {
  assert.deepEqual(
    toggleTodo(SAMPLE, 2).map((todo) => todo.done),
    [false, false, false],
  )
  assert.equal(SAMPLE[1].done, true)
})

test('renameTodo: only the given task gets the new text', () => {
  assert.deepEqual(
    renameTodo(SAMPLE, 3, 'Blue cheese').map((todo) => todo.text),
    ['Milk', 'Bread', 'Blue cheese'],
  )
})

test('updateTodo: changes only the given fields of the given task', () => {
  const result = updateTodo(SAMPLE, 1, { priority: 'high', due: '2026-12-01' })
  assert.deepEqual(result[0], { id: 1, text: 'Milk', done: false, priority: 'high', due: '2026-12-01' })
  assert.equal(result[1], SAMPLE[1]) // the other tasks are the very same objects
})

test('deleteTodo and clearDone: the right tasks are gone, the order stays', () => {
  assert.deepEqual(ids(deleteTodo(SAMPLE, 1)), [2, 3])
  assert.deepEqual(ids(deleteTodo(SAMPLE, 99)), [1, 2, 3])
  assert.deepEqual(ids(clearDone(SAMPLE)), [1, 3])
})

test('filterTodos: all, active and done; an unknown filter shows everything', () => {
  assert.deepEqual(ids(filterTodos(SAMPLE, 'all')), [1, 2, 3])
  assert.deepEqual(ids(filterTodos(SAMPLE, 'active')), [1, 3])
  assert.deepEqual(ids(filterTodos(SAMPLE, 'done')), [2])
  assert.deepEqual(ids(filterTodos(SAMPLE, 'something else')), [1, 2, 3])
})

test('countTodos: the numbers on the filter buttons', () => {
  assert.deepEqual(countTodos(SAMPLE), { all: 3, active: 2, done: 1 })
  assert.deepEqual(countTodos([]), { all: 0, active: 0, done: 0 })
})

test('moveTodo: the task takes the place of the target task', () => {
  assert.deepEqual(ids(moveTodo(SAMPLE, 1, 3)), [2, 3, 1])
  assert.deepEqual(ids(moveTodo(SAMPLE, 3, 1)), [3, 1, 2])
  assert.deepEqual(ids(moveTodo(SAMPLE, 2, 2)), [1, 2, 3])
  assert.equal(moveTodo(SAMPLE, 1, 99), SAMPLE) // unknown target: nothing moves
})
