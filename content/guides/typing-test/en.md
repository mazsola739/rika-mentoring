# What we build

A typing speed test. A short passage appears, you type it, and meanwhile the page measures the time and works out how
fast and how accurate you are. Letters you type right turn dark, wrong ones turn red, and a blinking line shows where
you are. In the end you follow your speed on a chart, your best results on a leaderboard, and you can even race
someone in two browser windows.

On the way you get to know the `useRef` hook better: a box that React keeps between renders, but that never triggers a
new render when its content changes. You learn how to start and stop a timer precisely, what an app works out on every
single keystroke, and how to skip the renders that are not needed.

:::levels
- Typing a passage, timing it with a stopwatch, characters per minute, starting over. | about 2 hours
- Live highlighting (right / wrong), words per minute and accuracy, a 30 and a 60 second mode, fewer redraws. | about 3 hours
- A live chart while you type, history and progress, a leaderboard, a race between two browser windows. | about 3 hours
:::

**Before you start you need:** the earlier lessons. We build mostly on these: controlled fields (lessons 3 and 4),
`setInterval` and the cleanup function (lessons 11–13), `useRef` for an HTML element (lessons 12 and 13), the closure
trap (lessons 7 and 13) and the `useLocalStorage` hook (lessons 6, 9 and 13). Wherever something familiar is used in a
new way, we explain it again.

## Beginner level {level=1}

### Before you start

The starting project of this lesson is the `lessons/16-typing-test/exercise` folder of the course repository on
GitHub (above: "Exercise on GitHub"). You get it the same way as in the earlier lessons; lesson 1 explains every step
in detail. In the terminal, in your work folder (the one that holds the `rika-mentoring` folder):

```shell
cd rika-mentoring
git pull        # brings the new lessons into the repository
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/16-typing-test/exercise typing-test
```

If you do not have the repository yet, run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the
first three lines. No git? On the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring) choose
**Code → Download ZIP**, and copy the `lessons/16-typing-test/exercise` folder out of it into your work folder. You can
also copy the folder in your file manager; what matters is that your copy is called `typing-test` and sits outside the
`rika-mentoring` folder, so `git pull` keeps working. Open your copy in the editor, then type these two commands in the
editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white panel in the middle of the page,
with the title "Typing Speed Test". Nothing else is on it yet: building the test is your job.
:::

The exercise has three files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready (the panel, the small stat boxes, the coloured letters, the
  blinking cursor, the chart, the race lanes…). You don't write these; you only use the class names the steps give you
  (`typing`, `stats`, `passage`, …).
- `src/passages.js`: four short practice passages in an array. These are what you will type.

Feel free to change the passages or add your own. Stick to plain punctuation, though: curly quotes and long dashes are
not on an ordinary keyboard, so you would meet a character you can't type.

Last, make your copy a git repository with one commit, the starting point. Leave the server running and open a second
terminal (the **+** button in the terminal panel; it opens in `typing-test` too):

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step that
works.

:::concept A quick recap: what does "render" mean?
When the [[state]] of a component changes, React runs the component's function again, from the first line to the
last, and updates the screen from the [[JSX]] it gets back. This is a render. Everything the function creates with
`const` or `let` is created anew on every render; only what React keeps for you survives, like the value of
`useState`. This lesson builds on that a lot: the clock of the typing test renders ten times a second.
:::

### The passage and a typing field

First, show the passage to type, with a field under it to type into. `PASSAGES` is an [[array]] whose items are pieces
of text ([[string]]s), so `PASSAGES[0]` is the first practice passage.

The typing goes into a [[textarea]], a text field with several lines. Like in lessons 3 and 4, we make it a
[[controlled input]]: its value (`value`) comes from state, and on every keystroke `onChange` updates the state. Every
string has a `length` property, its number of characters (a space or a full stop is a character too). The `maxLength`
attribute asks the browser to accept no more characters than that.

The numbers go into a [[description list]], like in lesson 13: inside a `<dl>`, a `<dt>` holds a name and a `<dd>` its
value, and the `stats` class of `App.css` draws a small box from every `<div>`. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=1-2,6-7,12-32
import { useState } from 'react'
import { PASSAGES } from './passages.js'
import './App.css'

function App() {
  const [typed, setTyped] = useState('')
  const text = PASSAGES[0]

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <dl className="stats">
        <div>
          <dt>Characters</dt>
          <dd>
            {typed.length} / {text.length}
          </dd>
        </div>
      </dl>
      <p className="typing__text">{text}</p>
      <textarea
        className="typing__field"
        aria-label="Type the passage above here"
        placeholder="Start typing the passage above…"
        value={typed}
        maxLength={text.length}
        onChange={(event) => setTyped(event.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </main>
  )
}

export default App
```

- `typed` is what you have typed so far. It starts as an empty string.
- `aria-label` gives the field a name for screen readers, since there is no visible label next to it (the grey
  `placeholder` text disappears as soon as you type, so it doesn't count as a label).
- The last four attributes switch off the browser's "help": the red wavy underline of the spell checker, the
  suggestions of earlier input, autocorrect on phones and the capital letter at the start of a sentence. In a typing
  test they would only get in the way: your phone would correct your typos, and it would no longer be your typing that
  counts.

:::check Check
Under the title there is a box: "Characters 0 / 193" (`App.css` writes the name in capitals). Below it, on a grey background, the first practice
passage, and at the bottom an empty field that says "Start typing the passage above…". Type into it: the number grows
by one with every letter and goes down with ++Backspace++, and after the 193rd character the field accepts no more.
:::

:::mistake Common mistake
`text.length()`, with brackets. `length` is not a function but a property: a number that belongs to the string. With
the brackets JavaScript tries to call it, the page goes blank, and the console (++F12++) says: "text.length is not a
function".
:::

:::try Try it
Change `PASSAGES[0]` to `PASSAGES[3]`: the fourth passage appears, since counting starts at 0. Then set it back.
:::

### A stopwatch: useRef

Now let's time you from the first keystroke to the last. `Date.now()` gives the current time as a number, in
milliseconds (this is the [[timestamp]] you met in lesson 11). The difference of two timestamps is the time that has
passed: if we keep the value of `Date.now()` from the first keystroke, we can work out at any moment how long it has
been since.

That takes two new pieces of state: `startedAt` is the timestamp of the first keystroke, and `now` is "now". The time
passed is the difference of the two, a [[derived value]]. For the clock to run while you type, `now` has to be updated
often: that is the job of [[setInterval]], which calls a function every tenth of a second (every 100 milliseconds).

So far a timer was always started and stopped by a `useEffect` (in lesson 13, for example, it watched `running`). This
time we do it differently: the first keystroke starts the timer and the last one stops it, both in the `onChange`
[[event handler]]. `setInterval` returns an id (a number), and that id is what you give `clearInterval` to stop it.
The trouble is that the id is born at the first keystroke and needed at the last, hundreds of keystrokes later. Where
do we keep it until then?

- **In an ordinary variable?** A `let timer = null` in the component won't do. The component's function runs again on
  every render, and `timer` is born again as `null` every time. By the time the last letter arrives, the id is long
  lost, and nothing stops the clock.
- **In state?** That would work, but every save would redraw the page for nothing: the id never appears on the screen.

This is what [[useRef]] is for. In lessons 12 and 13 you used it to get hold of an HTML element, but it is actually a
simpler thing: `useRef(null)` gives you an object, `{ current: null }`, and React hands back **the same** object on
every render. Whatever you put into its `current` field stays there until you overwrite it, and React does not redraw
when it changes. A box next to the component. With the `ref={…}` attribute, React put an element into it; now we put a
number into it ourselves, the id of the timer.

:::concept State or ref?
- If something appears on the screen and the screen must be redrawn when it changes: **state** (`typed`, `startedAt`,
  `now`).
- If only your code needs it between renders and it never shows on the screen: **ref** (the id of the timer).
:::

We show the time as minutes:seconds.tenths. Create the `src/stats.js` file; the calculations of the lesson will live
in it:

```js file=src/stats.js
// Milliseconds as minutes:seconds.tenths, for example 75 300 becomes "1:15.3".
export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  const tenths = Math.floor((ms % 1000) / 100)
  return `${minutes}:${seconds}.${tenths}`
}
```

This is lesson 13's `formatTime`, except that it gets milliseconds and also shows the tenths of a second. `%` is the
remainder of a division ([[modulo]]): `75300 % 1000` is 300, the milliseconds that have passed in the current second,
and dividing that by 100 gives the tenths. [[padStart]] puts a zero in front of the seconds: `1:05.3`, not `1:5.3`.
Now replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=1,3,8-12,15,17-20,22-24,26-40,46-49,64
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { formatTime } from './stats.js'
import './App.css'

function App() {
  const [typed, setTyped] = useState('')
  // When the first key was pressed, and what the time is now (in milliseconds).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // The id of the running timer. A ref: it survives every render, but changing it draws nothing.
  const timerRef = useRef(null)

  const text = PASSAGES[0]
  const elapsed = startedAt === null ? 0 : now - startedAt

  // If the component disappears while the clock runs, the timer stops too.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // The first character starts the clock: it updates every tenth of a second.
    if (startedAt === null) {
      setStartedAt(time)
      timerRef.current = setInterval(() => setNow(Date.now()), 100)
    }
    // The last character stops it.
    if (value.length === text.length) {
      stopTimer()
    }
    setNow(time)
    setTyped(value)
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <dl className="stats">
        <div>
          <dt>Time</dt>
          <dd>{formatTime(elapsed)}</dd>
        </div>
        <div>
          <dt>Characters</dt>
          <dd>
            {typed.length} / {text.length}
          </dd>
        </div>
      </dl>
      <p className="typing__text">{text}</p>
      <textarea
        className="typing__field"
        aria-label="Type the passage above here"
        placeholder="Start typing the passage above…"
        value={typed}
        maxLength={text.length}
        onChange={handleChange}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </main>
  )
}

export default App
```

