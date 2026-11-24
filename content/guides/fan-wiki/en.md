# What we build

A fan wiki for a cartoon: a grid of characters with their pictures, a page for every character, a search box, filters,
pages to browse, the episodes each character appears in, and entries that the fans write themselves. The cartoon is
The Huebloom Isles, made up for this course: floating islands that run on colour, where the Grey Drizzle, a drifting
fog, fades everything it touches. Its 40 characters, 12 places and 20 episodes come from the lesson's own REST API,
which runs right in your browser.

On the way you learn how a React app builds a list and a detail page from an API, how one address pattern
(`#/character/:id`) can show any character, how a search and filters turn into a request, and how paging works.

:::levels
- A grid of characters with picture and name, loaded from the API, with loading and error messages. | about 2 hours
- A page of its own for every character, a search that waits until you stop typing, filters for status and gender. | about 3 hours
- Paging, each character's episode list, the characters who live at the same place, and entries the fans can write and edit. | about 3 hours
:::

**Before you start you need:** the earlier lessons, above all lesson 14, "Currency Converter" (`fetch`, loading and
error states, `useFetch`), lesson 20, "Movie Search" (routing, `useDebounce`) and lesson 21, "Book Library" (`useFetch`
with the status code, `useLocalStorage`). Lesson 1's `useHashRoute` hook comes back too. Whatever we reuse is recapped in a few sentences, and everything new is explained step by step.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is in the course's repository, in the `lessons/23-fan-wiki/exercise` folder (the
"Exercise on GitHub" button above opens this folder on GitHub). You start the same way as in lesson 1, and its step 0
explains every command in detail. In short: open a terminal in your work folder, where the `rika-mentoring` repository
is, bring in the new lessons, then copy this lesson's `exercise` folder out of the repository as `huebloom-wiki`:

```shell
cd rika-mentoring
git pull        # brings the new lessons
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/23-fan-wiki/exercise huebloom-wiki
```

No repository yet? Run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the first three lines.
No git? On the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**,
and copy the `lessons/23-fan-wiki/exercise` folder out of it into your work folder as `huebloom-wiki`. You work in your
copy: the repository stays untouched, so `git pull` keeps working.

Open the `huebloom-wiki` folder in your editor, and type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads React, Vite and MSW
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white card in the middle of the page,
with the title "Fan Wiki" and one line under it: "The Huebloom Isles: a cartoon about floating islands that run on
colour." Nothing else yet: the characters are your job.
:::

Finally, make your copy a git repository with one commit, the starting point. `npm run dev` keeps the first terminal
busy, so open a second one in the editor, in the `huebloom-wiki` folder:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step that
works.

What is in the exercise:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React and APIs, not CSS, so you only use
  the class names the steps give you (`grid`, `card`, `status`, `filters`, `detail`…). Have a look inside anyway!
- `src/mocks/`: the wiki's API. The box below tells what it is.
- `src/main.jsx`: starts the API, then draws the page.
- `public/mockServiceWorker.js`: a helper script the API needs. Leave it as it is.

:::concept A pretend server in your browser
A real fan wiki gets its data from a server on the internet, through an [[API]]: a set of addresses where a program
can ask for data. This course uses no outside services, so the exercise brings its own server: `src/mocks` is a pretend
server, built with [[Mock Service Worker]] (MSW). MSW starts a [[service worker]], a small script that the browser runs
next to your page, and that can catch the page's requests and answer them itself.

`main.jsx` starts it before React draws anything (`await startMockApi(handlers)`). From then on, every
`fetch('/api/…')` of your page is answered by `src/mocks/handlers.js`, after a short wait, with a status code and data,
just like a real server would answer. Your code cannot tell the difference: if you ever switch to a real API, only the
address changes. The comment at the top of `handlers.js` lists every address the API knows; `universe.js` holds the
characters, places and episodes, and `avatars.js` draws the pictures in code.
:::

:::try Try it
Open the browser's console (++F12++ → **Console**), type this line and press ++Enter++:

```js
await fetch('/api/character?lang=en').then((response) => response.json())
```

An object appears with `info` and `results` in it. Click the small arrows to open them: the `results` array holds the
first 12 characters of the wiki.
:::

### The first request

Let's ask the API for the characters. The address is `/api/character?lang=en`:

- `/api` is where the API lives, and `/character` is the [[resource]] we want: the characters. In a [[REST API]] every
  kind of thing has its own address, an [[endpoint]]: `/api/character`, `/api/location`, `/api/episode`.
- The part after the `?` is a [[query parameter]]: extra information for the server, as `name=value` pairs. `lang=en`
  asks for English texts. (With `lang=hu` the species, the places and the episode titles come in Hungarian; the names
  stay as they are.)

[[fetch]] sends the request. You met it in lesson 14: the answer takes time, so `fetch` returns a [[Promise]], and in
an [[async function]] `await` waits for it. The answer comes in two parts. First the status code and the headers arrive,
then the body, the data itself: `response.json()` reads the body and turns the [[JSON]] text into JavaScript objects and
arrays. This takes time too, so it gets an `await` as well. The API answers with this shape (shortened, the `…` marks
what is left out):

```text
{
  "info": { "count": 40, "pages": 4, "next": "http://localhost:5173/api/character?lang=en&page=2", "prev": null },
  "results": [
    { "id": 1, "name": "Juno Plumewick", "status": "Bright", "species": "Peafolk", "image": "http://…/1.svg", … },
    { "id": 2, "name": "Captain Nimbus", … },
    …
  ]
}
```

`results` holds the characters, 12 at a time; `info` tells how many there are in all.

Where does the request go? Not in the middle of drawing: drawing only describes the screen, and every new drawing would
send a new request. Work outside drawing goes into [[useEffect]], and with an empty [[dependency array]] (`[]`) it runs
only once, after the first drawing. The effect's own function cannot be `async`: React expects it to return nothing, or
a cleanup function, but an async function always returns a Promise. So we write an async function inside it, and call it
straight away. Replace `src/App.jsx` with this:

```jsx file=src/App.jsx mark=1,5,7-14,20,23-27
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [characters, setCharacters] = useState([])

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/character?lang=en')
      const data = await response.json()
      setCharacters(data.results)
    }
    load()
  }, [])

  return (
    <main className="wiki">
      <header className="wiki__header">
        <h1>Fan Wiki</h1>
        <p>The characters of the Huebloom Isles, from the lesson’s own API.</p>
      </header>

      <ul>
        {characters.map((character) => (
          <li key={character.id}>{character.name}</li>
        ))}
      </ul>
    </main>
  )
}

export default App
```

`characters` starts as an empty array, so the first drawing shows an empty list. When the answer arrives,
`setCharacters` stores the 12 characters, and React draws the list again. `map` makes an `<li>` from each character,
with its `id` as the [[key]].

:::check Check
A list of 12 names appears under the header: Juno Plumewick, Captain Nimbus, Steepwell… Open the developer tools'
**Network** tab (++F12++ → **Network**), choose **Fetch/XHR**, and reload the page: the `character?lang=en` request is
in the list. Click it, then **Response**: this is the JSON the API sent.
:::

:::concept Why are there two requests?
In the Network tab you may see the request twice. In development, React's [[StrictMode]] (in `main.jsx`) puts every
component on the page, takes it off and puts it back again, so every effect runs twice. This helps catch effects that
do not clean up after themselves. The built page (`npm run build`) does it only once, and from step 3 on, the cleanup
cancels the extra request.
:::

:::mistake Common mistake
`const data = response.json()`, without `await`. Then `data` is a Promise, not the answer: `data.results` is
`undefined`, the page goes blank, and the console says "Cannot read properties of undefined (reading 'map')".
:::

### Cards with a picture

A wiki needs more than names: every character gets a card with a picture, the name, the status and the species. The
card gets a component of its own, and so does the list, so that `App` stays short.

