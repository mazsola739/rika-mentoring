# What we build

Study cards: a question on one side of the card, the answer on the other, and when you click it, it flips over in 3D
like a real card. You can go back and forth through the cards, put together decks of your own, mark what you already
know, and the app remembers all of it. By the end it gets clever too: the cards you keep struggling with come back more
often than the ones you could answer in your sleep.

Along the way you learn how CSS turns an element in three dimensions, how to move between the cards with the mouse and
the keyboard, how to shuffle a deck, and how the `localStorage` saving from lesson 2 becomes a custom hook you can use
for anything.

:::levels
- Cards with a question and an answer that flip over in 3D on a click; moving between them with buttons and the arrow keys. | about 2 hours
- Decks and cards of your own, "I know it / Not yet" marks, a progress bar, shuffling, and saving with a custom `useLocalStorage` hook. | about 3 hours
- Harder cards come back more often (the Leitner system), pictures on cards, downloading and loading decks, a shareable link. | about 3 hours
:::

**Before you start you need:** the first five lessons, but mostly lessons 1–3: components, props, JSX, `useState`,
`useEffect` and cleanup, `localStorage`, a custom hook (`useDarkMode`), controlled form fields and the Fisher–Yates
shuffle. Whatever we use in a new way is explained again here.

## Beginner level {level=1}

### Before you start

This lesson's exercise is the `lessons/06-flashcards/exercise` folder of the course repository on GitHub (the
"Exercise on GitHub" button above the guide opens it). If you did the earlier lessons, you already have Node.js, Git and
VS Code; if not, step 0 of lesson 1 shows how to install them, and it also explains in detail how to get the exercise.
In short: in a terminal, in the folder where you keep your projects:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git        # only the first time
cp -r rika-mentoring/lessons/06-flashcards/exercise flashcards    # your own copy of the exercise
```

If you already have the repository from an earlier lesson, skip the `git clone` line, and before you copy, bring in
the new lessons: `cd rika-mentoring`, `git pull`, `cd ..` (back to your work folder). Instead of cloning, you can also
choose **Code → Download ZIP** on the [repository page](https://github.com/mazsola739/rika-mentoring); lesson 1 shows
how to copy the folder out of the downloaded ZIP. You work in your copy, the `flashcards` folder: the repository stays
untouched, so `git pull` keeps working. Open your copy in your editor, then, in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). In the middle of a pale grey page you see a
white panel with the title "Flashcards" at the top. Nothing else yet.
:::

Leave the server running, and in a second terminal (the **+** button in the terminal panel) make your copy a git
repository with one commit, the starting point:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step
that works.

The exercise has three files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready; the guide uses its class names (`card`, `study`, `decks`, …).
  One thing is missing on purpose: the 3D flip of the card. That is one of the main topics of the lesson, so you write
  it yourself, in step 2.
- `src/cards.js`: two sample decks. `REACT_CARDS` asks you about the React ideas from the earlier lessons (so you revise
  while you build), and `SPACE_CARDS` is a little space quiz. Both are an [[array]], and every item is an [[object]]
  with three fields: `id` (a unique name that is never shown), `question` and `answer`.

:::concept A quick recap
A [[component]] is a function that returns [[JSX]], the HTML-like description of what should appear. It gets data from
outside through its [[props]]. It remembers things with [[useState]]: when a state value changes, React draws the
component again. Work outside drawing, like a listener or a timer, goes into [[useEffect]], and its cleanup function
stops it. If any of this feels unfamiliar, take another look at lessons 1–3.
:::

### One card on the screen

Let's start with a single card. It gets a component of its own, called `Flashcard`: it receives the card's data from
outside, as a prop, and remembers in its own state which side is showing. Create a `components` folder in `src`, and in
it a `Flashcard.jsx` file:

```jsx file=src/components/Flashcard.jsx
import { useState } from 'react'

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button type="button" className="card" onClick={() => setFlipped(!flipped)}>
      <span className="card__face card__front">
        <span className="card__label">{flipped ? 'Answer' : 'Question'}</span>
        <span className="card__text">{flipped ? card.answer : card.question}</span>
      </span>
    </button>
  )
}

export default Flashcard
```

- The `flipped` state starts as `false`: the card starts with its question. On a click, `setFlipped(!flipped)` sets
  the opposite: `false` becomes `true`, and `true` becomes `false`.
- `flipped ? card.answer : card.question` is the [[ternary operator]] from lesson 3: if the card is flipped, it shows
  the answer, otherwise the question. The label (`Question` / `Answer`) is picked the same way.
- Why is the card a `<button>` and not a `<div>`? Because you click it. You can reach a button with the keyboard
  (++Tab++), ++Space++ and ++Enter++ press it, and a screen reader announces it as a button. A `<div>` does none of
  this on its own.
- Only text-level elements, like `<span>`, may go inside a button, so there is no `<div>` or `<p>` in it. `App.css`
  makes the inner `<span>`s stand one under the other anyway.

Now put the first card on the page, in `src/App.jsx`:

```jsx file=src/App.jsx mark=1,2,9
import { REACT_CARDS } from './cards.js'
import Flashcard from './components/Flashcard.jsx'
import './App.css'

function App() {
  return (
    <main className="app">
      <h1>Flashcards</h1>
      <Flashcard card={REACT_CARDS[0]} />
    </main>
  )
}

export default App
```

`REACT_CARDS[0]` is the first item of the array: arrays count from 0. `{ REACT_CARDS }` needs the curly braces because
`cards.js` gives the two arrays as [[named exports|named export]] (`export const …`), not as a `default`, just like
`generator.js` in lesson 3.

:::check Check
A white card appears under the title: "QUESTION" in green at the top, "What is JSX?" in the middle. Click it: the label
becomes "ANSWER", and the answer appears. One more click and the question is back. You can reach the card with ++Tab++
too (a yellow outline shows it), and then ++Space++ turns it over as well.
:::

:::mistake Common mistake
`import REACT_CARDS from './cards.js'`, without the curly braces. This asks for the file's `default` export, and there
is none: the page stays empty, and the console (++F12++ → Console) says `does not provide an export named 'default'`.
:::

:::try Try it
Change the card to `REACT_CARDS[3]`, then to a space quiz card: for that you also have to import `SPACE_CARDS`, with
`import { REACT_CARDS, SPACE_CARDS } from './cards.js'`. Then set it back to `REACT_CARDS[0]`.
:::

### Turning over in 3D

Right now the card only swaps its text. A real card turns over: it rotates around its vertical axis, and its back
comes to the front. The browser can do this too, with a few CSS rules.

The CSS [[transform]] property rotates, moves or resizes an element without pushing the elements around it.
`rotateY(180deg)` rotates it around the vertical, Y axis by 180 degrees: exactly so that its back faces us. To make
this look like a card turning over, the card needs two separate sides, and four things:

1. [[perspective]]: without it the rotation is flat. The card just gets narrower and then wider again, like a strip of
   paper seen from the front. `perspective: 1000px` says how far away we are looking from: a smaller number brings us
   closer, and the 3D effect gets stronger.
2. [[transform-style: preserve-3d|transform-style]] on the rotating layer: the two sides turn with it, in space.
   Without it the browser squashes them into one flat picture.
3. [[backface-visibility: hidden|backface-visibility]] on the sides: a side that has its back to us is invisible.
4. The back side starts turned over (`rotateY(180deg)`), so it is exactly this side that comes to the front when the
   card turns, and its text is not mirrored.

The two sides lie exactly on top of each other: the rotating layer is `position: relative`, the sides are
`position: absolute`, and `inset: 0` stretches them to all four edges of the rotating layer. The turn is animated by the
[[transition]] from lesson 1. Create the `src/components/Flashcard.css` file:

```css file=src/components/Flashcard.css
/* The stage: perspective gives depth, as if we looked at the card from 1000 pixels away. */
.card {
  perspective: 1000px;
}

/* This layer rotates. With preserve-3d its two sides turn with it, in space. */
.card__inner {
  display: block;
  position: relative;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
}

.card.is-flipped .card__inner {
  transform: rotateY(180deg);
}

/* The two sides lie exactly on top of each other, and the one with its back to us is invisible. */
.card__face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden; /* for older Safari */
}

/* The back starts turned over: it comes to the front when the card turns. */
.card__back {
  transform: rotateY(180deg);
}

/* If animations are switched off on the computer, the card turns over at once. */
@media (prefers-reduced-motion: reduce) {
  .card__inner {
    transition: none;
  }
}
```

The `-webkit-` line is the same as the one above it; older Safari only knows it by that name. Now replace the content
of `Flashcard.jsx`: the card gets two sides and a rotating layer between them.

```jsx file=src/components/Flashcard.jsx mark=2,10,13-23
import { useState } from 'react'
import './Flashcard.css'

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      className={flipped ? 'card is-flipped' : 'card'}
      onClick={() => setFlipped(!flipped)}
    >
      <span className="card__inner">
        <span className="card__face card__front" aria-hidden={flipped}>
          <span className="card__label">Question</span>
          <span className="card__text">{card.question}</span>
          <span className="card__hint">Click to flip</span>
        </span>
        <span className="card__face card__back" aria-hidden={!flipped}>
          <span className="card__label">Answer</span>
          <span className="card__text">{card.answer}</span>
        </span>
      </span>
    </button>
  )
}