- `handleChange` runs on every keystroke. If `startedAt` is still `null`, this is the first one: we keep the time and
  start the timer. Its id goes into `timerRef.current`.
- The timer's function does not count tenths: every time, it asks for the real time (`Date.now()`). So the clock stays
  exact even if the browser is a little late now and then (you read about this in lesson 13).
- If the typed text is as long as the passage, that was the last character: `stopTimer` stops the clock.
- `setNow(time)` also records the moment of the keystroke, so at the last keystroke `now` is exactly the moment you
  finished, and it stays there.
- The [[effect|useEffect]] with an empty [[dependency array]] runs only once, after the first render. It does
  nothing except return a [[cleanup function]], which React calls when the component disappears from the page. `App`
  never disappears, but it is a good habit: an abandoned timer never keeps ticking into nothing.

:::check Check
A new box appears: "Time 0:00.0". As long as you don't type, it stands still. With the first letter it starts, and the
tenths start running. When you type the last character (193 / 193), it stops, at 0:52.3 for example, and stays there.
:::

:::mistake Common mistake
`clearInterval(timerRef)`, without `.current`. Then you hand over the box itself, not the number inside it;
`clearInterval` doesn't recognise it, silently does nothing, and the clock keeps running after the last character.
:::

:::try Try it
Below the `setInterval` line, write `console.log(timerRef.current)` and look at the console (++F12++ → Console) after
the first keystroke. The id is just a number, 5 for example. That is all the ref has to keep here. Then delete the line.
:::

### Characters per minute

We have the time; now the speed. Characters per minute tells you how many characters you would type in a whole minute
at this pace: the number of characters divided by the minutes that have passed. The time is in milliseconds and a
minute has 60,000 of them, so the number of minutes is `ms / 60000`. For example, 193 characters in 52.3 seconds (0.87
minutes) is about 221 characters per minute. Add this to the end of `src/stats.js`:

```js file=src/stats.js
// Characters per minute: how many characters you would type in a whole minute at this pace.
export function charsPerMinute(chars, ms) {
  // In the first second it would jump around wildly: 1 character in 0.1 seconds is 600 a minute.
  if (ms < 1000) return 0
  return Math.round(chars / (ms / 60000))
}
```

[[Math.round]] rounds to the nearest whole number. `App` gets two new derived values: `done` is true when you have
typed every character, and `cpm` (characters per minute) is the speed. When you are done, the field becomes
`readOnly`: you can see it, but you can't type into it. A dark bar shows the result; thanks to `role="status"`, screen
readers read it out when it appears. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=3,16-17,58-61,70,77-81
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { charsPerMinute, formatTime } from './stats.js'
import './App.css'

function App() {
  const [typed, setTyped] = useState('')
  // When the first key was pressed, and what the time is now (in milliseconds).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // The id of the running timer. A ref: it survives every render, but changing it draws nothing.
  const timerRef = useRef(null)

  const text = PASSAGES[0]
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length
  const cpm = charsPerMinute(typed.length, elapsed)

  // If the component disappears while the clock runs, the timer stops too.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // The first character starts the clock: it updates every tenth of a second.
    if (startedAt === null) {
      setStartedAt(time)
      timerRef.current = setInterval(() => setNow(Date.now()), 100)
    }
    // The last character stops it.
    if (value.length === text.length) {
      stopTimer()
    }
    setNow(time)
    setTyped(value)
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <dl className="stats">
        <div>
          <dt>Time</dt>
          <dd>{formatTime(elapsed)}</dd>
        </div>
        <div>
          <dt>Characters</dt>
          <dd>
            {typed.length} / {text.length}
          </dd>
        </div>
        <div>
          <dt>Chars/min</dt>
          <dd>{cpm}</dd>
        </div>
      </dl>
      <p className="typing__text">{text}</p>
      <textarea
        className="typing__field"
        aria-label="Type the passage above here"
        placeholder="Start typing the passage above…"
        value={typed}
        maxLength={text.length}
        readOnly={done}
        onChange={handleChange}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      {done && (
        <p className="result" role="status">
          Done in {formatTime(elapsed)}: {cpm} characters per minute.
        </p>
      )}
    </main>
  )
}

export default App
```

This is "computing on every keystroke": `done` and `cpm` are not stored anywhere, we work them out again from `typed`
and the time on every render. That way the speed on the screen and the text you typed can never disagree.

:::check Check
The third box, "Chars/min", is 0 in the first second, then jumps around a little while you type and slowly settles.
After the last character the field turns grey and takes no more letters, and a dark bar appears under it, for example
"Done in 0:52.3: 221 characters per minute."
:::

:::mistake Common mistake
Leaving out `Math.round`. Then the box shows numbers like 221.43678160919541. The calculation isn't wrong, but all
those decimals say nothing, and they change every tenth of a second.
:::

:::try Cheaters welcome?
Type one letter, wait two seconds, then copy the rest of the passage with the mouse and paste it (++Ctrl++ + ++V++):
done in a moment, at thousands of characters per minute. Fix it: give the `<textarea>` an
`onPaste={(event) => event.preventDefault()}` attribute. `onPaste` runs when something is pasted, and
`preventDefault()` cancels the browser's [[default behavior]], the pasting itself. From here on, the full listings of
`App` include this line.
:::

### Start over, with the cursor ready

After a test you want another go, or a different passage. Starting over sets every piece of state back to its first
value and stops the clock. It would be nice if you could then type straight away, without clicking. For that the
cursor, the [[focus]], has to go back into the field. The field has a function for that, `focus()`, but it can only be
called on the real HTML element. That element is what `ref={…}` gives you, as in lessons 12 and 13: after rendering,
React puts the element into the box, and from then on `inputRef.current` is the `<textarea>` itself.

Now you have two refs with two different jobs: `timerRef` keeps a value (the id of the timer), `inputRef` an element.
It is the same tool: a box that survives the renders.

Two more things:

- **Next passage.** The `index` state says which passage you are typing. `(index + 1) % PASSAGES.length` goes round
  with modulo: 0, 1, 2, 3, then 0 again.
- **Keys.** `onKeyDown` runs for every key you press, before the character is typed, and `event.key` tells you which
  key it was. ++Esc++ starts over, and ++Enter++ should do nothing: there are no line breaks in the passage, so a typed
  line break could only ever be a mistake.

Here is the whole `src/App.jsx` as it looks at the end of the beginner level (with the `onPaste` line from the last
task):

```jsx file=src/App.jsx mark=7,14-15,17,47-54,56-59,61-66,89,97-98,109-116
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { charsPerMinute, formatTime } from './stats.js'
import './App.css'

