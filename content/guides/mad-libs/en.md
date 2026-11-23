# What we build

A word game you probably know from childhood: the player types a few words (a name, an animal, a verb) without
knowing where they will go, and at the press of a button the story they ended up in is revealed. It is usually very
funny. On the way you learn how React handles lots of text fields at once, how a program builds text out of pieces,
and how a component decides what to show and what to hide.

:::levels
- Three fields (name, animal, verb), and the words you type turn into a funny story. | about 2 hours
- More stories with a random pick, fields made from a template, starting over and highlighted words. | about 2 hours
- Your own templates with `{noun}` fields, a shareable link, reading aloud and a two-player mode. | about 3 hours
:::

**Before you start you need:** the first three lessons. In lesson 1 (Me, Myself & React) you met components, props,
JSX, `useState`, `useEffect` and your first form; in lesson 3 (Password Generator) the slider, checkboxes, the
clipboard, derived values and lifting state up. Where we build on these, we recall them in a sentence or two, and
everything new is explained step by step.

## Beginner level {level=1}

### Before you start

Download the lesson's **starter** (above: "Download starter"), unzip it, and open the `mad-libs` folder in your
editor. If you did the earlier lessons, you already have Node.js and VS Code; if not, step 0 of lesson 1 shows how to
install them. Then type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white card in the middle of the page
with the title "Mad Libs" in violet. Nothing else is on it yet: the game is yours to write.
:::

The starter has two files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready. This lesson is about React, not CSS, so again you do not write
  styles: you only use the class names (`fields`, `field`, `story`, `chip`, …) that the steps give you. Have a look
  inside anyway!

Like in the earlier lessons, the folder is a git repository with one commit, the starting point: `git restore .` takes every file
back, and it is worth committing after every step that works (`git add .`, then `git commit -m "Three fields"`).

:::concept A quick recap
A [[component]] is a function that returns [[JSX]], the HTML-like description of what should appear on the screen. It
gets data from outside through its [[props]], and remembers things with [[useState]]: when a state value changes,
React draws the component again. An [[event handler]] (the function of an `onChange` or an `onClick`, for example)
runs when something happens on the page. If any of this feels unfamiliar, take another look at lesson 1.
:::

### Three fields, one state

The game needs words first: a name, an animal and a verb. Each will be a text field, and each will be a
[[controlled input]]. You met these in lesson 1's contact form and lesson 3's slider; now let us look closely at what
happens on a single key press:

1. You type a letter. The browser tells React "the field changed", and React calls the function given to
   `onChange`, `update`.
2. `update` saves the new text in the state with `setWords`.
3. React draws the component again, and the field gets the text back from its `value` prop, that is, from the state.

So the field does not keep its own text: it always shows what is in the state. The truth lives in one place, and
React knows at any moment what the fields contain. That is what we need to turn the words into a story later.

Change `src/App.jsx` to this (the highlighted lines are new):

```jsx file=src/App.jsx mark=1,5,7-10,15-30
import { useState } from 'react'
import './App.css'

function App() {
  const [words, setWords] = useState({ name: '', animal: '', verb: '' })

  // One function for all three fields: the field's name tells it which word to update.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <form className="word-form">
        <div className="fields">
          <label className="field">
            <span className="field__label">A name</span>
            <input name="name" value={words.name} onChange={update} placeholder="e.g. Alex" />
          </label>
          <label className="field">
            <span className="field__label">An animal</span>
            <input name="animal" value={words.animal} onChange={update} placeholder="e.g. giraffe" />
          </label>
          <label className="field">
            <span className="field__label">A verb</span>
            <input name="verb" value={words.verb} onChange={update} placeholder="e.g. dance" />
          </label>
        </div>
      </form>
    </main>
  )
}

export default App
```

- The three words live in one [[object]]: `{ name: '', animal: '', verb: '' }`. Each starts as an empty string.
- `update` serves all three fields, as in lesson 1's form. `event.target` is the field that was typed into; its
  `name` attribute (`'name'`, `'animal'` or `'verb'`) says which key to update, and its `value` is the field's new
  text.
- `{ ...words, … }` is the [[spread]]: it copies the old object and overwrites the one key that changed. We never
  change the state directly; we always give `setWords` a new object.
- `placeholder` is grey example text in an empty field; it disappears as soon as you start typing.
- Because the `<label>` wraps the field, clicking the label puts the cursor in the field too.

:::check Check
Under the title there are three fields side by side (one under the other in a narrow window), with grey examples in
them: "e.g. Alex", "e.g. giraffe", "e.g. dance". You can type in all three.
:::

:::mistake Common mistake
A field without a `name` attribute, the verb's for example: you cannot type in it. `event.target.name` is then an
empty string, so `update` saves the letter under a key with an empty name, and `words.verb` does not change. The field
shows the state, so it stays empty.
:::

:::try Try it
Add this under `</form>`: `<pre>{JSON.stringify(words, null, 2)}</pre>`. `JSON.stringify` turns the object into
text in [[JSON]] format (the way JavaScript writes objects and arrays down as text); `null, 2` only makes it indented
and spread over several lines. `<pre>` shows the text as it is, line breaks and all. So you can see the state on the
screen: type, and watch it change letter by letter. Then delete the line.
:::

### A story from the words

Now for the story. There are two ways to build text out of pieces. One is [[concatenation]] with `+`: between two
strings, `+` makes one string out of them. The other is the [[template literal]] you saw in lesson 1, in the
`mailto:` link: inside backticks, whatever is inside `${…}` is put in its place. Both give the same result:

:::compare
```js label="Concatenation with +"
const greeting = 'Hi, ' + name + '! You got ' + count + ' messages today.'
```
```js label="Template literal" now
const greeting = `Hi, ${name}! You got ${count} messages today.`
```
:::

The template literal is easier to read: no opening and closing quotes all the time, and the spaces are easier to
see. Our long story uses both anyway: three template literals, one per line, and `+` joins them, so the code does not
become one endless line. Add to `src/App.jsx`:

```jsx file=src/App.jsx mark=7-11,37-39
import { useState } from 'react'
import './App.css'

function App() {
  const [words, setWords] = useState({ name: '', animal: '', verb: '' })

  // The story is made from the words, again at every drawing.
  const story =
    `${words.name} woke up one morning to find a giant ${words.animal} sitting on the end of the bed, ` +
    `desperate to ${words.verb}. There was nothing for it: they spent all morning trying to ` +
    `${words.verb} together, until the neighbours clapped.`

  // One function for all three fields: the field's name tells it which word to update.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <form className="word-form">
        <div className="fields">
          <label className="field">
            <span className="field__label">A name</span>
            <input name="name" value={words.name} onChange={update} placeholder="e.g. Alex" />
          </label>
          <label className="field">
            <span className="field__label">An animal</span>
            <input name="animal" value={words.animal} onChange={update} placeholder="e.g. giraffe" />
          </label>
          <label className="field">
            <span className="field__label">A verb</span>
            <input name="verb" value={words.verb} onChange={update} placeholder="e.g. dance" />
          </label>
        </div>
      </form>
      <article className="story">
        <p className="story__text">{story}</p>
      </article>
    </main>
  )
}

export default App
```

`story` is not state but a [[derived value]], like the strength meter in lesson 3: it follows from the words, so we
simply work it out again at every drawing. Every key press means a new drawing, so the story always shows the latest
words. Notice the space at the end of the first two lines, before the closing backtick: `+` puts nothing between the
pieces, so you have to type the space yourself.

:::check Check
Under the fields, in a cream-coloured box, there is the story, with gaps for now: "woke up one morning to find a giant
sitting on the end of the bed…". (If your words from the last step are still in the fields, the story shows them
straight away: React keeps the state when you save. Delete them to see the gaps.) Type into the fields: the words
appear in the story letter by letter.
:::

:::mistake Common mistake
A normal quote (`'`) instead of a backtick. Then `${words.name}` is not replaced: it stays in the story word for
word, with the dollar sign and the curly brackets. `${…}` only works between backticks. On most keyboards the
backtick is the key to the left of ++1++.
:::

