# What we build

A QR code generator: type some text or a link, and the page draws a QR code from it straight away, one you can scan
with your phone's camera. Then you give it a colour, a size and a small emoji in the centre, and download it as a PNG
or an SVG image. In the advanced level you turn a Wi-Fi password and a contact card into codes, the page remembers the
codes you downloaded, and the camera scans a code for you.

On the way you learn how to use an external npm package, how to wait for a library's answer inside an effect, and how
the browser downloads a file with no server involved.

:::levels
- A text field, and a QR code of what you type, drawn by the `qrcode` library. | about 2 hours
- Colour, size, an emoji in the centre, downloads as PNG and SVG files. | about 3 hours
- Wi-Fi and contact QR codes, a history, scanning QR codes with the camera. | about 3 hours
:::

**Before you start you need:** the first four lessons, above all lesson 2, "Dark Mode" (a custom hook,
`localStorage`), lesson 3, "Password Generator" (controlled inputs, `Promise` and `await`, `useEffect` with a cleanup
function) and lesson 4, "Mad Libs" (text fields, conditional rendering, `trim`). Wherever something is used in a new
way, it is explained again.

## Beginner level {level=1}

### Before you start

This lesson's exercise, a ready starting project, is in the course repository on GitHub, in the
`lessons/05-qr-code/exercise` folder (the "Exercise on GitHub" button above takes you there). Step 0 of lesson 1
explains in detail how to get it and set it up, and how to install Node.js, VS Code and Git if you do not have them
yet; here are just the commands.

Open a terminal in your work folder, where you keep your projects. The first time, clone the repository there:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git
```

If you already have it from an earlier lesson, run `git pull` in its `rika-mentoring` folder instead
(`cd rika-mentoring`, `git pull`, `cd ..`): it brings the new lessons. Instead of `git clone`, the **Code** → **Download ZIP** button on the
[repository's GitHub page](https://github.com/mazsola739/rika-mentoring) works too.

Copy the `lessons/05-qr-code/exercise` folder out of the repository into your work folder (outside the repository), and
name the copy `qr-code-generator`. In the terminal of your work folder this is one command (a file manager works too):

```shell
cp -r rika-mentoring/lessons/05-qr-code/exercise qr-code-generator
```

Open your copy in your editor, and type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite, qrcode)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white card in the middle of the
page, with the title "QR Code Generator". Nothing else yet.
:::

Leave the server running, open a second terminal (the **+** button in the terminal panel), and make your copy a git
repository with one commit, the starting point:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit, and it is worth committing after every step
that works.

The exercise has three files that matter for this lesson:

- `package.json`: the project's data sheet. We take a closer look at it in step 1, because for the first time it lists
  a package that belongs neither to React nor to Vite.
- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so you do not write
  styles: you only use the class names (`qr__layout`, `field`, `chip`, …) that the steps give you.

:::concept Have your phone ready too
The best way to check a QR code is to scan it. Most phones' camera apps recognise a code on their own and offer to
open the link in it; if yours does not, any QR reader app will do. The phone does not need to be on the same network
as your computer: it simply reads the code off the screen.
:::

### Your first external npm package: qrcode

Drawing a QR code is hard work: the text has to be turned into bits, error-correction data has to be calculated for
it, and all of it arranged into a strict pattern. You do not have to write any of that: someone already has, and
published it as an [[npm package]]. npm (lesson 1) downloads packages from a huge public collection; React and Vite
came from there too. A package whose functions you call from your own code is also called a [[library]].

Open `package.json`. The `dependencies` section lists the packages the app needs while it runs:

```json file=package.json mark=2
  "dependencies": {
    "qrcode": "^1.5.4",
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
```

`qrcode` is one of the project's [[dependencies|dependency]]: the app depends on it and does not work without it.
`^1.5.4` is its version number; the `^` means that a newer 1.x version is fine too (2.0, the next big version, is
not: a big version may change how the package is used, and our code could break). In step 0, `npm install` downloaded every package listed here into the [[node_modules]] folder. You never edit
that folder by hand, and git does not save it either (the `.gitignore` file leaves it out), since it can be downloaded
again at any time. You add a new package with `npm install package-name`: it downloads the package and writes it into
`package.json` too. `qrcode` is already in there for you, so there is nothing to do this time.

What a package can do, and how to use it, is in its [[documentation]]: search for `qrcode` on npmjs.com to read it. We
need just one function for now. `QRCode.toDataURL(text)` makes a QR code from the text and gives back a [[data URL]]:
a whole image packed into a piece of text, for example `data:image/png;base64,iVBORw0KGgo…`. The beginning says it is
a PNG image; the rest is the image itself, encoded as letters and digits. It can go into the `src` of an `<img>` just
like the address of an ordinary image file.

`toDataURL` does not hand over the image at once: it returns a `Promise`, just like writing to the clipboard in
lesson 3. There we waited for it with `await`; this time we use the Promise's [[then]] function. `.then(fn)` says what
should happen when the promise is fulfilled, and `fn` gets the result as its parameter. Making the image is work
outside drawing, so it goes into a `useEffect`, and the finished image goes into state so that React draws it. Change
`src/App.jsx` to this (the highlighted lines are new):

```jsx file=src/App.jsx mark=1-2,6-7,9-12,17-24
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import './App.css'

function App() {
  const text = 'https://react.dev'
  const [url, setUrl] = useState('')

  // The library returns a Promise: then() receives the finished image.
  useEffect(() => {
    QRCode.toDataURL(text).then((dataUrl) => setUrl(dataUrl))
  }, [text])

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">{/* The fields will go here. */}</div>
        <section className="qr__preview" aria-label="Preview">
          <div className="qr__stage">
            {url && <img className="qr__image" src={url} alt={`QR code for: ${text}`} />}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
```

- `import QRCode from 'qrcode'` does not start with `./`. A bare name without the dot means: look for this package in
  `node_modules`. The name `QRCode` is our choice (it is the package's default export, like the components of lesson
  1); the documentation calls it that too.
- `{url && <img … />}`: at the first drawing `url` is still an empty string, because the image only arrives later, in
  `then`. An empty string counts as "false", so nothing shows. As soon as `setUrl` gets the image, React draws `App`
  again, this time with the image.
- `{/* … */}` is a comment inside JSX: it does not appear on the page.
- The `alt` text, a template literal (lesson 1), tells screen readers what is in the picture.

Why not `await`? Because an effect's function cannot be `async`: React expects it to return a cleanup function at
most, and an `async` function always returns a Promise. `then` gets around that.

:::check Check
A black and white QR code appears on the right (on a narrow screen, under the title). Scan it with your phone: it
offers to open `react.dev`. Right-click the image and choose "Open image in new tab": the address bar shows the long
`data:image/png;base64,…` address.
:::

:::mistake Common mistake
`import QRCode from './qrcode'`, with a dot. `./` looks for a file in your own `src` folder, there is no such file
there, and Vite shows a red error page: "Failed to resolve import". If you skipped `npm install`, even `npm run dev`
does not start: the terminal says it does not know the `vite` command, because the `node_modules` folder does not exist
yet.
:::

:::try Try it
Change `text` to the address of your portfolio from lesson 1, or to a short message for your friends, and scan it with
your phone.
:::

### Text from a text field

The code always contains the same link for now. The user should type the text into a [[textarea]] (`<textarea>`): a
text field with several lines. In React it becomes a [[controlled input]], like the slider of lesson 3: its value
comes from state (`value`), and every keystroke updates the state (`onChange`). In HTML the text of a textarea goes
between the opening and the closing tag; in React it gets a `value`, just like an `<input>`.

The text field gets a component of its own. Create a `components` folder inside `src`, with a `TextForm.jsx` file in
it:

```jsx file=src/components/TextForm.jsx
function TextForm({ text, onChange }) {
  return (
    <label className="field">
      <span>Text or link</span>
      <textarea
        rows={4}
        value={text}
        placeholder="https://example.com or any text"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
      <small className="field__hint">{text.length} characters</small>
    </label>
  )
}

export default TextForm
```

`rows={4}` makes the field four lines tall, and the grey sample text of `placeholder` shows while the field is empty.
`spellCheck={false}` switches off the spell checker, which would underline every link anyway. The line at the bottom
counts the characters; the next step shows why that matters.

The state lives in `App`, because the QR code needs it too ([[lifting state up]], as in lesson 3): `TextForm` receives
the text and reports changes through `onChange`. Change `src/App.jsx` like this; `text` is now state:

```jsx file=src/App.jsx mark=3,7,19-21
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import TextForm from './components/TextForm.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  const [url, setUrl] = useState('')

  // The library returns a Promise: then() receives the finished image.
  useEffect(() => {
    QRCode.toDataURL(text).then((dataUrl) => setUrl(dataUrl))
  }, [text])

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
        </div>
        <section className="qr__preview" aria-label="Preview">
          <div className="qr__stage">
            {url && <img className="qr__image" src={url} alt={`QR code for: ${text}`} />}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
```

`onChange={setText}` hands the `setText` function to `TextForm`: when the field calls `onChange` with the new text, it
is really `setText` that runs. The effect's dependency array, `[text]`, now has a real job: React runs the effect
after every drawing in which `text` has changed. So every keystroke makes a new code.

:::check Check
Type in the field: the QR code changes with every keystroke, and the counter below counts along. Now delete the whole
text: the old code stays, and the console (++F12++ → Console) shows a red error: "Uncaught (in promise) Error: No
input text". We fix that in the next step.
:::

:::mistake Common mistake
An empty dependency array: `}, [])`. Then the effect runs only once, after the first drawing: whatever you type, the
code keeps showing the first text.
:::

:::try Try it
A QR code can hold more than web addresses. Type `tel:+441632960000` (scanning it offers to call the number),
`mailto:someone@example.com` (a new email) or `geo:51.5072,-0.1276` (a map, centred on London; not every phone knows
this one).
:::

### Empty field, text too long

Two things can stop the library from making the code. An empty text cannot become a QR code, so the library reports an error. A text
that is too long does not fit either: a QR code holds about two thousand three hundred characters at most. In both
cases the promise of `toDataURL` is not fulfilled but [[rejected|rejected promise]]: instead of an image, an error
comes out of it. Nobody has handled that so far, which is why the red "Uncaught (in promise)" appeared in the console
("nobody caught this promise's error").

The partner of `then` is `catch`: `.catch(fn)` runs when the promise fails, just like the `catch` part of `try/catch`
from lesson 3. The two calls can be chained: `promise.then(…).catch(…)`. And we do not even try with an empty text.
Change `src/App.jsx` like this:

```jsx file=src/App.jsx mark=9-11,14-22,24-35,45
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import TextForm from './components/TextForm.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)
  // Spaces are trimmed from both ends: text with only spaces counts as empty.
  const content = text.trim()

  useEffect(() => {
    // An empty text cannot become a QR code, so we do not even try.
    if (content === '') return
    QRCode.toDataURL(content)
      .then((dataUrl) => {
        setUrl(dataUrl)
        setError(false)
      })
      .catch(() => setError(true))
  }, [content])

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Type something and your QR code appears here.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        That is too much for a QR code. Make the text shorter!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR code for: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
        </div>
        <section className="qr__preview" aria-label="Preview">
          <div className="qr__stage">{preview}</div>
        </section>
      </div>
    </main>
  )
}

