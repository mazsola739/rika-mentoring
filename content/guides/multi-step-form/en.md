# What we build

A sign-up form for an imaginary club, Code Club, split into short steps: first the account (email and password),
then a few words about you, then your interests, and at the end a summary where you check everything before sending
it. One long form is tiring to look at; the same questions in small portions feel quick, and the user always knows how
far along they are. A form like this is called a [[multi-step form]], or a [[wizard]].

On the way you learn how to keep the answers of every step in one place, so that nothing gets lost when the user moves
between steps; how to check the fields step by step and show clear error messages at the right moment; and how a
progress indicator works. In the advanced level you see how two popular libraries think about forms: Zod, which
describes the rules, and React Hook Form, which ties them to the fields. You also add a step that only appears when it
is needed, save a draft, and send the finished form to a server.

:::levels
- Three steps (account, profile, interests) with Back and Next buttons, and a summary at the end. | about 2 hours
- Rules for every step with clear error messages, a clickable progress indicator, and answers that stay put while you move between steps. | about 3 hours
- Rules as a schema, the way Zod and React Hook Form work, a step that appears only when needed, a saved draft, and sending the form to a (pretend) server. | about 3 hours
:::

**Before you start you need:** the earlier lessons. We build mostly on these: lesson 1 (the contact form: an object
in state, `[event.target.name]`, `preventDefault`), lesson 3 (checkboxes, radio buttons, lifting state up), lesson 9
(`useEffect` with cleanup, `localStorage`), lesson 14 (loading and error states, `async` and `await`), lessons 16 and
18 (`useRef` for an element on the page) and lesson 20 (waiting until the typing stops). Wherever something familiar
is used in a new way, we explain it again.

## Beginner level {level=1}

### Before you start

The exercise of this lesson is the `lessons/22-multi-step-form/exercise` folder of the course repository on GitHub
(the "Exercise on GitHub" button above opens it). You get it the same way as in the earlier lessons; lesson 1 explains
every step in detail. In the terminal, in your work folder (the one that holds the `rika-mentoring` folder):

```shell
cd rika-mentoring
git pull        # brings the new lessons into the repository
cd ..
cp -r rika-mentoring/lessons/22-multi-step-form/exercise code-club-signup
```

If you do not have the repository yet, run `git clone https://github.com/mazsola739/rika-mentoring.git` instead of the
first three lines (without git: **Code → Download ZIP** on the
[repository's GitHub page](https://github.com/mazsola739/rika-mentoring)). You can also copy the folder in your file
manager; what matters is that your copy is called `code-club-signup` and sits outside the `rika-mentoring` folder, so
`git pull` keeps working. Open your copy in the editor, then type these two commands in the editor's terminal:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
Open the address the terminal prints (usually `http://localhost:5173`). You see a white card in the middle of the page,
with the title "Join Code Club" and one line of text under it. There is no form yet: building it is your job.
:::

Last, make your copy a git repository with one commit, the starting point. Leave the server running and open a second
terminal (the **+** button in the terminal panel; it opens in `code-club-signup` too):

```shell
git init -b main
git add .
git commit -m "Starting point"
```

From now on `git restore .` takes every file back to your last commit (new files you delete by hand), and it is worth
committing after every step that works.

The exercise has three files that matter for this lesson:

- `src/App.jsx`: the page. For now it only shows the title and the intro line; this is where we start.
- `src/App.css`: the styles of the whole lesson, ready (the card, the fields, the error messages, the progress
  indicator, the summary…). You don't write these; you only use the class names (`signup`, `step`, `field`, `chip`,
  `summary`, …) the steps give you.
- `src/fakeApi.js`: a pretend server that runs in your browser. You need it only at the very end, in the advanced
  level.

:::concept A quick recap
A [[component]] is a function that returns [[JSX]]. It gets [[props]] from outside and remembers things with
[[useState]]: when a state value changes, React draws the component again. A [[controlled input]] takes its value from
state, and its `onChange` writes every keystroke back. Lesson 1's contact form kept all of its fields in one
[[object]], and updated it with `{ ...form, [event.target.name]: event.target.value }`: the [[spread]] copies the old
object, and the key in square brackets overwrites one field. State is never changed in place: the setter always gets a
new object. And `{condition && <Something />}` draws something only when the condition is true
([[conditional rendering]]).
:::

### One object for the whole form

A multi-step form collects the answers of several screens and sends them together at the end. So the answers need one
home that exists from the first step to the last: one object in the state of `App`, with every field of every step in
it. First write down the whole form, in a file of its own. Create `src/formData.js`:

```js file=src/formData.js
// Every field of the form, with its starting value: the whole form is one object.
export const INITIAL_VALUES = {
  email: '',
  password: '',
  confirm: '', // the password once more
  fullName: '',
  username: '',
  role: '',
  topics: [], // several topics can be ticked, so this is an array
  frequency: 'weekly',
}
```

Every label in this form sits above its field in the same way, so a tiny component does it. Create a `components`
folder in `src`, with a `Field.jsx` file in it:

```jsx file=src/components/Field.jsx
// A label with its field inside. Whatever is written between <Field> and </Field> arrives as children.
function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  )
}

export default Field
```

[[children]] is the special prop you met with lesson 2's `ThemeProvider`: here it is the `<input>` we put inside
`<Field>`. Because the input is inside the `<label>`, a click on the label puts the cursor into the field, and a screen
reader reads the label out with the field.

The steps of the form get a folder of their own. Create `src/steps/AccountStep.jsx`, the first step:

```jsx file=src/steps/AccountStep.jsx
import Field from '../components/Field.jsx'

function AccountStep({ register }) {
  return (
    <div className="step">
      <Field label="Email">
        <input type="email" autoComplete="email" {...register('email')} />
      </Field>
      <Field label="Password">
        <input type="password" autoComplete="new-password" {...register('password')} />
      </Field>
      <Field label="Password again">
        <input type="password" autoComplete="new-password" {...register('confirm')} />
      </Field>
    </div>
  )
}

export default AccountStep
```

Every controlled text field needs the same few things: a `value` from the state and an `onChange` that writes the
state. Written out, that is a lot of typing for every field. So `App` will give the steps a small helper function,
`register`, which returns these attributes as an object. `{...register('email')}` inside a tag is the spread again,
this time in JSX: it spreads the keys of the object onto the tag as attributes ([[spread attributes]]). The two
versions below do the same:

:::compare
```jsx label="Written out"
<input
  type="email"
  name="email"
  value={values.email}
  onChange={(event) => setField('email', event.target.value)}
/>
```
```jsx label="With register" now
<input type="email" {...register('email')} />
```
:::

`autoComplete` tells the browser and password managers what a field is for: `email` offers your address,
`new-password` offers to make up a strong password and remember it.

Now `App`. Replace the contents of `src/App.jsx` with this:

```jsx file=src/App.jsx mark=1-3,7,9-12,14-21,30-32,34-35
import { useState } from 'react'
import { INITIAL_VALUES } from './formData.js'
import AccountStep from './steps/AccountStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)

  // Changes one field: a new object with every old field, and the new value under its name.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Everything a text field needs from the state: its name, its value, and what to do when it changes.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
    }
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <div className="signup__form">
        <AccountStep register={register} />
      </div>

      {/* For now: the whole state, live. It goes at the end of the level. */}
      <pre className="debug">{JSON.stringify(values, null, 2)}</pre>
    </main>
  )
}

export default App
```

- `setField(name, value)` changes any one field. It is lesson 1's `[event.target.name]` trick, only the name and the
  value come as parameters, because later not every field will be a text box. `setValues` gets an
  [[updater function]] (lessons 6–8): React calls it with the latest state (`prev`), and what it returns becomes the
  new state.
- `register(name)` returns an object with three keys. `name,` is short for `name: name`. The name `register` is
  borrowed from React Hook Form, a popular form library: you will meet it in the advanced level.
- `JSON.stringify(values, null, 2)` turns the state into [[JSON]] text, indented by two spaces. In a `<pre>` it stays
  just as it is, line by line: a little window into the state while we build. The `{/* … */}` is a comment in JSX.

:::check Check
Under the form, a dark box shows the state. Type into the email field: the `email` line in the box changes with every
key. The password fields show dots, but the box shows the password in plain text: it is only a tool for you, and it
goes away at the end of the level.
:::

:::mistake Common mistake
`setValues((prev) => ({ [name]: value }))`, without `...prev`. Then every keystroke makes a brand new object with only
one field in it: type into the email field, and the box shows nothing but `email`. The other fields are gone.
:::

:::try Try it
Open the browser's developer tools (++F12++), and look at the email field in the Elements tab: it has
`name="email"`, `type="email"` and `autocomplete="email"`. React put the `name` there, from `register`.
:::

### Steps with Back and Next

Now the form gets steps. Which step is on the screen is a number in state, `step`: 0 for the first step, 1 for the
second, counting from 0 like the positions of an array. The list of steps goes into `src/formData.js`, together with
the choices of a drop-down list that the second step needs. Here is the whole file:

```js file=src/formData.js mark=13-17,19-25
// Every field of the form, with its starting value: the whole form is one object.
export const INITIAL_VALUES = {
  email: '',
  password: '',
  confirm: '', // the password once more
  fullName: '',
  username: '',
  role: '',
  topics: [], // several topics can be ticked, so this is an array
  frequency: 'weekly',
}

// The steps, in order. The key is for the code, the title is for the user.
export const STEPS = [
  { key: 'account', title: 'Account' },
  { key: 'profile', title: 'Profile' },
]

// The choices of "I am a…": the value is what we store, the label is what the user sees.
export const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'other', label: 'Something else' },
]
```

The second step is built just like the first. A `<select>` ([[drop-down list]], lesson 10) takes a `value` and an
`onChange` just like an `<input>`, so `register` works for it too. Create `src/steps/ProfileStep.jsx`:

```jsx file=src/steps/ProfileStep.jsx
import Field from '../components/Field.jsx'
import { ROLES } from '../formData.js'

function ProfileStep({ register }) {
  return (
    <div className="step">
      <Field label="Full name">
        <input autoComplete="name" {...register('fullName')} />
      </Field>
      <Field label="Username">
        <input autoComplete="username" {...register('username')} />
      </Field>
      <Field label="I am a…">
        <select {...register('role')}>
          <option value="">Choose one</option>
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}

export default ProfileStep
```

The first `<option>` has an empty value: while `role` is `''`, the list shows "Choose one". Now `App` gets the steps,
a real `<form>` and the two buttons. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=2,4,9,11-12,28-30,32-36,45-51,53-54,56-66
import { useState } from 'react'
import { INITIAL_VALUES, STEPS } from './formData.js'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // which step is on the screen: 0 is the first

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  // Changes one field: a new object with every old field, and the new value under its name.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Everything a text field needs from the state: its name, its value, and what to do when it changes.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
    }
  }

  function back() {
    setStep(step - 1)
  }

  // "Next" is a submit button: a click on it, or Enter in any field, lands here.
  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (!isLast) setStep(step + 1)
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <form className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} />}
        {current.key === 'profile' && <ProfileStep register={register} />}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={back}>
              Back
            </button>
          )}
          <button type="submit" className="button">
            Next
          </button>
        </div>
      </form>

      {/* For now: the whole state, live. It goes at the end of the level. */}
      <pre className="debug">{JSON.stringify(values, null, 2)}</pre>
    </main>
  )
}

