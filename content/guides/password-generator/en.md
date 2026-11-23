# What we build

A password generator: drag a slider, choose which characters may appear, and the page makes a strong password that
you can copy with one click. On the way you learn how React handles form elements (a slider, checkboxes, radio
buttons, a text field), how a program makes random choices, and how a web page writes to the clipboard.

:::levels
- A password of the length you choose, a "New password" button and a "Copy" button. | about 2 hours
- Switches for lowercase letters, capitals, digits and symbols, and a strength meter. | about 2 hours
- Secure randomness with `crypto.getRandomValues`, pronounceable passwords, and a check against a list of leaked passwords. | about 3 hours
:::

**Before you start you need:** lesson 1, "Me, Myself & React" (components, props, JSX, `useState`, `useEffect`).
Everything else is explained here, step by step.

## Beginner level {level=1}

### Before you start

Download the lesson's **starter** (above: "Download starter"), unzip it, and open the `password-generator` folder in
your editor. If you did lesson 1, you already have Node.js and VS Code; if not, step 0 of lesson 1 shows how to install
them. Then type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white card in the middle of the page,
with the title "Password Generator".
:::

The starter has three files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so this time you do not
  write styles: you only use the class names (`generator`, `slider`, `choices`, …) that the steps give you. Have a look
  inside anyway!
- `src/commonPasswords.js`: a list of very common passwords. We need it only at the very end, in the advanced level.

Like in lesson 1, the folder is a git repository with one commit, the starting point: `git restore .` takes every file
back, and it is worth committing after every step that works.

:::concept A quick recap from lesson 1
A [[component]] is a function that returns [[JSX]], the HTML-like description of what should appear on the screen. A
component gets data from outside through its [[props]], and remembers things with [[useState]]: when a state value
changes, React draws the component again. If any of this feels unfamiliar, take another look at lesson 1; everything
new is explained here.
:::

### Random characters

A password is a row of characters picked at random. JavaScript's [[Math.random]] gives a random number from 0 up to 1
(0 can come up, 1 never), for example `0.7302…`. Multiply it by 62 and it falls between 0 and 62; [[Math.floor]] cuts
off the decimals, and you have a whole number from 0 to 61: the position of one character in a [[string]] of 62
characters (a string is a piece of text between quotes, like `'abc'`).

This logic has nothing to do with React, so it goes into a file of its own. Create a `generator.js` file in the `src`
folder:

```js file=src/generator.js
// Every character a password can contain (for now).
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// A random whole number from 0 to max - 1.
export function randomInt(max) {
  return Math.floor(Math.random() * max)
}

// A password of the given length, made of random characters.
export function generatePassword(length) {
  let password = ''
  for (let i = 0; i < length; i++) {
    password += CHARS[randomInt(CHARS.length)]
  }
  return password
}
```

`let` makes a variable that can get a new value later (one made with `const` can never be changed): `password` starts
as empty text and grows one character at a time. The `for` [[loop]] repeats its body `length` times: `i` starts at 0
and grows by one until it reaches `length`. `CHARS.length` is the number of characters in the string, 62. `CHARS[5]` is
the character at position 5 of the string (counting from 0), and `+=` adds it to the end of `password`, which gives
`password` a new value.

This time there is no `default` after `export`. This is a [[named export]]: a file can have several of them, and you
import them by name, in curly braces. Show a password on the page. Change `src/App.jsx` to this (the highlighted lines
are new or changed):

```jsx file=src/App.jsx mark=1,5,10-12
import { generatePassword } from './generator.js'
import './App.css'

function App() {
  const password = generatePassword(16)

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password">{password}</output>
      </section>
    </main>
  )
}

export default App
```

`<output>` is the HTML element for a result that the page has worked out.

:::check Check
A dark box shows 16 random letters and digits. Reload the page (++F5++): every time, a different password appears.
:::

:::mistake Common mistake
`Math.round` instead of `Math.floor`. Rounding can give 62, but the last character is at position 61: `CHARS[62]` is
`undefined`, and now and then the word "undefined" turns up in the middle of the password.
:::

:::try Try it
Change `CHARS` to `'0123456789'` and the length to 4: you have a PIN generator. Then set both back.
:::

### A new password at the click of a button

So far the password changes only when the page reloads. A button should make a new one, but changing an ordinary
variable is not enough for that: React does not notice it, and does not draw the page again. A value that changes while
the page is open is [[state]], and it needs `useState`:

```jsx file=src/App.jsx mark=1,6,8-10,16,19-23
import { useState } from 'react'
import { generatePassword } from './generator.js'
import './App.css'

function App() {
  const [password, setPassword] = useState(() => generatePassword(16))

  function regenerate() {
    setPassword(generatePassword(16))
  }

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password" aria-live="polite">
          {password}
        </output>
        <div className="generator__actions">
          <button type="button" onClick={regenerate}>
            New password
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
```

- `regenerate` is an [[event handler]]: a function that runs when something happens, here a click. `onClick={regenerate}`
  hands the function to the button, and React calls it on every click.
