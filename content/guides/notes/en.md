# What we build

A notebook in the browser: your notes listed on the left, the open note on the right, saved by itself while you type.
By the end of the lesson it searches (accents optional), sorts notes into categories, tells you when you last edited
each one, reads Markdown, and syncs with a server: if the internet goes away in the meantime, the app keeps working,
and when the connection comes back, it catches up on the sync by itself. On the way you learn how to create, change
and delete items in a list, what a derived value is (one you work out instead of storing), and how JavaScript handles
dates.

:::levels
- A list of notes, writing that goes straight into the list as you type, new notes, deleting with a confirmation. | about 2 hours
- Saving in the browser with the `useLocalStorage` hook, the time of the last edit, search and categories. | about 3 hours
- A Markdown preview, #tags, syncing across devices with a (pretend) server, offline mode. | about 3 hours
:::

**Before you start you need:** the earlier lessons, above all lesson 9, "To-Do List": rendering lists with `key`,
adding, changing and deleting items in state, and your own `useLocalStorage` hook. What you know from earlier lessons
is recapped in a sentence or two; everything new is explained here, step by step.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is the `lessons/11-notes/exercise` folder of the course repository on GitHub (the
"Exercise on GitHub" button above opens it). You get it the same way as in the earlier lessons; lesson 1 explains every
step in detail. In the terminal, in your work folder (the one that holds the `rika-mentoring` folder):

```shell
cd rika-mentoring
git pull        # brings the new lessons into the repository
cd ..
cp -r rika-mentoring/lessons/11-notes/exercise notes-app
```

If you do not have the repository yet, run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the
first three lines (without git: **Code → Download ZIP** on the GitHub page). You can also copy the folder in your file
manager; what matters is that your copy is called `notes-app` and sits outside the `rika-mentoring` folder, so
`git pull` keeps working. Open your copy in the editor, then type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white card in the middle of the page,
with the title "Notes".
:::

Last, make your copy a git repository with one commit, the starting point. Leave the server running and open a second
terminal (the **+** button in the terminal panel; it opens in `notes-app` too):

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit (new files stay: delete those by hand), and it
is worth committing after every step that works.

The exercise has four files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, so you do not write CSS this time:
  you only use the class names (`notes`, `note-list`, `editor`, …) that the steps give you.
- `src/sampleNotes.js`: four sample notes, so the app is not empty the very first time it starts.
- `src/fakeApi.js`: a pretend server that runs in the browser. You need it only in the advanced level.

:::concept A quick recap
A [[component]] is a function that returns [[JSX]]; it gets data from outside through its [[props]] and remembers
things with [[useState]]. `map` draws an array, and every item needs a unique `key`. A [[controlled input]] takes its
value from state, and every keystroke updates that state. We never change state in place: we always give the `set…`
function a new array or a new object, for example with the [[spread]] syntax (`...`). If any of this feels unfamiliar,
take another look at lessons 1 and 9.
:::

### The list and the open note

The notebook has two parts: the list of notes on the left, and the note you opened on the right. Open
`src/sampleNotes.js`. `SAMPLE_NOTES` is an [[array]]; each item is a note, that is, an [[object]], and every note has
the same fields. `id` is the note's permanent, unique name: it tells us which note we mean, even after its title
changes. `title` is the title and `body` is the text. We use `category` and `updatedAt` in the intermediate level.

Start with the list. Create a `components` folder in `src`, and in it a `NoteList.jsx` file:

```jsx file=src/components/NoteList.jsx
function NoteList({ notes, selectedId, onSelect }) {
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="note-list__item"
            aria-current={note.id === selectedId}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title}</span>
            <span className="note-list__excerpt">{note.body}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList
```

`map` makes a list item from every note, and the `key` is the note's `id`: unique, and it never changes. Each item is a
button, because you click it; when you do, it reports which note you chose through the `onSelect` prop.
`aria-current` is `true` for the open note: screen readers announce it, and `App.css` uses it to highlight the item.
The text (`note.body`) can be long, but the CSS cuts it to a single line and ends it with three dots.

For now the open note is only shown; in the next step it becomes an editor. Create `NoteEditor.jsx` in the
`components` folder:

```jsx file=src/components/NoteEditor.jsx
function NoteEditor({ note, onClose }) {
  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Notes
        </button>
      </div>
      <h2 className="editor__title">{note.title}</h2>
      <p className="editor__text">{note.body}</p>
    </article>
  )
}

export default NoteEditor
```

The "← Notes" button is for phones. On a narrow screen the list and the note do not fit side by side, so while a note
is open, the list disappears, and this button takes you back to it. On a wide screen the CSS hides the button.

Now the main part: how does `App` know which note is open? Remembering its id is enough. Change `src/App.jsx` to
this (the highlighted lines are new or changed):

```jsx file=src/App.jsx mark=1-4,8-9,11-12,15,19-30
import { useState } from 'react'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)

  // We only store the id; the note itself is looked up in the list on every render.
  const selected = notes.find((note) => note.id === selectedId)

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Notes</h1>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Notes">
          <NoteList notes={notes} selectedId={selectedId} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor note={selected} onClose={() => setSelectedId(null)} />
          ) : (
            <p className="notes__hint">Pick a note from the list.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

- `notes` is the list of notes, starting with the samples. It lives in state because it will change soon; you need
  `setNotes` from the next step on.
- `selectedId` is the id of the open note. It starts as `null`, meaning nothing is open.
  `onSelect={setSelectedId}` hands the setter itself to the list: when the list calls `onSelect(note.id)`, that is the
  same as calling `setSelectedId(note.id)`.
- `selected` is the open note itself. We do not store it; we look it up in the list on every render, which makes it a
  [[derived value]]. `find` hands the notes one by one to the arrow function and returns the first one for which the
  function returns true, or `undefined` if there is none. Why it pays off to store only the id becomes clear in the
  next step.
- `{selected ? … : …}` is [[conditional rendering]]: if a note is open, you see the editor; if not (`undefined` counts
  as false), the hint. The same condition adds the `notes--editing` class, which hides the list on phones.

:::check Check
Four sample notes appear on the left, each with its title and, in grey below it, the start of its text; on the right
there is a hint in a dashed frame. Click a note: it is highlighted in the list, and its title and full text appear on
the right, line breaks included. Some texts contain odd marks (`**`, `##`, `#react`): those are Markdown marks and
tags, and in the advanced level you teach the app to read them. Finally, switch on the phone view (++F12++, then
++Ctrl++ + ++Shift++ + ++M++, on a Mac ++Cmd++ + ++Shift++ + ++M++): the note takes the place of the list, and the
"← Notes" button brings you back.
:::

:::mistake Common mistake
Drawing the editor without the condition: `<NoteEditor note={selected} … />`. At the start nothing is selected,
`selected` is `undefined`, and `note.title` throws an error. The page stays empty, and the console (++F12++ → Console)
says "Cannot read properties of undefined (reading 'title')".
:::

:::try Try it
Add a fifth note at the end of the `SAMPLE_NOTES` array, with a new `id`: it shows up in the list. Then give it an
`id` that already exists, for example `'sample-hooks'`, and look at the console: React warns that two items have the
same `key`, and when you click one of the two, both are highlighted. That is why the `id` must be unique. Remove the
fifth note afterwards.
:::

### Writing as you type

Now we want to write in the note. The title becomes an `<input>`, the text a `<textarea>`, and both are
[[controlled inputs|controlled input]]: their value comes from the note, and every keystroke changes the note. As in
today's notes apps, there is no "Save" button: whatever you type goes straight into the list of notes. Change
`NoteEditor.jsx`:

```jsx file=src/components/NoteEditor.jsx mark=1,9-22
function NoteEditor({ note, onChange, onClose }) {
  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Notes
        </button>
      </div>
      <input
        className="editor__title"
        aria-label="Title"
        placeholder="Title"
        value={note.title}
        onChange={(event) => onChange(note.id, { title: event.target.value })}
      />
      <textarea
        className="editor__body"
        aria-label="Note"
        placeholder="Start writing…"
        value={note.body}
        onChange={(event) => onChange(note.id, { body: event.target.value })}
      />
    </article>
  )
}

export default NoteEditor
```

The editor does not change the note itself; it only reports through the `onChange` prop which note changed
(`note.id`) and what changed (`{ title: … }` or `{ body: … }`). The notes live in `App`, and that is where they
change. `aria-label` gives the field a name for screen readers, since there is no visible label next to it; the grey
`placeholder` text is not enough, because it disappears as soon as you start typing.

