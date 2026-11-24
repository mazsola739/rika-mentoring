# What we build

A reading list of your own: every book sits on one of three shelves, "Want to read", "Reading" and "Read", and moves
to another one with a click. New books come from a search: you type a title, an author or a topic, and the app asks
the lesson's own book [[API]] for matching books, with covers. In the advanced level you rate the books you have
finished, write notes, set a reading goal for the year and see your statistics, and finally you log in, so your shelves
are saved in your account on a (pretend) server, the way real apps keep them for all your devices.

On the way you learn how an app talks to an API: how to send a request with `fetch`, how to show loading, errors and
"nothing found", how to turn the API's data into the shape your app uses, and how to keep one list of books that
several views (shelves, search results, statistics) read at the same time.

:::levels
- Your own book list: title, author and a reading status you can change, saved in the browser. | about 2 hours
- Book search through the lesson's own book API with `fetch` and a `useFetch` hook, three shelves, moving books between them. | about 3 hours
- Star ratings and notes, a reading goal with statistics, a login and your shelves saved on the server. | about 4 hours
:::

**Before you start you need:** the lessons before this one. We build mostly on these: lists with `map` and `key`,
controlled form fields, adding, changing and deleting items with `map` and `filter`, and the `useLocalStorage` hook
(lessons 6 and 9–11); `async`/`await`, `try/catch` and effects with a cleanup function (lessons 3 and 12); `fetch`,
loading and error states and a `useFetch` hook (lessons 14 and 20). Whatever we recall gets a sentence or two of
explanation again; everything new is explained step by step.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is in the course's repository, in the `lessons/21-book-library/exercise` folder (the
"Exercise on GitHub" button above opens this folder on GitHub). You start the same way as in lesson 1, and its step 0
explains every command in detail. In short: open a terminal in your work folder, where the `rika-mentoring` repository
is, bring in the new lessons, then copy this lesson's `exercise` folder out of the repository as `book-library`:

```shell
cd rika-mentoring
git pull        # brings the new lessons
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/21-book-library/exercise book-library
```

No repository yet? Run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the first three lines.
No git? On the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**,
and copy the `lessons/21-book-library/exercise` folder out of it into your work folder as `book-library`. The `cp -r`
command works in PowerShell, on a Mac and on Linux; a file manager works too: copy the folder and rename the copy. You
work in your copy: the repository stays untouched, so `git pull` keeps working.

Open the `book-library` folder in your editor, and type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite, MSW)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). On a light grey page you see a dark green
band with the title "Book Library" and the line "Your books, on your own shelves." Nothing else yet: the books are
your job.
:::

Finally, make your copy a git repository with one commit, the starting point. `npm run dev` keeps the first terminal
busy, so open a second one in the editor, in the `book-library` folder:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step that
works.

The exercise has more files than usual. These are the ones that matter:

- `src/App.jsx`: the page. For now it only shows the green band; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so you do not write styles:
  you only use the class names (`panel`, `book`, `results`, `shelf-tabs`, …) that the steps give you.
- `src/main.jsx`: before it draws the app, it starts a **pretend server**, as in lessons 14 and 20. From the
  intermediate level on, the app asks it for books, as if it were a real book API on the internet.
- `src/mocks/`: the pretend server itself. `handlers.js` lists what the book API can answer, `catalogue.js` holds its
  sample books, and `accounts.js` is a small account service for the advanced level. You can read them, but you do not
  have to change anything in them.
- `public/mockServiceWorker.js`: a helper script of the pretend server. Do not edit it.

:::concept A quick recap
A [[component]] is a function that returns [[JSX]], the HTML-like description of what should appear on the screen. It
gets data from outside through its [[props]], and remembers things with [[useState]]: when a state value changes, React
draws the component again. Work that is not drawing, saving for example, goes into a [[useEffect]]. A [[custom hook]]
is a function whose name starts with `use` and that calls other hooks, like `useLocalStorage` in lessons 9–11. If any
of these feels unfamiliar, go back to the lessons listed under "Before you start you need".
:::

### A list from an array

A book has four pieces of data: an [[ID]] (`id`), its title (`title`), its author (`author`) and its reading status
(`status`). So each book is an [[object]], and the list is an [[array]] of objects.

The status is one of three things: you want to read the book, you are reading it, or you have read it. We do not store
the long text ("Want to read"), only a short, fixed key: `'want'`, `'reading'` or `'read'`. Keys like these are easy to
compare in code (`book.status === 'read'`), and they stay the same even if you rename "Read" to "Finished" one day.
Which text belongs to which key is kept in one place. Create the `src/statuses.js` file:

```js file=src/statuses.js
// The three reading statuses. The key (want, reading, read) is saved with the book, the text is what we show.
export const STATUSES = {
  want: 'Want to read',
  reading: 'Reading',
  read: 'Read',
}
```

`export const` is a [[named export]]: another file loads it by name, in curly brackets. Showing one book gets a
component of its own. Create a `components` folder inside `src`, with a `BookItem.jsx` file in it:

```jsx file=src/components/BookItem.jsx mark=1,9
import { STATUSES } from '../statuses.js'

function BookItem({ book }) {
  return (
    <li className="book">
      <div className="book__body">
        <strong className="book__title">{book.title}</strong>
        <span className="book__author">{book.author}</span>
        <span className={`badge badge--${book.status}`}>{STATUSES[book.status]}</span>
      </div>
    </li>
  )
}

export default BookItem
```

- `'../statuses.js'`: the file is in the `components` folder, so `..` first steps up one folder, into `src`.
- `STATUSES[book.status]` reads a key whose name is in a variable: if `book.status` is `'reading'`, it is the same as
  `STATUSES.reading`, that is, "Reading". You used this square-bracket form in lesson 3.
- The label gets two classes: `badge`, and one that depends on the status, for example `badge--read`. The second one
  colours it (yellow, blue or green, all in `App.css`). The backticks make a [[template literal]] (you know it from
  lesson 1), a piece of text with a value built into it at `${…}`.

Now replace the whole of `src/App.jsx` with this:

```jsx file=src/App.jsx mark=1,4-9,19-26
import BookItem from './components/BookItem.jsx'
import './App.css'

// A few books to start with, so the list is not empty.
const START_BOOKS = [
  { id: 1, title: 'The Hobbit', author: 'J. R. R. Tolkien', status: 'read' },
  { id: 2, title: 'Dune', author: 'Frank Herbert', status: 'reading' },
  { id: 3, title: 'Little Women', author: 'Louisa May Alcott', status: 'want' },
]

function App() {
  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>Your books, on your own shelves.</p>
      </header>

      <section className="panel">
        <h2>My books</h2>
        <ul className="book-list">
          {START_BOOKS.map((book) => (
            <BookItem key={book.id} book={book} />
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
```

`map` calls the function for every book of the array, and the `<BookItem>` elements it returns become the list, as in
lessons 9–11. The [[key]] is how React recognises the rows when the list changes, so it needs a value that belongs to
that one book and never changes: its ID.

:::check Check
Under the green band a white card appears, titled "My books", with three books in it. Under each title there is the
author and a coloured label: The Hobbit has a green "Read", Dune a blue "Reading", Little Women a yellow "Want to read".
:::

:::mistake Common mistake
`key` is left out. The list still shows, but the console (++F12++ → Console) warns: `Each child in a list should have
a unique "key" prop`. Without keys React can only tell the rows apart by their position, so once books start moving
around, it may keep a row's state on the wrong book.
:::

:::try Try it
Add a fourth book to `START_BOOKS` with `id: 4` and a status of your choice. Then try a status that does not exist,
for example `'lost'`: the label stays empty and has no colour, because `STATUSES.lost` is `undefined`. Set it back to a
real one.
:::

### Adding a book

New books are typed into a form. Its fields are [[controlled inputs|controlled input]], as ever since the contact
form of lesson 1: the value comes from state, and every key press updates the state. Create the
`src/components/AddBookForm.jsx` file:

```jsx file=src/components/AddBookForm.jsx
import { useState } from 'react'

function AddBookForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (title.trim() === '') return
    onAdd({ id: crypto.randomUUID(), title: title.trim(), author: author.trim() })
    setTitle('')
    setAuthor('')
  }

  return (
    <form className="panel add-book" onSubmit={handleSubmit}>
      <h2>Add a book</h2>
      <div className="add-book__fields">
        <label className="field">
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          Author
          <input value={author} onChange={(event) => setAuthor(event.target.value)} />
        </label>
      </div>
      <button type="submit" className="button button--primary" disabled={title.trim() === ''}>
        Add book
      </button>
    </form>
  )
}

export default AddBookForm
```

- `event.preventDefault()` stops the browser's [[default behavior]]: without it, sending a form reloads the page.
- `trim()` cuts the spaces off both ends of the text, so a title made of spaces only counts as empty. The button is
  `disabled` while the title is empty, and then even ++Enter++ in a field does not send the form. `handleSubmit` still
  checks once more, just to be safe: so it stays right even if you change the button one day.
- `crypto.randomUUID()`, which you know from lesson 6, makes a [[UUID]]: a long, random ID that no other book will
  ever get.
- The form does not know where the books are kept. It hands the new book over to its parent through the `onAdd` prop,
  and the parent decides what to do with it.

The books now change while the page is in use, so they go into the state of `App`. This is [[lifting state up]]: the
list lives in `App`, because `App` draws it, and the form sends its new books there too. Replace `src/App.jsx` with
this:

```jsx file=src/App.jsx mark=1-2,14,16-19,31,37
import { useState } from 'react'
import AddBookForm from './components/AddBookForm.jsx'
import BookItem from './components/BookItem.jsx'
import './App.css'

// A few books to start with, so the list is not empty.
const START_BOOKS = [
  { id: 1, title: 'The Hobbit', author: 'J. R. R. Tolkien', status: 'read' },
  { id: 2, title: 'Dune', author: 'Frank Herbert', status: 'reading' },
  { id: 3, title: 'Little Women', author: 'Louisa May Alcott', status: 'want' },
]

function App() {
  const [books, setBooks] = useState(START_BOOKS)

  function handleAdd(book) {
    // A new array: the new book first, with the status "want", then all the old ones.
    setBooks([{ ...book, status: 'want' }, ...books])
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>Your books, on your own shelves.</p>
      </header>

      <section className="panel">
        <h2>My books</h2>
        <ul className="book-list">
          {books.map((book) => (
            <BookItem key={book.id} book={book} />
          ))}
        </ul>
      </section>

      <AddBookForm onAdd={handleAdd} />
    </main>
  )
}

export default App
```

`{ ...book, status: 'want' }` is the [[spread]] you know: a new object with every field of `book` (`id`, `title`,
`author`), plus a `status`. Every new book starts with the status "Want to read". `[…, ...books]` is a new array with
the new book first and the old ones after it. We never change the old array: React notices a change only if it gets a
new array. This is an [[immutable update]].