export default App
```

- `text.trim()` cuts the spaces and line breaks off the beginning and the end of the text. `content` is a [[derived
  value]], like the strength meter of lesson 3: we work it out from `text` at every drawing, and it needs no state of
  its own. From now on `content` goes into the QR code, so the effect depends on it: `[content]`.
- `if (content === '') return`: the effect ends right away when there is nothing to encode.
- On success `setError(false)` clears an earlier error; on failure `setError(true)` says something went wrong.
- JSX is a value too: you can put it in a variable. `preview` starts as `null`, which means "draw nothing". The `if …
  else if` chain replaces it with whatever should show right now: the empty-field message, the error message or the
  image. The image appears only once `url` is no longer empty, because an empty `src` would make React print a warning
  in the console.
- `role="alert"` asks screen readers to read the error out loud as soon as it appears.

:::check Check
Delete the text: the grey box says "Type something…", and the console stays clean. For a text that is too long, change
the starting value for a moment: `useState('qr'.repeat(1200))`. `repeat` writes "qr" 1200 times in a row, which makes
2400 characters: the counter shows 2400, and the box shows the red error message. Then set the starting value back.
:::

:::mistake Common mistake
Leaving out `setError(false)` in `then`. Then after a single text that is too long, the error message stays forever,
even when you shorten the text again, because nothing ever sets it back.
:::

:::concept How much fits in a QR code?
A QR code is made of tiny black and white squares, the [[modules|module]]. The smallest code is 21 × 21 modules, the
largest 177 × 177. The longer the text, the bigger and denser the code, and the harder it is to scan. With the
library's default setting, the largest code holds 2331 bytes. A letter without an accent is one byte, an accented
letter two, an emoji usually four. A text of only digits, or only capital letters, is stored more compactly, and more than three thousand
characters of it fit: that is why the number of characters is not the exact limit. For links, shorter is better.
:::

### A custom hook: useQrCode

`App` is getting crowded: two pieces of state and an effect, just to turn a text into an image. Let's move all that
into a [[custom hook]], as we did with `useDarkMode` in lesson 2: a function whose name starts with `use`, which calls
other hooks and returns what the component needs. `App` then asks for one thing only: "give me a QR code for this
text".

While moving it, we also fix a hidden bug. A promise answers some time after it was started. If you type fast, several
requests can be on their way at once, and nothing guarantees that the answers arrive in order: the code of a long text
may take longer to make than the code of a short one. If an old answer arrives last, the old code stays on the screen
while the field already holds a new text. This kind of bug is called a [[race condition]]: two processes race each
other, and the result depends on which one finishes first.

The fix is the [[cleanup function]] (lesson 3). React runs it before the effect runs again with the new text. Every
run of the effect has its own `ignore` variable; the cleanup sets the old one to `true`, so the old answer can no
longer overwrite the new one. Create the `src/useQrCode.js` file:

```js file=src/useQrCode.js mark=13,16,21,25-28
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// Makes a QR code from the text. Returns the image's address (url) and whether there was an error (error).
function useQrCode(text) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    // An empty text cannot become a QR code, so we do not even try.
    if (text === '') return

    let ignore = false
    QRCode.toDataURL(text)
      .then((dataUrl) => {
        if (ignore) return
        setUrl(dataUrl)
        setError(false)
      })
      .catch(() => {
        if (ignore) return
        setError(true)
      })

    // Cleanup: if a new text came in meanwhile, this round's answer is thrown away.
    return () => {
      ignore = true
    }
  }, [text])

  return { url, error }
}

export default useQrCode
```

The hook returns an object with the two values in it. `App` takes them out with [[destructuring]], as it did with the
result of `useDarkMode` in lesson 2. The `useEffect`, the two pieces of state and the `qrcode` import disappear from
`src/App.jsx`; here is its new version:

```jsx file=src/App.jsx mark=1-2,10
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import TextForm from './components/TextForm.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  // Spaces are trimmed from both ends: text with only spaces counts as empty.
  const content = text.trim()
  const { url, error } = useQrCode(content)

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Type something and your QR code appears here.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        That is too much for a QR code. Make the text shorter!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR code for: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
        </div>
        <section className="qr__preview" aria-label="Preview">
          <div className="qr__stage">{preview}</div>
        </section>
      </div>
    </main>
  )
}

export default App
```

Inside the hook the parameter is called `text`, while `App` passes `content` to it: whatever the variable is called
outside, the hook sees it under its own name.

:::check Check
Everything works as before: the code changes as you type, the empty field shows its message, a text that is too long
shows the error. Seen from outside, this step only tidied up: the race condition is rarely visible, but the "Try it"
box below shows `ignore` at work. That completes the beginner level: commit it!
:::

:::mistake Common mistake
Leaving out the `return { url, error }` at the end of the hook. Then the hook returns `undefined`, the page goes
blank, and the console says: "Cannot destructure property 'url' of 'useQrCode(...)' as it is undefined", in other
words, there is no `url` to take out of `undefined`.
:::

:::try Try it
Watch `ignore` at work. Write `console.log('done:', text, 'ignored:', ignore)` at the very start of the `then`
function, before `if (ignore) return`, and reload the page. The console shows "done" twice, and the first one says
"ignored: true". During development, React's [[StrictMode]] (lesson 2) deliberately runs the effect twice, with the
cleanup in between; `ignore` throws away the first round's answer. Delete the line afterwards.
:::

## Intermediate level {level=2}

### Colour and size

The functions of `qrcode` also accept a second parameter: an object of settings. The documentation lists everything it
can contain; we need three of them:

- `width`: the width (and height) of the image in pixels.
- `margin`: the empty frame around the code, measured in modules. This is the [[quiet zone]]: a scanner needs a little
  empty space to find the edge of the code. The default of 4 modules is generous; 2 is plenty for us.
- `color`: two colours, one for the dark modules (`dark`) and one for the background (`light`).

The SVG image will need the same settings later, so the code that uses the library moves into a file of its own.
Create the `src/qr.js` file:

```js file=src/qr.js
import QRCode from 'qrcode'

// Turns our settings into the settings of the qrcode library.
export function qrOptions({ color, size }) {
  return {
    width: size, // the width of the image in pixels
    margin: 2, // the empty frame around the code, in modules
    color: { dark: color, light: '#ffffff' },
  }
}