- `setPassword` stores the new password, and React draws `App` again with it.
- `useState` gets a function this time, `() => generatePassword(16)`, not a password. React calls such a function only
  once, at the very first drawing, to get the starting value. This is called a [[lazy initial state]] (lesson 1's
  `useHashRoute` started the same way: `useState(currentPath)`). With `useState(generatePassword(16))` a password would
  be generated at every drawing, and thrown away at once.
- `aria-live="polite"` asks screen readers to read out the new content of the box when it changes, so people who
  cannot see the screen hear the new password too.

:::check Check
Every click on "New password" shows a different password.
:::

:::mistake Common mistake
`onClick={regenerate()}`, with brackets. That calls the function at once, while the page is being drawn, and gives its
result to `onClick`. Here it also sets the state during drawing, so React draws the page again, which calls the
function again, and so on. In the end React stops with a "Too many re-renders" error. Hand over the function, do not
call it.
:::

:::try Task
Count the passwords you have made: a second state, `useState(0)`, that `regenerate` increases by one, and a line under
the box that shows it.
:::

### The length slider

The length should be adjustable with a slider: `<input type="range">`. In React we make it a [[controlled input]]: its
value comes from state, and every movement updates the state. You met this with the contact form of lesson 1; now the
input is a slider.

The slider gets a component of its own. Create a `components` folder inside `src`, with a `LengthSlider.jsx` file in
it:

```jsx file=src/components/LengthSlider.jsx
function LengthSlider({ value, onChange }) {
  return (
    <label className="slider">
      <span>
        Length: <strong>{value}</strong> characters
      </span>
      <input
        type="range"
        min="6"
        max="40"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

export default LengthSlider
```

The `onChange` of the `<input>` gets a small [[arrow function]]: React calls it at every movement of the slider, and
hands it the event (`event`). `event.target` is the slider itself, and `event.target.value` is where it stands now.
Every form element gives its value as **text** (`"16"`), even a slider, so `Number()` turns it into a number. Without
it, `"16" + 4` would give `"164"`, not 20.

The slider does not keep the length itself: it shows the `value` it receives, and reports every movement through the
`onChange` prop. Careful, there are two `onChange`s here: `<input onChange={…}>` listens to the browser's event, and the
`onChange` called inside the arrow function is our prop, a function that `App` gives. The length lives in `App`,
because the password needs it too. This is called [[lifting state up]]: the state lives in the nearest component that
contains everything that uses it. Data goes down through props, events come up through functions.

```jsx file=src/App.jsx mark=3,7,11,14-18,34
import { useState } from 'react'
import { generatePassword } from './generator.js'
import LengthSlider from './components/LengthSlider.jsx'
import './App.css'

function App() {
  const [length, setLength] = useState(16)
  const [password, setPassword] = useState(() => generatePassword(16))

  function regenerate() {
    setPassword(generatePassword(length))
  }

  function changeLength(newLength) {
    setLength(newLength)
    // Use newLength: the length state still holds the old value here.
    setPassword(generatePassword(newLength))
  }

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password" aria-live="polite">
          {password}
        </output>
        <div className="generator__actions">
          <button type="button" onClick={regenerate}>
            New password
          </button>
        </div>
      </section>

      <LengthSlider value={length} onChange={changeLength} />
    </main>
  )
}

export default App
```

Why does `changeLength` use `newLength`, and not `length`? `setLength` does not change `length` at once: the new value
arrives with the next drawing. Inside this function `length` is still the old number, but `newLength` is already in
our hands.

:::check Check
Drag the slider: the number above it and the length of the password change together. Click the slider and press ++←++
or ++→++: it moves one step at a time.
:::

:::mistake Common mistake
A `value` without `onChange`. React then holds the slider at the value in state, so it does not move at all, and the
console warns about a read-only field. A controlled input always needs both.
:::

:::try Task
Let the slider go from 8 to 64. Which two attributes do you change?
:::

### Copying to the clipboard

A password is only useful if you can paste it somewhere. The browser's [[Clipboard API]] writes text to the clipboard:
`navigator.clipboard.writeText(text)`. An [[API]] (application programming interface) is a set of functions through
which your code can use the services of another program, here the browser. `navigator` is the browser itself, and
`navigator.clipboard` is its clipboard.

Copying can take a moment, and it can fail, for example if the browser does not allow it. So `writeText` does not
answer at once: it returns a [[Promise]], a promise that the work will end, either successfully or with an error. In an
[[async function]] (one with `async` in front of it) `await` waits until the promise is kept, and [[try/catch]] catches
the error if it fails: when anything in `try` goes wrong, the code jumps into `catch`. The copy button gets a component
of its own too: create `src/components/CopyButton.jsx`.

```jsx file=src/components/CopyButton.jsx
import { useState } from 'react'

function CopyButton({ text }) {
  const [status, setStatus] = useState('idle') // 'idle', 'copied' or 'failed'

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  let label = 'Copy'
  if (status === 'copied') label = 'Copied!'
  if (status === 'failed') label = 'Copy failed'

  return (
    <button type="button" className="button--primary" onClick={copy}>
      {label}
    </button>
  )
}

export default CopyButton
```