function App() {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // When the first key was pressed, and what the time is now (in milliseconds).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // The id of the running timer. A ref: it survives every render, but changing it draws nothing.
  const timerRef = useRef(null)
  // The text field itself, so that the code can put the cursor into it.
  const inputRef = useRef(null)

  const text = PASSAGES[index]
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length
  const cpm = charsPerMinute(typed.length, elapsed)

  // If the component disappears while the clock runs, the timer stops too.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // The first character starts the clock: it updates every tenth of a second.
    if (startedAt === null) {
      setStartedAt(time)
      timerRef.current = setInterval(() => setNow(Date.now()), 100)
    }
    // The last character stops it.
    if (value.length === text.length) {
      stopTimer()
    }
    setNow(time)
    setTyped(value)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    // The cursor goes back into the field: you can type straight away.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: start over.
    if (event.key === 'Escape') restart()
    // The passage is one long line: Enter would only type a wrong character.
    if (event.key === 'Enter') event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <dl className="stats">
        <div>
          <dt>Time</dt>
          <dd>{formatTime(elapsed)}</dd>
        </div>
        <div>
          <dt>Characters</dt>
          <dd>
            {typed.length} / {text.length}
          </dd>
        </div>
        <div>
          <dt>Chars/min</dt>
          <dd>{cpm}</dd>
        </div>
      </dl>
      <p className="typing__text">{text}</p>
      <textarea
        ref={inputRef}
        className="typing__field"
        aria-label="Type the passage above here"
        placeholder="Start typing the passage above…"
        value={typed}
        maxLength={text.length}
        readOnly={done}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={(event) => event.preventDefault()}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      {done && (
        <p className="result" role="status">
          Done in {formatTime(elapsed)}: {cpm} characters per minute.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Start over
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Next passage
        </button>
      </div>
    </main>
  )
}

export default App
```

`restart` sets four pieces of state one after the other. That doesn't mean four renders: React waits until the event
handler has finished, and renders once afterwards, with all the changes together.

:::check Check
Type a few words and press ++Esc++: the field empties, the clock jumps to 0:00.0, and the cursor blinks in the field,
so you can carry on typing without clicking. "Next passage" brings the second practice passage, and after the fourth
the first one again. After a finished test, "Start over" makes the field writable again. ++Enter++ does nothing. That
completes the beginner level: commit it!
:::

:::mistake Common mistake
Leaving `ref={inputRef}` off the `<textarea>`. Then no element ever gets into the box, and `inputRef.current` stays
`null`. "Start over" still empties the field and sets the clock back to 0:00.0, but the cursor doesn't go back into the
field (it stays on the button), and the console says: "Cannot read properties of null (reading 'focus')".
:::

:::try Try it
Add `autoFocus` to the `<textarea>`. Then the cursor is already blinking in the field when the page loads, and you can
start right away.
:::

## Intermediate level {level=2}

### Live highlighting

We swap the grey box and the field for one coloured passage: every character shows whether you typed it right. For
that, every character of the passage goes into a `<span>` of its own, with its own class: `char--ok` (right),
`char--bad` (wrong) or `char--todo` (still to come). Which one is worked out on every render: character `i` is right
if character `i` of `typed` is the same.

The new component goes into the `src/components/Passage.jsx` file (create the `components` folder too):

```jsx file=src/components/Passage.jsx
// The passage character by character: typed right, typed wrong, or still to come.
function Passage({ text, typed }) {
  return (
    <p className="passage">
      {[...text].map((char, i) => {
        let state = 'todo'
        if (i < typed.length) {
          state = typed[i] === char ? 'ok' : 'bad'
        }
        // The cursor blinks in front of the next character to type.
        const current = i === typed.length ? ' is-current' : ''
        return (
          <span key={i} className={`char char--${state}${current}`}>
            {char}
          </span>
        )
      })}
    </p>
  )
}

export default Passage
```

- `[...text]` is [[spread]] on a string: it splits the text into an array of characters (`'abc'` → `['a', 'b', 'c']`),
  and that array can be walked through with `map`.
- The `key` is the position of the character this time, `i`. In lesson 9 you learned that a position is a bad key when
  the items of a list can change places. These never do: the fifth character is always the fifth, so the position is a
  perfect key.
- The `is-current` class goes to the character that comes next (its position equals the length of what you typed).
  `App.css` draws the blinking cursor in front of it.

And where do we type? The `<textarea>` stays, it just becomes invisible: the `typing__input` class turns it into a
tiny transparent field in the corner of the box. It still receives the keys, and the coloured passage shows what
happened. Since the field can't be seen, a click on the box gives it the focus through the ref.

There is one more trap: in the invisible field the arrow keys (and ++Home++, ++End++) would move the cursor, and the
next letter would land in the middle of the text. So we block those as well. [[includes]] tells you whether an item is
in an array. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=4,7-8,68-69,91-110
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { charsPerMinute, formatTime } from './stats.js'
import Passage from './components/Passage.jsx'
import './App.css'

// Keys that would move the cursor in the invisible field: it always stays at the end of the text.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

function App() {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // When the first key was pressed, and what the time is now (in milliseconds).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // The id of the running timer. A ref: it survives every render, but changing it draws nothing.
  const timerRef = useRef(null)
  // The text field itself, so that the code can put the cursor into it.
  const inputRef = useRef(null)

  const text = PASSAGES[index]
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length
  const cpm = charsPerMinute(typed.length, elapsed)

  // If the component disappears while the clock runs, the timer stops too.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // The first character starts the clock: it updates every tenth of a second.
    if (startedAt === null) {
      setStartedAt(time)
      timerRef.current = setInterval(() => setNow(Date.now()), 100)
    }
    // The last character stops it.
    if (value.length === text.length) {
      stopTimer()
    }
    setNow(time)
    setTyped(value)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    // The cursor goes back into the field: you can type straight away.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: start over.
    if (event.key === 'Escape') restart()
    // Enter would only type a wrong character, and the arrows would move the cursor.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <dl className="stats">
        <div>
          <dt>Time</dt>
          <dd>{formatTime(elapsed)}</dd>
        </div>
        <div>
          <dt>Characters</dt>
          <dd>
            {typed.length} / {text.length}
          </dd>
        </div>
        <div>
          <dt>Chars/min</dt>
          <dd>{cpm}</dd>
        </div>
      </dl>
      {/* A click on the box gives the cursor to the invisible field. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Type the passage here"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Click the text and start typing. Esc: start over.</p>
      {done && (
        <p className="result" role="status">
          Done in {formatTime(elapsed)}: {cpm} characters per minute.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Start over
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Next passage
        </button>
      </div>
    </main>
  )
}

export default App
```

After every keystroke, `Passage` runs again and compares all 193 characters again. This is the second kind of
"computing on every keystroke": we don't store which letters were right, we work it out every time. For a computer, a
few hundred comparisons are nothing; they take a tiny fraction of a millisecond.

:::check Check
The passage now stands in a white box with a border, in grey letters that are all the same width, with a faint line
that stands still in front of the first letter. Click the box: its border turns green and the line starts blinking.
Type: the letters you hit turn dark, a wrong letter gets a pink background and a wavy underline, and the blinking line
moves on. After a ++Backspace++ the wrong letter is grey again. The arrow keys do nothing.
:::

:::mistake Common mistake
Leaving `key={i}` off the `<span>`. The page works, but a red warning appears in the console: "Each child in a list
should have a unique "key" prop". Every item of a list made with `map` needs a key; that is how React keeps track of
which is which.
:::

### Mistakes, accuracy and words per minute

Around the world, typing speed is measured in words per minute (WPM). So that a long word and a short one don't count
the same, the usual rule is that **every 5 characters count as one word** (spaces included), and only correct
characters count. Words per minute is therefore roughly a fifth of characters per minute, without the mistakes.

Accuracy shows what percentage of your keystrokes hit. It can't be worked out from the typed text: if you hit a wrong
letter and then fix it, the text is perfect, but you did make the mistake. So we count the keystrokes and the
mistakes at the moment they happen, in `handleChange`, and keep them in two new pieces of state: `keystrokes` and
`mistakes`. Real typing tests do it the same way; otherwise anyone could type sloppily and fix it all afterwards.

The calculations first. Add these to the end of `src/stats.js`:

```js file=src/stats.js
// How many characters match the passage, compared position by position.
export function countCorrect(typed, text) {
  let count = 0
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === text[i]) count++
  }
  return count
}

// Words per minute: by the usual rule, every 5 correct characters count as one word.
export function wordsPerMinute(correctChars, ms) {
  if (ms < 1000) return 0
  return Math.round(correctChars / 5 / (ms / 60000))
}

// Accuracy in percent: the share of keystrokes that hit. 100 before the first keystroke.
export function accuracyPercent(keystrokes, mistakes) {
  if (keystrokes === 0) return 100
  return Math.round(((keystrokes - mistakes) / keystrokes) * 100)
}
```

The four numbers get a component of their own, in the `src/components/Stats.jsx` file. The time comes in two props:
the time itself (`time`) and its label (`timeLabel`). For now the label is always "Time", but in the next step there
will be a countdown too.

```jsx file=src/components/Stats.jsx
import { formatTime } from '../stats.js'

// The live numbers in a row: speed, accuracy, time.
function Stats({ wpm, accuracy, cpm, time, timeLabel }) {
  return (
    <dl className="stats">
      <div>
        <dt>WPM</dt>
        <dd>{wpm}</dd>
      </div>
      <div>
        <dt>Accuracy</dt>
        <dd>{accuracy}%</dd>
      </div>
      <div>
        <dt>Chars/min</dt>
        <dd>{cpm}</dd>
      </div>
      <div>
        <dt>{timeLabel}</dt>
        <dd>{formatTime(time)}</dd>
      </div>
    </dl>
  )
}

export default Stats
```

In `App`, `handleChange` looks at what is new in the text: every character after the end of the old `typed`. If
`value` is shorter (something was deleted), the loop doesn't run at all, and nothing is counted. Characters per minute
now counts only the correct characters as well. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=3,5,17-19,29-33,56-64,74-75,95,118
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import './App.css'

// Keys that would move the cursor in the invisible field: it always stays at the end of the text.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

function App() {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // When the first key was pressed, and what the time is now (in milliseconds).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // All keystrokes, and how many of them were wrong; a mistake you fixed is still a mistake.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // The id of the running timer. A ref: it survives every render, but changing it draws nothing.
  const timerRef = useRef(null)
  // The text field itself, so that the code can put the cursor into it.
  const inputRef = useRef(null)

  const text = PASSAGES[index]
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length

  // Worked out again on every render: all of these follow from the state.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)

  // If the component disappears while the clock runs, the timer stops too.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // The first character starts the clock: it updates every tenth of a second.
    if (startedAt === null) {
      setStartedAt(time)
      timerRef.current = setInterval(() => setNow(Date.now()), 100)
    }
    // The last character stops it.
    if (value.length === text.length) {
      stopTimer()
    }
    // Every new character is a keystroke; if it doesn't match the passage, a mistake too. Deleting doesn't count.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    // The cursor goes back into the field: you can type straight away.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: start over.
    if (event.key === 'Escape') restart()
    // Enter would only type a wrong character, and the arrows would move the cursor.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <Stats wpm={wpm} accuracy={accuracy} cpm={cpm} time={elapsed} timeLabel="Time" />
      {/* A click on the box gives the cursor to the invisible field. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Type the passage here"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Click the text and start typing. Esc: start over.</p>
      {done && (
        <p className="result" role="status">
          Done! {wpm} WPM and {accuracy}% accuracy in {formatTime(elapsed)}.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Start over
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Next passage
        </button>
      </div>
    </main>
  )
}

export default App
```

`handleChange` now sets four pieces of state. As you saw with `restart`, React collects them and puts them on the
screen with a single render; this is called [[batching]]. In a typing test it matters: a fast typist hits 6–8 keys a
second, and each of them still causes only one render, not four.

:::check Check
Four boxes stand above the passage: "WPM", "Accuracy 100%", "Chars/min" and "Time". Hit a wrong letter on purpose:
the accuracy drops (one mistake in six keystrokes, for example, is 83%). Fix it with ++Backspace++: the letter is right again, but the
accuracy stays below 100%. While you type, WPM is about a fifth of chars/min. At the end, for example: "Done! 44 WPM
and 96% accuracy in 0:52.3."
:::

:::mistake Common mistake
Working out the mistakes from the typed text: `const mistakes = typed.length - correct`. That is a derived value, and
as soon as you fix a mistake, it disappears from it. You would almost always end with 100% accuracy, however much you
fixed along the way. Things that have already happened (here, the keystrokes) can only be counted when they happen.
:::

### Against the clock: 30 and 60 seconds

Many typing tests don't run to the end of a passage but for a fixed time: whatever you type in half a minute counts.
There will be three modes: the full passage, 30 seconds and 60 seconds. The list of modes goes into the
`src/components/ModePicker.jsx` file, together with the buttons to choose one:

```jsx file=src/components/ModePicker.jsx
// The modes of the test. seconds: null means there is no time limit.
export const MODES = [
  { id: 'passage', label: 'Full passage', seconds: null },
  { id: 'time30', label: '30 seconds', seconds: 30 },
  { id: 'time60', label: '60 seconds', seconds: 60 },
]

function ModePicker({ value, onChange }) {
  return (
    <div className="modes" role="group" aria-label="Mode">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          className="chip"
          aria-pressed={mode.id === value}
          onClick={() => onChange(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}

export default ModePicker
```

This file has a default export (the component) and a [[named export]] (`MODES`); you import both in one line like
this: `import ModePicker, { MODES } from …`. Like in lesson 13, the `aria-pressed` attribute of the buttons tells
screen readers (and the CSS) which one is pressed.

What changes in `App`:

- The time limit (`limit`) is in milliseconds, or `null` if there is none. A timed test needs plenty of text so that
  fast typists don't run out: `timedText` starts with the chosen passage and adds the others after it.
  `slice(index)` gives the items of the array from `index` to the end, `slice(0, index)` from the start up to `index`
  (without it); the spread pours the two pieces into one array (`[...a, ...b]`), and `join(' ')` joins them into
  one string with spaces.
- The test is also done when the time is up.
- The clock has to stop by itself, even when you aren't typing. Only the timer's function can notice that: every tenth
  of a second it checks whether `limit` has passed. That's why starting the clock gets a function of its own:
  `startClock`.
- The time box shows a countdown ("Time left"), and changing the mode starts over.

Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=6,12-15,18,32-35,37,54-65,70,72,106-109,121-130
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import ModePicker, { MODES } from './components/ModePicker.jsx'
import './App.css'

// Keys that would move the cursor in the invisible field: it always stays at the end of the text.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// A timed test needs a lot of text: the chosen passage, then all the others in turn.
function timedText(index) {
  return [...PASSAGES.slice(index), ...PASSAGES.slice(0, index)].join(' ')
}

function App() {
  const [modeId, setModeId] = useState('passage')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // When the first key was pressed, and what the time is now (in milliseconds).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // All keystrokes, and how many of them were wrong; a mistake you fixed is still a mistake.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // The id of the running timer. A ref: it survives every render, but changing it draws nothing.
  const timerRef = useRef(null)
  // The text field itself, so that the code can put the cursor into it.
  const inputRef = useRef(null)

  const mode = MODES.find((item) => item.id === modeId)
  // The time limit in milliseconds, or null if there is none.
  const limit = mode.seconds === null ? null : mode.seconds * 1000
  const text = limit === null ? PASSAGES[index] : timedText(index)
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length || (limit !== null && elapsed >= limit)

  // Worked out again on every render: all of these follow from the state.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)

  // If the component disappears while the clock runs, the timer stops too.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function startClock(start) {
    setStartedAt(start)
    timerRef.current = setInterval(() => {
      let passed = Date.now() - start
      // In a timed test the clock stops by itself when the time is up.
      if (limit !== null && passed >= limit) {
        passed = limit
        stopTimer()
      }
      setNow(start + passed)
    }, 100)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // The first character starts the clock, the last one stops it.
    if (startedAt === null) {
      startClock(time)
    }
    if (value.length === text.length) {
      stopTimer()
    }
    // Every new character is a keystroke; if it doesn't match the passage, a mistake too. Deleting doesn't count.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    // The cursor goes back into the field: you can type straight away.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function changeMode(id) {
    setModeId(id)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: start over.
    if (event.key === 'Escape') restart()
    // Enter would only type a wrong character, and the arrows would move the cursor.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <div className="toolbar">
        <ModePicker value={modeId} onChange={changeMode} />
      </div>
      <Stats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        time={limit === null ? elapsed : Math.max(0, limit - elapsed)}
        timeLabel={limit === null ? 'Time' : 'Time left'}
      />
      {/* A click on the box gives the cursor to the invisible field. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Type the passage here"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Click the text and start typing. Esc: start over.</p>
      {done && (
        <p className="result" role="status">
          Done! {wpm} WPM and {accuracy}% accuracy in {formatTime(elapsed)}.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Start over
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Next passage
        </button>
      </div>
    </main>
  )
}

export default App
```

In the time box, [[Math.max]] gives the bigger of the two numbers: `Math.max(0, …)` never goes below 0. If a keystroke
lands between the end of the time and the clock's next tick, the elapsed time briefly goes past the limit, and without
it a negative time left would flash up.

Take a good look at `startClock`, because this is where a ref really shines. The timer's function is born at the
first keystroke, and from then on the same function runs every tenth of a second. You know from lessons 7 and 13 that
a function sees the variables that were there where it was made: this is the [[closure]]. In the eyes of this
function, `limit` stays forever what it was at the first keystroke. Here that is fine, because the mode can only change
by starting over. `start` is its own parameter, and it doesn't change either.

And `stopTimer`? That, too, is the version from the first keystroke, but it doesn't matter: `timerRef` is the same box
on every render, so even the old function reaches the latest id in the box. With a state variable this wouldn't work:
an old function would see the old value.

:::check Check
Three buttons stand above the stats, with "Full passage" highlighted. Click "30 seconds": the last box says "Time left
0:30.0", and the passage gets long (all four practice passages one after the other). The countdown starts with the
first letter, and at 0:00.0 the test ends by itself, even if you are not typing at that moment: the field takes no more
letters, and the "Done! … in 0:30.0." bar appears. If you change the mode in the middle of a test, everything starts
over.
:::

:::mistake Common mistake
`const limit = mode.seconds * 1000`, without checking for `null`. In JavaScript `null * 1000` is 0, so in "Full
passage" mode the limit becomes 0, and since the time passed (0) has already reached it, the test never even starts:
the field is read-only from the first moment, and the "Done!" bar is there.
:::

:::try Try it
Add a fourth, 15 second mode: one new line in the `MODES` array is all it takes. You don't even have to touch `App`.
:::

### Fewer redraws: memo

While the clock runs, `setNow` gives `App` new state every tenth of a second, and every time, React renders `App`
again, and with it all of its child components. `Passage` too, which in a timed test is made of 849 `<span>`s, and
which draws exactly what it drew a tenth of a second earlier: the passage and what you typed didn't change, only the
clock did. That is wasted work. On a fast computer you won't feel it, but on an old phone it can make typing stutter.

Make it visible first. Add this line at the top of the `Passage` function (in `src/components/Passage.jsx`):

```jsx file=src/components/Passage.jsx mark=2
function Passage({ text, typed }) {
  console.log('Passage render')
  return (
```

Open the console (++F12++ → Console), start typing, then stop: "Passage render" keeps pouring in while you don't touch
anything, once every tenth of a second (twice during development, because [[StrictMode]] runs every render twice).
Chrome folds identical messages that come one after the other into one line and writes how many times it came next to
it: watch that number climb.

The fix is [[memo]]. `memo(Passage)` gives you a version of `Passage` that remembers: before rendering it again, React
compares the new props with the last ones, and if they are all equal, it skips the render and reuses the last result.
Replace the contents of `src/components/Passage.jsx`:

```jsx file=src/components/Passage.jsx mark=1,25-26
import { memo } from 'react'

// The passage character by character: typed right, typed wrong, or still to come.
function Passage({ text, typed }) {
  console.log('Passage render')
  return (
    <p className="passage">
      {[...text].map((char, i) => {
        let state = 'todo'
        if (i < typed.length) {
          state = typed[i] === char ? 'ok' : 'bad'
        }
        // The cursor blinks in front of the next character to type.
        const current = i === typed.length ? ' is-current' : ''
        return (
          <span key={i} className={`char char--${state}${current}`}>
            {char}
          </span>
        )
      })}
    </p>
  )
}

// memo draws it again only if text or typed has changed: the ticking clock doesn't count.
export default memo(Passage)
```

You don't have to touch `App`: it still imports the file's default export, which is now the remembering version. `App`
still renders every tenth of a second, and so does `Stats` (the time in it changes), but that is little work: a few
numbers.

How does React decide whether two props are equal? Numbers and strings are compared by value: `'The city'` and another
`'The city'` are equal. Objects, arrays and functions, however, are compared by whether they are **the same** one: an
array made during a render is never equal to the earlier one, even with the same things in it. Both of our props are
strings, so all is well. (`timedText` joins the timed text again on every render, but the result is the same string,
so it is equal.)

:::check Check
Type, then stop: in the console the count of "Passage render" now grows only when you press a key, not with the ticking
clock. The letters change colour just as before. Once you have seen it, delete the `console.log` line. That completes
the intermediate level: commit it!
:::

:::mistake Common mistake
An array or object made during the render as a prop, for example `<Passage chars={[...text]} typed={typed} />`. It is a
new array on every render, `memo` never finds it equal to the old one, and `Passage` renders every tenth of a second as
if there were no `memo` at all.
:::

:::concept And useMemo and useCallback?
If a `memo` component does need an object, an array or a function as a prop, two hooks help to keep it from being a
new one on every render. `useMemo(() => [...text], [text])` makes a new array only when `text` has changed;
`useCallback(fn, [...])` does the same with a function. This app doesn't need them. Use them only where a measurement
or a `console.log` shows you that an unnecessary render is happening.
:::

## Advanced level {level=3}

### A live chart

While you type, a line should show how your speed develops: one point per second, your WPM so far. The points go into
a new piece of state: every item of the `samples` array is the speed measured at the end of a second.

Who notices that a second has passed? The timer's function, which runs every tenth of a second. But that function was
born at the first keystroke, and because of the closure, `typed` is empty for it forever, and the number of correct
characters is 0 forever. An [[updater function]] (`setSamples((list) => …)`) is not enough here: it gives you the latest
`samples`, but we need a value worked out from a different piece of state, `typed`.

The answer is a ref again. On every keystroke, `handleChange` puts the latest number of correct characters into the
`correctRef` box, and the timer's function reads it from there. The box is the same on every render, so the old
function always sees the newest number. This is the ref's third job in this lesson: a bridge between the events and an
old function.

One rule comes with it: don't read or write a ref during rendering (in the body of the component), only in event
handlers, effects or timers. React doesn't know when the content of a ref changes, so a render that reads from it could
easily show something out of date. That's why the chart is drawn from the `samples` state, not from the ref.

The chart is [[SVG]], a picture made of shapes that you can write straight into JSX. `viewBox="0 0 300 100"` gives
you a drawing area 300 units wide and 100 units high; `<polyline>` is a line with corners, whose `points` attribute
lists `x,y` pairs separated by spaces. In SVG, `y` grows downwards, which is why the `height - …` formula puts the
point of a big value higher up. Create the `src/components/SpeedChart.jsx` file:

```jsx file=src/components/SpeedChart.jsx
// A line chart in SVG: every item of values is a point, from left to right.
function SpeedChart({ values, caption }) {
  // A line needs at least two points.
  if (values.length < 2) return null

  const width = 300
  const height = 100
  const peak = Math.max(...values)
  // The top of the chart is the biggest value (but at least 10, so a slow start doesn't reach the sky).
  const top = Math.max(10, peak)
  const points = values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - (value / top) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <polyline points={points} />
      </svg>
      <figcaption>
        {caption} · peak: {peak} WPM
      </figcaption>
    </figure>
  )
}

export default SpeedChart
```

- The first point goes to the left edge (`x = 0`), the last one to the right edge (`x = 300`), and the others evenly
  between them.
- `Math.max(...values)` is the biggest item of the array: the spread hands the items to `Math.max` one by one.
- `preserveAspectRatio="none"` lets the drawing area stretch to the full width of the panel; `App.css` makes sure the
  line doesn't get thicker because of it.
- `aria-hidden` hides the picture from screen readers, while the text of `<figcaption>` tells them what matters.

In `App` come the `samples` state and `correctRef`; the timer adds a point in every new second, and starting over
empties both. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=7,28-29,34-35,68-70,96-97,107-108,176
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import ModePicker, { MODES } from './components/ModePicker.jsx'
import SpeedChart from './components/SpeedChart.jsx'
import './App.css'

// Keys that would move the cursor in the invisible field: it always stays at the end of the text.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// A timed test needs a lot of text: the chosen passage, then all the others in turn.
function timedText(index) {
  return [...PASSAGES.slice(index), ...PASSAGES.slice(0, index)].join(' ')
}

function App() {
  const [modeId, setModeId] = useState('passage')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // When the first key was pressed, and what the time is now (in milliseconds).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // All keystrokes, and how many of them were wrong; a mistake you fixed is still a mistake.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // The speed (WPM) at the end of every second: the live chart is drawn from this.
  const [samples, setSamples] = useState([])
  // The id of the running timer. A ref: it survives every render, but changing it draws nothing.
  const timerRef = useRef(null)
  // The text field itself, so that the code can put the cursor into it.
  const inputRef = useRef(null)
  // The latest number of correct characters: the clock's function can't see the fresh `correct`, only this box.
  const correctRef = useRef(0)

  const mode = MODES.find((item) => item.id === modeId)
  // The time limit in milliseconds, or null if there is none.
  const limit = mode.seconds === null ? null : mode.seconds * 1000
  const text = limit === null ? PASSAGES[index] : timedText(index)
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length || (limit !== null && elapsed >= limit)

  // Worked out again on every render: all of these follow from the state.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)

  // If the component disappears while the clock runs, the timer stops too.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function startClock(start) {
    setStartedAt(start)
    timerRef.current = setInterval(() => {
      let passed = Date.now() - start
      // In a timed test the clock stops by itself when the time is up.
      if (limit !== null && passed >= limit) {
        passed = limit
        stopTimer()
      }
      // In every new second, a new point for the chart: the speed so far.
      const second = Math.floor(passed / 1000)
      setSamples((list) => (second > list.length ? [...list, wordsPerMinute(correctRef.current, passed)] : list))
      setNow(start + passed)
    }, 100)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // The first character starts the clock, the last one stops it.
    if (startedAt === null) {
      startClock(time)
    }
    if (value.length === text.length) {
      stopTimer()
    }
    // Every new character is a keystroke; if it doesn't match the passage, a mistake too. Deleting doesn't count.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
    // The box always gets the latest number: the clock's function reads it from here.
    correctRef.current = countCorrect(value, text)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    setSamples([])
    correctRef.current = 0
    // The cursor goes back into the field: you can type straight away.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function changeMode(id) {
    setModeId(id)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: start over.
    if (event.key === 'Escape') restart()
    // Enter would only type a wrong character, and the arrows would move the cursor.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <div className="toolbar">
        <ModePicker value={modeId} onChange={changeMode} />
      </div>
      <Stats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        time={limit === null ? elapsed : Math.max(0, limit - elapsed)}
        timeLabel={limit === null ? 'Time' : 'Time left'}
      />
      {/* A click on the box gives the cursor to the invisible field. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Type the passage here"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Click the text and start typing. Esc: start over.</p>
      {done && (
        <p className="result" role="status">
          Done! {wpm} WPM and {accuracy}% accuracy in {formatTime(elapsed)}.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Start over
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Next passage
        </button>
      </div>
      <SpeedChart values={samples} caption="Speed second by second" />
    </main>
  )
}

export default App
```

`setSamples` gets an updater function. If `second` (the number of whole seconds passed) is bigger than the number
of points so far, a new point goes onto the end of the list; if not, the function returns the same list. In that case
React sees that nothing has changed, and doesn't render because of it. That's how a timer running every tenth of a
second makes one point a second.

:::check Check
Start typing: after two seconds a green line appears under the buttons and grows by one point every second, with
"Speed second by second · peak: 52 WPM" under it. If you stop for a while, the line slopes down (time goes on, but no
characters come). At the end of the test the line stays; ++Esc++ clears it.
:::

:::mistake Common mistake
Using the `correct` variable in the timer instead of the ref: `wordsPerMinute(correct, passed)`. The line stays at the
bottom of the chart, because the timer's function was born at the first keystroke, and for it `correct` is 0
forever. This is the closure trap; the ref is the way out.
:::

:::try Try it
Do a 30 second test and watch the start of the line: in the first few seconds it jumps wildly, because it works with
few characters and little time. That's why `charsPerMinute` and `wordsPerMinute` give 0 in the first second.
:::

### History and progress

Are you getting better? To find out, every finished test has to be saved, and the results shown one after the other.
The results must survive a reload of the page, so they go into the browser's [[localStorage]]. In lessons 6, 9 and 13
you wrote a `useLocalStorage` hook that works like `useState` but also saves the value. If you have your own version at
hand, and it returns a `[value, setter]` pair in the same way, use it. (If yours is the lesson 10 version that takes
over every key from the other windows through the `storage` event, create this file instead: otherwise the two race
windows could not have two different names.) If not, create the `src/useLocalStorage.js` file:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Like useState, but it also saves the value in localStorage, so it survives a reload.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? initialValue : JSON.parse(saved)
    } catch {
      // Storage blocked or a broken save: start with the initial value.
      return initialValue
    }
  })

  // Save every change, as text.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // No harm if it fails: then we only remember for this visit.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

When do we save? When the test ends. But the end can come from two places: from the last keystroke (`handleChange`) or
from the clock, when the time is up. The clock's function sees old values, too, so it can't save a correct result.
There is one point, though, where both paths meet: the render in which `done` becomes true. There, every number is
fresh. An effect watches it: if `done` is true, it saves the result.

Everything the effect uses goes into its dependency array. After the end of a test these values don't change any more
(the clock has stopped, the field is read-only), but to make sure nothing is ever saved twice, the saving is
[[idempotent]]: however many times it runs, the outcome is the same. Every test has its own start time (`startedAt`),
which becomes the id of the result (`at`); if the list already has it, the updater function returns the list
unchanged. [[some]] tells you whether the array has an item for which the condition is true. `slice(0, 100)` keeps the
newest 100 results, so the list doesn't grow forever.

The history box goes into the `src/components/History.jsx` file:

```jsx file=src/components/History.jsx
import SpeedChart from './SpeedChart.jsx'

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

// The results so far in one mode: progress on a chart, the last five runs under it.
function History({ runs }) {
  // runs starts with the newest. The chart goes forward in time from left to right, so we reverse it.
  const speeds = runs.map((run) => run.wpm).toReversed()

  return (
    <section className="panel">
      <h2>History</h2>
      {runs.length === 0 && <p className="empty">No saved results in this mode yet.</p>}
      <SpeedChart values={speeds} caption="Your runs in order" />
      <ol className="history">
        {runs.slice(0, 5).map((run) => (
          <li key={run.at}>
            <span>{DATE_FORMAT.format(run.at)}</span>
            <strong>{run.wpm} WPM</strong>
            <span>{run.accuracy}%</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default History
```

- [[Intl.DateTimeFormat]] is familiar from lesson 11: it turns a timestamp into a readable date, like "23 Nov, 21:35".
- `toReversed()` gives a reversed copy of the array and leaves the original alone (like `toSorted` does for sorting).
- The progress chart is the same `SpeedChart` you wrote in the previous step, only now every point is a test. That's
  why it was worth making it a component of its own.

In `App` come the new state (`history`), the results of the chosen mode (`runs`, a derived value) and the saving
effect. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=4,9,32-33,53-54,61-70,194-196
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import useLocalStorage from './useLocalStorage.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import ModePicker, { MODES } from './components/ModePicker.jsx'
import SpeedChart from './components/SpeedChart.jsx'
import History from './components/History.jsx'
import './App.css'

// Keys that would move the cursor in the invisible field: it always stays at the end of the text.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// A timed test needs a lot of text: the chosen passage, then all the others in turn.
function timedText(index) {
  return [...PASSAGES.slice(index), ...PASSAGES.slice(0, index)].join(' ')
}

function App() {
  const [modeId, setModeId] = useState('passage')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // When the first key was pressed, and what the time is now (in milliseconds).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // All keystrokes, and how many of them were wrong; a mistake you fixed is still a mistake.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // The speed (WPM) at the end of every second: the live chart is drawn from this.
  const [samples, setSamples] = useState([])
  // The results so far, newest first: they survive a reload.
  const [history, setHistory] = useLocalStorage('typing-test-history', [])
  // The id of the running timer. A ref: it survives every render, but changing it draws nothing.
  const timerRef = useRef(null)
  // The text field itself, so that the code can put the cursor into it.
  const inputRef = useRef(null)
  // The latest number of correct characters: the clock's function can't see the fresh `correct`, only this box.
  const correctRef = useRef(0)

  const mode = MODES.find((item) => item.id === modeId)
  // The time limit in milliseconds, or null if there is none.
  const limit = mode.seconds === null ? null : mode.seconds * 1000
  const text = limit === null ? PASSAGES[index] : timedText(index)
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length || (limit !== null && elapsed >= limit)

  // Worked out again on every render: all of these follow from the state.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)
  // Only the results of the chosen mode.
  const runs = history.filter((run) => run.mode === modeId)

  // If the component disappears while the clock runs, the timer stops too.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  // When the test ends (with the last character or when the time is up), the result goes into the history.
  useEffect(() => {
    if (!done) return
    setHistory((list) => {
      // startedAt is different for every run: if this run is already in the list, it doesn't go in again.
      if (list.some((run) => run.at === startedAt)) return list
      const result = { at: startedAt, mode: modeId, wpm, accuracy, cpm }
      return [result, ...list].slice(0, 100)
    })
  }, [done, startedAt, modeId, wpm, accuracy, cpm, setHistory])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function startClock(start) {
    setStartedAt(start)
    timerRef.current = setInterval(() => {
      let passed = Date.now() - start
      // In a timed test the clock stops by itself when the time is up.
      if (limit !== null && passed >= limit) {
        passed = limit
        stopTimer()
      }
      // In every new second, a new point for the chart: the speed so far.
      const second = Math.floor(passed / 1000)
      setSamples((list) => (second > list.length ? [...list, wordsPerMinute(correctRef.current, passed)] : list))
      setNow(start + passed)
    }, 100)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // The first character starts the clock, the last one stops it.
    if (startedAt === null) {
      startClock(time)
    }
    if (value.length === text.length) {
      stopTimer()
    }
    // Every new character is a keystroke; if it doesn't match the passage, a mistake too. Deleting doesn't count.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
    // The box always gets the latest number: the clock's function reads it from here.
    correctRef.current = countCorrect(value, text)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    setSamples([])
    correctRef.current = 0
    // The cursor goes back into the field: you can type straight away.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function changeMode(id) {
    setModeId(id)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: start over.
    if (event.key === 'Escape') restart()
    // Enter would only type a wrong character, and the arrows would move the cursor.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <div className="toolbar">
        <ModePicker value={modeId} onChange={changeMode} />
      </div>
      <Stats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        time={limit === null ? elapsed : Math.max(0, limit - elapsed)}
        timeLabel={limit === null ? 'Time' : 'Time left'}
      />
      {/* A click on the box gives the cursor to the invisible field. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Type the passage here"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Click the text and start typing. Esc: start over.</p>
      {done && (
        <p className="result" role="status">
          Done! {wpm} WPM and {accuracy}% accuracy in {formatTime(elapsed)}.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Start over
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Next passage
        </button>
      </div>
      <SpeedChart values={samples} caption="Speed second by second" />
      <div className="boards">
        <History runs={runs} />
      </div>
    </main>
  )
}

export default App
```

:::check Check
A grey box titled "History" appears at the bottom: "No saved results in this mode yet." Finish a test: the first line
appears with the date (for example "23 Nov, 21:35"), the speed ("44 WPM") and the accuracy ("96%"). Reload the page
(++F5++): the result is still there. After the second finished test, the progress line appears too. Switch to
"30 seconds": its history is still empty.
:::

:::mistake Common mistake
Saving in `handleChange`, where the last character arrives. It works in "Full passage" mode, but in a timed test the
end comes from the clock, not from a keystroke, and those results never make it into the list.
:::

:::try Task
Under the title of `History`, show the average of the last five tests. You already have `runs.slice(0, 5)`, and a
`for … of` loop is enough to add up the numbers (or `reduce`, if you know it already).
:::

### A leaderboard

If several of you use the same computer, you need a leaderboard: the best five results in the chosen mode, with names.
The name goes into a new field next to the mode buttons. `useLocalStorage` keeps it too, so nobody has to type it in
every time. If it is empty, it becomes "Anonymous" (`trim()` cuts the spaces off both ends, and an empty string counts
as false, so the right side of `||` comes in).

The leaderboard is not new state: we work it out from the history on every render. [[toSorted]] is familiar from
lessons 9 and 10: it gives a sorted copy, and the [[compare function]] decides which item comes first. `b.wpm - a.wpm`
is negative when `b` is the slower one, so the faster one goes first. If the two speeds are equal, the difference is
0, which counts as false, so `||` gives the right side: the more accurate one goes first. Create the
`src/components/Leaderboard.jsx` file:

```jsx file=src/components/Leaderboard.jsx
const MEDALS = ['🥇', '🥈', '🥉']

// The best five results in one mode: the faster one first, and with equal speed the more accurate one.
function Leaderboard({ runs, latest }) {
  const top = runs.toSorted((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy).slice(0, 5)

  return (
    <section className="panel">
      <h2>Leaderboard</h2>
      {top.length === 0 && <p className="empty">Your first result goes straight to the top.</p>}
      <ol className="leaderboard">
        {top.map((run, i) => (
          <li key={run.at} className={run.at === latest ? 'is-new' : ''}>
            <span>{MEDALS[i] ?? `${i + 1}.`}</span>
            <span className="leaderboard__name">{run.name ?? 'Anonymous'}</span>
            <strong>{run.wpm} WPM</strong>
            <span>{run.accuracy}%</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Leaderboard
```

- The first three places get a medal. `MEDALS[3]` is `undefined`, and then `??` (the [[nullish coalescing]] you met in
  lesson 13) gives the right side: "4.", "5.".
- The results saved in the previous step have no name yet; `??` gives them one too.
- `latest` is the id of the test you have just finished. Its row is highlighted (`is-new`), so you can see where you
  landed.

In `App`, the name field goes into the `toolbar`, the name into the result (and so among the dependencies of the saving
effect), and `Leaderboard` next to the history. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=10,33,35,55,70,73,155-164,208
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import useLocalStorage from './useLocalStorage.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import ModePicker, { MODES } from './components/ModePicker.jsx'
import SpeedChart from './components/SpeedChart.jsx'
import History from './components/History.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import './App.css'

// Keys that would move the cursor in the invisible field: it always stays at the end of the text.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// A timed test needs a lot of text: the chosen passage, then all the others in turn.
function timedText(index) {
  return [...PASSAGES.slice(index), ...PASSAGES.slice(0, index)].join(' ')
}

function App() {
  const [modeId, setModeId] = useState('passage')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // When the first key was pressed, and what the time is now (in milliseconds).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // All keystrokes, and how many of them were wrong; a mistake you fixed is still a mistake.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // The speed (WPM) at the end of every second: the live chart is drawn from this.
  const [samples, setSamples] = useState([])
  // The results so far (newest first) and the player's name: both survive a reload.
  const [history, setHistory] = useLocalStorage('typing-test-history', [])
  const [player, setPlayer] = useLocalStorage('typing-test-player', '')
  // The id of the running timer. A ref: it survives every render, but changing it draws nothing.
  const timerRef = useRef(null)
  // The text field itself, so that the code can put the cursor into it.
  const inputRef = useRef(null)
  // The latest number of correct characters: the clock's function can't see the fresh `correct`, only this box.
  const correctRef = useRef(0)

  const mode = MODES.find((item) => item.id === modeId)
  // The time limit in milliseconds, or null if there is none.
  const limit = mode.seconds === null ? null : mode.seconds * 1000
  const text = limit === null ? PASSAGES[index] : timedText(index)
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length || (limit !== null && elapsed >= limit)

  // Worked out again on every render: all of these follow from the state.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)
  const playerName = player.trim() || 'Anonymous'
  // Only the results of the chosen mode.
  const runs = history.filter((run) => run.mode === modeId)

  // If the component disappears while the clock runs, the timer stops too.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  // When the test ends (with the last character or when the time is up), the result goes into the history.
  useEffect(() => {
    if (!done) return
    setHistory((list) => {
      // startedAt is different for every run: if this run is already in the list, it doesn't go in again.
      if (list.some((run) => run.at === startedAt)) return list
      const result = { at: startedAt, mode: modeId, name: playerName, wpm, accuracy, cpm }
      return [result, ...list].slice(0, 100)
    })
  }, [done, startedAt, modeId, playerName, wpm, accuracy, cpm, setHistory])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function startClock(start) {
    setStartedAt(start)
    timerRef.current = setInterval(() => {
      let passed = Date.now() - start
      // In a timed test the clock stops by itself when the time is up.
      if (limit !== null && passed >= limit) {
        passed = limit
        stopTimer()
      }
      // In every new second, a new point for the chart: the speed so far.
      const second = Math.floor(passed / 1000)
      setSamples((list) => (second > list.length ? [...list, wordsPerMinute(correctRef.current, passed)] : list))
      setNow(start + passed)
    }, 100)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // The first character starts the clock, the last one stops it.
    if (startedAt === null) {
      startClock(time)
    }
    if (value.length === text.length) {
      stopTimer()
    }
    // Every new character is a keystroke; if it doesn't match the passage, a mistake too. Deleting doesn't count.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
    // The box always gets the latest number: the clock's function reads it from here.
    correctRef.current = countCorrect(value, text)
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    setSamples([])
    correctRef.current = 0
    // The cursor goes back into the field: you can type straight away.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function changeMode(id) {
    setModeId(id)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: start over.
    if (event.key === 'Escape') restart()
    // Enter would only type a wrong character, and the arrows would move the cursor.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <div className="toolbar">
        <ModePicker value={modeId} onChange={changeMode} />
        <label className="field">
          <span>Your name</span>
          <input
            type="text"
            value={player}
            placeholder="Anonymous"
            maxLength={20}
            onChange={(event) => setPlayer(event.target.value)}
          />
        </label>
      </div>
      <Stats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        time={limit === null ? elapsed : Math.max(0, limit - elapsed)}
        timeLabel={limit === null ? 'Time' : 'Time left'}
      />
      {/* A click on the box gives the cursor to the invisible field. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Type the passage here"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Click the text and start typing. Esc: start over.</p>
      {done && (
        <p className="result" role="status">
          Done! {wpm} WPM and {accuracy}% accuracy in {formatTime(elapsed)}.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Start over
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Next passage
        </button>
      </div>
      <SpeedChart values={samples} caption="Speed second by second" />
      <div className="boards">
        <Leaderboard runs={runs} latest={done ? startedAt : null} />
        <History runs={runs} />
      </div>
    </main>
  )
}

export default App
```

Now you see why it was a good idea to make the saving idempotent. The name is one of the effect's dependencies, so if
you change your name after a test, the effect runs again while `done` is still true. But `some` sees that this test is
already in the list, and no second entry is made.

:::check Check
A "Your name" field appears next to the mode buttons. Type your name and finish a test: next to the history there is
the "Leaderboard", with 🥇 and your name in first place, on a turquoise background because it is the result you just
made. Hand the computer to someone else, let them type their own name and have a go: the list is sorted by speed. If
you change your name after a test, no double entry appears in the history. After a reload your name is still in the
field.
:::

:::mistake Common mistake
Comparing the wrong way round: `a.wpm - b.wpm`. Then the list is in ascending order, and the slowest result gets the
gold medal. For descending order, `b` comes first: `b.wpm - a.wpm`.
:::

:::concept How does a real leaderboard work?
This leaderboard only lives on this computer, in this browser. A real leaderboard shared by everyone needs a server
where every result arrives. And the server has to check them too: anyone can edit `localStorage` in the developer tools
of their browser, so a "999 WPM" result proves nothing. That's why real sites often send the times of the keystrokes as
well, and the server works out the speed again itself.
:::

### A race between two windows

Finally, let's race! A real multiplayer race would need a server, but two browser windows can talk to each other without
one. The browser's [[BroadcastChannel]] got a mention in lesson 10, in the "How does a real app do it?" box of the
shared list: it is a named channel on which windows opened from the same site can send each other messages.
`new BroadcastChannel('typing-race')` opens the channel, `postMessage(…)` sends a message (an object, for example) on it
to every **other** window that opened the same channel, and `onmessage` runs when a message arrives; the message is
`event.data`.

Handling the channel goes into a [[custom hook]], in the `src/useRace.js` file:

```js file=src/useRace.js
import { useEffect, useRef, useState } from 'react'

// Every open window gets a random id of its own, for example 'k3j9x2ab'.
const MY_ID = Math.random().toString(36).slice(2, 10)

// A race between browser windows: every window tells the others how far it has got.
function useRace() {
  // The latest message of every other window, by id: { k3j9x2ab: { id, name, progress, wpm }, … }
  const [rivals, setRivals] = useState({})
  // The channel itself. A ref, because send needs it, but it never has to be drawn.
  const channelRef = useRef(null)

  useEffect(() => {
    const channel = new BroadcastChannel('typing-race')
    channelRef.current = channel
    channel.onmessage = (event) => {
      const message = event.data
      setRivals((current) => ({ ...current, [message.id]: message }))
    }
    // Cleanup: when the component disappears, the channel closes.
    return () => channel.close()
  }, [])

  function send(update) {
    if (channelRef.current) {
      channelRef.current.postMessage({ id: MY_ID, ...update })
    }
  }

  return { rivals: Object.values(rivals), send }
}

export default useRace
```

- **The id.** Every window has to know who a message came from. `Math.random().toString(36)` writes a random number in
  base 36, that is with digits and letters (`'0.k3j9x2abq…'`), and `slice(2, 10)` cuts the `0.` off the front and keeps
  eight characters.
- **The rivals.** `rivals` is an object in which every window keeps its latest message under its id. A new message goes
  in with the spread and the square-bracket key you know from lesson 3: the new entry replaces the old one.
  `Object.values` turns the entries into an array at the end.
- **The ref's fourth job.** The channel is an object that the effect creates and `send` uses from an event handler. It
  never appears on the screen, so it isn't state: it goes into the `channelRef` box. During development,
  [[StrictMode]] runs the effect twice, as you know from lesson 2 (open, close, open again); the box always gets the
  channel that is still open. `send` checks whether there is a channel yet, because at the moment of the first render
  the effect hasn't run.

Two windows now share one `localStorage`, and that hides a trap. Both write the same `typing-test-history` key, but each
keeps its own copy of the history from the moment it was loaded. When you have both finished, the window that saves
last writes its own list over the other one, and the other result is lost. So the history has to take over what the
other window saved, through the `storage` event, as the shopping list did in lesson 10. The name, however, must stay
per window: if it were taken over too, the two of you could never have two different names. That's why
`useLocalStorage` gets a third parameter, `sync`. `sync = false` is a [[default parameter]]: if the call gives no third
value, `sync` is `false`, and the hook works as before. Replace the contents of `src/useLocalStorage.js`:

```js file=src/useLocalStorage.js mark=4,24-34
import { useEffect, useState } from 'react'

// Like useState, but it also saves the value in localStorage, so it survives a reload.
function useLocalStorage(key, initialValue, sync = false) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? initialValue : JSON.parse(saved)
    } catch {
      // Storage blocked or a broken save: start with the initial value.
      return initialValue
    }
  })

  // Save every change, as text.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // No harm if it fails: then we only remember for this visit.
    }
  }, [key, value])

  // sync: if another window has changed the same key, we take over the new value (like in lesson 10).
  useEffect(() => {
    if (!sync) return
    function handleStorage(event) {
      if (event.key !== key || event.newValue === null) return
      setValue(JSON.parse(event.newValue))
    }
    window.addEventListener('storage', handleStorage)
    // Cleanup: when the component disappears, we stop listening.
    return () => window.removeEventListener('storage', handleStorage)
  }, [key, sync])

  return [value, setValue]
}

export default useLocalStorage
```

Without `sync`, the new effect returns at its first line: it listens to nothing, and there is nothing to clean up.

The race track goes into the `src/components/RaceTrack.jsx` file. Every player gets a lane, and the width of the bar
comes from their progress, with an [[inline style]] (familiar from lesson 7): `progress` is a number between 0 and 1,
so `progress * 100` is the percentage.

```jsx file=src/components/RaceTrack.jsx
// One lane per player: how far they have got in the passage, and how fast.
function RaceTrack({ me, rivals }) {
  const players = [me, ...rivals]

  return (
    <section className="panel">
      <h2>Race</h2>
      <ul className="race__lanes">
        {players.map((player) => (
          <li key={player.id} className={player.id === me.id ? 'race__lane is-me' : 'race__lane'}>
            <span className="race__name">{player.name}</span>
            <span className="race__bar">
              <span style={{ width: `${Math.round(player.progress * 100)}%` }} />
            </span>
            <span>
              {player.progress === 1 ? '🏁 ' : ''}
              {player.wpm} WPM
            </span>
          </li>
        ))}
      </ul>
      {rivals.length === 0 && (
        <p className="race__hint">
          Open this page in a second window too, and type there as well: here you see how far the other one has got.
        </p>
      )}
    </section>
  )
}

export default RaceTrack
```

After every keystroke, `App` sends out how far you have got: your name, your progress (the typed length divided by the
length of the passage) and your speed. The speed needs the start time; at the first keystroke `startedAt` is still
`null`, and then `??` gives the current time. Starting over tells the others too that you are back at the start. The
history gets `true` as its third argument, so it keeps up with the other window; the name gets nothing, so it stays
your own. Here is the whole `src/App.jsx`, the finished app:

```jsx file=src/App.jsx mark=5,12,36,38,121-126,138,217
import { useEffect, useRef, useState } from 'react'
import { PASSAGES } from './passages.js'
import { accuracyPercent, charsPerMinute, countCorrect, formatTime, wordsPerMinute } from './stats.js'
import useLocalStorage from './useLocalStorage.js'
import useRace from './useRace.js'
import Passage from './components/Passage.jsx'
import Stats from './components/Stats.jsx'
import ModePicker, { MODES } from './components/ModePicker.jsx'
import SpeedChart from './components/SpeedChart.jsx'
import History from './components/History.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import RaceTrack from './components/RaceTrack.jsx'
import './App.css'

// Keys that would move the cursor in the invisible field: it always stays at the end of the text.
const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']

// A timed test needs a lot of text: the chosen passage, then all the others in turn.
function timedText(index) {
  return [...PASSAGES.slice(index), ...PASSAGES.slice(0, index)].join(' ')
}

function App() {
  const [modeId, setModeId] = useState('passage')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  // When the first key was pressed, and what the time is now (in milliseconds).
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(null)
  // All keystrokes, and how many of them were wrong; a mistake you fixed is still a mistake.
  const [keystrokes, setKeystrokes] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  // The speed (WPM) at the end of every second: the live chart is drawn from this.
  const [samples, setSamples] = useState([])
  // The results so far (newest first) and the player's name: both survive a reload.
  const [history, setHistory] = useLocalStorage('typing-test-history', [], true)
  const [player, setPlayer] = useLocalStorage('typing-test-player', '')
  const { rivals, send } = useRace()
  // The id of the running timer. A ref: it survives every render, but changing it draws nothing.
  const timerRef = useRef(null)
  // The text field itself, so that the code can put the cursor into it.
  const inputRef = useRef(null)
  // The latest number of correct characters: the clock's function can't see the fresh `correct`, only this box.
  const correctRef = useRef(0)

  const mode = MODES.find((item) => item.id === modeId)
  // The time limit in milliseconds, or null if there is none.
  const limit = mode.seconds === null ? null : mode.seconds * 1000
  const text = limit === null ? PASSAGES[index] : timedText(index)
  const elapsed = startedAt === null ? 0 : now - startedAt
  const done = typed.length === text.length || (limit !== null && elapsed >= limit)

  // Worked out again on every render: all of these follow from the state.
  const correct = countCorrect(typed, text)
  const wpm = wordsPerMinute(correct, elapsed)
  const cpm = charsPerMinute(correct, elapsed)
  const accuracy = accuracyPercent(keystrokes, mistakes)
  const playerName = player.trim() || 'Anonymous'
  // Only the results of the chosen mode.
  const runs = history.filter((run) => run.mode === modeId)

  // If the component disappears while the clock runs, the timer stops too.
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  // When the test ends (with the last character or when the time is up), the result goes into the history.
  useEffect(() => {
    if (!done) return
    setHistory((list) => {
      // startedAt is different for every run: if this run is already in the list, it doesn't go in again.
      if (list.some((run) => run.at === startedAt)) return list
      const result = { at: startedAt, mode: modeId, name: playerName, wpm, accuracy, cpm }
      return [result, ...list].slice(0, 100)
    })
  }, [done, startedAt, modeId, playerName, wpm, accuracy, cpm, setHistory])

  function stopTimer() {
    clearInterval(timerRef.current)
  }

  function startClock(start) {
    setStartedAt(start)
    timerRef.current = setInterval(() => {
      let passed = Date.now() - start
      // In a timed test the clock stops by itself when the time is up.
      if (limit !== null && passed >= limit) {
        passed = limit
        stopTimer()
      }
      // In every new second, a new point for the chart: the speed so far.
      const second = Math.floor(passed / 1000)
      setSamples((list) => (second > list.length ? [...list, wordsPerMinute(correctRef.current, passed)] : list))
      setNow(start + passed)
    }, 100)
  }

  function handleChange(event) {
    const value = event.target.value
    const time = Date.now()
    // The first character starts the clock, the last one stops it.
    if (startedAt === null) {
      startClock(time)
    }
    if (value.length === text.length) {
      stopTimer()
    }
    // Every new character is a keystroke; if it doesn't match the passage, a mistake too. Deleting doesn't count.
    let added = 0
    let wrong = 0
    for (let i = typed.length; i < value.length; i++) {
      added++
      if (value[i] !== text[i]) wrong++
    }
    setKeystrokes(keystrokes + added)
    setMistakes(mistakes + wrong)
    setNow(time)
    setTyped(value)
    // The box always gets the latest number: the clock's function reads it from here.
    correctRef.current = countCorrect(value, text)
    // Let the other windows see how far you have got.
    send({
      name: playerName,
      progress: value.length / text.length,
      wpm: wordsPerMinute(correctRef.current, time - (startedAt ?? time)),
    })
  }

  function restart() {
    stopTimer()
    setTyped('')
    setStartedAt(null)
    setNow(null)
    setKeystrokes(0)
    setMistakes(0)
    setSamples([])
    correctRef.current = 0
    send({ name: playerName, progress: 0, wpm: 0 })
    // The cursor goes back into the field: you can type straight away.
    inputRef.current.focus()
  }

  function nextPassage() {
    setIndex((index + 1) % PASSAGES.length)
    restart()
  }

  function changeMode(id) {
    setModeId(id)
    restart()
  }

  function handleKeyDown(event) {
    // Esc: start over.
    if (event.key === 'Escape') restart()
    // Enter would only type a wrong character, and the arrows would move the cursor.
    if (event.key === 'Enter' || MOVE_KEYS.includes(event.key)) event.preventDefault()
  }

  return (
    <main className="typing">
      <h1>Typing Speed Test</h1>
      <div className="toolbar">
        <ModePicker value={modeId} onChange={changeMode} />
        <label className="field">
          <span>Your name</span>
          <input
            type="text"
            value={player}
            placeholder="Anonymous"
            maxLength={20}
            onChange={(event) => setPlayer(event.target.value)}
          />
        </label>
      </div>
      <Stats
        wpm={wpm}
        accuracy={accuracy}
        cpm={cpm}
        time={limit === null ? elapsed : Math.max(0, limit - elapsed)}
        timeLabel={limit === null ? 'Time' : 'Time left'}
      />
      {/* A click on the box gives the cursor to the invisible field. */}
      <div className="typing__box" onClick={() => inputRef.current.focus()}>
        <Passage text={text} typed={typed} />
        <textarea
          ref={inputRef}
          className="typing__input"
          aria-label="Type the passage here"
          value={typed}
          maxLength={text.length}
          readOnly={done}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(event) => event.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <p className="typing__hint">Click the text and start typing. Esc: start over.</p>
      {done && (
        <p className="result" role="status">
          Done! {wpm} WPM and {accuracy}% accuracy in {formatTime(elapsed)}.
        </p>
      )}
      <div className="typing__actions">
        <button type="button" className="button" onClick={restart}>
          Start over
        </button>
        <button type="button" className="button" onClick={nextPassage}>
          Next passage
        </button>
      </div>
      <SpeedChart values={samples} caption="Speed second by second" />
      <RaceTrack me={{ id: 'me', name: playerName, progress: typed.length / text.length, wpm }} rivals={rivals} />
      <div className="boards">
        <Leaderboard runs={runs} latest={done ? startedAt : null} />
        <History runs={runs} />
      </div>
    </main>
  )
}

