# What we build

A blog of your own, "The Peacock Journal": a list of posts, a page for every post, and an editor where you write new
posts in [[Markdown]], edit them and delete them. The posts live on a pretend server with a small database, so
everything you write is still there tomorrow. In the advanced level the blog grows up: authors log in, readers leave
comments, posts get tags, the list gets a search box, and every page tells search engines what it is about.

On the way you learn how one React app shows several pages (routing), how an app creates, reads, updates and deletes
data on a server, how Markdown text turns into headings, lists and links without opening the door to attacks, and how
one form can serve both writing and editing.

:::levels
- A list of posts from the pretend server, and a page of its own for every post. | about 2 hours
- Writing, editing and deleting posts, and Markdown that turns into headings, lists, code and links. | about 3 hours
- Authors who log in, comments, tags, a search box, and a title and description for every page (SEO). | about 4 hours
:::

**Before you start you need:** the earlier lessons, above all lesson 14, "Currency Converter" (`fetch`, loading and
error states, `useFetch`), lesson 22, "Multi-Step Form" (forms with validation, the pretend server in `fakeApi.js`),
and lesson 23, "Fan Wiki" (a hash router of your own). Lesson 11's Markdown preview comes back too, in a bigger form.
What we reuse is recalled in a few sentences; everything new is explained step by step.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is the `lessons/26-blog/exercise` folder of the course repository on GitHub (the
"Exercise on GitHub" button above opens it). You get it the same way as in the earlier lessons; lesson 1 explains every
step in detail. In the terminal, in your work folder (the one that holds the `rika-mentoring` folder):

```shell
cd rika-mentoring
git pull        # brings the new lessons into the repository
cd ..
cp -r rika-mentoring/lessons/26-blog/exercise peacock-journal
```

If you do not have the repository yet, run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the
first three lines (without git: **Code → Download ZIP** on the GitHub page). You can also copy the folder in your file
manager; what matters is that your copy is called `peacock-journal` and sits outside the `rika-mentoring` folder, so
`git pull` keeps working. Open your copy in the editor, then type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). On a pale grey-green page you see a deep teal
band with the title "The Peacock Journal" and the line "Notes on React, writing and the web." Under it, in a dashed
frame: "The posts will appear here." The browser tab says "The Peacock Journal" as well. There are no posts yet:
showing them is your job.
:::

Last, make your copy a git repository with one commit, the starting point. Leave the server running and open a second
terminal (the **+** button in the terminal panel; it opens in `peacock-journal` too):

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit (new files stay: delete those by hand), and it
is worth committing after every step that works.

The exercise has these files that matter:

- `src/App.jsx`: the page. For now it shows only the title band and a placeholder line; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so you do not write
  styles: you only use the class names the steps give you (`page`, `card`, `post`, `markdown`, `field`, …).
- `src/index.css`: the background and the font of the page.
- `src/fakeApi.js`: the pretend server. The box below tells what it is.
- `src/sampleData.js`: four sample posts, two authors and three comments: what the pretend server's database holds at
  the very first start. The authors and the comments are needed only in the advanced level.
- `index.html`: the page that the browser loads first. Its `<title>` and its description come back in the last step.

:::concept The pretend server
A real blog keeps its posts on a [[server]]: a computer on the internet that stores the data in a [[database]] and
answers the requests of the pages. The page asks for the list of posts, and the server sends it; the page sends a new
post, and the server saves it. The part of an app that runs on the server is its [[back end]], the part that runs in
the browser is its [[front end]]. Everything you have written in React so far was front end.

This course uses no outside services, so the exercise brings its own back end: `src/fakeApi.js`. You met it in
lesson 22. It pretends to be the blog's server and database, but it runs in your browser. Its database is made of
[[collections|collection]], like the tables of a real database: here `posts`, `authors` and `comments`, each one a list
of items with an `id`. It keeps everything in one [[localStorage]] key, so what you save survives a reload, just like
in a real database. Every request takes a moment, as it would over the internet, and if you ask it to, some of them
fail on purpose. The comment at the top of the file lists what it can do: `list`, `get`, `create`, `update` and
`remove`. Each of them returns a [[Promise]], so you wait for the answer with `await`.
:::

:::concept A quick recap
A [[component]] is a function that returns [[JSX]], and it gets data from outside through its [[props]]. It remembers
things with [[useState]]: when a state value changes, React draws the component again. Work that is not drawing, such
as asking a server for data, goes into a [[useEffect]]. A [[custom hook]] is a function whose name starts with `use`
and that calls other hooks, like `useFetch` in lessons 14 and 23. An [[async function]] can `await` a Promise, and
[[try/catch]] catches the error if it fails. If any of these feels unfamiliar, go back to those lessons.
:::

### Posts from the pretend server

First the server itself. `createMockApi` from `fakeApi.js` makes one: you give it a name and its starting data. Create
the `src/api.js` file:

```js file=src/api.js
import { createMockApi } from './fakeApi.js'
import { SAMPLE_AUTHORS, SAMPLE_COMMENTS, SAMPLE_POSTS } from './sampleData.js'

// The blog's pretend server. Its database has three collections: posts, authors and comments.
// We read only the posts for now; the authors and the comments come in the advanced level.
export const api = createMockApi('peacock-journal', {
  seed: { posts: SAMPLE_POSTS, authors: SAMPLE_AUTHORS, comments: SAMPLE_COMMENTS },
  latency: [300, 800], // every answer takes 0.3 to 0.8 seconds
  failRate: 0, // 0.3 would make 3 requests in 10 fail
})
```

- `'peacock-journal'` is the name of the database: its localStorage key will be `fake-api:peacock-journal`.
- `seed` is the starting content. The server uses it only while it has nothing saved; from the first change on, it
  works with what is in localStorage. This is why the authors and the comments are in the seed from the very
  beginning: a database that is already saved would not get them later.
- `latency` and `failRate` make it behave like a real server: slow sometimes, and unreliable if you want it to be.

`api.list('posts')` asks for every post, and its answer arrives later, as a Promise. In lessons 14 and 23 a
`useFetch` hook did the waiting for you: it took an address, and told you whether the answer was still loading, had
arrived, or had failed. Our server is not called with `fetch` and an address, but with functions such as `api.list`.
So this lesson's hook gets the request itself, as a function. Create `src/useRequest.js`:

```js file=src/useRequest.js
import { useEffect, useState } from 'react'

// Sends a request to the server, and tells how it is going:
// { status: 'loading' | 'success' | 'error', data, error, reload }
// request: a function that returns a Promise. deps: when one of them changes, the request is sent again.
function useRequest(request, deps) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false // the cleanup sets it to true: from then on the answer is not wanted

    async function load() {
      setState({ status: 'loading', data: null, error: null })
      try {
        const data = await request()
        if (!ignore) setState({ status: 'success', data, error: null })
      } catch (error) {
        if (!ignore) setState({ status: 'error', data: null, error })
      }
    }

    load()
    return () => {
      ignore = true
    }
    // request is a new function at every drawing, so it is not in the list: deps decide when to send again.
  }, [...deps, attempt])

  function reload() {
    setAttempt(attempt + 1)
  }

  return { ...state, reload }
}

export default useRequest
```

- `request` is a function, for example `() => api.list('posts')`. The effect calls it, and `await request()` waits for
  the server's answer.
- `deps` works like the [[dependency array]] of `useEffect`: when one of its items changes, the request is sent again.
  `[...deps, attempt]` uses the [[spread]] to put its items into the effect's own array, with `attempt` after them. An
  empty `[]` means: send it once, when the component appears.
- `ignore` is the guard against a [[race condition]]. Lesson 23's `useFetch` cancelled its `fetch` with an
  `AbortController`. A request to our pretend server cannot be cancelled, so we let it finish, but ignore its answer.
  When does this matter? If you go from one post straight to another, the first answer may arrive after the second
  one, and it must not overwrite the page. The [[cleanup function]] of the effect runs before the next request (and
  when the component goes away), and sets `ignore` to `true`. React's StrictMode also runs every effect twice in
  development: thanks to `ignore`, the answer of the first run is simply dropped.
- `reload` adds one to `attempt`, which is in the dependency array: the effect runs again, and sends the same request
  once more. In lesson 23 it was called `retry`.

The red error box will appear on several pages, so it gets a component of its own, as in lesson 23. Create
`src/components/ErrorMessage.jsx`:

```jsx file=src/components/ErrorMessage.jsx
// A red box with a message and a "Try again" button.
function ErrorMessage({ text, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <p>{text}</p>
      <button type="button" className="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}

export default ErrorMessage
```

The blog will have several pages: the list, a post, the editor… Each gets a component in a new `src/pages` folder, so
that the building blocks in `components` and the whole pages are easy to tell apart. The first one is the list. Create
`src/pages/ListPage.jsx`:

```jsx file=src/pages/ListPage.jsx
import { api } from '../api.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage() {
  // []: the list is loaded once, when the page appears.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])

  return (
    <section className="page">
      <h1 className="page__title">All posts</h1>
      {status === 'loading' && <p className="state">Loading posts…</p>}
      {status === 'error' && <ErrorMessage text="The posts could not be loaded." onRetry={reload} />}
      {status === 'success' && data.length === 0 && <p className="state">No posts yet.</p>}
      {status === 'success' && data.length > 0 && (
        <ul className="post-list">
          {data.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

This is [[conditional rendering]] again: of the four `&&` lines, only the ones whose condition is true draw anything.
`data` is the server's answer: an array of posts, each one an object with `id`, `title`, `author`, `createdAt`, `tags`
and `body` (open `sampleData.js` to see them). Finally, `App` shows the list in place of the placeholder line. Replace
`src/App.jsx`:

```jsx file=src/App.jsx mark=1,15
import ListPage from './pages/ListPage.jsx'
import './App.css'

function App() {
  return (
    <div className="blog">
      <header className="blog__header">
        <a className="blog__title" href="#/">
          The Peacock Journal
        </a>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">
        <ListPage />
      </main>
    </div>
  )
}

export default App
```

:::check Check
Under the title "All posts", "Loading posts…" appears in a dashed frame for a moment, then four post titles in its
place, from "Welcome to the Peacock Journal" to "Picking colours for a website". Now try the error: in `src/api.js` set
`failRate: 1` (every request fails), save the file and reload the page (++F5++): a list that is already loaded does
not ask for the posts again by itself. After the wait, a red box says "The posts could not be loaded.", with a "Try
again" button. Click it: "Loading posts…", then the red box again. Set `failRate` back to `0`, save, and click "Try
again" once more: the posts are back.
:::

:::mistake Common mistake
`useRequest(api.list('posts'), [])`, without `() =>`. Then the request is sent straight away, at every drawing, and the
hook gets the Promise itself instead of a function. When the effect calls `request()`, the call throws a "request is
not a function" error, but the `try/catch` catches it: after a reload, the red box "The posts could not be loaded."
appears at once, without any waiting, although `failRate` is `0`, "Try again" does not help either, and the console
stays empty. Hand over a function that sends the request, not the request itself.
:::

:::try Try it
Set `latency: [2000, 3000]` in `src/api.js`, reload the page, and watch the loading message for a few seconds. Then
set it back.
:::

### Cards: date, author and a short excerpt

A list of titles is not a blog yet. Every post should get a card with its date, its reading time, the beginning of its
text and its author. The work behind these has nothing to do with React: it gets data and gives back text. So it goes
into a file of plain functions. Create `src/posts.js`:

```js file=src/posts.js
// Small helpers for showing posts. They have nothing to do with React: they get data and give back text.

const dateFormat = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })

// '2026-11-12T09:30:00.000Z' → '12 November 2026'
export function formatDate(isoDate) {
  return dateFormat.format(new Date(isoDate))
}

// About 200 words a minute, and at least 1 minute.
export function readingTime(text) {
  const words = text.split(/\s+/).filter((word) => word !== '').length
  return Math.max(1, Math.round(words / 200))
}

