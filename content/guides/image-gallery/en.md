# What we build

An exhibition that fits in your pocket. Pocket Gallery shows 36 small artworks, drawn in code, in a neat grid: click one
to see it large, and browse from picture to picture. At the top of the page a carousel turns through the pictures on
its own, and you can add your own photos too. On the way you learn how a web page gets a real modal dialog, how React
works with timers and keys, and how the browser reads files from your computer.

:::levels
- Pictures in a grid, and a large view in a real modal dialog on click, with browsing. | about 2 hours
- Uploading your own pictures, a carousel that moves on by itself with manual controls, browsing with the arrow keys. | about 3 hours
- Albums, lazy loading, infinite scroll, drag-to-reorder, and a look at cloud image hosting. | about 3 hours
:::

**Before you start you need:** the earlier lessons, mainly these: lists with `map` and `key` (lesson 9), the cleanup
function of `useEffect` (lesson 3), updater functions (lesson 6), `setInterval` (lesson 11), `useRef` (the advanced
levels of lessons 5 and 8), keyboard events (lessons 6 to 8), derived values (lessons 3 and 11). Whatever we use in a
new way here is explained again.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is the `lessons/12-image-gallery/exercise` folder of the course repository on GitHub (the
"Exercise on GitHub" button above opens it). Step 0 of lesson 1 explains in detail how to get it and work in it; here
are the commands in short. In a terminal, in your work folder, where you keep your projects:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git  # the first time only
cp -r rika-mentoring/lessons/12-image-gallery/exercise pocket-gallery
```

If you already have the repository from an earlier lesson, do not clone it again: instead of the first line, run
`git pull` in it (`cd rika-mentoring`, `git pull`, `cd ..`), which brings the new lessons, then copy. You work in your
copy, never in the repository: the repository stays untouched, so `git pull` keeps working. No git? Choose
**Code → Download ZIP** on the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring), and copy the
`lessons/12-image-gallery/exercise` folder out of it into your work folder as `pocket-gallery`.

Open your copy, the `pocket-gallery` folder, in your editor, and type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a light grey page with the title
"Pocket Gallery" in big letters, and a grey line under it: "36 small artworks, drawn in code." There are no pictures
yet: putting them on the page is your job.
:::

Leave the server running, open a second terminal (the **+** button in the terminal panel), and make your copy a git
repository with one commit, the starting point:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

If git answers "Please tell me who you are", step 0 of lesson 1 shows the two `git config` commands that fix it.

Four things in the exercise matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so you do not write styles:
  you only use the class names (`grid`, `thumb`, `lightbox`, `carousel`, …) that the steps give you. Have a look
  inside anyway!
- `src/photos.js`: the data of the 36 pictures, in an array called `PHOTOS`.
- `public/photos/`: the pictures themselves, 36 [[SVG]] files. SVG is an image format made of shapes (circles,
  rectangles, curves) instead of dots, written down as text: that is why it stays sharp at any size. Open one in your
  editor and take a look inside.

Every item of the `PHOTOS` array is an object that describes one picture. The first one looks like this:

```js
{
  id: 'golden-hour',
  src: '/photos/golden-hour.svg',
  title: 'Golden Hour',
  alt: 'A gold sun setting into a navy sea under a violet and magenta sky',
  album: 'landscapes',
},
```

The `id` is a unique name, the `src` is the address the browser downloads the picture from, the `title` is the name
shown in the large view, the `alt` describes what is in the picture (more on that in a moment), and the `album` says
which album it belongs to. Albums come only in the advanced level.

The `src` starts oddly, with `/photos/…`, although the file is in the `public/photos` folder. The [[public folder]] is
special: Vite serves everything in it as it is, from the root of the site. So `public/photos/golden-hour.svg` is at
the address `/photos/golden-hour.svg`, and that is exactly what the `src` says.

:::try Try it
Type this in the browser's address bar: `http://localhost:5173/photos/golden-hour.svg`. There is the picture on its
own: a gold sun sinking into the sea.
:::

:::concept Your copy is a git repository
Like in the earlier lessons: `git restore .` throws away every change since your last commit (new files stay; delete
those by hand). When a step works, commit it: `git add .`, then `git commit -m "Pictures in a grid"`.
:::

### Pictures in a grid

Let us start with the most important part: all 36 pictures on the page. Every item of the `PHOTOS` array becomes a list
item with an `<img>` in it. Just like the tasks in lesson 9, this is a job for the `map` function of arrays. Change
`src/App.jsx` to this (the highlighted lines are new):

```jsx file=src/App.jsx mark=1,12-18
import { PHOTOS } from './photos.js'
import './App.css'

function App() {
  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <ul className="grid">
        {PHOTOS.map((photo) => (
          <li key={photo.id} className="grid__item">
            <img src={photo.src} alt={photo.alt} />
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
```

- `PHOTOS` is a named export, so it is imported in curly braces: `import { PHOTOS } from …`.
- `map` returns an `<li>` for every picture, and React draws the elements it gets one after the other.
- `key={photo.id}` helps React tell the list items apart. The `id` is unique and never changes: a perfect key.
- `src={photo.src}` passes a JavaScript value, in curly braces: the browser downloads the picture from that address.
- `alt` is the picture's [[alt text]]: a short description of what can be seen in it. Screen readers read it aloud to
  people who cannot see the picture, and the browser shows it when the picture cannot load. A good alt text says what
  the picture shows ("A gold sun sinking into the sea"), not "image" or "IMG_2041.jpg".

The grid comes from the `.grid` rule of `App.css`. The important part is a single line, `grid-template-columns`:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}
```

`repeat(auto-fill, minmax(130px, 1fr))` means: as many columns as fit, each at least 130 pixels wide, sharing the space
that is left equally. That gives two columns on a phone and six on a wide screen, without a single media query. The
`aspect-ratio: 1` and `object-fit: cover` lines of the `.grid img` rule crop the portrait pictures to squares: the grid
stays tidy, and the whole picture will show in the large view.

:::check Check
36 colourful squares line up under the title, six in a row in a wide window. Make the browser window narrower: there
are fewer and fewer columns. Chrome's window does not get narrower than about 500 pixels, and there are still three
columns there; you see two in the phone view (++F12++, then ++Ctrl++ + ++Shift++ + ++M++, on a Mac ++Cmd++ + ++Shift++ +
++M++).
:::

:::mistake Common mistake
`src="photo.src"`, in quotes. That is not the variable's value but literally the text "photo.src": the browser looks
for a file with that name, cannot find it, and every square shows a broken-image icon and the alt text. In JSX a
JavaScript value goes in curly braces.
:::

:::try Try it
In `App.css`, change `130px` to `200px`: fewer, bigger pictures fit in a row. Then set it back.
:::

### A large view on click

When you click a picture, it should appear large. That takes three things: the picture must be clickable, the page
must remember which picture you opened, and when a picture is open, it must draw it large.

In HTML, the element for things you click is `<button>`. It works with more than a mouse: the ++Tab++ key moves to it,
++Enter++ presses it, and screen readers introduce it as a button. The button's name becomes the alt text of the picture
inside it. A [[thumbnail]] (the small version of a picture in the grid) gets a component of its own: create a `components`
folder in `src`, with a `Thumbnail.jsx` file in it:

```jsx file=src/components/Thumbnail.jsx
function Thumbnail({ photo, onOpen }) {
  return (
    <li className="grid__item">
      <button type="button" className="thumb" onClick={onOpen}>
        <img src={photo.src} alt={photo.alt} />
      </button>
    </li>
  )
}

