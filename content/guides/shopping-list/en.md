# What we build

A shopping list that is actually handy in the shop. You write down what to buy and how much, the items show up grouped
by category, in the order of the aisles, and whatever is already in your basket you tick off with one tap. On the way
you learn how a plain array becomes a grouped list, how to sort (letters with accents included), how React handles a
form with several fields, and how the list survives a page reload.

:::levels
- Add items with a quantity, tick them off and delete them. | about 2 hours
- Categories in the order of the shop, alphabetical order, ticked items move to the bottom, and the list is saved. | about 3 hours
- Suggestions from items you bought before, a shared list that updates in real time across windows, and an installable app that works offline (PWA). | about 3 hours
:::

**Before you start you need:** the earlier lessons, above all lesson 9, "To-Do List": showing lists with `key`, adding,
changing and deleting items in state, `useEffect` and the custom `useLocalStorage` hook. We build on these, and
whenever something is used in a new way, we explain it again.

## Beginner level {level=1}

### Before you start

The starting project of this lesson is the `lessons/10-shopping-list/exercise` folder of the course repository on
GitHub (above: "Exercise on GitHub"). You get it the same way as in the earlier lessons; lesson 1 explains every step
in detail. In the terminal, in your work folder (the one that holds the `rika-mentoring` folder):

```shell
cd rika-mentoring
git pull        # brings the new lessons into the repository
cd ..
cp -r rika-mentoring/lessons/10-shopping-list/exercise shopping-list
```

If you do not have the repository yet, run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the
first three lines (without git: **Code** → **Download ZIP** on the GitHub page). You can also copy the folder in your
file manager; what matters is that your copy is called `shopping-list` and sits outside the `rika-mentoring` folder, so
`git pull` keeps working. Open your copy in the editor, then type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white card in the middle of the page,
with the title "Shopping List". Nothing else yet: the list is yours to build.
:::

These files of the exercise matter for this lesson:

- `src/App.jsx`: the page itself, for now only with the title. This is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so you do not write styles
  this time: you only use the class names (`shop`, `add-form`, `shop-item`, …) that the steps give you. Have a look
  inside anyway; the comments say what is what.
- `public/icon.svg`, `public/icon-192.png` and `public/icon-512.png`: the app's icon. You need it only at the very end
  of the advanced level, when the list becomes an installable app.

Last, make your copy a git repository with one commit, the starting point. Leave the server running and open a second
terminal (the **+** button in the terminal panel; it opens in `shopping-list` too):

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step that
works.

:::concept A quick recap from earlier lessons
In React you show a list by turning every element of an array into JSX with the array's [[map]] function. Every row
gets a [[key]], a stable, unique identifier that tells React which row is which when the list changes (lesson 9). An
array in state is never changed directly: the setter function always gets a new array (lesson 7). If any of this feels
unfamiliar, take another look at those lessons; everything new is explained here.
:::

### A list from an array

A shopping list is made of items, and we need to know the same things about every item: what it is, how much of it we
need, and whether it is in the basket yet. So every item is an [[object]] with the same keys, and the list is an array
of these objects. Change `src/App.jsx` to this (the highlighted lines are new):

```jsx file=src/App.jsx mark=1,4-9,12,17-24
import { useState } from 'react'
import './App.css'

// A few items, so the list does not start empty.
const START_ITEMS = [
  { id: 1, name: 'Milk', quantity: 2, done: false },
  { id: 2, name: 'Bread', quantity: 1, done: false },
  { id: 3, name: 'Apples', quantity: 6, done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <ul className="shop-list">
        {items.map((item) => (
          <li key={item.id} className="shop-item">
            <span className="shop-item__qty">{item.quantity}×</span>
            <span className="shop-item__name">{item.name}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
```

- `id` is the identifier that becomes the `key`. For now we give it by hand (1, 2, 3); new items will get one by
  themselves in the next step.
- `name` is the item's name, `quantity` how much of it (a number, not text: there are no quotes around it), and `done`
  says whether it is in the basket yet (`true` or `false`).
- `START_ITEMS` stands outside the component because it is only the starting value: it is made once, when the file
  loads. The list lives in `useState`, because it is going to change. You need `setItems` from the next step on.
- `map` makes an `<li>` from every item. The `×` after the quantity is plain text, which gives "2× Milk". It is a
  character of its own, not the letter x, and it is not on your keyboard: copy it from the code block, as you did with
  the calculator keys in lesson 8.

:::check Check
Under the title there are three framed rows: "2× Milk", "1× Bread" and "6× Apples", the quantity of each in a pale
green bubble.
:::

:::mistake Common mistake
Leaving out `key={item.id}`. The page looks the same, but a warning appears in the console (++F12++): "Each child in a
list should have a unique "key" prop." Later, when we delete and reorder rows, without a `key` React can only guess
from the rows' position (their number in the list) which row is which.
:::

:::try Try it
Add a fourth item to `START_ITEMS`, for example `{ id: 4, name: 'Butter', quantity: 1, done: false }`, save, and
reload the page (++F5++). The reload is needed: when you save, Vite keeps the state of the list, and `START_ITEMS` is
only the starting value, which counts when the page loads (more about this in the intermediate level). Mind the
`id`: no two items may share one.
:::

### A new item: a controlled form

To add items we need a [[form]] with two fields: the item's name and the quantity. Both will be a [[controlled input]],
as in the contact form of lesson 1, the slider of lesson 3 and in lesson 4: its value comes from state, and every
keystroke updates the state. That way React always knows what is in the fields, and can reset them with one `set…`
call each.

The form gets a component of its own. Create a `components` folder inside `src`, with an `AddItemForm.jsx` file in it:

```jsx file=src/components/AddItemForm.jsx
import { useState } from 'react'

function AddItemForm({ onAdd }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (trimmedName === '') return
    onAdd(trimmedName, Number(quantity))
    // Empty the fields for the next item.
    setName('')
    setQuantity('1')
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label className="field field--name">
        Item
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. tomatoes"
          required
        />
      </label>
      <label className="field field--qty">
        Quantity
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />
      </label>
      <button type="submit" className="add-form__button">
        Add
      </button>
    </form>
  )
}

export default AddItemForm
```

- The `onSubmit` event of a `<form>` fires when the user submits the form: by clicking the button, or by pressing
  ++Enter++ in one of the fields. `event.preventDefault()` stops the browser from submitting the form the old way and
  reloading the page (you did the same with the contact form of lesson 1).
- The quantity is kept as **text** (`'1'`), because every field gives text, and while typing the field can even be
  empty. It becomes a number only when the form is submitted, with `Number(quantity)`. If we converted at every
  keystroke, an emptied field would give `Number('')`, which is 0, and the 0 would jump straight back into the field.
