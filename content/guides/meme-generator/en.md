# What we build

A meme maker. You pick a picture, write the top and bottom text on it in the classic meme lettering (white letters,
black outline), and download it as a PNG. The pictures come from the lesson's own meme API, but you can upload your own
too. In the advanced level you drag the captions and stickers wherever you like with the mouse or a finger, rotate them,
save the finished memes in a gallery and share them.

On the way you learn how a React app draws on a [[canvas]]: a picture, text with an outline, text wrapped over several
lines and rotated. You also learn how code loads a picture, how to work with the user's own file without it ever
leaving their computer, and how the canvas turns into a file you can download, keep and share.

:::levels
- A picture on the canvas with a top and a bottom text that change as you type, and four pictures to choose from. | about 2 hours
- Meme templates from the API, uploading your own picture, font, text size and colour, downloading as a PNG. | about 3 hours
- Captions you can drag and rotate, stickers, a gallery for finished memes, and sharing. | about 3 hours
:::

**Before you start you need:** the earlier lessons, above all lesson 5 (QR code: the first drawing on a canvas, Blob and
download), lesson 6 (card pictures shrunk on a canvas with `drawImage`), lesson 9 (the `useLocalStorage` hook), lesson
12 (image gallery: file upload and object URLs), lessons 14 and 20 (`fetch`, loading and error states, the `useFetch`
hook and `AbortController`), lessons 16 and 18 (`useRef`) and lesson 17 (pointer events). Whatever we reuse is
recapped in a few sentences, and everything new is explained step by step.

## Beginner level {level=1}

### Before you start

This lesson's exercise, a ready starting project, is in the course repository, in the
`lessons/25-meme-generator/exercise` folder (the "Exercise on GitHub" button above opens that folder on GitHub). You
start the same way as in lesson 1, and its step 0 explains every command in detail. In short: open a terminal in your
work folder, where the `rika-mentoring` repository is, bring in the new lessons, then copy this lesson's `exercise`
folder out of the repository as `meme-generator`:

```shell
cd rika-mentoring
git pull        # brings the new lessons
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/25-meme-generator/exercise meme-generator
```

No repository yet? Run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the first three lines.
No git? On the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**,
and copy the `lessons/25-meme-generator/exercise` folder out of it into your work folder as `meme-generator`. You work
in your copy: the repository stays untouched, so `git pull` keeps working.

Open the `meme-generator` folder in your editor (in VS Code: **File** → **Open Folder**), open a terminal in it
(**Terminal** → **New Terminal**), and start the project:

```shell
npm install     # needed once: downloads the project's packages (React, Vite and MSW)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a dark page with the title "Meme Generator"
in turquoise letters at the top. Nothing else yet: the meme maker is your job.
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

What is in the exercise:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React and the canvas, not CSS, so you do
  not write styles: you only use the class names the steps give you (`meme__stage`, `panel`, `field`, `pictures`, …).
  Have a look inside anyway!
- `src/mocks/`: the lesson's meme API, the "pretend server" described just below. `templates.js` draws the twenty
  meme template pictures in code, `handlers.js` lists the addresses it answers, `helpers.js` has three small helpers
  for the answers, and `browser.js` starts it all (`main.jsx` calls its `startPretendServer`). You do not need to
  change any of them.
- `public/mockServiceWorker.js`: a file of the MSW package. Leave it as it is.
- `src/main.jsx`: starts the pretend server first, and only then draws the page.

:::concept A quick recap: the pretend server
You met it in lesson 14: a web app usually asks a [[server]] for its data, through the addresses of an [[HTTP API]].
This course uses no outside services, so the exercise brings its own API. [[Mock Service Worker]] (MSW) starts a
[[service worker]], a small script that the browser runs next to the page and that catches the page's requests to
addresses starting with `/api/`. `src/mocks/handlers.js` answers them, after a short wait, just like a real server
would.

This lesson's API can do two things. `/api/memes` gives the list of meme templates (in the same shape as the real,
popular imgflip API), and `/api/memes/images/<id>.svg` gives the picture of one template. The pictures come from the
pretend server too: when an `<img>` or your code asks for such an address, it gets the picture just as if it came from
an image server.
:::

:::mistake Common mistake
You open the page on your phone: you start the server with `npm run dev -- --host` (as in lesson 3) and open the
address in the terminal's "Network" line (`http://192.168…`). Browsers run service workers only on secure addresses
(`https://…` and `localhost`), so the pretend server does not start there, and no picture loads. Work on the
`localhost` address.
:::

:::try Try it
Ask the API before you write a single line. Open the browser's console (++F12++ → Console), type this line and press
++Enter++ (if you paste it, Chrome first asks you to type `allow pasting`):

```js
fetch('/api/memes?lang=en').then((response) => response.json()).then(console.log)
```

A moment later the answer appears: `{ success: true, data: { memes: [...] } }`. Click the small triangles to look
inside: twenty templates, each with an `id`, a `name`, a picture address (`url`) and a size.
:::

### A drawing board in React: canvas and useRef

A meme is a picture with text on it. You could put one together in HTML (an `<img>` with two captions over it), but you
could not download that as one picture file. So we draw: a `<canvas>` is a drawing board on the page that JavaScript
can paint on, and that can be turned into a picture file at the end. You already drew on one in lesson 5: there the
qrcode library gave you the canvas, and you only drew a logo in its middle. In lesson 6 you also painted the card
pictures onto a canvas with `drawImage`, to shrink them. This time we put the canvas on the page ourselves and paint
everything on it.

Two things to know about it:

- A canvas has two sizes. The `width` and `height` attributes say how many pixels the drawing board has: on a
  `width="800"` canvas you can paint a picture 800 pixels wide. How big it is on the screen is up to the CSS:
  `App.css` shrinks it when it does not fit, and the drawing shrinks with it.
- You draw through the canvas's [[drawing context]]: `canvas.getContext('2d')` gives an object (usually called `ctx`)
  whose functions paint. `fillStyle` is the paint colour, `fillRect(x, y, width, height)` fills a rectangle with it,
  and `fillText(text, x, y)` writes text. Coordinates start at the top left corner: x grows to the right, y grows
  **downwards**.

This drawing has nothing to do with React, so it goes into a file of its own, like the password logic in lesson 3.
Create the file `src/drawMeme.js`:

```js file=src/drawMeme.js
// Everything that paints on the canvas. No React in here, only the canvas's own drawing tools.
export function drawMeme(canvas) {
  const ctx = canvas.getContext('2d')

  // A dark teal background over the whole canvas…
  ctx.fillStyle = '#083f58'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // …and a white caption in the middle.
  ctx.fillStyle = '#ffffff'
  ctx.font = '72px Impact, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Hello, canvas!', canvas.width / 2, canvas.height / 2)
}
```

`font` describes the letters the same way as the CSS `font` property: a size and a typeface. Because of
`textAlign = 'center'` and `textBaseline = 'middle'`, the point you give becomes the **middle** of the text,
horizontally and vertically.

`drawMeme` needs the canvas element. [[useRef]] gives you the `<canvas>` written in JSX, like the `<video>` in lesson
18: `useRef(null)` gives a box, and `ref={canvasRef}` asks React to put the real HTML element into its `current` slot
as soon as it is on the page. While the component's function runs (while React renders), the canvas is not on the
page yet. [[useEffect]], however, runs only after the render, so that is where the drawing goes. Create a `components`
folder in `src`, and in it the file `MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx
import { useEffect, useRef } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas() {
  const canvasRef = useRef(null)

  // We can only paint once the <canvas> is on the page, that is, after the render.
  useEffect(() => {
    drawMeme(canvasRef.current)
  }, [])

  return <canvas ref={canvasRef} className="meme__canvas" width="800" height="600" />
}

export default MemeCanvas
```

The empty [[dependency array]] (`[]`) means the effect runs only once, after the first render. In development
[[StrictMode]] runs it twice; that does no harm here, we paint the same thing in the same place twice.

Finally, put the canvas on the page. Replace the contents of `src/App.jsx`:

```jsx file=src/App.jsx mark=1,8-12
import MemeCanvas from './components/MemeCanvas.jsx'
import './App.css'

function App() {
  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas />
        </div>
      </div>
    </main>
  )
}

export default App
```

`meme__stage` is the dark box around the canvas. Later `meme__workspace` splits the page into two columns: the meme on
the left, the settings on the right.

:::check Check
A dark teal rectangle appears under the title, with "Hello, canvas!" in white letters in the middle. Make the browser
window narrower: the rectangle shrinks together with the caption, because the CSS squeezes it, while the drawing stays
800 × 600 pixels.
:::

:::mistake Common mistake
You set the canvas size with CSS (for example `style={{ width: 800, height: 600 }}`) instead of the `width` and
`height` attributes. The drawing board then stays at its default 300 × 150 pixels, and the CSS only blows it up and
stretches it: the caption is blurry, distorted and does not even fit, since 72-pixel letters cannot fit on a board 300
pixels wide. Always set the drawing board's size with the attributes (or in code: `canvas.width = …`).
:::

:::try Try it
Draw a golden circle above the caption. Add this to the end of `drawMeme`: `ctx.beginPath()`, then
`ctx.arc(400, 140, 60, 0, Math.PI * 2)` (the x and y of the centre, the radius, and that the circle goes from 0 to 2π,
that is, all the way round), finally `ctx.fillStyle = '#feb800'` and `ctx.fill()`. Once you have seen it, delete it.
:::

### A picture on the canvas

Now for a real picture. A picture has to be loaded first: the browser has to request it from its address, and that
takes time. An `<img>` takes care of this by itself, but the canvas needs a picture that has already loaded. That is
what the [[Image]] object is for: `new Image()` creates a picture in code that never appears on the page. As soon as it
gets a `src`, it starts loading, and when it is done it calls its `onload` function; if it failed (say, there is no
such picture), it calls `onerror`.

Loading is the job of a [[custom hook]], just as `useFetch` handled the requests in lesson 14: it gets an address and
tells you where it stands. Create the file `src/useImage.js`:

```js file=src/useImage.js
import { useEffect, useState } from 'react'

// Loads a picture so that it can be drawn on a canvas.
// Tells where it stands: { status: 'loading' | 'ready' | 'error', image }
function useImage(src) {
  const [result, setResult] = useState({ status: 'loading', image: null })

  useEffect(() => {
    // Becomes true when a new address comes (or the component goes away): the old picture must not write the state.
    let ignore = false
    setResult({ status: 'loading', image: null })

    const image = new Image()
    image.onload = () => {
      if (!ignore) setResult({ status: 'ready', image })
    }
    image.onerror = () => {
      if (!ignore) setResult({ status: 'error', image: null })
    }
    // From this line on, the browser loads it.
    image.src = src

    return () => {
      ignore = true
    }
  }, [src])

  return result
}

export default useImage
```

The `ignore` variable is the same trick as in lesson 14's `useFetch` hook: when the user picks two pictures quickly
one after the other, the first may arrive later than the second. The [[cleanup function]] then sets the old
effect's `ignore` to true, so the old picture arriving late can no longer overwrite the new one.

The drawing changes too. An uploaded photo can be 4000 pixels wide, a template 800 × 600 or 640 × 800 pixels. The
canvas always takes the picture's proportions, but it can be at most 800 × 800 pixels. The picture's own size is its
[[natural size]]: `image.naturalWidth` and `image.naturalHeight`. Replace the contents of `src/drawMeme.js`:

```js file=src/drawMeme.js mark=3-5,7-14,16-23
// Everything that paints on the canvas. No React in here, only the canvas's own drawing tools.

// The meme is at most this big (in pixels). The picture keeps its proportions.
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

// How big should the canvas be so the whole picture fits on it without being distorted?
function canvasSize(image) {
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  return {
    width: Math.round(image.naturalWidth * scale),
    height: Math.round(image.naturalHeight * scale),
  }
}

export function drawMeme(canvas, image) {
  const { width, height } = canvasSize(image)
  // Setting the size wipes the canvas: every drawing starts on a clean sheet.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)
}
```

- `scale` is the zoom factor. For a 4000 × 3000 photo it is `Math.min(800 / 4000, 800 / 3000)`, that is 0.2: the canvas
  becomes 800 × 600. We need the smaller factor, otherwise the longer side would stick out.
- `drawImage(picture, x, y, width, height)` paints the picture onto the canvas, starting at its top left corner, in the
  size you give.
- `canvas.width = width` does not only resize the canvas, it also wipes it. That is handy now: every drawing starts on
  a clean sheet.

The canvas component gets the picture, and paints itself again whenever a new picture arrives. Here is the whole
`src/components/MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx mark=4,7,9-10,12
import { useEffect, useRef } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas({ image }) {
  const canvasRef = useRef(null)

  // After the first render, and whenever a new picture arrives: paint the canvas again.
  useEffect(() => {
    if (image) drawMeme(canvasRef.current, image)
  }, [image])

  return <canvas ref={canvasRef} className="meme__canvas" width="800" height="800" />
}

export default MemeCanvas
```

`width="800" height="800"` is now only the starting size until the first picture arrives; after that `drawMeme` sets
it. React does not write it back, because the value in the JSX does not change. While there is no picture yet (`image`
is still `null`), we paint nothing.

`App` loads the first template, the tired mug, with the hook, and while it loads, or if loading fails, it shows a line
at the bottom of the canvas. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=1,6,13-23
import useImage from './useImage.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import './App.css'