export default Thumbnail
```

`Thumbnail` does not know what happens on a click: it calls the function it got in the `onOpen` prop, and `App` takes
care of the rest. `App` keeps the position of the open picture in state. Change `src/App.jsx`:

```jsx file=src/App.jsx mark=1,3,7-9,19-21,24-41
import { useState } from 'react'
import { PHOTOS } from './photos.js'
import Thumbnail from './components/Thumbnail.jsx'
import './App.css'

function App() {
  // Which picture is open in the large view: its position in PHOTOS, or null if none is open.
  const [openIndex, setOpenIndex] = useState(null)
  const openPhoto = openIndex === null ? null : PHOTOS[openIndex]

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <ul className="grid">
        {PHOTOS.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      {openPhoto && (
        <div className="lightbox">
          <button
            type="button"
            className="round lightbox__close"
            aria-label="Close"
            onClick={() => setOpenIndex(null)}
          >
            ×
          </button>
          <figure className="lightbox__figure">
            <img src={openPhoto.src} alt={openPhoto.alt} />
            <figcaption>
              <strong>{openPhoto.title}</strong>
            </figcaption>
          </figure>
        </div>
      )}
    </main>
  )
}

export default App
```

- [[null]] means "nothing" in JavaScript. `openIndex` starts as `null`, because no picture is open. 0 would not do: it
  is the position of the first picture.
- `openPhoto` does not get its own state: it is calculated from `openIndex` on every render. When `openIndex` is
  `null`, it is `null`; otherwise it is the item of `PHOTOS` at position `openIndex`.
- The second parameter of `map`, `index`, tells you which picture you are at (counting from 0).
- `onOpen={() => setOpenIndex(index)}` is a small arrow function, which the button calls only on a click. Every
  thumbnail gets a function of its own, with its own position in it.
- The `key` now goes on `<Thumbnail>`, because that is what `map` returns. The `<li>` inside the component no longer
  needs one.
- `{openPhoto && (…)}` is [[conditional rendering]]: when `openPhoto` is `null`, nothing appears in its place.
- `<figure>` holds a picture together with its caption, and `<figcaption>` is the caption itself.
- The close button only shows a ×, which a screen reader would read as "times", or not at all. [[aria-label]] gives it
  a name people understand: "Close".

:::check Check
Click any picture: the page goes dark, and the whole picture appears in the middle (portrait, not cropped to a
square), with its title under it. The × in the top right closes it. It works with the keyboard too: ++Tab++ moves
across the pictures (the blue ring shows where you are), and ++Enter++ opens the one you are on.
:::

:::mistake Common mistake
`{openIndex && (…)}` instead of `{openPhoto && (…)}`. The very first picture does not open, and a lonely 0 appears at
the bottom of the page. `a && b` gives back `a` when it counts as "false" (`0`, `''`, `null`, `undefined`, `false`),
and React draws numbers, 0 included. `openPhoto` is either an object or `null`, so this cannot happen with it.
:::

:::try Try it
Open a picture and press ++Tab++ a few times, then ++Esc++. The blue ring disappears behind the dark layer: it is moving
across the pictures you cannot see. And ++Esc++ does nothing. The next step puts this right.
:::

### A real modal: the dialog element

From the outside the dark layer looks like a window, but to the browser it is just another `<div>`. A real
[[modal dialog]] does more: while it is open, the rest of the page "does not exist". Keyboard focus cannot escape from
it, ++Esc++ closes it, screen readers do not read the page behind it, and when it closes, focus jumps back to where
you came from.

The browser's built-in `<dialog>` element does all of this when you open it with its `showModal()` function. Here is
the catch: `showModal()` is a function of the real `<dialog>` element in the browser, and React has no prop to call it
with. (There is an `open` attribute, but it opens the window without the modal behaviour, without the protections
above.) JSX only describes what should be on the screen; what really gets built from it is the [[DOM]]: the tree of
elements living in the browser. We need to get hold of the `<dialog>`'s DOM element, and that takes a hook that may be
new to you, [[useRef]]. If you did the advanced levels of lessons 5 and 8, you have met it already.

`useRef` gives you a box that React keeps between renders, like state, but when its content changes, React does
**not** render again. The content of the box is in its `.current` field. When you give a JSX element `ref={dialogRef}`, React
puts the real DOM element in the box after rendering: from then on, `dialogRef.current` is the `<dialog>` itself.

Create the `src/components/Lightbox.jsx` file. [[Lightbox]] is the usual name for a large picture viewer on the web.

```jsx file=src/components/Lightbox.jsx
import { useEffect, useRef } from 'react'

function Lightbox({ photo, onClose }) {
  const dialogRef = useRef(null)
  const isOpen = photo !== null

  // The browser opens and closes the <dialog>: we tell it what to do after rendering.
  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function handleClick(event) {
    // A click on the <dialog> itself (not on the picture, not on a button) was a click on the dark background.
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog ref={dialogRef} className="lightbox" onClose={onClose} onClick={handleClick}>
      {isOpen && (
        <>
          <button type="button" className="round lightbox__close" aria-label="Close" onClick={onClose}>
            ×
          </button>
          <figure className="lightbox__figure">
            <img src={photo.src} alt={photo.alt} />
            <figcaption>
              <strong>{photo.title}</strong>
            </figcaption>
          </figure>
        </>
      )}
    </dialog>
  )
}

export default Lightbox
```

- The effect runs **after** rendering, when the `<dialog>` exists and is in `dialogRef.current`. `dialog.open` tells
  you whether it is open right now. If it should be open but is not, we open it; if it should be closed but is open, we
  close it. The dependency array is `[isOpen]`, because there is only something to do when that changes.
- Why the two `if` checks? The window can also close without React (++Esc++ closes it by itself), so the effect first
  looks at what is really on the screen: it opens the window only if it is closed, and closes it only if it is open.
  That makes the effect safe to run any number of times, which matters in development too, where [[StrictMode]] runs
  effects an extra time when a component first appears.
- The `<dialog>` is always on the page. Closed, it is invisible (`App.css` takes care of that); only its **content**
  depends on whether a picture is open. That is how the effect can close it too, and why `close()` can take the focus
  back to the thumbnail you came from.
- The `<dialog>` sends a `close` event every time it closes, including when ++Esc++ is pressed. `onClose={onClose}`
  listens for it, so the state of `App` always matches what is on the screen.
- `handleClick` watches the dark background. `event.target` is the element you actually clicked, and
  `event.currentTarget` is the one whose handler is running: the `<dialog>`. The two are the same only when the click
  hit the `<dialog>` itself, not the picture or a button inside it. The `<dialog>` covers the whole screen, so the dark
  area around the picture is the `<dialog>` itself.
- `<>` and `</>` are a [[fragment]]: they hold several elements together without adding another HTML element to the
  page.

The `<div className="lightbox">` leaves `App`, and the `Lightbox` component takes its place. Here is the whole
`src/App.jsx`:

```jsx file=src/App.jsx mark=4,25
import { useState } from 'react'
import { PHOTOS } from './photos.js'
import Thumbnail from './components/Thumbnail.jsx'
import Lightbox from './components/Lightbox.jsx'
import './App.css'