// The beginning of the first ordinary paragraph, without Markdown marks: at most 160 characters.
export function excerpt(text) {
  // The first paragraph that does not start with a mark (# heading, - list, > quote, the backticks of code).
  const first = text.split('\n\n').find((paragraph) => !/^[#>`-]/.test(paragraph)) ?? ''
  // Without stars and backticks, and in one line.
  const plain = first.replace(/[*`]/g, '').replaceAll('\n', ' ')
  if (plain.length <= 160) return plain
  // Cut at the last space before the 160th character, so that no word is cut in half.
  return plain.slice(0, plain.lastIndexOf(' ', 160)) + '…'
}

// A sorted copy of the posts: the newest one first.
export function newestFirst(posts) {
  return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
```

- The server sends dates as text in the [[ISO 8601]] format: `'2026-11-12T09:30:00.000Z'` is 12 November 2026, 9:30,
  in UTC time (that is what the `Z` means). `new Date(…)` turns the text into a date, and [[Intl.DateTimeFormat]]
  (lesson 11) writes it the way people read it in a given language: `'en-GB'` is British English.
- The patterns between two slashes are [[regular expressions|regular expression]]. `/\s+/` means "one or more
  whitespace characters" (spaces and line breaks), so `split` cuts the text into words. The first pattern of `excerpt`
  means "starts with one of these characters": `^` is the start of the text, and the square brackets mean any one of
  the characters in them (`#`, `>`, the backtick and `-`). `test` answers `true` or `false`, and `!` turns it around.
  In the second pattern, the `g` at the end means "every one of them", not only the first: `replace` removes every
  star and backtick.
- `find` gives back the first paragraph that fits, or `undefined` if none does. `?? ''` ([[nullish coalescing]]) means
  "or, if that is `undefined` or `null`, an empty text", so `plain` is always a text.
- `lastIndexOf(' ', 160)` looks for a space backwards, from position 160: the cut falls between two words.
- `sort` changes the array it sorts ([[sorts in place]]), and we must not change the data in a component's state. So
  `newestFirst` copies the array first (`[...posts]`, as in lesson 7). [[localeCompare]] compares two texts, and ISO
  dates compare in time order, because the year comes first, then the month, then the day, all with a fixed number of
  digits. Comparing `b` to `a` (and not
  the other way round) turns the order around: newest first.

The card goes into `src/components/PostCard.jsx`:

```jsx file=src/components/PostCard.jsx
import { excerpt, formatDate, readingTime } from '../posts.js'

function PostCard({ post }) {
  return (
    <li className="card">
      <p className="meta">
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time> · {readingTime(post.body)} min read
      </p>
      <h2 className="card__title">{post.title}</h2>
      <p className="card__excerpt">{excerpt(post.body)}</p>
      <p className="meta">by {post.author}</p>
    </li>
  )
}

export default PostCard
```

`<time>` is the HTML element for a date. Its text is for people; its `dateTime` attribute holds the same date in a
format that machines understand, for example search engines (this comes back at the end of the lesson). Now the list
sorts the posts and draws cards. Replace `src/pages/ListPage.jsx`:

```jsx file=src/pages/ListPage.jsx mark=2,4,10-11,18-19,21-22
import { api } from '../api.js'
import { newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage() {
  // []: the list is loaded once, when the page appears.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  // Worked out from the server's answer at every drawing: a derived value, not state.
  const posts = status === 'success' ? newestFirst(data) : []

  return (
    <section className="page">
      <h1 className="page__title">All posts</h1>
      {status === 'loading' && <p className="state">Loading posts…</p>}
      {status === 'error' && <ErrorMessage text="The posts could not be loaded." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && <p className="state">No posts yet.</p>}
      {posts.length > 0 && (
        <ul className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

`posts` is a [[derived value]]: while the answer has not arrived, it is an empty array; after that, the sorted copy.
It needs no state of its own, because it can always be worked out from the hook's data. The `key` stays the post's
`id`, but it moves onto `PostCard`: React needs it on the outermost element of each item that `map` makes.

:::check Check
Four white cards, the newest first: "Welcome to the Peacock Journal" (16 November 2026), "Writing posts in Markdown",
"Why this blog uses hash routes", and "Picking colours for a website" (9 October 2026). Each card shows its date, "1
min read", the beginning of its text and its author ("by Rika" or "by Sam"). The Markdown post's excerpt ends in
"headings, lists and bold words.", without the stars around "bold".
:::

:::mistake Common mistake
`dateFormat.format(isoDate)`, without `new Date(…)`. `format` expects a date or a number, not a text. It tries to turn
the text into a number, gets `NaN` ("not a number"), and stops with "RangeError: Invalid time value": the page goes
blank, and the console shows the error.
:::

:::try Try it
Show the time of day on the cards too: add `hour: '2-digit', minute: '2-digit'` to the options of `dateFormat`. The
time appears in your own time zone, not in UTC.
:::

### A page for every post

Every post gets a page of its own, with its own address: `#/post/welcome` for the welcome post, `#/post/hash-routing`
for the routing one. The address decides what the app shows: this is [[routing]]. In lesson 23 you wrote a small router
of your own, starting from lesson 1's `useHashRoute` hook; this blog uses the same idea. The hook watches the part of
the address after the `#`, the [[URL hash]], and returns it as a path. This time the file also gets a second function,
`matchRoute`, that tells which page belongs to a path. Create `src/useHashRoute.js`:

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

// Which page belongs to a path? '/' → { name: 'list' }, '/post/welcome' → { name: 'post', id: 'welcome' }
export function matchRoute(path) {
  const parts = path.split('/').filter((part) => part !== '') // '/post/welcome' → ['post', 'welcome']
  if (parts.length === 0) return { name: 'list' }
  if (parts.length === 2 && parts[0] === 'post') return { name: 'post', id: parts[1] }
  return { name: 'notFound' }
}

export default useHashRoute
```

A quick recap of the hook: `slice(1)` cuts off the `#`, and `|| '/'` means "or `/`, if nothing is left". The effect
listens to the browser's `hashchange` event, which fires whenever the part after the `#` changes, and its cleanup stops
listening.

`matchRoute` cuts the path at every `/`. `'/post/welcome'.split('/')` gives `['', 'post', 'welcome']`: the text before
the first `/` is empty, so `filter` throws the empty parts away. No parts: the list. Two parts, and the first is
`post`: a post, and the second part is its `id`. Anything else: a page that does not exist. The `id` in the address is
a [[route parameter]]: one address pattern, `/post/:id`, stands for every post. The sample posts have readable ids
such as `welcome`, made from their titles ([[slugs|slug]]); posts written in the app will get random ones from the
server.

A page for an address that belongs to no page comes in handy. Create `src/pages/NotFoundPage.jsx`:

```jsx file=src/pages/NotFoundPage.jsx
// For an address that belongs to no page. text tells what went wrong; it has a default.
function NotFoundPage({ text = 'There is nothing at this address.' }) {
  return (
    <section className="state">
      <h1 className="page__title">Page not found</h1>
      <p>{text}</p>
      <a className="button" href="#/">
        ← All posts
      </a>
    </section>
  )
}

export default NotFoundPage
```

`text = '…'` is a [[default parameter]] (lesson 21): if `NotFoundPage` gets no `text` prop, it uses this one. A post
that does not exist will give it a different text.

The post page loads one post: `api.get('posts', id)`. If the server has no post with that id, it answers with an error
whose `status` is 404, the [[HTTP status code]] of "not found". Create `src/pages/PostPage.jsx`:

```jsx file=src/pages/PostPage.jsx
import { api } from '../api.js'
import { formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id }) {
  // A new id means a new post: deps say when to send the request again.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Loading the post…</p>
  if (status === 'error') {
    // 404: the server has no post with this id. Any other error may go away if we try again.
    if (error.status === 404) return <NotFoundPage text="This post does not exist (any more)." />
    return <ErrorMessage text="The post could not be loaded." onRetry={reload} />
  }

  return (
    <article className="post">
      <a className="back" href="#/">
        ← All posts
      </a>
      <header className="post__header">
        <h1 className="post__title">{post.title}</h1>
        <p className="meta">
          by {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        </p>
      </header>
      <div className="post__body">
        {/* For now the text is shown as it is, paragraph by paragraph. */}
        {post.body.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}

export default PostPage
```

- `data: post` is [[destructuring]] with a new name: the hook calls it `data`, and here we call it `post`.
- The two `if`s with a `return` are [[early returns|early return]]: while the post is loading, or if it failed, the
  component returns something else, and the rest of the function does not run. So from the `return (` of the article
  on, `post` is always there.
- The text is cut into paragraphs at the empty lines (`'\n\n'`: two line breaks). The paragraphs hold no state and are
  made again at every drawing, so their position (`i`) is a good enough `key`.

Now `App` draws the page that belongs to the address. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=1-2,4-5,9-10,12-15,17-21,32
import { useEffect } from 'react'
import useHashRoute, { matchRoute } from './useHashRoute.js'
import ListPage from './pages/ListPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  const route = matchRoute(path)

  // A new page starts at the top, however far down the previous one was scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  // JSX is a value too: the page that belongs to the address goes into a variable.
  let page
  if (route.name === 'list') page = <ListPage />
  else if (route.name === 'post') page = <PostPage key={route.id} id={route.id} />
  else page = <NotFoundPage />

  return (
    <div className="blog">
      <header className="blog__header">
        <a className="blog__title" href="#/">
          The Peacock Journal
        </a>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">{page}</main>
    </div>
  )
}

export default App
```

- `let page` is filled by an `if … else if … else` chain: exactly one of the branches runs. With more pages, a new
  page will mean one more line here.
- `key={route.id}`: when the key changes, React throws the old component away and makes a brand new one, with fresh
  state (lesson 23). Going from one post straight to another, nothing is left over from the previous post.
- The effect runs whenever the path changes, and scrolls to the top of the page: the browser would otherwise keep the
  scroll position of the list.

Last, the cards become links. In `src/components/PostCard.jsx`, the title gets an `<a>`:

```jsx file=src/components/PostCard.jsx mark=9-12
import { excerpt, formatDate, readingTime } from '../posts.js'

function PostCard({ post }) {
  return (
    <li className="card">
      <p className="meta">
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time> · {readingTime(post.body)} min read
      </p>
      <h2 className="card__title">
        {/* App.css stretches this link over the whole card: a click anywhere on the card opens the post. */}
        <a href={`#/post/${post.id}`}>{post.title}</a>
      </h2>
      <p className="card__excerpt">{excerpt(post.body)}</p>
      <p className="meta">by {post.author}</p>
    </li>
  )
}

export default PostCard
```

It is an ordinary link. A click on it changes only the part after the `#`: the browser does not load a new page, it
fires `hashchange`, and our hook hands the new path to `App`. The Back button works by itself, because every new
address is a new entry in the browser's history.

:::check Check
Click the card of "Writing posts in Markdown" (anywhere on it): the address ends in `#/post/markdown-basics`, "Loading
the post…" flashes, then the big title, "by Rika · 12 November 2026", and the text. The text still shows its Markdown
marks as they are: `# Marks inside a line`, `**bold**`, three backticks before the code. Turning these into real
headings and bold words is the first step of the intermediate level. "← All posts", the blog's title and the Back
button all take you back to the list. Now type addresses by hand into the address bar, after `localhost:5173/`: `#/post/nothing-here` gives "Page not found" with
"This post does not exist (any more).", and `#/hello` gives "There is nothing at this address." The beginner level is
done: commit it!
:::

:::mistake Common mistake
Leaving out `.filter((part) => part !== '')` in `matchRoute`. Then `'/post/welcome'` has three parts, `['', 'post',
'welcome']`, the first of them empty, so it is never "two parts starting with `post`": every post shows "Page not
found". `'/'` gives `['', '']`, and even the list is gone.
:::

:::mistake Common mistake
Reading `post.title` before the two `if`s, for example in a `const title = post.title` line at the top. While the post
is loading, `data` is still `null`, and the page stops with "Cannot read properties of null (reading 'title')". Work
with the data only after the early returns.
:::

:::try Try it
The welcome post ends with a link written in Markdown: `[Writing posts in Markdown](#/post/markdown-basics)`. For now
it is plain text. Copy the part between the round brackets, type it into the address bar after `localhost:5173/` (in
place of the `#/…` part that is there now), and press ++Enter++: the post opens, because `#/post/markdown-basics` is a valid address of the blog.
:::

## Intermediate level {level=2}

### Markdown: headings, lists, code and links

The posts are written in Markdown: a few marks in plain text tell what is a heading, a list, a bold word or a link. In
lesson 11 you wrote a small Markdown reader for the notes' preview. The blog needs a bigger one: posts have headings
of several sizes, numbered lists, quotes, code blocks and links. These are the marks it will understand:

```md
# A heading, ## a smaller one, ### an even smaller one
- a list item
1. a numbered list item
> a quote
**bold**, *italic*, `code` and [a link](#/post/welcome)
three backticks (```) on a line of their own start and end a code block
```

Like in lesson 11, the reader builds React elements, never HTML. Create `src/components/Markdown.jsx`; it is explained
part by part below:

```jsx file=src/components/Markdown.jsx
// A small Markdown reader. It never makes HTML, only React elements:
// whatever a post contains, even <script>, stays text on the screen.

// Links may point only to web pages, e-mail addresses and pages of this blog (#/…).
const SAFE_LINK = /^(https?:\/\/|mailto:|#)/

// 1. Inside one line: **bold**, *italic*, `code` and [links](address).
function renderInline(text) {
  // Thanks to the round brackets, split keeps the marked parts too, at the odd places (1, 3, 5…).
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/)
  return parts.map((part, i) => {
    if (i % 2 === 0) return part // the even places hold plain text
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    // What is left is a link: [label](address).
    const label = part.slice(1, part.indexOf(']'))
    const href = part.slice(part.indexOf('](') + 2, -1)
    if (!SAFE_LINK.test(href)) return label // a dangerous address (javascript:…) stays plain text
    return (
      <a key={i} href={href}>
        {label}
      </a>
    )
  })
}

// 2. The text becomes blocks, line by line. Each block is { type, lines }, where type is
//    the name of the element that draws it: p, h2, h3, h4, ul, ol, blockquote or pre.
function parseBlocks(text) {
  const blocks = []
  let current = null // the open block: the next line may continue it

  // Adds the line to the open block if it has this type; otherwise opens a new block.
  function add(type, line) {
    if (current?.type !== type) {
      current = { type, lines: [] }
      blocks.push(current)
    }
    current.lines.push(line)
  }

  for (const line of text.split('\n')) {
    const heading = line.match(/^(#{1,3}) (.+)/)
    if (current?.type === 'pre') {
      // Inside a code block every line stays as it is, until the closing backticks.
      if (line.startsWith('```')) current = null
      else current.lines.push(line)
    } else if (line.startsWith('```')) {
      current = { type: 'pre', lines: [] }
      blocks.push(current)
    } else if (heading) {
      // # → h2, ## → h3, ### → h4: the h1 of the page is the post's title.
      blocks.push({ type: `h${heading[1].length + 1}`, lines: [heading[2]] })
      current = null
    } else if (line.startsWith('- ')) {
      add('ul', line.slice(2))
    } else if (/^\d+\. /.test(line)) {
      add('ol', line.slice(line.indexOf(' ') + 1))
    } else if (line.startsWith('> ')) {
      add('blockquote', line.slice(2))
    } else if (line.trim() === '') {
      current = null // an empty line closes the paragraph, the list or the quote
    } else {
      add('p', line)
    }
  }
  return blocks
}

// 3. Every block becomes an element.
function Markdown({ text }) {
  const blocks = parseBlocks(text)
  if (blocks.length === 0) return <p className="muted">Nothing to show yet.</p>

  return (
    <div className="markdown">
      {blocks.map((block, i) => {
        // A variable with a capital letter can stand in a tag: <Tag> draws a p, an h2, a ul…
        const Tag = block.type
        if (Tag === 'pre') {
          return (
            <pre key={i}>
              <code>{block.lines.join('\n')}</code>
            </pre>
          )
        }
        if (Tag === 'ul' || Tag === 'ol') {
          return (
            <Tag key={i}>
              {block.lines.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </Tag>
          )
        }
        // p, h2, h3, h4 and blockquote: the lines of the block joined into one.
        return <Tag key={i}>{renderInline(block.lines.join(' '))}</Tag>
      })}
    </div>
  )
}

export default Markdown
```

It works in three stages.

1. `renderInline` is lesson 11's idea: `split` with a regular expression in round brackets keeps the matched parts too,
   always at the odd places. `'a **b** c'` becomes `['a ', '**b**', ' c']`. `i % 2` (the [[modulo]], the remainder of
   a division) is 0 at the even places, which hold plain text. The pattern has four parts, separated by `|` ("or"):
   `\*\*[^*]+\*\*` is two stars, one or more characters that are not a star (`[^*]`: the `^` inside square brackets
   means "not"), and two stars again; then the same with one star, then backticks, then a link. The `\` in front of
   `*`, `[`, `]`, `(` and `)` makes them ordinary characters: on their own, they mean something else in a pattern. The
   link part, `\[[^\]]+\]\([^)\s]+\)`, means: a `[`, one or more characters that are not `]`, a `]`, then a `(`, one
   or more characters that are neither `)` nor a space (`\s`), and a `)`. Then `label` is the text from the second
   character up to the `]`, and `href` is the part after `](` without the closing bracket (`-1` in `slice` counts from
   the end).
2. `parseBlocks` goes through the lines, and remembers the open block in `current`. `current?.type` is
   [[optional chaining]] (lesson 14): if `current` is `null`, the result is `undefined` instead of an error. `add`
   continues the open block if it has the same type: list items that follow each other form one list, and lines that
   follow each other form one paragraph. An empty line closes the block. A code block is different: inside it, every
   line stays as it is, even an empty one or one starting with `#`, until the closing three backticks. The heading
   pattern, `/^(#{1,3}) (.+)/`, means: one to three hash signs at the start of the line (`{1,3}` means "at least once,
   at most three times"), a space, then at least one character of any kind (`.+`: a `.` can be any character, as in
   lesson 11's `.+?`). The numbered list's pattern, `/^\d+\. /`, means: one or more digits (`\d` is familiar from
   lesson 22), a real dot (here too, the `\` makes the `.` an ordinary character) and a space. `line.match(…)` gives
   back the parts of the line in the pattern's round brackets: for `'# Blocks'`,
   `heading[1]` is `'#'` and `heading[2]` is `'Blocks'`. One hash makes an `h2`, two an `h3`.
3. `Markdown` draws the blocks. The trick is `const Tag = block.type`: a variable whose name starts with a capital
   letter can be used as a tag, and if it holds the text `'h2'`, `<Tag>` draws an `<h2>`. With a small letter,
   `<tag>` would mean an HTML element called "tag". So one line draws paragraphs, headings and quotes alike. Lists and
   code blocks need their own lines: a list draws an `<li>` for every line, and a code block keeps its line breaks.

Now the post page uses it. In `src/pages/PostPage.jsx`, `Markdown` takes the place of the paragraphs:

```jsx file=src/pages/PostPage.jsx mark=5,30
import { api } from '../api.js'
import { formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id }) {
  // A new id means a new post: deps say when to send the request again.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Loading the post…</p>
  if (status === 'error') {
    // 404: the server has no post with this id. Any other error may go away if we try again.
    if (error.status === 404) return <NotFoundPage text="This post does not exist (any more)." />
    return <ErrorMessage text="The post could not be loaded." onRetry={reload} />
  }

  return (
    <article className="post">
      <a className="back" href="#/">
        ← All posts
      </a>
      <header className="post__header">
        <h1 className="post__title">{post.title}</h1>
        <p className="meta">
          by {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        </p>
      </header>
      <Markdown text={post.body} />
    </article>
  )
}

export default PostPage
```

:::check Check
Open "Writing posts in Markdown". "Marks inside a line" and "Blocks" are now headings; the three lines under the first
one form a bulleted list, with "bold" in bold, "italic" in italics, and `useState` as code. "1. Write the post." and the two lines after
it form a numbered list, the line starting with `>` is a quote with a turquoise bar, and the `Hello` function sits in a
dark code box, line by line. In the last line `<script>` is plain code, not a part of the page. Click "the post about
routing": the routing post opens. On the welcome post, the link at the end now works too.
:::

:::concept Why check the links?
Lesson 11 told why we never turn text into HTML: in whatever goes into the page as HTML, the browser runs the code
too, so someone could smuggle JavaScript into a post with an `<img src=x onerror="…">` element. This is [[XSS]]
(cross-site scripting). Text in React elements always stays
text, so headings, lists and bold words are safe. A link is the exception: its address goes into `href`, and an
address can be code too. A link to `javascript:alert(1)` would run that code when someone clicks it. Newer
versions of React warn about such addresses, or even block them, but we do not leave it to chance: `SAFE_LINK` lets
through only addresses that start with `http://`, `https://`, `mailto:` or `#`. Anything else stays a plain label.
:::

:::mistake Common mistake
Swapping the two star `if`s of `renderInline`: `part.startsWith('*')` before `part.startsWith('**')`. `'**bold**'`
starts with a star too, so it becomes an `<em>` with `slice(1, -1)`: an italic `*bold*`, with a star on each side.
Check the longer mark first.
:::

:::try Try it
Teach the reader one more line mark: a line of three hyphens, `---`, should draw a horizontal line (`<hr>`). In
`parseBlocks`, before the line that checks `'- '`, add a branch for `line === '---'` that pushes `{ type: 'hr', lines:
[] }` and sets `current` to `null`. In `Markdown`, right after `const Tag = block.type`, add
`if (Tag === 'hr') return <hr key={i} />`.
:::

### Writing a new post

Now the blog gets its first form. Showing posts is only one of the four basic operations on data, often called
[[CRUD]]: **c**reate, **r**ead, **u**pdate and **d**elete. The beginner level did the reading; this step is about
creating, then come updating and deleting.

The writing page will have its own address, `#/new`. Two additions to `src/useHashRoute.js`: `matchRoute` learns the
new address, and a new function, `navigate`, lets the code go to another page, as if a link had been clicked. Replace
`matchRoute`, and add `navigate` after it:

```js file=src/useHashRoute.js mark=5,10-13
// Which page belongs to a path? '/' → { name: 'list' }, '/post/welcome' → { name: 'post', id: 'welcome' }
export function matchRoute(path) {
  const parts = path.split('/').filter((part) => part !== '') // '/post/welcome' → ['post', 'welcome']
  if (parts.length === 0) return { name: 'list' }
  if (parts.length === 1 && parts[0] === 'new') return { name: 'new' }
  if (parts.length === 2 && parts[0] === 'post') return { name: 'post', id: parts[1] }
  return { name: 'notFound' }
}

// Goes to another page of the blog from code, as if a link had been clicked.
export function navigate(path) {
  window.location.hash = path
}
```

`navigate` sets the part after the `#`. The browser fires `hashchange`, `useHashRoute` hands the new path to `App`,
and the new page appears. The new address also goes into the browser's history, so the Back button works as usual.

The form gets a component of its own, because the next step will use it for editing too. It does not know whether it
creates or edits a post: it gets the starting values and the label of its button as props, and when everything is
fine, it calls the `onSave` prop with the values. What saving means, the page decides. Create
`src/components/PostForm.jsx`:

```jsx file=src/components/PostForm.jsx
import { useState } from 'react'
import Markdown from './Markdown.jsx'

// The rules of a post. The answer: a message for every field that is not right yet.
function validate(values) {
  const errors = {}
  if (values.title.trim().length < 3) errors.title = 'The title needs at least 3 characters.'
  if (values.author.trim() === '') errors.author = 'Who wrote it? Type a name.'
  if (values.body.trim().length < 20) errors.body = 'The post needs at least 20 characters.'
  return errors
}

function PostForm({ initialValues, submitLabel, cancelHref, onSave }) {
  const [values, setValues] = useState(initialValues)
  const [showErrors, setShowErrors] = useState(false) // true after the first try to save
  const [preview, setPreview] = useState(false) // writing the text, or looking at its preview?
  const [status, setStatus] = useState('editing') // 'editing', 'saving' or 'error'

  // A derived value: the rules are checked again at every drawing.
  const errors = validate(values)
  // The messages are shown only after the first try to save.
  const shown = showErrors ? errors : {}

  // One function for every field: the name of the field tells which value changes.
  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // the page saves the post itself: no reload
    if (Object.keys(errors).length > 0) {
      setShowErrors(true)
      return
    }
    setStatus('saving')
    try {
      // The page decides what saving means: creating a new post, or updating one.
      await onSave({
        title: values.title.trim(),
        author: values.author.trim(),
        body: values.body.trim(),
      })
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">Title</span>
        <input name="title" value={values.title} onChange={handleChange} aria-invalid={Boolean(shown.title)} />
        {shown.title && <span className="field__error">{shown.title}</span>}
      </label>

      <label className="field">
        <span className="field__label">Author</span>
        <input name="author" value={values.author} onChange={handleChange} aria-invalid={Boolean(shown.author)} />
        {shown.author && <span className="field__error">{shown.author}</span>}
      </label>

      <div className="field">
        <div className="field__bar">
          <label className="field__label" htmlFor="post-body">
            Text (Markdown)
          </label>
          <div className="tabs">
            <button type="button" className="tab" aria-pressed={!preview} onClick={() => setPreview(false)}>
              Write
            </button>
            <button type="button" className="tab" aria-pressed={preview} onClick={() => setPreview(true)}>
              Preview
            </button>
          </div>
        </div>
        {preview ? (
          <div className="preview">
            <Markdown text={values.body} />
          </div>
        ) : (
          <textarea
            id="post-body"
            name="body"
            rows={14}
            value={values.body}
            onChange={handleChange}
            aria-invalid={Boolean(shown.body)}
          />
        )}
        {shown.body && <span className="field__error">{shown.body}</span>}
      </div>

      {status === 'error' && (
        <p className="alert" role="alert">
          The post could not be saved. Please try again.
        </p>
      )}

      <div className="actions">
        <button type="submit" className="button button--primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : submitLabel}
        </button>
        <a className="button" href={cancelHref}>
          Cancel
        </a>
      </div>
    </form>
  )
}

export default PostForm
```

Most of it is familiar from lessons 1 and 22:

- Every field is a [[controlled input]]: its value comes from the `values` object, and `handleChange` writes every
  keystroke back. The fields have a `name`, so one function serves them all: `[event.target.name]` in square brackets
  is "the key whose name is in `event.target.name`", and the spread copies the other values.
- `validate` is a plain function that returns the messages; `errors` is worked out from it at every drawing. The
  messages appear only after the first click on the button (`showErrors`), and from then on they follow the typing.
  `noValidate` switches off the browser's own bubbles, so only our messages show. `aria-invalid` tells screen readers
  that a field is wrong, and `App.css` draws such a field red.
- `event.preventDefault()` stops the browser from sending the form the old way, by loading a new page.
- `handleSubmit` is an async function: `await onSave(…)` waits until the page has saved the post. While it is saving,
  the button is disabled and says "Saving…", so the post cannot be sent twice. If saving fails, `onSave` throws an
  error, `catch` catches it, and the red message appears. If it succeeds, the page goes to the new post, and the form
  disappears: there is nothing more to do.
- "Write" and "Preview" are two buttons with [[aria-pressed]], like the tabs of lesson 11. In preview mode the
  `Markdown` component of the previous step takes the place of the text box, so you can see the post before
  publishing it.
- The label of the text cannot wrap the text box, because the two tab buttons sit next to it. So the `<label>` points
  to it with `htmlFor`: its value is the `id` of the text box (`post-body`), so a click on the label still puts the
  cursor into the box, and a screen reader knows which field it belongs to. `htmlFor` is HTML's `for` attribute: like
  `className`, it has another name because `for` is a reserved word in JavaScript (the `for` loop).
- `submitLabel` and `cancelHref` come from the page: "Publish" and the list here, "Save changes" and the post in the
  next step.

The page around the form is short. Create `src/pages/NewPostPage.jsx`:

```jsx file=src/pages/NewPostPage.jsx
import { api } from '../api.js'
import { navigate } from '../useHashRoute.js'
import PostForm from '../components/PostForm.jsx'

const EMPTY_POST = { title: '', author: '', body: '' }

function NewPostPage() {
  async function save(values) {
    // The server's answer is the saved post, with its new id: we go straight to its page.
    const post = await api.create('posts', values)
    navigate(`/post/${post.id}`)
  }

  return (
    <section className="page">
      <h1 className="page__title">New post</h1>
      <PostForm initialValues={EMPTY_POST} submitLabel="Publish" cancelHref="#/" onSave={save} />
    </section>
  )
}

export default NewPostPage
```

`api.create('posts', values)` saves the post in the database. The server adds an `id` and a `createdAt` date to it,
and its answer is the saved post. If the request fails, `save` does not catch the error: it
goes on to the `catch` of the form's `handleSubmit`, and the form shows its own error message.

`App` gets the new page. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=5,22
import { useEffect } from 'react'
import useHashRoute, { matchRoute } from './useHashRoute.js'
import ListPage from './pages/ListPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NewPostPage from './pages/NewPostPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  const route = matchRoute(path)

  // A new page starts at the top, however far down the previous one was scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  // JSX is a value too: the page that belongs to the address goes into a variable.
  let page
  if (route.name === 'list') page = <ListPage />
  else if (route.name === 'post') page = <PostPage key={route.id} id={route.id} />
  else if (route.name === 'new') page = <NewPostPage />
  else page = <NotFoundPage />

  return (
    <div className="blog">
      <header className="blog__header">
        <a className="blog__title" href="#/">
          The Peacock Journal
        </a>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">{page}</main>
    </div>
  )
}

export default App
```

Finally, a "New post" button on the list. In `src/pages/ListPage.jsx` the title and the button share a row:

```jsx file=src/pages/ListPage.jsx mark=15-20
import { api } from '../api.js'
import { newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage() {
  // []: the list is loaded once, when the page appears.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  // Worked out from the server's answer at every drawing: a derived value, not state.
  const posts = status === 'success' ? newestFirst(data) : []

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">All posts</h1>
        <a className="button button--primary" href="#/new">
          + New post
        </a>
      </div>
      {status === 'loading' && <p className="state">Loading posts…</p>}
      {status === 'error' && <ErrorMessage text="The posts could not be loaded." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && <p className="state">No posts yet.</p>}
      {posts.length > 0 && (
        <ul className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

:::check Check
Next to "All posts" there is a green "+ New post" button. Click it: the address ends in `#/new`, and the "New post"
form appears. Click "Publish" straight away: three red messages, and the fields are framed in red. Fill in a title, your
name and a few lines with some Markdown (`# A heading`, a `- list`, a `**bold**` word), then click "Preview": the text
appears formatted; "Write" brings the text box back. Click "Publish": for a moment the button says "Saving…", then the
page of your new post opens. Back on the list, it is the first card, dated today. Reload the page: it is still there.
In DevTools (++F12++) → **Application** → **Local storage**, the `fake-api:peacock-journal` key holds the whole
database now. Set `failRate: 1` in `src/api.js`, and try to publish again: "The post could not be saved. Please try
again.", and your text is still in the form. Set it back to `0`.
:::

:::mistake Common mistake
Forgetting `event.preventDefault()`. Then the browser sends the form the old way: it loads the page again, with the
fields in the address (`?title=…&author=…&body=…`). The app starts from scratch, the form is empty again, and nothing
was saved, because the page was reloaded before the server could answer.
:::

:::try Try it
Start a new post, and type this line into its text: `[Click me](javascript:alert(1))`. Click "Preview": "Click me"
is plain text, not a link (and a lonely closing bracket is left after it). Now change the part between the round
brackets, the link's address, to `#/post/welcome`: in the preview, it becomes a link. Click "Cancel" afterwards, so the
test does not end up on the blog.
:::

### Editing a post

Editing is almost the same as writing: the same form, but with the post's own values in it, and saving updates the
post instead of creating a new one. The address is `#/edit/` and the post's id. In `src/useHashRoute.js`, replace
`matchRoute` once more:

```js file=src/useHashRoute.js mark=7
// Which page belongs to a path? '/' → { name: 'list' }, '/post/welcome' → { name: 'post', id: 'welcome' }
export function matchRoute(path) {
  const parts = path.split('/').filter((part) => part !== '') // '/post/welcome' → ['post', 'welcome']
  if (parts.length === 0) return { name: 'list' }
  if (parts.length === 1 && parts[0] === 'new') return { name: 'new' }
  if (parts.length === 2 && parts[0] === 'post') return { name: 'post', id: parts[1] }
  if (parts.length === 2 && parts[0] === 'edit') return { name: 'edit', id: parts[1] }
  return { name: 'notFound' }
}
```

The edit page first loads the post, as the post page does, and draws the form only when the post is there. Create
`src/pages/EditPostPage.jsx`:

```jsx file=src/pages/EditPostPage.jsx
import { api } from '../api.js'
import useRequest from '../useRequest.js'
import { navigate } from '../useHashRoute.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import PostForm from '../components/PostForm.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function EditPostPage({ id }) {
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  async function save(values) {
    // update changes only the fields it gets, and the server adds an updatedAt date.
    await api.update('posts', id, values)
    navigate(`/post/${id}`)
  }

  if (status === 'loading') return <p className="state">Loading the post…</p>
  if (status === 'error') {
    if (error.status === 404) return <NotFoundPage text="This post does not exist (any more)." />
    return <ErrorMessage text="The post could not be loaded." onRetry={reload} />
  }

  return (
    <section className="page">
      <h1 className="page__title">Edit post</h1>
      {/* The form is drawn only now that the post is here: useState reads initialValues only once. */}
      <PostForm
        initialValues={{ title: post.title, author: post.author, body: post.body }}
        submitLabel="Save changes"
        cancelHref={`#/post/${id}`}
        onSave={save}
      />
    </section>
  )
}

export default EditPostPage
```

Why does the form wait for the post? `PostForm` keeps its values in `useState(initialValues)`, and `useState` reads its
starting value only at the very first drawing. If the form appeared while the post was loading, it would start empty,
and stay empty when the post arrived. Because of the early returns, `PostForm` is drawn for the first time when the
values are already there.

In `App`, one more import and one more route. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=6,24
import { useEffect } from 'react'
import useHashRoute, { matchRoute } from './useHashRoute.js'
import ListPage from './pages/ListPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NewPostPage from './pages/NewPostPage.jsx'
import EditPostPage from './pages/EditPostPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  const route = matchRoute(path)

  // A new page starts at the top, however far down the previous one was scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  // JSX is a value too: the page that belongs to the address goes into a variable.
  let page
  if (route.name === 'list') page = <ListPage />
  else if (route.name === 'post') page = <PostPage key={route.id} id={route.id} />
  else if (route.name === 'new') page = <NewPostPage />
  else if (route.name === 'edit') page = <EditPostPage key={route.id} id={route.id} />
  else page = <NotFoundPage />

  return (
    <div className="blog">
      <header className="blog__header">
        <a className="blog__title" href="#/">
          The Peacock Journal
        </a>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">{page}</main>
    </div>
  )
}

export default App
```

The post page gets an "Edit" button at the bottom, and if the post has been edited, it says when. Replace
`src/pages/PostPage.jsx`:

```jsx file=src/pages/PostPage.jsx mark=28,32-36
import { api } from '../api.js'
import { formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id }) {
  // A new id means a new post: deps say when to send the request again.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Loading the post…</p>
  if (status === 'error') {
    // 404: the server has no post with this id. Any other error may go away if we try again.
    if (error.status === 404) return <NotFoundPage text="This post does not exist (any more)." />
    return <ErrorMessage text="The post could not be loaded." onRetry={reload} />
  }

  return (
    <article className="post">
      <a className="back" href="#/">
        ← All posts
      </a>
      <header className="post__header">
        <h1 className="post__title">{post.title}</h1>
        <p className="meta">
          by {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          {post.updatedAt && <> · updated {formatDate(post.updatedAt)}</>}
        </p>
      </header>
      <Markdown text={post.body} />
      <footer className="post__actions">
        <a className="button" href={`#/edit/${id}`}>
          Edit
        </a>
      </footer>
    </article>
  )
}

export default PostPage
```

`api.update` gives the post an `updatedAt` date. The sample posts have never been edited, so they have no `updatedAt`:
for them the line does not appear. `<>…</>` is a [[Fragment]]: it holds the text and the date together without adding
an element to the page.

:::check Check
Open a post, and click "Edit" at the bottom: the address ends in `#/edit/…`, "Loading the post…" flashes, and the
"Edit post" form appears with the post's title, author and text in it. Change the title, and click "Save changes": the
post page opens with the new title, and the line under it ends in "· updated" and today's date. The card on the list
shows the new title too. Open "Edit" again, change something, and click "Cancel": you are back on the post, and
nothing has changed.
:::

:::mistake Common mistake
Drawing the form before the post arrives, for example with
`initialValues={post ?? { title: '', author: '', body: '' }}` and no early return for the loading state. The form
appears at once, empty, and stays empty, even after the post has arrived: `useState` has already read its starting
value. Wait for the data, then draw the form.
:::

:::try Try it
Edit one of the sample posts, then delete the `fake-api:peacock-journal` key in DevTools → **Application** → **Local
storage**, and reload. The server starts again from the `seed`: your change and your own posts are gone, as after a
fresh install. (The next step brings a button for this.)
:::

### Deleting a post

The last of the four operations. Deleting cannot be undone, so it takes two clicks: the first only asks whether you
are sure, as in lesson 11. The button and its question get a component of their own, with their own state. Create
`src/components/DeleteButton.jsx`:

```jsx file=src/components/DeleteButton.jsx
import { useState } from 'react'
import { api } from '../api.js'
import { navigate } from '../useHashRoute.js'

// Deleting takes two clicks: the first one only asks whether you are sure.
function DeleteButton({ id }) {
  const [confirming, setConfirming] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle', 'deleting' or 'error'

  async function handleDelete() {
    setStatus('deleting')
    try {
      await api.remove('posts', id)
      navigate('/') // the post is gone: back to the list
    } catch {
      setStatus('error')
    }
  }

  if (!confirming) {
    return (
      <button type="button" className="button button--danger-ghost" onClick={() => setConfirming(true)}>
        Delete
      </button>
    )
  }

  return (
    <div className="confirm">
      <p className="confirm__text">Delete this post for good? This cannot be undone.</p>
      {status === 'error' && <p role="alert">The post could not be deleted. Please try again.</p>}
      <div className="actions">
        <button type="button" className="button button--danger" onClick={handleDelete} disabled={status === 'deleting'}>
          {status === 'deleting' ? 'Deleting…' : 'Yes, delete it'}
        </button>
        <button type="button" className="button" onClick={() => setConfirming(false)} autoFocus>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default DeleteButton
```

- While `confirming` is `false`, the component returns only the "Delete" button. Its click sets `confirming`, and the
  question appears in its place.
- `autoFocus` puts the keyboard focus on "Cancel" when the question appears: if someone presses ++Enter++ out of habit,
  nothing is lost.
- After a successful `api.remove`, `navigate('/')` goes to the list, which loads the posts again, without the deleted
  one.

Why a separate component, and not two more `useState`s in `PostPage`? Its state belongs to the button only, and
`PostPage` has early returns. Hooks must be called in the same order at every drawing (the [[rules of hooks]]), so a
`useState` below an early return would break the page (the box below shows how). In a component of its own, the
problem does not even come up.

The button goes next to "Edit". Replace `src/pages/PostPage.jsx`:

```jsx file=src/pages/PostPage.jsx mark=6,37
import { api } from '../api.js'
import { formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import DeleteButton from '../components/DeleteButton.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id }) {
  // A new id means a new post: deps say when to send the request again.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Loading the post…</p>
  if (status === 'error') {
    // 404: the server has no post with this id. Any other error may go away if we try again.
    if (error.status === 404) return <NotFoundPage text="This post does not exist (any more)." />
    return <ErrorMessage text="The post could not be loaded." onRetry={reload} />
  }

  return (
    <article className="post">
      <a className="back" href="#/">
        ← All posts
      </a>
      <header className="post__header">
        <h1 className="post__title">{post.title}</h1>
        <p className="meta">
          by {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          {post.updatedAt && <> · updated {formatDate(post.updatedAt)}</>}
        </p>
      </header>
      <Markdown text={post.body} />
      <footer className="post__actions">
        <a className="button" href={`#/edit/${id}`}>
          Edit
        </a>
        <DeleteButton id={id} />
      </footer>
    </article>
  )
}