First a small table of words. The API sends the status in English even with `lang=hu`, because it is not a text but a
fixed value that you can also filter by: `'Bright'` (full of colour), `'Faded'` (touched by the Grey Drizzle) or
`'unknown'`. We show it in our own words, and several components will need these words, so they get a file of their
own. Create `src/labels.js`:

```js file=src/labels.js
// The API sends these values in English. We show them in our own words.
export const STATUS_LABELS = {
  bright: 'Bright',
  faded: 'Faded',
  unknown: 'Unknown',
}
```

In English the words hardly change (only `unknown` gets a capital), but this way every word the visitor sees is in one
place, ready to be changed. Next, the card. Create a `components` folder inside `src`, with a `CharacterCard.jsx` file
in it:

```jsx file=src/components/CharacterCard.jsx mark=5,9,11-13
import { STATUS_LABELS } from '../labels.js'

function CharacterCard({ character }) {
  // 'Bright' → 'bright': the key for the labels and for the CSS class as well.
  const status = character.status.toLowerCase()

  return (
    <li className="card">
      <img className="card__image" src={character.image} alt="" width="300" height="300" loading="lazy" />
      <div className="card__body">
        <p className="card__name">{character.name}</p>
        <p className="card__meta">
          <span className={`status status--${status}`}>{STATUS_LABELS[status]}</span> · {character.species}
        </p>
      </div>
    </li>
  )
}

export default CharacterCard
```

- `toLowerCase()` turns `'Bright'` into `'bright'`. With it we look up the label: `STATUS_LABELS[status]` reads the
  value of the key whose name is in `status`. It goes into the class name too: `status status--bright` gets a green dot from
  `App.css`, `status--faded` a grey one.
- The picture's address comes from the API (`character.image`). The pretend server draws the picture in code, and it
  answers the `<img>` request as well.
- `alt=""` is on purpose: the name is right under the picture, so a screen reader would only read it out twice. `width`
  and `height` tell the browser the size before the picture arrives, so the page does not jump, and `loading="lazy"`
  loads pictures far down the page only when you scroll near them.

The list moves into `src/components/CharacterList.jsx`. The effect comes with it unchanged; the list draws a card for
each character:

```jsx file=src/components/CharacterList.jsx mark=2,4,17-21
import { useEffect, useState } from 'react'
import CharacterCard from './CharacterCard.jsx'

function CharacterList() {
  const [characters, setCharacters] = useState([])

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/character?lang=en')
      const data = await response.json()
      setCharacters(data.results)
    }
    load()
  }, [])

  return (
    <ul className="grid">
      {characters.map((character) => (
        <CharacterCard key={character.id} character={character} />
      ))}
    </ul>
  )
}

export default CharacterList
```

The `key` now goes on the `CharacterCard`, because that is the item `map` returns. `App` is left with the header and the
list:

```jsx file=src/App.jsx mark=1,12
import CharacterList from './components/CharacterList.jsx'
import './App.css'

function App() {
  return (
    <main className="wiki">
      <header className="wiki__header">
        <h1>Fan Wiki</h1>
        <p>The characters of the Huebloom Isles, from the lesson’s own API.</p>
      </header>

      <CharacterList />
    </main>
  )
}

export default App
```

:::check Check
12 cards in a grid: a picture, the name, a green dot with "Bright" and the species ("Peafolk", "Cloudwhale"…). Duke
Drabwell's status is "Unknown", with an empty ring instead of the dot. Make the window narrow: there are fewer and fewer
columns, and at phone width only two.
:::

:::mistake Common mistake
`const status = character.status`, without `toLowerCase()`. The table has no `'Bright'` key, so the status word
disappears (`undefined` draws nothing), and the class becomes `status--Bright`, which the CSS does not know: the dot
turns grey.
:::

:::try Try it
In `CharacterList.jsx` change `lang=en` to `lang=hu`: the species are in Hungarian now (Pávanép, Felhőbálna…), and the
names stay the same. Then set it back.
:::

### Loading and errors: the useFetch hook

Two things are missing. While the answer is on its way, the page shows nothing; and if the request fails, it stays empty
forever, without a word. Every request of this lesson (the list, a character, the episodes…) needs the same three
states: loading, success and error. In lesson 14 you put this into a [[custom hook]], `useFetch`. Here is this
lesson's version, explained line by line below. Create `src/useFetch.js`:

```js file=src/useFetch.js
import { useEffect, useState } from 'react'

// Loads JSON from an address, and tells how it is going:
// { status: 'idle' | 'loading' | 'success' | 'error', data, error, retry }
function useFetch(url) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!url) return // no address yet: nothing to load
    const controller = new AbortController()

    async function load() {
      setState({ status: 'loading', data: null, error: null })
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          // An error answer (404, 500…): we keep its code, and the page decides what to say.
          const error = new Error(`HTTP ${response.status}`)
          error.status = response.status
          throw error
        }
        const data = await response.json()
        setState({ status: 'success', data, error: null })
      } catch (error) {
        // Cancelled by the cleanup: a newer request took over, so we stay quiet.
        if (controller.signal.aborted) return
        setState({ status: 'error', data: null, error })
      }
    }

    load()
    // Cleanup: when the address changes, or the component goes away, the request is cancelled.
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setAttempt(attempt + 1)
  }

  return { ...state, retry }
}

export default useFetch
```

- The state is one object: `status` (`'idle'`, `'loading'`, `'success'` or `'error'`), `data` (the answer) and `error`.
  `'idle'` means "no address yet": with `if (!url) return` the effect then does nothing. The advanced level uses this
  for a request that has to wait for another one.
- `response.ok` is true when the [[HTTP status code]] of the answer is between 200 and 299. `fetch` itself fails only
  when no answer arrives at all (for example without a network); a 404 (not found) or a 400 (bad request) is an answer
  too. So we check it ourselves, and `throw` an error that carries the code in `error.status`: the page will decide what
  a 404 means. `throw` jumps straight into `catch`, as in lesson 3's [[try/catch]].
- An [[AbortController]] can cancel a request: `controller.abort()`. The effect's [[cleanup function]] calls it when
  the address changes or the component goes away. This way an old, slow answer can never overwrite a newer one, and
  StrictMode's extra request is cancelled at once. A cancelled `fetch` throws an error too, so `catch` checks
  `controller.signal.aborted`, and stays quiet.
- `retry` adds one to `attempt`. `attempt` is in the dependency array, so the effect runs again with the same address:
  a new try.
- `return { ...state, retry }` hands everything back in one object, with the [[spread]] you know from lesson 1.

The addresses go into a file of their own, so that the components do not have to know how they are built. Create
`src/api.js`:

```js file=src/api.js
// The address of the wiki's API. In this project the pretend server in src/mocks answers it.
const API = '/api'
// The API speaks two languages: lang=en gives English texts, lang=hu Hungarian ones.
const LANG = 'en'

// The list of characters (the first page, for now): /api/character?lang=en
export function charactersUrl() {
  return `${API}/character?lang=${LANG}`
}
```

`API` and `LANG` have no `export`: only this file uses them. If you want the texts in Hungarian one day, you change a
single line.