function App() {
  // Which picture is open in the large view: its position in PHOTOS, or null if none is open.
  const [openIndex, setOpenIndex] = useState(null)
  const openPhoto = openIndex === null ? null : PHOTOS[openIndex]

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <ul className="grid">
        {PHOTOS.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      <Lightbox photo={openPhoto} onClose={() => setOpenIndex(null)} />
    </main>
  )
}

export default App
```

:::check Check
It looks the same as before, but now it really behaves like a window. Move to a picture with ++Tab++, open it with
++Enter++, and close it with ++Esc++: the blue ring is back on the picture you opened. While a picture is open, ++Tab++
no longer gets behind the dark layer. Click the dark area next to the picture: the window closes. Click the picture
itself, and it stays open.
:::

:::mistake Common mistake
Calling it right in the component instead of in the effect: `dialogRef.current.showModal()`. The console (++F12++) says
"Cannot read properties of null (reading 'showModal')", and the page stays empty. During the first render the
`<dialog>` does not exist yet and the box is empty (`null`): React puts the element in it only after rendering. That is
why code that works with the DOM goes into `useEffect`.
:::

### Browsing in the large view

Once a picture is open in the large view, it would be handy to move on to the next one without closing the window.
`Lightbox` gets two arrow buttons and a counter ("3 / 36"). Here is the whole `src/components/Lightbox.jsx`, with the
new lines highlighted:

```jsx file=src/components/Lightbox.jsx mark=3,30,33-38
import { useEffect, useRef } from 'react'

function Lightbox({ photo, position, onClose, onPrev, onNext }) {
  const dialogRef = useRef(null)
  const isOpen = photo !== null

  // The browser opens and closes the <dialog>: we tell it what to do after rendering.
  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function handleClick(event) {
    // A click on the <dialog> itself (not on the picture, not on a button) was a click on the dark background.
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog ref={dialogRef} className="lightbox" onClose={onClose} onClick={handleClick}>
      {isOpen && (
        <>
          <button type="button" className="round lightbox__close" aria-label="Close" onClick={onClose}>
            ×
          </button>
          <figure className="lightbox__figure">
            <img src={photo.src} alt={photo.alt} />
            <figcaption>
              <strong>{photo.title}</strong>
              <span>{position}</span>
            </figcaption>
          </figure>
          <button type="button" className="round lightbox__prev" aria-label="Previous picture" onClick={onPrev}>
            ←
          </button>
          <button type="button" className="round lightbox__next" aria-label="Next picture" onClick={onNext}>
            →
          </button>
        </>
      )}
    </dialog>
  )
}

export default Lightbox
```

Browsing is `App`'s job, since that is where `openIndex` lives. "Next" is easy: a position one higher. But what comes
after the 36th picture? The first one, round and round. That is what the [[modulo]] from lesson 3 is for: `%`, the
remainder of a division. `(35 + 1) % 36` is 0, because 36 goes into 36 exactly once, with nothing left over. So after
the last picture (position 35) comes position 0, the first one.

Going backwards has a catch: in JavaScript `-1 % 36` is -1, not 35. So we add the number of pictures first, and divide
only after that: `(0 - 1 + 36) % 36` = 35, and for every other position the added 36 does not change the remainder.
Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=12-15,17-20,35-41
import { useState } from 'react'
import { PHOTOS } from './photos.js'
import Thumbnail from './components/Thumbnail.jsx'
import Lightbox from './components/Lightbox.jsx'
import './App.css'

function App() {
  // Which picture is open in the large view: its position in PHOTOS, or null if none is open.
  const [openIndex, setOpenIndex] = useState(null)
  const openPhoto = openIndex === null ? null : PHOTOS[openIndex]

  function showPrev() {
    // Before the first comes the last; + PHOTOS.length keeps it from going negative.
    setOpenIndex((openIndex - 1 + PHOTOS.length) % PHOTOS.length)
  }

  function showNext() {
    // After the last comes the first: % wraps around.
    setOpenIndex((openIndex + 1) % PHOTOS.length)
  }

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <ul className="grid">
        {PHOTOS.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      <Lightbox
        photo={openPhoto}
        position={`${openIndex + 1} / ${PHOTOS.length}`}
        onClose={() => setOpenIndex(null)}
        onPrev={showPrev}
        onNext={showNext}
      />
    </main>
  )
}

export default App
```

`position` is a [[template literal]]: in text between backticks, a JavaScript value goes in place of `${…}`. Positions
start at 0, but people count from 1, hence `openIndex + 1`.

:::check Check
Open the first picture: under it you see "Golden Hour" and "1 / 36". The → button moves on ("2 / 36", "High Tide"), ←
goes back. On the first picture ← jumps to the last ("36 / 36"), and on the last one → jumps to the first. The beginner
level is done: commit it!
:::

:::mistake Common mistake
`(openIndex - 1) % PHOTOS.length`, without adding the length. On the first picture ← gives -1, `PHOTOS[-1]` is
`undefined`, and the page crashes: the console says "Cannot read properties of undefined (reading 'src')". Going
backwards, always add the length before you divide.
:::

:::try Try it
Let a click on the picture move on too: in `Lightbox`, give the large `<img>` this: `onClick={onNext}`. Why does this
click not close the window? (Because `event.target` is the picture then, not the `<dialog>`.)
:::

## Intermediate level {level=2}

### Uploading your own pictures

So far the pictures came from `photos.js` and never changed. If people can add pictures, the list changes while the
page is in use, and what changes is state. From now on the `PHOTOS` array is only the starting value:
`useState(PHOTOS)`.

In the browser, files are chosen with an `<input type="file">` field. On a click it opens the computer's file picker,
and once you have chosen, it sends a `change` event. The upload button becomes a component of its own. Create the
`src/components/UploadButton.jsx` file:

```jsx file=src/components/UploadButton.jsx
// Every uploaded picture gets a new id: upload-1, upload-2, …
let nextId = 1

function UploadButton({ onAdd }) {
  function handleChange(event) {
    // The list of chosen files, turned into an array.
    const files = Array.from(event.target.files)
    const newPhotos = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: `upload-${nextId++}`,
        src: URL.createObjectURL(file),
        title: file.name,
        alt: file.name,
        album: 'uploads',
      }))
    onAdd(newPhotos)
    // Empty the field, so the same file can be chosen again.
    event.target.value = ''
  }

  return (
    <label className="upload">
      <input type="file" accept="image/*" multiple onChange={handleChange} />
      Upload pictures
    </label>
  )
}

export default UploadButton
```

A lot of this is new, so let's go through it piece by piece:

- `accept="image/*"` asks the file picker to show only pictures, and `multiple` lets you choose several at once.
- `event.target.files` is the list of chosen files, a [[FileList]]. It is almost like an array, but it has no `map` or
  `filter` function: `Array.from` makes a real array of it.
- Every item is a `File` object: it has a name (`file.name`, for example `cat.jpg`), a size (`file.size`, in bytes)
  and a type (`file.type`). The type is a [[MIME type]], a standard name for the kind of file: `image/png`,
  `image/jpeg`, `application/pdf`… `accept` can be worked around (the file picker can be switched to "All files"), so
  `filter` keeps only the files whose type starts with `image/`.
- `URL.createObjectURL(file)` makes an [[object URL]], known from lesson 5, an address like
  `blob:http://localhost:5173/3f2a…`. It points to the file kept in the browser's memory, and `<img>` loads the picture
  from it like from any other address. So the pictures do not go anywhere: they stay on your computer, and the browser
  just lends them an address. That is also why they disappear when you reload the page.