export default App
```

- `current` and `isLast` are not new state: they are worked out from `step` at every drawing.
- Only one step is drawn at a time: `{current.key === 'account' && …}` draws `AccountStep` only while the current step
  is the account step.
- "Next" is a `type="submit"` button. Clicking it **or** pressing ++Enter++ in any field submits the form, and both
  run `handleSubmit`. `event.preventDefault()` stops the browser from reloading the page, as in lesson 1. "Back" is a
  `type="button"`: a plain button that does not submit anything.
- `noValidate` switches off the browser's own pop-up checks, as in lesson 1's contact form. Without it, `type="email"`
  would stop Next with a bubble while the address is incomplete. We write our own checks in the intermediate level.
- `{step > 0 && …}`: on the first step there is nowhere to go back to, so there is no Back button.

:::concept Where does a hidden step go?
When `step` becomes 1, `AccountStep` is no longer drawn: React takes it off the page, which is called
[[unmounting|unmount]]. Anything a component keeps in its own state disappears with it. That is why the answers live
in `App`, which stays on the page all the time: the steps only show them and report every change. This is
[[lifting state up]] from lesson 3. When you go back, `AccountStep` is drawn again, from `values`, and everything is
there.
:::

:::check Check
Fill in the email and press ++Enter++: "Step 2 of 2" (the CSS writes this line in capitals), Profile. Fill this step in
too, and click Back: your email is still in its field, and the dark box showed every answer all along. On the second
step Next does nothing yet: there is no third step.
:::

:::mistake Common mistake
A Back button without `type="button"`. Inside a form, a button with no type is a submit button, so Back submits the
form, and `handleSubmit` takes you **forward**.
:::

### Choices: checkboxes and radio buttons

The third step asks about interests: any number of topics with [[checkboxes|checkbox]], and how often the club's
newsletter should come, with [[radio buttons|radio button]] (you know both from lesson 3). They need something
different from text fields: whether a box is ticked is in its `checked` attribute, not in `value`, and the topics are
an array. So this step does not use `register`: it gets `values` and `setField` instead.

First the data. Here is the whole of `src/formData.js` again, with the third step and two new lists of choices:

```js file=src/formData.js mark=17,28-34,36-40
// Every field of the form, with its starting value: the whole form is one object.
export const INITIAL_VALUES = {
  email: '',
  password: '',
  confirm: '', // the password once more
  fullName: '',
  username: '',
  role: '',
  topics: [], // several topics can be ticked, so this is an array
  frequency: 'weekly',
}

// The steps, in order. The key is for the code, the title is for the user.
export const STEPS = [
  { key: 'account', title: 'Account' },
  { key: 'profile', title: 'Profile' },
  { key: 'preferences', title: 'Interests' },
]

// The choices of "I am a…": the value is what we store, the label is what the user sees.
export const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'other', label: 'Something else' },
]

export const TOPICS = [
  { value: 'react', label: 'React' },
  { value: 'css', label: 'CSS' },
  { value: 'games', label: 'Games' },
  { value: 'a11y', label: 'Accessibility' },
  { value: 'design', label: 'UI design' },
]

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]
```

Then the step. Create `src/steps/PreferencesStep.jsx`:

```jsx file=src/steps/PreferencesStep.jsx
import { FREQUENCIES, TOPICS } from '../formData.js'

