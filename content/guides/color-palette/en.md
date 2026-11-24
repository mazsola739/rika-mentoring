# What we build

A palette generator, the kind designers use: one click and five colors appear side by side. When you like one, you
lock it and keep rolling the others until the palette comes together; you copy the codes with a click and save the
best ones. On the way you learn how a color code is built, how React handles arrays in state (always through a copy,
never changed in place), how a harmonious palette comes together on the color wheel, and how to check that text is
readable on a color.

:::levels
- Five random colors at the click of a button, with hex codes and copying to the clipboard. | about 2 hours
- Locking colors, a new palette on the space bar, and favorites that survive a reload. | about 3 hours
- Harmonious palettes from the color wheel, contrast checks (WCAG), export as CSS variables and a shareable link. | about 3 hours
:::

**Before you start you need:** the first six lessons. We build most on "Password Generator" (lesson 3): random numbers,
the clipboard, `async` functions and a timer in an effect; and on "Flashcards" (lesson 6): the keyboard listener, the
updater function, copying arrays in state, `useLocalStorage` and a link that carries data in the address. Wherever we
use something from earlier, a sentence or two reminds you of it; everything new is explained step by step.

## Beginner level {level=1}

### Before you start

This lesson's exercise, a ready starting project, is the `lessons/07-color-palette/exercise` folder of the course
repository on GitHub (the "Exercise on GitHub" button above opens it). Step 0 of lesson 1 explains in detail how to get
it; here are the commands in short. In a terminal, in your work folder:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git    # the first time only
cp -r rika-mentoring/lessons/07-color-palette/exercise color-palette    # your own copy
```

If you already have the repository from an earlier lesson, skip `git clone`: run `git pull` in the `rika-mentoring`
folder instead (`cd rika-mentoring`, `git pull`, `cd ..`), and it brings the new lessons; then copy as above. (No git?
On the repository's GitHub page, choose **Code → Download ZIP**; lesson 1 shows this too.) You can also copy the folder
with your file manager: what matters is that your copy is called `color-palette` and sits outside the repository, so the
original stays untouched.

Open your copy, the `color-palette` folder, in your editor, and type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a light gray page with a white card at
the top, titled "Color Palette". Nothing else is on it yet: building the palette is your job.
:::

Leave the server running, and in a second terminal (the **+** button in the terminal panel) make your copy a git
repository with one commit, the starting point:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

As in the earlier lessons, `git restore .` now takes every file back to your last commit, and it is worth committing
after every step that works.

The exercise has two files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React and colors, not CSS, so this time
  you do not write styles: you only use the class names (`swatch`, `toolbar`, `favorites`, …) that the steps give you.
  Have a look inside anyway!

:::concept A quick recap
A [[component]] is a function that returns [[JSX]]. It gets data through its [[props]] and remembers things with
[[useState]]: when a state value changes, React draws it again. Work that happens outside drawing (a timer, an event
listener) goes into [[useEffect]], and whatever the effect starts, its [[cleanup function]] stops. If any of this feels
hazy, take another look at lessons 1–3.
:::

### Color codes: what does #FF8800 mean?

Every dot of your screen is made of three tiny lamps: a red, a green and a blue one. This is [[RGB]] (red, green,
blue). Each lamp can shine at a strength from 0 to 255, and your eye sees the three together as one color: 255, 136, 0
is orange (lots of red, some green, no blue), 0, 0, 0 is black and 255, 255, 255 is white.

On the web we usually write these three numbers as a [[hex code]]: `#FF8800`. After the `#` come three two-digit
numbers, red, green and blue in that order, written not in base ten but in [[base 16|hexadecimal number]]. In base 16
the digit after 9 is A, then B, C, D, E and F (10 to 15), and the left digit counts sixteens, the right one ones: `FF`
is 15 × 16 + 15 = 255, `88` is 8 × 16 + 8 = 136, and `00` is 0. Two such digits describe exactly 256 values, and the
three channels give 256 × 256 × 256, more than 16.7 million colors.

Let's write a function that makes a hex code from three numbers, and one that picks a random color. Create a
`colors.js` file in the `src` folder:

```js file=src/colors.js
// A random whole number from 0 to max - 1 (the same as in lesson 3).
export function randomInt(max) {
  return Math.floor(Math.random() * max)
}

// A number from 0 to 255 as two hexadecimal digits: 10 → '0a', 255 → 'ff'.
function toHex(value) {
  return Math.round(value).toString(16).padStart(2, '0')
}

// A hex code from the three channels (red, green, blue, each 0–255): 255, 136, 0 → '#FF8800'.
export function rgbToHex(red, green, blue) {
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase()
}

// A completely random color.
export function randomHex() {
  return rgbToHex(randomInt(256), randomInt(256), randomInt(256))
}
```

- `toString(16)` writes a number in base 16: `(255).toString(16)` gives `'ff'`, and `(10).toString(16)` gives `'a'`.
- `padStart(2, '0')` adds zeros to the front until the text is two characters long: `'a'` becomes `'0a'`. Without it
  the code of 10, 0, 0 would be `#a00`, which means something quite different in CSS.
- `Math.round` rounds. For now it only gets whole numbers, but in the advanced level fractions arrive too.
- The text between backticks is a [[template literal]], which you know from lesson 1: the value of the expression in
  `${…}` takes its place. At the end, `toUpperCase()` turns it into capitals, because `#FF8800` is easier to read than
  `#ff8800` (the browser does not mind either way).
- `toHex` has no `export` in front of it: only this file uses it, so it is not visible from outside.

Now show a color on the page. Change `src/App.jsx` to this (the highlighted lines are new):

```jsx file=src/App.jsx mark=1,5,10-12
import { randomHex } from './colors.js'
import './App.css'

function App() {
  const color = randomHex()

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="swatch" style={{ background: color }}>
        <span className="swatch__hex">{color}</span>
      </div>
    </main>
  )
}

export default App
```

You met the `style` prop on the progress bar in lesson 6: it gives an element its style straight from JSX. It does not
take a piece of text as in HTML, but a JavaScript [[object]]: the outer curly braces mean "JavaScript comes here", the
inner ones are the object itself, `{ background: color }`. This is an [[inline style]]. It is useful when a value, like
the color here, is only decided while the page runs; every other style stays in `App.css`. When a CSS property name has
a hyphen, here it is written as one word with a capital letter: `background-color` becomes `backgroundColor`.

:::check Check
A big colored rectangle appears under the title, with its code on a white label at the bottom, for example `#3FA2C7`.
Reload the page (++F5++): you get a different color every time.
:::

:::mistake Common mistake
`style="background: red"`, as you would write it in HTML. React throws an error, the page goes blank, and the console
(++F12++ → Console) says: "The `style` prop expects a mapping from style properties to values, not a string". In JSX,
`style` is always an object: `style={{ background: 'red' }}`.
:::

:::try Try it
Change the `randomHex()` call to `rgbToHex(255, 136, 0)` (and import `rgbToHex` in the first line too): it turns
orange, with the code `#FF8800`. Try `0, 0, 0`, `255, 255, 255` and `0, 0, 255` as well, then put it back.
:::

### Five colors in an array

A palette needs five colors. Instead of five separate variables, we put them in an [[array]]. An array is a numbered
list, for example `['#3FA2C7', '#F0C808', '#DD1C1A', '#086788', '#FFF1D0']`. Add this function to the end of
`src/colors.js`:

```js file=src/colors.js
// Five random colors in an array, for example ['#3FA2C7', '#F0C808', …].
export function randomPalette() {
  const colors = []
  for (let i = 0; i < 5; i++) {
    colors.push(randomHex())
  }
  return colors
}
```

It is the same pattern as in lesson 3's password generator: an empty array, a `for` [[loop]] that runs five times, and
`push`, which adds a new color to the end of the array in every round.

Each color gets a component of its own. Create a `components` folder in `src`, and a `Swatch.jsx` file in it (a swatch
is a color sample, like the little color cards in a paint shop):

```jsx file=src/components/Swatch.jsx
// One color of the palette: its background is the color itself, with its code on top.
function Swatch({ hex }) {
  return (
    <li className="swatch" style={{ background: hex }}>
      <span className="swatch__hex">{hex}</span>
    </li>
  )
}

export default Swatch
```

`App` draws every color with the array's `map` method, the way you listed your skills in lesson 1:

```jsx file=src/App.jsx mark=1,2,6,11-15
import { randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import './App.css'

function App() {
  const colors = randomPalette()

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <ul className="swatches">
        {colors.map((hex, index) => (
          <Swatch key={index} hex={hex} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

- `map` does something with every item of the array and gives back a new array of the results: here, five `<Swatch>`
  components. Its second parameter, `index`, tells which item we are at (counting from 0).
- The [[key]] helps React tell the items of a list apart when the list changes. In lesson 1 the name of the skill was
  the key. Here the `index` is a good key too, because the five places never change order and none of them ever
  disappears: the first swatch always stays the first, only its color changes. (When items can be deleted from a list,
  the index is no longer a good key; you will see why with the favorites.)
- Thanks to `<ul>` and `<li>`, the palette is a real list: a screen reader announces "list, 5 items".

:::check Check
Five colored columns stand side by side, each with its own code at the bottom (on a phone, five bands one below the
other). Every reload brings five new colors.
:::

:::mistake Common mistake
Leaving out `key={index}`. The page works, but the console shows a warning: "Each child in a list should have a unique
"key" prop." Every list item made with `map` needs a key.
:::

:::try Try it
Change the 5 in `randomPalette` to 8: you get eight narrower columns, the CSS lays out any number. Then change it back
to 5, because the later steps count on five colors.
:::

### A new palette at the click of a button

So far only a reload brings new colors. A value that changes while the page is in use is [[state]], and that needs
`useState`. This time the state is not a number or a piece of text, but a whole array:

```jsx file=src/App.jsx mark=1,7,9-11,16-20
import { useState } from 'react'
import { randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)

  function generate() {
    setColors(randomPalette())
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          New palette
        </button>
      </div>

      <ul className="swatches">
        {colors.map((hex, index) => (
          <Swatch key={index} hex={hex} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

- `useState(randomPalette)` gets the function itself, without parentheses. This is the
  [[lazy initial value|lazy initial state]] from lessons 2 and 3: React calls the function only once, on the first
  render, to get the starting palette.
- `generate` gives `setColors` a brand-new array. That is how React knows the state has changed, and it draws `App`
  again with the five new colors.
- The button gets two classes, separated by a space: `button` is the basic style, `button--primary` fills it in.

:::check Check
A green "New palette" button appears under the title. Every click replaces all five colors and all five codes.
:::

:::mistake Common mistake
Keeping the old `const colors = randomPalette()` line next to the new `useState` one. The page goes blank and Vite
reports an error: the name `colors` "has already been declared". Inside one function, a name can be created only once.
:::

:::try Task
Next to "New palette", add a second button labeled "Black and white" that sets this palette:
`['#000000', '#444444', '#888888', '#CCCCCC', '#FFFFFF']`. You need a second function that gives this array to
`setColors`. Once it works, delete it: in the next steps, what goes into the array changes.
:::

### Copying to the clipboard

The palette becomes a useful tool when you can paste the codes into your own CSS or a drawing program. In lesson 3 you
already wrote to the clipboard with the browser's [[Clipboard API]]: `navigator.clipboard.writeText(text)` returns a
[[Promise]], which `await` waits for inside an [[async function]], and [[try/catch]] catches the error if the browser
does not allow copying.

There, the button itself showed that it worked. This time there will be one shared message bar at the bottom of the
screen, because later we copy other things too: in the advanced level, the whole palette as CSS and a shareable link.
They all use the same `copy` function and the same message, so these live in `App`.

First the swatch: its code becomes a button that calls the `onCopy` prop when clicked. Replace the contents of
`src/components/Swatch.jsx` with this:

```jsx file=src/components/Swatch.jsx mark=1,2,5-12
// One color of the palette: its background is the color itself; click the code to copy it.
function Swatch({ hex, onCopy }) {
  return (
    <li className="swatch" style={{ background: hex }}>
      <button
        type="button"
        className="swatch__hex"
        onClick={onCopy}
        aria-label={`Copy ${hex}`}
      >
        {hex}
      </button>
    </li>
  )
}

export default Swatch
```

The `aria-label` is for screen readers: the button's text is only a code, but this way they hear "Copy #3FA2C7,
button".

Now `App`. Here is the whole file as it looks at the end of the beginner level:

```jsx file=src/App.jsx mark=1,8,10-16,22-29,42,46-48
import { useEffect, useState } from 'react'
import { randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')

  // The message disappears by itself after two seconds.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Cleanup: if a new message comes in the meantime, the old timer stops.
    return () => clearTimeout(timer)
  }, [message])

  function generate() {
    setColors(randomPalette())
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Copied to clipboard: ${text}`)
    } catch {
      setMessage('The browser did not allow copying.')
    }
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          New palette
        </button>
      </div>

      <ul className="swatches">
        {colors.map((hex, index) => (
          <Swatch key={index} hex={hex} onCopy={() => copy(hex)} />
        ))}
      </ul>

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

- `copy` gets a piece of text, writes it to the clipboard, and says what happened in the `message` state.
- The effect is familiar from lesson 3: when there is a message, it starts a timer that sets it back to empty text two
  seconds later. If a new message comes in the meantime, the [[cleanup function]] stops the old timer and the effect
  starts a new one.
- `onCopy={() => copy(hex)}` gives every swatch a small [[arrow function]] of its own that remembers its color. The
  `Swatch` does not know what happens after the click: it only reports that it was clicked.
- With `role="status"`, screen readers read the message out when it changes. While it is empty, the CSS hides it.

:::check Check
Click a code: a dark bar appears at the bottom saying "Copied to clipboard: #3FA2C7", and disappears two seconds later.
Paste it (++Ctrl++ + ++V++) into your editor: there is the code. The beginner level is done: commit it!
:::

:::mistake Common mistake
Nothing happens when you click a code, and there is no error either. Almost always, `onCopy={() => copy(hex)}` is
missing from `App`: the `Swatch`'s `onCopy` prop is `undefined`, and the button silently does nothing. When a component
expects a new prop, you have to pass it where the component is used, too.
:::

:::try Try it
Change the timer from 2000 to 5000 and copy two different codes quickly, one after the other. The second message stays
for the full five seconds: the cleanup stopped the first timer, and the effect started a new one. Then change it back.
:::

## Intermediate level {level=2}

### Locking colors

Often you already like one or two colors, just not the rest. A locked color stays when you ask for a new palette. For
that, every color has to know two things about itself: its code, and whether it is locked. So from now on, the array
holds [[objects|object]] instead of strings:

```js
[
  { hex: '#3FA2C7', locked: false },
  { hex: '#F0C808', locked: true },
  { hex: '#DD1C1A', locked: false },
  // … and two more
]
```

At the end of `src/colors.js`, replace the `randomPalette` function with these two:

```js file=src/colors.js mark=1,5,10-13
// Five random colors. Each one is an object: its code, and whether it is locked.
export function randomPalette() {
  const colors = []
  for (let i = 0; i < 5; i++) {
    colors.push({ hex: randomHex(), locked: false })
  }
  return colors
}

// A new palette from the old one: locked colors stay, the others are replaced.
export function nextPalette(colors) {
  return colors.map((color) => (color.locked ? color : { hex: randomHex(), locked: false }))
}
```

`nextPalette` makes a new palette from the old one. For every color, `map` asks: is it locked? If it is, it returns the
color unchanged; if not, it puts a new object with a random color in its place. `condition ? this : that` is the
[[ternary operator]] from lesson 3. The result is a **new** array; `map` does not touch the old one.

From now on the swatch gets a whole `color` object, and a lock button goes on top. Replace the contents of
`src/components/Swatch.jsx`:

```jsx file=src/components/Swatch.jsx mark=1,2,4-13,18,20
// One color of the palette: the lock at the top, the code at the bottom (click it to copy).
function Swatch({ color, onCopy, onToggleLock }) {
  return (
    <li className="swatch" style={{ background: color.hex }}>
      <button
        type="button"
        className="swatch__lock"
        aria-pressed={color.locked}
        aria-label={`Lock ${color.hex}`}
        onClick={onToggleLock}
      >
        {color.locked ? '🔒' : '🔓'}
      </button>
      <button
        type="button"
        className="swatch__hex"
        onClick={onCopy}
        aria-label={`Copy ${color.hex}`}
      >
        {color.hex}
      </button>
    </li>
  )
}

export default Swatch
```

`aria-pressed`, as on the theme buttons in lesson 2, tells screen readers that this button can be switched on and off,
and whether it is on right now. A screen reader says "Lock #3FA2C7, toggle button, pressed", and the CSS uses it too: a
pressed lock gets a frame. 🔒 and 🔓 are emoji, text just like letters.

And `App`:

```jsx file=src/App.jsx mark=2,19,22-25,46-52
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')

  // The message disappears by itself after two seconds.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Cleanup: if a new message comes in the meantime, the old timer stops.
    return () => clearTimeout(timer)
  }, [message])

  function generate() {
    setColors(nextPalette(colors))
  }

  function toggleLock(index) {
    // A new array: a new object at the clicked place, the old items everywhere else.
    setColors(colors.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)))
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Copied to clipboard: ${text}`)
    } catch {
      setMessage('The browser did not allow copying.')
    }
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          New palette
        </button>
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