export default Flashcard
```

- The card no longer swaps its text; it gets a class instead: `card is-flipped` when flipped, plain `card` otherwise.
  The rotation is the job of CSS: the `.card.is-flipped .card__inner` rule applies when the card has `is-flipped`.
- Both sides of the card are always on the screen; one of them just has its back to us. Screen readers would still
  read both, so [[aria-hidden]] hides the side that is not showing from them.

:::concept How it fits together
Think in layers. Outside is the button (`.card`): this is the stage, and it holds the perspective. Inside it is
`.card__inner`: this layer rotates and carries the two sides with it. Innermost are the two sides, on top of each
other: the question in front, and behind it the answer, turned over from the start and therefore invisible. When the
layer turns 180 degrees, the question ends up with its back to us and disappears, and the answer turns to face us.
:::

:::check Check
Click the card: in a little more than half a second it flips over like a real card, and the answer appears on its dark
blue back. Another click turns it back. If animations are switched off on your computer (or you set
"prefers-reduced-motion" to `reduce` in the Rendering panel of the developer tools), the card turns at once.
:::

:::mistake Common mistake
Without `backface-visibility: hidden`, the dark back shows even before you turn the card, in mirror writing: the two
sides lie on top of each other, and the back, which comes later, covers the question. Without
`transform-style: preserve-3d`, after the turn you see the question in mirror writing, and the answer never appears.
:::

:::try Try it
Flip the card upwards, like a calendar page: change both `rotateY(180deg)` to `rotateX(180deg)`. Then try
`perspective` with 300 and 3000 pixels too. Once you have a favourite, set `rotateX` back to `rotateY`, because the
guide continues with that.
:::

### Previous and next

One card is not enough: we want to page through the deck. Which card we are on is a number, the [[index]]: 0 is the
first, 1 the second, and so on. It changes while you use the page, so it is state. Change `src/App.jsx`:

```jsx file=src/App.jsx mark=1,7-9,14-27
import { useState } from 'react'
import { REACT_CARDS } from './cards.js'
import Flashcard from './components/Flashcard.jsx'
import './App.css'

function App() {
  const [index, setIndex] = useState(0)
  const cards = REACT_CARDS
  const card = cards[index]

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <section className="study">
        <p className="study__counter">
          Card {index + 1} of {cards.length}
        </p>
        <Flashcard key={card.id} card={card} />
        <div className="study__nav">
          <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
            ← Previous
          </button>
          <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
            Next →
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
```

- For now `cards` is just another name for `REACT_CARDS`. It will come in handy: in the intermediate level the chosen
  deck will come from here, and the rest of the component will not need to change.
- The counter shows `index + 1`, because people count from 1 and arrays from 0. `cards.length` is the number of cards.
- The [[disabled]] attribute switches a button off: you cannot click it, and `App.css` makes it paler. "Previous" is off
  at the first card (`index === 0`), "Next" at the last one (`index === cards.length - 1`). This way the index can
  never slip out of the array.
- `key={card.id}` is familiar from lesson 3: when a component's [[key]] changes, React treats it as a brand-new
  component, with fresh state. So when you move to another card, it always starts with its question.

:::check Check
Above the card it says "Card 1 of 8", and the "Previous" button is pale. With "Next" you can page through all eight
cards; at the last one, that button turns pale. Turn a card over, then go to the next one: it starts with its question.
:::

:::mistake Common mistake
Without `key={card.id}`, React keeps the same `Flashcard` and just gives it a new card, while the old `flipped` state
stays. If you move on while a card is turned over, the next card appears with its answer already showing: it gives
the answer away before you have had time to think.
:::

:::try Try it
Page through the space quiz: import `SPACE_CARDS` as well (`import { REACT_CARDS, SPACE_CARDS } from './cards.js'`) and
change the `const cards = REACT_CARDS` line to `SPACE_CARDS`. Then set it back.
:::

### Paging with the keyboard

It is quicker if the arrow keys move through the cards too: ++→++ forwards, ++←++ back. For this we have to ask the
browser to call a function of ours at every key press. Pressing a key is an [[event]] called `keydown`, and
`window.addEventListener('keydown', fn)` subscribes to it: from then on, the browser calls `fn` for every key, anywhere
on the page. The `useHashRoute` hook in lesson 1 listened to the `hashchange` event the same way.

Subscribing is work outside drawing, so it goes into `useEffect`, and a cleanup function unsubscribes when the
component goes away. Change `src/App.jsx` like this (the `return` stays the same):

```jsx file=src/App.jsx mark=1,10-19
import { useEffect, useState } from 'react'
import { REACT_CARDS } from './cards.js'
import Flashcard from './components/Flashcard.jsx'
import './App.css'

function App() {
  const [index, setIndex] = useState(0)
  const cards = REACT_CARDS

  // Keyboard shortcuts: ← and → page through the cards.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    // Cleanup: when the component goes away, so does the listener.
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cards.length])

  const card = cards[index]

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <section className="study">
        <p className="study__counter">
          Card {index + 1} of {cards.length}
        </p>
        <Flashcard key={card.id} card={card} />
        <div className="study__nav">
          <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
            ← Previous
          </button>
          <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
            Next →
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
```

- `event.key` is the name of the key that was pressed: `'ArrowRight'`, `'ArrowLeft'`, `'a'`, `'Enter'`… When only one
  statement follows an `if`, you can leave out the curly braces.
- [[Math.min]] returns the smaller of two numbers, [[Math.max]] the larger. So `Math.min(i + 1, cards.length - 1)` goes
  no further than the last card, and `Math.max(i - 1, 0)` no further back than the first: at either end, the key simply
  does nothing.
- The [[dependency array]] is `[cards.length]`: the listener subscribes again when the number of cards changes, but
  not when you move to another card.

And what is `setIndex((i) => …)`? Until now we always gave the new value to the `set…` function. Now it gets a function,
an [[updater function]]: React calls it with the latest state (named `i` here), and whatever it returns becomes the new
value. We need this because `onKeyDown` is created only once, on the first render, and it sees the variables of that
moment, including the `index` of that moment, 0. The effect does not run again when you move to another card, so that
old 0 never gets updated inside it. The updater function does not need to know what `index` is now: React tells it.

:::check Check
Click an empty part of the page and press ++→++ a few times: the counter steps on, all the way to "Card 8 of 8", and
stops there. ++←++ goes back and stops at the first card. That completes the beginner level: commit it!
:::

:::mistake Common mistake
`setIndex(index + 1)` in the listener, without an updater function. ++→++ takes you to card 2 and stops there, however
often you press it: for the listener, `index` stayed 0 forever, so it always sets `0 + 1`.
:::

:::try Task
Make ++Home++ jump to the first card and ++End++ to the last one. You need two new lines in `onKeyDown`; the keys are
called `'Home'` and `'End'`. (On a laptop these are often ++Fn++ + ++←++ and ++Fn++ + ++→++.)
:::

## Intermediate level {level=2}

### Decks

The exercise has two decks, but we only ever see one of them. Let's have a picker: clicking a deck's name switches to
it. For this we take `App` apart. Everything about paging (the index, the keys, the counter, the card and the buttons)
moves into a new component, `Study`. The job of `App` will be to know which deck is chosen.

Create the `src/components/Study.jsx` file. Most of it is familiar: it is the paging part of `App` so far, only now it
gets the cards as a prop.

```jsx file=src/components/Study.jsx mark=4,9-10,20-23
import { useEffect, useState } from 'react'
import Flashcard from './Flashcard.jsx'