export default PostPage
```

If you delete every post, the list says "No posts yet." From now on, a button there brings back the sample posts:
`api.reset()` makes the pretend server forget every change and start again from its `seed`, and `reload` asks it for
the list again. Replace `src/pages/ListPage.jsx`:

```jsx file=src/pages/ListPage.jsx mark=13-16,28-35
import { api } from '../api.js'
import { newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage() {
  // []: the list is loaded once, when the page appears.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  // Worked out from the server's answer at every drawing: a derived value, not state.
  const posts = status === 'success' ? newestFirst(data) : []

  function restoreSamples() {
    api.reset() // the pretend server forgets every change, and starts again from its seed
    reload()
  }

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">All posts</h1>
        <a className="button button--primary" href="#/new">
          + New post
        </a>
      </div>
      {status === 'loading' && <p className="state">Loading posts…</p>}
      {status === 'error' && <ErrorMessage text="The posts could not be loaded." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && (
        <div className="state">
          <p>No posts yet.</p>
          <button type="button" className="button" onClick={restoreSamples}>
            Bring back the sample posts
          </button>
        </div>
      )}
      {posts.length > 0 && (
        <ul className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

:::check Check
Open a post you wrote, and click "Delete": a pink box asks "Delete this post for good? This cannot be undone.", and
the keyboard focus is already on "Cancel": press ++Enter++, and only the "Delete" button is left. Click "Delete" again,
then "Yes, delete it": "Deleting…", then the list, without the post. Press the browser's Back button: the deleted
post's address says "This post does not exist (any more)." Now delete all the posts: the list says "No posts yet.";
click "Bring back the sample posts", and the four sample posts are back. The intermediate level is done: commit it!
:::

:::mistake Common mistake
Putting the two `useState`s of the question into `PostPage`, below the early returns. At the first drawing the post is
loading, the component returns early, and React counts only the hooks inside `useRequest`. When the post arrives,
the two new `useState`s make it count more, and the page stops with "Rendered more hooks than during the previous render". Hooks always come at the top of a
component, before any `return`.
:::

:::try Try it
Set `failRate: 1` in `src/api.js` on an open post's page, and click "Delete", then "Yes, delete it": after the wait, the
box says "The post could not be deleted. Please try again.", and the post stays. (The page itself may still be there,
because it was loaded before.) Set `failRate` back to `0`.
:::

## Advanced level {level=3}

### Authors log in

So far anyone can write, edit and delete. On a real blog only the authors can: first they have to prove who they are,
by logging in. This is [[authentication]]. The database has had the `authors` collection since the first step:
`sampleData.js` has two authors, Rika (password: `peacock`) and Sam (password: `pancakes`).

On a real server, logging in is a request too: the page sends the name and the password, and the server checks them.
Our pretend server can find items with a filter: `api.list('authors', filter)` returns only the items for which
`filter` gives `true`. Add the `logIn` function to the end of `src/api.js`:

```js file=src/api.js
// "POST /login": looks for the author with this name and password.
// The answer is the author without the password; if there is none, an error with status 401.
export async function logIn(name, password) {
  const found = await api.list(
    'authors',
    (author) => author.name.toLowerCase() === name.toLowerCase() && author.password === password,
  )
  if (found.length === 0) {
    const error = new Error('Wrong name or password.')
    error.status = 401
    throw error
  }
  return { id: found[0].id, name: found[0].name }
}
```

- The filter runs on the "server": the page gets back only the matching authors, never the whole list with everybody's
  password. `toLowerCase()` makes the name forgiving: `rika` and `Rika` are the same author. The password has to match
  exactly.
- `throw` creates an error ([[throwing an error]]), and it jumps straight into the `catch` of whoever called `logIn`.
  Its `status` is 401, the HTTP status code of "who are you?": the code a real server would send.
- The answer has only the `id` and the `name`. A password has no business in the page's state.

The logged-in author must survive a reload. In lessons 9–11 and 21 you wrote a `useLocalStorage` hook for exactly this:
it works like `useState`, but it also keeps the value in localStorage as [[JSON]] text. If you kept yours, copy it into
`src`; if not, create `src/useLocalStorage.js`:

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

A short reminder: the function given to `useState` runs only at the first drawing (a [[lazy initial state]]), and reads
the saved text back with `JSON.parse`. The effect saves the value with `JSON.stringify` after every change.

The login page has a name, a password, and a button. Create `src/pages/LoginPage.jsx`:

```jsx file=src/pages/LoginPage.jsx
import { useState } from 'react'
import { logIn } from '../api.js'

function LoginPage({ onLogin }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false) // is the login on its way?
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const author = await logIn(name.trim(), password)
      onLogin(author)
    } catch (err) {
      setError(err.status === 401 ? 'Wrong name or password.' : 'The server is not responding. Please try again.')
      setBusy(false)
    }
  }

  return (
    <section className="page">
      <h1 className="page__title">Log in</h1>
      <p className="muted">
        Only the authors of the blog can write, edit and delete posts. Practice accounts: Rika (password: peacock) and
        Sam (password: pancakes).
      </p>
      <form className="login" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="username" required />
        </label>
        <label className="field">
          <span className="field__label">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="submit" className="button button--primary" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default LoginPage
```

- `required` asks the browser not to send the form with an empty field: here its own small bubble is enough.
- `busy` disables the button while the answer is on its way, as in lesson 21. After a successful login the page goes
  away, so it has no need to switch back; after an error it does, so you can try again. The error is called `err`
  inside `catch`, because `error` is already the name of the state.
- `autoComplete` tells the browser which field is the user name and which one is the password, so a password manager
  can fill them in.

The login page gets its own address, `#/login`. In `src/useHashRoute.js`, replace `matchRoute`:

```js file=src/useHashRoute.js mark=6
// Which page belongs to a path? '/' → { name: 'list' }, '/post/welcome' → { name: 'post', id: 'welcome' }
export function matchRoute(path) {
  const parts = path.split('/').filter((part) => part !== '') // '/post/welcome' → ['post', 'welcome']
  if (parts.length === 0) return { name: 'list' }
  if (parts.length === 1 && parts[0] === 'new') return { name: 'new' }
  if (parts.length === 1 && parts[0] === 'login') return { name: 'login' }
  if (parts.length === 2 && parts[0] === 'post') return { name: 'post', id: parts[1] }
  if (parts.length === 2 && parts[0] === 'edit') return { name: 'edit', id: parts[1] }
  return { name: 'notFound' }
}
```

`App` keeps the logged-in author: the [[session]]. `null` means nobody is logged in. The header shows a "Log in" link,
or the author's name with a "Log out" button. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=2-3,8,15-16,23-26,34,40,44-60
import { useEffect } from 'react'
import useHashRoute, { matchRoute, navigate } from './useHashRoute.js'
import useLocalStorage from './useLocalStorage.js'
import ListPage from './pages/ListPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NewPostPage from './pages/NewPostPage.jsx'
import EditPostPage from './pages/EditPostPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  const route = matchRoute(path)
  // The logged-in author ({ id, name }), or null. In localStorage, so a reload does not log you out.
  const [author, setAuthor] = useLocalStorage('peacock-journal:author', null)

  // A new page starts at the top, however far down the previous one was scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  function handleLogin(newAuthor) {
    setAuthor(newAuthor)
    navigate('/')
  }

  // JSX is a value too: the page that belongs to the address goes into a variable.
  let page
  if (route.name === 'list') page = <ListPage />
  else if (route.name === 'post') page = <PostPage key={route.id} id={route.id} />
  else if (route.name === 'new') page = <NewPostPage />
  else if (route.name === 'edit') page = <EditPostPage key={route.id} id={route.id} />
  else if (route.name === 'login') page = <LoginPage onLogin={handleLogin} />
  else page = <NotFoundPage />

  return (
    <div className="blog">
      <header className="blog__header">
        <div className="blog__bar">
          <a className="blog__title" href="#/">
            The Peacock Journal
          </a>
          <div className="blog__account">
            {author ? (
              <>
                <span>
                  Logged in as <strong>{author.name}</strong>
                </span>
                <button type="button" className="button button--small" onClick={() => setAuthor(null)}>
                  Log out
                </button>
              </>
            ) : (
              <a className="button button--small" href="#/login">
                Log in
              </a>
            )}
          </div>
        </div>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">{page}</main>
    </div>
  )
}

export default App
```

`author ? (…) : (…)` is the [[ternary operator]]: with an author, their name and the "Log out" button, otherwise the
"Log in" link. The new `blog__bar` puts the title and the login on one row (`App.css` takes care of it). Logging out is
simply `setAuthor(null)`: the hook saves `null`, and nobody is logged in any more.

:::check Check
In the top right of the band there is a "Log in" button. Click it: the address ends in `#/login`, and the login form
appears. Type `Rika` and a wrong password: for a moment "Logging in…", then "Wrong name or password." in red. Now
`rika` and `peacock`: the list appears, and the band says "Logged in as Rika", with a "Log out" button. Reload: you are
still logged in. In DevTools → **Application** → **Local storage**, the `peacock-journal:author` key holds
`{"id":"rika","name":"Rika"}`, without the password. Click "Log out": the "Log in" button is back.
:::

:::concept How do real logins work?
A real server never keeps the password itself, only a [[hash]] of it: a fingerprint from which the password cannot be
worked out. At login it makes the same fingerprint from what you typed, and compares the two. The login travels over an
encrypted `https://` connection, and the server answers with a [[token|access token]] (lesson 21), which the page
sends along with every later request: from it, the server knows who is asking. Our pretend server keeps the passwords
as plain text in localStorage, where anyone can read them: fine for practice, never for real data. That is why you
must never use a real password in this project.
:::

:::mistake Common mistake
Keeping the author in a plain `useState(null)`. Logging in works, but every reload logs you out, because state lives
only as long as the page is open. The session has to be saved somewhere that survives a reload: here, localStorage.
:::

### Only authors may write

Logging in tells who you are. What you may do is another question, called [[authorization]]: writing and editing are for
logged-in authors only, and a post may be changed only by its own author. Four places need the rule: the "New post"
button, the "Edit" and "Delete" buttons, the writing page and the edit page.

First, the rule itself, in one place. Add `canEdit` to the end of `src/posts.js`:

```js file=src/posts.js
// May this author change this post? Only its own author may. Posts from before the login have no authorId:
// any logged-in author may change those.
export function canEdit(post, author) {
  return author !== null && (!post.authorId || post.authorId === author.id)
}
```

The sample posts have an `authorId` (`'rika'` or `'sam'`). The posts you wrote in the intermediate level have none:
`!post.authorId` is `true` for them, so any author may change them. The brackets matter: "there is an author, **and**
(the post has no owner, **or** the author owns it)".

In `App`, the writing and the edit pages become [[protected routes|protected route]]: without a logged-in author, the
login form appears in their place. After the login, the same address draws the page that was asked for, because `App`
is drawn again with the new author. Every page that needs to know gets the `author` prop. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=25-26,29-30,34-38
import { useEffect } from 'react'
import useHashRoute, { matchRoute, navigate } from './useHashRoute.js'
import useLocalStorage from './useLocalStorage.js'
import ListPage from './pages/ListPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NewPostPage from './pages/NewPostPage.jsx'
import EditPostPage from './pages/EditPostPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  const path = useHashRoute()
  const route = matchRoute(path)
  // The logged-in author ({ id, name }), or null. In localStorage, so a reload does not log you out.
  const [author, setAuthor] = useLocalStorage('peacock-journal:author', null)

  // A new page starts at the top, however far down the previous one was scrolled.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  function handleLogin(newAuthor) {
    setAuthor(newAuthor)
    // From the login page we go home. On a protected page we stay: it opens by itself now.
    if (route.name === 'login') navigate('/')
  }

  // Writing and editing need a logged-in author: anyone else gets the login form in their place.
  const needsAuthor = route.name === 'new' || route.name === 'edit'

  // JSX is a value too: the page that belongs to the address goes into a variable.
  let page
  if (route.name === 'login' || (needsAuthor && !author)) page = <LoginPage onLogin={handleLogin} />
  else if (route.name === 'list') page = <ListPage author={author} />
  else if (route.name === 'post') page = <PostPage key={route.id} id={route.id} author={author} />
  else if (route.name === 'new') page = <NewPostPage author={author} />
  else if (route.name === 'edit') page = <EditPostPage key={route.id} id={route.id} author={author} />
  else page = <NotFoundPage />

  return (
    <div className="blog">
      <header className="blog__header">
        <div className="blog__bar">
          <a className="blog__title" href="#/">
            The Peacock Journal
          </a>
          <div className="blog__account">
            {author ? (
              <>
                <span>
                  Logged in as <strong>{author.name}</strong>
                </span>
                <button type="button" className="button button--small" onClick={() => setAuthor(null)}>
                  Log out
                </button>
              </>
            ) : (
              <a className="button button--small" href="#/login">
                Log in
              </a>
            )}
          </div>
        </div>
        <p className="blog__tagline">Notes on React, writing and the web.</p>
      </header>

      <main className="blog__main">{page}</main>
    </div>
  )
}