function App() {
  const { status, image } = useImage('/api/memes/images/tired-mug.svg')

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas image={image} />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              Loading the picture…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              This picture could not be loaded.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default App
```

`const { status, image } = useImage(…)` is [[destructuring]]: it makes two variables straight from the object the hook
returns. Because of `role="status"` and `role="alert"`, screen readers read the message out too.

:::check Check
"Loading the picture…" shows up for a moment, then the tired mug appears on the canvas in front of a yellow background.
The canvas is square now, because the picture is 800 × 800 pixels.
:::

:::mistake Common mistake
You draw the picture without waiting for it to load: `const image = new Image()`, `image.src = …`, and right after that
`ctx.drawImage(image, …)`. No error appears, but the canvas stays empty, because at the moment of drawing the picture is
still on its way. `drawImage` can only paint a picture that has loaded: wait for `onload`.
:::

:::try Try it
Change the address to `'/api/memes/images/rubber-duck.svg'`: the rubber duck appears. Then to a picture that does not
exist, for example `'/api/memes/images/unicorn.svg'`: the pretend server answers with a 404 error, `onerror` runs, and
the error message appears. Finally set the mug back.
:::

### Top and bottom text

A real meme has two captions: one at the top of the picture, one at the bottom. The captions live in `App`'s state, in
one object, because both the canvas and the text fields need them: this is [[lifting state up]] from lesson 3. A new
component renders the fields: two [[controlled inputs|controlled input]], like in lesson 3. Create the file `src/components/TextFields.jsx`:

```jsx file=src/components/TextFields.jsx
function TextFields({ text, onChange }) {
  return (
    <fieldset className="panel">
      <legend>Text</legend>
      <label className="field">
        <span>Top text</span>
        <input type="text" value={text.top} onChange={(event) => onChange('top', event.target.value)} />
      </label>
      <label className="field">
        <span>Bottom text</span>
        <input type="text" value={text.bottom} onChange={(event) => onChange('bottom', event.target.value)} />
      </label>
    </fieldset>
  )
}

export default TextFields
```

Both fields call the same `onChange` prop; the first argument says which caption changed (`'top'` or `'bottom'`), the
second is the new text.

Now for the meme lettering. The classic meme caption is all capitals, white, with a thick black [[outline]]: that way it
can be read on light and dark pictures alike. On the canvas this takes two commands. `strokeText` draws only the
outline of the letters, in the `strokeStyle` colour and `lineWidth` thickness; `fillText` then fills them. Outline
first, the fill on top: half of the line ends up under the letter, and it does not cover the thinner parts. Replace the
contents of `src/drawMeme.js`:

```js file=src/drawMeme.js mark=16-30,32,40-44
// Everything that paints on the canvas. No React in here, only the canvas's own drawing tools.

// The meme is at most this big (in pixels). The picture keeps its proportions.
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

// How big should the canvas be so the whole picture fits on it without being distorted?
function canvasSize(image) {
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  return {
    width: Math.round(image.naturalWidth * scale),
    height: Math.round(image.naturalHeight * scale),
  }
}

// One caption in meme style: all capitals, white letters with a black outline.
function drawCaption(ctx, text, { x, y, fontSize, fromBottom }) {
  ctx.font = `${fontSize}px Impact, 'Arial Black', sans-serif`
  ctx.textAlign = 'center'
  // The top caption has its top edge, the bottom caption its bottom edge at height y.
  ctx.textBaseline = fromBottom ? 'bottom' : 'top'
  ctx.lineWidth = fontSize / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#ffffff'
  const caption = text.toUpperCase()
  // Outline first, then the fill on top: that way the line does not cover the letters.
  ctx.strokeText(caption, x, y)
  ctx.fillText(caption, x, y)
}

export function drawMeme(canvas, image, text) {
  const { width, height } = canvasSize(image)
  // Setting the size wipes the canvas: every drawing starts on a clean sheet.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  // Everything follows the canvas width: on 800 pixels, 60-pixel letters and a 32-pixel margin.
  const padding = width * 0.04
  const fontSize = width * 0.075
  drawCaption(ctx, text.top, { x: width / 2, y: padding, fontSize, fromBottom: false })
  drawCaption(ctx, text.bottom, { x: width / 2, y: height - padding, fontSize, fromBottom: true })
}
```

- `drawCaption` has no `export`: only this file uses it. Its third parameter is an object that we take apart right
  away (`{ x, y, fontSize, fromBottom }`): that way the call shows which number means what.
- `textBaseline` says which part of the text goes to the height y you give. For the top caption it is the top
  (`'top'`), for the bottom caption the bottom (`'bottom'`): so the top caption hangs down from the top of the picture,
  and the bottom one stands up from its bottom.
- `fromBottom ? 'bottom' : 'top'` is the [[ternary operator]] from lesson 3.
- `lineJoin = 'round'` rounds the corners of the outline; without it, spikes would stick out of the pointed letters (M,
  V, A).
- `toUpperCase()` turns the text into capitals, accented letters included (`ő` → `Ő`).
- Impact is among the system fonts on Windows and macOS; where it is missing, Arial Black or another heavy typeface
  takes its place. We do not use a web font on purpose: the canvas can only draw with a font that is already loaded at
  the moment of drawing, and system fonts are always ready.

The canvas gets the text as well. A screen reader cannot see the captions (to it the canvas is just a picture), so
`role="img"` and `aria-label` tell what is on it:

```jsx file=src/components/MemeCanvas.jsx mark=4,7,9-10,12-21
import { useEffect, useRef } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas({ image, text }) {
  const canvasRef = useRef(null)

  // After the first render, and whenever the picture or the text changes: paint the canvas again.
  useEffect(() => {
    if (image) drawMeme(canvasRef.current, image, text)
  }, [image, text])

  return (
    <canvas
      ref={canvasRef}
      className="meme__canvas"
      width="800"
      height="800"
      role="img"
      aria-label={`Meme. Top: ${text.top}. Bottom: ${text.bottom}.`}
    />
  )
}

export default MemeCanvas
```

`App` holds the state and connects the fields with the canvas. The settings go into the right-hand column
(`meme__controls`):

```jsx file=src/App.jsx mark=1,4,8,11-14,21,33-35
import { useState } from 'react'
import useImage from './useImage.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import TextFields from './components/TextFields.jsx'
import './App.css'

function App() {
  const [text, setText] = useState({ top: 'When the code', bottom: 'works on the first try' })
  const { status, image } = useImage('/api/memes/images/tired-mug.svg')

  function changeText(key, value) {
    // A copy of text, with one of its keys set to the new value.
    setText({ ...text, [key]: value })
  }

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas image={image} text={text} />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              Loading the picture…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              This picture could not be loaded.
            </p>
          )}
        </div>
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
        </div>
      </div>
    </main>
  )
}

export default App
```

`{ ...text, [key]: value }` is the [[spread]] from lesson 3: it copies the old object and overwrites one key in it, the
one whose name is in the `key` variable. Every keystroke gives a new `text` object, and since `text` is in the dependency
array of the canvas effect, the canvas paints itself again after every keystroke.

:::check Check
Over the mug, in big white letters with a black outline: "WHEN THE CODE", and at the bottom: "WORKS ON THE FIRST TRY".
On the right (under it in a narrow window) a "Text" card with two fields. Type in either one: the canvas updates after
every letter, in capitals even when you type in lower case.
:::

:::mistake Common mistake
`text` is missing from the `MemeCanvas` dependency array: `[image]`. React then does not know that the drawing depends
on the text too: the text changes in the field, but not on the canvas. Everything the effect uses from outside and that
can change goes into the array.
:::

:::try Try it
Swap the `strokeText` and `fillText` lines in `drawCaption`: the outline now lands on top of the fill, and the letters
get thin, almost disappear. Then try a thicker line: `ctx.lineWidth = fontSize / 4`. Once you have seen them, set both
back.
:::

### Long captions on several lines

Type a long top text, for example: "When the code works on the first try and you have no idea why". The caption sticks
out on both sides of the picture. HTML wraps a paragraph onto several lines by itself, the canvas does not: `fillText`
writes a single line, however long. We have to write the [[word wrap]] ourselves.

For that we need to know how wide a text will be. `ctx.measureText(text)` ([[measureText]]) measures it in the font
currently set on the drawing context, and returns an object whose `width` is the text's width in pixels. The idea
behind wrapping is simple: build the line word by word, and when the next word would not fit, start a new line.

If a single word is too long (say, a long link), it does not fit on one line even on its own, and we cannot cut it in
two, because we only wrap at spaces. Then we try again with smaller letters, at most eight times, 10% smaller each
time. Here is the whole `src/drawMeme.js`:

```js file=src/drawMeme.js mark=16-33,35-46,48-50,53-54,58-63,76-79
// Everything that paints on the canvas. No React in here, only the canvas's own drawing tools.

// The meme is at most this big (in pixels). The picture keeps its proportions.
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

// How big should the canvas be so the whole picture fits on it without being distorted?
function canvasSize(image) {
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  return {
    width: Math.round(image.naturalWidth * scale),
    height: Math.round(image.naturalHeight * scale),
  }
}

// Splits the text into lines word by word, so that no line is wider than maxWidth.
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ').filter((word) => word !== '')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line === '' ? word : `${line} ${word}`
    if (line !== '' && ctx.measureText(candidate).width > maxWidth) {
      // The word does not fit any more: the line is done, and the word starts the next one.
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line !== '') lines.push(line)
  return lines
}

