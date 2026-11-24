// Pure functions on task lists: each one gets an array and gives back a new one, the old array is never changed.
// No React in here, so Node's built-in test runner can check them (see todoLogic.test.js).

export const FILTER_KEYS = ['all', 'active', 'done']

// A new, open task at the end of the list. values: { text, priority, due }.
export function addTodo(todos, values) {
  return [...todos, { id: crypto.randomUUID(), done: false, priority: 'normal', due: '', ...values }]
}

// The given task becomes done, or open again.
export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
}

// The given task gets the fields of `patch` (for example { priority: 'high' }), the rest stays.
export function updateTodo(todos, id, patch) {
  return todos.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo))
}

// The given task gets a new text.
export function renameTodo(todos, id, text) {
  return updateTodo(todos, id, { text })
}

// Every task except the given one.
export function deleteTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id)
}

// Only the open tasks.
export function clearDone(todos) {
  return todos.filter((todo) => !todo.done)
}

// The tasks that match the filter: 'all', 'active' (not done yet) or 'done'. Anything else counts as 'all'.
export function filterTodos(todos, filter) {
  if (filter === 'active') return todos.filter((todo) => !todo.done)
  if (filter === 'done') return todos.filter((todo) => todo.done)
  return todos
}

// How many tasks each filter shows.
export function countTodos(todos) {
  const active = todos.filter((todo) => !todo.done).length
  return { all: todos.length, active, done: todos.length - active }
}

// Moves the fromId task to where the toId task is now. Unknown IDs leave the list as it is.
export function moveTodo(todos, fromId, toId) {
  const from = todos.findIndex((todo) => todo.id === fromId)
  const to = todos.findIndex((todo) => todo.id === toId)
  if (from === -1 || to === -1) return todos
  const copy = [...todos]
  const [moved] = copy.splice(from, 1) // take it out of its old place…
  copy.splice(to, 0, moved) // …and put it into the new one
  return copy
}