function Study({ cards }) {
  const [index, setIndex] = useState(0)

  // Keyboard shortcuts: ← and → page through the cards.
  useEffect(() => {
    // Nothing to page through in an empty deck.
    if (cards.length === 0) return
    function onKeyDown(event) {
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    // Cleanup: when the component goes away, so does the listener.
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cards.length])

  // After all hooks: with no cards, only a message appears.
  if (cards.length === 0) {
    return <p className="empty">This deck is empty.</p>
  }

  const card = cards[index]

  return (
    <section className="study">
      <p className="study__counter">
        Card {index + 1} of {cards.length}
      </p>
      <Flashcard key={card.id} card={card} />
      <div className="study__nav">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Previous
        </button>
        <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
          Next →
        </button>
      </div>
    </section>
  )
}

export default Study
```

There is one new thing in it: what if a deck has no cards at all? In the next step you will be able to create empty
decks, and then `cards[0]` would be `undefined`, and `card.id` would throw an error. So in that case the component
returns early and only draws a message. But this early `return` may only come **after** the hooks (`useState`,
`useEffect`). This is the [[rule of hooks|rules of hooks]]: React keeps track of hooks by their order, so the same hooks
must run in the same order on every render. A hook never goes behind an `if`, nor after an early `return`.

The picker's buttons look like the theme switch from lesson 2: [[aria-pressed]] marks the chosen one, and the CSS uses
it to know which one to colour in. Create the `src/components/DeckPicker.jsx` file:

```jsx file=src/components/DeckPicker.jsx
function DeckPicker({ decks, activeId, onSelect }) {
  return (
    <div className="decks">
      <div className="decks__list" role="group" aria-label="Decks">
        {decks.map((deck) => (
          <button
            key={deck.id}
            type="button"
            className="chip"
            aria-pressed={deck.id === activeId}
            onClick={() => onSelect(deck.id)}
          >
            {deck.name}
            <span className="chip__count">{deck.cards.length}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DeckPicker
```

Finally, `App`. The decks go into an array: each one is an object with an id, a name and its cards. The names are
written here, in `App`, so you can call the decks whatever you like. The state is only the id of the chosen deck.
Replace the content of `src/App.jsx`:

```jsx file=src/App.jsx mark=2-4,7-10,13,14,19-21
import { useState } from 'react'
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import './App.css'

const DECKS = [
  { id: 'react', name: 'React basics', cards: REACT_CARDS },
  { id: 'space', name: 'Space quiz', cards: SPACE_CARDS },
]

function App() {
  const [activeId, setActiveId] = useState(DECKS[0].id)
  const deck = DECKS.find((d) => d.id === activeId)

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <DeckPicker decks={DECKS} activeId={activeId} onSelect={setActiveId} />
      {/* Thanks to the key, a new Study is born when the deck changes, and it starts with the first card. */}
      <Study key={deck.id} cards={deck.cards} />
    </main>
  )
}

export default App
```

- [[find]] goes through the array and returns the first item for which the given function says `true`: here, the deck
  whose id is the chosen one.
- `DeckPicker` does not decide on its own: it reports through `onSelect` which deck was clicked, and `App` changes the
  state. We can even pass `setActiveId` itself, since that is also a function that expects an id.
- Because of `key={deck.id}`, `Study` is born again whenever the deck changes, with a fresh index of 0.
- The `Flashcard` import moved from `App` to `Study`, where it is used.

:::check Check
Under the title, two buttons: "React basics 8" (dark: it is chosen) and "Space quiz 8". Click "Space quiz": the card
says "Which planet has a day longer than its year?", and the counter "Card 1 of 8". The arrow keys and the buttons
work here too.
:::

:::mistake Common mistake
Without `key={deck.id}` on `Study`, the old index stays when you switch decks: from React card 5 you land on space
question 5, not on the first one. And with a shorter deck the index can slip out of the array, and the page crashes.
:::

:::try Task
Write a third deck into the `DECKS` array, with three cards of your own (`id`, `question`, `answer`), say about your
favourite series. The ids must be unique, because the `key`s are made from them.
:::

### Your own decks, your own cards

So far every card was written into the code. Now let's create new decks and write cards in the app itself. From now on
the list of decks changes while you use the page, so it becomes state.

We still never change state directly; we always make a new value instead. This is an [[immutable update]]
(immutable: unchangeable): React
notices a change by comparing the old value with the new one, and if the array is the same array, it thinks nothing
happened. We use two tricks:

- `[...decks, newDeck]`: a new array with the old items and a new one at the end. `...` is the [[spread]] you saw with
  objects in lesson 1; it works the same way for arrays.
- `decks.map((d) => (d.id === deck.id ? { ...d, cards } : d))`: a new array in which the chosen deck is replaced by a
  copy with new cards, and the other decks stay as they are. `{ ...d, cards }` is short for `{ ...d, cards: cards }`.

First the forms. Both follow the pattern of the contact form in lesson 1: [[controlled fields|controlled field]],
`onSubmit` listens for sending, and `event.preventDefault()` stops the browser from reloading the page. The deck picker
gets a small form for the name of a new deck. Here is the whole of `src/components/DeckPicker.jsx`:

```jsx file=src/components/DeckPicker.jsx mark=1,3-11,29-38
import { useState } from 'react'

function DeckPicker({ decks, activeId, onSelect, onCreate }) {
  const [name, setName] = useState('')

  function submit(event) {
    event.preventDefault()
    if (name.trim() === '') return
    onCreate(name.trim())
    setName('')
  }

  return (
    <div className="decks">
      <div className="decks__list" role="group" aria-label="Decks">
        {decks.map((deck) => (
          <button
            key={deck.id}
            type="button"
            className="chip"
            aria-pressed={deck.id === activeId}
            onClick={() => onSelect(deck.id)}
          >
            {deck.name}
            <span className="chip__count">{deck.cards.length}</span>
          </button>
        ))}
      </div>
      <form className="deck-form" onSubmit={submit}>
        <input
          aria-label="Name of the new deck"
          placeholder="Name of the new deck"
          maxLength={40}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit">+ New deck</button>
      </form>
    </div>
  )
}

export default DeckPicker
```

[[trim]] cuts the spaces off the start and the end of a string: `'  Spanish  '.trim()` is `'Spanish'`. This way a name
made only of spaces counts as empty, and no deck is made from it. The field has no visible label, only the grey
`placeholder` text that disappears when you type; so `aria-label` gives it its name for screen readers.
`maxLength={40}` lets you type 40 characters at most.

The form for cards is similar, only with two fields. `<textarea>` is the text field with several lines ([[textarea]])
that you know from lessons 4–5; in React it gets `value` and `onChange` just like an `<input>`. Create the
`src/components/CardForm.jsx` file:

```jsx file=src/components/CardForm.jsx
import { useState } from 'react'

function CardForm({ onAdd }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  function submit(event) {
    event.preventDefault()
    // An empty question or answer (or one made only of spaces) is not saved.
    if (question.trim() === '' || answer.trim() === '') return
    onAdd(question.trim(), answer.trim())
    setQuestion('')
    setAnswer('')
  }

  return (
    <form className="card-form" onSubmit={submit}>
      <h2>A new card for this deck</h2>
      <label>
        Question
        <textarea rows={2} value={question} onChange={(event) => setQuestion(event.target.value)} />
      </label>
      <label>
        Answer
        <textarea rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} />
      </label>
      <button type="submit" className="button--primary">
        Add card
      </button>
    </form>
  )
}

export default CardForm
```

New decks and cards need unique ids. The browser makes them for us: every call of `crypto.randomUUID()` returns a new,
36-character [[UUID]], for example `'3b241101-e2bb-4255-8caf-4136c566a962'`. In practice you never get the same one
twice. Now wire up the forms in `src/App.jsx`:

```jsx file=src/App.jsx mark=5,8,14-16,18-31,36,39
import { useState } from 'react'
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import CardForm from './components/CardForm.jsx'
import './App.css'

const START_DECKS = [
  { id: 'react', name: 'React basics', cards: REACT_CARDS },
  { id: 'space', name: 'Space quiz', cards: SPACE_CARDS },
]

function App() {
  const [decks, setDecks] = useState(START_DECKS)
  const [activeId, setActiveId] = useState(START_DECKS[0].id)
  const deck = decks.find((d) => d.id === activeId)

  function createDeck(name) {
    const newDeck = { id: crypto.randomUUID(), name, cards: [] }
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  // Replaces the cards of the active deck; the other decks stay as they are.
  function setActiveCards(cards) {
    setDecks(decks.map((d) => (d.id === deck.id ? { ...d, cards } : d)))
  }

  function addCard(question, answer) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer }])
  }

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <DeckPicker decks={decks} activeId={activeId} onSelect={setActiveId} onCreate={createDeck} />
      {/* Thanks to the key, a new Study is born when the deck changes, and it starts with the first card. */}
      <Study key={deck.id} cards={deck.cards} />
      <CardForm onAdd={addCard} />
    </main>
  )
}

export default App
```

`DECKS` is now called `START_DECKS`, because it is only the starting value: from now on the decks live in the `decks`
state. `createDeck` creates an empty deck and chooses it straight away. `addCard` adds a new card to the end of the
active deck's cards.

Finally, two small changes in `Study`. Now there are text fields on the page, and in them the arrow keys move the text
cursor. But our listener catches every key on the whole page, so the cards would change while you type. `event.target`
is the element in which the key was pressed, and `matches('input, textarea')` tells whether this CSS selector fits it,
that is, whether it is a text field. And the message for an empty deck can now say what to do. Here is the whole of
`src/components/Study.jsx`:

```jsx file=src/components/Study.jsx mark=12-13,24
import { useEffect, useState } from 'react'
import Flashcard from './Flashcard.jsx'

function Study({ cards }) {
  const [index, setIndex] = useState(0)

  // Keyboard shortcuts: ← and → page through the cards.
  useEffect(() => {
    // Nothing to page through in an empty deck.
    if (cards.length === 0) return
    function onKeyDown(event) {
      // While you type, the arrows belong to the text field.
      if (event.target.matches('input, textarea')) return
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    // Cleanup: when the component goes away, so does the listener.
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cards.length])

  // After all hooks: with no cards, only a message appears.
  if (cards.length === 0) {
    return <p className="empty">This deck is empty. Write its first card below!</p>
  }

  const card = cards[index]

  return (
    <section className="study">
      <p className="study__counter">
        Card {index + 1} of {cards.length}
      </p>
      <Flashcard key={card.id} card={card} />
      <div className="study__nav">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Previous
        </button>
        <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
          Next →
        </button>
      </div>
    </section>
  )
}

export default Study
```

:::check Check
Type the name of a new deck, say "English words", and press ++Enter++: the new button appears with "0" and is already
chosen, with the message "This deck is empty" below it. Write a question and an answer and click "Add card": there is
your first card, and the button says "1". While you type, ++←++ and ++→++ move in the text and leave the cards alone. (A
reload still wipes everything: saving is the last step of the intermediate level.)
:::

:::mistake Common mistake
`deck.cards.push(newCard)`, then `setDecks(decks)`. `push` changes the existing array, so `setDecks` gets back the very
array it already knows. React sees no change, and nothing happens on the screen. Always give state a new array.
:::

:::concept When is there no crypto.randomUUID?
Like the clipboard, `crypto.randomUUID` only exists on secure pages: `https://` addresses and `localhost`. If you open
the page on your phone at your computer's IP address (`npm run dev -- --host`, then the `http://192.168…` address on
the "Network" line), creating a deck shows `crypto.randomUUID is not a function` in the console. In the finished app,
published on `https://`, this is no problem.
:::

### I know it / Not yet