The button remembers in its own state what happened, and the label follows the state. Put the button next to "New
password" in `App`. Here is the whole file, as it stands at the end of the beginner level:

```jsx file=src/App.jsx mark=4,29
import { useState } from 'react'
import { generatePassword } from './generator.js'
import LengthSlider from './components/LengthSlider.jsx'
import CopyButton from './components/CopyButton.jsx'
import './App.css'

function App() {
  const [length, setLength] = useState(16)
  const [password, setPassword] = useState(() => generatePassword(16))

  function regenerate() {
    setPassword(generatePassword(length))
  }

  function changeLength(newLength) {
    setLength(newLength)
    // Use newLength: the length state still holds the old value here.
    setPassword(generatePassword(newLength))
  }

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password" aria-live="polite">
          {password}
        </output>
        <div className="generator__actions">
          <CopyButton text={password} />
          <button type="button" onClick={regenerate}>
            New password
          </button>
        </div>
      </section>

      <LengthSlider value={length} onChange={changeLength} />
    </main>
  )
}

export default App
```

:::check Check
Click "Copy", then paste (++Ctrl++ + ++V++) into your editor or the browser's address bar: the password is there, and
the button says "Copied!".
:::

:::mistake Common mistake
Leaving out `await`. Then the code does not wait for the copying: "Copied!" appears even when it failed, and `catch`
never sees the error.
:::

:::concept When does copying fail?
The clipboard only works on secure pages: on `https://` addresses and on `localhost`. If you start the server with
`npm run dev -- --host` and open it on your phone through your computer's IP address (`http://192.168…`, the terminal
prints it under "Network"), `navigator.clipboard` does not exist, and the button says "Copy failed". Browsers also
allow writing to the clipboard only in answer to something the user did, such as a click: a page cannot quietly fill
your clipboard on its own.
:::

### Feedback that disappears

"Copied!" now stays on the button for good. It should turn back into "Copy" after a second and a half. Waiting is the
job of [[setTimeout]]: `setTimeout(fn, 1500)` calls the function `fn` after 1500 milliseconds.

But where do we start the timer? Not in the middle of drawing: drawing only describes the screen. Work outside
drawing, such as a timer, goes into [[useEffect]]. You met it in lesson 1: the `useHashRoute` hook used it to watch the
part of the address after the `#`.

```jsx file=src/components/CopyButton.jsx mark=1,6-12
import { useEffect, useState } from 'react'

function CopyButton({ text }) {
  const [status, setStatus] = useState('idle') // 'idle', 'copied' or 'failed'

  // 1.5 seconds after copying (or failing to), the status goes back to 'idle'.
  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 1500)
    // Clean up: if the button disappears before that, the timer is cancelled.
    return () => clearTimeout(timer)
  }, [status])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  let label = 'Copy'
  if (status === 'copied') label = 'Copied!'
  if (status === 'failed') label = 'Copy failed'

  return (
    <button type="button" className="button--primary" onClick={copy}>
      {label}
    </button>
  )
}

export default CopyButton
```

- `[status]` is the [[dependency array]]. It tells React when to run the effect: after the first drawing, and after
  every drawing in which `status` has changed.
- When the status becomes `'copied'` or `'failed'`, the effect starts a timer. A second and a half later the timer sets `'idle'`; the
  effect runs again, sees `'idle'`, and does nothing.
- The function that the effect returns is its [[cleanup function]]. React calls it before it runs the effect again,
  and when the component disappears from the page. Here it cancels the timer, so a forgotten timer never fires for a
  button that no longer exists.

:::check Check
Click "Copy": the button says "Copied!", and a second and a half later "Copy" again. The beginner level is done:
commit it!
:::

:::mistake Common mistake
An empty dependency array, `[]`. Then the effect runs only once, after the first drawing, while the status is still
`'idle'`, and never again: "Copied!" stays on the button forever.
:::

:::try Try it
Click "Copy", then "New password" straight away: the copy button still says "Copied!", although the new password is
not on the clipboard. Fix it in `App` with `<CopyButton key={password} text={password} />`. When the [[key]] changes,
React treats the button as a brand new one, with fresh state. The full listings of `App` from here on keep this `key`.
:::

## Intermediate level {level=2}

### Character sets with checkboxes

Now the user decides what goes into the password: lowercase letters, capitals, digits, symbols. Each switch is a
[[checkbox]], and their state is kept in an [[object]]. An object is a collection of values, each under a name (a key),
in curly braces: `{ lower: true, upper: true, digits: true, symbols: false }`. Here every key is the name of a set, and
its value says whether it is ticked.

First the generator: the character sets get names, and `generatePassword` receives which ones to use. Here is the
whole of `src/generator.js`:

```js file=src/generator.js
// The character sets the user can choose from.
export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
}

// A random whole number from 0 to max - 1.
export function randomInt(max) {
  return Math.floor(Math.random() * max)
}

// options says which sets to use, for example { lower: true, upper: false, … }.
export function generatePassword(length, options) {
  // Collect the chosen sets into an array…
  const sets = []
  for (const key of Object.keys(CHARSETS)) {
    if (options[key]) sets.push(CHARSETS[key])
  }
  // …and join them into one long string to pick from.
  const pool = sets.join('')

  let password = ''
  for (let i = 0; i < length; i++) {
    password += pool[randomInt(pool.length)]
  }
  return password
}
```

`Object.keys(CHARSETS)` lists the keys of the object, `['lower', 'upper', 'digits', 'symbols']`, and `for … of` walks
through them one by one. `options[key]` reads the value whose name is in `key`: when `key` is `'lower'`, it is the same
as `options.lower`. `sets.push(…)` adds an item to the end of the `sets` array, and `sets.join('')` glues the items of
the array into one string, with nothing (`''`) between them. `CHARS` is gone: `pool` has taken its place.

The checkboxes go into `src/components/CharsetOptions.jsx`:

```jsx file=src/components/CharsetOptions.jsx
const LABELS = {
  lower: 'Lowercase (a–z)',
  upper: 'Uppercase (A–Z)',
  digits: 'Digits (0–9)',
  symbols: 'Symbols (!@#…)',
}

function CharsetOptions({ options, onToggle }) {
  return (
    <fieldset className="choices">
      <legend>Characters to use</legend>
      {Object.keys(LABELS).map((key) => (
        <label key={key} className="choices__item">
          <input type="checkbox" checked={options[key]} onChange={() => onToggle(key)} />
          {LABELS[key]}
        </label>
      ))}
    </fieldset>
  )
}

export default CharsetOptions
```

Whether a checkbox is ticked is in `checked` (`true` or `false`), not in `value`. `<fieldset>` and `<legend>` put the
boxes into a group with a title, and a screen reader reads the title along with each box.

In `App` the options become state too. Careful: `generatePassword` now needs **two** arguments, so update all three
places that call it. In the code below, everything stays as it was where a comment starts with `…`, and so does
`export default App` at the end of the file.

```jsx file=src/App.jsx mark=1,4,8,9,12,17,20-25,31
import CharsetOptions from './components/CharsetOptions.jsx'
// … the other imports, as before

const START_OPTIONS = { lower: true, upper: true, digits: true, symbols: false }

function App() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState(START_OPTIONS)
  const [password, setPassword] = useState(() => generatePassword(16, START_OPTIONS))

  function regenerate() {
    setPassword(generatePassword(length, options))
  }

  function changeLength(newLength) {
    setLength(newLength)
    setPassword(generatePassword(newLength, options))
  }

  function toggleOption(key) {
    // A copy of the options with one key flipped (true becomes false, and back).
    const newOptions = { ...options, [key]: !options[key] }
    setOptions(newOptions)
    setPassword(generatePassword(length, newOptions))
  }

  return (
    <main className="generator">
      {/* … the title and the password box, as before … */}
      <LengthSlider value={length} onChange={changeLength} />
      <CharsetOptions options={options} onToggle={toggleOption} />
    </main>
  )
}
```

`{ ...options, [key]: !options[key] }` is the [[spread]] from lesson 1's contact form: it copies the old object and
overwrites one key in it. `[key]` in square brackets means "the key whose name is in the `key` variable", and `!` turns
`true` into `false` and back. As always, we do not change the state itself, we give `setOptions` a new object.

:::check Check
Untick "Uppercase": the password has no capitals any more. Tick "Symbols": `!`, `#`, `%` and friends appear.
:::

:::mistake Common mistake
A blank page, or the "New password" button and the slider do not give a new password; and in the console (++F12++)
"Cannot read properties of undefined (reading 'lower')". One call still passes only the length, for example
`generatePassword(16)` instead of `generatePassword(16, START_OPTIONS)`, so `options` is `undefined` inside the
function.
:::

:::try Task
Add a fifth set of your own, for example `'áéíóöőúüű'` for accented letters. Three places need it: `CHARSETS`, `LABELS`
and `START_OPTIONS`.
:::

### Two sensible rules

Play with the boxes, and you will find two problems:

1. You can untick every box. Then `pool` is empty, there is nothing to pick from, and the password becomes
   "undefinedundefined…".
2. Even with all four boxes ticked, a 6-character password may have no digit at all: it is down to chance.

First rule: the last ticked box cannot be switched off. An input with the `disabled` attribute cannot be clicked.

```jsx file=src/components/CharsetOptions.jsx mark=9-10,20
const LABELS = {
  lower: 'Lowercase (a–z)',
  upper: 'Uppercase (A–Z)',
  digits: 'Digits (0–9)',
  symbols: 'Symbols (!@#…)',
}

function CharsetOptions({ options, onToggle }) {
  // How many boxes are ticked? The last one has to stay on.
  const checkedCount = Object.values(options).filter((on) => on).length

  return (
    <fieldset className="choices">
      <legend>Characters to use</legend>
      {Object.keys(LABELS).map((key) => (
        <label key={key} className="choices__item">
          <input
            type="checkbox"
            checked={options[key]}
            disabled={options[key] && checkedCount === 1}
            onChange={() => onToggle(key)}
          />
          {LABELS[key]}
        </label>
      ))}
    </fieldset>
  )
}

export default CharsetOptions
```

