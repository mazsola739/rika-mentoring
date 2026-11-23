# What we build

A to-do list: type what you need to get done, tick it off when it is done, and delete it when you no longer need it.
It sounds simple, but almost every app works like this inside: a list in state that gets new items, while the ones
already there change or disappear. Once you really understand it here, a shop's basket, the messages of a chat or the
cards of a kanban board will feel familiar. By the end, the list remembers your tasks, can be reordered by dragging,
has its logic checked by automated tests, and keeps your tasks on a (pretend) server, in your own account.

:::levels
- Add, tick off and delete tasks. | about 2 hours
- Editing, filters (all / active / done) and saving with a `useLocalStorage` hook of your own. | about 3 hours
- Due dates and priorities, drag-to-reorder, automated tests, and finally a login and a pretend server with a database. | about 4 hours
:::

**Before you start you need:** the eight lessons before this one. We build mostly on these: components, props, lists
with `map` and a form (lesson 1), `localStorage` and a custom hook (lesson 2), controlled inputs, checkboxes and
`async`/`await` (lesson 3), throwing away late answers in an effect (lesson 5), immutable updates,
`crypto.randomUUID()` and the `useLocalStorage` hook (lesson 6), arrays in state (lesson 7), and pure functions with
tests (lesson 8). Whatever we recall gets a sentence or two of explanation again; everything new is explained step by
step.

## Beginner level {level=1}

### Before you start

Download the lesson's **starter** (above: "Download starter"), unzip it, and open the `todo-list` folder in your
editor. Then type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a light grey page with a white card in
the middle, and on it the title "To-Do List" in dark teal. Nothing else yet: the list is your job.
:::

The starter has three files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so this time you do not
  write styles: you only use the class names (`todo-item`, `add-todo`, `filters`, …) that the steps give you. Have a
  look inside anyway!
- `src/fakeServer.js`: a pretend server. We need it only at the very end, in the advanced level.

As in the earlier lessons, the folder is a git repository with one commit, the starting point: `git restore .` takes
every file back, and it is worth committing after every step that works.

:::concept A quick recap
A [[component]] is a function that returns [[JSX]], the HTML-like description of what should appear on the screen. A
component gets data from outside through its [[props]], and remembers things with [[useState]]: when a state value
changes, React draws the component again. Work that is not drawing, saving for example, goes into a [[useEffect]]. If
any of these feels unfamiliar, go back to lessons 1–3.
:::

:::concept Four operations: CRUD
There are four things you can do with a to-do list: add a new task (**C**reate), look at the tasks (**R**ead), change
one (**U**pdate, for example tick it off or rewrite it), and remove one (**D**elete). The first letters of the four
words give the abbreviation [[CRUD]]. Almost every app does these four things, only with different data: products,
messages, photos. In this lesson you write all four.
:::

### A list from an array

A task has three pieces of data: an [[ID]] (`id`), its text (`text`), and whether it is done (`done`). So each task is
an [[object]], and the list is an [[array]] of objects. The ID is a value that belongs to this one task only and never
changes: if two tasks have the same text ("Shopping"), their IDs are still different.

Showing a task gets a component of its own. Create a `components` folder inside `src`, with a `TodoItem.jsx` file in
it:

```jsx file=src/components/TodoItem.jsx
function TodoItem({ todo }) {
  return (
    <li className="todo-item">
      <span className="todo-item__text">{todo.text}</span>
    </li>
  )
}

export default TodoItem
```

`TodoItem` gets a whole task as a single prop (`todo`) and shows its text. Now change `src/App.jsx` to this (the
highlighted lines are new):

```jsx file=src/App.jsx mark=1,4-9,15-19
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Sample tasks, so there is something to show.
const START_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Call Grandma', done: true },
  { id: 3, text: 'Finish homework', done: false },
]

function App() {
  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <ul className="todo-list">
        {START_TODOS.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

In lesson 1 you drew your list of skills the same way: `map` calls the function for every item of the array, and the
elements it returns become the list. Back then it was `key={skill}`, now it is `key={todo.id}`. The [[key]] is how
React recognises the rows when the list changes: which row is new, which one is gone, which one has moved. So it needs
a value that belongs to the task and never changes: the ID. The text will not do, because two tasks can have the same
text, and you will be able to rewrite it later. We use the `done` field in step 3.

:::check Check
Under the title, three framed rows appear: "Buy milk", "Call Grandma", "Finish homework".
:::

:::mistake Common mistake
`key={index}`, the row's position from the second parameter of `map((todo, index) => …)`. While the list does not
change, it works, and the console says nothing. The trouble comes when you delete or move a row: the positions shift,
and React mixes up the rows. In step 5 you try out what happens then.
:::

:::try Try it
Add a fourth task to the `START_TODOS` array, with `id: 4`. It appears as soon as you save.
:::

### Adding a task

You type new tasks into a text field and add them with ++Enter++ or a button. Two things are needed: the field and a
list that can change.

The field first. Create the `src/components/AddTodo.jsx` file:

```jsx file=src/components/AddTodo.jsx
import { useState } from 'react'

function AddTodo({ onAdd }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    const trimmed = text.trim()
    if (trimmed === '') return // no empty tasks
    onAdd(trimmed)
    setText('')
  }

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input
        className="add-todo__text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="What needs to be done?"
        aria-label="New task"
      />
      <button type="submit" className="button button--primary">
        Add
      </button>
    </form>
  )
}

export default AddTodo
```

This is a [[controlled input]], like the slider of lesson 3: its value lives in the `text` state, and every key press
updates it. The field and the button sit in a `<form>`, so ++Enter++ submits the form too, not only the button. You know
submitting from the contact form of lesson 1: `event.preventDefault()` stops the browser from reloading the page.
`trim()` cuts the spaces off both ends of the text, so a task made of nothing but spaces is not added either. At the
end, `setText('')` empties the field.

`AddTodo` does not keep the list itself: it only tells someone that there is a new task, through the `onAdd` prop. The
list lives in `App`, because that is where it is drawn. This is [[lifting state up]], which you saw in lesson 3: data
goes down through props, events come up through functions.

Now `App`. From now on the list changes, so it becomes [[state]], and `START_TODOS` is only its starting value:

```jsx file=src/App.jsx mark=1-2,14,16-20,25,27
import { useState } from 'react'
import AddTodo from './components/AddTodo.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Sample tasks, so there is something to show.
const START_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Call Grandma', done: true },
  { id: 3, text: 'Finish homework', done: false },
]