- The `alt` is only the file name here, because the program cannot know what is in the picture. A real gallery asks
  the person uploading to write a short description, and puts that in `alt`.
- `.map((file) => ({ … }))` returns an object for every file. The object needs parentheses around it, otherwise
  JavaScript would take the curly brace for the start of the function's body.
- `nextId` lives **outside** the component, so there is only one of it, and it survives renders. `nextId++` first gives
  its current value, then adds one: the first picture becomes `upload-1`, the second `upload-2`. It is not state,
  because nothing on the screen depends on it.
- The `<label>` wraps the field, so clicking the label is like clicking the field. `App.css` hides the field itself,
  but ++Tab++ still reaches it, and the `<label>` gets the blue ring.

In `App`, the `photos` state takes the place of `PHOTOS` everywhere, and a new function, `addPhotos`, adds the new
pictures. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=5,9-13,15-18,21-22,27,37-39,42,49
import { useState } from 'react'
import { PHOTOS } from './photos.js'
import Thumbnail from './components/Thumbnail.jsx'
import Lightbox from './components/Lightbox.jsx'
import UploadButton from './components/UploadButton.jsx'
import './App.css'

function App() {
  // The list of pictures is state from now on: PHOTOS is only its starting value.
  const [photos, setPhotos] = useState(PHOTOS)
  // Which picture is open in the large view: its position in photos, or null if none is open.
  const [openIndex, setOpenIndex] = useState(null)
  const openPhoto = openIndex === null ? null : photos[openIndex]

  function addPhotos(newPhotos) {
    // The new pictures go first, the old ones after them: a new array, the old one is left as it is.
    setPhotos([...newPhotos, ...photos])
  }

  function showPrev() {
    // Before the first comes the last; + photos.length keeps it from going negative.
    setOpenIndex((openIndex - 1 + photos.length) % photos.length)
  }

  function showNext() {
    // After the last comes the first: % wraps around.
    setOpenIndex((openIndex + 1) % photos.length)
  }

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <div className="toolbar">
        <UploadButton onAdd={addPhotos} />
      </div>

      <ul className="grid">
        {photos.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      <Lightbox
        photo={openPhoto}
        position={`${openIndex + 1} / ${photos.length}`}
        onClose={() => setOpenIndex(null)}
        onPrev={showPrev}
        onNext={showNext}
      />
    </main>
  )
}

export default App
```

`[...newPhotos, ...photos]` is the familiar [[spread]], used just like for arrays in state in lesson 7: a new array,
with the new pictures first and the old ones after them. We never change the array in state directly (with `push`, for
example), because React would not notice the change: `setPhotos` always gets a new array.

:::check Check
A blue "Upload pictures" button appears under the title. Click it and choose one or more pictures from your computer
(to select several, hold down ++Ctrl++ while you click, on a Mac ++Cmd++). Your pictures go to the front of the grid.
Open the first one: it shows large too, and with one new picture the counter now says "1 / 37" (with two "1 / 38", and
so on). Reload the page: the uploaded pictures are gone, the 36 sample pictures stay.
:::

:::mistake Common mistake
The parentheses around the object are missing: `.map((file) => { id: …, src: … })`. JavaScript reads the curly brace
as the function's body, and in a body `id: …, src: …` is not valid code. The page does not even load: Vite shows a red
error message (in the terminal too) about a missing semicolon ("Expected a semicolon…"), pointing at the `src:` line.
An object returned straight from an arrow function always goes in parentheses: `({ … })`.
:::

:::concept When is the memory freed?
An object URL keeps the file in the browser's memory as long as the page is open, or until you call
`URL.revokeObjectURL(photo.src)` on it. Our uploaded pictures are needed as long as the page is open, so there is
nothing to do. But if you ever write a delete button for uploaded pictures, free the picture's address like this when
you delete it, otherwise the file keeps taking up memory for nothing.
:::

:::try Try it
Switch the file picker's filter to "All files", and choose a picture and a PDF or text file at the same time. Only the
picture shows up: `filter` left out the rest.
:::

### A carousel with manual controls

A [[carousel]] is a large stage that shows one picture at a time, with arrows to step through them. It is the same
wrap-around browsing as in the large view, only now the carousel itself remembers which picture it is at. Nobody else
uses that position, so it becomes the carousel's own state, not `App`'s. Create the `src/components/Carousel.jsx` file:

```jsx file=src/components/Carousel.jsx
import { useState } from 'react'

function Carousel({ photos }) {
  const [index, setIndex] = useState(0)
  const count = photos.length
  const photo = photos[index]

  function showPrev() {
    setIndex((index - 1 + count) % count)
  }

  function showNext() {
    setIndex((index + 1) % count)
  }

  return (
    <section className="carousel" aria-roledescription="carousel" aria-label="Featured pictures">
      <div className="carousel__stage">
        {/* Thanks to the key, every picture gets a new <img>, so the fade-in animation always plays. */}
        <img key={photo.id} className="carousel__image" src={photo.src} alt={photo.alt} />
        <button type="button" className="round carousel__prev" aria-label="Previous picture" onClick={showPrev}>
          ←
        </button>
        <button type="button" className="round carousel__next" aria-label="Next picture" onClick={showNext}>
          →
        </button>
      </div>
      <div className="carousel__bar">
        <p className="carousel__caption" aria-live="polite">
          <strong>{photo.title}</strong>
          <span>
            {index + 1} / {count}
          </span>
        </p>
      </div>
    </section>
  )
}

export default Carousel
```

- `aria-roledescription="carousel"` and `aria-label="Featured pictures"` tell screen readers what this part is:
  "Featured pictures, carousel". `aria-roledescription` gives the name of the role, and screen readers read it out
  too, so it is written in the user's language.
- [[aria-live]] is familiar from lesson 3: when the paragraph's content changes, the screen reader reads it out, so
  stepping through the pictures can be heard too.
- `key={photo.id}` on the large picture: when the key changes, React does not update the old `<img>` but makes a new
  one instead. `App.css` gently fades in every new `.carousel__image`, so the animation plays on every step.

The carousel goes under the header, and it gets the same `photos` list as the grid, so uploaded pictures are in it too.
In `src/App.jsx`, import it next to the other imports, and put it between the `<header>` and the `toolbar`:

```jsx file=src/App.jsx mark=1,11
import Carousel from './components/Carousel.jsx'
// … the other imports and the start of App, as before

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <Carousel photos={photos} />

      {/* … the toolbar, the grid and the Lightbox, as before … */}
    </main>
  )
}
```

:::check Check
A dark stage appears under the title with the "Golden Hour" picture, and under it "Golden Hour" and "1 / 36". The
arrows step through the pictures, and each picture gently fades in. After the 36th comes the first again. Upload a
picture: the counter now ends in 37.
:::

:::mistake Common mistake
The `key` is missing on the large picture. Stepping works, but the fade-in plays only once, at the start: React keeps
the same `<img>` and only changes its `src`, and a CSS animation only starts on a new element.
:::

### Moving on by itself: setInterval

What makes a carousel a real one is that it moves on by itself. In lesson 3, [[setTimeout]] called a function once,
after a while. You met [[setInterval]] in lesson 11, where the `useNow` hook moved the clock on every 30 seconds: it
starts the same way as `setTimeout`, but it does not stop. `setInterval(fn, 4000)` calls `fn` every four seconds, again
and again, until `clearInterval` stops it.

Where do we start it? Never during rendering: a timer is work outside rendering, so it belongs in `useEffect`. And as
it never stops on its own, the cleanup function has to stop it. Here is the whole `src/components/Carousel.jsx`, with a
Pause / Play button:

```jsx file=src/components/Carousel.jsx mark=1,3,5-8,12,16-24,47-51
import { useEffect, useState } from 'react'