// One caption in meme style: all capitals, white letters with a black outline, on several lines when needed.
function drawCaption(ctx, text, { x, y, maxWidth, fontSize, fromBottom }) {
  const caption = text.toUpperCase()
  let size = fontSize
  let lines = []
  // If a single word is too wide on its own, try again with smaller letters (at most eight times).
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px Impact, 'Arial Black', sans-serif`
    lines = wrapLines(ctx, caption, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size = size * 0.9
  }

  const lineHeight = size * 1.1
  // The bottom caption grows upwards: start as many lines higher as it has.
  const top = fromBottom ? y - lines.length * lineHeight : y

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineWidth = size / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#ffffff'
  lines.forEach((line, i) => {
    const lineY = top + i * lineHeight
    // Outline first, then the fill on top: that way the line does not cover the letters.
    ctx.strokeText(line, x, lineY)
    ctx.fillText(line, x, lineY)
  })
}

export function drawMeme(canvas, image, text) {
  const { width, height } = canvasSize(image)
  // Setting the size wipes the canvas: every drawing starts on a clean sheet.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  // Everything follows the canvas width: on 800 pixels, 60-pixel letters and a 32-pixel margin.
  const padding = width * 0.04
  // What both captions share. The lines may take up at most 92% of the canvas.
  const common = { x: width / 2, maxWidth: width * 0.92, fontSize: width * 0.075 }
  drawCaption(ctx, text.top, { ...common, y: padding, fromBottom: false })
  drawCaption(ctx, text.bottom, { ...common, y: height - padding, fromBottom: true })
}
```

What is new, in order:

- `wrapLines` cuts the text into words with `split(' ')`, and `filter` throws away the empty pieces that two spaces in a
  row would leave. `candidate` is the line so far plus the next word. If that is too wide, the line goes into the
  `lines` array and the word starts a new line; if not, the line gets longer. The `line !== ''` condition only matters
  for the very first word, while `line` is still empty: if even the first word does not fit, without the condition an
  empty line would go to the start of `lines`, and the caption would start with a blank line.
- The `for` loop of `drawCaption` tries at most eight times. [[every]] is true when the condition holds for every
  element of the array: if every line fits, `break` leaves the loop at once. If not, `size` gets 10% smaller and we
  wrap again.
- From now on every line is drawn from its top (`textBaseline = 'top'`), one under the other, `lineHeight` apart. For
  the bottom caption, `top` moves up by as many lines as it has: so the caption grows upwards from the bottom.
- The `common` object holds what the two captions share, and the spread (`...common`) copies it into both calls.

:::check Check
Type the long text above: it wraps onto two or three lines, centred, and nothing sticks out. Type a long one in the
bottom field too: the bottom caption grows upwards, its last line stays in place. Type a very long word
(`AAAAAAAAAAAAAAAAAAAAAAAA`): the letters get smaller until the word fits.
:::

:::mistake Common mistake
`measureText` runs before `ctx.font` is set. Measuring always uses the font currently set on the drawing context, which
starts out as tiny 10-pixel letters: the measured width is a fraction of the real one, everything goes on one line, and
the caption sticks out just like without wrapping. First the `font`, then the measuring.
:::

:::try Try it
Make the captions narrower: change `maxWidth: width * 0.92` to `width * 0.6`. The lines get shorter and break onto more
lines. Then set it back.
:::

### Choosing a picture

The last step of the beginner level: let the user choose another picture. The pictures come from a list, as thumbnails
(small versions of the pictures) in a grid. In the intermediate level we ask the API for the whole list; for now we type
in four templates by hand. Create the file `src/pictures.js`:

```js file=src/pictures.js
// Four templates from the lesson's API. The pretend server answers their addresses (src/mocks/handlers.js).
export const PICTURES = [
  { id: 'tired-mug', name: 'Tired Mug', url: '/api/memes/images/tired-mug.svg' },
  { id: 'rubber-duck', name: 'Rubber Duck Debugger', url: '/api/memes/images/rubber-duck.svg' },
  { id: 'snail-speed', name: 'Full Speed Snail', url: '/api/memes/images/snail-speed.svg' },
  { id: 'rocket-stuck', name: 'Launch Delayed', url: '/api/memes/images/rocket-stuck.svg' },
]
```

The field names (`id`, `name`, `url`) are the same as in the API's answer on purpose: that way the list can simply be
swapped in the intermediate level.

The picker draws a button for every picture, with the thumbnail and the name in it. The chosen button has its
[[aria-pressed]] attribute set to `true`, like the emoji picker in lesson 5: it tells screen readers that the button is
"pressed", and the CSS uses it to highlight the right one. Create the file `src/components/PicturePicker.jsx`:

```jsx file=src/components/PicturePicker.jsx
function PicturePicker({ pictures, selected, onSelect }) {
  return (
    <section className="panel">
      <h2>Choose a picture</h2>
      <ul className="pictures">
        {pictures.map((picture) => (
          <li key={picture.id}>
            <button
              type="button"
              className="picture"
              aria-pressed={picture.id === selected}
              onClick={() => onSelect(picture)}
            >
              <img src={picture.url} alt="" />
              <span>{picture.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PicturePicker
```

The thumbnail's `alt` text is empty: the picture's name is right next to it on the button, so a screen reader reads the
name, and not the same thing twice. The thumbnails come from the pretend server too: every `<img>` is a request to an
`/api/memes/images/…` address.

In `App` the chosen picture becomes state too. We keep the whole picture object (`{ id, name, url }`): loading needs
the `url`, highlighting needs the `id`. Here is the whole `src/App.jsx` as it looks at the end of the beginner level:

```jsx file=src/App.jsx mark=3,6,10,12,40
import { useState } from 'react'
import useImage from './useImage.js'
import { PICTURES } from './pictures.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import TextFields from './components/TextFields.jsx'
import PicturePicker from './components/PicturePicker.jsx'
import './App.css'

function App() {
  const [picture, setPicture] = useState(PICTURES[0])
  const [text, setText] = useState({ top: 'When the code', bottom: 'works on the first try' })
  const { status, image } = useImage(picture.url)

  function changeText(key, value) {
    // A copy of text, with one of its keys set to the new value.
    setText({ ...text, [key]: value })
  }

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas image={image} text={text} />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              Loading the picture…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              This picture could not be loaded.
            </p>
          )}
        </div>
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
        </div>
      </div>
      <PicturePicker pictures={PICTURES} selected={picture.id} onSelect={setPicture} />
    </main>
  )
}

export default App
```

`onSelect={setPicture}` passes the state setter straight down: the picker calls it with the picture object, and that is
exactly what we want to store. When `picture` changes, `useImage` gets a new address, its effect runs again and loads
the new picture. While it loads, the canvas still shows the old picture, with "Loading the picture…" at the bottom.
Thanks to the thumbnails, though, the browser usually has this picture already, so the swap is almost instant.

:::check Check
Under the canvas there is a "Choose a picture" card with four thumbnails and their names; the mug is highlighted. Click
the snail: the canvas becomes wider than it is tall (the picture is 800 × 600), and for the rocket taller than it is
wide. The captions always stay, at the top and the bottom of every picture. The beginner level is done: commit it!
:::

:::mistake Common mistake
`onClick={onSelect(picture)}`, without the arrow function. This does not call `onSelect` on a click but during the
render, with all four pictures, one after the other: the canvas shows the last one, the rocket, straight away, and
clicking does nothing. The console (++F12++) shows the error too: "Cannot update a component (`App`) while rendering a
different component (`PicturePicker`)". Here an argument has to be passed as well, which is why it needs
`() => onSelect(picture)`.
:::

:::try Try it
Open the Network panel of the developer tools (++F12++ → Network) and reload the page. There are the requests for the
four thumbnails, all under `/api/memes/images/`; the Size column says "(ServiceWorker)", meaning the pretend server
answered. The canvas picture has no row of its own: the browser requests the mug only once, and the thumbnail and the
canvas use the same answer.
:::

## Intermediate level {level=2}

### Meme templates from the API

Four pictures are not much of a choice. The API knows twenty templates: let's ask for the whole list. The request
needs [[fetch]] from lesson 14 and the `useFetch` hook from lesson 20 (Movie Search). Like there, a custom hook makes the request and tells where it stands:
loading (`'loading'`), arrived (`'success'`) or failed (`'error'`); and with a `retry` function you can try again.
Create the file `src/useFetch.js`:

```js file=src/useFetch.js
import { useEffect, useState } from 'react'

// Requests JSON from the address. Tells where it stands: { status, data, retry }
// status: 'loading' | 'success' | 'error'
function useFetch(url) {
  const [result, setResult] = useState({ status: 'loading', data: null })
  const [attempt, setAttempt] = useState(0) // retry() increases it, and the effect runs again

  useEffect(() => {
    const controller = new AbortController()
    setResult({ status: 'loading', data: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error(`The server answered with status ${response.status}`)
        const data = await response.json()
        setResult({ status: 'success', data })
      } catch {
        // If the cleanup stopped it, a newer request took its place: stay quiet.
        if (!controller.signal.aborted) setResult({ status: 'error', data: null })
      }
    }

    load()
    // Cleanup: on a new address (or when the component goes away), stop the request that is still on its way.
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setAttempt(attempt + 1)
  }

  return { ...result, retry }
}

export default useFetch
```

This is a shorter version of lesson 20's hook, with nothing new in it: here there is always an address, so the
`'idle'` state is left out. [[AbortController]] can stop the request: the cleanup function calls it when the address
changes or the component goes away. A stopped `fetch` ends with an error too, so the `catch` branch first looks at
`controller.signal.aborted`: if it is true, nothing went wrong, a newer request has only taken its place, and we stay
quiet. `response.ok` is false when the server answered with an error code (for example 404 or 500); then we throw an
error ourselves to land in the `catch` branch.

The API does not send a plain array but wraps it, like the real imgflip API does: `{ success: true, data: { memes:
[...] } }`. The `success` field also says on its own whether everything went fine: such an API may send
`success: false` even when the answer itself is a 200. We treat that as an error too.

The picker now gets the state of the request too: while loading it shows a short message, on an error a "Try again"
button. Here is the whole `src/components/PicturePicker.jsx`:

```jsx file=src/components/PicturePicker.jsx mark=1,5-17
function PicturePicker({ status, pictures, selected, onSelect, onRetry }) {
  return (
    <section className="panel">
      <h2>Choose a picture</h2>
      {status === 'loading' && (
        <p className="notice" role="status">
          Loading the templates…
        </p>
      )}
      {status === 'error' && (
        <div className="notice notice--error" role="alert">
          <p>The meme templates could not be loaded.</p>
          <button type="button" className="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
      <ul className="pictures">
        {pictures.map((picture) => (
          <li key={picture.id}>
            <button
              type="button"
              className="picture"
              aria-pressed={picture.id === selected}
              onClick={() => onSelect(picture)}
            >
              <img src={picture.url} alt="" />
              <span>{picture.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PicturePicker
```

`App` asks for the list, unwraps it and passes it on. The first picture cannot wait for the list, so the mug's address
now sits in a constant, `START_PICTURE`: the canvas can start loading right away while the list is still on its way. You
no longer need `pictures.js`; feel free to delete it. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=3,9-12,15-16,20-24,52-58
import { useState } from 'react'
import useImage from './useImage.js'
import useFetch from './useFetch.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import TextFields from './components/TextFields.jsx'
import PicturePicker from './components/PicturePicker.jsx'
import './App.css'

// The lesson's meme API (src/mocks/handlers.js). With lang=en the template names come in English.
const MEMES_API = '/api/memes?lang=en'
// We start with this picture, before the list of templates arrives.
const START_PICTURE = { id: 'tired-mug', name: 'Tired Mug', url: '/api/memes/images/tired-mug.svg' }

function App() {
  const templates = useFetch(MEMES_API)
  const [picture, setPicture] = useState(START_PICTURE)
  const [text, setText] = useState({ top: 'When the code', bottom: 'works on the first try' })
  const { status, image } = useImage(picture.url)

  // The API wraps the list like this: { success: true, data: { memes: [...] } }.
  // A false success is an error too, even when the answer itself arrived fine.
  let templateStatus = templates.status
  if (templateStatus === 'success' && !templates.data.success) templateStatus = 'error'
  const memes = templateStatus === 'success' ? templates.data.data.memes : []

  function changeText(key, value) {
    // A copy of text, with one of its keys set to the new value.
    setText({ ...text, [key]: value })
  }

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas image={image} text={text} />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              Loading the picture…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              This picture could not be loaded.
            </p>
          )}
        </div>
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
        </div>
      </div>
      <PicturePicker
        status={templateStatus}
        pictures={memes}
        selected={picture.id}
        onSelect={setPicture}
        onRetry={templates.retry}
      />
    </main>
  )
}

export default App
```

`templates.data.data.memes` looks odd, but it only follows the wrapping: `templates.data` is the whole answer, its
`data` field is the package, and in that `memes` is the list. `let templateStatus` is a `let` because the next line may
give it a new value. The list is a [[derived value]]: we do not keep it in a state of its own, we work it out from the
request's result on every render.

The API sends the picture addresses as full addresses (`http://localhost:5173/api/memes/images/…`), like a real server
would. The starting picture's address is short (`/api/memes/images/…`), so the highlight compares the `id`, not the
address: the `id` is the same in both (`'tired-mug'`).

:::check Check
Reload the page: "Loading the templates…" shows up for a moment, then twenty thumbnails with English names: "Tired
Mug", "Rubber Duck Debugger", "Cactus Wants a Hug"… The mug is highlighted, and clicking any other one puts it on the
canvas.
:::

:::mistake Common mistake
`templates.data.memes` instead of `templates.data.data.memes`. `templates.data` has no `memes` field, its value is
`undefined`, and the page crashes: the console says "Cannot read properties of undefined (reading 'map')". When you are
not sure what an answer looks like, look at it first in the console (like in step 0) or on the Network panel.
:::

:::try Try it
Break the address: `'/api/memez?lang=en'`. The pretend server does not know it, so the request reaches the development
server, which answers with an HTML page instead of JSON; `response.json()` throws an error, and the red box with the
"Try again" button appears. Write the right address back and save: the templates arrive by themselves, because the
address of `useFetch` changed, and its effect runs again. The "Try again" button does the same without changing the
code: a real server is often out of reach for just a moment, and the second request works.
:::

### Uploading your own picture

A meme from your own photo: for that you need to upload a picture. You know how from lesson 12: an
`<input type="file">` [[file input]] opens the computer's file picker, and `event.target.files[0]` is the chosen
[[File]]. `URL.createObjectURL(file)` makes an [[object URL]] for it (`blob:http://localhost:5173/…`) that points to
the file in the browser's memory. So the picture goes nowhere: it stays on your computer, the browser only lends it an
address. `useImage` loads it from that address just like any template.

The upload button is a component of its own, and it checks by itself that the file really is a picture.
`accept="image/*"` only asks the file picker to show pictures, but that can be got around, so we check the
[[MIME type]] too. Create the file `src/components/UploadButton.jsx`:

```jsx file=src/components/UploadButton.jsx
import { useState } from 'react'

function UploadButton({ onFile }) {
  const [error, setError] = useState('')

  function handleChange(event) {
    const file = event.target.files[0]
    // Empty the field, so the same file can be chosen again.
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('This file is not a picture. Choose a JPG, PNG, GIF or WebP file.')
      return
    }
    setError('')
    onFile(file)
  }

  return (
    <div className="upload">
      <label className="button button--primary">
        <input type="file" accept="image/*" className="visually-hidden" onChange={handleChange} />
        Upload your own picture
      </label>
      {error !== '' && (
        <p className="upload__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default UploadButton
```

The `<label>` looks like a button, and the real file input is inside it, hidden with the `visually-hidden` class: it
does not show on the screen, but the ++Tab++ key reaches it and a screen reader finds it. Because the `<label>` wraps
the input, clicking its text is the same as clicking the input. When you choose the same file again in a file input, the
browser sends no new `change` event; that is why we empty the input after taking the file out of it.

The button goes to the top of the picker card, above the error messages: if the templates do not load, your own picture
still works. Here is the whole `src/components/PicturePicker.jsx`:

```jsx file=src/components/PicturePicker.jsx mark=1,3,7,15
import UploadButton from './UploadButton.jsx'

function PicturePicker({ status, pictures, selected, onSelect, onRetry, onFile }) {
  return (
    <section className="panel">
      <h2>Choose a picture</h2>
      <UploadButton onFile={onFile} />
      {status === 'loading' && (
        <p className="notice" role="status">
          Loading the templates…
        </p>
      )}
      {status === 'error' && (
        <div className="notice notice--error" role="alert">
          <p>The meme templates could not be loaded. Your own picture still works.</p>
          <button type="button" className="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
      <ul className="pictures">
        {pictures.map((picture) => (
          <li key={picture.id}>
            <button
              type="button"
              className="picture"
              aria-pressed={picture.id === selected}
              onClick={() => onSelect(picture)}
            >
              <img src={picture.url} alt="" />
              <span>{picture.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PicturePicker
```

The uploaded picture becomes a picture object just like a template: `{ id: 'upload', name: the file's name, url: the
object URL }`. That way the picker can show it in the grid too, in the first place, and one click takes you back to it
after trying a template. These are the changes in `App` (wherever a comment starts with `…`, everything stays as it
was):

```jsx file=src/App.jsx mark=3,7-8,10-16,21,25
function App() {
  // … templates and picture, as before
  const [upload, setUpload] = useState(null) // the uploaded picture, if there is one
  // … text and useImage, as before

  // … templateStatus and memes, as before
  // Your own picture, if there is one, comes before the templates.
  const pictures = upload ? [upload, ...memes] : memes

  function chooseFile(file) {
    // The previous upload's temporary address is not needed any more: free the memory.
    if (upload) URL.revokeObjectURL(upload.url)
    const newUpload = { id: 'upload', name: file.name, url: URL.createObjectURL(file) }
    setUpload(newUpload)
    setPicture(newUpload)
  }

  // … changeText and the start of the return, as before
      <PicturePicker
        status={templateStatus}
        pictures={pictures}
        selected={picture.id}
        onSelect={setPicture}
        onRetry={templates.retry}
        onFile={chooseFile}
      />
  // … the closing tags, as before
```