function PreferencesStep({ values, setField }) {
  // Ticking adds the topic to the array, unticking takes it out: always into a new array.
  function toggleTopic(topic) {
    if (values.topics.includes(topic)) {
      setField('topics', values.topics.filter((item) => item !== topic))
    } else {
      setField('topics', [...values.topics, topic])
    }
  }

  return (
    <div className="step">
      <fieldset className="choices">
        <legend>Topics you are interested in</legend>
        <div className="choices__list">
          {TOPICS.map((topic) => (
            <label key={topic.value} className="chip">
              <input
                type="checkbox"
                name="topics"
                checked={values.topics.includes(topic.value)}
                onChange={() => toggleTopic(topic.value)}
              />
              {topic.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="choices">
        <legend>Club newsletter</legend>
        <div className="choices__list">
          {FREQUENCIES.map((option) => (
            <label key={option.value} className="chip">
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={values.frequency === option.value}
                onChange={() => setField('frequency', option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default PreferencesStep
```

- `values.topics.includes(topic)` ([[includes]]) tells whether the topic is already in the array. If it is, `filter`
  makes a new array without it; if not, `[...values.topics, topic]` makes a new array with every old topic and the new
  one at the end. As always (lesson 7), the array in state is never changed in place.
- A box is ticked when its topic is in the array: that is its `checked`. A radio button is selected when `frequency`
  is its value.
- Radio buttons with the same `name` form one group: only one of them can be selected, and the arrow keys move between
  them. `<fieldset>` and `<legend>` give each group a title that screen readers read out with every choice.

Finally, `App` draws the new step. In `src/App.jsx`, import it next to the other steps, and add one line under the
line of `ProfileStep`:

```jsx file=src/App.jsx mark=1,5
import PreferencesStep from './steps/PreferencesStep.jsx'
// … the other imports and the beginning of App, as before

        {current.key === 'profile' && <ProfileStep register={register} />}
        {current.key === 'preferences' && <PreferencesStep values={values} setField={setField} />}
```

:::check Check
Step 3 of 3, Interests. Click a few topics: they turn green, and the `topics` array in the dark box grows and shrinks
with them. Choose Monthly: `frequency` changes. Go back to the first step and forward again: every tick is still
there.
:::

:::mistake Common mistake
Leaving out `checked`. The boxes still tick when you click them, and the array still changes, so it looks fine. But go
to another step and back: every box is empty, although the array in the dark box still holds the topics. Without
`checked` the box is not controlled: the browser remembers the tick itself, and forgets it when the step is taken off
the page.
:::

:::try Try it
Add a sixth topic to `TOPICS`, for example `{ value: 'music', label: 'Music apps' }`. One line, and a new chip
appears.
:::

### The summary at the end

The last step shows every answer, so the user can check them before sending. In `src/formData.js`, add a fourth step
to `STEPS` (the rest of the file stays as it is):

```js file=src/formData.js mark=5
export const STEPS = [
  { key: 'account', title: 'Account' },
  { key: 'profile', title: 'Profile' },
  { key: 'preferences', title: 'Interests' },
  { key: 'review', title: 'Review' },
]
```

The summary is a list of name–value pairs, one group for every step. Create `src/steps/ReviewStep.jsx`:

```jsx file=src/steps/ReviewStep.jsx
import { FREQUENCIES, ROLES, TOPICS } from '../formData.js'

// The label of a stored value, for example 'student' → 'Student'.
function labelOf(options, value) {
  const option = options.find((item) => item.value === value)
  return option ? option.label : ''
}

function ReviewStep({ values }) {
  const sections = [
    {
      key: 'account',
      title: 'Account',
      rows: [
        ['Email', values.email],
        ['Password', values.password ? '••••••••' : ''],
      ],
    },
    {
      key: 'profile',
      title: 'Profile',
      rows: [
        ['Full name', values.fullName],
        ['Username', values.username],
        ['I am a…', labelOf(ROLES, values.role)],
      ],
    },
    {
      key: 'preferences',
      title: 'Interests',
      rows: [
        ['Topics', values.topics.map((topic) => labelOf(TOPICS, topic)).join(', ')],
        ['Newsletter', labelOf(FREQUENCIES, values.frequency)],
      ],
    },
  ]

  return (
    <div className="summary">
      {sections.map((section) => (
        <section key={section.key} className="summary__section">
          <div className="summary__head">
            <h3>{section.title}</h3>
          </div>
          <dl>
            {section.rows.map(([label, value]) => (
              <div key={label} className="summary__row">
                <dt>{label}</dt>
                {/* An empty answer shows a dash, so the row does not look broken. */}
                <dd>{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

export default ReviewStep
```

- `labelOf` finds the choice whose `value` is the stored one ([[find]]), and returns its label. We store `'student'`,
  but the user should read "Student".
- Every row is a two-item array, `[label, value]`. `map(([label, value]) => …)` takes the two items apart right in
  the parameter: this is array [[destructuring]], the same as in `const [values, setValues] = useState(…)`.
- `<dl>`, `<dt>` and `<dd>` make a [[description list]], as in lesson 13's statistics.
- The password is not shown, not even in the summary: only dots, if there is one.

Last, `App`: the fourth step, a "Create account" button on the last step, and a welcome screen. The dark box has done
its job: the summary shows everything now, so it goes. Here is the whole `src/App.jsx` at the end of the beginner
level:

```jsx file=src/App.jsx mark=6,12,38-42,45-50,52-67,87,96
import { useState } from 'react'
import { INITIAL_VALUES, STEPS } from './formData.js'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // which step is on the screen: 0 is the first
  const [submitted, setSubmitted] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  // Changes one field: a new object with every old field, and the new value under its name.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Everything a text field needs from the state: its name, its value, and what to do when it changes.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
    }
  }

  function back() {
    setStep(step - 1)
  }

  // "Next" is a submit button: a click on it, or Enter in any field, lands here.
  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (isLast) {
      setSubmitted(true)
    } else {
      setStep(step + 1)
    }
  }

  // An empty form again, on the first step.
  function startOver() {
    setValues(INITIAL_VALUES)
    setStep(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Welcome to Code Club, {values.fullName}!</h2>
          <p>Your account is ready. In a real app, a confirmation email would now go to {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Start over
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <form className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} />}
        {current.key === 'profile' && <ProfileStep register={register} />}
        {current.key === 'preferences' && <PreferencesStep values={values} setField={setField} />}
        {current.key === 'review' && <ReviewStep values={values} />}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={back}>
              Back
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Create account' : 'Next'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

When `submitted` is true, `App` returns the welcome screen early, and the form is not drawn at all: an
[[early return]], as in lesson 4. `startOver` puts every piece of state back to where it started.

:::check Check
Fill in all three steps. On step 4 of 4, Review, three grey boxes show your answers; the topics are listed with
commas, the password is only dots. Click "Create account": "Welcome to Code Club, …!" with your name and email. "Start
over" brings back an empty form on the first step. The beginner level is done: commit it!
:::

:::mistake Common mistake
A forgotten `key`, for example on the `<div>` of the rows. The page works, but the console (++F12++) warns: "Each child
in a list should have a unique key prop". Every item that `map` makes needs a `key` that is unique among its
neighbours: here the label of the row is.
:::

:::try Try it
Greet the user by their first name only: `values.fullName.split(' ')[0]` cuts the name at the spaces and keeps the
first piece.
:::

## Intermediate level {level=2}

### Rules for every step

The form now lets anything through: an empty email, a three-letter password, not a single topic. It needs
[[validation|form validation]]: checking the answers against rules before accepting them. In lesson 10 the browser did
this with `required`; here the form has `noValidate`, which switches the browser's checks off, because we want our own
messages, in our own place, one step at a time.

The rules go into a file of their own. Create `src/validation.js`:

```js file=src/validation.js
// Something, an @, something, a dot, something; and no spaces anywhere.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// 3 to 20 characters: letters, digits or _.
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i

// The errors of one step, as { field name: message }. An empty object means the step is fine.
export function validateStep(stepKey, values) {
  const errors = {}

  if (stepKey === 'account') {
    if (values.email.trim() === '') {
      errors.email = 'Enter your email address.'
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = 'This does not look like an email address.'
    }
    if (values.password.length < 8) {
      errors.password = 'Use at least 8 characters.'
    }
    if (values.confirm === '') {
      errors.confirm = 'Type the password again.'
    } else if (values.confirm !== values.password) {
      errors.confirm = 'The two passwords do not match.'
    }
  }

  if (stepKey === 'profile') {
    if (values.fullName.trim() === '') {
      errors.fullName = 'Enter your name.'
    }
    if (!USERNAME_PATTERN.test(values.username)) {
      errors.username = '3–20 characters: letters, digits or _.'
    }
    if (values.role === '') {
      errors.role = 'Choose one.'
    }
  }

  if (stepKey === 'preferences' && values.topics.length === 0) {
    errors.topics = 'Pick at least one topic.'
  }

  return errors
}
```

- A step's errors are an object: the key is the field's name, the value is the message. If the object is empty, the
  step is fine.
- `trim()` ([[trim]]) cuts the spaces off both ends, so `'   '` does not count as a name.
- The two patterns are [[regular expressions|regular expression]], like the ones in lessons 7 and 11. `^` is the start
  of the text and `$` its end, so the whole text has to fit the pattern. `[^\s@]+` means "one or more characters that
  are neither a space nor an @". `[a-z0-9_]{3,20}` means "3 to 20 letters, digits or underscores", and the `i` at the
  end makes capitals count as letters too. `test` answers whether the text fits.
- The `confirm` rule compares two fields: rules can look at the whole form.

Now `App`: it works out the errors of the current step, and "Next" only moves on when there are none. Replace
`src/App.jsx`:

```jsx file=src/App.jsx mark=3,13,18-21,37-40,46-49,53,60,96-100,103-107,111
import { useState } from 'react'
import { INITIAL_VALUES, STEPS } from './formData.js'
import { validateStep } from './validation.js'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // which step is on the screen: 0 is the first
  const [showErrors, setShowErrors] = useState(false) // true once "Next" was pressed on this step
  const [submitted, setSubmitted] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  // Worked out from the answers at every drawing: a derived value, not state.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0
  const shownErrors = showErrors ? errors : {}

  // Changes one field: a new object with every old field, and the new value under its name.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Everything a text field needs from the state: its name, its value, and what to do when it changes.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
    }
  }

  // Every move between steps goes through here: a new step starts without red messages.
  function goTo(index) {
    setStep(index)
    setShowErrors(false)
  }

  // "Next" is a submit button: a click on it, or Enter in any field, lands here.
  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (hasErrors) {
      setShowErrors(true) // show the messages, and stay on this step
      return
    }
    if (isLast) {
      setSubmitted(true)
    } else {
      goTo(step + 1)
    }
  }

  // An empty form again, on the first step.
  function startOver() {
    setValues(INITIAL_VALUES)
    goTo(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Welcome to Code Club, {values.fullName}!</h2>
          <p>Your account is ready. In a real app, a confirmation email would now go to {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Start over
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <form className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'review' && <ReviewStep values={values} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Please fix the fields marked in red.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => goTo(step - 1)}>
              Back
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Create account' : 'Next'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

- `errors` is a [[derived value]], like lesson 3's password strength: it is worked out from `values` at every drawing,
  so it is always up to date. `Object.keys(errors)` lists the keys of the object; if there are none, the step is fine.
- `showErrors` remembers only whether "Next" was pressed on this step. Until then the steps get an empty object (`{}`),
  so a fresh step is not full of red messages before the user has typed anything.
- `back` is gone: Back, Next and Start over all go through `goTo`, which also hides the messages, so the next step
  starts clean.
- `role="alert"` makes screen readers read the red box out as soon as it appears.
- `App` already hands the messages to the steps (`errors={shownErrors}`), but the steps do not show them yet: that
  comes in the next step. For now the red box above the buttons is the only sign.

:::check Check
Press Next on the empty first step: a red box appears above the buttons, and you stay on step 1. The box speaks of
fields marked in red, but nothing is marked yet: the messages come in the next step. Now type a correct email, and
`secret123` into both password fields: the red box disappears as soon as the last field is right, because the errors
are worked out anew at every drawing. Next takes you on, and step 2 starts without the red box.
:::

:::mistake Common mistake
Keeping the errors in their own state (`const [errors, setErrors] = useState({})`) and filling it in `handleSubmit`.
Then the red box does not follow your typing: you fill in every field correctly, and the box stays until the next click
on Next. What can be worked out from the state should be worked out, not stored.
:::

### Messages under the fields

The red box tells the user that something is wrong, but not what. Every message has to appear under its own field,
so `Field` gets an `error` prop. Replace `src/components/Field.jsx`:

```jsx file=src/components/Field.jsx mark=2,7
// A label with its field inside. Whatever is written between <Field> and </Field> arrives as children.
function Field({ label, error, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__error">{error}</span>}
    </label>
  )
}

export default Field
```

The message is inside the `<label>`, so a screen reader reads it out together with the label when the cursor arrives
in the field. Now the steps pass each field's message on. Replace `src/steps/AccountStep.jsx`:

```jsx file=src/steps/AccountStep.jsx mark=3,6,9,12
import Field from '../components/Field.jsx'

function AccountStep({ register, errors }) {
  return (
    <div className="step">
      <Field label="Email" error={errors.email}>
        <input type="email" autoComplete="email" {...register('email')} />
      </Field>
      <Field label="Password" error={errors.password}>
        <input type="password" autoComplete="new-password" {...register('password')} />
      </Field>
      <Field label="Password again" error={errors.confirm}>
        <input type="password" autoComplete="new-password" {...register('confirm')} />
      </Field>
    </div>
  )
}

export default AccountStep
```

Then `src/steps/ProfileStep.jsx`:

```jsx file=src/steps/ProfileStep.jsx mark=4,7,10,13
import Field from '../components/Field.jsx'
import { ROLES } from '../formData.js'

function ProfileStep({ register, errors }) {
  return (
    <div className="step">
      <Field label="Full name" error={errors.fullName}>
        <input autoComplete="name" {...register('fullName')} />
      </Field>
      <Field label="Username" error={errors.username}>
        <input autoComplete="username" {...register('username')} />
      </Field>
      <Field label="I am a…" error={errors.role}>
        <select {...register('role')}>
          <option value="">Choose one</option>
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}

export default ProfileStep
```

The topics are not in a `Field`, so their message goes under the group by hand. `PreferencesStep` gets `errors` too,
and the first `<fieldset>` gets one more line at its end. Replace `src/steps/PreferencesStep.jsx`:

```jsx file=src/steps/PreferencesStep.jsx mark=3,30
import { FREQUENCIES, TOPICS } from '../formData.js'

function PreferencesStep({ values, setField, errors }) {
  // Ticking adds the topic to the array, unticking takes it out: always into a new array.
  function toggleTopic(topic) {
    if (values.topics.includes(topic)) {
      setField('topics', values.topics.filter((item) => item !== topic))
    } else {
      setField('topics', [...values.topics, topic])
    }
  }

  return (
    <div className="step">
      <fieldset className="choices">
        <legend>Topics you are interested in</legend>
        <div className="choices__list">
          {TOPICS.map((topic) => (
            <label key={topic.value} className="chip">
              <input
                type="checkbox"
                name="topics"
                checked={values.topics.includes(topic.value)}
                onChange={() => toggleTopic(topic.value)}
              />
              {topic.label}
            </label>
          ))}
        </div>
        {errors.topics && <p className="field__error">{errors.topics}</p>}
      </fieldset>

      <fieldset className="choices">
        <legend>Club newsletter</legend>
        <div className="choices__list">
          {FREQUENCIES.map((option) => (
            <label key={option.value} className="chip">
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={values.frequency === option.value}
                onChange={() => setField('frequency', option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default PreferencesStep
```

`App` does not change: it already gives every step its messages.

:::check Check
Press Next on the empty first step: now there is a red message under every field too. Type a correct email: its
message disappears at once. `secret` as a password is too short; `secret123` in both password fields lets you
through. On the Interests step, Next without a topic says "Pick at least one topic."
:::

:::mistake Common mistake
A step that does not take `errors` from its props, for example `function AccountStep({ register })`. Then
`errors.email` has nothing to read from: the page goes blank, and the console (++F12++) says "errors is not defined". A
component can only use the props that it names between the curly brackets of its parameter.
:::

:::try Task
Add a rule of your own: the username cannot be `admin`, not even when someone writes it as `Admin` or `ADMIN`.
`values.username.toLowerCase() === 'admin'` checks it: put it as an `else if` after the existing rule of the username,
and write its message too.
:::

### Errors at the right time

Two things are still not quite right. First: the messages appear only after Next. Someone who mistypes their email
learns about it only at the very end of the step. Showing a message from the first key is not good either: after one
letter, "This does not look like an email address" is just annoying. The usual rule is in between: a field's message
appears once the user has **left** the field, and from then on it follows their typing live. A field that the user has
already left is called [[touched]].

Leaving a field is the [[blur]] event (`onBlur` in React): the field loses the [[focus]]. And `register` is the one
place where every text field gets its attributes, so the new `onBlur` only has to be written there.

Second: after a click on Next with errors, the cursor should jump into the first field that needs fixing. This helps
everyone, and keyboard and screen-reader users most of all. For this we need the form's element on the page, and that
is the job of [[useRef]] (lessons 16 and 18).

Here is the whole `src/App.jsx` again; only the `App` component changes, the steps stay as they are:

```jsx file=src/App.jsx mark=1,14,16,24-28,41-44,59-61,74,103
import { useRef, useState } from 'react'
import { INITIAL_VALUES, STEPS } from './formData.js'
import { validateStep } from './validation.js'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // which step is on the screen: 0 is the first
  const [showErrors, setShowErrors] = useState(false) // true once "Next" was pressed on this step
  const [touched, setTouched] = useState({}) // the fields the user has already left once
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  // Worked out from the answers at every drawing: a derived value, not state.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0

  // The messages the user sees: all of them after "Next", otherwise only those of fields already left.
  const shownErrors = {}
  for (const name of Object.keys(errors)) {
    if (showErrors || touched[name]) shownErrors[name] = errors[name]
  }

  // Changes one field: a new object with every old field, and the new value under its name.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Everything a text field needs from the state: its name, its value, and what to do when it changes.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      // Leaving the field marks it as touched: from then on its message follows the typing.
      onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
      // A field with a message is "invalid": screen readers say so, and the CSS draws it red.
      'aria-invalid': Boolean(shownErrors[name]),
    }
  }

  // Every move between steps goes through here: a new step starts without red messages.
  function goTo(index) {
    setStep(index)
    setShowErrors(false)
  }

  // "Next" is a submit button: a click on it, or Enter in any field, lands here.
  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (hasErrors) {
      setShowErrors(true) // show the messages, and stay on this step
      // Put the cursor into the first field that needs fixing.
      const firstName = Object.keys(errors)[0]
      formRef.current.querySelector(`[name="${firstName}"]`)?.focus()
      return
    }
    if (isLast) {
      setSubmitted(true)
    } else {
      goTo(step + 1)
    }
  }

  // An empty form again, on the first step.
  function startOver() {
    setValues(INITIAL_VALUES)
    setTouched({})
    goTo(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Welcome to Code Club, {values.fullName}!</h2>
          <p>Your account is ready. In a real app, a confirmation email would now go to {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Start over
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'review' && <ReviewStep values={values} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Please fix the fields marked in red.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => goTo(step - 1)}>
              Back
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Create account' : 'Next'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

- `touched` is an object, for example `{ email: true, password: true }`: the names of the fields the user has left.
  `onBlur` adds one more name to it, with an updater function and a spread, the same way `setField` changes `values`.
- `shownErrors` is built from `errors` with a `for … of` loop: a message gets in if "Next" was already pressed, or if
  its field is touched.
- `'aria-invalid'` is written in quotes because of the hyphen in it. [[aria-invalid]] tells screen readers that the
  field's value is wrong, and `App.css` gives such fields a red border. `Boolean(…)` turns any value into `true` or
  `false`: a message becomes `true`, and `undefined` (no message) becomes `false`.
- `ref={formRef}` puts the `<form>` element into `formRef.current`. `querySelector` finds the first element inside it
  that fits a CSS selector: `[name="email"]` is "the element whose `name` is `email`". The selector is built with a
  [[template literal]] (lesson 1). The `?.` ([[optional chaining]], lesson 14) calls `focus()` only if such an element
  exists.
- The order of the keys in `errors` is the order in which `validateStep` wrote them: the same order as the fields on
  the screen. So `Object.keys(errors)[0]` is the first field from the top that needs fixing.
- `startOver` empties `touched` too: a fresh form has no touched fields.

:::check Check
Click into the email field, type `ada` and press ++Tab++: the message appears under the field, and the field gets a red
border. Click back into the email field and type on, `@example.com`: its message disappears while you type. Meanwhile
"Password" shows a message too: you left it empty when you clicked back, so it counts as touched. On a fresh step 2,
press Next straight away: three messages, and the cursor is already in "Full name". On the Interests step, press Next
without a topic, then press ++Space++: the first topic gets ticked, because the focus was put on its box.
:::

:::mistake Common mistake
`onBlur: setTouched({ ...touched, [name]: true })`, without `() =>`. That calls `setTouched` at once, while the page
is being drawn, and gives `onBlur` its result. Setting state while drawing makes React draw again, which sets the state
again… until React stops with a "Too many re-renders" error. Hand over a function, do not call it.
:::

:::try Task
When the step changes, the focus stays on the Next button, and a screen reader does not hear the new step's title.
Move the focus to the `<h2>`: give it `tabIndex={-1}` (then it can get the focus, but ++Tab++ still skips it) and a
`ref`, and in a `useEffect` that runs when `step` changes, call `headingRef.current.focus()`. Skip the very first
drawing, or the page opens with the focus on the heading: keep a `const shouldFocus = useRef(false)` that `goTo` sets
to `true`, and focus only when it is `true` (then set it back). The later steps give you a whole new `App.jsx`: if you
did this task, add these lines again each time.
:::

### The progress indicator

A multi-step form should always show where the user is and how much is left. That is the [[progress indicator]]: the
titles of the steps with numbers, and a bar under them. The steps already passed get a tick. And every step can be
opened with a click, as long as every step before it is filled in correctly: so you can jump back to any earlier step,
and forward again as far as the answers allow.

To know whether a step is fine, add one more function to the end of `src/validation.js`:

```js file=src/validation.js
// True when the step has no errors.
export function isStepValid(stepKey, values) {
  return Object.keys(validateStep(stepKey, values)).length === 0
}
```

The indicator is a component of its own. Create `src/components/StepIndicator.jsx`:

```jsx file=src/components/StepIndicator.jsx
// The numbered steps above the form. A step that can be reached is a button that takes you there.
function StepIndicator({ steps, current, canReach, onSelect }) {
  // How much of the bar is filled, in percent: 0 on the first step, 100 on the last.
  const percent = (current / (steps.length - 1)) * 100

  return (
    <nav className="progress" aria-label="Sign-up progress">
      <ol className="progress__list">
        {steps.map((step, index) => {
          let className = 'progress__item'
          if (index < current) className += ' is-done'
          if (index === current) className += ' is-current'

          return (
            <li key={step.key} className={className}>
              <button
                type="button"
                className="progress__step"
                aria-current={index === current ? 'step' : undefined}
                disabled={index === current || !canReach(index)}
                onClick={() => onSelect(index)}
              >
                <span className="progress__number" aria-hidden="true">
                  {index < current ? '✓' : index + 1}
                </span>
                <span className="progress__title">{step.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="progress__bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </nav>
  )
}

export default StepIndicator
```

- The steps are in an ordered list (`<ol>`) inside a `<nav>`: they are, after all, a way to move around the form, and
  `aria-label` names it for screen readers.
- `className` starts as `'progress__item'` and grows: `is-done` for the steps before the current one, `is-current` for
  the current one. `App.css` colours the circles by these classes.
- [[aria-current]] `="step"` tells a screen reader "this is the current step". On the other buttons it is `undefined`,
  and React leaves the attribute out completely.
- The current step's button is disabled, and so is every step that cannot be reached yet. A `disabled` button cannot
  be clicked, and `App.css` makes it paler.
- The width of the bar is an [[inline style]]: `style` gets an object, and `${percent}%` turns the number into, for
  example, `'50%'`.

In the summary, every group gets an "Edit" button that takes the user back to its step. Replace
`src/steps/ReviewStep.jsx`:

```jsx file=src/steps/ReviewStep.jsx mark=9,44-51
import { FREQUENCIES, ROLES, TOPICS } from '../formData.js'

// The label of a stored value, for example 'student' → 'Student'.
function labelOf(options, value) {
  const option = options.find((item) => item.value === value)
  return option ? option.label : ''
}

function ReviewStep({ values, onEdit }) {
  const sections = [
    {
      key: 'account',
      title: 'Account',
      rows: [
        ['Email', values.email],
        ['Password', values.password ? '••••••••' : ''],
      ],
    },
    {
      key: 'profile',
      title: 'Profile',
      rows: [
        ['Full name', values.fullName],
        ['Username', values.username],
        ['I am a…', labelOf(ROLES, values.role)],
      ],
    },
    {
      key: 'preferences',
      title: 'Interests',
      rows: [
        ['Topics', values.topics.map((topic) => labelOf(TOPICS, topic)).join(', ')],
        ['Newsletter', labelOf(FREQUENCIES, values.frequency)],
      ],
    },
  ]

  return (
    <div className="summary">
      {sections.map((section) => (
        <section key={section.key} className="summary__section">
          <div className="summary__head">
            <h3>{section.title}</h3>
            <button
              type="button"
              className="link-button"
              aria-label={'Edit: ' + section.title}
              onClick={() => onEdit(section.key)}
            >
              Edit
            </button>
          </div>
          <dl>
            {section.rows.map(([label, value]) => (
              <div key={label} className="summary__row">
                <dt>{label}</dt>
                {/* An empty answer shows a dash, so the row does not look broken. */}
                <dd>{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

export default ReviewStep
```

Three "Edit" buttons would sound the same to a screen reader, so `aria-label` gives each one a full name ("Edit:
Profile"). Here is `src/App.jsx` at the end of the intermediate level:

```jsx file=src/App.jsx mark=3-4,55-58,60-63,114,129
import { useRef, useState } from 'react'
import { INITIAL_VALUES, STEPS } from './formData.js'
import { isStepValid, validateStep } from './validation.js'
import StepIndicator from './components/StepIndicator.jsx'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // which step is on the screen: 0 is the first
  const [showErrors, setShowErrors] = useState(false) // true once "Next" was pressed on this step
  const [touched, setTouched] = useState({}) // the fields the user has already left once
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  // Worked out from the answers at every drawing: a derived value, not state.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0

  // The messages the user sees: all of them after "Next", otherwise only those of fields already left.
  const shownErrors = {}
  for (const name of Object.keys(errors)) {
    if (showErrors || touched[name]) shownErrors[name] = errors[name]
  }

  // Changes one field: a new object with every old field, and the new value under its name.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Everything a text field needs from the state: its name, its value, and what to do when it changes.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      // Leaving the field marks it as touched: from then on its message follows the typing.
      onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
      // A field with a message is "invalid": screen readers say so, and the CSS draws it red.
      'aria-invalid': Boolean(shownErrors[name]),
    }
  }

  // Every move between steps goes through here: a new step starts without red messages.
  function goTo(index) {
    setStep(index)
    setShowErrors(false)
  }

  // A step can be opened when every step before it is filled in correctly.
  function canReach(index) {
    return STEPS.slice(0, index).every((s) => isStepValid(s.key, values))
  }

  // From the summary: back to the step with this key.
  function editStep(key) {
    goTo(STEPS.findIndex((s) => s.key === key))
  }

  // "Next" is a submit button: a click on it, or Enter in any field, lands here.
  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (hasErrors) {
      setShowErrors(true) // show the messages, and stay on this step
      // Put the cursor into the first field that needs fixing.
      const firstName = Object.keys(errors)[0]
      formRef.current.querySelector(`[name="${firstName}"]`)?.focus()
      return
    }
    if (isLast) {
      setSubmitted(true)
    } else {
      goTo(step + 1)
    }
  }

  // An empty form again, on the first step.
  function startOver() {
    setValues(INITIAL_VALUES)
    setTouched({})
    goTo(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Welcome to Code Club, {values.fullName}!</h2>
          <p>Your account is ready. In a real app, a confirmation email would now go to {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Start over
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <StepIndicator steps={STEPS} current={step} canReach={canReach} onSelect={goTo} />

      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'review' && <ReviewStep values={values} onEdit={editStep} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Please fix the fields marked in red.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => goTo(step - 1)}>
              Back
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Create account' : 'Next'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

- `canReach(index)`: `STEPS.slice(0, index)` is the steps before the given one, and `every` ([[every]], lesson 13)
  is true if every one of them is valid. For the first step the list is empty, and `every` of an empty list is `true`:
  the first step can always be opened.
- The indicator gets `goTo` itself as `onSelect`: a click on a step is the same as moving there with the buttons.
- `editStep` gets a key from the summary, and `findIndex` finds the position of the step with that key.

:::concept Answers that stay put
The jumps show best why the answers live in `App`. Go from the summary to Account, change the email, and jump straight
back to Review: the new email is there, and so is everything else. Every step was taken off the page in the meantime,
but none of them kept anything of its own: `values` is in `App`, the only component that is always on the screen.
`touched` lives there too, so a field you left before still shows its message when you come back.
:::

:::check Check
Above the form, four numbered steps and a bar. On the first step only circle 1 is coloured, and steps 2–4 are pale: you
cannot open them yet. Fill in the Account step correctly: circle 2 becomes clickable even before you press Next. Go on
to Review: three ticks, and the bar is full. Click "Edit" next to Profile: you are on step 2, with your answers. Click 4
in the indicator: back on Review. Switch on the phone view (++F12++, then ++Ctrl++ + ++Shift++ + ++M++, on a Mac
++Cmd++ + ++Shift++ + ++M++): only the numbers remain. The intermediate level is done: commit it!
:::

:::mistake Common mistake
`STEPS.slice(0, index + 1)` in `canReach`. Then the indicator opens a step only if it is valid **itself** too, and a
step you have not filled in yet never is: even with a valid account step, circle 2 stays pale, and only Next takes you
there (Next does not ask `canReach`).
:::

:::try Task
On the first step the bar is empty, as if the user had not started yet. Change the calculation in `StepIndicator` to
`((current + 1) / steps.length) * 100`: now the first step fills a quarter, and the last one fills the bar. Which one do
you like better?
:::

## Advanced level {level=3}

### Rules as a schema

`validateStep` works, but it is one long function with every rule of every step mixed in, and every rule has to know
which step it belongs to. Bigger forms do it differently: they describe their data. A [[schema]] is a description of
what every field must look like, written down once, as data. Then any part of the form can be checked against it: the
fields of one step on Next, or the whole form before sending.

This is exactly what [[Zod]], the best-known schema library, is for, and [[React Hook Form]], the best-known form
library, can check its fields against a Zod schema. Here we write a small version of the same idea ourselves, so you see
what these libraries do inside; after that you see side by side how the same thing looks with them.

First, every step lists its own fields. In `src/formData.js`, replace `STEPS` (the rest of the file stays):

```js file=src/formData.js
// The steps, in order. The key is for the code, the title is for the user; fields are checked on "Next".
export const STEPS = [
  { key: 'account', title: 'Account', fields: ['email', 'password', 'confirm'] },
  { key: 'profile', title: 'Profile', fields: ['fullName', 'username', 'role'] },
  { key: 'preferences', title: 'Interests', fields: ['topics', 'frequency'] },
  { key: 'review', title: 'Review', fields: [] },
]
```

Then the rules. Replace the whole of `src/validation.js`:

```js file=src/validation.js
import { STEPS } from './formData.js'

// Something, an @, something, a dot, something; and no spaces anywhere.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// 3 to 20 characters: letters, digits or _.
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i

// The schema: the rules of every field, in one place. A rule is a test and a message:
// when the test returns false, the message becomes the field's error.
const SCHEMA = {
  email: [
    { test: (value) => value.trim() !== '', message: 'Enter your email address.' },
    { test: (value) => EMAIL_PATTERN.test(value.trim()), message: 'This does not look like an email address.' },
  ],
  password: [
    { test: (value) => value.length >= 8, message: 'Use at least 8 characters.' },
    { test: (value) => /[a-z]/i.test(value) && /\d/.test(value), message: 'Use both letters and digits.' },
  ],
  confirm: [
    { test: (value) => value !== '', message: 'Type the password again.' },
    // The second parameter is the whole form, so a rule can compare two fields.
    { test: (value, values) => value === values.password, message: 'The two passwords do not match.' },
  ],
  fullName: [{ test: (value) => value.trim() !== '', message: 'Enter your name.' }],
  username: [{ test: (value) => USERNAME_PATTERN.test(value), message: '3–20 characters: letters, digits or _.' }],
  role: [{ test: (value) => value !== '', message: 'Choose one.' }],
  topics: [{ test: (value) => value.length > 0, message: 'Pick at least one topic.' }],
}

// The errors of some fields, as { field name: the message of its first broken rule }.
export function validateFields(fields, values) {
  const errors = {}
  for (const name of fields) {
    const rules = SCHEMA[name] ?? [] // a field without rules (frequency, for example) is always fine
    const broken = rules.find((rule) => !rule.test(values[name], values))
    if (broken) errors[name] = broken.message
  }
  return errors
}

// The errors of one step: the step itself lists its fields.
export function validateStep(stepKey, values) {
  const step = STEPS.find((s) => s.key === stepKey)
  return validateFields(step.fields, values)
}

// True when the step has no errors.
export function isStepValid(stepKey, values) {
  return Object.keys(validateStep(stepKey, values)).length === 0
}
```

- `SCHEMA` has a list of rules for every field. A rule is an object with a `test` function and a `message`. `test`
  gets the field's value, and the whole form as well, so the `confirm` rule can compare it with the password.
- `validateFields` goes through the given fields, and `find` returns the first rule whose test fails: that one's
  message becomes the error. One message per field is enough; the next one shows once the first is fixed.
- `SCHEMA[name] ?? []`: `??` ([[nullish coalescing]], lesson 13) gives the right side when the left side is `null` or
  `undefined`. A field without rules gets an empty list, so it never has an error.
- The password got a new rule (letters and digits): `/[a-z]/i` looks for a letter in it, `/\d/` for a digit (`\d` means
  "one digit, 0–9"), and the test is true when both are found. One line in the schema, and nothing else had to change.
- `validateStep` and `isStepValid` kept their names and parameters, so `App` does not change at all. It does not know
  how the checking is done, only that it can ask for it.

:::compare
```js label="Our schema (a part of it)" now
const SCHEMA = {
  email: [
    { test: (value) => value.trim() !== '', message: 'Enter your email address.' },
    { test: (value) => EMAIL_PATTERN.test(value.trim()), message: 'This does not look like an email address.' },
  ],
  password: [{ test: (value) => value.length >= 8, message: 'Use at least 8 characters.' }],
  confirm: [
    { test: (value, values) => value === values.password, message: 'The two passwords do not match.' },
  ],
}
```
```js label="The same with Zod"
import { z } from 'zod'

const schema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Enter your email address.')
      .email('This does not look like an email address.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
    confirm: z.string(),
  })
  .refine((data) => data.confirm === data.password, {
    message: 'The two passwords do not match.',
    path: ['confirm'],
  })

// { success: true, data } or { success: false, error } with every problem in error.issues
const result = schema.safeParse(values)
```
:::

In Zod the rules are chained one after the other: `z.string()` is "a text", `.min(1, …)` "at least one character",
`.email(…)` "an email address", each with its own message. A rule that compares two fields goes on the whole object
with `refine`, and `path` says which field gets its message. Zod has ready-made rules for everything (numbers, dates,
lists…), and it also tells TypeScript, the typed version of JavaScript, what the data looks like.

React Hook Form ties such a schema to the fields. Its `register` does what ours does: it gives a field everything it
needs, and you spread it on the input with the same three dots:

:::compare
```jsx label="Our App (a part of it)" now
const errors = validateStep(current.key, values)

function register(name) {
  return {
    name,
    value: values[name],
    onChange: (event) => setField(name, event.target.value),
    onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
  }
}
```
```jsx label="With React Hook Form"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function SignupForm() {
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: INITIAL_VALUES })
  const [step, setStep] = useState(0)

  // "Next": check only the fields of this step; trigger answers true if they are fine.
  async function next() {
    if (await trigger(['email', 'password', 'confirm'])) setStep(step + 1)
  }

  return <input type="email" {...register('email')} />
}
```
:::

`resolver: zodResolver(schema)` is a small adapter from the `@hookform/resolvers` package: it lets React Hook Form check
its fields with a Zod schema. `mode: 'onTouched'` is our "errors at the right time", and `trigger(fields)` checks only
the given fields, just like the `fields` lists of our steps. The big difference is inside: React Hook Form does not keep
the answers in state. It reads them straight from the fields through refs (they are
[[uncontrolled inputs|uncontrolled input]], lesson 4), so a keystroke does not redraw the whole form. In a small form
like ours that makes no difference; in a form with a hundred fields it does. In a real project you would install the
three packages with `npm install react-hook-form zod @hookform/resolvers`. Here we stay with our own version: now you
know what they do.

:::check Check
Everything works as before. One new thing: type `abcdefgh` as a password and leave the field (++Tab++): "Use both
letters and digits." Click back and change it to `abcd1234`: the message disappears. (The empty "Password again" field
now shows a message of its own: you left it too.)
:::

:::mistake Common mistake
A field left out of a step's `fields` list, for example `confirm`. Its rules are in the schema, but nothing ever runs
them: the two passwords can differ, and Next lets you through without a word.
:::

:::try Task
A name longer than 40 characters is suspicious. Add a second rule to `fullName`, with `value.trim().length <= 40` as
its test and a message of your own.
:::

:::try Task (optional): the real libraries
Would you like to try Zod and React Hook Form for real? Install them in your project with
`npm install react-hook-form zod @hookform/resolvers`, and make a small practice form with only the three fields of the
account step. Create `src/AccountDemo.jsx`:

```jsx file=src/AccountDemo.jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Field from './components/Field.jsx'
import './App.css'

const schema = z
  .object({
    email: z.string().trim().min(1, 'Enter your email address.').email('This does not look like an email address.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
    confirm: z.string(),
  })
  .refine((data) => data.confirm === data.password, {
    message: 'The two passwords do not match.',
    path: ['confirm'],
  })

function AccountDemo() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched' })

  // handleSubmit calls this only when every field is fine: data holds the checked answers.
  function onValid(data) {
    console.log('Fine:', data)
  }

  return (
    <main className="signup">
      <form className="signup__form" onSubmit={handleSubmit(onValid)} noValidate>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input type="password" {...register('password')} />
        </Field>
        <Field label="Password again" error={errors.confirm?.message}>
          <input type="password" {...register('confirm')} />
        </Field>
        <button type="submit" className="button">
          Check
        </button>
      </form>
    </main>
  )
}

export default AccountDemo
```

In React Hook Form an error is an object, and its text is in `message`; our `Field` works with it unchanged. While
you experiment, draw this form instead of `App`: in `src/main.jsx`, change `import App from './App.jsx'` to
`import App from './AccountDemo.jsx'`. Leave the fields, type, press Check, and watch the console (++F12++). When you
are done, put the import back.
:::

### A step that appears only when needed

Code Club has mentors. At the end of the Interests step, a new checkbox appears: "I would like a mentor". If it is
ticked, an extra step appears before the summary, where the user writes what they would like to learn and how much
time they have. A step that only some users get is a [[conditional step]].

The list of steps that the user has to go through is no longer fixed: it depends on the answers. So it becomes a
derived value too. A step can have a `showIf` function: if it has one, the step is shown only when the function returns
`true` for the current answers. Here is the whole of `src/formData.js`:

```js file=src/formData.js mark=11-13,17,21-22,26-29,53-57
// Every field of the form, with its starting value: the whole form is one object.
export const INITIAL_VALUES = {
  email: '',
  password: '',
  confirm: '', // the password once more
  fullName: '',
  username: '',
  role: '',
  topics: [], // several topics can be ticked, so this is an array
  frequency: 'weekly',
  wantsMentor: false,
  goal: '',
  hours: '',
}

// The steps, in order. The key is for the code, the title is for the user; fields are checked on "Next".
// A step with showIf appears only when showIf returns true for the answers.
export const STEPS = [
  { key: 'account', title: 'Account', fields: ['email', 'password', 'confirm'] },
  { key: 'profile', title: 'Profile', fields: ['fullName', 'username', 'role'] },
  { key: 'preferences', title: 'Interests', fields: ['topics', 'frequency', 'wantsMentor'] },
  { key: 'mentor', title: 'Mentor', fields: ['goal', 'hours'], showIf: (values) => values.wantsMentor },
  { key: 'review', title: 'Review', fields: [] },
]

// The steps this user has to go through, with these answers.
export function visibleSteps(values) {
  return STEPS.filter((step) => !step.showIf || step.showIf(values))
}

// The choices of "I am a…": the value is what we store, the label is what the user sees.
export const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'other', label: 'Something else' },
]

export const TOPICS = [
  { value: 'react', label: 'React' },
  { value: 'css', label: 'CSS' },
  { value: 'games', label: 'Games' },
  { value: 'a11y', label: 'Accessibility' },
  { value: 'design', label: 'UI design' },
]

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export const HOURS = [
  { value: '1-2', label: '1–2 hours a week' },
  { value: '3-5', label: '3–5 hours a week' },
  { value: '6+', label: 'More than 5 hours a week' },
]
```

`!step.showIf || step.showIf(values)` reads: "the step has no `showIf`, **or** its `showIf` says yes". A function can
be stored in an object like any other value, and called later.

The two new fields need rules. In `src/validation.js`, add these two entries to `SCHEMA`, after `topics`:

```js file=src/validation.js
  goal: [{ test: (value) => value.trim().length >= 10, message: 'Write at least 10 characters.' }],
  hours: [{ test: (value) => value !== '', message: 'Choose one.' }],
```

Create the mentor step, the file `src/steps/MentorStep.jsx`. A `<textarea>` ([[textarea]], lesson 5) also takes a
`value` and an `onChange`, so `register` works for it too:

```jsx file=src/steps/MentorStep.jsx
import Field from '../components/Field.jsx'
import { HOURS } from '../formData.js'

function MentorStep({ register, errors }) {
  return (
    <div className="step">
      <Field label="What would you like to learn with a mentor?" error={errors.goal}>
        <textarea rows={4} {...register('goal')} />
      </Field>
      <Field label="Time you can give it" error={errors.hours}>
        <select {...register('hours')}>
          <option value="">Choose one</option>
          {HOURS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}

export default MentorStep
```

The box goes at the end of the Interests step. Replace `src/steps/PreferencesStep.jsx`:

```jsx file=src/steps/PreferencesStep.jsx mark=51-59
import { FREQUENCIES, TOPICS } from '../formData.js'

function PreferencesStep({ values, setField, errors }) {
  // Ticking adds the topic to the array, unticking takes it out: always into a new array.
  function toggleTopic(topic) {
    if (values.topics.includes(topic)) {
      setField('topics', values.topics.filter((item) => item !== topic))
    } else {
      setField('topics', [...values.topics, topic])
    }
  }

  return (
    <div className="step">
      <fieldset className="choices">
        <legend>Topics you are interested in</legend>
        <div className="choices__list">
          {TOPICS.map((topic) => (
            <label key={topic.value} className="chip">
              <input
                type="checkbox"
                name="topics"
                checked={values.topics.includes(topic.value)}
                onChange={() => toggleTopic(topic.value)}
              />
              {topic.label}
            </label>
          ))}
        </div>
        {errors.topics && <p className="field__error">{errors.topics}</p>}
      </fieldset>

      <fieldset className="choices">
        <legend>Club newsletter</legend>
        <div className="choices__list">
          {FREQUENCIES.map((option) => (
            <label key={option.value} className="chip">
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={values.frequency === option.value}
                onChange={() => setField('frequency', option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="check">
        <input
          type="checkbox"
          name="wantsMentor"
          checked={values.wantsMentor}
          onChange={(event) => setField('wantsMentor', event.target.checked)}
        />
        I would like a mentor (one more short step)
      </label>
    </div>
  )
}

export default PreferencesStep
```

A single checkbox tells whether it is ticked in `event.target.checked`, so `setField` gets `true` or `false`.

Finally `App`: instead of the fixed `STEPS`, it works with the visible steps everywhere. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=2,8,20-23,60,65,117,122,132
import { useRef, useState } from 'react'
import { INITIAL_VALUES, visibleSteps } from './formData.js'
import { isStepValid, validateStep } from './validation.js'
import StepIndicator from './components/StepIndicator.jsx'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import MentorStep from './steps/MentorStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(0) // which step is on the screen: 0 is the first
  const [showErrors, setShowErrors] = useState(false) // true once "Next" was pressed on this step
  const [touched, setTouched] = useState({}) // the fields the user has already left once
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef(null)

  // The steps this user has to go through: the mentor step only if they asked for a mentor.
  const steps = visibleSteps(values)
  const current = steps[step]
  const isLast = step === steps.length - 1
  // Worked out from the answers at every drawing: a derived value, not state.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0

  // The messages the user sees: all of them after "Next", otherwise only those of fields already left.
  const shownErrors = {}
  for (const name of Object.keys(errors)) {
    if (showErrors || touched[name]) shownErrors[name] = errors[name]
  }

  // Changes one field: a new object with every old field, and the new value under its name.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Everything a text field needs from the state: its name, its value, and what to do when it changes.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      // Leaving the field marks it as touched: from then on its message follows the typing.
      onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
      // A field with a message is "invalid": screen readers say so, and the CSS draws it red.
      'aria-invalid': Boolean(shownErrors[name]),
    }
  }

  // Every move between steps goes through here: a new step starts without red messages.
  function goTo(index) {
    setStep(index)
    setShowErrors(false)
  }

  // A step can be opened when every step before it is filled in correctly.
  function canReach(index) {
    return steps.slice(0, index).every((s) => isStepValid(s.key, values))
  }

  // From the summary: back to the step with this key.
  function editStep(key) {
    goTo(steps.findIndex((s) => s.key === key))
  }

  // "Next" is a submit button: a click on it, or Enter in any field, lands here.
  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (hasErrors) {
      setShowErrors(true) // show the messages, and stay on this step
      // Put the cursor into the first field that needs fixing.
      const firstName = Object.keys(errors)[0]
      formRef.current.querySelector(`[name="${firstName}"]`)?.focus()
      return
    }
    if (isLast) {
      setSubmitted(true)
    } else {
      goTo(step + 1)
    }
  }

  // An empty form again, on the first step.
  function startOver() {
    setValues(INITIAL_VALUES)
    setTouched({})
    goTo(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Welcome to Code Club, {values.fullName}!</h2>
          <p>Your account is ready. In a real app, a confirmation email would now go to {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Start over
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      <StepIndicator steps={steps} current={step} canReach={canReach} onSelect={goTo} />

      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            Step {step + 1} of {steps.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'mentor' && <MentorStep register={register} errors={shownErrors} />}
        {current.key === 'review' && <ReviewStep values={values} onEdit={editStep} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Please fix the fields marked in red.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => goTo(step - 1)}>
              Back
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Create account' : 'Next'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

Every place that used `STEPS` now uses `steps`: the indicator, the "Step 3 of 5" line, `isLast`, `canReach` and
`editStep`. The indicator gets one more circle or one fewer on its own, because it only draws what it gets. The fields
of a hidden step are not checked either: `canReach` and Next only look at the visible steps.

:::check Check
On the Interests step, tick "I would like a mentor": the indicator gets a fifth circle, Mentor, and the line says
"Step 3 of 5". Next takes you to the mentor step; Next on its empty fields shows two messages. Go back to Interests and
untick the box: four circles again.
:::

:::mistake Common mistake
One `STEPS` left in `App`, for example in `Step {step + 1} of {STEPS.length}`. If you already took it out of the
import, the page goes blank, and the console (++F12++) says "STEPS is not defined". If it is still in the import too,
the line says "of 5" even when the mentor step is hidden and the indicator shows only four circles. When a value is
derived, every part of the page has to use the derived one.
:::

### The mentor in the summary

The summary still shows only its three fixed groups: it knows nothing about the mentor yet. Now it gets a Mentor
group too, but only when the user asked for a mentor. Replace `src/steps/ReviewStep.jsx`:

```jsx file=src/steps/ReviewStep.jsx mark=1,34,39-49
import { FREQUENCIES, HOURS, ROLES, TOPICS } from '../formData.js'

// The label of a stored value, for example 'student' → 'Student'.
function labelOf(options, value) {
  const option = options.find((item) => item.value === value)
  return option ? option.label : ''
}

function ReviewStep({ values, onEdit }) {
  const sections = [
    {
      key: 'account',
      title: 'Account',
      rows: [
        ['Email', values.email],
        ['Password', values.password ? '••••••••' : ''],
      ],
    },
    {
      key: 'profile',
      title: 'Profile',
      rows: [
        ['Full name', values.fullName],
        ['Username', values.username],
        ['I am a…', labelOf(ROLES, values.role)],
      ],
    },
    {
      key: 'preferences',
      title: 'Interests',
      rows: [
        ['Topics', values.topics.map((topic) => labelOf(TOPICS, topic)).join(', ')],
        ['Newsletter', labelOf(FREQUENCIES, values.frequency)],
        ['Mentor', values.wantsMentor ? 'Yes, please' : 'No, thanks'],
      ],
    },
  ]

  // A group for the conditional step, only when it was shown.
  if (values.wantsMentor) {
    sections.push({
      key: 'mentor',
      title: 'Mentor',
      rows: [
        ['Goal', values.goal],
        ['Time', labelOf(HOURS, values.hours)],
      ],
    })
  }

  return (
    <div className="summary">
      {sections.map((section) => (
        <section key={section.key} className="summary__section">
          <div className="summary__head">
            <h3>{section.title}</h3>
            <button
              type="button"
              className="link-button"
              aria-label={'Edit: ' + section.title}
              onClick={() => onEdit(section.key)}
            >
              Edit
            </button>
          </div>
          <dl>
            {section.rows.map(([label, value]) => (
              <div key={label} className="summary__row">
                <dt>{label}</dt>
                {/* An empty answer shows a dash, so the row does not look broken. */}
                <dd>{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

export default ReviewStep
```

`sections.push(…)` changes the array in place, and that is fine here: `sections` is not state, it is a brand new
array that this drawing has just made for itself.

:::check Check
Fill in the mentor step and go on: the summary shows a Mentor group, and Interests has a "Mentor: Yes, please" row.
Jump back to Interests, untick the box, and go on to Review again: the Mentor group is gone, and the row says "No,
thanks".
:::

:::try Try it
Offer mentors only to students: change the `showIf` of the mentor step to
`(values) => values.wantsMentor && values.role === 'student'`, and sign up as a developer with the box ticked. The step
does not appear, but the summary still has a Mentor group full of dashes: `ReviewStep` asks `values.wantsMentor`, not
the steps. How would you fix it? (One way: hide the box in `PreferencesStep` with conditional rendering unless
`values.role` is `'student'`.)
:::

### Saving a draft

Imagine that someone is on the third step, and closes the tab by accident: everything they typed is lost, and they
have to start again. Many forms save a [[draft]] as you type, and when you come back, they fill the fields in again.
`localStorage` (lesson 9) can do this, with one exception: the passwords never go into it, because anyone who uses the
same browser could read them.

The draft gets a small file of its own. Create `src/draft.js`:

```js file=src/draft.js
import { INITIAL_VALUES } from './formData.js'

const DRAFT_KEY = 'code-club:draft'

// Saves the answers, but never the passwords: anyone using this browser could read them.
export function saveDraft(values) {
  const { password, confirm, ...rest } = values
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest))
  } catch {
    // storage full or blocked: the form still works, only the draft is lost
  }
}

// The saved draft (with empty passwords), or null if there is none.
export function loadDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved !== null) return { ...INITIAL_VALUES, ...JSON.parse(saved) }
  } catch {
    // broken data or blocked storage: start with an empty form
  }
  return null
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // blocked storage: there is nothing to clear
  }
}
```

- `const { password, confirm, ...rest } = values` is object destructuring with a [[rest pattern]]: it takes
  `password` and `confirm` out into two variables, and `rest` gets a copy of everything else. We do not need the two
  variables: they are only there so that `rest` is without them.
- `{ ...INITIAL_VALUES, ...JSON.parse(saved) }` first spreads the empty form, then the saved answers over it. So the
  passwords are `''` again, and a field that did not exist when the draft was saved gets its starting value.
- `localStorage` can throw an error (full storage, private mode, blocked site data), so every use of it is in a
  `try/catch`, as in lesson 9.

In `App`, three things change: the first value of `values` comes from the draft, an effect saves the answers, and a
note tells the user that their draft is back. Replace `src/App.jsx`:

```jsx file=src/App.jsx mark=1,4,14-17,38-43,67,91,98-104,138-145
import { useEffect, useRef, useState } from 'react'
import { INITIAL_VALUES, visibleSteps } from './formData.js'
import { isStepValid, validateStep } from './validation.js'
import { clearDraft, loadDraft, saveDraft } from './draft.js'
import StepIndicator from './components/StepIndicator.jsx'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import MentorStep from './steps/MentorStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

function App() {
  // The draft is read only once, at the very first drawing.
  const [draft] = useState(loadDraft)
  const [values, setValues] = useState(draft ?? INITIAL_VALUES)
  const [showNotice, setShowNotice] = useState(draft !== null) // "Welcome back" only after a restored draft
  const [step, setStep] = useState(0) // which step is on the screen: 0 is the first
  const [showErrors, setShowErrors] = useState(false) // true once "Next" was pressed on this step
  const [touched, setTouched] = useState({}) // the fields the user has already left once
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef(null)

  // The steps this user has to go through: the mentor step only if they asked for a mentor.
  const steps = visibleSteps(values)
  const current = steps[step]
  const isLast = step === steps.length - 1
  // Worked out from the answers at every drawing: a derived value, not state.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0

  // The messages the user sees: all of them after "Next", otherwise only those of fields already left.
  const shownErrors = {}
  for (const name of Object.keys(errors)) {
    if (showErrors || touched[name]) shownErrors[name] = errors[name]
  }

  // Half a second after the last change, the answers go into localStorage.
  useEffect(() => {
    if (values === INITIAL_VALUES) return // nothing typed yet: nothing to save
    const timer = setTimeout(() => saveDraft(values), 500)
    return () => clearTimeout(timer) // typing again within half a second cancels the earlier save
  }, [values])

  // Changes one field: a new object with every old field, and the new value under its name.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Everything a text field needs from the state: its name, its value, and what to do when it changes.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      // Leaving the field marks it as touched: from then on its message follows the typing.
      onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
      // A field with a message is "invalid": screen readers say so, and the CSS draws it red.
      'aria-invalid': Boolean(shownErrors[name]),
    }
  }

  // Every move between steps goes through here: a new step starts without red messages.
  function goTo(index) {
    setStep(index)
    setShowErrors(false)
    setShowNotice(false)
  }

  // A step can be opened when every step before it is filled in correctly.
  function canReach(index) {
    return steps.slice(0, index).every((s) => isStepValid(s.key, values))
  }

  // From the summary: back to the step with this key.
  function editStep(key) {
    goTo(steps.findIndex((s) => s.key === key))
  }

  // "Next" is a submit button: a click on it, or Enter in any field, lands here.
  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (hasErrors) {
      setShowErrors(true) // show the messages, and stay on this step
      // Put the cursor into the first field that needs fixing.
      const firstName = Object.keys(errors)[0]
      formRef.current.querySelector(`[name="${firstName}"]`)?.focus()
      return
    }
    if (isLast) {
      clearDraft() // the form is done: the draft is not needed any more
      setSubmitted(true)
    } else {
      goTo(step + 1)
    }
  }

  // Throws the draft away, and starts with an empty form.
  function discardDraft() {
    clearDraft()
    setValues(INITIAL_VALUES)
    setTouched({})
    setShowNotice(false)
  }

  // An empty form again, on the first step.
  function startOver() {
    setValues(INITIAL_VALUES)
    setTouched({})
    goTo(0)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Welcome to Code Club, {values.fullName}!</h2>
          <p>Your account is ready. In a real app, a confirmation email would now go to {values.email}.</p>
          <button type="button" className="button" onClick={startOver}>
            Start over
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      {showNotice && (
        <div className="signup__notice">
          <p>Welcome back! We filled in what you typed last time. Passwords are never saved: type yours again.</p>
          <button type="button" className="link-button" onClick={discardDraft}>
            Discard draft
          </button>
        </div>
      )}

      <StepIndicator steps={steps} current={step} canReach={canReach} onSelect={goTo} />

      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            Step {step + 1} of {steps.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'mentor' && <MentorStep register={register} errors={shownErrors} />}
        {current.key === 'review' && <ReviewStep values={values} onEdit={editStep} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Please fix the fields marked in red.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => goTo(step - 1)}>
              Back
            </button>
          )}
          <button type="submit" className="button">
            {isLast ? 'Create account' : 'Next'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

- `useState(loadDraft)` gets the function itself, without brackets: it is a [[lazy initial state]] (lesson 3), so
  React reads `localStorage` only once, at the first drawing. Its result, `draft`, is the starting value of `values`
  (`??` gives `INITIAL_VALUES` when there is no draft) and decides whether the note appears.
- The effect runs after every change of `values`. It does not save at once: it starts a timer, and if the user types
  again within half a second, the [[cleanup function]] cancels it, and a new one starts. So `localStorage` is written
  only when the typing stops: the same trick as lesson 20's search box ([[debounce]]).
- `values === INITIAL_VALUES` is true only while nothing has been typed: `setField` always makes a **new** object, and
  `===` compares objects by identity, not by content. So a fresh visit does not save an empty draft.
- The passwords are not in the draft, so the form starts on the first step again: the user types their password, and
  the rest of the answers are waiting for them. The note disappears at the first step change (`goTo`).
- After a successful sign-up the draft is cleared: the next visitor of this browser gets an empty form.

:::check Check
Fill in the first two steps, and reload the page (++F5++). A green note says "Welcome back!", every field is filled in
again except the two passwords, and you are on step 1. Open the developer tools (++F12++) → Application → Local
storage: the `code-club:draft` key holds your answers, without any password. "Discard draft" empties the form.
:::

:::mistake Common mistake
`useState(loadDraft())`, with brackets. It works, but `loadDraft` now runs at every drawing, that is, at every
keystroke, and reads and parses `localStorage` each time, only for React to throw the result away. Without the brackets
React calls it only once.
:::

### Sending to the server

The last piece: a real sign-up form sends its answers to a [[server]], which saves the new account and sends back a
reply. For this, the exercise has come with a pretend server from the start: `src/fakeApi.js`. It behaves like a real
one (every request takes a little while, and some of them fail), but it runs in the browser, and its "database" is a
`localStorage` key. It is used like this:

- `createMockApi('code-club', { latency: [700, 1400], failRate: 0.25 })` makes a server: an answer takes 0.7 to 1.4
  seconds, and on average one request in four fails on purpose, so you can see what your form does then.
- `api.create('accounts', data)` saves a new account, and its answer is the saved account, with an `id` and a
  `createdAt` date added by the server. It returns a [[Promise]], so it goes with `await` in an
  [[async function]], and a failure is caught with `try/catch` (lesson 14).

The form now has more states than "filling in" and "done": while the request is on its way, it is **sending**, and
if it fails, there is an **error**. One state value, `status`, says which one, as in lesson 14. And instead of
`submitted`, `App` keeps the account that the server sent back. Here is the final `src/App.jsx`:

```jsx file=src/App.jsx mark=5,14-15,25-26,36,71,75,88-101,114,133,136,143-147,156-157,199-203,207-212,216-217
import { useEffect, useRef, useState } from 'react'
import { INITIAL_VALUES, visibleSteps } from './formData.js'
import { isStepValid, validateStep } from './validation.js'
import { clearDraft, loadDraft, saveDraft } from './draft.js'
import { createMockApi } from './fakeApi.js'
import StepIndicator from './components/StepIndicator.jsx'
import AccountStep from './steps/AccountStep.jsx'
import ProfileStep from './steps/ProfileStep.jsx'
import PreferencesStep from './steps/PreferencesStep.jsx'
import MentorStep from './steps/MentorStep.jsx'
import ReviewStep from './steps/ReviewStep.jsx'
import './App.css'

// The pretend server: a little slow, and on average one request in four fails on purpose.
const api = createMockApi('code-club', { latency: [700, 1400], failRate: 0.25 })

function App() {
  // The draft is read only once, at the very first drawing.
  const [draft] = useState(loadDraft)
  const [values, setValues] = useState(draft ?? INITIAL_VALUES)
  const [showNotice, setShowNotice] = useState(draft !== null) // "Welcome back" only after a restored draft
  const [step, setStep] = useState(0) // which step is on the screen: 0 is the first
  const [showErrors, setShowErrors] = useState(false) // true once "Next" was pressed on this step
  const [touched, setTouched] = useState({}) // the fields the user has already left once
  const [status, setStatus] = useState('editing') // 'editing', 'sending' or 'error'
  const [account, setAccount] = useState(null) // the new account, once the server has saved it
  const formRef = useRef(null)

  // The steps this user has to go through: the mentor step only if they asked for a mentor.
  const steps = visibleSteps(values)
  const current = steps[step]
  const isLast = step === steps.length - 1
  // Worked out from the answers at every drawing: a derived value, not state.
  const errors = validateStep(current.key, values)
  const hasErrors = Object.keys(errors).length > 0
  const sending = status === 'sending'

  // The messages the user sees: all of them after "Next", otherwise only those of fields already left.
  const shownErrors = {}
  for (const name of Object.keys(errors)) {
    if (showErrors || touched[name]) shownErrors[name] = errors[name]
  }

  // Half a second after the last change, the answers go into localStorage.
  useEffect(() => {
    if (values === INITIAL_VALUES) return // nothing typed yet: nothing to save
    const timer = setTimeout(() => saveDraft(values), 500)
    return () => clearTimeout(timer) // typing again within half a second cancels the earlier save
  }, [values])

  // Changes one field: a new object with every old field, and the new value under its name.
  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // Everything a text field needs from the state: its name, its value, and what to do when it changes.
  function register(name) {
    return {
      name,
      value: values[name],
      onChange: (event) => setField(name, event.target.value),
      // Leaving the field marks it as touched: from then on its message follows the typing.
      onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
      // A field with a message is "invalid": screen readers say so, and the CSS draws it red.
      'aria-invalid': Boolean(shownErrors[name]),
    }
  }

  // Every move between steps goes through here: a new step starts without red messages.
  function goTo(index) {
    if (sending) return // stay on this step while the request is on its way
    setStep(index)
    setShowErrors(false)
    setShowNotice(false)
    setStatus('editing')
  }

  // A step can be opened when every step before it is filled in correctly.
  function canReach(index) {
    return steps.slice(0, index).every((s) => isStepValid(s.key, values))
  }

  // From the summary: back to the step with this key.
  function editStep(key) {
    goTo(steps.findIndex((s) => s.key === key))
  }

  // Sends the answers to the server, and waits for its answer.
  async function sendForm() {
    setStatus('sending')
    try {
      // The repeated password is not needed; the real one stays out on purpose: this server would not encrypt it.
      const { password, confirm, ...data } = values
      const saved = await api.create('accounts', data)
      clearDraft() // the form is done: the draft is not needed any more
      setAccount(saved)
      setStatus('editing')
    } catch {
      setStatus('error')
    }
  }

  // "Next" is a submit button: a click on it, or Enter in any field, lands here.
  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (hasErrors) {
      setShowErrors(true) // show the messages, and stay on this step
      // Put the cursor into the first field that needs fixing.
      const firstName = Object.keys(errors)[0]
      formRef.current.querySelector(`[name="${firstName}"]`)?.focus()
      return
    }
    if (isLast) {
      sendForm()
    } else {
      goTo(step + 1)
    }
  }

  // Throws the draft away, and starts with an empty form.
  function discardDraft() {
    clearDraft()
    setValues(INITIAL_VALUES)
    setTouched({})
    setShowNotice(false)
  }

  // An empty form again, on the first step.
  function startOver() {
    setValues(INITIAL_VALUES)
    setTouched({})
    goTo(0)
    setAccount(null)
  }

  if (account) {
    return (
      <main className="signup">
        <section className="success">
          <span className="success__badge" aria-hidden="true">
            ✓
          </span>
          <h2>Welcome to Code Club, {account.fullName}!</h2>
          <p>Your account is ready. In a real app, a confirmation email would now go to {account.email}.</p>
          <p>
            Account ID: <code>{account.id.slice(0, 8)}</code>
          </p>
          <button type="button" className="button" onClick={startOver}>
            Start over
          </button>
        </section>
      </main>
    )
  }

  let submitLabel = 'Next'
  if (isLast) submitLabel = sending ? 'Creating account…' : 'Create account'

  return (
    <main className="signup">
      <header className="signup__header">
        <h1>Join Code Club</h1>
        <p>A free club for people learning to code. Signing up takes three short steps.</p>
      </header>

      {showNotice && (
        <div className="signup__notice">
          <p>Welcome back! We filled in what you typed last time. Passwords are never saved: type yours again.</p>
          <button type="button" className="link-button" onClick={discardDraft}>
            Discard draft
          </button>
        </div>
      )}

      <StepIndicator steps={steps} current={step} canReach={canReach} onSelect={goTo} />

      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <div className="signup__head">
          <p className="signup__count">
            Step {step + 1} of {steps.length}
          </p>
          <h2>{current.title}</h2>
        </div>

        {current.key === 'account' && <AccountStep register={register} errors={shownErrors} />}
        {current.key === 'profile' && <ProfileStep register={register} errors={shownErrors} />}
        {current.key === 'preferences' && (
          <PreferencesStep values={values} setField={setField} errors={shownErrors} />
        )}
        {current.key === 'mentor' && <MentorStep register={register} errors={shownErrors} />}
        {current.key === 'review' && <ReviewStep values={values} onEdit={editStep} />}

        {showErrors && hasErrors && (
          <p className="signup__alert" role="alert">
            Please fix the fields marked in red.
          </p>
        )}

        {status === 'error' && (
          <p className="signup__alert" role="alert">
            Your account could not be created: the server did not answer. Press "Create account" to try again.
          </p>
        )}

        <div className="signup__nav">
          {step > 0 && (
            <button
              type="button"
              className="button button--ghost"
              disabled={sending}
              onClick={() => goTo(step - 1)}
            >
              Back
            </button>
          )}
          <button type="submit" className="button" disabled={sending}>
            {submitLabel}
          </button>
        </div>
      </form>
    </main>
  )
}

export default App
```

- `api` is made outside `App`, once, when the file loads. Inside `App` a new server would be made at every drawing.
- `sendForm` first sets `'sending'`, then waits for the server with `await`. If the answer arrives, the draft is
  cleared and `account` gets the saved account; if the request fails, the code jumps into `catch`, and the status
  becomes `'error'`. `handleSubmit` does not wait for it: it only starts the sending.
- `sending` is derived from `status`. While it is true, both buttons are `disabled`, so a quick double click cannot
  create two accounts.
- While sending, `goTo` does nothing: the indicator and the Edit buttons cannot take the user away and back to a button
  that is enabled again.
- The error message tells the user what to do: the same "Create account" button tries again. And `goTo` sets the
  status back to `'editing'`, so the red box disappears when the user moves to another step.
- `account.id.slice(0, 8)` shows the first eight characters of the long id the server made.

:::concept Why don't we send the password?
A real server would get the password over an `https://` connection, and would store only a [[hash]] of it (lesson 3):
a fingerprint that the password cannot be worked out from. Our pretend server writes everything into `localStorage`,
in plain text, where anyone using this browser could read it. So we leave the password out on purpose; in a real app
it would be in `data`. The repeated password (`confirm`) is never sent: it only checks for typing mistakes, and its
job is done by the time the form is sent.
:::

:::check Check
Go through the whole form and press "Create account": for about a second the button says "Creating account…", and
both buttons are pale. Then: "Welcome to Code Club, …!", with an account ID. Now and then (about one time in four) a
red box says the account could not be created: press the button again. After a success, reload the page: an empty
form, and no "Welcome back" note, because the draft is gone. Congratulations, your multi-step form is done!
:::

:::mistake Common mistake
`const saved = api.create('accounts', data)`, without `await`. Then `saved` is not the account but the Promise of it:
`setAccount` gets the Promise, the welcome screen appears at once, and `account.id.slice` stops the page with an error,
because a Promise has no `id`. With `await`, the code waits for the server's answer.
:::

:::try Try it
Set `failRate` to `1` in the `createMockApi(…)` call: now every request fails, and you can look at the error state at
leisure. Then try `0`: every request succeeds. Finally, set it back to `0.25`.
:::
