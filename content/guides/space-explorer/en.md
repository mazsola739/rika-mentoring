# What we build

A space explorer: a picture of the universe for every day, with a title and a short explanation, just like NASA's
famous "Astronomy Picture of the Day" (APOD) site, which has been running since 1995. We ask an API for the pictures,
with a key, as you would with a real service. On the way you learn what an API key is for and where it belongs, how
to deal with dates and time zones, how to show one thing for a picture and another for a video, and how to save
requests with a cache. By the end you also have an endless gallery, with filters and a large view.

:::levels
- Today's picture with its date, title and explanation, loading and error states, and your own API key. | about 2 hours
- A date picker for the archive, video days, favourites and a cache. | about 3 hours
- A gallery from date ranges and random pictures, infinite scroll, filters and a large view. | about 3 hours
:::

**Before you start you need:** the earlier lessons, above all these: the cleanup function of `useEffect` and dropping
answers that arrive late (lessons 5 and 9), `Intl.DateTimeFormat` (lesson 11), `fetch`, loading and error states, a
custom `useFetch` hook and an environment variable (lesson 14), the `useLocalStorage` hook (lessons 6 and 9–11), and the
`<dialog>` element, `useRef` and infinite scroll (lesson 12). Whatever we recall is explained again in a sentence or
two; everything new, step by step.

## Beginner level {level=1}

### Before you start

The exercise of this lesson, a ready starting project, is in the course's repository on GitHub, in the
`lessons/15-space-explorer/exercise` folder (the "Exercise on GitHub" button above opens this folder). Step 0 of
lesson 1 explains in detail how to get it and set it up; here are just the commands.

Open a terminal in your work folder, where you keep your projects. If you do not have the repository yet, clone it,
then copy the exercise folder out of it, naming the copy `space-explorer`:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git
cp -r rika-mentoring/lessons/15-space-explorer/exercise space-explorer
```

If you already have the repository from an earlier lesson, type these three commands instead of the `git clone` line:
`cd rika-mentoring`, `git pull` (it brings the new lessons) and `cd ..`; then copy. Without git, **Code → Download ZIP**
on the repository's GitHub page works too, and a file manager makes the copy just as well. You never change the
repository itself, so `git pull` keeps working later; your copy is your own project.

Open your `space-explorer` folder in the editor, and type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite, Mock Service Worker)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a dark, night-blue page with the title
"Space Explorer" in large gold letters at the top, and under it, in a paler colour: "A picture of our universe for
every day." Nothing else yet: the pictures are your job.
:::

Finally, make your copy a git repository with one commit, the starting point. `npm run dev` keeps the first terminal
busy, so open a second one (the **+** button in the terminal panel), in the `space-explorer` folder:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step that
works.

These are the files of the exercise that matter for this lesson:

- `src/App.jsx`: the page itself. For now it only shows the header; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about fetching data, not CSS, so this time you
  do not write styles: you only use the class names (`apod`, `media`, `date-nav`, `gallery`, …) that the steps give
  you. The colours are at the top of `src/index.css`, in variables.
- `src/mocks/`: a pretend server, the space API. More about it in a moment.
- `public/mockServiceWorker.js`: one of the pretend server's own files. Do not edit it.
- `src/main.jsx`: starts the pretend server, then draws the app.

**The pretend server.** Any program can fetch NASA's pictures through an [[API]]: a web address that returns data
instead of a web page. In this course we never call outside services, so the exercise has a pretend API that works the
same way, with its own pictures drawn in code. A package called [[Mock Service Worker]] (MSW) runs it, using a
[[service worker]]: a small program that the browser places between the page and the network. A service worker sees
every request the page sends, and can answer them too. So MSW answers the requests to `/api/…` addresses from
`src/mocks/handlers.js`, and lets everything else (the page, the scripts, the styles) through. For your code it is
exactly like a real server: you write ordinary `fetch` calls, and if one day you switch to a real API, only the
address and the key change.

`src/main.jsx` starts it before React draws anything:

```jsx file=src/main.jsx mark=3,8
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startMockApi } from './mocks/browser.js'
import './index.css'
import App from './App.jsx'

// First the pretend space API starts (src/mocks), so even the very first fetch('/api/…') gets an answer.
await startMockApi()

// React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

This `await` is not inside an `async` function but at the top level of the file. That is [[top-level await]]: the
file itself can wait for a Promise before it moves on to the next line. This way the first `fetch` already reaches a
working server.

:::concept The space API in brief
Every request goes to the `/api/apod` address, and the settings come after the `?`. `api_key` is always needed, the
rest is optional:

- `api_key=DEMO_KEY`: the key. Without it the answer is `403 Forbidden`.
- `date=2026-11-15`: the picture of one day. Without it, today's.
- `start_date=…&end_date=…`: every day of a date range, in an array (at most 100 days).
- `count=12`: 12 days picked at random, in an array.
- `lang=hu`: the title and the explanation in Hungarian. Without it the answer is in English.
- `thumbs=true`: a still picture for the video days too.

The picture of one day looks like this (the explanation is shortened here):

```json
{
  "copyright": "Rika Mentoring",
  "date": "2026-11-15",
  "explanation": "Jupiter is so large that more than 1,300 Earths would fit inside it. …",
  "media_type": "image",
  "service_version": "v1",
  "title": "Jupiter and the Great Red Spot",
  "url": "http://localhost:5173/api/apod/image/jupiter.svg",
  "hdurl": "http://localhost:5173/api/apod/image/jupiter-hd.svg"
}
```

NASA's real APOD API uses the same names. The pretend archive also starts on 16 June 1995, and every day has a
picture; 50 different pictures repeat in it, always in the same order.
:::

:::concept A quick recap
A [[component]] is a function that returns [[JSX]]. It gets data from outside through its [[props]], and remembers
things with [[useState]]. Work outside drawing, such as a request to a server, goes into [[useEffect]]; its
[[cleanup function]] runs when the effect starts again or the component disappears. A [[custom hook]] is a function
whose name starts with `use` and which calls other hooks. If any of this feels unfamiliar, take another look at
lessons 2, 9 and 14.
:::

:::try Try it
Ask the server by hand. Open the developer tools (++F12++), switch to the Console tab and type:
`await (await fetch('/api/apod?api_key=DEMO_KEY')).json()`. The answer is today's data. Then leave out the key:
`await (await fetch('/api/apod')).json()`. Now an error message comes back, and the console shows the
`403 (Forbidden)` answer in red.
:::

### The first request

Let's fetch today's picture. As in lesson 14, the address of a request has two parts: `/api/apod` is the [[endpoint]], the "address"
of the part of the API that deals with the pictures of the day. After the `?` come the
[[query parameters|query parameter]] (the query string): `name=value` pairs, separated by `&`.

`api_key=DEMO_KEY` is the [[API key]]. It tells a service who is asking: every developer gets a key of their own, and
the service counts the requests per key. `DEMO_KEY` is a shared, public key for trying things out, with a tight
limit: our API allows 30 requests an hour with it (NASA's real demo key allows about the same). `lang=en` is our
API's own parameter: we ask for the title and the explanation in English.

You know `fetch` from lesson 14: it sends the request and returns a [[Promise]] that is fulfilled with the server's
response. The content of the response is [[JSON]] text, and `response.json()` turns it into a JavaScript object (that
is a Promise too, so it needs an `await` as well). Change `src/App.jsx` to this:

```jsx file=src/App.jsx mark=1,5,7-21,30-38
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apod, setApod] = useState(null) // today's picture, as soon as it arrives

  useEffect(() => {
    let ignore = false

    async function load() {
      const response = await fetch('/api/apod?api_key=DEMO_KEY&lang=en')
      const data = await response.json()
      if (!ignore) setApod(data)
    }

    load()
    // Cleanup: if the component disappeared meanwhile (or a new request started), we drop this request's answer.
    return () => {
      ignore = true
    }
  }, [])

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      {apod && (
        <article className="apod">
          <figure className="media">
            <img src={apod.url} alt={apod.title} />
          </figure>
          <h2 className="apod__title">{apod.title}</h2>
          <p className="apod__text">{apod.explanation}</p>
        </article>
      )}
    </main>
  )
}

export default App
```

- The `apod` state starts as `null`: until the answer arrives, there is nothing to show. `{apod && (…)}` draws the
  card only once there is data. (APOD is short for "Astronomy Picture of the Day", so we call the state that holds the
  day's data `apod`.)
- Because of the empty [[dependency array]] (`[]`), the effect runs once, after the first drawing.
- The effect function itself cannot be `async`, because it may only return a cleanup function, not a promise. So we
  write an `async function load()` inside it and call it right away, as in lessons 9 and 14.
- `ignore` is familiar from lesson 9 too: if the component disappears before the answer arrives, the cleanup function
  sets it to `true`, and the late answer is dropped.
- `src={apod.url}` is the web address (URL) of the picture from the answer. Our code does not fetch the picture
  itself; the `<img>` does, and the pretend server answers that request too. The `alt` is the picture's title (the
  `title`), read out by screen readers.

:::check Check
After a moment a space picture drawn in code appears (a different one every day), with its title and a longer
explanation under it. Open the developer tools (++F12++), switch to the Network tab, choose the Fetch/XHR filter and
reload the page: there is the `apod?api_key=DEMO_KEY&lang=en` request, with status `200`. Click it, and the Response
tab shows the JSON. You see the request twice: in development, [[StrictMode]] runs every effect twice, so that a
missing cleanup shows up early. Because of `ignore`, the first answer does not count.
:::

:::mistake Common mistake
The key is missing from the address: `fetch('/api/apod?lang=en')`. No picture, no title, just an empty black
rectangle, and in the Network tab a red `403 Forbidden`. The server sent an error message
(`{ "error": "API_KEY_MISSING", … }`), and our code took it for picture data. Step 3 teaches the code to notice
answers like this.
:::

:::try Try it
Change `lang=en` in the address to `lang=hu`: the title and the explanation arrive in Hungarian. Then change it back.
:::

### A card and a readable date

The answer has the day's date too, in the form `"2026-11-15"`. This is the [[ISO 8601]] standard: year, month, day,
always with the same number of digits. It is ideal for computers (you will see why in the intermediate level), but a
person prefers "Sunday, 15 November 2026".

In JavaScript, a moment in time is stored in a [[Date]] object, and `new Date(…)` makes one from a string. The nice
formatting is done by [[Intl.DateTimeFormat]], familiar from lesson 11: you give it a language and a country
(`'en-GB'`, this is the [[locale]]) and how long the date should be, and it knows that British English puts the day
before the month and writes the month as a word.

There is a trap, one you met in lesson 14 already. A `Date` is always one exact moment, and which day that moment falls on depends on the
[[time zone]]: when it is midnight on 15 November in London, it is still 7 pm on 14 November in New York. So we do
everything in [[UTC]] (world time, the zero point of the time zones on Earth): `T00:00:00Z` means midnight in UTC
(the `Z` stands for UTC), and `timeZone: 'UTC'` asks for the formatting to happen in UTC too. This way the date stays
the same wherever the visitor is.

Date handling goes into a file of its own. Create the file `src/dates.js`:

```js file=src/dates.js
// Dates are strings in the form 'YYYY-MM-DD', just as the API sends them: '2026-11-15'.

// A readable date. The style can be 'full' (Sunday, 15 November 2026), 'long' (15 November 2026)
// or 'medium' (15 Nov 2026).
export function formatDay(iso, style = 'full') {
  // The Z means midnight in UTC. The formatting happens in UTC too, so the day
  // stays the same wherever the visitor is.
  const date = new Date(`${iso}T00:00:00Z`)
  return new Intl.DateTimeFormat('en-GB', { dateStyle: style, timeZone: 'UTC' }).format(date)
}
```

- The `${iso}T00:00:00Z` between the two backticks is a [[template literal]], as in lesson 4: the date takes the place
  of `${iso}`, and the result is `'2026-11-15T00:00:00Z'`.
- `style = 'full'` is a [[default parameter]]: if the caller gives no second value, `style` is `'full'`. The card uses
  `'full'`, with the day of the week; the small cards later will use the shorter `'medium'`.
- `dateStyle` asks for one of the formatter's built-in lengths: `'full'` includes the day of the week.

The picture of the day gets a component of its own. Create the `src/components` folder with an `ApodCard.jsx` file in
it:

```jsx file=src/components/ApodCard.jsx
import { formatDay } from '../dates.js'

// The picture of one day: the picture, the date, the title, the author and the explanation.
function ApodCard({ apod }) {
  return (
    <article className="apod">
      <figure className="media">
        <img src={apod.url} alt={apod.title} />
      </figure>
      <p className="apod__date">{formatDay(apod.date)}</p>
      <h2 className="apod__title">{apod.title}</h2>
      {apod.copyright && <p className="apod__credit">Image: {apod.copyright}</p>}
      <p className="apod__text">{apod.explanation}</p>
    </article>
  )
}

export default ApodCard
```

The `copyright` field is not always there: NASA's own pictures are in the public domain, anyone may use them freely,
and then the field is missing from the answer, so its value is `undefined`. Because of the `&&`, the line is left out.
In `App`, the component takes the place of the card. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=2,31
import { useEffect, useState } from 'react'
import ApodCard from './components/ApodCard.jsx'
import './App.css'

function App() {
  const [apod, setApod] = useState(null) // today's picture, as soon as it arrives

  useEffect(() => {
    let ignore = false

    async function load() {
      const response = await fetch('/api/apod?api_key=DEMO_KEY&lang=en')
      const data = await response.json()
      if (!ignore) setApod(data)
    }

    load()
    // Cleanup: if the component disappeared meanwhile (or a new request started), we drop this request's answer.
    return () => {
      ignore = true
    }
  }, [])

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      {apod && <ApodCard apod={apod} />}
    </main>
  )
}