function App() {
  const [todos, setTodos] = useState(START_TODOS)

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // A new array: all the old tasks, with the new one at the end.
    setTodos([...todos, newTodo])
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

- `handleAdd` is an [[event handler]]. Its name starts with `handle`: a lot of React code names the functions that
  respond to an event this way.
- You know `crypto.randomUUID()` from lesson 6, where the decks and cards got their IDs from it: every call gives a
  long random ID, a [[UUID]], for example `'3b9f0c2e-…'`. Two equal ones practically never come up, so it makes a good
  `id`. (It works only on `https://` addresses and on `localhost`, but the development server is exactly that.)
- In the middle of `{ id: …, text, done: false }`, `text` is short for `text: text`, like `return { theme, setTheme }`
  in lesson 2.
- In `[...todos, newTodo]`, the [[spread]] spreads out an array: it copies every item of the old array into a new one,
  and the new task goes at the end. In lesson 1 you copied an object this way (`{ ...form }`), and in lesson 6 you grew
  the list of decks exactly like this (`[...decks, newDeck]`).

Why not simply `todos.push(newTodo)`? `push` grows the existing array. React, however, notices a change by comparing
the old value with the new one: if it is the same array, nothing has happened as far as React is concerned, and it does
not draw again. So we never change state in place; we always hand `setTodos` a new array. This is the
[[immutable update]] (immutable: unchangeable) you already used in lessons 6 and 7.

In lessons 6 and 7 you also saw the [[updater function]] (`setIndex((i) => …)`, `setColors((current) => …)`). It was
needed there because the key listener was created only once and saw the old state. Our event handlers are created
again on every render and always see the fresh `todos`, so the simpler form is enough here.

:::check Check
Type "Buy bread" and press ++Enter++: the new task appears at the end of the list, and the field empties. With only
spaces, or with an empty field, the "Add" button does nothing.
:::

:::mistake Common mistake
`todos.push(newTodo)`, then `setTodos(todos)`. There is no error, but the new task does not appear: `setTodos` got the
same array that React already knows. The array has really grown meanwhile, so when the page is drawn again for some
other reason, the "lost" task suddenly pops up. Bugs like this are very hard to find: always hand over a new array.
:::

:::try Try it
Make new tasks go to the top of the list: `[newTodo, ...todos]`. Then change it back.
:::

### Ticking off

Ticking off a task is the "U" of CRUD: changing an existing item. `TodoItem` gets a [[checkbox]] and an `onToggle`
prop, with which it reports that someone clicked it. Change `src/components/TodoItem.jsx`:

```jsx file=src/components/TodoItem.jsx mark=1,3-7
function TodoItem({ todo, onToggle }) {
  return (
    <li className={todo.done ? 'todo-item is-done' : 'todo-item'}>
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span className="todo-item__text">{todo.text}</span>
      </label>
    </li>
  )
}

export default TodoItem
```

The checkbox is controlled by `checked`, as in lesson 3. The `<label>` wraps both the box and the text, so clicking the
text ticks the box too. `todo.done ? 'todo-item is-done' : 'todo-item'` is the [[ternary operator]]: a done task's row
also gets the `is-done` class, which `App.css` turns into faded, struck-through text.

In `App`, `handleToggle` does the change. Again it makes a new array, this time with `map`:

```jsx file=src/App.jsx mark=22-25,33
import { useState } from 'react'
import AddTodo from './components/AddTodo.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Sample tasks, so there is something to show.
const START_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Call Grandma', done: true },
  { id: 3, text: 'Finish homework', done: false },
]

function App() {
  const [todos, setTodos] = useState(START_TODOS)

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // A new array: all the old tasks, with the new one at the end.
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // A new array in which only the clicked task is replaced.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

Read the inside of `handleToggle` slowly. `map` walks through the tasks and puts something into the new array for each
one:

- if this is the task that was clicked (its ID matches), a **copy** takes its place: `{ ...todo, done: !todo.done }`.
  The spread copies all its fields, and the part after the comma overwrites `done` with its opposite (`!` turns `true`
  into `false` and back);
- every other task goes over unchanged, as itself.

We do not change the original task here either: it is part of the old state too.

:::check Check
"Call Grandma" is ticked and struck through from the start. Click another task's box or its text: it gets ticked and
struck through; one more click and it is open again.
:::

:::mistake Common mistake
The spread is left out: `{ done: !todo.done }`. After a click, the task's text disappears, because the new object has
only the `done` field: the `id` and the `text` are lost. `...todo` is what carries the other fields over.
:::

### Deleting

The last letter of CRUD, the "D". Deleting needs the array's [[filter]] function: it walks through the items and keeps,
in a new array, only those for which the function you give it returns `true`. `TodoItem` gets a button that calls
`onDelete`:

```jsx file=src/components/TodoItem.jsx mark=1,8-17
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={todo.done ? 'todo-item is-done' : 'todo-item'}>
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span className="todo-item__text">{todo.text}</span>
      </label>
      <div className="todo-item__actions">
        <button
          type="button"
          className="button button--small"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete: ${todo.text}`}
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export default TodoItem
```

Every row will have a "Delete" button. For people using a screen reader that is not enough: they cannot tell which
task a button belongs to. So `aria-label` gives the button its full name, for example "Delete: Buy milk". The text is
put together with a [[template literal]], like the `mailto:` link in lesson 1.

In `App` comes `handleDelete`, plus two small things: a line under the list that says how many tasks are left, and a
message when the list is empty.

```jsx file=src/App.jsx mark=15-16,29-32,38,41,44
import { useState } from 'react'
import AddTodo from './components/AddTodo.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Sample tasks, so there is something to show.
const START_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Call Grandma', done: true },
  { id: 3, text: 'Finish homework', done: false },
]

function App() {
  const [todos, setTodos] = useState(START_TODOS)
  // Not state: worked out from todos on every render.
  const activeCount = todos.filter((todo) => !todo.done).length

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // A new array: all the old tasks, with the new one at the end.
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // A new array in which only the clicked task is replaced.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function handleDelete(id) {
    // A new array with all the other tasks: the ones with a different ID.
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      {todos.length === 0 && <p className="todo-empty">Nothing to do. Add your first task above!</p>}
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
      </ul>
      <p className="todo-footer">Tasks left: {activeCount}</p>
    </main>
  )
}

export default App
```

- `todo.id !== id` is true when the task is **not** the one to delete: so everything stays except that one.
- `activeCount` is a [[derived value]], like the strength meter of lesson 3: it follows from `todos`, so it gets no
  state of its own; we work it out on every render. Here `filter` keeps the open tasks, and `length` counts them.
- `{todos.length === 0 && …}` is [[conditional rendering]]: the message appears only when the list is empty.

:::check Check
Under the list it says "Tasks left: 2" (with the three sample tasks). Tick one off: it becomes 1. Delete a task with
its "Delete" button: it disappears, and the number follows. If you delete all of them, the list is replaced by
"Nothing to do. Add your first task above!" The beginner level is done: commit it!
:::

:::mistake Common mistake
`todos.filter((todo) => todo.id === id)`, with `===` instead of `!==`. This works exactly the wrong way round: the
deleted task stays, and all the others disappear.
:::

:::try Task
Add a "Clear completed" button under the list that deletes all ticked tasks at once. It needs a new event handler in
`App` that uses `filter` to keep only the open tasks.
:::

:::concept Where did my tasks go?
If you reload the page (++F5++), the list goes back to the three sample tasks. State lives only while the page is
open. In the intermediate level we save it in the browser.
:::

## Intermediate level {level=2}

### Editing

If you made a typo in a task, you should not have to delete it and type it again: let's add an "Edit" button.
Clicking it turns the row into a text field with the task's text in it. ++Enter++ or "Save" saves the change, ++Esc++ or
"Cancel" throws it away.

Whether a row is being edited is something only that row needs to know: it is [[local state]], living in `TodoItem`
itself, not in `App`. Every `TodoItem` gets an `editing` state of its own, independent of the others. Change
`src/components/TodoItem.jsx`:

```jsx file=src/components/TodoItem.jsx mark=1,3-45,54-61
import { useState } from 'react'

function TodoItem({ todo, onToggle, onRename, onDelete }) {
  // Local state: only this row knows whether it is being edited, and what is in the field.
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)

  function startEditing() {
    setDraft(todo.text)
    setEditing(true)
  }

  function handleSave(event) {
    event.preventDefault()
    const trimmed = draft.trim()
    if (trimmed !== '') onRename(todo.id, trimmed)
    setEditing(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <li className="todo-item is-editing">
        <form className="todo-edit" onSubmit={handleSave}>
          <input
            className="todo-edit__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="New text of the task"
            autoFocus
          />
          <button type="submit" className="button button--small button--primary">
            Save
          </button>
          <button type="button" className="button button--small" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      </li>
    )
  }

  return (
    <li className={todo.done ? 'todo-item is-done' : 'todo-item'}>
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span className="todo-item__text">{todo.text}</span>
      </label>
      <div className="todo-item__actions">
        <button
          type="button"
          className="button button--small"
          onClick={startEditing}
          aria-label={`Edit: ${todo.text}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="button button--small"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete: ${todo.text}`}
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export default TodoItem
```

- The component has two `return`s. If `editing` is true, the first one runs and the function ends right there: the row
  becomes a form. Otherwise the second one runs: the usual row.
- `draft` is the text being edited: it controls the edit field, as `text` controls the field in `AddTodo`. It reaches
  the list only when you save, through `onRename`; that is why "Cancel" can simply leave editing mode.
- `startEditing` puts the task's current text into `draft` again at the start of every edit. The starting value of
  `useState(todo.text)` only counts on the first render: without that line, after a "Cancel" the next edit would
  greet you with the text you threw away.
- `autoFocus` puts the cursor into the field as it appears, so you can type straight away.
- `onKeyDown` runs on every key press. `event.key` tells you which key it was, as in lesson 7: here we only care about
  `'Escape'`.

In `App`, the new `handleRename` follows the same pattern as ticking off, only now the text is replaced. By now
`TodoItem` has so many props that we write them on separate lines:

```jsx file=src/App.jsx mark=29-32,50
import { useState } from 'react'
import AddTodo from './components/AddTodo.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Sample tasks, so there is something to show.
const START_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Call Grandma', done: true },
  { id: 3, text: 'Finish homework', done: false },
]

function App() {
  const [todos, setTodos] = useState(START_TODOS)
  // Not state: worked out from todos on every render.
  const activeCount = todos.filter((todo) => !todo.done).length

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // A new array: all the old tasks, with the new one at the end.
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // A new array in which only the clicked task is replaced.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function handleRename(id, text) {
    // The same pattern as ticking off, but now the text is replaced.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)))
  }

  function handleDelete(id) {
    // A new array with all the other tasks: the ones with a different ID.
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      {todos.length === 0 && <p className="todo-empty">Nothing to do. Add your first task above!</p>}
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ))}
      </ul>
      <p className="todo-footer">Tasks left: {activeCount}</p>
    </main>
  )
}

export default App
```

:::check Check
If you deleted every task in step 4, reload the page first (++F5++): the three sample tasks come back. Click "Edit" in
the "Buy milk" row: the row gets a light green background, with a text field holding the task's text and the cursor,
and next to it the "Save" and "Cancel" buttons. Change it to "Buy milk and bread" and press ++Enter++: the row comes
back with the new text. Start again, type something, and press ++Esc++: the old text stays.
:::

:::try Try it: what is the key for?
Now you will see why the key needs the ID. In `App`, change the list for a moment to `todos.map((todo, index) => (`
and `key={index}`. Click "Edit" on the second task (Grandma), then "Delete" on the first task. The edit field stays in
second place and still says "Call Grandma", but it now belongs to the homework task: press "Cancel" and "Finish
homework" appears there; press "Save" instead and the homework task is renamed to "Call Grandma". React handed the
row's state to a different task, based on its position. Change it back to `key={todo.id}` and try again: the editing
moves along with the Grandma task.
:::

:::mistake Common mistake
The "Cancel" button is missing its `type="button"`. Inside a form, every button is a submit button by default
(`type="submit"`), so "Cancel" would submit the form too, saving the very change you wanted to throw away.
:::

### Filters: all, active, done

In a longer list it helps to see only the open tasks, or only the finished ones. The chosen filter is one more piece
of state (`'all'`, `'active'` or `'done'`), but the list of visible tasks is **not** state: it follows from `todos` and
the filter, so we work it out on every render.

The filtering logic has nothing to do with React, so it goes into a file of its own, like `generator.js` in lesson 3.
Create the `src/todoLogic.js` file:

```js file=src/todoLogic.js
// Functions that work on task lists. No React in them: they get an array and give back a new one.

// The tasks that match the filter: 'all', 'active' (not done yet) or 'done'.
export function filterTodos(todos, filter) {
  if (filter === 'active') return todos.filter((todo) => !todo.done)
  if (filter === 'done') return todos.filter((todo) => todo.done)
  return todos
}
```

The filter buttons go into the `src/components/FilterBar.jsx` file:

```jsx file=src/components/FilterBar.jsx
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

function FilterBar({ filter, counts, onChange }) {
  return (
    <div className="filters" role="group" aria-label="Filter">
      {FILTERS.map((item) => (
        <button
          key={item.value}
          type="button"
          className="filters__button"
          aria-pressed={filter === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          <span className="filters__count">{counts[item.value]}</span>
        </button>
      ))}
    </div>
  )
}

export default FilterBar
```

`aria-pressed` is an [[ARIA]] attribute: it tells screen readers whether the button is pressed, and `App.css` uses it
to paint the chosen one dark. `counts` is an object with the three numbers, for example
`{ all: 3, active: 2, done: 1 }`; `counts[item.value]` takes the one that belongs to the button. `role="group"` and
`aria-label` bundle the three buttons into a group with a name.

In `App`, the filter gets a state, and the visible tasks take the list's place:

```jsx file=src/App.jsx mark=2,4,15-20,24,26,28-29,56-61,71
import { useState } from 'react'
import { filterTodos } from './todoLogic.js'
import AddTodo from './components/AddTodo.jsx'
import FilterBar from './components/FilterBar.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Sample tasks, so there is something to show.
const START_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Call Grandma', done: true },
  { id: 3, text: 'Finish homework', done: false },
]

// What to show when no task is left after filtering.
const EMPTY_MESSAGES = {
  all: 'Nothing to do. Add your first task above!',
  active: 'All done. Nice work!',
  done: 'No finished tasks yet.',
}

function App() {
  const [todos, setTodos] = useState(START_TODOS)
  const [filter, setFilter] = useState('all') // 'all', 'active' or 'done'

  // Not state: worked out from todos and filter on every render.
  const activeCount = todos.filter((todo) => !todo.done).length
  const counts = { all: todos.length, active: activeCount, done: todos.length - activeCount }
  const visibleTodos = filterTodos(todos, filter)

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // A new array: all the old tasks, with the new one at the end.
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // A new array in which only the clicked task is replaced.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function handleRename(id, text) {
    // The same pattern as ticking off, but now the text is replaced.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)))
  }

  function handleDelete(id) {
    // A new array with all the other tasks: the ones with a different ID.
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      <FilterBar filter={filter} counts={counts} onChange={setFilter} />
      {visibleTodos.length === 0 ? (
        <p className="todo-empty">{EMPTY_MESSAGES[filter]}</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
      <p className="todo-footer">Tasks left: {activeCount}</p>
    </main>
  )
}

export default App
```

- `FilterBar`'s `onChange` prop is `setFilter` itself: the button calls it with the filter's name, and that becomes the
  new state.
- `condition ? (…) : (…)` now chooses between two pieces of JSX: if no task is visible, the message for the filter
  comes from `EMPTY_MESSAGES`; otherwise the list.
- Ticking, editing and deleting still work on the whole `todos`, by ID. So it does not matter which filter is showing.

:::check Check
Under the form there are three buttons: "All 3", "Active 2", "Done 1" (with the three sample tasks), and "All" is dark.
Click "Active": the done task disappears. Tick a task here: it disappears too, and the numbers change. Tick all of
them: "All done. Nice work!"
:::

:::mistake Common mistake
Writing the filtered list back into state: `setTodos(todos.filter((todo) => !todo.done))` for the "Active" button. It
seems to work at first, but it **deletes** the done tasks: clicking "All" does not bring them back. Filtering is a
view, not a change: keep the whole list in state, and work out the visible part.
:::

### Saving in the browser

Reload the page: the list is back to the three sample tasks. To keep the tasks, we save them in [[localStorage]], which
you know from lessons 2 and 6: the browser keeps pieces of text in it under names (keys), and they stay even after you
close it.

The catch: localStorage can store **nothing but text**, and we want an array of objects. That is what [[JSON]] is for
(you already used it in lesson 6): a way of writing arrays and objects down as plain text, and reading them back.

- `JSON.stringify(todos)` turns the array into text: `'[{"id":1,"text":"Buy milk","done":false},…]'`.
- `JSON.parse(text)` turns it back into the same kind of array.

The saving is done by a [[useEffect]]. You saved the theme this way in lesson 2: the effect runs after rendering, and
because of the [[dependency array]] (`[todos]`), every time the list has changed. Change the top of `src/App.jsx` to
this. The second half of the `App` function, from `activeCount` to the end of the `return`, does not change: in the code
below, a comment starting with `…` marks its place.

```jsx file=src/App.jsx mark=1,22-33,36,39-46
import { useEffect, useState } from 'react'
import { filterTodos } from './todoLogic.js'
import AddTodo from './components/AddTodo.jsx'
import FilterBar from './components/FilterBar.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Sample tasks, so there is something to show.
const START_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Call Grandma', done: true },
  { id: 3, text: 'Finish homework', done: false },
]

// What to show when no task is left after filtering.
const EMPTY_MESSAGES = {
  all: 'Nothing to do. Add your first task above!',
  active: 'All done. Nice work!',
  done: 'No finished tasks yet.',
}

const STORAGE_KEY = 'todo-list'

// Reads the saved tasks. With no save, or a broken one, we start with the sample tasks.
function readSavedTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // Blocked storage or a broken save: keep the samples.
  }
  return START_TODOS
}

function App() {
  const [todos, setTodos] = useState(readSavedTodos)
  const [filter, setFilter] = useState('all') // 'all', 'active' or 'done'

  // After every change, save the list as JSON text.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // Never mind if it fails: the list still works, it just does not remember.
    }
  }, [todos])

  // … from here on everything stays as it was: activeCount, counts, visibleTodos, the four handle… functions, the return
}

export default App
```

- `useState(readSavedTodos)`: we pass the function, not its result. This is the [[lazy initial state]] from lesson 2:
  React calls it only on the first render, not on every key press.
- Thanks to `try … catch`, the page does not crash if the browser blocks storage, or if someone breaks the saved text
  by hand (`JSON.parse` throws an error on broken JSON).
- The effect runs after the very first render too, and saves the starting list. That is fine: it writes back what it
  has just read.

:::check Check
Add a task, tick another one, and reload the page (++F5++): everything is as you left it. In the developer tools
(++F12++ → Application → Local storage → `http://localhost:5173`) you find the `todo-list` key, with your list next to
it as JSON.
:::

:::mistake Common mistake
Without `JSON.parse`: `return saved`. After a reload the page is empty, and the console says
`todos.filter is not a function`. `saved` is a piece of text, not an array, and text has no `filter` function. What
goes in as JSON has to be read back with `JSON.parse`.
:::

:::try Try it
Delete the `todo-list` key in the developer tools (right click → Delete) and reload: the sample tasks are back.
:::

### A custom hook: useLocalStorage

The filter could survive a reload too. For that we would have to write the same code once more, with a different key
and a different starting value. Instead, we write a [[custom hook]] that can save **anything**. You already wrote one
in lesson 2, `useDarkMode`: a function whose name starts with `use` and that calls other hooks. And in lessons 6 and 7
you wrote a `useLocalStorage` just like this one. This time we put it together from the code that has been in `App` so
far, so you also see how a repeated piece of code becomes a custom hook. If you kept your own version, compare it with
this one.

Create the `src/useLocalStorage.js` file:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Works like useState, but the value survives a reload:
// it is kept in localStorage as JSON, under the given key.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Blocked storage or a broken save: keep the initial value.
    }
    return initialValue
  })

  // Save after every change.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Never mind if it fails: the value still works, it just does not remember.
    }
  }, [key, value])

  // Gives back the same as useState: the value and the function that sets it.
  return [value, setValue]
}

