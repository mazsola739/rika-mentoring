# What we build

A word-guessing game: the computer thinks of a five-letter word, and you have six tries to find it. After every guess
the letters change colour: green is in the right place, yellow is in the word but somewhere else, and grey is not in
the word at all. On the way you learn how a React app listens to the keyboard of the whole window, how a grid is drawn
from state, how to write down a game rule exactly (repeated letters are the tricky part!), and how CSS animations bring
the grid to life.

:::levels
- Guess a five-letter word in six tries, with coloured feedback and a "New game" button. | about 2 hours
- An on-screen keyboard that shows the letters' colours, a check against the word list, and animations. | about 3 hours
- A daily word (the same for everyone), statistics and streaks, a result to share as coloured squares, and a Hungarian word list. | about 3 hours
:::

**Before you start you need:** the earlier lessons. We build mostly on these: lesson 3 (`Set`, `setTimeout` with
cleanup, the clipboard), lesson 7 (listening to the keyboard on the whole window, updater functions), lesson 9
(`useLocalStorage`), lesson 13 (CSS animations, starting over with a `key`) and lessons 16–18 (`useRef`). Wherever
something familiar is used in a new way, we explain it again.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is the `lessons/19-wordle/exercise` folder of the course repository (the "Exercise on
GitHub" button above opens it on GitHub). Lesson 1 explains in detail how to get it; here it is in short. Open a
terminal in your work folder, where the `rika-mentoring` repository from the earlier lessons is, bring in the new
lessons, then copy this lesson's exercise folder out of the repository as `word-guess`:

```shell
cd rika-mentoring
git pull        # brings the new lessons
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/19-wordle/exercise word-guess
```

No repository yet? Run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the first three lines.
No git? On the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**,
and copy the `lessons/19-wordle/exercise` folder out of it into your work folder as `word-guess`. You work in your
copy: the repository stays untouched, so `git pull` keeps working.

Open your `word-guess` folder in the editor, and type these two commands in its terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white card in the middle of the page,
with the title "Word Guess". Nothing else is on it yet: building the game is your job.
:::

Leave the server running. In a second terminal, in the `word-guess` folder, make your copy a git repository with one
commit, the starting point:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step
that works.

The exercise has four files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the lesson, ready (the grid, the tile colours, the keyboard, the messages, the result
  and the statistics). You don't write these; you only use the class names (`board`, `row`, `tile`, …) the steps give
  you. The animations are the exception: you write those yourself in the intermediate level, in a CSS file of your own.
- `src/words.js`: the English word lists. `ANSWERS` is the list of secret words (179 well-known words), and
  `EXTRA_GUESSES` holds more than two thousand other words that you may guess, but that are never the secret word.
- `src/wordsHu.js`: the Hungarian word lists, for the last step of the advanced level.

:::concept A quick recap
A [[component]] is a function that returns [[JSX]]. It gets [[props]] from outside and remembers things with
[[useState]]: when a state value changes, React draws it again. Work outside drawing, such as a timer or an event
listener, goes into [[useEffect]], and whatever the effect starts, its [[cleanup function]] stops. An array or object
in state is never changed in place: we always give the setter a new one. The steps remind you of these briefly.
:::

### The grid

The heart of a game like this is the grid: six rows of five tiles. The first rows hold the guesses so far, the next one
holds what you are typing, and the rest are empty.

What should go into state? A 6 × 5 table is tempting, but it is not needed: every tile of the grid can be worked out
from two things, the list of guesses so far (`['CRANE', 'PILOT']`) and the half-typed word (`'HO'`). If we store only
these two, the grid can never show anything that isn't true. This is the [[single source of truth]] (lesson 13 decided
the face-up cards the same way), and the grid is a [[derived value]]: it is made from those two on every render.

First, the two basic rules of the game. They have nothing to do with React, so they go into a file of their own. Create
a `game.js` file in the `src` folder:

```js file=src/game.js
// The rules of the game in two numbers.
export const WORD_LENGTH = 5
export const MAX_TRIES = 6
```

Both are [[named exports|named export]], like `generatePassword` in lesson 3: you import them by name, in curly braces.
If you ever want to play with longer words or more tries, this is the only place to change.

Now the grid. Create a `components` folder inside `src`, with a `Board.jsx` file in it:

```jsx file=src/components/Board.jsx
import { MAX_TRIES, WORD_LENGTH } from '../game.js'

// One row of the grid: five tiles. letters is a piece of text, for example 'CRANE' or 'HO'.
function Row({ letters }) {
  return (
    <div className="row">
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        const letter = letters[i]
        return (
          <div key={i} className={letter ? 'tile is-filled' : 'tile'}>
            {letter}
          </div>
        )
      })}
    </div>
  )
}

// The whole grid, made from the guesses so far and the word being typed.
function Board({ guesses, current }) {
  return (
    <div className="board">
      {Array.from({ length: MAX_TRIES }, (_, row) => {
        if (row < guesses.length) return <Row key={row} letters={guesses[row]} />
        if (row === guesses.length) return <Row key={row} letters={current} />
        return <Row key={row} letters="" />
      })}
    </div>
  )
}

export default Board
```

- A file can hold more than one component. Only `Board` uses `Row`, so `Row` is not exported: from outside, only
  `Board` can be seen. The file is in the `components` folder, so `'../game.js'` first steps up one folder (`..`).
- [[Array.from]] makes an array of a given length. Its first parameter says how long (`{ length: 5 }`), and the second
  is a function that is called for every place with its position (`i`, counting from 0); whatever it returns goes into
  that place. We don't need the
  function's first parameter (the place's current, empty content), and such a parameter is usually called `_`. So
  `Array.from({ length: 5 }, (_, i) => …)` gives five JSX elements, and React draws them like the result of a `map`.
  Every element gets a [[key]]: in a grid of fixed size, the number of the place is perfect for it.
- `letters[i]` is the `i`-th letter of the text, like `CHARS[5]` in lesson 3. If the word is shorter (`'HO'` has no
  third letter), the value is `undefined`: the condition is false, the tile stays a plain `tile`, and `{letter}` draws
  nothing.
- `Board` decides row by row: if the row's number is smaller than the number of guesses, a sent guess goes there; if
  it is exactly that number, the word being typed; after that come empty rows. The `return` after an `if` leaves the
  function at once, so no `else` is needed.

Finally, `App` draws the grid, with made-up data for now. Replace the contents of `src/App.jsx` with this:

```jsx file=src/App.jsx mark=1,5-7,12
import Board from './components/Board.jsx'
import './App.css'

function App() {
  // Sample data for now: two guesses already sent, and a third one half typed.
  const guesses = ['CRANE', 'PILOT']
  const current = 'HO'

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <Board guesses={guesses} current={current} />
    </main>
  )
}

export default App
```

:::check Check
Under the title there is a grid: six rows of five squares. The first row holds the letters of CRANE, the second those
of PILOT, the third H and O, and the other squares are empty. The tiles with a letter have a darker border.
:::

:::mistake Common mistake
`Array(6).map(…)` instead of `Array.from`. `Array(6)` is made with six empty places, and `map` simply skips empty
places: nothing appears where the grid should be. `Array.from({ length: 6 }, …)` runs the function for every place.
:::

:::try Try it
In `game.js`, change `MAX_TRIES` to 8: the grid gets eight rows, although you touched nothing else. Then set it back
to 6.
:::

### Typing on the keyboard

The word being typed becomes state, since it changes with every key press. But who should listen to the keyboard?
There is no text field here for the [[focus]] to go to: the player simply starts typing. So, like the space bar in
lesson 7, the whole window listens: `window.addEventListener('keydown', …)`. The window is outside React's world, so an
effect adds the listener, and its cleanup function removes it.

In lesson 7 we looked at `event.code`, the key's place on the keyboard. This time we need the letter itself, so we use
`event.key`: on a German or Hungarian keyboard, for example, the Z is where the English Y is, and what counts for us is
the letter printed on the key.

First, write at the end of `game.js` which letters the game accepts:

```js file=src/game.js
// The letters that can be typed.
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
```

The typed word goes into state, and the listener into an effect. Replace the contents of `src/App.jsx` with this:

```jsx file=src/App.jsx mark=1-2,7-8,10-14,16-19,21-26,28-30
import { useEffect, useState } from 'react'
import { LETTERS, WORD_LENGTH } from './game.js'
import Board from './components/Board.jsx'
import './App.css'

function App() {
  const guesses = ['CRANE', 'PILOT'] // still sample data
  const [current, setCurrent] = useState('')

  // The whole window listens to the keyboard. The listener is added once, and the cleanup removes it.
  useEffect(() => {
    function handleKeyDown(event) {
      // Ctrl + R, Ctrl + C and the like stay the browser's.
      if (event.ctrlKey || event.metaKey || event.altKey) return

      if (event.key === 'Backspace') {
        setCurrent((text) => text.slice(0, -1))
        return
      }

      const letter = event.key.toUpperCase()
      if (letter.length === 1 && LETTERS.includes(letter)) {
        // Five letters at most: a sixth one is ignored.
        setCurrent((text) => (text.length < WORD_LENGTH ? text + letter : text))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <Board guesses={guesses} current={current} />
    </main>
  )
}

export default App
```

Line by line:

- `event.ctrlKey`, `event.metaKey` (++Cmd++ on a Mac) and `event.altKey` are true when a modifier key is held down
  together with the key. Then the user is giving the browser a command (++Ctrl++ + ++R++ reloads), not guessing, so the
  function returns at once.
- `text.slice(0, -1)` is the deletion. In lesson 13 [[slice]] cut a piece out of an array, and it works the same way on
  text. `-1` counts from the end: from position 0 up to the last letter but one, that is, without the last one.
- `event.key` is what the pressed key means (`'a'`, `'Enter'`, `'Shift'`…), and `toUpperCase()` turns it into a
  capital. Two conditions decide whether it is a letter: is it one character long (`'SHIFT'` is five), and is it in
  `LETTERS`. On text, [[includes]] checks whether the piece it is given appears in it, which is why the first
  condition is needed too: `LETTERS.includes('ABC')` would also be true.
- `setCurrent` gets an [[updater function]], like the space bar listener of lesson 7. The listener is made after the
  first render, and since the [[dependency array]] is empty (`[]`), it is never replaced. A function sees the variables of
  the place where it was made (a [[closure]]), so if it read `current`, it would see the empty text of the first render
  forever. The updater function, on the other hand, always gets the latest value from React (that is `text`).
- `text.length < WORD_LENGTH ? text + letter : text` is the [[ternary operator]] from lesson 3: if there are fewer than
  five letters, the new one is added; if not, everything stays as it is.