To learn, you need to know what you know already. Under every card, two buttons: "Not yet" and "I know it". Your answer
is a mark tied to the card's id, kept in an object: `{ jsx: 'known', props: 'learning' }`. The key is the card's `id`,
the value is `'known'` or `'learning'`. The marks must survive a deck switch, but `Study` starts afresh whenever the
deck changes (that is what its `key` does). So the marks live one level up, in `App`.

The marks also give us a progress bar: how many cards of the deck you know. This is not new state but a
[[derived value]], like in lesson 3: we work it out on every render from the deck and the marks.

The width of the bar is calculated by the code, so we set it from JSX, with the `style` prop. It expects an object,
which is why the curly braces are doubled: the outer pair belongs to JSX ("JavaScript comes here"), the inner pair is
the object itself. Property names are written in camelCase (`backgroundColor`, not `background-color`). Create the
`src/components/ProgressBar.jsx` file:

```jsx file=src/components/ProgressBar.jsx
function ProgressBar({ known, total }) {
  const percent = total === 0 ? 0 : Math.round((known / total) * 100)

  return (
    <div className="progress">
      <div className="progress__labels">
        <span>
          Known: {known} / {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={known}
      >
        <span className="progress__bar" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
```

`role="progressbar"` and the `aria-value…` attributes tell a screen reader that this is a progress bar and how far it
has got. The value of `width` is a [[template literal]] from lesson 1, text between backticks: the value of `percent`
takes the place of the `${percent}` inside it, and you get a string like `'38%'`. `total === 0 ? 0 : …` is there
because with an empty deck we would divide by zero.

`Study` gets the marks (`marks`) and the marking function (`onMark`). Here is the whole of `src/components/Study.jsx`:

```jsx file=src/components/Study.jsx mark=3,5,29-37,41,43-46,49-56
import { useEffect, useState } from 'react'
import Flashcard from './Flashcard.jsx'
import ProgressBar from './ProgressBar.jsx'

function Study({ cards, marks, onMark }) {
  const [index, setIndex] = useState(0)

  // Keyboard shortcuts: ← and → page through the cards.
  useEffect(() => {
    // Nothing to page through in an empty deck.
    if (cards.length === 0) return
    function onKeyDown(event) {
      // While you type, the arrows belong to the text field.
      if (event.target.matches('input, textarea')) return
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    // Cleanup: when the component goes away, so does the listener.
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cards.length])

  // After all hooks: with no cards, only a message appears.
  if (cards.length === 0) {
    return <p className="empty">This deck is empty. Write its first card below!</p>
  }

  const card = cards[index]
  const mark = marks[card.id] // 'known', 'learning' or undefined
  // Not state: worked out from the props on every render.
  const known = cards.filter((c) => marks[c.id] === 'known').length

  function answer(value) {
    onMark(card.id, value)
    // Move on if there is another card.
    if (index < cards.length - 1) setIndex(index + 1)
  }

  return (
    <section className="study">
      <ProgressBar known={known} total={cards.length} />
      <p className="study__counter">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        {mark && <span className={`badge badge--${mark}`}>{mark === 'known' ? 'Known' : 'Learning'}</span>}
      </p>
      <Flashcard key={card.id} card={card} />
      <div className="study__answer">
        <button type="button" onClick={() => answer('learning')}>
          Not yet
        </button>
        <button type="button" className="button--primary" onClick={() => answer('known')}>
          I know it
        </button>
      </div>
      <div className="study__nav">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Previous
        </button>
        <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
          Next →
        </button>
      </div>
    </section>
  )
}

export default Study
```

- `marks[card.id]` is the mark of the current card. If you have not marked it yet, it is `undefined`, and
  `{mark && …}` (the [[conditional rendering]] you know from the form in lesson 1) draws nothing. If there is one, a
  small badge shows it: `badge--known` is green, `badge--learning` orange.
- `filter` keeps only the cards for which its function says `true`, here the known ones; `length` counts them.
- `answer` marks and moves on. At the last card there is nowhere to go, so it stays.

`App` keeps the marks. Here is the whole of `src/App.jsx`:

```jsx file=src/App.jsx mark=16,34-36,43
import { useState } from 'react'
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import CardForm from './components/CardForm.jsx'
import './App.css'

const START_DECKS = [
  { id: 'react', name: 'React basics', cards: REACT_CARDS },
  { id: 'space', name: 'Space quiz', cards: SPACE_CARDS },
]

function App() {
  const [decks, setDecks] = useState(START_DECKS)
  const [activeId, setActiveId] = useState(START_DECKS[0].id)
  const [marks, setMarks] = useState({})
  const deck = decks.find((d) => d.id === activeId)

  function createDeck(name) {
    const newDeck = { id: crypto.randomUUID(), name, cards: [] }
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  // Replaces the cards of the active deck; the other decks stay as they are.
  function setActiveCards(cards) {
    setDecks(decks.map((d) => (d.id === deck.id ? { ...d, cards } : d)))
  }

  function addCard(question, answer) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer }])
  }

  function markCard(cardId, value) {
    setMarks({ ...marks, [cardId]: value })
  }

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <DeckPicker decks={decks} activeId={activeId} onSelect={setActiveId} onCreate={createDeck} />
      {/* Thanks to the key, a new Study is born when the deck changes, and it starts with the first card. */}
      <Study key={deck.id} cards={deck.cards} marks={marks} onMark={markCard} />
      <CardForm onAdd={addCard} />
    </main>
  )
}

export default App
```

`{ ...marks, [cardId]: value }` is familiar from lesson 3: it copies the old object and overwrites (or adds) one key.
The square brackets mean "the key whose name is in the `cardId` variable".

:::check Check
Above the card, an empty bar: "Known: 0 / 8", "0%". Click "I know it": the next card comes, and the bar grows
("Known: 1 / 8", "13%"). Page back: next to the counter there is a green "Known" badge. "Not yet" gives an orange
"Learning" badge. If you change your mind, mark it again: the last mark counts. Switch decks and back: the marks are
still there.
:::

:::mistake Common mistake
`style="width: 50%"`, the way you would write it in HTML. In React, `style` expects an object and throws an error for a
string: the page goes empty, and the console says "The `style` prop expects a mapping from style properties to values,
not a string". The right form is `style={{ width: '50%' }}`.
:::

:::try Task
Show under the progress bar how many cards you marked "Not yet". One more `filter` in `Study` is enough, and a new
prop for `ProgressBar`.
:::

### Shuffling

If the cards always come in the same order, after a while you learn the order, not the answers. We need a "Shuffle"
button. In lesson 3 you already shuffled an array with the [[Fisher–Yates shuffle]]: it goes from the last place to the
first, and swaps every item with a randomly chosen one from the part not yet shuffled. There is one difference now: the
deck's cards are in state, which we must not change. So the function copies the array first and shuffles the copy.
Create the `src/shuffle.js` file:

```js file=src/shuffle.js
// Fisher–Yates shuffle on a copy: the original array (the state!) stays untouched.
export function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}
```

Shuffling changes the order of the deck, so it happens in `App`, with the `setActiveCards` we already have. Three things
change in `src/App.jsx`: a new import, a new function and a new prop. Where the comments starting with `…` stand,
everything stays as it was.

```jsx file=src/App.jsx mark=1,4-6,11
import { shuffle } from './shuffle.js'
// … the other imports, START_DECKS and the start of App, as before

  function shuffleDeck() {
    setActiveCards(shuffle(deck.cards))
  }

  return (
    <main className="app">
      {/* … the title and the DeckPicker, as before … */}
      <Study key={deck.id} cards={deck.cards} marks={marks} onMark={markCard} onShuffle={shuffleDeck} />
      <CardForm onAdd={addCard} />
    </main>
  )
}
```

In `Study`, a button starts the shuffle, and afterwards we go to the first card, since the old index would point at a
different card. Here is the whole of `src/components/Study.jsx`:

```jsx file=src/components/Study.jsx mark=5,39-42,70-74
import { useEffect, useState } from 'react'
import Flashcard from './Flashcard.jsx'
import ProgressBar from './ProgressBar.jsx'

function Study({ cards, marks, onMark, onShuffle }) {
  const [index, setIndex] = useState(0)

  // Keyboard shortcuts: ← and → page through the cards.
  useEffect(() => {
    // Nothing to page through in an empty deck.
    if (cards.length === 0) return
    function onKeyDown(event) {
      // While you type, the arrows belong to the text field.
      if (event.target.matches('input, textarea')) return
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, cards.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    // Cleanup: when the component goes away, so does the listener.
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cards.length])

  // After all hooks: with no cards, only a message appears.
  if (cards.length === 0) {
    return <p className="empty">This deck is empty. Write its first card below!</p>
  }

  const card = cards[index]
  const mark = marks[card.id] // 'known', 'learning' or undefined
  // Not state: worked out from the props on every render.
  const known = cards.filter((c) => marks[c.id] === 'known').length

  function answer(value) {
    onMark(card.id, value)
    // Move on if there is another card.
    if (index < cards.length - 1) setIndex(index + 1)
  }

  function shuffleCards() {
    onShuffle()
    setIndex(0)
  }

  return (
    <section className="study">
      <ProgressBar known={known} total={cards.length} />
      <p className="study__counter">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        {mark && <span className={`badge badge--${mark}`}>{mark === 'known' ? 'Known' : 'Learning'}</span>}
      </p>
      <Flashcard key={card.id} card={card} />
      <div className="study__answer">
        <button type="button" onClick={() => answer('learning')}>
          Not yet
        </button>
        <button type="button" className="button--primary" onClick={() => answer('known')}>
          I know it
        </button>
      </div>
      <div className="study__nav">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Previous
        </button>
        <button type="button" onClick={() => setIndex(index + 1)} disabled={index === cards.length - 1}>
          Next →
        </button>
      </div>
      <div className="study__tools">
        <button type="button" onClick={shuffleCards}>
          Shuffle
        </button>
      </div>
    </section>
  )
}

export default Study
```