The red error box will appear in several places (the list, a character's page, the episodes…), so it gets a component
of its own: `src/components/ErrorMessage.jsx`.

```jsx file=src/components/ErrorMessage.jsx
// A red box with a message and a "Try again" button.
function ErrorMessage({ text, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <p>{text}</p>
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}

export default ErrorMessage
```

`role="alert"` makes screen readers read the message out as soon as it appears. `onRetry` is a function from the parent,
here the `retry` of the hook. Now the list uses all three new pieces: the hook, the function that builds the address
and the error box. Replace `src/components/CharacterList.jsx`:

```jsx file=src/components/CharacterList.jsx mark=1-2,4,7,10-23
import useFetch from '../useFetch.js'
import { charactersUrl } from '../api.js'
import CharacterCard from './CharacterCard.jsx'
import ErrorMessage from './ErrorMessage.jsx'

function CharacterList() {
  const { status, data, retry } = useFetch(charactersUrl())

  return (
    <section className="list">
      {status === 'loading' && <p className="state">Loading characters…</p>}
      {status === 'error' && <ErrorMessage text="The characters could not be loaded." onRetry={retry} />}
      {status === 'success' && (
        <>
          <p className="list__count">Characters: {data.info.count}</p>
          <ul className="grid">
            {data.results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default CharacterList
```

The `useState` and the effect have moved into the hook, so the component only asks: what is the status? This is
[[conditional rendering]]: of the three `&&` lines, only the one whose condition is true draws anything. `<>…</>` is a
[[Fragment]]: it holds the count and the grid together without adding an element to the page. `data.info.count` is the
number of all characters (40), not only of the 12 on this page: the others come with paging, in the advanced level.

:::check Check
For a moment "Loading characters…" appears, then "Characters: 40" and the cards. Now break the address on purpose: in
`src/api.js` add `&status=happy` to the end of the address, right after `${LANG}`. The API knows no such status, and
answers 400 (Bad Request): a red box says "The characters could not be loaded", with a "Try again" button below it.
Click it: "Loading characters…" flashes, then the error comes back, because the address is still wrong. The console shows the 400 in red as well: that is the browser noting the
failed request. Set the address back. The beginner level is done: commit it!
:::

:::mistake Common mistake
Leaving out the `response.ok` check. Then a 404 or a 400 counts as success: `response.json()` reads the API's error
message (`{ error, message }`), and the page breaks at `data.info.count`, because an error message has no `info`.
:::

## Intermediate level {level=2}

### A small router of your own

Every character gets a page of its own, with its own address: `#/character/1` for Juno, `#/character/2` for Captain
Nimbus. The address tells the app what to show: this is [[routing]]. In lesson 20, "Movie Search", you already built
one: the `useHashRoute` hook and a route parameter (`#/show/42`) chose which series' page to draw. Now we build the same
thing for the characters, starting from lesson 1's simple `useHashRoute` hook. It is small, it needs no library, and it
works on GitHub Pages too (the box after the check tells why).

`useHashRoute` watches the part of the address after the `#`, the [[hash|URL hash]], and returns it as a path:
`'/character/3'`, or `'/'` for the list. If you have your lesson 1 project, copy the file from there (not from lesson
20: at its advanced level the hook returns `{ path, params }`); if not, create `src/useHashRoute.js`:

```js file=src/useHashRoute.js
import { useEffect, useState } from 'react'

const currentPath = () => window.location.hash.slice(1) || '/'

// Returns the part of the address after #, and updates when it changes.
function useHashRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    // Clean up: when the component goes away, stop listening.
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export default useHashRoute
```

A quick recap: `slice(1)` cuts off the `#`, and `|| '/'` means "or `/`, if nothing is left". `useState(currentPath)`
reads the address once, at the start (a [[lazy initial state]]). The effect listens to the browser's `hashchange` event,
which fires whenever the part after the `#` changes, and its cleanup stops listening.

First the character's page, for now with only the number. Create `src/components/CharacterDetail.jsx`:

```jsx file=src/components/CharacterDetail.jsx mark=4-7
import { useEffect } from 'react'

function CharacterDetail({ id }) {
  // A new character's page starts at the top, however far down the list was scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="detail">
      <a className="back" href="#/">
        ← Back to the list
      </a>
      <p className="detail__number">#{id}</p>
      <h2 className="detail__name">The character’s page comes here.</h2>
    </article>
  )
}

export default CharacterDetail
```

If you click a card far down the list, without `scrollTo` the new page would start out of view, because the browser
keeps the scroll position. `window.scrollTo(0, 0)` scrolls to the top. The empty `[]` here means "once for every
character": `App`, coming next, gives the page a key, and a new key makes a brand new component.

One address pattern, `/character/:id`, stands for every character: this is a [[dynamic route]]. Its changing part, the
`id`, is the [[route parameter]] you met in lesson 20, like the `42` in `#/show/42`. (React Router would write it as
`path="/character/:id"`, like the `path="/show/:id"` in lesson 20's box.) `App` reads the id from the path, and draws
either the list or a character's page. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=1,3,6-11,14-15,20-22,26
import useHashRoute from './useHashRoute.js'
import CharacterList from './components/CharacterList.jsx'
import CharacterDetail from './components/CharacterDetail.jsx'
import './App.css'

// '/character/3' → 3. Any other path (the list is '/') → null.
function characterIdFrom(path) {
  if (!path.startsWith('/character/')) return null
  const id = Number(path.slice('/character/'.length))
  return Number.isInteger(id) && id > 0 ? id : null
}

function App() {
  const path = useHashRoute()
  const id = characterIdFrom(path)

  return (
    <main className="wiki">
      <header className="wiki__header">
        <h1>
          <a href="#/">Fan Wiki</a>
        </h1>
        <p>The characters of the Huebloom Isles, from the lesson’s own API.</p>
      </header>

      {id ? <CharacterDetail key={id} id={id} /> : <CharacterList />}
    </main>
  )
}

export default App
```

- `characterIdFrom` checks that the path starts with `/character/`, and turns the rest into a number. `Number('abc')`
  gives `NaN` ("not a number"), and `Number.isInteger` is true only for whole numbers, so a wrong address gives `null`,
  and the list appears.
- `id ? … : …` is the [[ternary operator]]: a character's page if there is an id, the list if not. The "Fan Wiki"
  title has become a link too: it points to `#/`, the list.
- `key={id}`: you met [[key]] in lists, and in lesson 3 you saw on the `CopyButton` that it works on any component.
  When the key changes, React throws the old component away and makes a brand new one, with fresh state and fresh
  effects. When you go from one character's page straight to another's (in the advanced level a click is enough),
  nothing is left over from the previous character.

Finally, the cards become links. Replace `src/components/CharacterCard.jsx`; the `<a>` is new, and everything else of
the card goes inside it:

```jsx file=src/components/CharacterCard.jsx mark=9,17
import { STATUS_LABELS } from '../labels.js'

function CharacterCard({ character }) {
  // 'Bright' → 'bright': the key for the labels and for the CSS class as well.
  const status = character.status.toLowerCase()

  return (
    <li className="card">
      <a className="card__link" href={`#/character/${character.id}`}>
        <img className="card__image" src={character.image} alt="" width="300" height="300" loading="lazy" />
        <div className="card__body">
          <p className="card__name">{character.name}</p>
          <p className="card__meta">
            <span className={`status status--${status}`}>{STATUS_LABELS[status]}</span> · {character.species}
          </p>
        </div>
      </a>
    </li>
  )
}

export default CharacterCard
```

It is an ordinary link. Clicking it changes only the hash: the browser does not load a new page, it fires `hashchange`,
and our hook hands the new path to `App`. The browser's Back button works by itself, because every new hash is a new
entry in the browser's history.

:::check Check
Click Juno's card: the address ends in `#/character/1`, and the page shows "← Back to the list", "#1" and "The
character's page comes here." The back link, the browser's Back button and the "Fan Wiki" title all take you back to the
list. Now, in the address bar, change the end of the address by hand to `#/character/abc` (replace everything from the
`#` on) and press ++Enter++: the list appears, because `abc` is not a valid id.
:::

:::concept Why the # in the address?
A server like GitHub Pages serves files. For the address `/character/3` it looks for a file at that path, finds none,
and answers 404, for example when someone reloads the page or opens a shared link. The part after the `#` never reaches
the server: so the server always sends `index.html`, and our code reads the part after the `#`. This is why a hash router works anywhere, without
setting up the server. React Router's `BrowserRouter` makes nicer addresses without the `#`, but then the server has to
answer every path with `index.html`; React Router also has a `HashRouter`, built on the same idea as ours.
:::

