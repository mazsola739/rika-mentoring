# What we build

A finder for TV series. You type a title, the results appear as cards with posters, and a click on a card opens a page
with everything about that series. The data comes from a real HTTP API, the lesson's own TV API, which runs right in
your browser and holds made-up series (so the "movies" are TV series this time). On the way you learn how a React app
talks to a server: requests with `fetch`, loading and error states, your own `useFetch` and `useDebounce` hooks, and
pages with a parameter in their address, such as `#/show/42`.

:::levels
- A search box and results with title and poster, with a loading message and an error message. | about 2 hours
- A page for every series, a search that starts once you stop typing, and friendly "no results" and error states. | about 3 hours
- The search kept in the address, filters by genre and decade, favorites, and the whole catalogue page by page. | about 3 hours
:::

**Before you start you need:** the earlier lessons, above all these: lesson 1 (pages on the part of the address after
`#`, with your own `useHashRoute` hook), lesson 2 (Context), lesson 3 (controlled inputs, the `key` trick), lessons 6
and 9 (the `useLocalStorage` hook) and lesson 14, "Currency Converter" (`fetch`, loading and error states, its `useFetch`
hook and the pretend server with MSW). Where we use something familiar in a new way, we explain it again.

## Beginner level {level=1}

### Before you start

This lesson's exercise, a ready starting project, is in the course repository, in the `lessons/20-movie-search/exercise`
folder (the "Exercise on GitHub" button above opens that folder on GitHub). You start the same way as in lesson 1, and
its step 0 explains every command in detail. In short: open a terminal in your work folder, where the `rika-mentoring`
repository is, bring in the new lessons, then copy this lesson's `exercise` folder out of the repository as
`movie-search`:

```shell
cd rika-mentoring
git pull        # brings the new lessons
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/20-movie-search/exercise movie-search
```

No repository yet? Run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the first three lines.
No git? On the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**,
and copy the `lessons/20-movie-search/exercise` folder out of it into your work folder as `movie-search`. You work in
your copy: the repository stays untouched, so `git pull` keeps working.

Open the `movie-search` folder in your editor (in VS Code: **File** → **Open Folder**), open a terminal in it
(**Terminal** → **New Terminal**), and start the project:

```shell
npm install     # needed once: downloads the project's packages (React, Vite and MSW)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). At the top of a dark blue page you see the
turquoise title "Movie Search".
:::

Leave the server running. In a second terminal (the **+** button of the terminal panel), make your copy a git
repository with one commit, the starting point:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step
that works. If git asks who you are, step 0 of lesson 1 shows how to give it your name and e-mail.

The exercise has a few more files than usual:

- `src/App.jsx`: the page. For now it shows only the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so you don't write styles:
  you only use the class names the steps give (`search`, `grid`, `card`, …). Have a look inside anyway!
- `src/mocks/`: the lesson's TV API, the "pretend server" described right below.
- `public/mockServiceWorker.js`: a file that belongs to the MSW package. Leave it as it is.
- `src/main.jsx`: it starts the TV API first, and only then draws the page.

:::concept A pretend server in your browser
You know this from lesson 14: the exercise has a pretend server again, this time a TV API. A short reminder: most web
apps get their data from a [[server]], another computer that answers the requests the app sends to it. A set of
addresses that a program (not a person) can send requests to, together with the rules of what it can ask, is an [[HTTP
API]]. Each address of it, for example "search the series", is an [[endpoint]].

This API doesn't run on another computer either: [[Mock Service Worker]] (MSW for short) runs it right in your browser.
A [[service worker]] is a small script that the browser runs next to the page and that can catch the page's requests.
MSW's own service worker (`public/mockServiceWorker.js`) catches every request that goes to an
address starting with `/api/`, and answers it from the data in `src/mocks/`, just as a real server would: with JSON
data, after a short delay, and with an error code when something is wrong. Your code cannot tell the difference. It
calls `fetch('/api/tv/…')` exactly as it would call a TV API on the internet, so everything you learn here works with
real servers too. In `src/main.jsx`, the line `await startMockApi(handlers)` starts the pretend server before React
draws the page.

The endpoints you will use are listed at the top of `src/mocks/handlers.js`. The series, the posters and the cast are
all made up, and their titles and descriptions are in English, the way the API sends them.
:::

:::mistake Common mistake
Opening the page from your phone: you start the server with `npm run dev -- --host` (as in lesson 3) and open the
address on its "Network" line (`http://192.168…`). Browsers run service workers only on safe addresses (`https://…` and
`localhost`), so there the pretend server cannot start, and every search ends in an error. Work on your computer, at
`localhost`.
:::

:::try Try it
Ask the API something before you write any React. Open the browser's Console (++F12++ → Console), type this line and
press ++Enter++ (if you paste it instead, Chrome first asks you to type `allow pasting`):

```js
fetch('/api/tv/search/shows?q=lighthouse').then((response) => response.json()).then(console.log)
```

After a moment, a list of two objects appears: the two series with "lighthouse" in their titles. Click the small
triangles to look inside them.
:::

### The search box

The first piece of the page is a search form. Its field is a [[controlled input]], as in lesson 3: its value comes from
state, and every keystroke updates the state. Replace the whole `src/App.jsx` (the marked lines are new):

```jsx file=src/App.jsx mark=1,5-12,17-31
import { useState } from 'react'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  function handleSubmit(event) {
    // Without this, the browser would reload the page, as it does with every form.
    event.preventDefault()
    setSubmitted(query.trim())
  }

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={handleSubmit}>
        <label className="search__field">
          <span>Search TV series</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. lighthouse"
          />
        </label>
        <button type="submit">Search</button>
      </form>

      {submitted && <p className="status">You searched for: {submitted}</p>}
    </main>
  )
}

export default App
```

- A form is **submitted** when you press ++Enter++ in its field or click its `type="submit"` button. Then `onSubmit`
  calls `handleSubmit`. The browser's [[default behavior]] on submitting a form is to load a new page;
  `event.preventDefault()` stops that, just like in lesson 1's contact form.
- There are two pieces of state. `query` follows your typing letter by letter; `submitted` changes only when you submit
  the form. `trim()` cuts the spaces off both ends of the text.
- `type="search"` makes a field meant for searching: on phones the keyboard gets a "search" key, and some browsers add a
  small × to clear it. `role="search"` tells screen readers that this form is the page's search.
- `{submitted && …}` is [[conditional rendering]]: the line appears only when `submitted` is not an empty string.

:::check Check
Type `lighthouse` and press ++Enter++ (or click "Search"): "You searched for: lighthouse" appears under the form, and
the page does not reload. Type something else into the box: the line stays as it was until you search again.
:::

:::mistake Common mistake
Leaving out `event.preventDefault()`. Then the page reloads at every search, so the line never stays, and a `?` appears
at the end of the address.
:::

### Your first request

Now let's send the text to the TV API. The search endpoint is `/api/tv/search/shows`, and it wants the text in the
address: `/api/tv/search/shows?q=lighthouse`. The part after the `?` is the [[query string]], made of the [[query
parameters|query parameter]] you met in lesson 14: `name=value` pairs that pass extra details to the server. Here the name is `q` (short for "query"), the value is the text.

A text can contain characters that mean something else in an address: a space, `&`, `?` or `#`. `encodeURIComponent`,
which you know from lessons 4 and 6, turns them into safe codes ([[URL encoding]]): `three a.m.` becomes `three%20a.m.`,
and the server turns it back. The addresses of the API get a file of their own. Create `src/api.js`:

```js file=src/api.js
// The address of the lesson's TV API. It answers in the browser (see src/mocks), but we call it like any real server.
const API = '/api/tv'

// The address of a search: searchUrl('three a.m.') → '/api/tv/search/shows?q=three%20a.m.'
export function searchUrl(text) {
  return `${API}/search/shows?q=${encodeURIComponent(text)}`
}
```

A short recap of [[fetch]] from lesson 14. `fetch(address)` sends a request, and gives back a [[Promise]] right away: a
promise that an answer will come. `await` waits for it, inside an [[async function]]. What arrives first is the
[[response|HTTP response]]: the status of the answer and its [[headers|header]], name–value pairs that travel before
the content (for example, what kind of data is coming). The body, the data itself, comes after it, so
`response.json()` is a second promise: it reads the body and turns the [[JSON]] text into JavaScript arrays and objects.
Change `src/App.jsx` like this:

```jsx file=src/App.jsx mark=2,7,9,11-16,36-40
import { useState } from 'react'
import { searchUrl } from './api.js'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  async function handleSubmit(event) {
    event.preventDefault()
    const text = query.trim()
    // An empty search would only get an error from the API (400 Bad Request).
    if (text === '') return
    const response = await fetch(searchUrl(text))
    const data = await response.json()
    setResults(data)
  }

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={handleSubmit}>
        <label className="search__field">
          <span>Search TV series</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. lighthouse"
          />
        </label>
        <button type="submit">Search</button>
      </form>

      <ul>
        {results.map((result) => (
          <li key={result.show.id}>{result.show.name}</li>
        ))}
      </ul>
    </main>
  )
}

export default App
```

