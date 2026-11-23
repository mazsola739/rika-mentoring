# What we build

A calculator like the one on your phone: number keys, the four basic operations, an equals key and a clear key. Then
we teach it decimals, percentages and the keyboard, let it keep a history, and at the end you write your own formula
parser for it, one that knows that multiplication comes before addition. On the way you learn how a user interface is
built from small components that you use again and again, how React receives clicks and key presses, and how a
program checks its own work with tests.

:::levels
- Number keys made from one key component of your own, the four basic operations, the result and clear (C). | about 2 hours
- A decimal point, sign toggle, percent, keyboard input and a history list. | about 3 hours
- Tests, your own formula parser with operator precedence and parentheses, scientific functions. | about 3 hours
:::

**Before you start you need:** the first seven lessons. We build mostly on lesson 1 ("Me, Myself & React"), lesson 3
("Password Generator") and lesson 7 ("Color Palette Generator"): components, props, `useState`, `useEffect`, event
handlers, a keyboard listener and the updater function. Wherever we use something from earlier, we recall it in a
sentence or two; everything new is explained step by step.

## Beginner level {level=1}

### Before you start

Download the lesson's **starter** (above: "Download starter"), unzip it, and open the `calculator` folder in your
editor. Then type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). In the middle of the page there is a dark blue
calculator body with a small "CALCULATOR" label at the top, and below it a black screen with a big 0. There are no keys
yet: you are going to make them.
:::

The starter has two files that matter for this lesson:

- `src/App.jsx`: the page. For now it only draws the calculator body and its screen; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so this time you do not
  write styles: you only use the class names (`screen`, `keypad`, `key`, `history`, …) that the steps give you. Have a
  look inside anyway: a comment above each part says what it is for.

Like in the earlier lessons, the folder is a git repository with one commit, the starting point: `git restore .` takes
every file back, and it is worth committing after every step that works.

:::concept A quick recap
A [[component]] is a function that returns [[JSX]], the HTML-like description of what should appear on the screen. A
component gets data from outside through its [[props]], and remembers things with [[useState]]: when a state value
changes, React draws the component again. An [[event handler]] is a function that runs when something happens, for
example a click. You have used all of these already; everything new is explained here.
:::

### Buttons: the Key component

A calculator has 16 keys, and they all work the same way: a key has a label and a colour, and when you press it, it
says that it was pressed. Instead of writing 16 `<button>`s one under the other, we write one component and use it 16
times, with different props each time. Create a `components` folder in the `src` folder, and a `Key.jsx` file in it:

```jsx file=src/components/Key.jsx
// One key. Everything comes in as a prop: its label, its kind, and what it should do.
function Key({ label, kind, onPress }) {
  return (
    <button type="button" className={`key key--${kind}`} onClick={() => onPress(label)}>
      {label}
    </button>
  )
}

export default Key
```

- `label` is the text on the key, for example `'7'` or `'+'`.
- `kind` is the kind of key: `'digit'`, `'operator'`, `'equals'` or `'function'` (everything else, like C). The value
  of `className` is a [[template literal]], and the value of `kind` takes the place of `${kind}` in it: that gives
  class names like `key key--digit`. `App.css` gives these classes their colours.
- `onPress` is a function the key gets from its parent. The key does not know what its job is in a calculator; it only
  says "I was pressed, and this is my label". It is the same idea as the slider in lesson 3: data goes down through
  props, events come up through functions.

Look at `onClick={() => onPress(label)}`. `onClick` wants a function that React calls on a click. But we want
`onPress` to get the key's label as well, so we wrap it in a small [[arrow function]]. The arrow function does not run
while the key is drawn, only on a click, and then it calls `onPress(label)`.

The data of the 16 keys goes into an array, and `map` turns the array into keys, like the checkboxes in lesson 3.
Create `src/components/Keypad.jsx`:

```jsx file=src/components/Keypad.jsx
import Key from './Key.jsx'

// The keys row by row, left to right, as they sit on the calculator.
const KEYS = [
  { label: '7', kind: 'digit' },
  { label: '8', kind: 'digit' },
  { label: '9', kind: 'digit' },
  { label: '÷', kind: 'operator' },

  { label: '4', kind: 'digit' },
  { label: '5', kind: 'digit' },
  { label: '6', kind: 'digit' },
  { label: '×', kind: 'operator' },

  { label: '1', kind: 'digit' },
  { label: '2', kind: 'digit' },
  { label: '3', kind: 'digit' },
  { label: '−', kind: 'operator' },

  { label: 'C', kind: 'function' },
  { label: '0', kind: 'digit' },
  { label: '=', kind: 'equals' },
  { label: '+', kind: 'operator' },
]

function Keypad({ onPress }) {
  return (
    <div className="keypad">
      {KEYS.map((item) => (
        <Key key={item.label} label={item.label} kind={item.kind} onPress={onPress} />
      ))}
    </div>
  )
}

export default Keypad
```

The `keypad` class is a grid with four columns, so the keys line up four in a row, in exactly the order they have in
the array. `÷`, `×` and `−` are not on your keyboard: they are characters of their own (`−` is longer than a hyphen),
so copy them from here with the code block's copy button.

`key={item.label}` is the [[key]]: you know from lesson 1 that React uses it to tell the items of a list apart. `key` is
React's own name, and it never even reaches the component as a prop, so we pass the label again, as `label`. And we
call each element of the array `item`, not `key`: in this lesson a key is also a calculator key, and the name would get
mixed up with React's `key`.

`Keypad` does not know what to do with a key press either: it simply passes the `onPress` function it gets on to every
key. The real work will happen in `App`. For now, let us just write to the [[console]] which key you pressed. Change
`src/App.jsx` to this (the highlighted lines are new):

```jsx file=src/App.jsx mark=1,5-8,17
import Keypad from './components/Keypad.jsx'
import './App.css'

function App() {
  // For now we only write to the console which key you pressed.
  function handlePress(label) {
    console.log('You pressed:', label)
  }

  return (
    <main className="app">
      <div className="calculator">
        <h1 className="calculator__brand">Calculator</h1>
        <div className="screen">
          <output className="screen__value">0</output>
        </div>
        <Keypad onPress={handlePress} />
      </div>
    </main>
  )
}

export default App
```

The console is the browser's notice board for developers: ++F12++ opens it, on the "Console" tab. `console.log(…)`
writes whatever it gets there, so you can see what is happening in your code.

:::check Check
Below the screen there are the 16 keys in four rows: the numbers are dark blue, the operators orange, `=` golden
yellow, and C has turquoise letters. Open the console and press some keys: every click adds a line, for example
"You pressed: 7".
:::

:::mistake Common mistake
`onClick={onPress(label)}`, without the arrow function. This does not pass the function on; it calls it right away,
while drawing, and gives its result (`undefined`) to `onClick`. As soon as the page loads, all 16 labels appear in
the console (during development maybe twice), but clicking does nothing.
:::

:::try Try it
Swap the `7 8 9` row and the `1 2 3` row in the array (their operators stay where they are), the way phone keypads are
laid out: the grid follows the order of the array straight away. Then swap them back.
:::

### Digits on the display

Time for the first real job: the digits you press should appear on the screen. Whatever changes while the page is in
use is [[state]], and that needs `useState`. We keep the number on the screen as **text**: if you add `'3'` to the end
of `'12'`, you get `'123'`, which is exactly what we want. With numbers, `12 + 3` would be 15.

The screen gets a component of its own too. Create `src/components/Display.jsx`:

```jsx file=src/components/Display.jsx
// The screen: it shows the number it gets in the value prop.
function Display({ value }) {
  return (
    <div className="screen">
      <output className="screen__value" aria-live="polite">
        {value}
      </output>
    </div>
  )
}

export default Display
```

`aria-live="polite"` asks screen readers to read out the new content of the screen when it changes. `App` keeps the
number and updates it on every key press:

```jsx file=src/App.jsx mark=1,2,7,8,11-17,24
import { useState } from 'react'
import Display from './components/Display.jsx'
import Keypad from './components/Keypad.jsx'
import './App.css'

function App() {
  // The number on the screen, as text.
  const [display, setDisplay] = useState('0')

  function handlePress(label) {
    // For now we only deal with digits and skip every other key.
    if (!'0123456789'.includes(label)) return
    if (display === '0') {
      setDisplay(label)
    } else {
      setDisplay(display + label)
    }
  }

  return (
    <main className="app">
      <div className="calculator">
        <h1 className="calculator__brand">Calculator</h1>
        <Display value={display} />
        <Keypad onPress={handlePress} />
      </div>
    </main>
  )
}

export default App
```

- `'0123456789'.includes(label)` is true when `label` occurs in that text, in other words when it is a digit. The `!`
  turns it around: if the key is **not** a digit, `return` leaves the function at once, and nothing happens.
- If the screen shows just a 0, the digit takes its place; otherwise it goes on the end. So a 5 pressed after the 0
  gives "5", not "05".