`URL.revokeObjectURL` lets the old address go: as long as an object URL lives, the browser keeps the file in memory,
which can be several megabytes for a photo. We keep only the latest upload and free the old one.

:::check Check
Click "Upload your own picture" and choose a photo from your computer: your photo appears on the canvas with the two
captions, and in the grid in the first place, with the file's name. Click a template, then your photo again: it comes
back. Try uploading a file that is not a picture (in the file picker, set the filter to "All files"): a red warning
appears under the button, and the canvas does not change.
:::

:::mistake Common mistake
You empty the input first (`event.target.value = ''`) and read the file only after that. Emptying also empties the
`files` list, so `files[0]` is already `undefined`: the file picker closes and nothing happens. Take the file out first,
and only then empty the input.
:::

:::try Try it
Let the canvas accept a dragged picture too. Give the `meme__stage` box two event handlers in `App`:
`onDragOver={(event) => event.preventDefault()}` (without it the browser does not let you drop the file there) and
`onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) chooseFile(file) }}`.
Drag a picture onto it from your file manager! (It only checks that a file arrived, not that it is a picture: if you
like, copy that check over from `UploadButton`.)
:::

### Font, size and colour

The caption is always white 60-pixel Impact so far. Let the user choose the font, the size and the colour. The three
settings go into a `style` object in `App`'s state, like `text`.

Let's start with the drawing. The fonts go into an object at the top of `drawMeme.js`: each has a name for the picker
(`label`) and a font family for the canvas (`family`). All of them are system fonts, because the canvas can only draw
with a font that is already loaded. If one is missing on your computer, the next font in its list takes its place.

The colour comes from an `<input type="color">` colour picker, in the `'#ff0000'` form, like the colour codes of lesson
7. The outline colour does not need its own picker: light letters suit a black outline, dark letters a white one.
Whether a colour is light or dark we work out from its red, green and blue parts, weighted, because our eyes see green
as much brighter than blue (this is a simplified [[relative luminance]]). `parseInt(text, 16)` turns a
[[hexadecimal number]] into a number: `parseInt('ff', 16)` is 255.

The text size is meant for a meme 800 pixels wide; on a narrower canvas (for example a portrait photo) it gets
proportionally smaller, so the caption looks just as big. Here is the whole `src/drawMeme.js`:

```js file=src/drawMeme.js mark=3-9,43-50,52-53,59,73-74,83,92-99
// Everything that paints on the canvas. No React in here, only the canvas's own drawing tools.

// The fonts to choose from. All are system fonts: they can be drawn at once, nothing has to be downloaded.
export const FONTS = {
  impact: { label: 'Impact', family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  arial: { label: 'Arial Black', family: "'Arial Black', 'Arial Bold', Arial, sans-serif" },
  comic: { label: 'Comic Sans', family: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" },
  georgia: { label: 'Georgia', family: "Georgia, 'Times New Roman', serif" },
}

// The meme is at most this big (in pixels). The picture keeps its proportions.
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

// How big should the canvas be so the whole picture fits on it without being distorted?
function canvasSize(image) {
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  return {
    width: Math.round(image.naturalWidth * scale),
    height: Math.round(image.naturalHeight * scale),
  }
}

// Splits the text into lines word by word, so that no line is wider than maxWidth.
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ').filter((word) => word !== '')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line === '' ? word : `${line} ${word}`
    if (line !== '' && ctx.measureText(candidate).width > maxWidth) {
      // The word does not fit any more: the line is done, and the word starts the next one.
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line !== '') lines.push(line)
  return lines
}

// Light letters get a black outline, dark ones a white outline: readable on any picture.
function outlineFor(hex) {
  const red = parseInt(hex.slice(1, 3), 16)
  const green = parseInt(hex.slice(3, 5), 16)
  const blue = parseInt(hex.slice(5, 7), 16)
  const brightness = 0.299 * red + 0.587 * green + 0.114 * blue
  return brightness > 140 ? '#000000' : '#ffffff'
}

// One caption in meme style: all capitals, with an outline, on several lines when needed.
function drawCaption(ctx, text, { x, y, maxWidth, fontSize, font, color, fromBottom }) {
  const caption = text.toUpperCase()
  let size = fontSize
  let lines = []
  // If a single word is too wide on its own, try again with smaller letters (at most eight times).
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px ${FONTS[font].family}`
    lines = wrapLines(ctx, caption, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size = size * 0.9
  }

  const lineHeight = size * 1.1
  // The bottom caption grows upwards: start as many lines higher as it has.
  const top = fromBottom ? y - lines.length * lineHeight : y

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineWidth = size / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = outlineFor(color)
  ctx.fillStyle = color
  lines.forEach((line, i) => {
    const lineY = top + i * lineHeight
    // Outline first, then the fill on top: that way the line does not cover the letters.
    ctx.strokeText(line, x, lineY)
    ctx.fillText(line, x, lineY)
  })
}

export function drawMeme(canvas, image, { text, style }) {
  const { width, height } = canvasSize(image)
  // Setting the size wipes the canvas: every drawing starts on a clean sheet.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  const padding = width * 0.04
  // What both captions share. style.size is meant for a meme 800 pixels wide.
  const common = {
    x: width / 2,
    maxWidth: width * 0.92,
    fontSize: (style.size * width) / 800,
    font: style.font,
    color: style.color,
  }
  drawCaption(ctx, text.top, { ...common, y: padding, fromBottom: false })
  drawCaption(ctx, text.bottom, { ...common, y: height - padding, fromBottom: true })
}
```

The third parameter of `drawMeme` is now an object: `{ text, style }`. Four or five parameters in a fixed order are hard
to remember, while in an object every one has a name, and more are coming in the advanced level. `hex.slice(1, 3)` cuts
`'ff'` out of `'#ff8800'` (from position 1 up to position 3): that is the red part.

The settings get a card of their own. The font is a [[drop-down list]] (`<select>`): its value comes from `value`, like
in a text field, and its options are the keys of `FONTS`. [[Object.entries]] turns an object into key–value pairs, so we
get the key (`impact`) and the font's data at once. Create the file `src/components/StyleControls.jsx`:

```jsx file=src/components/StyleControls.jsx
import { FONTS } from '../drawMeme.js'

function StyleControls({ style, onChange }) {
  return (
    <fieldset className="panel">
      <legend>Lettering</legend>
      <label className="field">
        <span>Font</span>
        <select value={style.font} onChange={(event) => onChange('font', event.target.value)}>
          {Object.entries(FONTS).map(([key, font]) => (
            <option key={key} value={key}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Text size: {style.size}</span>
        <input
          type="range"
          min="24"
          max="110"
          value={style.size}
          onChange={(event) => onChange('size', Number(event.target.value))}
        />
      </label>
      <label className="field">
        <span>Colour</span>
        <input type="color" value={style.color} onChange={(event) => onChange('color', event.target.value)} />
      </label>
    </fieldset>
  )
}

export default StyleControls
```

You know the slider from lesson 3: it gives its value as text, so `Number()` turns it into a number. The colour picker
always gives a lower-case, seven-character colour code (`'#ffd23f'`), and expects the same in `value`.

The canvas gets `style` too, and passes what `drawMeme` needs in one object:

```jsx file=src/components/MemeCanvas.jsx mark=4,7,9-10
import { useEffect, useRef } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas({ image, text, style }) {
  const canvasRef = useRef(null)

  // After the first render, and whenever the picture, the text or the style changes: paint the canvas again.
  useEffect(() => {
    if (image) drawMeme(canvasRef.current, image, { text, style })
  }, [image, text, style])

  return (
    <canvas
      ref={canvasRef}
      className="meme__canvas"
      width="800"
      height="800"
      role="img"
      aria-label={`Meme. Top: ${text.top}. Bottom: ${text.bottom}.`}
    />
  )
}

export default MemeCanvas
```

Finally `App`: a new state, a new function that works just like `changeText`, and the two new props (wherever a comment
starts with `…`, everything stays as it was):

```jsx file=src/App.jsx mark=1,6,9-12,16,20
import StyleControls from './components/StyleControls.jsx'
// … the other imports and the two constants, as before

function App() {
  // … templates, picture, upload and text, as before
  const [style, setStyle] = useState({ font: 'impact', size: 60, color: '#ffffff' })
  // … useImage, templateStatus, memes, pictures, chooseFile and changeText, as before

  function changeStyle(key, value) {
    // A copy of style, with one of its keys set to the new value.
    setStyle({ ...style, [key]: value })
  }

  return (
    // … everything as before, down to the canvas
          <MemeCanvas image={image} text={text} style={style} />
    // … the two messages, as before
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
          <StyleControls style={style} onChange={changeStyle} />
        </div>
    // … the picker and the closing tags, as before
  )
}
```

:::check Check
The "Lettering" card appears under "Text". Choose Comic Sans: the captions change their font. Drag the slider to 110:
the letters grow, and the longer captions break onto more lines. Choose yellow in the colour picker: yellow letters,
black outline. Choose dark blue: the outline turns white.
:::

:::mistake Common mistake
You mark the chosen font with the `selected` attribute: `<option selected={key === style.font}>`. React warns in the
console to use `value` on the `<select>` instead. In React a drop-down list is a controlled input too: its value comes
from `<select value={…}>`, not from the single `<option>`s.
:::

:::try Task
Make the all-capitals switchable. Put a `caps: true` field into `style`, a checkbox into `StyleControls`
(`checked={style.caps}`, and `event.target.checked` in its `onChange`), and let `drawCaption` call `toUpperCase()` only
when `caps` is true. For that, `drawMeme` has to put `style.caps` into `common` too. (The code in the next steps shows
the version without this task; if you did it, keep `caps: true` in the starting `style`, `caps` among `drawCaption`'s
parameters together with the conditional `toUpperCase()`, and `caps` in `drawMeme`'s `common`.)
:::

### Downloading as a PNG

The meme is ready: let's download it. In lesson 5 you downloaded the QR code's PNG as a data URL, and its SVG from an
object URL made from a [[Blob]]. The canvas has a function of its own that makes a Blob directly:
`canvas.toBlob(function, 'image/png')`. Making the PNG of a big picture can take a moment, so `toBlob` does not return
the result right away; it expects a [[callback]] instead: a function it calls when it is done, passing it the finished
Blob. (Rarely, for example on a canvas 0 pixels wide, `null` comes instead of a Blob: then we download nothing.)

The download itself is the same trick as in lesson 5: an invisible `<a download>` link that we "click" from code. It
goes into two functions, because the advanced level needs the link once more. Create the file `src/download.js`:

```js file=src/download.js
// Downloads an address (a blob: or data: URL) under the given file name: we "click" an invisible link.
export function downloadUrl(url, fileName) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  // Some browsers start the download only from a link on the page, so we put it there for a moment.
  document.body.append(link)
  link.click()
  link.remove()
}

// Downloads what is on the canvas as a PNG file.
export function downloadCanvas(canvas, fileName) {
  // toBlob makes the PNG, then calls our function with the finished file (or with null if it failed).
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    downloadUrl(url, fileName)
    // The temporary address takes up memory: once the download has started, free it.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
```

The download button needs the canvas element, and so far that lived in `MemeCanvas`'s own ref, where `App` cannot see.
The solution is the same as with state: we [[lift it up|lifting state up]]. The ref is made in `App`, and goes down to
the canvas as a prop, which puts it on the `<canvas>`. The prop is called `canvasRef`: its name tells what is inside,
and it is not mixed up with the `<canvas>` element's own `ref` attribute. Here is the whole
`src/components/MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx mark=1,4,8
import { useEffect } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas({ canvasRef, image, text, style }) {
  // After the first render, and whenever the picture, the text or the style changes: paint the canvas again.
  useEffect(() => {
    if (image) drawMeme(canvasRef.current, image, { text, style })
  }, [canvasRef, image, text, style])

  return (
    <canvas
      ref={canvasRef}
      className="meme__canvas"
      width="800"
      height="800"
      role="img"
      aria-label={`Meme. Top: ${text.top}. Bottom: ${text.bottom}.`}
    />
  )
}

export default MemeCanvas
```

`canvasRef` goes into the dependency array too, because the effect gets it from outside. It causes no extra drawing:
the ref object is always the same, it never changes.

:::concept Why can't every canvas be downloaded? (tainted canvas)
The browser does not let a page read the pictures of **another** website unless that website allowed it. You may draw
a picture from another website on the canvas, but that makes the canvas [[tainted|tainted canvas]]: `toBlob` and `toDataURL` throw
an error from then on (`SecurityError`), and downloading does not work. The permission comes from [[CORS]]: the server
sending the picture says with a header that other pages may use it, and the code asks for that permission with
`image.crossOrigin = 'anonymous'` before loading.

There is no such problem in this lesson: the templates come from our own page (the pretend server), and an uploaded
picture comes from your own computer, through an object URL. Remember this when you use a real meme API on another
website one day.
:::

Here is the whole `src/App.jsx` as it looks at the end of the intermediate level:

```jsx file=src/App.jsx mark=1,4,17,56,71-80
import { useRef, useState } from 'react'
import useImage from './useImage.js'
import useFetch from './useFetch.js'
import { downloadCanvas } from './download.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import TextFields from './components/TextFields.jsx'
import StyleControls from './components/StyleControls.jsx'
import PicturePicker from './components/PicturePicker.jsx'
import './App.css'

// The lesson's meme API (src/mocks/handlers.js). With lang=en the template names come in English.
const MEMES_API = '/api/memes?lang=en'
// We start with this picture, before the list of templates arrives.
const START_PICTURE = { id: 'tired-mug', name: 'Tired Mug', url: '/api/memes/images/tired-mug.svg' }

function App() {
  const canvasRef = useRef(null)
  const templates = useFetch(MEMES_API)
  const [picture, setPicture] = useState(START_PICTURE)
  const [upload, setUpload] = useState(null) // the uploaded picture, if there is one
  const [text, setText] = useState({ top: 'When the code', bottom: 'works on the first try' })
  const [style, setStyle] = useState({ font: 'impact', size: 60, color: '#ffffff' })
  const { status, image } = useImage(picture.url)

  // The API wraps the list like this: { success: true, data: { memes: [...] } }.
  // A false success is an error too, even when the answer itself arrived fine.
  let templateStatus = templates.status
  if (templateStatus === 'success' && !templates.data.success) templateStatus = 'error'
  const memes = templateStatus === 'success' ? templates.data.data.memes : []
  // Your own picture, if there is one, comes before the templates.
  const pictures = upload ? [upload, ...memes] : memes

  function chooseFile(file) {
    // The previous upload's temporary address is not needed any more: free the memory.
    if (upload) URL.revokeObjectURL(upload.url)
    const newUpload = { id: 'upload', name: file.name, url: URL.createObjectURL(file) }
    setUpload(newUpload)
    setPicture(newUpload)
  }

  function changeText(key, value) {
    // A copy of text, with one of its keys set to the new value.
    setText({ ...text, [key]: value })
  }

  function changeStyle(key, value) {
    // A copy of style, with one of its keys set to the new value.
    setStyle({ ...style, [key]: value })
  }

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas canvasRef={canvasRef} image={image} text={text} style={style} />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              Loading the picture…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              This picture could not be loaded.
            </p>
          )}
        </div>
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
          <StyleControls style={style} onChange={changeStyle} />
          <div className="actions">
            <button
              type="button"
              className="button button--primary"
              disabled={status !== 'ready'}
              onClick={() => downloadCanvas(canvasRef.current, 'meme.png')}
            >
              Download as PNG
            </button>
          </div>
        </div>
      </div>
      <PicturePicker
        status={templateStatus}
        pictures={pictures}
        selected={picture.id}
        onSelect={setPicture}
        onRetry={templates.retry}
        onFile={chooseFile}
      />
    </main>
  )
}