The `submitted` state is gone: what we show now are the results. The API answers with an array, best matches first.
Every item is an object with two fields: `score` (how well the series matches, between 0 and 1) and `show`, the series
itself, a big object with dozens of fields. For now we only need two of them: the `id`, which is unique, so it is a good
[[key]], and the `name`.

:::check Check
Search for `lighthouse`: a list with two titles appears, "Lighthouse at Lowtide" and "Lighthouse at Lowtide: The
Keeper's Log". Open the developer tools (++F12++) on the Network tab and search again: a new line appears,
`shows?q=lighthouse`, with status 200. In the Size column it says "(ServiceWorker)": the pretend server answered. Click
the line, and the Preview tab shows the whole answer.
:::

:::mistake Common mistake
Leaving out the second `await`: `const data = response.json()`. Then `data` is not the list but a promise, the page goes
blank (even the "Movie Search" title disappears), and the Console says "results.map is not a function".
:::

:::try Try it: what does a failure look like?
Delete the `if (text === '') return` line for a moment, and search with an empty box. The API answers "400 Bad Request"
with an object (`{ error, message }`) instead of a list, and the page breaks the same way. Put the line back. Two steps
from now the page will not break from such answers.
:::

### Cards with posters

Every result should be a card with a poster. First look at what the API sends about a series (Network tab → Preview). It
is big, and much of it is nested: the poster is at `image.medium`, but a series without a poster has `image: null`; the
first episode's date is `premiered: '2019-09-24'`, or `null` if the series has not started yet; the rating is
`rating.average`.

The cards need only a few fields, so we turn every API series into a small object of our own. It will be "flat": every
field sits right in it, not inside another object, so we can write `show.poster` instead of `apiShow.image.medium`.
Write this function at the end of `src/api.js`:

```js file=src/api.js
// The API's series objects are big and nested; the cards need only a few flat fields.
export function toShow(apiShow) {
  return {
    id: apiShow.id,
    name: apiShow.name,
    // Not every series has a poster: then image is null.
    poster: apiShow.image ? apiShow.image.medium : null,
    // '2019-09-24' → 2019. A series that has not started yet has no premiere date.
    year: apiShow.premiered ? Number(apiShow.premiered.slice(0, 4)) : null,
    genres: apiShow.genres,
    rating: apiShow.rating.average,
  }
}
```

`slice(0, 4)` cuts the first four characters out of the date, and `Number()` turns the text `'2019'` into the number 2019.
The rest of the app never has to know how the API stores things: if the API changes, only `toShow` needs to change.

The poster gets a component of its own, because the series page will use it too. Create `src/components/Poster.jsx`:

```jsx file=src/components/Poster.jsx
// The poster of a series, or a placeholder box if the API has no picture for it.
function Poster({ src }) {
  if (!src) {
    return <div className="poster poster--empty">No poster yet</div>
  }
  // alt="" because the title is written right under the picture: a screen reader need not read it twice.
  return <img className="poster" src={src} alt="" loading="lazy" />
}

export default Poster
```

- If there is no picture (`src` is `null`), the component returns the placeholder straight away: an [[early return]].
  The `<img>` line runs only when there is a picture.
- The posters come from the TV API too (for example `/api/tv/posters/1/medium.svg`), and MSW answers these requests as
  well: the pictures are drawn in code.
- `loading="lazy"` is the [[lazy loading]] from lesson 12: the browser downloads a picture only when it gets near the
  screen.
- [[alt text]] describes a picture for those who cannot see it. Here the title of the series stands right under the
  poster, so an empty `alt` is the right choice.

Then create the card, `src/components/ShowCard.jsx`:

```jsx file=src/components/ShowCard.jsx
import Poster from './Poster.jsx'

// One result: the poster, the title, the year and the genres.
function ShowCard({ show }) {
  return (
    <li className="card">
      <Poster src={show.poster} />
      <h2 className="card__title">{show.name}</h2>
      <p className="card__meta">
        {show.year ?? 'Coming soon'} · {show.genres.join(', ')}
      </p>
    </li>
  )
}

export default ShowCard
```

`??` is [[nullish coalescing]] from lesson 13: it gives the value on its left, unless that is `null` or `undefined`, and
then the one on its right. `join(', ')` makes one text from the genres, with a comma and a space between them.

In `App`, every result goes through `toShow`, and the list becomes a grid of cards. Here is the whole file:

```jsx file=src/App.jsx mark=2-3,17-18,38-42
import { useState } from 'react'
import { searchUrl, toShow } from './api.js'
import ShowCard from './components/ShowCard.jsx'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  async function handleSubmit(event) {
    event.preventDefault()
    const text = query.trim()
    // An empty search would only get an error from the API (400 Bad Request).
    if (text === '') return
    const response = await fetch(searchUrl(text))
    const data = await response.json()
    // Every hit is { score, show }: we keep only the series, in our own small shape.
    setResults(data.map((result) => toShow(result.show)))
  }

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={handleSubmit}>
        <label className="search__field">
          <span>Search TV series</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. lighthouse"
          />
        </label>
        <button type="submit">Search</button>
      </form>

      <ul className="grid">
        {results.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </ul>
    </main>
  )
}

export default App
```

:::check Check
After saving, press ++F5++: Vite's fast refresh would keep the previous step's results, which still have the old
`{ score, show }` shape, and the page would go blank with "Cannot read properties of undefined (reading 'join')". Then
search for `lighthouse`: two cards. The first has a poster (a beam of light over dark water), and "2019 · Drama,
Mystery" under the title. The second has a dashed box with "No poster yet", and "Coming soon · Drama, Mystery". Search
for `the`: ten cards, as many in a row as fit in the window.
:::

:::mistake Common mistake
`poster: apiShow.image.medium` in `toShow`, without the check. Then not a single card appears for `lighthouse`: for the
series without a poster, `image` is `null`, so `toShow` throws an error before the results get into the state, and the
Console says "Uncaught (in promise) TypeError: Cannot read properties of null (reading 'medium')". Data from a server
can always have holes; check them before you read into them.
:::

:::try Task
Show the rating on the cards too: a third line, `★ 8.1`, but only for series that have a rating (`show.rating !==
null`). The `card__meta` class looks right for it.
:::

### Loading and error messages

A request takes time, and it can go wrong. Right now the page says nothing while it waits, and if the answer is an
error, it quietly gets stuck: an error appears in the Console, and nothing changes on the page. A request is always in one of four states: nothing has been asked yet (`'idle'`), we are waiting
for the answer (`'loading'`), the answer has arrived (`'success'`), or something went wrong (`'error'`). One piece of
state, `status`, tells which one, and the page shows something different for each.

How do we know that something went wrong? Every HTTP answer starts with an [[HTTP status code]]: 200 means OK, 400 a bad
request, 404 that there is no such thing, 429 too many requests, 500 a server error. Watch out: `fetch` only fails (its
promise is rejected) when no answer arrives at all, for example without a network. An answer with a 404 or a 429 is
still an answer for `fetch`. `response.ok` tells whether the code means success (200–299), so we check it
ourselves and, if it is not OK, we [[throw an error|throwing an error]]. `throw` stops the function there, and the code
goes on in the `catch` part of the [[try/catch]]. Here is the whole `src/App.jsx`, as it looks at the end of the
beginner level:

```jsx file=src/App.jsx mark=9,16-29,32-34,53-63,69
import { useState } from 'react'
import { searchUrl, toShow } from './api.js'
import ShowCard from './components/ShowCard.jsx'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // 'idle', 'loading', 'success' or 'error'

  async function handleSubmit(event) {
    event.preventDefault()
    const text = query.trim()
    // An empty search would only get an error from the API (400 Bad Request).
    if (text === '') return
    setStatus('loading')
    try {
      const response = await fetch(searchUrl(text))
      // ok is true when the status code means success (200–299).
      if (!response.ok) {
        throw new Error(`The TV API answered ${response.status}`)
      }
      const data = await response.json()
      // Every hit is { score, show }: we keep only the series, in our own small shape.
      setResults(data.map((result) => toShow(result.show)))
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  let message = ''
  if (status === 'loading') message = 'Searching…'
  if (status === 'success') message = `${results.length} series found.`

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={handleSubmit}>
        <label className="search__field">
          <span>Search TV series</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. lighthouse"
          />
        </label>
        <button type="submit">Search</button>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <p className="notice notice--error" role="alert">
          The search did not work. Wait a few seconds and try again.
        </p>
      )}

      {status === 'success' && (
        <ul className="grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
```

- `message` is a [[derived value]]: it follows from `status` and `results`, so it is worked out again at every render,
  and needs no state of its own.
- The status line is always on the page, only its text changes. [[aria-live]] asks screen readers to read out the new
  text when it changes, so "Searching…" and "2 series found." can be heard too. `role="alert"` on the error asks them to
  read it out at once.
- The grid appears only after a successful answer. While a new search is loading, the old cards disappear, so nobody
  mistakes them for the new results.