:::check Check
Press 1, 2 and 3: the screen shows 123. The starting 0 disappears as soon as you press the first digit. The operators,
`=` and C do nothing yet.
:::

:::mistake Common mistake
`display = display + label` instead of `setDisplay(…)`. `display` is a `const`, so the browser throws an error
("Assignment to constant variable"); and even if it were a `let`, nothing would change on the screen. React only draws
again when you give the state a new value with its `set…` function.
:::

### Operators: one state, several values

For operations, the calculator has to remember more than one thing. When you type `12 + 3`, pressing `+` has to put
the 12 and the `+` aside; the 12 stays on the screen, but the next digit (the 3) starts a new number. That makes four
values:

- `display`: the number on the screen, as text;
- `stored`: the first number (the 12) while you type the second;
- `operator`: the chosen operation (the `+`);
- `overwrite`: whether the next digit starts a new number.

These four change together: an operator changes `stored`, `operator` and `overwrite` at the same time. So instead of
four separate `useState`s, we keep them in a single [[object]].

What happens on a key press is plain JavaScript; it has nothing to do with React. So the calculator's logic goes into a
file of its own (just as the code that makes the password went into `generator.js` in lesson 3), and it is made of
[[pure functions|pure function]]. A pure function works only from its parameters and affects the world only through
its return value: it changes nothing, and for the same input it always returns the same thing. Here every function
gets the old state (`calc`) and returns a **new** state. Create `src/calculator.js`:

```js file=src/calculator.js
// The calculator's "brain": plain JavaScript, no React.
// Every function gets the old state and returns a new one; it never changes the old one.

// The state at the start.
export const START = {
  display: '0', // the number on the screen, as text
  stored: null, // the first number, while you type the second
  operator: null, // the chosen operation: '+', '−', '×' or '÷'
  overwrite: false, // true: the next digit starts a new number
}

const OPERATORS = ['+', '−', '×', '÷']

export function inputDigit(calc, digit) {
  if (calc.overwrite) return { ...calc, display: digit, overwrite: false }
  if (calc.display === '0') return { ...calc, display: digit }
  return { ...calc, display: calc.display + digit }
}

export function chooseOperator(calc, operator) {
  return { ...calc, stored: Number(calc.display), operator, overwrite: true }
}

// Which key was pressed? That decides which function does the work.
export function press(calc, label) {
  if ('0123456789'.includes(label)) return inputDigit(calc, label)
  if (OPERATORS.includes(label)) return chooseOperator(calc, label)
  return calc
}
```

- `null` means "no value". At the start there is no first number yet, and no chosen operation.
- `{ ...calc, display: digit }` is the [[spread]] you know from lesson 3: it copies the old object and overwrites one
  or two of its properties. We never change the state directly (`calc.display = …`): React only draws again when it gets a **new**
  object.
- `inputDigit` is the logic of the previous step with one new rule: if `overwrite` is true, the digit does not go on
  the end, it starts a new number.
- `Number(calc.display)` makes a number from the text (the slider in lesson 3 needed it too), since we want to
  calculate with the 12 later. A lone `operator` is the same as `operator: operator`: when the property and the
  variable have the same name, writing it once is enough.
- `press` is the only function `App` will use. It looks at the key's label and hands the work to the right function.
  It cannot do anything with keys that are neither digits nor operators yet, so for those it returns the state
  unchanged.

In `App`, the whole state goes into a single `useState`, and a key press becomes a single line:

```jsx file=src/App.jsx mark=2,8,11,18
import { useState } from 'react'
import { START, press } from './calculator.js'
import Display from './components/Display.jsx'
import Keypad from './components/Keypad.jsx'
import './App.css'

function App() {
  const [calc, setCalc] = useState(START)

  function handlePress(label) {
    setCalc(press(calc, label))
  }

  return (
    <main className="app">
      <div className="calculator">
        <h1 className="calculator__brand">Calculator</h1>
        <Display value={calc.display} stored={calc.stored} operator={calc.operator} />
        <Keypad onPress={handlePress} />
      </div>
    </main>
  )
}

export default App
```

`{ START, press }` loads two [[named exports|named export]], by name, in curly braces, just like the imports from
`generator.js` in lesson 3.

Finally the screen: above the number, in a smaller line, the pending operation should appear, for example "12 +". But
only once you have chosen an operation! This is the [[conditional rendering]] you know from the earlier lessons (lesson
4, for example): `{condition && <…>}` draws the JSX only when the condition is true. Change
`src/components/Display.jsx`:

```jsx file=src/components/Display.jsx mark=1,2,5-9
// The screen: the pending operation on top (if there is one), the number below.
function Display({ value, stored, operator }) {
  return (
    <div className="screen">
      {operator && (
        <div className="screen__expression">
          {stored} {operator}
        </div>
      )}
      <output className="screen__value" aria-live="polite">
        {value}
      </output>
    </div>
  )
}

export default Display
```

While `operator` is `null`, `null && …` is `null`, and React draws nothing in its place. As soon as there is an
operation, it draws the line. The space between `{stored} {operator}` stays on the screen too.

:::check Check
Press 1, 2, +. "12 +" appears in small letters above the number, and the screen still shows 12. Press 3: the screen
shows 3, with "12 +" still above it. `=` and C do nothing yet.
:::

:::mistake Common mistake
`{stored && …}` instead of `{operator && …}`. If the first number is 0 ("0 +"), the condition is the number 0 itself.
React does not draw `false`, `null` or `undefined`, but it does draw 0: a lonely 0 appears where the line should be.
Do not put a number in front of `&&`.
:::

### Equals, clear and dividing by zero

Now for the calculating. First a function that does one operation with two numbers, then `=`, which calls it with the
pending operation and the number on the screen. Here is the whole `src/calculator.js` as it looks at the end of the
beginner level:

```js file=src/calculator.js mark=10,15-22,31-34,37-44,48,49,52,53
// The calculator's "brain": plain JavaScript, no React.
// Every function gets the old state and returns a new one; it never changes the old one.

// The state at the start.
export const START = {
  display: '0', // the number on the screen, as text
  stored: null, // the first number, while you type the second
  operator: null, // the chosen operation: '+', '−', '×' or '÷'
  overwrite: false, // true: the next digit starts a new number
  error: false, // true: something went wrong (division by zero)
}

const OPERATORS = ['+', '−', '×', '÷']

// One operation with two numbers. Dividing by zero gives null: there is no sensible answer.
export function calculate(a, operator, b) {
  if (operator === '+') return a + b
  if (operator === '−') return a - b
  if (operator === '×') return a * b
  if (b === 0) return null
  return a / b
}

export function inputDigit(calc, digit) {
  if (calc.overwrite) return { ...calc, display: digit, overwrite: false }
  if (calc.display === '0') return { ...calc, display: digit }
  return { ...calc, display: calc.display + digit }
}

export function chooseOperator(calc, operator) {
  // If an operation is already waiting (2 + 3, and now ×), work it out first, as if you had pressed =.
  const current = calc.operator && !calc.overwrite ? equals(calc) : calc
  if (current.error) return current
  return { ...current, stored: Number(current.display), operator, overwrite: true }
}

export function equals(calc) {
  // No operation chosen: nothing to work out.
  if (!calc.operator) return calc
  const result = calculate(calc.stored, calc.operator, Number(calc.display))
  // We divided by zero: everything starts again, only the error shows.
  if (result === null) return { ...START, error: true }
  return { ...calc, display: String(result), stored: null, operator: null, overwrite: true }
}

// Which key was pressed? That decides which function does the work.
export function press(calc, label) {
  // After an error, every key starts with a clean slate, as if you had pressed C first.
  if (calc.error) return press(START, label)
  if ('0123456789'.includes(label)) return inputDigit(calc, label)
  if (OPERATORS.includes(label)) return chooseOperator(calc, label)
  if (label === '=') return equals(calc)
  if (label === 'C') return START
  return calc
}
```

- `calculate` looks at the operator and does that operation. You cannot divide by zero, so in that case it returns
  `null`: a sign that there is no sensible result. (On its own, JavaScript would give `Infinity`.)
- `equals` works out the result, puts it on the screen (`String()` turns it into text), and forgets the first number
  and the operation. Because of `overwrite: true`, the next digit starts a new number. If no operation was chosen,
  there is nothing to work out, so it returns the state unchanged. And if `calculate` returned `null`, everything goes
  back to the starting state, except that `error` becomes `true`.
- `chooseOperator` got smarter too. When you type `2 + 3 ×`, pressing `×` has to work out `2 + 3` first, otherwise the
  2 would be lost. So in that case `equals` runs first, and the next operation starts from its result (5). The
  `!calc.overwrite` part of the condition checks whether you have typed a second number yet: `2 + ×` only swaps the
  operator. `? :` is the [[ternary operator]] from lesson 3: if the condition is true, `current` is the result of
  `equals(calc)`, otherwise it is `calc` itself.