The heart of it is `toggleLock`. Only one field of one color has to change, yet a whole new array is made: `map` goes
through the colors, gives a new object for the clicked one (`i === index`), and the old object for all the others. The
new object is made with the [[spread]] syntax from lesson 3: `{ ...color, locked: !color.locked }` copies the old
object and overwrites its `locked` with the opposite.

:::concept Why can't we just change it?
This looks like the obvious way:

```jsx
colors[index].locked = true
setColors(colors)
```

But nothing happens. React decides whether the state has changed by checking whether it got back **the same array**.
Here it does, only changed on the inside, so React sees no change and does not draw again. (The lock flips later, when
something else makes React draw, which is even worse: unpredictable.) That is why arrays and objects in state are never
changed in place: we always make a new copy with the change in it. This is the [[immutable update]] you met in
lesson 6. `map`, `filter` and the spread syntax (`...`) give a new array or object, so we use them; `push`,
`colors[0] = …` and `color.locked = …` change the old one. (In `randomPalette` we can still use `push`, because there
we fill a brand-new array that is not in state yet.)
:::

:::check Check
A 🔓 appears at the top of every color. Click the one on the second color: it becomes 🔒 and gets a frame. Press "New
palette": the second color stays, the others change. Unlock it, and on the next click it changes too.
:::

:::mistake Common mistake
Somewhere in `Swatch`, `hex` is left where `color.hex` should be. The page goes blank and the console says "hex is not
defined". From now on the swatch only gets `color`: the code is `color.hex`, the lock is `color.locked`.
:::

:::try Task
Lock all five colors and ask for a new palette: nothing changes. Add an "Unlock all" button to the toolbar (the
`<div>` with the `toolbar` class). The pattern is the same as in `toggleLock`, except that every color gets a new
object:
`colors.map((color) => ({ ...color, locked: false }))`. (The round brackets around the object are there so that
JavaScript does not mistake the curly braces for the body of the function.)
:::

### A new palette on the space bar

Clicking with the mouse is slow; in palette generators the space bar is the usual shortcut. For that, the page has to
listen to the keyboard.

In lesson 6 you already turned the cards with the arrow keys: whenever a key is pressed, the browser fires a `keydown`
[[keyboard event]], and the event object tells which key it was. There you looked at `event.key`, the key's meaning in
the current layout (`'ArrowRight'`, `'a'`, and `' '` for the space bar). This time we use `event.code`: the key's place
on the keyboard (`'Space'`, `'KeyA'`, `'Enter'`), so it does not depend on the keyboard layout.

