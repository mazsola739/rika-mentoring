# What we build

A card-matching memory game. The cards lie face down, you turn over two at a time, and if the two pictures match, the
pair stays open. If they don't, both turn back after a second, and you have to remember what was where. On the way you
learn how React keeps track of more complex state (the list of cards and the selected pair), how `setTimeout`
delays something, how to shuffle a deck, and how a card turns over in 3D with a CSS animation.

:::levels
- Cards that turn over when clicked, finding pairs, and a "You won!" message. | about 2 hours
- A move counter, a clock, a real flip animation and three difficulty levels. | about 3 hours
- Saved best results, emoji themes, a two-player mode and keyboard controls. | about 3 hours
:::

**Before you start you need:** the earlier lessons. We build mostly on these: lesson 3 (the Fisher–Yates shuffle,
`setTimeout` with cleanup), lesson 6 (flipping a card with CSS, `useLocalStorage`), lesson 9 (lists with `key`, arrays
in state) and lesson 12 (`setInterval`). Wherever something familiar is used in a new way, we explain it again.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is the `lessons/13-memory-game/exercise` folder of the course repository (the "Exercise on
GitHub" button above opens it on GitHub). Lesson 1 explains in detail how to get it; here it is in short. Open a
terminal in your work folder, where the `rika-mentoring` repository from the earlier lessons is, bring in the new
lessons, then copy this lesson's exercise folder out of the repository as `memory-game`:

```shell
cd rika-mentoring
git pull        # brings the new lessons
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/13-memory-game/exercise memory-game
```

No repository yet? Run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the first three lines.
No git? On the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**,
and copy the `lessons/13-memory-game/exercise` folder out of it into your work folder as `memory-game`. You work in
your copy: the repository stays untouched, so `git pull` keeps working.

Open your `memory-game` folder in the editor, and type these two commands in its terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white panel in the middle of the page,
with the title "Memory Game". Nothing else is on it yet: building the game is your job.
:::

Leave the server running. In a second terminal, in the `memory-game` folder, make your copy a git repository with one
commit, the starting point:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step
that works.

The exercise has three files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the page, ready (the white panel, the grid of cards, the buttons, the "You won!"
  banner…). You don't write these; you only use the class names (`game`, `board`, `win`, …) the steps give you.
- `src/components/Card.css`: the look of one card. You write the `Card` component that uses it in the next step. In
  the intermediate level you replace this file with a version where the cards really flip over: that one will be your
  own CSS.

:::concept A quick recap
A [[component]] is a function that returns [[JSX]]. It gets [[props]] from outside and remembers things with
[[useState]]: when a state value changes, React draws the component again. Work outside drawing, such as a timer,
goes into [[useEffect]]. `map` turns an array into a list, and every item gets a unique [[key]]. An array or object in
state is never changed in place: we always give the setter a new one. The steps remind you of these briefly.
:::

### The deck

A memory game starts with a deck of cards. Every card has a picture (for us, an emoji), and every picture appears on
exactly two cards. We shuffle the cards so nobody knows what is where.

We need to know three things about a card: its id, its picture, and whether its pair has been found yet. That is an
[[object]]: `{ id: 3, emoji: '🦊', matched: false }`. The deck is an [[array]] of such objects.

This logic has nothing to do with React, so it goes into a file of its own. Create a `game.js` file in the `src`
folder:

```js file=src/game.js
// The pictures on the cards: each one becomes a pair.
const EMOJIS = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐵', '🐰']

// Fisher–Yates shuffle: returns a new, shuffled array and leaves the original alone.
export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

// A new deck: every emoji twice, shuffled. Every card is an object.
export function createDeck() {
  const doubled = [...EMOJIS, ...EMOJIS]
  return shuffle(doubled).map((emoji, index) => ({ id: index, emoji, matched: false }))
}
```

- `shuffle` is the [[Fisher–Yates shuffle]] from lesson 3: it walks from the last place to the front and swaps every
  item with a randomly chosen one from the part that is not shuffled yet. There is one difference: `[...items]` first
  copies the array it gets and shuffles the copy. This way the array it gets stays untouched, and the function is safe
  to use with any array (from the intermediate level on we shuffle `EMOJIS` itself with it).
- `[...EMOJIS, ...EMOJIS]` is the [[spread]] syntax: each `...` pours the items of `EMOJIS` into the new array, one
  after the other. The result is an array of 16 items, every emoji twice.
- `map` makes a card object from every emoji. The second parameter of the arrow function we give it, `index`, is the
  emoji's place in the already shuffled array (0, 1, 2…): that becomes the card's id. In `({ … })`, the round brackets
  around the curly braces are needed because after an arrow, JavaScript would read a curly brace as the start of the
  function's body; the round brackets say that we return an object. And `emoji,` is short for `emoji: emoji`.

Now the card. Create the `src/components/Card.jsx` file (the `components` folder is already there, with `Card.css` in
it):

```jsx file=src/components/Card.jsx
import './Card.css'

function Card({ card }) {
  return (
    <button type="button" className="card is-up">
      {card.emoji}
    </button>
  )
}

export default Card
```

A card is a real `<button>`: you can click it with the mouse, reach it with ++Tab++ and press it with ++Enter++, all
without extra code. For now the `is-up` class shows it face up; that changes in the next step.

Finally, `App` draws the deck. Replace the contents of `src/App.jsx` with this:

```jsx file=src/App.jsx mark=1-3,7,13-17
import { useState } from 'react'
import { createDeck } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <div className="board">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </main>
  )
}

export default App
```

- The deck goes into [[state]], because it will change during the game. `useState(() => createDeck())` is the
  [[lazy initial state]] from lesson 3: React calls the function only on the first render. `useState(createDeck())`
  would shuffle a new deck on every render and throw it away at once. You need `setCards` in step 3.
- `cards.map(…)` makes a `<Card>` from every card. `key={card.id}` tells React which item is which, and
  `card={card}` passes the whole card object as a prop.
- The `board` class in `App.css` is a four-column grid.

:::check Check
16 cards stand in a 4 × 4 grid, each with an animal, and every animal appears exactly twice. Reload the page (++F5++):
the order is different every time.
:::

:::mistake Common mistake
Only two cards, each showing all eight emoji? The three dots are missing: `[EMOJIS, EMOJIS]`. That is an array of two
items, and each item is itself an array. Without `...`, you put in the array itself, not its items.
:::

:::try Try it
Swap the animals for your favourite emoji (++Win++ + ++.++ opens the emoji picker on Windows, ++Ctrl++ + ++Cmd++ +
++Space++ on a Mac). Just make sure all eight are different.
:::

### Cards face down

Right now every card lies face up, so there is nothing to look for. Let's turn them face down and let a click turn
one over.

Which card is face up is [[state]] too, since it changes when you click. We could store an `up: true` field on every
card, but there is a simpler way: a separate array, `flipped`, that holds only the **ids** of the face-up cards. At
most two cards can be face up at a time (not counting the pairs already found), so this array is never longer than
two: it is the selected pair.

Why only the id, and not the whole card? Because this way the card data lives in one place, the `cards` array, and
`flipped` only points to it. If the same data lived in two pieces of state, sooner or later the two would disagree.
This rule is called the [[single source of truth]].

First the card gets two new props. `faceUp` says whether it lies face up, and `onFlip` is the function it calls when
it is clicked. Replace the contents of `src/components/Card.jsx`:

```jsx file=src/components/Card.jsx mark=3,5-6
import './Card.css'

function Card({ card, faceUp, onFlip }) {
  return (
    <button type="button" className={faceUp ? 'card is-up' : 'card'} onClick={onFlip}>
      {faceUp ? card.emoji : '?'}
    </button>
  )
}

export default Card
```

`faceUp ? … : …` is the [[ternary operator]]: if the card lies face up, it gets the `is-up` class and shows the emoji;
otherwise it shows a question mark. `Card.css` gives the face-down card its dark colour.

The new state and the click handling go into `App`. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=8-9,11-15,23-28
import { useState } from 'react'
import { createDeck } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())
  // The ids of the face-up cards that have no pair yet: two at most.
  const [flipped, setFlipped] = useState([])

  function flipCard(card) {
    // If two cards are showing already, or this one is face up, nothing happens.
    if (flipped.length === 2 || flipped.includes(card.id)) return
    setFlipped([...flipped, card.id])
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <div className="board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </main>
  )
}