export default App
```

:::check Check
Under the picture, today's date stands in gold capitals with the day of the week, for example "MONDAY, 23 NOVEMBER
2026". (The capitals come from the CSS; the text itself is not in capitals.) Under it the title, and if the picture has an
author, a pale line: "Image: Rika Mentoring".
:::

:::mistake Common mistake
Leaving out `timeZone: 'UTC'`. In Europe everything looks fine, but a visitor in America sees the day before: the
moment `'2026-11-15T00:00:00Z'` is still the evening of 14 November in New York. A bug like this is sneaky, because it
never shows up on the developer's own computer.
:::

:::try Try it
See the trap with your own eyes. Type this into the console (++F12++ → Console):
`new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'America/New_York' }).format(new Date('2026-11-15T00:00:00Z'))`.
The result is "14 November 2026". Then change `'full'` to `'long'` in `formatDay`, and see what changes on the card.
:::

### Loading, errors and the useApod hook

You saw it in the mistake of the first step: `fetch` reports no error even when the server answers with `403`. From
the point of view of `fetch`, everything went fine: it sent the request, and an answer came. The [[HTTP status code]]
you met in lesson 14, a three-digit number at the start of the response, tells you whether the answer is good news:

- `200 OK`: all is well, here is the data.
- `400 Bad Request`: something is wrong with the request, for example a date that does not exist.
- `403 Forbidden`: not allowed. For us: the key is missing or wrong.
- `429 Too Many Requests`: too many requests. The key's hourly allowance is used up.
- `500` and above: the server made a mistake.

`response.ok` is true when the status code is between 200 and 299. If it is not, we have to raise the error
ourselves: `throw` stops the function and hands the error to the nearest `catch`. `new Error(…)` makes an error
object, and we add a `status` field to it, so that later we know which message to show.

Everything that talks to the API goes into a file of its own, like the password logic in lesson 3. Create the file
`src/api.js`:

```js file=src/api.js
// Everything that talks to the space API: the address, the key, the request and recognising errors.

// Messages for the status codes we know. Everything else gets the general message.
const ERROR_MESSAGES = {
  403: 'The API did not accept the key (403 Forbidden). Check that you entered it correctly!',
  429: 'Your key has used up its requests for this hour (429 Too Many Requests). Wait a little, or reload the page!',
}

// One request to the API. If it worked, it returns the data of the answer; if not, it throws an error.
export async function fetchApod() {
  const response = await fetch('/api/apod?api_key=DEMO_KEY&lang=en')
  if (!response.ok) {
    // fetch throws by itself only when it cannot reach the server at all. A 403 or a 429 is ours to notice.
    const problem = new Error(`HTTP ${response.status}`)
    problem.status = response.status // this tells us later which message to show
    throw problem
  }
  return response.json()
}

// The message for the user about an error.
export function errorMessage(error) {
  return ERROR_MESSAGES[error.status] ?? 'The space API is not available right now. Try again!'
}
```

The `??` you know from lesson 13 ([[nullish coalescing]]) gives its left side, unless that is `null` or `undefined`:
then its right side.
`ERROR_MESSAGES[error.status]` is the 403 message for a 403 error and `undefined` for a 500, and then the general
message comes. If the server cannot be reached at all, `fetch` itself throws an error that has no `status`, and the
general message comes too.

So a request has three states: on its way, arrived, or failed. In lesson 14 you wrapped this into the `useFetch` hook;
now we write a custom hook just like it, made for the picture of the day. Create the file `src/useApod.js`:

```js file=src/useApod.js
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'

// The picture of the day from the API: { status, apod, error, retry }.
// The status is 'loading' (on its way), 'success' (arrived) or 'error' (something went wrong).
function useApod() {
  const [status, setStatus] = useState('loading')
  const [apod, setApod] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // the "Try again" button increases it, which restarts the request

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await fetchApod()
        if (ignore) return
        setApod(data)
        setStatus('success')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    // Cleanup: if the component disappeared meanwhile (or a new request started), we drop this request's answer.
    return () => {
      ignore = true
    }
  }, [attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { status, apod, error, retry }
}

export default useApod
```

- You know [[try/catch]] from lesson 3: if anything in the `try` part throws an error (`fetchApod`, or `fetch`
  itself), the code goes on in the `catch` part.
- `retry` sets the status back to `'loading'` and increases `attempt`. Because `attempt` is in the dependency array,
  the effect runs again, so it asks again.
- This time the hook returns an object, not an array like `useState`: with four values, names are clearer than positions.
  The caller takes them out by name: `const { status, apod } = useApod()`.

Finally, a component that decides by the status what to show. Create the file
`src/components/PictureOfTheDay.jsx`:

```jsx file=src/components/PictureOfTheDay.jsx
import useApod from '../useApod.js'
import { errorMessage } from '../api.js'
import ApodCard from './ApodCard.jsx'