- `required` and `min="1"` switch on the browser's own [[form validation]]: with an empty name or a quantity below 1 the
  browser does not even submit the form, it shows a small bubble instead. `handleSubmit` does not run at all.
- `required` lets a name made only of spaces through. That is why `trim()` cuts the spaces off both ends of the text,
  and if nothing is left, `return` leaves the function: no empty items.
- The form does not keep the list. It only reports through the `onAdd` prop that here is a new item; the list lives in
  `App`. This is [[lifting state up]], like the slider in lesson 3: data goes down through props, events come up
  through functions.

`App` needs a function that puts the new item on the list; that is what the form gets. Change `src/App.jsx` to this:

```jsx file=src/App.jsx mark=2,15-18,23
import { useState } from 'react'
import AddItemForm from './components/AddItemForm.jsx'
import './App.css'

// A few items, so the list does not start empty.
const START_ITEMS = [
  { id: 1, name: 'Milk', quantity: 2, done: false },
  { id: 2, name: 'Bread', quantity: 1, done: false },
  { id: 3, name: 'Apples', quantity: 6, done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity) {
    const newItem = { id: Date.now(), name, quantity, done: false }
    setItems([...items, newItem])
  }

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />
      <ul className="shop-list">
        {items.map((item) => (
          <li key={item.id} className="shop-item">
            <span className="shop-item__qty">{item.quantity}×</span>
            <span className="shop-item__name">{item.name}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
```

- `Date.now()` gives the number of milliseconds since the start of 1970, for example `1767258000000`. It grows every
  millisecond, so for items added by hand it is a perfectly good unique id. In lesson 9 you used
  `crypto.randomUUID()` for this. Here `Date.now()` is enough, and it has one advantage: `crypto.randomUUID()` only
  works at a secure address (`https://` or `localhost`), so on your phone, at a plain `http://192.168…` address (end of
  the advanced level), adding an item would fail with an error.
- `{ id: Date.now(), name, quantity, done: false }`: when the key and the variable have the same name, writing it once
  is enough. `name` here means the same as `name: name`.
- `[...items, newItem]` is [[spread]]: the `...` spreads the elements of the old array into a new one, and the new
  item goes at the end. It is a new array, so React notices that the list changed and draws it again.

:::check Check
Type "Tomatoes", set the quantity to 4 and press ++Enter++. "4× Tomatoes" appears at the end of the list, the name
field empties and the quantity goes back to 1. Try it with an empty name: the browser asks you in a bubble to fill in
the field. Type only spaces: nothing happens.
:::

:::mistake Common mistake
`items.push(newItem)`, then `setItems(items)`. `push` changes the old array, and you hand React the very same array,
so React sees no change: the new item does not appear. Always hand over a new array: `[...items, newItem]`.
:::

:::try Try it
Should new items go to the top of the list? Swap the order: `[newItem, ...items]`.
:::

### Ticking items off

In the shop you tick off what is already in the basket. So the row gets a [[checkbox]], and in the next step a delete
button too, which is why the row gets a component of its own. Create the `src/components/ShoppingItem.jsx` file:

```jsx file=src/components/ShoppingItem.jsx
function ShoppingItem({ item, onToggle }) {
  return (
    <li className={item.done ? 'shop-item is-done' : 'shop-item'}>
      <label className="shop-item__check">
        <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
        <span className="shop-item__qty">{item.quantity}×</span>
        <span className="shop-item__name">{item.name}</span>
      </label>
    </li>
  )
}

export default ShoppingItem
```

- As in lesson 3, `checked` (`true` or `false`) says whether a checkbox is ticked, and every click calls `onChange`.
- The `<label>` wraps the box, the quantity and the name, so you can click the item's name, not only the small box.
  On a phone, with one hand, next to a trolley, that matters a lot.
- `item.done ? 'shop-item is-done' : 'shop-item'` is the [[ternary operator]] you already know: a ticked row also gets
  the `is-done` class, which `App.css` greys out and crosses through.
- The component does not change the item itself: it only reports with `onToggle` which `id` was clicked. The list
  belongs to `App`, and so does the change.

`App` gets `toggleItem`, and `map` now draws `ShoppingItem`s. Change `src/App.jsx` to this:

```jsx file=src/App.jsx mark=3,21-24,32
import { useState } from 'react'
import AddItemForm from './components/AddItemForm.jsx'
import ShoppingItem from './components/ShoppingItem.jsx'
import './App.css'

// A few items, so the list does not start empty.
const START_ITEMS = [
  { id: 1, name: 'Milk', quantity: 2, done: false },
  { id: 2, name: 'Bread', quantity: 1, done: false },
  { id: 3, name: 'Apples', quantity: 6, done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity) {
    const newItem = { id: Date.now(), name, quantity, done: false }
    setItems([...items, newItem])
  }

  // The clicked item becomes a copy with done flipped; the others stay as they were.
  function toggleItem(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />
      <ul className="shop-list">
        {items.map((item) => (
          <ShoppingItem key={item.id} item={item} onToggle={toggleItem} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

`toggleItem` changes the list the way you know from lesson 9: `map` makes a new array with the same number of
elements. Where the `id` matches, a copy of the item goes into the new array: `{ ...item, done: !item.done }` copies
every key of the item and overwrites `done` with its opposite (`!` turns `true` into `false` and back). Every other item
is carried over unchanged. The `key` now goes on `<ShoppingItem>`, because that is what `map` returns.

:::check Check
Click the checkbox of "Milk", or the word itself: the box gets ticked, the row turns grey and the name is crossed
through. Click it again: it goes back.
:::

:::mistake Common mistake
Putting the `key` inside `ShoppingItem`, on the `<li>`, instead of on `<ShoppingItem>` in the `map`. The console keeps
complaining: React needs the `key` on the element that `map` returns.
:::

:::try Task
Put a `+` button at the end of the row that raises the quantity by one. In `App`, an `increaseQuantity(id)` works with
`map` just like `toggleItem`, only the copy changes the quantity: `{ ...item, quantity: item.quantity + 1 }`. The
button (`<button type="button">`) comes after `</label>`, and calls this function through a new prop, for example
`onIncrease`.
:::

### Deleting, and an empty list

What is no longer needed should be deletable. A `×` button goes at the end of the row. Replace the content of
`src/components/ShoppingItem.jsx` with this:

```jsx file=src/components/ShoppingItem.jsx mark=1,9-16
function ShoppingItem({ item, onToggle, onDelete }) {
  return (
    <li className={item.done ? 'shop-item is-done' : 'shop-item'}>
      <label className="shop-item__check">
        <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
        <span className="shop-item__qty">{item.quantity}×</span>
        <span className="shop-item__name">{item.name}</span>
      </label>
      <button
        type="button"
        className="shop-item__delete"
        onClick={() => onDelete(item.id)}
        aria-label={`Delete ${item.name}`}
      >
        ×
      </button>
    </li>
  )
}

