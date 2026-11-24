# What we build

A video player of our own: the Popcorn Player. Browsers can play a video by themselves, but only with their own
buttons, which look different in every browser. This time we draw every control ourselves: play and pause, a seek bar
to jump back and forth, volume, speed, full screen, keyboard shortcuts, and finally a playlist, subtitles, and a player
that remembers where you stopped watching. On the way you learn how React gets hold of a real HTML element, how
JavaScript drives a `<video>` element (`play()`, `pause()`, `currentTime`), and how home-made controls stay usable with
a keyboard and a screen reader.

:::levels
- A video on the page, with a play / pause button of our own and the time played. | about 2 hours
- A seek bar, volume, playback speed, full screen and keyboard shortcuts. | about 3 hours
- A playlist, subtitles, picking up where you left off, and picture-in-picture. | about 3 hours
:::

**Before you start you need:** the earlier lessons. We build mostly on these: `useRef` (lesson 16, the stopwatch and the
typing field; for a DOM element already in lesson 12), keyboard events on the whole window, `preventDefault` and
closures (lessons 7 and 17), custom hooks and `localStorage` (lesson 9), `aria-label` (lesson 12), `formatTime` and
`aria-pressed` (lesson 13). If you did the advanced level of lesson 5, you have already put the camera picture into a
`<video>` element there. Whatever we use in a new way here is explained again.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is the `lessons/18-video-player/exercise` folder of the course repository on GitHub (the
"Exercise on GitHub" button above opens it). You get it the same way as in the earlier lessons, and step 0 of lesson 1
explains every command in detail. In short: open a terminal in your work folder, where the `rika-mentoring` repository
is, bring in the new lessons, then copy this lesson's `exercise` folder out of the repository as `popcorn-player`:

```shell
cd rika-mentoring
git pull        # brings the new lessons
cd ..           # back to your work folder
cp -r rika-mentoring/lessons/18-video-player/exercise popcorn-player
```