:::try Task
Add a fourth word to the game: a place. You need to change three places: the starting state (`place: ''`), a new
field (`name="place"`, labelled "A place", with the example "e.g. in the fridge"), and the story, for example like
this: `until the neighbours ${words.place} clapped`. The next steps carry on with the three-word version.
:::

### Words first, then the story

This is not real Mad Libs yet: the player sees the story while typing. The story should appear when all the words are
in and the player presses the button. That needs a new piece of state, `revealed`: `false` while we fill in the
fields, and `true` when we show the story.

What is on the screen now depends on this state: that is [[conditional rendering]]. This time the
[[ternary operator]] does it, the one you used in lesson 3's strength meter to choose a class name:
`{condition ? (this) : (that)}`. If the condition is true, the first part appears; if
it is false, the second. In lessons 1 and 3 you also used `&&`: `{condition && (this)}` either appears or nothing
does. `? :` is for when one of two things is always on the screen.

```jsx file=src/App.jsx mark=6,19-22,27-38,53-57,59
import { useState } from 'react'
import './App.css'

function App() {
  const [words, setWords] = useState({ name: '', animal: '', verb: '' })
  const [revealed, setRevealed] = useState(false)

  // The story is made from the words, again at every drawing.
  const story =
    `${words.name} woke up one morning to find a giant ${words.animal} sitting on the end of the bed, ` +
    `desperate to ${words.verb}. There was nothing for it: they spent all morning trying to ` +
    `${words.verb} together, until the neighbours clapped.`

  // One function for all three fields: the field's name tells it which word to update.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // stop the browser from reloading the page
    setRevealed(true)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      {revealed ? (
        <article className="story">
          <p className="story__text">{story}</p>
          <div className="actions">
            <button type="button" onClick={() => setRevealed(false)}>
              Change the words
            </button>
          </div>
        </article>
      ) : (
        <form className="word-form" onSubmit={reveal}>
          <p className="hint">Type a word into each field! Where they end up is only revealed at the end.</p>
          <div className="fields">
            <label className="field">
              <span className="field__label">A name</span>
              <input name="name" value={words.name} onChange={update} placeholder="e.g. Alex" />
            </label>
            <label className="field">
              <span className="field__label">An animal</span>
              <input name="animal" value={words.animal} onChange={update} placeholder="e.g. giraffe" />
            </label>
            <label className="field">
              <span className="field__label">A verb</span>
              <input name="verb" value={words.verb} onChange={update} placeholder="e.g. dance" />
            </label>
          </div>
          <div className="actions">
            <button type="submit" className="button--primary">
              Show the story
            </button>
          </div>
        </form>
      )}
    </main>
  )
}

export default App
```

- A `type="submit"` button submits the form, and that runs its `onSubmit` function, `reveal`. Pressing Enter in any
  of the fields does the same.
- `event.preventDefault()` is familiar from lesson 1's form: without it, the browser would reload the page on submit.
- The "Change the words" button has `type="button"`: a plain button that submits nothing. Its `onClick` is a small
  [[arrow function]] that sets `revealed` back to `false`.

And here is the big advantage of controlled inputs. When the story appears, the form and its fields leave the page.
Yet the words are not lost, because they do not live in the fields but in `App`'s state. When "Change the words"
brings the form back, the new fields get the old words straight back from their `value`.

:::check Check
The story has gone; above the fields there is a short instruction, and under them the violet "Show the story" button.
Fill in the fields and click the button (or press ++Enter++ in a field): the story appears where the form was. "Change
the words" brings the form back, with your words in it.
:::

:::mistake Common mistake
Leaving out `event.preventDefault()`. Then clicking the button makes the page flash and reload, and a reload resets
everything: the fields are empty, and the story does not appear either.
:::

:::try Try it
Rewrite the `? :` part as two `&&`s: `{revealed && (…)}` for the story and `{!revealed && (…)}` for the form (`!`
means "not"). It works the same. Which one do you find easier to read?
:::

### Only when every field is filled in

Right now you can press the button with empty fields, and the story is full of holes. The button should be disabled
while any field is empty, and a small counter next to it should show how many fields are filled in.

But what counts as filled in? A space is not a word. [[trim]] cuts the spaces off the start and the end of a string:
`'  giraffe '.trim()` gives `'giraffe'`, and `'   '.trim()` gives `''`, an empty string. This is the last version of
`src/App.jsx` at the beginner level:

```jsx file=src/App.jsx mark=8-11,26,59,62-64
import { useState } from 'react'
import './App.css'

function App() {
  const [words, setWords] = useState({ name: '', animal: '', verb: '' })
  const [revealed, setRevealed] = useState(false)

  // How many fields have something in them? A word made of spaces only does not count.
  const filledCount = Object.values(words).filter((word) => word.trim() !== '').length
  const total = Object.keys(words).length
  const complete = filledCount === total

  // The story is made from the words, again at every drawing.
  const story =
    `${words.name} woke up one morning to find a giant ${words.animal} sitting on the end of the bed, ` +
    `desperate to ${words.verb}. There was nothing for it: they spent all morning trying to ` +
    `${words.verb} together, until the neighbours clapped.`

  // One function for all three fields: the field's name tells it which word to update.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (complete) setRevealed(true)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      {revealed ? (
        <article className="story">
          <p className="story__text">{story}</p>
          <div className="actions">
            <button type="button" onClick={() => setRevealed(false)}>
              Change the words
            </button>
          </div>
        </article>
      ) : (
        <form className="word-form" onSubmit={reveal}>
          <p className="hint">Type a word into each field! Where they end up is only revealed at the end.</p>
          <div className="fields">
            <label className="field">
              <span className="field__label">A name</span>
              <input name="name" value={words.name} onChange={update} placeholder="e.g. Alex" />
            </label>
            <label className="field">
              <span className="field__label">An animal</span>
              <input name="animal" value={words.animal} onChange={update} placeholder="e.g. giraffe" />
            </label>
            <label className="field">
              <span className="field__label">A verb</span>
              <input name="verb" value={words.verb} onChange={update} placeholder="e.g. dance" />
            </label>
          </div>
          <div className="actions">
            <button type="submit" className="button--primary" disabled={!complete}>
              Show the story
            </button>
            <span className="progress" aria-live="polite">
              {filledCount} / {total} fields filled
            </span>
          </div>
        </form>
      )}
    </main>
  )
}

export default App
```

- `Object.values(words)` gives the three words in an array, `filter` keeps those that are not empty after `trim()`,
  and `length` counts them. In lesson 3 you counted the ticked checkboxes the same way. `!==` means "not equal".
- `Object.keys(words)` gives the keys (`['name', 'animal', 'verb']`); their number is the number of fields: 3.
- `complete` is true when every field is filled in. All three values are derived; none of them needs to be state.
- `disabled={!complete}` disables the button while `complete` is false. With a disabled button, Enter does not submit
  the form either, but `reveal` still checks `complete`: that way the rule lives in the function itself, not only on
  the button.
- `aria-live="polite"` is familiar from lesson 3: screen readers read the counter out when it changes.

:::check Check
React keeps what is in the fields when you save, so first reload the page (++F5++) so that the fields start empty. The
button is grey, and next to it: "0 / 3 fields filled". As you fill in the fields the number grows, and at the third
word the button turns violet again and works. Type only spaces into one of the fields: they do not count. The
beginner level is done: commit it!
:::

:::mistake Common mistake
`word !== ''` without `trim()`. Then a single space already counts as a filled field, and the story is left with an
empty hole where the word should be.
:::

:::try Task
When only one field is missing, show "Just one more!" next to the counter. All it takes is an `&&` and a condition:
`filledCount === total - 1`.
:::

## Intermediate level {level=2}

### Fields from a template

Right now the story is baked into the code, and we wrote the fields one by one, by hand. A new story would mean
changing the code in three places. A [[template]] is much better: a plain string in which the words to fill in are
replaced by the field's name in curly brackets, for example: `A {animal} wants to {verb}.` The program finds the
fields in it by itself, and makes a text field for each one. A new story then only needs a new string.