export default App
```

The button is disabled (`disabled`) while the picture is not ready: while loading, the canvas still shows the old
picture, and we do not want to download that instead of the new one.

:::check Check
Click "Download as PNG": the browser downloads the file `meme.png`. Open it: there is the picture with the captions,
exactly as on the canvas, only in full size (800 × 800 pixels for the mug). Choose another template or your own
picture and download that too: the file always holds what is on the canvas right now. The intermediate level is done:
commit it!
:::

:::mistake Common mistake
`downloadCanvas(canvasRef, 'meme.png')`, without `.current`. `canvasRef` is only the box, not the canvas itself, and
the box has no `toBlob`: the console says "canvas.toBlob is not a function". The canvas is in the box's `current` slot.
:::

:::try Try it
Download a JPEG too: the third argument of `toBlob` is the quality between 0 and 1, like this:
`canvas.toBlob(…, 'image/jpeg', 0.9)`, with the file name `meme.jpg`. Compare the sizes of the two files: for a photo
the JPEG is much smaller, but around the sharp, flat-coloured shapes of the templates small smudges appear at the
edges.
:::

## Advanced level {level=3}

### Caption positions and their boxes

So far the captions have stuck to the top and the bottom of the picture. In the next two steps they become draggable
anywhere, with the mouse and with a finger. That takes three things:

1. The captions' positions become state in `App`.
2. The drawing tells where it drew the captions: every caption gets a "box" on the canvas.
3. The canvas watches the pointer: when you press it inside a box, the caption follows the pointer until you let go.

This step builds the first two; the pointer comes in the next one.

**The position.** Two numbers give a caption's position, not in pixels but as a **fraction** of the canvas: `x: 0.5`
is the middle of the canvas width, `y: 0.04` is 4% of its height. That way the position still makes sense when you
choose another picture of another size. For the top caption this is where its top edge is, for the bottom caption where its
bottom edge is, just like so far.

**The box.** Whether the pointer hit a caption is decided by [[hit testing]]: is the point inside the caption's box?
`drawCaption` knows the box anyway, since it worked out the lines. So it returns it: its centre (`cx`, `cy`), its width
(the longest line) and its height (the number of lines × the line height). And `drawMeme` returns all the boxes in an
array, each together with the caption's id (`'top'` or `'bottom'`) and its position.

Three things change in `src/drawMeme.js`: `drawCaption` returns its box, `drawMeme` gets the captions' positions too
and returns the boxes, and a new function goes to the end, `isInside`. The top of the file (`FONTS`, `canvasSize`,
`wrapLines`, `outlineFor`) does not change; replace everything from `drawCaption` to the end of the file with this
(wherever a comment starts with `…`, everything stays as it was):

```js file=src/drawMeme.js mark=4,18,20,35-37,40,49-58,61-68
// … the top of the file (FONTS, the two MAX_ constants, canvasSize, wrapLines, outlineFor), as before

// One caption in meme style: all capitals, with an outline, on several lines when needed.
// Returns its box: its centre, its width and its height.
function drawCaption(ctx, text, { x, y, maxWidth, fontSize, font, color, fromBottom }) {
  const caption = text.toUpperCase()
  let size = fontSize
  let lines = []
  // If a single word is too wide on its own, try again with smaller letters (at most eight times).
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px ${FONTS[font].family}`
    lines = wrapLines(ctx, caption, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size = size * 0.9
  }

  const lineHeight = size * 1.1
  const height = lines.length * lineHeight
  // The bottom caption grows upwards: start as many lines higher as it has.
  const top = fromBottom ? y - height : y

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineWidth = size / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = outlineFor(color)
  ctx.fillStyle = color
  lines.forEach((line, i) => {
    const lineY = top + i * lineHeight
    // Outline first, then the fill on top: that way the line does not cover the letters.
    ctx.strokeText(line, x, lineY)
    ctx.fillText(line, x, lineY)
  })

  // The box is as wide as the longest line. (The 0 is for an empty caption, which has no lines at all.)
  const width = Math.max(0, ...lines.map((line) => ctx.measureText(line).width))
  return { cx: x, cy: top + height / 2, width, height }
}

export function drawMeme(canvas, image, { text, style, positions }) {
  const { width, height } = canvasSize(image)
  // Setting the size wipes the canvas: every drawing starts on a clean sheet.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  // What both captions share. style.size is meant for a meme 800 pixels wide.
  const common = { maxWidth: width * 0.92, fontSize: (style.size * width) / 800, font: style.font, color: style.color }
  // The boxes tell the dragging where everything is on the canvas.
  const boxes = []
  for (const id of ['top', 'bottom']) {
    const { x, y } = positions[id]
    // The position is a fraction (between 0 and 1), drawing needs pixels: multiply by the canvas size.
    const box = drawCaption(ctx, text[id], { ...common, x: x * width, y: y * height, fromBottom: id === 'bottom' })
    boxes.push({ id, x, y, ...box })
  }
  return boxes
}

// Is the point inside the box? With 12 pixels to spare, so it is easy to grab.
export function isInside(point, box) {
  // An empty caption has no box: it cannot be grabbed.
  if (box.width === 0) return false
  const dx = Math.abs(point.x - box.cx)
  const dy = Math.abs(point.y - box.cy)
  return dx <= box.width / 2 + 12 && dy <= box.height / 2 + 12
}
```

- `Math.max(0, ...lines.map(…))` gives the largest of the line widths. The `...` here spreads an array into separate
  arguments, because `Math.max` does not want an array but numbers one after the other.
- `for (const id of ['top', 'bottom'])` draws both captions in one loop: `text[id]` and `positions[id]` take the field
  whose name is in the `id` variable, and `fromBottom` is true when the value of `id` is `'bottom'`.
- `{ id, x, y, ...box }` is a new object: the id, the position, and the box's four fields.
- `isInside` looks at the distance between the point and the box's centre, horizontally and vertically separately.
  `Math.abs` is the [[absolute value]]: it drops the minus sign, so it does not matter whether the point is left or
  right of the centre.

The canvas gets the captions' positions and passes them on to `drawMeme`. It keeps the boxes it gets back in a ref
(`boxesRef`), not in state: nothing on the screen depends on them directly, and nothing needs to be drawn again when
we set them. The drawing fills them in, and in the next step the pointer events read them. Here is the whole
`src/components/MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx mark=1,4-7,9,11-12
import { useEffect, useRef } from 'react'
import { drawMeme } from '../drawMeme.js'

function MemeCanvas({ canvasRef, image, text, style, positions }) {
  // After drawing, the captions' boxes are here.
  // They are not shown on the screen, so this is a ref, not state: changing it does not render the component again.
  const boxesRef = useRef([])

  // After the first render, and whenever something the meme shows changes: paint the canvas again.
  useEffect(() => {
    if (image) boxesRef.current = drawMeme(canvasRef.current, image, { text, style, positions })
  }, [canvasRef, image, text, style, positions])

  return (
    <canvas
      ref={canvasRef}
      className="meme__canvas"
      width="800"
      height="800"
      role="img"
      aria-label={`Meme. Top: ${text.top}. Bottom: ${text.bottom}.`}
    />
  )
}

export default MemeCanvas
```

In `App` the captions' positions become state, and the canvas gets them as a prop. `setPositions` gets its job in the
next step, for the dragging. These are the changes (wherever a comment starts with `…`, everything stays as it was):

```jsx file=src/App.jsx mark=3-8,12,22
// … the imports and the two constants, as before

// The captions' positions as fractions of the canvas width and height (0 = the left or top edge, 1 = the right or
// bottom edge). The top caption has its top edge, the bottom caption its bottom edge at height y.
const START_POSITIONS = {
  top: { x: 0.5, y: 0.04 },
  bottom: { x: 0.5, y: 0.96 },
}

function App() {
  // … canvasRef, templates, picture, upload, text and style, as before
  const [positions, setPositions] = useState(START_POSITIONS)
  // … useImage, templateStatus, memes, pictures, chooseFile, changeText and changeStyle, as before

  return (
    // … everything as before, down to the canvas
          <MemeCanvas
            canvasRef={canvasRef}
            image={image}
            text={text}
            style={style}
            positions={positions}
          />
    // … everything else, as before
  )
}
```

:::check Check
The canvas looks the same as before, only now the captions' positions come from the `positions` state. In
`START_POSITIONS`, change the top caption's `y` to `0.3`, save, and reload the page: the caption moves down, its top
edge is at 30% of the picture's height. (The reload is needed because the starting value of `useState` only counts on
the first render.) Choose a picture of another shape, for example the snail: the caption is at 30% of the height there
too. Then set it back to `0.04`.
:::

:::mistake Common mistake
You write the position in pixels: `top: { x: 0.5, y: 30 }`. The drawing multiplies this by the canvas height too, so
the caption's top edge would go 30 × 800, that is 24,000 pixels down, far below the canvas: the caption simply
disappears, without an error message. A position is always a fraction between 0 and 1.
:::

:::try Try it
Look inside the boxes. Add this to the effect, after the `drawMeme` line: `console.log(boxesRef.current)`, and open the
console (++F12++ → Console). In the last array printed you see two objects, the boxes of the `'top'` and the
`'bottom'` caption, with their centre (`cx`, `cy`), width and height. Type a longer top text: the top box's `height`
grows as the caption breaks onto more lines. Once you have seen it, delete the line.
:::

### Dragging with the pointer

Now for the third thing: the canvas watches the pointer, and the caption you grab follows it.

**The pointer.** With the piano of lesson 17, [[pointer events|pointer event]] told you when a piano key was pressed or
let go; now the movement is needed too. `pointerdown` comes on pressing, `pointermove` on every move, `pointerup` on
letting go, and `pointercancel` when the browser cuts the gesture short (for example because of a notification). The
pointer's position is in the event's `clientX` and `clientY`, from the top left corner of the window, in screen
pixels.

Two conversions are needed:

- **Hit testing needs canvas pixels.** On the screen the canvas is almost always smaller than its drawing board: even
  in a wide window it is at most about 600 pixels wide, and on a phone the 800-pixel drawing may be only 340.
  `getBoundingClientRect()` tells where the canvas is on the screen and how big it is there; from that,
  `toCanvasPoint` works out which pixel of the drawing board the pointer is on.
- **The position needs a fraction.** If the pointer moved right by 10% of the canvas's width on the screen, the caption
  moves by the same: the new `x` is the `x` at the start of the drag, plus the movement divided by the canvas's width on
  the screen.

If the pointer leaves the canvas while dragging, the `pointermove` events would go to the element next to it, and the
caption would get stuck. [[Pointer capture]] prevents that: after `setPointerCapture(pointerId)`, every event of this
pointer comes to this element until you let go.