:::check Check
Click "Shuffle": the counter jumps back to "Card 1 of 8", and (almost always) a different card is in front. Page
through: the order is different, but every card is there, and the "Known" badges moved along with their cards.
Shuffle a few more times: you get a different order every time.
:::

:::mistake Common mistake
`shuffle(deck.cards)`, then `setActiveCards(deck.cards)`. The order stays the same, you just jump back to the first
card: `shuffle` does not touch the original array, it **returns** a new, shuffled one. Pass its result on:
`setActiveCards(shuffle(deck.cards))`.
:::

:::try Task
Make a "Reverse order" button as well. Careful: the arrays' `reverse()` does not make a copy, it reverses the array in
place, so copy first: `[...deck.cards].reverse()`.
:::

### Saving: useLocalStorage

Reload the page: your own deck is gone, and so are the marks and the shuffled order. State only lives as long as the
page is open. In lesson 2 you saved the chosen theme in the browser's [[localStorage]], and the `useDarkMode` hook took
care of it: it read it at the start and saved every change. Now we have three kinds of data to handle like this (the
decks, the id of the chosen deck and the marks), so we write a general [[custom hook]] that can save anything:
`useLocalStorage`. We will use it just like `useState`, only it also gets a key: the name it saves the value under.

`localStorage` can only store strings, but we want to save arrays and objects. [[JSON]] does the conversion: it is a
text format that looks like JavaScript's arrays and objects. `JSON.stringify(value)` turns a value into a string, and
`JSON.parse(text)` turns it back. Create the `src/useLocalStorage.js` file:

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

You know every piece of it from lesson 2; it just got more general:

- `useState` gets a [[lazy initial value|lazy initial state]], `() => readSaved(key, startValue)`: we read the storage
  only once, on the first render. With nothing saved (`null`), we start with `startValue`.
- `try … catch` now protects against two problems: storage that is switched off, and a broken save, which would make
  `JSON.parse` throw an error.
- The effect saves the value after every change. `key` is in the dependency array too, because the effect uses it.
- The hook returns exactly what `useState` does: an array of two, the value and the setter. That is why you can unpack
  it the same way: `const [decks, setDecks] = useLocalStorage(…)`.

In `App`, every `useState` is replaced with `useLocalStorage`, each with a key. `useState` is no longer needed here, so
its import can go. Here is the whole of `src/App.jsx` as it looks at the end of the intermediate level:

```jsx file=src/App.jsx mark=2,15-17,19-20,48
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import useLocalStorage from './useLocalStorage.js'
import { shuffle } from './shuffle.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import CardForm from './components/CardForm.jsx'
import './App.css'

const START_DECKS = [
  { id: 'react', name: 'React basics', cards: REACT_CARDS },
  { id: 'space', name: 'Space quiz', cards: SPACE_CARDS },
]

function App() {
  const [decks, setDecks] = useLocalStorage('flashcards-decks', START_DECKS)
  const [activeId, setActiveId] = useLocalStorage('flashcards-active', START_DECKS[0].id)
  const [marks, setMarks] = useLocalStorage('flashcards-marks', {})

  // If the deck with the saved id is missing for some reason, we show the first one.
  const deck = decks.find((d) => d.id === activeId) || decks[0]

  function createDeck(name) {
    const newDeck = { id: crypto.randomUUID(), name, cards: [] }
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  // Replaces the cards of the active deck; the other decks stay as they are.
  function setActiveCards(cards) {
    setDecks(decks.map((d) => (d.id === deck.id ? { ...d, cards } : d)))
  }

  function addCard(question, answer) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer }])
  }

  function shuffleDeck() {
    setActiveCards(shuffle(deck.cards))
  }

  function markCard(cardId, value) {
    setMarks({ ...marks, [cardId]: value })
  }

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <DeckPicker decks={decks} activeId={deck.id} onSelect={setActiveId} onCreate={createDeck} />
      {/* Thanks to the key, a new Study is born when the deck changes, and it starts with the first card. */}
      <Study key={deck.id} cards={deck.cards} marks={marks} onMark={markCard} onShuffle={shuffleDeck} />
      <CardForm onAdd={addCard} />
    </main>
  )
}

export default App
```

`|| decks[0]` is a precaution: if the saved id points to a deck that is not there (say, because someone fiddled with the
storage by hand), `find` would return `undefined`, and the page would crash. In that case `||` gives the first deck
instead. That is also why `DeckPicker` now gets `deck.id`: it should mark the deck you actually see.

:::check Check
Create a deck with a card, mark a few React cards, shuffle the space quiz, then reload the page (++F5++): everything is
where you left it, and the same deck is chosen. In the developer tools, under Application → Local storage →
`http://localhost:5173`, you find the three keys (`flashcards-decks`, `flashcards-active`, `flashcards-marks`) and see
what they look like as text. That completes the intermediate level: commit it!
:::

:::mistake Common mistake
`localStorage.setItem(key, value)`, without `JSON.stringify`. The storage then turns the array into a string by itself,
and you get `'[object Object],[object Object]'`. On reload, `JSON.parse` chokes on it, `catch` returns the starting
value, and all your own decks are gone.
:::

:::concept A clean slate
If you want to start over, delete the save: in the Application panel, right-click the `http://localhost:5173` row →
Clear, or type `localStorage.clear()` in the console, then reload the page. The same helps when the app behaves oddly
after an experiment went wrong.
:::

## Advanced level {level=3}

### Harder cards come back more often

When you have got a card right five times in a row, it is a waste to bring it up in every round; when you keep getting
another one wrong, you should see that one more often. This is the idea of [[spaced repetition]]: what you already
know comes up less and less often. Its simplest form is the [[Leitner system]], which works with paper cards too:

- There are three boxes. Every new card starts in box 1.
- If you knew the answer, the card moves one box further (up to box 3). If you did not, it goes back to box 1.
- The cards in box 1 come up in every round, those in box 2 in every second round, those in box 3 only in every fourth.

For every card, the program remembers two numbers: which box it is in (`box`), and in which round it is due again
(`due`). A card comes up when its `due` is no more than the round we are in. This logic knows nothing about React, so it
goes into a file of its own. Create the `src/leitner.js` file:

```js file=src/leitner.js
// Per box: every how many rounds a card comes up.
const INTERVALS = { 1: 1, 2: 2, 3: 4 }

// A new card starts in box 1 and is due straight away.
const NEW_CARD = { box: 1, due: 0 }

// Where is the card? If you never answered it, it is a new card.
export function getEntry(progress, cardId) {
  return progress[cardId] || NEW_CARD
}

// Is it due in this round?
export function isDue(entry, round) {
  return entry.due <= round
}

// You knew it: it moves one box further. You did not: back to box 1.
export function nextEntry(entry, round, knew) {
  const box = knew ? Math.min(entry.box + 1, 3) : 1
  return { box, due: round + INTERVALS[box] }
}
```

An example: in round 5 you knew the answer of a card in box 2. The card moves to box 3, and its `due` becomes
`5 + 4 = 9`: you see it again in round 9. Had you not known it, it would go to box 1 with `due: 6`, so it would come
back in the very next round. Because `due` always ends up bigger than the current round, a card you answered does not
come up again in this round.

From now on `Study` does not show the whole deck, only the cards that are due in this round. This is the `queue`,
another derived value. When it runs out, the round is over, and a summary appears with a "Next round" button. Here is
the whole new `src/components/Study.jsx`:

```jsx file=src/components/Study.jsx mark=2,6,9-10,14,18,23,29-30,37-40,42-56,58-59,61-66,73,75,79,82,90
import { useEffect, useState } from 'react'
import { getEntry, isDue } from '../leitner.js'
import Flashcard from './Flashcard.jsx'
import ProgressBar from './ProgressBar.jsx'

function Study({ cards, progress, round, onAnswer, onNextRound, onShuffle }) {
  const [index, setIndex] = useState(0)

  // Only the cards due in this round come up, in the order of the deck.
  const queue = cards.filter((card) => isDue(getEntry(progress, card.id), round))

  // Keyboard shortcuts: ← and → page through the cards.
  useEffect(() => {
    if (queue.length === 0) return
    function onKeyDown(event) {
      // While you type, the arrows belong to the text field.
      if (event.target.matches('input, textarea')) return
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, queue.length - 1))
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [queue.length])

  if (cards.length === 0) {
    return <p className="empty">This deck is empty. Write its first card below!</p>
  }

  // You know a card once it has moved on from box 1 at least once.
  const known = cards.filter((card) => getEntry(progress, card.id).box > 1).length

  function shuffleCards() {
    onShuffle()
    setIndex(0)
  }

  function nextRound() {
    onNextRound()
    setIndex(0)
  }

  // The cards of the round have run out: a summary.
  if (queue.length === 0) {
    return (
      <section className="study">
        <ProgressBar known={known} total={cards.length} />
        <div className="summary" role="status">
          <h2>Round complete</h2>
          <p>No more cards in this round. The ones you missed come back in the next round, the ones you knew only later.</p>
          <button type="button" className="button--primary" onClick={nextRound}>
            Next round
          </button>
        </div>
      </section>
    )
  }

  const card = queue[index]
  const entry = getEntry(progress, card.id)

  function answer(knew) {
    onAnswer(card.id, knew)
    // The answered card leaves the round, and the next one slides into its place.
    // If it was the last one, we step back by one.
    setIndex(Math.max(Math.min(index, queue.length - 2), 0))
  }

  return (
    <section className="study">
      <ProgressBar known={known} total={cards.length} />
      <p className="study__counter">
        <span>
          Round {round} · card {index + 1} of {queue.length}
        </span>
        <span className="badge badge--box">Box {entry.box}</span>
      </p>
      <Flashcard key={card.id} card={card} />
      <div className="study__answer">
        <button type="button" onClick={() => answer(false)}>
          Not yet
        </button>
        <button type="button" className="button--primary" onClick={() => answer(true)}>
          I know it
        </button>
      </div>
      <div className="study__nav">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Previous
        </button>
        <button type="button" onClick={() => setIndex(index + 1)} disabled={index === queue.length - 1}>
          Next →
        </button>
      </div>
      <div className="study__tools">
        <button type="button" onClick={shuffleCards}>
          Shuffle
        </button>
      </div>
    </section>
  )
}

export default Study
```