:::check Check
Search for something: "Searching…" shows for a moment, then "2 series found." (or as many as there are) and the cards.
Now let's make the API angry on purpose. Click in the search box and press ++Enter++ quickly, again and again, more than
20 times. Like many real APIs, ours allows at most 20 requests in 10 seconds; after that it answers "429 Too Many
Requests". The cards disappear, and the message with the orange border appears. In the Network tab, the 429 lines are
red. Wait ten seconds, search again: everything works. The beginner level is done: commit it!
:::

:::mistake Common mistake
Leaving out the `try` and the `catch`, and keeping only the lines that were inside the `try`. The thrown error then has
nowhere to go: after a failed request,
"Searching…" stays on the page forever, and the Console says "Uncaught (in promise) Error: The TV API answered 429".
:::

:::try Try it
While a search is running, it makes no sense to start it again. Add `disabled={status === 'loading'}` to the "Search"
button: while the page is waiting for an answer, the button cannot be clicked.
:::

## Intermediate level {level=2}

### Search as you type: a useFetch hook

Most search boxes today don't need a button: the results follow your typing. That means a request every time the text
changes. Sending requests is work outside drawing, so its place is in a [[useEffect]], and as in lesson 14, we put it in
a [[custom hook]], `useFetch`. You give the hook an address, and it gives back the state of the request; when the
address changes, it asks again. You already wrote a `useFetch` in lesson 14; now we build it again, and better. One new
thing: it can be told that there is nothing to ask yet (the address is `null`).

But first a trap. When you type "lig" quickly, two requests go out one after the other: one for "li" and one for "lig".
The pretend server, like a real one, answers some requests faster than others. If the answer for "li" arrives later than
the one for "lig", it overwrites the newer results, and the page shows the results for a text that is no longer in the
box. This is the [[race condition]] you met in lessons 5, 9 and 14: the result depends on which of two things finishes
first.

In lesson 14, an `ignore` flag threw the old answer away, but the request itself still ran to the end. Now we use the
tool you read about there in a concept box: when a new request starts, we cancel the old one. That's what an
[[AbortController]] is for: `new
AbortController()` makes one, we give its `signal` to `fetch`, and `controller.abort()` cancels the request. The
cancelled `fetch` fails with an error, which we simply ignore. And when to cancel? Exactly when the [[cleanup function]]
of the effect runs: React calls it before it runs the effect again with a new address, and when the component
disappears. Create `src/useFetch.js`:

```js file=src/useFetch.js
import { useEffect, useState } from 'react'

// Loads JSON from the url, and loads it again whenever the url changes.
// Gives back { status, data }. status: 'idle' (no url), 'loading', 'success' or 'error'.
function useFetch(url) {
  const [result, setResult] = useState({ status: 'idle', data: null })

  useEffect(() => {
    if (!url) {
      setResult({ status: 'idle', data: null })
      return
    }

    const controller = new AbortController()
    setResult({ status: 'loading', data: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`The API answered ${response.status}`)
        }
        const data = await response.json()
        setResult({ status: 'success', data })
      } catch {
        // Cancelled by the cleanup below: a newer request took over, so we stay quiet.
        if (controller.signal.aborted) return
        setResult({ status: 'error', data: null })
      }
    }
    load()

    // Cleanup: when the url changes (or the component disappears), the old request is cancelled.
    return () => controller.abort()
  }, [url])

  return result
}

export default useFetch
```

- `status` and `data` live together in one object, because they always change together: a successful answer always has
  data, the other states never do.
- The function given to `useEffect` cannot itself be `async`: an async function always gives back a promise, but React
  looks for the cleanup function in what the effect gives back. So we write a small async function inside it (`load`),
  and call it right away.
- `{ status: 'success', data }` is short for `{ status: 'success', data: data }`: if the field has the same name as the
  variable, writing it once is enough.
- The [[dependency array]] here is `[url]`. `url` is a string, so the effect runs again only when the text really
  changes.

`App` no longer sends requests itself: it tells the hook which address it wants. One letter would match almost every
series, so the search starts from two letters; below that, the address is `null`, and the hook asks nothing. The button
goes, and the form only has to stop the reload when someone presses ++Enter++. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=3,9-13,23
import { useState } from 'react'
import { searchUrl, toShow } from './api.js'
import useFetch from './useFetch.js'
import ShowCard from './components/ShowCard.jsx'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const text = query.trim()
  // One letter would match almost everything, so the search starts from two.
  const { status, data } = useFetch(text.length >= 2 ? searchUrl(text) : null)
  // Every hit is { score, show }: we keep only the series, in our own small shape.
  const results = status === 'success' ? data.map((result) => toShow(result.show)) : []

  let message = ''
  if (status === 'loading') message = 'Searching…'
  if (status === 'success') message = `${results.length} series found.`

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search__field">
          <span>Search TV series</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. lighthouse"
          />
        </label>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <p className="notice notice--error" role="alert">
          The search did not work. Wait a few seconds and try again.
        </p>
      )}

      {status === 'success' && (
        <ul className="grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
```

`results` is a derived value now as well: it comes from the hook's answer at every render. The `useState` of `results`
and of `status` is gone, and so are `setResults`, `setStatus` and `handleSubmit`; `App` got simpler: it says **what** it
wants, and the hook takes care of **how**.

:::check Check
Type `lig` letter by letter: from the second letter on, the results follow your typing, and there is no button any more.
Watch the Network tab: from the second letter on, a request goes out for every letter, and if you type quickly, the
requests that a newer one replaced before their answer arrived end up "(canceled)" in red. Those are the requests our
cleanup function stopped.
:::

:::mistake Common mistake
Leaving out the `[url]` at the end of `useEffect`. Without a dependency array, the effect runs after every render.
Because it sets state, the page renders again, the effect runs again, and so on, without end. As soon as the page opens, the Console
fills up with "Maximum update depth exceeded" errors, and once you type two letters, the Network tab fills up with
hundreds of cancelled requests.
:::

:::try Try it
Type a long word quickly, delete it, type it again, and again. Sooner or later the API answers 429 (more than 20
requests in 10 seconds), and the error message appears. A request for every letter is too many: the next step fixes
that.
:::

### Wait until typing stops: useDebounce

When you type "lighthouse", it is pointless to search for "li", "lig", "ligh" and the rest: only the last one matters.
[[Debounce|debounce]] means waiting until something stops happening, and acting once, afterwards. Think of a lift door:
it waits for the last person to get in, and only closes when nobody has come for a few seconds.

We need a value that follows `query`, but only once `query` has stopped changing for a short while. That fits another
small custom hook. Create `src/useDebounce.js`:

```js file=src/useDebounce.js
import { useEffect, useState } from 'react'

// Gives back value, but late: it takes on the new value only once value has not changed for delay milliseconds.
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    // Every new value clears the previous timer, so only the last one fires.
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default useDebounce
```

Follow it through: every keystroke changes `value`, so the effect runs again. Before that, though, its cleanup stops the
previous timer with `clearTimeout` (you know [[setTimeout]] and cleaning up a timer from lesson 3). So while you keep
typing, no timer ever gets to the end. When you stop, the last timer runs out after `delay` milliseconds, sets `debounced`, and the hook gives
back the new text.

In `App`, only the line that makes `text` changes, plus an import. Change the beginning of `src/App.jsx` like this
(everything after the `useFetch` line stays as it was):

```jsx file=src/App.jsx mark=4,10-11
import { useState } from 'react'
import { searchUrl, toShow } from './api.js'
import useFetch from './useFetch.js'
import useDebounce from './useDebounce.js'
import ShowCard from './components/ShowCard.jsx'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  // The search waits until typing pauses for 400 milliseconds.
  const text = useDebounce(query.trim(), 400)
  // One letter would match almost everything, so the search starts from two.
  const { status, data } = useFetch(text.length >= 2 ? searchUrl(text) : null)
```

The input still shows `query`, so what you type appears at once; only the search waits.

:::check Check
Type `lighthouse` quickly: the Network tab shows a single request, about half a second after your last key. Now type
slowly, waiting a second after each letter: then a request goes out at every pause.
:::

:::mistake Common mistake
Leaving out the cleanup (`return () => clearTimeout(timer)`). Then nothing stops the old timers: every keystroke still
sets `debounced` 400 milliseconds later, and the requests go out one by one, just a little later.
:::

:::try Try it
Try a delay of 100 and of 1500 milliseconds. With 100 you still send many requests; with 1500 the page feels sluggish.
Most search boxes wait somewhere around 300–500 milliseconds.
:::

### Empty box, too short, no results, error

Our search is fast, but it does not say much. A good search page has an answer for every situation:

- the box is empty: tell what to type,
- the text is too short: say that two letters are needed,
- loading: "Searching…",
- error: say what happened, and offer to try again,
- no results: say so clearly, with a tip, instead of an empty page,
- results: how many, and the cards.

The "no results" box and the error box look alike: a title, and under it a line of text or a button. So a small
component for them is worth writing. Create `src/components/Notice.jsx`:

```jsx file=src/components/Notice.jsx
// A box for "no results" and for errors: a title, and under it whatever we put between the opening and closing tag.
function Notice({ title, error = false, children }) {
  return (
    <div className={error ? 'notice notice--error' : 'notice'} role={error ? 'alert' : undefined}>
      <p className="notice__title">{title}</p>
      {children}
    </div>
  )
}

export default Notice
```

[[children]] is the special prop you met with Context in lesson 2: whatever stands between `<Notice>` and `</Notice>`.
`error = false` is a [[default parameter]]: if we don't pass an `error` prop, it is `false`. A prop written without a
value (like `<Notice error>`) is `true`.

"Try again" works as in lesson 14's `useFetch`: the effect only runs again when one of its dependencies changes, but the
address stays the same. So the effect gets a second dependency, a counter (the same `attempt` as there): `retry`
increases it by one, the effect sees a change, and sends the request again. Here is the whole `src/useFetch.js`:

```js file=src/useFetch.js mark=4,7-8,37-43
import { useEffect, useState } from 'react'

// Loads JSON from the url, and loads it again whenever the url changes.
// Gives back { status, data, retry }. status: 'idle' (no url), 'loading', 'success' or 'error'.
function useFetch(url) {
  const [result, setResult] = useState({ status: 'idle', data: null })
  // Increasing this number repeats the request, even if the url stays the same.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!url) {
      setResult({ status: 'idle', data: null })
      return
    }

    const controller = new AbortController()
    setResult({ status: 'loading', data: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`The API answered ${response.status}`)
        }
        const data = await response.json()
        setResult({ status: 'success', data })
      } catch {
        // Cancelled by the cleanup below: a newer request took over, so we stay quiet.
        if (controller.signal.aborted) return
        setResult({ status: 'error', data: null })
      }
    }
    load()

    // Cleanup: when the url changes (or the component disappears), the old request is cancelled.
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setAttempt((n) => n + 1)
  }

  return { ...result, retry }
}