export default App
```

- [[includes]] tells you whether a value is in an array: `flipped.includes(card.id)` is true when the card's id is
  among the face-up ones. The card gets this as its `faceUp` prop.
- `onFlip={() => flipCard(card)}` is a small arrow function: on a click it calls `flipCard` and tells it **which**
  card it is about. A plain `onFlip={flipCard}` could not say which card was clicked.
- The `return` at the start of `flipCard` is an early exit: if two cards are showing already, or the same card was
  clicked again, the function does nothing.
- `[...flipped, card.id]` is a new array: the old items, with the new id at the end. We don't change state in place
  here either.

:::check Check
Every card is dark, with a question mark. Click one: its picture appears. Click another: that one too. A third click
does nothing, and the two cards stay open. That is how it should be for now; the next two steps make it playable.
++F5++ starts a new game.
:::

:::mistake Common mistake
`flipped.push(card.id)`, then `setFlipped(flipped)`. Nothing happens on a click: `push` changes the old array in
place, and React sees that the setter got back the same array, so there is nothing to draw again. Always give the
setter a new array, the way `[...flipped, card.id]` does.
:::

### A pair or not?

Everything is decided at the second card. If its picture matches the first one, that's a pair: it has to be marked in
the `cards` array (`matched: true`), and from then on the two cards stay open. If the picture is different, the two
cards stay open for now; turning them back is the next step.

[[find]] looks up the first card: `cards.find((item) => item.id === flipped[0])` goes through the cards and returns
the first one the condition is true for, here the one whose id is the id of the first face-up card. (At the second
click `flipped` holds exactly one id, hence `flipped[0]`.)

Marking is the harder part. We can't change the card in state in place (`first.matched = true`); instead `map` makes
a new array: every card goes into it as it was, except the two, which become changed copies. This is an
[[immutable update]]: nothing is overwritten, and wherever something changes, a new copy is made. `{ ...item,
matched: true }` is spread with an object: it copies every field of the card and overwrites `matched`.

Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=12-13,15-19,21-36,48
import { useState } from 'react'
import { createDeck } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())
  // The ids of the face-up cards that have no pair yet: two at most.
  const [flipped, setFlipped] = useState([])

  function flipCard(card) {
    // If two cards are showing already, this one is face up, or its pair is already found, nothing happens.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // The first card of the two: just remember it.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // The second card: compare it with the first.
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // A pair! The copies of the two cards get matched: true, the others stay as they were.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
    } else {
      // Not a pair: both stay visible for a while.
      setFlipped([first.id, card.id])
    }
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <div className="board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </main>
  )
}

export default App
```

`flipCard` now tells three cases apart:

- If the card belongs to a pair already found (`card.matched`), clicking it doesn't count: we leave.
- If no card is face up yet, this is the first one: we just remember it.
- If one is up already, this is the second: we compare their pictures. For a pair, `setCards` gets the new array and
  `flipped` is emptied, because from now on `matched` keeps the two cards open. That is why `faceUp` needs
  `card.matched ||`: because of `||` (or), a card lies face up if it belongs to a found pair **or** it is turned over
  right now.

Found cards get the `is-matched` class, and `Card.css` paints them light green. So the class name is now put together
from pieces. Replace the contents of `src/components/Card.jsx`:

```jsx file=src/components/Card.jsx mark=4-6,9
import './Card.css'

function Card({ card, faceUp, onFlip }) {
  let className = 'card'
  if (faceUp) className += ' is-up'
  if (card.matched) className += ' is-matched'

  return (
    <button type="button" className={className} onClick={onFlip}>
      {faceUp ? card.emoji : '?'}
    </button>
  )
}

export default Card
```

`let` makes a variable you can give a new value later, and `+=` adds to the end of the text. Mind the space at the
start of `' is-up'`: this way a found card's class is `card is-up is-matched`, three separate classes.

:::check Check
Turn over two matching cards: both turn light green and stay open, and then you can turn over two more. If you turn
over two different ones, they stay open and the game is stuck: the next step fixes that, until then ++F5++ helps.
:::

:::mistake Common mistake
`return item` is missing from the `map`. At the first pair found, the page goes blank, and the console (++F12++ →
Console) says "Cannot read properties of undefined (reading 'matched')". A function that returns nothing returns
`undefined`: apart from the two marked cards, every card was replaced by `undefined`.
:::

### Turning back after a second

If the two cards are not a pair, they have to turn back after a moment, so the player can see what was on them and
then try again. Waiting is the job of [[setTimeout]]: `setTimeout(fn, 1000)` calls the function `fn` after 1000
milliseconds, that is, one second.

Where should the timer go? In lesson 3, the "Copied!" label disappeared thanks to a timer started in a [[useEffect]],
and that is the right place here too. Look at when the cards have to turn back: when two cards are face up. (At a
found pair `flipped` is emptied at once, so two face-up cards always mean a missed pair.) That is a **situation** in
the state, not a click, and an effect is made exactly for reacting to a situation: it runs after drawing, looks at
the state, and starts the timer if needed.

In the first line of `src/App.jsx`, import `useEffect` next to `useState`:
`import { useEffect, useState } from 'react'`. Then write the effect below the two `useState` lines:

```jsx file=src/App.jsx mark=6-12
function App() {
  const [cards, setCards] = useState(() => createDeck())
  // The ids of the face-up cards that have no pair yet: two at most.
  const [flipped, setFlipped] = useState([])

  // Two face-up cards can only be a missed pair: they turn back after a second.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Cleanup: if the situation changes first, the timer stops.
    return () => clearTimeout(timer)
  }, [flipped])
```

- `[flipped]` is the [[dependency array]]: the effect runs after the first render, and then every time `flipped` has
  changed.
- If fewer than two cards are showing, `return` leaves at once: there is nothing to do.
- If two are, the timer starts, and a second later `setFlipped([])` empties the selected pair: both cards turn back.
- The function it returns is the [[cleanup function]]. React calls it before running the effect again, and also when
  the component disappears. This way a timer never goes off when the situation it was started for is no longer true.

The `flipped.length === 2` condition at the start of `flipCard` now really makes sense: while the wrong pair is
showing, clicking other cards does nothing.

:::check Check
Turn over two different cards: they show for a second, then both turn back. Meanwhile a third card does not turn
over, however often you click it. Found pairs still stay open.
:::

:::mistake Common mistake
`setTimeout(setFlipped([]), 1000)`, without the arrow function. This calls `setFlipped([])` at once and hands its
result to the timer, so the second card can't even turn over: it turns back in the same moment. `setTimeout` wants a
function that it calls later: `() => setFlipped([])`.
:::

:::try Try it
Change 1000 to 400, then to 2500. Which one makes the game harder? Which one is more annoying? Then set it back.
:::

### You won!