// The picture of the day: a waiting message while it is on its way; after an error, the message and "Try again".
function PictureOfTheDay() {
  const { status, apod, error, retry } = useApod()

  if (status === 'loading') {
    return (
      <p className="status" role="status">
        The picture is on its way…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status status--error" role="alert">
        <p>{errorMessage(error)}</p>
        <button type="button" className="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  return <ApodCard apod={apod} />
}

export default PictureOfTheDay
```

A component can return early too: with the message while loading, with the error box after an error, and with the
card only when neither applies. Because of `role="status"`, screen readers read the message out, and `role="alert"`
announces the error right away. `App` becomes very short. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=1,12
import PictureOfTheDay from './components/PictureOfTheDay.jsx'
import './App.css'

function App() {
  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      <PictureOfTheDay />
    </main>
  )
}

export default App
```

:::check Check
Reload the page: for a moment a pulsing box says "The picture is on its way…", then the card appears. Now break the
key in `src/api.js`: write `api_key=` instead of `api_key=DEMO_KEY` in the address. A box appears with a magenta stripe
on its left edge: "The API did not accept the key (403 Forbidden)…", with a "Try again" button under it. "Try again"
sends a new request (you see it in the Network tab), but the answer is 403 again. Then put the key back.
:::

:::mistake Common mistake
`setStatus('error')` is missing from the `catch`. After an error, the page says "The picture is on its way…" forever,
although the request came back long ago. A request must always end: it becomes either `'success'` or `'error'`.
:::

:::try Task
The server explains its errors too: `{ "error": "API_KEY_MISSING", "message": "No api_key was supplied. …" }`. In the
`if (!response.ok)` branch of `src/api.js`, read it (`const body = await response.json()`) and put `body.message`
into the `message` of the error object. Then the error box can show `error.message` as well.
:::

### Your own key in a .env.local file

`DEMO_KEY` belongs to everyone, so its limit is tight. With a real service you register and get a key of your own
(at NASA, for example, a string of 40 letters and digits), which lets you ask a lot more. Our API allows 30 requests
an hour with the demo key, and 1000 with a key of your own.

In every answer, the server also tells you how many requests you have left, in the [[HTTP headers|HTTP header]]. Headers are
`name: value` lines that arrive before the data of the response and say something about it: what type it is, how long
it stays valid, and so on. `X-RateLimit-Limit` is the key's hourly allowance, and `X-RateLimit-Remaining` is the
number of requests left. This limit is called a [[rate limit]]; when it is used up, a `429` comes. (Our pretend server
counts in the browser's memory, so reloading the page resets the counter. A real server will not be this forgiving.)

Where should your own key go? Never into the code: from there it would end up in the git repository, and from the
repository perhaps on GitHub, where anyone can find it. You saw the answer in lesson 14: an
[[environment variable]]. There you also read that `.env` holds the shared settings that can be committed, while a
value that belongs only to your computer, such as a key of your own, goes into `.env.local`. Vite reads the lines
starting with `VITE_` from both files and hands them to your code in `import.meta.env`.

Create the `.env.local` file in the root of the project (next to `package.json`, not in `src`). Our pretend server
accepts any key that is in your `.env.local`, so make one up:

```text file=.env.local
VITE_APOD_KEY=practice-key-123
```

The `.gitignore` of this lesson's exercise does not have the `*.local` line yet (lesson 14's exercise had it): add it to
the end, so that git ignores `.env.local` and the key never ends up in a commit. The `*` stands for any text, so
`*.local` matches every file whose name ends in `.local`, `.env.local` included. Here is the whole `.gitignore`:

```text file=.gitignore mark=5
node_modules
dist
.DS_Store
*.log
*.local
```

Now the code. So far we wrote the address of the request by hand. If the key comes from a variable,
[[URLSearchParams]] does it for us: it turns an object into `name=value&name=value` text, and it
[[URL-encodes|URL encoding]] every value on the way, as `encodeURIComponent` did in lesson 4: if a key had a `&`, a `?`
or a space in it, it is written in a safe form, so it cannot break the address. Here is the whole `src/api.js`:

```js file=src/api.js mark=2-4,14-16
// Everything that talks to the space API: the address, the key, the request and recognising errors.
const API_URL = '/api/apod'
// The key comes from the .env.local file. If there is none, the public demo key stays.
const API_KEY = import.meta.env.VITE_APOD_KEY || 'DEMO_KEY'

// Messages for the status codes we know. Everything else gets the general message.
const ERROR_MESSAGES = {
  403: 'The API did not accept the key (403 Forbidden). Check that you entered it correctly!',
  429: 'Your key has used up its requests for this hour (429 Too Many Requests). Wait a little, or reload the page!',
}

// One request to the API. If it worked, it returns the data of the answer; if not, it throws an error.
export async function fetchApod() {
  // URLSearchParams builds the part after the ? and encodes every value safely.
  const query = new URLSearchParams({ api_key: API_KEY, lang: 'en' })
  const response = await fetch(`${API_URL}?${query}`)
  if (!response.ok) {
    // fetch throws by itself only when it cannot reach the server at all. A 403 or a 429 is ours to notice.
    const problem = new Error(`HTTP ${response.status}`)
    problem.status = response.status // this tells us later which message to show
    throw problem
  }
  return response.json()
}

// The message for the user about an error.
export function errorMessage(error) {
  return ERROR_MESSAGES[error.status] ?? 'The space API is not available right now. Try again!'
}
```

`||` (or) gives its left side if that "counts as true", and the right side otherwise. Without a `.env.local` file,
`import.meta.env.VITE_APOD_KEY` is `undefined`; with one that is empty (`VITE_APOD_KEY=`), it is `''`. In both cases
`||` gives `'DEMO_KEY'`; `??` would not help with the empty string.

:::check Check
Vite notices the new `.env.local` file and restarts by itself (the terminal says ".env.local changed, restarting
server..."). If it
does not, stop the server (++Ctrl++ + ++C++) and start it again with `npm run dev`. Reload the page and click the
`apod?…` request in the Network tab. On the Headers tab, the address of the request now says
`api_key=practice-key-123`, and further down, among the response headers, `x-ratelimit-limit: 1000`, with
`x-ratelimit-remaining` close to 1000 too. In the terminal, `git status` does not mention `.env.local`. That is the beginner
level done: commit it!
:::

:::mistake Common mistake
The variable name lacks the `VITE_`: `APOD_KEY=practice-key-123`. There is no error message and everything works, but
with the demo key: the header says `x-ratelimit-limit: 30` again. Vite deliberately hands only the `VITE_` variables
to the browser, and the rest stay on your computer. That way a password written into `.env.local` by accident never ends up
in the page.
:::

:::concept A key in the browser is no secret
Everything that starts with `VITE_` is built into the finished JavaScript file, and the key is in the address of every
request too: anyone can read it in the Network tab. That is fine for keys that are meant to be used in the browser,
and with which the worst that can happen is that someone uses up the allowance (APOD's is one of these). Secret keys
(payments, artificial intelligence, databases) must never reach the browser. They are kept by a server of your own (a
[[backend]]): the browser talks to your server, and your server adds the key before it passes the request on.
`.gitignore` protects the key from ending up in the repository, not from showing in the finished page.
:::

## Intermediate level {level=2}

### Any day's picture

The archive starts on 16 June 1995, and every day has a picture. Let's browse it! The `date` parameter tells the API
which day's picture you want, in the same `YYYY-MM-DD` form. The browser's date field, `<input type="date">`, gives
exactly this kind of string too, so nothing needs converting.

`dates.js` needs two new things: the first day of the archive and today. Today is trickier than you might think. The
API (like NASA's) starts a new day by New York time. When it is four in the morning in Budapest, it is still ten in
the evening of the day before in New York: for the API there is no picture for "today" yet. With a `timeZone`,
`Intl.DateTimeFormat` gives you the calendar of any time zone. And Canadian English (`'en-CA'`) happens to write dates
exactly as `YYYY-MM-DD`. Here is the whole `src/dates.js`:

```js file=src/dates.js mark=1,3-10
// Dates are strings in the form 'YYYY-MM-DD', just as the API and the date field use them: '2026-11-15'.

// The first day of the archive: the day the first picture appeared.
export const FIRST_DAY = '1995-06-16'

// Today, as the API sees it. For the API (as for NASA, which it imitates), a new day starts at midnight in
// New York. Canadian English ('en-CA') happens to write dates exactly as YYYY-MM-DD.
export function apodToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
}

// A readable date. The style can be 'full' (Sunday, 15 November 2026), 'long' (15 November 2026)
// or 'medium' (15 Nov 2026).
export function formatDay(iso, style = 'full') {
  // The Z means midnight in UTC. The formatting happens in UTC too, so the day
  // stays the same wherever the visitor is.
  const date = new Date(`${iso}T00:00:00Z`)
  return new Intl.DateTimeFormat('en-GB', { dateStyle: style, timeZone: 'UTC' }).format(date)
}
```

`new Date()` without a parameter is the current moment. From now on `fetchApod` gets a `params` object too: the rest
of the query, for example `{ date: '2026-11-15' }`. The `...params` [[spread]] (familiar from lesson 3) puts them into
the object for `URLSearchParams`. There is also a message for the `400` error: we get it when we ask for a day outside
the archive. Here is the whole `src/api.js`:

```js file=src/api.js mark=8,13-15,17
// Everything that talks to the space API: the address, the key, the request and recognising errors.
const API_URL = '/api/apod'
// The key comes from the .env.local file. If there is none, the public demo key stays.
const API_KEY = import.meta.env.VITE_APOD_KEY || 'DEMO_KEY'

// Messages for the status codes we know. Everything else gets the general message.
const ERROR_MESSAGES = {
  400: 'There is no picture for this day in the archive (400 Bad Request).',
  403: 'The API did not accept the key (403 Forbidden). Check that you entered it correctly!',
  429: 'Your key has used up its requests for this hour (429 Too Many Requests). Wait a little, or reload the page!',
}

// One request to the API. params is the rest of the query, for example { date: '2026-11-15' }.
// If it worked, it returns the data of the answer; if not, it throws an error.
export async function fetchApod(params) {
  // URLSearchParams builds the part after the ? and encodes every value safely.
  const query = new URLSearchParams({ api_key: API_KEY, lang: 'en', ...params })
  const response = await fetch(`${API_URL}?${query}`)
  if (!response.ok) {
    // fetch throws by itself only when it cannot reach the server at all. A 403 or a 429 is ours to notice.
    const problem = new Error(`HTTP ${response.status}`)
    problem.status = response.status // this tells us later which message to show
    throw problem
  }
  return response.json()
}

// The message for the user about an error.
export function errorMessage(error) {
  return ERROR_MESSAGES[error.status] ?? 'The space API is not available right now. Try again!'
}
```

The hook gets the date as a parameter, passes it on to `fetchApod`, and writes it into the dependency array too: by
the rule, everything the effect uses from the component belongs there. Here is the whole `src/useApod.js`:

```js file=src/useApod.js mark=4,6,17,33
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'

// The picture of one day from the API: { status, apod, error, retry }.
// The status is 'loading' (on its way), 'success' (arrived) or 'error' (something went wrong).
function useApod(date) {
  const [status, setStatus] = useState('loading')
  const [apod, setApod] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // the "Try again" button increases it, which restarts the request

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await fetchApod({ date })
        if (ignore) return
        setApod(data)
        setStatus('success')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    // Cleanup: if the component disappeared meanwhile (or a new request started), we drop this request's answer.
    return () => {
      ignore = true
    }
  }, [date, attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { status, apod, error, retry }
}

export default useApod
```

`PictureOfTheDay` gets the date as a prop and passes it on to the hook. Here is the whole
`src/components/PictureOfTheDay.jsx`:

```jsx file=src/components/PictureOfTheDay.jsx mark=5-7
import useApod from '../useApod.js'
import { errorMessage } from '../api.js'
import ApodCard from './ApodCard.jsx'

// The picture of one day: a waiting message while it is on its way; after an error, the message and "Try again".
function PictureOfTheDay({ date }) {
  const { status, apod, error, retry } = useApod(date)

  if (status === 'loading') {
    return (
      <p className="status" role="status">
        The picture is on its way…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status status--error" role="alert">
        <p>{errorMessage(error)}</p>
        <button type="button" className="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  return <ApodCard apod={apod} />
}

export default PictureOfTheDay
```

Finally `App`: the open day lives here, and so does the date field. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=1-2,7-14,23-34,36-37
import { useState } from 'react'
import { FIRST_DAY, apodToday } from './dates.js'
import PictureOfTheDay from './components/PictureOfTheDay.jsx'
import './App.css'

function App() {
  // Today, as the API sees it. We work it out once, when the page opens.
  const [today] = useState(apodToday)
  const [date, setDate] = useState(today) // the day that is open

  function changeDate(newDate) {
    // An empty date, or one outside the archive, is not accepted.
    if (newDate >= FIRST_DAY && newDate <= today) setDate(newDate)
  }

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      <div className="date-nav">
        <label className="date-nav__field">
          <span className="visually-hidden">Date</span>
          <input
            type="date"
            min={FIRST_DAY}
            max={today}
            defaultValue={date}
            onChange={(event) => changeDate(event.target.value)}
          />
        </label>
      </div>

      {/* Because of the key, every new date gets a brand-new PictureOfTheDay with fresh state. */}
      <PictureOfTheDay key={date} date={date} />
    </main>
  )
}

export default App
```

- `useState(apodToday)` is a [[lazy initial value]], as in lesson 3: React calls the function only on the first
  drawing. We never change `today`, so we do not even ask for its setter. It is state anyway so that it is worked out
  once and then stays the same on every drawing.
- Dates can simply be compared as strings: `'2026-11-15' < '2026-12-01'` is true, because in the ISO form the year
  comes first, then the month, then the day, and each always has the same number of digits. That is what makes this
  form good for computers.
- `changeDate` guards the edges of the archive. In the calendar, `min` and `max` do not let you pick a day outside
  them, but the field can also be emptied, and anything can be typed with the keyboard. The empty string (`''`) is
  smaller than any date, so it is filtered out too.
- The field gets `defaultValue`, not `value`: React gives it its starting value, but the typing is left to the
  browser. While you type a year, half-finished dates come (`0002-11-23`, `0020-11-23`, `0202-11-23`…); `changeDate`
  refuses them, and with `value={date}` React would write the old day back after every keystroke, so you could never
  type your way to 2024.
- `<span className="visually-hidden">` is a label that only screen readers see: so the field still has a name.
- `key={date}` is the trick you know from lesson 3. When the [[key]] changes, React throws away the old
  `PictureOfTheDay` and puts a brand-new one in its place, with fresh state. So a new day always starts with "The
  picture is on its way…", and the old picture does not linger until the new one arrives.

:::check Check
Above the card there is a date field showing today. Pick another day in the calendar: after a short "The picture is on
its way…", that day's picture appears. Pick 16 June 1995: "The Orion Nebula, a Stellar Nursery". The calendar does not
let you pick an earlier day, or a day after today.
:::

:::mistake Common mistake
Working out today with `new Date().toISOString().slice(0, 10)`. That is the date in UTC, and UTC starts every new day
four or five hours before New York. In Central Europe between 1 and 6 am in winter (between 2 and 6 am in summer),
UTC already has the new date, while in New York, and so for the API, it is still the day before. Then the API answers the "tomorrow" date with `400 Bad Request`, and the page says "There is no picture for
this day in the archive". A bug like this only shows up at night, so always work out `today` in the API's time zone.
:::

:::try Try it
Remove `key={date}` from `PictureOfTheDay` for a moment, and pick another day. The date field already shows the new
day, but for a moment the card still shows the old picture, without "The picture is on its way…": the component kept
its old state. Then put the `key` back.
:::

### Previous day, next day

Paging in the calendar is clumsy when you only want to see yesterday's picture. We need two buttons: one day back, one
day forward. Adding a day to a date is harder than it sounds: after 30 November comes 1 December, and after
28 February sometimes the 29th, sometimes 1 March. Luckily `Date` knows all this. `getUTCDate()` gives the day of the
month (15, for example), `setUTCDate` changes it, and if the new number overflows (say, "31 November"), `Date` moves
on to the next month by itself. `toISOString()` then gives it back as
`'2026-11-16T00:00:00.000Z'`, and its first 10 characters (`slice(0, 10)`) are exactly the date.

Here too everything happens in UTC. In local time, on the day the [[clocks change|daylight saving time]] a day has
only 23 or 25 hours, and "midnight tomorrow" can easily turn into "eleven tonight". UTC has no clock changes. Here is
the whole `src/dates.js`:

```js file=src/dates.js mark=12-18
// Dates are strings in the form 'YYYY-MM-DD', just as the API and the date field use them: '2026-11-15'.

// The first day of the archive: the day the first picture appeared.
export const FIRST_DAY = '1995-06-16'

// Today, as the API sees it. For the API (as for NASA, which it imitates), a new day starts at midnight in
// New York. Canadian English ('en-CA') happens to write dates exactly as YYYY-MM-DD.
export function apodToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
}

// The day that is `days` days later (earlier if negative): shiftDay('2026-11-15', -1) → '2026-11-14'.
// Everything happens in UTC, so a clock change can never shift the day.
export function shiftDay(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

// A readable date. The style can be 'full' (Sunday, 15 November 2026), 'long' (15 November 2026)
// or 'medium' (15 Nov 2026).
export function formatDay(iso, style = 'full') {
  // The Z means midnight in UTC. The formatting happens in UTC too, so the day
  // stays the same wherever the visitor is.
  const date = new Date(`${iso}T00:00:00Z`)
  return new Intl.DateTimeFormat('en-GB', { dateStyle: style, timeZone: 'UTC' }).format(date)
}
```

The day navigation gets a component of its own, and the date field moves into it from `App`. Create the file
`src/components/DateNav.jsx`:

```jsx file=src/components/DateNav.jsx
import { useEffect, useRef } from 'react'
import { FIRST_DAY, shiftDay } from '../dates.js'

// Paging between the days: previous day, the date field, next day and today.
function DateNav({ date, today, onChange }) {
  const inputRef = useRef(null)

  // The buttons change the day from outside: after drawing, we write it into the field too.
  useEffect(() => {
    inputRef.current.value = date
  }, [date])

  return (
    <div className="date-nav">
      <button
        type="button"
        className="button button--ghost"
        disabled={date <= FIRST_DAY}
        onClick={() => onChange(shiftDay(date, -1))}
      >
        ‹ Previous day
      </button>
      <label className="date-nav__field">
        <span className="visually-hidden">Date</span>
        <input
          ref={inputRef}
          type="date"
          min={FIRST_DAY}
          max={today}
          defaultValue={date}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="button button--ghost"
        disabled={date >= today}
        onClick={() => onChange(shiftDay(date, 1))}
      >
        Next day ›
      </button>
      <button type="button" className="button" disabled={date === today} onClick={() => onChange(today)}>
        Today
      </button>
    </div>
  )
}

export default DateNav
```

A `disabled` button cannot be clicked: there is no previous day on the first day, no next day today, and the "Today"
button is switched off while today is already open. The comparisons are between strings again. `DateNav` stores
nothing itself: it shows the date it gets, and passes every change up to `App` through the `onChange` prop, because
the state lives in `App` (this is [[lifting state up]], as with the slider in lesson 3). The buttons now change the
date field too, so we take hold of it with a `useRef`, and an effect writes the new day into it after drawing, just as
we told the `<dialog>` what to do in lesson 12. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=3,24
import { useState } from 'react'
import { FIRST_DAY, apodToday } from './dates.js'
import DateNav from './components/DateNav.jsx'
import PictureOfTheDay from './components/PictureOfTheDay.jsx'
import './App.css'

function App() {
  // Today, as the API sees it. We work it out once, when the page opens.
  const [today] = useState(apodToday)
  const [date, setDate] = useState(today) // the day that is open

  function changeDate(newDate) {
    // An empty date, or one outside the archive, is not accepted.
    if (newDate >= FIRST_DAY && newDate <= today) setDate(newDate)
  }

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      <DateNav date={date} today={today} onChange={changeDate} />

      {/* Because of the key, every new date gets a brand-new PictureOfTheDay with fresh state. */}
      <PictureOfTheDay key={date} date={date} />
    </main>
  )
}

export default App
```

:::check Check
"‹ Previous day" steps back one day, and the date field follows. While today is open, "Next day ›" and "Today" are
grey and cannot be clicked. Set the field to 1 March 2024 and step back once: 29 February 2024 comes (2024 was a leap year).
Set it to 17 June 1995 and step back: the Orion Nebula comes, and "Previous day" turns grey.
:::

:::mistake Common mistake
Calculating in local time: `T00:00:00` without a `Z` at the end of the date (that is local midnight), and
`setDate(getDate() + 1)` to step a day. But `toISOString()` writes in UTC: midnight in Central Europe is still 11 pm
(10 pm in summer) on the day before in UTC, so `slice(0, 10)` gives back the old day. The "Next day" button then gets
stuck: however often you click, the date stays the same, and "Previous day" jumps back two days at once.
:::

:::try Task
Add a "Random day" button to the navigation. The number of days since the first day is
`(new Date(today) - new Date(FIRST_DAY)) / 86400000` (the difference of two `Date`s comes in milliseconds, and a day
is 86,400,000 milliseconds). Pick a random whole number from 0 up to that number, the end included (`Math.random` and
`Math.floor`), and step that many days forward from `FIRST_DAY` with `shiftDay`.
:::

### Video days

The picture of the day is not always a picture: now and then the real APOD features a video. The [[media type]] of the
answer tells you, in the `media_type` field: `'image'` or `'video'`. Our archive has video days too, for example
14 November 2026. If you go there now, the page shows the video in an `<img>`. With our API this happens to work, but
with a real video there would be a broken picture in its place.

The URL of the video (its web address) tells you what kind it is. A URL ending in `.mp4` or `.webm` is a real video
file, played by the browser's `<video>` element, with its own controls. The videos of our API are animations drawn in
code, with URLs ending in `.svg`: an `<img>` plays these by itself, like an animated GIF. Anything else (the player of
a video-sharing site, for example) cannot be played here. Pausing needs a still picture, which the API sends for the
`thumbs=true` parameter, in the `thumbnail_url` field. The pause trick is simple: while paused, we show the still
picture instead of the animation.

First, let's ask for the still pictures as well. Here is the whole `src/api.js`:

```js file=src/api.js mark=17-18
// Everything that talks to the space API: the address, the key, the request and recognising errors.
const API_URL = '/api/apod'
// The key comes from the .env.local file. If there is none, the public demo key stays.
const API_KEY = import.meta.env.VITE_APOD_KEY || 'DEMO_KEY'

// Messages for the status codes we know. Everything else gets the general message.
const ERROR_MESSAGES = {
  400: 'There is no picture for this day in the archive (400 Bad Request).',
  403: 'The API did not accept the key (403 Forbidden). Check that you entered it correctly!',
  429: 'Your key has used up its requests for this hour (429 Too Many Requests). Wait a little, or reload the page!',
}

// One request to the API. params is the rest of the query, for example { date: '2026-11-15' }.
// If it worked, it returns the data of the answer; if not, it throws an error.
export async function fetchApod(params) {
  // URLSearchParams builds the part after the ? and encodes every value safely.
  // Because of thumbs: 'true', video days come with a still picture too (thumbnail_url).
  const query = new URLSearchParams({ api_key: API_KEY, lang: 'en', thumbs: 'true', ...params })
  const response = await fetch(`${API_URL}?${query}`)
  if (!response.ok) {
    // fetch throws by itself only when it cannot reach the server at all. A 403 or a 429 is ours to notice.
    const problem = new Error(`HTTP ${response.status}`)
    problem.status = response.status // this tells us later which message to show
    throw problem
  }
  return response.json()
}

// The message for the user about an error.
export function errorMessage(error) {
  return ERROR_MESSAGES[error.status] ?? 'The space API is not available right now. Try again!'
}
```

Now the component that decides by the media type. Create the file `src/components/ApodMedia.jsx`:

```jsx file=src/components/ApodMedia.jsx
import { useState } from 'react'

// People who asked their computer for less motion get the video with its still picture first.
function prefersLessMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// A video day. The end of its URL tells what kind of video it is.
function VideoPlayer({ apod }) {
  const [playing, setPlaying] = useState(() => !prefersLessMotion())
  const url = apod.url.toLowerCase()

  // A real video file: the browser's <video> element plays it, with its own controls.
  if (url.endsWith('.mp4') || url.endsWith('.webm')) {
    return (
      <figure className="media">
        <video src={apod.url} poster={apod.thumbnail_url} controls />
      </figure>
    )
  }

  // An animation drawn in code: an <img> plays it by itself. While paused, the still picture takes its place.
  if (url.endsWith('.svg')) {
    return (
      <figure className="media">
        <img src={playing ? apod.url : apod.thumbnail_url} alt={apod.title} />
        <figcaption className="media__bar">
          <span className="badge">Video</span>
          <button type="button" className="media__button" onClick={() => setPlaying(!playing)}>
            {playing ? 'Pause' : 'Play'}
          </button>
        </figcaption>
      </figure>
    )
  }

  // Anything else, for example the player of a video-sharing site: we cannot play it here.
  return (
    <div className="media media--note">
      {apod.thumbnail_url && <img src={apod.thumbnail_url} alt="" />}
      <p>This day features a video, but it cannot be played here.</p>
    </div>
  )
}

// The picture of the day by its media type: an image, a video or something else.
function ApodMedia({ apod }) {
  if (apod.media_type === 'image') {
    return (
      <figure className="media">
        <img src={apod.url} alt={apod.title} />
      </figure>
    )
  }

  if (apod.media_type === 'video') {
    return <VideoPlayer apod={apod} />
  }

  return (
    <div className="media media--note">
      <p>This day features content that cannot be shown here.</p>
    </div>
  )
}

export default ApodMedia
```

- `ApodMedia` chooses by `media_type`, and `VideoPlayer` by the end of the URL: `toLowerCase()` makes it lowercase,
  and `endsWith('.svg')` tells whether the string ends in `.svg`. One file can hold several components; only
  `ApodMedia` uses `VideoPlayer`, so we do not export it.
- Why is `VideoPlayer` a component of its own? Because only the video has state (playing or paused). After the early
  returns of `ApodMedia` we could not call `useState`: the [[rules of hooks]], familiar from lesson 6, say that a hook
  must always be called at the top of the component, without conditions, in the same order on every drawing, because
  React knows which state is which only from their order. We could put it at the top of `ApodMedia`, but then every
  picture day would have a needless state too. In a component of its own, the state belongs only to the videos.
- `prefersLessMotion` uses `matchMedia`, familiar from lesson 2. If the "reduce motion" setting
  ([[prefers-reduced-motion]], familiar from lesson 1) is switched on in someone's system, the motion does not start
  by itself, just as the slideshow did not in lesson 12. Thanks to the lazy initial value of `useState`, this runs only
  once, on the first drawing.
- `poster` is the still picture of a `<video>` until you start it. If `thumbnail_url` is missing, it is `undefined`,
  and React simply leaves the attribute out.

In `ApodCard`, the new component takes the place of the `<figure>`. Here is the whole
`src/components/ApodCard.jsx`:

```jsx file=src/components/ApodCard.jsx mark=2,4,8
import { formatDay } from '../dates.js'
import ApodMedia from './ApodMedia.jsx'

// The picture of one day: the picture or video, the date, the title, the author and the explanation.
function ApodCard({ apod }) {
  return (
    <article className="apod">
      <ApodMedia apod={apod} />
      <p className="apod__date">{formatDay(apod.date)}</p>
      <h2 className="apod__title">{apod.title}</h2>
      {apod.copyright && <p className="apod__credit">Image: {apod.copyright}</p>}
      <p className="apod__text">{apod.explanation}</p>
    </article>
  )
}

export default ApodCard
```

:::check Check
Go to 14 November 2026: "Dancing Curtains of Light". The aurora moves, and under it, in a black bar, there is a gold
"VIDEO" badge and a "Pause" button. "Pause" stops it (the still picture appears), and "Play" starts it again. Other
video days are 8 November and 22 November 2026, for example; the archive repeats every 50 days, so there are videos
50, 100, 150… days before them too. A day with an ordinary picture has no bar and no button.
:::

:::mistake Common mistake
`thumbs: 'true'` is missing. The video plays, but after "Pause" a black box is left in its place, with a broken
picture icon and the title in its corner. `thumbnail_url` is not in the answer then, the `<img>` is left without a
`src`, and all the browser can show is its `alt` text. Whatever the API sends only when a parameter asks for it is
missing from the answer without that parameter, and the field's value is `undefined`.
:::

:::try Try it
Switch on "reduced motion" in the developer tools: ++F12++, then ++Ctrl++ + ++Shift++ + ++P++ (on a Mac ++Cmd++ +
++Shift++ + ++P++), type "reduced motion" and choose "Emulate CSS prefers-reduced-motion: reduce". Reload the page on
a video day: the still picture comes first, and the button says "Play".
:::

### Favourites

A beautiful picture is worth keeping. The list of favourites stays in the browser, with the `useLocalStorage` hook
you know from lesson 6: it works like `useState`, but it also saves the value as JSON in `localStorage`, and reads it
back from there after a reload. If you have your own version from lesson 9, copy it over; if not, create the file
`src/useLocalStorage.js`:

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

// Works like useState, but the value survives a reload:
// it is kept as JSON in localStorage, under the given key.
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved !== null) return JSON.parse(saved)
    } catch {
      // Blocked storage or a broken save: the initial value stays.
    }
    return initialValue
  })

  // Save after every change.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // No harm if it fails: the value still works, it just does not remember.
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
```

What should we save about a favourite? Not the whole answer: the explanation is long, and the list does not need it.
The date is enough (the rest can always be fetched again with it), plus the title and a small picture for the card.
The small picture is the picture itself for an image, and the still picture for a video. A little helper at the end of
`src/api.js` works this out. Here is the whole file:

```js file=src/api.js mark=34-37
// Everything that talks to the space API: the address, the key, the request and recognising errors.
const API_URL = '/api/apod'
// The key comes from the .env.local file. If there is none, the public demo key stays.
const API_KEY = import.meta.env.VITE_APOD_KEY || 'DEMO_KEY'