export default useFetch
```

`setAttempt((n) => n + 1)` uses an [[updater function]]: React hands it the current value, and stores what it gives
back. `{ ...result, retry }` is a new object with every field of `result` (that's the [[spread]]), plus `retry`.

Now `App` can tell the situations apart. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=6,9-10,15-17,22-25,48-52,55-61
import { useState } from 'react'
import { searchUrl, toShow } from './api.js'
import useFetch from './useFetch.js'
import useDebounce from './useDebounce.js'
import ShowCard from './components/ShowCard.jsx'
import Notice from './components/Notice.jsx'
import './App.css'

const MIN_LENGTH = 2

function App() {
  const [query, setQuery] = useState('')
  // The search waits until typing pauses for 400 milliseconds.
  const text = useDebounce(query.trim(), 400)
  // One letter would match almost everything, so the search starts from MIN_LENGTH letters.
  const tooShort = text.length < MIN_LENGTH
  const { status, data, retry } = useFetch(tooShort ? null : searchUrl(text))
  // Every hit is { score, show }: we keep only the series, in our own small shape.
  const results = status === 'success' ? data.map((result) => toShow(result.show)) : []

  let message = ''
  if (text === '') message = 'Type the title of a series, for example lighthouse, bakery or orbit.'
  else if (tooShort) message = 'Type at least two letters.'
  else if (status === 'loading') message = 'Searching…'
  else if (status === 'success' && results.length > 0) message = `${results.length} series found.`

  return (
    <main className="app">
      <h1>Movie Search</h1>

      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search__field">
          <span>Search TV series</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. lighthouse"
          />
        </label>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <Notice title="The search did not work." error>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </Notice>
      )}

      {status === 'success' && results.length === 0 && (
        <Notice title={`No series found for “${text}”.`}>
          <p>Check the spelling, or try a single word.</p>
        </Notice>
      )}

      {status === 'success' && results.length > 0 && (
        <ul className="grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
```

`if … else if …` checks the conditions in order, and stops at the first true one: an empty box is also "too short", but
because its condition comes first, it gets its own, friendlier sentence. `MIN_LENGTH` is a named constant: if you ever
want three letters, you change this one number in the search, and the word "two" in the message.

:::check Check
Empty box: "Type the title of a series, for example lighthouse, bakery or orbit." One letter, `l`: "Type at least two
letters." Then `xyz`: a dashed box, "No series found for “xyz”." with the tip under it. For the error, set the delay to
0 for a moment (`useDebounce(query.trim(), 0)`), click in the box, and hold down a letter key for two seconds: after 20
requests the API answers 429, and the orange box appears with the "Try again" button. Wait ten seconds, then click it:
the request goes out again, and this time an answer arrives (for your row of letters, probably "No series found"). Set
the delay back to 400.
:::

:::mistake Common mistake
`onClick={retry()}`, with brackets. As soon as the error box appears, that calls `retry` during drawing: it changes
state, so React draws again, which calls `retry` again, and so on. React gives up with "Too many re-renders", and the
page goes blank. Hand over the function, don't call it.
:::

### A page for every series: a route parameter

Every series should have a page of its own, with its own web address: `#/show/1` for the first, `#/show/32` for the
thirty-second. You did this in lesson 1, with `useHashRoute`: the hook gives back the part of the address after `#`, and
`App` decides from it which page to draw. The address has a changing part again, as the project's `slug` was there: here
it is the series' `id`. A changing part of a route like this has a name too: [[route parameter]]. We cut it out of the
address, and pass it on to the page.

First the hook. Create `src/useHashRoute.js`, the same as in lesson 1:

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

From now on there are two pages, so `App` only chooses between them, and the search gets a component of its own. But
one thing needs care. If the search text stayed in the search page's own state, it would disappear together with the
page as soon as you opened a series: when you came back, the box would be empty. So `query` stays in `App`, and the
search page gets it as a prop, together with a function to change it. This is [[lifting state up]], from lesson 3.
Create `src/components/SearchPage.jsx`; it is what `App` drew so far:

```jsx file=src/components/SearchPage.jsx mark=1-5,9-10,26,33,64
import { searchUrl, toShow } from '../api.js'
import useFetch from '../useFetch.js'
import useDebounce from '../useDebounce.js'
import ShowCard from './ShowCard.jsx'
import Notice from './Notice.jsx'

const MIN_LENGTH = 2

// The search page. The search text comes from App, so it survives a visit to a series page.
function SearchPage({ query, onQueryChange }) {
  // The search waits until typing pauses for 400 milliseconds.
  const text = useDebounce(query.trim(), 400)
  // One letter would match almost everything, so the search starts from MIN_LENGTH letters.
  const tooShort = text.length < MIN_LENGTH
  const { status, data, retry } = useFetch(tooShort ? null : searchUrl(text))
  // Every hit is { score, show }: we keep only the series, in our own small shape.
  const results = status === 'success' ? data.map((result) => toShow(result.show)) : []

  let message = ''
  if (text === '') message = 'Type the title of a series, for example lighthouse, bakery or orbit.'
  else if (tooShort) message = 'Type at least two letters.'
  else if (status === 'loading') message = 'Searching…'
  else if (status === 'success' && results.length > 0) message = `${results.length} series found.`

  return (
    <>
      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search__field">
          <span>Search TV series</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="e.g. lighthouse"
          />
        </label>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <Notice title="The search did not work." error>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </Notice>
      )}

      {status === 'success' && results.length === 0 && (
        <Notice title={`No series found for “${text}”.`}>
          <p>Check the spelling, or try a single word.</p>
        </Notice>
      )}

      {status === 'success' && results.length > 0 && (
        <ul className="grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </ul>
      )}
    </>
  )
}

export default SearchPage
```

The file is in the `components` folder, so its imports start with `../` when they reach up into `src`. The component has
no wrapper element of its own; `<>` and `</>` make a [[Fragment]], which groups the elements without putting anything
extra on the page.

The series page gets a simple start for now: it shows which series was asked for, and a "← Back to the search" link. It
gets two props from `App`: `id`, the route parameter, and `backHref`, the address of this link. Create
`src/components/ShowPage.jsx`:

```jsx file=src/components/ShowPage.jsx
// The page of one series, for example #/show/42. App gives it the id from the address.
function ShowPage({ id, backHref }) {
  return (
    <article className="detail">
      <a className="back" href={backHref}>
        ← Back to the search
      </a>
      <h2 className="detail__title">Series #{id}</h2>
    </article>
  )
}

export default ShowPage
```

Why does the link get its address from outside? Because `App` knows where it has to take you back to. For now it is
always the search page (`#/`); at the advanced level it will remember the search too.

The card becomes a link to its series' page. Replace `src/components/ShowCard.jsx`:

```jsx file=src/components/ShowCard.jsx mark=7,13
import Poster from './Poster.jsx'

// One result: the poster, the title, the year and the genres.
function ShowCard({ show }) {
  return (
    <li className="card">
      <a className="card__link" href={`#/show/${show.id}`}>
        <Poster src={show.poster} />
        <h2 className="card__title">{show.name}</h2>
        <p className="card__meta">
          {show.year ?? 'Coming soon'} · {show.genres.join(', ')}
        </p>
      </a>
    </li>
  )
}