export default ShoppingItem
```

The button only shows a `×`. Anyone who sees it understands, but a screen reader would only say "times, button". The
[[aria-label]] gives the button a name, and the screen reader reads that out: "Delete Milk, button". The name is put
together by a [[template literal]], which you know from lesson 1: inside the backticks (on most English keyboards, the
key left of ++1++), `${…}` inserts the value of `item.name` into the text, the way the words went into the story in
lesson 4. `type="button"` marks it as a plain button, not one for submitting a form. This button is not in a form, but
it is a good habit to write it: inside a `<form>`, a button without a `type` would submit the form by default.

`App` gets `deleteItem`, and two small extras: a line that shows how many items are already in the basket, and a
message when the list is empty. Change `src/App.jsx` to this:

```jsx file=src/App.jsx mark=26-29,31-32,39-44,48
import { useState } from 'react'
import AddItemForm from './components/AddItemForm.jsx'
import ShoppingItem from './components/ShoppingItem.jsx'
import './App.css'

// A few items, so the list does not start empty.
const START_ITEMS = [
  { id: 1, name: 'Milk', quantity: 2, done: false },
  { id: 2, name: 'Bread', quantity: 1, done: false },
  { id: 3, name: 'Apples', quantity: 6, done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity) {
    const newItem = { id: Date.now(), name, quantity, done: false }
    setItems([...items, newItem])
  }

  // The clicked item becomes a copy with done flipped; the others stay as they were.
  function toggleItem(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  // Every item stays, except the one whose id matches.
  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id))
  }

  // A derived value: worked out from the list at every drawing, no state of its own.
  const doneCount = items.filter((item) => item.done).length

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />

      {items.length === 0 && <p className="shop-empty">Your list is empty. Add what you need!</p>}
      {items.length > 0 && (
        <p className="shop-progress">
          {doneCount} of {items.length} in the basket
        </p>
      )}

      <ul className="shop-list">
        {items.map((item) => (
          <ShoppingItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

- [[filter]] gives a new array that keeps only the elements the given function says `true` to. Here every item stays
  whose `id` does **not** (`!==`) match the one to delete.
- `doneCount` is a [[derived value]], like the strength meter of lesson 3: we do not store it, we work it out from the
  list at every drawing. `filter` picks the ticked items, and `.length` counts them.
- `{condition && <p>…</p>}` is [[conditional rendering]]: with an empty list the message appears, otherwise the
  counter.

:::check Check
Reload the page first (++F5++): while you edit the code, Vite keeps the items you added before, and the reload brings
back the three starting items (the tomatoes you added go away; saving comes in the intermediate level). Then click the
`×` in the row of "Bread": the row disappears, and above the list it says "0 of 2 in the basket". Tick an item: "1 of
2 in the basket". Delete every item: the text "Your list is empty. Add what you need!" appears. The beginner level is
done: commit it!
:::

:::mistake Common mistake
The condition in `filter` the wrong way round: `item.id === id`. Then only the clicked item stays, and all the others
disappear. `filter` **keeps** what comes out `true`; it does not throw it away.
:::

:::try Task
When every item is ticked, show under the list: "Everything is in the basket, off to the checkout!" It needs two
conditions: there are items, and `doneCount` equals `items.length`. The `shop-progress` class suits it.
:::

## Intermediate level {level=2}

### Categories

In the shop you walk from aisle to aisle: vegetables, bakery, dairy… If the list shows the items grouped, in the same
order, you never have to run back from the dairy counter for the bread. For that, every item needs a category. Create
the `src/categories.js` file:

```js file=src/categories.js
// The categories in the order you meet them in the shop.
export const CATEGORIES = [
  { id: 'produce', label: 'Fruit & vegetables' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'dairy', label: 'Dairy & eggs' },
  { id: 'meat', label: 'Meat & fish' },
  { id: 'pantry', label: 'Pantry' },
  { id: 'frozen', label: 'Frozen' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'household', label: 'Household' },
]
```

Every category has two names. `id` is a short identifier: this is what we store in the item, and it never changes.
`label` is what the user sees; you can rewrite it any time ("Frozen food" instead of "Frozen"), and the items already
on the list still find their category, because their `id` did not change. The order of the array is the order of the
shop: the groups will appear in this order too.

The form gets a [[drop-down list]], `<select>` in HTML, with every choice in an `<option>`. A `<select>` can be a
controlled input just like an `<input>`: `value` says which choice is selected, and `onChange` reports when the user
picks another. Replace the content of `src/components/AddItemForm.jsx` with this:

```jsx file=src/components/AddItemForm.jsx mark=2,7,13-14,41-50
import { useState } from 'react'
import { CATEGORIES } from '../categories.js'

function AddItemForm({ onAdd }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [category, setCategory] = useState('produce')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (trimmedName === '') return
    onAdd(trimmedName, Number(quantity), category)
    // Name and quantity are emptied; the category stays, as several items often come from the same aisle.
    setName('')
    setQuantity('1')
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label className="field field--name">
        Item
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. tomatoes"
          required
        />
      </label>
      <label className="field field--qty">
        Quantity
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />
      </label>
      <label className="field">
        Category
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {CATEGORIES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="add-form__button">
        Add
      </button>
    </form>
  )
}

export default AddItemForm
```

An `<option>` has two parts: `value` is what the `<select>` gives when it is chosen (`'dairy'`), and the text between
the tags is what the user sees ("Dairy & eggs"). The file sits in the `components` folder, so `'../categories.js'`
first steps one folder up (`..`), into `src`.

Finally `App`: the starting items get a category, and `addItem` stores the third value too. In `src/App.jsx`, change
`START_ITEMS` and `addItem`; everything else stays as it was:

```jsx file=src/App.jsx mark=5-7,13-14
// … the imports, as before

// A few items, so the list does not start empty.
const START_ITEMS = [
  { id: 1, name: 'Milk', quantity: 2, category: 'dairy', done: false },
  { id: 2, name: 'Bread', quantity: 1, category: 'bakery', done: false },
  { id: 3, name: 'Apples', quantity: 6, category: 'produce', done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity, category) {
    const newItem = { id: Date.now(), name, quantity, category, done: false }
    setItems([...items, newItem])
  }

  // … toggleItem, deleteItem, doneCount and the return, as before
}
```

After saving, reload the page (++F5++). In lesson 1 you saw that the browser updates by itself when you save: that is
Vite's hot reload. With React it is even smarter: Vite swaps in only the changed code, and keeps the state of the
components meanwhile; this is called [[Fast Refresh]]. While you write code, that is very handy, but right now it
means the state still holds the old items without a category. `START_ITEMS` is only the starting value: it counts when
the component is drawn for the first time, for example after a reload.

:::check Check
The form now has a "Category" drop-down with eight choices, "Fruit & vegetables" selected by default. Choose "Dairy &
eggs" and add "Yoghurt": it goes to the end of the list, as before. The category is stored already; in the next step
the groups are made from it. "Dairy & eggs" stays selected after adding, so you can quickly add several dairy items in
a row.
:::

:::mistake Common mistake
Leaving out the `value` of the `<option>`s. Then the browser uses the visible text as the value, and the item's
category becomes `'Dairy & eggs'` instead of `'dairy'`. Nothing shows yet, but in the next step such an item fits into
no group at all, and simply vanishes from the list.
:::

:::try Try it
To see that the category really is stored, show it next to the name in `ShoppingItem` for a moment:
`{item.name} ({item.category})`. Once you are convinced, delete it again.
:::

### Grouping in the order of the shop

Here comes one of the main ideas of the lesson, [[grouping]]: a plain array becomes groups, and every group holds only
the items that belong to it. The plan: go through the categories, in the order of the shop, and for each one pick out
its items with `filter`. Add this to the end of `src/categories.js`:

```js file=src/categories.js
// Groups the items by category, in the shop's order. Empty groups are left out.
export function groupByCategory(items) {
  const groups = CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    items: items.filter((item) => item.category === category.id),
  }))
  return groups.filter((group) => group.items.length > 0)
}
```

- `CATEGORIES.map(…)` makes a group from every category: an object with the `id`, the `label` and the items of that
  category.
- `(category) => ({ … })` returns an object. The object's curly braces need round brackets around them here: without
  them, JavaScript would take the curly braces for the body of the arrow function, and the function would return
  nothing.
- At the end, `filter` throws out the empty groups, so we do not get eight headings, six of them with nothing under
  them.

From the starting items, for example, it makes this:

```js
[
  { id: 'produce', label: 'Fruit & vegetables', items: [/* Apples */] },
  { id: 'bakery', label: 'Bakery', items: [/* Bread */] },
  { id: 'dairy', label: 'Dairy & eggs', items: [/* Milk */] },
]
```

A group is a heading with its rows under it. Create the `src/components/ItemGroup.jsx` file:

```jsx file=src/components/ItemGroup.jsx
import ShoppingItem from './ShoppingItem.jsx'

function ItemGroup({ title, items, onToggle, onDelete }) {
  return (
    <section className="shop-group">
      <h2>
        {title} <span className="shop-group__count">{items.length}</span>
      </h2>
      <ul className="shop-list">
        {items.map((item) => (
          <ShoppingItem key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  )
}

export default ItemGroup
```

The rows are drawn by `ItemGroup` from now on, so the import of `ShoppingItem` moves here too. `App` goes through the
groups. Change `src/App.jsx` to this:

```jsx file=src/App.jsx mark=3-4,32,34,48-56
import { useState } from 'react'
import AddItemForm from './components/AddItemForm.jsx'
import ItemGroup from './components/ItemGroup.jsx'
import { groupByCategory } from './categories.js'
import './App.css'

// A few items, so the list does not start empty.
const START_ITEMS = [
  { id: 1, name: 'Milk', quantity: 2, category: 'dairy', done: false },
  { id: 2, name: 'Bread', quantity: 1, category: 'bakery', done: false },
  { id: 3, name: 'Apples', quantity: 6, category: 'produce', done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity, category) {
    const newItem = { id: Date.now(), name, quantity, category, done: false }
    setItems([...items, newItem])
  }

  // The clicked item becomes a copy with done flipped; the others stay as they were.
  function toggleItem(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  // Every item stays, except the one whose id matches.
  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id))
  }

  // Derived values: worked out from the list at every drawing.
  const doneCount = items.filter((item) => item.done).length
  const groups = groupByCategory(items)

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />

      {items.length === 0 && <p className="shop-empty">Your list is empty. Add what you need!</p>}
      {items.length > 0 && (
        <p className="shop-progress">
          {doneCount} of {items.length} in the basket
        </p>
      )}

      {groups.map((group) => (
        <ItemGroup
          key={group.id}
          title={group.label}
          items={group.items}
          onToggle={toggleItem}
          onDelete={deleteItem}
        />
      ))}
    </main>
  )
}

export default App
```

`groups` is a derived value too: we do not store it, we work it out from `items` again at every drawing. Whenever you
tick or delete something, the groups follow by themselves.

:::check Check
There are three groups, in the order of the shop: "Fruit & vegetables" (Apples), "Bakery" (Bread) and "Dairy & eggs"
(Milk, and the Yoghurt if you added it in the previous step), even though milk was written down first. Next to every
heading a number shows how many items are under it. Add "Dish soap" to "Household": a new group appears at the bottom.
Delete it: the group goes too.
:::

:::mistake Common mistake
Leaving the `filter` off the end of `groupByCategory`. Then all eight headings appear, most of them over an empty list.
:::

:::concept Why not Object.groupBy?
Modern JavaScript has a ready-made grouping function too: `Object.groupBy(items, (item) => item.category)` gives an
object with every category's items in an array under it. But there the groups come in the order the items appear in
the list, and we need the order of the shop. That is why we started from `CATEGORIES`: there, the order is ours.
:::

:::try Try it
Add a new category to `CATEGORIES`, for example `{ id: 'pets', label: 'Pets' }` before `household`. You do not have to
change anything else: the drop-down and the grouping both follow by themselves.
:::

### Alphabetical order

Inside a group, the items now stand in the order you added them. In alphabetical order they are easier to scan.
Arrays are sorted with their [[sort]] function, which gets a [[compare function]]: it receives two elements, `a` and
`b`, and answers with a number. If it is negative, `a` comes first; if positive, `b`; if 0, they stay as they were.
`sort` compares as many pairs with it as it needs for the whole order.

Two texts are best compared with [[localeCompare]]: it decides their order the way a dictionary of the given language
does. With
`'en'` (English), capitals and small letters are sorted together, and an accented letter sits next to its plain one
(`é` next to `e`). Replace the content of `src/categories.js` with this:

```js file=src/categories.js mark=13-16,19,24
// The categories in the order you meet them in the shop.
export const CATEGORIES = [
  { id: 'produce', label: 'Fruit & vegetables' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'dairy', label: 'Dairy & eggs' },
  { id: 'meat', label: 'Meat & fish' },
  { id: 'pantry', label: 'Pantry' },
  { id: 'frozen', label: 'Frozen' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'household', label: 'Household' },
]

// A compare function for sort: negative if a comes first, positive if b does.
function byName(a, b) {
  return a.name.localeCompare(b.name, 'en')
}

// Groups the items by category, in the shop's order. Empty groups are left out.
// Inside every group, in alphabetical order.
export function groupByCategory(items) {
  const groups = CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    items: items.filter((item) => item.category === category.id).sort(byName),
  }))
  return groups.filter((group) => group.items.length > 0)
}
```

Why a compare function? Without one, `sort` turns everything into text and sorts by character codes. An object as text
is `"[object Object]"`, so every item looks the same, and nothing moves. With plain texts, capitals come before all
small letters, and accented letters after `z`: "avocado" would come after "Zucchini".

Mind one important property: `sort` [[sorts in place]]. It does not give a new array, it rearranges the very array you
called it on. Here that is fine, because `filter` has just made a brand-new array, and that is what we sort. An array
in state, though, must never be rearranged like this (see below).

:::check Check
Add "Zucchini" and "avocado" (in lower case) to "Fruit & vegetables": the group reads "Apples, avocado, Zucchini".
Without a compare function, by plain character codes, it would be "Apples, Zucchini, avocado". If you feel like it,
add "Éclairs" and "Flapjacks" to "Bakery": the group reads "Bread, Éclairs, Flapjacks", with the accented `É` sorted
like a plain `E`. By plain character codes, "Éclairs" would come last, after every plain letter.
:::

:::mistake Common mistake
Sorting the state directly, for example in `App`: `items.sort(byName)`. `sort` sorts in place, so it changes the state
behind React's back, and the page may behave strangely. If you have to sort an array from state, copy it first:
`[...items].sort(byName)`. Or use [[toSorted]], which gives a new array to begin with: `items.toSorted(byName)`.
:::

:::try Try it
Numbers are compared with a simple subtraction. Sort the items inside the groups by quantity, the most first: in
`groupByCategory`, replace `.sort(byName)` with `.sort((a, b) => b.quantity - a.quantity)`. If `b` has more, the
result is positive, and `b` goes first. Then set it back to `byName`.
:::

### Ticked items move to the bottom

What is already in the basket only gets in the way between the groups. It should move to the bottom of the list, into a
separate "In the basket" group, which a single button clears once you are home.

The trick is that nothing moves in the data: the items stay in the same `items` array. Only the drawing splits it in
two: `filter` picks out the items still to buy (`!item.done`) once, and the items in the basket once, and only the
first ones go into the groups. When you tick an item, `done` changes, React draws again, and the item shows up in the
other place. Change `src/App.jsx` to this:

```jsx file=src/App.jsx mark=32-35,38-40,50,64-71
import { useState } from 'react'
import AddItemForm from './components/AddItemForm.jsx'
import ItemGroup from './components/ItemGroup.jsx'
import { groupByCategory } from './categories.js'
import './App.css'

// A few items, so the list does not start empty.
const START_ITEMS = [
  { id: 1, name: 'Milk', quantity: 2, category: 'dairy', done: false },
  { id: 2, name: 'Bread', quantity: 1, category: 'bakery', done: false },
  { id: 3, name: 'Apples', quantity: 6, category: 'produce', done: false },
]

function App() {
  const [items, setItems] = useState(START_ITEMS)

  function addItem(name, quantity, category) {
    const newItem = { id: Date.now(), name, quantity, category, done: false }
    setItems([...items, newItem])
  }

  // The clicked item becomes a copy with done flipped; the others stay as they were.
  function toggleItem(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  // Every item stays, except the one whose id matches.
  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id))
  }

  // Removes everything that is already in the basket.
  function clearDone() {
    setItems(items.filter((item) => !item.done))
  }

  // Derived values: worked out from the list at every drawing.
  const activeItems = items.filter((item) => !item.done)
  const doneItems = items.filter((item) => item.done)
  const groups = groupByCategory(activeItems)

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />

      {items.length === 0 && <p className="shop-empty">Your list is empty. Add what you need!</p>}
      {items.length > 0 && (
        <p className="shop-progress">
          {doneItems.length} of {items.length} in the basket
        </p>
      )}

      {groups.map((group) => (
        <ItemGroup
          key={group.id}
          title={group.label}
          items={group.items}
          onToggle={toggleItem}
          onDelete={deleteItem}
        />
      ))}

      {doneItems.length > 0 && (
        <div className="shop-basket">
          <ItemGroup title="In the basket" items={doneItems} onToggle={toggleItem} onDelete={deleteItem} />
          <button type="button" className="shop-clear" onClick={clearDone}>
            Remove checked items
          </button>
        </div>
      )}
    </main>
  )
}

export default App
```

- `doneItems.length` counts now instead of `doneCount`: the array of ticked items is there anyway.
- `ItemGroup` appears a second time, now with the title "In the basket" and the ticked items. A well-written
  component can be reused with other data.
- `clearDone` is `filter` again: only the unticked items stay.

:::check Check
Tick "Milk": it leaves the "Dairy & eggs" group (if it was alone there, the group goes too) and appears at the bottom,
under "In the basket", crossed through. Untick it: it goes back to its group, to its alphabetical place. Tick "Milk"
again and one more item, then click "Remove checked items": both disappear, and the "In the basket" part goes with them.
:::

:::mistake Common mistake
Two separate states, one for the items to buy and one for the basket, moving an item from one to the other when it is
ticked. It can work, but every action has to keep two lists in mind, and after one forgotten step an item vanishes or
shows up twice. One list and values worked out from it: then nothing can drift apart.
:::

:::try Task
Another design: ticked items go to the bottom of their own group instead of a separate basket. For that,
`groupByCategory` gets all the items, and `sort` sorts by two things:
`(a, b) => Number(a.done) - Number(b.done) || byName(a, b)`. `Number(true)` is 1 and `Number(false)` is 0, so the items
still to buy come first. If both are the same, the difference is 0. `0` counts as false, so then `||` gives its right
side: the second rule, the name, decides.
:::

### The list is saved: useLocalStorage

Reload the page: the list jumps back to the three starting items. State lives only while the page is open. In lesson 9
you wrote a [[custom hook]] for this, `useLocalStorage`: it works like `useState`, but saves every change into the
browser's storage called [[localStorage]], and reads it back on the next visit.

`localStorage` can only store text, but our list is an array of objects. So we turn it into [[JSON]]:
`JSON.stringify` turns the array into text, and `JSON.parse` builds it back from the text. Create the
`src/useLocalStorage.js` file (if you still have the one from lesson 9, compare them):

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Works like useState, but the value survives a page reload.
function useLocalStorage(key, initialValue) {
  // Lazy initial value: the saved value is read only once, at the first drawing.
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Storage blocked or broken data: start from the initial value.
    }
    return initialValue
  })

  // Save after every change, as text.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or not allowed: the app keeps working in memory.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

- `useState` gets a function, a [[lazy initial state]] (lessons 2 and 3): React calls it only at the first drawing. If
  something is saved, we start from that; if not (`null`), from the initial value we were given.
- [[try/catch]] is there because the browser can block the storage, and `JSON.parse` would fail on broken data. Even
  then the page does not crash, it just does not remember.
- The effect runs after every change (its [[dependency array]] is `[key, value]`) and saves the new value.
- The hook returns the same as `useState`: a value and a setter function. That is why the rest of `App` can stay as it
  is.

In `src/App.jsx`, two lines change: in the first line, the import of `useState` is replaced by the import of the hook
(`App` does not call `useState` directly any more), and `useState(START_ITEMS)` is replaced by the `useLocalStorage(…)`
call:

```jsx file=src/App.jsx mark=1,10
import useLocalStorage from './useLocalStorage.js'
import AddItemForm from './components/AddItemForm.jsx'
import ItemGroup from './components/ItemGroup.jsx'
import { groupByCategory } from './categories.js'
import './App.css'

// … START_ITEMS, as before

function App() {
  const [items, setItems] = useLocalStorage('shopping-list:items', START_ITEMS)

  // … everything else, as before
}
```

The first argument is the key the list is stored under. The `shopping-list:` prefix keeps the saved data of another
project of yours from mixing with this one on the same address (every Vite project of yours uses `localhost:5173`).

:::check Check
Add an item, tick another, and reload the page (++F5++): everything is where you left it. In the developer tools
(++F12++), under Application → Local storage → `http://localhost:5173`, you find the `shopping-list:items` key, with the
list next to it as JSON text. If you delete the key (right-click → Delete) and reload the page, the three starting
items come back. The intermediate level is done: commit it!
:::

:::mistake Common mistake
Leaving out `JSON.stringify`, so the hook hands the array itself to `setItem`. `localStorage` turns it into text
anyway, only badly: `"[object Object],[object Object]"`. On reload, `JSON.parse` fails on it, `catch` catches it, and
the list starts with the starting items every time, without any error message.
:::

:::try Try it
In the browser console (++F12++ → Console), run: `JSON.parse(localStorage.getItem('shopping-list:items'))`. You get
back the same array that `App` uses.
:::

## Advanced level {level=3}

### Suggestions from earlier items

Shopping lists look very much alike: milk, bread, apples, week after week. Let's remember what you have ever written
down, and offer with one click whatever is not on the list now. For that we save a second list too, the history: for
every name, its category and how many times you added it.

The logic again has nothing to do with React, so it goes into a file of its own. Create the `src/history.js` file:

```js file=src/history.js
// The history: every item you have ever added, and how many times.
// For example: [{ name: 'Milk', category: 'dairy', count: 3 }, …]

// Are the two names the same, ignoring upper and lower case? ("milk" and "Milk": yes)
function sameName(a, b) {
  return a.toLowerCase() === b.toLowerCase()
}

// Notes that an item was added (again). Returns a new array, with the fresh entry first.
export function remember(history, name, category) {
  const old = history.find((entry) => sameName(entry.name, name))
  const others = history.filter((entry) => !sameName(entry.name, name))
  const count = old ? old.count + 1 : 1
  return [{ name, category, count }, ...others]
}

// Earlier items that are not on the list now: the most frequent first, at most max of them.
export function suggest(history, items, max) {
  const missing = history.filter((entry) => !items.some((item) => sameName(item.name, entry.name)))
  return missing.sort((a, b) => b.count - a.count).slice(0, max)
}
```

Three array functions are at work here; you have met all three in earlier lessons:

- [[find]] returns the first element the function says `true` to, or `undefined` if there is none. If the name was
  there before, the old entry tells us how many times; if not, `count` is 1.
- [[some]] tells whether there is **at least one** element the function says `true` to. So `!items.some(…)` means: not
  a single item on the list has this name.
- `slice(0, max)` returns the first `max` elements, in a new array.

`remember` never changes the array it gets: it returns a new array with the fresh entry first and the rest behind it.
`suggest` sorts the new array that `filter` made, so `sort` does not touch the state here either. `b.count - a.count`
gives descending order: the most frequent goes first. If two are equally frequent, `sort` keeps their order, and
because `remember` always puts the fresh one first, the one added most recently comes first.

The suggestions will be small buttons under the form. Create the `src/components/Suggestions.jsx` file:

```jsx file=src/components/Suggestions.jsx
function Suggestions({ entries, onPick }) {
  // Nothing to suggest: draw nothing.
  if (entries.length === 0) return null

  return (
    <div className="suggestions">
      <span className="suggestions__title">Bought before:</span>
      {entries.map((entry) => (
        <button key={entry.name} type="button" className="suggestion" onClick={() => onPick(entry)}>
          + {entry.name}
        </button>
      ))}
    </div>
  )
}

export default Suggestions
```

When a component returns `null`, React draws nothing in its place. `remember` keeps the names unique, so they can be
`key`s.

In `App`, the history goes into a second `useLocalStorage`, with a key of its own, and is updated at every new item.
Change `src/App.jsx` to this:

```jsx file=src/App.jsx mark=4,6,18,23,26-29,50,56
import useLocalStorage from './useLocalStorage.js'
import AddItemForm from './components/AddItemForm.jsx'
import ItemGroup from './components/ItemGroup.jsx'
import Suggestions from './components/Suggestions.jsx'
import { groupByCategory } from './categories.js'
import { remember, suggest } from './history.js'
import './App.css'

// A few items, so the list does not start empty.
const START_ITEMS = [
  { id: 1, name: 'Milk', quantity: 2, category: 'dairy', done: false },
  { id: 2, name: 'Bread', quantity: 1, category: 'bakery', done: false },
  { id: 3, name: 'Apples', quantity: 6, category: 'produce', done: false },
]

function App() {
  const [items, setItems] = useLocalStorage('shopping-list:items', START_ITEMS)
  const [history, setHistory] = useLocalStorage('shopping-list:history', [])

  function addItem(name, quantity, category) {
    const newItem = { id: Date.now(), name, quantity, category, done: false }
    setItems([...items, newItem])
    setHistory(remember(history, name, category))
  }

  // A click on a suggestion adds the item back with quantity 1, in its earlier category.
  function addSuggestion(entry) {
    addItem(entry.name, 1, entry.category)
  }

  // The clicked item becomes a copy with done flipped; the others stay as they were.
  function toggleItem(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  // Every item stays, except the one whose id matches.
  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id))
  }

  // Removes everything that is already in the basket.
  function clearDone() {
    setItems(items.filter((item) => !item.done))
  }

  // Derived values: worked out from the list at every drawing.
  const activeItems = items.filter((item) => !item.done)
  const doneItems = items.filter((item) => item.done)
  const groups = groupByCategory(activeItems)
  const suggestions = suggest(history, items, 8)

  return (
    <main className="shop">
      <h1>Shopping List</h1>
      <AddItemForm onAdd={addItem} />
      <Suggestions entries={suggestions} onPick={addSuggestion} />

      {items.length === 0 && <p className="shop-empty">Your list is empty. Add what you need!</p>}
      {items.length > 0 && (
        <p className="shop-progress">
          {doneItems.length} of {items.length} in the basket
        </p>
      )}

      {groups.map((group) => (
        <ItemGroup
          key={group.id}
          title={group.label}
          items={group.items}
          onToggle={toggleItem}
          onDelete={deleteItem}
        />
      ))}

      {doneItems.length > 0 && (
        <div className="shop-basket">
          <ItemGroup title="In the basket" items={doneItems} onToggle={toggleItem} onDelete={deleteItem} />
          <button type="button" className="shop-clear" onClick={clearDone}>
            Remove checked items
          </button>
        </div>
      )}
    </main>
  )
}

export default App
```

`addItem` now sets two states, one after the other. That is fine: React waits until the event handler has finished,
and only then draws again, once. The suggestions are derived values too: worked out from the history and the list at
every drawing.

:::check Check
At first there are no suggestions: the history starts empty, and the starting items are not in it. Add "Tomatoes" to
"Fruit & vegetables", tick it, and click "Remove checked items". Under the form appears: "Bought before: + Tomatoes".
Click it: the tomatoes go back to "Fruit & vegetables" with quantity 1, and the button disappears, since they are on
the list again. The history survives a reload too.
:::

:::mistake Common mistake
A plain `===` instead of `sameName`. Then "milk" and "Milk" become two separate entries in the history, and the
"+ milk" button shows up even while "Milk" is on the list.
:::

:::try Task
Suggestions can come while typing, too. Hand `history` to `AddItemForm` in a new prop, and use the browser's built-in
suggestion list: give the name field a `list="past-items"` attribute, and after it add a `<datalist id="past-items">`
with an `<option key={entry.name} value={entry.name} />` for every entry. When you start typing, the browser offers
the matching names.
:::

### A shared list in real time

A shopping list is rarely used by one person alone. While you are in the shop, someone at home quickly adds eggs, and
it would be nice to see them on your list at once. A real shared list needs a server that passes every change on to
the other phones. This course uses no outside services, so we practise with two browser windows: one is you, the other
your flatmate.

Two windows of the same site share the same `localStorage`. When one window changes a key in it, the browser sends a
[[storage event]] to all the **other** windows: "this key has changed, here is its new value". That is what we listen
for, and we put the new value into state. `window.addEventListener` subscribes to an event, and
`window.removeEventListener` unsubscribes (lesson 1's `useHashRoute` watched the address the same way). Replace the
content of `src/useLocalStorage.js` with this:

```js file=src/useLocalStorage.js mark=3-4,26-35
import { useEffect, useState } from 'react'

// Works like useState, but the value survives a page reload,
// and updates at once in the other open windows too.
function useLocalStorage(key, initialValue) {
  // Lazy initial value: the saved value is read only once, at the first drawing.
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Storage blocked or broken data: start from the initial value.
    }
    return initialValue
  })

  // Save after every change, as text.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or not allowed: the app keeps working in memory.
    }
  }, [key, value])

  // Another window changed the same key: take over the new value.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== key || event.newValue === null) return
      setValue(JSON.parse(event.newValue))
    }
    window.addEventListener('storage', handleStorage)
    // Cleanup: when the component goes away, stop listening.
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  return [value, setValue]
}

export default useLocalStorage
```

- `event.key` is the key that changed, `event.newValue` its new value, as text. If it was not our key, or someone
  deleted it (then the new value is `null`), we do nothing.
- `JSON.parse` rebuilds the array, `setValue` puts it into state, and React draws the list again.
- The [[cleanup function]] unsubscribes from the event, so a component that is gone gets no more notices.

Won't this become an endless ping-pong? The window that took over the new value writes the same text back in its own
saving effect. But the browser sends a `storage` event only when the value really changed, so the chain stops there. You
do not have to touch `App` at all: the list and the history both use this hook, so both are shared now.

:::check Check
Open the list in two browser windows side by side (at the same address, for example `http://localhost:5173`). Add
something in the left one: it appears in the right one at once. Tick it in the right one: it gets ticked in the left
one too. If a suggestion appears in the right one after "Remove checked items", it is there in the left one as well.
:::

:::mistake Common mistake
Opening the two windows in two different browsers (say Chrome and Firefox), or one normal and one private (incognito)
window. These have separate `localStorage`s, so they do not see each other's changes. Open two normal windows (or tabs)
of the same browser.
:::

:::concept How does a real app do it?
In a real shared list, every phone keeps a connection open to a server, usually over a [[WebSocket]]. When someone
makes a change, their phone sends it to the server, and the server forwards it to all the others, just as the browser
sends the `storage` event to the other windows here. Our solution always overwrites the whole list, so if two people
change something at exactly the same moment, the last one wins. That is why real apps rather send small changes ("Milk
ticked") and let the server put them together. And if you ever need to send messages between tabs, the browser's
`BroadcastChannel` is made for that too.
:::

### Works offline: a service worker

In a basement supermarket there is often no signal. `localStorage` already keeps the list offline, but with no
network the page itself does not load: the browser asks the server for the files, cannot reach it, and shows an error
page. That
is what a [[service worker]] is for: a small JavaScript file that the browser runs next to the page, in the
background. It stands between the page and the network, sees every request the page sends, and can decide itself where
the answer comes from: from the network, or from its own [[cache]].

A website that also works offline and can be installed like an app is called a [[PWA]] (Progressive Web App). This
step does the offline part, the next one the installing.

A service worker cannot be part of the code that Vite bundles: the browser has to find it at a fixed address. So it
goes into the `public` folder, which Vite copies unchanged next to the finished site. Create the `public/sw.js` file:

```js file=public/sw.js
// The service worker stands between the browser and the network, and sees every request the page sends.
const CACHE_NAME = 'shopping-list-v1'

// A new service worker starts work at once, and takes over the page that is already open.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const request = event.request
  // Only our own site's downloads are handled here.
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return

  // Network first: if it works, a copy of the response goes into the cache.
  // With no network, the answer comes from the cache.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        return response
      })
      .catch(() => caches.match(request)),
  )
})
```

- `self` is the service worker itself. It listens to three of its events: `install` fires when the browser installs
  it, `activate` when it starts work, and `fetch` at every single request the page sends (for the HTML, the
  JavaScript, the CSS, the icons).
- By default, a new service worker waits until every tab that uses the old version is closed. `skipWaiting` and
  `clients.claim` skip this wait: the new service worker starts work at once, and takes over the page that is already
  open too.
- `event.waitUntil(…)` asks the browser to wait with the start until `clients.claim()` has finished.
- `request.method !== 'GET'` lets through everything that is not a plain download (for example a submitted form).
  `self.location.origin` is the site's own address (`http://localhost:4173`), so requests to other sites are not
  touched either. A `return` without `respondWith` leaves the request to the browser, as if there were no service
  worker.
- `event.respondWith(…)` tells the browser: I will answer this request. `fetch(request)` downloads it from the network.
  `.then` and `.catch` are the [[Promise]] counterpart of `try/catch`: `.then` runs if the download worked, `.catch`
  if it did not (for example because there is no network).
- The body of a response can be read only once, so `response.clone()` makes a copy: one for the page, one for the
  cache. `caches.open` opens (or creates) the cache, `cache.put` stores the response under the request's address, and
  `caches.match` looks it up.

This strategy is known as "network first". While there is a network you always get the fresh files, so a new version
shows up at once; the cache is only needed when there is no connection.

The page has to register the service worker, that is, tell the browser where to find it. Add this to the end of
`src/main.jsx`:

```jsx file=src/main.jsx
// The service worker starts only in the finished (built) version. During development Vite
// updates the files live, and a service worker would only get in the way.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
}
```

- Vite fills in the value of `import.meta.env.PROD`: `true` in the finished, built version, `false` under
  `npm run dev`.
- `'serviceWorker' in navigator` checks whether the browser knows about service workers. If it does not, the page works
  the same, just without one.
- `./sw.js` is the `sw.js` next to the page: that is exactly where the content of the `public` folder lands after the
  build.

Since the service worker runs only in the finished version, we need a build now. Stop the development server (++Ctrl++
+ ++C++) and run:

```shell
npm run build     # makes the finished site in the dist folder
npm run preview   # serves the dist folder, usually at http://localhost:4173
```

:::check Check
Open the address it prints (usually `http://localhost:4173`). The list starts from the three starting items again:
`localhost:4173` is a different address from `localhost:5173`, and every address has its own `localStorage`. In the
developer tools, under Application → Service
workers, there is `sw.js` with a green dot: "activated and is running". Reload the page once: now the service worker
downloads the files, and stores them on the way. Then stop the preview in the terminal (++Ctrl++ + ++C++) and reload
the page: the list appears just the same, although nothing serves it. That is the service worker's work. Afterwards,
start the development server again (`npm run dev`).
:::

:::mistake Common mistake
Putting `sw.js` into `src` instead of `public`. From `src`, Vite takes into the finished site only what the code
imports, and bundles and renames even that, so there is no `sw.js` next to the finished site. The preview then sends
the page's HTML instead of `sw.js`, and the registration fails; the console says: "The script has an unsupported MIME
type ('text/html')".
:::

:::try Try it
In the developer tools, under Application → Cache storage, you can open the `shopping-list-v1` cache: every file the
service worker stored is lined up there, from the page's HTML through the JavaScript to the icon.
:::

### An installable app: the manifest

The last step: the list should be installable like an app, with its own icon and no address bar. For that the browser
has to know the app's name, icon and colours. These are described in the [[web app manifest]]: a small JSON file.
Create the `public/manifest.webmanifest` file:

```json file=public/manifest.webmanifest
{
  "name": "Shopping List",
  "short_name": "Shopping",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#f7f8fa",
  "theme_color": "#017b6b",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- `name` is the full name, `short_name` is what fits under the icon on a phone's home screen.
- `start_url` is the address the installed app opens; `./` is the page next to the manifest, that is, the list.
- `"display": "standalone"` asks for a window of its own, without an address bar and buttons, like a real app.
- `background_color` shows for a moment while the app starts, and `theme_color` colours the browser's bars (for
  example the top bar of a phone).
- The icons came with the exercise, in the `public` folder; browsers expect these two sizes.

Finally `index.html` (in the project's root folder, not in `src`) says where the manifest is. Replace its content with
this:

```html file=index.html mark=6-9
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#017b6b" />
    <title>Shopping List</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

The exercise's empty icon (`href="data:,"`) is replaced by the basket `icon.svg` (that is what shows on the browser
tab); `lang="en"`, already there in the exercise, tells browsers and screen readers that the page is in English.
`theme-color` is the same colour as in the manifest: the browser can colour its bars with it even before the app is
installed. `<title>` is the name you see on the browser tab and on the window of the installed app.

:::check Check
The green basket icon appears on the browser tab. Stop the development server (++Ctrl++ + ++C++), run `npm run build`,
then `npm run preview` again, and open the address it prints. In the developer tools, under Application → Manifest,
there are the name "Shopping List", the two icons and the colours, with no error messages. In Chrome and Edge, an
install icon appears at the right end of the address bar: click it, and the list opens in a window of its own, without
an address bar. On a phone, when the site is at an `https://` address (see below), "Add to Home screen" in the
browser's menu does the same. Congratulations, your shopping list is ready!
:::

:::mistake Common mistake
Putting `manifest.webmanifest` or the icons into the `src` folder. The browser then cannot find them, Application →
Manifest shows an error, and no install icon appears. Everything the browser asks for directly, at a fixed address
(the manifest, the icons, the service worker), belongs in the `public` folder.
:::

:::concept Try it on your phone too
A service worker only works at a secure address: under `https://` or on `localhost`. If you start the preview with
`npm run preview -- --host` and open it on your phone at your computer's IP address (`http://192.168…`, the terminal
prints it in the "Network" line), the page works, but not offline, and it cannot be installed either. In lesson 1 you
saw how a site goes up on GitHub Pages: there it gets an `https://` address (remember the `base: './'` line in
`vite.config.js` from lesson 1), and you can install the list on your phone.
:::