The game is over when every card's pair has been found. That needs no new state: it can be worked out from the
`cards` array at any time. [[every]] returns `true` if the condition is true for **every** item of the array, so
`cards.every((card) => card.matched)` is true exactly when there is nothing left to find. A value worked out from the
state like this is a [[derived value]] (lesson 3's strength meter was one too).

The win message is [[conditional rendering]]: `{won && (…)}` draws the banner only if `won` is true. The "New game"
button shuffles a new deck and empties the selected pair. Here is the whole `src/App.jsx` as it looks at the end of
the beginner level:

```jsx file=src/App.jsx mark=11-12,50-53,59-69
import { useEffect, useState } from 'react'
import { createDeck } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())
  // The ids of the face-up cards that have no pair yet: two at most.
  const [flipped, setFlipped] = useState([])

  // A derived value: worked out from the cards, it needs no state of its own.
  const won = cards.every((card) => card.matched)

  // Two face-up cards can only be a missed pair: they turn back after a second.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Cleanup: if the situation changes first, the timer stops.
    return () => clearTimeout(timer)
  }, [flipped])

  function flipCard(card) {
    // If two cards are showing already, this one is face up, or its pair is already found, nothing happens.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // The first card of the two: just remember it.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // The second card: compare it with the first.
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // A pair! The copies of the two cards get matched: true, the others stay as they were.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
    } else {
      // Not a pair: both stay visible for a while.
      setFlipped([first.id, card.id])
    }
  }

  function playAgain() {
    setCards(createDeck())
    setFlipped([])
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      {won && (
        <section className="win" role="status">
          <div>
            <h2>You won! 🎉</h2>
            <p>You found every pair.</p>
          </div>
          <button type="button" className="button--primary" onClick={playAgain}>
            New game
          </button>
        </section>
      )}

      <div className="board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </main>
  )
}

export default App
```

- `won` stands below the `useState` lines, and it has no `setWon`: it is worked out again on every render, so it can
  never say anything different from what the cards show.
- The banner goes **above** the cards, so it is visible at once on a phone too, without scrolling down. Because of
  `role="status"`, screen readers read it out when it appears.
- `playAgain` resets two pieces of state: a new, shuffled deck and an empty selected pair.

:::check Check
Find all eight pairs: a dark banner appears above the cards, "You won! 🎉 You found every pair." The "New game" button
brings a fresh, shuffled, face-down deck, and the banner disappears. The beginner level is done: commit it!
:::

:::mistake Common mistake
The win in a separate piece of state: `const [won, setWon] = useState(false)`, set to `true` by `flipCard` at the last
pair. It works, but it is easy to forget to reset it: if `setWon(false)` is missing from `playAgain`, "You won!" stays
on screen during the new game. A derived value can't be forgotten in a reset, because there is nothing to reset.
:::

:::try Try it
So you don't have to find eight pairs for every test, take six emoji out of the `EMOJIS` array for a while: with two
pairs you can try winning in half a minute. Then put them back.
:::

## Intermediate level {level=2}

### The move counter

A good memory player finds the pairs in few moves. A move is two face-up cards, that is, turning over the second card.
This is new state (`moves`), because only `flipCard` knows when a move happened: it could not be worked out from the
cards afterwards.

The number of pairs found, on the other hand, is a derived value again. [[filter]] keeps the items the condition is
true for, in a new array, so `cards.filter((card) => card.matched).length` is the number of found cards, and the
number of pairs is half of that. The total number of pairs is the size of the deck divided by two in the same way:
`cards.length / 2`.

The numbers go into a [[description list]]. A `<dl>` holds name–value pairs: `<dt>` is the name, `<dd>` the value.
A `<div>` holds each name–value pair together (that is allowed inside a `<dl>`). Screen readers read them out in
pairs ("Moves: 5"), and the `stats` class in `App.css` draws a small box from every `<div>`.
Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=10,12,14,34-35,56,63-74,80
import { useEffect, useState } from 'react'
import { createDeck } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())
  // The ids of the face-up cards that have no pair yet: two at most.
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)

  // Derived values: worked out from the state on every render.
  const won = cards.every((card) => card.matched)
  const found = cards.filter((card) => card.matched).length / 2

  // Two face-up cards can only be a missed pair: they turn back after a second.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Cleanup: if the situation changes first, the timer stops.
    return () => clearTimeout(timer)
  }, [flipped])

  function flipCard(card) {
    // If two cards are showing already, this one is face up, or its pair is already found, nothing happens.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // The first card of the two: just remember it.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // The second card: this is a move. Compare it with the first.
    setMoves(moves + 1)
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // A pair! The copies of the two cards get matched: true, the others stay as they were.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
    } else {
      // Not a pair: both stay visible for a while.
      setFlipped([first.id, card.id])
    }
  }

  function playAgain() {
    setCards(createDeck())
    setFlipped([])
    setMoves(0)
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <dl className="stats">
        <div>
          <dt>Moves</dt>
          <dd>{moves}</dd>
        </div>
        <div>
          <dt>Pairs</dt>
          <dd>
            {found} / {cards.length / 2}
          </dd>
        </div>
      </dl>

      {won && (
        <section className="win" role="status">
          <div>
            <h2>You won! 🎉</h2>
            <p>All pairs found: {moves} moves.</p>
          </div>
          <button type="button" className="button--primary" onClick={playAgain}>
            New game
          </button>
        </section>
      )}

      <div className="board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </main>
  )
}

export default App
```

:::check Check
Two boxes stand above the cards: "Moves 0" and "Pairs 0 / 8" (the `stats` class in `App.css` writes the names in
capitals). The moves go up by one at every second card turned over, the pairs at every pair found. The win banner also
says how many moves it took, and "New game" sets the moves back to zero.
:::

:::mistake Common mistake
`setMoves(moves + 1)` goes at the start of `flipCard`, before the first card is handled. Then every click counts as a
move, and a game of 8 pairs takes at least 16 moves. Only the second card counts: `setMoves` comes after the "first
card" branch.
:::

:::try Task
Add a third box called "Misses": how many moves didn't find a pair. Do you need new state for it? (No: it can be
worked out from the moves and the pairs found, `moves - found`.)
:::

### The clock

The clock starts with the first click and stops at the win. A new piece of state, `seconds`, holds the seconds that
have passed, and a [[setInterval]] adds one to it every second. In lesson 12 the image gallery turned its pages on its
own the same way: `setInterval(fn, 1000)` calls `fn` again and again, every second, until `clearInterval` stops it.

When does the clock run? This can be worked out too:
`const running = (moves > 0 || flipped.length > 0) && !won`. In words: if there has been a move, or at least one card
is face up (so the game has started), and you haven't won yet. The effect watches `running`: when it becomes `true`,
it starts the timer; when it becomes `false`, the cleanup function stops it.

We show the time as minutes:seconds. Write this function at the end of `src/game.js`:

```js file=src/game.js
// Seconds as minutes:seconds, for example 75 becomes "1:15".
export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
```

`%` is the remainder of a division (you met it in lesson 3 as [[modulo]]): `75 % 60` is 15. `String(…)` turns the
number into text, and [[padStart]] puts zeros in front until it is two characters long: `'5'` becomes `'05'`, so the
clock says 1:05 and not 1:5. The text between backticks is the [[template literal]] from lesson 1: each `${…}` is
replaced by the value in its curly braces.

Now replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=2,11,16-17,27-34,69,81-84,97-99
import { useEffect, useState } from 'react'
import { createDeck, formatTime } from './game.js'
import Card from './components/Card.jsx'
import './App.css'

function App() {
  const [cards, setCards] = useState(() => createDeck())
  // The ids of the face-up cards that have no pair yet: two at most.
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)

  // Derived values: worked out from the state on every render.
  const won = cards.every((card) => card.matched)
  const found = cards.filter((card) => card.matched).length / 2
  // The clock runs from the first click until the win.
  const running = (moves > 0 || flipped.length > 0) && !won

  // Two face-up cards can only be a missed pair: they turn back after a second.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Cleanup: if the situation changes first, the timer stops.
    return () => clearTimeout(timer)
  }, [flipped])

  // While the clock runs, the time grows by one every second.
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setSeconds((current) => current + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  function flipCard(card) {
    // If two cards are showing already, this one is face up, or its pair is already found, nothing happens.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // The first card of the two: just remember it.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // The second card: this is a move. Compare it with the first.
    setMoves(moves + 1)
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // A pair! The copies of the two cards get matched: true, the others stay as they were.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
    } else {
      // Not a pair: both stay visible for a while.
      setFlipped([first.id, card.id])
    }
  }

  function playAgain() {
    setCards(createDeck())
    setFlipped([])
    setMoves(0)
    setSeconds(0)
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <dl className="stats">
        <div>
          <dt>Moves</dt>
          <dd>{moves}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{formatTime(seconds)}</dd>
        </div>
        <div>
          <dt>Pairs</dt>
          <dd>
            {found} / {cards.length / 2}
          </dd>
        </div>
      </dl>

      {won && (
        <section className="win" role="status">
          <div>
            <h2>You won! 🎉</h2>
            <p>
              All pairs found: {moves} moves, {formatTime(seconds)}.
            </p>
          </div>
          <button type="button" className="button--primary" onClick={playAgain}>
            New game
          </button>
        </section>
      )}

      <div className="board">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </main>
  )
}

export default App
```

In the new effect, `setSeconds` gets a function instead of a number: `(current) => current + 1`. This is the
[[updater function]] you used in lesson 12 to move the self-playing gallery along. React calls it with the latest
state, and whatever it returns becomes the new value.

Why is it needed here too? The timer's function is created once, when the effect runs, and from then on the same
function runs every second. A function knows the variables that existed in the render it was created in: this is the
[[closure]] you met in lesson 7. If the function said `setSeconds(seconds + 1)`, `seconds` would stay 0 for it
forever, since the effect doesn't run again (its dependency, `running`, doesn't change), and the clock would set
0 + 1 = 1 every second. The updater function doesn't read the old variable: React hands it the current value.