export default ShowCard
```

Finally `App` becomes the router. Replace the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=2-4,8-9,11-13,18-22
import { useState } from 'react'
import useHashRoute from './useHashRoute.js'
import SearchPage from './components/SearchPage.jsx'
import ShowPage from './components/ShowPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  // The search text lives here, not in SearchPage, so it survives a visit to a series page.
  const [query, setQuery] = useState('')

  // #/show/42 → showId is '42'. The changing part of the address is the route parameter.
  const showId = path.startsWith('/show/') ? path.slice('/show/'.length) : null

  return (
    <main className="app">
      <h1>Movie Search</h1>
      {showId ? (
        <ShowPage id={showId} backHref="#/" />
      ) : (
        <SearchPage query={query} onQueryChange={setQuery} />
      )}
    </main>
  )
}

export default App
```

`startsWith` and `slice` work as in lesson 1: if the path starts with `/show/`, `showId` is the rest of it, otherwise
`null`. Note that `showId` is a string (`'32'`, not the number 32): everything that comes from an address is text.

:::check Check
Search for `moon`, and click "Moonbase Kindergarten": the address ends in `#/show/32`, the page shows "Series #32" and a
"← Back to the search" link. Click the link: you are back, and the search for `moon` is still there, with its results.
The browser's Back button works too. Now change the end of the address by hand so that it reads `#/show/3` (so after
the `#` comes `/show/3`), and press ++Enter++: "Series #3".
:::

:::mistake Common mistake
Leaving `const [query, setQuery] = useState('')` in `SearchPage` instead of moving it to `App`. Everything seems to
work, until you come back from a series: the box is empty, and the results are gone. A component's state lives only as
long as the component is on the page.
:::

:::concept What about React Router?
In bigger apps, routing is usually done by a separate package, most often [[React Router]]. With it, our two pages would be
described like this: `<Route path="/" element={<SearchPage />} />` and `<Route path="/show/:id" element={<ShowPage />}
/>`, and inside `ShowPage`, `const { id } = useParams()` would read the parameter. The `:id` in the pattern is exactly
our route parameter. React Router also handles addresses without `#` (`/show/42`) whose links still never reload the
page, pages inside pages, and much more. Our `useHashRoute` does the same basic job in a few lines, without a new package;
once you understand it, React Router will feel familiar.
:::

### The series page loads its data

The series page should now ask the API for the data of its series. The endpoint is `/api/tv/shows/` followed by the id:
`/api/tv/shows/1`. If there is no series with that id, the API answers 404 Not Found. That is a different situation from
an error that may pass: there is no point in offering "Try again", because the series will not appear. So the hook
should also tell which status code came back. Here is the whole `src/useFetch.js`, as it stays from now on:

```js file=src/useFetch.js mark=4,6,12,17,23-25,28,32-33
import { useEffect, useState } from 'react'

// Loads JSON from the url, and loads it again whenever the url changes.
// Gives back { status, data, httpStatus, retry }. status: 'idle' (no url), 'loading', 'success' or 'error'.
function useFetch(url) {
  const [result, setResult] = useState({ status: 'idle', data: null, httpStatus: null })
  // Increasing this number repeats the request, even if the url stays the same.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!url) {
      setResult({ status: 'idle', data: null, httpStatus: null })
      return
    }

    const controller = new AbortController()
    setResult({ status: 'loading', data: null, httpStatus: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          // The server answered, but with an error code (404, 429, 500…): we keep the code.
          setResult({ status: 'error', data: null, httpStatus: response.status })
          return
        }
        const data = await response.json()
        setResult({ status: 'success', data, httpStatus: response.status })
      } catch {
        // Cancelled by the cleanup below: a newer request took over, so we stay quiet.
        if (controller.signal.aborted) return
        // No answer at all, or not JSON: there is no code to keep.
        setResult({ status: 'error', data: null, httpStatus: null })
      }
    }
    load()

    // Cleanup: when the url changes (or the component disappears), the old request is cancelled.
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setAttempt((n) => n + 1)
  }

  return { ...result, retry }
}

export default useFetch
```

If the answer is not OK, the code now does not throw an error: it stores the status code and returns (`return`);
`catch` is left for the cases with no usable answer at all.

The API sends the description of a series as a little [[HTML]]: `<p>When the old keeper retires…</p>`, sometimes with
`<b>` tags in it. If we put it into JSX as it is, React shows it as text, tags and all. That's on purpose: React never
turns text into HTML by itself, because text that came from somewhere else could hide a harmful script ([[XSS]]). We
only need the text anyway. [[DOMParser]] is the browser's own HTML reader: it builds a document from the HTML without
running anything in it, and `textContent` gives back only the text. Add two functions to the end of `src/api.js`:

```js file=src/api.js
// The address of one series' data in the API: showUrl('42') → '/api/tv/shows/42'
export function showUrl(id) {
  return `${API}/shows/${encodeURIComponent(id)}`
}

// The API sends the description as a little HTML (<p>, <b>). We need only its text.
export function stripHtml(html) {
  if (!html) return ''
  return new DOMParser().parseFromString(html, 'text/html').body.textContent
}
```

The id comes from the address, where anyone can type anything; `encodeURIComponent` makes sure that whatever is in it
stays one piece of the API's address (a `/` or a `?` in it cannot change the request).

Now the series page itself. Replace `src/components/ShowPage.jsx`:

```jsx file=src/components/ShowPage.jsx mark=1-5,8,15-28,32-55
import { showUrl, stripHtml, toShow } from '../api.js'
import useFetch from '../useFetch.js'
import Notice from './Notice.jsx'
import Poster from './Poster.jsx'

// The page of one series, for example #/show/42. App gives it the id from the address.
function ShowPage({ id, backHref }) {
  const { status, data, httpStatus, retry } = useFetch(showUrl(id))

  return (
    <article className="detail">
      <a className="back" href={backHref}>
        ← Back to the search
      </a>

      {status === 'loading' && <p className="status">Loading the series…</p>}

      {status === 'error' && httpStatus === 404 && <Notice title="This series is not in the catalogue." />}

      {status === 'error' && httpStatus !== 404 && (
        <Notice title="The series could not be loaded." error>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </Notice>
      )}

      {status === 'success' && <ShowDetails apiShow={data} />}
    </article>
  )
}

// The details of a series that has arrived: poster, title, years, genres, rating and description.
function ShowDetails({ apiShow }) {
  const show = toShow(apiShow)
  const summary = stripHtml(apiShow.summary)
  // 2019–2023 for a series that has ended, 2021– for one that is still running.
  const years = show.year ? `${show.year}–${apiShow.ended ? apiShow.ended.slice(0, 4) : ''}` : 'Coming soon'

  return (
    <div className="detail__body">
      <div className="detail__poster">
        <Poster src={show.poster} />
      </div>
      <div className="detail__info">
        <h2 className="detail__title">{show.name}</h2>
        <p className="detail__meta">
          {years} · {show.genres.join(', ')}
        </p>
        {show.rating !== null && <p className="detail__rating">★ {show.rating} / 10</p>}
        <p className="detail__summary">{summary || 'No description yet.'}</p>
      </div>
    </div>
  )
}

export default ShowPage
```

- The page has two components. `ShowPage` handles the states of the request, and only draws `ShowDetails` once the data
  has arrived. That way `ShowDetails` never has to wonder whether `apiShow` is there yet.
- `ShowDetails` stays in the same file, without an export, because nobody else uses it.
- `toShow` and `Poster` come in handy again: the series page uses the same small shape and the same poster as the cards.
- `summary || 'No description yet.'`: if the text is empty, the `||` gives the right-hand side.

:::check Check
Click "Lighthouse at Lowtide" on the search page: the poster on the left, and next to it the title, "2019–2023 · Drama,
Mystery", "★ 8.1 / 10" and the description. Make the window narrow: the poster moves above the text. Change the end of
the address to `#/show/58`: no poster, "Coming soon · Drama, Mystery", no rating, and "No description yet.". And
`#/show/999`: "This series is not in the catalogue.". (The Console shows a red "404 (Not Found)" line: that is the
browser reporting the answer, not a bug.) The intermediate level is done: commit it!
:::

:::concept Why are there two requests for one page?
Open a series page with the Network tab showing: two requests go out for the same series, and the first one is
"(canceled)". This happens only during development, because of [[StrictMode]] (the `<StrictMode>` around `<App />` in
`src/main.jsx`). It puts every new component on the page, takes it off and puts it on again, to show bugs: an effect
without a proper cleanup would now do its work twice. Ours behaves: the first request is cancelled by the cleanup, the
second one goes through. In the finished, built app (`npm run build`) there is only one request.
:::

:::mistake Common mistake
`<p className="detail__summary">{apiShow.summary}</p>`, without `stripHtml`. The description then appears with its tags:
`<p>When the old keeper retires…</p>`.
:::

:::try Task
The API can send the cast of a series too: ask for `showUrl(id) + '?embed[]=cast'`. The cast is then at
`apiShow._embedded.cast`, an array of `{ person, character }` objects (look at it in the Network tab). Show the first
six of them under the description: the person's name (`person.name`) and their character's name (`character.name`).
:::

## Advanced level {level=3}

