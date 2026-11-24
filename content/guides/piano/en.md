# What we build

A piano in the browser. You play it with the mouse, a finger or the computer keyboard, switch octaves and sounds,
record a melody and play it back, and if you have a MIDI keyboard, you can plug that in too. At the end, a teaching
mode lights up the next key of a melody in gold.

There isn't a single sound file in it: the browser makes every note itself, on the fly, with the Web Audio API. On
the way you learn how to build a user interface from an array, how a page listens to the keyboard, and what `useRef` is
good for when the thing you have to keep hold of is not an HTML element but notes that are sounding.

:::levels
- One octave of piano keys built from an array: they sound when clicked, and keep sounding while you hold them. | about 2 hours
- Playing with the computer keyboard, notes from a formula, switching octaves and four instrument sounds. | about 3 hours
- Sound synthesis with an envelope and a filter, recording and playback, a MIDI keyboard and a melody teaching mode. | about 4 hours
:::

**Before you start you need:** the earlier lessons, mostly these: lists with `map` and `key` (lesson 9), keyboard
events, closures and the updater function (lesson 7), custom hooks (lesson 9), the cleanup function of `useEffect`
(lesson 3) and `useRef` (lesson 16). Wherever something familiar is used in a new way, we explain it again.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is in the course's repository, in the `lessons/17-piano/exercise` folder (the "Exercise on
GitHub" button above opens this folder on GitHub). Step 0 of lesson 1 explains in detail how to get it; here it is in
short. Open a terminal in your work folder, where the `rika-mentoring` repository is, bring in the new lessons, then
copy this lesson's `exercise` folder out of the repository as `piano`:

```shell
cd rika-mentoring
git pull        # brings the new lessons
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/17-piano/exercise piano
```

