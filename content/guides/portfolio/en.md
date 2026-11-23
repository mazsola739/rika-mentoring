# What we build

A page that introduces you: who you are, what you can do, what you have worked on, and how people can reach you. The
three levels of the lesson build on each other. At the end of the first one you already have a finished, working page;
the other two extend it.

:::levels
- A one-page introduction: your name, a short bio, skills and contact details. | about 2 hours
- Project cards, a page for every project, a working contact form. | about 3 hours
- Subtle animations, a Lighthouse score of 90+, and the page live at its own address. | about 3 hours
:::

**Before you start you need:** nothing, this is the first lesson. A little HTML helps, but it is not required: we
explain everything you need.

## Beginner level {level=1}

### Before you start

You need two programs, both free:

- **Node.js** (the LTS version, [nodejs.org](https://nodejs.org)): it runs the development server on your computer.
- A **code editor**, for example [VS Code](https://code.visualstudio.com).

Download the lesson's **starter** (above: "Download starter"), unzip it, and open the `me-myself-and-react` folder in
your editor. Then open a terminal (in VS Code: ++Terminal++ → ++New Terminal++) and type these two commands:

```shell
npm install     # needed once: downloads the project's packages (React, Vite)
npm run dev     # starts the development server
```

:::check Check
The terminal prints an address, usually `http://localhost:5173`. Open it in your browser: you see "Hello, React!".
++Ctrl++ + ++C++ in the terminal stops the server.
:::

:::concept The starter is a git repository
The folder you downloaded already has a first commit, the starting point. `git log` shows it, and if something goes
badly wrong, `git restore .` takes every file back. When a step works, commit it: `git add .`, then
`git commit -m "Hero done"`.
:::

### What is a React component?

A React page is built from small, reusable pieces: [[components|component]]. A component is a JavaScript
[[function]] that returns what should appear on the screen. Open `src/App.jsx`:

```jsx file=src/App.jsx mark=2
function App() {
  return <h1>Hello, React!</h1>
}

export default App
```

The HTML-looking part after `return` is [[JSX]]. It is really JavaScript: React builds the page from it.
`export default` means that other files can load this function. `src/main.jsx` does exactly that: it loads `App` and
draws it into the empty `<div id="root">` box of `index.html`.

:::try Try it
Change the text to a greeting of your own and save the file. The browser updates by itself: this is Vite's
[[hot reload]].
:::

:::mistake Common mistake
A component's name always starts with a **capital letter** (`App`, not `app`). With a small letter React would take it
for an HTML tag.
:::

### A detour: how it used to be written

In older code you may meet [[class]] components. They do the same thing, only longer. It is worth recognising them, but
in this course we write **function components everywhere**.

:::compare
```jsx label="Before: a class" file=Hello.jsx
import { Component } from 'react'

class Hello extends Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>
  }
}
```
```jsx label="Today: a function" now file=Hello.jsx
function Hello({ name }) {
  return <h1>Hello, {name}!</h1>
}
```
:::

From lesson 27 on we use an even shorter form, the [[arrow function]]:
`const Hello = ({ name }) => <h1>Hello, {name}!</h1>`. Until then we stay with the easy-to-read version above.

### Your first own component: the Hero

The Hero is the top of the page: your name and one sentence about what you do. Create a `components` folder inside
`src`, with a `Hero.jsx` file in it:

```jsx file=src/components/Hero.jsx mark=1,4,5
function Hero({ name, role }) {
  return (
    <section className="hero">
      <p className="hero__role">{role}</p>
      <h1>{name}</h1>
    </section>
  )
}

export default Hero
```

`name` and `role` are the component's [[props]]: this is how it receives data from outside, the way an HTML tag gets
its attributes. Curly braces (`{name}`) write a JavaScript value into the JSX. When the JSX spans several lines, we put
it in round brackets. Now use it in `App`:

```jsx file=src/App.jsx mark=1,4
import Hero from './components/Hero.jsx'

function App() {
  return <Hero name="Pat Example" role="Junior front-end developer" />
}

export default App
```

:::check Check
Your name appears on the page, with your role above it in smaller letters. Change it to your own name!
:::

:::mistake Common mistake
In JSX we write `className`, not `class`, because `class` is a reserved word in JavaScript (because of the classes in
the previous step).
:::

### A list of your skills

You keep your skills in an [[array]], and `map` turns each of them into a list item. When you learn something new, you
only add it to the array.

```jsx file=src/components/Skills.jsx mark=6-8
const SKILLS = ['HTML', 'CSS', 'JavaScript', 'React']

function Skills() {
  return (
    <ul className="skills">
      {SKILLS.map((skill) => (
        <li key={skill}>{skill}</li>
      ))}
    </ul>
  )
}

export default Skills
```

The `key` helps React tell the list items apart when the list changes. It must be unique: here it is the skill itself.

A component can return only **one** thing. To show Skills under the Hero, wrap them in one element:

```jsx file=src/App.jsx mark=2,6-9
import Hero from './components/Hero.jsx'
import Skills from './components/Skills.jsx'

function App() {
  return (
    <main>
      <Hero name="Pat Example" role="Junior front-end developer" />
      <Skills />
    </main>
  )
}

export default App
```

:::try Task
Add two skills of your own to the list, and put an `<h2>What I can do</h2>` heading above it.
:::

:::mistake Common mistake
Without the `key` the page still works, but the browser console warns you. Open it (++F12++ → Console) and see what
such a message looks like. Make a habit of checking the console.
:::

### Styles and a responsive layout

Every component can have its own CSS file that it loads. [[Flexbox]] puts elements next to each other, and a
[[media query]] stacks them on phones.

```css file=src/components/Hero.css
.hero {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 48px 0;
}

.hero__role {
  margin: 0;
  color: #017b6b;
  font-weight: 700;
  text-transform: uppercase;
}

/* On phones (below 600 px) they go under each other. */
@media (max-width: 600px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }
}
```

```jsx file=src/components/Hero.jsx mark=1
import './Hero.css'

function Hero({ name, role }) {
```

This turns your skills into "tags" in a row that wrap to a new line when needed:

```css file=src/components/Skills.css
.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.skills li {
  padding: 6px 12px;
  border-radius: 999px;
  background: #e8f8f4;
}
```

A CSS file only works when the component loads it: put `import './Skills.css'` at the very top of `Skills.jsx`, as
you did for the Hero.

:::check Check
Open the developer tools (++F12++) and switch on the device view (++Ctrl++ + ++Shift++ + ++M++). On a narrow screen the
Hero's content is centred and stacked.
:::

### Contact details

The bottom of the page tells people how to reach you: an e-mail address and your profiles. A `mailto:` address opens the
e-mail program.

```jsx file=src/components/Contact.jsx
const LINKS = [
  { label: 'My GitHub profile', href: 'https://github.com/' },
  { label: 'My LinkedIn profile', href: 'https://www.linkedin.com/' },
]

function Contact({ email }) {
  return (
    <footer className="contact">
      <h2>Contact</h2>
      <p>
        Write to me: <a href={`mailto:${email}`}>{email}</a>
      </p>
      <ul>
        {LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}

export default Contact
```

`target="_blank"` opens the link in a new tab, and `rel="noreferrer"` does not tell the opened site where the visitor
came from. The `mailto:` and the address are joined with a [[template literal]]: in text between backticks, `${email}`
is replaced by the variable's value.

:::mistake Common mistake
Make link text meaningful: "My GitHub profile", not "click here". A screen reader often lists the links on their own,
and then only the text is heard.
:::

:::check Check
Add `<Contact email="pat@example.com" />` to `App` under Skills. The e-mail address is clickable, the profiles open in
a new tab. The beginner level is done: commit it!
:::

## Intermediate level {level=2}

### Project cards

Your projects appear on cards. You write one card component that works for any project through [[props]], and the data
lives in an array, like your skills.

```jsx file=src/components/ProjectCard.jsx
function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <ul className="project-card__tags">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <a href={`#/projects/${project.slug}`}>Details</a>
    </article>
  )
}

export default ProjectCard
```

```jsx file=src/data.js
export const PROJECTS = [
  {
    slug: 'weather',
    title: 'Weather app',
    summary: 'A five-day forecast with a search.',
    tags: ['React', 'API'],
    details: 'My first project with an API: I learned how to fetch data and what to show while it loads.',
  },
  {
    slug: 'todo',
    title: 'To-do list',
    summary: 'Tasks that stay in the browser.',
    tags: ['React', 'localStorage'],
    details: 'Here I learned to manage state and to save it in the browser’s storage.',
  },
]
```

The cards line up in a [[CSS Grid]]: as many columns as fit, each at least 240 px wide.

```css file=src/components/Projects.css
.projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
```

:::try Task
Write a `Projects` component that draws a `ProjectCard` for every item of `PROJECTS` into a `.projects` list, and add it
to `App`. You need `import { PROJECTS } from '../data.js'`, `import ProjectCard from './ProjectCard.jsx'` and
`import './Projects.css'`.
:::

### Separate pages (routing)

Every project gets its own page. For that the page has to **remember** which address you are on, and draw itself again
when the address changes. Here you meet React's two basic [[hooks|hook]].

- [[useState]] is the component's memory: a value, and a function to change it. When it changes, React draws the
  component again.
- [[useEffect]] is for work that happens outside drawing, for example listening to a browser event.

We watch the part of the address after `#` (the "hash"), because changing it does not load a new page. We write our
own hook for it:

```jsx file=src/useHashRoute.js
import { useEffect, useState } from 'react'

const currentPath = () => window.location.hash.slice(1) || '/'

// Returns the part of the address after #, and updates when it changes.
function useHashRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    // Clean up: when the component goes away, stop listening.
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export default useHashRoute
```

Depending on the address, `App` draws the home page or a project's page:

```jsx file=src/App.jsx mark=7-9,12
import useHashRoute from './useHashRoute.js'
import { PROJECTS } from './data.js'
// … the other imports

function App() {
  const path = useHashRoute()
  const slug = path.startsWith('/projects/') ? path.slice('/projects/'.length) : null
  const project = PROJECTS.find((p) => p.slug === slug)
  if (project) return <ProjectPage project={project} />

  return (
    <main>{/* Hero, Skills, Projects, Contact */}</main>
  )
}
```

:::try Task
Write the `ProjectPage` component: the project's title, its `details` text, and a "← Back" link to `#/`.
:::

:::mistake Common mistake
A hook's name always starts with `use`, and you can only call it in a component or in another hook, at the top level
(not inside an `if` or a loop). That is how React knows which state belongs to which call.
:::

### A contact form

The form's fields are [[controlled inputs|controlled input]]: a `useState` holds their value, and every keystroke
updates it. React always knows what is in the fields, so you can check them before sending.

```jsx file=src/components/ContactForm.jsx
import { useState } from 'react'

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  // One function for all three fields: the field's name says what it updates.
  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function submit(event) {
    event.preventDefault() // do not reload the page
    if (!form.name || !form.email.includes('@') || !form.message) {
      setError('Fill in all three fields and give a real e-mail address.')
      return
    }
    setError('')
    setSent(true)
  }

  if (sent) return <p>Thank you, {form.name}! I will answer soon.</p>

  return (
    <form onSubmit={submit} noValidate>
      <label>
        Name
        <input name="name" value={form.name} onChange={update} />
      </label>
      <label>
        E-mail
        <input name="email" type="email" value={form.email} onChange={update} />
      </label>
      <label>
        Message
        <textarea name="message" value={form.message} onChange={update} />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Send</button>
    </form>
  )
}

export default ContactForm
```

`{ ...form, … }` is the [[spread]] operator: it copies the old object and replaces the one field that changed. We never
change state directly; we always give `setForm` a new value.

:::concept Where does the message go?
Nowhere yet: the "Thank you" shows how the page reacts. Sending it for real needs a server; in later lessons with APIs we
look at how a React page talks to a server.
:::

:::check Check
With empty fields, Send shows an error; filled in, the thank-you appears. The intermediate level is done: commit it!
:::

## Advanced level {level=3}

### Subtle animations

A little movement makes the page feel alive, as long as it does not get in the way. The cards, for example, can lift a
little when the mouse is over them:

```css file=src/components/Projects.css
.project-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgb(0 0 0 / 0.12);
}

/* If someone switched motion off on their computer, nothing moves here either. */
@media (prefers-reduced-motion: reduce) {
  .project-card {
    transition: none;
  }
}
```

:::concept Why prefers-reduced-motion matters
Moving interfaces make some people dizzy or distract them. They can switch motion off in their operating system, and
the browser tells the page through this [[media query]].
:::

### Lighthouse 90+

Chrome's built-in [[Lighthouse]] scores the page: performance, accessibility, best practices, search engines. Run it on
your finished build:

```shell
npm run build      # makes the final version in the dist folder
npm run preview    # serves the dist folder for a preview
```

Open the address it prints, then ++F12++ → Lighthouse → "Analyze page load". The most common fixes:

- every image has an `alt` text and is not bigger than it is shown;
- `index.html` gets `<html lang="en">` and a `<meta name="description">` line;
- headings follow each other in order (`h1`, then `h2`, …);
- there is enough contrast between text and background.

:::check Check
All four categories score at least 90.
:::

### Publishing on GitHub Pages

Finally the page goes on the internet, for free, on GitHub Pages. First tell Vite that the page will run in a
sub-folder:

```js file=vite.config.js mark=5
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
})
```

Create a repository on GitHub and upload the project (`git remote add origin …`, then `git push -u origin main`). In the
repository's settings: Settings → Pages → Source: **GitHub Actions**. Then add this file:

```yaml file=.github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

:::check Check
After you commit and push, "Deploy" runs on the repository's Actions tab, and a few minutes later your page is live at
`https://<your-username>.github.io/<repository-name>/`. Congratulations, your first own page is done!
:::