### The search in the address

Search for something, then press ++F5++: the search is gone. And if you send the address to a friend, they get an empty
search page too. Let's put the search into the address, like most search pages do: `#/?q=moon`. Then a reload keeps it,
the address can be shared, and the series page can remember which search it was opened from.

The `?q=moon` part is a query string, just like in the API's addresses, only this time after the `#`.
[[URLSearchParams]], which built a query string in lesson 15, can also take one apart: it makes an object from it, whose
`get('q')` [[method]] (a function that belongs to the object) gives the value of `q` (already decoded), or `null` if
there is none.

While typing, the address has to change, but without a new entry in the browser's history for every letter: you know
[[history.replaceState]] from lessons 6 and 7 for this. There's a catch, though: `replaceState` doesn't fire the
`hashchange` event, so our hook would not notice the change. The solution is to fire the event ourselves:
`window.dispatchEvent(new HashChangeEvent('hashchange'))` makes a `hashchange` event that every listener receives,
exactly as if the browser had sent it.

Here is the whole `src/useHashRoute.js`. The hook now gives back two things, and three small helper functions join it:

```js file=src/useHashRoute.js mark=3,5,7,10,16-17,19-35
import { useEffect, useState } from 'react'

const currentHash = () => window.location.hash.slice(1) || '/'

// Returns the part of the address after #, split in two: '#/show/3?q=moon' → path '/show/3', params q=moon.
function useHashRoute() {
  const [hash, setHash] = useState(currentHash)

  useEffect(() => {
    const onChange = () => setHash(currentHash())
    window.addEventListener('hashchange', onChange)
    // Clean up: when the component goes away, stop listening.
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const [path, search = ''] = hash.split('?')
  return { path, params: new URLSearchParams(search) }
}

// Changes the address without a new entry in the history: typing should not fill up the history (and the Back button).
export function replaceHash(newHash) {
  history.replaceState(null, '', newHash)
  // replaceState does not fire hashchange, so we fire it ourselves: useHashRoute listens to it.
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

// '#/?q=moon': the search page, with this search in it.
export function searchHash(query) {
  return query ? `#/?q=${encodeURIComponent(query)}` : '#/'
}

// '#/show/3?q=moon': a series page that remembers the search it was opened from.
export function showHash(id, query) {
  return query ? `#/show/${id}?q=${encodeURIComponent(query)}` : `#/show/${id}`
}

export default useHashRoute
```

`hash.split('?')` cuts the text in two at the `?`. If there is no `?` in it, there is only one piece, so `search` gets
its default value, the empty string: that is a default value in [[destructuring]].

`App` no longer keeps the search in state: it reads it from the address, and when you type, it writes the address. The
address is now the [[single source of truth]] for the search. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=1,7-9,14-17,22,24
import useHashRoute, { replaceHash, searchHash } from './useHashRoute.js'
import SearchPage from './components/SearchPage.jsx'
import ShowPage from './components/ShowPage.jsx'
import './App.css'

function App() {
  const { path, params } = useHashRoute()
  // The search is in the address (#/?q=moon), so it needs no state of its own.
  const query = params.get('q') ?? ''

  // #/show/42 → showId is '42'. The changing part of the address is the route parameter.
  const showId = path.startsWith('/show/') ? path.slice('/show/'.length) : null

  function changeQuery(newQuery) {
    replaceHash(searchHash(newQuery))
  }

  return (
    <main className="app">
      <h1>Movie Search</h1>
      {showId ? (
        <ShowPage id={showId} backHref={searchHash(query)} />
      ) : (
        <SearchPage query={query} onQueryChange={changeQuery} />
      )}
    </main>
  )
}

export default App
```

`useState` is gone from the imports: `App` has no state left. The "← Back to the search" link now takes you back to the
search you came from, because the card's link carries the search with it. Replace `src/components/ShowCard.jsx`: the
card gets the search as a new prop, `query`, and builds its link with `showHash`:

```jsx file=src/components/ShowCard.jsx mark=1,4-5,8
import { showHash } from '../useHashRoute.js'
import Poster from './Poster.jsx'

// One result: the poster, the title, the year and the genres. query: the search it was found with (if any).
function ShowCard({ show, query }) {
  return (
    <li className="card">
      <a className="card__link" href={showHash(show.id, query)}>
        <Poster src={show.poster} />
        <h2 className="card__title">{show.name}</h2>
        <p className="card__meta">
          {show.year ?? 'Coming soon'} · {show.genres.join(', ')}
        </p>
      </a>
    </li>
  )
}

export default ShowCard
```

The search page passes `query` on to the cards. In `src/components/SearchPage.jsx`, change only the line of the
`ShowCard`:

```jsx file=src/components/SearchPage.jsx mark=4
      {status === 'success' && results.length > 0 && (
        <ul className="grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} query={query} />
          ))}
        </ul>
      )}
```

:::check Check
Search for `moon`: the address ends in `#/?q=moon`, and it changes as you type. Press ++F5++: the search and its results
are still there. Click the "Moonbase Kindergarten" card: the address is `#/show/32?q=moon`. "← Back to the search" takes you back to the `moon`
search. Copy the address into a new tab: the same page opens. And the browser's Back button doesn't step back letter by
letter through what you typed.
:::

:::mistake Common mistake
`window.location.hash = searchHash(newQuery)` instead of `replaceHash`. It works, and you don't even need the extra
event, but every letter becomes a new entry in the history: after typing "lighthouse", you have to press Back ten times
just to get back to the empty search box.
:::

### Filters: genre and decade

When there are many results, it helps to narrow them down. Two filters come above the cards: buttons for the genres, and
a drop-down list for the decade of the premiere. The choices come from the results themselves: only genres and decades
that really occur among them.

- `flatMap`, which you used for the tags in lesson 11, is like `map`, but if the function gives back an array for each
  item, it makes one flat list of all of them. Three series with two genres each give one array of six genres, not
  three small arrays: that's [[flatMap]].
- The [[Set]] from lesson 3 keeps every value only once. `[...new Set(list)]` turns it back into an array with the
  [[spread]]: the genres without repeats.
- `sort()` puts texts in alphabetical order, and if we give it nothing else, it compares numbers as texts too. Here the
  latest decade should come first, so we give it a [[compare function]]: `(a, b) => b - a` puts the larger number
  first.

The filters, and the grid under them, go into a new component. Create `src/components/Results.jsx`:

```jsx file=src/components/Results.jsx
import { useState } from 'react'
import ShowCard from './ShowCard.jsx'

// 2017 → 2010: the first year of its decade.
function decadeOf(year) {
  return Math.floor(year / 10) * 10
}

// The results, with two filters. SearchPage gives it a new key for every search,
// so the filters start from "All genres" and "Any time" for every search.
function Results({ shows, query }) {
  const [genre, setGenre] = useState('') // '' means every genre
  const [decade, setDecade] = useState('') // '' means any time

  // Derived values: the choices come from the results themselves.
  const genres = [...new Set(shows.flatMap((show) => show.genres))].sort()
  const years = shows.filter((show) => show.year !== null).map((show) => show.year)
  const decades = [...new Set(years.map(decadeOf))].sort((a, b) => b - a)

  const visible = shows.filter((show) => {
    if (genre !== '' && !show.genres.includes(genre)) return false
    if (decade !== '' && (show.year === null || decadeOf(show.year) !== Number(decade))) return false
    return true
  })

  return (
    <>
      <div className="filters">
        <div className="filters__genres" role="group" aria-label="Genres">
          <button type="button" className="chip" aria-pressed={genre === ''} onClick={() => setGenre('')}>
            All genres
          </button>
          {genres.map((name) => (
            <button
              key={name}
              type="button"
              className="chip"
              aria-pressed={genre === name}
              onClick={() => setGenre(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <label className="filters__decade">
          <span>Premiered</span>
          <select value={decade} onChange={(event) => setDecade(event.target.value)}>
            <option value="">Any time</option>
            {decades.map((start) => (
              <option key={start} value={start}>
                {start}–{start + 9}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="status">No series match these filters.</p>
      ) : (
        <ul className="grid">
          {visible.map((show) => (
            <ShowCard key={show.id} show={show} query={query} />
          ))}
        </ul>
      )}
    </>
  )
}

export default Results
```

- `genres`, `decades` and `visible` are derived values: they are worked out from the results and the two filters at
  every render.
- A series without a premiere year (`null`) has no decade, so it only shows when the decade filter is "Any time".
- The `<select>` is a [[drop-down list]], and a controlled field: its `value` comes from state. Its value is always text
  (`'2010'`), so `Number(decade)` turns it into a number before comparing.
- [[aria-pressed]] tells screen readers which genre button is switched on, and the CSS colours it too. `role="group"`
  with an `aria-label` names the group of buttons.
- `{start}–{start + 9}` writes "2010–2019": the decade as a range of years, which reads the same in every language.