:::check Check
Type a title and an author, and click "Add book" (or press ++Enter++): the book appears at the top of the list with a
yellow "Want to read" label, and the fields are empty again. While the title field is empty, the button is grey and
cannot be clicked. Reload the page: your new book is gone. Step 4 fixes that.
:::

:::mistake Common mistake
`books.push(newBook)` and then `setBooks(books)`. Nothing appears: `push` changes the old array itself, so React gets
the same array it already had, and thinks there is nothing to draw again. Always give `setBooks` a new array.
:::

:::try Try it
Add a book with no author. The line under its title stays empty; the next step puts "Unknown author" there.
:::

### Changing the status, and removing

The status should be changeable in the list. A [[drop-down list]] (`<select>`) fits it well: three options, one of
them chosen. Like an `<input>`, it can be a controlled field: `value` says which option is chosen, and `onChange`
reports a new choice. Next to it comes a "Remove" button. Replace `src/components/BookItem.jsx` with this:

```jsx file=src/components/BookItem.jsx mark=3,8,10-29
import { STATUSES } from '../statuses.js'

function BookItem({ book, onStatusChange, onRemove }) {
  return (
    <li className="book">
      <div className="book__body">
        <strong className="book__title">{book.title}</strong>
        <span className="book__author">{book.author || 'Unknown author'}</span>
        <div className="book__actions">
          <select
            className="book__status"
            aria-label={`Status of ${book.title}`}
            value={book.status}
            onChange={(event) => onStatusChange(book.id, event.target.value)}
          >
            {Object.entries(STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button button--small button--danger"
            aria-label={`Remove ${book.title}`}
            onClick={() => onRemove(book.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}

export default BookItem
```

- `book.author || 'Unknown author'`: the `||` gives its left side if that is "truthy", and its right side if not. An
  empty text counts as false, so a book with no author shows "Unknown author".
- The options are not typed out three times: [[Object.entries]] turns the `STATUSES` object into an array of
  pairs. Each pair is a small array of a key and its text: `['want', 'Want to read']`, then `['reading', 'Reading']`,
  then `['read', 'Read']`. In the `map` function, `([value, label])` takes each pair apart into two variables. This is array [[destructuring]], the same as in every
  `useState` line.
- The option's `value` is the key, its text is the label. So `event.target.value` is a key too, for example `'read'`.
- `aria-label` gives the drop-down list and the button a name for screen readers. Without it every row would have a
  list with no name and a button called just "Remove", and a blind user could not tell which book they belong to.
- The badge is gone: the drop-down list shows the status itself.

`BookItem` reports what happened through two props; `App` does the work. Replace `src/App.jsx` with this:

```jsx file=src/App.jsx mark=21-24,26-29,40-48
import { useState } from 'react'
import AddBookForm from './components/AddBookForm.jsx'
import BookItem from './components/BookItem.jsx'
import './App.css'

// A few books to start with, so the list is not empty.
const START_BOOKS = [
  { id: 1, title: 'The Hobbit', author: 'J. R. R. Tolkien', status: 'read' },
  { id: 2, title: 'Dune', author: 'Frank Herbert', status: 'reading' },
  { id: 3, title: 'Little Women', author: 'Louisa May Alcott', status: 'want' },
]

function App() {
  const [books, setBooks] = useState(START_BOOKS)

  function handleAdd(book) {
    // A new array: the new book first, with the status "want", then all the old ones.
    setBooks([{ ...book, status: 'want' }, ...books])
  }

  function handleStatusChange(id, status) {
    // A new array in which only this one book is replaced, by a copy with the new status.
    setBooks(books.map((book) => (book.id === id ? { ...book, status } : book)))
  }

  function handleRemove(id) {
    // A new array with every other book.
    setBooks(books.filter((book) => book.id !== id))
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>Your books, on your own shelves.</p>
      </header>

      <section className="panel">
        <h2>My books</h2>
        {books.length === 0 ? (
          <p className="empty">Your list is empty. Add your first book below!</p>
        ) : (
          <ul className="book-list">
            {books.map((book) => (
              <BookItem key={book.id} book={book} onStatusChange={handleStatusChange} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </section>

      <AddBookForm onAdd={handleAdd} />
    </main>
  )
}

export default App
```

These are the two patterns you used for the to-do list in lesson 9. `map` makes a new array of the same length: the
book with the given ID is replaced by a copy (`{ ...book, status }` is short for `{ ...book, status: status }`), every
other book stays as it was. [[filter]] keeps the books for which the function returns `true`: here every book except
the one with the given ID. If no book is left, a message shows instead of the empty list: a [[ternary operator]]
chooses between the two.

:::check Check
Each book has a drop-down list and a "Remove" button with red text. Set Dune to "Read": the list keeps your choice. Remove
all three books: "Your list is empty. Add your first book below!" appears. A reload still brings the three samples
back.
:::

:::mistake Common mistake
`===` instead of `!==` in `handleRemove`: `books.filter((book) => book.id === id)`. Click "Remove" on one book, and
every **other** book disappears: the filter kept only the one you wanted to get rid of. `filter` keeps what you
describe, so describe the books that stay.
:::

:::try Try it
Show how many books you have in the title of the card: `<h2>My books ({books.length})</h2>`.
:::

### Saving in the browser: useLocalStorage

The list should survive a reload. In lessons 9–11 you wrote a `useLocalStorage` [[custom hook]] for exactly this: it
works like `useState`, but it also keeps the value in [[localStorage]] as [[JSON]] text, and reads it back on the next
visit. If you kept yours, copy it into `src`; if not, create the `src/useLocalStorage.js` file:

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

A short reminder of how it works: the function given to `useState` runs only on the first render (a
[[lazy initial state]]), and reads the saved text back with `JSON.parse`. The effect runs after every change of `value`
(that is what the [[dependency array]] says), and saves it with `JSON.stringify`. `try/catch` keeps the page alive if
the browser blocks storage, or if the saved text is broken.

In `App`, only two lines change: the import, and the line of the books. Here is the whole file, as it looks at the end
of the beginner level:

```jsx file=src/App.jsx mark=1,14
import useLocalStorage from './useLocalStorage.js'
import AddBookForm from './components/AddBookForm.jsx'
import BookItem from './components/BookItem.jsx'
import './App.css'

// A few books to start with, so the list is not empty.
const START_BOOKS = [
  { id: 1, title: 'The Hobbit', author: 'J. R. R. Tolkien', status: 'read' },
  { id: 2, title: 'Dune', author: 'Frank Herbert', status: 'reading' },
  { id: 3, title: 'Little Women', author: 'Louisa May Alcott', status: 'want' },
]

function App() {
  const [books, setBooks] = useLocalStorage('book-library-books', START_BOOKS)

  function handleAdd(book) {
    // A new array: the new book first, with the status "want", then all the old ones.
    setBooks([{ ...book, status: 'want' }, ...books])
  }

  function handleStatusChange(id, status) {
    // A new array in which only this one book is replaced, by a copy with the new status.
    setBooks(books.map((book) => (book.id === id ? { ...book, status } : book)))
  }

  function handleRemove(id) {
    // A new array with every other book.
    setBooks(books.filter((book) => book.id !== id))
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>Your books, on your own shelves.</p>
      </header>

      <section className="panel">
        <h2>My books</h2>
        {books.length === 0 ? (
          <p className="empty">Your list is empty. Add your first book below!</p>
        ) : (
          <ul className="book-list">
            {books.map((book) => (
              <BookItem key={book.id} book={book} onStatusChange={handleStatusChange} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </section>

      <AddBookForm onAdd={handleAdd} />
    </main>
  )
}

export default App
```

`useState` is no longer imported: `App` calls the custom hook, and `useState` works inside it. Everything else stays
the same, because `useLocalStorage` gives back the same pair as `useState`.

:::check Check
Add a book, change a status, remove a book, then reload the page (++F5++): everything is as you left it. In the
developer tools (++F12++ → Application → Local storage → `http://localhost:5173`) you find the `book-library-books`
key, with your list as JSON next to it. The beginner level is done: commit it!
:::

:::mistake Common mistake
A key that another app also uses, for example just `'books'`. Every project you run at `http://localhost:5173` shares
the same localStorage, so an earlier lesson's data could turn up in your list, or the other way round. That is why
the key starts with the app's name: `book-library-books`.
:::

:::try Try it
Delete the `book-library-books` key in the developer tools (right click → Delete) and reload: the three samples are
back.
:::

## Intermediate level {level=2}

### The first request to the book API

So far every book was typed in by hand. From now on they can come from a catalogue: an [[API]] that knows many books,
and answers questions about them. You know how this goes from the exchange rates of lesson 14 and the TV series of
lesson 20: the app sends a request to an address, and the [[server]] sends back an answer, usually as [[JSON]]. The
address of a search looks like this:

```text
/api/books/search?q=verne
```

The part after the `?` is the [[query string]]. It holds named values for the server, the
[[query parameters|query parameter]]: here only `q` (short for query), the text we are searching for. One address of
an API, together with what it does, is an [[endpoint]]. The lesson's book API has
these (`src/mocks/handlers.js` describes them in its first lines):

- `GET /api/books/search?q=…`: a search by title, author, topic or year.
- `GET /api/books/bk018`: one book in detail (we do not need it in this lesson).
- `GET /api/covers/7018-M.svg`: the cover of a book, as a picture.

`GET` is the [[HTTP method]] of a request that only asks for something and changes nothing. The answer to a search is
an object like this (shortened):

```json
{
  "q": "verne",
  "numFound": 3,
  "start": 0,
  "page": 1,
  "limit": 12,
  "docs": [
    {
      "key": "/books/bk019",
      "title": "Around the World in Eighty Days",
      "author_name": ["Jules Verne"],
      "first_publish_year": 1872,
      "cover_i": 7019
    }
  ]
}
```

`numFound` is the number of books found, and `docs` (documents) is the array of the books themselves. Real catalogue
APIs on the internet answer in this style; ours copies the field names of a well-known one.

:::concept Where does the answer come from? The pretend server again
As in lessons 14 and 20, there is no server on the internet behind the API: `src/main.jsx` starts [[Mock Service
Worker]] (MSW) before it draws the app. Its [[service worker]], a small script the browser runs next to the page,
catches every request to `/api/…`, and the functions in `src/mocks/handlers.js` answer it from the sample catalogue in
`catalogue.js`, after a short, random wait, like a real server on the other side of the world. Your code cannot tell
the difference: it sends real requests and gets real answers. Every other request (the page itself, the scripts, the
styles) goes through untouched.
:::

The search gets a component of its own. Create the `src/components/SearchPanel.jsx` file:

```jsx file=src/components/SearchPanel.jsx mark=7-15,35-44
import { useState } from 'react'

function SearchPanel() {
  const [text, setText] = useState('') // what is in the search box
  const [data, setData] = useState(null) // the API's last answer

  async function handleSubmit(event) {
    event.preventDefault()
    const query = text.trim()
    if (query === '') return
    // encodeURIComponent makes the text safe for an address: "jules verne" → "jules%20verne"
    const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`)
    const answer = await response.json()
    setData(answer)
  }

  return (
    <section className="panel search">
      <h2>Search the catalogue</h2>
      <form className="search__form" role="search" onSubmit={handleSubmit}>
        <label className="field">
          Title, author or topic
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="e.g. Verne, dragons, Dune"
          />
        </label>
        <button type="submit" className="button button--primary">
          Search
        </button>
      </form>

      {data && (
        <>
          <p className="search__status">Results: {data.numFound}</p>
          <ul>
            {data.docs.map((doc) => (
              <li key={doc.key}>{doc.title}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default SearchPanel
```

`handleSubmit` sends the request the same way as in lessons 14 and 20. In short:

- `fetch(address)` sends the request. The answer does not arrive at once, so `fetch` gives back a [[Promise]], and
  `await` waits for it inside the [[async function]].
- What arrives first is a `Response` object: the status code (for example 200) and a few details about the answer.
  The content itself, the **body** of the answer (here the JSON text), is still on its way, so `response.json()` is
  another Promise, and needs another `await`. It reads the body, and turns the JSON text into a JavaScript object.
- `encodeURIComponent` does the [[URL encoding]]: some characters (a space, `&`, `?`, `#`) have a special meaning in an
  address, or cannot be in one at all. It writes them in a safe form, so a search for "Tom & Jerry" does not break the
  address in two.
- `{data && (…)}` draws the results only once there is an answer: before the first search `data` is `null`. The
  `<>…</>` [[Fragment]] holds the two elements together without adding an extra element to the page.
- `role="search"` tells screen readers that this form is a search.

Now put the search panel on the page. In `src/App.jsx` add the import at the top, and the component right under the
header (the rest of the file stays as it is):

```jsx file=src/App.jsx mark=1,10
import SearchPanel from './components/SearchPanel.jsx'
// … the other imports, START_BOOKS and the functions of App, as before

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>Your books, on your own shelves.</p>
      </header>
      <SearchPanel />

      {/* … the "My books" card and the form, as before … */}
```

:::check Check
A "Search the catalogue" card appears above your list. Search for `verne`: after a moment "Results: 3" appears, with
three titles under it. Try `dragons`, `1984` or `jokai` (accents do not matter). Then open the developer tools
(++F12++ → Network), and search again: a new row appears, `search?q=…`. Click it: the Response tab shows the JSON the
API sent, and the Size column says "(ServiceWorker)": the answer came from the pretend server.
:::

:::mistake Common mistake
The second `await` is left out: `const answer = response.json()`. The page goes blank, and the console says `Cannot
read properties of undefined (reading 'map')`. `answer` is then a Promise, not the data: it has no `numFound` and no
`docs`. Every Promise needs an `await` (or a `then`) before you can use what is inside.
:::

:::try Try it
You can ask the API in the console too (++F12++ → Console): type
`await (await fetch('/api/books/search?q=austen')).json()` and press ++Enter++. Open the object it prints, and look at
the fields of a book in `docs`.
:::

### Turning the API's data into our own shape

The books of the API do not look like ours. Ours have `id`, `title`, `author`; the API's have `key` (with a `/books/`
in front of the ID), `author_name` (an array, because a book can have more authors), `first_publish_year`, and
`cover_i`, the number of its cover. And not every book has every field: some have no cover, and in other catalogues
the year or the author may be missing too.

We could use the API's names everywhere, but then every component would depend on how one API happens to name things.
If it changes, or we switch to another API, we would have to search the whole app. Instead, one function turns an API
book into our shape, right where the data arrives, and the rest of the app never sees the API's names. This is called
**transforming** the API's data. Create the `src/bookApi.js` file:

```js file=src/bookApi.js
// Everything about the book API in one place: its addresses and the shape of its data.
// The components never need to know what the URLs or the API's field names look like.
const API = '/api'

// Only the fields we show, so the answer stays small.
const FIELDS = 'key,title,author_name,first_publish_year,cover_i'

// The address of a search, for example /api/books/search?q=jules%20verne&fields=…
export function searchUrl(query) {
  return `${API}/books/search?q=${encodeURIComponent(query)}&fields=${FIELDS}`
}

// One book as the API sends it → a book in the shape our app uses.
export function toBook(doc) {
  return {
    id: doc.key.replace('/books/', ''),
    title: doc.title,
    author: doc.author_name?.join(', ') ?? '',
    year: doc.first_publish_year ?? null,
    cover: doc.cover_i ? `${API}/covers/${doc.cover_i}-M.svg` : null,
  }
}
```

- `fields=` is a query parameter of the API: it sends only the fields we name. A real catalogue sends dozens of fields
  for every book; asking only for what we show makes the answer small and fast.
- `doc.key.replace('/books/', '')` cuts the `/books/` part off: `'/books/bk019'` becomes `'bk019'`.
- `doc.author_name?.join(', ')`: the `?.` is [[optional chaining]]. If `author_name` is missing (`undefined`), the
  whole expression stops there and gives `undefined`, instead of crashing on `.join`. If it is there, `join` makes one
  text of the names, with a comma between them.
- `??` is the [[nullish coalescing]] operator: it gives its right side only if the left side is `null` or `undefined`.
  So a missing author becomes an empty text, a missing year `null`.
- The cover is a separate address built from the cover's number: `/api/covers/7019-M.svg`. The `M` is the size; the
  API also knows `S` and `L`. If there is no number, `cover` is `null`.

A book without a cover still needs something in its place. Create the `src/components/BookCover.jsx` file:

```jsx file=src/components/BookCover.jsx
// The cover from the API, or a green tile with the title's first letter when there is none.
function BookCover({ book }) {
  if (book.cover) {
    // alt="" because the title is always written next to the cover.
    return <img className="cover" src={book.cover} alt="" loading="lazy" />
  }
  return (
    <span className="cover cover--empty" aria-hidden="true">
      {book.title.charAt(0)}
    </span>
  )
}

export default BookCover
```

The `if` with its `return` is an [[early return]]: when there is a cover, the function stops there. An `<img>` usually
needs an `alt` text, but here the title is always written right next to the picture, so a screen reader would read it
twice: an empty `alt=""` tells it to skip the picture. The tile is hidden from screen readers for the same reason
(`aria-hidden`). `loading="lazy"` asks the browser to load a cover only when it gets near the screen. `charAt(0)` is
the first character of the title.

One search result goes into the `src/components/SearchResult.jsx` file:

```jsx file=src/components/SearchResult.jsx
import BookCover from './BookCover.jsx'

function SearchResult({ book }) {
  return (
    <li className="result">
      <BookCover book={book} />
      <div className="result__body">
        <strong className="result__title">{book.title}</strong>
        <span>{book.author || 'Unknown author'}</span>
        {book.year && <span className="result__year">{book.year}</span>}
      </div>
    </li>
  )
}

export default SearchResult
```

`{book.year && …}` shows the year only if there is one. Finally `SearchPanel` uses all this. Replace
`src/components/SearchPanel.jsx` with this:

```jsx file=src/components/SearchPanel.jsx mark=2-3,9-10,16,39-44
import { useState } from 'react'
import { searchUrl, toBook } from '../bookApi.js'
import SearchResult from './SearchResult.jsx'

function SearchPanel() {
  const [text, setText] = useState('') // what is in the search box
  const [data, setData] = useState(null) // the API's last answer

  // The API's books, turned into our own shape.
  const results = data ? data.docs.map(toBook) : []

  async function handleSubmit(event) {
    event.preventDefault()
    const query = text.trim()
    if (query === '') return
    const response = await fetch(searchUrl(query))
    const answer = await response.json()
    setData(answer)
  }

  return (
    <section className="panel search">
      <h2>Search the catalogue</h2>
      <form className="search__form" role="search" onSubmit={handleSubmit}>
        <label className="field">
          Title, author or topic
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="e.g. Verne, dragons, Dune"
          />
        </label>
        <button type="submit" className="button button--primary">
          Search
        </button>
      </form>

      {data && <p className="search__status">Results: {data.numFound}</p>}
      <ul className="results">
        {results.map((book) => (
          <SearchResult key={book.id} book={book} />
        ))}
      </ul>
    </section>
  )
}

export default SearchPanel
```

`data.docs.map(toBook)` passes the `toBook` function itself to `map`: it is the same as
`data.docs.map((doc) => toBook(doc))`. `results` is not state: it is a [[derived value]], worked out from `data` on
every render. The state holds what the API sent, and the components get our own shape.

:::check Check
Search for `verne`: three covers appear in a grid, each with its title, author and year. Search for `sidereus`: this
book has no cover in the catalogue, so a green tile with an "S" stands in its place. Search for `astronomy`: the API
searches the topics too.
:::

:::mistake Common mistake
`doc.author_name.join(', ')`, without the `?.`. It works as long as every book has an author. To see what happens
when one does not, write `.join` without the `?.` for a moment, and take `author_name` out of `FIELDS`: the API stops
sending it, and the first search crashes with `Cannot read properties of undefined (reading 'join')`. Put both back
afterwards. Data from outside can always miss a field, so the transform has to be ready for it.
:::

:::try Try it
Change the `M` in the cover address to `L` (large) or `S` (small). In the Network tab, click a cover's row and open
Preview: the picture is 400×600 or 100×150 pixels instead of 200×300, but on the page it takes the same space, because
the CSS sets its width. The small one even leaves out the author, so the title stays readable as a thumbnail. Then set
it back to `M`.
:::

### A useFetch hook: loading, errors, nothing found

The search works, but it is not ready for real life yet:

- For a moment after the click nothing happens. The user does not know whether the app is working.
- If the server answers with an error, the page goes blank: an error answer (`{ error, message }`) has no `docs`, so
  `data.docs.map` crashes. Remember: `fetch` throws an error only when no answer
  arrives at all. An answer with an error code, such as 404 (not found) or 429 (too many requests), is still an
  answer, and only `response.ok` (false) and `response.status` show the problem. These numbers are the [[HTTP status
  codes|HTTP status code]]: 200 means OK, 4xx means the request was wrong, 5xx means the server has a problem.
- If you search twice quickly, the answers can arrive in the wrong order, and the slow, old answer overwrites the new
  one: a [[race condition]].

In lesson 20 you solved all three with a `useFetch` [[custom hook]]: it describes the request with a status, cancels
the old request when a new one starts, and can try again. We write it once more for this project, with one difference:
here an answer with an error code throws an error, the hook keeps that error itself (`error`), and the status code
travels on the error (`error.status`), not in a separate `httpStatus` field as in lesson 20. So the search can tell "too many searches" (429) from any other
failure. Create the `src/useFetch.js` file:

```js file=src/useFetch.js
import { useEffect, useState } from 'react'

// Loads JSON from a URL and tells how it is going: { status, data, error, retry }.
// status: 'idle' (no URL yet), 'loading', 'success' or 'error'.
function useFetch(url) {
  const [result, setResult] = useState({ status: 'idle', data: null, error: null })
  const [attempt, setAttempt] = useState(0) // retry() increases it, and the effect runs again

  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    setResult({ status: 'loading', data: null, error: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          const error = new Error(`The server answered with ${response.status}`)
          error.status = response.status
          throw error
        }
        const data = await response.json()
        setResult({ status: 'success', data, error: null })
      } catch (error) {
        // Cancelled by the cleanup: a newer request has taken over, so this one stays quiet.
        if (controller.signal.aborted) return
        setResult({ status: 'error', data: null, error })
      }
    }

    load()
    // Cleanup: a new URL cancels the request that is still on its way.
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setAttempt(attempt + 1)
  }

  return { ...result, retry }
}

export default useFetch
```

A quick walk through it, the difference first.

- **The status code on the error (the difference).** If `response.ok` is false, we make an error with `new Error(…)`, and before
  we `throw` it, we attach a field of our own to it: `error.status = response.status`. An error is an object like any
  other, so it can carry extra data. `throw` jumps straight to the `catch` branch, where a network error would land
  too, and the error is stored in the state, so the component can read `error.status` later.
- **One state for three things.** `result` holds the status, the data and the error together, so one `setResult`
  changes all three at once: you can never get `'success'` with the data of the previous search.
- **The effect.** It runs when the URL changes (and after a `retry`). With no URL (`null`) it does nothing: that is
  the `'idle'` state, before the first search. The effect function itself cannot be `async`, so inside it we write
  `async function load()`, and call it straight away.
- **Cancelling.** The [[cleanup function]] calls `abort()` on the [[AbortController]], whose `signal` went to `fetch`.
  React calls the cleanup before it runs the effect again with a new URL: the old request is cancelled, its `catch`
  sees `controller.signal.aborted`, and stays quiet. So an old answer can never overwrite a new one. (During
  development [[StrictMode]] runs every effect twice on purpose: the first run is cancelled the same way.)
- **Trying again.** `retry` increases `attempt`. Because `attempt` is in the [[dependency array]], the effect runs
  again with the same URL: a new request.
- **What it gives back.** `{ ...result, retry }` is an object with four fields: `status`, `data`, `error` and `retry`.

Now `SearchPanel` uses the hook. Something else changes too: the text in the search box (`text`) and the text we
searched for (`query`) are now two separate states. The request starts only when you send the form, not at every key
press. Replace `src/components/SearchPanel.jsx` with this:

```jsx file=src/components/SearchPanel.jsx mark=2,8-9,14-21,23-29,44,49-51,53-64,66,72
import { useState } from 'react'
import useFetch from '../useFetch.js'
import { searchUrl, toBook } from '../bookApi.js'
import SearchResult from './SearchResult.jsx'

function SearchPanel() {
  const [text, setText] = useState('') // what is in the search box
  const [query, setQuery] = useState('') // what we searched for
  const { status, data, error, retry } = useFetch(query ? searchUrl(query) : null)

  // The API's books, turned into our own shape.
  const results = data ? data.docs.map(toBook) : []

  function handleSubmit(event) {
    event.preventDefault()
    const newQuery = text.trim()
    if (newQuery === '') return
    // The same search again (for example after an error): repeat the request.
    if (newQuery === query) retry()
    else setQuery(newQuery)
  }

  let message = ''
  if (status === 'loading') message = 'Searching…'
  if (status === 'success' && results.length === 0) message = `No books found for “${query}”.`
  if (status === 'success' && results.length > 0) {
    message = `Results: ${data.numFound}`
    if (data.numFound > results.length) message += `, here are the first ${results.length}`
  }

  return (
    <section className="panel search">
      <h2>Search the catalogue</h2>
      <form className="search__form" role="search" onSubmit={handleSubmit}>
        <label className="field">
          Title, author or topic
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="e.g. Verne, dragons, Dune"
          />
        </label>
        <button type="submit" className="button button--primary" disabled={status === 'loading'}>
          Search
        </button>
      </form>

      <p className="search__status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <div className="search__error" role="alert">
          <p>
            {error.status === 429
              ? 'Too many searches in a short time. Wait a few seconds, then try again.'
              : 'The search failed: the book API did not answer.'}
          </p>
          <button type="button" className="button button--small" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {results.length > 0 && (
        <ul className="results">
          {results.map((book) => (
            <SearchResult key={book.id} book={book} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default SearchPanel
```

- `useFetch(query ? searchUrl(query) : null)`: until the first search `query` is empty, so the hook gets `null` and
  waits. `const { status, data, error, retry } = …` takes the four fields out of the object by name: object
  [[destructuring]].
- `handleSubmit` is no longer `async`: it only sets `query`, and the hook does the rest. If you search for the same
  text again (for example after an error), `query` would not change, so the effect would not run: `retry()` starts it
  anyway.
- `message` is a derived value again: one sentence, worked out from the status. `let` is needed because it may get a
  new value further down; `+=` adds text to its end.
- The status line is always on the page, even when it is empty. Its `aria-live="polite"` asks screen readers to read
  it out whenever its text changes (you used it in lesson 3), and that works best on an element that was already there
  before the change. The error box is new on the page when it appears, so it gets `role="alert"`, which is read out at
  once.
- The button is `disabled` while a search is running.

:::check Check
Search for `verne`: for a moment "Searching…" shows and the button is grey, then the covers arrive with "Results: 3".
Search for `novel`: "Results: 39, here are the first 12" (the API sends at most 12 books at a time). Search for
`qqq`: "No books found for “qqq”." Now the error: the API allows at most 12 searches in 10 seconds, after that it
answers 429. Type `verne` into the search box, but do not search yet. Then paste this into the console (if Chrome
asks, type `allow pasting` first): `for (let i = 0; i < 12; i++) fetch('/api/books/search?q=dune')`. Right after it,
within a few seconds, click "Search" in the page: a red box appears, "Too many searches in a short time…". Wait ten
seconds, and click "Try again": the results arrive.
:::

:::mistake Common mistake
Calling the hook inside the event handler: `const { data } = useFetch(searchUrl(newQuery))` in `handleSubmit`. React
stops with `Invalid hook call`. Hooks may only be called at the top level of a component (or of another hook), never
inside an event handler, an `if` or a loop: these are the [[rules of hooks]]. The hook gets the URL on every render, and
the state (`query`) decides what that URL is.
:::

:::concept Why on Enter, and not while typing?
In lesson 20 the movie search started by itself once you stopped typing (debounce). Here the search waits for Enter or
the button on purpose: like most free APIs, ours has a [[rate limit]], at most 12 searches in 10 seconds from one
user. Searching at every pause in typing would use that up quickly. Which one to choose depends on the API: if it is
fast and has no limit, search while typing; if it is limited or slow, search only when the user asks (with Enter or
the button).
:::

:::try Task
The API sends at most 12 books at a time; the rest are on further pages. The `page` query parameter asks for one of
them: `&page=2`. Add a `page` state to `SearchPanel` (a new search sets it back to 1), give it to `searchUrl` as a
second parameter, and put "Previous" and "Next" buttons under the results. The answer's `numFound` and `limit` tell you
how many pages there are: `Math.ceil(data.numFound / data.limit)`.
:::

### From the results onto your list

Time to bring the two halves together: a book found in the search should go onto your list with one click. And if it
is already there, the result should say so, instead of offering it again.

Which books are on your list? `App` knows: they are in its `books` state. So `App` gives the list to `SearchPanel`, and
`SearchPanel` gives each result its status. Replace `src/components/SearchResult.jsx` with this:

```jsx file=src/components/SearchResult.jsx mark=1,4,13-19
import { STATUSES } from '../statuses.js'
import BookCover from './BookCover.jsx'

function SearchResult({ book, status, onAdd }) {
  return (
    <li className="result">
      <BookCover book={book} />
      <div className="result__body">
        <strong className="result__title">{book.title}</strong>
        <span>{book.author || 'Unknown author'}</span>
        {book.year && <span className="result__year">{book.year}</span>}
      </div>
      {status ? (
        <span className="result__on">✓ {STATUSES[status]}</span>
      ) : (
        <button type="button" className="button button--small button--primary" onClick={() => onAdd(book)}>
          + Want to read
        </button>
      )}
    </li>
  )
}

export default SearchResult
```

If the book has a status, it is on your list, and the result says with which status; if it has none (`undefined`), it
gets a button. In `src/components/SearchPanel.jsx` three things change: the component gets two props (`books`,
`onAdd`), it works out the status of each result, and it passes the status and `onAdd` on to every `SearchResult`. The
highlighted lines are new or changed; everything else stays:

```jsx file=src/components/SearchPanel.jsx mark=6,14-17,74
import { useState } from 'react'
import useFetch from '../useFetch.js'
import { searchUrl, toBook } from '../bookApi.js'
import SearchResult from './SearchResult.jsx'

function SearchPanel({ books, onAdd }) {
  const [text, setText] = useState('') // what is in the search box
  const [query, setQuery] = useState('') // what we searched for
  const { status, data, error, retry } = useFetch(query ? searchUrl(query) : null)

  // The API's books, turned into our own shape.
  const results = data ? data.docs.map(toBook) : []

  // Which status a book has on our list (undefined if it is not on it).
  function statusOf(id) {
    return books.find((book) => book.id === id)?.status
  }

  function handleSubmit(event) {
    event.preventDefault()
    const newQuery = text.trim()
    if (newQuery === '') return
    // The same search again (for example after an error): repeat the request.
    if (newQuery === query) retry()
    else setQuery(newQuery)
  }

  let message = ''
  if (status === 'loading') message = 'Searching…'
  if (status === 'success' && results.length === 0) message = `No books found for “${query}”.`
  if (status === 'success' && results.length > 0) {
    message = `Results: ${data.numFound}`
    if (data.numFound > results.length) message += `, here are the first ${results.length}`
  }

  return (
    <section className="panel search">
      <h2>Search the catalogue</h2>
      <form className="search__form" role="search" onSubmit={handleSubmit}>
        <label className="field">
          Title, author or topic
          <input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="e.g. Verne, dragons, Dune"
          />
        </label>
        <button type="submit" className="button button--primary" disabled={status === 'loading'}>
          Search
        </button>
      </form>

      <p className="search__status" aria-live="polite">
        {message}
      </p>

      {status === 'error' && (
        <div className="search__error" role="alert">
          <p>
            {error.status === 429
              ? 'Too many searches in a short time. Wait a few seconds, then try again.'
              : 'The search failed: the book API did not answer.'}
          </p>
          <button type="button" className="button button--small" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {results.length > 0 && (
        <ul className="results">
          {results.map((book) => (
            <SearchResult key={book.id} book={book} status={statusOf(book.id)} onAdd={onAdd} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default SearchPanel
```

[[find]] gives back the first item for which the function returns `true`, or `undefined` if there is none. The `?.`
after it is needed for the second case: `undefined.status` would crash, `undefined?.status` is simply `undefined`.

And `App`? Its `handleAdd` already does exactly what we need: it gets a whole book, with an ID, and puts it at the top
of the list with the status "want". The form gives it a book with a random ID, the search one with the API's ID; for
`handleAdd` they are the same. That is why the form made the ID itself. In `src/App.jsx` change only the line of the
search panel:

```jsx file=src/App.jsx
      <SearchPanel books={books} onAdd={handleAdd} />
```

The books from the API have a cover and a year too; the list should show them. Replace
`src/components/BookItem.jsx` with this:

```jsx file=src/components/BookItem.jsx mark=2,7,10-13
import { STATUSES } from '../statuses.js'
import BookCover from './BookCover.jsx'

function BookItem({ book, onStatusChange, onRemove }) {
  return (
    <li className="book">
      <BookCover book={book} />
      <div className="book__body">
        <strong className="book__title">{book.title}</strong>
        <span className="book__author">
          {book.author || 'Unknown author'}
          {book.year && ` · ${book.year}`}
        </span>
        <div className="book__actions">
          <select
            className="book__status"
            aria-label={`Status of ${book.title}`}
            value={book.status}
            onChange={(event) => onStatusChange(book.id, event.target.value)}
          >
            {Object.entries(STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button button--small button--danger"
            aria-label={`Remove ${book.title}`}
            onClick={() => onRemove(book.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}

export default BookItem
```

The books you typed in by hand have no `cover` and no `year` (they are `undefined`), so they get the green tile, and
no year.

:::check Check
Search for `verne`, and click "+ Want to read" under "Around the World in Eighty Days": the book appears at the top of
your list with its cover, and in the search result the button turns into "✓ Want to read". Set its status to
"Reading" in your list: the result now says "✓ Reading". Your three sample books show a green tile with their first
letter. (They were "typed in by hand", so they do not have the API's IDs: if you search for `dune`, the search does not
know that Dune is on your list.)
:::

:::concept One list, many views
The search result and your list show the same fact, the status of a book, but neither of them stores it on its own:
both read it from the one `books` array in `App`. This is what [[single source of truth]] means. If the search result
had its own "added" state, it would say "✓ Want to read" even after you removed the book from your list. Because there
is only one place, the two can never disagree.
:::

:::mistake Common mistake
Giving `onAdd` the API's raw book (`doc`) instead of the transformed one. The book does go onto the list, but with
"Unknown author", no year and a green tile instead of its cover: your list knows `author`, `year` and `cover`, not
`author_name`, `first_publish_year` and `cover_i`. Worse, it has no `id` at all (the API's ID is in `key`, as
`'/books/bk019'`): the console warns about a missing `key`, and the search result never sees that the book is on your
list, so it keeps offering "+ Want to read". Only our own shape goes past `SearchPanel`.
:::

### Three shelves

One long list is fine for ten books, but a library needs shelves: "Want to read", "Reading", "Read". You could think
of three arrays, one per shelf, with moving meaning "take it out of one, put it into the other". But a book already
knows where it belongs: its `status`. So the shelves are not stored anywhere: a shelf is simply the books of the list
whose status matches, worked out with `filter`. And moving a book between shelves is nothing more than changing its
`status`. One array, three views.

The shelf buttons go into the `src/components/ShelfTabs.jsx` file:

```jsx file=src/components/ShelfTabs.jsx
import { STATUSES } from '../statuses.js'

function ShelfTabs({ books, shelf, onChange }) {
  return (
    <div className="shelf-tabs" role="group" aria-label="Shelves">
      {Object.entries(STATUSES).map(([value, label]) => {
        // How many books are on this shelf: worked out, not stored.
        const count = books.filter((book) => book.status === value).length
        return (
          <button
            key={value}
            type="button"
            className="shelf-tab"
            aria-pressed={value === shelf}
            onClick={() => onChange(value)}
          >
            {label}
            <span className="shelf-tab__count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ShelfTabs
```

- This `map` function has a body in curly brackets, so it can work out `count` before it returns the button. Then it
  needs an explicit `return`.
- [[aria-pressed]] tells screen readers whether a button is "pressed in" (you used it for the theme buttons of lesson
  2): the button of the open shelf is. The CSS uses the same attribute to fill it with green, so what the screen reader says and what you
  see can never disagree. `role="group"` with an `aria-label` names the three buttons together.

On a shelf, a drop-down list is no longer the handiest way to move a book: one click on the name of the other shelf is
quicker. Replace `src/components/BookItem.jsx` with this:

```jsx file=src/components/BookItem.jsx mark=4,15-27
import { STATUSES } from '../statuses.js'
import BookCover from './BookCover.jsx'

function BookItem({ book, onMove, onRemove }) {
  return (
    <li className="book">
      <BookCover book={book} />
      <div className="book__body">
        <strong className="book__title">{book.title}</strong>
        <span className="book__author">
          {book.author || 'Unknown author'}
          {book.year && ` · ${book.year}`}
        </span>
        <div className="book__actions">
          {Object.entries(STATUSES)
            .filter(([value]) => value !== book.status)
            .map(([value, label]) => (
              <button
                key={value}
                type="button"
                className="button button--small"
                aria-label={`Move ${book.title} to ${label}`}
                onClick={() => onMove(book.id, value)}
              >
                → {label}
              </button>
            ))}
          <button
            type="button"
            className="button button--small button--danger"
            aria-label={`Remove ${book.title}`}
            onClick={() => onRemove(book.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}

export default BookItem
```

`filter` leaves out the shelf the book is on, and `map` makes a button of each of the other two. Writing methods one
after the other like this is called [[method chaining]]: each works on what the previous one gave back. The
`aria-label` holds the book's title again, as in step 3: so a screen reader says "Move Dune to Read", not just which
shelf.

When you move a book, it disappears from the open shelf. So that it does not just vanish, a short message tells where
it went. Here is the whole `src/App.jsx`, as it looks at the end of the intermediate level:

```jsx file=src/App.jsx mark=1,3,5,17-22,26-27,29-30,34,37-41,57-63,66-67
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { STATUSES } from './statuses.js'
import SearchPanel from './components/SearchPanel.jsx'
import ShelfTabs from './components/ShelfTabs.jsx'
import BookItem from './components/BookItem.jsx'
import AddBookForm from './components/AddBookForm.jsx'
import './App.css'

// A few books to start with, so the list is not empty.
const START_BOOKS = [
  { id: 1, title: 'The Hobbit', author: 'J. R. R. Tolkien', status: 'read' },
  { id: 2, title: 'Dune', author: 'Frank Herbert', status: 'reading' },
  { id: 3, title: 'Little Women', author: 'Louisa May Alcott', status: 'want' },
]

// What an empty shelf says.
const EMPTY_MESSAGES = {
  want: 'Nothing here yet. Search for a book above and add it!',
  reading: 'You are not reading anything right now.',
  read: 'No finished books yet.',
}

function App() {
  const [books, setBooks] = useLocalStorage('book-library-books', START_BOOKS)
  const [shelf, setShelf] = useLocalStorage('book-library-shelf', 'reading')
  const [notice, setNotice] = useState('')

  // Not state: the books of the open shelf, worked out on every render.
  const shelfBooks = books.filter((book) => book.status === shelf)

  function handleAdd(book) {
    setBooks([{ ...book, status: 'want' }, ...books])
    setNotice(`“${book.title}” is now on the “${STATUSES.want}” shelf.`)
  }

  function handleMove(id, status) {
    const book = books.find((item) => item.id === id)
    setBooks(books.map((item) => (item.id === id ? { ...item, status } : item)))
    setNotice(`“${book.title}” moved to “${STATUSES[status]}”.`)
  }

  function handleRemove(id) {
    setBooks(books.filter((book) => book.id !== id))
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>Your books, on your own shelves.</p>
      </header>

      <SearchPanel books={books} onAdd={handleAdd} />

      <section className="panel">
        <h2>My shelves</h2>
        <ShelfTabs books={books} shelf={shelf} onChange={setShelf} />
        <p className="notice" aria-live="polite">
          {notice}
        </p>
        {shelfBooks.length === 0 ? (
          <p className="empty">{EMPTY_MESSAGES[shelf]}</p>
        ) : (
          <ul className="book-list">
            {shelfBooks.map((book) => (
              <BookItem key={book.id} book={book} onMove={handleMove} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </section>

      <AddBookForm onAdd={handleAdd} />
    </main>
  )
}

export default App
```

- `handleStatusChange` is now called `handleMove`, because on shelves that is what it does. Inside the `map` the
  variable is called `item`, so that the name `book` stays free for the book we found with `find`.
- The open shelf is kept with `useLocalStorage` too, so a reload brings you back to the same shelf. Its key is
  different from the books' key, of course.
- `EMPTY_MESSAGES[shelf]` picks the message of the open shelf, the same way `STATUSES[status]` picks a name.

:::check Check
So that the numbers match, start again from the three sample books: in the developer tools (++F12++ → Application →
Local storage → `http://localhost:5173`) delete the `book-library-books` key (right click → Delete), reload, and click
"Reading". Under "My shelves" there are three buttons with numbers: "Want to read 1", "Reading 1", "Read 1";
"Reading" is green, and only Dune is under it. On Dune click "→ Read": Dune disappears, "Reading" says 0, "Read"
says 2, an empty-shelf message shows, and above it: "“Dune” moved to “Read”." Click "Read": Dune and The Hobbit are
there. Add a book from the search: the "Want to read" number grows by one. Reload: the same shelf is open. The
intermediate level is done: commit it!
:::

:::mistake Common mistake
Keeping the open shelf's books in a state of their own: `const [shelfBooks, setShelfBooks] = useState(…)`. At first it
shows the right books, but after a move the moved book stays on the shelf, because nobody updated the second state.
What can be worked out from other state should be worked out on every render, not stored.
:::

:::try Try it
Put the books of a shelf in alphabetical order: `books.filter(…).toSorted((a, b) => a.title.localeCompare(b.title))`.
`toSorted` gives back a sorted copy, and leaves the original array alone.
:::

## Advanced level {level=3}

### Stars and notes

A finished book deserves a rating: one to five stars. And any book can get a note: why you want to read it, who
recommended it, what you thought of it.

The stars are five buttons. Create the `src/components/StarRating.jsx` file:

```jsx file=src/components/StarRating.jsx
const STARS = [1, 2, 3, 4, 5]

// Five star buttons. A click on the current rating takes it back to 0 (no rating).
function StarRating({ value, onChange }) {
  return (
    <div className="rating" role="group" aria-label="Your rating">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? 'rating__star is-on' : 'rating__star'}
          aria-label={`${star} out of 5 stars`}
          aria-pressed={star === value}
          onClick={() => onChange(star === value ? 0 : star)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default StarRating
```

A star lights up (`is-on`) if its number is at most the rating: with a rating of 3, stars 1, 2 and 3 are gold. Only the
star of the current rating is `aria-pressed`, so a screen reader hears "3 out of 5 stars, pressed".

The note is written in a small form with a [[textarea]] (a text field of several lines). Create the
`src/components/NoteForm.jsx` file:

```jsx file=src/components/NoteForm.jsx
import { useState } from 'react'

function NoteForm({ note, onSave, onCancel }) {
  // A draft of its own: the book changes only when you save.
  const [draft, setDraft] = useState(note)

  function handleSubmit(event) {
    event.preventDefault()
    onSave(draft.trim())
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <label className="field">
        Your note
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} autoFocus />
      </label>
      <div className="note-form__actions">
        <button type="submit" className="button button--small button--primary">
          Save
        </button>
        <button type="button" className="button button--small" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default NoteForm
```

The form works on a draft of its own, like the editing in lesson 9: "Cancel" can throw the draft away, because the
book has not changed yet. `useState(note)` uses `note` only as the starting value, on the first render. That is fine
here, because the form is on the page only while you write: every time you open it, it starts again with the book's
current note. `autoFocus` puts the cursor into the field when the form appears.

`BookItem` gets both, and remembers whether the note is being written. Replace `src/components/BookItem.jsx` with
this:

```jsx file=src/components/BookItem.jsx mark=1,4-5,7-13,24-31,46-50
import { useState } from 'react'
import { STATUSES } from '../statuses.js'
import BookCover from './BookCover.jsx'
import StarRating from './StarRating.jsx'
import NoteForm from './NoteForm.jsx'

function BookItem({ book, onMove, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false) // is the note being written?

  function saveNote(note) {
    onUpdate(book.id, { note })
    setEditing(false)
  }

  return (
    <li className="book">
      <BookCover book={book} />
      <div className="book__body">
        <strong className="book__title">{book.title}</strong>
        <span className="book__author">
          {book.author || 'Unknown author'}
          {book.year && ` · ${book.year}`}
        </span>
        {book.status === 'read' && (
          <StarRating value={book.rating ?? 0} onChange={(rating) => onUpdate(book.id, { rating })} />
        )}
        {editing ? (
          <NoteForm note={book.note ?? ''} onSave={saveNote} onCancel={() => setEditing(false)} />
        ) : (
          book.note && <p className="book__note">{book.note}</p>
        )}
        <div className="book__actions">
          {Object.entries(STATUSES)
            .filter(([value]) => value !== book.status)
            .map(([value, label]) => (
              <button
                key={value}
                type="button"
                className="button button--small"
                aria-label={`Move ${book.title} to ${label}`}
                onClick={() => onMove(book.id, value)}
              >
                → {label}
              </button>
            ))}
          {!editing && (
            <button type="button" className="button button--small" onClick={() => setEditing(true)}>
              {book.note ? 'Edit note' : 'Add a note'}
            </button>
          )}
          <button
            type="button"
            className="button button--small button--danger"
            aria-label={`Remove ${book.title}`}
            onClick={() => onRemove(book.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}

export default BookItem
```

- The stars show only on the "Read" shelf. The books so far have no `rating` field at all, so `book.rating ?? 0` turns
  `undefined` into 0, which means no rating; in the same way `book.note ?? ''` gives an empty note.
- `editing` is [[local state]]: only this row needs to know that its note is being written, so it does not go up to
  `App`.
- Both the stars and the note report a change the same way: `onUpdate(book.id, { … })`, with an object of the fields
  that change. Note that `{ note }` is short for `{ note: note }`.

In `App`, one function does every kind of update: it copies the book and writes the changed fields over it. `handleMove`
can use it too. In `src/App.jsx` add `handleUpdate` above `handleMove`, change `handleMove`, and give `BookItem` the new
prop (the rest of the file stays as it is):

```jsx file=src/App.jsx mark=1-4,8,15
  function handleUpdate(id, changes) {
    // Only this book changes: a copy of it, with the changed fields written over it.
    setBooks(books.map((book) => (book.id === id ? { ...book, ...changes } : book)))
  }

  function handleMove(id, status) {
    const book = books.find((item) => item.id === id)
    handleUpdate(id, { status })
    setNotice(`“${book.title}” moved to “${STATUSES[status]}”.`)
  }

  // … handleRemove and the beginning of the return, as before

            {shelfBooks.map((book) => (
              <BookItem key={book.id} book={book} onMove={handleMove} onUpdate={handleUpdate} onRemove={handleRemove} />
            ))}
```

`{ ...book, ...changes }`: first every field of the book, then every field of `changes`. If a field is in both, the
later one wins: `{ ...book, ...{ rating: 4 } }` is the book with a rating of 4.

:::check Check
Open the "Read" shelf: The Hobbit has five grey stars. Click the fourth: four turn gold. On any book click "Add a
note": a text field opens with the cursor in it. Write something and click "Save": the note appears in italics under
the title, and the button now says "Edit note". Open it again, change the text, and click "Cancel": the old note
stays. Reload: the four stars and the note are still there. Finally click the fourth star again: the rating is gone.
:::

:::mistake Common mistake
The spread in the wrong order: `{ ...changes, ...book }`. A book's first rating and first note still stick (it had no
such field until then), but after that clicking does nothing: the book's old fields are written last, so they
overwrite the new ones. And the move buttons do not work at all, because every book has a `status`. The fields that
should win come last.
:::

:::try Try it
Give the note a length limit: `maxLength={300}` on the `<textarea>`, and under it a line that counts:
`{draft.length} / 300`.
:::

### A reading goal and statistics

How many books will you read this year? Let's set a goal, and see how far you have got. For that the app has to know
**when** you finished a book: so when a book moves to "Read", it gets a date.

Dates in JavaScript are `Date` objects: `new Date()` is "now". But localStorage (and later the server) can store only
JSON text, and JSON has no date type. So we store the date as text, in the [[ISO date]] format:
`new Date().toISOString()` gives something like `'2026-11-23T18:30:00.000Z'`. `new Date(text)` turns it back into a
date, and `getFullYear()` gives its year. In `src/App.jsx` change `handleMove` like this:

```jsx file=src/App.jsx mark=3-5
  function handleMove(id, status) {
    const book = books.find((item) => item.id === id)
    // A book moved to "Read" remembers when: the reading goal counts it.
    if (status === 'read') handleUpdate(id, { status, finishedAt: new Date().toISOString() })
    else handleUpdate(id, { status })
    setNotice(`“${book.title}” moved to “${STATUSES[status]}”.`)
  }
```

The statistics are worked out from the books by a separate function. Create the `src/stats.js` file:

```js file=src/stats.js
// The statistics, worked out from the books. A pure function: the same books always give the same numbers.
export function readingStats(books, year) {
  const read = books.filter((book) => book.status === 'read')
  const readThisYear = read.filter((book) => book.finishedAt && new Date(book.finishedAt).getFullYear() === year)
  const rated = read.filter((book) => book.rating > 0)
  const ratingSum = rated.reduce((sum, book) => sum + book.rating, 0)

  return {
    total: books.length,
    read: read.length,
    readThisYear: readThisYear.length,
    averageRating: rated.length > 0 ? ratingSum / rated.length : null,
  }
}
```

- [[reduce]] walks through an array and builds up a single value from it. It gets a function and a starting value
  (here `0`). The function gets the value so far (`sum`) and the next item (`book`), and returns the new value so far.
  For ratings of 4 and 5 it goes like this: 0 → 0 + 4 = 4 → 4 + 5 = 9.
- The average is the sum divided by the number of rated books. If no book is rated, we would divide by zero, so then
  it is `null`: "no average yet".
- Books that were already on "Read" before this step (The Hobbit, and Dune if you moved it) have no `finishedAt`.
  `book.finishedAt && …` leaves them out of this year's count, but they are still counted in "Read in total".
- This is a [[pure function]], like the calculator functions of lesson 8 in `calculator.js`: it reads only its
  parameters, changes nothing, and gives back the same result for the same input. It knows nothing about React, so it
  is easy to test.

The goal and the numbers get a card of their own. Create the `src/components/ReadingStats.jsx` file:

```jsx file=src/components/ReadingStats.jsx
import { readingStats } from '../stats.js'

function ReadingStats({ books, goal, onGoalChange }) {
  const year = new Date().getFullYear()
  const stats = readingStats(books, year)
  // The field may be empty for a moment while you type: then the goal counts as 1.
  const target = Math.max(1, Number(goal) || 1)
  const percent = Math.min(100, Math.round((stats.readThisYear / target) * 100))

  return (
    <section className="panel stats">
      <h2>Reading in {year}</h2>
      <div className="goal">
        <label className="goal__field">
          My goal:
          <input
            type="number"
            min="1"
            value={goal}
            onChange={(event) => onGoalChange(event.target.value)}
          />
          books this year
        </label>
        <progress className="goal__bar" value={stats.readThisYear} max={target} aria-label="Reading goal" />
        <p className="muted">
          {stats.readThisYear} of {target} read ({percent}%)
        </p>
      </div>
      <dl className="stats__grid">
        <div className="stat">
          <dt>On my shelves</dt>
          <dd>{stats.total}</dd>
        </div>
        <div className="stat">
          <dt>Read in total</dt>
          <dd>{stats.read}</dd>
        </div>
        <div className="stat">
          <dt>Average rating</dt>
          <dd>
            {stats.averageRating === null
              ? '–'
              : `${stats.averageRating.toLocaleString('en-GB', { maximumFractionDigits: 1 })} ★`}
          </dd>
        </div>
      </dl>
    </section>
  )
}

export default ReadingStats
```

- `<input type="number">` gives its value as text too. We store that text as it is (`onGoalChange(event.target.value)`),
  so you can clear the field and type a new number. The number we calculate with, `target`, is a derived value:
  `Number(goal)` turns the text into a number, `|| 1` makes 1 out of an empty field (an empty text becomes 0, which
  counts as false), and `Math.max(1, …)` keeps it at least 1, so we never divide by zero.
- `<progress>` is the browser's built-in progress bar (in lesson 6 we drew our own): `value` is how far you are,
  `max` is the end. `Math.min(100, …)` keeps the percentage at 100 even if you read more than you planned.
- `toLocaleString('en-GB', { maximumFractionDigits: 1 })` writes the number with at most one decimal, the way it is
  written in English: 4.5. (In Hungarian it would be 4,5.)
- The numbers are in a [[description list]] (`<dl>`): each `<dt>` is a label, each `<dd>` its value. Screen readers
  read them out as pairs.

Finally, in `src/App.jsx`: import the component, keep the goal with `useLocalStorage`, and put the card under the
header:

```jsx file=src/App.jsx mark=1,6,16
import ReadingStats from './components/ReadingStats.jsx'
// … the other imports, START_BOOKS and EMPTY_MESSAGES, as before

function App() {
  const [books, setBooks] = useLocalStorage('book-library-books', START_BOOKS)
  const [goal, setGoal] = useLocalStorage('book-library-goal', 12)
  const [shelf, setShelf] = useLocalStorage('book-library-shelf', 'reading')
  // … notice, shelfBooks and the functions, as before

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>Your books, on your own shelves.</p>
      </header>
      <ReadingStats books={books} goal={goal} onGoalChange={setGoal} />

      <SearchPanel books={books} onAdd={handleAdd} />
      {/* … the shelves and the form, as before … */}
```

:::check Check
Under the green band a new card appears: "Reading in 2026" (the current year), "My goal: 12 books this year", an empty
bar and "0 of 12 read (0%)". Below it three boxes: how many books are on your shelves, how many you have read in total,
and the average rating ("–" while no book is rated). Move Little Women to "Read": "1 of 12 read (8%)", the bar starts
to fill, and "Read in total" grows by one. Give Little Women 5 stars and The Hobbit 4: the average is 4.5 ★ (if you have
not rated other books).
Set the goal to 2: "1 of 2 read (50%)". Reload: the goal stays 2.
:::

:::mistake Common mistake
`reduce` without a starting value: `rated.reduce((sum, book) => sum + book.rating)`. As long as no book is rated, the
page crashes: `Reduce of empty array with no initial value`. With no starting value `reduce` uses the first item
instead, and an empty array has none. (With books it would be wrong anyway: the first item is a book object, not a
number.) Always give `reduce` a starting value.
:::

:::try Task
Add a fourth box: how many books are waiting on the "Want to read" shelf. Work it out in `readingStats` (a new field
in the returned object), and show it in `ReadingStats`.
:::

### Logging in

Your shelves live in one browser now. To see them on your phone too, they have to be kept on a [[server]], in your own
account. For that the app first has to know who you are: it needs a [[login]].

The pretend server has an account service for this too. It is in `src/mocks/accounts.js`, and it keeps its
"database" in a localStorage key of its own (`book-library-server`), but it behaves like a real server: every answer
takes a moment, and it gives your shelves only to a request that proves who you are. Its endpoints:

- `POST /api/login` with a body of `{ "name": "…", "password": "…" }`: logging in. The first login with a new name
  creates the account, with that password. The answer: `{ "name", "token", "created" }`. With a wrong password the
  answer is 401.
- `GET /api/shelves`: the shelves saved in the account.
- `PUT /api/shelves` with a body of `{ "books": [ … ] }`: saves the shelves in the account.

New things appear here. `POST` is the [[HTTP method]] of a request that sends data to the server so that it does
something with it (here: lets you in, or creates an account); `PUT` replaces something stored on the server with what
the request sends. The data travels in the [[body|request body]] of the request, as JSON text, and a [[header|HTTP header]] (a
named piece of information next to the body) tells the server what kind of data it is: `Content-Type:
application/json`. After a successful login the server hands out a [[token|access token]]: a long, random piece of text.
From then on the app sends it along with every request, in the `Authorization` header, and from it the server knows
who is asking. The token is like a cloakroom ticket: whoever shows it gets the coat, without having to say their name
and password again.

Every request to the account service looks alike, so one helper function sends them. Create the `src/cloud.js` file:

```js file=src/cloud.js
// The account service of the pretend server (src/mocks/accounts.js): logging in, loading and saving the shelves.

// One request to the server. Gives back the JSON answer, or throws an error that knows the status code.
async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json()
  if (!response.ok) {
    const error = new Error(data.message)
    error.status = response.status
    throw error
  }
  return data
}

// The first login with a new name creates the account. The answer: { name, token, created }.
export function logIn(name, password) {
  return request('/login', { method: 'POST', body: { name, password } })
}
```

- `request` gets the path, and an object of options. `{ method = 'GET', token, body } = {}` takes the options apart
  right in the parameter list (destructuring), and gives `method` a [[default parameter]] value: if the caller gives no
  method, it is `'GET'`. The `= {}` at the end lets you call it with no options at all: `request('/shelves')`.
- The second parameter of `fetch` describes the request: its method, its headers, and its body. The body has to be
  text, so `JSON.stringify` turns the object into JSON.
- `headers.Authorization = …` adds a field to an object after it was made. The name `Content-Type` has a hyphen in it,
  so it can only be written in square brackets: `headers['Content-Type']`. `Bearer` ("the bearer of this token") is the
  word that goes in front of a token, by convention.
- The server's error answer (`{ error, message }`) becomes a thrown error, with the status code on it, as in
  `useFetch`.
- `request` is not exported: only `cloud.js` uses it. `logIn` simply gives back the Promise of `request`, so whoever
  calls it can `await` it.

The login form goes into the `src/components/LoginForm.jsx` file:

```jsx file=src/components/LoginForm.jsx
import { useState } from 'react'
import { logIn } from '../cloud.js'

function LoginForm({ onLogin }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false) // is the login on its way?

  async function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '' || password === '') {
      setError('Enter your name and a password.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const user = await logIn(name.trim(), password)
      await onLogin(user)
    } catch (err) {
      setError(err.status === 401 ? 'Wrong name or password.' : 'The server is not responding. Please try again!')
      setBusy(false)
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <p className="muted">
        The first login with a new name creates your account. Do not use a real password: this is only a practice
        server.
      </p>
      <div className="login__fields">
        <label className="field">
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="username" />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
      </div>
      {error && (
        <p className="login__error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button button--primary" disabled={busy}>
        {busy ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}

export default LoginForm
```

- `busy` is true while we wait for the answer: the button is disabled and says "Logging in…", so the form cannot be
  sent twice. After a successful login the form disappears, so there is no need to set it back; after an error there
  is, so you can try again.
- `await onLogin(user)`: `App`'s function may have work to do too (in the next step it will), and its errors should
  show in this form as well.
- `autoComplete` tells the browser which field is the user name and which is the password, so a password manager can
  fill them in.

A bar shows the login: while nobody is logged in, a single line that opens into the login form; after the login, the
name and a "Log out" button. Opening and closing it is the job of the browser's `<details>` element: only its
`<summary>` line shows, and a click on it opens the rest. Create the `src/components/AccountBar.jsx` file:

```jsx file=src/components/AccountBar.jsx
import LoginForm from './LoginForm.jsx'

function AccountBar({ session, onLogin, onLogout }) {
  if (!session) {
    return (
      <details className="account">
        <summary>Log in to keep your shelves in the cloud</summary>
        <LoginForm onLogin={onLogin} />
      </details>
    )
  }

  return (
    <div className="account account--in">
      <span>
        Logged in as <strong>{session.name}</strong>
      </span>
      <button type="button" className="button button--small" onClick={onLogout}>
        Log out
      </button>
    </div>
  )
}

export default AccountBar
```

In `App`, the logged-in user (the [[session]]: the name and the token) goes into `useLocalStorage`, so a reload does
not log you out. `null` means nobody is logged in. In `src/App.jsx` add these (the rest stays as it is):

```jsx file=src/App.jsx mark=1,6,9-11,13-15,24-25
import AccountBar from './components/AccountBar.jsx'
// … the other imports, START_BOOKS and EMPTY_MESSAGES, as before

function App() {
  // … books, goal, shelf, as before
  const [session, setSession] = useLocalStorage('book-library-session', null)
  // … notice, shelfBooks, handleAdd, handleUpdate, handleMove, handleRemove, as before

  function handleLogin(user) {
    setSession({ name: user.name, token: user.token })
  }

  function handleLogout() {
    setSession(null)
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>Your books, on your own shelves.</p>
      </header>

      <AccountBar session={session} onLogin={handleLogin} onLogout={handleLogout} />
      <ReadingStats books={books} goal={goal} onGoalChange={setGoal} />
      {/* … the search, the shelves and the form, as before … */}
```

:::check Check
Under the green band there is a line: "Log in to keep your shelves in the cloud". Click it: the form opens. Log in
with any name (for example "Anna") and a made-up password: for a moment the button says "Logging in…", then the bar
says "Logged in as Anna", with a "Log out" button. Reload: you are still logged in. Log out, and log in as "anna" with
another password: "Wrong name or password." (Names do not care about capital letters.) In the Network tab, click the
`login` row: Payload shows what you sent, Response shows the token.
:::

:::mistake Common mistake
`body: body` without `JSON.stringify`. The browser turns the object into the text `[object Object]`, the server
cannot read a name and a password from it, and answers 400 (bad request): the form says "The server is not
responding". In the Network tab you see the real reason: the request's payload and the 400 status. The body of a
request is always text.
:::

:::concept How do real logins work?
A real server never stores your password itself, only a [[hash]] of it (a fingerprint from which the password cannot
be worked out), and the login travels only over an encrypted `https://` connection. Real tokens run out after a while
(an hour, a day), and logging out tells the server to forget the token, too. Our pretend server keeps the password in
plain text in localStorage: fine for practice, never for real data. That is why the form asks you not to use a real
password.
:::

### Your shelves on the server

Now the books themselves go to the account. The plan:

- **Logging in to a new account:** the account gets the shelves of this browser, so nothing is lost.
- **Logging in to an existing account, and every reload while logged in:** the shelves saved in the account replace
  the ones in the browser. (The browser keeps a copy in localStorage, so the page has something to show until the
  answer arrives.)
- **Every change while logged in:** the whole list is sent to the account.
- **Logging out:** the browser forgets the shelves; they wait in the account.

First two more functions in `src/cloud.js`. Here is the whole file:

```js file=src/cloud.js mark=28-37
// The account service of the pretend server (src/mocks/accounts.js): logging in, loading and saving the shelves.

// One request to the server. Gives back the JSON answer, or throws an error that knows the status code.
async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json()
  if (!response.ok) {
    const error = new Error(data.message)
    error.status = response.status
    throw error
  }
  return data
}

// The first login with a new name creates the account. The answer: { name, token, created }.
export function logIn(name, password) {
  return request('/login', { method: 'POST', body: { name, password } })
}

// The books saved in the account (null if nothing has been saved in it yet).
export async function loadBooks(token) {
  const data = await request('/shelves', { token })
  return data.books
}

// Saves the whole list in the account.
export function saveBooks(token, books) {
  return request('/shelves', { method: 'PUT', token, body: { books } })
}
```

Keeping in step with the server is the job of a custom hook. Create the `src/useCloudSync.js` file:

```js file=src/useCloudSync.js
import { useEffect, useState } from 'react'
import { loadBooks, saveBooks } from './cloud.js'

// Keeps the books in step with the account on the pretend server: loads them after logging in
// (and after every reload), and save() sends every change.
function useCloudSync(token, setBooks) {
  // 'loading', 'saving', 'saved', 'load-failed', 'save-failed' or 'expired'
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0) // reload() increases it, and the effect runs again

  useEffect(() => {
    if (!token) return
    let ignore = false

    async function load() {
      setStatus('loading')
      try {
        const saved = await loadBooks(token)
        if (ignore) return
        // null: nothing has been saved in the account yet, so the books of this browser stay.
        if (saved !== null) setBooks(saved)
        setStatus('saved')
      } catch (error) {
        if (!ignore) setStatus(error.status === 401 ? 'expired' : 'load-failed')
      }
    }

    load()
    // Cleanup: after logging out (or a new attempt) this answer is not needed any more.
    return () => {
      ignore = true
    }
  }, [token, attempt, setBooks])

  async function save(books) {
    if (!token) return // nobody is logged in: the books stay in this browser only
    setStatus('saving')
    try {
      await saveBooks(token, books)
      setStatus('saved')
    } catch (error) {
      setStatus(error.status === 401 ? 'expired' : 'save-failed')
    }
  }

  function reload() {
    setAttempt(attempt + 1)
  }

  return { status, save, reload }
}

export default useCloudSync
```

- **Loading** happens in an effect, because it follows from the state (there is a token), not from a click: it runs
  after the login, and after every reload of the page while you are logged in. `ignore` does what the
  `AbortController` did in `useFetch`, in a simpler way: if you log out (or try again) before the answer arrives, the
  cleanup sets it to `true`, and the late answer is thrown away. This is the other usual way to avoid a race condition,
  the one you know from `useServerTodos` in lesson 9: the request is not cancelled, only its answer is ignored.
- `setBooks` is in the dependency array because the effect uses it. It is the setter of the `useState` inside
  `useLocalStorage`, and React gives back the very same function on every render, so it never makes the effect run
  again on its own.
- **Saving** is not an effect but a function, `save`, that `App` calls after every change. An effect watching `books`
  would also run right after loading, and send the server straight back what it had just sent us. A change is the
  result of something the user did, so it is sent where that happens, like the saving of the to-do list in lesson 9.
- **401** means the server does not know the token (any more): the status is then `'expired'`, and the user has to log
  in again.

The bar shows how saving goes. Replace `src/components/AccountBar.jsx` with this:

```jsx file=src/components/AccountBar.jsx mark=3-11,13,28-35
import LoginForm from './LoginForm.jsx'

// How the account is doing, in words.
const MESSAGES = {
  loading: 'Loading your shelves…',
  saving: 'Saving…',
  saved: 'All saved in your account',
  'load-failed': 'Could not load your shelves.',
  'save-failed': 'Could not save your last change.',
  expired: 'Your login has expired: log out, then log in again.',
}

function AccountBar({ session, status, onLogin, onLogout, onRetry }) {
  if (!session) {
    return (
      <details className="account">
        <summary>Log in to keep your shelves in the cloud</summary>
        <LoginForm onLogin={onLogin} />
      </details>
    )
  }

  return (
    <div className="account account--in">
      <span>
        Logged in as <strong>{session.name}</strong>
      </span>
      <span className={`account__status account__status--${status}`} aria-live="polite">
        {MESSAGES[status]}
      </span>
      {(status === 'load-failed' || status === 'save-failed') && (
        <button type="button" className="button button--small" onClick={onRetry}>
          Try again
        </button>
      )}
      <button type="button" className="button button--small" onClick={onLogout}>
        Log out
      </button>
    </div>
  )
}

export default AccountBar
```

The keys with a hyphen (`'load-failed'`) have to be in quotes in an object, otherwise JavaScript would read them as a
subtraction. The class of the status line also depends on the status: the CSS colours failures red.

Last comes `App`. Every place that changed the books with `setBooks` now calls `changeBooks`, which also sends the
change to the account. Here is the whole `src/App.jsx`, as it looks at the end of the lesson:

```jsx file=src/App.jsx mark=3-4,34,39-43,46,52,64,67-71,73-77,79-82,93,96
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useCloudSync from './useCloudSync.js'
import { saveBooks } from './cloud.js'
import { STATUSES } from './statuses.js'
import AccountBar from './components/AccountBar.jsx'
import ReadingStats from './components/ReadingStats.jsx'
import SearchPanel from './components/SearchPanel.jsx'
import ShelfTabs from './components/ShelfTabs.jsx'
import BookItem from './components/BookItem.jsx'
import AddBookForm from './components/AddBookForm.jsx'
import './App.css'

// A few books to start with, so the list is not empty.
const START_BOOKS = [
  { id: 1, title: 'The Hobbit', author: 'J. R. R. Tolkien', status: 'read' },
  { id: 2, title: 'Dune', author: 'Frank Herbert', status: 'reading' },
  { id: 3, title: 'Little Women', author: 'Louisa May Alcott', status: 'want' },
]

// What an empty shelf says.
const EMPTY_MESSAGES = {
  want: 'Nothing here yet. Search for a book above and add it!',
  reading: 'You are not reading anything right now.',
  read: 'No finished books yet.',
}

function App() {
  const [books, setBooks] = useLocalStorage('book-library-books', START_BOOKS)
  const [goal, setGoal] = useLocalStorage('book-library-goal', 12)
  const [shelf, setShelf] = useLocalStorage('book-library-shelf', 'reading')
  const [session, setSession] = useLocalStorage('book-library-session', null)
  const [notice, setNotice] = useState('')
  const cloud = useCloudSync(session?.token, setBooks)

  // Not state: the books of the open shelf, worked out on every render.
  const shelfBooks = books.filter((book) => book.status === shelf)

  // Every change goes through here: it shows at once, and goes to the account if someone is logged in.
  function changeBooks(newBooks) {
    setBooks(newBooks)
    cloud.save(newBooks)
  }

  function handleAdd(book) {
    changeBooks([{ ...book, status: 'want' }, ...books])
    setNotice(`“${book.title}” is now on the “${STATUSES.want}” shelf.`)
  }

  function handleUpdate(id, changes) {
    // Only this book changes: a copy of it, with the changed fields written over it.
    changeBooks(books.map((book) => (book.id === id ? { ...book, ...changes } : book)))
  }

  function handleMove(id, status) {
    const book = books.find((item) => item.id === id)
    // A book moved to "Read" remembers when: the reading goal counts it.
    if (status === 'read') handleUpdate(id, { status, finishedAt: new Date().toISOString() })
    else handleUpdate(id, { status })
    setNotice(`“${book.title}” moved to “${STATUSES[status]}”.`)
  }

  function handleRemove(id) {
    changeBooks(books.filter((book) => book.id !== id))
  }

  async function handleLogin(user) {
    // A new account starts with the shelves of this browser, so nothing is lost.
    if (user.created) await saveBooks(user.token, books)
    setSession({ name: user.name, token: user.token })
  }

  function handleLogout() {
    setSession(null)
    // The shelves wait in the account; this browser forgets them.
    setBooks([])
  }

  function handleRetry() {
    if (cloud.status === 'load-failed') cloud.reload()
    else cloud.save(books)
  }

  return (
    <main className="library">
      <header className="library__header">
        <h1>Book Library</h1>
        <p>Your books, on your own shelves.</p>
      </header>

      <AccountBar
        session={session}
        status={cloud.status}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRetry={handleRetry}
      />
      <ReadingStats books={books} goal={goal} onGoalChange={setGoal} />
      <SearchPanel books={books} onAdd={handleAdd} />

      <section className="panel">
        <h2>My shelves</h2>
        <ShelfTabs books={books} shelf={shelf} onChange={setShelf} />
        <p className="notice" aria-live="polite">
          {notice}
        </p>
        {shelfBooks.length === 0 ? (
          <p className="empty">{EMPTY_MESSAGES[shelf]}</p>
        ) : (
          <ul className="book-list">
            {shelfBooks.map((book) => (
              <BookItem key={book.id} book={book} onMove={handleMove} onUpdate={handleUpdate} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </section>

      <AddBookForm onAdd={handleAdd} />
    </main>
  )
}

export default App
```

- `session?.token`: while nobody is logged in, `session` is `null`, and the hook gets `undefined`: it loads nothing,
  and its `save` does nothing.
- `changeBooks` is the one door every change goes through: `handleAdd`, `handleUpdate` and `handleRemove` call it
  instead of `setBooks`. (`handleMove` calls `handleUpdate`, so it goes through it too.)
- `handleLogout` is the one handler in `App` that still calls `setBooks` directly, on purpose. `changeBooks([])` would
  also call `cloud.save([])`, and during this click the hook still has the old token: the empty list would be saved in
  the account, and your shelves there would be wiped. Logging out should only make this browser forget them.
- `handleLogin` is `async`, and for a new account it waits until the books are saved, before it sets the session. If
  the saving fails, the error lands in the `catch` of `LoginForm`, and the form shows it. Setting the session starts the
  hook's effect, which loads the account's shelves: for a new account, exactly what we have just sent.
- `handleRetry` knows what to try again: if loading failed, the loading; if saving failed, sending the current list.
- The books still go into localStorage too: that copy is what shows until the server answers.

:::check Check
Log out if you are logged in, then log in with a new name, for example "Bence": the bar says "All saved in your
account". Add a book: for a moment "Saving…", then "All saved in your account" again. Log out: the shelves are empty.
Log back in as Bence: your books are back. Now open the same address in a private window (or another browser), and log
in there as Bence too, even with a different password: it lets you in, and your shelves hold only the three sample
books, without yours. The pretend server lives in each browser's own storage, so there was no account called Bence
there yet, and a new one has just been created (with a real server you would log in to the old one). Finally, the
expired login: back in the first window, delete the `book-library-server` key in the developer tools (the pretend
server's database), and reload the page: "Your login has expired: log out, then log in again." (Careful: if you log
out and back in now, your shelves are gone. Your account went with the deleted database, and logging out clears the
browser's copy too.) Congratulations, your library is done: commit it!
:::

:::mistake Common mistake
One handler is left with `setBooks` instead of `changeBooks`, for example `handleRemove`. Removing looks fine, the
book disappears, but the account never hears about it: log out and back in, and the removed book is back. If every
change goes through one function, you cannot forget one.
:::

:::concept What if you use two devices at once?
If you change your shelves on your phone and on your laptop at the same time, the one that saves last wins, and the
other change is lost: every save sends the whole list. Real apps handle this in different ways: they send only the
change ("move book 7 to Read"), or keep a version number and refuse a save that was based on an old version. That is a
topic for later lessons; for one person and one device at a time, "last save wins" is enough.
:::

:::try Try it
`FAIL_RATE` at the top of `src/mocks/accounts.js` says what share of the requests should fail. While you are logged in,
set it to `1` and save the file. The development server reloads the page, and already the loading fails: "Could not
load your shelves." in red, with a "Try again" button (which fails again too, of course). Change something on your
shelves: "Could not save your last change." Now set `FAIL_RATE` back to `0`: after the reload the bar says "All saved
in your account" again. The change you made while the server was "down" is gone: it never reached the server, and the
account's copy replaced the one in the browser.
:::