const DELAY = 4000 // how many milliseconds a picture stays: 4 seconds

// People who asked their system for less motion do not get a slideshow that starts by itself.
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Carousel({ photos }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const count = photos.length
  const photo = photos[index]

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      // Updater function: React hands over the latest index.
      setIndex((current) => (current + 1) % count)
    }, DELAY)
    // Cleanup: stops the timer before a new one starts, and when the carousel goes away.
    return () => clearInterval(timer)
  }, [playing, count])

  function showPrev() {
    setIndex((index - 1 + count) % count)
  }

  function showNext() {
    setIndex((index + 1) % count)
  }

  return (
    <section className="carousel" aria-roledescription="carousel" aria-label="Featured pictures">
      <div className="carousel__stage">
        {/* Thanks to the key, every picture gets a new <img>, so the fade-in animation always plays. */}
        <img key={photo.id} className="carousel__image" src={photo.src} alt={photo.alt} />
        <button type="button" className="round carousel__prev" aria-label="Previous picture" onClick={showPrev}>
          ←
        </button>
        <button type="button" className="round carousel__next" aria-label="Next picture" onClick={showNext}>
          →
        </button>
      </div>
      <div className="carousel__bar">
        <button type="button" className="button" onClick={() => setPlaying(!playing)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        {/* During the slideshow the screen reader does not read out every change, only when someone steps by hand. */}
        <p className="carousel__caption" aria-live={playing ? 'off' : 'polite'}>
          <strong>{photo.title}</strong>
          <span>
            {index + 1} / {count}
          </span>
        </p>
      </div>
    </section>
  )
}

export default Carousel
```

- The effect starts a timer only when `playing` is true. `clearInterval(timer)` runs in the [[cleanup function]],
  which React calls before running the effect again, and also when the carousel leaves the page.
- The dependency array is `[playing, count]`. When you pause the slideshow with the Pause button, the cleanup stops
  the timer and the effect does not start a new one. When you upload a picture, `count` changes: the old timer stops,
  and a new one starts that counts with the new number.
- `setIndex` gets an [[updater function]] here, known from lessons 6 and 7: not a new value but a function, which React
  calls with the latest state. Why that is needed is what the "Common mistake" box below is about.
- `prefersReducedMotion` uses `matchMedia`, known from lesson 2. [[prefers-reduced-motion]] is the system setting you
  know from lessons 1 and 2: people who get dizzy or tired from a lot of movement can ask pages to move less. For them
  the slideshow starts paused, but they can start it any time with the Play button. `useState(() => …)` is the
  [[lazy initial state]] from lesson 3: the function runs only on the first render.
- Why a Pause button? Anything that moves by itself must be possible to stop: for someone who reads more slowly, or
  wants to look at a picture longer, the slideshow runs away. The accessibility guidelines (WCAG) require it, too.
- During the slideshow `aria-live` is switched off (`'off'`); otherwise the screen reader would interrupt the user with
  a new picture title every four seconds.

:::check Check
Every four seconds the carousel moves on to the next picture by itself. The "Pause" button stops it (its label becomes
"Play"), and "Play" starts it again. The arrows work during the slideshow too. (If animations are turned off on your
computer, the slideshow starts paused: `prefersReducedMotion` takes care of that. Then start it with the "Play"
button.)
:::

:::mistake Common mistake
`setIndex((index + 1) % count)` instead of the updater function. The carousel steps once, to the second picture, and
gets stuck there. The timer's function was made when the effect ran, and it still sees the `index` from back then: 0.
This is the [[closure]] trap from lesson 7: a function takes the variables of the place where it was made along with
it, with their old values. So four seconds later, and eight seconds later, it still calculates `(0 + 1) % 36`. The updater function gets around
this: React always hands it the current value.
:::

:::try Task
When you step by hand, the next automatic change does not wait a full four seconds: if the timer was just about to
fire, the picture moves on again right away. Put `index` in the dependency array too: `[playing, count, index]`. Now
every step runs the cleanup, and a fresh timer starts. (The code in the next step shows the version without this task;
if you did it, keep `index` in your array.)
:::

### Browsing with the arrow keys

You can already browse with the mouse, but not with the arrow keys yet. You have listened for
[[keyboard events|keyboard event]] in lessons 6 to 8: the `keydown` event comes when a key is pressed, and `event.key` tells you which one. The arrows are
called `'ArrowLeft'` and `'ArrowRight'`.

The question now is **who** should listen. If the whole window listened (`window.addEventListener('keydown', …)` in an
effect), every arrow would count everywhere: with the large view open, the carousel would also move in the background.
In React, though, you can put `onKeyDown` on any element, and it runs only when the focus is on that element **or
somewhere inside it**. This is [[event bubbling]] (if you did lesson 8's advanced level, you have met it already): an
event first happens on the element that has the focus (a button, for example), then on every element around it in
turn, all the way up to `window`. The large view keeps the focus inside the `<dialog>`, so the `<dialog>`'s
`onKeyDown` runs exactly when it should.

Here is the whole `src/components/Lightbox.jsx`:

```jsx file=src/components/Lightbox.jsx mark=19-22,25-31
import { useEffect, useRef } from 'react'

function Lightbox({ photo, position, onClose, onPrev, onNext }) {
  const dialogRef = useRef(null)
  const isOpen = photo !== null

  // The browser opens and closes the <dialog>: we tell it what to do after rendering.
  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function handleClick(event) {
    // A click on the <dialog> itself (not on the picture, not on a button) was a click on the dark background.
    if (event.target === event.currentTarget) onClose()
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') onPrev()
    if (event.key === 'ArrowRight') onNext()
  }

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      onClose={onClose}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {isOpen && (
        <>
          <button type="button" className="round lightbox__close" aria-label="Close" onClick={onClose}>
            ×
          </button>
          <figure className="lightbox__figure">
            <img src={photo.src} alt={photo.alt} />
            <figcaption>
              <strong>{photo.title}</strong>
              <span>{position}</span>
            </figcaption>
          </figure>
          <button type="button" className="round lightbox__prev" aria-label="Previous picture" onClick={onPrev}>
            ←
          </button>
          <button type="button" className="round lightbox__next" aria-label="Next picture" onClick={onNext}>
            →
          </button>
        </>
      )}
    </dialog>
  )
}

export default Lightbox
```

++Esc++ needs no code: the `<dialog>` handles it by itself. The carousel gets an `onKeyDown` the same way: there the
arrows step when the focus is in the carousel, for example after you clicked one of its arrow buttons. In
`src/components/Carousel.jsx`, write the `handleKeyDown` function under `showNext`, and replace the opening tag of
`<section>` with this:

```jsx file=src/components/Carousel.jsx mark=1-4,11
  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') showPrev()
    if (event.key === 'ArrowRight') showNext()
  }

  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label="Featured pictures"
      onKeyDown={handleKeyDown}
    >