In the search page, the grid is replaced by `Results`. Every new search should start with "All genres" and "Any time".
`key={text}` makes sure of it, with the trick from lesson 3: when a component's [[key]] changes, React treats it as a
brand-new component, with fresh state. (While the next search is loading, `Results` is not on the page at all, so right
now its state would be thrown away even without the key. The key keeps working even if you later change the page to
keep the old cards on screen while a new search loads.) Here is the whole `src/components/SearchPage.jsx`:

```jsx file=src/components/SearchPage.jsx mark=5,57
import { searchUrl, toShow } from '../api.js'
import useFetch from '../useFetch.js'
import useDebounce from '../useDebounce.js'
import Notice from './Notice.jsx'
import Results from './Results.jsx'

const MIN_LENGTH = 2

// The search page. The search text comes from App, so it survives a visit to a series page.
function SearchPage({ query, onQueryChange }) {
  // The search waits until typing pauses for 400 milliseconds.
  const text = useDebounce(query.trim(), 400)
  // One letter would match almost everything, so the search starts from MIN_LENGTH letters.
  const tooShort = text.length < MIN_LENGTH
  const { status, data, retry } = useFetch(tooShort ? null : searchUrl(text))
  // Every hit is { score, show }: we keep only the series, in our own small shape.
  const results = status === 'success' ? data.map((result) => toShow(result.show)) : []

  let message = ''
  if (text === '') message = 'Type the title of a series, for example lighthouse, bakery or orbit.'
  else if (tooShort) message = 'Type at least two letters.'
  else if (status === 'loading') message = 'Searching…'
  else if (status === 'success' && results.length > 0) message = `${results.length} series found.`

  return (
    <>
      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search__field">
          <span>Search TV series</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="e.g. lighthouse"
          />
        </label>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <Notice title="The search did not work." error>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </Notice>
      )}

      {status === 'success' && results.length === 0 && (
        <Notice title={`No series found for “${text}”.`}>
          <p>Check the spelling, or try a single word.</p>
        </Notice>
      )}

      {status === 'success' && results.length > 0 && <Results key={text} shows={results} query={query} />}
    </>
  )
}

export default SearchPage
```

The `ShowCard` import moved to `Results`, so it is gone from here.

:::check Check
Search for `the`: ten results, and above them a row of genre buttons, with "All genres" lit up, and the "Premiered"
list. Click "Mystery": four series stay. Choose "2010–2019" in the list: two remain, "The Seventh Satellite" and "The
Clockmaker of Pell Street". Now search for `comedy`: the filters are back on "All genres" and "Any time".
:::

:::mistake Common mistake
Putting the two filter states (`genre`, `decade`) in `SearchPage` instead of `Results`, and passing them down as props.
`SearchPage` stays on the page from one search to the next, so the filters do too. Choose "Mystery" for `the`, then
search for `bakery`, and the page says "No series match these filters" although there is a result. The "Mystery" button
is not even there to switch off, because "Three A.M. Bakery" has no such genre. State that belongs to one search lives
in the component that the `key` resets.
:::

:::try Task
Put the filters in the address too, like the search: `#/?q=the&genre=Mystery`. `params.get('genre')` reads it. If you
need to write several values into the address, `URLSearchParams` can help: `new URLSearchParams({ q: 'the', genre: 'Mystery' }).toString()` gives
`'q=the&genre=Mystery'`.
:::

### Favorites

The series you like should be kept: a star in the corner of every card, and a "Favorites" page with the starred ones.
The favorites have to survive a reload, so they go into [[localStorage]], with the `useLocalStorage` hook you wrote in
lessons 6 and 9.
Many components need them: the cards (is the star on?), the favorites page, and the menu, which shows how many there
are. Passing them down through every component would be [[prop drilling]]; this is the job of [[Context]], as in lesson 2.

First the hook. It works the same as in lessons 6 and 9, and, as in lesson 6, the reading of the saved value sits in a
small function of its own, `readValue`. Create `src/useLocalStorage.js`:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Reads the value saved under the key. If there is nothing there, or it cannot be read, returns the initial value.
function readValue(key, initialValue) {
  try {
    const saved = localStorage.getItem(key)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // Blocked storage or broken JSON: start from the initial value.
  }
  return initialValue
}

// Works like useState, but the value survives a page reload.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue))

  // Save after every change, as text.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The storage is full or blocked: the app keeps working in memory.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

Then the Context, built like `ThemeContext` in lesson 2. Create `src/FavoritesContext.jsx`:

```jsx file=src/FavoritesContext.jsx
import { createContext, useContext } from 'react'
import useLocalStorage from './useLocalStorage.js'

const FavoritesContext = createContext(null)

// Keeps the favorite series (saved in localStorage), and shares them with every component inside.
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage('movie-search:favorites', [])

  function isFavorite(id) {
    return favorites.some((show) => show.id === id)
  }

  function toggleFavorite(show) {
    if (isFavorite(show.id)) {
      // A new array, without this series.
      setFavorites(favorites.filter((item) => item.id !== show.id))
    } else {
      // A new array: the new favorite first, the old ones after it.
      setFavorites([show, ...favorites])
    }
  }

  return <FavoritesContext value={{ favorites, isFavorite, toggleFavorite }}>{children}</FavoritesContext>
}

// Any component inside FavoritesProvider reads the favorites with this hook.
export function useFavorites() {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error('useFavorites must be used inside <FavoritesProvider>')
  return value
}
```

- A favorite is the small object made by `toShow` (`id`, `name`, `poster`, `year`, `genres`, `rating`). It has
  everything a card needs, so the favorites page can draw the cards without a single request.
- `some` gives `true` if at least one item passes the test: here, if a favorite has this `id`.
- The state is never changed in place: `filter` and `[show, ...favorites]` both make a new array.
- As with `ThemeContext.jsx` in lesson 2, the terminal may print "Could not Fast Refresh" when you change this file,
  because it exports a hook next to a component. Nothing is wrong: Vite simply reloads the page.

The whole app goes inside the Provider, in `src/main.jsx`:

```jsx file=src/main.jsx mark=5,15-17
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FavoritesProvider } from './FavoritesContext.jsx'
import { startMockApi } from './mocks/msw.js'
import { handlers } from './mocks/handlers.js'

// First the pretend TV API starts (see src/mocks), so even the very first fetch('/api/tv/…') gets an answer.
await startMockApi(handlers)

// Then React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FavoritesProvider>
      <App />
    </FavoritesProvider>
  </StrictMode>,
)
```

The card gets its star. Replace `src/components/ShowCard.jsx`:

```jsx file=src/components/ShowCard.jsx mark=1,7-9,19-27
import { useFavorites } from '../FavoritesContext.jsx'
import { showHash } from '../useHashRoute.js'
import Poster from './Poster.jsx'

// One result: the poster, the title, the year and the genres. query: the search it was found with (if any).
function ShowCard({ show, query }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const saved = isFavorite(show.id)

  return (
    <li className="card">
      <a className="card__link" href={showHash(show.id, query)}>
        <Poster src={show.poster} />
        <h2 className="card__title">{show.name}</h2>
        <p className="card__meta">
          {show.year ?? 'Coming soon'} · {show.genres.join(', ')}
        </p>
      </a>
      <button
        type="button"
        className="card__star"
        aria-pressed={saved}
        aria-label={`Favorite: ${show.name}`}
        onClick={() => toggleFavorite(show)}
      >
        {saved ? '★' : '☆'}
      </button>
    </li>
  )
}

export default ShowCard
```

The star is a button of its own, next to the link and not inside it: a button inside a link would be two things to click
in one, and screen readers could not tell them apart. The CSS puts it in the top right corner of the poster. Its
[[aria-label]] is the same whether the star is on or off; `aria-pressed` tells which.

The favorites page reads the list from the Context. Create `src/components/FavoritesPage.jsx`:

```jsx file=src/components/FavoritesPage.jsx
import { useFavorites } from '../FavoritesContext.jsx'
import Notice from './Notice.jsx'
import ShowCard from './ShowCard.jsx'

// #/favorites: the starred series, straight from localStorage, without a single request.
function FavoritesPage() {
  const { favorites } = useFavorites()

  if (favorites.length === 0) {
    return (
      <Notice title="No favorites yet.">
        <p>Click the star on a series to keep it here.</p>
      </Notice>
    )
  }

  return (
    <ul className="grid">
      {favorites.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </ul>
  )
}

export default FavoritesPage
```

`App` gets a third page and a menu. With three pages, a `let` and an `if … else if` is easier to read than nested `? :`.
Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=1,3,10,16,22-26,30-38
import { useFavorites } from './FavoritesContext.jsx'
import useHashRoute, { replaceHash, searchHash } from './useHashRoute.js'
import FavoritesPage from './components/FavoritesPage.jsx'
import SearchPage from './components/SearchPage.jsx'
import ShowPage from './components/ShowPage.jsx'
import './App.css'