- `press` has three new lines. `=` calls `equals`, and C returns the starting state. The very first line is new too:
  after an error, `press` calls itself again, but with the starting state, as if you had pressed C first. That way
  every key starts with a clean slate.

The screen has to show the error too. Change `src/components/Display.jsx`:

```jsx file=src/components/Display.jsx mark=1,2,10,11
// The screen: the pending operation on top (if there is one), the number or the error message below.
function Display({ value, stored, operator, error }) {
  return (
    <div className="screen">
      {operator && (
        <div className="screen__expression">
          {stored} {operator}
        </div>
      )}
      <output className={error ? 'screen__value is-error' : 'screen__value'} aria-live="polite">
        {error ? 'Cannot divide by zero' : value}
      </output>
    </div>
  )
}

export default Display
```

The ternary operator decides twice here: when there is an error, the screen gets the `is-error` class (smaller, pink
letters), and the message appears instead of the number. Finally, a single line changes in `src/App.jsx`:
`<Display … />` gets `error` as well.

```jsx file=src/App.jsx
        <Display value={calc.display} stored={calc.stored} operator={calc.operator} error={calc.error} />
```

:::check Check
- `12 + 3 =`: the screen shows 15, and the line above disappears.
- `2 + 3 × 4 =`: 20. When you press `×`, the screen already shows 5, with "5 ×" above it. The calculator works from left
  to right, like a simple pocket calculator; in the advanced level we also build a formula field that knows that
  multiplication comes first.
- `7 ÷ 0 =`: "Cannot divide by zero". Press a digit: the message disappears, and the screen shows the digit.
- C brings back the 0 at any time. The beginner level is done: commit it!
:::

:::mistake Common mistake
12 + 3 gives 123. A `Number()` is missing somewhere, and the first number went into `stored` as text: in JavaScript,
`'12' + 3` joins two pieces of text, it does not add. Both `chooseOperator` and `equals` turn the text on the screen
into a number before calculating with it.
:::

:::try Task
Highlight the chosen operator while it waits for the second number: make its key white. Give `Keypad` an
`activeOperator` prop (`App` passes it `calc.overwrite ? calc.operator : null`), and let it pass
`active={item.label === activeOperator}` on to every `Key`. In `Key`, add ` is-active` to the class names when `active`
is true: the style is already in `App.css`. (The code in the next steps shows the version without this task; if you
did it, keep `active`, `activeOperator` and ` is-active` in your `Key`, `Keypad` and `App`.)
:::

## Intermediate level {level=2}

### Decimal point, sign and percent

Three new keys are coming: the decimal point, the sign toggle (±) and percent (%). Each one is a small pure function in
`calculator.js`, but first they need room on the keypad. The new layout has five rows: C, ± and % at the top, and the
double-width 0, the point and `=` at the bottom.

For the wide key, `Key` gets a new prop, `wide`. When it is true, `key--wide` is added to the class names (in
`App.css`, that gives the key the room of two columns). Change `src/components/Key.jsx`:

```jsx file=src/components/Key.jsx mark=2-4,6
// One key. Everything comes in as a prop: its label, its kind, and what it should do.
function Key({ label, kind, wide, onPress }) {
  let className = `key key--${kind}`
  if (wide) className += ' key--wide'
  return (
    <button type="button" className={className} onClick={() => onPress(label)}>
      {label}
    </button>
  )
}

export default Key
```

A prop you do not pass is `undefined`, which counts as false: that is why the other keys do not become wide. The new
layout goes into `src/components/Keypad.jsx`, and `Keypad` passes `wide` on as well:

```jsx file=src/components/Keypad.jsx mark=5-8,13,18,23,25-27,34
import Key from './Key.jsx'

// The keys row by row, left to right, as they sit on the calculator.
const KEYS = [
  { label: 'C', kind: 'function' },
  { label: '±', kind: 'function' },
  { label: '%', kind: 'function' },
  { label: '÷', kind: 'operator' },

  { label: '7', kind: 'digit' },
  { label: '8', kind: 'digit' },
  { label: '9', kind: 'digit' },
  { label: '×', kind: 'operator' },

  { label: '4', kind: 'digit' },
  { label: '5', kind: 'digit' },
  { label: '6', kind: 'digit' },
  { label: '−', kind: 'operator' },

  { label: '1', kind: 'digit' },
  { label: '2', kind: 'digit' },
  { label: '3', kind: 'digit' },
  { label: '+', kind: 'operator' },

  { label: '0', kind: 'digit', wide: true },
  { label: '.', kind: 'digit' },
  { label: '=', kind: 'equals' },
]

function Keypad({ onPress }) {
  return (
    <div className="keypad">
      {KEYS.map((item) => (
        <Key key={item.label} label={item.label} kind={item.kind} wide={item.wide} onPress={onPress} />
      ))}
    </div>
  )
}

export default Keypad
```

Now for the functions. Add them to `src/calculator.js`, after `inputDigit`:

```js file=src/calculator.js
export function inputDecimal(calc) {
  // A new number starts: the point needs a 0 in front of it.
  if (calc.overwrite) return { ...calc, display: '0.', overwrite: false }
  // A number can only have one decimal point.
  if (calc.display.includes('.')) return calc
  return { ...calc, display: calc.display + '.' }
}

export function toggleSign(calc) {
  if (calc.display === '0') return calc
  if (calc.display.startsWith('-')) return { ...calc, display: calc.display.slice(1) }
  return { ...calc, display: '-' + calc.display }
}

export function percent(calc) {
  const value = Number(calc.display)
  // With + and −, it is a percentage of the first number: 50 + 10 % is the same as 50 + 5.
  // Otherwise it is the number divided by a hundred: 10 % is 0.1.
  const base = calc.operator === '+' || calc.operator === '−' ? calc.stored : 1
  return { ...calc, display: String((base * value) / 100), overwrite: true }
}
```

- The decimal separator is a point, as in JavaScript and on most calculators: `Number('3.5')` understands it, while
  `Number('3,5')` does not (it gives `NaN`, "not a number"). `includes('.')` checks whether the number already has a
  point.
- `toggleSign` puts a minus sign in front of the number, or takes it off. `startsWith('-')` checks whether the text
  starts with a minus, and `slice(1)` cuts off its first character. This has to be a plain hyphen, because
  `Number('-5')` understands that; `−` is only the label on the key. We do not turn 0 into −0.
- `percent` follows the rule of most pocket calculators: `50 + 10 %` means "50 plus ten percent of 50". `||` means
  "or": the condition is true when either side is true. After %, press = before you choose the next operator: because
  of `overwrite: true`, `chooseOperator` would think the second number has not been typed yet and drop the pending
  operation.

Finally, `press` learns the new keys as well. Replace the whole function:

```js file=src/calculator.js mark=7-9
// Which key was pressed? That decides which function does the work.
export function press(calc, label) {
  // After an error, every key starts with a clean slate, as if you had pressed C first.
  if (calc.error) return press(START, label)
  if ('0123456789'.includes(label)) return inputDigit(calc, label)
  if (OPERATORS.includes(label)) return chooseOperator(calc, label)
  if (label === '.') return inputDecimal(calc)
  if (label === '±') return toggleSign(calc)
  if (label === '%') return percent(calc)
  if (label === '=') return equals(calc)
  if (label === 'C') return START
  return calc
}
```

:::check Check
- There are five rows of keys, and the 0 is two places wide.
- `3 . 1 4`: the screen shows 3.14; a second point does not get in. After an operator, the point starts a new number
  with "0.".
- `5 ±`: -5; another ±: 5 again.
- `50 + 10 %`: pressing % shows 5, and after `=` you get 55. `200 × 15 % =` gives 30.
:::

:::mistake Common mistake
The 0 did not become wide, and there is an empty gap at the end of the row. `Keypad` did not pass `wide` on: it does
not matter that the array says `wide: true`, `Key` only gets what you pass to it as a prop in `<Key … />`.
:::

### The floating-point trap

Try this: `0.1 + 0.2 =`. The screen shows 0.30000000000000004. It is not your fault: the computer stores numbers in
binary, and in binary it cannot write 0.1 exactly, just as we cannot write 1/3 as a decimal (0.3333…). JavaScript's
numbers are [[floating-point numbers|floating-point number]]: they are accurate to about 16
[[significant digits|significant digit]] (the digits counted from the first one that is not 0: 0.00123 has three), and
tiny errors hide in the last ones. Every programming language works like this, not just JavaScript.

The fix: we round every result to 12 significant digits. The noise disappears, the real digits stay. `toPrecision(12)`
turns the number into **text** with 12 significant digits (`'0.300000000000'`), and `Number()` makes a number from it
again, dropping the unneeded zeros on the way (0.3). Add this function to `src/calculator.js`, above `calculate`:

```js file=src/calculator.js
// Rounds to 12 significant digits: 0.30000000000000004 becomes 0.3.
export function roundResult(value) {
  return Number(value.toPrecision(12))
}
```