- `queue` keeps only the due cards of the deck. We work it out again on every render, so when you answer a card, it
  drops out by itself.
- From now on the index steps through `queue`, not through the whole deck, and the keys follow it.
- `answer` no longer moves on, because the answered card leaves the queue, and the next one slides into its place by
  itself. But if you answered the last card of the queue, the index would stick out of the shorter queue:
  `Math.min(index, queue.length - 2)` then steps back by one (`queue.length - 2` is the last place of the shorter
  queue), and `Math.max(…, 0)` keeps it from going below 0.
- The buttons no longer give `answer` a string, but `true` or `false`: whether you knew it.

In `App`, two new saved values take the place of the marks (`marks`): `progress` (the boxes and due rounds of the
cards, by card id) and `round` (which round we are in). Here is the whole of `src/App.jsx`:

```jsx file=src/App.jsx mark=4,18-19,43-45,52-60
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import useLocalStorage from './useLocalStorage.js'
import { shuffle } from './shuffle.js'
import { getEntry, nextEntry } from './leitner.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import CardForm from './components/CardForm.jsx'
import './App.css'

const START_DECKS = [
  { id: 'react', name: 'React basics', cards: REACT_CARDS },
  { id: 'space', name: 'Space quiz', cards: SPACE_CARDS },
]

function App() {
  const [decks, setDecks] = useLocalStorage('flashcards-decks', START_DECKS)
  const [activeId, setActiveId] = useLocalStorage('flashcards-active', START_DECKS[0].id)
  const [progress, setProgress] = useLocalStorage('flashcards-progress', {})
  const [round, setRound] = useLocalStorage('flashcards-round', 1)

  // If the deck with the saved id is missing for some reason, we show the first one.
  const deck = decks.find((d) => d.id === activeId) || decks[0]

  function createDeck(name) {
    const newDeck = { id: crypto.randomUUID(), name, cards: [] }
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  // Replaces the cards of the active deck; the other decks stay as they are.
  function setActiveCards(cards) {
    setDecks(decks.map((d) => (d.id === deck.id ? { ...d, cards } : d)))
  }

  function addCard(question, answer) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer }])
  }

  function shuffleDeck() {
    setActiveCards(shuffle(deck.cards))
  }

  function answerCard(cardId, knew) {
    setProgress({ ...progress, [cardId]: nextEntry(getEntry(progress, cardId), round, knew) })
  }

  return (
    <main className="app">
      <h1>Flashcards</h1>
      <DeckPicker decks={decks} activeId={deck.id} onSelect={setActiveId} onCreate={createDeck} />
      {/* Thanks to the key, a new Study is born when the deck changes, and it starts with the first card. */}
      <Study
        key={deck.id}
        cards={deck.cards}
        progress={progress}
        round={round}
        onAnswer={answerCard}
        onNextRound={() => setRound(round + 1)}
        onShuffle={shuffleDeck}
      />
      <CardForm onAdd={addCard} />
    </main>
  )
}

export default App
```

`round` is shared by all the decks: it works like a calendar in which a round stands for a day. Nothing uses the old
`flashcards-marks` key any more; you can delete it in the Application panel.

:::check Check
Choose React basics. The counter says "Round 1 · card 1 of 8", with "Box 1" next to it. Answer "Not yet" to the first
card and "I know it" to the other seven. "Round complete" appears, and the bar says "Known: 7 / 8". Click "Next round":
round 2 has only one card, the one you did not know. Answer "I know it" and start round 3: now the other seven cards
come back, all with the "Box 2" badge.
:::

:::mistake Common mistake
If `answer` keeps moving on as in the intermediate level (`setIndex(index + 1)`), every answer skips a card: the
answered card drops out of the queue, and you jump over the one that slid into its place. After the fourth answer the
index sticks out of the shortened queue, `card` becomes `undefined`, and the page crashes.
:::

:::concept Days instead of rounds
Real study apps (the best known is Anki) count in days, not rounds: a card that moved to box 3 today is asked again in
a week. Our `round` number plays the same part, only you do not have to wait for days to try it out. If you like,
change it: make `due` a date, and compare it with `Date.now()` (the current time, in milliseconds).
:::

:::try Task
Have four boxes: in `nextEntry`, change the `3` to `4`, and give `INTERVALS` a fourth item, for example `4: 8`. A card
then only reaches the eight-round box after the third right answer in a row.
:::

### Pictures on the cards

Sometimes a picture is the question itself: a flag, a bird, a painting. Let's have an optional picture on the front of
the cards, chosen from your own computer.

An `<input type="file">` [[file field|file input]] opens the computer's file picker. When you have chosen, in the
`onChange` event `event.target.files` is a list of the chosen files, and the first is `files[0]`. This is a [[File]]
object: the file's name, size and content. A file field cannot be controlled from state like text fields: for security
reasons, a page may not write a file name into it, only read what the user chose.

Where do we keep the picture? The decks are in `localStorage`, which only stores strings, roughly 5 MB per site. A phone
photo can be half of that. So we shrink the picture first, then turn it into a string:

1. [[createImageBitmap]] reads the file and makes a drawable picture from it. This takes time, so it returns a
   [[Promise]], which we wait for with `await`, like the clipboard in lesson 3.
2. A [[canvas]] is a drawing sheet that JavaScript can draw on; in lesson 5 you drew the emoji logo on one. We make it
   big enough for the picture's longer side to be 480 pixels at most, and paint the picture onto it.
3. `canvas.toDataURL('image/jpeg', 0.8)` (the same function that made the PNG with the logo in lesson 5) makes a
   [[data URL]] from the canvas: a long string starting with `data:image/jpeg;base64,` that holds the whole picture. An
   `<img src={…}>` shows it just like the address of a picture file, and as a string it fits into `localStorage` too.
   `0.8` is the JPEG quality (between 0 and 1): this way a picture is about 20–60 kB.

Create the `src/images.js` file:

```js file=src/images.js
// The picture's longer side will be this many pixels at most.
const MAX_SIZE = 480

// Shrinks the picture and returns it as a string (a data URL), so it fits into localStorage.
export async function readImage(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  // A white background: JPEG knows nothing about transparency.
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.8)
}
```

In lesson 5 the qrcode library made the canvas for you; here `document.createElement('canvas')` makes an empty one, the
way lesson 5 made its download link. It never goes on the page: we only draw on it, then read the picture back out.

`scale` is how much we shrink: for a picture 1200 pixels wide, `480 / 1200 = 0.4`. Thanks to `Math.min(1, …)` we never
enlarge smaller pictures. `getContext('2d')` gives the canvas's drawing tools: `fillRect` fills a rectangle, and
`drawImage` paints the picture at the given size.

The form gets a file field, a preview, and an error message for when the file is not a picture. Here is the whole of
`src/components/CardForm.jsx`:

```jsx file=src/components/CardForm.jsx mark=2,7-8,10-20,26,29-32,46-51
import { useState } from 'react'
import { readImage } from '../images.js'

function CardForm({ onAdd }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [image, setImage] = useState('')
  const [error, setError] = useState('')

  async function chooseImage(event) {
    const file = event.target.files[0]
    if (!file) return
    try {
      setImage(await readImage(file))
      setError('')
    } catch {
      setImage('')
      setError('This file could not be read as a picture.')
    }
  }

  function submit(event) {
    event.preventDefault()
    // An empty question or answer (or one made only of spaces) is not saved.
    if (question.trim() === '' || answer.trim() === '') return
    onAdd(question.trim(), answer.trim(), image)
    setQuestion('')
    setAnswer('')
    setImage('')
    setError('')
    // State cannot empty a file field: the form's reset() function does it.
    event.target.reset()
  }

  return (
    <form className="card-form" onSubmit={submit}>
      <h2>A new card for this deck</h2>
      <label>
        Question
        <textarea rows={2} value={question} onChange={(event) => setQuestion(event.target.value)} />
      </label>
      <label>
        Answer
        <textarea rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} />
      </label>
      <label>
        Picture for the question (optional)
        <input type="file" accept="image/*" onChange={chooseImage} />
      </label>
      {image && <img className="card-form__preview" src={image} alt="Picture of the new card" />}
      {error && <p className="message message--error">{error}</p>}
      <button type="submit" className="button--primary">
        Add card
      </button>
    </form>
  )
}

export default CardForm
```

- `accept="image/*"` asks the file picker to offer only pictures.
- `chooseImage` is an [[async function]]: it waits for the shrinking, then stores the result. If the file cannot be
  read as a picture, `readImage` throws an error, and `catch` shows the message.