function App() {
  const { path, params } = useHashRoute()
  const { favorites } = useFavorites()
  // The search is in the address (#/?q=moon), so it needs no state of its own.
  const query = params.get('q') ?? ''

  // #/show/42 → showId is '42'. The changing part of the address is the route parameter.
  const showId = path.startsWith('/show/') ? path.slice('/show/'.length) : null
  const onFavorites = path === '/favorites'

  function changeQuery(newQuery) {
    replaceHash(searchHash(newQuery))
  }

  let page
  if (showId) page = <ShowPage id={showId} backHref={searchHash(query)} />
  else if (onFavorites) page = <FavoritesPage />
  else page = <SearchPage query={query} onQueryChange={changeQuery} />

  return (
    <main className="app">
      <h1>Movie Search</h1>
      <nav className="nav" aria-label="Pages">
        <a href={searchHash(query)} aria-current={!showId && !onFavorites ? 'page' : undefined}>
          Search
        </a>
        <a href="#/favorites" aria-current={onFavorites ? 'page' : undefined}>
          Favorites <span className="nav__count">{favorites.length}</span>
        </a>
      </nav>
      {page}
    </main>
  )
}

export default App
```

[[aria-current]] with the value `'page'` marks the menu item of the page you are on: screen readers say "current page",
and the CSS underlines it. On a series page neither item is marked. JSX can be stored in a variable like any other
value, as `page` shows.

:::check Check
Search for `bakery`, and click the ☆ in the corner of the card: it turns into a filled ★, and the number next to
"Favorites" goes up to 1. Click "Favorites": the card is there. Press ++F5++: it is still there. Click its star: the
card disappears, and the page says "No favorites yet.". In the developer tools (Application → Local Storage), the
`movie-search:favorites` key holds the list as text.
:::

:::mistake Common mistake
"useFavorites must be used inside `<FavoritesProvider>`" in the Console, and a blank page: `main.jsx` still draws `<App
/>` without the Provider around it. The error message is our own, from `useFavorites`.
:::

:::try Task
Put a "☆ Save to favorites" button on the series page too, under the rating. `ShowDetails` already has the small `show`
object: call `useFavorites()` in it, and `toggleFavorite(show)` on a click. The label can follow the state: "★ Saved"
when `isFavorite(show.id)` is true.
:::

### The whole catalogue, page by page

When the search box is empty, the page could show every series to browse. There are 60 of them, and a real catalogue
could have thousands, so APIs don't send everything at once: they send it page by page. That's [[pagination]]. Our TV
API has an endpoint for it: `/api/tv/shows?page=1` gives the first 40 series, `?page=2` the next 40, and so on; past the
last page it answers 404.

On the screen we start with the first page, and a "Load more" button adds the next one under it. Here's a neat React way
to do it: every page is a component of its own, with its own request. The parent only counts how many pages are open,
and draws that many page components. Opening a new page is just `setPageCount(pageCount + 1)`; the pages already open
keep their data and don't ask again.

How do we know when there is nothing more? If a page arrives with fewer than 40 series, it was the last one. The page
size and a function that makes the address of a page go to the end of `src/api.js`:

```js file=src/api.js
// The API sends the whole catalogue in pages of this many series.
export const PAGE_SIZE = 40

// The address of one page of the whole catalogue: pageUrl(2) → '/api/tv/shows?page=2'
export function pageUrl(page) {
  return `${API}/shows?page=${page}`
}
```

Create `src/components/BrowseAll.jsx`:

```jsx file=src/components/BrowseAll.jsx
import { useState } from 'react'
import { PAGE_SIZE, pageUrl, toShow } from '../api.js'
import useFetch from '../useFetch.js'
import Notice from './Notice.jsx'
import ShowCard from './ShowCard.jsx'

// One page of the catalogue, with its own request. The last page open also gets the "Load more" button.
function BrowsePage({ page, isLast, onLoadMore }) {
  const { status, data, retry } = useFetch(pageUrl(page))

  if (status === 'error') {
    return (
      <Notice title="The list did not load." error>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </Notice>
    )
  }
  if (status !== 'success') {
    return <p className="status">Loading…</p>
  }

  return (
    <>
      <ul className="grid">
        {data.map((apiShow) => (
          <ShowCard key={apiShow.id} show={toShow(apiShow)} />
        ))}
      </ul>
      {/* A full page means there may be more after it. */}
      {isLast && data.length === PAGE_SIZE && (
        <button type="button" className="more" onClick={onLoadMore}>
          Load more
        </button>
      )}
    </>
  )
}

// The whole catalogue: one page at first, and one more for every click on "Load more".
function BrowseAll() {
  const [pageCount, setPageCount] = useState(1)
  // [1, 2, …, pageCount]: the numbers of the pages that are open.
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  return (
    <section className="browse" aria-labelledby="browse-title">
      <h2 id="browse-title" className="browse__title">
        All series
      </h2>
      {pages.map((page) => (
        <BrowsePage
          key={page}
          page={page}
          isLast={page === pageCount}
          onLoadMore={() => setPageCount(pageCount + 1)}
        />
      ))}
    </section>
  )
}

export default BrowseAll
```

- `Array.from({ length: pageCount }, …)` makes an array of `pageCount` items, and the function makes each of them: it
  gets the position of the item (`index`, from 0), and gives back `index + 1`. The first parameter, the item itself, is
  empty here; `_` is the usual name for a parameter we don't use.
- The page number is the `key`: page 2 always stays page 2, so React never mixes up the pages' data.
- `{/* … */}` is how a comment is written inside JSX.
- `aria-labelledby` gives the section a name: the text of the element whose `id` it names, here "All series".

In the search page, the list takes the place of the hint for the empty box. Here is the whole
`src/components/SearchPage.jsx`, as it stays:

```jsx file=src/components/SearchPage.jsx mark=4,21,43-44
import { searchUrl, toShow } from '../api.js'
import useFetch from '../useFetch.js'
import useDebounce from '../useDebounce.js'
import BrowseAll from './BrowseAll.jsx'
import Notice from './Notice.jsx'
import Results from './Results.jsx'

const MIN_LENGTH = 2

// The search page. The search text comes from App, so it survives a visit to a series page.
function SearchPage({ query, onQueryChange }) {
  // The search waits until typing pauses for 400 milliseconds.
  const text = useDebounce(query.trim(), 400)
  // One letter would match almost everything, so the search starts from MIN_LENGTH letters.
  const tooShort = text.length < MIN_LENGTH
  const { status, data, retry } = useFetch(tooShort ? null : searchUrl(text))
  // Every hit is { score, show }: we keep only the series, in our own small shape.
  const results = status === 'success' ? data.map((result) => toShow(result.show)) : []

  let message = ''
  if (text !== '' && tooShort) message = 'Type at least two letters.'
  else if (status === 'loading') message = 'Searching…'
  else if (status === 'success' && results.length > 0) message = `${results.length} series found.`

  return (
    <>
      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search__field">
          <span>Search TV series</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="e.g. lighthouse"
          />
        </label>
      </form>

      <p className="status" aria-live="polite">
        {message}
      </p>

      {text === '' && <BrowseAll />}

      {status === 'error' && (
        <Notice title="The search did not work." error>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </Notice>
      )}

      {status === 'success' && results.length === 0 && (
        <Notice title={`No series found for “${text}”.`}>
          <p>Check the spelling, or try a single word.</p>
        </Notice>
      )}

      {status === 'success' && results.length > 0 && <Results key={text} shows={results} query={query} />}
    </>
  )
}

export default SearchPage
```

The empty box gets no message any more, since the catalogue is there instead: the first line of the `if … else if` chain
went, and the "two letters" sentence now needs a text that is not empty (`&&`: both conditions must be true).

:::check Check
Empty the search box: under it you see "ALL SERIES" and 40 cards. At the bottom there is a "Load more" button. Click it:
20 more cards appear under the first 40, and the button disappears, because the second page was not full. Type `page=`
into the Network tab's filter box: there are the `shows?page=1` and `shows?page=2` requests. During development each
one appears twice because of StrictMode, and the first copy is "(canceled)", as on the series page. Type a search: the catalogue gives way to the results.
Empty the box again: page 1 is back. Congratulations, your series finder is done!
:::

:::mistake Common mistake
Leaving out `isLast &&`. Then every full page shows a button of its own: after the first click, the "Load more" button
stays where it was, between the first and the second page. Click it again, and it asks for a third page, which doesn't
exist: the API answers 404, and an error box appears at the bottom.
:::

:::concept How does a real app know there are no more pages?
"Fewer than 40 means the end" is a good guess, but if the catalogue had exactly 80 series, the second page would be full
too, and the button would ask for a third page that doesn't exist (404). APIs usually say it in the headers of the
answer. Ours sends `X-Total-Count: 60`, the number of all series, and on every page but the last a `Link` header with
the address of the next page (Network tab → click the request → Headers). In code,
`response.headers.get('X-Total-Count')` reads them; our `useFetch` would have to give them back next to `data`.
:::

:::try Task
Turn the button into [[infinite scroll|Infinite scroll]], as in lesson 12: put a [[sentinel]] element under the last
page instead of the button (for example `<p className="status">Loading more…</p>` with a `useRef`), watch it with an
[[IntersectionObserver]] in an effect, and call `onLoadMore()` when it reaches the screen. The new hooks go at the top
of `BrowsePage`, before its early returns (the [[rules of hooks]]), and don't forget the cleanup:
`observer.disconnect()`.
:::