No repository yet? Run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the first three lines.
No git? On the [repository's GitHub page](https://github.com/mazsola739/rika-mentoring) choose **Code → Download ZIP**,
and copy the `lessons/18-video-player/exercise` folder out of it into your work folder as `popcorn-player`. The `cp -r`
command works in PowerShell, on a Mac and on Linux; a file manager works too: copy the folder and rename the copy. You
never change the repository itself, so `git pull` keeps working; your copy is your own project.

Open the `popcorn-player` folder in your editor (in VS Code: **File** → **Open Folder**), open a terminal in it
(**Terminal** → **New Terminal**), and start the project:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a light grey page with the title
"Popcorn Player" in big dark letters, and a grey line under it: "A video player with buttons of our own." There is no
video yet: you put it on the page in the next step.
:::

Leave the server running. In a second terminal (the **+** button of the terminal panel), make your copy a git
repository with one commit, the starting point:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

If git asks who you are, step 0 of lesson 1 shows how to give it your name and e-mail.

Four files in the exercise matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so you do not write styles:
  you only use the class names (`player`, `seek`, `volume`, `playlist`, …) that the steps give you. Have a look inside
  anyway!
- `src/Icon.jsx`: small drawn icons for the buttons. You use them like this: `<Icon name="play" />`. The names are
  `play`, `pause`, `replay`, `volume`, `mute`, `fullscreen`, `exitFullscreen`, `captions` and `pip`. The icons are only
  decoration: the buttons get their names from somewhere else, as step 2 shows.
- `src/videos.js`: the address of the lesson's sample clip, in a single line.

```js
export const VIDEO_SRC = 'https://…/media/video-player/rika-sample.mp4'
```

The sample clip is 30 seconds long, has sound, and lives on the Rika Mentoring site: the browser downloads it from
there, so this lesson **needs internet**. If you would rather play a video of your own (or you are offline), create a
`public` folder in the root of the project, next to `src`, copy your video into it (for example as `my-video.mp4`), and
change the address in `videos.js`: `export const VIDEO_SRC = '/my-video.mp4'`. You know the [[public folder]] from
lesson 12: Vite serves everything in it as it is, from the root of the site, so `public/my-video.mp4` is at the address
`/my-video.mp4`. The safest format is [[MP4]] (H.264 video with AAC audio): every browser plays it.

:::concept Your copy is a git repository
As in the earlier lessons: `git restore .` throws away every change since your last commit (new files stay; delete
those by hand). When a step works, commit it: `git add .`, then `git commit -m "A video on the page"`.
:::

### A video on the page

In HTML, the [[video element]], `<video>`, plays videos. Let us start with the simplest version, where the browser's
own controls still do the work. The player gets a component of its own: create a `components` folder in `src`, with a
`VideoPlayer.jsx` file in it:

```jsx file=src/components/VideoPlayer.jsx
function VideoPlayer({ src }) {
  return (
    <div className="player">
      <video className="player__video" src={src} controls preload="metadata" playsInline />
    </div>
  )
}

export default VideoPlayer
```

The attributes of `<video>`:

- `src`: the address of the video file. The component gets it as a prop, so it can play any video.
- `controls`: asks for the browser's own controls (play, timeline, volume, full screen). It has no value, because it is
  a [[boolean attribute]]: being there at all means "yes". In JSX, `controls` is the same as `controls={true}`.
- `preload="metadata"`: for now the browser only downloads the beginning of the file, which tells it the size and the
  length of the video. It starts downloading the whole video only when someone presses play. Your visitors' mobile data
  will thank you.
- `playsInline`: on an iPhone too, the video plays inside the page instead of jumping to full screen at once. In HTML
  it is `playsinline`. In JSX, an attribute made of several words starts every word after the first with a capital
  letter (like `className` or `onClick`), so it becomes `playsInline`. The `aria-…` attributes are the exception: they
  keep their hyphen, as you will see in the next step.

A `<video>` has no content here, so we close it straight away: `<video … />`. The `player` and `player__video` classes
give it the dark frame, the rounded corners and the 16:9 shape.

Now put the player on the page. Change `src/App.jsx` to this (the highlighted lines are new):

```jsx file=src/App.jsx mark=1-2,13
import { VIDEO_SRC } from './videos.js'
import VideoPlayer from './components/VideoPlayer.jsx'
import './App.css'

function App() {
  return (
    <main className="page">
      <header className="page__header">
        <h1>Popcorn Player</h1>
        <p>A video player with buttons of our own.</p>
      </header>

      <VideoPlayer src={VIDEO_SRC} />
    </main>
  )
}

export default App
```

:::check Check
A big video with rounded corners appears under the title, with the browser's own controls along its bottom. Start it:
"Rika Mentoring" stands in front of a wavy background that slowly changes colour, a counter in the bottom right corner
moves on every second ("1 s", "2 s", …), and soft chords play. The video is 30 seconds long.
:::

:::mistake Common mistake
Where the video should be, there is only a black rectangle, and it does not start. The browser could not download the
file: you are offline, or the address has a typo. Open the address from `videos.js` in a new browser tab: if the video
does not come up there either, the address or the connection is to blame. With a video of your own, check that the file
is in the `public` folder (not in `src`), and that its address starts with `/`.
:::

:::try Try it
Delete the `controls` attribute. The picture stays, but the controls disappear, and there is no button left to start
the video. That is exactly our job: from the next step on, our own buttons are in charge. (If you put it back, the browser's
buttons come back too; the next step takes it out anyway.)
:::

:::concept Why controls of our own?
The browser's buttons look different in every browser, you can hardly style them, and you cannot put anything of your
own among them (a playlist, a subtitle switch). That is why video sites write their own controls. It comes at a price:
the browser's buttons work with a keyboard and a screen reader out of the box, while with ours, that is up to us. We
take care of it all the way.
:::

### A button of our own: useRef

Here comes the first button of our own: play and pause. The DOM element of `<video>` has two functions for this,
`play()` and `pause()`, and its `paused` property tells you whether the video is standing still. They are part of the
video element's [[API]]: the functions and properties your code can drive the video with. A JSX attribute cannot "play"
anything, though; there is no such thing as `<video playing={true}>`. We need the real element, and for that we need
[[useRef]].

You have worked like this before: in lesson 12 you opened the `<dialog>` element with `showModal()`, in lesson 16 you
put the cursor back into the typing field with `inputRef.current.focus()`, and if you did the advanced level of lesson
5, you put the camera picture into `videoRef.current.srcObject`. In short: `useRef(null)` gives you a box that React
keeps from one drawing to the next, but when its content changes, React does not draw again. When you give a JSX
element `ref={videoRef}`, React puts the real [[DOM]] element into the box's `current` field after drawing. From then
on, `videoRef.current` is the `<video>` itself.

Change `src/components/VideoPlayer.jsx` to this:

```jsx file=src/components/VideoPlayer.jsx mark=1-2,5-7,9-18,22,24-33
import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'

function VideoPlayer({ src }) {
  // A box for the real <video> element: React puts it in after drawing.
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  function togglePlay() {
    const video = videoRef.current
    if (video.paused) {
      video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="player">
      <video ref={videoRef} className="player__video" src={src} preload="metadata" playsInline />

      <div className="player__controls">
        <button
          type="button"
          className="player__button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- `controls` is gone: from now on our button is the only control.
- `togglePlay` first takes the video out of the box (`const video = videoRef.current`), then looks at its `paused`
  property. If it is standing still, it starts it; if it is playing, it stops it. The `playing` state is only there so
  the button knows which icon to show.
- The button has only an icon, no text. [[aria-label]] (familiar from lesson 12) gives it a name that screen readers
  read out: "Play" or "Pause". `Icon.jsx` hides every icon from screen readers (`aria-hidden`, familiar from lesson 1),
  so they read out only the button's name.

:::check Check
The browser's controls are gone; under the picture there is a dark bar with a single button showing a ▶. Click it: the
video starts, and the icon turns into two upright bars (pause). Click again: it stops. You can also reach the button
with the ++Tab++ key (a blue ring shows it), and ++Enter++ presses it just the same.
:::

:::mistake Common mistake
`videoRef.play()`, without `.current`. The console (++F12++) says "videoRef.play is not a function". `videoRef` is only
the box; the video is in the box's `current` field: `videoRef.current.play()`.
:::

:::try Try it
Start the video and let it run to the end. The video stops, but the button still shows the pause icon, as if it were
still playing. The next step puts this right.
:::

### Listening to the video: events

So far we have kept the same fact in two places: the video knows whether it is playing, and so does the `playing`
state. As long as only our button starts and stops it, the two agree, but the video can also stop without our button:
when it reaches the end, when you unplug the headphones on a phone, or when you press the media key on your keyboard.
Then `playing` is lying.

The fix: let the video be the [[single source of truth]], and let React simply follow it. The video sends a
[[media event]] about every change: `play` when it starts, `pause` when it stops, and `ended` when it reaches the end.
In React you listen to them the same way as to a click: `onPlay`, `onPause`, `onEnded`. So `togglePlay` no longer sets the
state; it only tells the video what to do, and the video's events update `playing`. Change
`src/components/VideoPlayer.jsx` to this:

```jsx file=src/components/VideoPlayer.jsx mark=7,9,14-15,21-29,39-45,49-50
import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'

function VideoPlayer({ src }) {
  // A box for the real <video> element: React puts it in after drawing.
  const videoRef = useRef(null)
  // These only follow the video: its events keep them up to date.
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)

  function togglePlay() {
    const video = videoRef.current
    if (video.paused) {
      // play() returns a Promise, which is rejected if the video cannot play.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  let label = 'Play'
  let icon = 'play'
  if (ended) {
    label = 'Play again'
    icon = 'replay'
  } else if (playing) {
    label = 'Pause'
    icon = 'pause'
  }

  return (
    <div className="player">
      <video
        ref={videoRef}
        className="player__video"
        src={src}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
      />

      <div className="player__controls">
        <button type="button" className="player__button" onClick={togglePlay} aria-label={label}>
          <Icon name={icon} />
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- `onPlay` sets `playing` to true, and `ended` to false: whatever is playing is not at the end. `onPause` sets `playing`
  to false. At the end of the video the browser sends `pause` first, then `ended`, so at the end `playing` is false and
  `ended` is true.
- At the end the button becomes "Play again", with a circular arrow. Press it, and `togglePlay` calls `play()`: a video
  that has reached its end starts again from the beginning all by itself.
- `label` and `icon` are not state: they are [[derived values|derived value]], worked out from the state on every
  drawing. They need `let` because the `if` may give them a new value afterwards.
- `play()` returns a [[Promise]], because playback does not start at once: the browser first has to load a piece of the
  video. If that fails (no internet, or the browser does not allow it), the Promise is rejected, and a red
  "Uncaught (in promise)" error would show up in the console. `.catch(() => {})` catches it and lets it go quietly, as
  you saw with [[rejected promises|rejected promise]] in lesson 5. The next step shows a proper message when loading
  fails.
- `onClick={togglePlay}` on the video means that a click on the picture starts and stops it too. That is a convenience
  for mouse and finger users; keyboard users have the button.

:::check Check
Start the video, then click the picture itself: it stops, and the button's icon goes back to ▶. Let it run to the end:
the button turns into a circular arrow. Press it: the video starts again from the beginning.
:::

:::mistake Common mistake
`onPlay={setPlaying(true)}`, without the arrow function. That calls `setPlaying` straight away, during drawing, which
asks for a new drawing, which calls it again, and so on, until React stops with a "Too many re-renders" error. An event
needs a function, not the result of one: `onPlay={() => setPlaying(true)}`.
:::

### Where are we? The time

A player shows where you are and how long the video is: "0:12 / 0:30". That takes two properties:

- `duration` is the length of the video in seconds. It is known only once the browser has downloaded the beginning of
  the file, the [[metadata]] (the length, the picture size). Then it sends a `loadedmetadata` event. Until then,
  `duration` is [[NaN]] ("not a number"; more on that in a moment).
- `currentTime` is where playback is, also in seconds (for example `12.37`). While playing, the video sends a
  `timeupdate` event about four times a second, and one more after every jump.

Seconds become minutes and seconds just like for the clock of lesson 13. Create the `src/formatTime.js` file:

```js file=src/formatTime.js
// Seconds as minutes and seconds: 75.4 → "1:15".
export function formatTime(seconds) {
  // Not a real number (for example the length of a video that has not loaded yet): show zero.
  if (!Number.isFinite(seconds)) return '0:00'
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  const rest = String(whole % 60).padStart(2, '0')
  return `${minutes}:${rest}`
}
```

`NaN` (Not a Number) is JavaScript's special value for a calculation that has no sensible result.
`Number.isFinite(x)` is true only if `x` is a real, finite number: it is false for `NaN` and for infinity (`Infinity`,
which is the length of a live stream). `Math.floor` cuts off the decimals, `%` is the remainder of a division
(`75 % 60` is 15), and
[[padStart]] fills the seconds up to two digits: `'5'` becomes `'05'`.

The player gets three new pieces of state: the time, the length, and whether loading failed. Here is the whole
`src/components/VideoPlayer.jsx` at the end of the beginner level:

```jsx file=src/components/VideoPlayer.jsx mark=3,11-13,50-52,55-59,65-67
import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatTime } from '../formatTime.js'

function VideoPlayer({ src }) {
  // A box for the real <video> element: React puts it in after drawing.
  const videoRef = useRef(null)
  // These only follow the video: its events keep them up to date.
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)

  function togglePlay() {
    const video = videoRef.current
    if (video.paused) {
      // play() returns a Promise, which is rejected if the video cannot play.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  let label = 'Play'
  let icon = 'play'
  if (ended) {
    label = 'Play again'
    icon = 'replay'
  } else if (playing) {
    label = 'Pause'
    icon = 'pause'
  }

  return (
    <div className="player">
      <video
        ref={videoRef}
        className="player__video"
        src={src}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
        onTimeUpdate={() => setTime(videoRef.current.currentTime)}
        onError={() => setFailed(true)}
      />

      {failed && (
        <p className="player__error" role="alert">
          The video could not be loaded. Check your internet connection, then reload the page.
        </p>
      )}

      <div className="player__controls">
        <button type="button" className="player__button" onClick={togglePlay} aria-label={label}>
          <Icon name={icon} />
        </button>
        <span className="player__time">
          {formatTime(time)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- `onLoadedMetadata` runs once the length of the video is known: that is when we set `duration`. Until then it is 0,
  so the display says "0:00".
- `onTimeUpdate` writes `currentTime` into the `time` state at every `timeupdate`, and React draws the time again.
- If the video cannot be downloaded, the video sends an `error` event. Then `failed` becomes true, and a message
  appears. Because of `role="alert"`, screen readers read it out at once, whatever the user was doing.

:::check Check
Right after the page loads, "0:00 / 0:30" stands next to the button. Start the video: the first number moves on every
second, showing exactly what the counter in the bottom right corner of the picture shows. The beginner level is done:
commit it!
:::

:::mistake Common mistake
Showing the time straight from the ref: `{formatTime(videoRef.current.currentTime)}`. During the first drawing the box
is still empty, so the console says "Cannot read properties of null (reading 'currentTime')", and the page stays
blank. And even if it got past that, the time would never move: a change in a ref does not make React draw again, but a
change in state does. What changes on the screen belongs in state.
:::

:::try Try it
Mistype the address in `videos.js` (for example, put an `x` in front of `.mp4`) and save: the dark red error message
appears under the picture. Then put the address right and reload the page (++F5++): the message stays until you reload,
because nothing sets `failed` back to `false`.
:::

## Intermediate level {level=2}

### The seek bar

The seek bar is a slider (`<input type="range">`) that shows where playback is, and when you drag it, the video jumps
there. It is a [[controlled input]], just like the length slider of lesson 3: its value comes from state (`time`), and
it reports every movement. What is special is that `currentTime` can also be written: give it a new value, and the video
jumps there.

The bar gets a component of its own. Create the `src/components/SeekBar.jsx` file:

```jsx file=src/components/SeekBar.jsx
import { formatTime } from '../formatTime.js'

function SeekBar({ time, duration, onSeek }) {
  // How much of the video has played, in percent (the CSS paints this much turquoise).
  const progress = duration > 0 ? (time / duration) * 100 : 0

  return (
    <input
      type="range"
      className="seek"
      min="0"
      max={duration}
      step="any"
      value={time}
      disabled={duration === 0}
      onChange={(event) => onSeek(Number(event.target.value))}
      aria-label="Seek"
      aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
      style={{ '--progress': `${progress}%` }}
    />
  )
}

export default SeekBar
```

- The slider goes from 0 to the length of the video. `step="any"` allows any value, not only whole numbers, so the
  slider glides smoothly instead of jumping from second to second.
- As long as the length is unknown, the slider is `disabled`: there is nowhere to seek to.
- On its own, a screen reader would read out the slider's number ("12.37"), which means nothing here.
  [[aria-valuetext]] gives it human words instead: "0:12 of 0:30".
- `style={{ '--progress': … }}` sets a [[CSS variable]] with an [[inline style]], just as `--columns` set the number of
  columns on the board in lesson 13. That is how `App.css` knows how far to paint the bar turquoise.

`VideoPlayer` gets two things: a `seek` function that writes the slider's value into the video, and the `<SeekBar>` at
the start of the control row (the CSS puts it on a line of its own, above the buttons). In the code below, the comments
that start with `…` stand in for the parts that do not change: leave the old code there as it was, and do not type the
comment itself:

```jsx file=src/components/VideoPlayer.jsx mark=4,9-15,24
import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatTime } from '../formatTime.js'
import SeekBar from './SeekBar.jsx'

function VideoPlayer({ src }) {
  // … the ref, the states and togglePlay, as before

  function seek(seconds) {
    videoRef.current.currentTime = seconds
    // Straight away, so the slider does not jump back until the next timeupdate.
    setTime(seconds)
    // After a jump we are no longer at the end.
    setEnded(false)
  }

  // … label and icon, as before

  return (
    <div className="player">
      {/* … the video and the error message, as before */}

      <div className="player__controls">
        <SeekBar time={time} duration={duration} onSeek={seek} />
        <button type="button" className="player__button" onClick={togglePlay} aria-label={label}>
          <Icon name={icon} />
        </button>
        <span className="player__time">
          {formatTime(time)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

export default VideoPlayer
```

Why does `seek` set `time` too, when `timeupdate` will do it anyway? Because a jump is not instant: the browser first
has to find the new place in the file, and until then the old time would keep coming back. The slider would jump back
and forth while you drag it. We also reset `ended`: when you seek back from the end, the button should say "Play" again,
not "Play again".

:::check Check
A thin line with a white dot on it appears above the buttons. While the video plays, the dot moves along, and the line
behind it turns turquoise. Drag the dot: the picture and the time jump there too. Clicking anywhere on the line makes the
video jump there. With the keyboard: move to the slider with ++Tab++, and the arrow keys move it in small steps.
:::

:::mistake Common mistake
At the end of the video, the dot has only got a third of the way along the bar, although the turquoise part is already
at the end. `max={duration}` is missing: a slider goes from 0 to 100 by default, so the end of a 30-second video, 30,
sits at 30% of the bar.
:::

### Volume and mute

The volume of a video is its `volume` property, from 0 (silent) to 1 (full volume). Muting is a separate property,
`muted`: when it is true, there is no sound, but `volume` stays as it was, so when the sound comes back, it is just as
loud as before. When either of them changes, the video sends a `volumechange` event, and we follow it just like
playback: the video is the source of truth, React only listens.

The volume gets a component of its own too: a mute button and a small slider. Create the
`src/components/VolumeControl.jsx` file:

```jsx file=src/components/VolumeControl.jsx
import Icon from '../Icon.jsx'

function VolumeControl({ volume, muted, onVolumeChange, onToggleMute }) {
  // Muted, the slider stands at 0, but the volume is kept for when the sound comes back.
  const shown = muted ? 0 : volume

  return (
    <div className="volume">
      <button
        type="button"
        className="player__button"
        onClick={onToggleMute}
        aria-label="Mute"
        aria-pressed={muted}
      >
        <Icon name={shown === 0 ? 'mute' : 'volume'} />
      </button>
      <input
        type="range"
        className="volume__slider"
        min="0"
        max="1"
        step="0.05"
        value={shown}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        aria-label="Volume"
        aria-valuetext={`${Math.round(shown * 100)}%`}
      />
    </div>
  )
}

export default VolumeControl
```

The play button and the mute button follow two different patterns, and both are right. The play button changes its
**name** ("Play" or "Pause"), because it always says what will happen when you press it. The mute button is always
called "Mute", and [[aria-pressed]] (familiar from lesson 13) says whether it is pressed in, so a screen reader announces
"Mute, toggle button, pressed". Do not mix the two: a pressed "Unmute" button makes sense to nobody. `App.css` paints a
pressed button turquoise.

`VideoPlayer` gets two new pieces of state and two new functions, the video gets a new event, and the control row gets
the `<VolumeControl>` after the time:

```jsx file=src/components/VideoPlayer.jsx mark=5,12-13,17-29,50-53,61-66
import { useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatTime } from '../formatTime.js'
import SeekBar from './SeekBar.jsx'
import VolumeControl from './VolumeControl.jsx'

function VideoPlayer({ src }) {
  // A box for the real <video> element: React puts it in after drawing.
  const videoRef = useRef(null)
  // These only follow the video: its events keep them up to date.
  // … playing, ended, time, duration and failed, as before
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)

  // … togglePlay and seek, as before

  function changeVolume(value) {
    const video = videoRef.current
    video.volume = value
    // At 0 the video is muted; moving the slider up turns the sound back on.
    video.muted = value === 0
  }

  function toggleMute() {
    const video = videoRef.current
    // Unmuting at volume 0 would still be silent, so the volume goes back to half.
    if (video.muted && video.volume === 0) video.volume = 0.5
    video.muted = !video.muted
  }

  // … label and icon, as before

  return (
    <div className="player">
      <video
        ref={videoRef}
        className="player__video"
        src={src}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
        onTimeUpdate={() => setTime(videoRef.current.currentTime)}
        onVolumeChange={() => {
          setVolume(videoRef.current.volume)
          setMuted(videoRef.current.muted)
        }}
        onError={() => setFailed(true)}
      />

      {/* … the error message, as before */}

      <div className="player__controls">
        {/* … the SeekBar, the play button and the time, as before */}
        <VolumeControl
          volume={volume}
          muted={muted}
          onVolumeChange={changeVolume}
          onToggleMute={toggleMute}
        />
      </div>
    </div>
  )
}

export default VideoPlayer
```

`changeVolume` and `toggleMute` only talk to the video; `onVolumeChange` reads both values back from the video, and the
slider and the icon are drawn from them.

:::check Check
On the right of the bar there is a speaker icon and a small slider. Drag the slider to the left: the sound gets quieter,
and at 0 a small × appears next to the speaker. Click the speaker: the video goes silent, the slider jumps to 0, and the icon turns
turquoise. Click again: the sound and the slider come back to where they were. In a narrow window (on a phone) the
slider disappears and only the mute button stays. On an iPhone the slider would not work anyway: there only the phone's
own buttons set the volume.
:::

:::mistake Common mistake
The slider does not move at all, however you drag it. `onVolumeChange` is missing: `changeVolume` writes the new volume
into the video, but nobody writes it back into the `volume` state, and a controlled slider always shows the value in
state, which is still 1.
:::

### Playback speed

You might watch a tutorial faster, and a tricky part slower. The speed is the `playbackRate` property: `1` is normal
speed, `2` is double, `0.5` is half. When it changes, the video sends a `ratechange` event. When speeding up, browsers keep the
pitch of the sound, so voices do not end up squeaky like a chipmunk.

You pick the speed from a [[drop-down list]], like the category in lesson 10. Create the
`src/components/SpeedSelect.jsx` file:

```jsx file=src/components/SpeedSelect.jsx
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

function SpeedSelect({ rate, onChange }) {
  return (
    <label className="speed">
      <span className="visually-hidden">Playback speed</span>
      <select value={rate} onChange={(event) => onChange(Number(event.target.value))}>
        {SPEEDS.map((speed) => (
          <option key={speed} value={speed}>
            {speed}×
          </option>
        ))}
      </select>
    </label>
  )
}

export default SpeedSelect
```

The list needs a name too, but there is no room in the bar for a visible label. The `visually-hidden` class (you met it
in lesson 6) hides the words "Playback speed" from the eyes, but screen readers still read them, and the `<label>`
connects them to the list just the same. `×` is the multiplication sign: "1.5×" means one and a half times the speed.

In `VideoPlayer`, the usual three parts: a piece of state, a function that tells the video, and an event that reads it
back. The new `onRateChange` goes after the video's other events, before `onError`, and `<SpeedSelect>` goes at the end
of the control row:

```jsx file=src/components/VideoPlayer.jsx mark=1,6,10-12,21,29
import SpeedSelect from './SpeedSelect.jsx'
// … the other imports, as before

function VideoPlayer({ src }) {
  // … the ref and the states so far, as before
  const [rate, setRate] = useState(1)

  // … togglePlay, seek, changeVolume and toggleMute, as before

  function changeRate(value) {
    videoRef.current.playbackRate = value
  }

  // … label and icon, as before

  return (
    <div className="player">
      <video
        ref={videoRef}
        // … the attributes and the events up to onVolumeChange, as before
        onRateChange={() => setRate(videoRef.current.playbackRate)}
        onError={() => setFailed(true)}
      />

      {/* … the error message, as before */}

      <div className="player__controls">
        {/* … the SeekBar, the play button, the time and the VolumeControl, as before */}
        <SpeedSelect rate={rate} onChange={changeRate} />
      </div>
    </div>
  )
}

export default VideoPlayer
```

:::check Check
A small box saying "1×" has appeared next to the speaker. Choose "2×": the counter in the corner of the picture races
twice as fast, and so does the time. At "0.5×" it slows down. The list works with the keyboard too: move to it with
++Tab++ and choose with the arrow keys.
:::

:::mistake Common mistake
`<select value={rate} onChange={onChange}>`, that is, the prop handed straight to the list. The console says "Failed to
set the 'playbackRate' property on 'HTMLMediaElement': The provided double value is non-finite." The list's
`onChange` passes on the event object, not the chosen number, and an object makes no speed.
`(event) => onChange(Number(event.target.value))` takes the number out of it.
:::

:::try Try it
Add a `20` to the end of the `SPEEDS` array and choose it: an error appears in the console, and the speed does not
change. Chrome allows at most 16 times the speed. Then take it out again.
:::

### Full screen

Full screen is the job of the [[Fullscreen API]]. You can say to any element: `element.requestFullscreen()`, and that
element fills the screen. `document.exitFullscreen()` leaves full screen, and `document.fullscreenElement` tells you
which element is in full screen right now (or `null` if none is).

But which element should go full screen? If it is the `<video>`, our control bar is left behind: in full screen you
would get the browser's own buttons at best. So we send the wrapper, the `<div className="player">`, to full screen, with the video and the bar
inside it. That needs a ref for the wrapper too. In `App.css`, the full-screen element is styled with the
[[:fullscreen]] [[pseudo-class]] (a pseudo-class, like `:hover` or `:focus-visible`, matches a state of the element
rather than a class name): the picture fills the space, and the bar stays at the bottom.

The ++Esc++ key leaves full screen too, without our button. So it is not the button that sets the `fullscreen` state,
but the browser's `fullscreenchange` event, which `document` sends whenever full screen changes. `document` is outside
React's world, so an effect adds the listener and its cleanup removes it, as with `matchMedia` in lesson 2 and the keys
in lesson 7:

```jsx file=src/components/VideoPlayer.jsx mark=1,5,7,10,14-28,30-37,42,47-54
import { useEffect, useRef, useState } from 'react'
// … the other imports, as before

function VideoPlayer({ src }) {
  // Boxes for the real elements: React puts them in after drawing.
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  // These only follow the video: its events keep them up to date.
  // … the states so far, as before
  const [fullscreen, setFullscreen] = useState(false)

  // … togglePlay, seek, changeVolume, toggleMute and changeRate, as before

  async function toggleFullscreen() {
    const player = playerRef.current
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (player.requestFullscreen) {
        await player.requestFullscreen()
      } else {
        // iPhone: only the video itself can go full screen, with the phone's own buttons.
        videoRef.current.webkitEnterFullscreen()
      }
    } catch {
      // The browser said no: the player simply stays as it is.
    }
  }

  // Full screen can also end without our button (Esc), so we listen to the browser.
  useEffect(() => {
    function handleChange() {
      setFullscreen(document.fullscreenElement === playerRef.current)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  // … label and icon, as before

  return (
    <div className="player" ref={playerRef}>
      {/* … the video and the error message, as before */}

      <div className="player__controls">
        {/* … everything from the SeekBar to the SpeedSelect, as before */}
        <button
          type="button"
          className="player__button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
        >
          <Icon name={fullscreen ? 'exitFullscreen' : 'fullscreen'} />
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- `requestFullscreen` and `exitFullscreen` both return a Promise, because switching takes a moment, and the browser may
  refuse. That is why `toggleFullscreen` is an [[async function]], with `await` and [[try/catch]], as in the copy
  button of lesson 3.
- On an iPhone, a `<div>` has no `requestFullscreen` function, but the video has a function of its own for this,
  `webkitEnterFullscreen`. `else if (player.requestFullscreen)` checks whether the function exists before calling it:
  this is [[feature detection]], familiar from lesson 4. If neither exists, the call throws an error, and `catch`
  catches it.
- Because of the `[]`, the effect runs only once: it adds the listener once, and the cleanup removes it when the player
  leaves the page. `handleChange` does not ask whether anything is in full screen, but whether our player is.

:::check Check
The four-corners icon has appeared at the right end of the bar. Click it: the player fills the whole screen, with the
picture in the middle and the bar at the bottom, and the icon turns into inward-pointing corners. Click it again, or
press ++Esc++: everything goes back, and the icon switches back correctly after ++Esc++ too.
:::

:::mistake Common mistake
`videoRef.current.requestFullscreen()` instead of the wrapper. The video goes full screen, but our control bar is left
behind: in Chrome you get the browser's own buttons, in other browsers perhaps none at all, and nothing of ours, neither
the speed list nor our full-screen button.
:::

:::concept Why can't a page go full screen by itself?
Full screen can only be asked for in answer to something the user did (a click, a key press). If a page tried it on its
own, for example from a timer, the browser would reject the Promise. This is a protection: a malicious page cannot
suddenly take over the whole screen and, for example, draw a fake login window across all of it.
:::

### Keyboard shortcuts

A good player is comfortable to use without a mouse. These are the [[keyboard shortcuts|keyboard shortcut]] people know
from video sites: ++Space++ and ++K++ start or stop the video, ++←++ and ++→++ jump 5 seconds, ++M++ mutes, and ++F++
switches to full screen.

In lesson 7, the space bar rolled a new palette anywhere in the window: an effect added a `keydown` listener to
`window`, the cleanup removed it, and `preventDefault` switched off the browser's [[default behavior]]. We work the same
way now, but three things need care:

1. Combinations with a [[modifier key]] (++Ctrl++, ++Alt++, ++Cmd++ on a Mac) belong to the browser: ++Ctrl++ + ++F++
   is search, not full screen. We leave those alone, and the browser handles them.
2. If the [[focus]] is on an element that uses the key itself, we let it have it. The drop-down list uses every key, the
   sliders use the arrows, and a button is pressed by the space bar. If we handled the space bar there too,
   `preventDefault` would swallow the button press (you saw this in lesson 7): on the mute or the full-screen button
   (and later on the playlist buttons), the space bar would play or pause the video instead of pressing the button.
   `event.target.tagName` tells you what has the focus: the element's name in capitals, for example `'BUTTON'`,
   `'INPUT'` or `'SELECT'`.
3. `preventDefault` is needed only for our own keys: on their own, the space bar and the arrows would scroll the page.
   Every other key (++Tab++, for example) should keep working as usual.

We also need a `seekBy` function, which jumps relative to the current position. Here is the whole
`src/components/VideoPlayer.jsx` at the end of the intermediate level:

```jsx file=src/components/VideoPlayer.jsx mark=41-47,92-119
import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatTime } from '../formatTime.js'
import SeekBar from './SeekBar.jsx'
import VolumeControl from './VolumeControl.jsx'
import SpeedSelect from './SpeedSelect.jsx'

function VideoPlayer({ src }) {
  // Boxes for the real elements: React puts them in after drawing.
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  // These only follow the video: its events keep them up to date.
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)

  function togglePlay() {
    const video = videoRef.current
    if (video.paused) {
      // play() returns a Promise, which is rejected if the video cannot play.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  function seek(seconds) {
    videoRef.current.currentTime = seconds
    // Straight away, so the slider does not jump back until the next timeupdate.
    setTime(seconds)
    // After a jump we are no longer at the end.
    setEnded(false)
  }

  function seekBy(seconds) {
    const video = videoRef.current
    // Before the video has loaded, its length is unknown: there is nowhere to jump.
    if (!Number.isFinite(video.duration)) return
    // Not before the start, and not past the end.
    seek(Math.min(Math.max(video.currentTime + seconds, 0), video.duration))
  }

  function changeVolume(value) {
    const video = videoRef.current
    video.volume = value
    // At 0 the video is muted; moving the slider up turns the sound back on.
    video.muted = value === 0
  }

  function toggleMute() {
    const video = videoRef.current
    // Unmuting at volume 0 would still be silent, so the volume goes back to half.
    if (video.muted && video.volume === 0) video.volume = 0.5
    video.muted = !video.muted
  }

  function changeRate(value) {
    videoRef.current.playbackRate = value
  }

  async function toggleFullscreen() {
    const player = playerRef.current
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (player.requestFullscreen) {
        await player.requestFullscreen()
      } else {
        // iPhone: only the video itself can go full screen, with the phone's own buttons.
        videoRef.current.webkitEnterFullscreen()
      }
    } catch {
      // The browser said no: the player simply stays as it is.
    }
  }

  // Full screen can also end without our button (Esc), so we listen to the browser.
  useEffect(() => {
    function handleChange() {
      setFullscreen(document.fullscreenElement === playerRef.current)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  // Keyboard shortcuts on the whole page.
  useEffect(() => {
    function handleKeyDown(event) {
      // Ctrl, Alt and Cmd combinations belong to the browser (Ctrl + F is search).
      if (event.ctrlKey || event.altKey || event.metaKey) return
      // Keys that the focused element uses itself stay with it.
      const tag = event.target.tagName
      if (tag === 'SELECT') return
      if (tag === 'INPUT' && event.key.startsWith('Arrow')) return
      if (tag === 'BUTTON' && event.key === ' ') return
      // A held key repeats keydown: the arrows may keep seeking, the other keys count only once
      // (but a held space bar must not scroll the page meanwhile).
      if (event.repeat && !event.key.startsWith('Arrow')) {
        if (event.key === ' ') event.preventDefault()
        return
      }

      if (event.key === ' ' || event.key === 'k' || event.key === 'K') togglePlay()
      else if (event.key === 'ArrowLeft') seekBy(-5)
      else if (event.key === 'ArrowRight') seekBy(5)
      else if (event.key === 'm' || event.key === 'M') toggleMute()
      else if (event.key === 'f' || event.key === 'F') toggleFullscreen()
      else return // not one of ours: the browser does what it usually does
      event.preventDefault()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  let label = 'Play'
  let icon = 'play'
  if (ended) {
    label = 'Play again'
    icon = 'replay'
  } else if (playing) {
    label = 'Pause'
    icon = 'pause'
  }

  return (
    <div className="player" ref={playerRef}>
      <video
        ref={videoRef}
        className="player__video"
        src={src}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
        onTimeUpdate={() => setTime(videoRef.current.currentTime)}
        onVolumeChange={() => {
          setVolume(videoRef.current.volume)
          setMuted(videoRef.current.muted)
        }}
        onRateChange={() => setRate(videoRef.current.playbackRate)}
        onError={() => setFailed(true)}
      />

      {failed && (
        <p className="player__error" role="alert">
          The video could not be loaded. Check your internet connection, then reload the page.
        </p>
      )}

      <div className="player__controls">
        <SeekBar time={time} duration={duration} onSeek={seek} />
        <button type="button" className="player__button" onClick={togglePlay} aria-label={label}>
          <Icon name={icon} />
        </button>
        <span className="player__time">
          {formatTime(time)} / {formatTime(duration)}
        </span>
        <VolumeControl
          volume={volume}
          muted={muted}
          onVolumeChange={changeVolume}
          onToggleMute={toggleMute}
        />
        <SpeedSelect rate={rate} onChange={changeRate} />
        <button
          type="button"
          className="player__button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
        >
          <Icon name={fullscreen ? 'exitFullscreen' : 'fullscreen'} />
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- In `seekBy`, `Math.max(…, 0)` does not let it go before the start, and `Math.min(…, video.duration)` not past the
  end (the pair you know from lesson 6). `Number.isFinite` filters out the `NaN` length before loading.
- `event.key.startsWith('Arrow')` is true if the key's name starts with `'Arrow'`: that is, for all four arrows.
- `event.repeat` (lessons 7 and 17) is true while a key is held down and `keydown` keeps coming. For play, mute and full
  screen only the first press counts, or the video would flicker; a held arrow may keep jumping. A held space bar still
  gets `preventDefault`, or the page would scroll.
- For letters we check both the small and the capital one (`'k'` or `'K'`): with Caps Lock on, `event.key` is a
  capital.
- In the `if … else if` chain, every branch calls one command. If none of them fits, the final `else return` leaves the
  function, so `preventDefault` runs only for our own keys.

:::concept This time the closure does not fool us
In lesson 7 you saw the [[closure]] trap: a listener added once sees the variables of the first drawing, forever.
`handleKeyDown` was made during the first drawing too, and it calls the `togglePlay`, `seekBy` and `toggleMute` of back
then. Here that does no harm, because none of these functions reads any state: they ask the video about everything,
through `videoRef.current`, and the ref's box always holds the element as it is now. One more advantage of "the video
is the source of truth".
:::

Finally, let us show the shortcuts on the page too: a shortcut nobody can find is a shortcut nobody uses. Create the
`src/components/Shortcuts.jsx` file:

```jsx file=src/components/Shortcuts.jsx
function Shortcuts() {
  return (
    <section className="shortcuts">
      <h2>Keyboard shortcuts</h2>
      <dl>
        <div>
          <dt>
            <kbd>Space</kbd> <kbd>K</kbd>
          </dt>
          <dd>play / pause</dd>
        </div>
        <div>
          <dt>
            <kbd>←</kbd> <kbd>→</kbd>
          </dt>
          <dd>5 seconds back / forward</dd>
        </div>
        <div>
          <dt>
            <kbd>M</kbd>
          </dt>
          <dd>sound off / on</dd>
        </div>
        <div>
          <dt>
            <kbd>F</kbd>
          </dt>
          <dd>full screen</dd>
        </div>
      </dl>
    </section>
  )
}

export default Shortcuts
```

You know the [[description list]] (`<dl>`) from lesson 13: `<dt>` is the key, `<dd>` explains it. The `<kbd>` element
marks a key, and `App.css` draws it as a keycap. Put the list under the player; here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=3,15
import { VIDEO_SRC } from './videos.js'
import VideoPlayer from './components/VideoPlayer.jsx'
import Shortcuts from './components/Shortcuts.jsx'
import './App.css'

function App() {
  return (
    <main className="page">
      <header className="page__header">
        <h1>Popcorn Player</h1>
        <p>A video player with buttons of our own.</p>
      </header>

      <VideoPlayer src={VIDEO_SRC} />
      <Shortcuts />
    </main>
  )
}

export default App
```

:::check Check
The four shortcuts are listed in a white box under the player. Click an empty part of the page (so the focus is on no
button), and press ++Space++: the video starts, and the page does not scroll. ++→++ jumps 5 seconds forward, ++M++
mutes (the speaker turns turquoise), and ++F++ switches to full screen and back. Now move to the volume slider with
++Tab++: there the arrows set the volume instead of seeking. On the speed list, the arrows change the speed. The
intermediate level is done: commit it!
:::

:::mistake Common mistake
`event.key === 'Space'`. The space bar does not start the video; at most the page scrolls down a bit. For the space
bar, `event.key` is a single space character: `' '`. `'Space'` is the value of
`event.code` (the key's place on the keyboard), which you used in lesson 7. If you are not sure of a key's name, put
this at the start of `handleKeyDown`: `console.log(event.key)`, and press the key.
:::

:::try Task
Let the number keys jump to tenths of the video, as on video sites: ++0++ to the start, ++5++ to the middle, ++9++ to
90%. You need a new branch at the end of the chain, before `else return`:
`else if (event.key >= '0' && event.key <= '9') seek(videoRef.current.duration * Number(event.key) / 10)`.
Careful: you cannot use the `duration` state here, because the listener was made during the first drawing, when it was
still 0. The ref, on the other hand, always gives you the video as it is now. (The code of the advanced level shows the
chain without this task; if you did it, keep the branch.)
:::

## Advanced level {level=3}

### A playlist

A [[playlist]] lists several videos: click one, and it plays; when it ends, the next one comes by itself. The list
itself is just data: an array of videos. The site has a single sample clip for now, so our list plays that clip,
starting from different points. There is a standard trick for this, the [[media fragment]]: put `#t=10` at the end of a
video's address, and the browser starts it at the 10th second. Create the `src/playlist.js` file:

```js file=src/playlist.js
import { VIDEO_SRC } from './videos.js'

// The site has a single sample clip for now, so the list plays it from different points:
// "#t=10" at the end of an address means "start at the 10th second".
export const PLAYLIST = [
  { id: 'whole', title: 'The whole sample clip', src: VIDEO_SRC },
  { id: 'from-10', title: 'From the 10th second', src: `${VIDEO_SRC}#t=10` },
  { id: 'last-10', title: 'The last ten seconds', src: `${VIDEO_SRC}#t=20` },
]
```

Every clip has a unique `id`, a `title` and a `src`. If you have videos of your own, put them in the `public` folder and
list them here with their own file names (`src: '/my-video.mp4'`).

Showing the list is a component of its own. Create the `src/components/Playlist.jsx` file:

```jsx file=src/components/Playlist.jsx
function Playlist({ clips, current, onSelect }) {
  return (
    <section className="playlist">
      <h2>Playlist</h2>
      <ol>
        {clips.map((clip, index) => (
          <li key={clip.id}>
            <button
              type="button"
              className="playlist__item"
              aria-current={index === current}
              onClick={() => onSelect(index)}
            >
              <span className="playlist__number">{index + 1}</span>
              {clip.title}
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Playlist
```

Every clip is a button in a numbered list (`<ol>`). [[aria-current]] marks the one that is playing: screen readers call
it "current", and `App.css` highlights it. `current` is the position of the playing clip in the array, and `onSelect`
reports when someone chooses another one.

Which clip is playing is kept in the state of `App`, because both the list and the player need to know it: this is
[[lifting state up]] from lesson 3, the state lives in the closest common parent. Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=1-2,5,9-23,32-34
import { useState } from 'react'
import { PLAYLIST } from './playlist.js'
import VideoPlayer from './components/VideoPlayer.jsx'
import Shortcuts from './components/Shortcuts.jsx'
import Playlist from './components/Playlist.jsx'
import './App.css'

function App() {
  // Which clip of the playlist is on: its position in PLAYLIST.
  const [current, setCurrent] = useState(0)
  // The first clip waits for a click; after that, a chosen clip starts by itself.
  const [autoPlay, setAutoPlay] = useState(false)
  const clip = PLAYLIST[current]

  function select(index) {
    setCurrent(index)
    setAutoPlay(true)
  }

  function playNext() {
    // After the last clip the list stops.
    if (current + 1 < PLAYLIST.length) select(current + 1)
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1>Popcorn Player</h1>
        <p>A video player with buttons of our own.</p>
      </header>

      {/* The key gives every clip a brand-new player, with fresh state. */}
      <VideoPlayer key={clip.id} clip={clip} autoPlay={autoPlay} onEnded={playNext} />
      <Playlist clips={PLAYLIST} current={current} onSelect={select} />
      <Shortcuts />
    </main>
  )
}

export default App
```

- The `VIDEO_SRC` import has left `App`: the addresses of the video files live in the list from now on. The player gets a whole clip
  (`clip`), not just an address.
- `key={clip.id}` is the most important line. In lesson 3 the copy button got a `key` like this: when the [[key]]
  changes, React throws the old component away and puts a brand-new one in its place, with fresh state and a fresh
  `<video>` element. That is exactly what a new clip needs: the time, the length, the "Play again" state and everything
  else start from scratch.
- `autoPlay` switches on the `<video>` element's [[autoplay]] attribute: such a video starts by itself as soon as it has
  loaded. For the first clip it is false, because browsers do not let a page start playing sound by itself when it
  opens: only after the visitor has clicked something on the page. That is why it turns true only at the first choice.
- `playNext` does not move on after the last clip, because `PLAYLIST[3]` does not exist: the three clips are at
  positions 0, 1 and 2.

In `VideoPlayer`, only the first line of the function and the start of `<video>` change: among the props, `clip`,
`autoPlay` and `onEnded` take the place of `src`, and the video gets the clip's `src` and tells `App` when it has ended.
The imports and the `export default VideoPlayer` at the end of the file stay as they were (in the next steps too):

```jsx file=src/components/VideoPlayer.jsx mark=1,9-10,19-22
function VideoPlayer({ clip, autoPlay, onEnded }) {
  // … the refs, the states, the functions and the effects, as before

  return (
    <div className="player" ref={playerRef}>
      <video
        ref={videoRef}
        className="player__video"
        src={clip.src}
        autoPlay={autoPlay}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setEnded(true)
          onEnded()
        }}
        // … the other events, as before
      />

      {/* … the error message and the control row, as before */}
    </div>
  )
}

export default VideoPlayer
```

Careful, there are two `onEnded`s here, like the two `onChange`s in lesson 3: `<video onEnded={…}>` listens to the
browser's event, and the `onEnded()` called inside it is the prop from `App`, that is, `playNext`.

The prop is called `clip`, not `video`, because inside the functions `const video = videoRef.current` already means the
`<video>` element: two different things should not share a name.

:::check Check
The "Playlist" appears under the player with three clips, the first one highlighted. Click the second: it is
highlighted, the video starts by itself, and the counter in the corner counts from "10 s". Seek close to the end and let
it run out: the third clip comes by itself, from 20 seconds. After the third, the list stops. When the clip changes, the
volume and the speed go back to normal too: that is the `key` again.
:::

:::mistake Common mistake
`playNext` without the check: `select(current + 1)`. At the end of the last clip the page goes blank, and the console
says "Cannot read properties of undefined (reading 'id')". `PLAYLIST[3]` does not exist, so `clip` is `undefined`.
:::

:::try Task
Put a "Next" button above the player that calls `playNext`, and make it `disabled` while the last clip is playing.
:::

### Subtitles

[[Subtitles|subtitles]] are not only for films in another language. Deaf and hard-of-hearing viewers follow the video
through them, and everybody else finds them useful too: on the bus, in a noisy place, or when someone is asleep next to
you. The accessibility guidelines ([[WCAG]]) require them for recorded videos with sound.

Browsers understand the [[WebVTT]] format: a plain text file with a `.vtt` extension. Create a `public` folder in the
root of the project (next to `src`) if you do not have one yet, with a `captions.vtt` file in it:

```text file=public/captions.vtt
WEBVTT

00:01.000 --> 00:04.500
Hello! These subtitles come from a WebVTT file.

00:05.000 --> 00:09.500
This line appears at 0:05 and disappears at 0:09.

00:10.000 --> 00:14.500
Every cue has a start time and an end time.

00:15.000 --> 00:19.500
Jump back with the ← key, and the lines come back too.

00:20.000 --> 00:24.500
Write your own lines in public/captions.vtt.

00:25.000 --> 00:29.500
That's all. Thanks for watching!
```

The first line is always `WEBVTT`. After it come pieces separated by empty lines; these are the [[cues|cue]]. A cue's
first line says from when until when it is shown (minutes:seconds.milliseconds), and the text comes under it. The lines
talk about themselves on purpose, so they fit any video.

The clips get a `captions` field with the address of the subtitle file. Here is the whole `src/playlist.js`:

```js file=src/playlist.js mark=6-8
import { VIDEO_SRC } from './videos.js'

// The site has a single sample clip for now, so the list plays it from different points:
// "#t=10" at the end of an address means "start at the 10th second".
export const PLAYLIST = [
  { id: 'whole', title: 'The whole sample clip', src: VIDEO_SRC, captions: '/captions.vtt' },
  { id: 'from-10', title: 'From the 10th second', src: `${VIDEO_SRC}#t=10`, captions: '/captions.vtt' },
  { id: 'last-10', title: 'The last ten seconds', src: `${VIDEO_SRC}#t=20`, captions: '/captions.vtt' },
]
```

A `<track>` element connects the subtitle file to the video, and it goes **inside** the `<video>`. So `<video>` now gets
a closing tag: `<video …>…</video>`. The browser makes a [[text track]] from every `<track>`, and they are in the
video's `textTracks` list. A track's `mode` can be one of three: `'showing'` (visible), `'hidden'` (loaded, but not
shown) and `'disabled'` (switched off). The subtitle button switches between them.

```jsx file=src/components/VideoPlayer.jsx mark=3,7-13,23-25,31-41
function VideoPlayer({ clip, autoPlay, onEnded }) {
  // … the refs and the states so far, as before
  const [captionsOn, setCaptionsOn] = useState(false)

  // … togglePlay, seek, seekBy, changeVolume, toggleMute, changeRate and toggleFullscreen, as before

  function toggleCaptions() {
    // The first (and only) text track of the video.
    const track = videoRef.current.textTracks[0]
    const show = track.mode !== 'showing'
    track.mode = show ? 'showing' : 'hidden'
    setCaptionsOn(show)
  }

  // … the effects, label and icon, as before

  return (
    <div className="player" ref={playerRef}>
      <video
        ref={videoRef}
        // … the attributes and the events, as before
        onError={() => setFailed(true)}
      >
        {clip.captions && <track kind="subtitles" src={clip.captions} srcLang="en" label="English" />}
      </video>

      {/* … the error message, as before */}

      <div className="player__controls">
        {/* … everything from the SeekBar to the SpeedSelect, as before */}
        {clip.captions && (
          <button
            type="button"
            className="player__button"
            onClick={toggleCaptions}
            aria-label="Subtitles"
            aria-pressed={captionsOn}
          >
            <Icon name="captions" />
          </button>
        )}
        {/* … the full-screen button, as before */}
      </div>
    </div>
  )
}

export default VideoPlayer
```

- The attributes of `<track>`: `kind="subtitles"` says it is subtitles, `src` is the address of the file, `srcLang` is
  its language (`en`), and `label` is its name, in case the browser shows it in a menu.
- `{clip.captions && …}` is [[conditional rendering]]: if a clip has no subtitles, neither the `<track>` nor the button
  appears.
- The browser itself draws the subtitles at the bottom of the picture; we only switch them on and off. Their look comes
  from the [[::cue]] [[pseudo-element]] (a pseudo-element styles a part of an element that has no tag of its own in
  your code; `::cue` is the subtitle text the browser draws over the video): in `App.css`, the `.player__video::cue`
  rule gives them the dark background.
- The button follows the same pattern as mute: its name is always "Subtitles", and `aria-pressed` says whether they are
  on.

:::check Check
A "CC" icon has appeared next to the speed. Click it (it turns turquoise) and start the video: subtitles appear at the
bottom of the picture, the first line at 0:01, the second at 0:05. Seek back: the lines come back too. Click "CC" again:
the subtitles disappear. They show in full screen too.
:::

:::mistake Common mistake
No subtitles appear, and there is no error either. Two usual reasons: the file is in `src` instead of `public` (the
browser cannot find it), or its first line is not exactly `WEBVTT` (it is missing, or there is an empty line before
it). In the second case the browser silently throws the whole file away. On the Network tab of the browser's developer
tools, click the `captions.vtt` row: if the response shows an HTML page (`<!doctype html>…`) instead of `WEBVTT`, Vite
did not find the file in the `public` folder.
:::

:::try Try it
After the times of one cue, on the same line, write `line:10%`. For example: `00:10.000 --> 00:14.500 line:10%`. That
line now appears at the top of the picture, not at the bottom: this is how you move subtitles out of the way when the
bottom of the video has text or something important of its own.
:::

:::concept Subtitles or captions?
`kind` can also be `captions`. `subtitles` are the spoken words for people who can hear the sound but do not understand
it or cannot turn it up: a translation, for example. `captions` are for deaf and hard-of-hearing viewers, so they also
describe the sounds: "[soft music]", "[door slams]". The browser draws both the same way; the difference is in what you
write. For a real video in which people speak, it is worth making `captions`.
:::

### Picking up where you left off

If you leave a video halfway and come back later, it is nice when it carries on where you stopped. For that, the
playback position has to be saved in [[localStorage]], and the player has to jump back there when it loads. Since
lesson 9 you know that `localStorage` is a simple key–value store in the browser that survives a reload, and that every
use of it goes inside `try/catch`, because the browser may block it.

This logic goes into a [[custom hook]], like `useLocalStorage` in lesson 9: a function whose name starts with `use`, and
which uses other hooks. The hook gets the video's ref and a key under which it saves to `localStorage`, and gives back
an object with the `resumedAt` state and three functions: `restore` jumps back to the saved position, `save` saves the
current one, and `startOver` goes back to the beginning. Create the `src/useResumePosition.js` file:

```js file=src/useResumePosition.js
import { useState } from 'react'

// The saved place in seconds; 0 if there is none (or the storage is blocked).
function readPosition(key) {
  try {
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

function writePosition(key, seconds) {
  try {
    if (seconds > 0) localStorage.setItem(key, String(Math.floor(seconds)))
    else localStorage.removeItem(key)
  } catch {
    // Blocked storage: next time the video simply starts from the beginning.
  }
}

// Remembers how far the viewer got in a video, and takes them back there next time.
function useResumePosition(videoRef, storageKey) {
  // Where we picked up from (in seconds), or null if the video started from the beginning.
  const [resumedAt, setResumedAt] = useState(null)

  // Call it when the video's length is known (loadedmetadata): only then can it jump.
  function restore() {
    const video = videoRef.current
    const saved = readPosition(storageKey)
    // In the first and the last second there is nothing to pick up.
    if (saved > 1 && saved < video.duration - 1) {
      video.currentTime = saved
      setResumedAt(saved)
    }
  }

  // Call it on every timeupdate: while the video plays, its place is written down.
  function save() {
    const video = videoRef.current
    if (video.ended) writePosition(storageKey, 0)
    else if (!video.paused) writePosition(storageKey, video.currentTime)
  }

  function startOver() {
    videoRef.current.currentTime = 0
    writePosition(storageKey, 0)
    setResumedAt(null)
  }

  return { resumedAt, restore, save, startOver }
}

export default useResumePosition
```

- `localStorage` stores only text, so `Number(…)` turns it into a number. If nothing is saved, `getItem` gives `null`,
  and `Number(null)` is 0; if something meaningless is there, it is `NaN`. `|| 0` turns both into 0.
- `restore` can only work after `loadedmetadata`: before that, `duration` is `NaN`, and the video cannot jump. It does
  not jump back to the first or the last second, because there is nothing to pick up there.
- `save` saves only during playback. At the end of the video it deletes the saved position, so next time the video
  starts from the beginning.
- `startOver` does not only go back to the start, it deletes the saved position too; otherwise after a reload the video
  would carry on from the old place again.
- The `resumedAt` state is there so that the player can say where it picked up from.

`VideoPlayer` gives the hook a separate key for every clip (`popcorn-player:whole`, `popcorn-player:from-10`, …), so
every clip remembers its own position. The hook's `restore` runs when the video has loaded, and its `save` every time
the time updates; a strip appears above the bar if we picked up somewhere:

```jsx file=src/components/VideoPlayer.jsx mark=1,6,15-22,30-37
import useResumePosition from '../useResumePosition.js'
// … the other imports, as before

function VideoPlayer({ clip, autoPlay, onEnded }) {
  // … the refs and the states, as before
  const resume = useResumePosition(videoRef, `popcorn-player:${clip.id}`)

  // … the functions, the effects, label and icon, as before

  return (
    <div className="player" ref={playerRef}>
      <video
        ref={videoRef}
        // … the attributes and the events up to onEnded, as before
        onLoadedMetadata={() => {
          setDuration(videoRef.current.duration)
          resume.restore()
        }}
        onTimeUpdate={() => {
          setTime(videoRef.current.currentTime)
          resume.save()
        }}
        // … onVolumeChange, onRateChange and onError, as before
      >
        {/* … the <track>, as before */}
      </video>

      {/* … the error message, as before */}

      {resume.resumedAt !== null && (
        <p className="player__notice" role="status">
          Picking up where you left off, at {formatTime(resume.resumedAt)}.
          <button type="button" onClick={resume.startOver}>
            Start over
          </button>
        </p>
      )}

      {/* … the control row, as before */}
    </div>
  )
}

export default VideoPlayer
```

`resume` is the object the hook gave back: `resume.restore()` calls the hook's `restore` function, and
`resume.resumedAt` is the hook's state. `role="status"` makes screen readers read the strip out politely, after
finishing the sentence they are on.

:::check Check
Start the first clip, wait until it is at about 0:12, and reload the page (++F5++). The player is not at 0:00 but where
you left off: a strip above the bar says "Picking up where you left off, at 0:12.", with a "Start over" button next to
it. Click it: the time is 0:00, and the strip disappears. You can see the saved positions in the developer tools too:
++F12++ → Application → Local Storage, under keys starting with `popcorn-player:`.
:::

:::mistake Common mistake
Putting the jump back into a `useEffect` that runs when the component appears. Nothing happens: at that moment the video
has not loaded its metadata yet, `duration` is `NaN`, and every comparison with `NaN` is false (`saved < NaN - 1` too).
The video tells you itself when it is ready: `onLoadedMetadata` is the place.
:::

### Picture-in-picture

[[Picture-in-picture]] mode (PiP for short) puts the video into a small floating window that stays on top of everything else: you can
watch while you work in another tab or program. The [[Picture-in-Picture API]] opens it with
`video.requestPictureInPicture()`, closes it with `document.exitPictureInPicture()`, and
`document.pictureInPictureElement` tells you which video is in the small window right now.

Not every browser can do it: Firefox, for example, offers it with a button of its own, but gives pages no function for
it. `document.pictureInPictureEnabled` is true if the page may use it. If not, we do not even show the button: feature
detection again.

Users can also close the small window with its own close button. For our button to follow that too, we listen to two
events of the video: `enterpictureinpicture` and `leavepictureinpicture`. React has no `on…` props for these (it does
not know every event), so an effect adds listeners for them with `addEventListener`, just like for `fullscreenchange`.
Here is the whole `src/components/VideoPlayer.jsx` at the end of the lesson:

```jsx file=src/components/VideoPlayer.jsx mark=9-10,27,98-108,119-134,253-263
import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon.jsx'
import { formatTime } from '../formatTime.js'
import useResumePosition from '../useResumePosition.js'
import SeekBar from './SeekBar.jsx'
import VolumeControl from './VolumeControl.jsx'
import SpeedSelect from './SpeedSelect.jsx'

// Can this browser put a video in a small floating window?
const CAN_PIP = document.pictureInPictureEnabled === true

function VideoPlayer({ clip, autoPlay, onEnded }) {
  // Boxes for the real elements: React puts them in after drawing.
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  // These only follow the video: its events keep them up to date.
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [captionsOn, setCaptionsOn] = useState(false)
  const [pip, setPip] = useState(false)
  const resume = useResumePosition(videoRef, `popcorn-player:${clip.id}`)

  function togglePlay() {
    const video = videoRef.current
    if (video.paused) {
      // play() returns a Promise, which is rejected if the video cannot play.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  function seek(seconds) {
    videoRef.current.currentTime = seconds
    // Straight away, so the slider does not jump back until the next timeupdate.
    setTime(seconds)
    // After a jump we are no longer at the end.
    setEnded(false)
  }

  function seekBy(seconds) {
    const video = videoRef.current
    // Before the video has loaded, its length is unknown: there is nowhere to jump.
    if (!Number.isFinite(video.duration)) return
    // Not before the start, and not past the end.
    seek(Math.min(Math.max(video.currentTime + seconds, 0), video.duration))
  }

  function changeVolume(value) {
    const video = videoRef.current
    video.volume = value
    // At 0 the video is muted; moving the slider up turns the sound back on.
    video.muted = value === 0
  }

  function toggleMute() {
    const video = videoRef.current
    // Unmuting at volume 0 would still be silent, so the volume goes back to half.
    if (video.muted && video.volume === 0) video.volume = 0.5
    video.muted = !video.muted
  }

  function changeRate(value) {
    videoRef.current.playbackRate = value
  }

  async function toggleFullscreen() {
    const player = playerRef.current
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (player.requestFullscreen) {
        await player.requestFullscreen()
      } else {
        // iPhone: only the video itself can go full screen, with the phone's own buttons.
        videoRef.current.webkitEnterFullscreen()
      }
    } catch {
      // The browser said no: the player simply stays as it is.
    }
  }

  function toggleCaptions() {
    // The first (and only) text track of the video.
    const track = videoRef.current.textTracks[0]
    const show = track.mode !== 'showing'
    track.mode = show ? 'showing' : 'hidden'
    setCaptionsOn(show)
  }

  async function togglePip() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch {
      // For example before the video has loaded: the browser says no.
    }
  }

  // Full screen can also end without our button (Esc), so we listen to the browser.
  useEffect(() => {
    function handleChange() {
      setFullscreen(document.fullscreenElement === playerRef.current)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  // The small window can also be closed with its own X, so we listen to the video.
  useEffect(() => {
    const video = videoRef.current
    function handleEnter() {
      setPip(true)
    }
    function handleLeave() {
      setPip(false)
    }
    video.addEventListener('enterpictureinpicture', handleEnter)
    video.addEventListener('leavepictureinpicture', handleLeave)
    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnter)
      video.removeEventListener('leavepictureinpicture', handleLeave)
    }
  }, [])

  // Keyboard shortcuts on the whole page.
  useEffect(() => {
    function handleKeyDown(event) {
      // Ctrl, Alt and Cmd combinations belong to the browser (Ctrl + F is search).
      if (event.ctrlKey || event.altKey || event.metaKey) return
      // Keys that the focused element uses itself stay with it.
      const tag = event.target.tagName
      if (tag === 'SELECT') return
      if (tag === 'INPUT' && event.key.startsWith('Arrow')) return
      if (tag === 'BUTTON' && event.key === ' ') return
      // A held key repeats keydown: the arrows may keep seeking, the other keys count only once
      // (but a held space bar must not scroll the page meanwhile).
      if (event.repeat && !event.key.startsWith('Arrow')) {
        if (event.key === ' ') event.preventDefault()
        return
      }

      if (event.key === ' ' || event.key === 'k' || event.key === 'K') togglePlay()
      else if (event.key === 'ArrowLeft') seekBy(-5)
      else if (event.key === 'ArrowRight') seekBy(5)
      else if (event.key === 'm' || event.key === 'M') toggleMute()
      else if (event.key === 'f' || event.key === 'F') toggleFullscreen()
      else return // not one of ours: the browser does what it usually does
      event.preventDefault()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  let label = 'Play'
  let icon = 'play'
  if (ended) {
    label = 'Play again'
    icon = 'replay'
  } else if (playing) {
    label = 'Pause'
    icon = 'pause'
  }

  return (
    <div className="player" ref={playerRef}>
      <video
        ref={videoRef}
        className="player__video"
        src={clip.src}
        autoPlay={autoPlay}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setEnded(true)
          onEnded()
        }}
        onLoadedMetadata={() => {
          setDuration(videoRef.current.duration)
          resume.restore()
        }}
        onTimeUpdate={() => {
          setTime(videoRef.current.currentTime)
          resume.save()
        }}
        onVolumeChange={() => {
          setVolume(videoRef.current.volume)
          setMuted(videoRef.current.muted)
        }}
        onRateChange={() => setRate(videoRef.current.playbackRate)}
        onError={() => setFailed(true)}
      >
        {clip.captions && <track kind="subtitles" src={clip.captions} srcLang="en" label="English" />}
      </video>

      {failed && (
        <p className="player__error" role="alert">
          The video could not be loaded. Check your internet connection, then reload the page.
        </p>
      )}

      {resume.resumedAt !== null && (
        <p className="player__notice" role="status">
          Picking up where you left off, at {formatTime(resume.resumedAt)}.
          <button type="button" onClick={resume.startOver}>
            Start over
          </button>
        </p>
      )}

      <div className="player__controls">
        <SeekBar time={time} duration={duration} onSeek={seek} />
        <button type="button" className="player__button" onClick={togglePlay} aria-label={label}>
          <Icon name={icon} />
        </button>
        <span className="player__time">
          {formatTime(time)} / {formatTime(duration)}
        </span>
        <VolumeControl
          volume={volume}
          muted={muted}
          onVolumeChange={changeVolume}
          onToggleMute={toggleMute}
        />
        <SpeedSelect rate={rate} onChange={changeRate} />
        {clip.captions && (
          <button
            type="button"
            className="player__button"
            onClick={toggleCaptions}
            aria-label="Subtitles"
            aria-pressed={captionsOn}
          >
            <Icon name="captions" />
          </button>
        )}
        {CAN_PIP && (
          <button
            type="button"
            className="player__button"
            onClick={togglePip}
            aria-label="Picture-in-picture"
            aria-pressed={pip}
          >
            <Icon name="pip" />
          </button>
        )}
        <button
          type="button"
          className="player__button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
        >
          <Icon name={fullscreen ? 'exitFullscreen' : 'fullscreen'} />
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer
```

- `CAN_PIP` is outside the component, so it is worked out only once, when the file loads: what the browser can do does
  not change in the meantime.
- The PiP effect takes the video out of the box at the start (`const video = videoRef.current`), and the cleanup uses
  that same variable. This way it surely removes the listeners from the very element it added them to.
- `togglePip` is built just like `toggleFullscreen`: a Promise, `await`, `try/catch`.

:::check Check
In Chrome and Edge, a new icon has appeared between "CC" and full screen (in Firefox it is not there: that is feature
detection at work). Start the video and click it: the video moves into a small floating window, the player's place
turns black with the browser's message on it (in Chrome: "Playing in picture-in-picture"), and the button turns
turquoise. Switch to another tab: the small window stays. Close it with its own X: the button switches back.
Congratulations, the Popcorn Player is ready!
:::

:::mistake Common mistake
Trying to listen with `onEnterPictureInPicture` on the `<video>`. The button never turns turquoise, and the console
says: "Unknown event handler property `onEnterPictureInPicture`. It will be ignored." React has `on…` props only for
the common events; for the rest, `addEventListener` in an effect it is.
:::

:::concept The key starts everything over
In the playlist, `key={clip.id}` gives every clip a brand-new `<video>` element. That is simple and clean, but it starts
everything over: the volume, the speed, the subtitles, and if the player was in full screen, or the video was playing in
the small window, that closes too when the clip changes, because it belonged to the old element. That is why a big video
site keeps one single `<video>` element and only swaps its `src`, resetting every piece of state by hand in return. If
you want the volume and the subtitles to survive a change of clip, [[lift them up|lifting state up]] into `App` and
pass them down as props, as you saw with the slider of lesson 3: it is a good exercise.
:::