// A PNG image, as a data URL.
export function makePng(text, settings) {
  return QRCode.toDataURL(text, qrOptions(settings))
}
```

The curly braces in the parameter of `qrOptions` are [[destructuring]]: they take `color` and `size` out of the object
straight away, the way components take their props. `makePng` simply passes on the promise of `toDataURL`. The hook
calls it from now on, and it receives the settings too. Change `src/useQrCode.js` like this:

```js file=src/useQrCode.js mark=2,4-6,15,30
import { useEffect, useState } from 'react'
import { makePng } from './qr.js'

// Makes a QR code from the text and the settings.
// Returns the image's address (url) and whether there was an error (error).
function useQrCode(text, { color, size }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    // An empty text cannot become a QR code, so we do not even try.
    if (text === '') return

    let ignore = false
    makePng(text, { color, size })
      .then((dataUrl) => {
        if (ignore) return
        setUrl(dataUrl)
        setError(false)
      })
      .catch(() => {
        if (ignore) return
        setError(true)
      })

    // Cleanup: if a new text came in meanwhile, this round's answer is thrown away.
    return () => {
      ignore = true
    }
  }, [text, color, size])

  return { url, error }
}

export default useQrCode
```

In the call `makePng(text, { color, size })`, `{ color, size }` is the shorthand you know from lesson 2: the same as
`{ color: color, size: size }`. When a key and the variable have the same name, writing it once is enough. Look at the
dependency array: `[text, color, size]`. It does not hold the settings object, but the three values one by one. `App`
passes a brand new `{ color, size }` object at every drawing, and React compares the old one with the new one. Two separate objects count as different
even when they hold the same values, so the effect would run again after every single drawing. Strings and numbers, on
the other hand, are compared by value: `'#1c2333'` always equals `'#1c2333'`.

A new component gives the colour and the size their fields. `<input type="color">` is the browser's built-in colour
picker: clicking it opens a palette, and its value is always a six-digit [[hex colour]] starting with `#`, for example
`#1c2333`. The size comes from a slider, like the password length in lesson 3. Create the
`src/components/StyleOptions.jsx` file:

```jsx file=src/components/StyleOptions.jsx
function StyleOptions({ color, size, onColorChange, onSizeChange }) {
  return (
    <fieldset className="group">
      <legend>Look</legend>
      <label className="field field--row">
        <span>Colour</span>
        <input type="color" value={color} onChange={(event) => onColorChange(event.target.value)} />
        <code>{color}</code>
      </label>
      <label className="field">
        <span>
          Size: <strong>{size} × {size}</strong> pixels
        </span>
        <input
          type="range"
          min="128"
          max="1024"
          step="32"
          value={size}
          onChange={(event) => onSizeChange(Number(event.target.value))}
        />
      </label>
    </fieldset>
  )
}

export default StyleOptions
```

The slider's `step="32"` means it moves in steps of 32. `Number()` turns the slider's text value into a number again.
Finally `App`: two new pieces of state, and the hook receives them:

```jsx file=src/App.jsx mark=4,9-10,13,34
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import TextForm from './components/TextForm.jsx'
import StyleOptions from './components/StyleOptions.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  const [color, setColor] = useState('#1c2333')
  const [size, setSize] = useState(256)
  // Spaces are trimmed from both ends: text with only spaces counts as empty.
  const content = text.trim()
  const { url, error } = useQrCode(content, { color, size })

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Type something and your QR code appears here.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        That is too much for a QR code. Make the text shorter!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR code for: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
          <StyleOptions color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
        </div>
        <section className="qr__preview" aria-label="Preview">
          <div className="qr__stage">{preview}</div>
        </section>
      </div>
    </main>
  )
}

export default App
```

:::check Check
Pick a colour: the dark modules of the code change colour, and the colour code shows next to the picker. Drag the
slider to the left: the image gets smaller, and the label says, for example, "160 × 160 pixels". Dragged to the right,
past a certain point the image stops growing on screen because it no longer fits the box, but its real size keeps
growing: you will see that when you download it.
:::

:::mistake Common mistake
Only `[text]` left in the dependency array. The colour and the size reach the hook, but the effect does not run again
when they change: drag the slider all you like, the image only updates when you also change the text.
:::

:::try Try it
Pick a light colour, a pale yellow for example, and try to scan it with your phone: it fails, or struggles. A scanner
needs strong contrast between the dark modules and the background. Dark colours are fine to play with, though: navy or
burgundy work just as well as black.
:::

### Download as PNG

The image is ready; now let's download it. The simplest download needs nothing but a link. The [[download attribute]]
of the HTML `<a>` element tells the browser: do not open what the link points to, save it as a file; its value is the
suggested file name. And the data URL is the whole image itself, so the link points at the finished file, with no
server needed.

The buttons only show when there is something to download. That is a derived value too: `ready` is true when there is
content, there is no error, and the image has arrived. Change `src/App.jsx` like this:

```jsx file=src/App.jsx mark=14,39-45
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import TextForm from './components/TextForm.jsx'
import StyleOptions from './components/StyleOptions.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  const [color, setColor] = useState('#1c2333')
  const [size, setSize] = useState(256)
  // Spaces are trimmed from both ends: text with only spaces counts as empty.
  const content = text.trim()
  const { url, error } = useQrCode(content, { color, size })
  const ready = content !== '' && !error && url !== ''

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Type something and your QR code appears here.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        That is too much for a QR code. Make the text shorter!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR code for: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
          <StyleOptions color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
        </div>
        <section className="qr__preview" aria-label="Preview">
          <div className="qr__stage">{preview}</div>
          {ready && (
            <div className="qr__actions">
              <a className="button button--primary" href={url} download="qr-code.png">
                Download PNG
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
```

- `&&` in the `ready` line means "and": all three conditions have to be true. `!error` is true, thanks to the `!`,
  when there is **no** error.
- The link looks like a button thanks to the `button` class, but it stays a link, and rightly so: it leads to a file,
  and leading somewhere is what links are for (buttons are for actions).