- On submit, `event.target` is the form itself, and `reset()` sets all its fields back, the file field included.
  `setError('')` clears an earlier error message as well.

`App` puts the picture on the card: in `src/App.jsx`, `addCard` gets a third parameter. Only this function changes:

```jsx file=src/App.jsx mark=1-2
  function addCard(question, answer, image) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer, image }])
  }
```

Finally, the front of the card draws the picture when there is one. Here is the whole of `src/components/Flashcard.jsx`:

```jsx file=src/components/Flashcard.jsx mark=16
import { useState } from 'react'
import './Flashcard.css'

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      className={flipped ? 'card is-flipped' : 'card'}
      onClick={() => setFlipped(!flipped)}
    >
      <span className="card__inner">
        <span className="card__face card__front" aria-hidden={flipped}>
          <span className="card__label">Question</span>
          {card.image && <img className="card__image" src={card.image} alt="" />}
          <span className="card__text">{card.question}</span>
          <span className="card__hint">Click to flip</span>
        </span>
        <span className="card__face card__back" aria-hidden={!flipped}>
          <span className="card__label">Answer</span>
          <span className="card__text">{card.answer}</span>
        </span>
      </span>
    </button>
  )
}

export default Flashcard
```

The older cards have no `image` field; for them `card.image` is `undefined`, and because of `&&` nothing appears.
`alt=""` (an empty alternative text) says that the picture only adds to the question, and a screen reader may skip it:
the question's text says what to answer.

:::check Check
Create a "Flags" deck, write a question ("Which country's flag is this?") and an answer, and in the "Picture for the
question" field choose a picture from your computer: its preview appears in the form at once. After "Add card", the
picture is on the front of the card, above the question, and the file field is empty again. Reload the page: the
picture is still there. If you choose a file that is not a picture (say a PDF, with the "All files" setting), a red
error message appears.
:::

:::mistake Common mistake
Saving the picture without shrinking it, for example by turning the whole file into a data URL with a `FileReader`.
After two or three phone photos `localStorage` is full, the `catch` branch of `useLocalStorage` silently swallows the
error, and on reload the latest changes are gone. Nothing shows up in the console. If a picture "gets lost", type
`localStorage.getItem('flashcards-decks').length` into the console: if it is around 5 million characters, the storage
is full.
:::

