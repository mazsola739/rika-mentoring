# What we build

A switch that turns a page from day to night. The page is called Stargazer: a short article about watching the stars
from your balcony. It is exactly the kind of page you read outside in the dark, where a bright white screen dazzles
you. The three levels of the lesson build on each other, and at the end of the first one the switch already works.

:::levels
- A switch that changes the colours of the whole page between light and dark. | about 2 hours
- The page remembers your choice and can follow your computer's light or dark setting. | about 2 hours
- One theme system for the whole app with Context, a third theme, no flash on load, an animated change. | about 3 hours
:::

**Before you start you need:** lesson 1, "Me, Myself & React". We build on what you learned there: components, props,
JSX, CSS files, and React's two basic hooks, `useState` and `useEffect`. Where we use something in a new way, we
explain it again.

## Beginner level {level=1}

### Before you start

Download the lesson's **starter** (above: "Download starter"), unzip it, and open the `stargazer` folder in your
editor. Then, in the terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a light, warm page: the name
"Stargazer" in blue at the top, and under it a white card with the article "Stargazing from your balcony", a pale
purple tip box and a short list. There is no switch yet: that is your job.
:::

This time the starter is not empty: the page is ready, only the dark mode is missing. Look around in `src`. Everything
here is familiar from lesson 1:

- `src/App.jsx` puts the page together from two components.
- `src/components/Header.jsx` is the top bar. The comment in it marks where the switch will go.
- `src/components/Article.jsx` is the article itself.
- `src/index.css` holds all the styles. Every colour is written out by hand, for example `#3346a8` for the blue.

:::concept The starter is a git repository
As in lesson 1, the folder already has a first commit. `git restore .` throws away every change since your last commit
(new files stay: delete those by hand). When a step works, commit it: `git add .`, then
`git commit -m "CSS variables"`.
:::

### Colours in one place: CSS variables

For a dark page every colour has to change: the background, the text, the card, the lines, the blue. Right now they are
scattered all over `index.css`, and some appear several times: the blue three times. Changing them one by one, and
keeping a second copy for the night, would be a nightmare.

[[CSS variables|CSS variable]] (their official name is custom properties) solve this. You give a colour a name once,
and everywhere else you use the name:

- `--accent: #3346a8;` defines a variable. Its name always starts with two dashes.
- `color: var(--accent);` uses it: `var()` puts the variable's value in its place.

`:root` means the `<html>` element, the root of the page. A variable defined there is visible everywhere, because
every element inside inherits it. Replace `src/index.css` with this: the colours move to the top, and the rules below
only use their names.

```css file=src/index.css mark=1-10,20,21,38,43,50,52,63,72,79,81
/* Every colour of the page, in one place. */
:root {
  --bg: #f4f1ea;
  --surface: #ffffff;
  --text: #1f2433;
  --muted: #666b7a;
  --accent: #3346a8;
  --accent-soft: #ebe8f7;
  --line: #ddd6c8;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
}

.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.logo {
  margin: 0;
  color: var(--accent);
  font-size: 22px;
  font-weight: 800;
}

.article {
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
}

.article h1 {
  margin: 4px 0;
  font-size: 32px;
  line-height: 1.2;
}

.article__kicker {
  margin: 0;
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.article__meta {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
}

.tip {
  margin: 20px 0;
  padding: 12px 16px;
  border-left: 4px solid var(--accent);
  border-radius: 8px;
  background: var(--accent-soft);
}
```

:::check Check
The page looks exactly as before. That is the point: the colours have not changed, they just live in one place now.
:::

:::try Try it
Open the developer tools (++F12++), click the `<html>` line in the Elements panel, and in the Styles pane change the
value of `--accent` to `crimson`. The name at the top, the small heading above the title and the tip's left line all
change at once.
:::

:::mistake Common mistake
`var(accent)` or `var(-accent)` does nothing: the name needs both dashes, `var(--accent)`. The browser does not
complain, it just skips the line. If a colour refuses to change, check the dashes first.
:::

### A night palette

Now give the same names their night values. They apply when the `<html>` element has a `data-theme="dark"`
attribute. Put them in `src/index.css`, right under the `:root` block:

```css file=src/index.css
/* The same names with night colours. They apply when <html> has data-theme="dark". */
:root[data-theme='dark'] {
  color-scheme: dark;
  --bg: #0f1326;
  --surface: #181e38;
  --text: #e9e6f5;
  --muted: #a3a8c3;
  --accent: #f2c45a;
  --accent-soft: #262b4a;
  --line: #2c3458;
}
```