We have to cut the template into plain text and field names. We use a little trick for that.
`replaceAll('}', '{')` swaps every `}` for a `{`, and `split('{')` cuts the string into pieces at every `{` and
returns the pieces in an [[array]]:

```js
'A {animal} wants to {verb}.'.replaceAll('}', '{')  // 'A {animal{ wants to {verb{.'
'A {animal{ wants to {verb{.'.split('{')            // ['A ', 'animal', ' wants to ', 'verb', '.']
```

Look at the array: plain text and field names take turns. The even positions (0, 2, 4…) hold plain text, the odd ones
(1, 3, 5…) the field names. This holds even when the template starts with a field: then the first piece is an empty
string. Create a `template.js` file in the `src` folder:

```js file=src/template.js
// The pieces of a template: every } becomes a {, and we cut the text at every {.
// 'A {animal} wants to {verb}.' → ['A ', 'animal', ' wants to ', 'verb', '.']
// The odd positions (1, 3, 5…) hold the field names, the even ones the plain text.
export function splitTemplate(text) {
  return text.replaceAll('}', '{').split('{')
}

// The template's fields, each only once, in the order they first appear.
export function fieldsOf(text) {
  const names = splitTemplate(text).filter((part, i) => i % 2 === 1)
  return Array.from(new Set(names))
}

// The finished story: every field name is replaced by the word typed for it.
export function fillTemplate(text, words) {
  return splitTemplate(text)
    .map((part, i) => (i % 2 === 1 ? words[part] : part))
    .join('')
}
```