```

:::check Check
Open a picture: ++→++ and ++←++ browse, ++Esc++ closes. Click the carousel's → button, then press the arrows: now the
carousel steps. While the large view is open, the arrows browse only there, not in the carousel. The intermediate
level is done: commit it!
:::

:::mistake Common mistake
`event.key === 'arrowright'` or `'Right'`. Key names are exact, capitals included: `'ArrowRight'`. If you are not sure
of a name, put this at the start of the event handler: `console.log(event.key)`, and press the key: the console tells
you.
:::

:::try Task
The carousel keeps playing behind the open large view. Stop it while the large view is open. `App` passes it the
`paused={openIndex !== null}` prop, and `Carousel` takes `paused`: the effect does not start a timer when it is true
(`if (!playing || paused) return`), and `paused` goes into the dependency array. (The whole `src/App.jsx` files of the
advanced level show the version without this task; if you did it, keep the `paused` prop on `<Carousel>`.)
:::

## Advanced level {level=3}

### Albums

The 36 pictures belong to three albums: landscapes (`landscapes`), shapes (`shapes`) and patterns (`patterns`).
Uploaded pictures go to an album of their own (`uploads`). Next comes an album picker: a row of buttons, of which only
one can be chosen at a time. Create the `src/components/AlbumFilter.jsx` file:

```jsx file=src/components/AlbumFilter.jsx
const ALBUMS = [
  { id: 'all', label: 'All' },
  { id: 'landscapes', label: 'Landscapes' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'uploads', label: 'My uploads' },
]