:::mistake Common mistake
`href="/character/1"`, without the `#`. Then the browser leaves the page and asks the server for `/character/1`: the
whole app starts again from scratch, and our router, which reads only the part after the `#`, never sees the id.
:::

### The character's page

Now the page shows the character. Its address is `/api/character/1`: this time the id is part of the path, not a query
parameter, because it names one particular thing. Add this function to the end of `src/api.js`:

```js file=src/api.js
// One character: /api/character/3?lang=en
export function characterUrl(id) {
  return `${API}/character/${id}?lang=${LANG}`
}
```

The page shows the gender too, so `src/labels.js` gets a second table. Here is the whole file:

```js file=src/labels.js mark=8-13
// The API sends these values in English. We show them in our own words.
export const STATUS_LABELS = {
  bright: 'Bright',
  faded: 'Faded',
  unknown: 'Unknown',
}

export const GENDER_LABELS = {
  female: 'Female',
  male: 'Male',
  genderless: 'Genderless',
  unknown: 'Unknown',
}
```

Replace `src/components/CharacterDetail.jsx`:

```jsx file=src/components/CharacterDetail.jsx mark=2-5,7-18,21,34-38,40-56
import { useEffect } from 'react'
import useFetch from '../useFetch.js'
import { characterUrl } from '../api.js'
import { GENDER_LABELS, STATUS_LABELS } from '../labels.js'
import ErrorMessage from './ErrorMessage.jsx'

// The facts worth showing, as label–value pairs, without the empty ones and the places nobody knows.
function factsOf(character) {
  const facts = [
    { label: 'Status', value: STATUS_LABELS[character.status.toLowerCase()] },
    { label: 'Species', value: character.species },
    { label: 'Type', value: character.type },
    { label: 'Gender', value: GENDER_LABELS[character.gender.toLowerCase()] },
    { label: 'Origin', value: character.origin.name },
    { label: 'Last known location', value: character.location.name },
  ]
  return facts.filter((fact) => fact.value && fact.value !== 'unknown')
}

function CharacterDetail({ id }) {
  const { status, data, error, retry } = useFetch(characterUrl(id))

  // A new character's page starts at the top, however far down the list was scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="detail">
      <a className="back" href="#/">
        ← Back to the list
      </a>

      {status === 'loading' && <p className="state">Loading the character…</p>}
      {status === 'error' && error.status === 404 && <p className="state">There is no character with this number.</p>}
      {status === 'error' && error.status !== 404 && (
        <ErrorMessage text="The character could not be loaded." onRetry={retry} />
      )}

      {status === 'success' && (
        <div className="detail__main">
          <img className="detail__image" src={data.image} alt={data.name} width="300" height="300" />
          <div className="detail__info">
            <p className="detail__number">#{data.id}</p>
            <h2 className="detail__name">{data.name}</h2>
            <dl className="facts">
              {factsOf(data).map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </article>
  )
}

export default CharacterDetail
```

- `useFetch(characterUrl(id))`: the same hook, with a different address.
- An error can mean two things here. A 404 means "there is no such character": that is not a breakdown, so it gets a
  plain message, without "Try again". Any other code is a real error, with a retry. `error.status` is the code that
  `useFetch` saved.
- `factsOf` turns the character into label–value pairs, and leaves out the empty ones: Dot Blotsworth has no type (the
  API sends `''`), and nobody knows where Mister Gloam comes from (the API says `'unknown'`). [[filter]] keeps the items
  for which the function returns true; `fact.value && …` is false for an empty string. Reshaping like this is everyday
  work: an API's data rarely comes in exactly the shape the page needs. (An unknown status or gender still shows, as
  "Unknown": the label table has turned it into a word by then.)
- `<dl>` is a [[description list]]: `<dt>` is a term, `<dd>` its description. Each pair is wrapped in a `<div>` (this
  is allowed inside a `<dl>`), so the CSS can arrange them in a grid.
- `alt={data.name}`: here the picture is the main content of the page, so it gets the name as its alt text.