// Messages for the status codes we know. Everything else gets the general message.
const ERROR_MESSAGES = {
  400: 'There is no picture for this day in the archive (400 Bad Request).',
  403: 'The API did not accept the key (403 Forbidden). Check that you entered it correctly!',
  429: 'Your key has used up its requests for this hour (429 Too Many Requests). Wait a little, or reload the page!',
}

// One request to the API. params is the rest of the query, for example { date: '2026-11-15' }.
// If it worked, it returns the data of the answer; if not, it throws an error.
export async function fetchApod(params) {
  // URLSearchParams builds the part after the ? and encodes every value safely.
  // Because of thumbs: 'true', video days come with a still picture too (thumbnail_url).
  const query = new URLSearchParams({ api_key: API_KEY, lang: 'en', thumbs: 'true', ...params })
  const response = await fetch(`${API_URL}?${query}`)
  if (!response.ok) {
    // fetch throws by itself only when it cannot reach the server at all. A 403 or a 429 is ours to notice.
    const problem = new Error(`HTTP ${response.status}`)
    problem.status = response.status // this tells us later which message to show
    throw problem
  }
  return response.json()
}

// The message for the user about an error.
export function errorMessage(error) {
  return ERROR_MESSAGES[error.status] ?? 'The space API is not available right now. Try again!'
}