What we are dragging right now is remembered by a second ref (`dragRef`), for the same reason the boxes are in a ref:
nothing on the screen depends on it directly, and nothing needs to be drawn again when we set it. Where everything is
on the canvas, the pointer events read from `boxesRef`, which the previous step fills in. Here is the whole
`src/components/MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx mark=2,4-7,9-11,13,20-28,30-38,40-49,51-53,58,63-66
import { useEffect, useRef } from 'react'
import { drawMeme, isInside } from '../drawMeme.js'

// A number squeezed between 0 and 1: that way nothing can be dragged completely off the canvas.
function clamp(value) {
  return Math.min(1, Math.max(0, value))
}

function MemeCanvas({ canvasRef, image, text, style, positions, onChange }) {
  // After drawing, the captions' boxes are here, and while dragging, what we drag.
  // Neither is shown on the screen, so they are refs, not state: changing them does not render the component again.
  const boxesRef = useRef([])
  const dragRef = useRef(null)

  // After the first render, and whenever something the meme shows changes: paint the canvas again.
  useEffect(() => {
    if (image) boxesRef.current = drawMeme(canvasRef.current, image, { text, style, positions })
  }, [canvasRef, image, text, style, positions])

  // The pointer's position in the canvas's own pixels (on the screen the canvas can be smaller than its drawing board).
  function toCanvasPoint(event) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function handlePointerDown(event) {
    const point = toCanvasPoint(event)
    // Search from the back: what was drawn later is on top.
    const box = boxesRef.current.findLast((item) => isInside(point, item))
    if (!box) return
    // From now on every move of this pointer comes to this canvas, even if it slips off it.
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: box.id, startX: event.clientX, startY: event.clientY, x: box.x, y: box.y }
  }

  function handlePointerMove(event) {
    const drag = dragRef.current
    if (!drag) return
    const rect = canvasRef.current.getBoundingClientRect()
    // The movement as a fraction of the canvas's width and height on the screen.
    onChange(drag.id, {
      x: clamp(drag.x + (event.clientX - drag.startX) / rect.width),
      y: clamp(drag.y + (event.clientY - drag.startY) / rect.height),
    })
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  return (
    <canvas
      ref={canvasRef}
      className="meme__canvas meme__canvas--draggable"
      width="800"
      height="800"
      role="img"
      aria-label={`Meme. Top: ${text.top}. Bottom: ${text.bottom}.`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  )
}

export default MemeCanvas
```

- `findLast` gives the first element, counting from the end of the array, for which the condition is true, like
  [[find]] does from the start. The boxes are in drawing order, so the one drawn last, the one on top, wins.
- At the start of a drag, `dragRef.current` remembers everything: what we drag, where the pointer was then, and where
  the caption was. On every move we work out the new position from these, not from the previous move: that way no
  rounding errors pile up.
- `event.currentTarget` is the canvas itself (the element the handler sits on).
- The `meme__canvas--draggable` class turns the mouse pointer into a hand, and with the `touch-action: none` rule it
  asks the browser not to scroll the page when a finger drags on the canvas.

In `App` a new function, `updateItem`, changes the captions' positions. The canvas calls it on every move of a drag,
up to sixty times a second. That is why `setPositions` gets an [[updater function]] here, like in lessons 6 and 7:
`current` is always the latest state, even if React has not rendered again between two moves. These are the changes
(wherever a comment starts with `…`, everything stays as it was):

```jsx file=src/App.jsx mark=6-10,20
// … the imports, the two constants and START_POSITIONS, as before

function App() {
  // … every state and function, as before

  // Changes a caption: the fields of changes (for example x and y) overwrite the old ones.
  function updateItem(id, changes) {
    // Updater function: while dragging, the calls come in quick succession, current is always the latest state.
    setPositions((current) => ({ ...current, [id]: { ...current[id], ...changes } }))
  }

  return (
    // … everything as before, down to the canvas
          <MemeCanvas
            canvasRef={canvasRef}
            image={image}
            text={text}
            style={style}
            positions={positions}
            onChange={updateItem}
          />
    // … everything else, as before
  )
}
```

:::check Check
Move the mouse over the canvas: the pointer turns into a hand. Grab the top caption and drag it down to the middle of
the picture: it follows the pointer and stays where you let go. Drag the bottom one somewhere too. On the empty parts,
dragging does nothing. Download the meme: the captions are in their new positions on the PNG as well. You can try
touch in the phone view of the developer tools (++F12++, then ++Ctrl++ + ++Shift++ + ++M++): there the mouse acts as a
finger, and dragging works the same way. On a real phone, try it on the lesson's Solution tab, because your own app's
pretend server only runs on the `localhost` address.
:::

:::mistake Common mistake
You use the pointer's position without converting it: `{ x: event.offsetX, y: event.offsetY }`. That would only work
if the canvas were 800 pixels wide on the screen too, but it is almost always smaller than its drawing board: even in
a wide window it is at most about 600 pixels, and narrower still on a phone. So the hit slips: the caption can only be
grabbed below and to the right of it. Screen pixels always have to be converted into drawing-board pixels.
:::

:::try Task
Put a "Reset positions" button next to the "Download as PNG" button: `setPositions(START_POSITIONS)`. On a click, both
captions jump back to where they started. (The complete `src/App.jsx` at the end of the lesson shows the code without
this button; if you did it, keep your button next to "Download as PNG".)
:::

### Rotation

A caption at an angle is often funnier. Rotation needs two things: knowing which item we rotate (the **selected**
item), and a slider that turns it up to 180 degrees left and right.

The canvas does not rotate the single letters but its whole [[coordinate system]], the invisible grid on which it
measures x and y. `ctx.translate(x, y)` moves the grid's origin, the (0, 0) point, to the given place; `ctx.rotate(angle)`
turns the grid around the origin. Everything drawn after that is shifted and rotated on the canvas. The caption should
turn around its own centre, so we move the origin to its centre, rotate there, and draw the lines relative to (0, 0).

The rotation would stay in effect for later drawing too, and the second caption would land on the turned grid. That is
why a [[save and restore]] pair wraps it: `ctx.save()` puts away every setting of the drawing context (the move, the
rotation, the colours, the font), and `ctx.restore()` sets them back exactly.

`rotate` does not measure the angle in degrees but in [[radians|radian]]: a full turn is 2π radians, so 360 degrees
equal 2 × 3.14… radians. The user thinks in degrees, and for drawing we convert: `degrees × π / 180`.

Hit testing changes too. A rotated box is no longer a straight rectangle. The trick: we turn the point back around the
box's centre, by the same angle in the opposite direction. The point we get is in the same place relative to the
straight box as the original one is relative to the tilted box, so testing the straight box is enough. The rotation
formula is two lines of [[trigonometric functions|trigonometric function]] (`Math.cos`, `Math.sin`); you do not need to
know it by heart, you only have to write it correctly once.

In `src/drawMeme.js`, `drawCaption` draws rotated and puts the angle into its box, `drawMeme` passes the angle on,
`isInside` turns the point back, and there is a new little function, `toRadians`. Replace everything after
`outlineFor` to the end of the file with this (wherever a comment starts with `…`, everything stays as it was):

```js file=src/drawMeme.js mark=3-6,8-9,25,29-32,40-43,45-46,48,56,62,70,74-80
// … the top of the file (FONTS, the two MAX_ constants, canvasSize, wrapLines, outlineFor), as before

// Degrees to radians: the canvas measures rotation in radians (a full turn is 2π).
function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

// One caption in meme style, rotated by angle degrees around its own centre. Returns its box.
function drawCaption(ctx, text, { x, y, angle, maxWidth, fontSize, font, color, fromBottom }) {
  const caption = text.toUpperCase()
  let size = fontSize
  let lines = []
  // If a single word is too wide on its own, try again with smaller letters (at most eight times).
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px ${FONTS[font].family}`
    lines = wrapLines(ctx, caption, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size = size * 0.9
  }

  const lineHeight = size * 1.1
  const height = lines.length * lineHeight
  // The bottom caption grows upwards: start as many lines higher as it has.
  const top = fromBottom ? y - height : y
  const center = top + height / 2
  // The box is as wide as the longest line. (The 0 is for an empty caption, which has no lines at all.)
  const width = Math.max(0, ...lines.map((line) => ctx.measureText(line).width))

  ctx.save()
  // Move the origin to the caption's centre and rotate there: that way the caption turns around its own centre.
  ctx.translate(x, center)
  ctx.rotate(toRadians(angle))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineWidth = size / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = outlineFor(color)
  ctx.fillStyle = color
  lines.forEach((line, i) => {
    // The lines are placed relative to the caption's centre now: the top line starts half the height higher.
    const lineY = -height / 2 + i * lineHeight
    ctx.strokeText(line, 0, lineY)
    ctx.fillText(line, 0, lineY)
  })
  // Every setting (the move and the rotation too) goes back to where it was before save().
  ctx.restore()

  return { cx: x, cy: center, width, height, angle }
}

export function drawMeme(canvas, image, { text, style, positions }) {
  // … sizing the canvas, the picture and common, as before
  // The boxes tell the dragging where everything is on the canvas.
  const boxes = []
  for (const id of ['top', 'bottom']) {
    const { x, y, angle } = positions[id]
    // The position is a fraction (between 0 and 1), drawing needs pixels: multiply by the canvas size.
    const box = drawCaption(ctx, text[id], {
      ...common,
      x: x * width,
      y: y * height,
      angle,
      fromBottom: id === 'bottom',
    })
    boxes.push({ id, x, y, ...box })
  }
  return boxes
}

// Is the point inside the (possibly rotated) box? With 12 pixels to spare, so it is easy to grab.
export function isInside(point, box) {
  // An empty caption has no box: it cannot be grabbed.
  if (box.width === 0) return false
  // Turn the point back around the box's centre: then testing a straight rectangle is enough.
  const dx = point.x - box.cx
  const dy = point.y - box.cy
  const turn = toRadians(-box.angle)
  const localX = dx * Math.cos(turn) - dy * Math.sin(turn)
  const localY = dx * Math.sin(turn) + dy * Math.cos(turn)
  return Math.abs(localX) <= box.width / 2 + 12 && Math.abs(localY) <= box.height / 2 + 12
}
```

The start of `drawMeme`, in place of the `// … sizing the canvas` comment, is word for word the same as before:
`canvasSize`, the two `canvas.` lines, `ctx`, `drawImage` and `common`.

A new card shows the selection and the slider. At the top there is a button for every item (for now the two
captions), the selected one with `aria-pressed="true"`, and the slider under them. Create the file
`src/components/ItemControls.jsx`:

```jsx file=src/components/ItemControls.jsx
function ItemControls({ items, selectedId, angle, onSelect, onRotate }) {
  return (
    <fieldset className="panel">
      <legend>Selected item</legend>
      <div className="chips">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={item.id === selectedId}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="field">
        <span>Rotation: {angle}°</span>
        <input
          type="range"
          min="-180"
          max="180"
          value={angle}
          onChange={(event) => onRotate(Number(event.target.value))}
        />
      </label>
    </fieldset>
  )
}

export default ItemControls
```

When you grab a caption on the canvas, it should be selected too. `MemeCanvas` gets a new prop, `onSelect`, and
`handlePointerDown` calls it at the start of the drag. Two places change in `MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx mark=1,12
function MemeCanvas({ canvasRef, image, text, style, positions, onSelect, onChange }) {
  // … the two refs, the effect and toCanvasPoint, as before

  function handlePointerDown(event) {
    const point = toCanvasPoint(event)
    // Search from the back: what was drawn later is on top.
    const box = boxesRef.current.findLast((item) => isInside(point, item))
    if (!box) return
    // From now on every move of this pointer comes to this canvas, even if it slips off it.
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: box.id, startX: event.clientX, startY: event.clientY, x: box.x, y: box.y }
    onSelect(box.id)
  }

  // … handlePointerMove, handlePointerUp and the return, as before
}
```

In `App` the captions' positions get their angle too (`angle: 0`), a new state remembers which item is selected, and
`CAPTIONS` holds the labels of the card's buttons. The slider shows the selected item's angle, and rotates with the
same `updateItem` that the dragging moves with; only now the `changes` object holds `angle`, not `x` and `y`:

```jsx file=src/App.jsx mark=1,6-7,9-13,17,24,29-35
import ItemControls from './components/ItemControls.jsx'
// … the other imports and the two old constants, as before

// … the comment above START_POSITIONS, as before
const START_POSITIONS = {
  top: { x: 0.5, y: 0.04, angle: 0 },
  bottom: { x: 0.5, y: 0.96, angle: 0 },
}
// The items that can be selected, on the card's buttons.
const CAPTIONS = [
  { id: 'top', label: 'Top text' },
  { id: 'bottom', label: 'Bottom text' },
]

function App() {
  // … every state, as before
  const [selectedId, setSelectedId] = useState('top')
  // … every function, as before

  return (
    // … everything as before, down to the canvas
          <MemeCanvas
            // … the other props, as before
            onSelect={setSelectedId}
            onChange={updateItem}
          />
    // … the two messages and the start of the controls, as before
          <StyleControls style={style} onChange={changeStyle} />
          <ItemControls
            items={CAPTIONS}
            selectedId={selectedId}
            angle={positions[selectedId].angle}
            onSelect={setSelectedId}
            onRotate={(angle) => updateItem(selectedId, { angle })}
          />
    // … the download button and everything else, as before
  )
}
```

:::check Check
The "Selected item" card appears, with "Top text" highlighted. Drag the top caption down a little, then the slider to 20
degrees: the caption turns clockwise around its own centre, its right end goes down and its left end up. (If you leave
it at the very top of the picture, its left end sticks out of the canvas: that is not a bug, just drag it lower.) Click
the bottom caption on the canvas: on the card "Bottom text" gets highlighted, and the slider jumps to 0, because its
angle is still 0. Rotate this one too, then grab the tilted top caption by any of its letters and drag it: it can be
grabbed anywhere inside the tilted box.
:::

:::mistake Common mistake
`ctx.restore()` is missing. The first caption still looks right, but the second one is drawn on the first one's moved
and turned grid: it lands in the wrong place, rotated twice, or slides off the canvas entirely. Every `save()` needs
its `restore()`.
:::

:::try Try it
Write the rotation without `toRadians`: `ctx.rotate(angle)`. One step of the slider is now a whole radian, almost 60
degrees: the caption spins round and round at the smallest move. That is why the conversion is needed. Then set it
back.
:::