:::check Check
Click on the page and type: the letters appear in capitals in the third row. No more than five fit, and ++Backspace++
deletes them from the end. Digits, the space bar and ++Shift++ do nothing, and ++Ctrl++ + ++R++ still reloads the page.
:::

:::mistake Common mistake
The cleanup function is left out (`return () => window.removeEventListener(…)`). During development every letter
appears twice: `HH`, `EE`. [[StrictMode]] (in `main.jsx`) runs the effect twice in development, so that mistakes like
this come to light, and without a cleanup two listeners stay on the window. In production the same would happen if the
component disappeared and came back.
:::

:::try Try it
Put `console.log(event.key)` at the start of `handleKeyDown`, and press a few keys (++F12++ → Console). What are
++Shift++, the arrows and the space bar called? (The space bar is a single space, `' '`, so its line in the console
looks empty.) Then delete the line.
:::

### Sending a guess

++Enter++ sends the guess: the typed word goes to the end of the list of guesses, and the next row starts empty. For
that the guesses become state too, starting as an empty list; the sample data can go.

But ++Enter++ needs two pieces of state at the same time: it has to know what `current` is and what is in `guesses` so
far. An updater function gives the latest value of only one piece of state, so this time we solve the [[closure]]
problem differently: the listener reads the state directly, and we write into the [[dependency array]] what it reads:
`[current, guesses]`. Then after every render in which one of them has changed, React first runs the cleanup (removes
the old listener), then the effect again (adds a new one, which sees the new values). So there is always exactly one
listener on the window, and always the newest one. Replace the contents of `src/App.jsx` with this:

```jsx file=src/App.jsx mark=7,10,15-22,25,30-31,37
import { useEffect, useState } from 'react'
import { LETTERS, WORD_LENGTH } from './game.js'
import Board from './components/Board.jsx'
import './App.css'

function App() {
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')

  // The listener now reads current and guesses as well, so it is replaced whenever they change.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return

      if (event.key === 'Enter') {
        // Only a full row can be sent. It joins the guesses, and the next row starts empty.
        if (current.length === WORD_LENGTH) {
          setGuesses([...guesses, current])
          setCurrent('')
        }
        return
      }

      if (event.key === 'Backspace') {
        setCurrent(current.slice(0, -1))
        return
      }

      const letter = event.key.toUpperCase()
      if (letter.length === 1 && LETTERS.includes(letter) && current.length < WORD_LENGTH) {
        setCurrent(current + letter)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [current, guesses])

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <Board guesses={guesses} current={current} />
    </main>
  )
}

export default App
```

- `[...guesses, current]` is the [[spread]]: a new array with the old guesses in it and the new one at the end. The old
  one is not changed: `guesses.push(current)` would change it in place, and React would not notice.
- Since the listener now always sees fresh values, the updater functions are not needed any more:
  `current.slice(0, -1)` and `current + letter` will do.

:::check Check
The grid starts empty. Type five letters and press ++Enter++: the word stays where it is, and typing goes on in the next
row. With four letters ++Enter++ does nothing. After six guesses the grid is full; what happens then is decided in
step 5.
:::

:::mistake Common mistake
The dependency array is left empty: `[]`. Then the listener sees the values of the first render forever: for it,
`current` is always `''`. The row only ever shows the last letter you pressed (`'' + letter`), and ++Enter++ never sends
anything, because as far as it knows, there aren't five letters.
:::

:::try Try it
Put a `console.log('new listener')` line at the start of the effect, and type: after every letter a new listener is
added (the cleanup removes the old one first). In the intermediate level we replace this with a single listener, with
the help of `useRef`.
:::

### Colours

We need a secret word, and a rule that tells what a guess is worth. The secret word is picked at random from the
`ANSWERS` list of `words.js`, with [[Math.random]] and [[Math.floor]], known from lesson 3.

At first sight the rule is simple: if the letter is where it is in the secret word, it is green; if it is in the word
somewhere else, yellow; if it is not in the word at all, grey. Repeated letters call for care, though. Say the secret
word is PIANO and the guess is PAPER. The first P is green, the A yellow. And the second P? PIANO has only one P, and
the first one has already found it: the second P must be grey, otherwise the player would think there is another P in
the word.

So we go through the word twice. In the first pass we look only for the greens, and meanwhile note which letters of the
secret word are left over (the ones no green tile has used). In the second pass a letter in the wrong place is yellow
only if there is still one of it left over, and then it uses one up. An exact, step-by-step procedure like this is called an
[[algorithm]]. Replace the whole of `src/game.js` with this:

```js file=src/game.js mark=1,10-12,15-20,22-28,32-36,40
import { ANSWERS } from './words.js'

// The rules of the game in two numbers.
export const WORD_LENGTH = 5
export const MAX_TRIES = 6

// The letters that can be typed.
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// A random secret word from the list.
export function randomWord() {
  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
}

// What a guess is worth, letter by letter: 'correct' (right letter, right place),
// 'present' (in the word, but somewhere else) or 'absent' (not in the word).
export function evaluate(guess, answer) {
  const result = []
  // The letters of the secret word that are left over, and how many of each, for example { I: 1, A: 1 }.
  const left = {}

  // First pass: the greens. The letters of the secret word that are not hit go into left.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct'
    } else {
      result[i] = 'absent'
      left[answer[i]] = (left[answer[i]] ?? 0) + 1
    }
  }

  // Second pass: a letter in the wrong place is yellow only if there is still one of it left over.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'absent' && left[guess[i]] > 0) {
      result[i] = 'present'
      left[guess[i]] -= 1
    }
  }

  return result
}
```

- `left` is an [[object]] used as a counter: its keys are letters, its values are counts. `left[answer[i]] ?? 0` is the
  [[nullish coalescing]] from lesson 13: the first time a letter comes up it has no value yet (`undefined`), and then we
  count with 0. So `(… ?? 0) + 1` is 1 the first time and 2 the second.
- In the second pass, `left[guess[i]] > 0` works even when the letter is not in `left` at all: `undefined > 0` is
  false.
- Let's walk through PIANO and PAPER! In the first pass the P is green, every other place is grey for now, and `left`
  is `{ I: 1, A: 1, N: 1, O: 1 }`. In the second pass the A becomes yellow (and the count of A drops to 0), but the
  second P stays grey, because there is no P in `left`. The result:
  `['correct', 'present', 'absent', 'absent', 'absent']`.

The rows now get the result too, and the tiles a class to match: `is-correct`, `is-present` or `is-absent` (the colours
are in `App.css`). Replace the contents of `src/components/Board.jsx` with this:

```jsx file=src/components/Board.jsx mark=1,3-5,10-12,14,24,28-29
import { MAX_TRIES, WORD_LENGTH, evaluate } from '../game.js'

// One row of the grid: five tiles. letters is a piece of text, for example 'CRANE' or 'HO';
// states (only for a sent guess) is the result of evaluate, for example ['absent', 'correct', …].
function Row({ letters, states }) {
  return (
    <div className="row">
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        const letter = letters[i]
        let tileClass = 'tile'
        if (states) tileClass = `tile is-${states[i]}`
        else if (letter) tileClass = 'tile is-filled'
        return (
          <div key={i} className={tileClass}>
            {letter}
          </div>
        )
      })}
    </div>
  )
}

// The whole grid, made from the guesses so far and the word being typed.
function Board({ guesses, current, answer }) {
  return (
    <div className="board">
      {Array.from({ length: MAX_TRIES }, (_, row) => {
        if (row < guesses.length) {
          return <Row key={row} letters={guesses[row]} states={evaluate(guesses[row], answer)} />
        }
        if (row === guesses.length) return <Row key={row} letters={current} />
        return <Row key={row} letters="" />
      })}
    </div>
  )
}

export default Board
```

The text between backticks, `tile is-${states[i]}`, is a [[template literal]], known from lesson 1: the tile's
result goes in place of the `${…}`, which gives, for example, `'tile is-correct'`. The result is not stored anywhere:
it is worked out from the guess and the secret word on every render.

Finally, `App` picks a secret word at random and hands it to `Board`. Three lines of `src/App.jsx` change: the import of
`game.js`, a new piece of state above the others, and the `<Board>` line:

```jsx file=src/App.jsx mark=2,7,16
import { useEffect, useState } from 'react'
import { LETTERS, WORD_LENGTH, randomWord } from './game.js'
import Board from './components/Board.jsx'
import './App.css'

function App() {
  const [answer] = useState(randomWord)
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')

  // … the effect that listens to the keyboard, as before

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <Board guesses={guesses} current={current} answer={answer} />
    </main>
  )
}

export default App
```

`useState(randomWord)` gets the function itself, not its result: this is the [[lazy initial state]] from lesson 3.
React calls it only on the first render, so the secret word is not replaced at every key press. `const [answer]` takes
only the first item of what `useState` returns: there is no setter, because the secret word does not change during a
game.

:::check Check
Type a word, for example `CRANE`, and press ++Enter++: the tiles change colour. A green letter is in the right place, a
yellow one is in the word but somewhere else, and a grey one is not in the word. The row being typed still has no
colours.
:::

:::mistake Common mistake
The one-pass rule, which looks right at first sight:

```js
if (guess[i] === answer[i]) result[i] = 'correct'
else if (answer.includes(guess[i])) result[i] = 'present'
else result[i] = 'absent'
```

It lies about repeated letters: the second P of PAPER, guessed against PIANO, turns yellow, although the word has no
second P. For a yellow tile we also need to know whether any of that letter is still left over, and that is what the
two passes are for.
:::

:::try Try it
Cheat a little: in `App`, under the `useState` lines, write `console.log(answer)`. The secret word is there in the
console (++F12++): type it, and five green tiles are your reward. It is handy for testing, but delete the line before
you play.
:::

### Win or lose

The game can end in two ways: you found the word, or the six tries ran out. Neither needs new state: the list of
guesses tells you at any time how things stand. This is a [[derived value]] too, like `won` in lesson 13.

The "New game" button has to put everything back to the start: a new secret word, no guesses, an empty row. We could do
that with setters (the secret word would need a setter of its own for that), but there is a simpler way, which you saw
in lessons 3 and 13: the [[key]]. When a component's
`key` changes, React does not update it: it throws it away with all its state and builds a brand new one in its place.
For that, the game needs a component of its own, which `App` draws with a `key`. So the game moves out of `App` into a
new file. Create the `src/components/Game.jsx` file; most of it is familiar (the highlighted lines are new or changed):