`data-theme` is a [[data attribute]]: you can give any HTML element an attribute whose name starts with `data-`, to
keep your own information on it. `:root[data-theme='dark']` selects the `<html>` element only while it has this
attribute with this value. Then these values override the light ones, and nothing else in the CSS has to change: every
rule asks for `var(--bg)`, and gets whichever value is valid at that moment.

`color-scheme: dark` tells the browser to draw its own parts dark too, for example the scrollbars and form fields.

:::check Check
Type this in the Console (++F12++ → Console) and press ++Enter++:

```js
document.documentElement.dataset.theme = 'dark'
```

If you paste it instead of typing it, Chrome may first ask you to type `allow pasting` and press ++Enter++. That is
only a safety check: then paste again.

The page turns night blue, with light text and golden highlights. `document.documentElement` is the `<html>` element,
and `dataset.theme` is its `data-theme` attribute. The Elements panel now shows `<html lang="en" data-theme="dark">`.
Run it again with `'light'` to switch back. This one line is all the switch will have to do.
:::

:::mistake Common mistake
`:root [data-theme='dark']`, with a space, means something else: "an element with this attribute **inside** `<html>`".
Our attribute is on `<html>` itself, so there must be no space between `:root` and `[`.
:::

### The switch: state and an effect

Now a button that does what the Console line did. Two hooks from lesson 1 work together here:

- [[useState]] is the component's memory. It remembers which theme is on, `'light'` or `'dark'`, and when it changes,
  React draws the component again.
- [[useEffect]] is for work outside drawing. In lesson 1 it listened to a browser event; here it writes the theme onto
  `<html>`.

Why do we need an effect for this? React only draws inside `<div id="root">`. The `<html>` element is outside that box,
so you cannot write `data-theme` on it in JSX: you have to set it yourself, after React has drawn. That is exactly
the kind of job an effect is for. Change `src/App.jsx` to this (the marked lines are new):

```jsx file=src/App.jsx mark=1,6,8-11,13-15,19-21
import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

function App() {
  const [theme, setTheme] = useState('light')

  // <html> is outside React's box, so an effect writes the theme onto it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="page">
      <button type="button" onClick={toggleTheme}>
        {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      </button>
      <Header />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

- `onClick={toggleTheme}`: when the button is clicked, React calls `toggleTheme`. We hand over the function itself,
  without brackets.
- `theme === 'dark' ? 'light' : 'dark'` is a short "if", the [[conditional operator]]: if the theme is dark (`===`
  checks whether the two values are equal), the new one is light, otherwise dark.
- The `[theme]` at the end of the effect is its [[dependency array]]: React runs the effect after the first drawing,
  and again every time `theme` changes. In lesson 1 this was an empty `[]`, which means: only once, at the start.

:::check Check
A plain "Switch to dark" button appears above the header. It switches the page between light and dark, and its text
always says what the next click will do. In the Elements panel you can watch `data-theme` change on `<html>`.
:::

:::mistake Common mistake
`onClick={toggleTheme()}`, with brackets, calls the function straight away, while React is drawing, not on a click. It
changes the state, so React draws again, which calls it again… React stops with a "Too many re-renders" error. Without
brackets you only hand the function over, to be called later.
:::

### A real switch component

The button works, but it looks like a plain button, and it is above the header. Let's make a small switch with a
sliding knob, and put it in the header, where the starter's comment marks its place. It gets its own component, in a
new file, `src/components/ThemeToggle.jsx`:

```jsx file=src/components/ThemeToggle.jsx
import './ThemeToggle.css'

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button type="button" className="toggle" role="switch" aria-checked={isDark} onClick={onToggle}>
      <span className="toggle__track">
        <span className="toggle__knob" />
      </span>
      Dark mode
    </button>
  )
}

export default ThemeToggle
```

The switch gets two [[props]]: the theme to show, and `onToggle`, a function to call on a click. A prop can be a
function too: this is how a child component tells its parent (the component that draws it) that something happened.
The switch does not change the theme itself. It only reports the click, and `App`, which owns the state, decides what
happens.

`role="switch"` and `aria-checked` are [[ARIA]] attributes: they tell screen readers that this button is an on/off
switch, and whether it is on. A screen reader announces it as "Dark mode, switch, on".

Its styles go into `src/components/ThemeToggle.css`, the file the component imports in its first line:

```css file=src/components/ThemeToggle.css
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 6px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  cursor: pointer;
}

.toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.toggle__track {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: var(--line);
}

.toggle__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  transition: transform 0.2s ease;
}

/* When the switch is on, the knob slides to the right. */
.toggle[aria-checked='true'] .toggle__knob {
  transform: translateX(20px);
}
```

The CSS reads `aria-checked` too: the same attribute that informs the screen reader moves the knob. And since the
switch only uses variables, it changes colour with the page. There are a few new CSS tricks in it too:

- The track is `position: relative` and the knob is `position: absolute`: this way the knob's place is given relative
  to the track, and `top: 3px` and `left: 3px` count from the track's top left corner.
- `border-radius: 999px` turns a box of any size into a "pill" with round ends, and `50%` turns the 18 × 18 px square
  into a circle.
- `transform: translateX(20px)` moves the knob 20 pixels to the right, which leaves 3 px on the right of the 44 px wide
  track too. Thanks to the `transition`, the knob slides there instead of jumping.
- `:focus-visible` applies when you reached the button with the keyboard (++Tab++): then a clear outline shows where
  you are. A mouse click does not show it.

`Header` gets the two props and hands them on to the switch:

```jsx file=src/components/Header.jsx mark=1,3,7
import ThemeToggle from './ThemeToggle.jsx'

function Header({ theme, onToggle }) {
  return (
    <header className="site-header">
      <p className="logo">Stargazer</p>
      <ThemeToggle theme={theme} onToggle={onToggle} />
    </header>
  )
}

export default Header
```

In `App`, remove the temporary button, and give the theme and the function to `Header`:

```jsx file=src/App.jsx mark=19
import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