:::check Check
"Time 0:00" appears between the two boxes, and it stands still until you click. It starts with the first card, ticks
every second, and stops at the win; the banner says, for example, "All pairs found: 12 moves, 0:47." "New game" sets it
back to 0:00.
:::

:::mistake Common mistake
`setSeconds(seconds + 1)` in the timer. The clock jumps to 0:01 and gets stuck there: the timer's function is left
over from the render in which `seconds` was still 0, and it sees that value forever. The updater function always gets
the latest value.
:::

:::concept How exact is setInterval?
The browser doesn't promise to call exactly every 1000 milliseconds: if it is busy, it is a little late, and in a
background tab it runs timers less often on purpose, to spare the computer. For a game this is plenty. If you need an
exact time, store the moment it started (`Date.now()`) and always work out how much time has passed since. The
finished app (Solution tab) does it that way.
:::

### A real flip

Right now a card simply changes colour. A real card turns over, though: it rotates around its axis, and its front
comes into view instead of its back. In lesson 6 you already turned a card over with CSS; now we go over it again step
by step, and add an animation of our own for the found pairs.

The trick: a card has two sides, and **both** are always on the page, lying on top of each other. An inner box holds
them, and that box is what we rotate by 180 degrees. So the JSX has to change too: until now the card showed either
the question mark or the emoji, from now on it holds both. Replace the contents of `src/components/Card.jsx`:

```jsx file=src/components/Card.jsx mark=9-19
import './Card.css'

function Card({ card, faceUp, onFlip }) {
  let className = 'card'
  if (faceUp) className += ' is-up'
  if (card.matched) className += ' is-matched'

  return (
    <button
      type="button"
      className={className}
      onClick={onFlip}
      aria-label={faceUp ? card.emoji : 'Face-down card'}
    >
      {/* Both sides are always there; the CSS turns the inner box over. */}
      <span className="card__inner" aria-hidden="true">
        <span className="card__face card__back">?</span>
        <span className="card__face card__front">{card.emoji}</span>
      </span>
    </button>
  )
}

export default Card
```

- `card__inner` is the box that turns, with the back (`card__back`, the question mark) and the front (`card__front`,
  the emoji) in it.