export default App
```

The order of the `if`s matters: the login check comes first, so a protected page never even starts without an author.

On the list, the "New post" button appears only for authors. In `src/pages/ListPage.jsx` only two places change: the
component gets the `author` prop, and the button goes into an `author && (…)`. Replace the file:

```jsx file=src/pages/ListPage.jsx mark=7,22-26
import { api } from '../api.js'
import { newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage({ author }) {
  // []: the list is loaded once, when the page appears.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  // Worked out from the server's answer at every drawing: a derived value, not state.
  const posts = status === 'success' ? newestFirst(data) : []

  function restoreSamples() {
    api.reset() // the pretend server forgets every change, and starts again from its seed
    reload()
  }

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">All posts</h1>
        {author && (
          <a className="button button--primary" href="#/new">
            + New post
          </a>
        )}
      </div>
      {status === 'loading' && <p className="state">Loading posts…</p>}
      {status === 'error' && <ErrorMessage text="The posts could not be loaded." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && (
        <div className="state">
          <p>No posts yet.</p>
          <button type="button" className="button" onClick={restoreSamples}>
            Bring back the sample posts
          </button>
        </div>
      )}
      {posts.length > 0 && (
        <ul className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

On the post page, "Edit" and "Delete" appear only if `canEdit` allows it. Replace `src/pages/PostPage.jsx`:

```jsx file=src/pages/PostPage.jsx mark=2,9,33,40
import { api } from '../api.js'
import { canEdit, formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import DeleteButton from '../components/DeleteButton.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id, author }) {
  // A new id means a new post: deps say when to send the request again.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Loading the post…</p>
  if (status === 'error') {
    // 404: the server has no post with this id. Any other error may go away if we try again.
    if (error.status === 404) return <NotFoundPage text="This post does not exist (any more)." />
    return <ErrorMessage text="The post could not be loaded." onRetry={reload} />
  }

  return (
    <article className="post">
      <a className="back" href="#/">
        ← All posts
      </a>
      <header className="post__header">
        <h1 className="post__title">{post.title}</h1>
        <p className="meta">
          by {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          {post.updatedAt && <> · updated {formatDate(post.updatedAt)}</>}
        </p>
      </header>
      <Markdown text={post.body} />
      {canEdit(post, author) && (
        <footer className="post__actions">
          <a className="button" href={`#/edit/${id}`}>
            Edit
          </a>
          <DeleteButton id={id} />
        </footer>
      )}
    </article>
  )
}