export default App
```

:::check Check
Under the buttons the "Race" box appears with a single lane, yours, and under it the hint to open a second window. Open
the same address in a new window (in the same browser) and put the two side by side. Enter two different names. Type
in one of them: in the other, a second lane appears with the other name, moving along with the typing, the speed next
to it. Whoever reaches the end of the passage gets a 🏁 flag. If you press ++Esc++ in one window, its lane jumps back to
the start in the other. When you have both finished, both results are in the history, in both windows.

If you reload a window, it gets a new id: its old lane stays, frozen, in the other window until you reload that one
too. Both windows also save the name under the same key, so a reloaded window shows the name that was typed last in
either of them; just type yours again. Congratulations, your typing speed test is finished!
:::

:::mistake Common mistake
Creating the channel in the body of the component, without an effect: `const channel = new BroadcastChannel('typing-race')`.
Then every render opens yet another channel (while the clock runs, one every tenth of a second) and never closes any of
them. After a few minutes thousands are left open, and the browser delivers every message to each of them. Something
that may only be created once and has to be cleaned up at the end belongs in an effect.
:::

:::try Task
A fair start: add a "Ready, go!" button that sends a `{ type: 'start' }` message. Every window that receives one (and
the one where it was pressed) starts over, so you both set off with a clean slate. For this, `useRace` has to handle
`type: 'start'` messages separately: for example, it could take an `onStart` function as a parameter and call it then.
Careful, this is the closure trap again: the message handler is born on the first render, so the `onStart` it sees
would stay the first render's `restart`, with the old name. Put it in a ref, like `correctRef`:
`const onStartRef = useRef(onStart)`, update it in an effect without a dependency array (`onStartRef.current = onStart`),
and have the message handler call `onStartRef.current()` and then `return`, so the start signal does not end up among
the rivals.
:::