// The small picture of a day: the picture itself for an image, the still for a video (undefined if none).
export function thumbnailOf(apod) {
  return apod.media_type === 'image' ? apod.url : apod.thumbnail_url
}
```

The card gets a star button. It is a toggle button: `aria-pressed` tells (screen readers and the CSS alike) whether it
is pressed. Here is the whole `src/components/ApodCard.jsx`:

```jsx file=src/components/ApodCard.jsx mark=4-5,12-20
import { formatDay } from '../dates.js'
import ApodMedia from './ApodMedia.jsx'

// The picture of one day: the picture or video, the date, the title, the author, the star and the explanation.
function ApodCard({ apod, isFavorite, onToggleFavorite }) {
  return (
    <article className="apod">
      <ApodMedia apod={apod} />
      <p className="apod__date">{formatDay(apod.date)}</p>
      <h2 className="apod__title">{apod.title}</h2>
      {apod.copyright && <p className="apod__credit">Image: {apod.copyright}</p>}
      <button
        type="button"
        className="favorite-button"
        aria-pressed={isFavorite}
        onClick={onToggleFavorite}
      >
        <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
        Favourite
      </button>
      <p className="apod__text">{apod.explanation}</p>
    </article>
  )
}

export default ApodCard
```

`PictureOfTheDay` only passes the two props on. It calls `onToggleFavorite` with the loaded day, because `App` cannot
see `apod`: only the hook knows it. Here is the whole `src/components/PictureOfTheDay.jsx`:

```jsx file=src/components/PictureOfTheDay.jsx mark=6,28
import useApod from '../useApod.js'
import { errorMessage } from '../api.js'
import ApodCard from './ApodCard.jsx'