export default PostPage
```

A new post gets its author from the login: the "Author" field starts with the author's name (it can still be changed,
for a pen name), and the server saves the `authorId` too. Replace `src/pages/NewPostPage.jsx`:

```jsx file=src/pages/NewPostPage.jsx mark=7,10,17-22
import { api } from '../api.js'
import { navigate } from '../useHashRoute.js'
import PostForm from '../components/PostForm.jsx'

const EMPTY_POST = { title: '', author: '', body: '' }

function NewPostPage({ author }) {
  async function save(values) {
    // The server's answer is the saved post, with its new id: we go straight to its page.
    const post = await api.create('posts', { ...values, authorId: author.id })
    navigate(`/post/${post.id}`)
  }

  return (
    <section className="page">
      <h1 className="page__title">New post</h1>
      <PostForm
        initialValues={{ ...EMPTY_POST, author: author.name }}
        submitLabel="Publish"
        cancelHref="#/"
        onSave={save}
      />
    </section>
  )
}

export default NewPostPage
```

Last, the edit page: a hidden button is not enough, because anyone can type `#/edit/welcome` into the address bar. If
the logged-in author may not change the post, the page says so instead of drawing the form. Replace
`src/pages/EditPostPage.jsx`:

```jsx file=src/pages/EditPostPage.jsx mark=2,9,23
import { api } from '../api.js'
import { canEdit } from '../posts.js'
import useRequest from '../useRequest.js'
import { navigate } from '../useHashRoute.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import PostForm from '../components/PostForm.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function EditPostPage({ id, author }) {
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  async function save(values) {
    // update changes only the fields it gets, and the server adds an updatedAt date.
    await api.update('posts', id, values)
    navigate(`/post/${id}`)
  }

  if (status === 'loading') return <p className="state">Loading the post…</p>
  if (status === 'error') {
    if (error.status === 404) return <NotFoundPage text="This post does not exist (any more)." />
    return <ErrorMessage text="The post could not be loaded." onRetry={reload} />
  }
  if (!canEdit(post, author)) return <p className="state">Only {post.author} can edit this post.</p>

  return (
    <section className="page">
      <h1 className="page__title">Edit post</h1>
      {/* The form is drawn only now that the post is here: useState reads initialValues only once. */}
      <PostForm
        initialValues={{ title: post.title, author: post.author, body: post.body }}
        submitLabel="Save changes"
        cancelHref={`#/post/${id}`}
        onSave={save}
      />
    </section>
  )
}