- The second parameter of `filter`, `i`, tells you which element you are at, just like with `map` in the strength
  meter. `%` is the [[modulo]], the remainder of a division (you may have met it in lesson 3's advanced level):
  `5 % 2` is 1, `4 % 2` is 0. So `i % 2` is 1 for an odd `i` and 0 for an even one, and `i % 2 === 1` is true at the
  odd positions.
- A field can appear more than once in a template (in our story `{verb}` appears twice), but it only has to be filled
  in once. That is what a [[Set]] is good for. If you did lesson 3's advanced level, you used one there because `has`
  tells you at once whether something is in it. Now we need another of its properties: it keeps every value only
  once, and drops the repeats. `Array.from` turns the set back into an array, because `map`, `filter` and `length`
  work on arrays, not on sets.
- `fillTemplate` goes through the pieces with `map`: it puts the word in place of each field name (`words[part]`) and
  leaves the plain text as it is. At the end `join('')` glues the pieces into one string. If a field is still empty,
  `words[part]` is `undefined`, but `join` treats `undefined` as an empty string, so it does not show up in the story.

The stories go into a file of their own: create `src/stories.js`. For now it has a single story, the beginner level's
story, only now as a template:

```js file=src/stories.js
// The story templates. The player's words go where the {words in curly brackets} are.
// The same field can appear more than once: it only has to be filled in once.
export const STORIES = [
  {
    id: 'guest',
    title: 'The Morning Guest',
    text:
      '{name} woke up one morning to find a giant {animal} sitting on the end of the bed, desperate to {verb}. ' +
      'There was nothing for it: they spent all morning trying to {verb} together, until the neighbours clapped.',
  },
]

// Examples for the fields: they appear in grey in an empty field.
export const HINTS = {
  name: 'e.g. Alex',
  animal: 'e.g. giraffe',
  verb: 'e.g. dance',
}
```

We write the field names in lowercase, as words in the middle of a sentence are. The labels still show them with a
capital letter: `App.css` takes care of that (`.field__label::first-letter`).

Now change `src/App.jsx` so that it works from the template: the fields are made with a `map` from the `fields` array,
and the story comes from `fillTemplate`. The old `story` text and `total` go.

```jsx file=src/App.jsx mark=2-3,6-7,10,13-14,16-17,19,34-35,46-56,63
import { useState } from 'react'
import { HINTS, STORIES } from './stories.js'
import { fieldsOf, fillTemplate } from './template.js'
import './App.css'

// For now we play with the first story.
const story = STORIES[0]

function App() {
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // The fields come from the template: ['name', 'animal', 'verb'].
  const fields = fieldsOf(story.text)
  // How many fields have something in them? A word made of spaces only does not count.
  const filledCount = fields.filter((field) => (words[field] || '').trim() !== '').length
  const complete = filledCount === fields.length

  // One function for every field: the field's name tells it which word to update.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (complete) setRevealed(true)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      {revealed ? (
        <article className="story">
          <h2>{story.title}</h2>
          <p className="story__text">{fillTemplate(story.text, words)}</p>
          <div className="actions">
            <button type="button" onClick={() => setRevealed(false)}>
              Change the words
            </button>
          </div>
        </article>
      ) : (
        <form className="word-form" onSubmit={reveal}>
          <p className="hint">Type a word into each field! Where they end up is only revealed at the end.</p>
          <div className="fields">
            {fields.map((field) => (
              <label key={field} className="field">
                <span className="field__label">{field}</span>
                <input
                  name={field}
                  value={words[field] || ''}
                  onChange={update}
                  placeholder={HINTS[field]}
                />
              </label>
            ))}
          </div>
          <div className="actions">
            <button type="submit" className="button--primary" disabled={!complete}>
              Show the story
            </button>
            <span className="progress" aria-live="polite">
              {filledCount} / {fields.length} fields filled
            </span>
          </div>
        </form>
      )}
    </main>
  )
}

export default App
```

- `words` now starts as an empty object (`{}`), because we do not type in the field names: the template decides them.
- Until a field has been typed into, `words[field]` is `undefined`. `|| ''` means "or an empty string if there is
  nothing", like `|| '/'` in lesson 1's `useHashRoute`. So the field always gets a string, and `trim()` does not trip
  over `undefined` either.
- Thanks to `name={field}`, `update` works unchanged: the key is now a field name, for example `'animal'`.
- `HINTS[field]` is the example for the field. If a field has no example, the value is `undefined`, and the field
  simply appears without one.

:::check Check
The page looks almost the same as before, but the labels now come from the template: "Name", "Animal", "Verb", and the
finished story has its title above it, "The Morning Guest". If the story is showing, go back with "Change the words".
Now add a new field to the text in `src/stories.js`, for example `a giant {colour} {animal}` instead of
`a giant {animal}`, and save: a fourth field appears, and the counter now counts four fields ("3 / 4" if you filled in
the other three). Then take it out again.
:::

:::mistake Common mistake
`value={words[field]}`, without `|| ''`. While the field is empty, `value` is `undefined`, and React then treats the
field as an [[uncontrolled input]]: the browser keeps its text itself. At the first letter it becomes controlled, and
a warning appears in the console (++F12++): "A component is changing an uncontrolled input to be controlled". With
`|| ''` the field is controlled from the very first moment.
:::

:::try Try it
In the template, change the second `{verb}` to `{Verb}`. It becomes a separate field, with the labels "Verb" and
"Verb": the computer only treats exactly identical names as the same field, and upper and lower case count too. Then
change it back.
:::

### More stories, and a random pick

One story gets boring quickly. Change `src/stories.js`: two new stories go into it, and `HINTS` grows with examples
for the new fields.

```js file=src/stories.js mark=11-26,34-40
// The story templates. The player's words go where the {words in curly brackets} are.
// The same field can appear more than once: it only has to be filled in once.
export const STORIES = [
  {
    id: 'guest',
    title: 'The Morning Guest',
    text:
      '{name} woke up one morning to find a giant {animal} sitting on the end of the bed, desperate to {verb}. ' +
      'There was nothing for it: they spent all morning trying to {verb} together, until the neighbours clapped.',
  },
  {
    id: 'first-app',
    title: 'My First React App',
    text:
      '{name} built their very first React app: a {adjective} button that made {number} {animal} clones appear ' +
      'on the screen with every click. Their mentor only said: ' +
      '“{exclamation}! That is not a bug, it is a {colour} feature.”',
  },
  {
    id: 'holiday',
    title: 'Summer Holiday',
    text:
      'This summer we went on holiday {place}. Every morning we had {food} for breakfast, and our neighbour, a retired ' +
      '{job}, started to {verb} whenever they saw us. ' +
      'On the way home the whole bus sang: “{exclamation}, {place}!”',
  },
]

// Examples for the fields: they appear in grey in an empty field.
export const HINTS = {
  name: 'e.g. Alex',
  animal: 'e.g. giraffe',
  verb: 'e.g. dance',
  adjective: 'e.g. sticky',
  number: 'e.g. 42',
  exclamation: 'e.g. Hooray',
  colour: 'e.g. lemon yellow',
  place: 'e.g. in the fridge',
  food: 'e.g. pancakes',
  job: 'e.g. firefighter',
}
```

Every story has an `id`: a short, unique name that never changes and that the code uses to refer to it. The story
picker goes above the form and is made of chips, small rounded buttons. Create a `components` folder in `src`, and in it a
`StoryPicker.jsx` file:

```jsx file=src/components/StoryPicker.jsx
function StoryPicker({ stories, selectedId, onSelect, onRandom }) {
  return (
    <div className="picker">
      <span className="picker__label">Choose a story</span>
      <div className="chips">
        {stories.map((story) => (
          <button
            key={story.id}
            type="button"
            className="chip"
            aria-pressed={story.id === selectedId}
            onClick={() => onSelect(story.id)}
          >
            {story.title}
          </button>
        ))}
        <button type="button" className="chip chip--random" onClick={onRandom}>
          Random
        </button>
      </div>
    </div>
  )
}

export default StoryPicker
```

`aria-pressed` says whether a button is pressed in, like a switch. Screen readers read it out ("pressed"), and
`App.css` uses it to colour the chosen chip violet. The picker does not know which story is active: `App` tells it in
the `selectedId` prop, and it reports back through the `onSelect` function when the player chooses another. This is
[[lifting state up]] from lesson 3: the state lives in `App`, because the game needs it too.

In `App`, `STORIES[0]` is replaced by a piece of state: the chosen story's `id`. **Delete** the
`const story = STORIES[0]` line at the top of the file, together with the comment above it, add the `StoryPicker`
import under the other imports, then change the start of the function and the start of the `return` like this. Where
a comment starts with `…`, everything stays as it was:

```jsx file=src/App.jsx mark=4,8,12-13,18-23,28
import { useState } from 'react'
import { HINTS, STORIES } from './stories.js'
import { fieldsOf, fillTemplate } from './template.js'
import StoryPicker from './components/StoryPicker.jsx'
import './App.css'

function App() {
  const [storyId, setStoryId] = useState(STORIES[0].id)
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // The chosen story: the one whose id matches.
  const story = STORIES.find((item) => item.id === storyId)
  // The fields come from the template: ['name', 'animal', 'verb'].
  const fields = fieldsOf(story.text)
  // … filledCount, complete, update and reveal, as before

  function pickRandom() {
    // We only draw from the other stories, so that a different one always comes up.
    const others = STORIES.filter((item) => item.id !== storyId)
    const next = others[Math.floor(Math.random() * others.length)]
    setStoryId(next.id)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <StoryPicker stories={STORIES} selectedId={storyId} onSelect={setStoryId} onRandom={pickRandom} />
      {/* … the story or the form, as before … */}
    </main>
  )
}

export default App
```

- `find` is familiar from lesson 1: it returns the first element for which the condition is true.
- `pickRandom` uses lesson 3's [[Math.random]] and [[Math.floor]] for a random position. It filters out the current
  story first, so the "Random" button always brings a different one.
- `onSelect={setStoryId}` passes the setter function itself: the picker's `onSelect(story.id)` call runs
  `setStoryId(story.id)` directly.

:::check Check
Under the title: "Choose a story", and four chips: the three stories (the first one violet) and the dashed "Random".
Click "Summer Holiday": different fields appear (Place, Food, Job…). "Random" picks a different story on every click.

Something is odd, though. Choose "The Morning Guest" again, type a name, and switch to "My First React App": the name
is still there, because this story
has a `{name}` too. What is more, if a story is already showing and you choose another one, the new story appears
straight away, half full of holes. We fix this in the next step.
:::

:::mistake Common mistake
Drawing from the whole `STORIES` array instead of `others`. Then one time in three "Random" gives the same story, and
it looks as if the button did nothing.
:::

:::try Task
Write a fourth story at the end of the `STORIES` array, with its own `id`, title and fields. Its chip appears in the
picker by itself, and its fields are made from its template: you do not have to write a single line in the
components.
:::

### A clean slate: key and starting over

Why did the words stay? Because `words` and `revealed` are `App`'s state, and `App` stays the same whichever story you
choose. The fix: the game gets a component of its own, `MadLib`, and we label it with the story's `id`.

[[key]] is familiar already: in lesson 1 the list items got one, and in lesson 3 the copy button, so that it started
with a clean slate for a new password. When it draws, React compares the new JSX with the previous one, and if it
finds the same kind of component in the same place, it keeps its state. But if the `key` changes, React treats it as a
different component: it throws away the old one along with its state, and creates a brand-new one, with fresh starting
state. So if `MadLib` gets the story's `id` as its `key`, every story starts with a clean slate.

Create the `src/components/MadLib.jsx` file. Most of it moves over from `App`, and it gets a "Start over" button too.
The file is in the `components` folder, so in the imports `..` first steps up one folder, into `src`, as in lesson 3:

```jsx file=src/components/MadLib.jsx mark=5,25-29,31-46
import { useState } from 'react'
import { HINTS } from '../stories.js'
import { fieldsOf, fillTemplate } from '../template.js'

function MadLib({ story }) {
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // The fields come from the template: ['name', 'animal', 'verb'].
  const fields = fieldsOf(story.text)
  // How many fields have something in them? A word made of spaces only does not count.
  const filledCount = fields.filter((field) => (words[field] || '').trim() !== '').length
  const complete = filledCount === fields.length

  // One function for every field: the field's name tells it which word to update.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (complete) setRevealed(true)
  }

  // Starting over: empty fields, and the form shows again.
  function restart() {
    setWords({})
    setRevealed(false)
  }

  if (revealed) {
    return (
      <article className="story">
        <h2>{story.title}</h2>
        <p className="story__text">{fillTemplate(story.text, words)}</p>
        <div className="actions">
          <button type="button" onClick={() => setRevealed(false)}>
            Change the words
          </button>
          <button type="button" onClick={restart}>
            Start over
          </button>
        </div>
      </article>
    )
  }

  return (
    <form className="word-form" onSubmit={reveal}>
      <p className="hint">Type a word into each field! Where they end up is only revealed at the end.</p>
      <div className="fields">
        {fields.map((field) => (
          <label key={field} className="field">
            <span className="field__label">{field}</span>
            <input
              name={field}
              value={words[field] || ''}
              onChange={update}
              placeholder={HINTS[field]}
            />
          </label>
        ))}
      </div>
      <div className="actions">
        <button type="submit" className="button--primary" disabled={!complete}>
          Show the story
        </button>
        <span className="progress" aria-live="polite">
          {filledCount} / {fields.length} fields filled
        </span>
      </div>
    </form>
  )
}

export default MadLib
```

Instead of `? :`, an [[early return]] decides here: if `revealed` is true, the function returns the story inside the
`if`, and never reaches the `return` below. Lesson 1's form showed its thank-you message the same way
(`if (sent) return …`). With longer JSX this is easier to read than one big `? :`. And `App` becomes much shorter.
Here is the whole `src/App.jsx`:

```jsx file=src/App.jsx mark=4,24-25
import { useState } from 'react'
import { STORIES } from './stories.js'
import StoryPicker from './components/StoryPicker.jsx'
import MadLib from './components/MadLib.jsx'
import './App.css'

function App() {
  const [storyId, setStoryId] = useState(STORIES[0].id)

  // The chosen story: the one whose id matches.
  const story = STORIES.find((item) => item.id === storyId)

  function pickRandom() {
    // We only draw from the other stories, so that a different one always comes up.
    const others = STORIES.filter((item) => item.id !== storyId)
    const next = others[Math.floor(Math.random() * others.length)]
    setStoryId(next.id)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <StoryPicker stories={STORIES} selectedId={storyId} onSelect={setStoryId} onRandom={pickRandom} />
      {/* Because of the key, every story starts with a clean slate: new key, new MadLib, empty state. */}
      <MadLib key={story.id} story={story} />
    </main>
  )
}

export default App
```

:::check Check
Type a few words and switch stories: the new story's fields are empty. Switch back: the old words have gone too,
because that `MadLib` no longer exists. Fill in the fields, look at the story, and click "Start over": the empty form
of the same story comes back.
:::

:::mistake Common mistake
Leaving out the `key`: `<MadLib story={story} />`. React finds the same kind of component in the same place, so it
keeps its state: the typed words and `revealed` carry over to the other story, just like in the previous step. The
`key` is what tells React when a clean slate is needed: here, when another story is chosen.
:::

:::try Task
Put an "Another story" button next to "Start over". Pass `pickRandom` to `MadLib` in a prop (for example `onRandom`),
and call it from the button's `onClick`. Because of the new story, `MadLib` gets a new `key`, so everything starts
with a clean slate by itself.
:::

### Highlighted words

The funniest part of Mad Libs is seeing where your own words ended up. Let us highlight them in the story! In the
middle of a text, the `<mark>` HTML element highlights a word. But `fillTemplate` returns one long string, and you
cannot put an element inside a string. So this time we do not glue the pieces together, we show them one by one: plain
text as text, fields inside `<mark>`. The story gets a component of its own: create the `src/components/Story.jsx`
file.

```jsx file=src/components/Story.jsx mark=8-17
import { splitTemplate } from '../template.js'

function Story({ story, words, onEdit, onRestart }) {
  return (
    <article className="story">
      <h2>{story.title}</h2>
      <p className="story__text">
        {/* The fields are at the odd positions (1, 3, 5…): the player's word goes there, highlighted. */}
        {splitTemplate(story.text).map((part, i) =>
          i % 2 === 1 ? (
            <mark key={i} title={part}>
              {words[part]}
            </mark>
          ) : (
            part
          ),
        )}
      </p>
      <div className="actions">
        <button type="button" onClick={onEdit}>
          Change the words
        </button>
        <button type="button" onClick={onRestart}>
          Start over
        </button>
      </div>
    </article>
  )
}

export default Story
```

This time `map` returns a mixed array: strings and `<mark>` elements. React can show both, one after the other. Only
the elements need a `key`, the plain strings do not. The position (`i`) works fine as a key here, because the order of
the pieces never changes. `title` adds a small tooltip: hover over a highlighted word and it shows the field's name.

The buttons' functions stay in `MadLib`; `Story` only calls them: it gets the `onEdit` and `onRestart` props. Here is
`src/components/MadLib.jsx` as it looks at the end of the intermediate level:

```jsx file=src/components/MadLib.jsx mark=3-4,32-41
import { useState } from 'react'
import { HINTS } from '../stories.js'
import { fieldsOf } from '../template.js'
import Story from './Story.jsx'

function MadLib({ story }) {
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // The fields come from the template: ['name', 'animal', 'verb'].
  const fields = fieldsOf(story.text)
  // How many fields have something in them? A word made of spaces only does not count.
  const filledCount = fields.filter((field) => (words[field] || '').trim() !== '').length
  const complete = filledCount === fields.length

  // One function for every field: the field's name tells it which word to update.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (complete) setRevealed(true)
  }

  // Starting over: empty fields, and the form shows again.
  function restart() {
    setWords({})
    setRevealed(false)
  }

  if (revealed) {
    return (
      <Story
        story={story}
        words={words}
        onEdit={() => setRevealed(false)}
        onRestart={restart}
      />
    )
  }

  return (
    <form className="word-form" onSubmit={reveal}>
      <p className="hint">Type a word into each field! Where they end up is only revealed at the end.</p>
      <div className="fields">
        {fields.map((field) => (
          <label key={field} className="field">
            <span className="field__label">{field}</span>
            <input
              name={field}
              value={words[field] || ''}
              onChange={update}
              placeholder={HINTS[field]}
            />
          </label>
        ))}
      </div>
      <div className="actions">
        <button type="submit" className="button--primary" disabled={!complete}>
          Show the story
        </button>
        <span className="progress" aria-live="polite">
          {filledCount} / {fields.length} fields filled
        </span>
      </div>
    </form>
  )
}

export default MadLib
```

:::check Check
In the finished story your words stand out in bold, on a light violet background. Hover over one: a tooltip shows
which field it came from ("animal"). If a field appears twice, it is highlighted in both places. The intermediate
level is done: commit it!
:::

:::mistake Common mistake
Building the highlight as a string: `'<mark>' + word + '</mark>'`. React always shows text as text, so the `<mark>`
appears in the story letter for letter, angle brackets and all. That is a deliberate protection: if React read typed
text as HTML, a malicious "word" could smuggle code into the page. You can only make elements with JSX.
:::

:::try Try it
Write a story in which `{name}` appears three times. You only type the name once, yet in the finished story it is
highlighted in all three places.
:::

## Advanced level {level=3}

### Writing your own template

So far we wrote the stories in the code. Now the player can write one too, the same way, with fields in curly
brackets. They type the template into a text box, and as they type, its fields appear right below it.

A home-made template can also go wrong: a bracket can be missing, or there may be no field in it at all. So we need a
function that checks it. Add this to the end of `src/template.js`:

```js file=src/template.js
// What is wrong with the template? Returns an empty string if everything is fine.
export function templateProblem(text) {
  // Cutting a text at every { gives one more piece than the number of { in it.
  const opens = text.split('{').length - 1
  const closes = text.split('}').length - 1
  if (opens !== closes) return 'A { or } is missing its partner.'

  const fields = fieldsOf(text)
  if (fields.length === 0) return 'Add at least one field to the text, like this: {noun}.'
  if (fields.some((field) => field.trim() === '')) return 'One of the { } is empty: write a word in it.'
  return ''
}
```

`some` is a relative of `filter`: it tells you whether there is **at least one** element for which the condition is
true. The check is simple and will not catch every oddity, but it does catch the common mistakes.

The text box is a `<textarea>`, which can be a controlled input just like an `<input>`: `value` and `onChange`.
Create the `src/components/StoryEditor.jsx` file:

```jsx file=src/components/StoryEditor.jsx mark=10,12
import { fieldsOf, templateProblem } from '../template.js'

function StoryEditor({ text, onChange }) {
  const problem = templateProblem(text)

  return (
    <div className="editor">
      <label className="field">
        <span className="field__label">Your own story</span>
        <textarea value={text} onChange={(event) => onChange(event.target.value)} />
      </label>
      <p className="hint">Put the fields in curly brackets, like this: {'{noun}'}</p>
      {problem ? (
        <p className="editor__problem" role="alert">
          {problem}
        </p>
      ) : (
        <p className="editor__fields">Fields: {fieldsOf(text).join(', ')}</p>
      )}
    </div>
  )
}

export default StoryEditor
```

Notice the `{'{noun}'}` part. In JSX a curly bracket means "JavaScript comes here". If you want to show the curly
bracket itself in the text, put it in a string, and put the string in curly brackets. `problem ? … : …` works because
an empty string counts as false in a condition, as in the `{error && …}` part of lesson 1's form: if nothing is wrong,
the list of fields shows; if something is, the message. Because of `role="alert"`, a screen reader reads the problem
out as soon as it appears.

Your own story is an object of the same shape as the ready-made stories (`id`, `title`, `text`), only its text comes
from a piece of state. If we put it in an array with the others, the picker draws its chip by itself, and `MadLib`
plays with it just like with any other. Here is the new `src/App.jsx`:

```jsx file=src/App.jsx mark=3,5,9-11,15,17-20,23,32-35
import { useState } from 'react'
import { STORIES } from './stories.js'
import { templateProblem } from './template.js'
import StoryPicker from './components/StoryPicker.jsx'
import StoryEditor from './components/StoryEditor.jsx'
import MadLib from './components/MadLib.jsx'
import './App.css'

const START_TEMPLATE =
  'Once upon a time there was a {adjective} {animal} ' +
  'who loved to {verb} more than anything in the world.'

function App() {
  const [storyId, setStoryId] = useState(STORIES[0].id)
  const [customText, setCustomText] = useState(START_TEMPLATE)

  // Your own story has the same shape as the others: id, title, text.
  const customStory = { id: 'custom', title: 'My own story', text: customText }
  const stories = [...STORIES, customStory]
  const story = stories.find((item) => item.id === storyId)

  function pickRandom() {
    // We only draw from the ready-made stories, and always a different one.
    const others = STORIES.filter((item) => item.id !== storyId)
    const next = others[Math.floor(Math.random() * others.length)]
    setStoryId(next.id)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <StoryPicker stories={stories} selectedId={storyId} onSelect={setStoryId} onRandom={pickRandom} />
      {storyId === 'custom' && <StoryEditor text={customText} onChange={setCustomText} />}
      {/* You cannot play a broken template: while something is wrong with it, the fields do not show. */}
      {templateProblem(story.text) === '' && <MadLib key={story.id} story={story} />}
    </main>
  )
}

export default App
```

- `[...STORIES, customStory]` is the array version of the [[spread]]: it copies every element of `STORIES` into a
  new array, and puts your own story at the end. `STORIES` itself does not change.
- The picker now gets `stories`, with your own story in it, instead of `STORIES`: `stories={stories}`. That is how
  its chip appears.
- `customStory` is a derived value: it is made from the latest `customText` at every drawing. As you type, `MadLib`
  gets the new template at every letter, and works out its fields again.
- Meanwhile the `key` stays `'custom'` the whole time, so editing the template does not wipe out the words already
  typed. But if the template becomes broken, `MadLib` disappears, and its words with it.
- `pickRandom` still only draws from the ready-made `STORIES`.

:::check Check
Just before "Random" there is a new chip: "My own story". Click it: a grey box shows the starting template, under it
"Fields: adjective, animal, verb", and further down the three fields. Type `{colour}` at the end of the text. While
the bracket is open, a red message shows and the fields disappear; as soon as you close it, they come back, with a new
field. Delete a `}`: the red message is back; put it back, and the fields return.
:::

:::mistake Common mistake
A curly bracket in JSX text: `<p>Like this: {noun}</p>`. React takes it as code and looks for a variable called
`noun`, which does not exist: the page goes blank, and the console shows the error "noun is not defined". A curly
bracket meant as text has to go in a string: `{'{noun}'}`.
:::

:::try Task
Let the template be at most 500 characters long. Give the `<textarea>` a `maxLength={500}` attribute, and show a
counter in the box with how far you are: `{text.length} / 500`.
:::

### A shareable link

It would be nice to send your own story to a friend so they can fill it in too. It works without a server: the
template goes into the link. In lesson 1 you used the part of the address after `#` to switch between pages. That is
where the template goes now: `http://localhost:5173/#story=Once%20upon…`. The part after `#` is never sent to the
server, it stays in the browser, and JavaScript reads it from `window.location.hash`.

Not every character can go into a link: spaces, accented letters, `#` or `&` could confuse the browser.
`encodeURIComponent` turns them into safe codes ([[URL encoding]]): a space becomes `%20`, an `é` becomes `%C3%A9`.
`decodeURIComponent` works the other way round, but if the code is broken (someone has mangled the link) it throws
an error, so the [[try/catch]] from lesson 3 catches it. Create the `src/share.js` file:

```js file=src/share.js
const PREFIX = '#story='

// The whole address, with the template at the end: this is what you can send.
export function shareLink(text) {
  return window.location.origin + window.location.pathname + PREFIX + encodeURIComponent(text)
}

// If the address brings a shared template, returns its text; if not, null.
export function sharedTemplate() {
  const hash = window.location.hash
  if (!hash.startsWith(PREFIX)) return null
  try {
    return decodeURIComponent(hash.slice(PREFIX.length))
  } catch {
    return null // a mangled link: we cannot decode it
  }
}
```

`window.location.origin` is the start of the address (`http://localhost:5173`), `pathname` is the path after it
(`/`). `startsWith` tells you whether a string starts with another string, and `slice(PREFIX.length)` cuts the
`#story=` part off the front. `null` means "nothing".

We copy the link to the clipboard, just as we copied the password in lesson 3. The button is almost the same as the
`CopyButton` there: its labels are different, it shows the feedback for two seconds, and it does not copy the `text`
itself but the link made from it. Create the `src/components/ShareButton.jsx` file:

```jsx file=src/components/ShareButton.jsx
import { useEffect, useState } from 'react'
import { shareLink } from '../share.js'

function ShareButton({ text }) {
  const [status, setStatus] = useState('idle') // 'idle', 'copied' or 'failed'

  // Two seconds after copying, the label goes back.
  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 2000)
    return () => clearTimeout(timer)
  }, [status])

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareLink(text))
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  let label = 'Copy link'
  if (status === 'copied') label = 'Link copied!'
  if (status === 'failed') label = 'Could not copy'

  return (
    <button type="button" onClick={copy}>
      {label}
    </button>
  )
}

export default ShareButton
```

The button goes into the editor, next to the list of fields. There is no point sharing a broken template, so it only
shows when nothing is wrong. Here is the whole `src/components/StoryEditor.jsx`:

```jsx file=src/components/StoryEditor.jsx mark=2,19-22
import { fieldsOf, templateProblem } from '../template.js'
import ShareButton from './ShareButton.jsx'

function StoryEditor({ text, onChange }) {
  const problem = templateProblem(text)

  return (
    <div className="editor">
      <label className="field">
        <span className="field__label">Your own story</span>
        <textarea value={text} onChange={(event) => onChange(event.target.value)} />
      </label>
      <p className="hint">Put the fields in curly brackets, like this: {'{noun}'}</p>
      {problem ? (
        <p className="editor__problem" role="alert">
          {problem}
        </p>
      ) : (
        <div className="actions">
          <p className="editor__fields">Fields: {fieldsOf(text).join(', ')}</p>
          <ShareButton text={text} />
        </div>
      )}
    </div>
  )
}

export default StoryEditor
```

Finally, the other side: for whoever opens the link, the page should start with your own story straight away. The
starting values of two of `App`'s states decide this. At the top of `src/App.jsx`, add the import, and change the two
`useState` lines; everything else stays:

```jsx file=src/App.jsx mark=1,5-7
import { sharedTemplate } from './share.js'
// … the other imports and START_TEMPLATE, as before

function App() {
  // If the address brings a shared template (#story=…), we start with it.
  const [storyId, setStoryId] = useState(() => (sharedTemplate() ? 'custom' : STORIES[0].id))
  const [customText, setCustomText] = useState(() => sharedTemplate() || START_TEMPLATE)
  // … everything else, as before
```

Both `useState`s get a function: this is the [[lazy initial state]] from lesson 3. React only calls it at the very
first drawing, so we only read the address once, at the start. If there is no shared template, `sharedTemplate()` returns
`null`, which counts as false in a condition: then the first story and the starting template stay.

:::check Check
Choose "My own story", write a short template, and click the "Copy link" button: the label says "Link copied!", and
two seconds later "Copy link" again. Open a new browser tab, paste into the address bar (++Ctrl++ + ++V++), and press
++Enter++: the page opens straight on "My own story", with your template and its fields.
:::

:::mistake Common mistake
You paste the link into the same tab the page is already open in, and nothing happens. If only the part after `#`
changes, the browser does not reload the page, and `App` only reads its starting values at the start. Press ++F5++, or
open it in a new tab. (If the page had to follow changes to the address while it runs, it would have to listen to the
`hashchange` event, as lesson 1's `useHashRoute` did.)
:::

:::try Task
Arriving from the link, your friend can still see the template, so they know where their words will go. Hide it from
them! In `App`, remember whether they came from a link: `const [fromLink] = useState(() => sharedTemplate() !== null)`,
and only show `StoryEditor` if they did not: `storyId === 'custom' && !fromLink && …`.
:::

### Reading aloud

The finished story is even funnier read aloud. The browser has a built-in voice: the [[Speech Synthesis API]]. It has
two parts:

- A `SpeechSynthesisUtterance` is "something to say": the text to read and its settings, for example its language
  (`lang`), speed (`rate`) and pitch (`pitch`). It has events too: `onend` runs when the reading finishes, `onerror`
  when it is interrupted.
- `speechSynthesis` is the reader itself: `speak(…)` reads an utterance out, `cancel()` silences it.

Not every browser can read aloud. So first we check whether `speechSynthesis` exists: this is
[[feature detection]]. `'speechSynthesis' in window` is true if the `window` object has a key with that name. If it
does not, the button does not even appear. Create the `src/components/ReadAloudButton.jsx` file:

```jsx file=src/components/ReadAloudButton.jsx
import { useEffect, useState } from 'react'

// Not every browser can read aloud: if this is false, the button does not appear at all.
const CAN_SPEAK = 'speechSynthesis' in window

function ReadAloudButton({ text }) {
  const [speaking, setSpeaking] = useState(false)

  // Cleanup: if the button disappears (when you start over, for example), the reading stops too.
  useEffect(() => {
    return () => {
      if (CAN_SPEAK) speechSynthesis.cancel()
    }
  }, [])

  function toggle() {
    if (speaking) {
      speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-GB'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  if (!CAN_SPEAK) return null

  return (
    <button type="button" onClick={toggle}>
      {speaking ? 'Stop' : 'Read aloud'}
    </button>
  )
}

export default ReadAloudButton
```

- The `speaking` state decides the button's label: "Stop" while reading, "Read aloud" otherwise. Click it while it is
  reading, and `toggle` silences the browser.
- With an empty [[dependency array]], the `useEffect` runs only once, when the button appears. It does nothing except
  return a [[cleanup function]], which React calls when the button disappears.
- `return null` means: this component draws nothing right now. `return null` comes **after** the hooks: by lesson 1's
  rule, hooks always run in the same order, without conditions.

The button goes under the story, next to the other two. Reading aloud needs a single string, not pieces, so
`fillTemplate` comes in handy again here. Here is the whole `src/components/Story.jsx`:

```jsx file=src/components/Story.jsx mark=1-2,21
import { fillTemplate, splitTemplate } from '../template.js'
import ReadAloudButton from './ReadAloudButton.jsx'

function Story({ story, words, onEdit, onRestart }) {
  return (
    <article className="story">
      <h2>{story.title}</h2>
      <p className="story__text">
        {/* The fields are at the odd positions (1, 3, 5…): the player's word goes there, highlighted. */}
        {splitTemplate(story.text).map((part, i) =>
          i % 2 === 1 ? (
            <mark key={i} title={part}>
              {words[part]}
            </mark>
          ) : (
            part
          ),
        )}
      </p>
      <div className="actions">
        <ReadAloudButton text={fillTemplate(story.text, words)} />
        <button type="button" onClick={onEdit}>
          Change the words
        </button>
        <button type="button" onClick={onRestart}>
          Start over
        </button>
      </div>
    </article>
  )
}

export default Story
```

:::check Check
Under the finished story there are three buttons: "Read aloud", "Change the words", "Start over". Turn on your
speakers and click "Read aloud": the computer reads the story out, and the button says "Stop". Click it: it goes
quiet. Start it again, and while it is reading, click "Change the words": the reading stops at once.
:::

:::mistake Common mistake
Leaving out the cleanup. Then the reading carries on after you have gone back to the form, even during another
story: the browser's reader is independent of React, and does not know by itself that the button is no longer on the
page.
:::

:::concept Which voice does it use?
The voices come from the operating system and the browser, so they differ from computer to computer.
`lang = 'en-GB'` asks for a British English voice; if your computer has none, the browser picks another English voice
or, failing that, any voice it has. On Windows you can add voices under **Settings → Time & language → Speech**.
:::

:::try Try it
Before `speak`, set `utterance.rate = 1.4` (faster) and `utterance.pitch = 2` (higher voice). `pitch` goes from 0 to
2, `rate` from 0.1 to 10.
:::

### Two-player mode

Mad Libs started as a party game: one player asks for the words in turn ("Give me an animal!"), the others call them
out, and only at the end does it turn out what story they ended up in. In our version two players take turns filling in the fields on the same computer. Only one field
shows at a time, so nobody sees what the other one wrote, and the story is a surprise for both.

The turns need a number: which field we are at (`turn`). Everything else can be worked out from it: which field it is
(`fields[turn]`), and whose turn it is. The fields at even positions (0, 2, 4…) belong to player 1, the odd ones to
player 2: `(turn % 2) + 1` gives 1, 2, 1, 2… Create the `src/components/TurnForm.jsx` file:

```jsx file=src/components/TurnForm.jsx
import { useState } from 'react'
import { HINTS } from '../stories.js'

// Two players take turns filling in the fields. Only one field shows at a time,
// so nobody sees what the other one wrote.
function TurnForm({ fields, words, onUpdate, onDone }) {
  const [turn, setTurn] = useState(0) // which field we are at (from 0)

  const field = fields[turn]
  const word = words[field] || ''
  const player = (turn % 2) + 1 // 1, 2, 1, 2…
  const isLast = turn === fields.length - 1

  function next(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (word.trim() === '') return
    if (isLast) onDone()
    else setTurn(turn + 1)
  }

  return (
    <form className={`turn player-${player}`} onSubmit={next}>
      <p className="turn__player">Player {player}, your turn</p>
      <p className="hint">
        No peeking, other player! Field {turn + 1} of {fields.length}
      </p>
      <label className="field">
        <span className="field__label">{field}</span>
        <input
          key={field}
          name={field}
          value={word}
          onChange={onUpdate}
          placeholder={HINTS[field]}
          autoFocus
        />
      </label>
      <div className="actions">
        <button type="submit" className="button--primary" disabled={word.trim() === ''}>
          {isLast ? 'Show the story' : 'Next'}
        </button>
      </div>
    </form>
  )
}

export default TurnForm
```

- `TurnForm` does not keep the words: `onUpdate` is `MadLib`'s `update` function, so the words go to the same place
  as in single-player mode. `TurnForm` only knows which field we are at.
- The class name is a template literal, between backticks: `turn player-${player}` is `'turn player-1'` or
  `'turn player-2'`. That is how `App.css` knows whether the card should be turquoise or yellow.
- `autoFocus` puts the cursor in the new field, so the player can type straight away. Because of `key={field}`, a
  new `<input>` is made on every turn, and `autoFocus` works again.
- `if (isLast) onDone()` and the `else` are a one-line `if … else`: if this was the last field, the story can come;
  if not, the next field.

In `MadLib` a new branch joins the early returns: with two players, `TurnForm` appears instead of the plain form. Here
is the whole `src/components/MadLib.jsx`:

```jsx file=src/components/MadLib.jsx mark=5,7,44-47
import { useState } from 'react'
import { HINTS } from '../stories.js'
import { fieldsOf } from '../template.js'
import Story from './Story.jsx'
import TurnForm from './TurnForm.jsx'

function MadLib({ story, players }) {
  const [words, setWords] = useState({})
  const [revealed, setRevealed] = useState(false)

  // The fields come from the template: ['name', 'animal', 'verb'].
  const fields = fieldsOf(story.text)
  // How many fields have something in them? A word made of spaces only does not count.
  const filledCount = fields.filter((field) => (words[field] || '').trim() !== '').length
  const complete = filledCount === fields.length

  // One function for every field: the field's name tells it which word to update.
  function update(event) {
    setWords({ ...words, [event.target.name]: event.target.value })
  }

  function reveal(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (complete) setRevealed(true)
  }

  // Starting over: empty fields, and the form shows again.
  function restart() {
    setWords({})
    setRevealed(false)
  }

  if (revealed) {
    return (
      <Story
        story={story}
        words={words}
        onEdit={() => setRevealed(false)}
        onRestart={restart}
      />
    )
  }

  // With two players, they take turns, one field at a time.
  if (players === 2) {
    return <TurnForm fields={fields} words={words} onUpdate={update} onDone={() => setRevealed(true)} />
  }

  return (
    <form className="word-form" onSubmit={reveal}>
      <p className="hint">Type a word into each field! Where they end up is only revealed at the end.</p>
      <div className="fields">
        {fields.map((field) => (
          <label key={field} className="field">
            <span className="field__label">{field}</span>
            <input
              name={field}
              value={words[field] || ''}
              onChange={update}
              placeholder={HINTS[field]}
            />
          </label>
        ))}
      </div>
      <div className="actions">
        <button type="submit" className="button--primary" disabled={!complete}>
          Show the story
        </button>
        <span className="progress" aria-live="polite">
          {filledCount} / {fields.length} fields filled
        </span>
      </div>
    </form>
  )
}

export default MadLib
```

The number of players is chosen in `App`, with chips like the story picker's. The number of players goes into the
`key` too (for example `'guest-2'`): if they switch halfway through, the game starts with a clean slate. Here is the
whole `src/App.jsx`:

```jsx file=src/App.jsx mark=14-17,23,41-61
import { useState } from 'react'
import { STORIES } from './stories.js'
import { templateProblem } from './template.js'
import { sharedTemplate } from './share.js'
import StoryPicker from './components/StoryPicker.jsx'
import StoryEditor from './components/StoryEditor.jsx'
import MadLib from './components/MadLib.jsx'
import './App.css'

const START_TEMPLATE =
  'Once upon a time there was a {adjective} {animal} ' +
  'who loved to {verb} more than anything in the world.'

const PLAYER_OPTIONS = [
  { count: 1, label: 'One player' },
  { count: 2, label: 'Two players' },
]

function App() {
  // If the address brings a shared template (#story=…), we start with it.
  const [storyId, setStoryId] = useState(() => (sharedTemplate() ? 'custom' : STORIES[0].id))
  const [customText, setCustomText] = useState(() => sharedTemplate() || START_TEMPLATE)
  const [players, setPlayers] = useState(1)

  // Your own story has the same shape as the others: id, title, text.
  const customStory = { id: 'custom', title: 'My own story', text: customText }
  const stories = [...STORIES, customStory]
  const story = stories.find((item) => item.id === storyId)

  function pickRandom() {
    // We only draw from the ready-made stories, and always a different one.
    const others = STORIES.filter((item) => item.id !== storyId)
    const next = others[Math.floor(Math.random() * others.length)]
    setStoryId(next.id)
  }

  return (
    <main className="madlibs">
      <h1>Mad Libs</h1>
      <StoryPicker stories={stories} selectedId={storyId} onSelect={setStoryId} onRandom={pickRandom} />
      <div className="picker">
        <span className="picker__label">Players</span>
        <div className="chips">
          {PLAYER_OPTIONS.map((option) => (
            <button
              key={option.count}
              type="button"
              className="chip"
              aria-pressed={players === option.count}
              onClick={() => setPlayers(option.count)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {storyId === 'custom' && players === 1 && <StoryEditor text={customText} onChange={setCustomText} />}
      {/* You cannot play a broken template. A new story or a new number of players: new key, clean slate. */}
      {templateProblem(story.text) === '' && (
        <MadLib key={`${story.id}-${players}`} story={story} players={players} />
      )}
    </main>
  )
}

export default App
```

With two players the editor hides: nobody can peek at the template, and nobody can change it in the middle of a game.
To edit it, switch back to "One player".

:::check Check
Under the story picker there is a new row: "Players", with "One player" in violet. Choose "Two players": instead of
the fields there is a turquoise card saying "Player 1, your turn", with a single field and the cursor already in it.
Type a word and press ++Enter++: the card turns yellow, "Player 2, your turn", and the next field comes. At the last
field the button says "Show the story": click it and the finished story appears. Choose "My own story" too: with two
players the editor disappears.
:::

:::mistake Common mistake
Leaving `players` out of the `key`. If you then switch to "Two players" with a half-filled single-player form, the
typed words stay, and the players see each other's earlier words during their turns. The `key` should contain every
value whose change calls for a clean slate.
:::

:::try Task
Ask for the players' names before the game (two fields in `App`, each with its own state), pass them through
`MadLib` to `TurnForm`, and make the card say, for example, "Anna, your turn" instead of "Player 1, your turn".
:::

### Who wrote which word?

With two players, the best moment is finding out who wrote which word. Let us colour the highlighted words in their
owner's colour: turquoise for player 1, yellow for player 2. Whose field it is follows from its position, just like
in `TurnForm`. `indexOf` gives the position: it tells you where an element stands in an array (counting
from 0). `['name', 'animal', 'verb'].indexOf('animal')` is 1, so the animal was written by player 2.

Here is the final `src/components/Story.jsx`:

```jsx file=src/components/Story.jsx mark=1,4-12,21,29-34
import { fieldsOf, fillTemplate, splitTemplate } from '../template.js'
import ReadAloudButton from './ReadAloudButton.jsx'

function Story({ story, words, players, onEdit, onRestart }) {
  const fields = fieldsOf(story.text)

  // With two players every word gets its owner's colour: the fields at even positions (0, 2, 4…)
  // were player 1's, the odd ones player 2's. With one player there is no extra class.
  function ownerClass(field) {
    if (players !== 2) return ''
    return `player-${(fields.indexOf(field) % 2) + 1}`
  }

  return (
    <article className="story">
      <h2>{story.title}</h2>
      <p className="story__text">
        {/* The fields are at the odd positions (1, 3, 5…): the player's word goes there, highlighted. */}
        {splitTemplate(story.text).map((part, i) =>
          i % 2 === 1 ? (
            <mark key={i} title={part} className={ownerClass(part)}>
              {words[part]}
            </mark>
          ) : (
            part
          ),
        )}
      </p>
      {players === 2 && (
        <p className="legend">
          <span className="player-1">Player 1</span>
          <span className="player-2">Player 2</span>
        </p>
      )}
      <div className="actions">
        <ReadAloudButton text={fillTemplate(story.text, words)} />
        <button type="button" onClick={onEdit}>
          Change the words
        </button>
        <button type="button" onClick={onRestart}>
          Start over
        </button>
      </div>
    </article>
  )
}

export default Story
```

`Story` now expects the `players` prop too, so pass it in from `MadLib`. In `src/components/MadLib.jsx`, make the
`if (revealed)` branch look like this:

```jsx file=src/components/MadLib.jsx mark=6
  if (revealed) {
    return (
      <Story
        story={story}
        words={words}
        players={players}
        onEdit={() => setRevealed(false)}
        onRestart={restart}
      />
    )
  }
```

:::check Check
Play a two-player round to the end: in the finished story player 1's words have a turquoise background and player 2's
a yellow one, and a small legend underneath shows which colour belongs to whom. In single-player mode everything stays
light violet. Congratulations, your Mad Libs game is finished: commit it!
:::

:::mistake Common mistake
Working out the owner from the position among the `splitTemplate` pieces (`i`) instead of in `fields`. Among the
pieces the fields always stand at odd positions, so `(i % 2) + 1` is 2 for every word: every word turns yellow.
Cleverer counting does not help either, because a field can appear more than once, so the order of the pieces is not
`TurnForm`'s order. `fields` has every field once, in `TurnForm`'s order.
:::

:::try Task
Show in the legend how many words each player wrote too. Player 1's fields come from
`fields.filter((field, i) => i % 2 === 0)`, player 2's from the same with `i % 2 === 1`, and `length` counts them:
"Player 1 (3 words)".
:::