`Object.values` gives the values of the object (`[true, true, true, false]`), `filter` keeps the ones that are `true`,
and `length` counts them. A box is disabled when it is ticked **and** it is the only one.

Second rule: we first pick one character from every chosen set, then fill up the rest from the whole pool. At the end
we shuffle, otherwise the guaranteed characters would always stand at the front, in the same order. Replace
`generatePassword` in `src/generator.js`:

```js file=src/generator.js mark=10-15,17-24
export function generatePassword(length, options) {
  // Collect the chosen sets into an array…
  const sets = []
  for (const key of Object.keys(CHARSETS)) {
    if (options[key]) sets.push(CHARSETS[key])
  }
  // …and join them into one long string to pick from.
  const pool = sets.join('')

  // One character from every chosen set, so each of them really appears…
  const chars = sets.map((set) => set[randomInt(set.length)])
  // …and the rest from the whole pool.
  while (chars.length < length) {
    chars.push(pool[randomInt(pool.length)])
  }

  // Shuffle (Fisher–Yates), so the guaranteed characters can end up anywhere.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    const temp = chars[i]
    chars[i] = chars[j]
    chars[j] = temp
  }
  return chars.join('')
}
```

The password is now built in an [[array]] (`chars`), because the items of an array can be swapped; at the end
`join('')` glues them into one string. `while` repeats its body as long as its condition is true. The
[[Fisher–Yates shuffle]] walks from the last position to the first, and swaps each item with a randomly chosen one from
the part that is not shuffled yet (itself included). The swap needs `temp`: it puts the `i`-th item aside, the `j`-th
item goes in its place, and finally the item put aside goes to position `j`. This way every order has exactly the same
chance.

:::check Check
Untick boxes until one is left: it turns grey and stays ticked. Set the length to 6 and tick all four boxes: however
many times you click "New password", every password has a lowercase letter, a capital, a digit and a symbol.
:::

:::mistake Common mistake
The popular one-line shuffle, `chars.sort(() => Math.random() - 0.5)`. It looks random, but it is not even: `sort`
expects a comparison that always gives the same answer for the same two items. With a random one, some orders come up
far more often than others. For passwords, use Fisher–Yates.
:::

### The strength meter

How strong is a password? Roughly: how many guesses an attacker needs to try every possibility. With 62 possible
characters, a 1-character password has 62 possibilities, a 2-character one 62 × 62 = 3844, and every further character
multiplies by 62 again. These numbers get huge quickly, so we count them in [[bits|bit]] instead: every bit doubles the
number of guesses. This measure is the password's [[entropy]]: `length × log2(number of possible characters)`.

[[Math.log2]] tells you how many times you have to double 1 to reach a number: `Math.log2(64)` is 6, because
2 × 2 × 2 × 2 × 2 × 2 = 64. Add two functions to the end of `src/generator.js`:

```js file=src/generator.js
// Entropy in bits: length × log2(the number of characters to pick from).
export function entropy(length, options) {
  let poolSize = 0
  for (const key of Object.keys(CHARSETS)) {
    if (options[key]) poolSize += CHARSETS[key].length
  }
  return Math.round(length * Math.log2(poolSize))
}

// Turns bits into a level: 0 = weak, 1 = fair, 2 = strong, 3 = very strong.
export function strengthLevel(bits) {
  if (bits < 45) return 0
  if (bits < 65) return 1
  if (bits < 90) return 2
  return 3
}
```

The meter goes into `src/components/StrengthMeter.jsx`:

```jsx file=src/components/StrengthMeter.jsx
import { strengthLevel } from '../generator.js'

const NAMES = ['Weak', 'Fair', 'Strong', 'Very strong']

function StrengthMeter({ bits }) {
  const level = strengthLevel(bits)

  return (
    <div className={`strength strength--${level}`}>
      <span className="strength__bars" aria-hidden="true">
        {NAMES.map((name, i) => (
          <span key={name} className={i <= level ? 'is-on' : ''} />
        ))}
      </span>
      <strong>{NAMES[level]}</strong>
      <span className="strength__bits">about {bits} bits</span>
    </div>
  )
}

export default StrengthMeter
```

The file is in the `components` folder, so `'../generator.js'` first steps up one folder (`..`) to `src`.

There are four bars. The second parameter of `map`, `i`, tells which bar we are at (counting from 0).
`i <= level ? 'is-on' : ''` is the [[ternary operator]]: `condition ? this : that` is an `if … else` that gives a value.
Here: if the bar's position is not above the level, it gets the `is-on` class and lights up; otherwise it gets an empty
class. So a weak password lights one bar, and a very strong one all four. The `strength--0` … `strength--3` class gives
them their colour (red, orange, blue, green: it is all in `App.css`). `aria-hidden` hides the bars from screen readers,
because the word next to them says the same.