export default EditPostPage
```

:::check Check
Log out. The list has no "New post" button, and the posts have no "Edit" or "Delete". Type `#/new` into the address
bar: the login form appears in place of the editor. Log in as `sam` / `pancakes`: the "New post" form opens by itself,
with "Sam" in the "Author" field. Publish a post: it has "Edit" and "Delete". Open "Why this blog uses hash routes"
(Sam's): it has them too. Open "Writing posts in Markdown" (Rika's): no buttons. Type `#/edit/markdown-basics`: "Only
Rika can edit this post." Now click "Log out": this is a protected page, so the login form appears in its place. Log in
as Rika: at the same address the "Edit post" form opens now, and the post's page has its buttons too.
:::

:::concept Hiding a button is not protection
Everything we did here happens in the browser, and the browser belongs to the user. Anyone can open DevTools and send a
request to the server by hand, without any button. On a real blog, the protection is on the **server**: it checks the
token of every request that writes, and refuses an update from Sam to Rika's post with 403 (Forbidden), whatever the
page shows. The page only hides what would not work anyway, to be friendly. Our pretend server runs in the browser
too, so it cannot protect anything: this part is practice for the habit, not real security.
:::

:::mistake Common mistake
`author !== null && !post.authorId || post.authorId === author.id`, without the inner brackets. `&&` is stronger than
`||`, so this means "(there is an author and the post has no owner) or the author owns it". When nobody is logged in,
the second half still runs, and `author.id` stops the page with "Cannot read properties of null (reading 'id')".
:::

### Comments

Readers can write comments under the posts. In the database, comments are a collection of their own: every comment has
a `postId`, which tells which post it belongs to. A field like this, which points to an item of another
collection, is called a [[foreign key]]. The sample comments in `sampleData.js` point to `markdown-basics` and `hash-routing`.

The comments of a post are loaded with a filter: `api.list('comments', (comment) => comment.postId === postId)`. A real
API would have an address such as `GET /posts/markdown-basics/comments` for this. After a new comment is saved, the
list should show it. We could load the whole list again, but the server's answer already is the saved comment: it is
enough to add it to the end of the list we have. For this, `useRequest` gets one more function, `setData`. Replace
`src/useRequest.js`:

```js file=src/useRequest.js mark=4,34-37,39
import { useEffect, useState } from 'react'

// Sends a request to the server, and tells how it is going:
// { status: 'loading' | 'success' | 'error', data, error, reload, setData }
// request: a function that returns a Promise. deps: when one of them changes, the request is sent again.
function useRequest(request, deps) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false // the cleanup sets it to true: from then on the answer is not wanted

    async function load() {
      setState({ status: 'loading', data: null, error: null })
      try {
        const data = await request()
        if (!ignore) setState({ status: 'success', data, error: null })
      } catch (error) {
        if (!ignore) setState({ status: 'error', data: null, error })
      }
    }

    load()
    return () => {
      ignore = true
    }
    // request is a new function at every drawing, so it is not in the list: deps decide when to send again.
  }, [...deps, attempt])

  function reload() {
    setAttempt(attempt + 1)
  }

  // Replaces the data, without asking the server again: for when we already know the new data.
  function setData(data) {
    setState({ status: 'success', data, error: null })
  }

  return { ...state, reload, setData }
}

export default useRequest
```

The comments go into `src/components/CommentSection.jsx`:

```jsx file=src/components/CommentSection.jsx
import { useState } from 'react'
import { api } from '../api.js'
import { formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from './ErrorMessage.jsx'

function CommentSection({ postId, author }) {
  // Only the comments of this post: the filter picks them out on the server.
  const comments = useRequest(() => api.list('comments', (comment) => comment.postId === postId), [postId])
  const [name, setName] = useState(author ? author.name : '') // a logged-in author need not type it
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // 'idle', 'sending' or 'error'

  async function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '' || text.trim() === '') return
    setStatus('sending')
    try {
      const saved = await api.create('comments', { postId, name: name.trim(), text: text.trim() })
      // The server's answer is the saved comment: it goes to the end of the list we already have.
      comments.setData([...comments.data, saved])
      setText('')
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="comments" aria-labelledby="comments-title">
      <h2 id="comments-title">Comments</h2>
      {comments.status === 'loading' && <p className="muted">Loading comments…</p>}
      {comments.status === 'error' && (
        <ErrorMessage text="The comments could not be loaded." onRetry={comments.reload} />
      )}
      {comments.status === 'success' && (
        <>
          {comments.data.length === 0 && <p className="muted">No comments yet. Be the first!</p>}
          <ul className="comment-list">
            {comments.data.map((comment) => (
              <li key={comment.id} className="comment">
                <p className="meta">
                  <strong>{comment.name}</strong> · <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                </p>
                <p className="comment__text">{comment.text}</p>
              </li>
            ))}
          </ul>
          <form className="comment-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">Your name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} required />
            </label>
            <label className="field">
              <span className="field__label">Comment</span>
              <textarea value={text} onChange={(event) => setText(event.target.value)} rows={3} required />
            </label>
            {status === 'error' && (
              <p className="alert" role="alert">
                The comment could not be sent. Please try again.
              </p>
            )}
            <div className="actions">
              <button type="submit" className="button button--primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send comment'}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  )
}

export default CommentSection
```

- This time the hook's answer is not taken apart: `comments.status`, `comments.data` and `comments.reload` read well,
  and the component's own `status` (of the sending) has a name of its own.
- `[...comments.data, saved]` is a new array: the old comments, and the new one at the end. As always, we do not
  `push` into the state, we hand over a new array.
- `useState(author ? author.name : '')`: a logged-in author finds their name already in the field. The starting value
  is read only once, when the section appears, like every starting value of `useState`.
- After sending, the comment box empties, but the name stays: the next comment is quicker to write.
- The form appears only when the comments have loaded: before that, there would be no list to add to.
- The comment text is in a `comment__text` paragraph, and `App.css` keeps its line breaks (`white-space: pre-line`).
  The comments are plain text, not Markdown: React shows them exactly as they were typed.

The comments go under the post. The page now returns two things side by side, so a Fragment holds them together.
Replace `src/pages/PostPage.jsx`:

```jsx file=src/pages/PostPage.jsx mark=7,22,44-45
import { api } from '../api.js'
import { canEdit, formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import DeleteButton from '../components/DeleteButton.jsx'
import CommentSection from '../components/CommentSection.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id, author }) {
  // A new id means a new post: deps say when to send the request again.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])

  if (status === 'loading') return <p className="state">Loading the post…</p>
  if (status === 'error') {
    // 404: the server has no post with this id. Any other error may go away if we try again.
    if (error.status === 404) return <NotFoundPage text="This post does not exist (any more)." />
    return <ErrorMessage text="The post could not be loaded." onRetry={reload} />
  }

  return (
    <>
      <article className="post">
        <a className="back" href="#/">
          ← All posts
        </a>
        <header className="post__header">
          <h1 className="post__title">{post.title}</h1>
          <p className="meta">
            by {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            {post.updatedAt && <> · updated {formatDate(post.updatedAt)}</>}
          </p>
        </header>
        <Markdown text={post.body} />
        {canEdit(post, author) && (
          <footer className="post__actions">
            <a className="button" href={`#/edit/${id}`}>
              Edit
            </a>
            <DeleteButton id={id} />
          </footer>
        )}
      </article>
      <CommentSection postId={id} author={author} />
    </>
  )
}