function App() {
  const [theme, setTheme] = useState('light')

  // <html> is outside React's box, so an effect writes the theme onto it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="page">
      <Header theme={theme} onToggle={toggleTheme} />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

:::check Check
The switch is at the right end of the header, and in dark mode its knob slides to the right. It works from the
keyboard too: press ++Tab++ (several times if needed) until an outline appears around the switch, then press
++Space++. The beginner level is done: commit it!
:::

:::concept Header only passes it on
`Header` does nothing with `theme` and `onToggle`: it just hands them down to `ThemeToggle`. With a single component in
between that is fine, but in a bigger app the same props would travel through many components. Keep it in mind: we
solve it at the advanced level.
:::

## Intermediate level {level=2}

### Remember the choice

Switch to dark and reload the page (++F5++): it is light again. State only lives as long as the page is open. To
remember the choice between visits, we save it in the browser's [[localStorage]]: a small store that every website
gets. It keeps pieces of text under names (keys), and they stay there even after the browser is closed.

- `localStorage.setItem('stargazer-theme', 'dark')` saves a piece of text,
- `localStorage.getItem('stargazer-theme')` reads it back (or gives `null` if there is nothing).

Change `src/App.jsx` like this:

```jsx file=src/App.jsx mark=5-16,19,26-33
import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

const STORAGE_KEY = 'stargazer-theme'

// Reads the saved theme. With nothing saved, or with storage switched off, we start light.
function readSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage can be switched off in the browser: then we simply do not remember.
  }
  return 'light'
}

function App() {
  const [theme, setTheme] = useState(readSavedTheme)

  // <html> is outside React's box, so an effect writes the theme onto it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Save every change, so the choice is still there after a reload.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Not a problem if it cannot be saved.
    }
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="page">
      <Header theme={theme} onToggle={toggleTheme} />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

Three new things:

- `useState(readSavedTheme)`: we give `useState` the function itself, not its result. React calls it only once, at the
  very first drawing, to get the starting value. This is called a [[lazy initial state]]. You have seen it in lesson 1:
  `useHashRoute` started with `useState(currentPath)`.
- The second effect saves every change. Its dependency is `[theme]` too, so it runs whenever the theme changes.
- `try { … } catch { … }`: the browser may refuse access to storage (in some private windows, or when site data is
  blocked), and then `localStorage` throws an error. `try` runs the code, and if an error happens on the way, the
  `catch` part runs, so the page does not break. In our case we then simply do not remember.

:::check Check
Switch to dark and reload: it stays dark. In the developer tools, Application → Local storage →
`http://localhost:5173` shows the `stargazer-theme` key and its value.
:::

:::mistake Common mistake
A typo between the saving and the reading (`stargazer-theme` here, `stargazer_theme` there) gives no error: the page
just never remembers. That is why the key is in one constant, `STORAGE_KEY`, and both places use the constant.
:::

### Your own hook: useDarkMode

`App` is getting crowded. It reads the storage, saves, writes `<html>`… while its real job is to put the page
together. Let's move everything about the theme into a [[custom hook]]. You wrote one in lesson 1, `useHashRoute`: a
function whose name starts with `use`, which can call other hooks, and which returns what a component needs.

Create `src/useDarkMode.js`, and move the constant, `readSavedTheme`, the `useState` line and the two effects there
from `App.jsx`:

```js file=src/useDarkMode.js
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'stargazer-theme'

// Reads the saved theme. With nothing saved, or with storage switched off, we start light.
function readSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage can be switched off in the browser: then we simply do not remember.
  }
  return 'light'
}

// Our own hook: the theme, remembered between visits and written onto <html>.
function useDarkMode() {
  const [theme, setTheme] = useState(readSavedTheme)

  // <html> is outside React's box, so an effect writes the theme onto it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Save every change, so the choice is still there after a reload.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Not a problem if it cannot be saved.
    }
  }, [theme])

  return { theme, setTheme }
}

export default useDarkMode
```

`App` becomes short again:

```jsx file=src/App.jsx mark=1,6
import useDarkMode from './useDarkMode.js'
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

function App() {
  const { theme, setTheme } = useDarkMode()

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="page">
      <Header theme={theme} onToggle={toggleTheme} />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

The hook returns an object: `return { theme, setTheme }` is short for `{ theme: theme, setTheme: setTheme }`, an object
whose two fields are named after the two variables. In `App`, `const { theme, setTheme } = …` takes the two fields out
into two variables again. This is [[destructuring]], the same thing you did with props in lesson 1:
`function Hero({ name, role })`.

:::check Check
Everything works as before: the switch switches, and the choice survives a reload. Only the code has moved.
:::

:::mistake Common mistake
If you forget the `export default useDarkMode` line, the page stops updating, and after a reload it stays blank. The
error only shows in the Console (++F12++ → Console): `does not provide an export named 'default'`. `App` can only
import what the other file exports.
:::

### Follow the system setting

Most computers and phones have a light or dark setting, and the browser tells every page which one is on. In CSS this
is the `prefers-color-scheme` [[media query]]. In JavaScript, [[matchMedia]] asks the same question:

```js
const media = window.matchMedia('(prefers-color-scheme: dark)')
media.matches // true if the computer is set to dark right now
```

`media` also tells you when the answer changes: it fires a `change` event, which you can listen to, just like you
listened to `hashchange` in lesson 1.

From now on the page has three **modes**: `'light'`, `'dark'` and `'system'`. The mode is what you chose, and what we
save. The **theme** is the colour set the page shows: in system mode it comes from the computer. When nothing is saved
yet, the mode is `'system'`, so a first-time visitor gets what their computer is set to. Change `src/useDarkMode.js`
like this:

```js file=src/useDarkMode.js mark=4,5,7,8,11,15,18,20,21,23-31,33-35,42,45,49,51
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'stargazer-theme'
const MODES = ['light', 'dark', 'system']
const DARK_QUERY = '(prefers-color-scheme: dark)'

// Reads the saved mode. With nothing saved, or with storage switched off, we follow the system.
function readSavedMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (MODES.includes(saved)) return saved
  } catch {
    // Storage can be switched off in the browser: then we simply do not remember.
  }
  return 'system'
}

// Our own hook: the chosen mode, the system setting, and the theme that follows from them.
function useDarkMode() {
  const [mode, setMode] = useState(readSavedMode)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches)

  // Listen to the system setting, and stop listening when the component goes away.
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    function onChange(event) {
      setSystemDark(event.matches)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // Not a state: the theme is worked out from the two states above, at every drawing.
  const systemTheme = systemDark ? 'dark' : 'light'
  const theme = mode === 'system' ? systemTheme : mode

  // <html> is outside React's box, so an effect writes the theme onto it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Save every change of the mode, so the choice is still there after a reload.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // Not a problem if it cannot be saved.
    }
  }, [mode])

  return { mode, setMode, theme }
}