```jsx file=src/components/Game.jsx mark=2-3,5,10-13,15,18,43,46,48-59,63
import { useEffect, useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, randomWord } from '../game.js'
import Board from './Board.jsx'

function Game({ onNewGame }) {
  const [answer] = useState(randomWord)
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')

  // Worked out from the guesses on every render: they need no state of their own.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // The listener reads current, guesses and over, so it is replaced whenever they change.
  useEffect(() => {
    function handleKeyDown(event) {
      if (over) return // the game is over: the keyboard has nothing more to do
      if (event.ctrlKey || event.metaKey || event.altKey) return

      if (event.key === 'Enter') {
        // Only a full row can be sent. It joins the guesses, and the next row starts empty.
        if (current.length === WORD_LENGTH) {
          setGuesses([...guesses, current])
          setCurrent('')
        }
        return
      }

      if (event.key === 'Backspace') {
        setCurrent(current.slice(0, -1))
        return
      }

      const letter = event.key.toUpperCase()
      if (letter.length === 1 && LETTERS.includes(letter) && current.length < WORD_LENGTH) {
        setCurrent(current + letter)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [current, guesses, over])

  return (
    <>
      <Board guesses={guesses} current={current} answer={answer} />
      {over && (
        <section className="result" role="status">
          <h2>{won ? 'You got it!' : 'Not this time'}</h2>
          <p>{won ? `You needed ${guesses.length} of your ${MAX_TRIES} tries.` : `The word was ${answer}.`}</p>
          <div className="result__actions">
            <button type="button" className="button" onClick={onNewGame}>
              New game
            </button>
          </div>
        </section>
      )}
    </>
  )
}

export default Game
```

- `guesses.includes(answer)` is true when the secret word is among the guesses: [[includes]] works on arrays too.
  `lost` is true when you did not win (`!won`) **and** the six tries are used up; `over` when either of them is true.
- When the game is over, the listener returns at once: the keys do nothing. `over` went into the dependency array
  too, because the listener reads it.
- `<>…</>` is the [[Fragment]] from lesson 13: it returns several elements in one package, without a needless `<div>`.
  This way the grid and the result go straight into the white card of `App`.
- `{over && (…)}` is [[conditional rendering]]: the result appears only at the end of the game. Because of
  `role="status"`, screen readers read it out too.
- The button does not start the new game itself: it tells `App` through the `onNewGame` prop, and `App` gives a new
  `key`.

From now on `App` only gives the frame. Replace the contents of `src/App.jsx` with this:

```jsx file=src/App.jsx mark=1-2,6-7,12
import { useState } from 'react'
import Game from './components/Game.jsx'
import './App.css'

function App() {
  // Every game gets a number of its own. A new number is a new key, and a new key is a brand new Game.
  const [round, setRound] = useState(0)

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <Game key={round} onNewGame={() => setRound(round + 1)} />
    </main>
  )
}

export default App
```

:::check Check
Find the word (to cheat, write `console.log(answer)` under the `useState` lines of `Game`, and delete it afterwards):
"You got it!" appears under the grid, with, for example, "You
needed 4 of your 6 tries.", and the keys don't write anything any more. "New game" brings an empty grid with a new
secret word. If you don't find it in six tries: "Not this time", and the game tells you the word. The beginner level is
done: commit it!
:::

:::mistake Common mistake
The `key={round}` is left out. Then the "New game" button does nothing: `round` grows, but `Game` stays the same
component with the same state, and React only updates it.
:::

:::try Try it
So that you don't have to waste six guesses to try losing, set `MAX_TRIES` to 2 for a while. Then put it back to 6.
:::

## Intermediate level {level=2}

### An on-screen keyboard

On a phone there is no physical keyboard, and the phone's own on-screen keyboard only opens for a text field, which this
game doesn't have. So we put a keyboard of our own under the grid. Its buttons have to do exactly what the
real keys do. So the logic moves out of the listener into a `handleKey(key)` function that both keyboards call: `key`
is `'ENTER'`, `'BACKSPACE'` or a capital letter.

The window's listener moves into a [[custom hook]] at the same time (you wrote some in lessons 2, 6 and 9):
`useKeyboard(onKey)`. And while it moves, it gets smarter. In step 3 the listener was replaced at every change. Now
`handleKey` is a new function on every render (it has to see the latest state, after all), so the listener would have
to be replaced after every render. That would work, but there is a better way: [[useRef]] (lessons 16–18). A ref is a
box (its content is `ref.current`) that React keeps between renders, and changing its content does not make React draw again. After
every render we put the newest `onKey` into the box, and the listener, which we add only once, always calls whatever is
in the box at that moment.

Create the `src/useKeyboard.js` file:

```js file=src/useKeyboard.js
import { useEffect, useRef } from 'react'

// Listens to the keyboard of the whole window, and calls onKey with 'ENTER', 'BACKSPACE'
// or a capital letter. The listener is added only once.
function useKeyboard(onKey) {
  // The ref always holds the newest onKey: the listener below always calls that one.
  const onKeyRef = useRef(onKey)
  useEffect(() => {
    onKeyRef.current = onKey
  })

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === 'Enter') onKeyRef.current('ENTER')
      else if (event.key === 'Backspace') onKeyRef.current('BACKSPACE')
      else if (event.key.length === 1) onKeyRef.current(event.key.toUpperCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

export default useKeyboard
```

- The first effect has no dependency array, so it runs after every render and puts the latest `onKey` into the box.
- The second effect's dependency array is empty: it adds the listener once, and the cleanup removes it when the
  component goes away. The listener doesn't call `onKey` (that would be the first render's) but `onKeyRef.current`.
- The hook only translates the key: Enter, Backspace, or a one-character key in capitals. Whether a character is a
  letter of the game is decided by `Game`. This way the hook works in any game, in the advanced level for example with
  Hungarian accented letters too.

Now the on-screen keyboard. Create the `src/components/Keyboard.jsx` file:

```jsx file=src/components/Keyboard.jsx
// The keys, row by row. ENTER and BACKSPACE are the two wide keys.
const ROWS = [
  [...'QWERTYUIOP'],
  [...'ASDFGHJKL'],
  ['ENTER', ...'ZXCVBNM', 'BACKSPACE'],
]

// What is written on the two wide keys.
const LABELS = { ENTER: 'Enter', BACKSPACE: '⌫' }

function Keyboard({ onKey }) {
  return (
    <div className="keyboard">
      {ROWS.map((row, index) => (
        <div key={index} className="keyboard__row">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              className={key.length > 1 ? 'key key--wide' : 'key'}
              aria-label={key === 'BACKSPACE' ? 'Delete letter' : undefined}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onKey(key)}
            >
              {LABELS[key] ?? key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Keyboard
```

- `[...'QWERTYUIOP']` is the [[spread]] on a piece of text: it takes it apart letter by letter, into an array of ten
  items. In the third row the letters pour in between the names of the two wide keys.
- In `key={key}`, the first `key` is React's key, the second one is our variable: the name of the key, which is unique
  in its row anyway.
- `LABELS[key] ?? key`: if the key has a label of its own, that appears; otherwise the letter itself.
- Screen readers can't always read the ⌫ sign, so this button gets an [[aria-label]]. For the others, `undefined` means
  that there is no such attribute.
- `onMouseDown` switches off the [[default behavior]] of pressing the mouse button (`preventDefault`, known from lesson
  7). A click on a button moves the focus to that button, and a focused button is "pressed" by ++Enter++ too. This way
  the click still works, but the focus stays where it was.

Finally, `Game`: `handleKey` and the hook take the place of the listener, and until the game ends, the keyboard stands
under the grid. Replace the contents of `src/components/Game.jsx` with this:

```jsx file=src/components/Game.jsx mark=1,3,5,17-24,26-29,33,38,48-49
import { useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, randomWord } from '../game.js'
import useKeyboard from '../useKeyboard.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'

function Game({ onNewGame }) {
  const [answer] = useState(randomWord)
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')

  // Worked out from the guesses on every render: they need no state of their own.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // One function for both keyboards. key is 'ENTER', 'BACKSPACE' or a capital letter.
  function handleKey(key) {
    if (over) return // the game is over: the keyboard has nothing more to do
    if (key === 'ENTER') {
      // Only a full row can be sent. It joins the guesses, and the next row starts empty.
      if (current.length === WORD_LENGTH) {
        setGuesses([...guesses, current])
        setCurrent('')
      }
    } else if (key === 'BACKSPACE') {
      setCurrent(current.slice(0, -1))
    } else if (LETTERS.includes(key) && current.length < WORD_LENGTH) {
      setCurrent(current + key)
    }
  }

  useKeyboard(handleKey)

  return (
    <>
      <Board guesses={guesses} current={current} answer={answer} />
      {over ? (
        <section className="result" role="status">
          <h2>{won ? 'You got it!' : 'Not this time'}</h2>
          <p>{won ? `You needed ${guesses.length} of your ${MAX_TRIES} tries.` : `The word was ${answer}.`}</p>
          <div className="result__actions">
            <button type="button" className="button" onClick={onNewGame}>
              New game
            </button>
          </div>
        </section>
      ) : (
        <Keyboard onKey={handleKey} />
      )}
    </>
  )
}

export default Game
```

`handleKey` does what the listener did so far, only it gets the name of the key instead of an event. At the end of the
JSX, `condition ? (…) : (…)` chooses between two things: during the game the keyboard appears, at the end of the game
the result.

:::check Check
A three-row keyboard appears under the grid. Click its letters: they go into the grid, "Enter" sends the guess, and ⌫
deletes. The real keyboard works just the same, and you can even mix the two. At the end of the game the result stands
where the keyboard was.
:::

:::mistake Common mistake
The `onMouseDown={(event) => event.preventDefault()}` is left out. Click the A on the screen, type the rest of the word
on the real keyboard, and press ++Enter++: the guess is sent, but an A appears in the next row too. The focus stayed on
the A button, and ++Enter++ pressed that as well.
:::

:::try Try it
Put a `console.log('listener added')` line into the second effect of `useKeyboard`, right before `addEventListener`,
and type: the message does not come after every key, only at the start (twice during development, because of
StrictMode).
:::

### Coloured keys

The keyboard should show what you know about each letter too: if a letter has been green, its key is green; if
yellow, yellow; if it turned out not to be in the word, grey. A letter can appear in several guesses, even several
times in one guess, with different results: the first P of PAPER is green, the second one grey. So we always keep the
best result: green is worth more than yellow, and yellow more than grey. A small ranking decides. Add this to the end
of `game.js`:

```js file=src/game.js
// What each result is worth: a letter's colour on the keyboard can only get better.
const RANK = { absent: 1, present: 2, correct: 3 }

// The best result of every letter guessed so far, for the keyboard: { C: 'absent', R: 'present', … }
export function letterStates(guesses, answer) {
  const states = {}
  for (const guess of guesses) {
    const result = evaluate(guess, answer)
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = guess[i]
      // The first result always goes in; later only a better one can replace it.
      if (states[letter] === undefined || RANK[result[i]] > RANK[states[letter]]) {
        states[letter] = result[i]
      }
    }
  }
  return states
}
```

`for … of`, known from lesson 3, takes the guesses one by one. Every guess is evaluated, and the `states` object is
updated letter by letter. `RANK[result[i]] > RANK[states[letter]]` compares numbers: `'correct'` (3), for example, is
greater than `'present'` (2). This is a derived value too: it can be worked out from the guesses at any time, so it
does not go into state.

The keyboard gets the letters' results, and the buttons get a class for them. Replace the contents of
`src/components/Keyboard.jsx` with this:

```jsx file=src/components/Keyboard.jsx mark=11,16-29
// The keys, row by row. ENTER and BACKSPACE are the two wide keys.
const ROWS = [
  [...'QWERTYUIOP'],
  [...'ASDFGHJKL'],
  ['ENTER', ...'ZXCVBNM', 'BACKSPACE'],
]

// What is written on the two wide keys.
const LABELS = { ENTER: 'Enter', BACKSPACE: '⌫' }

function Keyboard({ states, onKey }) {
  return (
    <div className="keyboard">
      {ROWS.map((row, index) => (
        <div key={index} className="keyboard__row">
          {row.map((key) => {
            let keyClass = key.length > 1 ? 'key key--wide' : 'key'
            if (states[key]) keyClass += ` is-${states[key]}`
            return (
              <button
                key={key}
                type="button"
                className={keyClass}
                aria-label={key === 'BACKSPACE' ? 'Delete letter' : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onKey(key)}
              >
                {LABELS[key] ?? key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Keyboard
```

`row.map((key) => (…))` has become `row.map((key) => { … })`: with curly braces the arrow function has a body, in which
we first work out the class, and at the end hand back the button with `return`. The wide keys are not in `states`, so
they stay plain.

Two lines change in `Game`: `letterStates` joins the import of `game.js`, and `<Keyboard>` gets the results:

```jsx file=src/components/Game.jsx mark=2,6
import { useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, letterStates, randomWord } from '../game.js'
// … the other imports and the start of Game, as before

      ) : (
        <Keyboard states={letterStates(guesses, answer)} onKey={handleKey} />
      )}
```

:::check Check
Send a guess: the letters of the guess change colour on the keyboard too, just like in the grid. If you later put a
yellow letter in the right place, its key turns green, and stays green.
:::

:::mistake Common mistake
The ranking is left out, and every result overwrites the one before (`states[letter] = result[i]`). If the secret word
is PIANO and you guess PAPER, the P key turns grey: the green of the first P is overwritten by the grey of the second,
although P is in the word.
:::

### Only real words

So far any five letters could be sent, even AAAAA. From now on only real words are accepted: for a made-up word a short
message appears above the grid ("Not in the word list"), and the row stays where it was. Fewer than five letters get a
message too.

The words are in `words.js`: the secret words (`ANSWERS`) and the other words you may guess (`EXTRA_GUESSES`). Whether
a word is among them is answered fastest by a [[Set]], known from lesson 3: we make it once, and after that `has`
answers at once, however long the list. The first line of `src/game.js` changes to this:

```js file=src/game.js
import { ANSWERS, EXTRA_GUESSES } from './words.js'
```

And this goes to the end of the file:

```js file=src/game.js
// Every word that may be guessed. A Set tells at once whether something is in it (lesson 3).
const VALID_WORDS = new Set([...ANSWERS, ...EXTRA_GUESSES])

export function isValidWord(word) {
  return VALID_WORDS.has(word)
}
```

`[...ANSWERS, ...EXTRA_GUESSES]` pours the two arrays into one, and `new Set(…)` is made from it once, when the file
loads, not at every guess.

The message becomes state in `Game`, and it disappears after a second and a half: `setTimeout`, known from lesson 3,
takes care of that in an effect. Meanwhile the job of ++Enter++ has grown so much that it gets a function of its own:
`submit`. Replace the contents of `src/components/Game.jsx` with this:

```jsx file=src/components/Game.jsx mark=1-2,11,18-23,25-27,30-33,35-37,39-40,46-48,55-57
import { useEffect, useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, isValidWord, letterStates, randomWord } from '../game.js'
import useKeyboard from '../useKeyboard.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'

function Game({ onNewGame }) {
  const [answer] = useState(randomWord)
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState(null) // { text } while a message is showing, otherwise null

  // Worked out from the guesses on every render: they need no state of their own.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // The message disappears after a second and a half.
  useEffect(() => {
    if (message === null) return
    const timer = setTimeout(() => setMessage(null), 1500)
    return () => clearTimeout(timer)
  }, [message])

  // A guess that cannot be sent: say why.
  function reject(text) {
    setMessage({ text })
  }

  function submit() {
    if (current.length < WORD_LENGTH) {
      reject('Not enough letters')
      return
    }
    if (!isValidWord(current)) {
      reject('Not in the word list')
      return
    }
    setGuesses([...guesses, current])
    setCurrent('')
  }

  // One function for both keyboards. key is 'ENTER', 'BACKSPACE' or a capital letter.
  function handleKey(key) {
    if (over) return // the game is over: the keyboard has nothing more to do
    if (key === 'ENTER') submit()
    else if (key === 'BACKSPACE') setCurrent(current.slice(0, -1))
    else if (LETTERS.includes(key) && current.length < WORD_LENGTH) setCurrent(current + key)
  }

  useKeyboard(handleKey)

  return (
    <>
      <p className="message" role="status">
        {message && message.text}
      </p>
      <Board guesses={guesses} current={current} answer={answer} />
      {over ? (
        <section className="result" role="status">
          <h2>{won ? 'You got it!' : 'Not this time'}</h2>
          <p>{won ? `You needed ${guesses.length} of your ${MAX_TRIES} tries.` : `The word was ${answer}.`}</p>
          <div className="result__actions">
            <button type="button" className="button" onClick={onNewGame}>
              New game
            </button>
          </div>
        </section>
      ) : (
        <Keyboard states={letterStates(guesses, answer)} onKey={handleKey} />
      )}
    </>
  )
}

export default Game
```

- `submit` goes through what could stop the guess. If something is wrong, it sends a message, and `return` leaves at
  once: an [[early return]]. It only gets to the end if everything is all right.
- Why is the message an object (`{ text }`) and not the text itself? If the same text came twice in a row, React would
  see that the state has not changed: it would not render again, the effect would not run, and the timer would not
  start again. After the second ++Enter++ the message would disappear too early. A new object, on the other hand, is
  always a new value, even with the same thing inside.
- `{message && message.text}`: when there is no message (`null`), it draws nothing. The empty `<p>` keeps its place
  (so the grid does not jump), and because of `role="status"`, screen readers read the message out when it appears.

:::check Check
Type five identical letters (AAAAA) and press ++Enter++: "Not in the word list" appears above the grid, and the
letters stay in the row so you can fix them. With three letters you get "Not enough letters". The message disappears
after a second and a half. A real word, for example `TABLE`, goes through as before.
:::

:::mistake Common mistake
The `return` after `reject(…)` is left out. The message appears, but the function goes on, and the word is sent after
all: even AAAAA lands in the grid.
:::

:::try Task
Put a word of your own into the game: write a five-letter English word in capitals into the `EXTRA_GUESSES` list of
`words.js`, and check that it is accepted.
:::

### Animations

The game works, but it is still stiff. Four small animations bring it to life: a typed letter pops a little, the tiles
of a sent row turn over one after the other and get their colour halfway through the turn, the row of a rejected
guess shakes its head, and at the end the winning row jumps. Last, the result fades in.

You know from lesson 13 that [[@keyframes]] describes the steps of an animation, and the `animation` property plays it.
A CSS animation starts when the element gets it: when the class that makes it animate is added, or when the element
itself appears on the page. If the class is already there, a new render does not start it again. We will make use of this.

These styles are your own work, so they go into a file of their own. Create the `src/animations.css` file:

```css file=src/animations.css
/* A typed letter pops a little. */
.tile.is-filled {
  animation: pop 0.1s ease-out;
}

@keyframes pop {
  50% {
    transform: scale(1.12);
  }
}

/* A sent row turns over tile by tile, the next one a quarter of a second later. */
.tile.is-correct,
.tile.is-present,
.tile.is-absent {
  animation: flip 0.5s ease both;
  animation-delay: calc(var(--i) * 0.25s);
}

/* Until halfway the tile still looks typed; on the way back it shows its colour. */
@keyframes flip {
  0% {
    transform: rotateX(0);
    border-color: #5a6478;
    background: #fff;
    color: #1c2333;
  }
  50% {
    transform: rotateX(90deg);
    border-color: #5a6478;
    background: #fff;
    color: #1c2333;
  }
  100% {
    transform: rotateX(0);
  }
}

/* The row of a rejected guess shakes its head. */
.row.is-shaking {
  animation: shake 0.4s ease;
}

@keyframes shake {
  20%,
  60% {
    transform: translateX(-8px);
  }
  40%,
  80% {
    transform: translateX(8px);
  }
}

/* After its turn, the winning row jumps, each tile a tenth of a second after the one before. */
.row.is-won .tile {
  animation:
    flip 0.5s ease both,
    jump 0.5s ease;
  animation-delay:
    calc(var(--i) * 0.25s),
    calc(1.5s + var(--i) * 0.1s);
}

@keyframes jump {
  40% {
    transform: translateY(-16px);
  }
}

/* The result appears after the last tile has turned over. */
.result {
  animation: appear 0.4s ease 1.5s both;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

/* Less motion for those who asked for it in their computer's settings. */
@media (prefers-reduced-motion: reduce) {
  .board .row,
  .board .row .tile,
  .result {
    animation: none;
  }
}
```

- `rotateX` turns around the horizontal axis ([[transform]], lesson 13). At 90 degrees the tile stands on its edge and
  cannot be seen: that is when its colour changes. `0%` and `50%` give the colours of a typed tile; `100%` has no
  colours, so there the tile arrives at its own colour: green, yellow or grey.
- [[animation-delay]] delays the start. `var(--i)` is a [[CSS variable]] that every tile gets with its own number (see
  below): tile 0 turns at once, tile 4 a second later.