### Stickers

What else does a meme need? Emoji stickers! A sticker can be dragged and rotated just like a caption, it is only a
single emoji. The list of stickers lives in `App`'s state: each has an id, an emoji, a position (its centre, as a
fraction of the canvas) and an angle.

First the picker: a row of buttons, an emoji on each. On a click the sticker lands in the middle of the canvas. Create
the file `src/components/StickerBar.jsx`:

```jsx file=src/components/StickerBar.jsx
const STICKERS = ['😂', '😎', '🔥', '💯', '👀', '🎉', '❤️', '🤔']

function StickerBar({ onAdd }) {
  return (
    <fieldset className="panel">
      <legend>Stickers</legend>
      <div className="stickers">
        {STICKERS.map((emoji) => (
          <button key={emoji} type="button" className="sticker" onClick={() => onAdd(emoji)}>
            {emoji}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default StickerBar
```

The canvas draws an emoji as text too, with `fillText`: just like in the middle of the QR code in lesson 5. This time
the font family lists the system's emoji fonts (Segoe UI Emoji on Windows, Apple Color Emoji on Apple computers, Noto
Color Emoji on Android and Linux): they are colourful, and they come with the operating system, so nothing has to be
downloaded. A sticker turns around its own centre too, and returns its box as well. Here is the whole `src/drawMeme.js` as it looks at the end of the lesson:

```js file=src/drawMeme.js mark=11-12,103-115,117,141-150
// Everything that paints on the canvas. No React in here, only the canvas's own drawing tools.

// The fonts to choose from. All are system fonts: they can be drawn at once, nothing has to be downloaded.
export const FONTS = {
  impact: { label: 'Impact', family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  arial: { label: 'Arial Black', family: "'Arial Black', 'Arial Bold', Arial, sans-serif" },
  comic: { label: 'Comic Sans', family: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" },
  georgia: { label: 'Georgia', family: "Georgia, 'Times New Roman', serif" },
}

// The stickers' emojis, in the system's colourful emoji fonts (Windows, Apple, Android and Linux).
const EMOJI_FONT = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif"

// The meme is at most this big (in pixels). The picture keeps its proportions.
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

// How big should the canvas be so the whole picture fits on it without being distorted?
function canvasSize(image) {
  const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight)
  return {
    width: Math.round(image.naturalWidth * scale),
    height: Math.round(image.naturalHeight * scale),
  }
}

// Splits the text into lines word by word, so that no line is wider than maxWidth.
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ').filter((word) => word !== '')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line === '' ? word : `${line} ${word}`
    if (line !== '' && ctx.measureText(candidate).width > maxWidth) {
      // The word does not fit any more: the line is done, and the word starts the next one.
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line !== '') lines.push(line)
  return lines
}

// Light letters get a black outline, dark ones a white outline: readable on any picture.
function outlineFor(hex) {
  const red = parseInt(hex.slice(1, 3), 16)
  const green = parseInt(hex.slice(3, 5), 16)
  const blue = parseInt(hex.slice(5, 7), 16)
  const brightness = 0.299 * red + 0.587 * green + 0.114 * blue
  return brightness > 140 ? '#000000' : '#ffffff'
}

// Degrees to radians: the canvas measures rotation in radians (a full turn is 2π).
function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

// One caption in meme style, rotated by angle degrees around its own centre. Returns its box.
function drawCaption(ctx, text, { x, y, angle, maxWidth, fontSize, font, color, fromBottom }) {
  const caption = text.toUpperCase()
  let size = fontSize
  let lines = []
  // If a single word is too wide on its own, try again with smaller letters (at most eight times).
  for (let i = 0; i < 8; i++) {
    ctx.font = `${size}px ${FONTS[font].family}`
    lines = wrapLines(ctx, caption, maxWidth)
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break
    size = size * 0.9
  }

  const lineHeight = size * 1.1
  const height = lines.length * lineHeight
  // The bottom caption grows upwards: start as many lines higher as it has.
  const top = fromBottom ? y - height : y
  const center = top + height / 2
  // The box is as wide as the longest line. (The 0 is for an empty caption, which has no lines at all.)
  const width = Math.max(0, ...lines.map((line) => ctx.measureText(line).width))

  ctx.save()
  // Move the origin to the caption's centre and rotate there: that way the caption turns around its own centre.
  ctx.translate(x, center)
  ctx.rotate(toRadians(angle))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.lineWidth = size / 8
  ctx.lineJoin = 'round'
  ctx.strokeStyle = outlineFor(color)
  ctx.fillStyle = color
  lines.forEach((line, i) => {
    // The lines are placed relative to the caption's centre now: the top line starts half the height higher.
    const lineY = -height / 2 + i * lineHeight
    ctx.strokeText(line, 0, lineY)
    ctx.fillText(line, 0, lineY)
  })
  // Every setting (the move and the rotation too) goes back to where it was before save().
  ctx.restore()

  return { cx: x, cy: center, width, height, angle }
}

// One sticker: an emoji with its centre at (x, y), rotated by angle degrees. Returns its box.
function drawSticker(ctx, emoji, { x, y, angle, size }) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(toRadians(angle))
  ctx.font = `${size}px ${EMOJI_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 0, 0)
  ctx.restore()

  return { cx: x, cy: y, width: size, height: size, angle }
}

export function drawMeme(canvas, image, { text, style, positions, stickers }) {
  const { width, height } = canvasSize(image)
  // Setting the size wipes the canvas: every drawing starts on a clean sheet.
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, width, height)

  // What both captions share. style.size is meant for a meme 800 pixels wide.
  const common = { maxWidth: width * 0.92, fontSize: (style.size * width) / 800, font: style.font, color: style.color }
  // The boxes tell the dragging where everything is on the canvas.
  const boxes = []
  for (const id of ['top', 'bottom']) {
    const { x, y, angle } = positions[id]
    // The position is a fraction (between 0 and 1), drawing needs pixels: multiply by the canvas size.
    const box = drawCaption(ctx, text[id], {
      ...common,
      x: x * width,
      y: y * height,
      angle,
      fromBottom: id === 'bottom',
    })
    boxes.push({ id, x, y, ...box })
  }
  // The stickers go on top of the captions, each 18% of the canvas width.
  for (const sticker of stickers) {
    const box = drawSticker(ctx, sticker.emoji, {
      x: sticker.x * width,
      y: sticker.y * height,
      angle: sticker.angle,
      size: width * 0.18,
    })
    boxes.push({ id: sticker.id, x: sticker.x, y: sticker.y, ...box })
  }
  return boxes
}

// Is the point inside the (possibly rotated) box? With 12 pixels to spare, so it is easy to grab.
export function isInside(point, box) {
  // An empty caption has no box: it cannot be grabbed.
  if (box.width === 0) return false
  // Turn the point back around the box's centre: then testing a straight rectangle is enough.
  const dx = point.x - box.cx
  const dy = point.y - box.cy
  const turn = toRadians(-box.angle)
  const localX = dx * Math.cos(turn) - dy * Math.sin(turn)
  const localY = dx * Math.sin(turn) + dy * Math.cos(turn)
  return Math.abs(localX) <= box.width / 2 + 12 && Math.abs(localY) <= box.height / 2 + 12
}
```

The stickers are drawn **after** the captions, so they land on top, and their boxes go to the end of the list too. The
`findLast` in `handlePointerDown` searches from the back, so you grab a sticker dragged over a caption, not the letters
under it. For a sticker the position is its centre (`textBaseline = 'middle'`), not its top or bottom as for the captions.

The canvas gets the stickers too, and passes them to `drawMeme`. Two places change in `MemeCanvas.jsx`:

```jsx file=src/components/MemeCanvas.jsx mark=1,9-10
function MemeCanvas({ canvasRef, image, text, style, positions, stickers, onSelect, onChange }) {
  // After drawing, the captions' boxes are here, and while dragging, what we drag.
  // Neither is shown on the screen, so they are refs, not state: changing them does not render the component again.
  const boxesRef = useRef([])
  const dragRef = useRef(null)

  // After the first render, and whenever something the meme shows changes: paint the canvas again.
  useEffect(() => {
    if (image) boxesRef.current = drawMeme(canvasRef.current, image, { text, style, positions, stickers })
  }, [canvasRef, image, text, style, positions, stickers])

  // … toCanvasPoint, the three handlers and the return, as before
}
```

Finally `App`. A new state for the stickers, a counter for their ids, and three changes:

- From now on `updateItem` changes the stickers too. The captions are told apart from the stickers by their names
  (`'top'`, `'bottom'`); among the stickers, `map` replaces the one whose id matches with a changed copy.
- The selected item can be a caption or a sticker. `positions[selectedId]` is `undefined` for a sticker's id; then
  [[nullish coalescing]] (`??`) goes on searching among the stickers.
- The stickers show up among the card's buttons too, and when a sticker is selected, a "Delete sticker" button as well.

`ItemControls` gets two new props (`canDelete` and `onDelete`). Here is the whole
`src/components/ItemControls.jsx`:

```jsx file=src/components/ItemControls.jsx mark=1,28-34
function ItemControls({ items, selectedId, angle, canDelete, onSelect, onRotate, onDelete }) {
  return (
    <fieldset className="panel">
      <legend>Selected item</legend>
      <div className="chips">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={item.id === selectedId}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="field">
        <span>Rotation: {angle}°</span>
        <input
          type="range"
          min="-180"
          max="180"
          value={angle}
          onChange={(event) => onRotate(Number(event.target.value))}
        />
      </label>
      {canDelete && (
        <div className="actions">
          <button type="button" className="button" onClick={onDelete}>
            Delete sticker
          </button>
        </div>
      )}
    </fieldset>
  )
}

export default ItemControls
```

And the changes in `App` (wherever a comment starts with `…`, everything stays as it was):

```jsx file=src/App.jsx mark=1,4-5,9,12,14-18,21-30,32-35,42,48,50-51,54,56
import StickerBar from './components/StickerBar.jsx'
// … the other imports and the constants, as before

// Every sticker gets a new id: sticker-1, sticker-2, …
let nextStickerId = 1

function App() {
  // … every state, as before
  const [stickers, setStickers] = useState([])
  // … every function up to updateItem, as before

  // Changes a caption or a sticker: the fields of changes (x, y or angle) overwrite the old ones.
  function updateItem(id, changes) {
    if (id === 'top' || id === 'bottom') {
      setPositions((current) => ({ ...current, [id]: { ...current[id], ...changes } }))
    } else {
      setStickers((current) => current.map((sticker) => (sticker.id === id ? { ...sticker, ...changes } : sticker)))
    }
  }

  function addSticker(emoji) {
    const sticker = { id: `sticker-${nextStickerId++}`, emoji, x: 0.5, y: 0.5, angle: 0 }
    setStickers([...stickers, sticker])
    setSelectedId(sticker.id)
  }

  function deleteSticker(id) {
    setStickers(stickers.filter((sticker) => sticker.id !== id))
    setSelectedId('top')
  }

  // The selected item: a caption, or if it is not one, a sticker.
  const selected = positions[selectedId] ?? stickers.find((sticker) => sticker.id === selectedId)
  // The card's buttons: the two captions, then the stickers with their emojis.
  const items = [...CAPTIONS, ...stickers.map((sticker) => ({ id: sticker.id, label: sticker.emoji }))]

  return (
    // … everything as before, down to the canvas
          <MemeCanvas
            // … the other props, as before
            positions={positions}
            stickers={stickers}
            onSelect={setSelectedId}
            onChange={updateItem}
          />
    // … the two messages and the start of the controls, as before
          <ItemControls
            items={items}
            selectedId={selectedId}
            angle={selected.angle}
            canDelete={selectedId.startsWith('sticker-')}
            onSelect={setSelectedId}
            onRotate={(angle) => updateItem(selectedId, { angle })}
            onDelete={() => deleteSticker(selectedId)}
          />
          <StickerBar onAdd={addSticker} />
    // … the download button and everything else, as before
  )
}
```

`nextStickerId` is **outside** the component, like the counter of the uploaded pictures in lesson 12: there is only one
of it, it survives between renders, and it is not state, because nothing on the screen depends on it.
`nextStickerId++` hands over its current value first, then increases it by one. After a delete the top caption gets
selected, because the deleted sticker no longer exists.

:::check Check
The "Stickers" card appears with eight emojis. Click 😎: the emoji with sunglasses lands in the middle of the canvas, and
it shows up on the "Selected item" card too, highlighted. Drag it onto the mug's face and rotate it by 30 degrees. Add a
🔥 too, and drag it over the top caption: the sticker is on top, and that is what you grab, not the letters. Select the
😎 and click "Delete sticker": it disappears. The downloaded PNG has the stickers on it too.
:::

:::mistake Common mistake
`setStickers(stickers.push(sticker))`. `push` changes the old array, and it does not return the array but its new
length: the `stickers` state becomes a number, and on the next render the page crashes with "stickers.find is not a
function". State is never changed in place: `[...stickers, sticker]` is a new array.
:::

:::try Task
Make the selected sticker's size adjustable. Give every sticker a `size: 0.18` field, let `drawMeme` draw it with
`width * sticker.size` instead of `width * 0.18`, and let `ItemControls` show a second slider for a sticker (for
example `min="0.08"`, `max="0.4"` and `step="0.01"`) that works through `updateItem(selectedId, { size })`. (The
complete `src/App.jsx` of the "Saving to a gallery" step shows the version without this task; if you did it, keep
`size: 0.18` in `addSticker` and the size-slider props on `<ItemControls>`.)
:::

### Saving to a gallery

Only one thing is missing: the finished memes should be kept and shared. This step does the keeping. The "Save to
gallery" button puts what is on the canvas into [[localStorage]], so it is still there after a reload; in the gallery
every meme gets a "Delete" button. Sharing comes in the next, last step.

The `useLocalStorage` hook you know from lesson 9 works just like `useState`, only it also saves the value after every
change, and reads it back from `localStorage` when the page starts. Create the file `src/useLocalStorage.js` (if you have it
from lesson 9, you can copy it over):

```js file=src/useLocalStorage.js
import { useEffect, useState } from 'react'

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
      // The storage is full or blocked: the value still works, it only lives until the page is closed.
    }
  }, [key, value])

  // Returns the same as useState: the value and the setter.
  return [value, setValue]
}