export default useDarkMode
```

- `systemDark` is a second state: is the computer dark right now? Its starting value is worked out by a small
  [[arrow function]], `() => window.matchMedia(DARK_QUERY).matches`: a [[lazy initial state]] again, like
  `readSavedMode`, only written in place instead of as a named function. The first effect updates it on every `change`
  event; the event's `matches` field is the new answer. The function the effect returns is its [[cleanup]]: when the
  component goes away, we stop listening.
- `theme` is not a state, only a value worked out from the two states at every drawing. As a third state you would
  have to keep it in step with the other two by hand. Rule of thumb: what you can calculate, you don't store.
- We save `mode`, not `theme`: if you chose "system", the page should still follow the system tomorrow.
- `MODES.includes(saved)` checks that the saved text is one of the three modes. Anything else, for example an old,
  mistyped value, is ignored.

The hook now gives `setMode` instead of `setTheme`, so two lines of `App` change. Only that part of `src/App.jsx` is
shown; the imports above it and the `return` below stay as they are:

```jsx file=src/App.jsx mark=2,5
function App() {
  const { theme, setMode } = useDarkMode()

  function toggleTheme() {
    setMode(theme === 'dark' ? 'light' : 'dark')
  }
```

:::check Check
The switch only knows light and dark for now, so delete the saved choice by hand: type
`localStorage.removeItem('stargazer-theme')` in the Console, then reload. Now open the Rendering panel of the
developer tools: click into the developer tools, press ++Ctrl++ + ++Shift++ + ++P++, type "rendering", and press
++Enter++. Set "Emulate CSS media feature prefers-color-scheme" to `prefers-color-scheme: dark`, then to
`prefers-color-scheme: light`. The page follows it at once, without a reload.
:::

:::mistake Common mistake
Without the cleanup (`return () => media.removeEventListener(…)`) the listener stays alive after its component has
gone. In development React's [[StrictMode]] (the `<StrictMode>` wrapper around `<App />` in `src/main.jsx`)
deliberately runs every effect, its cleanup and the effect again, to bring such forgotten cleanups to light.
:::

### Light, dark or system

A two-state switch cannot say "follow the system". So we replace it with three buttons, and the chosen one lights up.
Create `src/components/ThemeSwitch.jsx`:

```jsx file=src/components/ThemeSwitch.jsx
import './ThemeSwitch.css'

const OPTIONS = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'system', label: 'System' },
]