`App` gets the function that changes a single note in the list. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=14-21,36
import { useState } from 'react'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)

  // We only store the id; the note itself is looked up in the list on every render.
  const selected = notes.find((note) => note.id === selectedId)

  function updateNote(id, changes) {
    // A new array: the changed note is replaced by a new object.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // the other notes stay as they were
      return { ...note, ...changes }
    })
    setNotes(newNotes)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Notes</h1>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Notes">
          <NoteList notes={notes} selectedId={selectedId} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              note={selected}
              onChange={updateNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Pick a note from the list.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

This time `map` gets an arrow function with curly braces: it can hold several lines, and `return` says what goes into
the new array. The other notes are carried over unchanged, and the changed one is replaced by a new object:
`{ ...note, ...changes }` copies every field of the note, then overwrites the ones that are in `changes`. If `changes`
is `{ title: 'Shopping' }`, the title is new and everything else stays. Ticking off a task in lesson 9 worked the same
way.

And this is where storing only the id pays off: `selected` is made from the fresh list on every render, so the list
and the editor always show the same thing. This is called a [[single source of truth]]: every piece of data lives in
one place, and everything else is worked out from it.

:::check Check
Open a note and type in its title: the title in the list changes letter by letter. Type in the text too: the grey line
in the list follows. Switch to another note and back: your changes are there. If you reload the page (++F5++),
though, everything is back to the start, because the notes live only in memory so far. The first step of the
intermediate level fixes that.
:::

:::mistake Common mistake
Copying the open note into a state of its own: `const [selected, setSelected] = useState(null)`, and
`setSelected(note)` on click. The editor then shows a copy that does not update while you type: the list changes, but
the field jumps back to the old text after every keystroke, as if it would not let you type. The same data in two
places always ends in trouble.
:::

:::try Try it
Show how many characters the note has, under the text box: in `NoteEditor`, put this line under the
`<textarea … />`, still before the `</article>`: `<p>{note.body.length} characters</p>`. This is a derived value too:
it updates by itself while you type.
:::

### A new note

We need a button that makes an empty note and opens it straight away. The new note should have the same shape as the
sample notes, and a unique id. The `crypto.randomUUID()` you know from lessons 6 and 9 is made for this: every call
gives a new, random, 36-character id (for example `'3f1c9a2e-…'`), a [[UUID]]. There are so many possible values that
two equal ones practically never come up. (As you saw in lesson 6, it only works on secure pages: on `https://`
addresses and on `localhost`.) `Date.now()` gives the current time as a number; you get to know it better in the
intermediate level.

Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=14-25,40-42,51,57
import { useState } from 'react'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)

  // We only store the id; the note itself is looked up in the list on every render.
  const selected = notes.find((note) => note.id === selectedId)

  function addNote() {
    // The same shape as the sample notes. Category and time are used in the intermediate level.
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      category: 'personal',
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
  }

  function updateNote(id, changes) {
    // A new array: the changed note is replaced by a new object.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // the other notes stay as they were
      return { ...note, ...changes }
    })
    setNotes(newNotes)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Notes</h1>
        <button type="button" className="button" onClick={addNote}>
          + New note
        </button>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Notes">
          <NoteList notes={notes} selectedId={selectedId} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              onChange={updateNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Pick a note from the list, or write a new one.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

- `[note, ...notes]` is a new array: the new note first, then the [[spread]] syntax lays out the old ones. So the new
  note lands at the top of the list.
- `setSelectedId(note.id)` opens it straight away.
- `key={selected.id}` is the trick you know from lessons 3 and 4: the [[key]] is not only for lists. When a
  component's `key` changes, React does not update the old one; it throws it away and draws a brand-new one in its
  place. So every note gets a fresh editor of its own, and that comes in handy right now.

The title of an empty note is an empty string, which would show nothing in the list. Change the two `<span>`s in
`NoteList.jsx`:

```jsx file=src/components/NoteList.jsx mark=12-13
function NoteList({ notes, selectedId, onSelect }) {
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="note-list__item"
            aria-current={note.id === selectedId}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title || 'Untitled note'}</span>
            <span className="note-list__excerpt">{note.body || 'No text yet'}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList
```

`||` means "or": if its left side is an empty string (an empty string counts as false), you get its right side.

Finally, the cursor should jump into the new note's title by itself. The title field in `NoteEditor.jsx` gets an
`autoFocus`:

```jsx file=src/components/NoteEditor.jsx mark=14
function NoteEditor({ note, onChange, onClose }) {
  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Notes
        </button>
      </div>
      <input
        className="editor__title"
        aria-label="Title"
        placeholder="Title"
        value={note.title}
        autoFocus={note.title === ''}
        onChange={(event) => onChange(note.id, { title: event.target.value })}
      />
      <textarea
        className="editor__body"
        aria-label="Note"
        placeholder="Start writing…"
        value={note.body}
        onChange={(event) => onChange(note.id, { body: event.target.value })}
      />
    </article>
  )
}

export default NoteEditor
```

`autoFocus` puts the cursor into the field when the field appears on the page. We ask for it only when the note has
no title: if it jumped into the field every time you opened a note, the keyboard would pop up on a phone at every tap.
This is where the `key` helps: since every note gets a new editor, the title field appears again for every new note,
and `autoFocus` runs again. Without the `key`, React would keep using the same field, and the cursor would not move.

:::check Check
Click "+ New note": an "Untitled note" appears at the top of the list, opens on the right, and the cursor blinks in its
title. Type a title, then some text: the list follows. Press the button again while a note is open: the cursor jumps
into the new note's title this time too.
:::

:::mistake Common mistake
`setNotes(notes.push(note))`. `push` changes the old array in place, and it does not return the array but its new
length, a number. So `notes` becomes a number, and on the next render `notes.find` throws an error ("notes.find is not
a function") and the page stays empty. We never change the state's array in place: always give `setNotes` a new
array.
:::

:::try Try it
Put the new note at the bottom of the list instead: `[...notes, note]`. Which one feels better? Then change it back.
:::

### Delete, with a confirmation

You must be able to delete a note too, but a slip of the mouse should not lose anything. So the "Delete" button only
asks first: "Delete this note?". Whether the question is showing is kept in a new piece of state, `confirming`. Only
the editor uses it, so that is where it lives: not every state has to live in `App`, only what several components
need. Here is the whole `NoteEditor.jsx`:

```jsx file=src/components/NoteEditor.jsx mark=1,3-5,29-45
import { useState } from 'react'

function NoteEditor({ note, onChange, onDelete, onClose }) {
  // The first click on Delete only asks whether you are sure.
  const [confirming, setConfirming] = useState(false)

  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Notes
        </button>
      </div>
      <input
        className="editor__title"
        aria-label="Title"
        placeholder="Title"
        value={note.title}
        autoFocus={note.title === ''}
        onChange={(event) => onChange(note.id, { title: event.target.value })}
      />
      <textarea
        className="editor__body"
        aria-label="Note"
        placeholder="Start writing…"
        value={note.body}
        onChange={(event) => onChange(note.id, { body: event.target.value })}
      />
      <footer className="editor__foot">
        {confirming ? (
          <span className="editor__confirm">
            Delete this note?
            <button type="button" className="button button--danger" onClick={() => onDelete(note.id)}>
              Yes, delete it
            </button>
            <button type="button" className="button button--ghost" autoFocus onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button type="button" className="button button--ghost" onClick={() => setConfirming(true)}>
            Delete
          </button>
        )}
      </footer>
    </article>
  )
}

export default NoteEditor
```

- While `confirming` is false, only the "Delete" button shows; when it is true, the question and two buttons take its
  place. "Yes, delete it" tells `App` through the `onDelete` prop, "Cancel" sets `confirming` back.
- When the "Delete" button disappears, the keyboard focus would disappear with it. `autoFocus` puts it on "Cancel", so
  someone who works with the keyboard carries on where they were after ++Enter++ or ++Tab++. "Cancel" gets it rather
  than the delete button, so a stray ++Enter++ deletes nothing.
- The `key` from the previous step helps here too: if the question is left open and you click another note, the new
  editor starts with its own, fresh `confirming`, so the question does not "move over" to the other note.

In `App`, deleting is a `filter`: the new array keeps every note except the one whose `id` matches. Here is the whole
`src/App.jsx`, as it looks at the end of the beginner level:

```jsx file=src/App.jsx mark=36-39,59
import { useState } from 'react'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)

  // We only store the id; the note itself is looked up in the list on every render.
  const selected = notes.find((note) => note.id === selectedId)

  function addNote() {
    // The same shape as the sample notes. Category and time are used in the intermediate level.
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      category: 'personal',
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
  }

  function updateNote(id, changes) {
    // A new array: the changed note is replaced by a new object.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // the other notes stay as they were
      return { ...note, ...changes }
    })
    setNotes(newNotes)
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id))
    setSelectedId(null)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Notes</h1>
        <button type="button" className="button" onClick={addNote}>
          + New note
        </button>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Notes">
          <NoteList notes={notes} selectedId={selectedId} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              onChange={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Pick a note from the list, or write a new one.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

`setSelectedId(null)` closes the editor. (`selected` would be `undefined` without it anyway, since `find` would not
find the deleted note, but it is cleaner when the state does not point at a note that no longer exists.)

If you delete every note, the list is empty, and it had better say so. An early `return` at the very start of
`NoteList` decides:

```jsx file=src/components/NoteList.jsx mark=2-4
function NoteList({ notes, selectedId, onSelect }) {
  if (notes.length === 0) {
    return <p className="note-list__empty">No notes here.</p>
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="note-list__item"
            aria-current={note.id === selectedId}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title || 'Untitled note'}</span>
            <span className="note-list__excerpt">{note.body || 'No text yet'}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList
```

:::check Check
Open a note and click "Delete": "Delete this note?" appears. "Cancel" brings the "Delete" button back, "Yes, delete it"
removes the note and closes the editor. If you delete everything, the list says "No notes here." That completes the
beginner level: commit it!
:::

:::mistake Common mistake
`note.id === id` in the `filter` instead of `!==`. `filter` keeps the items the condition is true for, so it works the
wrong way round: the note you wanted to delete stays, and all the others disappear.
:::

:::try Try it
Put the note's title into the question: `Delete {note.title || 'Untitled note'}?`.
:::

## Intermediate level {level=2}

### Saving in the browser: useLocalStorage

Right now every note is lost when you reload the page. In lesson 2 you already saved something in the browser's
[[localStorage]], and in lessons 9 and 10 you wrote a hook for it, `useLocalStorage`. You can copy over your file from
lesson 9; the version below does the same. Not the one from lesson 10, though: its `storage` listener links the
browser tabs, so the two "devices" of the advanced level would see each other's changes without any sync. Create `src/useLocalStorage.js`:

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

- localStorage can only store text. [[JSON]] is a text format that can describe arrays and objects too:
  `JSON.stringify` turns the array of notes into text, and `JSON.parse` turns it back.
- `useState(() => readValue(…))` is a [[lazy initial state]]: the storage is read only once, on the first render, not
  on every keystroke.
- The effect saves after every change. Its [[dependency array]] is `[key, value]`, so it runs whenever the value (or
  the key) changes.
- Thanks to [[try/catch]], the app does not crash if the browser blocks the storage or the saved text is broken.
- From the outside, the hook looks exactly like `useState`: it returns a value and a setter. That is why changing a
  single line in `App` is enough.

Change the start of `src/App.jsx` to this (the other lines stay):

```jsx file=src/App.jsx mark=2,9-10
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  // From now on the notes stay in the browser.
  const [notes, setNotes] = useLocalStorage('notes-app:notes', SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)
  // … the rest as before
```

The key starts with the app's name because every project you run at `localhost:5173` sees the same storage: this way
another lesson's `notes` key does not get mixed up with this one. `selectedId` can stay a plain `useState`: after a
reload, the app may well start with no note open.

:::check Check
Write a new note and reload the page: it is still there. In the developer tools (++F12++), under **Application** →
**Local storage** → `http://localhost:5173`, you find the `notes-app:notes` key; its value is the JSON text of your
notes. If you want the sample notes back, delete the key there (right-click → **Delete**) and reload the page.
:::

:::mistake Common mistake
`localStorage.setItem(key, value)`, without `JSON.stringify`. The array then becomes the text
"[object Object],[object Object]…", which `JSON.parse` cannot read back. You see no error, because `catch` swallows it,
but after a reload the sample notes always come back, and yours are nowhere.
:::

:::try Try it
Open the app in a second tab too, write something in one, then reload the other: it shows up there as well, because
the two tabs see the same storage. In the advanced level this becomes "two devices".
:::

### When did you last edit it?

Every note has an `updatedAt` field: it tells you when the note last changed. Its value is a [[timestamp]]: the number
of milliseconds since midnight on 1 January 1970 (in universal time), and `Date.now()` gives you the same kind of
number. A current timestamp is a number above 1,700,000,000,000. Why a number, and not a nice date? Because a number is
easy to compare and subtract, and JSON saves it without any trouble.

When a note changes, it should get a fresh timestamp. Change `updateNote` in `App`:

```jsx file=src/App.jsx mark=2,5
  function updateNote(id, changes) {
    // A new array: the changed note is replaced by a new object, with a fresh timestamp.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // the other notes stay as they were
      return { ...note, ...changes, updatedAt: Date.now() }
    })
    setNotes(newNotes)
  }
```

The most recently edited note should be at the top of the list. Sorting is the job of `sort`, which you know from
lesson 10: it takes a [[compare function]] that tells it, for two items (`a` and `b`), which one comes first. If it
returns a negative number, `a` goes first; if a positive one, `b`. `b.updatedAt - a.updatedAt` is positive when `b` is
the newer one, so the newer note goes first.

The catch, as you saw in lesson 10: `sort` works in place, that is, it rearranges the very array you call it on. And
the state's array must never be
changed. So we copy it first: `[...notes]` is a new array with the same notes. The sorted list is a derived value, not
stored: write it above the `selected` line, and give it to the list:

```jsx file=src/App.jsx mark=1-2
  // Derived value: the most recently edited note comes first. [...notes] is a copy.
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)
  // We only store the id; the note itself is looked up in the list on every render.
  const selected = notes.find((note) => note.id === selectedId)
```

And in the `return`, `<NoteList … />` gets the sorted list (`notes={sortedNotes}` instead of `notes={notes}`):

```jsx file=src/App.jsx
          <NoteList notes={sortedNotes} selectedId={selectedId} onSelect={setSelectedId} />
```

Now for showing the date. [[Intl.DateTimeFormat]] turns a timestamp into a readable date, following the habits of a
language: "23 November 2026 at 14:05" in British English, "2026. november 23. 14:05" in Hungarian. `Intl` is the
browser's built-in, language-aware formatter. Create `src/dates.js`:

```js file=src/dates.js
// The full date and time, for example "23 November 2026 at 14:05".
const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short' })

export function formatDate(timestamp) {
  return dateFormat.format(timestamp)
}
```

We create the formatter once, outside the function, because making one is much slower than using it. `'en-GB'` is
the code of English as used in Great Britain (`'en-US'` would put the month first); `dateStyle: 'long'` writes out
the month's name, and `timeStyle: 'short'` adds the hours and minutes.

It goes at the bottom of the editor. The import goes at the top of `NoteEditor.jsx`, and a new line at the start of
the `<footer>`:

```jsx file=src/components/NoteEditor.jsx mark=2,6
import { useState } from 'react'
import { formatDate } from '../dates.js'

// … the start of NoteEditor as before
      <footer className="editor__foot">
        <span>Edited {formatDate(note.updatedAt)}</span>
        {confirming ? (
        // … the rest as before
```

:::check Check
Open the "Weekend plans" note: at the bottom it says when it was last edited. Type something in it: the date
switches to the current time, and the note jumps to the top of the list. Notes you created earlier have a time
too, since `addNote` already gave them one in the beginner level.
:::

:::mistake Common mistake
`notes.sort(…)` without a copy. `sort` then rearranges the state's own array in the middle of a render. At first it
works, and that is exactly what makes it sneaky: a render may only read state, never change it, and mistakes like this
turn up later, somewhere else entirely, where they are hard to track down. Copy first (`[...notes]`), then sort.
:::

:::try Try it
Change `dateStyle: 'long'` to `'full'` in the formatter: the day of the week appears too. Then to `'short'`: numbers
only.
:::

### "5 minutes ago"

"23 November 2026 at 14:05" is precise, but for a note "5 minutes ago" or "yesterday" says more. That is what
[[Intl.RelativeTimeFormat]] does: you tell it how many units of time have passed, and in which unit, and it writes it
out properly. `format(-5, 'minute')` gives "5 minutes ago", `format(-1, 'day')` gives "yesterday" (that is what
`numeric: 'auto'` asks for; without it you would get "1 day ago"). A negative number is the past, a positive one the
future. Add these to the end of `src/dates.js`:

```js file=src/dates.js
// Relative time, for example "5 minutes ago" or "yesterday".
const relativeFormat = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' })

// We start with the biggest unit: the first one with at least one whole unit passed wins.
const UNITS = [
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
]

export function timeAgo(timestamp, now) {
  const diff = timestamp - now // the past is a negative number
  for (const [unit, size] of UNITS) {
    if (Math.abs(diff) >= size) return relativeFormat.format(Math.round(diff / size), unit)
  }
  return relativeFormat.format(0, 'second') // "now"
}
```

Each item of `UNITS` is a two-item array: the name of the unit and its length in milliseconds.
`for (const [unit, size] of UNITS)` takes them in turn and splits each one into two variables right away, the way you
usually do with the result of `useState`. `Math.abs` gives the value without its sign (the absolute value): for a
difference of 3 hours, a whole day is too much but an hour is enough, so you get "3 hours ago". If less than a minute
has passed, "now".

Why does `timeAgo` get `now` instead of calling `Date.now()` itself? Because "now" has to turn into "1 minute ago" by
itself, even if nobody touches anything. For that we need a clock that redraws the page every now and then. It is a
small custom hook, `src/useNow.js`:

```js file=src/useNow.js
import { useEffect, useState } from 'react'

// The current time, refreshed every half minute: so "now" turns into "1 minute ago" by itself.
function useNow() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30 * 1000)
    // Cleanup: when the component goes away, the clock stops too.
    return () => clearInterval(timer)
  }, [])

  return now
}

export default useNow
```

[[setInterval]] is like `setTimeout` from lesson 3, except that it calls the function not once but again and again,
here every 30 seconds. Each call gives the state a new `now`, and React redraws. Thanks to the empty dependency array,
the clock starts once, and the [[cleanup function]] stops it with `clearInterval` when the component goes away.

`App` starts a single clock and hands `now` to everyone who needs it. Here is the whole `src/App.jsx`, including the
changes from the previous step:

```jsx file=src/App.jsx mark=3,13,57,64
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useNow from './useNow.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  // From now on the notes stay in the browser.
  const [notes, setNotes] = useLocalStorage('notes-app:notes', SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)
  const now = useNow()

  // Derived value: the most recently edited note comes first. [...notes] is a copy.
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)
  // We only store the id; the note itself is looked up in the list on every render.
  const selected = notes.find((note) => note.id === selectedId)

  function addNote() {
    // The same shape as the sample notes. Category and time are used in the intermediate level.
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      category: 'personal',
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
  }

  function updateNote(id, changes) {
    // A new array: the changed note is replaced by a new object, with a fresh timestamp.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // the other notes stay as they were
      return { ...note, ...changes, updatedAt: Date.now() }
    })
    setNotes(newNotes)
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id))
    setSelectedId(null)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Notes</h1>
        <button type="button" className="button" onClick={addNote}>
          + New note
        </button>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Notes">
          <NoteList notes={sortedNotes} selectedId={selectedId} now={now} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              now={now}
              onChange={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Pick a note from the list, or write a new one.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

In the list, every note gets a third line with the time. Here is the whole `NoteList.jsx`:

```jsx file=src/components/NoteList.jsx mark=1,3,20
import { timeAgo } from '../dates.js'

function NoteList({ notes, selectedId, now, onSelect }) {
  if (notes.length === 0) {
    return <p className="note-list__empty">No notes here.</p>
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="note-list__item"
            aria-current={note.id === selectedId}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title || 'Untitled note'}</span>
            <span className="note-list__excerpt">{note.body || 'No text yet'}</span>
            <span className="note-list__meta">{timeAgo(note.updatedAt, now)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList
```

The editor should show the relative time too, with the exact date in a tooltip when you hover over it: that is what
the `title` attribute is for. In `NoteEditor.jsx`, the import and the first line of the function grow, and the first
line of the `<footer>` changes:

```jsx file=src/components/NoteEditor.jsx mark=2,4,8
import { useState } from 'react'
import { formatDate, timeAgo } from '../dates.js'

function NoteEditor({ note, now, onChange, onDelete, onClose }) {
  // … everything as before, down to the <footer>

      <footer className="editor__foot">
        <span title={formatDate(note.updatedAt)}>Edited {timeAgo(note.updatedAt, now)}</span>
        {confirming ? (
        // … the rest as before
```

:::check Check
The list shows the time under each note, for example "2 hours ago", "yesterday" or "3 days ago". Type in a note:
both the list and the bottom of the editor say "now". Wait a minute and a half without touching anything: it changes
to "1 minute ago" by itself (the clock ticks every half minute, so this happens somewhere between one minute and a
minute and a half). Hover over the time at the bottom of the editor: the tooltip shows the exact date.
:::

:::mistake Common mistake
Leaving out `useNow`: `App` starts no clock, and `NoteList` calls `timeAgo(note.updatedAt, Date.now())` itself. At
first it looks the same, but "now" never changes by itself, only when the list redraws for some other reason, for
example when you type. The `useNow` clock is there exactly so that the passing of time causes a redraw too.
:::

:::try Try it
Add a week at the start of `UNITS` too: `['week', 7 * 24 * 60 * 60 * 1000]`. To see it, change the time of the
portfolio note in `src/sampleNotes.js` to `now - 10 * DAY`, delete the `notes-app:notes` key (Application → Local
storage), and reload the page: under the note it says "last week" (that is what `numeric: 'auto'` asks for; without
it, you would get "1 week ago").
:::

### Search that forgives accents

With many notes, you need to search. The search text is a new piece of state (`query`), and the field is a controlled
input. The main point, again, is what we do **not** store: the list of matches is a derived value, worked out from the
notes and the search text on every render.

When does a note match? When the search text appears in its title or its text, whatever the capitals, and ideally
whatever the accents too: someone who quickly types "cafe" on a phone should still find "Café ideas". This is
[[normalization]]: we make a simplified version of both texts and compare those. Create `src/notes.js` for the
helpers that belong to notes:

```js file=src/notes.js
// Lowercase, without accents: so a search for "cafe" finds "Café" too.
export function normalize(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

// Does the search text appear in the note's title or text?
export function matchesQuery(note, query) {
  const wanted = normalize(query.trim())
  if (wanted === '') return true
  return normalize(note.title + ' ' + note.body).includes(wanted)
}
```

- `normalize('NFD')` splits every accented letter into two parts: "é" becomes an "e" and a separate accent mark.
- Our own `normalize` function does not call itself: `text.normalize(…)` is a built-in function of the text, it just
  has the same name as ours.
- `/\p{M}/gu` is a [[regular expression]], a pattern that JavaScript can search text for. It sits between two
  slashes: `\p{M}` means "any accent mark" (M for mark), `g` asks for every occurrence, not just the first one, and `u`
  switches on the Unicode mode that `\p{…}` needs (Unicode is the standard that gives every character of every
  language, accents included, a code of its own). `replace` swaps every match for its second argument, here an empty
  string: the accents disappear.
- `toLowerCase()` makes everything lowercase, `trim()` cuts the spaces off both ends, and `includes` tells you whether
  one text contains the other.
- With an empty search every note matches, so the list is complete.

`App` gets the new state, the search field goes into the header, and the list of matches takes the place of the
sorted list. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=5,15,17-21,36-37,58-65,72
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useNow from './useNow.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import { matchesQuery } from './notes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import './App.css'

function App() {
  // From now on the notes stay in the browser.
  const [notes, setNotes] = useLocalStorage('notes-app:notes', SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)
  const now = useNow()
  const [query, setQuery] = useState('')

  // Derived values: worked out from the state on every render.
  // filter returns a new array, so sort no longer rearranges the state.
  const visibleNotes = notes
    .filter((note) => matchesQuery(note, query))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  // We only store the id; the note itself is looked up in the list on every render.
  const selected = notes.find((note) => note.id === selectedId)

  function addNote() {
    // The same shape as the sample notes. Category and time are used in the intermediate level.
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      category: 'personal',
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
    // The new note should not hide behind a search.
    setQuery('')
  }

  function updateNote(id, changes) {
    // A new array: the changed note is replaced by a new object, with a fresh timestamp.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // the other notes stay as they were
      return { ...note, ...changes, updatedAt: Date.now() }
    })
    setNotes(newNotes)
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id))
    setSelectedId(null)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Notes</h1>
        <input
          type="search"
          className="notes__search"
          aria-label="Search notes"
          placeholder="Search…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" className="button" onClick={addNote}>
          + New note
        </button>
      </header>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Notes">
          <NoteList notes={visibleNotes} selectedId={selectedId} now={now} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              now={now}
              onChange={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Pick a note from the list, or write a new one.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

`visibleNotes` is a chain: `filter` picks the matches, and `sort` puts them in order. Because `filter` always returns
a new array, `sort` now rearranges that copy, and the `[...notes]` copy is no longer needed. `type="search"` asks for a
search field: many browsers add a small ✕ at its end, and ++Esc++ empties it too.

The open note (`selected`) still comes from the whole `notes` list, not from the matches: if it drops out of the list
while you type a search, it stays open in the editor.

:::check Check
Type `meeting` in the search field: only "Meeting notes – Monday" is left. `MEETING` works the same way. Write a new
note titled "Café ideas" (if your keyboard has no é, copy the title from here), then search for `cafe`: it finds it.
When nothing matches, the list says "No notes here.";
the ✕ or ++Esc++ brings every note back.
:::

:::mistake Common mistake
Putting the matches into a state of their own (`const [results, setResults] = useState(notes)`) and updating it from
a `useEffect` whenever the search changes. It seems to work, but every keystroke renders twice, and if a dependency is
missing, the list shows old notes: an edited title, for example, does not update among the matches. Whatever you can
work out from the state, work it out; do not store it.
:::

:::try Try it
Show above the list how many notes you see: a `<p>{visibleNotes.length} notes</p>` at the start of the `<nav>`.
:::

### Categories

The sample notes have a `category` field: `'personal'`, `'work'`, `'ideas'` or `'learning'`. That is the category's
**key**: short, English, never changing, and that is what we store in the note. On the screen, though, you see its
**label**, in the user's language. An object ties the two together. Add this to the end of `src/notes.js`:

```js file=src/notes.js
// The categories: the key is stored in the note, the label is shown on the screen.
export const CATEGORIES = {
  personal: 'Personal',
  work: 'Work',
  ideas: 'Ideas',
  learning: 'Learning',
}
```

`CATEGORIES.work` (or `CATEGORIES['work']`) is "Work", and `Object.keys(CATEGORIES)` is the array of keys:
`['personal', 'work', 'ideas', 'learning']`.

The category is needed in three places. First, in the editor: a drop-down list (`<select>`) with the note's category.
It is a controlled input too, just like the title: `value` comes from the note, and `onChange` reports the change. It
goes into the editor's top bar, next to the "← Notes" button. Here is the whole `NoteEditor.jsx`:

```jsx file=src/components/NoteEditor.jsx mark=2,15-26
import { useState } from 'react'
import { CATEGORIES } from '../notes.js'
import { formatDate, timeAgo } from '../dates.js'

function NoteEditor({ note, now, onChange, onDelete, onClose }) {
  // The first click on Delete only asks whether you are sure.
  const [confirming, setConfirming] = useState(false)

  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Notes
        </button>
        <select
          className="editor__category"
          aria-label="Category"
          value={note.category}
          onChange={(event) => onChange(note.id, { category: event.target.value })}
        >
          {Object.keys(CATEGORIES).map((key) => (
            <option key={key} value={key}>
              {CATEGORIES[key]}
            </option>
          ))}
        </select>
      </div>
      <input
        className="editor__title"
        aria-label="Title"
        placeholder="Title"
        value={note.title}
        autoFocus={note.title === ''}
        onChange={(event) => onChange(note.id, { title: event.target.value })}
      />
      <textarea
        className="editor__body"
        aria-label="Note"
        placeholder="Start writing…"
        value={note.body}
        onChange={(event) => onChange(note.id, { body: event.target.value })}
      />
      <footer className="editor__foot">
        <span title={formatDate(note.updatedAt)}>Edited {timeAgo(note.updatedAt, now)}</span>
        {confirming ? (
          <span className="editor__confirm">
            Delete this note?
            <button type="button" className="button button--danger" onClick={() => onDelete(note.id)}>
              Yes, delete it
            </button>
            <button type="button" className="button button--ghost" autoFocus onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button type="button" className="button button--ghost" onClick={() => setConfirming(true)}>
            Delete
          </button>
        )}
      </footer>
    </article>
  )
}

export default NoteEditor
```

An `<option>`'s `value` is the key, its text is the label. `updateNote` knows nothing about categories, yet it works
with them: `{ category: 'work' }` merges into the note just like the title does.

Second, in the list: a coloured dot and the category's label go at the start of the line with the time. The dot's
colour comes from `App.css`, through the `dot--personal`, `dot--work`, … classes. Here is the whole `NoteList.jsx`:

```jsx file=src/components/NoteList.jsx mark=1,21-24
import { CATEGORIES } from '../notes.js'
import { timeAgo } from '../dates.js'

function NoteList({ notes, selectedId, now, onSelect }) {
  if (notes.length === 0) {
    return <p className="note-list__empty">No notes here.</p>
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="note-list__item"
            aria-current={note.id === selectedId}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title || 'Untitled note'}</span>
            <span className="note-list__excerpt">{note.body || 'No text yet'}</span>
            <span className="note-list__meta">
              <span className={`dot dot--${note.category}`} aria-hidden="true" />
              {CATEGORIES[note.category]} · {timeAgo(note.updatedAt, now)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default NoteList
```

The `className` value sits between backticks: it is a [[template literal]], where the category's key takes the place
of `${…}`, so a work note gets the `dot dot--work` class.

Third, a filter above the list: a row of "chips", round buttons, one for each category, plus "All". Each one shows its
count too. Create `src/components/CategoryFilter.jsx`:

```jsx file=src/components/CategoryFilter.jsx
import { CATEGORIES } from '../notes.js'

function CategoryFilter({ notes, value, onChange }) {
  // How many notes are in a category? 'all' (All) counts every note.
  function countOf(key) {
    if (key === 'all') return notes.length
    return notes.filter((note) => note.category === key).length
  }

  return (
    <div className="filters" role="group" aria-label="Categories">
      {['all', ...Object.keys(CATEGORIES)].map((key) => (
        <button
          key={key}
          type="button"
          className="chip"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
        >
          {key !== 'all' && <span className={`dot dot--${key}`} aria-hidden="true" />}
          {key === 'all' ? 'All' : CATEGORIES[key]}
          <span className="chip__count">{countOf(key)}</span>
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
```

- `['all', ...Object.keys(CATEGORIES)]` is a new array: `'all'` first, then the four category keys.
- `aria-pressed` marks a button that "stays pressed": `true` for the chosen filter. Screen readers say whether it is on,
  and the CSS colours the chip based on it.
- `role="group"` and `aria-label` put the buttons into a named group, the way `<fieldset>` and `<legend>` grouped the
  checkboxes in lesson 3.
- The count is a derived value too: `countOf` counts it on every render.

Last, `App`: a new state (`category`, starting as `'all'`), a second `filter` in the chain, the filter under the
header, and a new note lands in the category you are looking at. Here is the whole `src/App.jsx`, as it looks at the
end of the intermediate level:

```jsx file=src/App.jsx mark=8,17,22,33-34,73-75
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useNow from './useNow.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import { matchesQuery } from './notes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import './App.css'

function App() {
  // From now on the notes stay in the browser.
  const [notes, setNotes] = useLocalStorage('notes-app:notes', SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)
  const now = useNow()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  // Derived values: worked out from the state on every render.
  // filter returns a new array, so sort no longer rearranges the state.
  const visibleNotes = notes
    .filter((note) => category === 'all' || note.category === category)
    .filter((note) => matchesQuery(note, query))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  // We only store the id; the note itself is looked up in the list on every render.
  const selected = notes.find((note) => note.id === selectedId)

  function addNote() {
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      // If you are looking at one category, the new note goes into it.
      category: category === 'all' ? 'personal' : category,
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
    // The new note should not hide behind a search.
    setQuery('')
  }

  function updateNote(id, changes) {
    // A new array: the changed note is replaced by a new object, with a fresh timestamp.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // the other notes stay as they were
      return { ...note, ...changes, updatedAt: Date.now() }
    })
    setNotes(newNotes)
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id))
    setSelectedId(null)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Notes</h1>
        <input
          type="search"
          className="notes__search"
          aria-label="Search notes"
          placeholder="Search…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" className="button" onClick={addNote}>
          + New note
        </button>
      </header>
      <div className="notes__filters">
        <CategoryFilter notes={notes} value={category} onChange={setCategory} />
      </div>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Notes">
          <NoteList notes={visibleNotes} selectedId={selectedId} now={now} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              now={now}
              onChange={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Pick a note from the list, or write a new one.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
```

In the chain, `category === 'all' || note.category === category` reads: "if we are looking at all of them, or if the
note is in this category". Every `filter` narrows the result of the one before, so category and search work together.
`CategoryFilter` gets the whole `notes` list, not the matches: that way the counts stay put while you search.

:::check Check
Above the list you see "All 4" (or however many notes you have) and the four categories, each with its own count.
Click the "Work" chip: only "Meeting notes – Monday" is left. Open it and set its category to "Ideas": it leaves the
list, the "Work" count drops by one, and the "Ideas" count goes up. While the "Ideas" chip is chosen, click
"+ New note": the new note lands in "Ideas". That completes the intermediate level: commit it!
:::

:::mistake Common mistake
Storing the label instead of the key: `category: 'Work'`. `CATEGORIES['Work']` is `undefined`, so the category's name
disappears from the list, the dot turns grey, and the "Work" filter does not find the note either. And if the app ever
speaks Hungarian too, or you rename the category, the old notes would lose their category. The key never changes; the
label can change any time.
:::

:::try Try it
Add a fifth category: `shopping: 'Shopping'`. Its dot is grey; if you want a colour, add a
`.dot--shopping { background: #feb800; }` rule to `App.css`.
:::

## Advanced level {level=3}

### Markdown preview

[[Markdown]] is a simple way of writing formatted text: a few marks tell what is a heading, a list or bold. In the
note it stays plain text (so you can type it into any text box), but a program can display it nicely. The most
important marks:

```md
# Heading
## Subheading
- list item
- another list item
A paragraph with a **bold** and an *italic* word, and some `code`.
```

Some of the sample notes already contain such marks. We write a small Markdown reader that turns them into React
elements, and the editor gets a "Preview" tab. Real Markdown can do much more; we teach the app the six marks above.
Create `src/components/Markdown.jsx`:

```jsx file=src/components/Markdown.jsx
// A small Markdown reader: # heading, ## subheading, - list, **bold**, *italic* and `code`.
// We never produce HTML, only React elements: whatever is in the note stays text.

// 1. Split the text into blocks, line by line: heading, subheading, list or paragraph.
function parseBlocks(text) {
  const blocks = []
  for (const line of text.split('\n')) {
    const last = blocks[blocks.length - 1]
    if (line.startsWith('- ')) {
      // List items that follow each other go into one list.
      if (last && last.type === 'list') last.items.push(line.slice(2))
      else blocks.push({ type: 'list', items: [line.slice(2)] })
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'subheading', text: line.slice(3) })
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', text: line.slice(2) })
    } else if (line.trim() !== '') {
      blocks.push({ type: 'paragraph', text: line })
    }
  }
  return blocks
}

// 2. Inside one line: thanks to the brackets in the pattern, split returns the matched parts too.
function renderInline(text) {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*|`.+?`)/)
  return parts.map((part, i) => {
    if (i % 2 === 0) return part // the even places hold plain text
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    return <em key={i}>{part.slice(1, -1)}</em>
  })
}

// 3. The blocks become React elements.
function Markdown({ text }) {
  const blocks = parseBlocks(text)
  if (blocks.length === 0) {
    return <p className="markdown markdown__empty">Nothing to show yet.</p>
  }

  return (
    <div className="markdown">
      {blocks.map((block, i) => {
        if (block.type === 'heading') return <h2 key={i}>{renderInline(block.text)}</h2>
        if (block.type === 'subheading') return <h3 key={i}>{renderInline(block.text)}</h3>
        if (block.type === 'list') {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{renderInline(block.text)}</p>
      })}
    </div>
  )
}

export default Markdown
```

It works in three stages:

1. `parseBlocks` cuts the text into lines with `split('\n')` (`\n` is the line break), and decides what each line
   is. `startsWith` tells you whether a line starts with a given text, and `slice(2)` cuts off the first two
   characters, that is, the mark and the space after it. The result is a plain array of objects:
   `{ type: 'heading', text: '…' }`. List items that follow each other gather in the `items` array of one list; that
   is our own array, built on the spot, not state, so `push` is fine.
2. `renderInline` looks for `**…**`, `*…*` and the parts between backticks inside a line, with a regular expression.
   `\*` is a real star: on its own, `*` means something else in a pattern, so it needs a `\` in front of it. `|` means
   "or": any of the three parts can match. `.+?` means "at least one character, but as few as possible", so the
   pattern stops at the first closing mark. When the split pattern is wrapped in round brackets, the matched parts end
   up in the result too, always at the odd places (1, 3, 5…), as with the templates in lesson 4: `'a **b** c'`
   becomes `['a ', '**b**', ' c']`. The even places (0, 2, 4…) hold plain text, the odd ones the formatted parts.
   `%` is the [[modulo]] from the same lesson, the remainder of a division: `i % 2` is 0 at the even places and 1 at
   the odd ones. `slice(2, -2)` cuts two characters off both ends.
3. The `Markdown` component draws elements from the blocks. Here the `key` can be the position (`i`), because these
   elements hold no state and are made from scratch on every render.

The editor gets a new state (`preview`: are we looking at the preview?), two tabs in the top bar, and in preview mode
`Markdown` takes the place of the text box. Here is the whole `NoteEditor.jsx`:

```jsx file=src/components/NoteEditor.jsx mark=4,9-10,30-37,47-49,57
import { useState } from 'react'
import { CATEGORIES } from '../notes.js'
import { formatDate, timeAgo } from '../dates.js'
import Markdown from './Markdown.jsx'

function NoteEditor({ note, now, onChange, onDelete, onClose }) {
  // The first click on Delete only asks whether you are sure.
  const [confirming, setConfirming] = useState(false)
  // Are we editing the text, or looking at its preview?
  const [preview, setPreview] = useState(false)

  return (
    <article className="editor">
      <div className="editor__bar">
        <button type="button" className="button button--ghost editor__back" onClick={onClose}>
          ← Notes
        </button>
        <select
          className="editor__category"
          aria-label="Category"
          value={note.category}
          onChange={(event) => onChange(note.id, { category: event.target.value })}
        >
          {Object.keys(CATEGORIES).map((key) => (
            <option key={key} value={key}>
              {CATEGORIES[key]}
            </option>
          ))}
        </select>
        <div className="editor__tabs">
          <button type="button" className="chip" aria-pressed={!preview} onClick={() => setPreview(false)}>
            Edit
          </button>
          <button type="button" className="chip" aria-pressed={preview} onClick={() => setPreview(true)}>
            Preview
          </button>
        </div>
      </div>
      <input
        className="editor__title"
        aria-label="Title"
        placeholder="Title"
        value={note.title}
        autoFocus={note.title === ''}
        onChange={(event) => onChange(note.id, { title: event.target.value })}
      />
      {preview ? (
        <Markdown text={note.body} />
      ) : (
        <textarea
          className="editor__body"
          aria-label="Note"
          placeholder="Start writing…"
          value={note.body}
          onChange={(event) => onChange(note.id, { body: event.target.value })}
        />
      )}
      <footer className="editor__foot">
        <span title={formatDate(note.updatedAt)}>Edited {timeAgo(note.updatedAt, now)}</span>
        {confirming ? (
          <span className="editor__confirm">
            Delete this note?
            <button type="button" className="button button--danger" onClick={() => onDelete(note.id)}>
              Yes, delete it
            </button>
            <button type="button" className="button button--ghost" autoFocus onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button type="button" className="button button--ghost" onClick={() => setConfirming(true)}>
            Delete
          </button>
        )}
      </footer>
    </article>
  )
}

export default NoteEditor
```

The two tabs use the same `chip` styles and the same `aria-pressed` as the category filter. `!preview` is the opposite
of `preview`: "Edit" is pressed when we are not looking at the preview. Thanks to the `key`, every note opens on the
"Edit" tab.

:::check Check
Open the "React hooks cheat sheet" note and click the "Preview" tab: the three lines became a bulleted list,
`useState` and `useEffect` are bold, "custom hooks" is in italics, and `use…` shows as code. In the "Meeting notes"
note, "Decisions" became a subheading. Switch back to the "Edit" tab and type a `# Shopping` line into a note, with
two lines starting with `- ` under it: in the preview, a heading and a list. Now type `<b>hello</b>`: the preview shows
it exactly like that, character by character, not in bold.
:::

:::concept Why not produce HTML?
It may look obvious to turn Markdown into an HTML string and put it into the page with `dangerouslySetInnerHTML`. The
name is scary for a reason: whatever goes in that way, the browser runs as HTML. If someone writes
`<img src=x onerror="…">` into a shared note, the JavaScript between the quotes runs for everyone who opens it. This is
[[XSS]] (cross-site scripting), one of the most common attacks on the web. Text inside React elements, on the other
hand, always stays text: React makes sure a `<` shows up as a `<` character. That is why we build the preview from
elements.
:::

:::mistake Common mistake
Leaving out the round brackets around the split pattern. Then split treats the matched parts as mere separators and
throws them away: the bold, italic and code words vanish, and the plain text after them slides onto the odd places,
so it turns italic and loses its first and last character. In the hooks note,
`**useState**: values that change while the page is open` becomes an italic " values that change while the page is
ope".
:::

:::try Try it
Teach it strikethrough: `~~done~~` should become `<s>done</s>`. The pattern needs a new part (`~~.+?~~`), and
`renderInline` a new line modelled on the one for `**`.
:::

### Tags in the text

A note can have only one category, but any number of tags. We do not type tags into a separate field but into the
text itself, the way social networks do: `#recipe`, `#2026-plans`. So the list of tags is a derived value once again:
we work it out from the text. Add this to the end of `src/notes.js`:

```js file=src/notes.js
// A #tag: a hash, then letters, digits, hyphens or underscores (#work, #2026-plans).
const TAG_PATTERN = /(^|\s)#([\p{L}\p{N}_-]+)/gu

// The tags in a text, lowercase, each one only once.
export function findTags(text) {
  const tags = []
  for (const match of text.matchAll(TAG_PATTERN)) {
    const tag = match[2].toLowerCase()
    if (!tags.includes(tag)) tags.push(tag)
  }
  return tags
}
```

Let us read the pattern piece by piece:

- `(^|\s)`: a tag starts at the beginning of the text (`^`) or after a space or a line break (`\s`). So `C#` or a
  `site.com/#hash` is not a tag.
- `#`: the hash itself.
- `([\p{L}\p{N}_-]+)`: square brackets list the allowed characters: any letter (`\p{L}`, accented ones too), digit
  (`\p{N}`), underscore or hyphen; `+` means "one or more". So `# Heading` is not a tag, since a space follows the
  `#`.
- Round brackets mark groups. `matchAll` returns every match, and in each one `match[2]` is the second group, the tag
  itself without the hash.

The row of tags goes under the categories, with the same chips. One tag can be chosen at a time, and clicking the
chosen one again switches the filter off. Create `src/components/TagFilter.jsx`:

```jsx file=src/components/TagFilter.jsx
function TagFilter({ tags, value, onChange }) {
  // If no note has a tag yet, the row does not appear at all.
  if (tags.length === 0) return null

  // Clicking the tag that is already chosen switches the filter off (null = no tag filter).
  function toggle(tag) {
    onChange(value === tag ? null : tag)
  }

  return (
    <div className="filters" role="group" aria-label="Tags">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className="chip chip--tag"
          aria-pressed={value === tag}
          onClick={() => toggle(tag)}
        >
          #{tag}
        </button>
      ))}
    </div>
  )
}

export default TagFilter
```

A component may also return `null`: then it draws nothing.

`App` gets a new state (`tag`, starting as `null`), a third `filter` in the chain, and the list of all tags. Four
places change in `src/App.jsx`. Among the imports, the `notes.js` line grows, and a new one goes under the
`CategoryFilter` line:

```jsx file=src/App.jsx mark=1,3
import { findTags, matchesQuery } from './notes.js'
import CategoryFilter from './components/CategoryFilter.jsx'
import TagFilter from './components/TagFilter.jsx'
```

`tag` goes among the states, under `category`, and the tag filter and the list of all tags go among the derived
values. The comments stay, and the `selected` lines come after `allTags`, as before:

```jsx file=src/App.jsx mark=2,8,11-13
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState(null)

  // Derived values: worked out from the state on every render.
  // filter returns a new array, so sort no longer rearranges the state.
  const visibleNotes = notes
    .filter((note) => category === 'all' || note.category === category)
    .filter((note) => tag === null || findTags(note.body).includes(tag))
    .filter((note) => matchesQuery(note, query))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  // Every tag that appears in any note, once, in alphabetical order.
  const allTags = [...new Set(notes.flatMap((note) => findTags(note.body)))]
  allTags.sort((a, b) => a.localeCompare(b))
```

A new note should not hide behind a tag filter either. The end of `addNote`:

```jsx file=src/App.jsx mark=3,5
    setNotes([note, ...notes])
    setSelectedId(note.id)
    // The new note should not hide behind a search or a tag.
    setQuery('')
    setTag(null)
  }
```

Finally, in the `return`, the row of tags goes under the categories:

```jsx file=src/App.jsx mark=3
      <div className="notes__filters">
        <CategoryFilter notes={notes} value={category} onChange={setCategory} />
        <TagFilter tags={allTags} value={tag} onChange={setTag} />
      </div>
```

- `flatMap` is like `map`, except that it flattens the returned arrays into a single array: the per-note lists
  `['react', 'learning']`, `['release']`, … become one long list.
- The same tag can appear in several notes. The [[Set]] you know from lesson 3 keeps every value only once, and
  `[...new Set(…)]` spreads it back out into an array with the [[spread]] syntax (in lesson 4 we used `Array.from`
  for this).
- `localeCompare` compares two texts by the alphabet of the browser's language (in lesson 10 we asked for English
  specially, with the `'en'` argument), so accented words sort among their plain neighbours instead of after "z",
  where a plain `sort()` would put them. Sorting in place is fine here, because
  `allTags` is a freshly made array, not state.

:::check Check
The row of tags appears under the categories: `#learning`, `#portfolio`, `#react`, `#release`, `#weekend`. Click
`#react`: only "React hooks cheat sheet" is left; click it again: every note comes back. Type `#recipe` at the end of a
note: the new chip is born while you type. The `## Decisions` line of "Meeting notes" does not become a tag.
:::

:::mistake Common mistake
Leaving the `g` off the end of the pattern: `/(^|\s)#([\p{L}\p{N}_-]+)/u`. `matchAll` only works with a "global"
pattern, so it throws an error ("String.prototype.matchAll called with a non-global RegExp argument"), and the page
stays empty.
:::

:::try Try it
Show each note's tags in the list too: in `NoteList`, after the third `<span>`, one more line, for example
`{findTags(note.body).map((tag) => '#' + tag).join(' ')}` (do not forget to import `findTags`).
:::

### Sync with a server

Your notes now live in the browser's storage: if you want to see them on your phone too, you need a server that all
your devices can reach. A real server runs on another computer, but this course uses no outside services, so the
exercise came with a pretend one: `src/fakeApi.js`. It behaves like a real one: every request takes a little while,
and when there is no internet, it cannot be reached. Its "database" is a localStorage key (`notes-app:server`), so
every tab of the browser reaches the same server, just as two separate devices would. It knows two requests:

- `getNotes()`: every note on the server,
- `saveNotes(notes)`: from now on, this list should be on the server.

Both return a [[Promise]], like the clipboard did in lesson 3; in an [[async function]], `await` waits for the answer,
and `try/catch` catches the error.

The plan for [[syncing]]:

1. Fetch the server's notes.
2. Merge them with ours: if a note is in both places, the version that was changed later wins (that is what
   `updatedAt` is for). Whatever is only in one place gets in.
3. Send the merged list back to the server, and carry on with it ourselves.

Create the hook in the `src/useSync.js` file:

```js file=src/useSync.js
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { getNotes, saveNotes } from './fakeApi.js'

// Two lists of notes become one: of every note, the version changed later stays.
function mergeNotes(local, remote) {
  const newest = {}
  for (const note of [...remote, ...local]) {
    const seen = newest[note.id]
    if (!seen || note.updatedAt > seen.updatedAt) newest[note.id] = note
  }
  return Object.values(newest)
}

function useSync(notes, setNotes) {
  const [status, setStatus] = useState('idle') // 'idle', 'syncing' or 'error'
  const [lastSync, setLastSync] = useLocalStorage('notes-app:last-sync', 0)

  // Derived value: how many notes changed since the last sync?
  const pending = notes.filter((note) => note.updatedAt > lastSync).length

  async function sync() {
    const startedAt = Date.now()
    setStatus('syncing')
    try {
      const serverNotes = await getNotes()
      const merged = mergeNotes(notes, serverNotes)
      await saveNotes(merged)
      // You may have typed during the sync: merge into the fresh state instead of overwriting it.
      setNotes((current) => mergeNotes(current, merged))
      setLastSync(startedAt)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return { status, pending, lastSync, sync }
}

export default useSync
```

- `mergeNotes` uses an object as a "register": the key is the note's `id`, the value the newest version seen so far.
  The server's notes go in first, then ours; a note only overwrites the earlier one if it was changed later.
  `Object.values` at the end gives the array of values: the merged list.
- `lastSync` is when the last successful sync started, and thanks to `useLocalStorage` it survives a reload. Whatever
  changed since then is "not on the server yet": `pending` is the number of those notes, and it is a derived value as
  well.
- The two `await`s can take as much as a second and a half, and you may keep typing meanwhile. Inside this function,
  `notes` is still the list from when the sync started, so `setNotes(merged)` would wipe out what you typed in the
  meantime. So `setNotes` gets a function instead: an [[updater function]] like the ones in lessons 6–8 receives the
  freshest state from React as its argument (`current`), and we merge the server's changes into that. Your typing is
  the newer, so it wins.

The status bar is a small component at the bottom of the app: a coloured dot, a sentence about what is going on, the
number of waiting changes and a button. Create `src/components/SyncStatus.jsx`:

```jsx file=src/components/SyncStatus.jsx
import { timeAgo } from '../dates.js'

function SyncStatus({ status, pending, lastSync, now, onSync }) {
  // The message follows from the state; a later line overrides an earlier one.
  let message = 'Not synced yet.'
  if (lastSync > 0) message = `Synced ${timeAgo(lastSync, now)}`
  if (status === 'syncing') message = 'Syncing…'
  if (status === 'error') message = 'Could not reach the server.'

  return (
    <footer className={`sync sync--${status}`}>
      <span className="sync__dot" aria-hidden="true" />
      <p className="sync__text" role="status">
        {message}
        {pending > 0 && <span className="sync__pending">Not on the server yet: {pending}</span>}
      </p>
      <button
        type="button"
        className="button button--ghost"
        disabled={status === 'syncing'}
        onClick={onSync}
      >
        {status === 'error' ? 'Try again' : 'Sync'}
      </button>
    </footer>
  )
}

export default SyncStatus
```

Thanks to `role="status"`, screen readers read out the new message when it changes. The button is `disabled` during a
sync, so two cannot start at once.

Finally, `App`, where three places change. Among the imports, `useSync` goes under `useNow`, and `SyncStatus` under
`TagFilter`:

```jsx file=src/App.jsx mark=4,11
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useNow from './useNow.js'
import useSync from './useSync.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import { findTags, matchesQuery } from './notes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import TagFilter from './components/TagFilter.jsx'
import SyncStatus from './components/SyncStatus.jsx'
import './App.css'
```

The hook goes among the states, under `tag`. It gets the notes and their setter, and gives back everything the status
bar needs:

```jsx file=src/App.jsx mark=2
  const [tag, setTag] = useState(null)
  const { status, pending, lastSync, sync } = useSync(notes, setNotes)
```

The status bar goes at the very end of the `return`: under the `</div>` that closes `notes__panes`, still inside the
outermost `<div>`:

```jsx file=src/App.jsx mark=3
        </main>
      </div>
      <SyncStatus status={status} pending={pending} lastSync={lastSync} now={now} onSync={sync} />
    </div>
  )
```

:::check Check
The status bar sits at the bottom of the app: "Not synced yet.", next to it "Not on the server yet: 4" (or however
many notes you have). Click "Sync": for a moment it says "Syncing…", then "Synced now", the counter disappears, and a
new note shows up in the list, "Written on my phone": it was waiting on the server. Under **Application** →
**Local storage**, the `notes-app:server` key holds your notes.

Now the second "device": open the app in a new tab as well. There, change the title of a note and click "Sync"; then
go back to the first tab and sync there too: the new title appears.
:::

:::concept Who wins if you change the same note on two devices?
In our app, the one changed later: this is called "last write wins". It is simple, and for a notebook it is usually
enough, but it has a price: if you change the same note on two devices without syncing in between, the earlier change
is lost. On top of that, the clocks of two devices never run exactly together. Real services therefore use the
server's time or version numbers, and on a conflict they ask the user or keep both versions.
:::

:::mistake Common mistake
`setNotes(merged)` instead of the updater function. At first it works, but if you start typing right after clicking
the button, whatever you typed meanwhile vanishes at the end of the sync: `merged` was made from the notes as they
were when the sync started, and it overwrites the fresher ones.
:::

:::try Try it
Right now the server never fails. Set `FAIL_RATE` in `src/fakeApi.js` to `0.3`, so that roughly every third request
fails, and sync a few times: the dot turns red, the message says "Could not reach the server.", the button says "Try
again", and your notes are all still there. Then set it back to `0`.
:::

### Deleting on every device

Delete a note and sync: it comes back. Why? Look at the plan of the previous step again: whatever is only in one place
gets in. The note is gone from our list, but the server still has it, so the merge "gives it back".

So a deleted note must not be thrown away. Instead, it gets a `deleted: true` mark, with a fresh timestamp. This is a
[[tombstone]], the news of the deletion: it is newer than the server's copy, so it wins the merge, the sync carries it
to the other devices too, and the note disappears there as well. Tombstones do not stay forever, though: in a real
service, once every device has received them, the server cleans them up after a while.

Two things change in `App`: deleting marks a note instead of removing it, and since marked notes are shown nowhere,
the derived values start from a new list, `liveNotes`. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=26-28,34,37,65-67,88
import { useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useNow from './useNow.js'
import useSync from './useSync.js'
import { SAMPLE_NOTES } from './sampleNotes.js'
import { findTags, matchesQuery } from './notes.js'
import NoteList from './components/NoteList.jsx'
import NoteEditor from './components/NoteEditor.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import TagFilter from './components/TagFilter.jsx'
import SyncStatus from './components/SyncStatus.jsx'
import './App.css'

function App() {
  // From now on the notes stay in the browser.
  const [notes, setNotes] = useLocalStorage('notes-app:notes', SAMPLE_NOTES)
  const [selectedId, setSelectedId] = useState(null)
  const now = useNow()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState(null)
  const { status, pending, lastSync, sync } = useSync(notes, setNotes)

  // Derived values: worked out from the state on every render.
  // filter returns a new array, so sort no longer rearranges the state.
  // Deleted notes are still kept for the sync, but we no longer show them.
  const liveNotes = notes.filter((note) => !note.deleted)
  const visibleNotes = liveNotes
    .filter((note) => category === 'all' || note.category === category)
    .filter((note) => tag === null || findTags(note.body).includes(tag))
    .filter((note) => matchesQuery(note, query))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  // Every tag that appears in any note, once, in alphabetical order.
  const allTags = [...new Set(liveNotes.flatMap((note) => findTags(note.body)))]
  allTags.sort((a, b) => a.localeCompare(b))
  // We only store the id; the note itself is looked up in the list on every render.
  const selected = liveNotes.find((note) => note.id === selectedId)

  function addNote() {
    const note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      // If you are looking at one category, the new note goes into it.
      category: category === 'all' ? 'personal' : category,
      updatedAt: Date.now(),
    }
    setNotes([note, ...notes])
    setSelectedId(note.id)
    // The new note should not hide behind a search or a tag.
    setQuery('')
    setTag(null)
  }

  function updateNote(id, changes) {
    // A new array: the changed note is replaced by a new object, with a fresh timestamp.
    const newNotes = notes.map((note) => {
      if (note.id !== id) return note // the other notes stay as they were
      return { ...note, ...changes, updatedAt: Date.now() }
    })
    setNotes(newNotes)
  }

  function deleteNote(id) {
    // We do not take it out of the list, only mark it: so the sync carries the news to the other devices.
    // Its title and text are emptied, so nothing of the deleted note is kept.
    updateNote(id, { deleted: true, title: '', body: '' })
    setSelectedId(null)
  }

  return (
    <div className={selected ? 'notes notes--editing' : 'notes'}>
      <header className="notes__top">
        <h1 className="notes__title">Notes</h1>
        <input
          type="search"
          className="notes__search"
          aria-label="Search notes"
          placeholder="Search…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" className="button" onClick={addNote}>
          + New note
        </button>
      </header>
      <div className="notes__filters">
        <CategoryFilter notes={liveNotes} value={category} onChange={setCategory} />
        <TagFilter tags={allTags} value={tag} onChange={setTag} />
      </div>
      <div className="notes__panes">
        <nav className="notes__side" aria-label="Notes">
          <NoteList notes={visibleNotes} selectedId={selectedId} now={now} onSelect={setSelectedId} />
        </nav>
        <main className="notes__main">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              now={now}
              onChange={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <p className="notes__hint">Pick a note from the list, or write a new one.</p>
          )}
        </main>
      </div>
      <SyncStatus status={status} pending={pending} lastSync={lastSync} now={now} onSync={sync} />
    </div>
  )
}

export default App
```

- `deleteNote` lets `updateNote` do the marking: it merges `{ deleted: true, title: '', body: '' }` into the note and
  gives it a fresh `updatedAt`, so the tombstone is the newest version of the note. The title and the text are
  emptied, so nothing of the deleted note is kept.
- `liveNotes` is a derived value again: every note without the mark. The list, the tags, the category counts and the
  open note all start from it. `useSync` still gets the whole `notes` list, tombstones included, because they have to
  reach the server too.

:::check Check
Delete a note and sync: this time it does not come back. Under **Application** → **Local storage**, in the
`notes-app:server` key, the deleted note is still there, with `"deleted":true` and an empty title and text. Now delete
a note in one tab, sync, then sync in the other tab as well: it disappears there too.
:::

:::mistake Common mistake
Leaving `CategoryFilter` on `notes={notes}`. The list is right, but the chips count the tombstones too: delete a note,
and "All" still shows the old number.
:::

:::try Try it
Show how many tombstones your device keeps: a `<p>{notes.length - liveNotes.length} deleted</p>` at the start of the
`<nav>`. Another derived value.
:::

### Offline mode

What happens when the internet goes away? The notes are in the browser, so you can keep reading and writing: the app is
[[offline-first]] from the start, that is, it works from its own storage, with the server as a bonus. Two things are
missing: the
app should tell you that there is no connection, and when the connection returns, it should sync by itself, without
you having to notice.

The browser knows whether there is a network: `navigator.onLine` is `true` or `false`, and when it changes, `window`
gets an `online` or an `offline` event. We listen for these in a custom hook, the way we listened for `hashchange` in
lesson 1 and for `matchMedia` changes in lesson 2. Create `src/useOnline.js`:

```js file=src/useOnline.js
import { useEffect, useState } from 'react'

// Is there an internet connection right now? The browser tells us when it drops or comes back.
function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    function update() {
      setOnline(navigator.onLine)
    }
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    // Cleanup: when the component goes away, we stop listening.
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  return online
}

export default useOnline
```

`useSync` uses it: it returns whether there is a network too, and an effect starts a sync at startup and every time
the connection comes back. Here is the whole `src/useSync.js`:

```js file=src/useSync.js mark=1,3,17,40-43,45
import { useEffect, useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import useOnline from './useOnline.js'
import { getNotes, saveNotes } from './fakeApi.js'

// Two lists of notes become one: of every note, the version changed later stays.
function mergeNotes(local, remote) {
  const newest = {}
  for (const note of [...remote, ...local]) {
    const seen = newest[note.id]
    if (!seen || note.updatedAt > seen.updatedAt) newest[note.id] = note
  }
  return Object.values(newest)
}

function useSync(notes, setNotes) {
  const online = useOnline()
  const [status, setStatus] = useState('idle') // 'idle', 'syncing' or 'error'
  const [lastSync, setLastSync] = useLocalStorage('notes-app:last-sync', 0)

  // Derived value: how many notes changed since the last sync?
  const pending = notes.filter((note) => note.updatedAt > lastSync).length

  async function sync() {
    const startedAt = Date.now()
    setStatus('syncing')
    try {
      const serverNotes = await getNotes()
      const merged = mergeNotes(notes, serverNotes)
      await saveNotes(merged)
      // You may have typed during the sync: merge into the fresh state instead of overwriting it.
      setNotes((current) => mergeNotes(current, merged))
      setLastSync(startedAt)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  // At startup, and whenever the internet comes back: sync.
  useEffect(() => {
    if (online) sync()
  }, [online])

  return { online, status, pending, lastSync, sync }
}

export default useSync
```

The effect's dependency is `[online]`: it runs after the first render (a sync at startup), and every time `online`
changes. If it just became `false`, it does nothing; if `true`, it syncs.

:::concept Why does it run twice at startup?
If you put a `console.log('sync')` line at the start of `sync`, it appears twice in the console at startup. That is
React's [[StrictMode]] (it wraps `<App />` in `src/main.jsx`): during development it runs effects twice on purpose,
to show up effects that cannot cope with being repeated. Ours copes: the second sync merges the same things as the
first and ends up in the same place. An operation like that is called [[idempotent]]. In the finished, built app, only
one sync runs.
:::

The status bar should know about a missing network too: a grey dot, a different message, and a disabled button, since
it could not reach the server anyway. Here is the whole `SyncStatus.jsx`:

```jsx file=src/components/SyncStatus.jsx mark=3,9,12,21
import { timeAgo } from '../dates.js'

function SyncStatus({ online, status, pending, lastSync, now, onSync }) {
  // The message follows from the state; a later line overrides an earlier one.
  let message = 'Not synced yet.'
  if (lastSync > 0) message = `Synced ${timeAgo(lastSync, now)}`
  if (status === 'syncing') message = 'Syncing…'
  if (status === 'error') message = 'Could not reach the server.'
  if (!online) message = 'No internet. Your changes are waiting on this device.'

  return (
    <footer className={`sync sync--${online ? status : 'offline'}`}>
      <span className="sync__dot" aria-hidden="true" />
      <p className="sync__text" role="status">
        {message}
        {pending > 0 && <span className="sync__pending">Not on the server yet: {pending}</span>}
      </p>
      <button
        type="button"
        className="button button--ghost"
        disabled={!online || status === 'syncing'}
        onClick={onSync}
      >
        {status === 'error' ? 'Try again' : 'Sync'}
      </button>
    </footer>
  )
}

export default SyncStatus
```

Two places change in `App`. We take `online` out of the hook's result as well:

```jsx file=src/App.jsx
  const { online, status, pending, lastSync, sync } = useSync(notes, setNotes)
```

and at the end of the `return` we pass it on to the status bar. With this many props, we now write one per line:

```jsx file=src/App.jsx mark=2
      <SyncStatus
        online={online}
        status={status}
        pending={pending}
        lastSync={lastSync}
        now={now}
        onSync={sync}
      />
```

:::check Check
Reload the page: it syncs by itself and says "Synced now". Now open the **Network** tab of the developer tools, and
in the drop-down that says "No throttling", choose **Offline**: the dot turns grey, the message says "No internet. Your
changes are waiting on this device.", and the button fades. Write a new note: it works, and "Not on the server yet: 1"
appears. Set the drop-down back to "No throttling": the app syncs by itself, and the counter disappears.
Congratulations, your notebook is ready!
:::

:::concept What does a real offline app need?
Our data is there offline too, but if you reload the page while offline, the browser cannot even download the app
itself. Real offline apps use a [[service worker]] to keep their own files (HTML, JavaScript, CSS) and load themselves
from there when there is no network. That is what turns a website into an installable [[PWA]] (progressive web app).
In the advanced level of lesson 10 you already made the shopping list work offline this way.
:::

:::mistake Common mistake
It seems shorter to write the effect like this: `useEffect(() => online && sync(), [online])`. The arrow function
then returns the result of `sync()`, a Promise (or `false` when offline), and React takes the returned value for a
cleanup function and tries to call it. In development StrictMode runs a cleanup right away, so the page stays empty,
and the console shows the warning "useEffect must not return anything besides a function, which is used for clean-up"
followed by the error "destroy is not a function". Give the effect a body in curly braces, and return nothing from it
but a cleanup function.
:::

:::try Try it
Show waiting changes in the page's title too (that is what the browser tab shows). Put this effect into `App`, under
the `useSync` line (`pending` only exists from there on), and import `useEffect` too:
`import { useEffect, useState } from 'react'`.

```jsx file=src/App.jsx
  useEffect(() => {
    document.title = pending > 0 ? '(' + pending + ') Notes' : 'Notes'
  }, [pending])
```

`document` is outside React's box, so this belongs in an effect too.
:::