- `both` is the animation's [[animation-fill-mode]]: the first frame shows during the wait already (the tile stays
  white), and the last frame stays at the end. Without it the tiles would show their colours while waiting for their
  turn, and flash white when it begins.
- The tiles of the winning row have two animations, separated by a comma, and two delays, in the same order. The jump
  starts at 1.5 seconds, when the last tile has turned too (4 × 0.25 + 0.5).
- The result waits 1.5 seconds too, so that it does not give away the outcome before the tiles have turned.
- [[prefers-reduced-motion]] is known from lesson 13: for anyone whose computer asks for less motion, everything jumps
  straight into place. The selectors are this long (`.board .row .tile`) because [[specificity]] matters: when two
  rules set the same property, the one with the more specific selector wins, and of two equally specific ones, the
  later one. `.board .row .tile` is made of three classes, just like `.row.is-won .tile`, and it comes later, so it
  wins.

`Board` gives the tiles the `--i` variable, and the rows the two new classes. The shake needs a trick: it plays again
only if the row is created anew, and the easiest way to make React create a row anew is its [[key]]. So we count the
rejected guesses (`shakes`) and put that number into the key of the row being typed: every rejection means a new key,
a new row, a new shake. Replace the contents of `src/components/Board.jsx` with this:

```jsx file=src/components/Board.jsx mark=2,6,8,15,25,30-33,36-38
import { MAX_TRIES, WORD_LENGTH, evaluate } from '../game.js'
import '../animations.css'

// One row of the grid: five tiles. letters is a piece of text, for example 'CRANE' or 'HO';
// states (only for a sent guess) is the result of evaluate, for example ['absent', 'correct', …].
function Row({ letters, states, className = '' }) {
  return (
    <div className={`row ${className}`}>
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        const letter = letters[i]
        let tileClass = 'tile'
        if (states) tileClass = `tile is-${states[i]}`
        else if (letter) tileClass = 'tile is-filled'
        return (
          <div key={i} className={tileClass} style={{ '--i': i }}>
            {letter}
          </div>
        )
      })}
    </div>
  )
}

// The whole grid, made from the guesses so far and the word being typed.
function Board({ guesses, current, answer, won, shakes }) {
  return (
    <div className="board">
      {Array.from({ length: MAX_TRIES }, (_, row) => {
        if (row < guesses.length) {
          // The last row of a won game jumps too.
          const className = won && row === guesses.length - 1 ? 'is-won' : ''
          return (
            <Row key={row} letters={guesses[row]} states={evaluate(guesses[row], answer)} className={className} />
          )
        }
        if (row === guesses.length) {
          // A new key after every rejection: React builds the row anew, and the shake plays again.
          return <Row key={`current-${shakes}`} letters={current} className={shakes > 0 ? 'is-shaking' : ''} />
        }
        return <Row key={row} letters="" />
      })}
    </div>
  )
}

export default Board
```

- `Board` loads the CSS file (`import '../animations.css'`), like `Card` loaded its own styles in lesson 13.
- `className = ''` is a [[default parameter]]: if `Row` gets no `className`, it is an empty text.
- `style={{ '--i': i }}` is known from lesson 13: an [[inline style]] that hands a CSS variable to the element.

In `Game` the `shakes` counter appears, `reject` increases it, and `Board` gets `won` and `shakes`. Here is the whole
`src/components/Game.jsx` as it stands at the end of the intermediate level:

```jsx file=src/components/Game.jsx mark=12,26,29,60
import { useEffect, useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, isValidWord, letterStates, randomWord } from '../game.js'
import useKeyboard from '../useKeyboard.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'

function Game({ onNewGame }) {
  const [answer] = useState(randomWord)
  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState(null) // { text } while a message is showing, otherwise null
  const [shakes, setShakes] = useState(0) // how many guesses the game has rejected

  // Worked out from the guesses on every render: they need no state of their own.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // The message disappears after a second and a half.
  useEffect(() => {
    if (message === null) return
    const timer = setTimeout(() => setMessage(null), 1500)
    return () => clearTimeout(timer)
  }, [message])

  // A guess that cannot be sent: say why, and shake the row.
  function reject(text) {
    setMessage({ text })
    setShakes(shakes + 1)
  }

  function submit() {
    if (current.length < WORD_LENGTH) {
      reject('Not enough letters')
      return
    }
    if (!isValidWord(current)) {
      reject('Not in the word list')
      return
    }
    setGuesses([...guesses, current])
    setCurrent('')
  }

  // One function for both keyboards. key is 'ENTER', 'BACKSPACE' or a capital letter.
  function handleKey(key) {
    if (over) return // the game is over: the keyboard has nothing more to do
    if (key === 'ENTER') submit()
    else if (key === 'BACKSPACE') setCurrent(current.slice(0, -1))
    else if (LETTERS.includes(key) && current.length < WORD_LENGTH) setCurrent(current + key)
  }

  useKeyboard(handleKey)

  return (
    <>
      <p className="message" role="status">
        {message && message.text}
      </p>
      <Board guesses={guesses} current={current} answer={answer} won={won} shakes={shakes} />
      {over ? (
        <section className="result" role="status">
          <h2>{won ? 'You got it!' : 'Not this time'}</h2>
          <p>{won ? `You needed ${guesses.length} of your ${MAX_TRIES} tries.` : `The word was ${answer}.`}</p>
          <div className="result__actions">
            <button type="button" className="button" onClick={onNewGame}>
              New game
            </button>
          </div>
        </section>
      ) : (
        <Keyboard states={letterStates(guesses, answer)} onKey={handleKey} />
      )}
    </>
  )
}

export default Game
```

:::check Check
While you type, every letter pops a little. After ++Enter++ the tiles of the row turn over one after the other, from
left to right, and get their colour while turning. For a word that does not exist the row shakes its head, every
time. The winning row jumps after its turn, and only then does the result appear. If your computer is set to reduce
motion (or in DevTools: ++Ctrl++ + ++Shift++ + ++P++ → "Emulate CSS prefers-reduced-motion: reduce"), all the
animations are gone. The intermediate level is done: commit it!
:::

:::mistake Common mistake
`animation: flip 0.5s ease`, without `both`. The tiles show their final colour while waiting for their turn, and then,
when their turn begins, they flash white for a moment. `both` holds the first frame during the wait.
:::