:::try Task
`alt=""` is only right if the picture is just decoration. If the picture is the question itself on a card ("What bird
is this?"), people using a screen reader need to be told what is on it. Add a "Description of the picture" field to the
form, save it on the card as `imageAlt`, and have `Flashcard` pass it on with `alt={card.imageAlt || ''}` (older cards
without a description keep the empty `alt`).
:::

### Downloading and loading

Right now your decks only live in this browser. If you change computers, or clear the browser's data, they are lost.
Let's save them to a file and be able to load them back. The format is obvious: [[JSON]], the same text that goes into
`localStorage`.

**Downloading.** In lesson 5 you downloaded the QR code as an SVG file with `downloadFile`. A deck is downloaded
exactly the same way, only the text in the file is JSON. A quick reminder of the three pieces:

1. A [[Blob]]: file content kept in the browser's memory, here the JSON text, with the type `application/json`.
2. An [[object URL]]: `URL.createObjectURL(blob)` gives the Blob a temporary address, in the form
   `blob:http://localhost:5173/…`.
3. A link with a `download` attribute: when it is clicked, the browser does not open the address but downloads it,
   under the given name. We create the link in code, put it on the page for a moment, click it with `link.click()` and
   take it out again.

At the end, `URL.revokeObjectURL` frees the temporary address, as in lesson 5: we wait a second so the download has time
to start.

**Loading.** `file.text()` gives the text of the chosen [[File]] (this is a Promise too), and `JSON.parse` turns it back
into an object. But the user can choose any file at all: another program's JSON, a deck broken by hand, anything.
Before we believe it is a deck, we check:

- [[typeof]] tells the type of a value as a string: `typeof 'apple'` is `'string'`, `typeof 42` is `'number'`.
- `Array.isArray(x)` tells whether `x` is an array.
- We keep only the cards that have a text question and answer, and each gets a new id, just like the deck. This way a
  file loaded twice does not clash with the cards already there.
- We only accept pictures that start with `data:image/`. A foreign file could hold the address of a picture on another
  website, and then that website would see every time you study the card.

The shared links of the next step use the same check, so it goes into a function of its own, `toDeck`, which we export.
If the file is not a deck, `throw new Error(…)` throws an error (like `useTheme` in lesson 2), and the caller's `catch`
catches it. Create the `src/deckFiles.js` file:

```js file=src/deckFiles.js
// Downloads the deck as a JSON file.
export function downloadDeck(deck) {
  const json = JSON.stringify({ name: deck.name, cards: deck.cards }, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${deck.name}.json`
  // Some browsers only start the download for a link that is on the page, so we add it for a moment.
  document.body.append(link)
  link.click()
  link.remove()
  // The temporary address takes up memory: once the download has started, we free it.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// A deck from data that came from outside (a file or a link): checked, and given fresh ids.
export function toDeck(data) {
  if (!data || typeof data.name !== 'string' || !Array.isArray(data.cards)) {
    throw new Error('This is not a deck.')
  }
  const cards = data.cards
    .filter((card) => card && typeof card.question === 'string' && typeof card.answer === 'string')
    .map((card) => ({
      id: crypto.randomUUID(),
      question: card.question,
      answer: card.answer,
      // Only pictures stored in the file itself are accepted, none loaded from another website.
      image: typeof card.image === 'string' && card.image.startsWith('data:image/') ? card.image : '',
    }))
  return { id: crypto.randomUUID(), name: data.name, cards }
}

// Reads the chosen file and makes a deck from it.
export async function readDeckFile(file) {
  const text = await file.text()
  return toDeck(JSON.parse(text))
}
```

The third parameter of `JSON.stringify(…, null, 2)` is the indentation: this way the file is neatly laid out, and people
can read it too. In the `filter(…).map(…)` chain, `map` only gets the good cards. `startsWith` tells whether a string
starts with the given text. In `.map((card) => ({ … }))`, the round brackets around the object are needed because
without them the arrow function would take the curly brace for its own body, not for an object.

The buttons go into a new component. The load button is really a `<label>` with a hidden file field inside: clicking
the label opens the file picker, and this way the button looks just like the others. The `visually-hidden` class only
hides the field from the eyes; you can still reach it with the keyboard. Create the `src/components/DeckTools.jsx`
file:

```jsx file=src/components/DeckTools.jsx
import { useState } from 'react'
import { downloadDeck, readDeckFile } from '../deckFiles.js'

function DeckTools({ deck, onImport }) {
  const [message, setMessage] = useState(null) // { text, error }

  async function importFile(event) {
    const file = event.target.files[0]
    // We empty the field, so the same file can be loaded again later.
    event.target.value = ''
    if (!file) return
    try {
      const newDeck = await readDeckFile(file)
      onImport(newDeck)
      setMessage({ text: `Loaded: ${newDeck.name} (cards: ${newDeck.cards.length})`, error: false })
    } catch {
      setMessage({ text: 'This file is not a deck. Choose a JSON file that this app saved.', error: true })
    }
  }

  return (
    <section className="deck-tools">
      <h2>Save and share</h2>
      <div className="deck-tools__buttons">
        <button type="button" onClick={() => downloadDeck(deck)}>
          Download deck
        </button>
        <label className="file-button">
          Load deck
          <input type="file" accept=".json,application/json" className="visually-hidden" onChange={importFile} />
        </label>
      </div>
      {message && (
        <p className={message.error ? 'message message--error' : 'message'} role="status">
          {message.text}
        </p>
      )}
    </section>
  )
}

export default DeckTools
```

The message is an object holding its text and whether it is an error: this way both fit into one state, and errors are
red. Because of `role="status"`, a screen reader reads it out.

In `App`, a loaded deck joins the others just like a newly created one, so we put the shared part into an `addDeck`
function, and `createDeck` calls it too. The changes in `src/App.jsx` (where the comments starting with `…` stand,
everything stays):

```jsx file=src/App.jsx mark=1,4-8,10-12,19
import DeckTools from './components/DeckTools.jsx'
// … the other imports, START_DECKS and the start of App, as before

  // Adds a ready-made deck (from a file or a link) and chooses it.
  function addDeck(newDeck) {
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  function createDeck(name) {
    addDeck({ id: crypto.randomUUID(), name, cards: [] })
  }

  // … setActiveCards, addCard, shuffleDeck and answerCard, as before

  return (
    <main className="app">
      {/* … the title, the DeckPicker, the Study and the CardForm, as before … */}
      <DeckTools deck={deck} onImport={addDeck} />
    </main>
  )
}
```

:::check Check
At the bottom of the page, a "Save and share" section with two buttons. Choose React basics and click "Download deck": a
`React basics.json` lands in your Downloads folder; open it in the editor and read it. Now click "Load deck" and choose
this file: a second "React basics 8" button appears, already chosen, and at the bottom of the page it says "Loaded:
React basics (cards: 8)". If you choose another JSON file, for example the project's `package.json`, a red message
appears.
:::

:::mistake Common mistake
Leaving out `event.target.value = ''`. Then you cannot load the same file a second time: the field's value does not
change, so the browser sends no new `change` event, and nothing happens.
:::

:::try Try it
Open the downloaded JSON in the editor, write a new card into it by hand (mind the commas and the quotes), and save it
under another name. Load it: there is the new card. If you broke the JSON, the red message tells you.
:::

### A shareable link

A file has to be sent, downloaded and loaded. A link would be simpler: whoever opens it gets the deck at once. This
works without a server, just like your own story in lesson 4: the deck itself travels inside the link, in the part of
the address after the `#`. The browser never sends this part (the [[hash|URL hash]]) to the server.

The JSON text has characters (spaces, quotes, accented letters) that may not stand in an address. `encodeURIComponent`,
which you know from lesson 4, encodes them ([[URL encoding]]): a space becomes `%20`, an `á` becomes `%C3%A1`, and
`decodeURIComponent` turns the text back. We leave out the pictures: a single picture would make the link tens of
thousands of characters longer.

When a deck arrives in the link, the app first asks whether you want it. Whether you say yes or no, we then take the
deck out of the address, so a reload does not ask again. That is what
[[window.history.replaceState|history.replaceState]] is for: it swaps the address in the address bar without reloading
the page and without adding a new entry to the history. Create the `src/share.js` file:

```js file=src/share.js
import { toDeck } from './deckFiles.js'

const PREFIX = '#deck='

// The deck packed into a link. Pictures are left out: with them, the link would be tens of thousands of characters long.
export function makeShareLink(deck) {
  const data = {
    name: deck.name,
    cards: deck.cards.map((card) => ({ question: card.question, answer: card.answer })),
  }
  return window.location.origin + window.location.pathname + PREFIX + encodeURIComponent(JSON.stringify(data))
}

// The deck that arrived in the address, or null if there is none (or it is broken).
export function readSharedDeck() {
  const hash = window.location.hash
  if (!hash.startsWith(PREFIX)) return null
  try {
    return toDeck(JSON.parse(decodeURIComponent(hash.slice(PREFIX.length))))
  } catch {
    return null
  }
}

// Takes the deck out of the address, so a reload does not ask about it again.
export function clearSharedDeck() {
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}
```

`window.location` is the page's address taken apart: `origin` is `http://localhost:5173`, `pathname` is `/`, `hash` the
end of the address starting with `#` (that is why `PREFIX` starts with `#` too), `search` the part starting with `?`
(empty now). `slice(PREFIX.length)` cuts `#deck=` off the start of the hash. `readSharedDeck` swallows every error and
returns `null`: this way a half-copied or broken link does not bring the app down, it simply offers nothing.

The offer is a small bar at the top of the page. Create the `src/components/SharedDeck.jsx` file:

```jsx file=src/components/SharedDeck.jsx
function SharedDeck({ deck, onAccept, onDismiss }) {
  return (
    <section className="shared" aria-label="Shared deck">
      <p>
        Someone shared a deck with you: <strong>{deck.name}</strong> (cards: {deck.cards.length}).
      </p>
      <div className="shared__buttons">
        <button type="button" className="button--primary" onClick={onAccept}>
          Add it
        </button>
        <button type="button" onClick={onDismiss}>
          No thanks
        </button>
      </div>
    </section>
  )
}

export default SharedDeck
```

`DeckTools` gets a third button. The link goes to the clipboard with the Clipboard API from lesson 3. Here is the whole
of `src/components/DeckTools.jsx`:

```jsx file=src/components/DeckTools.jsx mark=3,22-29,42-44
import { useState } from 'react'
import { downloadDeck, readDeckFile } from '../deckFiles.js'
import { makeShareLink } from '../share.js'

function DeckTools({ deck, onImport }) {
  const [message, setMessage] = useState(null) // { text, error }

  async function importFile(event) {
    const file = event.target.files[0]
    // We empty the field, so the same file can be loaded again later.
    event.target.value = ''
    if (!file) return
    try {
      const newDeck = await readDeckFile(file)
      onImport(newDeck)
      setMessage({ text: `Loaded: ${newDeck.name} (cards: ${newDeck.cards.length})`, error: false })
    } catch {
      setMessage({ text: 'This file is not a deck. Choose a JSON file that this app saved.', error: true })
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(makeShareLink(deck))
      setMessage({ text: 'The link is on the clipboard: send it to whoever you want to share the deck with.', error: false })
    } catch {
      setMessage({ text: 'Could not copy the link to the clipboard.', error: true })
    }
  }

  return (
    <section className="deck-tools">
      <h2>Save and share</h2>
      <div className="deck-tools__buttons">
        <button type="button" onClick={() => downloadDeck(deck)}>
          Download deck
        </button>
        <label className="file-button">
          Load deck
          <input type="file" accept=".json,application/json" className="visually-hidden" onChange={importFile} />
        </label>
        <button type="button" onClick={copyLink}>
          Copy link
        </button>
      </div>
      {message && (
        <p className={message.error ? 'message message--error' : 'message'} role="status">
          {message.text}
        </p>
      )}
    </section>
  )
}

export default DeckTools
```

At the start, `App` looks at whether a deck arrived in the address. The offered deck does not need saving, since it
comes from the address, so this is an ordinary `useState`, and the `useState` import comes back. Here is the whole of
`src/App.jsx` as it looks at the end of the lesson:

```jsx file=src/App.jsx mark=1,6,11,24,56-65,70
import { useState } from 'react'
import { REACT_CARDS, SPACE_CARDS } from './cards.js'
import useLocalStorage from './useLocalStorage.js'
import { shuffle } from './shuffle.js'
import { getEntry, nextEntry } from './leitner.js'
import { clearSharedDeck, readSharedDeck } from './share.js'
import DeckPicker from './components/DeckPicker.jsx'
import Study from './components/Study.jsx'
import CardForm from './components/CardForm.jsx'
import DeckTools from './components/DeckTools.jsx'
import SharedDeck from './components/SharedDeck.jsx'
import './App.css'

const START_DECKS = [
  { id: 'react', name: 'React basics', cards: REACT_CARDS },
  { id: 'space', name: 'Space quiz', cards: SPACE_CARDS },
]

function App() {
  const [decks, setDecks] = useLocalStorage('flashcards-decks', START_DECKS)
  const [activeId, setActiveId] = useLocalStorage('flashcards-active', START_DECKS[0].id)
  const [progress, setProgress] = useLocalStorage('flashcards-progress', {})
  const [round, setRound] = useLocalStorage('flashcards-round', 1)
  const [shared, setShared] = useState(readSharedDeck)

  // If the deck with the saved id is missing for some reason, we show the first one.
  const deck = decks.find((d) => d.id === activeId) || decks[0]

  // Adds a ready-made deck (from a file or a link) and chooses it.
  function addDeck(newDeck) {
    setDecks([...decks, newDeck])
    setActiveId(newDeck.id)
  }

  function createDeck(name) {
    addDeck({ id: crypto.randomUUID(), name, cards: [] })
  }

  // Replaces the cards of the active deck; the other decks stay as they are.
  function setActiveCards(cards) {
    setDecks(decks.map((d) => (d.id === deck.id ? { ...d, cards } : d)))
  }

  function addCard(question, answer, image) {
    setActiveCards([...deck.cards, { id: crypto.randomUUID(), question, answer, image }])
  }

  function shuffleDeck() {
    setActiveCards(shuffle(deck.cards))
  }

  function answerCard(cardId, knew) {
    setProgress({ ...progress, [cardId]: nextEntry(getEntry(progress, cardId), round, knew) })
  }

  function acceptShared() {
    addDeck(shared)
    setShared(null)
    clearSharedDeck()
  }

  function dismissShared() {
    setShared(null)
    clearSharedDeck()
  }

  return (
    <main className="app">
      <h1>Flashcards</h1>
      {shared && <SharedDeck deck={shared} onAccept={acceptShared} onDismiss={dismissShared} />}
      <DeckPicker decks={decks} activeId={deck.id} onSelect={setActiveId} onCreate={createDeck} />
      {/* Thanks to the key, a new Study is born when the deck changes, and it starts with the first card. */}
      <Study
        key={deck.id}
        cards={deck.cards}
        progress={progress}
        round={round}
        onAnswer={answerCard}
        onNextRound={() => setRound(round + 1)}
        onShuffle={shuffleDeck}
      />
      <CardForm onAdd={addCard} />
      <DeckTools deck={deck} onImport={addDeck} />
    </main>
  )
}

export default App
```

`useState(readSharedDeck)` is a lazy initial value again: we look at the address only once, at the start. If there is
no deck in it, `shared` is `null`, and the bar does not appear.

:::check Check
Choose the space quiz and click "Copy link": "The link is on the clipboard". Open a new browser tab, paste it into the
address bar (++Ctrl++ + ++V++) and press ++Enter++. At the top of the page there is a bar with a turquoise border:
"Someone shared a deck with you: Space quiz (cards: 8)". After "Add it", a new "Space quiz 8" button appears, already
chosen, and the long `#deck=…` part disappears from the address bar. Congratulations, your flashcard app is finished:
commit it!
:::

:::mistake Common mistake
You paste the link into the same tab where the app is already open, and nothing happens. When only the part after the
`#` changes in an address, the browser does not reload the page, so `readSharedDeck` does not run again. Press ++F5++,
or open the link in a new tab, as the person you sent it to would.
:::

:::concept How long can a link be?
The link of the eight-card space quiz is about 1700 characters. Browsers accept much longer ones, but a chat app may
cut it off, and nobody wants to copy the link of a deck with hundreds of cards. That is why real apps save the deck on a
server and only put a short id into the link, like `…/deck/x7Kq2`. That takes a server; in the later lessons with APIs
we look at how a React app talks to one.
:::