Now the important part: strength is **not** new state. It follows from the length and the options, so we simply
calculate it at every drawing. This is a [[derived value]]. Here is `App` at the end of the intermediate level:

```jsx file=src/App.jsx mark=2,6,32-33,43,50
import { useState } from 'react'
import { entropy, generatePassword } from './generator.js'
import LengthSlider from './components/LengthSlider.jsx'
import CopyButton from './components/CopyButton.jsx'
import CharsetOptions from './components/CharsetOptions.jsx'
import StrengthMeter from './components/StrengthMeter.jsx'
import './App.css'

const START_OPTIONS = { lower: true, upper: true, digits: true, symbols: false }

function App() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState(START_OPTIONS)
  const [password, setPassword] = useState(() => generatePassword(16, START_OPTIONS))

  function regenerate() {
    setPassword(generatePassword(length, options))
  }

  function changeLength(newLength) {
    setLength(newLength)
    setPassword(generatePassword(newLength, options))
  }

  function toggleOption(key) {
    // A copy of the options with one key flipped (true becomes false, and back).
    const newOptions = { ...options, [key]: !options[key] }
    setOptions(newOptions)
    setPassword(generatePassword(length, newOptions))
  }

  // Calculated from the state at every drawing: it needs no state of its own.
  const bits = entropy(length, options)

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password" aria-live="polite">
          {password}
        </output>
        <div className="generator__actions">
          <CopyButton key={password} text={password} />
          <button type="button" onClick={regenerate}>
            New password
          </button>
        </div>
      </section>

      <StrengthMeter bits={bits} />
      <LengthSlider value={length} onChange={changeLength} />
      <CharsetOptions options={options} onToggle={toggleOption} />
    </main>
  )
}

export default App
```

:::check Check
16 characters from three sets: "Very strong", with "about 95 bits" next to it. Drag the length down to 8: "Fair". Untick everything but
the lowercase letters: the bars drop to "Weak". The intermediate level is done: commit it!
:::

:::mistake Common mistake
Keeping the strength in a separate `useState`, and updating it from a `useEffect` whenever the length or the options
change. It works, but the page is drawn twice at every change, and if a dependency is ever left out, the meter no
longer shows what is true for the password. If something can be calculated from the state, calculate it: do not store
it.
:::

:::try Try it
Compare 8 characters from all four sets with 20 lowercase letters. Which one is stronger? Length beats variety.
:::

## Advanced level {level=3}

### Secure randomness: crypto.getRandomValues

`Math.random` is fine for games, but not for passwords. It is a [[pseudo-random]] generator: it calculates its numbers
with a fast formula from a hidden starting value, and someone who sees enough of its numbers can work out the next
ones. For secrets the browser has a [[cryptographically secure]] source of randomness, one whose numbers do not give
away the next one even to someone who has seen millions of them. This is `crypto.getRandomValues`, which fills a
[[typed array]] with random numbers. A typed array has a fixed length and holds only one kind of number: a
`Uint32Array`, for example, holds whole numbers from 0 to 4,294,967,295 (that is, 2 to the power of 32, minus one).
`new Uint32Array(1)` makes such an array with a single item.

Every random choice in the project goes through `randomInt`, so this one function is all we have to replace in
`src/generator.js`:

```js file=src/generator.js
// A random whole number from 0 to max - 1, from the browser's secure random source.
export function randomInt(max) {
  const buffer = new Uint32Array(1)
  // The largest multiple of max that is not above 2 ** 32 (the box below explains why).
  const limit = Math.floor(2 ** 32 / max) * max
  let value
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)
  return value % max
}
```

`2 ** 32` means 2 to the power of 32. `%` is the [[modulo]] operator, the remainder of a division: `17 % 5` is 2,
because 5 goes into 17 three times, with 2 left over. It squeezes the huge random number into the range from 0 to
`max - 1`. `do … while` runs its body first, then repeats it
as long as the condition is true.

:::concept Why the limit? (modulo bias)
Imagine a ten-sided die numbered 0 to 9, and you need a number from 0 to 2: `value % 3`. 0, 3, 6 and 9 give 0; 1, 4 and 7
give 1; 2, 5 and 8 give 2. Zero comes up four times out of ten, the others only three times: the result is skewed. This
is [[modulo bias]]. The fix: when you roll the 9, throw it away and roll again. `limit` does the same with the 2³² possible
values: it is the largest multiple of `max` that fits, and anything from `limit` upwards is rolled again. It hardly ever
happens, but now every character has exactly the same chance.
:::

:::check Check
Everything works as before; the user sees no difference. Search the project for `Math.random` (in VS Code: ++Ctrl++ +
++Shift++ + ++F++): there is no hit any more.
:::

:::mistake Common mistake
`new Uint8Array(1)`: its numbers only go from 0 to 255. The bias becomes much bigger, and with more than 256 characters
to choose from, some characters could never come up at all.
:::

:::try Try it
In the browser console (++F12++ → Console), run `crypto.getRandomValues(new Uint32Array(5))` a few times.
:::