Then use it wherever a result is made: in every operation of `calculate`, and in the last line of `percent`. Replace
both functions:

```js file=src/calculator.js mark=3-5,7,15
// One operation with two numbers. Dividing by zero gives null: there is no sensible answer.
export function calculate(a, operator, b) {
  if (operator === '+') return roundResult(a + b)
  if (operator === '−') return roundResult(a - b)
  if (operator === '×') return roundResult(a * b)
  if (b === 0) return null
  return roundResult(a / b)
}

export function percent(calc) {
  const value = Number(calc.display)
  // With + and −, it is a percentage of the first number: 50 + 10 % is the same as 50 + 5.
  // Otherwise it is the number divided by a hundred: 10 % is 0.1.
  const base = calc.operator === '+' || calc.operator === '−' ? calc.stored : 1
  return { ...calc, display: String(roundResult((base * value) / 100)), overwrite: true }
}
```

:::check Check
`0.1 + 0.2 =`: 0.3. `1.1 × 3 =`: 3.3 (without rounding it would be 3.3000000000000003). `1 ÷ 3 =`: 0.333333333333, 12
digits.
:::

:::mistake Common mistake
`Number()` is missing, and `roundResult` returns just `value.toPrecision(12)`. The result is then text, full of
unneeded zeros: after `5 + 5 =` the screen shows 10.0000000000.
:::

:::concept Why is 1 ÷ 3 × 3 0.999999999999?
Because we keep calculating with the rounded result: three times 0.333333333333 is 0.999999999999. Real calculators
store a few more digits behind the scenes than they show, and round only on the screen. Our approach is plenty for a
pocket calculator; and the formula field of the advanced level works out the whole formula in one go, so the problem
does not come up there at all.
:::

:::try Try it
Open the browser console (++F12++) and type `0.1 + 0.2 === 0.3`. The answer is `false`! That is why you should never
compare two fractional numbers with `===`.
:::

### Keyboard input

Calculating would be faster with the keyboard: the digits, `+ - * /`, ++Enter++ for equals, ++Esc++ to clear. In
lesson 7, with the colour palette, you already listened to a key: inside a `useEffect` you put a `keydown` listener on
`window`, and removed it in the cleanup function. It works the same way here. The keyboard's symbols are not always the
same as the labels on the keys, though (`*` is `×`, `/` is `÷`), so we need a little dictionary: an object that says,
for every keyboard key, which calculator key it means. Change `src/App.jsx`:

```jsx file=src/App.jsx mark=1,7-19,24-40
import { useEffect, useState } from 'react'
import { START, press } from './calculator.js'
import Display from './components/Display.jsx'
import Keypad from './components/Keypad.jsx'
import './App.css'

// The keyboard's symbols, and the key each one means. The digits mean themselves.
const KEYBOARD = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '.': '.',
  ',': '.',
  '%': '%',
  '=': '=',
  Enter: '=',
  Escape: 'C',
}

function App() {
  const [calc, setCalc] = useState(START)

  useEffect(() => {
    function handleKeyDown(event) {
      // Ctrl (on a Mac, Cmd) shortcuts, like zooming, stay with the browser.
      // Ctrl and Alt together are AltGr, though: on some keyboards (Hungarian, for one) that is how you type *.
      if (event.metaKey || (event.ctrlKey && !event.altKey)) return
      const label = '0123456789'.includes(event.key) ? event.key : KEYBOARD[event.key]
      // This key is not the calculator's.
      if (!label) return
      // Enter must not also press the key that has the focus.
      event.preventDefault()
      setCalc((current) => press(current, label))
    }

    window.addEventListener('keydown', handleKeyDown)
    // Cleanup: when App leaves the page, the listener goes too.
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handlePress(label) {
    setCalc(press(calc, label))
  }

  return (
    <main className="app">
      <div className="calculator">
        <h1 className="calculator__brand">Calculator</h1>
        <Display value={calc.display} stored={calc.stored} operator={calc.operator} error={calc.error} />
        <Keypad onPress={handlePress} />
      </div>
    </main>
  )
}

export default App
```

- `event.key` is the name of the key that was pressed: `'7'`, `'+'`, `'Enter'`, `'Escape'`. A digit means itself;
  anything else is looked up in the dictionary with `KEYBOARD[event.key]`. If it is not there (the ++A++ key, for
  example), the value is `undefined`, and `return` leaves the function.
- `event.preventDefault()`, which you know from lesson 7, switches off the key's [[default behavior]]. We need it
  because of ++Enter++: when you click the 7 with the mouse, the [[focus]] (the element that gets the key presses) stays
  on that key, and the browser would "press" the focused key again on ++Enter++. Without it, `7 Enter` would give 77.
- We leave Ctrl shortcuts alone: ++Ctrl++ + ++-++ should still zoom out.
- The [[dependency array]] `[]` is empty, so the effect runs only once, after the first drawing: one listener goes on
  `window`, and the [[cleanup function]] takes it off when `App` leaves the page.

And the most important part: `setCalc((current) => press(current, label))`. This time `setCalc` does not get the new
state, but a function that works out the new state from the **latest** one. This is the [[updater function]] you know
from lessons 6 and 7: React calls it with whatever the current state is. Here we have to write it like this:
`handleKeyDown` was made during the first drawing, and if it read `calc`, it would see the `calc` of that moment
forever, which is the starting state. The keys' `handlePress` can stay as it was: it is made again on every drawing, so
it always sees the fresh `calc`.

:::check Check
Click an empty part of the page, then type `12+3` and press ++Enter++: 15. ++Esc++ clears, both `,` and `.` type a
decimal point, `*` multiplies and `/` divides. Click the 7 with the mouse, then press ++Enter++: it does not become 77.
:::

:::mistake Common mistake
`setCalc(press(calc, label))` in the effect too. The keys work, but with the keyboard only the last digit ever shows:
`1 2` gives 2. Inside the listener, `calc` is the starting state forever, so every key press starts from 0. An updater
function fixes it.
:::

:::try Task
Make ++Backspace++ delete the last digit of the number on the screen. Write a `deleteLast(calc)` function in
`calculator.js`: if `overwrite` is true, it does nothing; otherwise it cuts off the last character
(`calc.display.slice(0, -1)`), and if that leaves empty text or a lonely `-`, the screen shows `'0'`. `press` calls it
for the label `'⌫'`, and `KEYBOARD` gets a `Backspace: '⌫'` line. (The code in the next step shows the version
without this task; if you did it, keep `deleteLast` and the `'⌫'` line of `press` in `calculator.js`, and the
`Backspace: '⌫'` line of `KEYBOARD` in `App`.)
:::

### History

The last intermediate feature: every finished calculation goes onto a list, the newest at the top, and a click brings
an old result back.

Where do we keep the list? Calculations are done by `equals`, and `equals` also runs from the keyboard, inside an
updater function. We cannot set another piece of state there, because the updater function has to be pure as well:
during development React may call it twice (the "Common mistake" box at the end of this step is about that). So the
history goes into the `calc` object too, as an [[array]]. You know from lesson 7 that we do not change an array in
state either: we make a new one. `[entry, ...calc.history]`, for example, puts the new item in front of the old ones.
Here is the whole `src/calculator.js` as it looks at the end of the intermediate level:

```js file=src/calculator.js mark=11,68-85,88-91,95-97,104
// The calculator's "brain": plain JavaScript, no React.
// Every function gets the old state and returns a new one; it never changes the old one.

// The state at the start.
export const START = {
  display: '0', // the number on the screen, as text
  stored: null, // the first number, while you type the second
  operator: null, // the chosen operation: '+', '−', '×' or '÷'
  overwrite: false, // true: the next digit starts a new number
  error: false, // true: something went wrong (division by zero)
  history: [], // the earlier calculations, the newest first
}

const OPERATORS = ['+', '−', '×', '÷']

// Rounds to 12 significant digits: 0.30000000000000004 becomes 0.3.
export function roundResult(value) {
  return Number(value.toPrecision(12))
}

// One operation with two numbers. Dividing by zero gives null: there is no sensible answer.
export function calculate(a, operator, b) {
  if (operator === '+') return roundResult(a + b)
  if (operator === '−') return roundResult(a - b)
  if (operator === '×') return roundResult(a * b)
  if (b === 0) return null
  return roundResult(a / b)
}

export function inputDigit(calc, digit) {
  if (calc.overwrite) return { ...calc, display: digit, overwrite: false }
  if (calc.display === '0') return { ...calc, display: digit }
  return { ...calc, display: calc.display + digit }
}

export function inputDecimal(calc) {
  // A new number starts: the point needs a 0 in front of it.
  if (calc.overwrite) return { ...calc, display: '0.', overwrite: false }
  // A number can only have one decimal point.
  if (calc.display.includes('.')) return calc
  return { ...calc, display: calc.display + '.' }
}

export function toggleSign(calc) {
  if (calc.display === '0') return calc
  if (calc.display.startsWith('-')) return { ...calc, display: calc.display.slice(1) }
  return { ...calc, display: '-' + calc.display }
}

export function percent(calc) {
  const value = Number(calc.display)
  // With + and −, it is a percentage of the first number: 50 + 10 % is the same as 50 + 5.
  // Otherwise it is the number divided by a hundred: 10 % is 0.1.
  const base = calc.operator === '+' || calc.operator === '−' ? calc.stored : 1
  return { ...calc, display: String(roundResult((base * value) / 100)), overwrite: true }
}

export function chooseOperator(calc, operator) {
  // If an operation is already waiting (2 + 3, and now ×), work it out first, as if you had pressed =.
  const current = calc.operator && !calc.overwrite ? equals(calc) : calc
  if (current.error) return current
  return { ...current, stored: Number(current.display), operator, overwrite: true }
}

export function equals(calc) {
  // No operation chosen: nothing to work out.
  if (!calc.operator) return calc
  const b = Number(calc.display)
  const result = calculate(calc.stored, calc.operator, b)
  // We divided by zero: everything starts again, only the error shows. The history stays.
  if (result === null) return { ...START, history: calc.history, error: true }
  // A new entry at the front of the history. We do not change the old array: we make a new one.
  const entry = {
    id: calc.history.length + 1,
    expression: `${calc.stored} ${calc.operator} ${b}`,
    result: String(result),
  }
  return {
    ...calc,
    display: String(result),
    stored: null,
    operator: null,
    overwrite: true,
    history: [entry, ...calc.history],
  }
}

// An earlier result back on the screen (from the history list).
export function recall(calc, result) {
  return { ...calc, display: result, overwrite: true, error: false }
}

// Which key was pressed? That decides which function does the work.
export function press(calc, label) {
  // After C or an error everything starts again; only the history stays.
  const fresh = { ...START, history: calc.history }
  if (calc.error) return press(fresh, label)
  if ('0123456789'.includes(label)) return inputDigit(calc, label)
  if (OPERATORS.includes(label)) return chooseOperator(calc, label)
  if (label === '.') return inputDecimal(calc)
  if (label === '±') return toggleSign(calc)
  if (label === '%') return percent(calc)
  if (label === '=') return equals(calc)
  if (label === 'C') return fresh
  return calc
}
```

- Every entry is an object: `id` (for the list's `key`), `expression` (for example "12 + 3") and `result` (as text,
  the way it stands on the screen). The `id` is the length of the list plus one, so every entry gets a different one.
- The template literal `${calc.stored} ${calc.operator} ${b}` builds the same line you saw on the screen, above the
  number, now with the second number in it too.
- After C or an error we start from the new `fresh` state: the starting state, but with the old history. So clearing
  does not take the list with it.
- `recall` puts an earlier result back on the screen. Because of `overwrite: true`, a new digit replaces it, while an
  operator keeps calculating with it. If an operation is waiting, the recalled number can be its second number:
  `10 +`, then the 15 from the list, then `=` gives 25. Another operator, though, would drop the waiting operation,
  just as after %.

The list gets a component of its own. Create `src/components/History.jsx`:

```jsx file=src/components/History.jsx
// The history: earlier calculations, the newest on top. Clicking an entry puts its result back on the screen.
function History({ entries, onPick, onClear }) {
  return (
    <section className="history">
      <div className="history__head">
        <h2>History</h2>
        {entries.length > 0 && (
          <button type="button" className="history__clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="history__empty">Your calculations will show up here.</p>
      ) : (
        <ol className="history__list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button type="button" onClick={() => onPick(entry.result)}>
                <span className="history__expression">{entry.expression} =</span>
                <strong>{entry.result}</strong>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default History
```

It has two kinds of conditional rendering. The "Clear" button appears with `&&`, only when there is something to
clear. Further down, though, we choose between two things: a friendly message for an empty list, the list itself
otherwise. That is a job for the ternary operator, with JSX in both branches. `<ol>` is a numbered list; `App.css`
hides the numbers, but screen readers still know the items are in order. From the keyboard, ++Tab++ to an entry and
press ++Space++: here ++Enter++ always means `=`.

In `App`, the list gets the entries and two functions, one for a click and one for clearing. Here is the whole
`src/App.jsx` as it looks at the end of the intermediate level:

```jsx file=src/App.jsx mark=2,5,47-54,63
import { useEffect, useState } from 'react'
import { START, press, recall } from './calculator.js'
import Display from './components/Display.jsx'
import Keypad from './components/Keypad.jsx'
import History from './components/History.jsx'
import './App.css'

// The keyboard's symbols, and the key each one means. The digits mean themselves.
const KEYBOARD = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '.': '.',
  ',': '.',
  '%': '%',
  '=': '=',
  Enter: '=',
  Escape: 'C',
}

function App() {
  const [calc, setCalc] = useState(START)

  useEffect(() => {
    function handleKeyDown(event) {
      // Ctrl (on a Mac, Cmd) shortcuts, like zooming, stay with the browser.
      // Ctrl and Alt together are AltGr, though: on some keyboards (Hungarian, for one) that is how you type *.
      if (event.metaKey || (event.ctrlKey && !event.altKey)) return
      const label = '0123456789'.includes(event.key) ? event.key : KEYBOARD[event.key]
      // This key is not the calculator's.
      if (!label) return
      // Enter must not also press the key that has the focus.
      event.preventDefault()
      setCalc((current) => press(current, label))
    }

    window.addEventListener('keydown', handleKeyDown)
    // Cleanup: when App leaves the page, the listener goes too.
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handlePress(label) {
    setCalc(press(calc, label))
  }

  // An earlier result from the history list.
  function handlePick(result) {
    setCalc(recall(calc, result))
  }

  function handleClearHistory() {
    setCalc({ ...calc, history: [] })
  }

  return (
    <main className="app">
      <div className="calculator">
        <h1 className="calculator__brand">Calculator</h1>
        <Display value={calc.display} stored={calc.stored} operator={calc.operator} error={calc.error} />
        <Keypad onPress={handlePress} />
      </div>
      <History entries={calc.history} onPick={handlePick} onClear={handleClearHistory} />
    </main>
  )
}

export default App
```

:::check Check
On a wide screen, a white "History" card appears next to the calculator (below it on a phone), saying "Your
calculations will show up here." Work something out: `12 + 3 =`, then `2 + 3 × 4 =`. The top of the list says
"5 × 4 = 20", followed by "2 + 3 = 5" and "12 + 3 = 15": chained operations go on the list step by step. Click the 15:
the screen shows 15, and you can carry on, for example with `+ 1 =`. "Clear" empties the list; C, on the other hand,
only clears the screen, not the list. The intermediate level is done: commit it!
:::

:::mistake Common mistake
`calc.history.unshift(entry)` (or `push`) instead of `[entry, ...calc.history]`. These change the old array, and the
updater function brings it to light: during development, because of [[StrictMode]], React calls updater functions twice
to check that they are pure. With the keyboard, every entry then lands on the list twice. Always return a new array.
:::

:::try Task
Show next to the heading how many calculations are on the list, for example "History (3)". `entries.length` tells you.
:::

## Advanced level {level=3}

### Tests

So far you have checked the calculator by pressing its keys. That is slow, and it is easy to miss something: if you
change `calculator.js` later, how do you know percent still works? That is what [[tests|test]] are for:
small programs that run your code and check that it returns what you expect. One command runs them all, in seconds.

Node.js has a built-in test runner, so there is nothing to install. It can only run plain JavaScript, not JSX; now you
see how good it is that the calculator's brain is made of pure functions, without React. A pure function is the
easiest thing to test: for the same input it always returns the same thing.

First, `package.json` gets a new command. It is in the project's root folder; open it and add a `test` line to the
`scripts` part. Do not forget the comma at the end of the line before it:

```json file=package.json mark=4,5
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test"
  },
```

The rest of the file (the name and the list of packages) does not change. `node --test` finds every file in the
project whose name ends in `.test.js`, and runs it. Create `src/calculator.test.js`:

```js file=src/calculator.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { START, press } from './calculator.js'

// Presses the keys one after the other and returns the final state.
// for…of goes through a text letter by letter: pressAll('12+3=') presses 1, 2, +, 3 and =.
function pressAll(keys) {
  let calc = START
  for (const label of keys) {
    calc = press(calc, label)
  }
  return calc
}

test('adds', () => {
  assert.equal(pressAll('12+3=').display, '15')
})

test('works from left to right, like a pocket calculator', () => {
  assert.equal(pressAll('2+3×4=').display, '20')
})

test('0.1 + 0.2 is exactly 0.3', () => {
  assert.equal(pressAll('0.1+0.2=').display, '0.3')
})

test('50 + 10 % adds ten percent of 50', () => {
  assert.equal(pressAll('50+10%=').display, '55')
})

test('dividing by zero is an error, and after C the screen shows 0 again', () => {
  const calc = pressAll('7÷0=')
  assert.equal(calc.error, true)
  assert.equal(press(calc, 'C').display, '0')
})
```