:::check Check
Click Juno: a big picture, "#1", "Juno Plumewick", and six facts: Status Bright, Species Peafolk, Type Lighthouse
apprentice, Gender Female, and Plumage Point as both her Origin and her Last known location. Dot Blotsworth (#4) has no
Type line. In the address bar, change the end of the address to `#/character/99`: "There is no character with this
number."
:::

:::mistake Common mistake
Using `data` outside the `status === 'success'` block, for example `<h2>{data.name}</h2>` right under the back link.
While the answer is on its way, `data` is `null`: the page goes blank, and the console says "Cannot read properties of
null (reading 'name')". Everything that reads `data` goes inside the success block.
:::

:::try Try it
Add a "Next ›" link next to the back link, with `href={'#/character/' + (id + 1)}`, and a "‹ Previous" one with
`id - 1`. Show Previous only when `id > 1`, with `&&`. What do you see after #40?
:::

### Search by name

A wiki of 40 characters needs a search box. The API can search: `/api/character?name=ju` gives the characters whose
name contains "ju". The other filters work the same way, `status=faded` and `gender=female`, and they can be combined.

Building such an address by hand is fiddly: an `&` goes between the pairs, and some characters (a space, or an `&`
itself) have to be written in a special, encoded way. [[URLSearchParams]] does this for us: `set(name, value)` adds a
pair, and in a template literal the object turns itself into the text after the `?`.

The files of this step depend on each other: until you have saved the last one, the page may stay blank or show an
error. That is expected. Replace the `charactersUrl` function in `src/api.js` with this one:

```js file=src/api.js
// The list, with only the filters that are set: /api/character?lang=en&name=ju&status=faded
export function charactersUrl({ name, status, gender }) {
  const params = new URLSearchParams({ lang: LANG })
  if (name) params.set('name', name)
  if (status) params.set('status', status)
  if (gender) params.set('gender', gender)
  return `${API}/character?${params}`
}
```

The function gets an object, and takes it apart in its parameter list, the way a component takes its props
([[destructuring]]). A filter that is not set is left out: `if (name)` is false for an empty string. The status and the
gender filters stay empty for now; step 8 gives them their own controls.

The search box goes into a new component, `src/components/Filters.jsx`. Its `<input>` is a [[controlled input]], like
the slider of lesson 3: its value comes from the props, and every keystroke reports the new text upwards.

```jsx file=src/components/Filters.jsx
// The filters when none of them is set.
export const NO_FILTERS = { name: '', status: '', gender: '' }

function Filters({ filters, onChange }) {
  // A copy of the filters with one key changed: this goes up to App.
  function change(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="filters">
      <label className="field filters__search">
        <span>Search by name</span>
        <input
          type="search"
          value={filters.name}
          placeholder="e.g. Juno, Nimbus, Steepwell…"
          onChange={(event) => change('name', event.target.value)}
        />
      </label>
    </div>
  )
}

export default Filters
```

`change` makes a copy of the filters with the [[spread]], and `[key]` in square brackets overwrites the key whose name
is in `key`, like the `toggleOption` of lesson 3. `type="search"` is a text box for which the phone keyboard shows a
search key, and that ++Esc++ empties. `NO_FILTERS` has an `export` of its own, because `App` needs it too.

Where do the filters live? Not in `CharacterList`. When you open a character, `App` draws the character's page instead
of the list: the list disappears, and its state goes with it. Back on the list, the search box would be empty again. So
the filters live one level up, in `App`, which stays on the page all the time. This is [[lifting state up]], from lesson
3: `App` keeps the filters, `CharacterList` gets them as props, and passes every change up. Replace
`src/components/CharacterList.jsx`:

```jsx file=src/components/CharacterList.jsx mark=5,7-8,12
import useFetch from '../useFetch.js'
import { charactersUrl } from '../api.js'
import CharacterCard from './CharacterCard.jsx'
import ErrorMessage from './ErrorMessage.jsx'
import Filters from './Filters.jsx'

function CharacterList({ filters, onFiltersChange }) {
  const { status, data, retry } = useFetch(charactersUrl(filters))

  return (
    <section className="list">
      <Filters filters={filters} onChange={onFiltersChange} />

      {status === 'loading' && <p className="state">Loading characters…</p>}
      {status === 'error' && <ErrorMessage text="The characters could not be loaded." onRetry={retry} />}
      {status === 'success' && (
        <>
          <p className="list__count">Characters: {data.info.count}</p>
          <ul className="grid">
            {data.results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default CharacterList
```

And `src/App.jsx`:

```jsx file=src/App.jsx mark=1,5,18-19,30-34
import { useState } from 'react'
import useHashRoute from './useHashRoute.js'
import CharacterList from './components/CharacterList.jsx'
import CharacterDetail from './components/CharacterDetail.jsx'
import { NO_FILTERS } from './components/Filters.jsx'
import './App.css'

// '/character/3' → 3. Any other path (the list is '/') → null.
function characterIdFrom(path) {
  if (!path.startsWith('/character/')) return null
  const id = Number(path.slice('/character/'.length))
  return Number.isInteger(id) && id > 0 ? id : null
}

function App() {
  const path = useHashRoute()
  const id = characterIdFrom(path)
  // The list's filters live here, in App, so they survive a visit to a character's page.
  const [filters, setFilters] = useState(NO_FILTERS)

  return (
    <main className="wiki">
      <header className="wiki__header">
        <h1>
          <a href="#/">Fan Wiki</a>
        </h1>
        <p>The characters of the Huebloom Isles, from the lesson’s own API.</p>
      </header>

      {id ? (
        <CharacterDetail key={id} id={id} />
      ) : (
        <CharacterList filters={filters} onFiltersChange={setFilters} />
      )}
    </main>
  )
}

export default App
```

`onFiltersChange={setFilters}` hands the state's own setter down: `CharacterList` passes it on to `Filters`, which calls
it with the new filters object.

:::check Check
Type "nim": after a moment only Captain Nimbus is left, and the count says "Characters: 1". Clear the box, then type
"steep" slowly, and watch the Network tab: a new request goes out for every letter, and the cards blink while each one loads. Open Steepwell
and come back: the search box still says "steep". Finally type "xyz": a red error box. Something is not right here: the
next step fixes both problems.
:::

:::mistake Common mistake
Keeping the filters in `CharacterList` with a `useState` of its own. The search works, but every visit to a character's
page empties it, because the list component disappears in the meantime.
:::

### Wait for the pause: debounce, and "no results"

The previous step left two problems:

1. Every keystroke sends a request. For "steepwell" that is nine of them, and only the last one matters. A real API
   counts requests: the lesson's API answers 429 (Too Many Requests) after 60 requests in ten seconds.
2. When nothing matches, the API answers 404, and the page shows it as an error. But "nobody is called xyz" is not a
   breakdown, it is an empty result. Many public APIs answer like this, so it is worth knowing.

The first one is solved by [[debounce]]: wait until a value has not changed for a while, and only then use it. You wrote
a `useDebounce` hook in lesson 20; create `src/useDebounce.js`:

```js file=src/useDebounce.js
import { useEffect, useState } from 'react'

// Hands value on only once it has not changed for delay milliseconds.
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    // Every new keystroke clears the previous timer, and starts a new one.
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default useDebounce
```

Every change of `value` runs the effect again, but before that, its cleanup clears the previous timer. A timer can fire
only if `delay` milliseconds pass without a new change: then `debounced` takes the new value. While you type, it keeps
the old one.

Now `CharacterList` delays the name, and treats a 404 as an empty list. Replace `src/components/CharacterList.jsx`:

```jsx file=src/components/CharacterList.jsx mark=2,9-11,13-14,21-22
import useFetch from '../useFetch.js'
import useDebounce from '../useDebounce.js'
import { charactersUrl } from '../api.js'
import CharacterCard from './CharacterCard.jsx'
import ErrorMessage from './ErrorMessage.jsx'
import Filters from './Filters.jsx'

function CharacterList({ filters, onFiltersChange }) {
  // The name waits until you stop typing; the other filters apply at once.
  const name = useDebounce(filters.name.trim(), 400)
  const { status, data, error, retry } = useFetch(charactersUrl({ ...filters, name }))

  // When nothing matches the filters, the API sends a 404. For us that is simply an empty list.
  const noMatch = status === 'error' && error.status === 404

  return (
    <section className="list">
      <Filters filters={filters} onChange={onFiltersChange} />

      {status === 'loading' && <p className="state">Loading characters…</p>}
      {noMatch && <p className="state">No character matches the filters. Try a shorter name or clear the filters!</p>}
      {status === 'error' && !noMatch && <ErrorMessage text="The characters could not be loaded." onRetry={retry} />}
      {status === 'success' && (
        <>
          <p className="list__count">Characters: {data.info.count}</p>
          <ul className="grid">
            {data.results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default CharacterList
```

- The search box still shows `filters.name` straight away: only the request waits. `{ ...filters, name }` is a copy of
  the filters in which the name is the delayed one.
- `trim()` cuts the spaces off both ends, so a lone space is not a search.
- `noMatch` is true for an error with the code 404. With `!noMatch`, the red box is left for the real errors only.

:::check Check
Type "steepwell" at your normal speed, and watch the Network tab: only one or two requests go out, once you stop. Type
"xyz": instead of the red box, a calm grey message says "No character matches the filters. Try a shorter name or clear
the filters!" The
console still shows the 404 in red: that is only the browser noting the answer, not an error in your code.
:::

:::mistake Common mistake
Making the delayed `name`, but still calling `useFetch(charactersUrl(filters))`. Nothing changes then: the request is
built from the fresh name, and goes out at every keystroke. The delayed value has to get into the address.
:::

:::try Try it
Set the delay to 1500 milliseconds and type: the wait soon gets annoying. Somewhere between 300 and 500 feels natural.
:::

### Filters: status and gender

Two more filters: the status and the gender. The status gets toggle buttons ("chips"), the gender a [[drop-down list]]
(`<select>`), and when any filter is set, a "Clear filters" button appears. Replace `src/components/Filters.jsx`:

```jsx file=src/components/Filters.jsx mark=1,12,26-56,58-62
import { GENDER_LABELS, STATUS_LABELS } from '../labels.js'

// The filters when none of them is set.
export const NO_FILTERS = { name: '', status: '', gender: '' }

function Filters({ filters, onChange }) {
  // A copy of the filters with one key changed: this goes up to App.
  function change(key, value) {
    onChange({ ...filters, [key]: value })
  }

  const hasFilters = filters.name !== '' || filters.status !== '' || filters.gender !== ''

  return (
    <div className="filters">
      <label className="field filters__search">
        <span>Search by name</span>
        <input
          type="search"
          value={filters.name}
          placeholder="e.g. Juno, Nimbus, Steepwell…"
          onChange={(event) => change('name', event.target.value)}
        />
      </label>

      <fieldset>
        <legend>Status</legend>
        <div className="chips">
          <button type="button" className="chip" aria-pressed={filters.status === ''} onClick={() => change('status', '')}>
            Any
          </button>
          {Object.keys(STATUS_LABELS).map((key) => (
            <button
              key={key}
              type="button"
              className="chip"
              aria-pressed={filters.status === key}
              onClick={() => change('status', key)}
            >
              {STATUS_LABELS[key]}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Gender</span>
        <select value={filters.gender} onChange={(event) => change('gender', event.target.value)}>
          <option value="">Any</option>
          {Object.keys(GENDER_LABELS).map((key) => (
            <option key={key} value={key}>
              {GENDER_LABELS[key]}
            </option>
          ))}
        </select>
      </label>

      {hasFilters && (
        <button type="button" className="link-button" onClick={() => onChange(NO_FILTERS)}>
          Clear filters
        </button>
      )}
    </div>
  )
}

export default Filters
```

- `Object.keys(STATUS_LABELS)` gives `['bright', 'faded', 'unknown']`. The chips are made from the labels table, so
  their keys go straight into the request (`status=faded`); the API accepts them in lowercase. "Any" is the empty
  string: no filter.
- [[aria-pressed]] tells screen readers whether a toggle button is pressed, and the CSS colours the pressed chip by the
  same attribute (`.chip[aria-pressed='true']`). `<fieldset>` and `<legend>` group the chips under a title, which screen
  readers read out with each button.
- The `<select>` is a controlled input too: `value` comes from the filters, and `onChange` sets them. The `<option>`s
  list the choices; the value of the chosen option arrives in `event.target.value`.
- `hasFilters` is a [[derived value]]: it is worked out from the filters at every drawing, so it needs no state of its
  own. `onChange(NO_FILTERS)` hands `App` the empty filters.

`CharacterList` and `App` need no change: the new filters travel in the same object, and `charactersUrl` already puts
them into the address.

:::check Check
Click "Faded": five characters, all washed out by the Grey Drizzle, and the chip turns green. In the "Gender" list,
choose "Male": three are left. If you choose "Female": "No character matches the filters." Click "Clear filters": all 40 are back, the
search box is empty, and "Any" is pressed again. The intermediate level is done: commit it!
:::

:::mistake Common mistake
`onClick={change('status', key)}`, without the arrow function. That calls `change` straight away, for every chip, while
the page is being drawn, not when you click. Each call sets the state of `App` in the middle of drawing, `App` draws
again, which calls them again… The "Unknown" chip gets pressed by itself, the list never settles, and the console fills
up with red: "Cannot update a component while rendering a different component". After a few seconds the API has had
enough too: it answers 429 (Too Many Requests), and the red error box appears. Hand over a function:
`onClick={() => change('status', key)}`.
:::

:::try Try it
Unknown status and Female gender together: who are the two mysterious ladies? Look at their pages.
:::

## Advanced level {level=3}

### Pagination

Forty characters, twelve to a page: that makes four pages, and so far you only see the first. The API sends the page
you ask for (`page=2`), and `info.pages` tells how many there are. This is [[pagination]], which you met in lesson 20's
catalogue: the server does not send everything at once, only one page of it, so the first answer is quick even when
there are thousands of records.

The files of this step depend on each other too: until you have saved the last one, the page may show an error. That
is expected. Replace `charactersUrl` in `src/api.js` once more; `page` becomes part of the address:

```js file=src/api.js mark=1-3
// The list, with only the filters that are set: /api/character?lang=en&page=2&name=ju&status=faded
export function charactersUrl({ name, status, gender, page }) {
  const params = new URLSearchParams({ lang: LANG, page: String(page) })
  if (name) params.set('name', name)
  if (status) params.set('status', status)
  if (gender) params.set('gender', gender)
  return `${API}/character?${params}`
}
```

`URLSearchParams` wants text, so `String(page)` turns the number 2 into `'2'`.

The page buttons get a component of their own: `src/components/Pagination.jsx`.

```jsx file=src/components/Pagination.jsx
function Pagination({ page, pages, onPageChange }) {
  // A single page needs no buttons.
  if (pages <= 1) return null

  return (
    <nav className="pages" aria-label="Pages">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Previous
      </button>
      <span className="pages__info">
        Page {page} of {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        Next →
      </button>
    </nav>
  )
}

export default Pagination
```

When a component returns `null`, React draws nothing in its place. A `disabled` button cannot be clicked: "Previous" on
the first page, "Next" on the last. `<nav>` with an [[aria-label]] tells screen readers that this is navigation.

The page number lives in `App`, next to the filters, so it too survives a visit to a character's page. A new filter
starts again from page 1, because page 3 of the "Faded" list may not even exist. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=18,20,22-31,45
import { useState } from 'react'
import useHashRoute from './useHashRoute.js'
import CharacterList from './components/CharacterList.jsx'
import CharacterDetail from './components/CharacterDetail.jsx'
import { NO_FILTERS } from './components/Filters.jsx'
import './App.css'

// '/character/3' → 3. Any other path (the list is '/') → null.
function characterIdFrom(path) {
  if (!path.startsWith('/character/')) return null
  const id = Number(path.slice('/character/'.length))
  return Number.isInteger(id) && id > 0 ? id : null
}

function App() {
  const path = useHashRoute()
  const id = characterIdFrom(path)
  // The list's settings live here, in App, so they survive a visit to a character's page.
  const [filters, setFilters] = useState(NO_FILTERS)
  const [page, setPage] = useState(1)

  // A new filter: the list starts again from the first page.
  function changeFilters(newFilters) {
    setFilters(newFilters)
    setPage(1)
  }

  function changePage(newPage) {
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  return (
    <main className="wiki">
      <header className="wiki__header">
        <h1>
          <a href="#/">Fan Wiki</a>
        </h1>
        <p>The characters of the Huebloom Isles, from the lesson’s own API.</p>
      </header>

      {id ? (
        <CharacterDetail key={id} id={id} />
      ) : (
        <CharacterList filters={filters} onFiltersChange={changeFilters} page={page} onPageChange={changePage} />
      )}
    </main>
  )
}

export default App
```

`changePage` also scrolls to the top: the buttons are under the grid, but a new page is read from its beginning. Finally
`CharacterList` passes the page on to the address and to the buttons. Replace `src/components/CharacterList.jsx`:

```jsx file=src/components/CharacterList.jsx mark=7,9-10,12,32
import useFetch from '../useFetch.js'
import useDebounce from '../useDebounce.js'
import { charactersUrl } from '../api.js'
import CharacterCard from './CharacterCard.jsx'
import ErrorMessage from './ErrorMessage.jsx'
import Filters from './Filters.jsx'
import Pagination from './Pagination.jsx'

function CharacterList({ filters, onFiltersChange, page, onPageChange }) {
  // The name waits until you stop typing; the other filters and the page apply at once.
  const name = useDebounce(filters.name.trim(), 400)
  const { status, data, error, retry } = useFetch(charactersUrl({ ...filters, name, page }))

  // When nothing matches the filters, the API sends a 404. For us that is simply an empty list.
  const noMatch = status === 'error' && error.status === 404

  return (
    <section className="list">
      <Filters filters={filters} onChange={onFiltersChange} />

      {status === 'loading' && <p className="state">Loading characters…</p>}
      {noMatch && <p className="state">No character matches the filters. Try a shorter name or clear the filters!</p>}
      {status === 'error' && !noMatch && <ErrorMessage text="The characters could not be loaded." onRetry={retry} />}
      {status === 'success' && (
        <>
          <p className="list__count">Characters: {data.info.count}</p>
          <ul className="grid">
            {data.results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </ul>
          <Pagination page={page} pages={data.info.pages} onPageChange={onPageChange} />
        </>
      )}
    </section>
  )
}

export default CharacterList
```

:::check Check
Under the grid: "Page 1 of 4", with "← Previous" greyed out. "Next →" brings page 2, starting with Azura; page 4 has only
four characters, and there "Next →" is the grey one. Go to page 3, open a character and come back: you are still on
page 3. Click "Faded": five characters fit on one page, so the buttons disappear.
:::

:::mistake Common mistake
Leaving `setPage(1)` out of `changeFilters`. Go to page 4, then click "Faded": the app asks for page 4 of five results,
which do not even fill one page. The API answers 404, and the page says that no character matches, although five do.
:::

:::try Task
Show which part of the list is on the screen, for example "13–24 of 40" on page 2. Pass `count={data.info.count}` to
`Pagination` too. The first number is `(page - 1) * 12 + 1`, the last `Math.min(page * 12, count)`.
:::

### The episode list: a second request

A character's page should list the episodes the character appears in. The character's data already has them, but only
as addresses: `episode: ['http://localhost:5173/api/episode/1', 'http://localhost:5173/api/episode/2', …]`. This is how a
REST API connects its resources: instead of copying every episode into every character, it points to them.

We could fetch the addresses one by one, but that would be 20 requests for Juno. This API, like many, can send several
ids at once instead: `/api/episode/1,2,3` gives an array of three episodes. So we take the id from every address, join
the ids with commas, and send a single request. Add these three functions to the end of `src/api.js`:

```js file=src/api.js
// The API links things by address; the id is the part after the last slash.
// 'http://localhost:5173/api/episode/7' → 7
export function idFromUrl(url) {
  return Number(url.split('/').pop())
}

// Many episodes in a single request: /api/episode/1,2,3
export function episodesUrl(episodeUrls) {
  const ids = episodeUrls.map(idFromUrl)
  return `${API}/episode/${ids.join(',')}?lang=${LANG}`
}

// For one id the API answers with a single object, for more with an array. This always gives an array.
export function asList(data) {
  return Array.isArray(data) ? data : [data]
}
```

- `split('/')` cuts the text at every `/` into an array, `pop()` takes its last item (`'7'`), and `Number` turns it
  into a number.
- `map(idFromUrl)` hands every address to `idFromUrl`, and `join(',')` glues the ids together with commas.
- `asList`: for a single id (`/api/episode/6`) the API sends one object, not an array of one. `Array.isArray` tells which
  one arrived, and `asList` wraps a lone object into an array, so the page can always use `map`.

The list goes into `src/components/EpisodeList.jsx`:

```jsx file=src/components/EpisodeList.jsx
import useFetch from '../useFetch.js'
import { asList, episodesUrl } from '../api.js'
import ErrorMessage from './ErrorMessage.jsx'

function EpisodeList({ episodeUrls }) {
  // A second request: its address is made from the character's data, so it can only start once the character is here.
  const { status, data, retry } = useFetch(episodesUrl(episodeUrls))

  return (
    <section className="section">
      <h3 className="section-title">Episodes ({episodeUrls.length})</h3>
      {status === 'loading' && <p className="state">Loading the episodes…</p>}
      {status === 'error' && <ErrorMessage text="The episodes could not be loaded." onRetry={retry} />}
      {status === 'success' && (
        <ol className="episodes">
          {asList(data).map((episode) => (
            <li key={episode.id}>
              <code>{episode.episode}</code>
              <span>{episode.name}</span>
              <small>{episode.air_date}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default EpisodeList
```

A request that needs the answer of an earlier one is a [[dependent request]]. Here it waits by itself: `EpisodeList`
only appears in the success block of the character's page, so by the time it runs, `data.episode` is there. `<ol>` is a
numbered list, because the episodes have an order; `air_date` arrives already written out in the chosen language.

Put the list under the character in `src/components/CharacterDetail.jsx`. The success block now holds two things, so they
go into a Fragment:

```jsx file=src/components/CharacterDetail.jsx mark=6,42,58-59
import { useEffect } from 'react'
import useFetch from '../useFetch.js'
import { characterUrl } from '../api.js'
import { GENDER_LABELS, STATUS_LABELS } from '../labels.js'
import ErrorMessage from './ErrorMessage.jsx'
import EpisodeList from './EpisodeList.jsx'

// The facts worth showing, as label–value pairs, without the empty ones and the places nobody knows.
function factsOf(character) {
  const facts = [
    { label: 'Status', value: STATUS_LABELS[character.status.toLowerCase()] },
    { label: 'Species', value: character.species },
    { label: 'Type', value: character.type },
    { label: 'Gender', value: GENDER_LABELS[character.gender.toLowerCase()] },
    { label: 'Origin', value: character.origin.name },
    { label: 'Last known location', value: character.location.name },
  ]
  return facts.filter((fact) => fact.value && fact.value !== 'unknown')
}

function CharacterDetail({ id }) {
  const { status, data, error, retry } = useFetch(characterUrl(id))

  // A new character's page starts at the top, however far down the list was scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="detail">
      <a className="back" href="#/">
        ← Back to the list
      </a>

      {status === 'loading' && <p className="state">Loading the character…</p>}
      {status === 'error' && error.status === 404 && <p className="state">There is no character with this number.</p>}
      {status === 'error' && error.status !== 404 && (
        <ErrorMessage text="The character could not be loaded." onRetry={retry} />
      )}

      {status === 'success' && (
        <>
          <div className="detail__main">
            <img className="detail__image" src={data.image} alt={data.name} width="300" height="300" />
            <div className="detail__info">
              <p className="detail__number">#{data.id}</p>
              <h2 className="detail__name">{data.name}</h2>
              <dl className="facts">
                {factsOf(data).map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <EpisodeList episodeUrls={data.episode} />
        </>
      )}
    </article>
  )
}

export default CharacterDetail
```

:::check Check
Juno's page: under the facts, "EPISODES (20)" (the CSS writes it in capitals) for a moment says "Loading the
episodes…", then lists all 20, from S01E01
"The Lighthouse Has Lost Its Blue" (1 March 2025) to S02E10. Open Pebble (#15): a single episode, S01E06. In the Network
tab, Juno's episodes arrive in one request: `episode/1,2,3,…`.
:::

:::mistake Common mistake
`data.map(…)` instead of `asList(data).map(…)`. It works for Juno, but on Pebble's page the API sends a single object,
not an array: the page goes blank, and the console says "data.map is not a function".
:::

:::try Task
Long lists are tiring: show only the first 5 episodes, with a "Show all" button. You need a `useState(false)` for
`showAll`, then `const episodes = asList(data)`, and `(showAll ? episodes : episodes.slice(0, 5)).map(…)`.
:::

### Relationships: who else lives there?

The characters are connected: they live in the same places, and meet in the same episodes. Let's show who else was last
seen at the same place as the character. The data is there, two links away:

1. The character's `location.url` points to a place: `/api/location/1`.
2. The place lists its residents, again as addresses: `residents: ['…/api/character/1', '…/api/character/3', …]`.
3. Their ids (without the character's own) fetch the others in one request: `/api/character/3,4,6,17`.

So there are two requests, and the second needs the answer of the first. Add `locationUrl` to the end of `src/api.js`:

```js file=src/api.js
// One place: /api/location/1?lang=en
export function locationUrl(id) {
  return `${API}/location/${id}?lang=${LANG}`
}
```

`characterUrl` needs no sibling: give it `'3,4,6,17'` instead of a single id, and it builds the right address. The
section goes into `src/components/SamePlace.jsx`:

```jsx file=src/components/SamePlace.jsx mark=9,12-16
import useFetch from '../useFetch.js'
import { asList, characterUrl, idFromUrl, locationUrl } from '../api.js'
import CharacterCard from './CharacterCard.jsx'
import ErrorMessage from './ErrorMessage.jsx'

// Who else was seen at the same place? Two requests, one after the other.
function SamePlace({ character }) {
  // 1. The place itself. Its residents are the addresses of characters.
  const place = useFetch(locationUrl(idFromUrl(character.location.url)))

  // 2. The other residents (everyone but this character), in a single request.
  let otherIds = []
  if (place.status === 'success') {
    otherIds = place.data.residents.map(idFromUrl).filter((id) => id !== character.id)
  }
  const others = useFetch(otherIds.length > 0 ? characterUrl(otherIds.join(',')) : null)

  return (
    <section className="section">
      <h3 className="section-title">Also here: {character.location.name}</h3>
      {(place.status === 'loading' || others.status === 'loading') && <p className="state">Loading…</p>}
      {place.status === 'error' && <ErrorMessage text="The place could not be loaded." onRetry={place.retry} />}
      {others.status === 'error' && <ErrorMessage text="Its residents could not be loaded." onRetry={others.retry} />}
      {place.status === 'success' && otherIds.length === 0 && <p className="state">Nobody else has been seen here.</p>}
      {others.status === 'success' && (
        <ul className="grid grid--small">
          {asList(others.data).map((other) => (
            <CharacterCard key={other.id} character={other} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default SamePlace
```

- `place` and `others` are two calls of the same hook, and each has its own state. This is why we do not take them
  apart into `status` and `data`, but read `place.status` and `others.data`.
- While the place's data is on its way, `otherIds` is empty. Then it holds the residents' ids, without the character's
  own: `filter` keeps only the ids that do not match (`!==`) the character's.
- `useFetch(otherIds.length > 0 ? … : null)`: while there is nothing to ask for, the address is `null`, and our hook
  stays `'idle'`. As soon as the place arrives, the address appears, and the effect sends the second request. This is
  why `useFetch` accepts a missing address: a hook cannot be called inside an `if`, but its argument can say "nothing
  yet".
- The cards are the same `CharacterCard`s as in the list, so they are links too.

In `src/components/CharacterDetail.jsx`, import the new component next to `EpisodeList`, and put it above the episode
list. Only these lines change; the rest of the file stays as it was:

```jsx file=src/components/CharacterDetail.jsx mark=2,11
import EpisodeList from './EpisodeList.jsx'
import SamePlace from './SamePlace.jsx'

// … factsOf and the beginning of CharacterDetail, as before

      {status === 'success' && (
        <>
          <div className="detail__main">
            {/* … the picture and the facts, as before … */}
          </div>
          {data.location.url && <SamePlace character={data} />}
          <EpisodeList episodeUrls={data.episode} />
        </>
      )}
```

Not every character has a known place: Mister Gloam drifts somewhere in the fog. The API's `location.url` is then an
empty string, and `&&` draws nothing.

:::check Check
Juno's page: "ALSO HERE: PLUMAGE POINT", with Steepwell, Dot Blotsworth, Granny Marjoram and Sprocket. Click Steepwell:
his page opens from the top, and now Juno is among his neighbours. Ottoline Inkwell (#22) is alone at Cobalt Cliffs:
"Nobody else has been seen here." Mister Gloam (#28) has no such section at all.
:::

:::mistake Common mistake
Calling `useFetch` inside an `if`: `if (place.status === 'success') { const others = useFetch(…) }`. React stops with
an error: on the first drawing the component called one hook, on the next one two, and React tells hooks apart only by
their order. Call every hook at every drawing, and let the address be `null` while there is nothing to ask for.
:::

:::try Try it
Open Pebble (#15): Pebble lives at Crayon Caverns with a single other character, Chanterelle. Which line of `SamePlace`
makes this work?
(`asList`: for one id the API answers with an object again.)
:::

### Editable entries

A wiki is written by its fans. Every character gets a fan entry: a few lines that anyone can write and edit. The
lesson's API can only be read, like most public fan APIs, so the entries are saved in your browser, in
[[localStorage]], and the page shows them next to the API's data.

You wrote a `useLocalStorage` hook in earlier lessons (for example in lesson 6, "Flashcards", and lesson 9, "To-Do
List"); create `src/useLocalStorage.js`:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Like useState, but the value is also kept in the browser's localStorage.
function useLocalStorage(key, startValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? startValue : JSON.parse(saved)
    } catch {
      return startValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Full, or the browser does not allow it: the value still stays in memory.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

A quick recap: the first value is read from the storage only once, at the start (a lazy initial state), and turned back
from JSON text into an object with `JSON.parse`. After every change the effect writes it back with `JSON.stringify`.
Both are in a `try`, because the storage can be full, or blocked in a private window.

The entry gets a component of its own: `src/components/WikiEntry.jsx`.

```jsx file=src/components/WikiEntry.jsx
import { useState } from 'react'
import useLocalStorage from '../useLocalStorage.js'

function WikiEntry({ character }) {
  // Every entry in one object, by the characters' ids: { 1: '…', 7: '…' }
  const [entries, setEntries] = useLocalStorage('fan-wiki-entries', {})
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const text = entries[character.id] ?? ''

  function startEditing() {
    setDraft(text)
    setEditing(true)
  }

  function save(event) {
    event.preventDefault()
    setEntries({ ...entries, [character.id]: draft.trim() })
    setEditing(false)
  }

  return (
    <section className="section entry">
      <h3 className="section-title">Fan entry</h3>
      {editing ? (
        <form className="entry__form" onSubmit={save}>
          <label className="field">
            <span>What do you know about {character.name}?</span>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus />
          </label>
          <div className="entry__actions">
            <button type="submit" className="button--primary">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {text ? (
            <p className="entry__text">{text}</p>
          ) : (
            <p className="entry__empty">Nobody has written about them yet. Be the first!</p>
          )}
          <button type="button" onClick={startEditing}>
            {text ? 'Edit' : 'Write an entry'}
          </button>
        </>
      )}
    </section>
  )
}

export default WikiEntry
```

- Every entry lives in one object, under one localStorage key, by the characters' ids. `entries[character.id] ?? ''`
  reads this character's entry; `??` gives `''` when there is none (the value is `undefined`).
- Two more pieces of state: `editing` (are we reading or editing?) and `draft`, the text being edited. The draft is
  separate on purpose: until you press Save, the saved entry stays as it was, so Cancel simply drops the draft.
- `save` is the form's `onSubmit`: the Save button (`type="submit"`) sends the form. `event.preventDefault()` stops
  the browser's [[default behavior]], reloading the page. `{ ...entries, [character.id]: draft.trim() }` is a copy of all
  the entries with this one replaced or added; an empty text clears the entry.
- `autoFocus` puts the keyboard focus into the text box as soon as it appears, so you can type straight away.
- `entry__text` keeps the line breaks you typed (`white-space: pre-line` in `App.css`).

In `src/components/CharacterDetail.jsx`, import `WikiEntry` too, and put it right under the picture and the facts:

```jsx file=src/components/CharacterDetail.jsx mark=3,12
import EpisodeList from './EpisodeList.jsx'
import SamePlace from './SamePlace.jsx'
import WikiEntry from './WikiEntry.jsx'

// … factsOf and the beginning of CharacterDetail, as before

      {status === 'success' && (
        <>
          <div className="detail__main">
            {/* … the picture and the facts, as before … */}
          </div>
          <WikiEntry character={data} />
          {data.location.url && <SamePlace character={data} />}
          <EpisodeList episodeUrls={data.episode} />
        </>
      )}
```

:::check Check
On Steepwell's page, click "Write an entry", type two lines and click "Save": the text appears, with its line break.
Reload the page: it is still there. Click "Edit", change something, then click "Cancel": the saved text stays. Save an empty
box: "Nobody has written about them yet." again. Congratulations, your fan wiki is done!
:::

:::mistake Common mistake
Writing every keystroke straight into `entries`, without a draft. It seems to work, but Cancel can no longer undo
anything, because the change is already saved.
:::

:::concept How would a real wiki save an entry?
On a server that accepts changes. Every request has an [[HTTP method]]: so far in this lesson we have only sent `GET`
("give me"); in lesson 21 you sent `POST` to log in. A change goes with `POST` (something new), `PUT` or `PATCH` (a
change) or `DELETE`, and the data travels in the request's body:

```js
await fetch(`/api/character/${character.id}/entry`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: draft.trim() }),
})
```

The lesson's pretend server has no such address, but MSW could answer one too: `http.patch(…)` in `handlers.js`, next
to the `http.get(…)` ones.
:::

:::try Task
Mark the characters that already have an entry: in `CharacterCard`, read the entries with
`useLocalStorage('fan-wiki-entries', {})`, and put a ✎ after the name when `entries[character.id]` is not empty.
:::