function ThemeSwitch({ mode, onChange }) {
  return (
    <div className="theme-switch" role="group" aria-label="Theme">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          onClick={() => onChange(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitch
```

- `OPTIONS` is an array, and `map` makes a button from each item, like the skills list in lesson 1.
- `role="group"` and `aria-label="Theme"` tell screen readers that the three buttons belong together, under the name
  "Theme". `aria-pressed` tells them which button is pressed in; the CSS uses it for the colouring too.
- `onClick={() => onChange(option.mode)}`: this time we have to pass the function something, the button's mode. So we
  wrap the call in a small [[arrow function]]: the arrow function runs on the click, and calls `onChange` with the
  right mode.

Its styles go into `src/components/ThemeSwitch.css`:

```css file=src/components/ThemeSwitch.css
.theme-switch {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
}

.theme-switch button {
  padding: 6px 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

/* The chosen one is filled with the accent colour. */
.theme-switch button[aria-pressed='true'] {
  background: var(--accent);
  color: var(--surface);
}

.theme-switch button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

`Header` now hands on the mode and a function that changes it:

```jsx file=src/components/Header.jsx mark=1,3,7
import ThemeSwitch from './ThemeSwitch.jsx'

function Header({ mode, onModeChange }) {
  return (
    <header className="site-header">
      <p className="logo">Stargazer</p>
      <ThemeSwitch mode={mode} onChange={onModeChange} />
    </header>
  )
}

export default Header
```

`App` does not need `toggleTheme` any more: `setMode` itself goes down to the switch.

```jsx file=src/App.jsx mark=6,10
import useDarkMode from './useDarkMode.js'
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

function App() {
  const { mode, setMode } = useDarkMode()

  return (
    <div className="page">
      <Header mode={mode} onModeChange={setMode} />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

`ThemeToggle.jsx` and `ThemeToggle.css` are not used any more: you can delete them.

:::check Check
Three buttons in the header, the chosen one filled with the accent colour. "System" follows the computer (test it with
the Rendering panel again), while "Light" and "Dark" stay put, whatever the computer says. Reload: your choice stays.
The intermediate level is done: commit it!
:::

:::mistake Common mistake
`onClick={onChange(option.mode)}`, without the arrow, is the brackets mistake again: it calls `onChange` while
drawing, for all three buttons. Then the page gets stuck in "System" mode, the buttons do not react to clicks, and the
Console shows a red error that starts with "Cannot update a component … while rendering a different component …".
When you need to pass an argument to a function, wrap it: `onClick={() => onChange(option.mode)}`.
:::

## Advanced level {level=3}

### One theme for the whole app: Context

Look at the path the theme takes now: `App` calls the hook and gives `mode` and `setMode` to `Header`, which passes
them on to `ThemeSwitch`. `Header` does nothing with them, it is only a messenger. This is called
[[prop drilling]]: props travel down through components that do not need them. In a real app with dozens of
components, half of them would carry the theme.

React's [[Context]] solves this. Components are drawn inside each other (`App` draws `Header`, `Header` draws
`ThemeSwitch`); this structure is called the [[component tree]]. Think of Context as a radio station: a [[Provider]] at
the top of the tree broadcasts a value, and any component below it can tune in with [[useContext]], however deep it
is, without props.

Create `src/ThemeContext.jsx`:

```jsx file=src/ThemeContext.jsx
import { createContext, useContext } from 'react'
import useDarkMode from './useDarkMode.js'

const ThemeContext = createContext(null)

// Calls the hook once, and shares its result with every component inside.
export function ThemeProvider({ children }) {
  const value = useDarkMode()
  return <ThemeContext value={value}>{children}</ThemeContext>
}

// Any component inside ThemeProvider reads the theme with this hook.
export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
```

- `createContext(null)` creates the context. `null` is what a component gets if there is no Provider above it.
- `<ThemeContext value={value}>` is the Provider: it broadcasts `value`, the object the hook returns.
- [[children]] is a special prop: whatever you put between `<ThemeProvider>` and `</ThemeProvider>`. The Provider
  draws it, wrapped in the context.
- `useTheme` is a small hook, so that the other components need not know about `ThemeContext` at all. It also gives a
  clear error if someone uses it outside the Provider: then `value` is `null`, `!value` ("no value") is true, and
  `throw new Error(…)` stops the program, with our own message in the Console.
- The file exports two functions by name (no `default`), so you import them in curly braces:
  `import { useTheme } from '…'`, the way you imported `PROJECTS` in lesson 1.
- The file ends in `.jsx` because it contains JSX (`<ThemeContext …>`); `useDarkMode.js` has none, so `.js` is enough.

:::concept In older code
Before React 19 the Provider was written as `<ThemeContext.Provider value={value}>`. It still works, and you will meet
it in many projects; in this course we use the shorter form.
:::

:::concept A note in the terminal
From now on, when you change `useDarkMode.js` or `ThemeContext.jsx`, the terminal may print
`Could not Fast Refresh ("useTheme" export is incompatible)`, followed by `page reload`. Nothing is wrong: Vite can only
update a file in place when it exports components alone. `ThemeContext.jsx` also exports a hook, `useTheme`, so Vite
reloads the whole page instead.
:::

Wrap the whole app in the Provider, in `src/main.jsx`:

```jsx file=src/main.jsx mark=5,10,12
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'

// React draws the App component into the <div id="root"> of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

Now `ThemeSwitch` tunes in by itself, and nobody has to pass it anything:

```jsx file=src/components/ThemeSwitch.jsx mark=1,10,11,19
import { useTheme } from '../ThemeContext.jsx'
import './ThemeSwitch.css'

const OPTIONS = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'system', label: 'System' },
]

function ThemeSwitch() {
  const { mode, setMode } = useTheme()
  return (
    <div className="theme-switch" role="group" aria-label="Theme">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          onClick={() => setMode(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitch
```

`Header` and `App` lose their theme props:

```jsx file=src/components/Header.jsx mark=3,7
import ThemeSwitch from './ThemeSwitch.jsx'

function Header() {
  return (
    <header className="site-header">
      <p className="logo">Stargazer</p>
      <ThemeSwitch />
    </header>
  )
}

export default Header
```

```jsx file=src/App.jsx mark=7
import Header from './components/Header.jsx'
import Article from './components/Article.jsx'

function App() {
  return (
    <div className="page">
      <Header />
      <main>
        <Article />
      </main>
    </div>
  )
}

export default App
```

`App` is back to how it was in the starter: it does not need to know anything about themes.

:::check Check
The page works exactly as at the end of the intermediate level, but `Header` and `App` have no theme props any more.
:::

:::try Task
Let the article react to the theme too. In `src/components/Article.jsx`, import the hook
(`import { useTheme } from '../ThemeContext.jsx'`), read the theme with `const { theme } = useTheme()`, and when it is
not `'light'`, add "· ready for the night" to the end of the grey line under the title. The `{error && …}` trick from
lesson 1's form works here too, and `!==` means "is not equal". One more component tuned in, and no new props
anywhere.
:::

:::mistake Common mistake
If you see this error in the Console: "useTheme must be used inside `<ThemeProvider>`", it is our own message from
`useTheme`. It means a component called the hook outside the Provider, for example because `main.jsx` still draws
`<App />` without the Provider.
:::

### A third theme: red light

Astronomers read their star maps by red light, because red light hardly disturbs eyes that have got used to the dark.
Let's give Stargazer a red night-vision theme. Thanks to the CSS variables and our hook, it takes three small
changes.

The colours go into `src/index.css`, under the dark block:

```css file=src/index.css
/* Red light keeps your eyes used to the dark: astronomers read their maps like this. */
:root[data-theme='red'] {
  color-scheme: dark;
  --bg: #120404;
  --surface: #1c0707;
  --text: #ff6b5e;
  --muted: #d65a4e;
  --accent: #ff3b2f;
  --accent-soft: #2a0b09;
  --line: #3a1210;
}
```

The new mode goes into the hook's list of allowed modes. Only the top of `src/useDarkMode.js` is shown: change the
`MODES` line, the rest of the file stays:

```js file=src/useDarkMode.js mark=4
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'stargazer-theme'
const MODES = ['light', 'dark', 'red', 'system']
```

And it gets a button in the switch. Only the `OPTIONS` array of `src/components/ThemeSwitch.jsx` is shown: add the new
line, the rest of the file stays:

```jsx file=src/components/ThemeSwitch.jsx mark=4
const OPTIONS = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'red', label: 'Red' },
  { mode: 'system', label: 'System' },
]
```

Nothing else changes. The hook already works out `theme` from `mode`, so in red mode the theme is `'red'`, the effect
writes `data-theme="red"` onto `<html>`, and the CSS block above takes over.

:::check Check
Four buttons. "Red" turns the whole page deep red, the switch included, and it stays red after a reload.
:::

:::mistake Common mistake
If you leave `'red'` out of `MODES`, the button still works, but after a reload the page is back in system mode:
`readSavedMode` throws away every saved value it does not know.
:::

:::try Task
Design a theme of your own, for example a soft "sepia" for reading in daylight. All it takes is one CSS block, one item
in `MODES` and one in `OPTIONS`.
:::

### No flash on load

Choose "Dark", and reload the page a few times. Sometimes the page flashes light for a moment before it turns dark. Why?
The browser draws the HTML and the CSS first, and only then downloads and runs React. Until our effect runs, `<html>`
has no `data-theme`, so the light colours show. On a fast computer it is a blink; on a slow phone, in the dark, it is a
white flash in your face.

The cure is a few lines of plain JavaScript in `index.html` (in the project's root folder, not in `src`), which set
`data-theme` before the browser draws anything. An [[inline script]] in `<head>` (a `<script>` with the code inside,
without `src` and without `type="module"`) runs immediately, while the browser is still reading the page. Put it
inside `<head>`, under the `<title>` line:

```html file=index.html mark=9-20
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- No icon yet: an empty one keeps the browser from asking for /favicon.ico (a 404 in the console). -->
    <link rel="icon" href="data:," />
    <title>Dark Mode · Rika Mentoring</title>
    <script>
      // Runs before the page is drawn, so the very first picture has the right theme.
      try {
        let theme = localStorage.getItem('stargazer-theme') || 'system'
        if (theme === 'system') {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        document.documentElement.dataset.theme = theme
      } catch {
        // No storage: React sets the theme a moment later.
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

This is the logic of `useDarkMode` in short: the saved mode, and in system mode the computer's setting. `let` is new:
it creates a variable that can get a new value later (a `const` cannot). `|| 'system'` is the same as `|| '/'` in
lesson 1's `useHashRoute`: if nothing is saved (`null`), `'system'` is used instead. When React starts, the hook
arrives at the same theme, so nothing visible changes.

:::check Check
Look at the difference in the finished build: the development server loads the CSS from JavaScript too, so there a
blank white page can flash for a moment even with the script. Stop the development server (++Ctrl++ + ++C++), run
`npm run build`, then `npm run preview`, and open the address it prints. In the developer tools' Network tab tick
"Disable cache", set the speed to "Slow 4G", choose "Dark", and reload: the page is dark from the very first moment.
For comparison, comment the script out (put `<!--` before it and `-->` after it), stop the preview, run the two
commands again, and reload the same way: now the light background flashes for a moment. Afterwards stop the preview
(++Ctrl++ + ++C++), remove the two comment marks, and start the development server again (`npm run dev`), because the
next step continues there.
:::

:::mistake Common mistake
The key in `index.html` and `STORAGE_KEY` in `useDarkMode.js` must be exactly the same. If they differ, the script
finds nothing, and the flash is back, without any error message.
:::

### An animated change

Finally, let's turn the change itself into a little show: the new theme grows out of the clicked button in a circle,
like a lamp switched on (or off) in the dark.

The browser's [[View Transitions API]] does the hard part. `document.startViewTransition(change)` takes a picture of
the page, calls `change`, takes a picture of the new state, and animates from the old picture to the new one. How it
animates is up to the CSS.

There is one catch. React usually updates the page a moment after you ask it to, but the browser wants the new state
as soon as `change` returns. [[flushSync]] (from `react-dom`) tells React: do it now, before the next line. Change
`src/components/ThemeSwitch.jsx` like this:

```jsx file=src/components/ThemeSwitch.jsx mark=1,15-36,45
import { flushSync } from 'react-dom'
import { useTheme } from '../ThemeContext.jsx'
import './ThemeSwitch.css'

const OPTIONS = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'red', label: 'Red' },
  { mode: 'system', label: 'System' },
]

function ThemeSwitch() {
  const { mode, setMode } = useTheme()

  function choose(event, nextMode) {
    if (nextMode === mode) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // No View Transitions in this browser, or motion switched off: change at once.
    if (!document.startViewTransition || reduceMotion) {
      setMode(nextMode)
      return
    }

    // The circle starts from the centre of the clicked button.
    const box = event.currentTarget.getBoundingClientRect()
    const root = document.documentElement
    root.style.setProperty('--reveal-x', `${box.left + box.width / 2}px`)
    root.style.setProperty('--reveal-y', `${box.top + box.height / 2}px`)

    // Old picture, the change (right now, thanks to flushSync), new picture, animation.
    document.startViewTransition(() => {
      flushSync(() => {
        setMode(nextMode)
      })
    })
  }

  return (
    <div className="theme-switch" role="group" aria-label="Theme">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          onClick={(event) => choose(event, option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitch
```

- `if (nextMode === mode) return`: a click on the button that is already chosen does nothing, so the circle does not
  play needlessly.
- `onClick={(event) => choose(event, option.mode)}`: React hands every click handler an event object, as in lesson 1's
  form. The arrow function passes it on to `choose`, together with the mode.
- `event.currentTarget` is the clicked button, and `getBoundingClientRect()` tells where it is on the screen; from
  that we work out its centre.
- `root.style.setProperty('--reveal-x', …)` puts the centre into two CSS variables on `<html>`. CSS variables can be
  set from JavaScript too, and the animation below reads them.
- Browsers without the API (`!document.startViewTransition` means: there is no such function) and people who switched
  off motion on their computer (the `prefers-reduced-motion` setting from lesson 1) get the plain, instant change.

The animation goes to the end of `src/index.css`:

```css file=src/index.css
/* The theme change: the new colours appear in a circle that grows from the button. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  animation: reveal 0.6s ease-out;
}

@keyframes reveal {
  from {
    clip-path: circle(0 at var(--reveal-x) var(--reveal-y));
  }
  to {
    clip-path: circle(150vmax at var(--reveal-x) var(--reveal-y));
  }
}
```

During the transition the browser shows the two pictures on top of each other: `::view-transition-old(root)` is the
old page, `::view-transition-new(root)` is the new one. We switch off their default cross-fade (`animation: none`, and
`mix-blend-mode: normal`, so the two pictures are not blended into each other), and give the new picture our own
animation, named `reveal`. The [[@keyframes]] rule with that name describes what it does: where it starts (`from`) and
where it ends (`to`). The [[clip-path]] cuts a circle out of the new picture: at the start it is 0 wide, at the end it
is bigger than the window (`150vmax` is one and a half times the window's longer side), so it reaches every corner.

:::check Check
Choose "Light", then click "Dark": the night spreads from the button in a circle. It works from the keyboard too: then
it starts from the button that has the focus (the one with the outline around it). In the Rendering panel,
"Emulate CSS media feature prefers-reduced-motion" set to reduce makes the change instant again. The lesson is done:
commit it, and enjoy the stars!
:::

:::mistake Common mistake
Without `flushSync`, the browser may take the new picture before React has updated the page, and the circle reveals
the old colours. Whenever you change React state in the function you pass to `startViewTransition`, wrap the change in
`flushSync`.
:::