No repository yet? Clone it once instead of the first three lines:
`git clone https://github.com/mazsola739/rika-mentoring.git`. No git? On the repository's
[GitHub page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**, and copy the
`lessons/17-piano/exercise` folder out of it into your work folder as `piano`. You work in your copy: the repository
stays untouched, so `git pull` keeps working.

Open the `piano` folder in your editor, and type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white panel in the middle of the page,
with the title "Musical Instrument". Nothing else is on it yet: building the piano is your job.
:::

Finally, make your copy a git repository with one commit, the starting point. `npm run dev` keeps the first terminal
busy, so open a second one (the **+** button of the terminal panel), in the `piano` folder:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes the changed files back to your last commit (it doesn't delete the files you created;
delete those by hand), and it is worth committing after every step that works.

The exercise has three files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready (the keys, the buttons, the panels). This lesson is about React
  and sound, not CSS, so you only use the class names (`keys`, `key`, `panel`, …) the steps give you. A comment at the
  piano keys explains how the black keys sit between the white ones: it is worth reading.
- `src/melodies.js`: three short melodies for the teaching mode of the advanced level. You don't need it before then.

This lesson makes noise: turn your speakers on, or put on headphones (not too loud!).

:::concept A quick recap
A [[component]] is a function that returns [[JSX]]. It gets [[props]] from outside and remembers things with
[[useState]]: when a state value changes, React draws the component again. `map` turns an array into a list, and every
item gets a unique [[key]]. Work outside drawing (a timer, an event listener) goes into [[useEffect]], and its cleanup
function tidies up after it. [[useRef]] gives you a box that keeps its content between drawings, but when the content
changes, React does not draw again. The steps remind you of these briefly.
:::

### Keys from an array

Piano keys follow a regular pattern: seven white keys (C, D, E, F, G, A, B) with five black keys between them, in
groups of two and three. After twelve keys the pattern starts again: that is one [[octave]]. Two neighbouring keys are
one [[semitone]] apart.

Every note is a vibration: the more often it vibrates per second, the higher it sounds. The number of vibrations per
second is the [[frequency]], measured in [[hertz]] (Hz). Orchestras tune to an A of 440 Hz, and the C in the middle of
the piano is 261.63 Hz.

We don't type the keys into the JSX one by one; we build them from an array. Every item of the array describes one
note, and the component turns each of them into a button with `map`. When the array changes, the keyboard follows by
itself. Create a `notes.js` file in the `src` folder:

```js file=src/notes.js
// One octave of the piano: from middle C up to the next C.
// midi: the number of the key (middle C is 60), name: the name of the note,
// black: whether it is a black key, frequency: how many times the note vibrates per second (hertz).
export const NOTES = [
  { midi: 60, name: 'C', black: false, frequency: 261.63 },
  { midi: 61, name: 'C♯', black: true, frequency: 277.18 },
  { midi: 62, name: 'D', black: false, frequency: 293.66 },
  { midi: 63, name: 'D♯', black: true, frequency: 311.13 },
  { midi: 64, name: 'E', black: false, frequency: 329.63 },
  { midi: 65, name: 'F', black: false, frequency: 349.23 },
  { midi: 66, name: 'F♯', black: true, frequency: 369.99 },
  { midi: 67, name: 'G', black: false, frequency: 392 },
  { midi: 68, name: 'G♯', black: true, frequency: 415.3 },
  { midi: 69, name: 'A', black: false, frequency: 440 },
  { midi: 70, name: 'A♯', black: true, frequency: 466.16 },
  { midi: 71, name: 'B', black: false, frequency: 493.88 },
  { midi: 72, name: 'C', black: false, frequency: 523.25 },
]
```

Every note is an object with four fields:

- `midi`: the number of the key. Instruments and music software number the notes semitone by semitone, following the
  [[MIDI]] standard, and in it the C in the middle of the piano is number 60. For us it is the key's unique id.
- `name`: the name of the note. A black key has two names (C♯, "C sharp", is also D♭, "D flat"); we use the sharp
  ones. The `♯` sign is easiest to copy from here. There are two Cs in the row, because the keyboard ends with the C of
  the next octave, just like a real piano.
- `black`: whether it is a black key (`true` or `false`).
- `frequency`: the frequency in hertz. In the next step it becomes a sound.

The keyboard gets a component of its own. Create a `components` folder inside `src`, with a `PianoKeys.jsx` file in it:

```jsx file=src/components/PianoKeys.jsx
function PianoKeys({ notes }) {
  return (
    <div className="keys">
      {notes.map((note) => {
        const className = note.black ? 'key key--black' : 'key key--white'
        return (
          <button key={note.midi} type="button" className={className} aria-label={note.name}>
            {!note.black && <span className="key__name">{note.name}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default PianoKeys
```

- `map` turns every note into a `<button>`. A button, because we are going to click it. This time the arrow function in
  `map` has a body in curly braces, because we work out the class name before the button; then it needs a `return` at
  the end.
- `key={note.midi}` identifies the item for React, and the MIDI number is different for every key.
- The class name depends on the `black` field: `key key--white` or `key key--black`. Both classes are in the ready-made
  `App.css`, and the CSS places a black key between and above its two white neighbours.
- Only the white keys show the name of their note: `!note.black && …` draws the `<span>` only when the note is not
  black. So that a screen reader can still read out the black keys, `aria-label` gives every button its name.

Finally, put the keyboard on the page. Change `src/App.jsx` to this:

```jsx file=src/App.jsx mark=1-2,9
import { NOTES } from './notes.js'
import PianoKeys from './components/PianoKeys.jsx'
import './App.css'

function App() {
  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <PianoKeys notes={NOTES} />
    </main>
  )
}

export default App
```

:::check Check
Under the title, in a black frame, there is one octave of a piano: 8 white and 5 black keys. The black keys sit in
groups of two and three between the white ones, like on a real piano, and the white keys show the names of their notes:
C, D, E, F, G, A, B, C. Clicking a key makes no sound yet.
:::

:::mistake Common mistake
`key={note.name}`. There are two Cs in the row, so two items get the same key, and the console (++F12++) shows a
warning: "Encountered two children with the same key, `C`". React may then mix up the two buttons. A key has to be
unique in the whole list: that is why every note got a `midi` number.
:::

:::try Try it
Add two more notes to the end of the `NOTES` array: `{ midi: 73, name: 'C♯', black: true, frequency: 554.37 }` and
`{ midi: 74, name: 'D', black: false, frequency: 587.33 }`. The keyboard grows by itself, because it is built from the
array. Then delete them again: the CSS sizes the black keys for 13 keys.
:::

### The first sound

The keys are there; now for the sound. The browser has a sound studio built in, the [[Web Audio API]]. In it you put a
sound together from small building blocks called [[audio nodes|audio node]], and you connect them like the cables of a
mixing desk, from the source of the sound to the speakers. The connected nodes together are the [[audio graph]]. For
now we need three of them:

- An [[oscillator]] (`OscillatorNode`) is the source of the sound. It makes a steady, repeating vibration at the
  frequency you give it. It needs no sound file: the sound is made from numbers, on the fly.
- A [[GainNode]] is the volume. It makes the sound that passes through it quieter or louder: 0 is silence, 1 is full
  volume.
- The `destination` is the speakers (or the headphones).

All of them are made by an [[AudioContext]]. That is the studio itself: it talks to the sound card, and it has the
clock that every sound is timed by. Making sound will be a custom hook, `useSynth` (synth is short for synthesizer: an
instrument that makes its sound electronically). Create the file `src/useSynth.js`:

```js file=src/useSynth.js
import { useRef } from 'react'

function useSynth() {
  // The sound studio (AudioContext). It is made at the first click, and after that we always use the same one.
  const contextRef = useRef(null)

  function play(frequency) {
    if (contextRef.current === null) {
      contextRef.current = new AudioContext()
    }
    const context = contextRef.current
    const now = context.currentTime

    // The source of the sound: an oscillator that vibrates frequency times a second.
    const oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.value = frequency

    // The volume: it rises quickly, then dies away within a second, like a struck string.
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1)

    // Oscillator → volume → speakers. Start now, stop in a second.
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 1)
  }

  return { play }
}

export default useSynth
```

Line by line:

- `context.currentTime` is the studio's clock: how many seconds have passed since the studio was made. Every moment is
  given relative to it. `oscillator.start(now)` starts the sound now, `oscillator.stop(now + 1)` stops it a second
  later. No `setTimeout` is needed: the studio keeps time itself, to the millisecond.
- `oscillator.type = 'triangle'` is the shape of the vibration (a triangle); in the intermediate level you will be able
  to choose it. `oscillator.frequency.value` is the frequency, which comes from the key.
- `gain.gain` is the GainNode's setting called `gain` (hence the double name). Settings like this can be programmed in
  advance: `setValueAtTime(0, now)` sets it to 0 now, `linearRampToValueAtTime(0.3, now + 0.01)` raises it evenly to
  0.3 within ten milliseconds, and `exponentialRampToValueAtTime(0.001, now + 1)` brings it down almost to silence
  within a second, slower and slower, the way a struck string fades. A curve like that never reaches zero, so the
  target is 0.001. Switching the sound on or off in an instant would click: the speaker's membrane would jump.
- `connect` joins the nodes: oscillator → volume → speakers. Until `gain` is connected to the `destination`, the sound
  goes nowhere.

The hook returns an object with the `play` function in it. The keyboard gets an `onPlay` prop and calls it with the
clicked note at every click. Change `PianoKeys.jsx`:

```jsx file=src/components/PianoKeys.jsx mark=1,12
function PianoKeys({ notes, onPlay }) {
  return (
    <div className="keys">
      {notes.map((note) => {
        const className = note.black ? 'key key--black' : 'key key--white'
        return (
          <button
            key={note.midi}
            type="button"
            className={className}
            aria-label={note.name}
            onClick={() => onPlay(note)}
          >
            {!note.black && <span className="key__name">{note.name}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default PianoKeys
```

`App` calls the hook and tells the keyboard what should happen at a click:

```jsx file=src/App.jsx mark=2,7,9-11,16
import { NOTES } from './notes.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import './App.css'

function App() {
  const synth = useSynth()

  function playNote(note) {
    synth.play(note.frequency)
  }

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <PianoKeys notes={NOTES} onPlay={playNote} />
    </main>
  )
}

export default App
```

:::concept Why is the AudioContext made only at the first click?
Browsers don't let a page make sound on its own: imagine every page you open starting to play music at once. This is
the [[autoplay policy]]. An AudioContext may only make sound after the user has done something on the page: clicked,
pressed a key or touched the screen. If we made it when the page loads, it would be born "suspended", and it would be
up to the browser when it wakes up: Chrome starts it by itself at the first sound after a click, other browsers only if
the code asks for it during a click. That is why `play` makes it, right at the moment the user has just clicked: this
way the studio works at once, in every browser.

The whole page needs only one studio. Opening a new one at every click would be wasteful (each one holds on to the
sound card), and browsers limit how many there can be. So it goes into a `useRef` box, whose content stays between
drawings. It doesn't need to be state (`useState`): the studio is not shown on the screen, and when it changes, nothing
has to be drawn again. A plain `let context` variable won't do either: it would start again, as `null`, at every
drawing.
:::

:::check Check
Click a key: a soft "ping" sounds and dies away within a second. The further right you click, the higher the note, and
the two Cs are "the same note", the right one just higher. If you click several keys quickly, the notes ring into each
other.
:::

:::mistake Common mistake
Writing 0 instead of 0.001: `exponentialRampToValueAtTime(0, now + 1)`. It looks logical, since we want silence, but an
exponential curve never reaches zero: the browser throws an error ("RangeError: … The float target value provided (0)
should not be in the range…"), `play` stops at that line, and the keys stay silent. The target has to be a very small
number that is still greater than zero.
:::

:::try Try it
Change `'triangle'` to `'square'`, `'sawtooth'` or `'sine'`, and listen to how the colour of the sound changes. Then
make the note three seconds long: write `now + 3` instead of `now + 1` in both places.
:::

### Sound while you hold the key

On a real instrument a note sounds for as long as you hold the key down. For that we need two things: we have to know
when a key is pressed and when it is let go, and we have to be able to silence a note that is already sounding.

A click (`click`) won't do, because it only arrives after the button is released. [[Pointer events|pointer event]],
however, tell you separately about pressing (`pointerdown`), letting go (`pointerup`) and the pointer leaving the
element (`pointerleave`). "Pointer" means any pointer: the mouse, a finger on a touch screen and a pen, so the same
code works with all of them.

Instead of `play`, the hook now gives you two functions: `start` makes a note sound, and `stop` silences it. To silence
a note, `stop` has to find the oscillator that is sounding, so `start` stores it. Several notes can sound at once (you
can play chords), so we keep them in a [[Map]], which you used in the advanced level of lesson 8: the key is the note's
MIDI number, the value is the oscillator and its volume. `set` puts a pair in, `get` looks one up, `delete` removes it.
The Map goes into a `useRef` box too: it stays between drawings, and changing it draws nothing again. This is what the
introduction promised: `useRef` keeping hold of sounding notes instead of an HTML element. Change `src/useSynth.js`:

```js file=src/useSynth.js mark=1,4,6-7,9,13-16,18-21,26,28,31,36,39-47,49-56,58
import { useEffect, useRef } from 'react'

function useSynth() {
  // The sound studio (AudioContext). It is made at the first key press, and after that we always use the same one.
  const contextRef = useRef(null)
  // The notes sounding now: MIDI number → { oscillator, gain }. This tells us what to silence.
  const voicesRef = useRef(new Map())

  function getContext() {
    if (contextRef.current === null) {
      contextRef.current = new AudioContext()
    }
    // If the browser has paused the studio, we start it again.
    if (contextRef.current.state === 'suspended') contextRef.current.resume()
    return contextRef.current
  }

  // A note starts, and sounds until stop silences it.
  function start(note) {
    const context = getContext()
    stop(note) // if this note is still sounding, we silence it first
    const now = context.currentTime

    const oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.value = note.frequency

    // A quick rise that does not click: it starts at 0 and reaches 0.3 within a few milliseconds.
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.setTargetAtTime(0.3, now, 0.005)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    voicesRef.current.set(note.midi, { oscillator, gain })
  }

  // The note fades out quickly.
  function stop(note) {
    const voice = voicesRef.current.get(note.midi)
    if (voice === undefined) return
    voicesRef.current.delete(note.midi)
    const now = contextRef.current.currentTime
    voice.gain.gain.setTargetAtTime(0, now, 0.08)
    voice.oscillator.stop(now + 0.5)
  }

  // When the component goes away, we close the studio too.
  useEffect(() => {
    return () => {
      voicesRef.current.clear()
      if (contextRef.current !== null) contextRef.current.close()
      contextRef.current = null
    }
  }, [])

  return { start, stop }
}

export default useSynth
```

- `getContext` is the `if` of the previous step, moved into a function of its own because it now does more than that
  one check: it has a new line too. If the browser has paused (`suspended`) the studio, `resume()` starts it again. This
  is rare, but a phone, for example, pauses sound while a call is on, and on some phones the first touch only "gives
  permission": there the sound starts from the second touch.
- `start` no longer stops the note by itself. This time the volume is raised by `setTargetAtTime(0.3, now, 0.005)`: it
  moves towards a target value, slower and slower, the way a hot cup of tea cools to room temperature. The third number
  is the [[time constant]]: in that much time it covers about two thirds of the remaining way, in three times that much
  about 95%. Here it is 5 milliseconds, so the note reaches full volume in the blink of an eye, and stays there. The
  oscillator goes into the Map together with its volume, under the note's MIDI number.
- At the very start of `start`, `stop(note)` silences the same note if it is still sounding. Without it, the new
  oscillator would overwrite the old one in the Map, and nobody could ever find the old one again: it would sound
  forever.
- `stop` looks the note up. If it isn't sounding, there is nothing to do (`return`); if it is, it takes it out of the
  Map and fades it out the same way: `setTargetAtTime(0, now, 0.08)` starts from wherever the volume is right now (even
  if the rise hasn't finished yet) and moves towards 0. Half a second later it is silent, and that is when the
  oscillator stops. A stopped oscillator can't be started again, but it doesn't have to be: every note gets a new one,
  which is cheap.
- The cleanup function (lesson 3) closes the studio when the component leaves the page, and forgets the notes.

Now the keyboard. On a press it calls the `onPress` prop, on letting go the `onRelease` prop, and it also gets the notes
that are sounding (`active`), so that their keys can light up:

```jsx file=src/components/PianoKeys.jsx mark=1-2,4,6-7,14-19
function PianoKeys({ notes, active, onPress, onRelease }) {
  // Because of onContextMenu, a right-click (or a long touch) does not open a menu on the keys.
  return (
    <div className="keys" onContextMenu={(event) => event.preventDefault()}>
      {notes.map((note) => {
        let className = note.black ? 'key key--black' : 'key key--white'
        if (active.includes(note.midi)) className += ' is-active'
        return (
          <button
            key={note.midi}
            type="button"
            className={className}
            aria-label={note.name}
            onPointerDown={() => onPress(note)}
            onPointerUp={() => onRelease(note)}
            onPointerLeave={(event) => {
              // Only if the mouse slid off it with a button held down.
              if (event.buttons > 0) onRelease(note)
            }}
          >
            {!note.black && <span className="key__name">{note.name}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default PianoKeys
```

- The class name is a `let` now, because when the note is sounding, an `is-active` is added to its end (`+=` appends
  it; mind the space at the start). That is what makes `App.css` colour the key turquoise.
- `pointerleave` also arrives when the mouse just passes over a key. `event.buttons` tells you whether any mouse button
  is held down at the moment (0 if none), so we only silence the note if the player slid off the key with a button
  held down.
- `onContextMenu` arrives at a right-click (on a touch screen at a long touch), which would open a menu. Its
  `preventDefault()` switches that off, like the scrolling of the space bar in lesson 7.

Finally `App`. `active` is an array with the MIDI numbers of the notes that are sounding:

```jsx file=src/App.jsx mark=1,9-10,12-15,18-22,27
import { useState } from 'react'
import { NOTES } from './notes.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import './App.css'

function App() {
  const synth = useSynth()
  // The MIDI numbers of the notes sounding now: these keys light up.
  const [active, setActive] = useState([])

  // A note starts, and its key lights up.
  function press(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // A note stops, and its key goes dark.
  function release(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <PianoKeys notes={NOTES} active={active} onPress={press} onRelease={release} />
    </main>
  )
}

export default App
```

Both `setActive` calls get an [[updater function]] (lesson 7): React calls it with the current array (`current`), and
whatever it returns becomes the new state. `press` returns a new array with the new note at its end
(`[...current, note.midi]`), `release` one that `filter` left the note out of. But when there is nothing to change (the
note is already lit, or it wasn't lit at all), both return the old array unchanged: React then sees that the state is
the same, and doesn't draw again for nothing (lesson 16 showed why that is worth watching).

:::check Check
Press and hold the mouse button on a key: the note sounds until you let go, and the key is turquoise meanwhile. When
you let go, the note fades quickly and the key goes dark. If you slide off the key with the button held down, the note
stops; if you move the mouse over the keyboard without a button, nothing sounds. On a touch screen you can play chords
with several fingers. The beginner level is done: commit it!
:::

:::mistake Common mistake
`const voices = new Map()` in the hook, without `useRef`. The note starts and the key lights up, but when you let go,
only the key goes dark: the note sounds forever (until you reload the page). Because the key lit up, `App` was drawn
again, the hook ran again, and it made a brand-new, empty Map, in which `stop` finds nothing. Whatever must last longer
than one drawing and doesn't show on the screen belongs in a ref.
:::

:::try Try it
Sliding play (a glissando): give the button an `onPointerEnter={(event) => { if (event.buttons > 0) onPress(note) }}`
prop. Now if you drag the pointer across the keys with the mouse button held down, every key you pass over sounds.
(It doesn't work on a touch screen: there the finger "sticks" to the first key.)
:::

## Intermediate level {level=2}

### The computer keyboard plays too

With the mouse you can play one note at a time; on the computer keyboard you can play ten. In lesson 7 you listened to
the space bar: at every press the browser sends a `keydown` [[keyboard event]], and `event.code` tells you where the
pressed key is on the keyboard (`'KeyA'`, `'Space'`). This time we listen to letting go too: that is the `keyup`
event.

Which computer key should be which note? The middle row of letters (A S D F G H J K) gives the white keys, and some
letters of the row above (W E T Y U) the black ones, laid out just like on a piano. Add this array to the end of
`src/notes.js`. Its order is the same as that of `NOTES`, so the computer key at position `i` plays the note at position
`i`:

```js file=src/notes.js
// The computer keys, in the order of the 13 piano keys. code is where the key is, label is the letter on it:
// on a German or Hungarian keyboard the key between T and U says Z, but its code is KeyY there too.
export const COMPUTER_KEYS = [
  { code: 'KeyA', label: 'A' },
  { code: 'KeyW', label: 'W' },
  { code: 'KeyS', label: 'S' },
  { code: 'KeyE', label: 'E' },
  { code: 'KeyD', label: 'D' },
  { code: 'KeyF', label: 'F' },
  { code: 'KeyT', label: 'T' },
  { code: 'KeyG', label: 'G' },
  { code: 'KeyY', label: 'Y' },
  { code: 'KeyH', label: 'H' },
  { code: 'KeyU', label: 'U' },
  { code: 'KeyJ', label: 'J' },
  { code: 'KeyK', label: 'K' },
]
```

The values of `event.code` are named after the letters of the US (QWERTY) keyboard, but they mean a place, not a
letter. On a German or Hungarian keyboard, for example, the key between T and U says Z, yet its code is `'KeyY'`,
because it is in the same place. That is why `code` is the right choice: the piano is in the same place on every
keyboard layout. `label` is what is printed on the key; we show it on the piano keys. If your keyboard has a different
letter there, change the `label`.

The label goes into a `<kbd>` element, which marks a keyboard key in HTML. `index`, the second parameter of `map` (the
position of the item we are at, counting from 0), tells us which computer key belongs to the note. Change
`PianoKeys.jsx`:

```jsx file=src/components/PianoKeys.jsx mark=1,7,10,16,24
import { COMPUTER_KEYS } from '../notes.js'

function PianoKeys({ notes, active, onPress, onRelease }) {
  // Because of onContextMenu, a right-click (or a long touch) does not open a menu on the keys.
  return (
    <div className="keys" onContextMenu={(event) => event.preventDefault()}>
      {notes.map((note, index) => {
        let className = note.black ? 'key key--black' : 'key key--white'
        if (active.includes(note.midi)) className += ' is-active'
        const label = COMPUTER_KEYS[index].label
        return (
          <button
            key={note.midi}
            type="button"
            className={className}
            aria-label={`${note.name}, key ${label}`}
            onPointerDown={() => onPress(note)}
            onPointerUp={() => onRelease(note)}
            onPointerLeave={(event) => {
              // Only if the mouse slid off it with a button held down.
              if (event.buttons > 0) onRelease(note)
            }}
          >
            <kbd className="key__label">{label}</kbd>
            {!note.black && <span className="key__name">{note.name}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default PianoKeys
```

Now the listener. The window is outside React's world, so an effect adds the listeners, and its cleanup function
removes them, just like in lesson 7. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=1-2,24-30,32-39,41-44,46-52
import { useEffect, useState } from 'react'
import { COMPUTER_KEYS, NOTES } from './notes.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import './App.css'

function App() {
  const synth = useSynth()
  // The MIDI numbers of the notes sounding now: these keys light up.
  const [active, setActive] = useState([])

  // A note starts, and its key lights up.
  function press(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // A note stops, and its key goes dark.
  function release(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  // The computer keyboard plays too: a key press starts a note, letting go stops it.
  useEffect(() => {
    // Which note belongs to this key? If none, undefined.
    function noteFor(event) {
      const index = COMPUTER_KEYS.findIndex((key) => key.code === event.code)
      return index === -1 ? undefined : NOTES[index]
    }

    function handleKeyDown(event) {
      // A held key must not start again; Ctrl, Alt and Cmd combinations belong to the browser.
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
      const note = noteFor(event)
      if (note === undefined) return
      event.preventDefault()
      press(note)
    }

    function handleKeyUp(event) {
      const note = noteFor(event)
      if (note !== undefined) release(note)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <PianoKeys notes={NOTES} active={active} onPress={press} onRelease={release} />
    </main>
  )
}

export default App
```

- `noteFor` uses `findIndex`, known from lesson 9, to find the position of the pressed key in `COMPUTER_KEYS`. If it
  isn't there (`-1`, for example for the ++Q++ key), it returns `undefined`, and the handlers do nothing.
- `event.repeat`: when you hold a key down, the browser repeats `keydown` many times a second. The note is already
  sounding; it doesn't need to start again.
- `event.ctrlKey`, `event.altKey`, `event.metaKey`: true when ++Ctrl++, ++Alt++ or (on a Mac) ++Cmd++ is held down too.
  Those are the browser's shortcuts (++Ctrl++ + ++W++ closes the tab, for example), so we keep out of them.
- `event.preventDefault()` (lesson 7) asks the browser not to do anything else with this key. Letters don't do much
  here, but if the focus were on a drop-down list, for example, a letter would jump to one of its options.
- The `keyup` handler doesn't need to check for repeats: letting go happens once.

The effect runs only once (`[]`), so the functions in it call the `press` and `release` of the first drawing all along:
this is the [[closure]] you know from lesson 7. Right now that is no problem, because these functions only use things
that are the same in every drawing: the hook's refs and `setActive` with its updater function. Two steps from now, when
the octave can change, it will be.

:::check Check
Click the page once, so the key presses arrive here (and not, say, in the address bar), then press ++A++: C sounds, and
its key lights up. ++W++ is C♯, ++S++ is D, and so on up to ++K++, the upper C. Every piano key shows the letter that
plays it. The note sounds while you hold the computer key; press ++A++, ++D++ and ++G++ together, and you hear a C major
chord.
:::

:::mistake Common mistake
`event.key === 'a'` instead of `event.code`. It seems to work, but with ++Caps Lock++ on, or ++Shift++ held down,
`event.key` is `'A'`, and the key stays silent. On keyboards with other layouts there would be completely different
letters in those places. For the place of a key you need `event.code`.
:::

:::try Try it
Play this on the keyboard: ++D++ ++D++ ++F++ ++G++ ++G++ ++F++ ++D++ ++S++ ++A++ ++A++ ++S++ ++D++ ++D++ ++S++ ++S++.
It is the beginning of Beethoven's Ode to Joy (E E F G G F E D C C D E E D D).
:::

### Notes from a formula

Look at the first and the last C of the `NOTES` array: 261.63 and 523.25 Hz. The second is exactly double the first.
That is no accident: one octave up, the frequency always doubles. The octave is divided into 12 semitones, and every
semitone multiplies the frequency by the same number. If you multiply the frequency by that number 12 times in a row,
you get exactly double, so the number is the twelfth root of 2, about 1.0595: one semitone up, the frequency is about
6% higher.

That gives a formula. In MIDI numbering, the 440 Hz A is number 69. Any note `midi` is `midi - 69` semitones away from
it, so its frequency is `440 * 2 ** ((midi - 69) / 12)`. `**` is "to the power of": `2 ** 3` is 8, and `2 ** (1 / 12)`
is the twelfth root of 2. With the formula you don't have to type the frequencies by hand, and you can make any octave.
The name and the colour of a key can be worked out too: the remainder operator `midi % 12`, known from lesson 3, tells
you which semitone of the octave a note is (0 is C, 1 is C♯, … 11 is B), because the pattern repeats every 12 notes.

Replace the beginning of `src/notes.js`, the `NOTES` array; `COMPUTER_KEYS` stays. Here is the whole file:

```js file=src/notes.js mark=1-4,6-14,16-24
// The names of the notes in one octave. A black key is named after the white key on its left, with a ♯ (sharp).
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
// Which of the 12 semitones of an octave are black keys.
const BLACK = [false, true, false, true, false, false, true, false, true, false, true, false]

// A note from its MIDI number. A4 (69) is 440 Hz, and every semitone multiplies by the twelfth root of 2.
export function makeNote(midi) {
  return {
    midi,
    name: NAMES[midi % 12],
    black: BLACK[midi % 12],
    frequency: 440 * 2 ** ((midi - 69) / 12),
  }
}

// The 13 keys of an octave: from the C of the octave up to the next C. The C of octave 4 is number 60.
export function makeNotes(octave) {
  const first = (octave + 1) * 12
  const notes = []
  for (let midi = first; midi <= first + 12; midi++) {
    notes.push(makeNote(midi))
  }
  return notes
}

// The computer keys, in the order of the 13 piano keys. code is where the key is, label is the letter on it:
// on a German or Hungarian keyboard the key between T and U says Z, but its code is KeyY there too.
export const COMPUTER_KEYS = [
  { code: 'KeyA', label: 'A' },
  { code: 'KeyW', label: 'W' },
  { code: 'KeyS', label: 'S' },
  { code: 'KeyE', label: 'E' },
  { code: 'KeyD', label: 'D' },
  { code: 'KeyF', label: 'F' },
  { code: 'KeyT', label: 'T' },
  { code: 'KeyG', label: 'G' },
  { code: 'KeyY', label: 'Y' },
  { code: 'KeyH', label: 'H' },
  { code: 'KeyU', label: 'U' },
  { code: 'KeyJ', label: 'J' },
  { code: 'KeyK', label: 'K' },
]
```

- `makeNote` makes a single note from its MIDI number: the same kind of object that stood in the array until now. The
  `{ midi, … }` is a shorthand: when the field and the variable have the same name, writing it once is enough (instead
  of `midi: midi`).
- `NAMES` and `BLACK` are only needed in this file, so we don't export them.
- `makeNotes` makes a whole octave, from C up to the next C. MIDI numbering starts with octave -1 (whose C is 0), so the
  C of an octave is `(octave + 1) * 12`: for octave 4 that is 5 × 12 = 60, middle C. The `for` loop goes from there up
  12 semitones, and puts a note for every number into the array. That is also why the usual notation calls middle C
  C4 and the 440 Hz A A4: the letter is the note, the number is the octave.

The old `NOTES` array is gone, so `App` makes it with the formula. Replace the beginning of `src/App.jsx`, the imports;
from the `function App()` line down everything stays:

```jsx file=src/App.jsx mark=2,7-8
import { useEffect, useState } from 'react'
import { COMPUTER_KEYS, makeNotes } from './notes.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import './App.css'

// The 13 keys of octave 4, now from the formula.
const NOTES = makeNotes(4)
```

:::check Check
Everything looks and sounds exactly as before: the formula gives the same notes as the array you typed. Type this into
the browser's console (++F12++ → Console): `440 * 2 ** ((60 - 69) / 12)`. The result is 261.6255…, middle C.
:::

:::mistake Common mistake
`440 * 2 ** (midi - 69) / 12`, without the outer brackets. Raising to a power comes before division, so this divides the
power of 2 by 12, not the exponent. Middle C would be 0.07 Hz: one single vibration every fourteen seconds, which the
ear can't hear, so the keys stay silent.
:::

:::try Try it
Change `makeNotes(4)` to `makeNotes(3)`, then to `makeNotes(5)`: the keyboard stays the same, but sounds one octave
lower or higher. Then set it back to 4: in the next step this will work with buttons.
:::

### Changing octaves

One octave is not much: a real piano has more than seven. The screen keeps showing 13 keys (so they fit on a phone
too), but buttons will switch which octave you see and hear. The octave is the user's choice, so it is state. The keys are not: we work
them out from the octave at every drawing (`makeNotes(octave)`), like the strength meter in lesson 3. This is a
[[derived value]].

The switch is a component of its own. Create the file `src/components/OctaveSwitch.jsx`:

```jsx file=src/components/OctaveSwitch.jsx
function OctaveSwitch({ octave, min, max, onChange }) {
  return (
    <div className="octave" role="group" aria-label="Octave">
      <span className="octave__title">Octave</span>
      <div className="octave__controls">
        <button
          type="button"
          className="octave__button"
          aria-label="Lower octave"
          disabled={octave === min}
          onClick={() => onChange(octave - 1)}
        >
          −
        </button>
        <strong className="octave__value" aria-live="polite">
          {octave}
        </strong>
        <button
          type="button"
          className="octave__button"
          aria-label="Higher octave"
          disabled={octave === max}
          onClick={() => onChange(octave + 1)}
        >
          +
        </button>
      </div>
      <span className="octave__hint">Keys: Z and X</span>
    </div>
  )
}

export default OctaveSwitch
```

The "−" button switches to a lower octave, the "+" button to a higher one; at the limits `disabled` switches them off.
The buttons only show a sign, so `aria-label` tells screen readers what they do, and `aria-live="polite"` reads out
the new octave when it changes. The bottom line promises keyboard shortcuts; we wire them up in the next step.

In `App`, the `octave` state and the `notes` worked out from it take the place of `NOTES`. Here is the whole
`src/App.jsx`:

```jsx file=src/App.jsx mark=5,8-9,15-17,31-34,41,69-72
import { useEffect, useState } from 'react'
import { COMPUTER_KEYS, makeNotes } from './notes.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import OctaveSwitch from './components/OctaveSwitch.jsx'
import './App.css'

const LOWEST_OCTAVE = 2
const HIGHEST_OCTAVE = 6

function App() {
  const synth = useSynth()
  // The MIDI numbers of the notes sounding now: these keys light up.
  const [active, setActive] = useState([])
  const [octave, setOctave] = useState(4)
  // The 13 keys on the screen: worked out from the octave at every drawing.
  const notes = makeNotes(octave)

  // A note starts, and its key lights up.
  function press(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // A note stops, and its key goes dark.
  function release(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  function changeOctave(value) {
    // Math.max and Math.min: the octave can't go past the limits.
    setOctave(Math.min(HIGHEST_OCTAVE, Math.max(LOWEST_OCTAVE, value)))
  }

  // The computer keyboard plays too: a key press starts a note, letting go stops it.
  useEffect(() => {
    // Which note belongs to this key? If none, undefined.
    function noteFor(event) {
      const index = COMPUTER_KEYS.findIndex((key) => key.code === event.code)
      return index === -1 ? undefined : notes[index]
    }

    function handleKeyDown(event) {
      // A held key must not start again; Ctrl, Alt and Cmd combinations belong to the browser.
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
      const note = noteFor(event)
      if (note === undefined) return
      event.preventDefault()
      press(note)
    }

    function handleKeyUp(event) {
      const note = noteFor(event)
      if (note !== undefined) release(note)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <div className="controls">
        <OctaveSwitch octave={octave} min={LOWEST_OCTAVE} max={HIGHEST_OCTAVE} onChange={changeOctave} />
      </div>
      <PianoKeys notes={notes} active={active} onPress={press} onRelease={release} />
    </main>
  )
}

export default App
```

`changeOctave` keeps the octave between the limits with [[Math.min]] and [[Math.max]]: `Math.max(LOWEST_OCTAVE, value)`
gives the larger of the two, so it can't go below 2, and `Math.min(HIGHEST_OCTAVE, …)` the smaller, so it can't go
above 6 either. The buttons do switch themselves off at the limits, but switching from the keyboard will need this
guard.

Try it with the mouse: after "+" the keys sound one octave higher. Now press ++A++ on the computer: the same low C
sounds as before! The effect ran once, after the first drawing, and `handleKeyDown` still sees the `notes` array of that
time, the one of octave 4: this is the closure, the same trap as the space bar in lesson 7. There the updater function
helped, but here we don't need to update a state: we need to pick one of the current keys.

We could solve it by writing `notes` into the effect's dependency array. But `makeNotes` returns a new array at every
drawing, so React would remove the listeners and add them again after every drawing, at every single key press. It
would work, but it is needless work, and easy to get wrong. The better way is the next step.

:::check Check
Click "+": the number becomes 5 and the mouse plays one octave higher; at 6 the "+" and at 2 the "−" turns grey. The
computer keys still play octave 4: the next step fixes that.
:::

:::mistake Common mistake
Putting the keys in state as well: `const [notes, setNotes] = useState(makeNotes(4))`. Then every octave change would
have to update two states together, and if one is forgotten, the screen shows one octave while the sound comes from
another. Whatever can be worked out from the state, work it out at every drawing; don't store it.
:::

:::try Try it
Show the range on the switch too, for example "C4–C5": in `OctaveSwitch`, next to the octave number, write
`C{octave}–C{octave + 1}`.
:::

### Always the latest drawing: useEffectEvent

The computer keys are stuck in octave 4, because the effect's functions see the first drawing. Since React 19.2 there
is a tool made for this: an [[Effect Event]], made by the `useEffectEvent` hook. It wraps a
function that an effect uses, and it promises two things: when it is called, it always sees the variables of the
**latest** drawing (the current `notes`, `octave`, `press`), and yet it doesn't go into the dependency array, so the
effect can run once. Inside, it is like a ref that React fills with the newest version of the function after every
drawing. It has two rules: call it only from an effect (and from the listeners the effect adds), and don't pass it
on to other components as a prop.

Change the first line, so `useEffectEvent` is imported too:
`import { useEffect, useEffectEvent, useState } from 'react'`. Then replace the whole `useEffect` block (from the comment
starting "The computer keyboard plays too" down to the `}, [])` line) with this:

```jsx file=src/App.jsx mark=2-4,8,11-20,26-27,31-32
  // Which note belongs to this computer key? If none, undefined.
  function noteFor(code) {
    const index = COMPUTER_KEYS.findIndex((key) => key.code === code)
    return index === -1 ? undefined : notes[index]
  }

  // The computer keyboard plays too. An Effect Event always sees the variables of the latest drawing.
  const handleKeyDown = useEffectEvent((event) => {
    // A held key must not start again; Ctrl, Alt and Cmd combinations belong to the browser.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // Z and X (codes KeyZ and KeyX): change the octave.
    if (event.code === 'KeyZ') {
      changeOctave(octave - 1)
      return
    }
    if (event.code === 'KeyX') {
      changeOctave(octave + 1)
      return
    }
    const note = noteFor(event.code)
    if (note === undefined) return
    event.preventDefault()
    press(note)
  })

  const handleKeyUp = useEffectEvent((event) => {
    const note = noteFor(event.code)
    if (note !== undefined) release(note)
  })

  // The listeners are added once, and the cleanup removes them.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
```

- `noteFor` moved out of the effect into the component, and from now on it only gets the key's code. It is made again
  at every drawing, with the current `notes`.
- `handleKeyDown` and `handleKeyUp` are now functions wrapped in `useEffectEvent`. The effect only adds and removes
  them; they do the work, always with fresh data.
- There are two new keys: ++Z++ goes down, ++X++ goes up. Their codes are `'KeyZ'` and `'KeyX'` (on a German or
  Hungarian keyboard the first one says Y). They read `octave`: without the Effect Event that would be the first
  drawing's too, and ++X++ would only ever take you up to octave 5.

:::check Check
Click "+": octave 5 is shown, and both the mouse and the ++A++ key play the higher C. ++X++ goes up, ++Z++ goes down. At
octave 6 the "+", at octave 2 the "−" turns grey, and the computer keyboard can't go any further either. The note names and the
letters stay in the same places in every octave.
:::

:::mistake Common mistake
Wrapping only `handleKeyUp` in `useEffectEvent` and leaving `handleKeyDown` a plain `function` in the component, with
the effect still `[]`. The effect then adds the first drawing's `handleKeyDown`: ++X++ only ever takes you to octave 5,
++A++ keeps playing the C of octave 4, and after an ++X++ its note doesn't even stop, because letting go already looks
in octave 5. Every function the once-only effect hands to the window must be an Effect Event.
:::

:::try Try it
Write `console.log(octave)` into the first line of `handleKeyDown`, and press ++X++ a few times. The console always
shows the octave you can see (starting from 4: 4, 5, 6, 6), even though the effect ran only once: it is the `octave` of
the latest drawing. Then delete the line.
:::

### Stuck notes

Try this: hold ++A++ down, press ++X++ meanwhile, then let go of ++A++. The low C keeps sounding, forever! When you let
go, `noteFor` looks up the note in the new octave, and silences the C of octave 5, which wasn't even sounding. The same
happens if a note is sounding and you switch to another window with ++Alt++ + ++Tab++: letting go then goes to the other
window, and our page never hears it.

The first problem is solved by another ref: when a key is pressed, we remember which note that computer key started,
and when it is let go, we silence that one, whatever happened in between. The second is solved by the window's `blur`
event: it arrives when the window loses the focus. Then we stop every note.

For that the hook needs a `stopAll` function. The fading out moves into a shared `fadeOut` function, because now two
places need it. Here is the whole `src/useSynth.js`:

```js file=src/useSynth.js mark=39-44,46,51,54-58,69
import { useEffect, useRef } from 'react'

function useSynth() {
  // The sound studio (AudioContext). It is made at the first key press, and after that we always use the same one.
  const contextRef = useRef(null)
  // The notes sounding now: MIDI number → { oscillator, gain }. This tells us what to silence.
  const voicesRef = useRef(new Map())

  function getContext() {
    if (contextRef.current === null) {
      contextRef.current = new AudioContext()
    }
    // If the browser has paused the studio, we start it again.
    if (contextRef.current.state === 'suspended') contextRef.current.resume()
    return contextRef.current
  }

  // A note starts, and sounds until stop silences it.
  function start(note) {
    const context = getContext()
    stop(note) // if this note is still sounding, we silence it first
    const now = context.currentTime

    const oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.value = note.frequency

    // A quick rise that does not click: it starts at 0 and reaches 0.3 within a few milliseconds.
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.setTargetAtTime(0.3, now, 0.005)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    voicesRef.current.set(note.midi, { oscillator, gain })
  }

  // A sounding note fades out quickly.
  function fadeOut(voice) {
    const now = contextRef.current.currentTime
    voice.gain.gain.setTargetAtTime(0, now, 0.08)
    voice.oscillator.stop(now + 0.5)
  }

  // A note stops, if it is sounding.
  function stop(note) {
    const voice = voicesRef.current.get(note.midi)
    if (voice === undefined) return
    voicesRef.current.delete(note.midi)
    fadeOut(voice)
  }

  // Every note stops (for example when the window loses the focus).
  function stopAll() {
    voicesRef.current.forEach((voice) => fadeOut(voice))
    voicesRef.current.clear()
  }

  // When the component goes away, we close the studio too.
  useEffect(() => {
    return () => {
      voicesRef.current.clear()
      if (contextRef.current !== null) contextRef.current.close()
      contextRef.current = null
    }
  }, [])

  return { start, stop, stopAll }
}

export default useSynth
```

`stopAll` fades out every sounding note with the Map's `forEach`, then `clear()` empties the Map.

In `App`, `useRef` goes into the first line too: `import { useEffect, useEffectEvent, useRef, useState } from 'react'`.
The ref comes under the `notes` line:

```jsx file=src/App.jsx mark=2-3
  const notes = makeNotes(octave)
  // Which computer key started which note (event.code → note).
  const heldRef = useRef(new Map())
```

After the `noteFor` function, replace the handlers and the effect, from the comment starting "The computer keyboard
plays too" down to the `}, [])` line:

```jsx file=src/App.jsx mark=17,22-26,29-34,40,44
  // The computer keyboard plays too. An Effect Event always sees the variables of the latest drawing.
  const handleKeyDown = useEffectEvent((event) => {
    // A held key must not start again; Ctrl, Alt and Cmd combinations belong to the browser.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // Z and X (codes KeyZ and KeyX): change the octave.
    if (event.code === 'KeyZ') {
      changeOctave(octave - 1)
      return
    }
    if (event.code === 'KeyX') {
      changeOctave(octave + 1)
      return
    }
    const note = noteFor(event.code)
    if (note === undefined) return
    event.preventDefault()
    heldRef.current.set(event.code, note) // remember which note this key started
    press(note)
  })

  const handleKeyUp = useEffectEvent((event) => {
    // Stop the note this key started, even if the octave has changed since.
    const note = heldRef.current.get(event.code)
    if (note === undefined) return
    heldRef.current.delete(event.code)
    release(note)
  })

  // When the window loses the focus (Alt+Tab, for example), we won't see the keys let go: every note stops.
  const handleBlur = useEffectEvent(() => {
    heldRef.current.clear()
    synth.stopAll()
    setActive([])
  })

  // The listeners are added once, and the cleanup removes them.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])
```

- On a key press, the note it started goes into the `heldRef` Map, under the key's code.
- On letting go, `handleKeyUp` no longer works anything out: it looks up what this key started. If there is nothing
  (because `handleBlur` stopped everything meanwhile, for example), there is nothing to do.
- `handleBlur` empties the Map, silences every note and turns every key dark.

Why a ref and not state? Nothing draws the content of `heldRef`; only the handlers read it, and they always need its
freshest content, even when two key events come faster than React would draw again.

A note played with the mouse can get stuck the same way (hold a piano key with the mouse and press ++X++); for now
only switching windows helps there: the task below fixes it.

:::check Check
Hold ++A++ down, press ++X++, then let go of ++A++: the low C stops. What is more, while ++A++ is sounding, you can play
a melody above it in the higher octave. Hold two keys down and switch to another window (++Alt++ + ++Tab++): the notes
stop and the keys go dark.
:::

:::mistake Common mistake
In `stopAll`, `clear()` comes before `forEach`. Then the Map is already empty by the time we would go through it: the
keys go dark, but the notes keep sounding, and nothing can stop them any more.
:::

:::try Task
The mouse has the same problem: hold a piano key with the mouse, press ++X++ and let go. Fix it like the computer
keys: `PianoKeys` hands over `event.pointerId` too
(`onPress(note, event.pointerId)`, `onRelease(note, event.pointerId)`), and `App` keeps a `pointersRef` Map
(pointer → note) that remembers which pointer started which note, and that `onRelease` reads instead of the note it
gets.
:::

### Instrument sounds

At the same frequency a flute and a violin sound completely different. The difference is in the shape of the
vibration, the [[waveform]]. Besides the main note, the sound of a real instrument also holds quieter notes at two,
three, four… times its frequency: these are the [[overtones|overtone]], and the waveform decides how strong each one
is. An oscillator knows four shapes:

- `sine`: pure and soft, without overtones, like a flute or a whistle.
- `triangle`: round, with a few quiet overtones; you have been hearing this one so far.
- `square`: hollow and "buzzy", like an organ or an old video game.
- `sawtooth`: bright and sharp, with all the overtones, like a synthesizer.

Every sound will be a small object in an array, and the user interface is built from it, like the keys. Create the
file `src/instruments.js`:

```js file=src/instruments.js
// The instrument sounds. Each one is an oscillator waveform: a differently shaped vibration, a different sound.
export const INSTRUMENTS = [
  { id: 'piano', label: 'Piano', wave: 'triangle' },
  { id: 'organ', label: 'Organ', wave: 'square' },
  { id: 'synth', label: 'Synth', wave: 'sawtooth' },
  { id: 'flute', label: 'Flute', wave: 'sine' },
]
```

The choice is a group of radio buttons, like the password types in lesson 3: only one of the radio buttons with the
same `name` can be selected at a time, and the arrow keys move between them. The CSS hides the radio button itself and
draws the label next to it as a "button". Create the file `src/components/InstrumentPicker.jsx`:

```jsx file=src/components/InstrumentPicker.jsx
import { INSTRUMENTS } from '../instruments.js'

function InstrumentPicker({ value, onChange }) {
  return (
    <fieldset className="sound">
      <legend>Sound</legend>
      <div className="sound__options">
        {INSTRUMENTS.map((item) => (
          <label key={item.id} className="sound__option">
            <input
              type="radio"
              name="instrument"
              value={item.id}
              checked={item.id === value}
              onChange={() => onChange(item.id)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default InstrumentPicker
```

`<fieldset>` and `<legend>` are familiar from lesson 3: they put the radio buttons into a group with a title, and a
screen reader says the name of the group at every button too.

The hook gets the instrument as a parameter. Change two lines in `src/useSynth.js`. The `function useSynth() {` line
becomes:

```js file=src/useSynth.js
function useSynth(instrument) {
```

and in the `start` function, the waveform, instead of `'triangle'`:

```js file=src/useSynth.js
    oscillator.type = instrument.wave
```

`App` keeps the chosen instrument in state and hands it to the hook. Here is the whole `src/App.jsx` at the end of the
intermediate level:

```jsx file=src/App.jsx mark=3,7,14-17,100
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { COMPUTER_KEYS, makeNotes } from './notes.js'
import { INSTRUMENTS } from './instruments.js'
import useSynth from './useSynth.js'
import PianoKeys from './components/PianoKeys.jsx'
import OctaveSwitch from './components/OctaveSwitch.jsx'
import InstrumentPicker from './components/InstrumentPicker.jsx'
import './App.css'

const LOWEST_OCTAVE = 2
const HIGHEST_OCTAVE = 6

function App() {
  const [instrumentId, setInstrumentId] = useState('piano')
  // The data of the chosen instrument, found by its id.
  const instrument = INSTRUMENTS.find((item) => item.id === instrumentId)
  const synth = useSynth(instrument)
  // The MIDI numbers of the notes sounding now: these keys light up.
  const [active, setActive] = useState([])
  const [octave, setOctave] = useState(4)
  // The 13 keys on the screen: worked out from the octave at every drawing.
  const notes = makeNotes(octave)
  // Which computer key started which note (event.code → note).
  const heldRef = useRef(new Map())

  // A note starts, and its key lights up.
  function press(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // A note stops, and its key goes dark.
  function release(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  function changeOctave(value) {
    // Math.max and Math.min: the octave can't go past the limits.
    setOctave(Math.min(HIGHEST_OCTAVE, Math.max(LOWEST_OCTAVE, value)))
  }

  // Which note belongs to this computer key? If none, undefined.
  function noteFor(code) {
    const index = COMPUTER_KEYS.findIndex((key) => key.code === code)
    return index === -1 ? undefined : notes[index]
  }

  // The computer keyboard plays too. An Effect Event always sees the variables of the latest drawing.
  const handleKeyDown = useEffectEvent((event) => {
    // A held key must not start again; Ctrl, Alt and Cmd combinations belong to the browser.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // Z and X (codes KeyZ and KeyX): change the octave.
    if (event.code === 'KeyZ') {
      changeOctave(octave - 1)
      return
    }
    if (event.code === 'KeyX') {
      changeOctave(octave + 1)
      return
    }
    const note = noteFor(event.code)
    if (note === undefined) return
    event.preventDefault()
    heldRef.current.set(event.code, note) // remember which note this key started
    press(note)
  })

  const handleKeyUp = useEffectEvent((event) => {
    // Stop the note this key started, even if the octave has changed since.
    const note = heldRef.current.get(event.code)
    if (note === undefined) return
    heldRef.current.delete(event.code)
    release(note)
  })

  // When the window loses the focus (Alt+Tab, for example), we won't see the keys let go: every note stops.
  const handleBlur = useEffectEvent(() => {
    heldRef.current.clear()
    synth.stopAll()
    setActive([])
  })

  // The listeners are added once, and the cleanup removes them.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <div className="controls">
        <InstrumentPicker value={instrumentId} onChange={setInstrumentId} />
        <OctaveSwitch octave={octave} min={LOWEST_OCTAVE} max={HIGHEST_OCTAVE} onChange={changeOctave} />
      </div>
      <PianoKeys notes={notes} active={active} onPress={press} onRelease={release} />
    </main>
  )
}

export default App
```

The state holds only the id of the instrument (`'piano'`), because the radio buttons work with it too; `find` looks up
the object that belongs to it at every drawing. So the hook always gets the current instrument. Notes started from the
computer keyboard use it too, thanks to the Effect Event: `handleKeyDown` always calls the latest drawing's `press`,
and that one calls the latest `synth`.

:::check Check
Above the keys there are four sounds: Piano, Organ, Synth, Flute, with Piano chosen. Choose Organ and play: a buzzier,
hollower sound. Synth is the sharpest, Flute the softest. Notes played with the computer keys and with the mouse both
use the new sound. If a note is sounding while you switch sounds, it finishes with the old one, and the next one comes
with the new one. The intermediate level is done: commit it!
:::

:::mistake Common mistake
Forgetting to hand over the instrument: `useSynth()` instead of `useSynth(instrument)`. The keys stay silent, and the
console says at every key press: "Cannot read properties of undefined (reading 'wave')". The hook's `instrument`
parameter is `undefined` then.
:::

:::try Try it
Misspell the name of a waveform on purpose, for example `'sqare'`. The browser doesn't accept it: a warning appears in
the console saying that it isn't a valid `OscillatorType`, and the oscillator plays the default sine shape. Then fix
it.
:::

## Advanced level {level=3}

### Sound synthesis: envelope and filter

So far the sounds differ only in their waveform, but a piano also sounds like a piano because of the way its sound
changes over time: it is loudest at the moment the key is struck, then slowly dies away, even if you keep holding the key. An
organ sounds evenly for as long as you hold it, and a flute starts softly, with a short delay. The shape of the volume
over time is the [[envelope]], and synthesizers describe it with four numbers ([[ADSR]]):

- **Attack**: how many seconds it takes the note to reach its peak after the key is struck.
- **Decay**: how long it takes to fall from the peak to the held level.
- **Sustain**: how loud it keeps sounding while you hold the key, as a part of the peak (between 0 and 1). The piano's
  is 0: the note dies away by itself.
- **Release**: how long it takes to fade out after the key is let go.

The second tool is a [[low-pass filter]], the Web Audio `BiquadFilterNode`. It lets through the part below a given
frequency and damps the part above it: the sharp, harsh overtones of the square and the sawtooth become more pleasant.
It changes nothing on a sine wave, which has no overtones.

The third is a [[compressor]] (`DynamicsCompressorNode`). When five notes sound at once, their volumes add up and can go
past the sound card's limit: then the sound crackles (this is called [[clipping]]). The compressor turns the too-loud
moments down. The whole studio needs only one, on the shared output, so the hook keeps it in another ref.

The instruments get new fields. Replace `src/instruments.js`:

```js file=src/instruments.js mark=1-2,4-7
// The instrument sounds: waveform, envelope and filter. attack, decay and release are in seconds,
// sustain is a part of the peak volume (between 0 and 1), filter is in hertz.
export const INSTRUMENTS = [
  { id: 'piano', label: 'Piano', wave: 'triangle', attack: 0.005, decay: 1.2, sustain: 0, release: 0.3, filter: 3500 },
  { id: 'organ', label: 'Organ', wave: 'square', attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.08, filter: 1500 },
  { id: 'synth', label: 'Synth', wave: 'sawtooth', attack: 0.01, decay: 0.4, sustain: 0.5, release: 0.4, filter: 2500 },
  { id: 'flute', label: 'Flute', wave: 'sine', attack: 0.1, decay: 0.2, sustain: 0.85, release: 0.25, filter: 6000 },
]
```

And the hook uses them. Here is the whole `src/useSynth.js`:

```js file=src/useSynth.js mark=3-4,9-11,16-21,38-41,43,46-47,49-52,54,57-58,60-62,65,70,73,75
import { useEffect, useRef } from 'react'

// The peak volume of one note. In a chord several notes add up: the compressor catches that.
const PEAK = 0.3

function useSynth(instrument) {
  // The sound studio (AudioContext). It is made at the first key press, and after that we always use the same one.
  const contextRef = useRef(null)
  // The shared output: every note flows in here, and from here to the speakers.
  const outputRef = useRef(null)
  // The notes sounding now: MIDI number → { oscillator, gain, release }.
  const voicesRef = useRef(new Map())

  function getContext() {
    if (contextRef.current === null) {
      const context = new AudioContext()
      // The compressor turns the too-loud moments down, so no chord crackles.
      const compressor = context.createDynamicsCompressor()
      compressor.connect(context.destination)
      contextRef.current = context
      outputRef.current = compressor
    }
    // If the browser has paused the studio, we start it again.
    if (contextRef.current.state === 'suspended') contextRef.current.resume()
    return contextRef.current
  }

  // A note starts, and sounds until stop silences it.
  function start(note) {
    const context = getContext()
    stop(note) // if this note is still sounding, we silence it first
    const now = context.currentTime

    const oscillator = context.createOscillator()
    oscillator.type = instrument.wave
    oscillator.frequency.value = note.frequency

    // Low-pass filter: lets the low part through, and softens the harsh high overtones.
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = instrument.filter

    // Envelope: a rise (attack) to the peak, then a fall (decay) to the held level (sustain).
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.setTargetAtTime(PEAK, now, instrument.attack / 3)
    gain.gain.setTargetAtTime(PEAK * instrument.sustain, now + instrument.attack, instrument.decay / 3)

    // Oscillator → filter → volume → compressor → speakers
    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(outputRef.current)
    oscillator.start(now)
    voicesRef.current.set(note.midi, { oscillator, gain, release: instrument.release })
  }

  // Release: we cancel the fall that hasn't started yet, and fade out from wherever the volume is now.
  function fadeOut(voice, seconds) {
    const now = contextRef.current.currentTime
    voice.gain.gain.cancelScheduledValues(now)
    voice.gain.gain.setTargetAtTime(0, now, seconds / 3)
    voice.oscillator.stop(now + seconds * 2)
  }

  // A note stops, if it is sounding, with its instrument's own release time.
  function stop(note) {
    const voice = voicesRef.current.get(note.midi)
    if (voice === undefined) return
    voicesRef.current.delete(note.midi)
    fadeOut(voice, voice.release)
  }

  // Every note stops quickly (for example when the window loses the focus).
  function stopAll() {
    voicesRef.current.forEach((voice) => fadeOut(voice, 0.05))
    voicesRef.current.clear()
  }

  // When the component goes away, we close the studio too.
  useEffect(() => {
    return () => {
      voicesRef.current.clear()
      if (contextRef.current !== null) contextRef.current.close()
      contextRef.current = null
    }
  }, [])

  return { start, stop, stopAll }
}

export default useSynth
```

What is new, line by line:

- `getContext` makes the compressor together with the studio, and connects it to the speakers. `outputRef` keeps it:
  every note flows in here instead of the `destination`.
- The audio graph is one link longer: oscillator → filter → volume → compressor. The filter's `frequency` setting is
  the cutoff point, the instrument's `filter` field.
- The first two parts of the envelope are programmed together, at the key press, with two `setTargetAtTime` calls. The
  first one starts now and heads for the peak (`PEAK`); the second one starts `attack` seconds later and heads for the
  held level (`PEAK * instrument.sustain`). The "cooling tea" from the beginner level gets about 95% of the way in three
  time constants, so we give `attack / 3` and `decay / 3`: this way the rise takes about `attack` seconds, and the fall
  about `decay` seconds.
- Releasing is the job of `fadeOut`. If the player lets go of the key while the note is still rising, the fall is still
  scheduled for the future: the note would fade, then come back to the held level when the fall begins.
  `cancelScheduledValues(now)` deletes every change scheduled from now on. Whatever has already begun stays, so the
  fading starts from wherever the volume is at the moment, and reaches silence in `seconds` seconds.
- `voicesRef` remembers each note's release time too (`release`): if you switch sounds meanwhile, a sounding note fades
  with its own. `stopAll`, however, silences everything within 0.05 seconds.

:::check Check
Piano: hold a key down; the note starts strong and dies away by itself in about a second, even if you don't let go.
Organ: it sounds evenly while you hold it, and stops almost at once when you let go. Flute: it starts softly, rising
for a moment. Synth is bright, but not as harsh as in the previous level. Press five computer keys at once: the chord
sounds clean, without crackling.
:::

:::mistake Common mistake
`voicesRef.current.forEach(fadeOut)`, without the arrow function. It looks shorter, but a Map's `forEach` hands over
two values: the note and its key. So `fadeOut` gets the MIDI number as `seconds`: a note of 60 fades with a time
constant of 20 seconds, for two minutes. The keys go dark, but the notes go on droning for a long time.
:::

:::try Try it
Retune the instruments: give the piano a `decay` of 3 (it rings for long), the organ an `attack` of 0.5 (it "swells"
slowly), the synth a `filter` of 500 (muffled, as if it played behind a wall). You can invent a fifth sound too, for
example a plucked one: `sawtooth`, a very short `decay`, a `sustain` of 0.
:::

### Recording and playback

The recorder doesn't record sound; it records what the player does: which note was pressed when, and when it was let
go. One such [[event|note event]] is three pieces of data: `time` (how many milliseconds after the recording started), `type`
(`'on'` for a press, `'off'` for letting go) and `midi` (which note). To play it back, we "perform" the same events
again, with the same gaps. This is how MIDI works too: a song is not sound but a list of events.

Time is measured by [[performance.now]]: it gives you, in milliseconds, how much time has passed since the page loaded,
and unlike `Date.now()` it doesn't jump when someone changes the computer's clock meanwhile.

While recording, we collect the events in a ref. Every key press adds one more, but nothing has to be drawn again
because of it. When the recording ends, the finished recording, a [[take]] as musicians call it (`take`), goes into
state, because it shows on the screen: we say how many notes it has, and switch on the "Play back" button.

Playback is an effect that depends on the `playing` state. When it becomes `true`, the effect starts a `setTimeout`
(lesson 13) for every event. Its cleanup function stops the timers and silences the notes still sounding: whether
`playing` became `false` again through the "Stop" button or at the end of the take. Create the file
`src/useRecorder.js`:

```js file=src/useRecorder.js
import { useEffect, useEffectEvent, useRef, useState } from 'react'

// Recorder: it doesn't record sound but events: when (milliseconds), what ('on' or 'off'), which note.
function useRecorder(onEvent) {
  const [recording, setRecording] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [take, setTake] = useState(null) // the last take: { events, duration }, or null
  const startRef = useRef(0) // when the recording started
  const eventsRef = useRef([]) // the events collected while recording

  function log(type, midi) {
    if (!recording) return
    // Letting go before the first note is not written down.
    if (type === 'off' && eventsRef.current.length === 0) return
    eventsRef.current.push({ time: performance.now() - startRef.current, type, midi })
  }

  function startRecording() {
    eventsRef.current = []
    startRef.current = performance.now()
    setRecording(true)
  }

  function stopRecording() {
    setRecording(false)
    const events = eventsRef.current
    if (events.length === 0) return
    // The take should start with the first note, not with the button press.
    const offset = events[0].time
    setTake({
      events: events.map((event) => ({ ...event, time: event.time - offset })),
      duration: performance.now() - startRef.current - offset,
    })
  }

  function play() {
    setPlaying(true)
  }

  function stop() {
    setPlaying(false)
  }

  // During playback the notes sound through this; it always calls the freshest onEvent.
  const playEvent = useEffectEvent((type, midi) => onEvent(type, midi))

  // Playback: a timer for every event. The cleanup stops them, and silences whatever is still sounding.
  useEffect(() => {
    if (!playing) return
    const sounding = new Set()
    const timers = take.events.map((event) =>
      setTimeout(() => {
        if (event.type === 'on') sounding.add(event.midi)
        else sounding.delete(event.midi)
        playEvent(event.type, event.midi)
      }, event.time),
    )
    timers.push(setTimeout(() => setPlaying(false), take.duration))
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      sounding.forEach((midi) => playEvent('off', midi))
    }
  }, [playing, take])

  return { recording, playing, take, log, startRecording, stopRecording, play, stop }
}

export default useRecorder
```

- `log` is called at every key press and every letting go, but it only writes something down while recording.
  Letting go before the first note (of a key pressed before the recording started, say) isn't needed.
- `stopRecording` cuts the silence off the start of the take: the time of the first event (`offset`) is taken off every
  event, so the playback starts right with the first note. `{ ...event, time: … }` is the spread you know: a copy with a
  new `time`. `duration` is the whole length of the take, from the first note to the stop.
- `playEvent` is an Effect Event, like at the keyboard: the `onEvent` prop is a new function at every drawing, but the
  effect doesn't have to start again because of it, and still it always calls the freshest one (with the instrument
  chosen right now, for example).
- In the effect, `sounding` is a [[Set]] (lesson 3): the notes the playback started but hasn't silenced yet. If the
  cleanup comes in the middle, it silences them; otherwise they would get stuck. The last timer sets `playing` to
  `false` at the end of the take, and that runs the cleanup.

The control panel goes into the file `src/components/RecorderPanel.jsx`:

```jsx file=src/components/RecorderPanel.jsx
function RecorderPanel({ recorder }) {
  const { recording, playing, take } = recorder

  let status = 'Press Record, play a melody, stop the recording, then play it back.'
  if (recording) {
    status = 'Recording: play something!'
  } else if (take !== null) {
    const count = take.events.filter((event) => event.type === 'on').length
    const seconds = (take.duration / 1000).toLocaleString('en-GB', { maximumFractionDigits: 1 })
    status = `Take ready. Notes: ${count}, length: ${seconds} s.`
  }

  return (
    <section className="panel">
      <h2>Recorder</h2>
      <div className="panel__buttons">
        {recording ? (
          <button type="button" className="button button--primary is-recording" onClick={recorder.stopRecording}>
            <span className="rec-dot" aria-hidden="true" />
            Stop recording
          </button>
        ) : (
          <button type="button" className="button" onClick={recorder.startRecording} disabled={playing}>
            <span className="rec-dot" aria-hidden="true" />
            Record
          </button>
        )}
        {playing ? (
          <button type="button" className="button" onClick={recorder.stop}>
            Stop
          </button>
        ) : (
          <button type="button" className="button" onClick={recorder.play} disabled={take === null || recording}>
            Play back
          </button>
        )}
      </div>
      <p className="panel__status" role="status">
        {status}
      </p>
    </section>
  )
}

export default RecorderPanel
```

The panel gets the whole `recorder` object, and its buttons call the hook's functions. `toLocaleString('en-GB', …)`
writes the seconds the British way, with a decimal point (at most one decimal). The red dot is invisible to screen
readers because of `aria-hidden`, and while recording, the CSS makes it blink.

In `App` two things have to be separated: making a note sound, and the player's move. What the player plays sounds
**and** goes into the recording; what the playback plays only sounds, otherwise the take would record itself again. So
the old `press` and `release` are renamed to `noteOn` and `noteOff`, and a new `press` and `release` are made that tell
the recorder as well as making the sound. `makeNote` is needed too, because the take only keeps MIDI numbers. Here is
the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=2,5,9,29,35,40-44,46-50,52-55,123
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { COMPUTER_KEYS, makeNote, makeNotes } from './notes.js'
import { INSTRUMENTS } from './instruments.js'
import useSynth from './useSynth.js'
import useRecorder from './useRecorder.js'
import PianoKeys from './components/PianoKeys.jsx'
import OctaveSwitch from './components/OctaveSwitch.jsx'
import InstrumentPicker from './components/InstrumentPicker.jsx'
import RecorderPanel from './components/RecorderPanel.jsx'
import './App.css'

const LOWEST_OCTAVE = 2
const HIGHEST_OCTAVE = 6

function App() {
  const [instrumentId, setInstrumentId] = useState('piano')
  // The data of the chosen instrument, found by its id.
  const instrument = INSTRUMENTS.find((item) => item.id === instrumentId)
  const synth = useSynth(instrument)
  // The MIDI numbers of the notes sounding now: these keys light up.
  const [active, setActive] = useState([])
  const [octave, setOctave] = useState(4)
  // The 13 keys on the screen: worked out from the octave at every drawing.
  const notes = makeNotes(octave)
  // Which computer key started which note (event.code → note).
  const heldRef = useRef(new Map())

  // A note starts, and its key lights up.
  function noteOn(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // A note stops, and its key goes dark.
  function noteOff(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  // During playback the recorded notes sound, but they don't go into the recording again.
  const recorder = useRecorder((type, midi) => {
    if (type === 'on') noteOn(makeNote(midi))
    else noteOff(makeNote(midi))
  })

  // What the player plays: it sounds, and if a recording is on, it goes into the recording.
  function press(note) {
    noteOn(note)
    recorder.log('on', note.midi)
  }

  function release(note) {
    noteOff(note)
    recorder.log('off', note.midi)
  }

  function changeOctave(value) {
    // Math.max and Math.min: the octave can't go past the limits.
    setOctave(Math.min(HIGHEST_OCTAVE, Math.max(LOWEST_OCTAVE, value)))
  }

  // Which note belongs to this computer key? If none, undefined.
  function noteFor(code) {
    const index = COMPUTER_KEYS.findIndex((key) => key.code === code)
    return index === -1 ? undefined : notes[index]
  }

  // The computer keyboard plays too. An Effect Event always sees the variables of the latest drawing.
  const handleKeyDown = useEffectEvent((event) => {
    // A held key must not start again; Ctrl, Alt and Cmd combinations belong to the browser.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // Z and X (codes KeyZ and KeyX): change the octave.
    if (event.code === 'KeyZ') {
      changeOctave(octave - 1)
      return
    }
    if (event.code === 'KeyX') {
      changeOctave(octave + 1)
      return
    }
    const note = noteFor(event.code)
    if (note === undefined) return
    event.preventDefault()
    heldRef.current.set(event.code, note) // remember which note this key started
    press(note)
  })

  const handleKeyUp = useEffectEvent((event) => {
    // Stop the note this key started, even if the octave has changed since.
    const note = heldRef.current.get(event.code)
    if (note === undefined) return
    heldRef.current.delete(event.code)
    release(note)
  })

  // When the window loses the focus (Alt+Tab, for example), we won't see the keys let go: every note stops.
  const handleBlur = useEffectEvent(() => {
    heldRef.current.clear()
    synth.stopAll()
    setActive([])
  })

  // The listeners are added once, and the cleanup removes them.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <div className="controls">
        <InstrumentPicker value={instrumentId} onChange={setInstrumentId} />
        <OctaveSwitch octave={octave} min={LOWEST_OCTAVE} max={HIGHEST_OCTAVE} onChange={changeOctave} />
      </div>
      <PianoKeys notes={notes} active={active} onPress={press} onRelease={release} />
      <RecorderPanel recorder={recorder} />
    </main>
  )
}

export default App
```

The code of the keys, the computer keyboard and `handleBlur` hasn't changed: they still call `press` and `release`, only now
those tell the recorder too. `useRecorder` gets an arrow function that makes a note from the MIDI number with
`makeNote`, and calls `noteOn` or `noteOff`.

:::check Check
The Recorder panel appears under the keys; the "Play back" button is still grey. Click "Record": the button turns solid
green and says "Stop recording", and the red dot blinks. Wait a little, play a short melody, and press "Stop recording": the panel tells you how many notes
and how many seconds the take has. "Play back" plays it with the same rhythm, without the silence at the start, and the
keys light up meanwhile. "Stop" silences it at once. If you switch sounds before playing back, the take plays with the
new sound.
:::

:::mistake Common mistake
Leaving `clearTimeout` out of the cleanup function. The "Stop" button changes its label back, but the notes keep coming
until the end of the take, because the timers have already been started and nobody stops them. If you press "Play
back" again meanwhile, two takes play on top of each other.
:::

:::try Task
Show, while recording, how many notes you have played so far. Add a `count` state to `useRecorder`: `startRecording`
sets it to 0, and `log` adds one at every `'on'` event (`setCount((current) => current + 1)`). Return it from the hook
and put it in the panel's status, with a template literal: `Recording: ${recorder.count} notes so far.` Why not simply
`eventsRef.current.length`? It counts the letting-go events too, and a change in a ref never draws again: here the
number would only seem to move because every key press also changes `active`, and that draws `App` again by chance.
:::

### A MIDI keyboard

Since 1983, MIDI has been the common language of instruments. A MIDI keyboard doesn't make sound; it only sends
messages to the computer, and each message is just a few numbers. The two most important ones:

- Note on (a key is pressed): `[144, note, velocity]`. The note is the MIDI number (just like our `midi` field), and
  the velocity, from 1 to 127, tells you how hard the key was struck.
- Note off (a key is let go): `[128, note, velocity]`. Many keyboards send letting go as a note on with velocity 0.

One MIDI cable can carry 16 separate [[MIDI channels|MIDI channel]] (one for each instrument, for example), and the
first number also says which channel the message comes from: a note on can be anything from 144 to 159 (144 is the
first channel, 145 the second…), a note off from 128 to 143.

In the browser the [[Web MIDI API]] reads these messages. `navigator.requestMIDIAccess()` asks for permission to
access them; Chrome asks the user at this point. It returns a [[Promise]] (lesson 3): if the user allows it, we get a
`MIDIAccess` object, whose `inputs` field lists the connected devices. Every device has an `onmidimessage` field: the
function put there runs at every message. This is an older way of listening to events; a device can have one such
listener at a time, and setting a new one replaces the old. When something is plugged in or out, the `onstatechange`
function of `MIDIAccess` runs.

Chrome, Edge and Firefox know the Web MIDI API; Safari doesn't. So first we check whether
`navigator.requestMIDIAccess` exists at all. And we ask for permission only when the user clicks "Connect": a page
shouldn't ask questions at load time about something the visitor may not even want. Create the file
`src/useMidi.js`:

```js file=src/useMidi.js
import { useEffect, useEffectEvent, useState } from 'react'

// A MIDI keyboard with the Web MIDI API. onNoteOn and onNoteOff get the note's MIDI number.
function useMidi(onNoteOn, onNoteOff) {
  const [access, setAccess] = useState(null) // the browser's permission (MIDIAccess), or null
  const [status, setStatus] = useState('idle') // 'idle', 'asking', 'ready' or 'denied'
  const [devices, setDevices] = useState([]) // the names of the connected keyboards
  const supported = 'requestMIDIAccess' in navigator

  async function connect() {
    setStatus('asking')
    try {
      setAccess(await navigator.requestMIDIAccess())
      setStatus('ready')
    } catch {
      setStatus('denied')
    }
  }

  // A MIDI message is three numbers: [command, note, velocity].
  const handleMessage = useEffectEvent((message) => {
    const [command, midi, velocity] = message.data
    // 144–159: a key was pressed (on one of the 16 channels), 128–143: it was let go.
    // Many keyboards send letting go as a press with velocity 0.
    if (command >= 144 && command <= 159 && velocity > 0) onNoteOn(midi)
    else if (command >= 128 && command <= 159) onNoteOff(midi)
  })

  // We listen to every connected keyboard, and to something being plugged in or out.
  useEffect(() => {
    if (access === null) return
    function listen() {
      const inputs = [...access.inputs.values()].filter((input) => input.state === 'connected')
      inputs.forEach((input) => {
        input.onmidimessage = handleMessage
      })
      setDevices(inputs.map((input) => input.name))
    }
    listen()
    access.onstatechange = listen
    return () => {
      access.onstatechange = null
      access.inputs.forEach((input) => {
        input.onmidimessage = null
      })
    }
  }, [access])

  return { supported, status, devices, connect }
}

export default useMidi
```

- `'requestMIDIAccess' in navigator` is true when the browser knows the function. It is not state: it gives the same
  answer at every drawing.
- `connect` is an `async` function (lesson 3): `await` waits for the user's answer. If they say no (or the browser
  doesn't allow it), the `catch` branch runs.
- `message.data` holds the numbers of the message. `const [command, midi, velocity] = …` takes them apart into three
  variables, the way we do with the pair from `useState`. Because of the `velocity > 0` check, a note on with velocity
  0 counts as letting go. Every other message (the keyboard's clock signal, for example, which arrives many times a
  second) is ignored by the two `if`s.
- The effect runs when the permission (`access`) arrives. `inputs` is a Map-like collection: `values()` gives the
  devices, `[...]` turns them into an array, and `filter` keeps only the connected ones. Each of them gets
  `handleMessage`, and their names go into the `devices` state. `listen` also runs on `onstatechange`, so a keyboard
  plugged in later works at once too. The cleanup function removes every listener.
- `handleMessage` is an Effect Event, because it has to call the current `onNoteOn` and `onNoteOff`.

The panel goes into the file `src/components/MidiPanel.jsx`:

```jsx file=src/components/MidiPanel.jsx
function MidiPanel({ midiInput }) {
  const { supported, status, devices } = midiInput

  let message = 'Have a MIDI keyboard? Connect it to the computer and click the button.'
  if (!supported) message = 'This browser does not know the Web MIDI API. Try it in Chrome, Edge or Firefox.'
  else if (status === 'asking') message = 'Waiting for permission…'
  else if (status === 'denied') message = 'The browser did not allow access to MIDI.'
  else if (status === 'ready' && devices.length === 0) message = 'No MIDI keyboard is connected. Plug one in, and you can play right away.'
  else if (status === 'ready') message = `Connected: ${devices.join(', ')}`

  return (
    <section className="panel">
      <h2>MIDI keyboard</h2>
      {supported && status !== 'ready' && (
        <div className="panel__buttons">
          <button type="button" className="button" onClick={midiInput.connect} disabled={status === 'asking'}>
            Connect
          </button>
        </div>
      )}
      <p className="panel__status" role="status">
        {message}
      </p>
    </section>
  )
}

export default MidiPanel
```

Finally `App`. Add the two new files to the imports: `import useMidi from './useMidi.js'` and
`import MidiPanel from './components/MidiPanel.jsx'`. Call the hook after the `release` function. A MIDI keyboard is
the player's hand just like the mouse, so it calls `press` and `release`, and that way it goes into the recording too:

```jsx file=src/App.jsx mark=6-10
  function release(note) {
    noteOff(note)
    recorder.log('off', note.midi)
  }

  // The notes of a MIDI keyboard sound just like those of the mouse or the computer keys.
  const midiInput = useMidi(
    (midi) => press(makeNote(midi)),
    (midi) => release(makeNote(midi)),
  )
```

And the MIDI panel goes under the recorder's panel:

```jsx file=src/App.jsx mark=2
      <RecorderPanel recorder={recorder} />
      <MidiPanel midiInput={midiInput} />
```

:::check Check
The MIDI keyboard panel appears under the Recorder. If you have no MIDI keyboard, click "Connect" and allow the access:
the panel says that no keyboard is connected; the rest of the piano works just the same. If you have one, plug it in
over USB: the panel shows its name, its keys play the piano, and the keys of the visible octave light up as well. In
Safari the panel says that the browser doesn't know the Web MIDI API.
:::

:::mistake Common mistake
Checking only for `command === 144`. It works on the first channel, but a keyboard set to another channel stays silent,
and even worse: nobody notices letting go (when it comes as 128 or as a 144 with velocity 0), so the notes get stuck.
Both ranges, and velocity 0, have to be checked.
:::

:::try Try it
Write `console.log(message.data)` into the first line of `handleMessage`. Press keys, move the pitch wheel or press
the sustain pedal (if you have one): the pedal, for example, sends a `[176, 64, 127]` message. Then delete the line.
:::

### Melody teaching mode

The last feature is a teacher: you choose a melody, and the key of the next note lights up in gold. If you hit it, the
next one comes; if you miss, the mistake counter goes up. The melodies are in the `src/melodies.js` file that came
with the exercise: each has an `id`, a `title` and a `notes` array of MIDI numbers.

The state of a practice is an object: which melody (`melody`), which of its notes we are at (`position`), and how many
mistakes there were (`mistakes`), or `null` when we aren't practising. The next note (`target`) can be worked out from
it: a derived value again. Create the file `src/useMelodyCoach.js`:

```js file=src/useMelodyCoach.js
import { useState } from 'react'

// Melody teacher: which melody we practise, which of its notes we are at, and how many mistakes we made.
function useMelodyCoach() {
  const [practice, setPractice] = useState(null) // { melody, position, mistakes }, or null

  function choose(melody) {
    setPractice(melody === undefined ? null : { melody, position: 0, mistakes: 0 })
  }

  // We check every note played. The updater function always works from the freshest state.
  function check(midi) {
    setPractice((current) => {
      if (current === null || current.position === current.melody.notes.length) return current
      if (current.melody.notes[current.position] === midi) return { ...current, position: current.position + 1 }
      return { ...current, mistakes: current.mistakes + 1 }
    })
  }

  // The next note (this one glows gold), or undefined if we aren't practising, or reached the end.
  const target = practice === null ? undefined : practice.melody.notes[practice.position]

  return { practice, target, choose, check }
}

export default useMelodyCoach
```

`check` uses the updater function. Two notes can arrive almost at once from a MIDI keyboard, faster than React draws
again: this way the second one sees the freshest state too, not the one before the first. When we reach the end,
`practice.melody.notes[practice.position]` points past the end of the array and gives `undefined`: then no key glows.

The panel chooses a melody from a drop-down list. The `<select>` is a controlled input, like the slider of lesson 3:
its value is the `id` of the chosen melody (or `''` if there is none), and every change calls the `onChoose` prop. The
notes of the melody appear in a list too, the finished ones green, the next one gold. Create the file
`src/components/MelodyCoach.jsx`:

```jsx file=src/components/MelodyCoach.jsx
import { MELODIES } from '../melodies.js'
import { makeNote } from '../notes.js'

function MelodyCoach({ practice, onChoose }) {
  let status = 'Choose a melody: the key of the next note glows gold.'
  if (practice !== null) {
    const { melody, position, mistakes } = practice
    if (position === melody.notes.length) {
      status = `Well done, you played it all! Mistakes: ${mistakes}.`
    } else {
      status = `${position} / ${melody.notes.length} notes done. Mistakes: ${mistakes}.`
    }
  }

  return (
    <section className="panel">
      <h2>Melody teacher</h2>
      <label className="panel__field">
        Melody
        <select
          className="select"
          value={practice === null ? '' : practice.melody.id}
          onChange={(event) => onChoose(event.target.value)}
        >
          <option value="">None, free play</option>
          {MELODIES.map((melody) => (
            <option key={melody.id} value={melody.id}>
              {melody.title}
            </option>
          ))}
        </select>
      </label>
      {practice !== null && (
        <>
          <ol className="melody" aria-label="The notes of the melody">
            {practice.melody.notes.map((midi, index) => {
              let className = ''
              if (index < practice.position) className = 'is-done'
              if (index === practice.position) className = 'is-next'
              return (
                <li key={index} className={className}>
                  {makeNote(midi).name}
                </li>
              )
            })}
          </ol>
          <div className="panel__buttons">
            <button type="button" className="button" onClick={() => onChoose(practice.melody.id)}>
              Start again
            </button>
          </div>
        </>
      )}
      <p className="panel__status" role="status">
        {status}
      </p>
    </section>
  )
}

export default MelodyCoach
```

In this list, for once, `index` is the `key`. The same note comes again and again in a melody (E, E, F, G…), so the
MIDI number isn't unique. But while you practise a melody, the list never gets reordered, and no item is added or
removed: only the class names change. Then the position is a good key. The `<>…</>` [[Fragment]] (lesson 9) is needed around the list and the button, because only one element can
stand after `&&`.

The keyboard gets a `hint` prop, the MIDI number of the next note. The key that plays this note gets the `is-hint`
class, and the CSS lights it up in gold. Here is the whole `src/components/PianoKeys.jsx`:

```jsx file=src/components/PianoKeys.jsx mark=3,10
import { COMPUTER_KEYS } from '../notes.js'

function PianoKeys({ notes, active, hint, onPress, onRelease }) {
  // Because of onContextMenu, a right-click (or a long touch) does not open a menu on the keys.
  return (
    <div className="keys" onContextMenu={(event) => event.preventDefault()}>
      {notes.map((note, index) => {
        let className = note.black ? 'key key--black' : 'key key--white'
        if (active.includes(note.midi)) className += ' is-active'
        if (note.midi === hint) className += ' is-hint'
        const label = COMPUTER_KEYS[index].label
        return (
          <button
            key={note.midi}
            type="button"
            className={className}
            aria-label={`${note.name}, key ${label}`}
            onPointerDown={() => onPress(note)}
            onPointerUp={() => onRelease(note)}
            onPointerLeave={(event) => {
              // Only if the mouse slid off it with a button held down.
              if (event.buttons > 0) onRelease(note)
            }}
          >
            <kbd className="key__label">{label}</kbd>
            {!note.black && <span className="key__name">{note.name}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default PianoKeys
```

`App` calls the hook and checks every note the player plays with it: that is why it goes into `press`, not into
`noteOn` (a played-back recording won't practise for you). Choosing a melody switches to octave 4, because every melody
is there, so the gold key is sure to be visible. Here is the whole, finished `src/App.jsx`:

```jsx file=src/App.jsx mark=4,8,14,50,52,56,75-79,141,144
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { COMPUTER_KEYS, makeNote, makeNotes } from './notes.js'
import { INSTRUMENTS } from './instruments.js'
import { MELODIES } from './melodies.js'
import useSynth from './useSynth.js'
import useRecorder from './useRecorder.js'
import useMidi from './useMidi.js'
import useMelodyCoach from './useMelodyCoach.js'
import PianoKeys from './components/PianoKeys.jsx'
import OctaveSwitch from './components/OctaveSwitch.jsx'
import InstrumentPicker from './components/InstrumentPicker.jsx'
import RecorderPanel from './components/RecorderPanel.jsx'
import MidiPanel from './components/MidiPanel.jsx'
import MelodyCoach from './components/MelodyCoach.jsx'
import './App.css'

const LOWEST_OCTAVE = 2
const HIGHEST_OCTAVE = 6

function App() {
  const [instrumentId, setInstrumentId] = useState('piano')
  // The data of the chosen instrument, found by its id.
  const instrument = INSTRUMENTS.find((item) => item.id === instrumentId)
  const synth = useSynth(instrument)
  // The MIDI numbers of the notes sounding now: these keys light up.
  const [active, setActive] = useState([])
  const [octave, setOctave] = useState(4)
  // The 13 keys on the screen: worked out from the octave at every drawing.
  const notes = makeNotes(octave)
  // Which computer key started which note (event.code → note).
  const heldRef = useRef(new Map())

  // A note starts, and its key lights up.
  function noteOn(note) {
    synth.start(note)
    setActive((current) => (current.includes(note.midi) ? current : [...current, note.midi]))
  }

  // A note stops, and its key goes dark.
  function noteOff(note) {
    synth.stop(note)
    setActive((current) => (current.includes(note.midi) ? current.filter((midi) => midi !== note.midi) : current))
  }

  // During playback the recorded notes sound, but they don't go into the recording again.
  const recorder = useRecorder((type, midi) => {
    if (type === 'on') noteOn(makeNote(midi))
    else noteOff(makeNote(midi))
  })
  const coach = useMelodyCoach()

  // What the player plays: it sounds, goes into the recording, and the melody teacher checks it too.
  function press(note) {
    noteOn(note)
    recorder.log('on', note.midi)
    coach.check(note.midi)
  }

  function release(note) {
    noteOff(note)
    recorder.log('off', note.midi)
  }

  // The notes of a MIDI keyboard sound just like those of the mouse or the computer keys.
  const midiInput = useMidi(
    (midi) => press(makeNote(midi)),
    (midi) => release(makeNote(midi)),
  )

  function changeOctave(value) {
    // Math.max and Math.min: the octave can't go past the limits.
    setOctave(Math.min(HIGHEST_OCTAVE, Math.max(LOWEST_OCTAVE, value)))
  }

  function chooseMelody(id) {
    // The value of the "None, free play" option is '': find finds no melody for it, so it is undefined, and the practice ends.
    coach.choose(MELODIES.find((melody) => melody.id === id))
    setOctave(4) // every melody is in octave 4
  }

  // Which note belongs to this computer key? If none, undefined.
  function noteFor(code) {
    const index = COMPUTER_KEYS.findIndex((key) => key.code === code)
    return index === -1 ? undefined : notes[index]
  }

  // The computer keyboard plays too. An Effect Event always sees the variables of the latest drawing.
  const handleKeyDown = useEffectEvent((event) => {
    // A held key must not start again; Ctrl, Alt and Cmd combinations belong to the browser.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // Z and X (codes KeyZ and KeyX): change the octave.
    if (event.code === 'KeyZ') {
      changeOctave(octave - 1)
      return
    }
    if (event.code === 'KeyX') {
      changeOctave(octave + 1)
      return
    }
    const note = noteFor(event.code)
    if (note === undefined) return
    event.preventDefault()
    heldRef.current.set(event.code, note) // remember which note this key started
    press(note)
  })

  const handleKeyUp = useEffectEvent((event) => {
    // Stop the note this key started, even if the octave has changed since.
    const note = heldRef.current.get(event.code)
    if (note === undefined) return
    heldRef.current.delete(event.code)
    release(note)
  })

  // When the window loses the focus (Alt+Tab, for example), we won't see the keys let go: every note stops.
  const handleBlur = useEffectEvent(() => {
    heldRef.current.clear()
    synth.stopAll()
    setActive([])
  })

  // The listeners are added once, and the cleanup removes them.
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return (
    <main className="app">
      <h1>Musical Instrument</h1>
      <div className="controls">
        <InstrumentPicker value={instrumentId} onChange={setInstrumentId} />
        <OctaveSwitch octave={octave} min={LOWEST_OCTAVE} max={HIGHEST_OCTAVE} onChange={changeOctave} />
      </div>
      <PianoKeys notes={notes} active={active} hint={coach.target} onPress={press} onRelease={release} />
      <RecorderPanel recorder={recorder} />
      <MidiPanel midiInput={midiInput} />
      <MelodyCoach practice={coach.practice} onChoose={chooseMelody} />
    </main>
  )
}

export default App
```

:::check Check
The Melody teacher appears at the bottom. Choose "Ode to Joy": octave 4 is shown, the E key glows gold, and the panel
lists every note of the melody, with the first one highlighted. Play the E (with the mouse, the ++D++ key or over
MIDI): in the list the first E turns green, and the second E is next. Because that is an E too, the gold key stays
where it is this time; it moves on at the F. If you miss, the number of mistakes goes up and the gold key stays.
At the end the panel congratulates you and shows the number of mistakes; "Start again" starts over, and "None, free
play" switches the teacher off. Congratulations, your instrument is finished!
:::

:::mistake Common mistake
Putting `coach.check` into `noteOn` instead of `press`. Then the playback "practises" too: record the melody, play it
back, and the teacher thinks you played it without a mistake. And if the take is a different melody, every one of its
notes counts as a mistake.
:::

:::try Task
Add your favourite melody to `src/melodies.js` as a new object (with MIDI numbers; the top of the file tells you which
number is which note). If one of its notes is outside octave 4, the teacher can't show it: think about how
`chooseMelody` could choose the octave that suits the lowest note of the melody (`Math.min(...melody.notes)`).
:::