The space bar has to work even when the focus is not on the palette (the focus is on the element that receives the
keys, for example the button you clicked last), so we listen to the whole window:
`window.addEventListener('keydown', …)`. The window is outside React's world, so an effect adds the listener and the
cleanup removes it, just like with the arrow keys in lesson 6 (or with `hashchange` in lesson 1 and the `change` event
of `matchMedia` in lesson 2). Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=18-28,31,36-38,57-59
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')

  // The message disappears by itself after two seconds.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Cleanup: if a new message comes in the meantime, the old timer stops.
    return () => clearTimeout(timer)
  }, [message])

  // Space for a new palette. The listener is added once, and the cleanup removes it.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault() // no page scroll, and no "click" on the focused button
      if (event.repeat) return // while the key is held down, only the first press counts
      setColors((current) => nextPalette(current))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function generate() {
    setColors((current) => nextPalette(current))
  }

  function toggleLock(index) {
    // A new array: a new object at the clicked place, the old items everywhere else.
    setColors((current) =>
      current.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)),
    )
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Copied to clipboard: ${text}`)
    } catch {
      setMessage('The browser did not allow copying.')
    }
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          New palette
        </button>
        <span className="toolbar__hint">
          or press <kbd>Space</kbd>
        </span>
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

Line by line:

- `if (event.code !== 'Space') return`: every other key is ignored.
- `event.preventDefault()`: familiar from the form in lesson 1 (it was there in lessons 4 and 6 too). It switches off
  the browser's [[default behavior]]: there the reload, here the two usual effects of the space bar. On its own, the
  space bar scrolls the page down, and if the focus is on a button (for example because you just clicked a lock), it
  presses that button too. We want neither: here the space bar means "new palette". (Anyone who moves to the buttons
  with ++Tab++ can still press them with ++Enter++.)
- `if (event.repeat) return`: while you hold a key down, the browser repeats `keydown` many times a second, and then
  `event.repeat` is true. Only the first press counts, otherwise the palette would flicker wildly.
- This time `setColors` does not get a finished array but a function: `(current) => nextPalette(current)`. The box
  below explains why.
- Because of the `[]` [[dependency array]], the effect runs only once: the listener is added once and stays there as
  long as `App` is on the page.

A small hint has also appeared next to the button: the `<kbd>` HTML element marks a key, and the CSS draws it as a
keycap.

:::concept The updater function again: always the latest state
The `handleKeyDown` function is made on the first render, and since the effect never runs again, that same copy keeps
listening. A function always sees the variables that were there where it was created; this is called a [[closure]].
If the listener said `setColors(nextPalette(colors))`, `colors` would stay the palette of the first render forever,
just as `index` stayed 0 in lesson 6: the space bar would always roll a new palette from that very first, unlocked
one, and ignore the locks.

The fix is the same as in lesson 6, the [[updater function]]: when `setColors` gets a function, React calls it with the
**current** state (that is `current`), and whatever the function returns becomes the new state. So the listener does
not need to know the palette: React tells it. It is a good habit to write it this way whenever the new state is worked
out from the old one, which is why `generate` and `toggleLock` got this form too.
:::

:::check Check
Press ++Space++: a new palette comes, and the page does not scroll. Lock a color and press ++Space++: the locked color
stays. Click a lock, then press ++Space++: the palette changes, but the lock does not switch back. If you hold the key
down, the palette changes only once.
:::

:::mistake Common mistake
`event.code !== 'space'`, in lower case. Then the condition is true for every key, the function always returns at the
very start, and the space bar scrolls the page or presses the focused button as before. The values of `event.code`
start with a capital: `'Space'`, `'Enter'`, `'KeyA'`.
:::

:::try Try it
Put this in the first line of `handleKeyDown`: `console.log(event.code, event.key)`. Open the console, click the page
and press some keys: ++A++, ++Shift++, ++Enter++, the arrows. You see that `code` is the key's place, and `key` its
meaning (for a letter, what it would type). Then delete the line.
:::

### Favorites

When a nice palette comes together, let's save it. The list of favorites is another array in state, and every
favorite is itself an array: the five color codes, for example `['#3FA2C7', '#F0C808', …]`. An array of arrays.

The list gets a component of its own. Create the file `src/components/Favorites.jsx`:

```jsx file=src/components/Favorites.jsx
// The saved palettes: each is a strip of colors that loads on click, with a remove button next to it.
function Favorites({ favorites, onLoad, onRemove }) {
  return (
    <section className="favorites">
      <h2>Favorites ({favorites.length})</h2>
      {favorites.length === 0 ? (
        <p className="favorites__empty">
          No saved palettes yet. When you like one, press “Save to favorites”.
        </p>
      ) : (
        <ul className="favorites__list">
          {favorites.map((favorite) => (
            <li key={favorite.join()} className="favorite">
              <button
                type="button"
                className="favorite__colors"
                aria-label={`Load ${favorite.join(', ')}`}
                onClick={() => onLoad(favorite)}
              >
                {favorite.map((hex, index) => (
                  <span key={index} style={{ background: hex }} />
                ))}
              </button>
              <button
                type="button"
                className="favorite__remove"
                aria-label={`Remove ${favorite.join(', ')}`}
                onClick={() => onRemove(favorite)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Favorites
```

- `favorites.length === 0 ? (…) : (…)` is [[conditional rendering]]: while there are no favorites, a short explanation
  appears, after that the list. It is always worth designing the empty state, so that visitors know what that part of
  the page is for.
- Every favorite is a button with five colored strips (`<span>`) in it; a click loads the palette. A small × button next
  to it removes it.
- `favorite.join(', ')` joins the items of the array into one piece of text, separated by a comma and a space: that is
  the label for screen readers.
- The key here is **not** the index. Favorites can be removed: if you remove the second one, the third becomes the
  second and every index shifts, and React would mix up which item is which. So the key is the palette itself as text,
  `favorite.join()` (without a parameter, `join` puts commas between the items). It is different for every favorite,
  because we never let the same palette be saved twice. For the colored strips, though, the index is fine: they never
  change places.

`App` gets a favorites state and three new functions:

```jsx file=src/App.jsx mark=4,10,12-14,56-69,94-98,100
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette } from './colors.js'
import Swatch from './components/Swatch.jsx'
import Favorites from './components/Favorites.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useState([])

  // These are worked out from the state on every render.
  const hexes = colors.map((color) => color.hex)
  const isSaved = favorites.some((favorite) => favorite.join() === hexes.join())

  // The message disappears by itself after two seconds.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Cleanup: if a new message comes in the meantime, the old timer stops.
    return () => clearTimeout(timer)
  }, [message])

  // Space for a new palette. The listener is added once, and the cleanup removes it.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault() // no page scroll, and no "click" on the focused button
      if (event.repeat) return // while the key is held down, only the first press counts
      setColors((current) => nextPalette(current))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function generate() {
    setColors((current) => nextPalette(current))
  }

  function toggleLock(index) {
    // A new array: a new object at the clicked place, the old items everywhere else.
    setColors((current) =>
      current.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)),
    )
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Copied to clipboard: ${text}`)
    } catch {
      setMessage('The browser did not allow copying.')
    }
  }

  function saveFavorite() {
    // A new array: the current palette first, the old favorites behind it.
    setFavorites((current) => [hexes, ...current])
  }

  function removeFavorite(favorite) {
    // A new array without the removed favorite.
    setFavorites((current) => current.filter((item) => item !== favorite))
  }

  function loadFavorite(favorite) {
    // The saved strings become color objects again, none of them locked.
    setColors(favorite.map((hex) => ({ hex, locked: false })))
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          New palette
        </button>
        <span className="toolbar__hint">
          or press <kbd>Space</kbd>
        </span>
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="button" onClick={saveFavorite} disabled={isSaved}>
          {isSaved ? 'Saved ✓' : 'Save to favorites'}
        </button>
      </div>

      <Favorites favorites={favorites} onLoad={loadFavorite} onRemove={removeFavorite} />

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

- `hexes` and `isSaved` are [[derived values|derived value]], like the strength in lesson 3: they are worked out from
  the state on every render, not stored separately. `some` is true if the condition is true for at least one item of
  the array: here, if any favorite is letter for letter the same as the current palette.
- `saveFavorite` gives a new array: `[hexes, ...current]`. As with `[...decks, newDeck]` in lesson 6, the [[spread]]
  works on arrays too: `...current` spreads every item of the old array into the new one, and the current palette goes
  in front of them. So the newest favorite comes first.
- `removeFavorite` makes a new array with `filter`. Only the items for which the condition is true get into it: every
  item that is not the removed favorite. Here `!==` does not compare the colors: it checks whether `item` and
  `favorite` are two different arrays. The favorite whose × you clicked is exactly the same item that is in the list,
  so only that one is left out.
- `loadFavorite` turns the strings back into objects. The round brackets around `({ hex, locked: false })` are there
  so that JavaScript sees the curly braces as an object, not as the body of the function. `{ hex }` is short for
  `{ hex: hex }`, like `return { theme, setTheme }` in lesson 2.
- The save button is `disabled` (it cannot be clicked) when the palette is already among the favorites, and its label
  says so too.

:::check Check
A "Save to favorites" button appears under the palette, and below it the "Favorites (0)" section with its
explanation. Save the palette: a colored strip appears, the number becomes 1, and the button turns gray and says
"Saved ✓". Ask for a new palette, save that too, then click the second strip: you get the first palette back, and the
button says "Saved ✓" again. The × removes a favorite. Now reload the page: the favorites are gone. The next step
fixes that.
:::

:::mistake Common mistake
`favorites.push(hexes)`, then `setFavorites(favorites)`. Nothing appears, because `push` changed the old array and React
got the same array back. It is the same trap as with the locks: always a new array.
:::

:::try Task
Keep at most 12 favorites: in `saveFavorite`, keep only the first 12 items of the new array, with `slice(0, 12)`, which
you know from lesson 5. `slice` gives a new array too, and leaves the old one alone.
:::

### Favorites that stay

State only lives while the page is open. In lesson 2 you saved the theme in the browser's [[localStorage]], and in
lesson 6 you wrote a `useLocalStorage` hook that does the same for any state. Now the favorites go in there.

`localStorage` can only store text, but the favorites are arrays. [[JSON]] is a text format that can describe arrays
and objects too: `JSON.stringify` turns the array into text (`'[["#3FA2C7","#F0C808",…]]'`), and `JSON.parse` turns it
back.

Create the file `src/useLocalStorage.js`. If you still have `src/useLocalStorage.js` from lesson 6, simply copy it here:
it is the same hook (a default export, with two parameters: the key and the starting value).

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Reads the saved value. With nothing saved, or nothing readable, it returns the starting value.
function readSaved(key, startValue) {
  try {
    const saved = localStorage.getItem(key)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // Storage switched off, or a broken save: we start from the starting value.
  }
  return startValue
}

// Works like useState, but the value survives a reload.
function useLocalStorage(key, startValue) {
  const [value, setValue] = useState(() => readSaved(key, startValue))

  // Every change is saved, as a string.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage is full or switched off: the app keeps working in memory.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

This is the [[custom hook]] from lesson 6. A short reminder of what it does:

- On the first render, `readSaved` checks whether there is a saved value under the key. If there is, `JSON.parse`
  turns it back; if there is none, or it is broken (for example, someone edited it by hand), we get `startValue`, the
  starting value.
- The effect saves the value after every change, turned into text with `JSON.stringify`.
- The hook returns the same pair as `useState`: the value and the function that sets it. The setter accepts an updater
  function just the same, so in `App` it is enough to add an import and change one line.
- In both places [[try/catch]] protects the code: the browser can block storage, and the page must still work then; it
  just does not remember.

At the top of `src/App.jsx`, import the hook and use it instead of the `useState` of the favorites. The rest of the
file stays as it was:

```jsx file=src/App.jsx mark=3,11
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette } from './colors.js'
import useLocalStorage from './useLocalStorage.js'
import Swatch from './components/Swatch.jsx'
import Favorites from './components/Favorites.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useLocalStorage('color-palette-favorites', [])
```

The key, `'color-palette-favorites'`, starts with the name of the lesson. This is needed because every project you run
on `localhost:5173` sees the same storage: this way this save never gets mixed up with what another lesson saved.

:::check Check
Save two palettes and reload the page: the favorites are still there. In the developer tools (++F12++), under
Application → Local storage → `http://localhost:5173`, you find the `color-palette-favorites` key, and its value is a
JSON text with the color codes. The intermediate level is done: commit it!
:::

:::mistake Common mistake
Leaving out `JSON.stringify` when saving. `localStorage` then turns the array into text by itself, but joined with
commas instead of as JSON: `#3FA2C7,#F0C808,…`. `JSON.parse` cannot read that, so on reload the `catch` branch runs
and the favorites start empty, as if you had never saved them.
:::

:::try Try it
Open the page in a second browser tab as well. Save a palette in one, then reload the other: it shows up there too,
because both tabs use the same storage.
:::

## Advanced level {level=3}

### HSL: colors on the color wheel

RGB suits the screen, but not so much a person. Tell me without thinking: what do you change in `#3FA2C7` to make the
same blue a little lighter? [[HSL]] describes the same color with three more human numbers:

- **H**ue: where the color sits on the [[color wheel]], from 0 to 360 degrees. 0° is red, 60° yellow, 120° green, 180°
  turquoise, 240° blue, 300° purple, and at 360° it is red again.
- **S**aturation: 0% is gray, 100% the most vivid.
- **L**ightness: 0% is black, 50% the pure color, 100% white.

CSS understands it directly, for example `hsl(200 70% 50%)`. We still need hex codes, though, because that is what we
show and what we copy. So a function converts HSL to RGB, and the existing `rgbToHex` makes the hex code from that.

There is a well-known formula for this conversion. You do not need to know it by heart (most developers look it up
when they need it); the comments say what it does: it cuts the color wheel into six slices of 60 degrees and mixes
the three channels differently in each slice. While we are at it, we pick the random colors in HSL too, so we can make
sure they are not faded, too dark or too light. Picking in RGB often gives muddy, almost black or almost white colors.

Here is the whole `src/colors.js`:

```js file=src/colors.js mark=6-9,21-41,43-46,48,50,51
// A random whole number from 0 to max - 1 (the same as in lesson 3).
export function randomInt(max) {
  return Math.floor(Math.random() * max)
}

// A random fraction between min and max.
function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

// A number from 0 to 255 as two hexadecimal digits: 10 → '0a', 255 → 'ff'.
function toHex(value) {
  return Math.round(value).toString(16).padStart(2, '0')
}

// A hex code from the three channels (red, green, blue, each 0–255): 255, 136, 0 → '#FF8800'.
export function rgbToHex(red, green, blue) {
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase()
}

// A hex code from HSL. h: 0–360 degrees on the color wheel; s and l: 0–100 percent.
export function hslToHex(h, s, l) {
  const light = l / 100
  // How much "color" fits into this lightness: most at 50%, less and less towards black and white.
  const chroma = (1 - Math.abs(2 * light - 1)) * (s / 100)
  // The second strongest channel: it depends on where h is within its 60-degree slice.
  const middle = chroma * (1 - Math.abs(((h / 60) % 2) - 1))
  // Every channel gets this much, so that the lightness comes out right.
  const base = light - chroma / 2
  // The six 60-degree slices of the color wheel: each mixes the channels in a different order.
  const slices = [
    [chroma, middle, 0], // 0–60°: red to yellow
    [middle, chroma, 0], // 60–120°: yellow to green
    [0, chroma, middle], // 120–180°: green to turquoise
    [0, middle, chroma], // 180–240°: turquoise to blue
    [middle, 0, chroma], // 240–300°: blue to purple
    [chroma, 0, middle], // 300–360°: purple to red
  ]
  const [red, green, blue] = slices[Math.floor(h / 60) % 6]
  return rgbToHex((red + base) * 255, (green + base) * 255, (blue + base) * 255)
}

// A random color in HSL: any hue, but not faded, and not too dark or too light.
function randomHsl() {
  return [randomInt(360), randomBetween(45, 85), randomBetween(32, 80)]
}

// A random color, from now on from the color wheel.
export function randomHex() {
  const [h, s, l] = randomHsl()
  return hslToHex(h, s, l)
}

// Five random colors. Each one is an object: its code, and whether it is locked.
export function randomPalette() {
  const colors = []
  for (let i = 0; i < 5; i++) {
    colors.push({ hex: randomHex(), locked: false })
  }
  return colors
}

// A new palette from the old one: locked colors stay, the others are replaced.
export function nextPalette(colors) {
  return colors.map((color) => (color.locked ? color : { hex: randomHex(), locked: false }))
}
```

- `randomBetween` is the sibling of `randomInt`, only it gives a fraction: saturation and lightness do not have to be
  whole numbers.
- `Math.abs` gives the absolute value of a number, that is, it drops the minus sign: `Math.abs(-0.4)` is `0.4`, and
  `Math.abs(0.4)` is `0.4` too.
- `slices[Math.floor(h / 60) % 6]` picks the slice the color is in: at 200 degrees, `Math.floor(200 / 60)` is 3, the
  slice that goes from turquoise towards blue. `%` is the remainder operator from lesson 3 ([[modulo]]): the `% 6` takes
  360 degrees back to 0.
- `const [h, s, l] = randomHsl()` unpacks an array into three variables. This is array [[destructuring]]: you do the
  same in every `useState` line, `const [colors, setColors] = …`.
- `randomHsl` is not exported either: it is only a helper inside this file.

:::check Check
Ask for a few new palettes: the colors are livelier, and the muddy, almost black and almost white colors are gone.
Everything else works as before: the locks, copying and the favorites too.
:::

:::mistake Common mistake
`hslToHex(200, 0.7, 0.5)`. Many formulas and libraries give saturation and lightness as numbers from 0 to 1, but here
they are percentages, from 0 to 100. A lightness of 0.5 is half a percent: almost black. If all your colors come out
nearly black, check this first.
:::

:::try Try it
In `randomHsl`, change the lightness limits to `75, 90`: pastel palettes come. If you set them to `15, 35`, you get
dark, night-time palettes. Then put them back.
:::

### Harmonious palettes

A random palette is sometimes a hit, more often a mess. The rules of [[color harmony]] use distances on the color
wheel to tell which colors look good together:

- **Analogous**: neighbors on the wheel (±20–40 degrees), for example greens and blues. Calm and unified.
- **Complementary**: a color and its partner opposite it (+180 degrees), for example blue and orange. Strong contrast.
- **Monochrome**: a single hue in different lightnesses. Elegant and restrained.

Each one starts from a base hue. If you have a locked color, the hue of the first locked one becomes the base hue, so
the others fit it; if not, we pick a random base hue. For that we have to be able to work out the hue from a hex code.

At the end of `src/colors.js`, replace the `nextPalette` function with this block:

```js file=src/colors.js
// Brings any angle back between 0 and 360 degrees: -20 → 340, 400 → 40.
function wrapHue(h) {
  return ((h % 360) + 360) % 360
}

// The three channels of a hex code: '#FF8800' → [255, 136, 0].
export function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

// Where is the color on the color wheel (0–360 degrees)? The strongest channel and the ratio of the other two tell.
export function hexToHue(hex) {
  const [red, green, blue] = hexToRgb(hex)
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  if (max === min) return 0 // gray: it has no hue
  let hue
  if (max === red) hue = (green - blue) / (max - min)
  else if (max === green) hue = 2 + (blue - red) / (max - min)
  else hue = 4 + (red - green) / (max - min)
  return wrapHue(hue * 60)
}

// Every harmony makes five [h, s, l] triples from the base hue.
const HARMONIES = {
  random: () => [randomHsl(), randomHsl(), randomHsl(), randomHsl(), randomHsl()],
  // Neighbors on the color wheel, from dark to light.
  analogous: (hue) => [
    [hue - 40, randomBetween(55, 75), 30],
    [hue - 20, randomBetween(55, 75), 44],
    [hue, randomBetween(55, 75), 56],
    [hue + 20, randomBetween(55, 75), 68],
    [hue + 40, randomBetween(55, 75), 82],
  ],
  // The base hue and its partner opposite it on the wheel (+180 degrees).
  complementary: (hue) => [
    [hue, randomBetween(55, 75), 28],
    [hue, randomBetween(55, 75), 48],
    [hue, randomBetween(30, 50), 82],
    [hue + 180, randomBetween(55, 75), 62],
    [hue + 180, randomBetween(60, 80), 42],
  ],
  // One hue in five lightnesses.
  monochrome: (hue) => [18, 34, 50, 66, 84].map((light) => [hue, randomBetween(45, 70), light]),
}

// A new palette in the chosen harmony. Locked colors stay,
// and if there is a locked color, the first one is the base hue.
export function nextPalette(colors, harmony) {
  const anchor = colors.find((color) => color.locked)
  const baseHue = anchor ? hexToHue(anchor.hex) : randomInt(360)
  const fresh = HARMONIES[harmony](baseHue)
  return colors.map((color, i) => {
    if (color.locked) return color
    const [h, s, l] = fresh[i]
    return { hex: hslToHex(wrapHue(h), s, l), locked: false }
  })
}
```

- `wrapHue` brings any angle back between 0 and 360: if the base hue is at 20 degrees, `20 - 40` is −20 degrees, which
  is 340 degrees on the wheel. The `+ 360` and the second `% 360` are there because of negative numbers: `-20 % 360`
  stays −20.
- `hexToRgb` turns the three pairs of a hex code back into numbers: `slice(1, 3)` cuts out the characters at positions
  1 and 2 (counting from 0; position 3 is left out), the two right after the `#` (`'FF'`), and `parseInt(…, 16)` reads
  it in base 16 (`255`).
- `hexToHue` finds the strongest channel, and from how the other two compare to it, works out where the color sits on
  the wheel. Understanding this one roughly is enough, too.
- `HARMONIES` is an object whose values are functions. Each one makes five `[h, s, l]` triples from the base hue.
  `HARMONIES[harmony]` picks one by name, and the `(baseHue)` after it calls it.
- `find` gives the first item of the array for which the condition is true, or `undefined` if there is none. That is
  how `anchor ? … : …` can decide: there is a locked color, or there is not.

The harmony picker will be four buttons, one of which can be pressed. Create the file
`src/components/HarmonyPicker.jsx`:

```jsx file=src/components/HarmonyPicker.jsx
// The harmonies to choose from: the keys are the same as in HARMONIES in colors.js.
const HARMONY_NAMES = {
  random: 'Random',
  analogous: 'Analogous',
  complementary: 'Complementary',
  monochrome: 'Monochrome',
}

function HarmonyPicker({ harmony, onChange }) {
  return (
    <div className="harmony" role="group" aria-label="Harmony">
      {Object.keys(HARMONY_NAMES).map((key) => (
        <button
          key={key}
          type="button"
          className="chip"
          aria-pressed={harmony === key}
          onClick={() => onChange(key)}
        >
          {HARMONY_NAMES[key]}
        </button>
      ))}
    </div>
  )
}

export default HarmonyPicker
```

`Object.keys(HARMONY_NAMES)` gives the keys of the object, `['random', 'analogous', 'complementary', 'monochrome']`,
and `map` makes a button from each, just like the checkboxes in lesson 3 (`Object.keys(LABELS).map(…)`).
`role="group"` and `aria-label` gather the buttons into a named group, so a screen reader tells what they are for.
`aria-pressed` works just like on the lock: the pressed button is drawn filled in.

In `App`, the harmony is one more piece of state. Here is the whole file:

```jsx file=src/App.jsx mark=6,13,27,33,37,40,43-47,90
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette } from './colors.js'
import useLocalStorage from './useLocalStorage.js'
import Swatch from './components/Swatch.jsx'
import Favorites from './components/Favorites.jsx'
import HarmonyPicker from './components/HarmonyPicker.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useLocalStorage('color-palette-favorites', [])
  const [harmony, setHarmony] = useState('random')

  // These are worked out from the state on every render.
  const hexes = colors.map((color) => color.hex)
  const isSaved = favorites.some((favorite) => favorite.join() === hexes.join())

  // The message disappears by itself after two seconds.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Cleanup: if a new message comes in the meantime, the old timer stops.
    return () => clearTimeout(timer)
  }, [message])

  // Space for a new palette. When the harmony changes, the cleanup removes the old listener and a new one replaces it.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault() // no page scroll, and no "click" on the focused button
      if (event.repeat) return // while the key is held down, only the first press counts
      setColors((current) => nextPalette(current, harmony))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [harmony])

  function generate() {
    setColors((current) => nextPalette(current, harmony))
  }

  function changeHarmony(newHarmony) {
    setHarmony(newHarmony)
    // newHarmony is needed: the harmony state still holds the old value here.
    setColors((current) => nextPalette(current, newHarmony))
  }

  function toggleLock(index) {
    // A new array: a new object at the clicked place, the old items everywhere else.
    setColors((current) =>
      current.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)),
    )
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Copied to clipboard: ${text}`)
    } catch {
      setMessage('The browser did not allow copying.')
    }
  }

  function saveFavorite() {
    // A new array: the current palette first, the old favorites behind it.
    setFavorites((current) => [hexes, ...current])
  }

  function removeFavorite(favorite) {
    // A new array without the removed favorite.
    setFavorites((current) => current.filter((item) => item !== favorite))
  }

  function loadFavorite(favorite) {
    // The saved strings become color objects again, none of them locked.
    setColors(favorite.map((hex) => ({ hex, locked: false })))
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          New palette
        </button>
        <span className="toolbar__hint">
          or press <kbd>Space</kbd>
        </span>
        <HarmonyPicker harmony={harmony} onChange={changeHarmony} />
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="button" onClick={saveFavorite} disabled={isSaved}>
          {isSaved ? 'Saved ✓' : 'Save to favorites'}
        </button>
      </div>

      <Favorites favorites={favorites} onLoad={loadFavorite} onRemove={removeFavorite} />

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

- From now on `nextPalette` takes two parameters, so every call to it gets the harmony too.
- `changeHarmony` asks for a new palette straight away, with `newHarmony`, because inside this function the `harmony`
  state still holds the old value (just like with the slider in lesson 3).
- `harmony` has been added to the dependency array of the keyboard effect. When it changes, React runs the cleanup
  (removes the old listener, which still knows the old harmony), then the effect again (adds a new one, which knows the
  new harmony).

:::check Check
Four buttons appear in the row of "New palette" (on a phone, below it): Random, Analogous, Complementary, Monochrome.
"Random" is filled in, because that is the starting value. Click "Analogous": the colors are neighbors on the color
wheel, from dark to light. "Complementary" gives two opposite hues, "Monochrome" five lightnesses of a single hue.
Choose "Monochrome", lock a color you like, and press ++Space++ a few times: lighter and darker versions of the locked
color keep coming.
:::

:::mistake Common mistake
Leaving `harmony` out of the dependency array of the keyboard effect. The buttons work fine, but the space bar keeps
giving random palettes, whatever you choose: the listener was made on the first render and only knows the harmony of
that moment. It is the same [[closure]] trap as with `colors` in the previous level. The updater function does not
help here: it only gives the latest value of `colors`, not of `harmony`. That is why `harmony` has to go into the
dependency array.
:::

:::try Task
Add a fifth harmony, the triad: three hues 120 degrees apart. This goes into the `HARMONIES` object of `colors.js`,
after the `monochrome` line:

```js
  triadic: (hue) => [
    [hue, 70, 45],
    [hue, 55, 75],
    [hue + 120, 65, 50],
    [hue + 240, 65, 50],
    [hue + 240, 55, 78],
  ],
```

And this goes into the `HARMONY_NAMES` object of `HarmonyPicker.jsx`: `triadic: 'Triad',`. That's all: the button and
the space bar both work with it.
:::

### Contrast checks (WCAG)

So far the code has sat on a white label, so that it is readable on any color. But the colors of a palette usually get
text on them, so it is good to know whether dark or light text reads better on a color, and how well.

[[WCAG]] (the Web Content Accessibility Guidelines, the international guidelines for accessible websites) gives the
measure for this: the [[contrast ratio]]. It goes from 1:1 (two identical colors) to 21:1 (black on white). For
normal-size text, level **AA** needs at least 4.5:1, and level **AAA** 7:1.

For the ratio we need the [[relative luminance]] of both colors: how light we see each one, from 0 (black) to 1
(white). Our eyes are not equally sensitive to the three colors: we see green as the lightest and blue as the darkest,
so the formula multiplies green by the biggest number. Add these to the end of `src/colors.js`:

```js file=src/colors.js
// The brightness of one channel (0–255) as the eye sees it (the WCAG formula).
function channelLuminance(value) {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

// Relative luminance: 0 is black, 1 is white. Green counts the most, blue the least.
export function luminance(hex) {
  const [red, green, blue] = hexToRgb(hex)
  return 0.2126 * channelLuminance(red) + 0.7152 * channelLuminance(green) + 0.0722 * channelLuminance(blue)
}

// The contrast ratio of two colors: from 1 (no difference) to 21 (black on white).
export function contrast(a, b) {
  const lighter = Math.max(luminance(a), luminance(b))
  const darker = Math.min(luminance(a), luminance(b))
  return (lighter + 0.05) / (darker + 0.05)
}

const DARK_INK = '#111111'
const LIGHT_INK = '#FFFFFF'

// Dark or light text: whichever is easier to read on this background.
export function readableInk(hex) {
  return contrast(hex, DARK_INK) >= contrast(hex, LIGHT_INK) ? DARK_INK : LIGHT_INK
}

// The WCAG level for normal-size text.
export function wcagLevel(ratio) {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'Low'
}
```

- `channelLuminance` turns the brightness of the screen into a number that is proportional to what the eye sees.
  `**` is the power operator, as in lesson 3's `2 ** 32`.
- `contrast` works from the luminance of the lighter and the darker color; the `+ 0.05` comes from the WCAG formula.
- `readableInk` tries both dark and light text, and returns the one with the higher contrast.

The swatch works out the color of its label and the contrast, and shows both. Replace the contents of
`src/components/Swatch.jsx`:

```jsx file=src/components/Swatch.jsx mark=1,3,5-7,10,28-30
import { contrast, readableInk, wcagLevel } from '../colors.js'

// One color of the palette: the lock at the top, the code and the contrast of the label at the bottom.
function Swatch({ color, onCopy, onToggleLock }) {
  // The label color and the contrast follow from the background: they need no state.
  const ink = readableInk(color.hex)
  const ratio = Math.floor(contrast(color.hex, ink) * 10) / 10

  return (
    <li className="swatch swatch--ink" style={{ background: color.hex, color: ink }}>
      <button
        type="button"
        className="swatch__lock"
        aria-pressed={color.locked}
        aria-label={`Lock ${color.hex}`}
        onClick={onToggleLock}
      >
        {color.locked ? '🔒' : '🔓'}
      </button>
      <button
        type="button"
        className="swatch__hex"
        onClick={onCopy}
        aria-label={`Copy ${color.hex}`}
      >
        {color.hex}
      </button>
      <span className="swatch__contrast">
        {wcagLevel(ratio)} · {ratio.toFixed(1)}:1
      </span>
    </li>
  )
}

export default Swatch
```

- `ink` and `ratio` are derived values again: they follow from the color and need no state.
- `ratio` is cut to one decimal place: after `* 10`, `Math.floor` (familiar from `randomInt`) cuts off the fraction,
  and `/ 10` divides back, so `4.5871…` becomes `4.5`. We cut instead of rounding because a ratio of 4.47 is still too
  little for AA: rounded, the label would say "Low · 4.5:1", which contradicts the 4.5 threshold. Cut, it says
  "Low · 4.4:1", so the number and the level always agree.
- `style` now gets two properties: the background is the color, and `color` (the text color) is the computed `ink`.
- The `swatch--ink` class is in `App.css`: it removes the white label, so the code and the lock both take the text
  color of the `<li>`, that is, `ink`.
- `toFixed(1)` always writes exactly one decimal place: `12` becomes `'12.0'`.

:::check Check
The white labels are gone: on dark colors the code is white, on light ones nearly black, and under it (on a phone,
next to it) are the level and the ratio, for example "AAA · 12.6:1". Most colors are AA or AAA. Ask for many
palettes: now and then a medium-light color shows "Low", with a ratio under 4.5. Only large, bold text should go on a
color like that.
:::

:::mistake Common mistake
`c ^ 2.4` instead of `c ** 2.4`. In JavaScript, `^` is not a power but a bit operation (exclusive or), which gives
meaningless results with fractions, without any error message. Nearly every swatch then gets a white label with
"Low · 1.4:1". For powers, always use `**`.
:::

:::try Try it
Change `DARK_INK` to `'#000000'`. Pure black gives a little more contrast than `#111111`, and that is just enough: on
any color, either black or white text reaches 4.58:1, so "Low" never shows up again.
:::

### Export as CSS variables

In lesson 2 you collected the colors of a page in [[CSS variables|CSS variable]]. That is exactly how a palette is
best carried over into a project:

```css
:root {
  --color-1: #3FA2C7;
  --color-2: #F0C808;
  --color-3: #DD1C1A;
  --color-4: #086788;
  --color-5: #FFF1D0;
}
```

Add this function to the end of `src/colors.js`:

```js file=src/colors.js
// The palette as CSS variables in a :root rule, one color per line.
export function toCssVariables(hexes) {
  const lines = hexes.map((hex, i) => `  --color-${i + 1}: ${hex};`)
  return [':root {', ...lines, '}'].join('\n')
}
```

- The second parameter of `map`, `i`, is the position from 0; the variable names count from 1, hence `i + 1`.
- `[':root {', ...lines, '}']` is a new array: the opening line first, the spread syntax unpacks every variable line in
  the middle, and the closing curly brace comes last.
- `join('\n')` joins the lines with line breaks: in a piece of text, `'\n'` means a new line.

`App` works out the CSS, shows it in a `<pre>` element (which keeps line breaks and indentation), and copies it with a
button. The message bar does not need the whole CSS, though, so `copy` gets a second, optional parameter: the label
that appears in the message. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=2,18,57,58,61,110-112,114
import { useEffect, useState } from 'react'
import { nextPalette, randomPalette, toCssVariables } from './colors.js'
import useLocalStorage from './useLocalStorage.js'
import Swatch from './components/Swatch.jsx'
import Favorites from './components/Favorites.jsx'
import HarmonyPicker from './components/HarmonyPicker.jsx'
import './App.css'

function App() {
  const [colors, setColors] = useState(randomPalette)
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useLocalStorage('color-palette-favorites', [])
  const [harmony, setHarmony] = useState('random')

  // These are worked out from the state on every render.
  const hexes = colors.map((color) => color.hex)
  const isSaved = favorites.some((favorite) => favorite.join() === hexes.join())
  const css = toCssVariables(hexes)

  // The message disappears by itself after two seconds.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Cleanup: if a new message comes in the meantime, the old timer stops.
    return () => clearTimeout(timer)
  }, [message])

  // Space for a new palette. When the harmony changes, the cleanup removes the old listener and a new one replaces it.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault() // no page scroll, and no "click" on the focused button
      if (event.repeat) return // while the key is held down, only the first press counts
      setColors((current) => nextPalette(current, harmony))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [harmony])

  function generate() {
    setColors((current) => nextPalette(current, harmony))
  }

  function changeHarmony(newHarmony) {
    setHarmony(newHarmony)
    // newHarmony is needed: the harmony state still holds the old value here.
    setColors((current) => nextPalette(current, newHarmony))
  }

  function toggleLock(index) {
    // A new array: a new object at the clicked place, the old items everywhere else.
    setColors((current) =>
      current.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)),
    )
  }

  // The label appears in the message. If the caller gives none, it is the text itself.
  async function copy(text, label = text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Copied to clipboard: ${label}`)
    } catch {
      setMessage('The browser did not allow copying.')
    }
  }

  function saveFavorite() {
    // A new array: the current palette first, the old favorites behind it.
    setFavorites((current) => [hexes, ...current])
  }

  function removeFavorite(favorite) {
    // A new array without the removed favorite.
    setFavorites((current) => current.filter((item) => item !== favorite))
  }

  function loadFavorite(favorite) {
    // The saved strings become color objects again, none of them locked.
    setColors(favorite.map((hex) => ({ hex, locked: false })))
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          New palette
        </button>
        <span className="toolbar__hint">
          or press <kbd>Space</kbd>
        </span>
        <HarmonyPicker harmony={harmony} onChange={changeHarmony} />
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="button" onClick={saveFavorite} disabled={isSaved}>
          {isSaved ? 'Saved ✓' : 'Save to favorites'}
        </button>
        <button type="button" className="button" onClick={() => copy(css, 'CSS variables')}>
          Copy CSS
        </button>
      </div>
      <pre className="export">{css}</pre>

      <Favorites favorites={favorites} onLoad={loadFavorite} onRemove={removeFavorite} />

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

`label = text` is a [[default parameter]]: if the caller gives no label, `label` is the same as `text`. So the call in
the swatches (`copy(color.hex)`) works unchanged, and after the "Copy CSS" button the message bar just says "Copied to
clipboard: CSS variables".

:::check Check
Under the buttons, a dark code block shows the palette as CSS, and it updates with every new palette. Click "Copy
CSS": the message says "Copied to clipboard: CSS variables". Paste it into a CSS file: five neat lines in a `:root`
rule.
:::

:::mistake Common mistake
`join()` instead of `join('\n')`. Without a parameter, `join` puts commas between the items, so the whole CSS ends up
on a single line full of commas, and the browser cannot read it.
:::

:::try Try it
Copy the CSS, paste it at the top of `src/index.css`, and add this to the end of the file:
`body { background: var(--color-5); }`. The page background becomes the fifth color of the palette. (This CSS is fixed;
it does not follow the palette. Delete it when you are done.)
:::

### A shareable link

Finally, let's share the palette: a link that opens exactly these five colors. In lesson 1 you switched pages with the
part of the address after `#`, the [[URL hash]], and in lesson 6 a whole deck was shared in it; now the palette goes
there:
`http://localhost:5173/#3FA2C7-F0C808-DD1C1A-086788-FFF1D0`. When only this part changes, the browser does not reload
the page, and the server never even sees it: everything stays in the browser.

Add these two functions to the end of `src/colors.js`:

```js file=src/colors.js
// The palette at the end of the address: ['#3FA2C7', '#F0C808', …] → '#3FA2C7-F0C808-…'
export function paletteToHash(hexes) {
  return '#' + hexes.map((hex) => hex.slice(1)).join('-')
}

// And back: five color codes from the end of the address. If there are not five valid codes, null.
export function paletteFromHash(hash) {
  const hexes = hash
    .slice(1)
    .split('-')
    .map((part) => '#' + part.toUpperCase())
  const valid = hexes.length === 5 && hexes.every((hex) => /^#[0-9A-F]{6}$/.test(hex))
  return valid ? hexes : null
}
```

- `paletteToHash` cuts the `#` off the front of the codes (`slice(1)`) and joins them with hyphens.
- `paletteFromHash` works backwards: it cuts off the `#`, `split('-')` cuts the text into pieces at the hyphens, and
  every piece gets its `#` back.
- Anyone can edit a link, so we check it: are there exactly five pieces, and is each one a valid code? `every` is true
  if the condition is true for **every** item of the array. The check is done by a [[regular expression]], a pattern
  for text: `/^#[0-9A-F]{6}$/` means "a `#` at the start, then exactly six characters from 0–9 and A–F, and that is the
  end". `test` tells whether the text matches it.

`App` uses them in two places: on start it reads the address, and after every change it writes the palette back into
the address. Here is the whole `src/App.jsx` as it looks at the end of the lesson:

```jsx file=src/App.jsx mark=2-8,15-20,23,32,54-57,132-134
import { useEffect, useState } from 'react'
import {
  nextPalette,
  paletteFromHash,
  paletteToHash,
  randomPalette,
  toCssVariables,
} from './colors.js'
import useLocalStorage from './useLocalStorage.js'
import Swatch from './components/Swatch.jsx'
import Favorites from './components/Favorites.jsx'
import HarmonyPicker from './components/HarmonyPicker.jsx'
import './App.css'

// The starting palette: from the address if we came from a shared link, random otherwise.
function initialColors() {
  const shared = paletteFromHash(window.location.hash)
  if (shared) return shared.map((hex) => ({ hex, locked: false }))
  return randomPalette()
}

function App() {
  const [colors, setColors] = useState(initialColors)
  const [message, setMessage] = useState('')
  const [favorites, setFavorites] = useLocalStorage('color-palette-favorites', [])
  const [harmony, setHarmony] = useState('random')

  // These are worked out from the state on every render.
  const hexes = colors.map((color) => color.hex)
  const isSaved = favorites.some((favorite) => favorite.join() === hexes.join())
  const css = toCssVariables(hexes)
  const hash = paletteToHash(hexes)

  // The message disappears by itself after two seconds.
  useEffect(() => {
    if (message === '') return
    const timer = setTimeout(() => setMessage(''), 2000)
    // Cleanup: if a new message comes in the meantime, the old timer stops.
    return () => clearTimeout(timer)
  }, [message])

  // Space for a new palette. When the harmony changes, the cleanup removes the old listener and a new one replaces it.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== 'Space') return
      event.preventDefault() // no page scroll, and no "click" on the focused button
      if (event.repeat) return // while the key is held down, only the first press counts
      setColors((current) => nextPalette(current, harmony))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [harmony])

  // The address always shows the current palette, so it can be shared at any time.
  useEffect(() => {
    history.replaceState(null, '', hash)
  }, [hash])

  function generate() {
    setColors((current) => nextPalette(current, harmony))
  }

  function changeHarmony(newHarmony) {
    setHarmony(newHarmony)
    // newHarmony is needed: the harmony state still holds the old value here.
    setColors((current) => nextPalette(current, newHarmony))
  }

  function toggleLock(index) {
    // A new array: a new object at the clicked place, the old items everywhere else.
    setColors((current) =>
      current.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)),
    )
  }

  // The label appears in the message. If the caller gives none, it is the text itself.
  async function copy(text, label = text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`Copied to clipboard: ${label}`)
    } catch {
      setMessage('The browser did not allow copying.')
    }
  }

  function saveFavorite() {
    // A new array: the current palette first, the old favorites behind it.
    setFavorites((current) => [hexes, ...current])
  }

  function removeFavorite(favorite) {
    // A new array without the removed favorite.
    setFavorites((current) => current.filter((item) => item !== favorite))
  }

  function loadFavorite(favorite) {
    // The saved strings become color objects again, none of them locked.
    setColors(favorite.map((hex) => ({ hex, locked: false })))
  }

  return (
    <main className="app">
      <h1>Color Palette</h1>
      <div className="toolbar">
        <button type="button" className="button button--primary" onClick={generate}>
          New palette
        </button>
        <span className="toolbar__hint">
          or press <kbd>Space</kbd>
        </span>
        <HarmonyPicker harmony={harmony} onChange={changeHarmony} />
      </div>

      <ul className="swatches">
        {colors.map((color, index) => (
          <Swatch
            key={index}
            color={color}
            onCopy={() => copy(color.hex)}
            onToggleLock={() => toggleLock(index)}
          />
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="button" onClick={saveFavorite} disabled={isSaved}>
          {isSaved ? 'Saved ✓' : 'Save to favorites'}
        </button>
        <button type="button" className="button" onClick={() => copy(css, 'CSS variables')}>
          Copy CSS
        </button>
        <button type="button" className="button" onClick={() => copy(window.location.href, 'link')}>
          Copy link
        </button>
      </div>
      <pre className="export">{css}</pre>

      <Favorites favorites={favorites} onLoad={loadFavorite} onRemove={removeFavorite} />

      <p className="toast" role="status">
        {message}
      </p>
    </main>
  )
}

export default App
```

- `initialColors` is the lazy initial value of `useState`: if there is a valid palette in the address, it starts from
  that, otherwise from a random one. It stands outside the component because it uses nothing from it.
- `hash` is a derived value, and the new effect writes it into the address whenever it changes, with
  [[history.replaceState]] from lesson 6 (there it took the shared deck out of the address): it changes the address
  without a reload and without adding a new entry to the history. We do not need its first two parameters, so we pass
  `null` and `''`. The third is the new address: when it starts with `#`, as `hash` does, only the part from the `#` on
  is replaced and the rest of the address stays.
- The dependency of the effect is `hash`, which is a string. Two strings are equal when they match letter for letter,
  so the effect only runs when the palette has really changed. The `hexes` array would be a poor dependency: it is a
  new array on every render, even when the same codes are in it, so the effect would run after every render.
- "Copy link" copies the whole address (`window.location.href`), palette included.

:::check Check
In the address bar, the palette follows `localhost:5173/`, for example `#3FA2C7-F0C808-…`, and it changes with every
new palette. Click "Copy link", open a new tab and paste the address: exactly this palette opens. Add an `x` to the end
of the address and open that in a new tab too: instead of a broken palette, you simply get a random one.
Congratulations, your palette generator is done!
:::

:::mistake Common mistake
`window.location.hash = hash` instead of `history.replaceState`. It changes the address too, but it adds a new entry
to the history for every palette: after thirty presses of the space bar, you have to click Back thirty times to leave
the page.
:::

:::try Task
If you paste a link into the tab where the app is already open, and only the part after `#` is different, the browser
does not reload the page, so the palette does not change either. Listen to the `hashchange` event in an effect (the way
you listened to the space bar, cleanup included), and if `paletteFromHash` gives a valid palette, set it with
`setColors`. Our own `replaceState` calls do not fire `hashchange`, so this listener only reacts to links coming from
outside.
:::