- `node:test` and `node:assert/strict` are Node's built-in modules; the `node:` prefix says that they do not come from
  the `node_modules` folder.
- `test(name, function)` is one test. The name says what it checks; the function is the check itself.
- `assert.equal(actual, expected)` compares the two values. If they differ, the test fails, and the runner prints both.
- In `'2+3×4='`, `×` is the label of the key again, not the letter x, and so is `÷`.

Run the tests in the terminal. You do not have to stop the development server: open a second terminal (in VS Code,
with the `+` in the terminal's tab bar).

```shell
npm test
```

:::check Check
The terminal shows five lines with a green tick (✔), each with the name of a test, and below them the summary:
`tests 5`, `pass 5`, `fail 0`.
:::

:::mistake Common mistake
`Missing script: "test"`: the `test` line did not go into the `scripts` part, or you did not save `package.json`. And
if the error message says `EJSONPARSE` or `JSON.parse`, the comma at the end of the `"preview"` line is probably
missing.
:::

:::try Try it
Break the first test on purpose: write `'16'` instead of `'15'`, and run it again. A red `✖` marks the failure, and the
error message shows both the value it got (`actual`) and the one it expected (`expected`). Then fix it back.
:::

### The words of a formula: tokens

The second test says what you already know: our calculator thinks `2 + 3 × 4` is 20, while maths class says 14,
because multiplication comes before addition. This is [[operator precedence]]. A pocket calculator works out every
operation the moment you press an operator, so it cannot know what is coming next. To respect the order, we first have
to see the whole formula: in a text field, for example, where you type `2 + 3 * 4`.

Text like this is read by a [[parser]], and now you are going to write one. It reads the way you do: first it splits
the sentence into words, then it understands them. The words of a formula are its [[tokens|token]]: the numbers, the
operators and the parentheses. The tokens of `'12+3*(4-1)'` are `'12'`, `'+'`, `'3'`, `'*'`, `'('`, `'4'`, `'-'`,
`'1'`, `')'`. A space is not a token, it only separates them. Since you are going to type the formula, the parser uses
the keyboard's symbols: `*`, `/` and a plain `-`.

Create `src/parser.js`:

```js file=src/parser.js
// The formula parser. It works in two steps: first it splits the formula into tokens (tokenize),
// then it works out the result from the tokens (evaluate, in the next step).

const DIGITS = '0123456789.'
const SYMBOLS = '+-*/()'

// '12+3*(4-1)' → ['12', '+', '3', '*', '(', '4', '-', '1', ')']
export function tokenize(text) {
  const tokens = []
  let i = 0 // the position of the character we are at
  while (i < text.length) {
    const char = text[i]
    if (char === ' ') {
      // A space only separates, it is not a token.
      i++
    } else if (DIGITS.includes(char)) {
      // A number can have more than one character: we collect them as long as digits or points come.
      let number = ''
      while (i < text.length && DIGITS.includes(text[i])) {
        number += text[i]
        i++
      }
      tokens.push(number)
    } else if (SYMBOLS.includes(char)) {
      tokens.push(char)
      i++
    } else {
      throw new Error(`Unknown character: ${char}`)
    }
  }
  return tokens
}
```

- `while` repeats its body as long as its condition is true. `i` says which character we are at, and `text[i]` is the
  character itself. Every branch has to move `i` on, otherwise the loop would look at the same character forever.
- A number can have more than one character (`'12'`, `'2.5'`), so an inner `while` collects characters as long as
  digits or points come.
- When the character is unknown, `throw` [[throws an error|throwing an error]]: the function stops at once, and the
  error travels up until a `try/catch` catches it (you saw one in the copy button of lesson 3). The text of
  `new Error(…)` is the error message; later the formula field will show it.

The parser's tests go into a file of their own. Create `src/parser.test.js`:

```js file=src/parser.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tokenize } from './parser.js'

test('splits the formula into numbers, symbols and parentheses', () => {
  assert.deepEqual(tokenize('12+3*(4-1)'), ['12', '+', '3', '*', '(', '4', '-', '1', ')'])
})

test('skips spaces and keeps a decimal number in one piece', () => {
  assert.deepEqual(tokenize(' 2.5 * 40 '), ['2.5', '*', '40'])
})

test('throws an error on an unknown character', () => {
  assert.throws(() => tokenize('2 # 3'))
})
```

`assert.deepEqual` compares two arrays item by item. `assert.equal` would not work here: two separate arrays are not
"the same", even when they hold the same things. `assert.throws` checks that the function it gets throws an error.

:::check Check
`npm test` now runs eight tests (the five old ones and three from the new file), all with a green tick: `pass 8`.
:::

:::mistake Common mistake
The `i++` is missing from the space branch. At the first space the loop gets stuck on the same character forever:
`npm test` never finishes, and the terminal just waits. ++Ctrl++ + ++C++ stops it; then look for the branch that does
not move on.
:::

### Operator precedence and parentheses

Now for the second half of the parser, which works out the result from the tokens. The trick is to describe a formula
the way you learnt it in maths class:

- A **formula** is a sum or difference of terms: `2 + 3*4` has two terms, `2` and `3*4`.
- A **term** is a product or quotient of factors: `3*4` is two factors.
- A **factor** is a number, or a part in parentheses, which is a whole formula itself, or a minus sign followed by a
  factor (`-5`).

These three sentences become three functions: `parseExpression` (formula), `parseTerm` (term) and `parseFactor`
(factor). The weaker operation holds the stronger ones together: `parseExpression` only adds once `parseTerm` has
worked out the products. So `2 + 3*4` makes this tree:

```text
      +
     / \
    2   *
       / \
      3   4
```

First the `*` at the bottom is worked out (12), then the `+` at the top (14). Here is the whole `src/parser.js`, with
the new `evaluate` function:

```js file=src/parser.js mark=1,4,36-100
import { roundResult } from './calculator.js'

// The formula parser. It works in two steps: first it splits the formula into tokens (tokenize),
// then it works out the result from the tokens (evaluate).

const DIGITS = '0123456789.'
const SYMBOLS = '+-*/()'

// '12+3*(4-1)' → ['12', '+', '3', '*', '(', '4', '-', '1', ')']
export function tokenize(text) {
  const tokens = []
  let i = 0 // the position of the character we are at
  while (i < text.length) {
    const char = text[i]
    if (char === ' ') {
      // A space only separates, it is not a token.
      i++
    } else if (DIGITS.includes(char)) {
      // A number can have more than one character: we collect them as long as digits or points come.
      let number = ''
      while (i < text.length && DIGITS.includes(text[i])) {
        number += text[i]
        i++
      }
      tokens.push(number)
    } else if (SYMBOLS.includes(char)) {
      tokens.push(char)
      i++
    } else {
      throw new Error(`Unknown character: ${char}`)
    }
  }
  return tokens
}

// Works out the formula, respecting operator precedence and parentheses.
export function evaluate(text) {
  const tokens = tokenize(text)
  let position = 0 // the position of the token we are at

  // The next token: we look at it, but do not move on.
  function peek() {
    return tokens[position]
  }

  // The next token, and we move on by one.
  function next() {
    const token = tokens[position]
    position++
    return token
  }

  // The next token has to be exactly this one, for example a closing parenthesis.
  function expect(symbol) {
    if (next() !== symbol) throw new Error(`Missing ${symbol}`)
  }

  // Formula: a sum or difference of terms. The weakest operation, so it holds the others together.
  function parseExpression() {
    let value = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const operator = next()
      const right = parseTerm()
      value = operator === '+' ? value + right : value - right
    }
    return value
  }

  // Term: a product or quotient of factors. Stronger, so it is worked out first.
  function parseTerm() {
    let value = parseFactor()
    while (peek() === '*' || peek() === '/') {
      const operator = next()
      const right = parseFactor()
      if (operator === '/' && right === 0) throw new Error('Cannot divide by zero')
      value = operator === '*' ? value * right : value / right
    }
    return value
  }

  // Factor: a number, a formula in parentheses, or a minus sign.
  function parseFactor() {
    const token = next()
    if (token === undefined) throw new Error('The formula is incomplete')
    if (token === '-') return -parseFactor()
    if (token === '(') {
      const value = parseExpression()
      expect(')')
      return value
    }
    const value = Number(token)
    if (Number.isNaN(value)) throw new Error(`Unexpected symbol: ${token}`)
    return value
  }

  const result = parseExpression()
  // A token left over is one we could not place, like at the end of "2 3" or "(1+2))".
  if (position < tokens.length) throw new Error(`Unexpected symbol: ${peek()}`)
  return roundResult(result)
}
```

- There are functions inside `evaluate`, too. Inner functions can see the variables of the function around them (this
  is the [[closure]] you know from lesson 7): `peek` and `next` use the same `tokens` array and the same `position`
  counter, so every inner function is at the same place in the tokens.
- `peek` looks at the next token, `next` takes it as well. When the tokens run out, `tokens[position]` is `undefined`:
  that is when `parseFactor` says the formula is incomplete (for example `2 +`).
- `parseExpression` first asks for a term, then, as long as `+` or `-` comes, asks for another one and adds or
  subtracts it. `parseTerm` does the same with factors, `*` and `/`. Both work from left to right, so `10 - 4 - 3` is
  correctly 3.
- At a parenthesis, `parseFactor` calls `parseExpression`, which calls `parseTerm`, which calls `parseFactor` again: in
  the end, a function calls itself (through other functions). This is [[recursion]]. It does not spin forever, because
  every call takes at least one token, and the tokens run out at some point. That is why parentheses inside
  parentheses work to any depth: `2*(3+(4-1))`.
- `Number(token)` gives `NaN` when the token is not a number (for example the `*` at the start of `*2`). `NaN` is not
  even equal to itself, so we check it with `Number.isNaN`. `expect` is for the closing parenthesis: if the next token
  is anything else, the parenthesis is missing.
- At the end, one more check: a token left over means the formula is wrong (`2 3` is two numbers with no operation).

Change `src/parser.test.js`: the first lines load `evaluate` as well, and five new tests go at the end.

```js file=src/parser.test.js mark=3,17-42
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { evaluate, tokenize } from './parser.js'

test('splits the formula into numbers, symbols and parentheses', () => {
  assert.deepEqual(tokenize('12+3*(4-1)'), ['12', '+', '3', '*', '(', '4', '-', '1', ')'])
})

test('skips spaces and keeps a decimal number in one piece', () => {
  assert.deepEqual(tokenize(' 2.5 * 40 '), ['2.5', '*', '40'])
})

test('throws an error on an unknown character', () => {
  assert.throws(() => tokenize('2 # 3'))
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
  assert.throws(() => evaluate('2+'))
  assert.throws(() => evaluate('(1+2'))
  assert.throws(() => evaluate('2 3'))
  assert.throws(() => evaluate('1/0'))
})
```

:::check Check
`npm test` runs 13 tests, all green: `pass 13`.
:::

:::mistake Common mistake
`+ -` and `* /` get swapped between `parseExpression` and `parseTerm`. The parser then works in the opposite order:
it says `2+3*4` is 20. Luckily there is a test for that: "multiplication and division come before…" fails, and prints
that it got 20 instead of 14.
:::

### A formula field

The parser is ready, but only the tests can see it. Let us give it a text field of its own below the calculator:
whatever you type into it, its result appears under it straight away. The field is a [[controlled input]], like in
lessons 3 and 4: it gets its value from state, and every key stroke updates the state. Create
`src/components/FormulaBar.jsx`:

```jsx file=src/components/FormulaBar.jsx
import { useState } from 'react'
import { evaluate } from '../parser.js'

function FormulaBar() {
  const [text, setText] = useState('')

  // The result follows from the text: we work it out on every drawing instead of storing it.
  let message = ''
  let failed = false
  if (text.trim() !== '') {
    try {
      message = '= ' + evaluate(text)
    } catch (error) {
      message = error.message
      failed = true
    }
  }

  return (
    <section className="formula">
      <h2>Formula</h2>
      <label className="formula__field">
        Type a formula, for example (2 + 3) * 4
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <p className={failed ? 'formula__result is-error' : 'formula__result'} role="status">
        {message}
      </p>
    </section>
  )
}

export default FormulaBar
```

- The result is a [[derived value]]: it follows from the text, so it does not get state of its own; we work it out on
  every drawing, like the strength meter in lesson 3.
- `text.trim()` cuts the spaces off the start and end of the text. If nothing is left, there is nothing to work out.
- We calculate in the `try` part. If `evaluate` throws an error, `catch` catches it and gets the error itself too
  (`error`). `error.message` is the text we gave to `new Error(…)` in the parser, for example "The formula is
  incomplete".
- Because of `role="status"`, screen readers read out the result when it changes.

Put the field into `App`, after the history. There is one more thing: the keyboard listener sits on `window` and gets
every key press, including the ones you type into the text field. A key press [[bubbles|event bubbling]] up from the
field through its parents, all the way to `window`. So from now on the listener ignores key presses that happen in an
input field: `event.target` is the element where the key was pressed, and `tagName` is its name in capitals.
`src/App.jsx` changes in three places: a new import at the top, a new line at the start of `handleKeyDown`, and
`<FormulaBar />` after the history. Everything else stays as it was:

```jsx file=src/App.jsx mark=1,9,10,23
import FormulaBar from './components/FormulaBar.jsx'
// … the other imports and KEYBOARD, as before

function App() {
  // … the calc state, as before

  useEffect(() => {
    function handleKeyDown(event) {
      // What you type into the formula field belongs to the field, not to the calculator.
      if (event.target.tagName === 'INPUT') return
      // … the rest of the function, as before
    }

    // … adding and removing the listener, as before
  }, [])

  // … handlePress, handlePick and handleClearHistory, as before

  return (
    <main className="app">
      {/* … the calculator, as before … */}
      <History entries={calc.history} onPick={handlePick} onClear={handleClearHistory} />
      <FormulaBar />
    </main>
  )
}
```

:::check Check
The "Formula" card appears below the calculator (on a phone, at the bottom of the page, after the history). Type
`2 + 3 * 4`. Below it, in
green: "= 14". `(2 + 3) * 4` gives 20, and `2 * (3 + (4 - 1))` gives 12. While the formula is unfinished (for example
`2 +`), it says "The formula is incomplete" in red, and for `7 / 0` it says "Cannot divide by zero". Meanwhile the
calculator's screen does not change.
:::

:::mistake Common mistake
The `tagName` check is missing. Then the digits and operators you type into the field show up on the calculator's
screen instead: they never reach the field, because `preventDefault()` blocks them. And ++Enter++ presses `=` from the
field too.
:::

:::concept Two kinds of calculator
You now have two calculators, and they work differently. The pocket calculator with keys says 20 for `2 + 3 × 4`,
because it works out every operation as soon as you press an operator. The formula field says 14, because it reads the
whole formula first. Both are "right" in their own way: cheap pocket calculators still work like the first one, while
scientific calculators and spreadsheets work like the second.
:::

### Scientific functions

The last step: the parser learns powers (`2^10`), square roots (`sqrt(16)`), sine and cosine (`sin(30)`, `cos(60)`),
and pi (`pi`). It takes three things:

1. The tokenizer has to recognise the `^` symbol and names made of letters (`sqrt`, `pi`).
2. Powers are even stronger than multiplication, so they get a new level: `parsePower`, between `parseTerm` and
   `parseFactor`. A new level of strength is always a new function between its two neighbours.
3. `parseFactor` recognises `pi` and the function names.

The functions go into a [[Map]]. A Map pairs names with values, like an object. `new Map([...])` makes one from a list
of pairs, and each pair is a small array: the name first, the value second. `has(name)` tells whether a name is in it
(like `has` of the `Set` at the advanced level of lesson 3), and `get(name)` gives its value. Why not a plain object?
An object also has a few hidden built-in names (for example `constructor`), so someone typing `constructor(2)` into the
formula would find a "function" we never wrote. A Map knows only what we put into it. This time the values are the
functions themselves: you can keep a function in a collection just like a number. Careful with the trigonometric functions:
`Math.sin` works in [[radians|radian]], not degrees. A full circle is 360 degrees, or 2π radians, so multiplying the
degrees by `π / 180` gives radians. Here is the whole `src/parser.js`:

```js file=src/parser.js mark=7,8,10-16,35-42,88,91,98-106,108,118-125,134,135
import { roundResult } from './calculator.js'

// The formula parser. It works in two steps: first it splits the formula into tokens (tokenize),
// then it works out the result from the tokens (evaluate).

const DIGITS = '0123456789.'
const SYMBOLS = '+-*/()^'
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

// The names of the functions, and what they do. The trigonometric ones work in degrees, like calculators;
// thanks to the toFixed(12) rounding, cos(90) is exactly 0.
const FUNCTIONS = new Map([
  ['sqrt', (x) => Math.sqrt(x)],
  ['sin', (x) => Number(Math.sin((x * Math.PI) / 180).toFixed(12))],
  ['cos', (x) => Number(Math.cos((x * Math.PI) / 180).toFixed(12))],
])

// '12+3*(4-1)' → ['12', '+', '3', '*', '(', '4', '-', '1', ')']
export function tokenize(text) {
  const tokens = []
  let i = 0 // the position of the character we are at
  while (i < text.length) {
    const char = text[i]
    if (char === ' ') {
      // A space only separates, it is not a token.
      i++
    } else if (DIGITS.includes(char)) {
      // A number can have more than one character: we collect them as long as digits or points come.
      let number = ''
      while (i < text.length && DIGITS.includes(text[i])) {
        number += text[i]
        i++
      }
      tokens.push(number)
    } else if (LETTERS.includes(char)) {
      // A name, like sqrt or pi: we collect letters as long as they come.
      let name = ''
      while (i < text.length && LETTERS.includes(text[i])) {
        name += text[i]
        i++
      }
      tokens.push(name)
    } else if (SYMBOLS.includes(char)) {
      tokens.push(char)
      i++
    } else {
      throw new Error(`Unknown character: ${char}`)
    }
  }
  return tokens
}

// Works out the formula, respecting operator precedence and parentheses.
export function evaluate(text) {
  const tokens = tokenize(text)
  let position = 0 // the position of the token we are at

  // The next token: we look at it, but do not move on.
  function peek() {
    return tokens[position]
  }

  // The next token, and we move on by one.
  function next() {
    const token = tokens[position]
    position++
    return token
  }

  // The next token has to be exactly this one, for example a closing parenthesis.
  function expect(symbol) {
    if (next() !== symbol) throw new Error(`Missing ${symbol}`)
  }

  // Formula: a sum or difference of terms. The weakest operation, so it holds the others together.
  function parseExpression() {
    let value = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const operator = next()
      const right = parseTerm()
      value = operator === '+' ? value + right : value - right
    }
    return value
  }

  // Term: a product or quotient of factors. Stronger, so it is worked out first.
  function parseTerm() {
    let value = parsePower()
    while (peek() === '*' || peek() === '/') {
      const operator = next()
      const right = parsePower()
      if (operator === '/' && right === 0) throw new Error('Cannot divide by zero')
      value = operator === '*' ? value * right : value / right
    }
    return value
  }

  // Power: the strongest operation. It goes from right to left: 2^3^2 means 2^(3^2), that is 2^9.
  function parsePower() {
    const base = parseFactor()
    if (peek() === '^') {
      next()
      return base ** parsePower()
    }
    return base
  }

  // Factor: a number, pi, a function, a formula in parentheses, or a minus sign.
  function parseFactor() {
    const token = next()
    if (token === undefined) throw new Error('The formula is incomplete')
    if (token === '-') return -parseFactor()
    if (token === '(') {
      const value = parseExpression()
      expect(')')
      return value
    }
    if (token === 'pi') return Math.PI
    if (FUNCTIONS.has(token)) {
      // After the function's name comes what to apply it to, in parentheses: sqrt(16).
      expect('(')
      const value = parseExpression()
      expect(')')
      return FUNCTIONS.get(token)(value)
    }
    const value = Number(token)
    if (Number.isNaN(value)) throw new Error(`Unexpected symbol: ${token}`)
    return value
  }

  const result = parseExpression()
  // A token left over is one we could not place, like at the end of "2 3" or "(1+2))".
  if (position < tokens.length) throw new Error(`Unexpected symbol: ${peek()}`)
  // sqrt(-1) or 10^400 has no result we could show.
  if (!Number.isFinite(result)) throw new Error('I cannot calculate this')
  return roundResult(result)
}
```

- The `LETTERS` branch collects characters just like the number branch, only letters: the tokens of `sqrt(16)` are
  `'sqrt'`, `'('`, `'16'`, `')'`.
- `toFixed(12)`, which you know from lesson 7, rounds to 12 digits after the decimal point, not to 12 significant
  digits like `roundResult`. With the trigonometric functions that matters: the cosine of 90 degrees is not exactly 0
  but a tiny number around 0.00000000000000006 (JavaScript writes it as `6.123233995736766e-17`). `roundResult` would
  keep it, because this tiny number has 12 significant digits of its own. After `toFixed(12)` (and `Number()`),
  exactly 0 is left of it.
- `parsePower` asks for a factor, and if `^` follows, it asks `parsePower` again for the exponent: that is what makes
  it go from right to left, as in maths (`2^3^2` means 2^(3^2), that is 2⁹ = 512). `**` is JavaScript's power
  operator; you know it from lesson 3.
- `parseTerm` now calls `parsePower` instead of `parseFactor`: that is how the new level gets between the old ones.
- `FUNCTIONS.get(token)` takes the function out of the Map, and the `(value)` after it calls it right away.
- At the end there is a new check: `Number.isFinite` is true only for ordinary, finite numbers. The square root of a
  negative number (`NaN`) and a number that is too big (`Infinity`) get an error message.

Add the three new tests to the end of `src/parser.test.js`:

```js file=src/parser.test.js
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
})

test('throws an error on an unknown name and on a meaningless result', () => {
  assert.throws(() => evaluate('foo(2)'))
  assert.throws(() => evaluate('sqrt(-1)'))
})
```

Finally, the formula field gets a row of buttons for common symbols, because `^` or parentheses are hard to type on a
phone. A button adds its symbol to the end of the formula, then gives the focus back to the field so that you can keep
typing. For that we need to reach the field from our code: that is what [[useRef]] is for (you used it for the camera
in lesson 5). `useRef(null)` gives you a
small box; React puts the field into its compartment called `current` when the field gets the `ref={inputRef}` prop.
So `inputRef.current.focus()` focuses the field itself. Here is the whole `src/components/FormulaBar.jsx`:

```jsx file=src/components/FormulaBar.jsx mark=1,4-13,17,18,20-24,44,52-58
import { useRef, useState } from 'react'
import { evaluate } from '../parser.js'

// Buttons for common symbols: the label, and what they add to the end of the formula.
const SHORTCUTS = [
  { label: '(', insert: '(' },
  { label: ')', insert: ')' },
  { label: 'xʸ', insert: '^' },
  { label: '√', insert: 'sqrt(' },
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'π', insert: 'pi' },
]

function FormulaBar() {
  const [text, setText] = useState('')
  // A box in which React keeps the input field: this way we can give the focus back to it.
  const inputRef = useRef(null)

  function insert(part) {
    setText(text + part)
    // Clicking a button moves the focus to the button; we give it back to the field so you can keep typing.
    inputRef.current.focus()
  }

  // The result follows from the text: we work it out on every drawing instead of storing it.
  let message = ''
  let failed = false
  if (text.trim() !== '') {
    try {
      message = '= ' + evaluate(text)
    } catch (error) {
      message = error.message
      failed = true
    }
  }

  return (
    <section className="formula">
      <h2>Formula</h2>
      <label className="formula__field">
        Type a formula, for example (2 + 3) * 4
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <div className="formula__shortcuts">
        {SHORTCUTS.map((item) => (
          <button key={item.label} type="button" onClick={() => insert(item.insert)}>
            {item.label}
          </button>
        ))}
      </div>
      <p className={failed ? 'formula__result is-error' : 'formula__result'} role="status">
        {message}
      </p>
    </section>
  )
}

export default FormulaBar
```

One last catch: you can also reach the new buttons with ++Tab++, but the keyboard listener in `App` would turn
++Enter++ on them into `=`. (After a click this does not come up: `insert` gives the focus back to the field.) One more
line at the start of `handleKeyDown` in `src/App.jsx` lets the buttons of the formula card keep ++Enter++:

```jsx file=src/App.jsx mark=4,5
    function handleKeyDown(event) {
      // What you type into the formula field belongs to the field, not to the calculator.
      if (event.target.tagName === 'INPUT') return
      // Enter on a button of the formula card presses that button, not =.
      if (event.key === 'Enter' && event.target.closest('.formula')) return
      // … the rest of the function, as before
    }
```

`closest('.formula')` looks for the element itself or one of its parents with the `formula` class, and gives `null` if
there is none. So the condition is true only for an ++Enter++ inside the formula card.

:::check Check
`npm test` runs 16 tests, all green. In the browser, seven buttons appear below the field. Click `√` and type `16)`.
The field says `sqrt(16)`, with "= 4" below it. Try these too: `2^10` gives 1024, `sin(30)` gives 0.5, `2*pi` gives
6.28318530718, and the answer to `sqrt(-1)` is "I cannot calculate this". ++Tab++ to a button and press ++Enter++:
its symbol goes into the field, and the calculator's screen does not change. Congratulations, your calculator is done!
:::

:::mistake Common mistake
The conversion from degrees to radians is missing, and the function is just `Math.sin(x)`. Then `sin(30)` is
−0.988031624093 instead of 0.5, because JavaScript takes it as 30 radians, which is almost five full turns.
:::

:::try Task
Teach the parser the tangent and the base-10 logarithm: two new lines in `FUNCTIONS` (`'tan'` and `'log'`, with
`Math.tan` and `Math.log10`; do not forget the conversion for the tangent), two new buttons in `SHORTCUTS`, and a test
or two. Then check what `-2^2` gives. Here it is 4, because our minus sign is stronger than the power, as in
spreadsheets; in maths class, though, it is −4. If that bothers you, the minus has to be handled by a new level between
`parseTerm` and `parsePower` instead of `parseFactor`.
:::