export default useLocalStorage
```

`localStorage` stores only text, about 5 MB per site. To store a picture as text, we use a [[data URL]]:
`canvas.toDataURL('image/jpeg', 0.85)` turns what is on the canvas into a long text starting with
`data:image/jpeg;base64,…`, like the card pictures in lesson 6. We save a JPEG at 85% quality: that way an 800-pixel
meme is about 50–150 kB, while a PNG can be several times as much. To be sure it fits, we keep at most 12 memes, the
newest ones.

The gallery is a card at the bottom of the page, with the saved memes in a grid. While it is empty, a short line says
what it is for. Create the file `src/components/Gallery.jsx`:

```jsx file=src/components/Gallery.jsx
function Gallery({ memes, onDelete }) {
  return (
    <section className="panel">
      <h2>Gallery</h2>
      {memes.length === 0 && (
        <p className="notice">No saved memes yet. The "Save to gallery" button puts what is on the canvas here.</p>
      )}
      <ul className="gallery">
        {memes.map((meme) => (
          <li key={meme.id} className="gallery__item">
            <img src={meme.src} alt="Saved meme" />
            <div className="gallery__actions">
              <button type="button" className="button" onClick={() => onDelete(meme.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Gallery
```

A saved meme is an `<img>` whose `src` is the data URL itself: the browser shows it just like a picture downloaded
from an address.

Here is the whole `src/App.jsx` as it looks at the end of the lesson. The gallery comes from `useLocalStorage`, saving
and deleting are two new functions, the save button goes next to the download button, and `Gallery` to the bottom of
the page:

```jsx file=src/App.jsx mark=4,12,44-45,94-98,100-102,157-159,171
import { useRef, useState } from 'react'
import useImage from './useImage.js'
import useFetch from './useFetch.js'
import useLocalStorage from './useLocalStorage.js'
import { downloadCanvas } from './download.js'
import MemeCanvas from './components/MemeCanvas.jsx'
import TextFields from './components/TextFields.jsx'
import StyleControls from './components/StyleControls.jsx'
import ItemControls from './components/ItemControls.jsx'
import StickerBar from './components/StickerBar.jsx'
import PicturePicker from './components/PicturePicker.jsx'
import Gallery from './components/Gallery.jsx'
import './App.css'

// The lesson's meme API (src/mocks/handlers.js). With lang=en the template names come in English.
const MEMES_API = '/api/memes?lang=en'
// We start with this picture, before the list of templates arrives.
const START_PICTURE = { id: 'tired-mug', name: 'Tired Mug', url: '/api/memes/images/tired-mug.svg' }
// The captions' positions as fractions of the canvas width and height (0 = the left or top edge, 1 = the right or
// bottom edge). The top caption has its top edge, the bottom caption its bottom edge at height y.
const START_POSITIONS = {
  top: { x: 0.5, y: 0.04, angle: 0 },
  bottom: { x: 0.5, y: 0.96, angle: 0 },
}
// The items that can be selected, on the card's buttons.
const CAPTIONS = [
  { id: 'top', label: 'Top text' },
  { id: 'bottom', label: 'Bottom text' },
]

// Every sticker gets a new id: sticker-1, sticker-2, …
let nextStickerId = 1

function App() {
  const canvasRef = useRef(null)
  const templates = useFetch(MEMES_API)
  const [picture, setPicture] = useState(START_PICTURE)
  const [upload, setUpload] = useState(null) // the uploaded picture, if there is one
  const [text, setText] = useState({ top: 'When the code', bottom: 'works on the first try' })
  const [style, setStyle] = useState({ font: 'impact', size: 60, color: '#ffffff' })
  const [positions, setPositions] = useState(START_POSITIONS)
  const [selectedId, setSelectedId] = useState('top')
  const [stickers, setStickers] = useState([])
  // The saved memes: [{ id, src }], newest first. They stay in localStorage too.
  const [gallery, setGallery] = useLocalStorage('meme-generator:gallery', [])
  const { status, image } = useImage(picture.url)

  // The API wraps the list like this: { success: true, data: { memes: [...] } }.
  // A false success is an error too, even when the answer itself arrived fine.
  let templateStatus = templates.status
  if (templateStatus === 'success' && !templates.data.success) templateStatus = 'error'
  const memes = templateStatus === 'success' ? templates.data.data.memes : []
  // Your own picture, if there is one, comes before the templates.
  const pictures = upload ? [upload, ...memes] : memes

  function chooseFile(file) {
    // The previous upload's temporary address is not needed any more: free the memory.
    if (upload) URL.revokeObjectURL(upload.url)
    const newUpload = { id: 'upload', name: file.name, url: URL.createObjectURL(file) }
    setUpload(newUpload)
    setPicture(newUpload)
  }

  function changeText(key, value) {
    // A copy of text, with one of its keys set to the new value.
    setText({ ...text, [key]: value })
  }

  function changeStyle(key, value) {
    // A copy of style, with one of its keys set to the new value.
    setStyle({ ...style, [key]: value })
  }

  // Changes a caption or a sticker: the fields of changes (x, y or angle) overwrite the old ones.
  function updateItem(id, changes) {
    if (id === 'top' || id === 'bottom') {
      setPositions((current) => ({ ...current, [id]: { ...current[id], ...changes } }))
    } else {
      setStickers((current) => current.map((sticker) => (sticker.id === id ? { ...sticker, ...changes } : sticker)))
    }
  }

  function addSticker(emoji) {
    const sticker = { id: `sticker-${nextStickerId++}`, emoji, x: 0.5, y: 0.5, angle: 0 }
    setStickers([...stickers, sticker])
    setSelectedId(sticker.id)
  }

  function deleteSticker(id) {
    setStickers(stickers.filter((sticker) => sticker.id !== id))
    setSelectedId('top')
  }

  function saveToGallery() {
    const src = canvasRef.current.toDataURL('image/jpeg', 0.85)
    // The newest goes first; we keep at most 12 memes, so they fit into localStorage.
    setGallery([{ id: Date.now(), src }, ...gallery].slice(0, 12))
  }

  function deleteFromGallery(id) {
    setGallery(gallery.filter((meme) => meme.id !== id))
  }

  // The selected item: a caption, or if it is not one, a sticker.
  const selected = positions[selectedId] ?? stickers.find((sticker) => sticker.id === selectedId)
  // The card's buttons: the two captions, then the stickers with their emojis.
  const items = [...CAPTIONS, ...stickers.map((sticker) => ({ id: sticker.id, label: sticker.emoji }))]

  return (
    <main className="meme">
      <h1 className="meme__title">Meme Generator</h1>
      <div className="meme__workspace">
        <div className="meme__stage">
          <MemeCanvas
            canvasRef={canvasRef}
            image={image}
            text={text}
            style={style}
            positions={positions}
            stickers={stickers}
            onSelect={setSelectedId}
            onChange={updateItem}
          />
          {status === 'loading' && (
            <p className="meme__status" role="status">
              Loading the picture…
            </p>
          )}
          {status === 'error' && (
            <p className="meme__status meme__status--error" role="alert">
              This picture could not be loaded.
            </p>
          )}
        </div>
        <div className="meme__controls">
          <TextFields text={text} onChange={changeText} />
          <StyleControls style={style} onChange={changeStyle} />
          <ItemControls
            items={items}
            selectedId={selectedId}
            angle={selected.angle}
            canDelete={selectedId.startsWith('sticker-')}
            onSelect={setSelectedId}
            onRotate={(angle) => updateItem(selectedId, { angle })}
            onDelete={() => deleteSticker(selectedId)}
          />
          <StickerBar onAdd={addSticker} />
          <div className="actions">
            <button
              type="button"
              className="button button--primary"
              disabled={status !== 'ready'}
              onClick={() => downloadCanvas(canvasRef.current, 'meme.png')}
            >
              Download as PNG
            </button>
            <button type="button" className="button" disabled={status !== 'ready'} onClick={saveToGallery}>
              Save to gallery
            </button>
          </div>
        </div>
      </div>
      <PicturePicker
        status={templateStatus}
        pictures={pictures}
        selected={picture.id}
        onSelect={setPicture}
        onRetry={templates.retry}
        onFile={chooseFile}
      />
      <Gallery memes={gallery} onDelete={deleteFromGallery} />
    </main>
  )
}

export default App
```

`Date.now()` is a [[timestamp]]: how many milliseconds have passed since the start of 1970. It is different for every
click, so it makes a good id. `slice(0, 12)` gives the first 12 elements of the array; the rest fall out.

:::check Check
The "Gallery" card appears at the bottom of the page, for now with the line "No saved memes yet". Click "Save to
gallery": the meme appears on the card. Change the text and save again: the new one goes first. Reload the page: the
gallery is still there. "Delete" takes the meme out of the gallery.
:::

:::mistake Common mistake
You save a PNG into the gallery (`canvas.toDataURL()`, without a type). A template meme still fits as a PNG, but after
a few uploaded photos the 5 MB is full: `setItem` throws an error, the hook quietly swallows it, and after a reload the
gallery comes back as it was at the last successful save, without the new memes. Big data needs a JPEG, and a limit on
how many items we keep.
:::

:::try Task
Show under every meme when you saved it. The id is the moment itself, so
`new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(meme.id)` turns it into text (you
used `Intl.DateTimeFormat` in lesson 11). (The next step's complete `Gallery.jsx` shows the code without this task; if
you did it, keep the date under the picture.)
:::

### Sharing

The last step: the memes in the gallery can be sent on too. Sharing is the browser's [[Web Share API]]:
`navigator.share({ files: [file] })` opens the system's own share window, on a phone for example the one from which you
can send the picture on in a message, a chat or a social app. Not every browser can share files (some desktop browsers
cannot share at all), so first `navigator.canShare({ files: [file] })` asks whether it would work. Where it would not,
we download the picture with the `downloadUrl` written in the intermediate level. `navigator.canShare?.(…)` calls the
function with [[optional chaining]]: if the browser has no `canShare`, the call simply gives `undefined` and throws no
error.

Sharing needs a file, but the gallery holds data URLs. [[fetch]] can "download" `data:` addresses too: from the text we
get the picture's bytes back in a Blob, and `new File([blob], name, { type })` makes a file from it. If the user closes
the share window, `share` rejects its promise with an error called `AbortError`: that is not a real error, there is
nothing left to do then. Create the file `src/share.js`:

```js file=src/share.js
import { downloadUrl } from './download.js'

// Turns a data URL into a file. fetch "downloads" data: addresses too: from the text we get the picture's bytes back.
async function toFile(dataUrl, fileName) {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  return new File([blob], fileName, { type: blob.type })
}

// Shares with the system's own share window. Where that is not available, we download the picture.
export async function shareImage(dataUrl) {
  const file = await toFile(dataUrl, 'meme.jpg')
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (error) {
      // AbortError: the user closed the window. That is not an error, there is nothing more to do.
      if (error.name === 'AbortError') return
    }
  }
  downloadUrl(dataUrl, 'meme.jpg')
}
```

If `share` stops with any other error (for example because the system could not take the file after all), the
`catch` branch does not return, and the code goes on to the download: the meme is not lost even then.

In the gallery every meme gets a "Share" button, before "Delete". Here is the whole `src/components/Gallery.jsx`:

```jsx file=src/components/Gallery.jsx mark=1,15-17
import { shareImage } from '../share.js'

function Gallery({ memes, onDelete }) {
  return (
    <section className="panel">
      <h2>Gallery</h2>
      {memes.length === 0 && (
        <p className="notice">No saved memes yet. The "Save to gallery" button puts what is on the canvas here.</p>
      )}
      <ul className="gallery">
        {memes.map((meme) => (
          <li key={meme.id} className="gallery__item">
            <img src={meme.src} alt="Saved meme" />
            <div className="gallery__actions">
              <button type="button" className="button" onClick={() => shareImage(meme.src)}>
                Share
              </button>
              <button type="button" className="button" onClick={() => onDelete(meme.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Gallery
```

`App` does not change: the gallery's memes are already there, and `Gallery` takes care of sharing by itself.

:::check Check
Every saved meme has a "Share" button next to it. Click it: in Chrome and Edge on Windows, and in Safari on a Mac the
system's share window opens; where there is none (in Firefox, for example), the browser downloads the file `meme.jpg`.
(On a phone, try it on the lesson's Solution tab.) Congratulations, your meme maker is done!
:::

:::mistake Common mistake
You share without asking `canShare`: `shareImage` is only `const file = await toFile(dataUrl, 'meme.jpg')`, then
straight away `await navigator.share({ files: [file] })`. Where the browser has no `share` (for example Firefox on a
desktop computer), the call throws an error, the console says "navigator.share is not a function", and clicking the
button does nothing, not even a download. Always ask `canShare` first, and have a fallback.
:::

:::try Try it
Give the share a title too: `navigator.share({ files: [file], title: 'My meme' })`. Where the title shows up depends on
the system and the app you choose: in some places at the top of the share window, in others, for example, as the
subject of an e-mail.
:::