:::check Check
Click "Download PNG": `qr-code.png` appears among your downloads. Open it: it is as big as the slider said (the image
viewer or the file's properties tell you). With some texts it is one pixel smaller, because the library rounds the
width down when it works it out. Delete the text: the button disappears, because there is nothing
to download.
:::

:::mistake Common mistake
Leaving out `download`. Then the link tries to open the image in the same tab, but for safety reasons the browser does
not let a page go to a data URL: nothing happens on click, and the console shows the error "Not allowed to navigate
top frame to data URL".
:::

:::try Try it
Give the file a more telling name, with its size: `download={'qr-code-' + size + '.png'}`. This needs curly braces,
because the name is no longer fixed text but a worked-out value: `+` joins the pieces, into `qr-code-512.png` for
example.
:::

### Download as SVG

A PNG is a [[raster image]]: it is made of as many pixels as the slider said. Blow it up for a poster and the
edges of the modules turn blurry or jagged. An SVG is a [[vector image]]: instead of pixels it stores descriptions of
shapes ("a square here, a line there"), and the computer redraws them at any size, so it stays sharp however much you
enlarge it. On top of that, an SVG is plain text that opens in any editor.

`qrcode` can make SVG too: `QRCode.toString(text, { type: 'svg' })` returns a promise that is fulfilled with the text
of the SVG. Add the `makeSvg` function to `src/qr.js`:

```js file=src/qr.js mark=17-20
import QRCode from 'qrcode'

// Turns our settings into the settings of the qrcode library.
export function qrOptions({ color, size }) {
  return {
    width: size, // the width of the image in pixels
    margin: 2, // the empty frame around the code, in modules
    color: { dark: color, light: '#ffffff' },
  }
}

// A PNG image, as a data URL.
export function makePng(text, settings) {
  return QRCode.toDataURL(text, qrOptions(settings))
}

// An SVG image, as text.
export function makeSvg(text, settings) {
  return QRCode.toString(text, { ...qrOptions(settings), type: 'svg' })
}
```

`{ ...qrOptions(settings), type: 'svg' }` is the [[spread]] from lesson 3: it copies the shared settings into a new
object and adds `type`.

Now a piece of text has to become a file, and that file has to be downloaded. A [[Blob]] is a chunk of data in memory,
together with its type: `new Blob([svg], { type: 'image/svg+xml' })` makes an SVG file from the text, only in memory
instead of on the disk. The square brackets in `[svg]` are not a typo: a Blob expects an array, because it can build a
file from several pieces; we only need one. A Blob has no address yet that a link could point at. `URL.createObjectURL(blob)` gives it a
temporary [[object URL]] (`blob:http://localhost:5173/…`), which lives as long as the page is open, or until we free
it. A link with `download` can point at that address. This time we do not write the link in JSX: we create it from
code, and "click" it from code too. Create the `src/download.js` file:

```js file=src/download.js
// Downloads a file (a Blob): it gets a temporary address, and we "click" an invisible link.
export function downloadFile(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  // Some browsers only start the download for a link that is on the page, so we add it for a moment.
  document.body.append(link)
  link.click()
  link.remove()
  // The temporary address takes up memory: once the download has started, we free it.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
```

`document.createElement('a')` creates a new `<a>` element that is not shown anywhere yet; `href` and `download` are
the same as in JSX. `link.click()` acts as if the user had clicked it, and `link.remove()` takes it away again.
`URL.revokeObjectURL` frees the temporary address; we wait a second before doing that, so the download has time to
start.

In `App` the settings now go to two places (the hook and the SVG), so they go into a `settings` variable. The SVG
button's event handler is `async`, because it has to wait for the promise of `makeSvg`, like the copy button of lesson
3 waited for the clipboard. In the code below, everything at the comments starting with `…` stays as it was, and so
does `export default App` at the end of the file:

```jsx file=src/App.jsx mark=3-4,10-11,14-17,29-31
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import { makeSvg } from './qr.js'
import { downloadFile } from './download.js'
// … the other imports, as before

function App() {
  // … the three pieces of state, as before
  const content = text.trim()
  const settings = { color, size }
  const { url, error } = useQrCode(content, settings)
  const ready = content !== '' && !error && url !== ''

  async function downloadSvg() {
    const svg = await makeSvg(content, settings)
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg')
  }

  // … the preview, as before

  return (
    <main className="qr">
      {/* … the title and the fields, as before */}
          {ready && (
            <div className="qr__actions">
              <a className="button button--primary" href={url} download="qr-code.png">
                Download PNG
              </a>
              <button type="button" className="button" onClick={downloadSvg}>
                Download SVG
              </button>
            </div>
          )}
      {/* … the closing tags, as before */}
    </main>
  )
}
```

:::check Check
Click "Download SVG": `qr-code.svg` arrives. Open it in the browser (drag it onto an empty tab) and zoom in
(++Ctrl++ + ++Plus++): the edges of the modules stay sharp at any zoom. Open it in your editor too: it is text,
starting with `<svg …>`. Inside it, one short `<path>` element paints the white background, and one long `<path>`
describes every dark module.
:::

:::mistake Common mistake
Leaving out the `await` before `makeSvg`. Then the `svg` variable holds the promise itself instead of the image's
text, and the Blob gets the words `[object Promise]`: the downloaded file does not open, because it is not valid SVG.
:::

### An emoji in the centre

Many QR codes have a small logo in the middle. How can that work when the logo covers part of the code? QR codes have
[[error correction]]: next to the data they store extra check information, so a scanner can still read the code
when part of it is damaged, dirty or covered. There are four levels: L (about 7% of the code may be missing), M (15%),
Q (25%) and H (30%). The library uses M by default; when a logo goes in the centre, we switch to H. The price: more
data is needed, so the code gets denser, and less text fits in it.

The logo is an emoji in a white square with rounded corners. In the PNG it has to be drawn on. That needs a
[[canvas]]: an HTML element you can draw on with JavaScript commands ("paint this rectangle white", "write this text
here"). `QRCode.toCanvas(text, settings)` makes a new canvas with the code on it. Like `toDataURL`, it hands it over
through a promise, so we wait for it with `await`. We draw the logo on top, and finally the canvas's own `toDataURL()`
makes the same kind of data URL from it that we got from the library so far.

In the SVG we do not draw, we write: two new elements go in before the closing `</svg>` tag. A small trick makes the
sizing easy. We wrap the elements in an inner `<svg>` whose `viewBox="0 0 100 100"` gives it a coordinate system of
its own: the whole image is 100 units wide, whatever its real size, so a start at 38 is always at 38% of the image. On
the canvas we multiply the same proportions by the width. Here is the whole `src/qr.js`:

```js file=src/qr.js mark=4,8-9,14-19,21-34,36-47
import QRCode from 'qrcode'

// Turns our settings into the settings of the qrcode library.
export function qrOptions({ color, size, logo }) {
  return {
    width: size, // the width of the image in pixels
    margin: 2, // the empty frame around the code, in modules
    // A logo covers a piece of the code: the strongest error correction (H) can handle that.
    errorCorrectionLevel: logo ? 'H' : 'M',
    color: { dark: color, light: '#ffffff' },
  }
}

// A PNG image, as a data URL. The library draws on a canvas, and we draw the logo on top.
export async function makePng(text, settings) {
  const canvas = await QRCode.toCanvas(text, qrOptions(settings))
  if (settings.logo) drawLogo(canvas, settings.logo)
  return canvas.toDataURL('image/png')
}

// A white rounded square in the middle of the image (24% of the width), with the emoji in it.
function drawLogo(canvas, logo) {
  const ctx = canvas.getContext('2d')
  const side = canvas.width
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(side * 0.38, side * 0.38, side * 0.24, side * 0.24, side * 0.05)
  ctx.fill()
  ctx.font = `${side * 0.15}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#000000'
  ctx.fillText(logo, side / 2, side / 2)
}

// An SVG image, as text. The same logo, made of SVG elements, written in before the closing </svg>.
export async function makeSvg(text, settings) {
  const svg = await QRCode.toString(text, { ...qrOptions(settings), type: 'svg' })
  if (!settings.logo) return svg
  const logo =
    '<svg viewBox="0 0 100 100" width="100%" height="100%">' +
    '<rect x="38" y="38" width="24" height="24" rx="5" fill="#ffffff"/>' +
    '<text x="50" y="50" font-size="15" text-anchor="middle" dominant-baseline="central">' +
    settings.logo +
    '</text></svg>'
  return svg.replace('</svg>', logo + '</svg>')
}
```

- `logo ? 'H' : 'M'`: the ternary operator (lesson 3). If there is a logo (`logo` is not an empty string), H,
  otherwise M.
- `getContext('2d')` gives the canvas's "brush" (`ctx`); we draw through it. `fillStyle` is the paint colour,
  `beginPath` starts a new shape, `roundRect(x, y, width, height, corner radius)` describes a rectangle with rounded
  corners (the last number is the radius of the corners), and `fill` paints it. `font` is the font size (15% of the
  width) and typeface, `textAlign` and `textBaseline` make sure the centre of the text lands exactly on the given
  point, and `fillText` writes it; before that the paint is set to black, because symbols without colour (♥ or ★, for
  example) would vanish white on the white square.
- `drawLogo` has no `export`: only this file uses it.
- `makePng` and `makeSvg` are `async` functions now. An `async` function always returns a promise, so the hook can
  handle it with `then` and `catch` just as before.
- `replace('</svg>', …)` swaps the closing tag for the logo followed by a new closing tag, so the logo goes at the
  very end of the image, on top of everything else.

The emoji picker is made of buttons. Each shows an emoji, and the chosen one has its [[aria-pressed]] attribute set to
`true`: that tells screen readers the button is "pressed in", and it is also how the CSS knows which one to highlight.
Create the `src/components/LogoPicker.jsx` file:

```jsx file=src/components/LogoPicker.jsx
const LOGOS = ['❤️', '☕', '🎵', '⭐', '🍕']

function LogoPicker({ logo, onChange }) {
  return (
    <fieldset className="group">
      <legend>Emoji in the centre</legend>
      <div className="chips">
        <button type="button" className="chip" aria-pressed={logo === ''} onClick={() => onChange('')}>
          None
        </button>
        {LOGOS.map((item) => (
          <button
            key={item}
            type="button"
            className="chip chip--emoji"
            aria-pressed={logo === item}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default LogoPicker
```

Emojis are characters just like letters, so they fit in an array of strings. Update `src/useQrCode.js` too: it passes
`logo` on as well, and adds it to the dependency array:

```js file=src/useQrCode.js mark=6,15,30
import { useEffect, useState } from 'react'
import { makePng } from './qr.js'

// Makes a QR code from the text and the settings.
// Returns the image's address (url) and whether there was an error (error).
function useQrCode(text, { color, size, logo }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    // An empty text cannot become a QR code, so we do not even try.
    if (text === '') return

    let ignore = false
    makePng(text, { color, size, logo })
      .then((dataUrl) => {
        if (ignore) return
        setUrl(dataUrl)
        setError(false)
      })
      .catch(() => {
        if (ignore) return
        setError(true)
      })

    // Cleanup: if a new text came in meanwhile, this round's answer is thrown away.
    return () => {
      ignore = true
    }
  }, [text, color, size, logo])

  return { url, error }
}

export default useQrCode
```

Here is the whole `App` as it looks at the end of the intermediate level:

```jsx file=src/App.jsx mark=7,14,17,46
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import { makeSvg } from './qr.js'
import { downloadFile } from './download.js'
import TextForm from './components/TextForm.jsx'
import StyleOptions from './components/StyleOptions.jsx'
import LogoPicker from './components/LogoPicker.jsx'
import './App.css'

function App() {
  const [text, setText] = useState('https://react.dev')
  const [color, setColor] = useState('#1c2333')
  const [size, setSize] = useState(256)
  const [logo, setLogo] = useState('')
  // Spaces are trimmed from both ends: text with only spaces counts as empty.
  const content = text.trim()
  const settings = { color, size, logo }
  const { url, error } = useQrCode(content, settings)
  const ready = content !== '' && !error && url !== ''

  async function downloadSvg() {
    const svg = await makeSvg(content, settings)
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg')
  }

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Type something and your QR code appears here.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        That is too much for a QR code. Make the text shorter!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR code for: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <TextForm text={text} onChange={setText} />
          <StyleOptions color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
          <LogoPicker logo={logo} onChange={setLogo} />
        </div>
        <section className="qr__preview" aria-label="Preview">
          <div className="qr__stage">{preview}</div>
          {ready && (
            <div className="qr__actions">
              <a className="button button--primary" href={url} download="qr-code.png">
                Download PNG
              </a>
              <button type="button" className="button" onClick={downloadSvg}>
                Download SVG
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
```

:::check Check
Choose ☕: a coffee cup appears in a white square in the middle of the code, and the code itself gets denser (that is
the extra data of level H). Scan it with your phone: it works despite the logo. Download it as PNG and as SVG: the
logo is in both. That completes the intermediate level: commit it!
:::

:::mistake Common mistake
A logo with M or L error correction (for example when the `errorCorrectionLevel` line is missing). The image looks the
same, but phones often cannot read it, because the logo covers more modules than the lower level can make up for.
:::

:::try Try it
Put an emoji of your own into the `LOGOS` array. Then see how far error correction goes: in `drawLogo`, change the
square from 24% to 40% (`side * 0.3, side * 0.3, side * 0.4, side * 0.4`) and try to scan it. Set it back afterwards.
:::

## Advanced level {level=3}

### A Wi-Fi code

A QR code can hold any text, but phones recognise a few formats in particular. Wi-Fi access is one of them: if the
code's text is `WIFI:T:WPA;S:Home;P:secret123;;`, the phone offers to join the network called "Home" with the password
"secret123". `T:` is the type of security, `S:` the network's name (SSID), `P:` the password; each one ends with a
semicolon, and the whole thing with one more. Put it up in the living room, and your guests no longer have to spell
out the password.

What happens if the password contains a semicolon, like `se;cret`? The phone would think the password ended at `se`.
So the special characters (`\`, `;`, `,`, `:` and `"`) get a backslash in front of them: `se\;cret`. This is called
[[escaping]]: the backslash says "the next character is part of the text, not a separator". In JavaScript strings the
backslash is special itself, so a single backslash has to be written as `'\\'`.

The formats go into a new file, `src/formats.js`:

```js file=src/formats.js
// A \ goes before special characters, so the scanner reads them as text, not as separators.
function escapeChars(text, specials) {
  let result = ''
  for (const char of text) {
    if (specials.includes(char)) result += '\\'
    result += char
  }
  return result
}

// Wi-Fi, in the form WIFI:T:WPA;S:network;P:password;; The phone's camera offers to join the network.
export function wifiText({ ssid, password, security, hidden }) {
  let text = `WIFI:T:${security};S:${escapeChars(ssid, '\\;,:"')};`
  if (security !== 'nopass') text += `P:${escapeChars(password, '\\;,:"')};`
  if (hidden) text += 'H:true;'
  return text + ';'
}
```

`for (const char of text)` goes through the text one character at a time, and `includes` tells whether the character
is in the list of special ones. The parameter of `wifiText` is destructured again: the four fields come straight out
of the Wi-Fi object. `nopass` is a network without a password, and `H:true` marks a hidden network: one that does not
show in the phone's list, so you can only join it by its name.

The `WifiForm` component draws the form. The four fields live in one object, so a single `update` function is enough:
with the spread from lesson 3 it copies the object and overwrites the one field that changed. There is one new form
element in it: `<select>`, a [[dropdown]]. It gets a `value` and an `onChange` just like an `<input>`, and its choices
are the `<option>` elements. For the checkbox, as in lesson 3, what counts is not `value` but `checked`, so the
event's `event.target.checked` is what we need. Create the `src/components/WifiForm.jsx` file:

```jsx file=src/components/WifiForm.jsx
function WifiForm({ wifi, onChange }) {
  // One field changed: a copy of the old object, with the one new value in it.
  function update(field, value) {
    onChange({ ...wifi, [field]: value })
  }

  return (
    <div className="form">
      <label className="field">
        <span>Network name (SSID)</span>
        <input value={wifi.ssid} onChange={(event) => update('ssid', event.target.value)} />
      </label>
      <label className="field">
        <span>Security</span>
        <select value={wifi.security} onChange={(event) => update('security', event.target.value)}>
          <option value="WPA">WPA / WPA2 / WPA3</option>
          <option value="WEP">WEP (old)</option>
          <option value="nopass">No password</option>
        </select>
      </label>
      {wifi.security !== 'nopass' && (
        <label className="field">
          <span>Password</span>
          <input
            value={wifi.password}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => update('password', event.target.value)}
          />
        </label>
      )}
      <label className="check">
        <input
          type="checkbox"
          checked={wifi.hidden}
          onChange={(event) => update('hidden', event.target.checked)}
        />
        Hidden network
      </label>
    </div>
  )
}

export default WifiForm
```

`[field]: value` is the key in square brackets from lesson 3: "the key whose name is in the `field` variable". An
`<input>` with no `type` is a plain text field.

At the top, a row of tabs chooses what kind of code we make: each tab is one kind of code. It is made of the same kind
of buttons as the emoji picker, with `aria-pressed`, only styled differently. Create the `src/components/ModeTabs.jsx` file:

```jsx file=src/components/ModeTabs.jsx
const MODES = [
  { value: 'text', label: 'Text' },
  { value: 'wifi', label: 'Wi-Fi' },
]

function ModeTabs({ mode, onChange }) {
  return (
    <div className="modes" role="group" aria-label="Type of QR code">
      {MODES.map((item) => (
        <button
          key={item.value}
          type="button"
          className="modes__button"
          aria-pressed={mode === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default ModeTabs
```

`role="group"` and `aria-label` present the buttons to screen readers as a named group, the way `<fieldset>` does with
`<legend>`.

`App` needs two new pieces of state: the mode (`mode`) and the Wi-Fi details (`wifi`). The content of the QR code now
depends on the mode, but it is still a derived value: `content`, made with `let`, starts with the text, and in Wi-Fi
mode we overwrite it. Only the form of the current mode shows: that is [[conditional rendering]] with `&&`, like the
image in step 1 of this lesson (`{url && <img … />}`). Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=5-6,8,13,16,18,23-25,54-56
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import { makeSvg } from './qr.js'
import { downloadFile } from './download.js'
import { wifiText } from './formats.js'
import ModeTabs from './components/ModeTabs.jsx'
import TextForm from './components/TextForm.jsx'
import WifiForm from './components/WifiForm.jsx'
import StyleOptions from './components/StyleOptions.jsx'
import LogoPicker from './components/LogoPicker.jsx'
import './App.css'

const START_WIFI = { ssid: '', password: '', security: 'WPA', hidden: false }

function App() {
  const [mode, setMode] = useState('text') // 'text' or 'wifi'
  const [text, setText] = useState('https://react.dev')
  const [wifi, setWifi] = useState(START_WIFI)
  const [color, setColor] = useState('#1c2333')
  const [size, setSize] = useState(256)
  const [logo, setLogo] = useState('')

  // The content of the code depends on the mode. A derived value: worked out at every drawing.
  let content = text.trim()
  if (mode === 'wifi') content = wifi.ssid.trim() === '' ? '' : wifiText(wifi)

  const settings = { color, size, logo }
  const { url, error } = useQrCode(content, settings)
  const ready = content !== '' && !error && url !== ''

  async function downloadSvg() {
    const svg = await makeSvg(content, settings)
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg')
  }

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Type something and your QR code appears here.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        That is too much for a QR code. Make the text shorter!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR code for: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <ModeTabs mode={mode} onChange={setMode} />
          {mode === 'text' && <TextForm text={text} onChange={setText} />}
          {mode === 'wifi' && <WifiForm wifi={wifi} onChange={setWifi} />}
          <StyleOptions color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
          <LogoPicker logo={logo} onChange={setLogo} />
        </div>
        <section className="qr__preview" aria-label="Preview">
          <div className="qr__stage">{preview}</div>
          {ready && (
            <div className="qr__actions">
              <a className="button button--primary" href={url} download="qr-code.png">
                Download PNG
              </a>
              <button type="button" className="button" onClick={downloadSvg}>
                Download SVG
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
```

`wifi.ssid.trim() === '' ? '' : wifiText(wifi)`: as long as there is no network name, the content is empty, and the
preview shows its "Type something" message.

:::check Check
Click the "Wi-Fi" tab and enter your home network's name and password. Scan the code with your phone: it offers to
join the network. Choose "No password" as the security: the password field disappears. Click back to the "Text" tab:
your earlier text is still there, because its state lives in `App`, not in the `TextForm` that disappeared meanwhile.
:::

:::mistake Common mistake
`event.target.value` for the checkbox. A checkbox's `value` is always `"on"`, ticked or not, so `hidden` becomes a
string that always counts as "true": `H:true;` gets into the code every time. The tick is in `event.target.checked`.
:::

:::concept Who can see the password?
In a Wi-Fi code the password is readable text: anyone who takes a photo of the code learns it. That is why such a code
is best put up for a guest network, not for your main one.
:::

### A contact card

Contact cards have a standard format too, the [[vCard]]. Phones recognise it as well, and offer to save it to your
contacts:

```text
BEGIN:VCARD
VERSION:3.0
N:Anna Smith;;;;
FN:Anna Smith
TEL:+441632960000
EMAIL:anna@example.com
END:VCARD
```

Each detail is on a line of its own, and the start of the line says what it is. `N` is the name split into parts,
divided by semicolons: family name; given name; middle name; prefix; suffix. We put the whole name into the first part
and leave the rest empty, and phones are happy with that. `FN` is the full name to show, `TEL` the phone number, `EMAIL` the email address. The `BEGIN` and `END` lines wrap the whole thing. In a vCard
the backslash, the semicolon and the comma are special.

We collect the lines in an array, and at the end `join('\n')` joins them up. `'\n'` is a single character, the [[line
break]]: here too the backslash says that the `n` after it is not a letter but something special. Here is the whole
`src/formats.js`:

```js file=src/formats.js mark=19-27
// A \ goes before special characters, so the scanner reads them as text, not as separators.
function escapeChars(text, specials) {
  let result = ''
  for (const char of text) {
    if (specials.includes(char)) result += '\\'
    result += char
  }
  return result
}

// Wi-Fi, in the form WIFI:T:WPA;S:network;P:password;; The phone's camera offers to join the network.
export function wifiText({ ssid, password, security, hidden }) {
  let text = `WIFI:T:${security};S:${escapeChars(ssid, '\\;,:"')};`
  if (security !== 'nopass') text += `P:${escapeChars(password, '\\;,:"')};`
  if (hidden) text += 'H:true;'
  return text + ';'
}

// A contact card in vCard form: each detail on a line of its own. The phone offers to save it.
export function contactText({ name, phone, email }) {
  const fullName = escapeChars(name, '\\;,')
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${fullName};;;;`, `FN:${fullName}`]
  if (phone !== '') lines.push(`TEL:${escapeChars(phone, '\\;,')}`)
  if (email !== '') lines.push(`EMAIL:${escapeChars(email, '\\;,')}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}
```

The name is converted once (`fullName`) and used in both the `N` and the `FN` line. The phone number and the email are
optional: their lines only go in when they are not empty. The form is built just like the Wi-Fi one, only with three
text fields. For a field with `type="tel"` or `type="email"`, phones bring up the matching keyboard (digits, or one
with `@`). Create the `src/components/ContactForm.jsx` file:

```jsx file=src/components/ContactForm.jsx
function ContactForm({ contact, onChange }) {
  // One field changed: a copy of the old object, with the one new value in it.
  function update(field, value) {
    onChange({ ...contact, [field]: value })
  }

  return (
    <div className="form">
      <label className="field">
        <span>Name</span>
        <input value={contact.name} onChange={(event) => update('name', event.target.value)} />
      </label>
      <label className="field">
        <span>Phone number</span>
        <input type="tel" value={contact.phone} onChange={(event) => update('phone', event.target.value)} />
      </label>
      <label className="field">
        <span>Email address</span>
        <input type="email" value={contact.email} onChange={(event) => update('email', event.target.value)} />
      </label>
    </div>
  )
}

export default ContactForm
```

`ModeTabs` gets a third tab:

```jsx file=src/components/ModeTabs.jsx mark=4
const MODES = [
  { value: 'text', label: 'Text' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'contact', label: 'Contact' },
]

function ModeTabs({ mode, onChange }) {
  return (
    <div className="modes" role="group" aria-label="Type of QR code">
      {MODES.map((item) => (
        <button
          key={item.value}
          type="button"
          className="modes__button"
          aria-pressed={mode === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default ModeTabs
```

`App` needs the same as for Wi-Fi: a starting value, a piece of state, one line for the content and one for the form.
The `formats.js` import grows too: the first line of the code below replaces the old
`import { wifiText } from './formats.js'` line, so `contactText` joins `wifiText` in the same curly braces. Do not add
a second import from the same file, because the same name cannot be imported twice. In the code below, everything at
the comments starting with `…` stays as it was, and so does `export default App` at the end of the file:

```jsx file=src/App.jsx mark=1-2,6,9,12,18,28
import { contactText, wifiText } from './formats.js'
import ContactForm from './components/ContactForm.jsx'
// … the other imports, as before

const START_WIFI = { ssid: '', password: '', security: 'WPA', hidden: false }
const START_CONTACT = { name: '', phone: '', email: '' }

function App() {
  const [mode, setMode] = useState('text') // 'text', 'wifi' or 'contact'
  const [text, setText] = useState('https://react.dev')
  const [wifi, setWifi] = useState(START_WIFI)
  const [contact, setContact] = useState(START_CONTACT)
  // … the colour, the size and the logo, as before

  // The content of the code depends on the mode. A derived value: worked out at every drawing.
  let content = text.trim()
  if (mode === 'wifi') content = wifi.ssid.trim() === '' ? '' : wifiText(wifi)
  if (mode === 'contact') content = contact.name.trim() === '' ? '' : contactText(contact)

  // … settings, the hook, downloadSvg and the preview, as before

  return (
    <main className="qr">
      {/* … the title, as before */}
          <ModeTabs mode={mode} onChange={setMode} />
          {mode === 'text' && <TextForm text={text} onChange={setText} />}
          {mode === 'wifi' && <WifiForm wifi={wifi} onChange={setWifi} />}
          {mode === 'contact' && <ContactForm contact={contact} onChange={setContact} />}
      {/* … the rest, as before */}
    </main>
  )
}
```

:::check Check
Click the "Contact" tab and enter your name, phone number and email address. Scan it with your phone: it offers to
save a new contact, with every field in its place. As long as the name is empty, no code shows.
:::

:::mistake Common mistake
`join('/n')` instead of `join('\n')`: the slash and the backslash are easy to mix up. Then there are no line breaks,
the whole card becomes one long line full of "/n", and the phone shows it as plain text instead of a contact.
:::

:::try Task
Add a website to the card, the address of your portfolio for example: in a vCard that is the `URL:` line. You need to
touch three places: `START_CONTACT`, `ContactForm` and `contactText`.
:::

### History

It would be handy if the page remembered the codes you downloaded, so you could bring them back with one click. In
lesson 2 we saved the theme in `localStorage`. That storage only keeps strings, though, and we need to save an array.
The answer is [[JSON]], which you saw in lesson 4: a text format that can describe arrays and objects. `JSON.stringify(['a', 'b'])` makes a string
from the array (`'["a","b"]'`), and `JSON.parse` turns it back into an array.

The history gets a hook of its own, built just like the theme saving of lesson 2: a [[lazy initial state]] for
reading, an effect for saving, and `try/catch`, because the storage can be switched off and the saved text could even
be broken. Create the `src/useHistory.js` file:

```js file=src/useHistory.js
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'qr-history'
const MAX_ITEMS = 8

// Reads the saved list. Nothing saved, a broken save or a blocked storage: we start with an empty list.
function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) return saved
  } catch {
    // Never mind: then there is no history.
  }
  return []
}

function useHistory() {
  const [items, setItems] = useState(readHistory)

  // Every change is saved, so the list is still there after a reload.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Never mind if it cannot be saved.
    }
  }, [items])

  // The new item goes first; if it was there already, it leaves its old place. At most MAX_ITEMS stay.
  function remember(text) {
    setItems([text, ...items.filter((item) => item !== text)].slice(0, MAX_ITEMS))
  }

  function clear() {
    setItems([])
  }

  return { items, remember, clear }
}

export default useHistory
```

- When nothing is saved yet, `getItem` returns `null`, and `JSON.parse(null)` is `null` as well.
  `Array.isArray(saved)` is only true when an array really came back; in every other case we start with an empty list.
- `remember` puts a new array together: the new text first, and after it, spread out with `...`, the old items that
  are not the same as it (`filter`, lesson 3). That way the same code never appears twice. `slice(0, MAX_ITEMS)` keeps
  the first eight items and cuts off the rest.
- We still never change state directly: `setItems` always gets a new array.

The list goes into the `History` component. Each item is a button that brings the text back; the [[key]] is the text
itself, since it is unique anyway. Create the `src/components/History.jsx` file:

```jsx file=src/components/History.jsx
function History({ items, onPick, onClear }) {
  return (
    <section className="history">
      <div className="history__head">
        <h2>History</h2>
        {items.length > 0 && (
          <button type="button" className="history__clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      {items.length === 0 && <p className="history__empty">The codes you download appear here.</p>}
      <ul className="history__list">
        {items.map((item) => (
          <li key={item}>
            <button type="button" className="history__item" onClick={() => onPick(item)}>
              {item}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default History
```

`App` remembers the content at both downloads. The PNG link gets an `onClick`: the link still downloads the file, but
our function runs first. When you click an item, `openText` switches back to the "Text" tab and puts the text in the
field. A Wi-Fi code or a contact card comes back raw this way, as `WIFI:…` or `BEGIN:VCARD…`, but the QR code is the
same, since its content is the same text. In the code below, everything at the comments starting with `…` stays as it
was, and so does `export default App` at the end of the file:

```jsx file=src/App.jsx mark=1-2,7,14,17-21,32,38-40
import useHistory from './useHistory.js'
import History from './components/History.jsx'
// … the other imports and the two starting values, as before

function App() {
  // … the pieces of state, as before
  const history = useHistory()

  // … content, settings, the hook and ready, as before

  async function downloadSvg() {
    const svg = await makeSvg(content, settings)
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg')
    history.remember(content)
  }

  // An earlier text goes back into the text field.
  function openText(value) {
    setMode('text')
    setText(value)
  }

  // … the preview, as before

  return (
    <main className="qr">
      {/* … the title and the fields, as before */}
              <a
                className="button button--primary"
                href={url}
                download="qr-code.png"
                onClick={() => history.remember(content)}
              >
                Download PNG
              </a>
      {/* … the SVG button and the closing tags, as before, up to the end of qr__layout */}

      <div className="qr__extras">
        <History items={history.items} onPick={openText} onClear={history.clear} />
      </div>
    </main>
  )
}
```

`useHistory` returns an object, and this time we do not take it apart: `history.items`, `history.remember` and
`history.clear` read well with the name in front.

:::check Check
Download a few different codes: they appear in the history, newest first. Type the text of an earlier code again and
download it once more: it is not duplicated, it moves to the top of the list. Reload the page: the list is still there
(in the developer tools: Application → Local storage → `http://localhost:5173` → `qr-history`). Click an item: its text goes back to the "Text" tab, and the code shows again. "Clear"
empties the list.
:::

:::mistake Common mistake
Saving the array directly, without `JSON.stringify`: `localStorage.setItem(STORAGE_KEY, items)`. The storage turns the
array into a string by itself, but not as JSON: it joins the items with commas, `https://react.dev,WIFI:T:WPA…`. You
get no error, but after a reload `JSON.parse` cannot make sense of it, and the history starts empty.
:::

:::concept History and privacy
The history stays in the browser, but anyone who opens the page on this computer can see it, Wi-Fi passwords included.
On a shared computer, press the "Clear" button when you are done.
:::

### The camera picture

Finally, let's turn things around: the camera reads a QR code. We build it in two steps: in this one we switch the
camera on and show its picture on the page, and in the next one we recognise the code in it. The camera takes two
things.

- [[getUserMedia]] (`navigator.mediaDevices.getUserMedia`) switches the camera on. The browser asks the user for
  permission first, and `getUserMedia` only works in a [[secure context]]: on an `https://` address or on `localhost`,
  like the clipboard of lesson 3. It returns a promise that is fulfilled with a [[media stream]] (`MediaStream`): the
  camera's live picture.
- A `<video>` element shows the picture. The stream cannot be passed as a JSX attribute, though: it has to be written
  into the video element's `srcObject` property, directly on the real HTML element. That is what [[useRef]] is for.

`useRef` is a box that keeps a value from one drawing to the next, but when the value changes, React does not draw
again. `useRef(null)` starts with an empty box: its `current` field is `null` at first. Its most common use: give a
JSX element a `ref={videoRef}` attribute, and React puts the real HTML element, the [[DOM]] element, into the box's
`current` field as soon as the element is on the page. The DOM is the browser's own model of the page: React builds
these elements from the JSX, and a `ref` gives you direct access to one of them.

Switching the camera on and off is work outside drawing, so an effect does it, running whenever the `scanning` state
changes. The cleanup function matters a lot here: it is what switches the camera off. `ignore` is the same trick as in
`useQrCode`: if the scanner has already been stopped by the time the camera gets permission, the camera is switched
off again at once. Create the `src/components/Scanner.jsx` file:

```jsx file=src/components/Scanner.jsx
import { useEffect, useRef, useState } from 'react'

// Switches the camera off: stops every track of the stream (here only the video).
function stopCamera(stream) {
  stream.getTracks().forEach((track) => track.stop())
}

function Scanner() {
  const videoRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!scanning) return

    let ignore = false
    let stream = null

    async function start() {
      try {
        // On a phone, facingMode: 'environment' asks for the back camera.
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      } catch {
        if (ignore) return
        setMessage('Could not start the camera. Did you allow it in the browser?')
        setScanning(false)
        return
      }
      // If the scanner was stopped meanwhile, switch the camera off right away.
      if (ignore) {
        stopCamera(stream)
        return
      }
      videoRef.current.srcObject = stream
    }

    start()

    // Cleanup: the camera goes off when the scanner stops or disappears.
    return () => {
      ignore = true
      if (stream) stopCamera(stream)
    }
  }, [scanning])

  function startScanning() {
    setMessage('')
    setScanning(true)
  }

  return (
    <section className="scanner">
      <h2>Scan with the camera</h2>
      {scanning ? (
        <div className="scanner__camera">
          <video ref={videoRef} className="scanner__video" autoPlay playsInline muted />
          <button type="button" className="button" onClick={() => setScanning(false)}>
            Stop camera
          </button>
        </div>
      ) : (
        <button type="button" className="button" onClick={startScanning}>
          Start camera
        </button>
      )}
      {message !== '' && (
        <p className="scanner__note" role="status">
          {message}
        </p>
      )}
    </section>
  )
}

export default Scanner
```

- `start` is an `async` function inside the effect, because the effect itself cannot be `async`. The effect starts it
  and does not wait for it.
- If the user does not allow the camera, or there is no camera at all, the promise of `getUserMedia` is rejected and
  the `catch` branch runs, like with the clipboard of lesson 3: it shows the message and stops the scanner.
- `stream` and `ignore` are the effect's own variables: the cleanup function sees the same ones that `start` set. If
  `stream` is still `null` because the camera has not started yet, the cleanup has nothing to switch off; the
  `if (ignore)` branch takes care of that when the camera finally arrives.
- `getTracks()` gives the tracks of the stream in an array (a camera only has a video track). `forEach` runs the arrow
  function for every item of the array, like `map`, but it builds no new array: here it calls `stop()` on each track,
  and that is what turns the camera's light off.
- The video's `autoPlay` attribute starts the picture on its own, `playsInline` keeps it from going full screen on a
  phone, and `muted` is needed because browsers only let silent videos start by themselves.

The scanner goes next to the history, into the `qr__extras` box. In the code below, everything at the comments
starting with `…` stays as it was, and so does `export default App` at the end of the file:

```jsx file=src/App.jsx mark=1,13
import Scanner from './components/Scanner.jsx'
// … the other imports and the two starting values, as before

function App() {
  // … everything as before, up to the return

  return (
    <main className="qr">
      {/* … the title, the fields and the preview, as before, up to the end of qr__layout */}

      <div className="qr__extras">
        <History items={history.items} onPick={openText} onClear={history.clear} />
        <Scanner />
      </div>
    </main>
  )
}
```

:::check Check
Click "Start camera". The browser asks for permission: allow it, and the camera's picture appears. Click "Stop
camera": the picture disappears, and the camera's light goes off. If your computer has no camera, or you did not give
permission, a message starting with "Could not start the camera" appears.
:::

:::mistake Common mistake
Leaving `stopCamera(stream)` out of the cleanup function. The video disappears from the page, but the camera keeps
running in the background: its light stays on, and the camera icon on the browser tab shows that it is still in use.
Whatever starts in an effect has to be stopped in its cleanup.
:::

:::try Try it
See what `getTracks()` gives. Write `console.log(stream.getTracks())` under the `videoRef.current.srcObject = stream`
line and start the camera. The console shows an array with one item; open it: the `MediaStreamTrack` in it is the
camera's video track (`kind: "video"`), and `label` is the camera's name. Delete the line afterwards.
:::

:::concept How do I try it on my phone?
A phone's camera needs an `https://` address. If you start the development server with `npm run dev -- --host` and
open your computer's IP address on the phone (`http://192.168…`), `navigator.mediaDevices` does not even exist, and
the scanner says it could not start the camera. The easiest way is the advanced level of lesson 1: put the page on
GitHub Pages (`base: './'` in `vite.config.js`, the `deploy.yml` workflow and a `git push`), and open the `https://`
address you get on your phone. Recognising codes in the next step needs Chrome on Android.
:::

### Recognising the code

The camera picture is there; now for the recognition. [[BarcodeDetector]] does that: it finds the codes in a picture.
It is a new browser feature that is only available in some places for now, for example Chrome on Android and Chrome on
macOS; on Windows, in Firefox and on iPhones it is usually missing. So the code first has to check whether it exists
at all. That is [[feature detection]]: `'BarcodeDetector' in window` is true if the browser knows it.

One look is not enough: the code gets in front of the camera whenever the user holds it there. So we check the video's
current frame again every 300 milliseconds, with a [[setInterval]]. That is a repeating timer: the sibling of
`setTimeout` that runs not once but again and again, until `clearInterval` stops it. `Scanner` does not put what it
finds into the text field itself, since the text is `App`'s state: it tells `App` through an `onResult` prop, the way
`TextForm` does through `onChange`. Change `src/components/Scanner.jsx` like this (the highlighted lines are new):

```jsx file=src/components/Scanner.jsx mark=8,11,19,38-50,55,58,64,89-98
import { useEffect, useRef, useState } from 'react'

// Switches the camera off: stops every track of the stream (here only the video).
function stopCamera(stream) {
  stream.getTracks().forEach((track) => track.stop())
}

function Scanner({ onResult }) {
  const videoRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [found, setFound] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!scanning) return

    let ignore = false
    let stream = null
    let timer = null

    async function start() {
      try {
        // On a phone, facingMode: 'environment' asks for the back camera.
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      } catch {
        if (ignore) return
        setMessage('Could not start the camera. Did you allow it in the browser?')
        setScanning(false)
        return
      }
      // If the scanner was stopped meanwhile, switch the camera off right away.
      if (ignore) {
        stopCamera(stream)
        return
      }
      videoRef.current.srcObject = stream

      // Feature detection: can this browser recognise QR codes?
      if (!('BarcodeDetector' in window)) {
        setMessage('The camera works, but this browser cannot recognise QR codes.')
        return
      }
      const detector = new BarcodeDetector({ formats: ['qr_code'] })
      // Every 300 milliseconds we check whether there is a code in the camera picture.
      timer = setInterval(async () => {
        const codes = await detector.detect(videoRef.current)
        if (ignore || codes.length === 0) return
        setFound(codes[0].rawValue)
        setScanning(false)
      }, 300)
    }

    start()

    // Cleanup: watching stops and the camera goes off when the scanner stops or disappears.
    return () => {
      ignore = true
      clearInterval(timer)
      if (stream) stopCamera(stream)
    }
  }, [scanning])

  function startScanning() {
    setFound('')
    setMessage('')
    setScanning(true)
  }

  return (
    <section className="scanner">
      <h2>Scan with the camera</h2>
      {scanning ? (
        <div className="scanner__camera">
          <video ref={videoRef} className="scanner__video" autoPlay playsInline muted />
          <button type="button" className="button" onClick={() => setScanning(false)}>
            Stop camera
          </button>
        </div>
      ) : (
        <button type="button" className="button" onClick={startScanning}>
          Start camera
        </button>
      )}
      {message !== '' && (
        <p className="scanner__note" role="status">
          {message}
        </p>
      )}
      {found !== '' && (
        <div className="scanner__found">
          <p>
            Found: <strong>{found}</strong>
          </p>
          <button type="button" className="button button--primary" onClick={() => onResult(found)}>
            Open in the text field
          </button>
        </div>
      )}
    </section>
  )
}

export default Scanner
```

- The function we give the timer is an `async` arrow function, `async () => { … }`, so it can `await` the answer of
  `detect`. `detect` looks for codes in the video's current frame and returns an array; `rawValue` is the text in the
  code. If the array is empty, there is no code in the picture, and the next round tries again.
- When a code is found, `setScanning(false)` stops the scanner, and the effect's cleanup does the rest: it stops the
  timer and switches the camera off. That is why `timer` became one of the effect's own variables too, next to
  `stream` and `ignore`.
- If the browser does not know `BarcodeDetector`, `start` ends after the message: the camera picture shows, but no
  timer starts.
- When a code is found, we do not put its text in straight away: we show it, and the user decides whether to open it.

`App` gives the scanner the same `openText` as the history. Here is the whole, finished `src/App.jsx`:

```jsx file=src/App.jsx mark=45,98
import { useState } from 'react'
import useQrCode from './useQrCode.js'
import useHistory from './useHistory.js'
import { makeSvg } from './qr.js'
import { downloadFile } from './download.js'
import { contactText, wifiText } from './formats.js'
import ModeTabs from './components/ModeTabs.jsx'
import TextForm from './components/TextForm.jsx'
import WifiForm from './components/WifiForm.jsx'
import ContactForm from './components/ContactForm.jsx'
import StyleOptions from './components/StyleOptions.jsx'
import LogoPicker from './components/LogoPicker.jsx'
import History from './components/History.jsx'
import Scanner from './components/Scanner.jsx'
import './App.css'

const START_WIFI = { ssid: '', password: '', security: 'WPA', hidden: false }
const START_CONTACT = { name: '', phone: '', email: '' }

function App() {
  const [mode, setMode] = useState('text') // 'text', 'wifi' or 'contact'
  const [text, setText] = useState('https://react.dev')
  const [wifi, setWifi] = useState(START_WIFI)
  const [contact, setContact] = useState(START_CONTACT)
  const [color, setColor] = useState('#1c2333')
  const [size, setSize] = useState(256)
  const [logo, setLogo] = useState('')
  const history = useHistory()

  // The content of the code depends on the mode. A derived value: worked out at every drawing.
  let content = text.trim()
  if (mode === 'wifi') content = wifi.ssid.trim() === '' ? '' : wifiText(wifi)
  if (mode === 'contact') content = contact.name.trim() === '' ? '' : contactText(contact)

  const settings = { color, size, logo }
  const { url, error } = useQrCode(content, settings)
  const ready = content !== '' && !error && url !== ''

  async function downloadSvg() {
    const svg = await makeSvg(content, settings)
    downloadFile(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg')
    history.remember(content)
  }

  // An earlier or scanned text goes back into the text field.
  function openText(value) {
    setMode('text')
    setText(value)
  }

  let preview = null
  if (content === '') {
    preview = <p className="qr__empty">Type something and your QR code appears here.</p>
  } else if (error) {
    preview = (
      <p className="qr__error" role="alert">
        That is too much for a QR code. Make the text shorter!
      </p>
    )
  } else if (url !== '') {
    preview = <img className="qr__image" src={url} alt={`QR code for: ${content}`} />
  }

  return (
    <main className="qr">
      <h1>QR Code Generator</h1>
      <div className="qr__layout">
        <div className="qr__controls">
          <ModeTabs mode={mode} onChange={setMode} />
          {mode === 'text' && <TextForm text={text} onChange={setText} />}
          {mode === 'wifi' && <WifiForm wifi={wifi} onChange={setWifi} />}
          {mode === 'contact' && <ContactForm contact={contact} onChange={setContact} />}
          <StyleOptions color={color} size={size} onColorChange={setColor} onSizeChange={setSize} />
          <LogoPicker logo={logo} onChange={setLogo} />
        </div>
        <section className="qr__preview" aria-label="Preview">
          <div className="qr__stage">{preview}</div>
          {ready && (
            <div className="qr__actions">
              <a
                className="button button--primary"
                href={url}
                download="qr-code.png"
                onClick={() => history.remember(content)}
              >
                Download PNG
              </a>
              <button type="button" className="button" onClick={downloadSvg}>
                Download SVG
              </button>
            </div>
          )}
        </section>
      </div>

      <div className="qr__extras">
        <History items={history.items} onPick={openText} onClear={history.clear} />
        <Scanner onResult={openText} />
      </div>
    </main>
  )
}

export default App
```

:::check Check
Click "Start camera". In Chrome on Windows, the yellow note says the camera works but recognition is not available.
In Chrome on Android or macOS (on a phone this needs an `https://` address, see the "How do I try it on my phone?" box
of the previous step), hold a QR code in front of the camera, on another screen for example: "Found" appears, the
camera switches itself off, and the "Open in the text field" button puts its text into the field on the "Text" tab.
Congratulations, your QR code generator is finished!
:::

:::mistake Common mistake
Leaving `clearInterval(timer)` out of the cleanup. The camera goes off, but the timer keeps running, and every 300
milliseconds it looks for a code in a video that is no longer on the page: red errors pile up in the console. The
timer starts in the effect too, so the cleanup has to stop it as well.
:::

:::try Task
Put the scanned codes into the history too. In `App`, give `Scanner` a function of its own that calls
`history.remember(value)` as well as `openText(value)`.
:::