:::try Try it
Change the delay from `0.25s` to `0.1s` (and the jump's `1.5s` to `0.9s` to match): it gets snappier. Or try `rotateY`
instead of `rotateX`: the tiles turn sideways.
:::

## Advanced level {level=3}

### The daily word

The magic of the well-known word-guessing games is that on a given day everyone gets the same word, and the next day
you can talk about who found it in how many tries. That needs no server: it is enough to work the word out from the
date. Everyone who opens the game on the same day sees the same date and gets the same word.

From the date we need two things: a short piece of text for the day (`'2026-11-23'`), and a number that says which day
it is. For practice there is still a random word: the game gets two modes, the daily word and practice. The daily game
is saved as well, otherwise a reload would give a fresh chance. Create the `src/daily.js` file:

```js file=src/daily.js
import { ANSWERS } from './words.js'

// Today's date on this computer, as text: for example '2026-11-23'.
export function todayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// The word of a day. The same date gives the same word on every computer.
export function dailyWord(dateKey) {
  // The number of days since 1 January 1970: Date.parse gives milliseconds, and a day is 86,400,000 of them.
  const dayNumber = Date.parse(dateKey) / 86400000
  // Every day we step 37 words on, so the words do not come in alphabetical order.
  return ANSWERS[(dayNumber * 37) % ANSWERS.length]
}

const SAVE_KEY = 'word-guess:daily'

// The guesses of the day's game, if it was saved that day.
export function loadDailyGuesses(dateKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY))
    if (saved && saved.date === dateKey) return saved.guesses
  } catch {
    // Blocked storage or a broken save: start with no guesses.
  }
  return []
}

export function saveDailyGuesses(dateKey, guesses) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ date: dateKey, guesses }))
  } catch {
    // Never mind: the game still works, it just does not remember.
  }
}
```

- `new Date()` is the current moment, by the computer's clock. `getMonth()` counts from 0 (January is 0), hence the
  `+ 1`. [[padStart]], known from lesson 13, fills it up to two digits: `'5'` becomes `'05'`.
- `Date.parse('2026-11-23')` gives midnight in [[UTC]] (Coordinated Universal Time, the reference time of the whole
  world), in milliseconds since 1970. Since it is exactly
  midnight, dividing by the length of a day gives a whole number: the number of the day.
- `%` is the [[modulo]] from lesson 3: the remainder of the division always falls between 0 and the length of the list
  minus 1, that is, a valid place in the list. The secret words are in alphabetical order, so we don't step one by one:
  otherwise the word of the next day would be easy to guess. 37 is a good step because 37 and 179 (the length of the
  list) have no common divisor other than 1, so every word comes up before any of them comes again.
- The saving is known from lessons 2, 6 and 9: [[localStorage]] stores only text, so we turn the data into [[JSON]],
  and [[try/catch]] protects us if the browser blocks storage. If there is no save yet, `getItem` gives `null`,
  `JSON.parse(null)` gives `null` too, and the condition is false. The date is saved as well: yesterday's guesses are
  not valid today.

`Game` gets the mode (`mode`: `'daily'` or `'practice'`), and where the secret word and the first guesses come from
depends on it. Replace the contents of `src/components/Game.jsx` with this:

```jsx file=src/components/Game.jsx mark=3,8-12,22-25,73-81
import { useEffect, useState } from 'react'
import { LETTERS, MAX_TRIES, WORD_LENGTH, isValidWord, letterStates, randomWord } from '../game.js'
import { dailyWord, loadDailyGuesses, saveDailyGuesses, todayKey } from '../daily.js'
import useKeyboard from '../useKeyboard.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'

function Game({ mode, onNewGame }) {
  // The day this game belongs to. It does not change while this Game lives, so there is no setter.
  const [today] = useState(todayKey)
  const [answer] = useState(() => (mode === 'daily' ? dailyWord(today) : randomWord()))
  const [guesses, setGuesses] = useState(() => (mode === 'daily' ? loadDailyGuesses(today) : []))
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState(null) // { text } while a message is showing, otherwise null
  const [shakes, setShakes] = useState(0) // how many guesses the game has rejected

  // Worked out from the guesses on every render: they need no state of their own.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // The daily game is saved after every guess: after a reload it goes on, and it cannot be played twice.
  useEffect(() => {
    if (mode === 'daily') saveDailyGuesses(today, guesses)
  }, [mode, today, guesses])

  // The message disappears after a second and a half.
  useEffect(() => {
    if (message === null) return
    const timer = setTimeout(() => setMessage(null), 1500)
    return () => clearTimeout(timer)
  }, [message])

  // A guess that cannot be sent: say why, and shake the row.
  function reject(text) {
    setMessage({ text })
    setShakes(shakes + 1)
  }

  function submit() {
    if (current.length < WORD_LENGTH) {
      reject('Not enough letters')
      return
    }
    if (!isValidWord(current)) {
      reject('Not in the word list')
      return
    }
    setGuesses([...guesses, current])
    setCurrent('')
  }

  // One function for both keyboards. key is 'ENTER', 'BACKSPACE' or a capital letter.
  function handleKey(key) {
    if (over) return // the game is over: the keyboard has nothing more to do
    if (key === 'ENTER') submit()
    else if (key === 'BACKSPACE') setCurrent(current.slice(0, -1))
    else if (LETTERS.includes(key) && current.length < WORD_LENGTH) setCurrent(current + key)
  }

  useKeyboard(handleKey)

  return (
    <>
      <p className="message" role="status">
        {message && message.text}
      </p>
      <Board guesses={guesses} current={current} answer={answer} won={won} shakes={shakes} />
      {over ? (
        <section className="result" role="status">
          <h2>{won ? 'You got it!' : 'Not this time'}</h2>
          <p>{won ? `You needed ${guesses.length} of your ${MAX_TRIES} tries.` : `The word was ${answer}.`}</p>
          {mode === 'daily' ? (
            <p>A new word comes tomorrow. Until then, practise!</p>
          ) : (
            <div className="result__actions">
              <button type="button" className="button" onClick={onNewGame}>
                New word
              </button>
            </div>
          )}
        </section>
      ) : (
        <Keyboard states={letterStates(guesses, answer)} onKey={handleKey} />
      )}
    </>
  )
}

export default Game
```

- `const [today] = useState(todayKey)` is state without a setter: the day is decided once, when the game starts, and
  does not change after that. If someone plays across midnight, the guesses are saved for the day the game started on.
- The lazy initial state of the secret word and of the first guesses is now an arrow function each, because what has
  to be worked out depends on the mode. In daily mode the game starts with the saved guesses, in practice with an
  empty list.
- The new effect saves after every guess, but only in daily mode: practice does not go into storage.
- At the end of a practice game the button now says "New word" (it said "New game" so far). In daily mode there is no
  such button: the word of the day can be found only once.

`App` gives the mode: it gets two buttons, and the mode goes into the key of `Game` too. So changing the mode also
brings a brand new `Game`, with its own word and guesses. Replace the contents of `src/App.jsx` with this:

```jsx file=src/App.jsx mark=6,13-23
import { useState } from 'react'
import Game from './components/Game.jsx'
import './App.css'

function App() {
  const [mode, setMode] = useState('daily') // 'daily' or 'practice'
  // Every game gets a number of its own. A new number is a new key, and a new key is a brand new Game.
  const [round, setRound] = useState(0)

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <div className="switches">
        <div className="toggle" role="group" aria-label="Game mode">
          <button type="button" aria-pressed={mode === 'daily'} onClick={() => setMode('daily')}>
            Daily word
          </button>
          <button type="button" aria-pressed={mode === 'practice'} onClick={() => setMode('practice')}>
            Practice
          </button>
        </div>
      </div>
      <Game key={`${mode}-${round}`} mode={mode} onNewGame={() => setRound(round + 1)} />
    </main>
  )
}

export default App
```

The two buttons work as a switch: [[aria-pressed]] (lesson 2) tells screen readers which one is on, and `App.css`
colours them by it too. `role="group"` and `aria-label` put them into a group with a name.

:::check Check
A switch with two buttons appears under the title, with "Daily word" on. Make two guesses and reload the page: the two guesses are
still there, with the same word. Open the page in a private window too, and type the same two guesses: the same colours
come, because it is the same daily word. "Practice" starts with a random word and an empty grid, and a "New word"
button waits at the end. Back to "Daily word": today's game is there as you left it. When the daily word is finished,
the end says "A new word comes tomorrow."
:::

:::mistake Common mistake
The saving without `if (mode === 'daily')`. Then the guesses of practice go into the daily save too: back on "Daily
word" you see your practice guesses, coloured against the daily word.
:::

:::concept How "the same" is it for everyone?
The word comes from the date on the computer's clock, so it changes at midnight, for everyone at their own midnight: in
New York the new word arrives five hours later than in London. On the same calendar day, though, everyone gets the same
word, and that is exactly what you need to talk about it. The well-known word games work the same way. Since the word
list and the calculation are both in the code, a clever programmer could work out tomorrow's word too; for a game, that
is fine.
:::

### Statistics and streaks

Players like to see how they are doing: how many games they played, how many they won, how many days in a row they
have been winning (the **streak**), and in how many tries they usually find the word. The statistics count only the
daily games, and of course they survive a reload.

For saving, the [[custom hook]] from lesson 9 is the most convenient: `useLocalStorage`. It works like `useState`, but
its value survives a reload. Create the `src/useLocalStorage.js` file (if you have your own version from lesson 9, that
will do too):

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

  return [value, setValue]
}

export default useLocalStorage
```

For the streak we need to know yesterday's date. Add this to the end of `src/daily.js`:

```js file=src/daily.js
// The day before, in the same form: '2026-11-23' → '2026-11-22'.
export function previousDay(dateKey) {
  const dayBefore = new Date(Date.parse(dateKey) - 86400000)
  return dayBefore.toISOString().slice(0, 10)
}
```

`Date.parse` gives the moment of midnight in milliseconds, we take one day off, and `new Date(…)` turns it back into a
moment.
`toISOString()` writes it out in UTC (`'2026-11-22T00:00:00.000Z'`), and its first ten characters are exactly the date.
Since both directions work in UTC, it does not matter what time it is where you are.

The statistics themselves are an object, and working them out is not React's business, so they get a file of their
own. Create the `src/stats.js` file:

```js file=src/stats.js
import { previousDay } from './daily.js'

// The statistics of a player who has not played yet.
export const NEW_STATS = {
  played: 0,
  wins: 0,
  streak: 0, // wins on days one after the other
  bestStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0], // how many games were won in 1, 2, … 6 tries
  lastWin: null, // the date of the last win
}