function AlbumFilter({ album, photos, onChange }) {
  return (
    <div className="albums" role="group" aria-label="Albums">
      {ALBUMS.map((item) => {
        // How many pictures are in this album? "All" counts every one.
        const count =
          item.id === 'all' ? photos.length : photos.filter((photo) => photo.album === item.id).length
        return (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={album === item.id}
            onClick={() => onChange(item.id)}
          >
            {item.label}
            <span className="chip__count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}

export default AlbumFilter
```

- The function given to `map` now has a `{…}` body instead of `(…)`, because before returning the button it
  calculates something, the `count`. In that case you have to write `return` yourself.
- [[aria-pressed]] is familiar from lesson 2: on buttons that can be switched on and off, it says whether the button
  is pressed (`true` if it is). Screen readers read this out too, and `App.css` uses it to know which button to fill
  in.
- `role="group"` and `aria-label` put the buttons into one group, named "Albums".

In `App`, the album gets its own state. What shows in the grid, though, does **not**: it is a [[derived value]], known
from lessons 3 and 11, calculated from the album and the list of pictures on every render. If we kept it in state too,
we would have to update it by hand on every upload and every album change, and one day we would forget. One more
thing: from now on the large view browses within the album, so `openIndex` is also a position within the album. If you
did the last task of the intermediate level, keep `paused={openIndex !== null}` on `<Carousel>` in this and the next
whole `App.jsx`: the code below shows the version without the task. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=5,13-14,17-19,27-28,33,46,50,53,60
import { useState } from 'react'
import { PHOTOS } from './photos.js'
import Carousel from './components/Carousel.jsx'
import UploadButton from './components/UploadButton.jsx'
import AlbumFilter from './components/AlbumFilter.jsx'
import Thumbnail from './components/Thumbnail.jsx'
import Lightbox from './components/Lightbox.jsx'
import './App.css'

function App() {
  // The list of pictures: PHOTOS is only its starting value.
  const [photos, setPhotos] = useState(PHOTOS)
  const [album, setAlbum] = useState('all')
  // Which picture is open in the large view: its position in albumPhotos, or null if none is open.
  const [openIndex, setOpenIndex] = useState(null)

  // Derived values: made from the state on every render, they need no state of their own.
  const albumPhotos = album === 'all' ? photos : photos.filter((photo) => photo.album === album)
  const openPhoto = openIndex === null ? null : albumPhotos[openIndex]

  function addPhotos(newPhotos) {
    // The new pictures go first, the old ones after them: a new array, the old one is left as it is.
    setPhotos([...newPhotos, ...photos])
  }

  function showPrev() {
    // Before the first comes the last; + albumPhotos.length keeps it from going negative.
    setOpenIndex((openIndex - 1 + albumPhotos.length) % albumPhotos.length)
  }

  function showNext() {
    // After the last comes the first: % wraps around.
    setOpenIndex((openIndex + 1) % albumPhotos.length)
  }

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <Carousel photos={photos} />

      <div className="toolbar">
        <AlbumFilter album={album} photos={photos} onChange={setAlbum} />
        <UploadButton onAdd={addPhotos} />
      </div>

      {albumPhotos.length === 0 && <p className="empty">No pictures in this album yet.</p>}

      <ul className="grid">
        {albumPhotos.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      <Lightbox
        photo={openPhoto}
        position={`${openIndex + 1} / ${albumPhotos.length}`}
        onClose={() => setOpenIndex(null)}
        onPrev={showPrev}
        onNext={showNext}
      />
    </main>
  )
}

export default App
```

The carousel still gets every picture (`photos`): it is the shop window of the whole exhibition, not of an album.

:::check Check
Five buttons appear next to the upload button, each with a number: All 36, Landscapes 12, Shapes 12, Patterns 12,
My uploads 0. "All" is blue. Click "Patterns": only the 12 patterns stay in the grid. Open the first one: the counter
says "1 / 12", and browsing stays within the patterns. Click the still empty "My uploads" album: the message "No
pictures in this album yet." appears in a dashed frame. Upload a picture: the number on "My uploads" goes up by one.
:::

:::mistake Common mistake
`showPrev`, `showNext` or `openPhoto` still calculate with `photos`. Then a click on the second picture of the
"Patterns" album does not open that picture but the second of all pictures: a landscape. The grid, the large view and
browsing must always use the same list, here `albumPhotos`.
:::

### Lazy loading

A real gallery can have hundreds of pictures, and most of them nobody ever scrolls down to. There is no point in
downloading all of them when the page opens. [[Lazy loading]] means that the browser downloads a picture only when it
gets close to the screen. It takes a single attribute: `loading="lazy"`.

While we are at it, the thumbnails should not pop in all of a sudden, but appear gently once they have arrived. `<img>`
sends a `load` event when the picture has been downloaded and can be drawn; in React that is `onLoad`. Here is the
whole `src/components/Thumbnail.jsx`:

```jsx file=src/components/Thumbnail.jsx mark=1,4-5,13-15
import { useState } from 'react'

function Thumbnail({ photo, onOpen }) {
  // Has the picture arrived? Until then it is invisible; then the CSS fades it in.
  const [loaded, setLoaded] = useState(false)

  return (
    <li className="grid__item">
      <button type="button" className="thumb" onClick={onOpen}>
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className={loaded ? '' : 'is-loading'}
          onLoad={() => setLoaded(true)}
        />
      </button>
    </li>
  )
}

export default Thumbnail
```

Every thumbnail gets its own `loaded` state, since every `<Thumbnail>` is a separate instance of the component, with
its own memory. Until the picture has arrived, the `is-loading` class makes it invisible (`opacity: 0`); then the class
goes away, and the CSS transition fades it in within half a second. Until then the button's grey background fills the
square.

Do **not** put `loading="lazy"` on the carousel's picture: it is at the top of the page and visible at once, so lazy
loading would only delay it.

:::check Check
The thumbnails fade in gently when the page loads. You can watch lazy loading in the developer tools. Open them
(++F12++), switch to the Network tab, and choose Img among the filters. Chrome loads quite far ahead (about 1250 pixels
below the bottom of the visible area), so on a computer screen (a laptop too) all 36 pictures are downloaded at once.
Turn on the phone view (++Ctrl++ + ++Shift++ + ++M++, on a Mac ++Cmd++ + ++Shift++ + ++M++) and reload the page: now
only about half of the pictures are in the list, the ones on the screen and those up to about 1250 pixels below it.
Scroll down: as you get closer, new `.svg` rows appear in the list, and the pictures fade in.
:::

:::mistake Common mistake
`onload`, in lowercase. React warns in the console ("Invalid event handler property `onload`. Did you mean
`onLoad`?") and does not attach the handler. So `loaded` never becomes true, and every thumbnail stays invisible: only
the grey squares show. In React the name of every event handler prop continues with a capital letter after `on`:
`onClick`, `onLoad`, `onKeyDown`.
:::

:::concept Where do the pictures live in a real gallery?
The sample pictures are in the project's `public` folder, and the uploaded ones only in the browser's memory: one
reload, and they are gone. A real gallery sends the uploaded file to its own server (with `fetch`, in a `FormData`
object), and the server puts it on a [[cloud image hosting]] service, such as Amazon S3 or Cloudinary. In return it
gets a permanent address, which it saves in a database, and which anyone can open from any device. The better image
hosts do more than that: they make smaller versions of a picture by themselves (a thumbnail for the grid, a bigger one
for the large view), and serve them from servers all over the world, a [[CDN]], always from the one closest to the
visitor. So the grid does not download the 4-megabyte original photo but a 20-kilobyte thumbnail: lazy loading and
small pictures together make a really fast gallery. In this course we use no outside services, so our uploads stay in
the browser tab.
:::

### Infinite scroll

Lazy loading puts off downloading the pictures, but the thumbnail elements are all on the page. For a gallery with
thousands of pictures even that is a lot. [[Infinite scroll]] goes further: at first only 12 pictures go into the grid,
and when scrolling reaches the bottom of the grid, the next 12 come. A real app asks the server for the next batch at
that point (for example `?page=2`); we already have every picture, so we just show more and more of them. It works the
same way.

How do we know that scrolling has reached the bottom of the grid? We put a [[sentinel]] element under the grid, a short
"More pictures on the way…" text, and ask the browser to tell us when it reaches the screen. That is what
[[IntersectionObserver]] is for:

- `new IntersectionObserver(callback, options)` makes an observer. It calls the `callback` function when a watched
  element reaches the screen or leaves it, and once right at the start, with the starting situation.
- `observer.observe(element)` starts watching an element, and `observer.disconnect()` stops everything.
- The `callback` gets a list (`entries`), with one entry per watched element. We have one element, `entries[0]`, and its
  `isIntersecting` field is true when the element is visible.
- `rootMargin: '200px'` acts as if the screen were 200 pixels bigger: the observer speaks up while the sentinel is still
  200 pixels below the bottom of the screen. By the time you scroll there, the pictures are already in place.

We need the sentinel's DOM element, so this again takes a `useRef`, just like the `<dialog>` did. Here is the whole
`src/App.jsx`:

```jsx file=src/App.jsx mark=1,10,16-17,20-21,25-26,29-41,48-52,74,81,86-90
import { useEffect, useRef, useState } from 'react'
import { PHOTOS } from './photos.js'
import Carousel from './components/Carousel.jsx'
import UploadButton from './components/UploadButton.jsx'
import AlbumFilter from './components/AlbumFilter.jsx'
import Thumbnail from './components/Thumbnail.jsx'
import Lightbox from './components/Lightbox.jsx'
import './App.css'

const PAGE_SIZE = 12 // how many pictures the grid grows by at a time

function App() {
  // The list of pictures: PHOTOS is only its starting value.
  const [photos, setPhotos] = useState(PHOTOS)
  const [album, setAlbum] = useState('all')
  // How many pictures of the album show in the grid.
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  // Which picture is open in the large view: its position in albumPhotos, or null if none is open.
  const [openIndex, setOpenIndex] = useState(null)
  // The sentinel: an element under the grid. When it gets near the screen, the next batch can come.
  const sentinelRef = useRef(null)

  // Derived values: made from the state on every render, they need no state of their own.
  const albumPhotos = album === 'all' ? photos : photos.filter((photo) => photo.album === album)
  const shownPhotos = albumPhotos.slice(0, shownCount)
  const hasMore = shownCount < albumPhotos.length
  const openPhoto = openIndex === null ? null : albumPhotos[openIndex]

  useEffect(() => {
    if (!hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        // The sentinel got near the screen: the next batch can come.
        if (entries[0].isIntersecting) setShownCount((count) => count + PAGE_SIZE)
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinelRef.current)
    // Cleanup: the old observer stops before a new one starts.
    return () => observer.disconnect()
  }, [hasMore, shownCount])

  function addPhotos(newPhotos) {
    // The new pictures go first, the old ones after them: a new array, the old one is left as it is.
    setPhotos([...newPhotos, ...photos])
  }

  function changeAlbum(newAlbum) {
    setAlbum(newAlbum)
    // A new album: the grid starts again with the first batch.
    setShownCount(PAGE_SIZE)
  }

  function showPrev() {
    // Before the first comes the last; + albumPhotos.length keeps it from going negative.
    setOpenIndex((openIndex - 1 + albumPhotos.length) % albumPhotos.length)
  }

  function showNext() {
    // After the last comes the first: % wraps around.
    setOpenIndex((openIndex + 1) % albumPhotos.length)
  }

  return (
    <main className="gallery">
      <header className="gallery__header">
        <h1>Pocket Gallery</h1>
        <p>36 small artworks, drawn in code.</p>
      </header>

      <Carousel photos={photos} />

      <div className="toolbar">
        <AlbumFilter album={album} photos={photos} onChange={changeAlbum} />
        <UploadButton onAdd={addPhotos} />
      </div>

      {albumPhotos.length === 0 && <p className="empty">No pictures in this album yet.</p>}

      <ul className="grid">
        {shownPhotos.map((photo, index) => (
          <Thumbnail key={photo.id} photo={photo} onOpen={() => setOpenIndex(index)} />
        ))}
      </ul>

      {hasMore && (
        <p ref={sentinelRef} className="load-more">
          More pictures on the way…
        </p>
      )}

      <Lightbox
        photo={openPhoto}
        position={`${openIndex + 1} / ${albumPhotos.length}`}
        onClose={() => setOpenIndex(null)}
        onPrev={showPrev}
        onNext={showNext}
      />
    </main>
  )
}

export default App
```

- `slice(0, shownCount)` gives the first `shownCount` items of the array, in a new array. `hasMore` says whether there
  is more to show: if not, the sentinel does not appear either.
- The `if (!hasMore) return` at the start of the effect is needed: without a sentinel, `sentinelRef.current` is `null`,
  and that cannot be watched.
- `setShownCount((count) => count + PAGE_SIZE)` gets an updater function again: the observer's function was also made
  during an earlier render, just like the carousel's timer.
- Why is `shownCount` in the dependency array? The observer only reports **changes**. On a big screen the sentinel may
  still be visible after the 12 new pictures: then nothing has changed, the observer stays quiet, and the grid would get
  stuck. This way, after every new batch the cleanup runs and a fresh observer starts, which reports the starting
  situation right away: if the sentinel is still visible, the next batch comes.
- `changeAlbum` sets `shownCount` back together with the album change. Its place is in the event handler, not in an
  effect: an effect would only run after rendering, so the grid would be drawn once more with the old number.
- The lightbox still browses the whole album (`albumPhotos`), not only the pictures already shown.

:::check Check
Turn on the phone view (++F12++, then ++Ctrl++ + ++Shift++ + ++M++, on a Mac ++Cmd++ + ++Shift++ + ++M++) and reload
the page: there are 12 pictures in the grid, with the "More pictures on the way…" text under them. Scroll down: 12 more
pictures come, then the last 12, and the text goes away. Switch albums: in the 12-picture albums every picture fits into
one batch, so there is no text. When you switch back to "All", the grid starts from the beginning again.

Turn off the phone view and reload. If the visible part of the page (without the browser's tabs and address bar) is at
least about 850 pixels high, the grid starts with 24 pictures right away, because the sentinel was already near the
screen at the start, and the observer reported that at once. Type `innerHeight` in the console to see how high yours
is. On a lower screen it may stay at 12, and that is fine too. If it is higher than about 1180
pixels, all 36 are there at once, and the zoom-out test below shows nothing new. Now zoom the page out (++Ctrl++ + ++-++, on a Mac
++Cmd++ + ++-++, a few times, to about 50%, on a small screen to 33%) and reload: all 36 pictures are there at once.
After the 24th picture the sentinel was still visible, and the third batch only came because a fresh observer started
when `shownCount` changed. As a test, take `shownCount` out of the dependency array: the grid stops at 24 pictures in
the same spot. Then put it back, and reset the zoom (++Ctrl++ + ++0++, on a Mac ++Cmd++ + ++0++).
:::

:::mistake Common mistake
The `if (!hasMore) return` is missing. When every picture is out, the sentinel goes away, `sentinelRef.current`
becomes `null`, and on the next run of the effect the page crashes: "Failed to execute 'observe' on 'IntersectionObserver':
parameter 1 is not of type 'Element'."
:::

### Drag to reorder

In the last step you make the order changeable: grab a picture and drop it onto another one to take its place. You
already reordered the to-dos this way in the advanced level of lesson 9; now we do the same with pictures. The
browser's built-in [[drag and drop|Drag and Drop API]] system works with four events:

- `dragstart`: when you start dragging the element. It happens on the dragged element.
- `dragover`: again and again, while you drag over an element. By default nothing can be dropped on anything; turning
  off this default behaviour with `preventDefault()` is how you allow a drop.
- `drop`: when you let go over an element. It happens on the target element.
- `dragend`: when the drag is over, whether the drop worked or not. Again on the dragged element.

The `draggable` attribute makes an element draggable. During the drag, `event.dataTransfer` is the "parcel" the drag
carries along: in `dragstart` we put something in it with `setData` (the picture's id), and at `drop` we take it out
with `getData`. `'text/plain'` says that it holds plain text. Here is the whole `src/components/Thumbnail.jsx`:

```jsx file=src/components/Thumbnail.jsx mark=3,6-7,9-13,15-18,20-23,26-33
import { useState } from 'react'

function Thumbnail({ photo, onOpen, onMove }) {
  // Has the picture arrived? Until then it is invisible; then the CSS fades it in.
  const [loaded, setLoaded] = useState(false)
  // Is this picture being dragged right now? Until it is dropped, it is faded.
  const [dragging, setDragging] = useState(false)

  function handleDragStart(event) {
    // The picture's id goes into the drag's "parcel": on the drop, it tells us which picture came.
    event.dataTransfer.setData('text/plain', photo.id)
    setDragging(true)
  }

  function handleDragOver(event) {
    // By default nothing can be dropped on anything: this allows it.
    event.preventDefault()
  }

  function handleDrop(event) {
    event.preventDefault()
    onMove(event.dataTransfer.getData('text/plain'), photo.id)
  }

  return (
    <li
      className={dragging ? 'grid__item is-dragging' : 'grid__item'}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={() => setDragging(false)}
    >
      <button type="button" className="thumb" onClick={onOpen}>
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className={loaded ? '' : 'is-loading'}
          onLoad={() => setLoaded(true)}
        />
      </button>
    </li>
  )
}

export default Thumbnail
```

All `Thumbnail` tells `App` is: "this picture was dropped here". The order lives in the `photos` state of `App`, so
the reordering happens there too. In `src/App.jsx`, write the `movePhoto` function under `changeAlbum`, and pass it to
`Thumbnail`:

```jsx file=src/App.jsx mark=1-10,19
  function movePhoto(fromId, toId) {
    const fromIndex = photos.findIndex((photo) => photo.id === fromId)
    const toIndex = photos.findIndex((photo) => photo.id === toId)
    // Not one of our pictures was dropped here (a file, for example), or it was dropped on itself: nothing to do.
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return
    const newPhotos = [...photos] // a copy: we never change the state directly
    const [moved] = newPhotos.splice(fromIndex, 1) // take it out of its old place…
    newPhotos.splice(toIndex, 0, moved) // …and put it in at the target's place
    setPhotos(newPhotos)
  }

  // … in the return, the grid, with the new prop of Thumbnail:
      <ul className="grid">
        {shownPhotos.map((photo, index) => (
          <Thumbnail
            key={photo.id}
            photo={photo}
            onOpen={() => setOpenIndex(index)}
            onMove={movePhoto}
          />
        ))}
      </ul>
```

- `findIndex` gives the position of the first item the condition is true for, and -1 if there is none. The reordering
  happens in the whole `photos` list, by the pictures' ids, so it works exactly inside an album too.
- `splice` changes the array in place: `splice(fromIndex, 1)` takes one item out at `fromIndex` and gives it back in an
  array; `splice(toIndex, 0, moved)` takes nothing out (0 items), but inserts `moved` at `toIndex`. Because it changes
  the array in place, use it only on the copy (`newPhotos`), never on the state itself.
- `const [moved] = …` is [[destructuring]]: it puts the first item of the returned array into the `moved` variable.
- The dragged picture takes the target's place, and the others slide over by one. Drag it forward, and the target moves
  back; drag it backward, and the target moves forward.

:::check Check
Grab the "Golden Hour" picture with the mouse and drag it onto the third one. While you drag, it fades at its old place.
When you let go, it lands in third place, and the second and third pictures slide forward by one. Switch to the
"Shapes" album and move a picture there too. Look at the carousel as well: its order follows the grid.
Congratulations, your gallery is done!
:::

:::mistake Common mistake
The `preventDefault()` is missing from `handleDragOver`. While dragging, the cursor shows a crossed-out circle, and when
you let go, the picture flies back to its place: the `drop` event never happens, because as far as the browser knows,
nothing can be dropped there.
:::

:::concept On phones and with the keyboard
HTML drag and drop was made for the mouse: not every browser supports it on touch screens, and with a keyboard you
cannot drag at all. A real app therefore offers another way too, for example "Move forward" and "Move back" buttons,
or uses a library made for this (dnd kit, for example) that handles touch and the keyboard as well.
:::

:::try Task
Put two small buttons (← and →) under every thumbnail that move the picture one place forward or back. `Thumbnail`
gets an `onShift` prop. `App` looks for the neighbour in the list the grid shows, as with the to-dos in lesson 9:
`const neighbor = albumPhotos[index + step]`, and if there is one, calls `movePhoto(photo.id, neighbor.id)`. A step of
one in the whole `photos` array would often swap places with a picture from another album inside an album, and nothing
would seem to happen. Now the gallery can be reordered with the keyboard too.
:::