- Since the emoji is now always in the button (it just doesn't always show), a screen reader would read out the
  pictures of the face-down cards too, which would be cheating. So the inner box gets the [[aria-hidden]] attribute
  (`aria-hidden="true"`): a screen reader doesn't look at what is inside. Instead, the button gets an [[aria-label]],
  which becomes the name it reads out: the emoji when face up, "Face-down card" when face down.

Now the CSS. Replace the whole contents of `src/components/Card.css` with this:

```css file=src/components/Card.css
/* The button is only a frame: it gives the size and the 3D effect, the two sides carry the colours. */
.card {
  width: 100%;
  aspect-ratio: 4 / 5;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: none;
  /* The emoji grows with the board: half the width of one column. */
  font-size: calc(50cqi / var(--columns, 4));
  font-weight: 700;
  line-height: 1;
  /* How far away we look at the card from: this makes the turn three-dimensional. */
  perspective: 800px;
}

/* The inner box is what turns over, with the two sides in it. */
.card__inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
}

.card.is-up .card__inner {
  transform: rotateY(180deg);
}

/* The two sides lie exactly on top of each other, and their back is invisible. */
.card__face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  backface-visibility: hidden;
}

.card__back {
  background: var(--card-color, #083f58);
  color: rgb(255 255 255 / 0.6);
}

.card:hover .card__back {
  filter: brightness(1.2);
}

/* The front starts turned around: it faces us when the inner box turns over too. */
.card__front {
  background: #fff;
  box-shadow: inset 0 0 0 2px var(--card-color, #083f58);
  transform: rotateY(180deg);
}

.card.is-matched {
  cursor: default;
}

/* A found pair: it turns light green and grows for a moment. */
.card.is-matched .card__front {
  background: #e3f8f3;
  box-shadow: inset 0 0 0 2px #01c5ac;
  animation: pop 0.4s ease 0.35s;
}

@keyframes pop {
  50% {
    transform: rotateY(180deg) scale(1.12);
  }
}

.card:focus-visible {
  outline: 3px solid #feb800;
  outline-offset: 2px;
}

/* No turning and no popping for people who switched motion off in their system. */
@media (prefers-reduced-motion: reduce) {
  .card__inner {
    transition: none;
  }

  .card.is-matched .card__front {
    animation: none;
  }
}
```

The size, the rounded corners and the font size are the same as before; what is new:

- [[perspective]] on the button (`perspective: 800px`) sets how far away we look at the card from. Without it the turn
  looks flat (the card just gets narrower, then wider again); with it, the edge closer to us looks bigger than the
  far one, as in real life.
- [[transform]] changes how an element looks: `rotateY(180deg)` rotates it by 180 degrees around its vertical (Y)
  axis. The `.card.is-up .card__inner` rule rotates only the inner box of face-up cards.
- [[transition]] says that when `transform` changes, it should not jump to the new value in an instant but move there
  in 0.4 seconds, speeding up and slowing down gently (`ease`). This is the animation itself: React only adds or
  removes the `is-up` class, and the browser works out the movement.
- Because of the `preserve-3d` value of [[transform-style]], the box's children stay in 3D space when the box turns.
  Without it, the two sides would melt into one flat picture.
- `position: absolute` and `inset: 0`: both sides fill the whole inner box, exactly on top of each other.
- The `hidden` value of [[backface-visibility]] means that a side turned away from us is invisible. The front starts
  turned away (`transform: rotateY(180deg)`), so on a face-down card only the back shows. When the inner box turns
  over, the back turns away and the front faces us.

The found pairs get an animation of their own. [[@keyframes]] describes the steps of an animation: halfway (`50%`)
`pop` makes the front 12 percent bigger, and at the start and the end the front gets back its own, usual `transform`.
`animation: pop 0.4s ease 0.35s` plays it in 0.4 seconds, after a 0.35-second wait, when the second card has finished
turning. Notice that `rotateY(180deg)` has to be there next to `scale(1.12)`: the animation replaces the whole
`transform`, and without it the front would turn away for the length of the animation.

Finally, [[prefers-reduced-motion]]: this media query applies when the user has asked for less motion in the settings
of their computer (some people get dizzy from a lot of animation). For them the card turns over in an instant,
without rotating.

:::check Check
Click a card: it turns over in 3D and its picture appears. A wrong pair turns back after a second, rotating the same
way. At a found pair, the second card turns over, then both turn light green and grow for a moment.
:::

:::mistake Common mistake
`backface-visibility: hidden` is missing. Then the side turned away shows too: the face-down cards show the mirror
image of the emoji instead of the question mark, so everyone sees what is where. If your cards are "see-through", look
for this line first.
:::

:::try Try it
Change `0.4s` in the `transition` to `1.5s`, and you see the turn in slow motion. Then change `rotateY` to `rotateX` in
all three places (the face-up inner box, the front and the `pop` animation): now the card does a somersault.
:::

### Difficulty levels

There will be three difficulty levels: easy (6 pairs in 4 columns), medium (8 pairs in 4 columns) and hard (12 pairs in 6
columns). For that, the size of the deck has to become a parameter first. Replace the contents of `src/game.js`
(`formatTime` stays at the end):

```js file=src/game.js mark=1-2,16-19
// The pictures on the cards. The hardest level needs 12 pairs.
const EMOJIS = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐵', '🐰', '🐨', '🐯', '🐷', '🐙']

// Fisher–Yates shuffle: returns a new, shuffled array and leaves the original alone.
export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

// A new deck: a number (pairs) of randomly chosen emoji, each one twice, shuffled.
export function createDeck(pairs) {
  const chosen = shuffle(EMOJIS).slice(0, pairs)
  const doubled = [...chosen, ...chosen]
  return shuffle(doubled).map((emoji, index) => ({ id: index, emoji, matched: false }))
}

// Seconds as minutes:seconds, for example 75 becomes "1:15".
export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
```

`shuffle(EMOJIS)` shuffles all 12 animals, and [[slice]] cuts a piece out of the result: `slice(0, pairs)` takes the
first `pairs` of them (`slice` doesn't change the original array either; it returns a new one). This way even the
easy level brings out a different six animals in every game.

`App` still calls `createDeck` without an argument for now, and `slice(0, undefined)` then gives the whole array: if
you reload the page or start a new game now, you see 24 cards. That's fine; it comes right by the end of the step,
when you replace `App` too.

Now for the bigger question. When the level changes, every piece of state has to be reset: a new deck, an empty
selected pair, 0 moves, 0:00. `playAgain` already calls four setters, and every new piece of state would need one
more; one forgotten line, and you get a strange bug. There is a more elegant React way, which you already tried with
the copy button in lesson 3: the [[key]]. When a component's `key` changes, React doesn't update it: it throws the old
one away with all its state and effects (the cleanup functions run too), and draws a brand-new one in its place, with
fresh initial values.

For that, the game needs a component of its own, `Game`, which `App` draws with a `key`. Create the
`src/components/Game.jsx` file. Its contents are almost word for word the `App` you have now; the highlighted lines
have changed:

```jsx file=src/components/Game.jsx mark=2-3,5-6,65,91,97,107,111
import { useEffect, useState } from 'react'
import { createDeck, formatTime } from '../game.js'
import Card from './Card.jsx'

function Game({ level, onRestart }) {
  const [cards, setCards] = useState(() => createDeck(level.pairs))
  // The ids of the face-up cards that have no pair yet: two at most.
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)

  // Derived values: worked out from the state on every render.
  const won = cards.every((card) => card.matched)
  const found = cards.filter((card) => card.matched).length / 2
  // The clock runs from the first click until the win.
  const running = (moves > 0 || flipped.length > 0) && !won

  // Two face-up cards can only be a missed pair: they turn back after a second.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Cleanup: if the situation changes first, the timer stops.
    return () => clearTimeout(timer)
  }, [flipped])

  // While the clock runs, the time grows by one every second.
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setSeconds((current) => current + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  function flipCard(card) {
    // If two cards are showing already, this one is face up, or its pair is already found, nothing happens.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // The first card of the two: just remember it.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // The second card: this is a move. Compare it with the first.
    setMoves(moves + 1)
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // A pair! The copies of the two cards get matched: true, the others stay as they were.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
    } else {
      // Not a pair: both stay visible for a while.
      setFlipped([first.id, card.id])
    }
  }

  return (
    <>
      <dl className="stats">
        <div>
          <dt>Moves</dt>
          <dd>{moves}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{formatTime(seconds)}</dd>
        </div>
        <div>
          <dt>Pairs</dt>
          <dd>
            {found} / {cards.length / 2}
          </dd>
        </div>
      </dl>

      {won && (
        <section className="win" role="status">
          <div>
            <h2>You won! 🎉</h2>
            <p>
              All pairs found: {moves} moves, {formatTime(seconds)}.
            </p>
          </div>
          <button type="button" className="button--primary" onClick={onRestart}>
            New game
          </button>
        </section>
      )}

      <div className="board" style={{ '--columns': level.columns }}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </>
  )
}

export default Game
```

- The file is in the `components` folder, so `'../game.js'` first goes up one folder, while `Card` is in this same
  folder: `'./Card.jsx'`. `App` loads the CSS; it isn't needed here.
- `Game` gets two props: the data of the level (`level`) and the `onRestart` function, which the win banner's button
  calls. `playAgain` is gone: from now on `App` takes care of new games.
- `<>…</>` is a [[Fragment]]: it returns several elements in one package, without putting a needless `<div>` around
  them on the page. The `<main>` and the title stay in `App`.
- `style={{ '--columns': level.columns }}`: in lesson 2 you set [[CSS variables|CSS variable]] mostly in the CSS, but
  in React you can also give them in the `style` prop. In a `style` object, a name starting with `--` sets a CSS
  variable on that element. The grid draws `repeat(var(--columns, 4), …)` columns, and the card works out from it how
  big the emoji should be.

`App` now only keeps track of the level and the number of games. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx
import { useState } from 'react'
import Game from './components/Game.jsx'
import './App.css'

// The difficulty levels: how many pairs are in the deck, and in how many columns the cards stand.
const LEVELS = [
  { id: 'easy', name: 'Easy', pairs: 6, columns: 4 },
  { id: 'medium', name: 'Medium', pairs: 8, columns: 4 },
  { id: 'hard', name: 'Hard', pairs: 12, columns: 6 },
]

function App() {
  const [levelId, setLevelId] = useState('medium')
  // The number of the game: every new game gets a number one higher.
  const [round, setRound] = useState(1)

  const level = LEVELS.find((item) => item.id === levelId)

  function newGame() {
    setRound(round + 1)
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Difficulty">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={item.id === levelId}
              onClick={() => setLevelId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <button type="button" className="button" onClick={newGame}>
          New game
        </button>
      </div>

      {/* When the key changes, React throws the old Game away and draws a brand-new one in its place. */}
      <Game key={`${levelId}-${round}`} level={level} onRestart={newGame} />
    </main>
  )
}

export default App
```

- `LEVELS` is outside the component, because it never changes: there is no point in making it again on every render.
- The `levelId` state only holds the id of the level (`'medium'`); `find` looks up the level's data. It is the same
  single source of truth as with the cards: the data lives in `LEVELS`, and the state only points to it.
- The difficulty buttons are switches. [[aria-pressed]] tells a screen reader which one is pressed, and `App.css`
  also uses it to know which one to colour (`.chip[aria-pressed='true']`).
- The key of `Game` is a template literal, for example `medium-3`. It changes when you switch levels and when you
  click "New game", and React draws a new `Game`: a new deck, 0 moves, 0:00. If you start a new game before a wrong
  pair turns back, the old `Game`'s cleanup functions stop its timers, so they can't touch the new game.

:::check Check
Below the title there are three buttons: "Easy", "Medium" (this one is pressed) and "Hard", with "New game" next to
them.
The easy level is 12 cards in 4 columns, the hard one 24 cards in 6 columns, with all 12 animals. If you switch levels
during a game or click "New game", everything starts over: a new deck, 0 moves, 0:00. The intermediate level is done:
commit it!
:::

:::mistake Common mistake
The `key` is missing from `<Game>`. The level buttons change colour, but the deck stays the same (at most it is laid
out in a different number of columns), and "New game" does nothing either. React uses the initial value of
`useState(() => createDeck(level.pairs))` only on the very first render; after that it doesn't matter that `Game`
gets a new `level`: without a `key`, React updates the same component, with its old state.
:::

## Advanced level {level=3}

### Best results

How good is your best game? Let's save the best result for each level and show it in a fourth box. For that, the result
has to survive a reload of the page: it goes into the browser's [[localStorage]].

In lessons 6 and 9 you wrote a `useLocalStorage` hook that works like `useState` but also saves the value. If you have
your own version at hand, and it returns a `[value, setter]` pair in the same way, you can use it. If not, create the
`src/useLocalStorage.js` file:

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

localStorage can only store text. [[JSON]] is a text format for objects and arrays: `JSON.stringify` turns them into
text, `JSON.parse` turns them back. This way a whole object can be saved. The `try`/`catch` is there for the same
reason as in lesson 2: storage can be blocked, and `JSON.parse` throws an error too if something unreadable is saved.

Which result is better? Write this at the end of `src/game.js`:

```js file=src/game.js
// Is the result better than the best so far? Fewer moves win; with equal moves, the faster one.
export function isBetter(result, best) {
  if (!best) return true
  if (result.moves !== best.moves) return result.moves < best.moves
  return result.seconds < best.seconds
}
```

If there is no best result yet, `best` is `undefined` and `!best` is true: then anything is a record.

The best results live in `App`, in one object, per level: `{ easy: { moves: 9, seconds: 31 } }`. `App` hands `Game`
the record of the current level (`best`) and a function (`onWin`) that `Game` calls with the result when the game is
won. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=3-4,18-19,27-32,58-64
import { useState } from 'react'
import Game from './components/Game.jsx'
import { isBetter } from './game.js'
import useLocalStorage from './useLocalStorage.js'
import './App.css'

// The difficulty levels: how many pairs are in the deck, and in how many columns the cards stand.
const LEVELS = [
  { id: 'easy', name: 'Easy', pairs: 6, columns: 4 },
  { id: 'medium', name: 'Medium', pairs: 8, columns: 4 },
  { id: 'hard', name: 'Hard', pairs: 12, columns: 6 },
]

function App() {
  const [levelId, setLevelId] = useState('medium')
  // The number of the game: every new game gets a number one higher.
  const [round, setRound] = useState(1)
  // The best result per level, for example { easy: { moves: 9, seconds: 31 } }.
  const [bests, setBests] = useLocalStorage('memory-game-bests', {})

  const level = LEVELS.find((item) => item.id === levelId)

  function newGame() {
    setRound(round + 1)
  }

  // Game calls this when a player has found the last pair.
  function saveResult(result) {
    if (isBetter(result, bests[levelId])) {
      setBests({ ...bests, [levelId]: result })
    }
  }

  return (
    <main className="game">
      <h1>Memory Game</h1>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Difficulty">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={item.id === levelId}
              onClick={() => setLevelId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <button type="button" className="button" onClick={newGame}>
          New game
        </button>
      </div>

      {/* When the key changes, React throws the old Game away and draws a brand-new one in its place. */}
      <Game
        key={`${levelId}-${round}`}
        level={level}
        best={bests[levelId]}
        onWin={saveResult}
        onRestart={newGame}
      />
    </main>
  )
}

export default App
```

With square brackets, `bests[levelId]` reads the field whose name is in `levelId` (for `'easy'` it is the same as
`bests.easy`). And `{ ...bests, [levelId]: result }` is the pattern from lesson 3: it copies the object and overwrites
one field in it, so the records of the other levels stay.

`Game` changes in three places. At the top: the `isBetter` import, the two new props and a new piece of state:

```jsx file=src/components/Game.jsx mark=2,5,11-12
import { useEffect, useState } from 'react'
import { createDeck, formatTime, isBetter } from '../game.js'
import Card from './Card.jsx'

function Game({ level, best, onWin, onRestart }) {
  const [cards, setCards] = useState(() => createDeck(level.pairs))
  // The ids of the face-up cards that have no pair yet: two at most.
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  // Did this game beat the best so far? We decide at the moment of the win.
  const [newRecord, setNewRecord] = useState(false)
```

In `flipCard`, the win is handled at the end of the "A pair!" branch, after `setFlipped([])`:

```jsx file=src/components/Game.jsx mark=4-9
      setCards(newCards)
      setFlipped([])

      // Was this the last pair? Then tell App now, so it can save the result.
      if (newCards.every((item) => item.matched)) {
        const result = { moves: moves + 1, seconds }
        setNewRecord(isBetter(result, best))
        onWin(result)
      }
```

Finally, in the JSX that `Game` returns, a fourth box goes at the end of the `<dl>`, after the "Pairs" box, and the
news of a record goes into the win banner:

```jsx file=src/components/Game.jsx mark=7-10,20
        <div>
          <dt>Pairs</dt>
          <dd>
            {found} / {cards.length / 2}
          </dd>
        </div>
        <div>
          <dt>Best</dt>
          <dd>{best ? `${best.moves} moves · ${formatTime(best.seconds)}` : '–'}</dd>
        </div>
      </dl>

      {won && (
        <section className="win" role="status">
          <div>
            <h2>You won! 🎉</h2>
            <p>
              All pairs found: {moves} moves, {formatTime(seconds)}.
            </p>
            {newRecord && <p className="win__record">New record on this level!</p>}
          </div>
```

Three things to notice about handling the win:

- Why `newCards.every(…)` and not `won`? `won` was worked out in this render, when the last pair wasn't found yet, so
  it is `false`. The new cards exist only in `newCards`.
- Why `moves + 1`? `setMoves(moves + 1)` doesn't change `moves` at once: the new value only arrives with the next
  render. In this function, `moves` is still the old number.
- Why the `newRecord` state? At the moment of the win, `best` still holds the old record, so this is when to compare.
  After `onWin`, `App` saves the new result, React draws `Game` again, and `best` is now the same as the result: by then we
  could no longer tell whether it was a record.

The saving happens in an event handler, not in an effect, because it belongs to an event: finding the last pair.
Whatever follows from a click belongs in the click's handler.

:::check Check
The fourth box says "Best –". Win an easy game: the banner says "New record on this level!" in gold letters, and the
box shows, for example, "9 moves · 0:31". Play another one worse: no record message, and the box stays the same.
Reload the page and choose the easy level: the record is still there. In the developer tools (++F12++ → Application →
Local storage) you find the `memory-game-bests` key.
:::

:::mistake Common mistake
`onWin({ moves, seconds })`, without the `+ 1`. The win banner shows the right number of moves, but one fewer goes into
the "Best" box: in this function `moves` is still the old value.
:::

:::try Task
Put a "Clear records" button in the toolbar of `App`, next to "New game". Its click handler is a single call:
`setBests({})`. Why don't you have to remove anything from localStorage as well? (Because the effect of `useLocalStorage`
saves every change, the empty object too.)
:::

### Themes

Animals are only the start: other pictures can go on the cards too. A theme is a set of emoji and a colour of its own
for the backs of the cards. Replace the contents of `src/game.js`: `THEMES` takes the place of `EMOJIS`, and
`createDeck` gets the emoji to choose from as a parameter.

```js file=src/game.js mark=1-21,36-37
// The themes: each has 12 emoji and its own colour for the backs of the cards.
export const THEMES = [
  {
    id: 'animals',
    name: 'Animals',
    color: '#017b6b',
    emojis: ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐵', '🐰', '🐨', '🐯', '🐷', '🐙'],
  },
  {
    id: 'treats',
    name: 'Treats',
    color: '#9a03b7',
    emojis: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🥝', '🍍', '🥕', '🌽', '🍩', '🍪'],
  },
  {
    id: 'space',
    name: 'Space',
    color: '#013e8e',
    emojis: ['🚀', '🌙', '⭐', '🪐', '🌍', '👽', '🛸', '🌞', '🔭', '🌠', '🌌', '☄️'],
  },
]

// Fisher–Yates shuffle: returns a new, shuffled array and leaves the original alone.
export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

// A new deck: a number (pairs) of randomly chosen emoji, each one twice, shuffled.
export function createDeck(pairs, emojis) {
  const chosen = shuffle(emojis).slice(0, pairs)
  const doubled = [...chosen, ...chosen]
  return shuffle(doubled).map((emoji, index) => ({ id: index, emoji, matched: false }))
}

// Seconds as minutes:seconds, for example 75 becomes "1:15".
export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

// Is the result better than the best so far? Fewer moves win; with equal moves, the faster one.
export function isBetter(result, best) {
  if (!best) return true
  if (result.moves !== best.moves) return result.moves < best.moves
  return result.seconds < best.seconds
}
```

`Game` gets the emoji as a prop and passes them on to `createDeck`. Change two lines of `Game.jsx`:

```jsx file=src/components/Game.jsx mark=1-2
function Game({ level, emojis, best, onWin, onRestart }) {
  const [cards, setCards] = useState(() => createDeck(level.pairs, emojis))
```

Until you change `App` too, `Game` gets no emoji, and `createDeck` throws an error: if you reload the page or start a
new game in between, the page goes blank, and the console shows an error message. It comes right by the end of the
step.

The chosen theme goes into `App`, and `useLocalStorage` keeps it too, so the game remembers it. The picker is a
[[drop-down list]] (`<select>`), like the category picker in lesson 10: a [[controlled input]] just like lesson 3's
slider, it gets its value from the state
and reports every change through `onChange`. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=3,18,23-24,38,55-64,72,74
import { useState } from 'react'
import Game from './components/Game.jsx'
import { THEMES, isBetter } from './game.js'
import useLocalStorage from './useLocalStorage.js'
import './App.css'

// The difficulty levels: how many pairs are in the deck, and in how many columns the cards stand.
const LEVELS = [
  { id: 'easy', name: 'Easy', pairs: 6, columns: 4 },
  { id: 'medium', name: 'Medium', pairs: 8, columns: 4 },
  { id: 'hard', name: 'Hard', pairs: 12, columns: 6 },
]

function App() {
  const [levelId, setLevelId] = useState('medium')
  // The number of the game: every new game gets a number one higher.
  const [round, setRound] = useState(1)
  const [themeId, setThemeId] = useLocalStorage('memory-game-theme', 'animals')
  // The best result per level, for example { easy: { moves: 9, seconds: 31 } }.
  const [bests, setBests] = useLocalStorage('memory-game-bests', {})

  const level = LEVELS.find((item) => item.id === levelId)
  // If the saved theme no longer exists, carry on with the first one.
  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0]

  function newGame() {
    setRound(round + 1)
  }

  // Game calls this when a player has found the last pair.
  function saveResult(result) {
    if (isBetter(result, bests[levelId])) {
      setBests({ ...bests, [levelId]: result })
    }
  }

  return (
    <main className="game" style={{ '--card-color': theme.color }}>
      <h1>Memory Game</h1>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Difficulty">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={item.id === levelId}
              onClick={() => setLevelId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <label className="select">
          Theme
          <select value={theme.id} onChange={(event) => setThemeId(event.target.value)}>
            {THEMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button" onClick={newGame}>
          New game
        </button>
      </div>

      {/* When the key changes, React throws the old Game away and draws a brand-new one in its place. */}
      <Game
        key={`${levelId}-${theme.id}-${round}`}
        level={level}
        emojis={theme.emojis}
        best={bests[levelId]}
        onWin={saveResult}
        onRestart={newGame}
      />
    </main>
  )
}

export default App
```

- The `??` operator ([[nullish coalescing]]) gives the value on its left, unless that is `null` or `undefined`: then
  it gives the one on its right. If `find` finds nothing (say, an older save holds a theme you have renamed since), it
  returns `undefined`, and then the theme is `THEMES[0]`. That is why we use `theme.id` instead of `themeId`: it is
  always a theme that exists.
- `style={{ '--card-color': theme.color }}` sets the colour on `<main>`. Every element inside inherits CSS variables,
  so every card gets it: `Card.css` uses `var(--card-color, …)` for the back and for the border of the front.
- The theme's id went into the `key` too: a new theme needs a new deck, with the new pictures.
- The `<option>`s of the `<select>` are made from `THEMES`; `value` says which one is selected, and
  `event.target.value` is the `value` of the `<option>` just chosen.

:::check Check
A "Theme" picker appears next to the difficulty buttons. The "Animals" cards now have teal backs. The "Space" theme
brings rockets and planets with blue card backs;
"Treats" has fruit, vegetables and sweets on purple backs. Reload the page: the theme you chose is still there.
:::

:::mistake Common mistake
You give the `<select>` a `value` but no `onChange`. The picker is frozen, and the console warns that the field is
read-only. As with every controlled input, you need both.
:::

:::concept Pictures from an API
A real memory game could show photos too: dogs, paintings, anything. Then we would ask an [[API]] for the addresses of
the theme's pictures, and the front of the card would hold `<img src={card.image} alt="">` instead of the emoji. You
learn to fetch data (`fetch`) in lesson 14. In this course we don't call outside services, and emoji work without the
internet and are there on every computer.
:::

:::try Task
Make a fourth theme from your own favourite emoji. You only need to touch the `THEMES` array; make sure it has 12
different emoji, or there won't be a picture for every pair on the hard level.
:::

### Two-player mode

Two people play, taking turns. Whoever finds a pair gets a point and goes again; whoever misses passes the turn to the
other. At the end, the one with more pairs wins.

`Game` gets two new pieces of state: `turn` says whose turn it is (0 for the first player, 1 for the second), and
`scores` is an array of two items with the two players' points. At a wrong pair, passing the turn is a single line:
`setTurn(1 - turn)`. If `turn` is 0, the new value is 1; if it is 1, it is 0. At a found pair, the current player's
score goes up by one; this is the same immutable update as with the cards, only on an array of numbers:
`scores.map((score, index) => (index === turn ? score + 1 : score))`.

We save the best result only in solo mode: with two players the moves are shared, so the record would not be
comparable. That is why `players === 1 &&` comes before the win handling, and in two-player mode the two players'
scores stand where the "Best" box was. Here is the whole `src/components/Game.jsx`:

```jsx file=src/components/Game.jsx mark=5,7,15-17,65-66,68-69,75,77,81-87,106-118,121-125,130
import { useEffect, useState } from 'react'
import { createDeck, formatTime, isBetter } from '../game.js'
import Card from './Card.jsx'

const PLAYER_NAMES = ['Player 1', 'Player 2']

function Game({ level, emojis, players, best, onWin, onRestart }) {
  const [cards, setCards] = useState(() => createDeck(level.pairs, emojis))
  // The ids of the face-up cards that have no pair yet: two at most.
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  // Did this game beat the best so far? We decide at the moment of the win.
  const [newRecord, setNewRecord] = useState(false)
  // Two-player mode: whose turn it is (0 or 1), and how many pairs each player has found.
  const [turn, setTurn] = useState(0)
  const [scores, setScores] = useState([0, 0])

  // Derived values: worked out from the state on every render.
  const won = cards.every((card) => card.matched)
  const found = cards.filter((card) => card.matched).length / 2
  // The clock runs from the first click until the win.
  const running = (moves > 0 || flipped.length > 0) && !won

  // Two face-up cards can only be a missed pair: they turn back after a second.
  useEffect(() => {
    if (flipped.length < 2) return
    const timer = setTimeout(() => setFlipped([]), 1000)
    // Cleanup: if the situation changes first, the timer stops.
    return () => clearTimeout(timer)
  }, [flipped])

  // While the clock runs, the time grows by one every second.
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setSeconds((current) => current + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  function flipCard(card) {
    // If two cards are showing already, this one is face up, or its pair is already found, nothing happens.
    if (flipped.length === 2 || flipped.includes(card.id) || card.matched) return

    // The first card of the two: just remember it.
    if (flipped.length === 0) {
      setFlipped([card.id])
      return
    }

    // The second card: this is a move. Compare it with the first.
    setMoves(moves + 1)
    const first = cards.find((item) => item.id === flipped[0])
    if (first.emoji === card.emoji) {
      // A pair! The copies of the two cards get matched: true, the others stay as they were.
      const newCards = cards.map((item) => {
        if (item.id === first.id || item.id === card.id) {
          return { ...item, matched: true }
        }
        return item
      })
      setCards(newCards)
      setFlipped([])
      // The player whose turn it is gets a point and goes again.
      setScores(scores.map((score, index) => (index === turn ? score + 1 : score)))

      // Was this the last pair? In solo mode, tell App now, so it can save the result.
      if (players === 1 && newCards.every((item) => item.matched)) {
        const result = { moves: moves + 1, seconds }
        setNewRecord(isBetter(result, best))
        onWin(result)
      }
    } else {
      // Not a pair: both stay visible for a while, and the other player is next (1 - 0 = 1, 1 - 1 = 0).
      setFlipped([first.id, card.id])
      setTurn(1 - turn)
    }
  }

  // In two-player mode the win message also says who won.
  let title = 'You won! 🎉'
  if (players === 2) {
    if (scores[0] > scores[1]) title = 'Player 1 wins! 🎉'
    else if (scores[1] > scores[0]) title = 'Player 2 wins! 🎉'
    else title = 'A draw!'
  }

  return (
    <>
      <dl className="stats">
        <div>
          <dt>Moves</dt>
          <dd>{moves}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{formatTime(seconds)}</dd>
        </div>
        <div>
          <dt>Pairs</dt>
          <dd>
            {found} / {cards.length / 2}
          </dd>
        </div>
        {players === 1 && (
          <div>
            <dt>Best</dt>
            <dd>{best ? `${best.moves} moves · ${formatTime(best.seconds)}` : '–'}</dd>
          </div>
        )}
        {players === 2 &&
          PLAYER_NAMES.map((name, index) => (
            <div key={name} className={index === turn && !won ? 'is-turn' : ''}>
              <dt>{name}</dt>
              <dd>{scores[index]}</dd>
            </div>
          ))}
      </dl>

      {players === 2 && !won && (
        <p className="turn" aria-live="polite">
          Next up: {PLAYER_NAMES[turn]}
        </p>
      )}

      {won && (
        <section className="win" role="status">
          <div>
            <h2>{title}</h2>
            <p>
              All pairs found: {moves} moves, {formatTime(seconds)}.
            </p>
            {newRecord && <p className="win__record">New record on this level!</p>}
          </div>
          <button type="button" className="button--primary" onClick={onRestart}>
            New game
          </button>
        </section>
      )}

      <div className="board" style={{ '--columns': level.columns }}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            faceUp={card.matched || flipped.includes(card.id)}
            onFlip={() => flipCard(card)}
          />
        ))}
      </div>
    </>
  )
}

export default Game
```

- In solo mode `turn` and `scores` change too, but they don't show anywhere: no extra code is needed to switch them
  off.
- `title` is a piece of text put together with `if`s before drawing, like the card's class name. `else if` only
  checks its condition if the one before was false.
- The two players' boxes are made from the `PLAYER_NAMES` array, and their name is the `key` (two different texts
  that never change). The box of the player whose turn it is gets the `is-turn` class and turns turquoise.
- The "Next up:" line is `aria-live="polite"`, so a screen reader announces it when the turn passes to the other
  player.

The number of players goes into `App`, with two switches. It goes into the `key` too: switching between solo and
two-player mode starts a new game. Here is the final `src/App.jsx`:

```jsx file=src/App.jsx mark=18,56-63,81,84
import { useState } from 'react'
import Game from './components/Game.jsx'
import { THEMES, isBetter } from './game.js'
import useLocalStorage from './useLocalStorage.js'
import './App.css'

// The difficulty levels: how many pairs are in the deck, and in how many columns the cards stand.
const LEVELS = [
  { id: 'easy', name: 'Easy', pairs: 6, columns: 4 },
  { id: 'medium', name: 'Medium', pairs: 8, columns: 4 },
  { id: 'hard', name: 'Hard', pairs: 12, columns: 6 },
]

function App() {
  const [levelId, setLevelId] = useState('medium')
  // The number of the game: every new game gets a number one higher.
  const [round, setRound] = useState(1)
  const [players, setPlayers] = useState(1)
  const [themeId, setThemeId] = useLocalStorage('memory-game-theme', 'animals')
  // The best result per level, for example { easy: { moves: 9, seconds: 31 } }.
  const [bests, setBests] = useLocalStorage('memory-game-bests', {})

  const level = LEVELS.find((item) => item.id === levelId)
  // If the saved theme no longer exists, carry on with the first one.
  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0]

  function newGame() {
    setRound(round + 1)
  }

  // Game calls this when a player has found the last pair.
  function saveResult(result) {
    if (isBetter(result, bests[levelId])) {
      setBests({ ...bests, [levelId]: result })
    }
  }

  return (
    <main className="game" style={{ '--card-color': theme.color }}>
      <h1>Memory Game</h1>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Difficulty">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip"
              aria-pressed={item.id === levelId}
              onClick={() => setLevelId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Players">
          <button type="button" className="chip" aria-pressed={players === 1} onClick={() => setPlayers(1)}>
            Solo
          </button>
          <button type="button" className="chip" aria-pressed={players === 2} onClick={() => setPlayers(2)}>
            Two players
          </button>
        </div>
        <label className="select">
          Theme
          <select value={theme.id} onChange={(event) => setThemeId(event.target.value)}>
            {THEMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button" onClick={newGame}>
          New game
        </button>
      </div>

      {/* When the key changes, React throws the old Game away and draws a brand-new one in its place. */}
      <Game
        key={`${levelId}-${theme.id}-${players}-${round}`}
        level={level}
        emojis={theme.emojis}
        players={players}
        best={bests[levelId]}
        onWin={saveResult}
        onRestart={newGame}
      />
    </main>
  )
}

export default App
```

:::check Check
Click "Two players": instead of the "Best" box, "Player 1 0" and "Player 2 0" appear, the first one turquoise, with
"Next up: Player 1" below them. After a wrong pair the second player is next; after a found pair the same player stays,
and their score goes up. At the end the banner says who won (or that it is a draw), and a two-player game adds nothing
to the records.
:::

:::mistake Common mistake
`players` is missing from the key of `Game`. If you then switch to "Two players" during a game, the game doesn't start
over, and the two players' boxes already show points: the pairs you found alone, split up the way `turn` happened to
switch back and forth. Whatever changes the rules of the game has to start a new game, so it belongs in the `key`.
:::

:::try Task
Mark on the cards who found the pair: in the "A pair!" branch, put `turn` next to `{ ...item, matched: true }`
(`owner: turn`), and in `Card` give the second player's cards an `is-p2` class and colour them differently in
`Card.css`.
:::

### Keyboard controls

Since every card is a `<button>`, the keyboard already works: ++Tab++ jumps to the next card, ++Enter++ or ++Space++
turns it over. Try it! With 24 cards, though, it takes many ++Tab++ presses to reach the last one. In games you
usually step around with the arrow keys: left and right by one card, up and down by a whole row.

For that we need to know which button has the [[focus]] right now (whichever element has the focus gets the key
presses), and we need to be able to move it to another. React doesn't keep track of this, the browser does:
`document.activeElement` tells you which element has it, and an element's `focus()` method gives it the focus (you
used it on the calculator's input field in lesson 8).

We reach the card buttons through the grid. [[useRef]] gives access to a real HTML element, just as it did for the
`<dialog>` in lesson 12: `useRef(null)` gives a box whose `current` field React fills with the element that has
`ref={…}` on it in the JSX. Unlike `useState`, changing a ref doesn't draw the component again; it is for keeping hold
of something, such as an element, between renders.

In the first line of `Game.jsx`, import `useRef` too: `import { useEffect, useRef, useState } from 'react'`. Then the
ref goes below the `scores` state:

```jsx file=src/components/Game.jsx mark=3-4
  const [turn, setTurn] = useState(0)
  const [scores, setScores] = useState([0, 0])
  // The grid of cards, so the arrow keys can move the focus between its buttons.
  const boardRef = useRef(null)
```

And after the `flipCard` function, the handler for the arrow keys:

```jsx file=src/components/Game.jsx
  // The arrow keys move the focus in the grid: left and right by one card, up and down by a whole row.
  function moveFocus(event) {
    const steps = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: level.columns, ArrowUp: -level.columns }
    const step = steps[event.key]
    if (step === undefined) return
    // Don't scroll the page, just move the focus.
    event.preventDefault()

    const buttons = [...boardRef.current.querySelectorAll('.card')]
    const current = buttons.indexOf(document.activeElement)
    const target = current + step
    if (current === -1 || target < 0 || target >= buttons.length) return
    buttons[target].focus()
  }
```

Finally, the grid gets the ref and the handler. Replace the opening tag of the `board`:

```jsx file=src/components/Game.jsx mark=2,5-7
      <div
        ref={boardRef}
        className="board"
        style={{ '--columns': level.columns }}
        role="group"
        aria-label="Cards"
        onKeyDown={moveFocus}
      >
```

- `event.key` is the name of the key pressed, for example `'ArrowRight'` (you listened to keys in lessons 7 and 12).
  The `steps` object says for every arrow how far to step; `steps[event.key]` is `undefined` for every other key, and
  then we leave, so ++Tab++, ++Enter++ and ++Space++ work just as before.
- `event.preventDefault()` switches off the browser's [[default behavior]], as with the space bar in lesson 7: for an
  arrow key, that is scrolling the page. We call it before checking the edges, so the page doesn't scroll at the edge
  of the grid either.
- `querySelectorAll('.card')` finds every card button inside the grid, in order. That is not a real array, so the
  `[...` and `]` around it (spread) turn it into one, and we can use `indexOf`: it tells you which button has the
  focus (or gives `-1` if none does).
- If the target would fall outside the grid (above the first row or after the last card), we don't move anywhere.
- `onKeyDown` is on the grid, not on each card. A key event [[bubbles|event bubbling]] up from the focused button to
  its parents, so one handler is enough for all 24 cards.
- `role="group"` and `aria-label` present the grid to screen readers as a group with a name.

:::check Check
Press ++Tab++ until the focus reaches the first card (a yellow outline shows it). Step around the grid with the arrow
keys: the focus moves and the page doesn't scroll. ++Space++ or ++Enter++ turns the card over. At the end of a row
++→++ goes to the start of the next row; ++↑++ in the first row and ++↓++ in the last row don't move the focus. On
the hard level ++↓++ steps six cards, just as the grid has six columns. Congratulations, your memory game is done!
:::

:::mistake Common mistake
`ArrowDown: 4` instead of `level.columns`. On the easy and medium levels all is fine, but on the hard level ++↓++
doesn't go to the card below: in a six-column grid four cards are not a whole row, so the focus jumps down and to the
left, and from the first two cards of a row it even stays in the same row. Whatever depends on the level, read it
from the level's data.
:::

:::try Task
Extend `moveFocus` so ++Home++ jumps to the first card and ++End++ to the last: the target is then `0` or
`buttons.length - 1`. Watch out: right now `step === undefined` leaves for every other key, so you have to think about
the order, too.
:::