### Pronounceable passwords

A random password is strong, but hard to read out on the phone or to type with a TV remote. A pronounceable password
alternates consonants and vowels, like `kamorituvesa`. It is easier to say and to remember, but every character carries
less randomness, so it has to be longer. Add these to the end of `src/generator.js`:

```js file=src/generator.js
// No l, q, w, x or y: they are easy to mix up or hard to say.
const CONSONANTS = 'bcdfghjkmnprstvz'
const VOWELS = 'aeiou'

// Consonant, vowel, consonant, vowel…: like "ka-mo-ri-tu".
export function generatePronounceable(length) {
  let password = ''
  for (let i = 0; i < length; i++) {
    const letters = i % 2 === 0 ? CONSONANTS : VOWELS
    password += letters[randomInt(letters.length)]
  }
  return password
}

// Each consonant (1 of 16) is worth 4 bits, each vowel (1 of 5) about 2.3 bits.
export function pronounceableEntropy(length) {
  const consonants = Math.ceil(length / 2)
  const vowels = Math.floor(length / 2)
  return Math.round(consonants * Math.log2(CONSONANTS.length) + vowels * Math.log2(VOWELS.length))
}
```

`i % 2 === 0` is true at the even positions (0, 2, 4…): a consonant goes there, otherwise a vowel. `? :` is the
ternary operator again, as in the strength meter. `Math.ceil` rounds up, `Math.floor` rounds down: with 7 characters
there are `Math.ceil(7 / 2)` = 4 consonants and `Math.floor(7 / 2)` = 3 vowels.

The kind of password is a choice between two options: that is what [[radio buttons|radio button]] are for. Radio
buttons with the same `name` attribute form a group, and only one in a group can be selected at a time. The switch goes
into `src/components/ModeSwitch.jsx`:

```jsx file=src/components/ModeSwitch.jsx
const MODES = [
  { value: 'random', label: 'Random characters' },
  { value: 'pronounceable', label: 'Pronounceable' },
]

function ModeSwitch({ mode, onChange }) {
  return (
    <fieldset className="choices">
      <legend>Kind of password</legend>
      {MODES.map((item) => (
        <label key={item.value} className="choices__item">
          <input
            type="radio"
            name="mode"
            value={item.value}
            checked={mode === item.value}
            onChange={() => onChange(item.value)}
          />
          {item.label}
        </label>
      ))}
    </fieldset>
  )
}

export default ModeSwitch
```

In `App` a third piece of state joins the length and the character sets: the mode (`mode`). Now three things decide how
the password is made, so a helper function, `makePassword`, takes all three, and every handler calls it with the
newest values. In pronounceable mode the checkboxes mean nothing, so we hide them. This is [[conditional rendering]]:
`{condition && <Component />}` draws the component only when the condition is true; when it is false, nothing appears
in its place. The error message of lesson 1's form worked the same way.

```jsx file=src/App.jsx mark=2,7,12-16,21-22,25,30,37,40-43,45-46,64,66
import { useState } from 'react'
import { entropy, generatePassword, generatePronounceable, pronounceableEntropy } from './generator.js'
import LengthSlider from './components/LengthSlider.jsx'
import CopyButton from './components/CopyButton.jsx'
import CharsetOptions from './components/CharsetOptions.jsx'
import StrengthMeter from './components/StrengthMeter.jsx'
import ModeSwitch from './components/ModeSwitch.jsx'
import './App.css'

const START_OPTIONS = { lower: true, upper: true, digits: true, symbols: false }

// The one place that knows how to make a password from the three settings.
function makePassword(length, options, mode) {
  if (mode === 'pronounceable') return generatePronounceable(length)
  return generatePassword(length, options)
}

function App() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState(START_OPTIONS)
  const [mode, setMode] = useState('random') // 'random' or 'pronounceable'
  const [password, setPassword] = useState(() => makePassword(16, START_OPTIONS, 'random'))

  function regenerate() {
    setPassword(makePassword(length, options, mode))
  }

  function changeLength(newLength) {
    setLength(newLength)
    setPassword(makePassword(newLength, options, mode))
  }

  function toggleOption(key) {
    // A copy of the options with one key flipped (true becomes false, and back).
    const newOptions = { ...options, [key]: !options[key] }
    setOptions(newOptions)
    setPassword(makePassword(length, newOptions, mode))
  }

  function changeMode(newMode) {
    setMode(newMode)
    setPassword(makePassword(length, options, newMode))
  }

  // Calculated from the state at every drawing: it needs no state of its own.
  const bits = mode === 'pronounceable' ? pronounceableEntropy(length) : entropy(length, options)

  return (
    <main className="generator">
      <h1>Password Generator</h1>
      <section className="generator__result">
        <output className="generator__password" aria-live="polite">
          {password}
        </output>
        <div className="generator__actions">
          <CopyButton key={password} text={password} />
          <button type="button" onClick={regenerate}>
            New password
          </button>
        </div>
      </section>

      <StrengthMeter bits={bits} />
      <ModeSwitch mode={mode} onChange={changeMode} />
      <LengthSlider value={length} onChange={changeLength} />
      {mode === 'random' && <CharsetOptions options={options} onToggle={toggleOption} />}
    </main>
  )
}

export default App
```