export default PostPage
```

One more thing: when a post is deleted, its comments should go with it. Otherwise they stay in the database for good,
pointing to a post that no longer exists. Add `deletePost` to the end of `src/api.js`:

```js file=src/api.js
// Deletes a post together with its comments, so that no comment is left without its post.
export async function deletePost(id) {
  const comments = await api.list('comments', (comment) => comment.postId === id)
  for (const comment of comments) {
    await api.remove('comments', comment.id)
  }
  await api.remove('posts', id)
}
```

The `await` inside the `for … of` loop waits for every deletion before the next one starts. Now `DeleteButton` uses
it. Replace `src/components/DeleteButton.jsx`:

```jsx file=src/components/DeleteButton.jsx mark=2,13
import { useState } from 'react'
import { deletePost } from '../api.js'
import { navigate } from '../useHashRoute.js'

// Deleting takes two clicks: the first one only asks whether you are sure.
function DeleteButton({ id }) {
  const [confirming, setConfirming] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle', 'deleting' or 'error'

  async function handleDelete() {
    setStatus('deleting')
    try {
      await deletePost(id) // the post, and its comments too
      navigate('/') // the post is gone: back to the list
    } catch {
      setStatus('error')
    }
  }

  if (!confirming) {
    return (
      <button type="button" className="button button--danger-ghost" onClick={() => setConfirming(true)}>
        Delete
      </button>
    )
  }

  return (
    <div className="confirm">
      <p className="confirm__text">Delete this post for good? This cannot be undone.</p>
      {status === 'error' && <p role="alert">The post could not be deleted. Please try again.</p>}
      <div className="actions">
        <button type="button" className="button button--danger" onClick={handleDelete} disabled={status === 'deleting'}>
          {status === 'deleting' ? 'Deleting…' : 'Yes, delete it'}
        </button>
        <button type="button" className="button" onClick={() => setConfirming(false)} autoFocus>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default DeleteButton
```

:::check Check
Open "Writing posts in Markdown": under the post, a "Comments" box loads, with Bence's and Mia's comments and their
dates. Open "Picking colours for a website": "No comments yet. Be the first!" Write a comment there with your name:
"Sending…", then the comment appears at the end of the list, the comment box is empty again, and your name is still
there. Reload: the comment is still there. Now log in, write a test post, and copy its id from the address bar (the
part after `#/post/`). Comment on it twice, and delete the post. In DevTools → **Application** → **Local storage**,
click the `fake-api:peacock-journal` key: in its `comments` list, no comment has that id as its `postId`.
:::

:::concept What a real database does here
In a real database, such as PostgreSQL, the link between the two tables can be written into the database itself: a
comment's `postId` must point to an existing post, and when a post is deleted, the database deletes its comments by
itself ("on delete cascade"). It also does all of this as one [[transaction]]: either every part succeeds, or none of
them does. Our `deletePost` is several separate requests: if one fails halfway, some comments are already gone and the
post is still there. For a practice blog that is acceptable; on a real server, the deletion would be one request, and
the server would do the rest.
:::

:::mistake Common mistake
`comments.data.push(saved)` instead of `setData`. Here it seems to work, because `setText('')` and `setStatus('idle')`
draw the component again anyway. But `push` changes the array in the state behind React's back: if this line were the
only change, nothing on the screen would change until something else drew the component again. State is always
replaced with a new value, never changed in place.
:::

:::try Try it
Open the same post in two browser tabs, and write a comment in one of them. The other tab does not show it until you
reload it: each tab loaded the comments once. Live updates between tabs would need a message from one tab to the
other: `createChannel` at the end of `fakeApi.js` does exactly that, and the chat lessons use it.
:::

### Tags

Tags group the posts by topic: `react`, `markdown`, `design`. The sample posts already have a `tags` array. A post can
have any number of tags, every tag is a link, and `#/tag/react` lists the posts tagged `react`.

The tags of a post are drawn by a small component, on the cards and on the post page alike. Create
`src/components/TagList.jsx`:

```jsx file=src/components/TagList.jsx
// The tags of a post, each one a link to the list of posts with that tag.
function TagList({ tags }) {
  if (tags.length === 0) return null

  return (
    <ul className="tags">
      {tags.map((tag) => (
        <li key={tag}>
          <a className="tag" href={`#/tag/${encodeURIComponent(tag)}`}>
            #{tag}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default TagList
```

`return null` draws nothing: a post without tags gets no empty list. `encodeURIComponent` is [[URL encoding]]: it
turns characters that may not stand in an address into codes, for example a space into `%20` and the `é` of `café`
into `%C3%A9`. The router has to turn them back: `decodeURIComponent` does the opposite. In `src/useHashRoute.js`,
add this `decodePart` function before `matchRoute`, and replace `matchRoute`:

```js file=src/useHashRoute.js mark=1-8,18
// '%C3%A9' → 'é'. A broken code (for example a typed '100%') stays as it is.
function decodePart(part) {
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}

// Which page belongs to a path? '/' → { name: 'list' }, '/post/welcome' → { name: 'post', id: 'welcome' }
export function matchRoute(path) {
  const parts = path.split('/').filter((part) => part !== '') // '/post/welcome' → ['post', 'welcome']
  if (parts.length === 0) return { name: 'list' }
  if (parts.length === 1 && parts[0] === 'new') return { name: 'new' }
  if (parts.length === 1 && parts[0] === 'login') return { name: 'login' }
  if (parts.length === 2 && parts[0] === 'post') return { name: 'post', id: parts[1] }
  if (parts.length === 2 && parts[0] === 'edit') return { name: 'edit', id: parts[1] }
  if (parts.length === 2 && parts[0] === 'tag') return { name: 'tag', tag: decodePart(parts[1]) }
  return { name: 'notFound' }
}
```

On a broken % code (for example a typed `#/tag/100%`), `decodeURIComponent` throws an error. `matchRoute` runs while
`App` is being drawn, so without the `try/catch` the whole page would go blank.

A tag page is the list again, with a filter. In `src/App.jsx`, add one line to the `if` chain, right after the line of
the list:

```jsx file=src/App.jsx mark=2
  else if (route.name === 'list') page = <ListPage author={author} />
  else if (route.name === 'tag') page = <ListPage author={author} tag={route.tag} />
```

Both lines draw a `ListPage` in the same place, so when you go from the list to a tag page, React keeps the same
component, and only its `tag` prop changes: the posts are not even loaded again. The list does the filtering. Replace
`src/pages/ListPage.jsx`:

```jsx file=src/pages/ListPage.jsx mark=7,10,12-13,23,30-34,45-46,48
import { api } from '../api.js'
import { newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage({ author, tag }) {
  // []: the list is loaded once, when the page appears.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  // Worked out from the server's answer at every drawing: derived values, not state.
  const posts = status === 'success' ? newestFirst(data) : []
  // Posts written before tags existed have none: ?? [] stands in for them.
  const tagged = tag ? posts.filter((post) => (post.tags ?? []).includes(tag)) : posts

  function restoreSamples() {
    api.reset() // the pretend server forgets every change, and starts again from its seed
    reload()
  }

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">{tag ? `Posts tagged #${tag}` : 'All posts'}</h1>
        {author && (
          <a className="button button--primary" href="#/new">
            + New post
          </a>
        )}
      </div>
      {tag && (
        <a className="back" href="#/">
          ← All posts
        </a>
      )}
      {status === 'loading' && <p className="state">Loading posts…</p>}
      {status === 'error' && <ErrorMessage text="The posts could not be loaded." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && (
        <div className="state">
          <p>No posts yet.</p>
          <button type="button" className="button" onClick={restoreSamples}>
            Bring back the sample posts
          </button>
        </div>
      )}
      {posts.length > 0 && tagged.length === 0 && <p className="state">No post has this tag.</p>}
      {tagged.length > 0 && (
        <ul className="post-list">
          {tagged.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

The cards show the tags under the author. Replace `src/components/PostCard.jsx`:

```jsx file=src/components/PostCard.jsx mark=2,16
import { excerpt, formatDate, readingTime } from '../posts.js'
import TagList from './TagList.jsx'

function PostCard({ post }) {
  return (
    <li className="card">
      <p className="meta">
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time> · {readingTime(post.body)} min read
      </p>
      <h2 className="card__title">
        {/* App.css stretches this link over the whole card: a click anywhere on the card opens the post. */}
        <a href={`#/post/${post.id}`}>{post.title}</a>
      </h2>
      <p className="card__excerpt">{excerpt(post.body)}</p>
      <p className="meta">by {post.author}</p>
      <TagList tags={post.tags ?? []} />
    </li>
  )
}

export default PostCard
```

The big link of the card covers the whole card, but `App.css` lifts the tags above it, so a click on a tag opens the
tag page, and a click anywhere else opens the post. On the post page, the tags go under the date. In
`src/pages/PostPage.jsx`, import `TagList` with the other components:

```jsx file=src/pages/PostPage.jsx
import TagList from '../components/TagList.jsx'
```

and draw it at the end of the `<header>`, right after the `<p className="meta">` paragraph:

```jsx file=src/pages/PostPage.jsx mark=1
          <TagList tags={post.tags ?? []} />
        </header>
```

:::check Check
The cards show their tags: `#news`, `#markdown` and `#writing`, `#react` and `#routing`, `#design`. Click `#markdown` on
a card: not the post, but "Posts tagged #markdown" opens, with only the Markdown post on it, and an "← All posts" link.
On the post page the tags are under the date, and they are links too. `#/tag/nothing` says "No post has this tag." So
does a typed `#/tag/100%`, and the page does not go blank.
:::

### Tags in the editor

Now the authors give the tags themselves. In the form, they are typed as one text, separated by commas:
`React, Markdown, tips`. On the server they should be a tidy array: `['react', 'markdown', 'tips']`. Add `parseTags`
to the end of `src/posts.js`:

```js file=src/posts.js
// 'React, Markdown ,, tips' → ['react', 'markdown', 'tips']: tidy, lowercase, and each one only once.
export function parseTags(text) {
  const tags = text
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== '')
  return [...new Set(tags)]
}
```

`split(',')` cuts the text at the commas, `map` tidies up every piece (no spaces around it, lowercase), and `filter`
drops the empty ones (two commas in a row give one). A [[Set]] (lesson 3) holds every value only once, so
`[...new Set(tags)]` is the array without repeats.

The form gets a "Tags" field. When it saves, `parseTags` turns the text into an array. Replace
`src/components/PostForm.jsx`:

```jsx file=src/components/PostForm.jsx mark=2,43,95-99
import { useState } from 'react'
import { parseTags } from '../posts.js'
import Markdown from './Markdown.jsx'

// The rules of a post. The answer: a message for every field that is not right yet.
function validate(values) {
  const errors = {}
  if (values.title.trim().length < 3) errors.title = 'The title needs at least 3 characters.'
  if (values.author.trim() === '') errors.author = 'Who wrote it? Type a name.'
  if (values.body.trim().length < 20) errors.body = 'The post needs at least 20 characters.'
  return errors
}

function PostForm({ initialValues, submitLabel, cancelHref, onSave }) {
  const [values, setValues] = useState(initialValues)
  const [showErrors, setShowErrors] = useState(false) // true after the first try to save
  const [preview, setPreview] = useState(false) // writing the text, or looking at its preview?
  const [status, setStatus] = useState('editing') // 'editing', 'saving' or 'error'

  // A derived value: the rules are checked again at every drawing.
  const errors = validate(values)
  // The messages are shown only after the first try to save.
  const shown = showErrors ? errors : {}

  // One function for every field: the name of the field tells which value changes.
  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // the page saves the post itself: no reload
    if (Object.keys(errors).length > 0) {
      setShowErrors(true)
      return
    }
    setStatus('saving')
    try {
      // The page decides what saving means: creating a new post, or updating one.
      await onSave({
        title: values.title.trim(),
        author: values.author.trim(),
        body: values.body.trim(),
        tags: parseTags(values.tags),
      })
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">Title</span>
        <input name="title" value={values.title} onChange={handleChange} aria-invalid={Boolean(shown.title)} />
        {shown.title && <span className="field__error">{shown.title}</span>}
      </label>

      <label className="field">
        <span className="field__label">Author</span>
        <input name="author" value={values.author} onChange={handleChange} aria-invalid={Boolean(shown.author)} />
        {shown.author && <span className="field__error">{shown.author}</span>}
      </label>

      <div className="field">
        <div className="field__bar">
          <label className="field__label" htmlFor="post-body">
            Text (Markdown)
          </label>
          <div className="tabs">
            <button type="button" className="tab" aria-pressed={!preview} onClick={() => setPreview(false)}>
              Write
            </button>
            <button type="button" className="tab" aria-pressed={preview} onClick={() => setPreview(true)}>
              Preview
            </button>
          </div>
        </div>
        {preview ? (
          <div className="preview">
            <Markdown text={values.body} />
          </div>
        ) : (
          <textarea
            id="post-body"
            name="body"
            rows={14}
            value={values.body}
            onChange={handleChange}
            aria-invalid={Boolean(shown.body)}
          />
        )}
        {shown.body && <span className="field__error">{shown.body}</span>}
      </div>

      <label className="field">
        <span className="field__label">Tags</span>
        <input name="tags" value={values.tags} onChange={handleChange} placeholder="react, markdown" />
        <span className="field__hint">Separate the tags with commas.</span>
      </label>

      {status === 'error' && (
        <p className="alert" role="alert">
          The post could not be saved. Please try again.
        </p>
      )}

      <div className="actions">
        <button type="submit" className="button button--primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : submitLabel}
        </button>
        <a className="button" href={cancelHref}>
          Cancel
        </a>
      </div>
    </form>
  )
}

export default PostForm
```

The form now expects a `tags` text among its starting values, so both pages have to give it one. In
`src/pages/NewPostPage.jsx`, the empty post gets an empty `tags`:

```jsx file=src/pages/NewPostPage.jsx
const EMPTY_POST = { title: '', author: '', body: '', tags: '' }
```

In `src/pages/EditPostPage.jsx`, the post's tags array becomes one text again, with `join`. Replace the
`initialValues` line of the `PostForm`:

```jsx file=src/pages/EditPostPage.jsx
        initialValues={{ title: post.title, author: post.author, body: post.body, tags: (post.tags ?? []).join(', ') }}
```

:::check Check
Log in as Sam, and edit "Why this blog uses hash routes": the "Tags" field says `react, routing`. Add `, Tips , react`
to it, and save: the post has three tags, `#react`, `#routing` and `#tips`, in lowercase and without the second
`react`. Write a new post with the tag `café`, then click its tag: "Posts tagged #café", although the address bar may
show the coded form, `caf%C3%A9`.
:::

:::mistake Common mistake
Leaving `tags: ''` out of `EMPTY_POST`. Then `values.tags` is `undefined`. If you type into the "Tags" field, React
warns in the console that an uncontrolled input became controlled. If you leave it empty, `parseTags` throws at
"Publish" ("Cannot read properties of undefined (reading 'split')"), the `catch` catches it, and the form says "The
post could not be saved. Please try again.", although the server is fine. Every field of a form needs a starting
value.
:::

### Search

The last piece of the list: a search box. Search in one sentence: show the posts in which every word you typed
appears, in the title, the text or the tags. Add `matchesSearch` to the end of `src/posts.js`:

```js file=src/posts.js
// Does every word of the search appear in the post's title, text or tags? Capital letters do not count.
export function matchesSearch(post, query) {
  const text = `${post.title} ${post.body} ${(post.tags ?? []).join(' ')}`.toLowerCase()
  const words = query.toLowerCase().split(' ').filter((word) => word !== '')
  return words.every((word) => text.includes(word))
}
```

The [[template literal]] glues the title, the text and the tags into one long text, and both it and the search are
turned into lowercase, so `React` finds `react`. [[every]] is true when its function is true for **every** item of
the array. For an empty array it is true as well: an empty search box shows every post.

The search is one more derived value in the list: the tag filter goes first, then the search. The text of the box is
state, because the user changes it. Replace `src/pages/ListPage.jsx`:

```jsx file=src/pages/ListPage.jsx mark=1,3,11,16,38-41,53-54,56
import { useState } from 'react'
import { api } from '../api.js'
import { matchesSearch, newestFirst } from '../posts.js'
import useRequest from '../useRequest.js'
import PostCard from '../components/PostCard.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ListPage({ author, tag }) {
  // []: the list is loaded once, when the page appears.
  const { status, data, reload } = useRequest(() => api.list('posts'), [])
  const [query, setQuery] = useState('')
  // Worked out from the server's answer at every drawing: derived values, not state.
  const posts = status === 'success' ? newestFirst(data) : []
  // Posts written before tags existed have none: ?? [] stands in for them.
  const tagged = tag ? posts.filter((post) => (post.tags ?? []).includes(tag)) : posts
  const shown = tagged.filter((post) => matchesSearch(post, query))

  function restoreSamples() {
    api.reset() // the pretend server forgets every change, and starts again from its seed
    reload()
  }

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">{tag ? `Posts tagged #${tag}` : 'All posts'}</h1>
        {author && (
          <a className="button button--primary" href="#/new">
            + New post
          </a>
        )}
      </div>
      {tag && (
        <a className="back" href="#/">
          ← All posts
        </a>
      )}
      <label className="search">
        <span className="visually-hidden">Search the posts</span>
        <input type="search" placeholder="Search…" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {status === 'loading' && <p className="state">Loading posts…</p>}
      {status === 'error' && <ErrorMessage text="The posts could not be loaded." onRetry={reload} />}
      {status === 'success' && posts.length === 0 && (
        <div className="state">
          <p>No posts yet.</p>
          <button type="button" className="button" onClick={restoreSamples}>
            Bring back the sample posts
          </button>
        </div>
      )}
      {posts.length > 0 && tagged.length === 0 && <p className="state">No post has this tag.</p>}
      {tagged.length > 0 && shown.length === 0 && <p className="state">No post matches “{query}”.</p>}
      {shown.length > 0 && (
        <ul className="post-list">
          {shown.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ListPage
```

- `type="search"` is a text field made for searching: in many browsers it gets a small ✕ that empties it, and on
  phones the keyboard shows a "search" key.
- The text of the `<label>` ("Search the posts") is there for screen readers; on the screen, the placeholder says
  enough. The `visually-hidden` class of `App.css` hides it from the eyes only.
- There is no request and no waiting here. In lesson 20 every keystroke would have been a request to the server, so
  `useDebounce` waited for a pause. Here the posts are already in the page, and filtering four (or four hundred) posts
  takes no time: the list follows every keystroke.

:::check Check
Type `react` into the search box: the cards that do not mention React disappear while you type. `REACT` does the same.
`markdown preview` finds only the Markdown post: both words are in it. On a tag page, the search looks only among the
posts of that tag. `xyz` says "No post matches “xyz”." The ✕ at the end of the box (or deleting the text) brings every
post back.
:::

:::try Try it
The search does not forgive missing accents yet: `cafe` does not find `café`. Lesson 11's `normalize` function has
already solved this: `text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()` takes the accents off the letters
and makes them lowercase. Copy it into `posts.js` as `simplify` (so it is not mixed up with the built-in
`normalize`), and use it on both the text and the search.
:::

### A title and a description for every page (SEO)

[[SEO]] (search engine optimization) is everything that helps search engines understand a page and helps people find it.
The two most important things are in the `<head>` of the page: the `<title>`, which a search engine shows as the
headline of a result (and the browser on the tab, in the history and in bookmarks), and the description, a
[[meta tag]] whose text appears under that headline. `index.html` has both, but they are the same on every
page: on a post's page the tab still says only "The Peacock Journal".

A component can set them in an effect: `document.title` is the title of the page, and
`document.querySelector('meta[name="description"]')` finds the description in the `<head>`. This is work outside
drawing, and every page will need it, so it becomes a custom hook. Create `src/usePageMeta.js`:

```js file=src/usePageMeta.js
import { useEffect } from 'react'

const SITE_NAME = 'The Peacock Journal'
const SITE_DESCRIPTION = 'Notes on React, writing and the web.'

// Sets the title of the browser tab, and the description that search engines show under it.
// An empty title gives the blog's name alone.
function usePageMeta(title, description = SITE_DESCRIPTION) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}

export default usePageMeta
```

`setAttribute` changes an attribute of an element in the page, here the `content` of the description. The `?.` calls
it only if the element exists. On the list, the title is the blog's name, or the tag on a tag page. In
`src/pages/ListPage.jsx`, import the hook:

```jsx file=src/pages/ListPage.jsx
import usePageMeta from '../usePageMeta.js'
```

and call it right after the `useState` line of the search:

```jsx file=src/pages/ListPage.jsx mark=2
  const [query, setQuery] = useState('')
  usePageMeta(tag ? `#${tag}` : '')
```

On a post's page, the title is the post's title, and the description is its excerpt. Here is the whole
`src/pages/PostPage.jsx`:

```jsx file=src/pages/PostPage.jsx mark=2,4,15-16
import { api } from '../api.js'
import { canEdit, excerpt, formatDate } from '../posts.js'
import useRequest from '../useRequest.js'
import usePageMeta from '../usePageMeta.js'
import ErrorMessage from '../components/ErrorMessage.jsx'
import Markdown from '../components/Markdown.jsx'
import DeleteButton from '../components/DeleteButton.jsx'
import CommentSection from '../components/CommentSection.jsx'
import TagList from '../components/TagList.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function PostPage({ id, author }) {
  // A new id means a new post: deps say when to send the request again.
  const { status, data: post, error, reload } = useRequest(() => api.get('posts', id), [id])
  // A hook, so it comes before the early returns. Until the post arrives, the tab shows the blog's name.
  usePageMeta(post ? post.title : '', post ? excerpt(post.body) : undefined)

  if (status === 'loading') return <p className="state">Loading the post…</p>
  if (status === 'error') {
    // 404: the server has no post with this id. Any other error may go away if we try again.
    if (error.status === 404) return <NotFoundPage text="This post does not exist (any more)." />
    return <ErrorMessage text="The post could not be loaded." onRetry={reload} />
  }

  return (
    <>
      <article className="post">
        <a className="back" href="#/">
          ← All posts
        </a>
        <header className="post__header">
          <h1 className="post__title">{post.title}</h1>
          <p className="meta">
            by {post.author} · <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            {post.updatedAt && <> · updated {formatDate(post.updatedAt)}</>}
          </p>
          <TagList tags={post.tags ?? []} />
        </header>
        <Markdown text={post.body} />
        {canEdit(post, author) && (
          <footer className="post__actions">
            <a className="button" href={`#/edit/${id}`}>
              Edit
            </a>
            <DeleteButton id={id} />
          </footer>
        )}
      </article>
      <CommentSection postId={id} author={author} />
    </>
  )
}

export default PostPage
```

When `description` is `undefined`, the hook uses its default parameter, the blog's own description. And the page for
addresses that do not exist says so on its tab too. Replace `src/pages/NotFoundPage.jsx`:

```jsx file=src/pages/NotFoundPage.jsx mark=1,5
import usePageMeta from '../usePageMeta.js'

// For an address that belongs to no page. text tells what went wrong; it has a default.
function NotFoundPage({ text = 'There is nothing at this address.' }) {
  usePageMeta('Page not found')

  return (
    <section className="state">
      <h1 className="page__title">Page not found</h1>
      <p>{text}</p>
      <a className="button" href="#/">
        ← All posts
      </a>
    </section>
  )
}

export default NotFoundPage
```

:::check Check
Open "Writing posts in Markdown": the browser tab says "Writing posts in Markdown · The Peacock Journal". In DevTools →
**Elements**, open `<head>`: the `content` of `<meta name="description">` is the beginning of the post. Back on the
list, the tab says "The Peacock Journal" again, and on a tag page "#markdown · The Peacock Journal". Press and hold the
browser's Back button (or right-click it): the history lists the pages by their titles. `#/hello` gives "Page not found
· The Peacock Journal". Congratulations, your blog is done!
:::

:::concept What search engines see, and what they do not
The title and the description are a good start, but the rest of the HTML matters too: one `<h1>` on every page (this is why
Markdown's `#` became an `<h2>`), headings in order, `<time>` with `dateTime`, and `alt` texts on pictures. But this
blog has two weak points. First, the HTML that the server sends is nearly empty, a `<div id="root">`; the posts
appear only after JavaScript has run. Google does run JavaScript, but later and not always, and the link previews of
chat apps do not run it at all. Second, everything after the `#` is invisible to search engines: for them, the whole
blog is one single page. Real blogs therefore use real paths (`/post/welcome`, like React Router's `BrowserRouter`),
and make the HTML of every page on the server ([[server-side rendering]]) or ahead of time, when the site is built
([[static site generation]]): frameworks such as Next.js or Astro do this. They also publish a `sitemap.xml`, the list
of every page, and [[Open Graph]] tags (`og:title`, `og:image`) for the previews.
:::

:::try Task
Give the other pages a title too: `usePageMeta('New post')` in `NewPostPage`, `usePageMeta('Edit post')` in
`EditPostPage` (at the top, before the early returns), and `usePageMeta('Log in')` in `LoginPage`. Then, in DevTools,
run Lighthouse (lesson 1) on a post's page, with only the **SEO** category ticked.
:::