// The statistics after one more finished daily game. Returns a new object; the old one does not change.
export function addResult(stats, won, tries, dateKey) {
  if (!won) {
    return { ...stats, played: stats.played + 1, streak: 0 }
  }
  // The streak goes on only if the last win was yesterday.
  const streak = stats.lastWin === previousDay(dateKey) ? stats.streak + 1 : 1
  const distribution = [...stats.distribution]
  distribution[tries - 1] += 1
  return {
    played: stats.played + 1,
    wins: stats.wins + 1,
    streak,
    bestStreak: Math.max(stats.bestStreak, streak),
    distribution,
    lastWin: dateKey,
  }
}
```

- `addResult` never changes the object it gets: it returns a new one, it copies the `distribution` array too
  (`[...stats.distribution]`), and changes only the copy. This is the [[immutable update]] that state needs.
- A loss resets the streak. A win continues it if you won yesterday too; otherwise it starts again from 1.
- `distribution[tries - 1]`: the array counts from 0, so a win in three tries goes to place 2.

The statistics are drawn by a component of their own: four numbers and a bar for each number of tries. Create the
`src/components/Stats.jsx` file:

```jsx file=src/components/Stats.jsx
// The statistics of the daily games: four numbers, and a bar for every number of tries.
function Stats({ stats, highlight }) {
  const winPercent = stats.played === 0 ? 0 : Math.round((stats.wins / stats.played) * 100)
  // The longest bar belongs to the most frequent number of tries (at least 1, so we never divide by zero).
  const most = Math.max(1, ...stats.distribution)

  return (
    <div className="stats">
      <dl className="stats__numbers">
        <div>
          <dt>Played</dt>
          <dd>{stats.played}</dd>
        </div>
        <div>
          <dt>Win %</dt>
          <dd>{winPercent}</dd>
        </div>
        <div>
          <dt>Streak</dt>
          <dd>{stats.streak}</dd>
        </div>
        <div>
          <dt>Best streak</dt>
          <dd>{stats.bestStreak}</dd>
        </div>
      </dl>
      <h3>Guess distribution</h3>
      <ol className="stats__bars">
        {stats.distribution.map((count, index) => (
          <li key={index} className={index + 1 === highlight ? 'is-current' : ''}>
            <span>{index + 1}</span>
            <span className="stats__bar" style={{ width: `${(count / most) * 100}%` }}>
              {count}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default Stats
```

- The numbers are the items of a [[description list]] (`<dl>`), like the results of lesson 13: `<dt>` is the name,
  `<dd>` the value. `App.css` puts the number on top.
- In `Math.max(1, ...stats.distribution)` the [[spread]] stands in a function call, like `Math.min(...values)` in
  lesson 14: it hands over the items of the array as separate arguments, as if we had written
  `Math.max(1, 0, 2, 5, …)`.
- The width of a bar is a percentage of the largest one, as an inline style. `highlight` is the number of tries of the
  game just finished: its bar is green.

There are four places to change in `Game`. First, at the top of the file, these three join the existing imports:

```jsx file=src/components/Game.jsx
import { NEW_STATS, addResult } from '../stats.js'
import useLocalStorage from '../useLocalStorage.js'
import Stats from './Stats.jsx'
```

Then, under the `shakes` state, the statistics, under a key of their own:

```jsx file=src/components/Game.jsx mark=2
  const [shakes, setShakes] = useState(0) // how many guesses the game has rejected
  const [stats, setStats] = useLocalStorage('word-guess:stats', NEW_STATS)
```

At the end of `submit` we note the result if this guess ended a daily game. Replace the whole `submit` function with
this:

```jsx file=src/components/Game.jsx mark=10-11,14-18
  function submit() {
    if (current.length < WORD_LENGTH) {
      reject('Not enough letters')
      return
    }
    if (!isValidWord(current)) {
      reject('Not in the word list')
      return
    }
    const newGuesses = [...guesses, current]
    setGuesses(newGuesses)
    setCurrent('')

    // A finished daily game goes into the statistics. Practice does not count.
    const guessed = current === answer
    if (mode === 'daily' && (guessed || newGuesses.length === MAX_TRIES)) {
      setStats(addResult(stats, guessed, newGuesses.length, today))
    }
  }
```

Finally, the statistics appear at the end of a daily game. Replace the `mode === 'daily' ? (` branch of the result with
this (the practice branch, after `) : (`, stays):

```jsx file=src/components/Game.jsx mark=2-5
          {mode === 'daily' ? (
            <>
              <Stats stats={stats} highlight={won ? guesses.length : null} />
              <p>A new word comes tomorrow. Until then, practise!</p>
            </>
          ) : (
```

- `newGuesses` is needed because after `setGuesses`, `guesses` is still the old list inside this function: the new
  value arrives with the next render (lesson 3's `changeLength` worked the same way).
- The result is noted by the event handler, at the very moment the game ends. This way it is counted exactly once,
  however many times you reload the page.
- In the new branch a `<>…</>` [[Fragment]] holds the statistics and the text together, because each branch of `? :`
  can return only one element.

:::check Check
If you already finished today's daily game in the previous step, it ended before the statistics existed, so it was not
counted. Delete its save first: ++F12++ → Application → Local Storage → right-click `word-guess:daily` → Delete, then
reload the page. Then finish today's daily game. The statistics appear under the result: 1 game played, a win % of
100, a streak of 1, and the bar of the number of tries you needed is green (after a loss, the win % and the streak are
both 0). Reload the page: the statistics stay the same, the game was not counted twice. A practice game does not change
them.
:::

:::mistake Common mistake
Noting the result in an effect: `useEffect(() => { if (over) setStats(…) }, [over])`. After a reload `over` is already
true on the first render of the finished daily game, the effect runs, and the same game is counted again: every reload
is one more game.
:::

:::try Task
Try the streak without waiting for tomorrow. In DevTools (++F12++ → Application → Local Storage), change the `lastWin`
value of `word-guess:stats` to yesterday's date, delete the `word-guess:daily` save, reload the page, and find today's
word again (you know it already!): the streak becomes 2.
:::

### Sharing the result

The best-known part of word-guessing games like this one is sharing: coloured squares without letters, so everyone sees how you got to
the answer, but you don't give the word away. The squares are [[emoji]], that is, ordinary text characters, so they go
to the clipboard as text.

The grid of squares is made from the guesses and the secret word. Add this to the end of `game.js`:

```js file=src/game.js
// The result as coloured squares, one line per guess, without the letters: it gives nothing away.
const SQUARES = { correct: '🟩', present: '🟨', absent: '⬛' }

export function emojiGrid(guesses, answer) {
  return guesses
    .map((guess) => evaluate(guess, answer).map((state) => SQUARES[state]).join(''))
    .join('\n')
}
```

The inner `map` turns the result of one guess into squares, and `join('')` glues them into one line. The outer `map`
makes such a line from every guess, and `join('\n')` puts them together with line breaks. `'\n'` is the [[line break]]
character: the backslash says that a special character comes, not the letter n.

The share button is a sibling of the copy button of lesson 3: it copies, and says on the button for two seconds whether
it worked. Create the `src/components/ShareButton.jsx` file:

```jsx file=src/components/ShareButton.jsx
import { useEffect, useState } from 'react'

// Copies the text to the clipboard, and says on the button for two seconds whether it worked.
function ShareButton({ text }) {
  const [status, setStatus] = useState('idle') // 'idle', 'copied' or 'failed'

  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 2000)
    return () => clearTimeout(timer)
  }, [status])

  async function share() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  let label = 'Share result'
  if (status === 'copied') label = 'Copied to the clipboard!'
  if (status === 'failed') label = 'Copying failed'

  return (
    <button type="button" className="button" onClick={share}>
      {label}
    </button>
  )
}

export default ShareButton
```

The same pattern as in lesson 3: `writeText` of the [[Clipboard API]] returns a [[Promise]], which `await` waits for,
and `try/catch` catches it if the browser does not allow copying.

There are three places to change in `Game`. At the top of the file `emojiGrid` joins the import of `game.js`, and the
button's import goes under it:

```jsx file=src/components/Game.jsx mark=1,2
import { LETTERS, MAX_TRIES, WORD_LENGTH, emojiGrid, isValidWord, letterStates, randomWord } from '../game.js'
import ShareButton from './ShareButton.jsx'
```

Under the `useKeyboard(handleKey)` line, the text to share:

```jsx file=src/components/Game.jsx mark=3-5
  useKeyboard(handleKey)

  // The text to share: the date, the score (X for a lost game) and the squares.
  const score = won ? guesses.length : 'X'
  const shareText = `Rika Word Guess ${today} ${score}/${MAX_TRIES}\n\n${emojiGrid(guesses, answer)}`
```

Finally, the button goes into the daily branch, under the statistics. Replace the `mode === 'daily' ? (` branch with
this:

```jsx file=src/components/Game.jsx mark=4-6
          {mode === 'daily' ? (
            <>
              <Stats stats={stats} highlight={won ? guesses.length : null} />
              <div className="result__actions">
                <ShareButton text={shareText} />
              </div>
              <p>A new word comes tomorrow. Until then, practise!</p>
            </>
          ) : (
```

`shareText` is a derived value too: it is made on every render, but used only at the end of the game. `\n\n` is two
line breaks, that is, an empty line between the title and the squares.

:::check Check
If you haven't finished today's daily game yet, finish it. Under the result, after the statistics, there is now a "Share
result" button: click it, its label says "Copied to the clipboard!", and two seconds later it changes back. Paste it
(++Ctrl++ + ++V++) into your editor: the first line says, for example, "Rika Word Guess 2026-11-23 4/6", and after an
empty line comes one row of coloured squares per guess.
:::

:::mistake Common mistake
The outer `join` becomes `join('')` too. Then all the squares end up in one long line, and you can't see where one
guess ends. The guesses are separated by `'\n'`.
:::

:::try Task
Make the result of a practice game shareable too: put a `ShareButton` next to "New word" in the practice branch. Instead
of the date, write "practice" there.
:::

### A Hungarian word list

Finally, the game should speak Hungarian too. `src/wordsHu.js` came with the exercise: 181 secret words (`ANSWERS_HU`)
and almost three hundred more words you may guess (`EXTRA_GUESSES_HU`). Because of the accented letters, though, more depends
on the language than you might think:

- **the words:** the list of secret words and the `Set` of words you may guess;
- **the letters:** Á, É, Í, Ó, Ö, Ő, Ú, Ü and Ű are letters of the game too;
- **the keyboard:** on a Hungarian keyboard Z and Y swap places, and the accented letters are needed too;
- **the saving:** the Hungarian daily word deserves a save and statistics of its own, otherwise the two languages
  would get mixed up.

Everything that depends on the language goes into one object per language. Create the `src/wordLists.js` file:

```js file=src/wordLists.js
import { ANSWERS, EXTRA_GUESSES } from './words.js'
import { ANSWERS_HU, EXTRA_GUESSES_HU } from './wordsHu.js'

// Everything that depends on the language of the words, in one object per language.
export const WORD_LISTS = {
  en: {
    answers: ANSWERS,
    valid: new Set([...ANSWERS, ...EXTRA_GUESSES]),
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    keyboard: [
      [...'QWERTYUIOP'],
      [...'ASDFGHJKL'],
      ['ENTER', ...'ZXCVBNM', 'BACKSPACE'],
    ],
  },
  hu: {
    answers: ANSWERS_HU,
    valid: new Set([...ANSWERS_HU, ...EXTRA_GUESSES_HU]),
    letters: 'AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ',
    // A Hungarian keyboard: Z and Y swap places, and the accented letters get a row of their own.
    keyboard: [
      [...'ÁÉÍÓÖŐÚÜŰ'],
      [...'QWERTZUIOP'],
      [...'ASDFGHJKL'],
      ['ENTER', ...'YXCVBNM', 'BACKSPACE'],
    ],
  },
}
```

In the [[Unicode]] standard the accented letters are characters of their own: `'Ő'.length` is 1, and
`'ő'.toUpperCase()` is `'Ő'`. That is why `useKeyboard` and `evaluate` work with them without any change.

Heads-up: the next five files depend on each other. From the moment you replace `game.js` until `App.jsx` is replaced
too, the game does not work: the page may go blank or stop updating, and the console (++F12++ → Console) shows errors,
for example "does not provide an export named 'LETTERS'". That is expected: keep going, and check at the end of the
step.

Everything that depends on the language moves out of `game.js`: the import, `LETTERS`, `VALID_WORDS` and
`isValidWord`. And `randomWord` gets the list as a parameter. Replace the contents of `src/game.js` with this:

```js file=src/game.js mark=5-7
// The rules of the game in two numbers.
export const WORD_LENGTH = 5
export const MAX_TRIES = 6

// A random secret word from the given list.
export function randomWord(answers) {
  return answers[Math.floor(Math.random() * answers.length)]
}

// What a guess is worth, letter by letter: 'correct' (right letter, right place),
// 'present' (in the word, but somewhere else) or 'absent' (not in the word).
export function evaluate(guess, answer) {
  const result = []
  // The letters of the secret word that are left over, and how many of each, for example { I: 1, A: 1 }.
  const left = {}

  // First pass: the greens. The letters of the secret word that are not hit go into left.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct'
    } else {
      result[i] = 'absent'
      left[answer[i]] = (left[answer[i]] ?? 0) + 1
    }
  }

  // Second pass: a letter in the wrong place is yellow only if there is still one of it left over.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'absent' && left[guess[i]] > 0) {
      result[i] = 'present'
      left[guess[i]] -= 1
    }
  }

  return result
}

// What each result is worth: a letter's colour on the keyboard can only get better.
const RANK = { absent: 1, present: 2, correct: 3 }

// The best result of every letter guessed so far, for the keyboard: { C: 'absent', R: 'present', … }
export function letterStates(guesses, answer) {
  const states = {}
  for (const guess of guesses) {
    const result = evaluate(guess, answer)
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = guess[i]
      // The first result always goes in; later only a better one can replace it.
      if (states[letter] === undefined || RANK[result[i]] > RANK[states[letter]]) {
        states[letter] = result[i]
      }
    }
  }
  return states
}

// The result as coloured squares, one line per guess, without the letters: it gives nothing away.
const SQUARES = { correct: '🟩', present: '🟨', absent: '⬛' }

export function emojiGrid(guesses, answer) {
  return guesses
    .map((guess) => evaluate(guess, answer).map((state) => SQUARES[state]).join(''))
    .join('\n')
}
```

In `daily.js` the daily word comes from the given list, and the language goes into the key of the save. Replace the
contents of `src/daily.js` with this:

```js file=src/daily.js mark=9-10,14,17-18,20,28,30
// Today's date on this computer, as text: for example '2026-11-23'.
export function todayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// The word of a day, from the given list. The same date gives the same word on every computer.
export function dailyWord(dateKey, answers) {
  // The number of days since 1 January 1970: Date.parse gives milliseconds, and a day is 86,400,000 of them.
  const dayNumber = Date.parse(dateKey) / 86400000
  // Every day we step 37 words on, so the words do not come in alphabetical order.
  return answers[(dayNumber * 37) % answers.length]
}

// Every language has a daily game of its own, under a key of its own.
export function loadDailyGuesses(lang, dateKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(`word-guess:${lang}:daily`))
    if (saved && saved.date === dateKey) return saved.guesses
  } catch {
    // Blocked storage or a broken save: start with no guesses.
  }
  return []
}

export function saveDailyGuesses(lang, dateKey, guesses) {
  try {
    localStorage.setItem(`word-guess:${lang}:daily`, JSON.stringify({ date: dateKey, guesses }))
  } catch {
    // Never mind: the game still works, it just does not remember.
  }
}

// The day before, in the same form: '2026-11-23' → '2026-11-22'.
export function previousDay(dateKey) {
  const dayBefore = new Date(Date.parse(dateKey) - 86400000)
  return dayBefore.toISOString().slice(0, 10)
}
```

The step of 37 visits every word of the Hungarian list too: it has 181 words, and 181 and 37 have no common divisor
other than 1 either.

The rows of the keyboard come from outside from now on: the `rows` prop instead of `ROWS`. Replace the contents of
`src/components/Keyboard.jsx` with this:

```jsx file=src/components/Keyboard.jsx mark=4-5,8
// What is written on the two wide keys.
const LABELS = { ENTER: 'Enter', BACKSPACE: '⌫' }

// rows holds the rows of keys: letters, with ENTER and BACKSPACE as the two wide keys.
function Keyboard({ rows, states, onKey }) {
  return (
    <div className="keyboard">
      {rows.map((row, index) => (
        <div key={index} className="keyboard__row">
          {row.map((key) => {
            let keyClass = key.length > 1 ? 'key key--wide' : 'key'
            if (states[key]) keyClass += ` is-${states[key]}`
            return (
              <button
                key={key}
                type="button"
                className={keyClass}
                aria-label={key === 'BACKSPACE' ? 'Delete letter' : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onKey(key)}
              >
                {LABELS[key] ?? key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Keyboard
```

`Game` gets the language through the `lang` prop, and takes the words, the letters and the keyboard from
`WORD_LISTS[lang]`. The language goes into the key of the statistics too. Here is the whole, finished
`src/components/Game.jsx`:

```jsx file=src/components/Game.jsx mark=2,5,13-15,18-19,23,32-33,53,73,109
import { useEffect, useState } from 'react'
import { MAX_TRIES, WORD_LENGTH, emojiGrid, letterStates, randomWord } from '../game.js'
import { dailyWord, loadDailyGuesses, saveDailyGuesses, todayKey } from '../daily.js'
import { NEW_STATS, addResult } from '../stats.js'
import { WORD_LISTS } from '../wordLists.js'
import useKeyboard from '../useKeyboard.js'
import useLocalStorage from '../useLocalStorage.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'
import ShareButton from './ShareButton.jsx'
import Stats from './Stats.jsx'

function Game({ lang, mode, onNewGame }) {
  // Everything that depends on the language: the words, the letters and the keyboard.
  const list = WORD_LISTS[lang]
  // The day this game belongs to. It does not change while this Game lives, so there is no setter.
  const [today] = useState(todayKey)
  const [answer] = useState(() => (mode === 'daily' ? dailyWord(today, list.answers) : randomWord(list.answers)))
  const [guesses, setGuesses] = useState(() => (mode === 'daily' ? loadDailyGuesses(lang, today) : []))
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState(null) // { text } while a message is showing, otherwise null
  const [shakes, setShakes] = useState(0) // how many guesses the game has rejected
  const [stats, setStats] = useLocalStorage(`word-guess:${lang}:stats`, NEW_STATS)

  // Worked out from the guesses on every render: they need no state of their own.
  const won = guesses.includes(answer)
  const lost = !won && guesses.length === MAX_TRIES
  const over = won || lost

  // The daily game is saved after every guess: after a reload it goes on, and it cannot be played twice.
  useEffect(() => {
    if (mode === 'daily') saveDailyGuesses(lang, today, guesses)
  }, [lang, mode, today, guesses])

  // The message disappears after a second and a half.
  useEffect(() => {
    if (message === null) return
    const timer = setTimeout(() => setMessage(null), 1500)
    return () => clearTimeout(timer)
  }, [message])

  // A guess that cannot be sent: say why, and shake the row.
  function reject(text) {
    setMessage({ text })
    setShakes(shakes + 1)
  }

  function submit() {
    if (current.length < WORD_LENGTH) {
      reject('Not enough letters')
      return
    }
    if (!list.valid.has(current)) {
      reject('Not in the word list')
      return
    }
    const newGuesses = [...guesses, current]
    setGuesses(newGuesses)
    setCurrent('')

    // A finished daily game goes into the statistics. Practice does not count.
    const guessed = current === answer
    if (mode === 'daily' && (guessed || newGuesses.length === MAX_TRIES)) {
      setStats(addResult(stats, guessed, newGuesses.length, today))
    }
  }

  // One function for both keyboards. key is 'ENTER', 'BACKSPACE' or a capital letter.
  function handleKey(key) {
    if (over) return // the game is over: the keyboard has nothing more to do
    if (key === 'ENTER') submit()
    else if (key === 'BACKSPACE') setCurrent(current.slice(0, -1))
    else if (list.letters.includes(key) && current.length < WORD_LENGTH) setCurrent(current + key)
  }

  useKeyboard(handleKey)

  // The text to share: the date, the score (X for a lost game) and the squares.
  const score = won ? guesses.length : 'X'
  const shareText = `Rika Word Guess ${today} ${score}/${MAX_TRIES}\n\n${emojiGrid(guesses, answer)}`

  return (
    <>
      <p className="message" role="status">
        {message && message.text}
      </p>
      <Board guesses={guesses} current={current} answer={answer} won={won} shakes={shakes} />
      {over ? (
        <section className="result" role="status">
          <h2>{won ? 'You got it!' : 'Not this time'}</h2>
          <p>{won ? `You needed ${guesses.length} of your ${MAX_TRIES} tries.` : `The word was ${answer}.`}</p>
          {mode === 'daily' ? (
            <>
              <Stats stats={stats} highlight={won ? guesses.length : null} />
              <div className="result__actions">
                <ShareButton text={shareText} />
              </div>
              <p>A new word comes tomorrow. Until then, practise!</p>
            </>
          ) : (
            <div className="result__actions">
              <button type="button" className="button" onClick={onNewGame}>
                New word
              </button>
            </div>
          )}
        </section>
      ) : (
        <Keyboard rows={list.keyboard} states={letterStates(guesses, answer)} onKey={handleKey} />
      )}
    </>
  )
}

export default Game
```

If you gave practice games a share button in the previous task, carry your changes (the practice share text and the
`ShareButton` next to "New word") over into this file too. The key of `useLocalStorage` now depends on the language
(`word-guess:hu:stats`). That is safe, because changing the
language brings a new `Game` (see below): the key never changes while a `Game` lives, and with every new `Game` the hook
reads from its own key.

`App` remembers the chosen language (we leave that to `useLocalStorage` too), gets two switches for it, and the
language goes into the key of `Game` as well. Replace the contents of `src/App.jsx` with this:

```jsx file=src/App.jsx mark=2,7,24-31,33
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import Game from './components/Game.jsx'
import './App.css'

function App() {
  const [lang, setLang] = useLocalStorage('word-guess:lang', 'en') // the language of the words: 'en' or 'hu'
  const [mode, setMode] = useState('daily') // 'daily' or 'practice'
  // Every game gets a number of its own. A new number is a new key, and a new key is a brand new Game.
  const [round, setRound] = useState(0)

  return (
    <main className="game">
      <h1>Word Guess</h1>
      <div className="switches">
        <div className="toggle" role="group" aria-label="Game mode">
          <button type="button" aria-pressed={mode === 'daily'} onClick={() => setMode('daily')}>
            Daily word
          </button>
          <button type="button" aria-pressed={mode === 'practice'} onClick={() => setMode('practice')}>
            Practice
          </button>
        </div>
        <div className="toggle" role="group" aria-label="Word list">
          <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
            English
          </button>
          <button type="button" aria-pressed={lang === 'hu'} onClick={() => setLang('hu')}>
            Magyar
          </button>
        </div>
      </div>
      <Game key={`${lang}-${mode}-${round}`} lang={lang} mode={mode} onNewGame={() => setRound(round + 1)} />
    </main>
  )
}

export default App
```

The language buttons show each language's own name ("English", "Magyar"), as on most websites: this way people find
their own language even if they cannot read the other one. The keys of the saves have changed, so the English daily
game and statistics you had so far start from zero once.

:::check Check
"English" and "Magyar" appear among the switches. Click "Magyar": a Hungarian daily word comes, and the keyboard gets
four rows: the accented letters on top, and Y where Z was. With a Hungarian layout you can type the accented letters
on the real keyboard too. A word like ALMÁS goes through, a made-up one like ÁÁÁÁÁ gets "Not in the word list". Back to
"English": the English daily game is there as you left it, and each language has statistics of its own. After a
reload the chosen language stays. Congratulations, your word-guessing game is finished!
:::

:::concept Why is CS two tiles?
In the Hungarian alphabet CS, GY, SZ and friends each count as one letter, but our game counts characters: for it,
KÖNYV ("book") is five tiles (K-Ö-N-Y-V), although Hungarian grammar says it has four letters. A real Hungarian
version would put these into one tile, but for that every word would have to be split into letters. That is trickier
than it looks: in "házsor" (a row of houses), for example, Z and S are two separate letters, not ZS, and "egészség"
(health) has SZ and S side by side, not S and ZS. So many games like this take our route: the word list holds words of
five characters, and that's that.
:::

:::mistake Common mistake
The language is left out of the key of the save. Then the two languages share one save: switching to "Magyar" shows the
guesses you made for the English daily word, coloured against the Hungarian word, and the statistics of the two
languages get mixed up too.
:::

:::try Task
Extend the Hungarian word list: write new five-character words in capitals into the `EXTRA_GUESSES_HU` list of
`wordsHu.js`, and try them. If you want a word to be a secret word too, put it into `ANSWERS_HU`. Careful: if the
number of secret words becomes a multiple of 37 (for example 185), the daily word only cycles through a few words; then
add one more.
:::