// The picture of one day: a waiting message while it is on its way; after an error, the message and "Try again".
function PictureOfTheDay({ date, isFavorite, onToggleFavorite }) {
  const { status, apod, error, retry } = useApod(date)

  if (status === 'loading') {
    return (
      <p className="status" role="status">
        The picture is on its way…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="status status--error" role="alert">
        <p>{errorMessage(error)}</p>
        <button type="button" className="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  return <ApodCard apod={apod} isFavorite={isFavorite} onToggleFavorite={() => onToggleFavorite(apod)} />
}

export default PictureOfTheDay
```

The list of favourites is made of small cards. Clicking a card opens that day, and the × in its corner removes it.
Create the file `src/components/Favorites.jsx`:

```jsx file=src/components/Favorites.jsx
import { formatDay } from '../dates.js'

// The favourite days on small cards. Clicking a card opens that day.
function Favorites({ favorites, onOpen, onRemove }) {
  return (
    <section className="favorites">
      <h2 className="section-title">Favourites ({favorites.length})</h2>
      {favorites.length === 0 && <p className="muted">No favourites yet. Mark a picture with the star!</p>}
      <ul className="favorites__list">
        {favorites.map((favorite) => (
          <li key={favorite.date} className="favorite">
            <button type="button" className="favorite__open" onClick={() => onOpen(favorite.date)}>
              {favorite.thumb ? (
                <img src={favorite.thumb} alt="" loading="lazy" />
              ) : (
                <span className="favorite__placeholder" aria-hidden="true">
                  ★
                </span>
              )}
              <span className="favorite__date">{formatDay(favorite.date, 'medium')}</span>
              <span className="favorite__title">{favorite.title}</span>
            </button>
            <button
              type="button"
              className="favorite__remove"
              aria-label={`${favorite.title}: remove from favourites`}
              onClick={() => onRemove(favorite.date)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Favorites
```

The small picture gets `alt=""`, because the title stands right next to it; screen readers skip an empty `alt`.
`loading="lazy"` is familiar from lesson 12: the browser downloads the picture only when it comes near the screen. If
a favourite has no small picture, a star takes its place. The `aria-label` of the × button tells screen readers what
it removes.

Finally `App`: the list lives here, and so do the functions that add and remove favourites. Here is the whole
`src/App.jsx`:

```jsx file=src/App.jsx mark=2-3,7,14,16-17,24-36,48,50
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { thumbnailOf } from './api.js'
import { FIRST_DAY, apodToday } from './dates.js'
import DateNav from './components/DateNav.jsx'
import PictureOfTheDay from './components/PictureOfTheDay.jsx'
import Favorites from './components/Favorites.jsx'
import './App.css'

function App() {
  // Today, as the API sees it. We work it out once, when the page opens.
  const [today] = useState(apodToday)
  const [date, setDate] = useState(today) // the day that is open
  const [favorites, setFavorites] = useLocalStorage('space-explorer-favorites', [])

  // A derived value: is the open day a favourite?
  const isFavorite = favorites.some((favorite) => favorite.date === date)

  function changeDate(newDate) {
    // An empty date, or one outside the archive, is not accepted.
    if (newDate >= FIRST_DAY && newDate <= today) setDate(newDate)
  }

  function removeFavorite(day) {
    setFavorites(favorites.filter((favorite) => favorite.date !== day))
  }

  function toggleFavorite(apod) {
    if (isFavorite) {
      removeFavorite(apod.date)
      return
    }
    // We save only what the list needs. The new favourite goes first.
    const favorite = { date: apod.date, title: apod.title, thumb: thumbnailOf(apod) }
    setFavorites([favorite, ...favorites])
  }

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      <DateNav date={date} today={today} onChange={changeDate} />

      {/* Because of the key, every new date gets a brand-new PictureOfTheDay with fresh state. */}
      <PictureOfTheDay key={date} date={date} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />

      <Favorites favorites={favorites} onOpen={changeDate} onRemove={removeFavorite} />
    </main>
  )
}

export default App
```

- `isFavorite` is a [[derived value]]: we do not store it, we work it out from the list and the date on every drawing.
  `some` is true if at least one element of the array matches the condition.
- The list is updated with copies again, as in lesson 9: `filter` gives a new array without the removed day, and
  `[favorite, ...favorites]` a new array with the new favourite at the front.
- The cards of `Favorites` call the same `changeDate` as the day navigation: opening a favourite is just a change of
  date.

:::check Check
Under the title on the card there is a "☆ Favourite" button. Click it: it turns gold, and the star fills in (★).
Further down, "FAVOURITES (0)" now says "FAVOURITES (1)", with a small card under it: the picture, the short date and
the title. Go to another day and mark that one too: two cards, the new one first. Click a small card: that day opens.
Reload the page: the favourites are still there. The × removes a small card; if that day is the one open, the star on
the big card goes out too.
:::

:::mistake Common mistake
Saving the whole answer: `setFavorites([apod, ...favorites])`. It works, but every favourite goes into
`localStorage` with its whole explanation, and `localStorage` has a limited size (about 5 MB in most browsers). Store
only what you really need; the rest can always be fetched again by its date.
:::

:::try Task
Mark the small card of the day that is open: give `Favorites` a `current` prop (the `date`), and give the `<li>` an
`aria-current={favorite.date === current}` attribute. Write its style at the end of `src/App.css`:
`.favorite[aria-current='true'] .favorite__open { border-color: var(--gold); }`.
:::

### A cache: fewer requests

Go back and forth between the days a few times, and watch the Network tab: we fetch the same day again every time.
Needlessly, because the picture of a day never changes once it has appeared. And every request uses up some of your
key's hourly allowance (the demo key's 30 would be gone in no time), especially in development, where StrictMode makes
every day two requests.

This is what a [[cache]] is for, which you met at the end of lesson 14, with the last known rates: a place where we
keep the answers we already have, so that next time we do not need to ask for them again. Ours lives in `localStorage`, so it survives a reload too. It has two rules:

- We only keep things that do not go stale. The picture of a day is like that; an exchange rate or a weather report
  would not be.
- It must not grow forever. `localStorage` has a limited size, so we keep only the last 40 days we looked at, and the
  one saved longest ago goes first.

Create the file `src/apodCache.js`:

```js file=src/apodCache.js
// The days already downloaded, kept in the browser. The picture of a day never changes once it has appeared,
// so whatever we got once does not need to be fetched again.
const CACHE_KEY = 'space-explorer-cache'
const MAX_DAYS = 40 // we keep this many days; the one saved longest ago goes first

// The whole cache in one object: { '2026-11-15': { …the data of the day… }, … }.
function readAll() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {}
  } catch {
    return {} // blocked storage or a broken save: we start with an empty cache
  }
}

// One day from the cache, or null if it is not in it yet.
export function readCache(date) {
  return readAll()[date] ?? null
}

// Saves one day. If too many days have piled up, the ones saved longest ago are dropped.
export function saveToCache(date, apod) {
  const cache = readAll()
  delete cache[date] // if it was in already, it moves to the end, as the newest
  cache[date] = apod
  const dates = Object.keys(cache) // in the order they were saved
  for (const old of dates.slice(0, Math.max(0, dates.length - MAX_DAYS))) {
    delete cache[old]
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // The storage is full or blocked: no harm, next time we simply ask the API again.
  }
}
```

- The cache is a single object whose keys are the dates. `localStorage.getItem` gives `null` if there is no such key
  yet; `JSON.parse(null)` is `null` too, and then `?? {}` gives an empty object.
- `delete cache[date]` removes a key from the object. `Object.keys` gives the keys in the order they were added, so if
  we delete a day first and then write it back, it moves to the end.
- When there are more than 40 days, `slice` takes the ones that go from the start of the list, where the days saved
  longest ago are. `Math.max(0, …)` makes sure that none goes while there are fewer than 40.
- `setItem` throws an error when the storage is full. Thanks to `try/catch`, even that does no harm: the cache only
  makes things faster, and everything works without it.

Now the hook looks in the cache first. If the day is there, it starts in the `'success'` state right away, and the
effect does not even ask the server. Here is the whole `src/useApod.js`:

```js file=src/useApod.js mark=3,8-10,15-16,24
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'
import { readCache, saveToCache } from './apodCache.js'

// The picture of one day from the API: { status, apod, error, retry }.
// The status is 'loading' (on its way), 'success' (arrived) or 'error' (something went wrong).
function useApod(date) {
  // If this day is in the cache already, we have it right away: no waiting.
  const [apod, setApod] = useState(() => readCache(date))
  const [status, setStatus] = useState(apod ? 'success' : 'loading')
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // the "Try again" button increases it, which restarts the request

  useEffect(() => {
    // For a day in the cache we do not ask the server again.
    if (readCache(date)) return

    let ignore = false

    async function load() {
      try {
        const data = await fetchApod({ date })
        if (ignore) return
        saveToCache(date, data)
        setApod(data)
        setStatus('success')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    // Cleanup: if the component disappeared meanwhile (or a new request started), we drop this request's answer.
    return () => {
      ignore = true
    }
  }, [date, attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { status, apod, error, retry }
}

export default useApod
```

The `apod` state comes first now, and its lazy initial value comes from the cache. The initial value of `status` is
worked out from it: `'success'` if we have the day, `'loading'` if not. Because every new date gets a new
`PictureOfTheDay` (thanks to the `key`), the initial values are worked out again for every day.

:::check Check
Filter the Network tab for `apod?`, then go back two days and forward two. Going back, every new day is one request
(two in development); going forward, none at all: the pictures appear at once, without "The picture is on its way…".
Reload the page: today's picture is there at once too, without a request. On the Application tab of the developer
tools (Local Storage, `http://localhost:5173`) there is the `space-explorer-cache` key with the saved days. That is the
intermediate level done: commit it!
:::

:::mistake Common mistake
Putting an error into the cache too, for example by adding `saveToCache` to the `catch` branch as well. A one-off
error (the allowance ran out, or the network was down) then sticks forever: the day does not load even when the API
would have answered again long ago. Only a successful answer may go into the cache.
:::

:::concept Caches everywhere
Caching is one of the most important tricks of the web, and it happens in many places. In a header of its answer
(`Cache-Control`), a server can say how long the browser may reuse the answer without asking; our server allows an
hour for the pictures. Big sites keep copies of their files on servers all over the world, on a [[CDN]]. And in apps,
libraries such as TanStack Query or SWR help: they also refresh the stored data in the background when it can go
stale. The hardest question is always the same: when should a stored answer be thrown away?
:::

## Advanced level {level=3}

### A gallery: many days in one request

So far one request brought one day. A gallery needs many pictures, though, and if we sent a request for each of them,
the demo key's allowance would be gone in a moment. That is why the API can return a whole [[date range]] for a single
request: every day between `start_date` and `end_date` comes, in an array. The parameter names are lowercase words
joined by underscores (`start_date`, not `startDate`): the API decided this, and they must be written exactly so.

At first the gallery shows today and the 11 days before it. A bundle of 12 days like this is a [[page]]; in the next
step the older days come page by page too. Loading goes into a hook of its own. Create the file `src/useGallery.js`:

```js file=src/useGallery.js
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'
import { FIRST_DAY, shiftDay } from './dates.js'

const PAGE_SIZE = 12 // the pictures of this many days come in one request

// The days of page number `page`, counted back from today, as API parameters.
// Page 0 is today and the 11 days before it, page 1 the 12 days before those, and so on.
function pageRange(today, page) {
  const end = shiftDay(today, -page * PAGE_SIZE)
  const start = shiftDay(end, -(PAGE_SIZE - 1))
  // There are no pictures before the first day of the archive, so we stop there.
  return { start_date: start < FIRST_DAY ? FIRST_DAY : start, end_date: end }
}

// The pictures of the gallery: { pictures, status, error, retry }.
function useGallery(today) {
  const [pictures, setPictures] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' or 'error'
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // the "Try again" button increases it, which restarts the request

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await fetchApod(pageRange(today, 0))
        if (ignore) return
        // The API sends the days from the oldest to the newest; we want the newest first.
        setPictures([...data].reverse())
        setStatus('ready')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [today, attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { pictures, status, error, retry }
}

export default useGallery
```

- `pageRange` works out the first and the last day of a page. Page 0 ends today and starts 11 days earlier: that is
  12 days, counting both ends. `-page * PAGE_SIZE` starts to make sense in the next step, when `page` is not always 0.
- The API sends the days in time order, oldest first. `reverse()` turns the array around, but it changes the original,
  so we make a copy first (`[...data]`), just as we always changed copies in lesson 9.
- The structure is the same as in `useApod`: `ignore`, `try/catch`, `attempt` and `retry`. A request always looks
  like this.

Now the gallery itself: small cards in a grid. Clicking a card opens that day in the picture of the day view. Create
the file `src/components/Gallery.jsx`:

```jsx file=src/components/Gallery.jsx
import useGallery from '../useGallery.js'
import { errorMessage, thumbnailOf } from '../api.js'
import { formatDay } from '../dates.js'

// The pictures of many days in a grid, newest first.
function Gallery({ today, onOpenDay }) {
  const { pictures, status, error, retry } = useGallery(today)

  return (
    <section className="gallery">
      <ul className="gallery__grid">
        {pictures.map((picture) => (
          <li key={picture.date}>
            <button type="button" className="gallery__item" onClick={() => onOpenDay(picture.date)}>
              <img src={thumbnailOf(picture)} alt="" loading="lazy" />
              {picture.media_type === 'video' && <span className="badge gallery__badge">Video</span>}
              <span className="gallery__date">{formatDay(picture.date, 'medium')}</span>
              <span className="gallery__title">{picture.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {status === 'loading' && <p className="gallery__more">Pictures are on their way…</p>}
      {status === 'error' && (
        <div className="status status--error" role="alert">
          <p>{errorMessage(error)}</p>
          <button type="button" className="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}
    </section>
  )
}

export default Gallery
```

`App` gets two views: the picture of the day (with the day navigation and the favourites) and the gallery. Which one
shows is decided by a new state, `view`, and two buttons switch between them. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=8,14,40-45,54-66,68-75,77
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { thumbnailOf } from './api.js'
import { FIRST_DAY, apodToday } from './dates.js'
import DateNav from './components/DateNav.jsx'
import PictureOfTheDay from './components/PictureOfTheDay.jsx'
import Favorites from './components/Favorites.jsx'
import Gallery from './components/Gallery.jsx'
import './App.css'

function App() {
  // Today, as the API sees it. We work it out once, when the page opens.
  const [today] = useState(apodToday)
  const [view, setView] = useState('day') // 'day' (the picture of the day) or 'gallery'
  const [date, setDate] = useState(today) // the day that is open
  const [favorites, setFavorites] = useLocalStorage('space-explorer-favorites', [])

  // A derived value: is the open day a favourite?
  const isFavorite = favorites.some((favorite) => favorite.date === date)

  function changeDate(newDate) {
    // An empty date, or one outside the archive, is not accepted.
    if (newDate >= FIRST_DAY && newDate <= today) setDate(newDate)
  }

  function removeFavorite(day) {
    setFavorites(favorites.filter((favorite) => favorite.date !== day))
  }

  function toggleFavorite(apod) {
    if (isFavorite) {
      removeFavorite(apod.date)
      return
    }
    // We save only what the list needs. The new favourite goes first.
    const favorite = { date: apod.date, title: apod.title, thumb: thumbnailOf(apod) }
    setFavorites([favorite, ...favorites])
  }

  // Opening a day from the gallery: we switch to that day and back to the picture of the day.
  function openDay(day) {
    changeDate(day)
    setView('day')
    window.scrollTo(0, 0) // to the top of the page, even from the bottom of the gallery
  }

  return (
    <main className="explorer">
      <header className="explorer__header">
        <h1>Space Explorer</h1>
        <p>A picture of our universe for every day.</p>
      </header>

      <div className="tabs" role="group" aria-label="View">
        <button type="button" className="tab" aria-pressed={view === 'day'} onClick={() => setView('day')}>
          Picture of the day
        </button>
        <button
          type="button"
          className="tab"
          aria-pressed={view === 'gallery'}
          onClick={() => setView('gallery')}
        >
          Gallery
        </button>
      </div>

      {view === 'day' && (
        <>
          <DateNav date={date} today={today} onChange={changeDate} />
          {/* Because of the key, every new date gets a brand-new PictureOfTheDay with fresh state. */}
          <PictureOfTheDay key={date} date={date} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
          <Favorites favorites={favorites} onOpen={changeDate} onRemove={removeFavorite} />
        </>
      )}

      {view === 'gallery' && <Gallery today={today} onOpenDay={openDay} />}
    </main>
  )
}

export default App
```

`<>` and `</>` make a [[fragment]], familiar from lesson 12: it groups several elements without adding another HTML
element to the page. `role="group"` and `aria-label` tell screen readers that the two buttons together choose the
view.

:::check Check
Under the header there are two buttons: "Picture of the day" (gold, this one is selected) and "Gallery". Click
"Gallery": after a short "Pictures are on their way…", 12 small cards appear, starting with today and going back. The
cards of video days have a "VIDEO" badge. In the Network tab a single new `apod?` request came (two in development),
with `start_date=…&end_date=…` in its address. Click a card: the picture of the day view opens with that day.
:::

:::mistake Common mistake
`startDate` and `endDate` instead of `start_date` and `end_date`. The gallery says "The space API is not available
right now", although the answer in the Network tab is a `200`. The API does not know these names, so it ignores them
and sends today's picture, as a single object, not an array. `[...data]` cannot do anything with an object and throws
an error, and the `catch` catches our own error too and shows the general message. If you cannot tell what happened,
put a `console.error(problem)` line at the start of the `catch`: the real reason appears in the console ("data is not
iterable").
:::

:::try Try it
Change `PAGE_SIZE` to 30: a single request now brings 30 days. The API gives at most 100 days at a time. What happens
with 101? (A `400` error and the "There is no picture for this day" message, because our `errorMessage` shows this
for every `400` error. The real reason is in the answer, on the Network tab.) Then set it back to 12.
:::

### Infinite scroll

The archive has more than eleven thousand days, so we cannot fetch them all at once. APIs give long lists like this
in pages, which is called [[pagination]]: the program that asks (the [[client]], our app here) says which page it
wants, and the server sends only that page.
For us, `pageRange` works out the date range from the number of the page (`page`): page 0 ends today, page 1 ends 12
days earlier, and so on.

You wrote [[infinite scroll]] in lesson 12: a [[sentinel]] goes under the grid, and an [[IntersectionObserver]] tells
us when it comes near the screen. There, all the pictures were there already, and we just showed more and more of
them. Now we go to the server for every page, which raises two new questions. What happens to the old pictures when
the new page arrives? The new page goes to the end of the list. And what if the sentinel reports twice before the
first page has arrived? While a page is on its way, we do not ask for another one. Here is the whole
`src/useGallery.js`:

```js file=src/useGallery.js mark=16,18,29,32-34,47,49-50,52-55,62
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'
import { FIRST_DAY, shiftDay } from './dates.js'

const PAGE_SIZE = 12 // the pictures of this many days come in one request

// The days of page number `page`, counted back from today, as API parameters.
// Page 0 is today and the 11 days before it, page 1 the 12 days before those, and so on.
function pageRange(today, page) {
  const end = shiftDay(today, -page * PAGE_SIZE)
  const start = shiftDay(end, -(PAGE_SIZE - 1))
  // There are no pictures before the first day of the archive, so we stop there.
  return { start_date: start < FIRST_DAY ? FIRST_DAY : start, end_date: end }
}

// The pictures of the gallery, page by page: { pictures, status, error, hasMore, loadMore, retry }.
function useGallery(today) {
  const [page, setPage] = useState(0) // the page we are at
  const [pictures, setPictures] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' or 'error'
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // the "Try again" button increases it, which restarts the request

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const data = await fetchApod(pageRange(today, page))
        if (ignore) return
        // The API sends the days from the oldest to the newest; we want the newest first.
        const newestFirst = [...data].reverse()
        // An updater function: the new page goes to the end of the latest list.
        setPictures((old) => [...old, ...newestFirst])
        setStatus('ready')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [today, page, attempt])

  // Is there an older page? It ends at the first day of the archive.
  const hasMore = pageRange(today, page).start_date > FIRST_DAY

  function loadMore() {
    setStatus('loading')
    setPage((current) => current + 1)
  }

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { pictures, status, error, hasMore, loadMore, retry }
}

export default useGallery
```

- The `page` state is in the dependency array: when `loadMore` increases it, the effect runs again and asks for the
  next page. `attempt` and `retry` ask for the same page again if you click "Try again" after an error.
- `setPictures((old) => [...old, ...newestFirst])` gets an [[updater function]], as in lessons 6 and 12. This way React
  hands us the latest list (`old`), and `pictures` does not need to go into the dependency array. If it were there, the
  effect would run again after every new page, and fetch the same page once more.
- `hasMore` is a derived value: if the current page already starts at the first day of the archive, there is no more.
- `loadMore` increases `page` with an updater function too: the sentinel's observer was made in an earlier drawing,
  where `page` may still hold an old value.

The sentinel and the observer go into `Gallery`. Here is the whole `src/components/Gallery.jsx`:

```jsx file=src/components/Gallery.jsx mark=1,6,8-10,12-24,49-54
import { useEffect, useRef } from 'react'
import useGallery from '../useGallery.js'
import { errorMessage, thumbnailOf } from '../api.js'
import { formatDay } from '../dates.js'

// The pictures of many days in a grid, newest first. Scrolling down brings the older ones.
function Gallery({ today, onOpenDay }) {
  const { pictures, status, error, hasMore, loadMore, retry } = useGallery(today)
  // The sentinel: a line of text under the grid. When it comes near the screen, the next page can come.
  const sentinelRef = useRef(null)

  useEffect(() => {
    // While a page is on its way, after an error, or when there are no more pages, we do not watch.
    if (status !== 'ready' || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '300px' },
    )
    observer.observe(sentinelRef.current)
    // Cleanup: the old observer stops before a new one starts.
    return () => observer.disconnect()
  }, [status, hasMore, loadMore])

  return (
    <section className="gallery">
      <ul className="gallery__grid">
        {pictures.map((picture) => (
          <li key={picture.date}>
            <button type="button" className="gallery__item" onClick={() => onOpenDay(picture.date)}>
              <img src={thumbnailOf(picture)} alt="" loading="lazy" />
              {picture.media_type === 'video' && <span className="badge gallery__badge">Video</span>}
              <span className="gallery__date">{formatDay(picture.date, 'medium')}</span>
              <span className="gallery__title">{picture.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {status === 'error' && (
        <div className="status status--error" role="alert">
          <p>{errorMessage(error)}</p>
          <button type="button" className="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}
      {status !== 'error' && hasMore && (
        <p ref={sentinelRef} className="gallery__more">
          {status === 'loading' ? 'Pictures are on their way…' : 'Scroll on for more pictures!'}
        </p>
      )}
      {!hasMore && <p className="gallery__more">This was the first day of the archive.</p>}
    </section>
  )
}

export default Gallery
```

- The sentinel is now the line of text under the grid ("Pictures are on their way…" while a page loads, otherwise
  "Scroll on for more pictures!"): it stands there while there are more pages and no error. Because of
  `rootMargin: '300px'`, the observer reports already when the sentinel is still 300 pixels below
  the bottom of the screen.
- The condition at the start of the effect is the most important line. While a page is on its way (`'loading'`), we
  do not watch, so every page is asked for only once. When the page has arrived, `status` becomes `'ready'`, the effect
  runs again, and a fresh observer starts. The new observer reports where the sentinel is as soon as it starts: if the
  sentinel is still near the screen (on a big screen 12 pictures may not be enough), the next page comes at once.
- `loadMore` is a new function on every drawing, so the observer starts again after every drawing too. That is fine:
  making an observer is cheap, and this way it always calls the latest `loadMore`.

:::check Check
Open the gallery and scroll down: at the bottom of the grid "Pictures are on their way…", then 12 older days. There
are no gaps in the dates: every day is there, going back from today. In the Network tab every page is a new request,
with an earlier and earlier `start_date`. On a big screen the gallery starts with two pages at once, because the
sentinel was still in view after the first 12 pictures.
:::

:::mistake Common mistake
The `status !== 'ready'` condition is missing. The gallery stays empty, "Pictures are on their way…" stays put, and
the Network tab fills with dozens of requests a second, with older and older dates. The observer reports while a page
is loading, `loadMore` increases `page`, and `ignore` drops the answer of the previous request. After the new drawing
a new observer starts, reports again, and so on: not a single page arrives, but your key's allowance runs down. If you
see this, reload the page and put the condition back.
:::

:::try Try it
Does the end of the archive work? You would need to scroll through more than 900 pages for that. Instead, change
`FIRST_DAY` in `dates.js` to a day three weeks ago for a moment: after two or three pages, "This was the first day of
the archive." appears, and the observer stops. Then set it back to `'1995-06-16'`.
:::

### Filters and random pictures

The API can give pictures in a third way too: for `count=12` it sends 12 days picked at random from the whole archive.
Let the gallery have two sources: "Archive" (back from today) and "Random pictures". In random mode every page is 12
new random days, and they never run out.

There is a trap: random days can repeat. If the same day gets into the list twice, two `<li>` elements get the same
`key`, and React mixes them up. So from every new page we add only the days that are not in the list yet. The fastest
way to check whether a date is already there is the [[Set]] you know from lesson 3. Here is the whole
`src/useGallery.js`:

```js file=src/useGallery.js mark=16-27,29-30,32,44-46,50-51,64,66-67,74-81,88
import { useEffect, useState } from 'react'
import { fetchApod } from './api.js'
import { FIRST_DAY, shiftDay } from './dates.js'

const PAGE_SIZE = 12 // the pictures of this many days come in one request

// The days of page number `page`, counted back from today, as API parameters.
// Page 0 is today and the 11 days before it, page 1 the 12 days before those, and so on.
function pageRange(today, page) {
  const end = shiftDay(today, -page * PAGE_SIZE)
  const start = shiftDay(end, -(PAGE_SIZE - 1))
  // There are no pictures before the first day of the archive, so we stop there.
  return { start_date: start < FIRST_DAY ? FIRST_DAY : start, end_date: end }
}

// The old list with the new pictures at its end. Whatever is in it already does not go in again.
function addNew(old, incoming) {
  const seen = new Set(old.map((picture) => picture.date))
  const result = [...old]
  for (const picture of incoming) {
    if (!seen.has(picture.date)) {
      seen.add(picture.date)
      result.push(picture)
    }
  }
  return result
}

// The pictures of the gallery, page by page: { mode, changeMode, pictures, status, error, hasMore, loadMore, retry }.
// The mode is 'archive' (back from today) or 'random' (random days).
function useGallery(today) {
  const [mode, setMode] = useState('archive')
  const [page, setPage] = useState(0) // the page we are at
  const [pictures, setPictures] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready' or 'error'
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // the "Try again" button increases it, which restarts the request

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        // In random mode 12 random days come; otherwise the days of page number `page`.
        const params = mode === 'random' ? { count: PAGE_SIZE } : pageRange(today, page)
        const data = await fetchApod(params)
        if (ignore) return
        // The API sends the days from the oldest to the newest; we want the newest first.
        const newestFirst = [...data].reverse()
        // An updater function: the new page goes to the end of the latest list, without repeats.
        setPictures((old) => addNew(old, newestFirst))
        setStatus('ready')
      } catch (problem) {
        if (ignore) return
        setError(problem)
        setStatus('error')
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [mode, today, page, attempt])

  // Is there another page? Random pictures never run out; the archive, however, has a beginning.
  const hasMore = mode === 'random' || pageRange(today, page).start_date > FIRST_DAY

  function loadMore() {
    setStatus('loading')
    setPage((current) => current + 1)
  }

  function changeMode(newMode) {
    if (newMode === mode) return
    // A new source: we start again from the beginning, with an empty list.
    setMode(newMode)
    setPage(0)
    setPictures([])
    setStatus('loading')
  }

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  return { mode, changeMode, pictures, status, error, hasMore, loadMore, retry }
}

export default useGallery
```

- `addNew` is a [[pure function]] (lesson 8): for the same input it always gives the same result, and it changes
  nothing around it, only its own `seen` set and `result` array. This matters for updater functions: in development,
  StrictMode calls them twice too, to find out whether any of them changes something outside itself (a side effect).
- In random mode `page` is only a counter: every increase starts a new request, but we do not use its value.
- `changeMode` resets everything in the event handler, not in an effect, as with the albums in lesson 12. The `if` at
  its start matters: if we are in that mode already and still on its first page (`page` is 0), `setMode` and
  `setPage(0)` would change nothing, so the effect would not run again, but the list would be emptied and would stay
  empty forever.

The filter is a simpler case: it needs no new request, we just show fewer of the pictures already loaded. That is a
derived value again, not a new list in state. Here is the whole `src/components/Gallery.jsx`:

```jsx file=src/components/Gallery.jsx mark=1,6-15,17,19-20,24-25,43-70,73
import { useEffect, useRef, useState } from 'react'
import useGallery from '../useGallery.js'
import { errorMessage, thumbnailOf } from '../api.js'
import { formatDay } from '../dates.js'

const MODES = [
  { value: 'archive', label: 'Archive' },
  { value: 'random', label: 'Random pictures' },
]

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
]

// The pictures of many days in a grid. Scrolling down brings the next page.
function Gallery({ today, onOpenDay }) {
  const { mode, changeMode, pictures, status, error, hasMore, loadMore, retry } = useGallery(today)
  const [filter, setFilter] = useState('all') // 'all', 'image' or 'video'
  // The sentinel: a line of text under the grid. When it comes near the screen, the next page can come.
  const sentinelRef = useRef(null)

  // A derived value: the pictures that pass the filter. We do not store it; we work it out on every drawing.
  const visible = filter === 'all' ? pictures : pictures.filter((picture) => picture.media_type === filter)

  useEffect(() => {
    // While a page is on its way, after an error, or when there are no more pages, we do not watch.
    if (status !== 'ready' || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '300px' },
    )
    observer.observe(sentinelRef.current)
    // Cleanup: the old observer stops before a new one starts.
    return () => observer.disconnect()
  }, [status, hasMore, loadMore])

  return (
    <section className="gallery">
      <div className="gallery__toolbar">
        <div className="chips" role="group" aria-label="Where should the pictures come from?">
          {MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              className="chip"
              aria-pressed={mode === item.value}
              onClick={() => changeMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Filter">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className="chip"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="gallery__grid">
        {visible.map((picture) => (
          <li key={picture.date}>
            <button type="button" className="gallery__item" onClick={() => onOpenDay(picture.date)}>
              <img src={thumbnailOf(picture)} alt="" loading="lazy" />
              {picture.media_type === 'video' && <span className="badge gallery__badge">Video</span>}
              <span className="gallery__date">{formatDay(picture.date, 'medium')}</span>
              <span className="gallery__title">{picture.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {status === 'error' && (
        <div className="status status--error" role="alert">
          <p>{errorMessage(error)}</p>
          <button type="button" className="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}
      {status !== 'error' && hasMore && (
        <p ref={sentinelRef} className="gallery__more">
          {status === 'loading' ? 'Pictures are on their way…' : 'Scroll on for more pictures!'}
        </p>
      )}
      {!hasMore && <p className="gallery__more">This was the first day of the archive.</p>}
    </section>
  )
}

export default Gallery
```

The filter and the infinite scroll work together nicely. If the "Videos" filter leaves only two cards in the grid,
the sentinel stays on the screen, the observer reports, and the next page comes, again and again, until the grid is
full enough for the sentinel to slide off the screen.

:::check Check
At the top of the gallery there are two groups of buttons: "Archive" and "Random pictures" on the left, "All",
"Images" and "Videos" on the right (on a narrow screen the second group moves under the first). Click "Random pictures": the grid empties, then 12 pictures come from any year of the archive, with dates
all over the place. Scroll down: 12 more random pictures. Click "Videos": only the cards with a "VIDEO" badge stay, and
if there are few of them, the gallery loads more by itself until the screen is full. "All" brings back everything
loaded so far.
:::

:::mistake Common mistake
Keeping the filtered list in a state of its own, updated by the filter buttons: `setVisible(pictures.filter(…))`. It
works for the first page, but when the next page arrives while you scroll, `visible` is not updated: the new pictures
do not show until you click the filter again. Whatever can be worked out should not be stored.
:::

:::try Try it
Take out the removal of repeats for a moment: instead of `addNew`, write `setPictures((old) => [...old, ...newestFirst])`,
and scroll down a lot in random mode. Sooner or later the same day gets in twice, and React's warning appears in the
console: "Encountered two children with the same key". Then put `addNew` back.
:::

### A large view

A small card does not show much of a picture, and the explanation does not fit on it. Clicking should open it large,
in a [[modal dialog]], with the date, the title and the explanation, and from there it should be possible to open it
as the picture of the day too.

You wrote one of these in lesson 12, with the browser's `<dialog>` element. As a reminder: `showModal()` is the
`<dialog>`'s own function, so we take hold of its DOM element with a `useRef` and open or close it from an effect,
after drawing. Closing (++Esc++, the dark background, the "Close" button) is signalled by the `close` event, and then we
reset the state too. Create the file `src/components/PictureDialog.jsx`:

```jsx file=src/components/PictureDialog.jsx
import { useEffect, useRef } from 'react'
import { formatDay } from '../dates.js'
import ApodMedia from './ApodMedia.jsx'

// One day, large, in a modal dialog. picture is null when no picture is open.
function PictureDialog({ picture, onClose, onOpenDay }) {
  const dialogRef = useRef(null)
  const isOpen = picture !== null

  // The browser opens and closes the <dialog>: we tell it after drawing.
  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function handleClick(event) {
    // If the click hit the <dialog> itself (not the picture, not a button), it was the dark background.
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="picture-dialog"
      aria-label={isOpen ? picture.title : undefined}
      onClose={onClose}
      onClick={handleClick}
    >
      {isOpen && (
        <>
          <ApodMedia apod={picture} />
          <div className="picture-dialog__body">
            <p className="apod__date">{formatDay(picture.date)}</p>
            <h2 className="apod__title">{picture.title}</h2>
            <p className="apod__text">{picture.explanation}</p>
            <div className="picture-dialog__actions">
              <button type="button" className="button" onClick={() => onOpenDay(picture.date)}>
                Open as the picture of the day
              </button>
              <button type="button" className="button button--ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </dialog>
  )
}

export default PictureDialog
```

`aria-label` gives the dialog a name: screen readers announce the picture's title when it opens. `ApodMedia` works
here too: a video day plays in the large view as well, with its "Pause" button. That is why it was
worth putting the rendering by media type into a component of its own. The answers of the gallery have the same fields
as the picture of one day, explanation included, so no new request is needed: we show the data already loaded.

In `Gallery`, a new state remembers which picture is open large, and the cards set it from now on. Here is the whole
`src/components/Gallery.jsx`:

```jsx file=src/components/Gallery.jsx mark=5,18,22,77,102
import { useEffect, useRef, useState } from 'react'
import useGallery from '../useGallery.js'
import { errorMessage, thumbnailOf } from '../api.js'
import { formatDay } from '../dates.js'
import PictureDialog from './PictureDialog.jsx'

const MODES = [
  { value: 'archive', label: 'Archive' },
  { value: 'random', label: 'Random pictures' },
]

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
]

// The pictures of many days in a grid. Scrolling down brings the next page; a click opens a picture large.
function Gallery({ today, onOpenDay }) {
  const { mode, changeMode, pictures, status, error, hasMore, loadMore, retry } = useGallery(today)
  const [filter, setFilter] = useState('all') // 'all', 'image' or 'video'
  const [openPicture, setOpenPicture] = useState(null) // the day open in the large view, or null
  // The sentinel: a line of text under the grid. When it comes near the screen, the next page can come.
  const sentinelRef = useRef(null)

  // A derived value: the pictures that pass the filter. We do not store it; we work it out on every drawing.
  const visible = filter === 'all' ? pictures : pictures.filter((picture) => picture.media_type === filter)

  useEffect(() => {
    // While a page is on its way, after an error, or when there are no more pages, we do not watch.
    if (status !== 'ready' || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '300px' },
    )
    observer.observe(sentinelRef.current)
    // Cleanup: the old observer stops before a new one starts.
    return () => observer.disconnect()
  }, [status, hasMore, loadMore])

  return (
    <section className="gallery">
      <div className="gallery__toolbar">
        <div className="chips" role="group" aria-label="Where should the pictures come from?">
          {MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              className="chip"
              aria-pressed={mode === item.value}
              onClick={() => changeMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Filter">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className="chip"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="gallery__grid">
        {visible.map((picture) => (
          <li key={picture.date}>
            <button type="button" className="gallery__item" onClick={() => setOpenPicture(picture)}>
              <img src={thumbnailOf(picture)} alt="" loading="lazy" />
              {picture.media_type === 'video' && <span className="badge gallery__badge">Video</span>}
              <span className="gallery__date">{formatDay(picture.date, 'medium')}</span>
              <span className="gallery__title">{picture.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {status === 'error' && (
        <div className="status status--error" role="alert">
          <p>{errorMessage(error)}</p>
          <button type="button" className="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}
      {status !== 'error' && hasMore && (
        <p ref={sentinelRef} className="gallery__more">
          {status === 'loading' ? 'Pictures are on their way…' : 'Scroll on for more pictures!'}
        </p>
      )}
      {!hasMore && <p className="gallery__more">This was the first day of the archive.</p>}

      <PictureDialog picture={openPicture} onClose={() => setOpenPicture(null)} onOpenDay={onOpenDay} />
    </section>
  )
}

export default Gallery
```

"Open as the picture of the day" calls the same `onOpenDay` that the cards called so far: `App` switches to that day
and back to the picture of the day. The gallery leaves the page then, and the open dialog goes with it.

:::check Check
Click a card in the gallery: the picture opens large in front of a dark background, with the full date and the day
of the week, the title, the explanation and two buttons under it. A video day moves here too, and can be paused.
++Esc++, the "Close" button and the dark background around the dialog all close it, and the keyboard focus jumps back
to the card you came from. Open it
again and click "Open as the picture of the day": the picture of the day view opens with that day, star button and
all. Congratulations, your space explorer is ready!
:::

:::mistake Common mistake
`onClose={onClose}` is missing from the `<dialog>`. ++Esc++ still closes the dialog, but `Gallery` does not know about
it: the picture stays in `openPicture`. If you then click any card, nothing happens: `isOpen` stayed true all along,
so the effect does not run again, and nobody calls `showModal()`. Listening to the `close` event keeps the state
showing what is really on the screen.
:::

:::try Task
Let the large view page through the pictures, as in lesson 12: the ++←++ and ++→++ arrows should go to the previous
and the next visible picture. Hint: let `Gallery` pass the `visible` array, and remember the number of the open
picture instead of the picture itself. To stop the state of a video (playing or paused) carrying over to the next
picture, give `ApodMedia` a `key={picture.date}`.
:::

:::concept Towards a real API
Your code has no idea that the server is pretend. If one day you use a real service, `API_URL` in `api.js` becomes
the service's address, `VITE_APOD_KEY` in `.env.local` your own key, and everything else works the same way: the key in the
request, the status codes, the headers, the date ranges and the random days. NASA's real APOD API uses the same
parameters and fields, except that it speaks no Hungarian, and its videos are mostly players of a video-sharing site.
The "cannot be played here" branch of `ApodMedia` is ready for those.
:::