export default useLocalStorage
```

This is the same code that was in `App` so far, except that it gets the key and the starting value as parameters. The
lazy initial state is now an [[arrow function]] written on the spot (`() => { … }`), because it needs `key` and
`initialValue`. At the end it returns a two-item array, just like `useState`, so you can use it the same way:
`const [todos, setTodos] = useLocalStorage(…)`. This is array [[destructuring]], which you also use in every `useState`
line: the first item goes into `todos`, the second into `setTodos`.

So `STORAGE_KEY`, `readSavedTodos` and the effect leave `App`. Here is the whole file:

```jsx file=src/App.jsx mark=1,23-24
import useLocalStorage from './useLocalStorage.js'
import { filterTodos } from './todoLogic.js'
import AddTodo from './components/AddTodo.jsx'
import FilterBar from './components/FilterBar.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Sample tasks, so there is something to show.
const START_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Call Grandma', done: true },
  { id: 3, text: 'Finish homework', done: false },
]

// What to show when no task is left after filtering.
const EMPTY_MESSAGES = {
  all: 'Nothing to do. Add your first task above!',
  active: 'All done. Nice work!',
  done: 'No finished tasks yet.',
}

function App() {
  const [todos, setTodos] = useLocalStorage('todo-list', START_TODOS)
  const [filter, setFilter] = useLocalStorage('todo-filter', 'all') // 'all', 'active' or 'done'

  // Not state: worked out from todos and filter on every render.
  const activeCount = todos.filter((todo) => !todo.done).length
  const counts = { all: todos.length, active: activeCount, done: todos.length - activeCount }
  const visibleTodos = filterTodos(todos, filter)

  function handleAdd(text) {
    const newTodo = { id: crypto.randomUUID(), text, done: false }
    // A new array: all the old tasks, with the new one at the end.
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // A new array in which only the clicked task is replaced.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function handleRename(id, text) {
    // The same pattern as ticking off, but now the text is replaced.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)))
  }

  function handleDelete(id) {
    // A new array with all the other tasks: the ones with a different ID.
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      <FilterBar filter={filter} counts={counts} onChange={setFilter} />
      {visibleTodos.length === 0 ? (
        <p className="todo-empty">{EMPTY_MESSAGES[filter]}</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
      <p className="todo-footer">Tasks left: {activeCount}</p>
    </main>
  )
}

export default App
```

Nothing needs to be imported from `react` any more: `App` calls the custom hook, and `useState` and `useEffect` do
their work inside it. The tasks' key has stayed the same (`'todo-list'`), so the list you have already saved is kept.

:::check Check
The tasks still survive a reload. Choose the "Done" filter and reload: "Done" stays selected. In Local storage, next to
`todo-list` there is now a `todo-filter` key too (keys from earlier lessons may be there as well, because those also
ran at `http://localhost:5173`). Then click "All" again: the next steps expect every task to be visible. The
intermediate level is done: commit it!
:::

:::mistake Common mistake
Two `useLocalStorage` calls with the same key, for example both `'todo-list'`. The two values are saved in the same
place, so storage only ever keeps the one saved last. If you choose the "Done" filter, for example, `todo-list` ends up
holding the text `"done"`, and after a reload `todos` gets that text: the page is empty, and the console shows the
familiar `todos.filter is not a function`. Every value needs a key of its own.
:::

## Advanced level {level=3}

### Due dates and priorities

A task can have a due date and a priority. The new-task form gets a [[dropdown]] (`<select>`) for the priority ("Can
wait", "Normal", "Urgent") and a date field (`<input type="date">`) for the due date. Both are controlled inputs, just
like the text field.

The date field gives the date as text, like this: `'2026-11-23'`, that is year-month-day, always with a two-digit
month and day. This is an [[ISO date]]. Its big advantage is that two of them can be compared directly as text: `<` and
`>` say the same as the calendar, because reading from the left, the year decides first, then the month, then the day.
To know whether a due date has passed, you only need today's date in the same form. Create the `src/dates.js` file:

```js file=src/dates.js
// Dates are handled as YYYY-MM-DD text, for example '2026-11-23'. The date field gives them like this too.

// Today, by the computer's clock.
export function todayString() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0') // getMonth() counts from 0: January is 0
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// 'overdue', 'today' (due today) or 'later' (due later).
export function dueStatus(due, today) {
  if (due < today) return 'overdue'
  if (due === today) return 'today'
  return 'later'
}

const DUE_WORDS = { overdue: 'Overdue', today: 'Today', later: 'Due' }

// The text of the label, for example 'Overdue: 20 Nov'
export function dueLabel(due, today) {
  const date = new Date(`${due}T00:00`).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
  return `${DUE_WORDS[dueStatus(due, today)]}: ${date}`
}
```

- `new Date()` is the current moment. `getFullYear()`, `getMonth()` and `getDate()` take the year, the month and the
  day of the month out of it, as numbers. `String(…)` turns the number into text, and `padStart(2, '0')` pads it if it
  has only one digit: `'3'` becomes `'03'`, so the month and the day are always two characters long.
- `toLocaleDateString` turns the date into a readable form, the way the given language writes dates.
  `{ month: 'short', day: 'numeric' }` asks for only the short month name and the day: with `'en-GB'`, for example,
  you get "20 Nov".
- Because of `T00:00`, the browser takes the date as midnight in your own time zone. Without it, it would take
  midnight in world time (UTC), and where the clock is behind world time (in America, for example), it would show the
  day before.

Now the form. Change `src/components/AddTodo.jsx`:

```jsx file=src/components/AddTodo.jsx mark=5-6,12,14-15,27-32
import { useState } from 'react'

function AddTodo({ onAdd }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('normal') // 'low', 'normal' or 'high'
  const [due, setDue] = useState('') // '' = no due date

  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    const trimmed = text.trim()
    if (trimmed === '') return // no empty tasks
    onAdd({ text: trimmed, priority, due })
    setText('')
    setPriority('normal')
    setDue('')
  }

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <input
        className="add-todo__text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="What needs to be done?"
        aria-label="New task"
      />
      <select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priority">
        <option value="low">Can wait</option>
        <option value="normal">Normal</option>
        <option value="high">Urgent</option>
      </select>
      <input type="date" value={due} onChange={(event) => setDue(event.target.value)} aria-label="Due date" />
      <button type="submit" className="button button--primary">
        Add
      </button>
    </form>
  )
}

export default AddTodo
```

From now on `onAdd` gets not just the text but an object with all three values. So `handleAdd` in `App` has to change
too. Replace the `handleAdd` function in `src/App.jsx` with this:

```jsx file=src/App.jsx
  function handleAdd(values) {
    // values holds the form data: { text, priority, due }. ...values copies all of them into the new task.
    const newTodo = { id: crypto.randomUUID(), done: false, ...values }
    setTodos([...todos, newTodo])
  }
```

Finally the rows. Next to the text, `TodoItem` draws labels: "Urgent" and "Can wait" for the priority ("Normal" gets
no label, it is the usual case), and a coloured label for the due date. Change the top of
`src/components/TodoItem.jsx` and its second `return` like this (the editing part does not change; a comment starting
with `…` marks it):

```jsx file=src/components/TodoItem.jsx mark=2,5-6,15-19
import { useState } from 'react'
import { dueLabel, dueStatus, todayString } from '../dates.js'

function TodoItem({ todo, onToggle, onRename, onDelete }) {
  // Today, to compare the due date with.
  const today = todayString()
  // … the editing and draft state, startEditing, handleSave, handleKeyDown and the if (editing) part, as before

  return (
    <li className={todo.done ? 'todo-item is-done' : 'todo-item'}>
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span className="todo-item__text">{todo.text}</span>
      </label>
      <span className="todo-item__tags">
        {todo.priority === 'high' && <span className="tag tag--high">Urgent</span>}
        {todo.priority === 'low' && <span className="tag tag--low">Can wait</span>}
        {todo.due && <span className={`tag tag--${dueStatus(todo.due, today)}`}>{dueLabel(todo.due, today)}</span>}
      </span>
      {/* … the todo-item__actions div with its two buttons, as before … */}
    </li>
  )
}

export default TodoItem
```

`tag--${…}` is a template literal again: an overdue date gets the `tag--overdue` class, today's gets `tag--today`, a
later one `tag--later` (red, yellow, blue). Your older tasks and the sample tasks have no `priority` or `due` field:
for them `todo.priority` and `todo.due` are `undefined`, so none of the conditions is true, and they get no label. An
empty due date (`''`) counts as false too, so a new task added without a date gets no due-date label either. That way
the old save does not need converting.

:::check Check
Under the text field the form now has a dropdown ("Normal") and a date field. Add a task with "Urgent" priority and
yesterday as the due date: its row shows a pink "Urgent" and a red "Overdue: …" label. A due date of today gets a
yellow "Today: …" label, one next week a blue "Due: …" label. After adding, the dropdown goes back to "Normal" and the
date field is cleared.
:::

:::mistake Common mistake
`new Date().toISOString().slice(0, 10)` for today. It looks like `'2026-11-23'` too, but it counts in world time
(UTC): in many time zones it gives yesterday's or tomorrow's date for a few hours around midnight, so a task due today
shows the wrong label at night. `todayString` uses the computer's own clock.
:::

:::try Task
Make urgent tasks come first in the list. In `App`, sort `visibleTodos`:
`filterTodos(todos, filter).toSorted((a, b) => …)` gives a sorted copy, leaving the original array unchanged. The
function should return a negative number if `a` should come first, a positive one if `b` should. Take the sorting out
again before the next step, because there we put the tasks in order by hand.
:::

### Drag to reorder

So far the tasks are in the order you added them. Now we make them reorderable: you grab a row with the mouse and drop
it on the row whose place it should take. For this we use the browser's [[Drag and Drop API]]. It needs four events:

- `dragstart`: you started dragging an element. Only elements with a `draggable` attribute can be dragged.
- `dragover`: the dragged element is over another one right now. By default the browser lets you drop nowhere; if the
  event handler calls `event.preventDefault()`, it lets you drop here.
- `drop`: you let go of the mouse over an element.
- `dragend`: the drag is over, whether the drop worked or not.

Dragging only works with a mouse. So that the list can be reordered with the keyboard and on a phone too, every row
also gets two small buttons: ↑ and ↓.

The logic first: a function that moves a task to another task's place. Add this to the end of `src/todoLogic.js`:

```js file=src/todoLogic.js
// Moves the fromId task to where the toId task is now.
export function moveTodo(todos, fromId, toId) {
  const from = todos.findIndex((todo) => todo.id === fromId)
  const to = todos.findIndex((todo) => todo.id === toId)
  if (from === -1 || to === -1) return todos
  const copy = [...todos]
  const [moved] = copy.splice(from, 1) // take it out of its old place…
  copy.splice(to, 0, moved) // …and put it into the new one
  return copy
}
```

- `findIndex` tells you at which position (counting from 0) the item is for which the function returns `true`. If
  there is none, it returns `-1`.
- `splice` **changes** the array you call it on: `splice(from, 1)` takes one item out at position `from` and returns it
  in a one-item array (`const [moved]` takes that item out of it with destructuring); `splice(to, 0, moved)` takes
  nothing out, it only inserts `moved` at position `to`. Because it changes the array, we make a copy first (`copy`):
  we do not touch the array in state.

Now `TodoItem`. The row gets the four events and the two arrows. Here is the whole `src/components/TodoItem.jsx`:

```jsx file=src/components/TodoItem.jsx mark=4,50-52,55-67,79-94
import { useState } from 'react'
import { dueLabel, dueStatus, todayString } from '../dates.js'

function TodoItem({ todo, dragging, onToggle, onRename, onDelete, onMove, onDragStart, onDragEnd, onDrop }) {
  // Today, to compare the due date with.
  const today = todayString()
  // Local state: only this row knows whether it is being edited, and what is in the field.
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)

  function startEditing() {
    setDraft(todo.text)
    setEditing(true)
  }

  function handleSave(event) {
    event.preventDefault()
    const trimmed = draft.trim()
    if (trimmed !== '') onRename(todo.id, trimmed)
    setEditing(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <li className="todo-item is-editing">
        <form className="todo-edit" onSubmit={handleSave}>
          <input
            className="todo-edit__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="New text of the task"
            autoFocus
          />
          <button type="submit" className="button button--small button--primary">
            Save
          </button>
          <button type="button" className="button button--small" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      </li>
    )
  }

  let className = 'todo-item'
  if (todo.done) className += ' is-done'
  if (dragging) className += ' is-dragging'

  return (
    <li
      className={className}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', todo.text) // Firefox does not even start dragging without this
        onDragStart(todo.id)
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()} // without this, nothing could be dropped here
      onDrop={(event) => {
        event.preventDefault()
        onDrop(todo.id)
      }}
    >
      <label className="todo-item__label">
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span className="todo-item__text">{todo.text}</span>
      </label>
      <span className="todo-item__tags">
        {todo.priority === 'high' && <span className="tag tag--high">Urgent</span>}
        {todo.priority === 'low' && <span className="tag tag--low">Can wait</span>}
        {todo.due && <span className={`tag tag--${dueStatus(todo.due, today)}`}>{dueLabel(todo.due, today)}</span>}
      </span>
      <div className="todo-item__actions">
        <button
          type="button"
          className="button button--small"
          onClick={() => onMove(todo.id, -1)}
          aria-label={`Move up: ${todo.text}`}
        >
          ↑
        </button>
        <button
          type="button"
          className="button button--small"
          onClick={() => onMove(todo.id, 1)}
          aria-label={`Move down: ${todo.text}`}
        >
          ↓
        </button>
        <button
          type="button"
          className="button button--small"
          onClick={startEditing}
          aria-label={`Edit: ${todo.text}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="button button--small"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete: ${todo.text}`}
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export default TodoItem
```

- `className` now depends on three things, so we build it step by step in a `let` variable: `+=` adds to the end.
- `event.dataTransfer` is the drag's "parcel": you can put data into it, to be taken out where it is dropped.
  `'text/plain'` says that what goes in is plain text. We do not need it, because `App` remembers the ID, but Firefox
  only starts dragging if there is something in it.
- On `drop`, `event.preventDefault()` stops the browser from handling the drop its own way (Firefox, for example,
  would try to open the text as an address).

`App` remembers which task is being dragged (`draggedId`), and does the moving. The arrows move one step in the
**visible** list: if a filter hides some tasks, an arrow moves to the next visible task's place. Here is the whole
`src/App.jsx`:

```jsx file=src/App.jsx mark=1,3,26,54-65,80,84-87
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { filterTodos, moveTodo } from './todoLogic.js'
import AddTodo from './components/AddTodo.jsx'
import FilterBar from './components/FilterBar.jsx'
import TodoItem from './components/TodoItem.jsx'
import './App.css'

// Sample tasks, so there is something to show.
const START_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Call Grandma', done: true },
  { id: 3, text: 'Finish homework', done: false },
]

// What to show when no task is left after filtering.
const EMPTY_MESSAGES = {
  all: 'Nothing to do. Add your first task above!',
  active: 'All done. Nice work!',
  done: 'No finished tasks yet.',
}

function App() {
  const [todos, setTodos] = useLocalStorage('todo-list', START_TODOS)
  const [filter, setFilter] = useLocalStorage('todo-filter', 'all') // 'all', 'active' or 'done'
  const [draggedId, setDraggedId] = useState(null) // the ID of the task being dragged, or null

  // Not state: worked out from todos and filter on every render.
  const activeCount = todos.filter((todo) => !todo.done).length
  const counts = { all: todos.length, active: activeCount, done: todos.length - activeCount }
  const visibleTodos = filterTodos(todos, filter)

  function handleAdd(values) {
    // values holds the form data: { text, priority, due }. ...values copies all of them into the new task.
    const newTodo = { id: crypto.randomUUID(), done: false, ...values }
    setTodos([...todos, newTodo])
  }

  function handleToggle(id) {
    // A new array in which only the clicked task is replaced.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  function handleRename(id, text) {
    // The same pattern as ticking off, but now the text is replaced.
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)))
  }

  function handleDelete(id) {
    // A new array with all the other tasks: the ones with a different ID.
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  // The dragged task was dropped on the targetId task: it takes that task's place.
  function handleDrop(targetId) {
    if (draggedId !== null) setTodos(moveTodo(todos, draggedId, targetId))
    setDraggedId(null)
  }

  // The arrows: one place up (-1) or down (+1) in the visible list.
  function handleMove(id, step) {
    const index = visibleTodos.findIndex((todo) => todo.id === id)
    const neighbor = visibleTodos[index + step]
    if (neighbor) setTodos(moveTodo(todos, id, neighbor.id))
  }

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <AddTodo onAdd={handleAdd} />
      <FilterBar filter={filter} counts={counts} onChange={setFilter} />
      {visibleTodos.length === 0 ? (
        <p className="todo-empty">{EMPTY_MESSAGES[filter]}</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              dragging={draggedId === todo.id}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
              onMove={handleMove}
              onDragStart={setDraggedId}
              onDragEnd={() => setDraggedId(null)}
              onDrop={handleDrop}
            />
          ))}
        </ul>
      )}
      <p className="todo-footer">Tasks left: {activeCount}</p>
    </main>
  )
}

export default App
```

For the very first task, `visibleTodos[index - 1]` does not exist: its value is `undefined`, so ↑ does nothing there.
The same goes for ↓ on the last one.

:::check Check
Grab the first task with the mouse, drag it onto the third one and let go: it moves to the third place, and while you
drag it, it is faded with a dashed border. Click a task's ↓ button: it swaps places with the one below. Reload the
page: the new order is kept, because the order of the `todos` array has changed, and the hook saves that.
:::

:::mistake Common mistake
`onDragOver={(event) => event.preventDefault()}` is missing. The row can be dragged, but wherever you let go it jumps
back, and the `drop` event never runs: by default the browser lets you drop nowhere.
:::

:::concept Why does dragging not work on a phone?
The Drag and Drop API was made for the mouse: most phone browsers do not start it on touch. Dragging by touch needs
Pointer Events and a good deal more code: you have to move the dragged row under the finger yourself. We come back to
this in later lessons. Until then the ↑ and ↓ buttons work everywhere: with the mouse, with the keyboard (++Tab++,
then ++Enter++) and by touch.
:::

### Pure functions and tests

So far in this lesson you have clicked through the app by hand after every change, to see whether it still works. That
gets tiring after a while, and it is easy to forget something. In lesson 8, with the calculator, you already wrote the
answer to this: an [[automated test|test]] is a small program that calls your code and checks whether it gives what
you expect. One command, and in a few milliseconds you know whether everything is fine.

As you saw in lesson 8, [[pure functions|pure function]] are the easiest to test. A pure function works only from its
parameters, changes nothing (not its parameters, not the screen, not localStorage), and always gives the same result for
the same input. `filterTodos` and `moveTodo` are like that. The inside of `App`'s event handlers could be too, so we
move them into `todoLogic.js`. Here is the whole `src/todoLogic.js`:

```js file=src/todoLogic.js mark=3-21
// Functions that work on task lists. No React in them: they get an array and give back a new one.

// A new task, not done yet, at the end of the list. values: { text, priority, due }.
export function addTodo(todos, values) {
  return [...todos, { id: crypto.randomUUID(), done: false, ...values }]
}

// The given task becomes done, or open again.
export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
}

// The given task gets a new text.
export function renameTodo(todos, id, text) {
  return todos.map((todo) => (todo.id === id ? { ...todo, text } : todo))
}

// Every task except the given one.
export function deleteTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id)
}

// The tasks that match the filter: 'all', 'active' (not done yet) or 'done'.
export function filterTodos(todos, filter) {
  if (filter === 'active') return todos.filter((todo) => !todo.done)
  if (filter === 'done') return todos.filter((todo) => todo.done)
  return todos
}

// Moves the fromId task to where the toId task is now.
export function moveTodo(todos, fromId, toId) {
  const from = todos.findIndex((todo) => todo.id === fromId)
  const to = todos.findIndex((todo) => todo.id === toId)
  if (from === -1 || to === -1) return todos
  const copy = [...todos]
  const [moved] = copy.splice(from, 1) // take it out of its old place…
  copy.splice(to, 0, moved) // …and put it into the new one
  return copy
}
```

(`addTodo` cheats a little: because of the random ID, two calls do not give exactly the same result. So the test does
not check the ID, only the other fields.)

In `src/App.jsx`, the import from `todoLogic.js` now brings in all six functions. Replace the old
`import { filterTodos, moveTodo } from './todoLogic.js'` line with this:

```jsx file=src/App.jsx
import { addTodo, deleteTodo, filterTodos, moveTodo, renameTodo, toggleTodo } from './todoLogic.js'
```

And the inside of each of the four event handlers becomes a single line. Replace them (`handleDrop` and `handleMove`
stay as they are):

```jsx file=src/App.jsx
  function handleAdd(values) {
    setTodos(addTodo(todos, values))
  }

  function handleToggle(id) {
    setTodos(toggleTodo(todos, id))
  }

  function handleRename(id, text) {
    setTodos(renameTodo(todos, id, text))
  }

  function handleDelete(id) {
    setTodos(deleteTodo(todos, id))
  }
```

Now for the test. As in lesson 8, we use the built-in [[test runner]] of Node.js: the `node --test` command finds the
files ending in `.test.js` in the project and runs them. There is no package to install. Create the
`src/todoLogic.test.js` file:

```js file=src/todoLogic.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addTodo, deleteTodo, filterTodos, moveTodo, toggleTodo } from './todoLogic.js'

// A small sample list. Every test starts from it.
const SAMPLE = [
  { id: 1, text: 'Milk', done: false },
  { id: 2, text: 'Bread', done: true },
  { id: 3, text: 'Cheese', done: false },
]

// Only the IDs, in order: easy to compare.
function ids(todos) {
  return todos.map((todo) => todo.id)
}

test('addTodo: the new task goes to the end of the list, not done yet', () => {
  const result = addTodo(SAMPLE, { text: 'Apple' })
  assert.equal(result.length, 4)
  assert.equal(result[3].text, 'Apple')
  assert.equal(result[3].done, false)
  assert.equal(SAMPLE.length, 3) // the original list has not changed
})

test('toggleTodo: only the given task flips', () => {
  const result = toggleTodo(SAMPLE, 2)
  assert.deepEqual(
    result.map((todo) => todo.done),
    [false, false, false],
  )
  assert.equal(SAMPLE[1].done, true) // the original task has not changed
})

test('deleteTodo: the given task is gone, the others stay', () => {
  assert.deepEqual(ids(deleteTodo(SAMPLE, 1)), [2, 3])
})

test('moveTodo: the task takes the place of the target task', () => {
  assert.deepEqual(ids(moveTodo(SAMPLE, 1, 3)), [2, 3, 1])
  assert.deepEqual(ids(moveTodo(SAMPLE, 3, 1)), [3, 1, 2])
})

test('filterTodos: all, active and done', () => {
  assert.deepEqual(ids(filterTodos(SAMPLE, 'all')), [1, 2, 3])
  assert.deepEqual(ids(filterTodos(SAMPLE, 'active')), [1, 3])
  assert.deepEqual(ids(filterTodos(SAMPLE, 'done')), [2])
})
```

- `test('name', () => { … })` describes one test: a name that says what you expect, and a function that checks it.
- `assert.equal(a, b)` passes if `a` and `b` are the same; if not, the test fails and prints both. `deepEqual` compares
  arrays and objects item by item (two separate arrays are never the same for `equal`, even with the same items in
  them).
- The tests also check that `SAMPLE` has not changed: that is the promise of a pure function.

To start it with a short command, add a `test` line to the `scripts` part of `package.json` (the `preview` line needs
a comma at its end):

```json file=package.json mark=4-5
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test"
  },
```

Leave the development server running, and open a second terminal (in VS Code, with the **+** in the terminal's tab
bar). Type this in it:

```shell
npm test
```

:::check Check
The terminal lists all five tests, each with a tick (✔) in front, and at the end: `pass 5` and `fail 0`. The app in
the browser works just as before.
:::

:::try Try it: what does a failure look like?
Break `deleteTodo` on purpose: write `===` instead of `!==`, and run `npm test` again. The `deleteTodo` test gets a
red ✖, and the end says `pass 4` and `fail 1`. Below come the details: `actual` is what the function gave (`[ 1 ]`),
`expected` is what the test expected (`[ 2, 3 ]`). Fix it, and everything is green again.
:::

:::try Task
Write a sixth test for `renameTodo` (add it to the import at the top of the file too): rename task 3, and check the
new text, as well as that the other two tasks' texts have not changed.
:::

### The list in a component of its own

In the next step `App` will show either a login form or the list. To prepare, the list moves into a component of
its own: create the `src/components/TodoList.jsx` file. Its content is almost word for word your current `App`: only
its name is `TodoList`, the import paths change (what is in `src` now starts with `../`, the neighbouring components
with `./`), the `App.css` import is left out, and it has no `<main>` and no title, because those stay in `App`.

```jsx file=src/components/TodoList.jsx mark=2-6,22,62,86,90
import { useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'
import { addTodo, deleteTodo, filterTodos, moveTodo, renameTodo, toggleTodo } from '../todoLogic.js'
import AddTodo from './AddTodo.jsx'
import FilterBar from './FilterBar.jsx'
import TodoItem from './TodoItem.jsx'

// Sample tasks, so there is something to show.
const START_TODOS = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Call Grandma', done: true },
  { id: 3, text: 'Finish homework', done: false },
]

// What to show when no task is left after filtering.
const EMPTY_MESSAGES = {
  all: 'Nothing to do. Add your first task above!',
  active: 'All done. Nice work!',
  done: 'No finished tasks yet.',
}

function TodoList() {
  const [todos, setTodos] = useLocalStorage('todo-list', START_TODOS)
  const [filter, setFilter] = useLocalStorage('todo-filter', 'all') // 'all', 'active' or 'done'
  const [draggedId, setDraggedId] = useState(null) // the ID of the task being dragged, or null

  // Not state: worked out from todos and filter on every render.
  const activeCount = todos.filter((todo) => !todo.done).length
  const counts = { all: todos.length, active: activeCount, done: todos.length - activeCount }
  const visibleTodos = filterTodos(todos, filter)

  function handleAdd(values) {
    setTodos(addTodo(todos, values))
  }

  function handleToggle(id) {
    setTodos(toggleTodo(todos, id))
  }

  function handleRename(id, text) {
    setTodos(renameTodo(todos, id, text))
  }

  function handleDelete(id) {
    setTodos(deleteTodo(todos, id))
  }

  // The dragged task was dropped on the targetId task: it takes that task's place.
  function handleDrop(targetId) {
    if (draggedId !== null) setTodos(moveTodo(todos, draggedId, targetId))
    setDraggedId(null)
  }

  // The arrows: one place up (-1) or down (+1) in the visible list.
  function handleMove(id, step) {
    const index = visibleTodos.findIndex((todo) => todo.id === id)
    const neighbor = visibleTodos[index + step]
    if (neighbor) setTodos(moveTodo(todos, id, neighbor.id))
  }

  return (
    <>
      <AddTodo onAdd={handleAdd} />
      <FilterBar filter={filter} counts={counts} onChange={setFilter} />
      {visibleTodos.length === 0 ? (
        <p className="todo-empty">{EMPTY_MESSAGES[filter]}</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              dragging={draggedId === todo.id}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
              onMove={handleMove}
              onDragStart={setDraggedId}
              onDragEnd={() => setDraggedId(null)}
              onDrop={handleDrop}
            />
          ))}
        </ul>
      )}
      <p className="todo-footer">Tasks left: {activeCount}</p>
    </>
  )
}

export default TodoList
```

`<>` and `</>` make a [[Fragment]]: an "invisible" wrapper. A component can return only one element, and a Fragment
holds several together without appearing on the page itself. So the form, the filters and the list still sit directly
in the `<main>` card, and their styles do not change.

`App` becomes very short. Change `src/App.jsx`:

```jsx file=src/App.jsx mark=1,8
import TodoList from './components/TodoList.jsx'
import './App.css'

function App() {
  return (
    <main className="todo">
      <h1>To-Do List</h1>
      <TodoList />
    </main>
  )
}

export default App
```

:::check Check
The page looks and works exactly as before: your tasks are there, and the filters, dragging and the arrows all work.
Only the code is different: every part of the list is in `TodoList`, and under the title `App` now draws just this
one component. If so, commit it!
:::

:::mistake Common mistake
`'./useLocalStorage.js'` stays in `TodoList.jsx` instead of `'../useLocalStorage.js'`. Instead of the page you get
Vite's red error message: `Failed to resolve import "./useLocalStorage.js"`. `TodoList.jsx` is in the `components`
folder, so to reach what is in `src` you have to step one folder up (`..`); the neighbouring components, though, stay
with `./`.
:::

### Logging in

Right now your tasks live in this one browser. A real to-do list keeps them on a [[server]], in a [[database]]: that
way you see the same list on your phone and on your computer, and everyone sees only their own. For that, the app
first needs to know who you are: it needs a [[login]].

We do not use real servers in this course: the `src/fakeServer.js` that came with the starter only plays the part.
Its database is one key in localStorage, but it behaves like a server: you have to wait a little for every answer, and
sometimes no answer comes at all. It offers three functions:

- `logIn(name, password)`: logging in. The first login with a new name creates the account, with that password. With
  a wrong password it throws an error whose `status` field is `401`.
- `fetchTodos(name)`: the user's tasks (an empty array for a new account).
- `saveTodos(name, todos)`: saves the user's tasks.

All three return a [[Promise]], so you wait for them with `await` in an [[async function]], and catch the errors with
[[try/catch]], as with the clipboard in lesson 3. The errors also carry an [[HTTP status code]]: a three-digit number
that real servers use to say what went wrong. `401` means the server could not tell who you are (here: the password
is wrong), `503` means the server is not available right now.

The login form goes into the `src/components/LoginForm.jsx` file:

```jsx file=src/components/LoginForm.jsx
import { useState } from 'react'
import { logIn } from '../fakeServer.js'

function LoginForm({ onLogin }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false) // whether the login is running

  async function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '' || password === '') {
      setError('Enter your name and your password.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const user = await logIn(name.trim(), password)
      onLogin(user.name)
    } catch (err) {
      setError(err.status === 401 ? 'Wrong password.' : 'The server is not responding. Please try again!')
      setBusy(false)
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h2>Log in</h2>
      <p className="login__hint">
        Your account is created the first time you log in. Do not use your real password: this is only a practice server.
      </p>
      <label className="field">
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="username" />
      </label>
      <label className="field">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error && (
        <p className="login__error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button button--primary" disabled={busy}>
        {busy ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}

export default LoginForm
```

- `busy` is true while we wait for the server's answer: `disabled={busy}` disables the button then, and it says
  "Logging in…", so the form cannot be sent twice. After a successful login there is no need to set it back, because
  the form disappears anyway; after an error we do, so you can try again.
- `catch (err)` receives the error, and `err.status` tells what happened: a wrong password (`401`), or no answer from
  the server.
- `role="alert"` asks screen readers to read the error out loud as soon as it appears, as in lesson 5.
- `autoComplete` tells the browser which field is the user name and which is the password.

Now `App` can show two things: the form if nobody is logged in, otherwise the list. Change `src/App.jsx` (the
highlighted lines are new):

```jsx file=src/App.jsx mark=1-2,7-8,13-24,26-27
import useLocalStorage from './useLocalStorage.js'
import LoginForm from './components/LoginForm.jsx'
import TodoList from './components/TodoList.jsx'
import './App.css'

function App() {
  // Who is logged in? The name survives a reload, as with a real login.
  const [user, setUser] = useLocalStorage('todo-user', null)

  return (
    <main className="todo">
      <h1>To-Do List</h1>
      {user === null ? (
        <LoginForm onLogin={setUser} />
      ) : (
        <>
          <div className="todo-user">
            <span>
              Logged in as <strong>{user}</strong>
            </span>
            <button type="button" className="button button--small" onClick={() => setUser(null)}>
              Log out
            </button>
          </div>
          <TodoList />
        </>
      )}
    </main>
  )
}

export default App
```

The logged-in user's name goes into `useLocalStorage` too, so you do not have to log in again after a reload. `null`
means nobody is logged in; "Log out" sets it back to that. In the second branch of the condition, a Fragment again
holds the user bar and the list together.

:::check Check
Under the title the "Log in" form appears. Type a name (for example "Anna") and a password, and log in: for a moment
the button says "Logging in…", then the "Logged in as Anna" bar appears, with your list below it. Log out and try to log
in with the same name but a different password: "Wrong password." Now and then even the right password gets "The
server is not responding": that is the pretend server having a bad day; just try again.
:::

:::mistake Common mistake
`setBusy(false)` is left out of the `catch` branch. After a wrong password the "Wrong password." message appears, but
the button stays disabled, with "Logging in…" on it: the only way to try again is to reload the page.
:::

:::concept How does a real server do it?
A real server never stores the password in readable form, only a [[hash]] of it (a fingerprint), from which the
password cannot be worked out. After a successful login it hands out a [[token|access token]]: a long, unguessable
piece of text that the browser attaches to every further request, and from which the server knows who is asking. Our
pretend server only asks for the name, so anyone could fetch anyone's list: fine for practice, not for real use. A
later lesson covers logins in detail.
:::

### Tasks on the server

Log out and log in with another name: you see the same list. The tasks are still in the browser's `todo-list` key,
shared by everyone. Now the list moves to the server, one per user: every account gets a list of its own (a new
account an empty one), and your current tasks stay in the `todo-list` key; they are not moved to the server.

A custom hook keeps in touch with the server: it loads the list when the list appears, and sends it to the server
after every change. Create the `src/useServerTodos.js` file:

```js file=src/useServerTodos.js
import { useEffect, useState } from 'react'
import { fetchTodos, saveTodos } from './fakeServer.js'

// The logged-in user's tasks: loaded from the server, and saved there after every change.
function useServerTodos(user) {
  const [todos, setTodos] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' or 'error'
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved', 'saving' or 'failed'
  const [attempt, setAttempt] = useState(0) // the "Try again" button increases it, which starts loading again

  // Loading: when the list appears, and on every new attempt.
  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const list = await fetchTodos(user)
        if (ignore) return
        setTodos(list)
        setStatus('ready')
      } catch {
        if (!ignore) setStatus('error')
      }
    }

    load()
    // Cleanup: if the user has logged out or we are trying again, this request's answer is no longer needed.
    return () => {
      ignore = true
    }
  }, [user, attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  // Every change shows at once, and meanwhile the whole list is sent to the server.
  async function changeTodos(newTodos) {
    setTodos(newTodos)
    setSaveStatus('saving')
    try {
      await saveTodos(user, newTodos)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('failed')
    }
  }

  return { todos, setTodos: changeTodos, status, saveStatus, retry }
}

export default useServerTodos
```

Let's read it piece by piece.

- **Loading.** The effect runs when the list first appears. The effect function itself cannot be `async`, because it
  may only return a cleanup function (or nothing), not a Promise. So inside it we write an `async function load()` and
  call it straight away.
- **Three states.** While we wait for the answer, `status` is `'loading'`; once it has arrived, `'ready'`; if an error
  came, `'error'`. `retry` sets it back to `'loading'` and increases `attempt`. Because `attempt` is in the
  [[dependency array]], the effect runs again, that is, it tries again.
- **`ignore`.** The answer does not arrive straight away, and a lot can happen in the meantime: the user logs out, or
  the "Try again" button starts a new request. The [[cleanup function]] then sets `ignore` to `true`, and we throw away
  the late answer of this request. Otherwise an old answer could overwrite a newer one: this kind of bug is called a
  [[race condition]], as in lesson 5. During development, [[StrictMode]] runs effects twice on purpose; `ignore` throws
  away the first run's answer too.
- **Saving.** `changeTodos` updates the screen at once, then sends the whole list to the server, and meanwhile
  `saveStatus` shows how it is going. The hook hands it out under the name `setTodos`, so nothing has to change in
  `TodoList`'s event handlers.

Why is the list not saved by an effect, as in `useLocalStorage`? The effect would also run after loading, and send the
server straight back what it had just sent us. And if saving fails, that is hard to report from an effect. Saving is
the result of something the user did, so it belongs where that happens.

Now `TodoList`. `START_TODOS` leaves it (a new account starts with an empty list), the tasks come from the server, and
until they are here, a message shows instead. Here is the whole `src/components/TodoList.jsx`:

```jsx file=src/components/TodoList.jsx mark=3,16-21,23-24,62-75,101-111
import { useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'
import useServerTodos from '../useServerTodos.js'
import { addTodo, deleteTodo, filterTodos, moveTodo, renameTodo, toggleTodo } from '../todoLogic.js'
import AddTodo from './AddTodo.jsx'
import FilterBar from './FilterBar.jsx'
import TodoItem from './TodoItem.jsx'

// What to show when no task is left after filtering.
const EMPTY_MESSAGES = {
  all: 'Nothing to do. Add your first task above!',
  active: 'All done. Nice work!',
  done: 'No finished tasks yet.',
}

// How saving is going, shown under the list.
const SAVE_MESSAGES = {
  saved: 'All saved',
  saving: 'Saving…',
  failed: 'Could not save.',
}

function TodoList({ user }) {
  const { todos, setTodos, status, saveStatus, retry } = useServerTodos(user)
  const [filter, setFilter] = useLocalStorage('todo-filter', 'all') // 'all', 'active' or 'done'
  const [draggedId, setDraggedId] = useState(null) // the ID of the task being dragged, or null

  // Not state: worked out from todos and filter on every render.
  const activeCount = todos.filter((todo) => !todo.done).length
  const counts = { all: todos.length, active: activeCount, done: todos.length - activeCount }
  const visibleTodos = filterTodos(todos, filter)

  function handleAdd(values) {
    setTodos(addTodo(todos, values))
  }

  function handleToggle(id) {
    setTodos(toggleTodo(todos, id))
  }

  function handleRename(id, text) {
    setTodos(renameTodo(todos, id, text))
  }

  function handleDelete(id) {
    setTodos(deleteTodo(todos, id))
  }

  // The dragged task was dropped on the targetId task: it takes that task's place.
  function handleDrop(targetId) {
    if (draggedId !== null) setTodos(moveTodo(todos, draggedId, targetId))
    setDraggedId(null)
  }

  // The arrows: one place up (-1) or down (+1) in the visible list.
  function handleMove(id, step) {
    const index = visibleTodos.findIndex((todo) => todo.id === id)
    const neighbor = visibleTodos[index + step]
    if (neighbor) setTodos(moveTodo(todos, id, neighbor.id))
  }

  // Until the list is here, only a message shows. These returns come after the hooks, never before them.
  if (status === 'loading') {
    return <p className="todo-status">Loading…</p>
  }
  if (status === 'error') {
    return (
      <div className="todo-status todo-status--error" role="alert">
        <p>Could not load your tasks: the server is not responding.</p>
        <button type="button" className="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <>
      <AddTodo onAdd={handleAdd} />
      <FilterBar filter={filter} counts={counts} onChange={setFilter} />
      {visibleTodos.length === 0 ? (
        <p className="todo-empty">{EMPTY_MESSAGES[filter]}</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              dragging={draggedId === todo.id}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
              onMove={handleMove}
              onDragStart={setDraggedId}
              onDragEnd={() => setDraggedId(null)}
              onDrop={handleDrop}
            />
          ))}
        </ul>
      )}
      <div className="todo-footer">
        <span>Tasks left: {activeCount}</span>
        <span className={`todo-save todo-save--${saveStatus}`} aria-live="polite">
          {SAVE_MESSAGES[saveStatus]}
        </span>
        {saveStatus === 'failed' && (
          <button type="button" className="button button--small" onClick={() => setTodos(todos)}>
            Save again
          </button>
        )}
      </div>
    </>
  )
}

export default TodoList
```

- `useServerTodos` returns an object, so we take out what we need by name, in curly brackets, as with `useDarkMode` in
  lesson 2.
- The filter stays in `useLocalStorage`: it is a setting of your browser, not of your account.
- The "Save again" button sends the same list once more with `setTodos(todos)`.
- `aria-live="polite"` is familiar from lessons 3 and 8: screen readers read out the save status whenever it changes.
  The load error gets `role="alert"`, like the login error.

Finally, in `App`, hand the user's name to the list: write `<TodoList user={user} />` in place of `<TodoList />`.

:::check Check
After logging in, "Loading…" shows for a moment, then, for a new account, "Nothing to do. Add your first task above!"
Add two tasks: under the list on the right it says "Saving…" for a moment, then "All saved". (If it says "Could not
save.", the pretend server dropped that request: "Save again" sends the list once more.) Log out and log in with
another name: you get an empty list. Go back to the first name: your two tasks are there. Reload the page several
times in a row: sooner or later loading fails, and the red "Could not load…" message appears. With the "Try again"
button you can try loading once more. Congratulations, your to-do list is done!
:::

:::mistake Common mistake
Putting the two `if (status === …) return …` lines **before** the hooks, for example above the `useLocalStorage` line.
The page crashes, and the console says: `Rendered more hooks than during the previous render`. React recognises the
hooks by the order in which they are called, so a component has to call the same hooks in the same order on every
render. This is the [[rule of hooks|rules of hooks]] you met in lesson 6: call hooks only at the top of the component,
never inside an `if` or a loop, and never after an early `return`.
:::

:::try Try it
`FAIL_RATE` at the top of `src/fakeServer.js` says what share of the requests should fail (0.15 now). Set it to 1:
every request fails, so you can look at the error messages and the "Try again" button at your leisure. Then set it
back. In the developer tools (Application → Local storage), the `todo-fake-server` key holds the pretend server's
whole database.
:::