:::check Check
Choose "Pronounceable": the password turns into syllables, the checkboxes disappear, and at 16 characters the meter
says only "Fair" (about 51 bits). Drag the slider to 30: now it is "Very strong". Back on "Random characters", the boxes
return with the same ticks as before, because their state lives in `App`.
:::

:::mistake Common mistake
Radio buttons with different `name`s, or with none. The browser then does not treat them as one group: the arrow keys
do not move between them, and a screen reader does not say "1 of 2".
:::

:::try Try it
Start pronounceable passwords with a capital: at the end of `generatePronounceable`, return
`password[0].toUpperCase() + password.slice(1)`. Does it make the password stronger? (No: it is always the first
letter, and an attacker knows that as well as you do.)
:::

### Checking against leaked passwords

Websites get hacked, and the passwords of millions of users from such [[data breaches|data breach]] end up in lists on
the internet. Attackers try these passwords first, so a password that is on such a list is weak, however long it looks.

The real lists are enormous, and checking against them needs a service on the internet. This course uses no outside
services, so we practise the idea on a short local list instead: `src/commonPasswords.js`, which came with the starter,
holds a few hundred very common passwords, all in lowercase.

To find something in an array, the computer has to go through it item by item. A [[Set]] is a collection that answers
"is this in it?" at once, however big it is. Create the helper file `src/breach.js`:

```js file=src/breach.js
import { COMMON_PASSWORDS } from './commonPasswords.js'

// Made once, when the file loads. A Set answers "is it in there?" at once.
const COMMON = new Set(COMMON_PASSWORDS)

// The list is lowercase, so "QWERTY" and "Qwerty" are caught too.
export function isCommonPassword(text) {
  return COMMON.has(text.toLowerCase())
}
```

`new Set(…)` makes a set from the array, `has` tells whether a value is in it, and `toLowerCase()` turns the text into
all lowercase letters.

The checker gets a text field of its own (a controlled input again), and answers while you type. It goes into
`src/components/BreachCheck.jsx`:

```jsx file=src/components/BreachCheck.jsx
import { useState } from 'react'
import { isCommonPassword } from '../breach.js'

function BreachCheck() {
  const [value, setValue] = useState('')
  const found = isCommonPassword(value)

  let message = ''
  if (value !== '' && found) {
    message = 'This password is on the list of common leaked passwords. Never use it!'
  }
  if (value !== '' && !found) {
    message = 'Not on our list. That alone does not make it strong: the list is short.'
  }

  return (
    <section className="breach">
      <h2>Is your password on the list?</h2>
      <label className="breach__field">
        Type a password to check it
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <p className={found ? 'breach__result is-bad' : 'breach__result'} role="status">
        {message}
      </p>
    </section>
  )
}

export default BreachCheck
```

`spellCheck={false}` matters here: some browsers send the text of fields to an online spell checker, and a password
has no business there. `autoComplete="off"` asks the browser not to offer text that was typed into the field before.
`!==` is the opposite of `===`: it is true when the two values differ. `role="status"` makes screen readers read the
answer out when it changes. Finally, put the
checker at the bottom of `App`:

```jsx file=src/App.jsx mark=1,8
import BreachCheck from './components/BreachCheck.jsx'
// … the other imports, makePassword and the beginning of App, as before

  return (
    <main className="generator">
      {/* … everything as before … */}
      {mode === 'random' && <CharsetOptions options={options} onToggle={toggleOption} />}
      <BreachCheck />
    </main>
  )
}
```

:::check Check
Type `qwerty`, `password1` or `Sunshine`: a red warning. Paste the generated password: "Not on our list".
Congratulations, your password generator is done!
:::

:::concept How do real breach checks work without giving the password away?
A real service keeps hundreds of millions of leaked passwords (the best-known one is Have I Been Pwned), but sending your password
to anyone would be a bad idea. So the browser first makes a [[hash]] of it: a fixed-length fingerprint from which the
password cannot be worked out. Then it sends only the **first five characters** of the hash. The service answers with
every leaked hash that starts with those five characters (several hundred of them), and the browser compares them
itself. The service never learns the password, not even its full hash. This trick is called [[k-anonymity]]. We do not
call such a service in this course, but now you know what happens when a password manager warns you about a leaked
password.
:::

:::mistake Common mistake
Building the `Set` inside the component. Then at every keystroke, that is, at every drawing, the whole list is turned
into a set again. Data that never changes belongs outside the component (here in `breach.js`), where it is made only
once.
:::

:::try Task
Show under the field how many passwords are on the list: import `COMMON_PASSWORDS` into `BreachCheck`
(`import { COMMON_PASSWORDS } from '../commonPasswords.js'`) and show `COMMON_PASSWORDS.length`. Then add to the array
in `src/commonPasswords.js` a few passwords that you think many people use (in lowercase), and watch the number grow.
:::
