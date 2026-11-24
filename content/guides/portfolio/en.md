# What we build

A page that introduces you: who you are, what you can do, what you have worked on, and how people can reach you. The
three levels of the lesson build on each other. At the end of the first one you already have a finished, working page;
the other two extend it.

:::levels
- A one-page introduction: your name, a short bio, skills and contact details. | about 2 hours
- Project cards, a page for every project, a contact form that checks what visitors type. | about 3 hours
- Subtle animations, a Lighthouse score of 90+, and the page live on GitHub Pages. | about 3 hours
:::

**Before you start you need:** nothing, this is the first lesson. A little HTML helps, but it is not required: we
explain everything you need.

## Beginner level {level=1}

### Before you start

You need three programs, all free:

- **Node.js** (the LTS version, [nodejs.org](https://nodejs.org)): it runs the [[development server]] on your
  computer, a small program that serves your page to the browser and refreshes it after every save.
- A **code editor**, for example [VS Code](https://code.visualstudio.com).
- **Git** ([git-scm.com](https://git-scm.com)): it saves the states of your work, and at the advanced level you use it
  to put your page online. On Windows you install it separately; on a Mac the first `git` command offers to install it.

You give commands in a [[terminal]]: a window where you talk to the computer in text instead of clicks. [[npm]] comes
with Node.js: it downloads the [[packages|package]] (ready-made code, such as React) that the project uses. The
development server is run by [[Vite]], the tool the exercise is built on.

**Get the course from GitHub.** [[GitHub]] is a website where programmers keep their projects and share them. A project
there is a [[repository]] (repo for short): a folder whose history [[git]] keeps, so every saved state of its files can
be looked up again. The whole course is one repository, `rika-mentoring`. Every lesson is a folder in it (this one is
`lessons/01-portfolio`), with two projects inside: `exercise`, the starting project you build on, and `solution`, the
finished app that you can try on the Solution tab. The **Exercise on GitHub** button at the top of this page shows this
lesson's `exercise` folder on GitHub.

Make a folder of your own for the course, for example `react-course` in your Documents folder. Open it in your editor
(in VS Code: **File** → **Open Folder**), then open a terminal (in VS Code: the **Terminal** menu → **New Terminal**):
it starts in the folder you opened. Type this command and press ++Enter++:

```shell
git clone https://github.com/mazsola739/rika-mentoring.git
```

To [[clone]] a repository is to copy it to your computer with its whole history: a `rika-mentoring` folder appears in
`react-course`. It stays connected to GitHub, so later one command brings the new lessons: `git pull`, run in that
folder (`cd rika-mentoring` steps into it, then `git pull`, and `cd ..` steps back out). If you already have the repository from an earlier lesson,
you do not clone it again: a `git pull` in it is enough. If the terminal does not recognise `git`, close VS Code and
open it again (more in the Common mistake box below).

If you would rather click: on the [repository's page](https://github.com/mazsola739/rika-mentoring) choose **Code** →
**Download ZIP**, and unpack the downloaded file into your work folder. The unpacked folder is called
`rika-mentoring-main` (Windows may put it inside a second folder of the same name). In it you find the same `lessons`
folder: copy the exercise out of it with the file manager as described below, opening `rika-mentoring-main` where the
text says `rika-mentoring`. A ZIP is a one-off copy, though: it does not update, so for new lessons you download it
again. You need git for this lesson anyway, so cloning is the easier way.

**Copy the exercise.** You never work inside the repository itself. Copy the lesson's `exercise` folder out of it into
your work folder, and name the copy `me-myself-and-react`: the repository stays as it was (so `git pull` keeps
working), and your work is a project of your own. In the file manager: open `rika-mentoring` → `lessons` →
`01-portfolio`, select the `exercise` folder and copy it (++Ctrl++ + ++C++, on a Mac ++Cmd++ + ++C++), go back to
`react-course` and paste it (++Ctrl++ + ++V++, on a Mac ++Cmd++ + ++V++), then rename the copy (on Windows ++F2++, on a
Mac ++Enter++). Or type this in the terminal, which is still in `react-course`:

```shell
cp -r rika-mentoring/lessons/01-portfolio/exercise me-myself-and-react
```

`cp -r` copies a folder with everything in it into a new folder, the one you name at the end. VS Code's terminal on
Windows (PowerShell) understands it too. Your work folder now holds two folders: `rika-mentoring`, the repository from
GitHub, which you leave as it is, and `me-myself-and-react`, your copy of the exercise, where you work.

```text
react-course/
  rika-mentoring/
  me-myself-and-react/
```

**Start it.** Open your copy in the editor (**File** → **Open Folder** → `me-myself-and-react`): not the work folder,
and not the `exercise` folder inside the repository, because the commands have to run where `package.json` is, and your
work belongs in your copy. Then open a terminal again (**Terminal** → **New Terminal**) and type these two commands one
at a time, pressing ++Enter++ after each:

```shell
npm install
npm run dev
```

`npm install` downloads the project's packages (React and Vite); you need it only once. `npm run dev` starts the
development server.

:::check Check
The terminal prints an address, usually `http://localhost:5173`. Open it in your browser: you see "Hello, React!".
Leave the server running in this terminal while you work. ++Ctrl++ + ++C++ stops it.
:::

:::mistake Common mistake
If `npm install` says it cannot find `package.json`, the terminal is in the wrong folder, for example in `react-course`.
Open the `me-myself-and-react` folder itself in the editor (the one with `package.json` in it), then open a new
terminal. If the terminal does not recognise `git` or `npm` at all, close VS Code and open it again: a terminal only
finds the programs that were installed before it started.
:::

**Save the starting point.** Your copy is a plain folder for now: the repository it came from stayed behind in
`rika-mentoring`. Make it a repository of its own, so that git can save your progress. Leave the server running, and
open a second terminal for git (the **+** button in the terminal panel); it opens in `me-myself-and-react` too. First,
once on your computer, tell git your own name and e-mail: it writes them into every save (a commit, explained below).
The example shows Pat Example's details. If you later put the project on GitHub, this address is public in your commits.

```shell
git config --global user.name "Pat Example"
git config --global user.email "pat@example.com"
```

Then, in your copy:

```shell
git init -b main
git add .
git commit -m "Starting point"
```

`git init -b main` makes the folder a git repository: from now on git keeps its history, in a hidden `.git` folder.
`-b main` calls its [[branch]] (the line of saved states) `main`: GitHub expects this name at the advanced level.
`git add .` picks every file of the folder for saving (the dot means "this folder"), and `git commit -m "Starting point"`
saves them as a [[commit]]: a snapshot of all the files, with a short message that says what it is. Git leaves out
`node_modules`, the downloaded packages: the `.gitignore` file lists what it ignores, and `npm install` can download
them again at any time.

:::check Check
On Windows, `git add .` may print a warning for each file ("LF will be replaced by CRLF"), now and at later commits
too. It is harmless: git only tells you that it will write the line endings (the invisible mark at the end of every
line) the Windows way. Go on with `git commit`. Then `git log` lists the commits: now there is one, "Starting point",
with your name and the date. When the list does not fit in the window, git shows it page by page, and ++Q++ takes you
back.
:::

:::mistake Common mistake
If `git commit` answers "Author identity unknown" ("Please tell me who you are"), git does not know your name yet: run
the two `git config` lines, then the `git commit` again. If `git init` does not know `-b`, your Git is older than
version 2.28: install the latest one from git-scm.com.
:::

:::concept Your copy becomes a git repository
`me-myself-and-react` is now a repository of its own, with no connection to `rika-mentoring`: what you commit here stays
in your project, and at the advanced level this is the repository you put on GitHub. As you work:

- When a step works, commit it: `git add .`, then `git commit -m "Hero done"`. At the end of every level the guide
  reminds you.
- `git log` lists your commits.
- If something goes badly wrong, `git restore .` takes the files back to your last commit. New files you created stay.
:::

### What is a React component?

A React page is built from small, reusable pieces: [[components|component]]. A component is a JavaScript
[[function]] that returns what should appear on the screen. A function is a named piece of code that you can run;
`return` gives back its result, here what the page shows. Open `src/App.jsx`:

```jsx file=src/App.jsx mark=2
function App() {
  return <h1>Hello, React!</h1>
}

export default App
```

The HTML-looking part after `return` is [[JSX]]. It is really JavaScript: React builds the page from it.
`export default` means that other files can load this function. `src/main.jsx` does exactly that: it loads `App` and
draws it into the empty `<div id="root">` box of `index.html`.

The files of the exercise (`main.jsx`, `index.css`, `vite.config.js`) contain comments. A comment is a note for people
in the code (after `//`, or between `/*` and `*/`), and the computer ignores it. Write your own comments wherever they
help you.

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

Both versions get a `name` from outside (a prop; more on props in the next step) and write it into the greeting with
`{name}`.

From lesson 27 on we write components in an even shorter form, the [[arrow function]]:
`const Hello = ({ name }) => <h1>Hello, {name}!</h1>`. Until then our components stay in the easy-to-read form above.
Small helper functions, such as the one we hand to `map` soon, are written as arrow functions already:
`(skill) => <li>{skill}</li>` means "take a skill and give back a list item".

### Your first component: the Hero

The Hero is the top of the page: your name, your role (what you do) and a one-sentence bio. Create a `components`
folder inside `src`, with a `Hero.jsx` file in it:

```jsx file=src/components/Hero.jsx mark=1,4-6
function Hero({ name, role, bio }) {
  return (
    <section className="hero">
      <p className="hero__role">{role}</p>
      <h1>{name}</h1>
      <p>{bio}</p>
    </section>
  )
}

export default Hero
```

`name`, `role` and `bio` are the component's [[props]]: this is how it receives data from outside, the way an HTML tag
gets its attributes. The curly braces in `function Hero({ name, role, bio })` take these three props out of the bundle
React hands to the component. In JSX, curly braces (`{name}`) write a JavaScript value into the page. When the JSX spans
several lines, we put it in round brackets. Now use it in `App`:

```jsx file=src/App.jsx mark=1,4-10
import Hero from './components/Hero.jsx'

function App() {
  return (
    <Hero
      name="Pat Example"
      role="Junior front-end developer"
      bio="I build friendly web pages with React."
    />
  )
}

export default App
```

`import Hero from './components/Hero.jsx'` loads the component from its file (the other half of `export default`);
`./` means "start in the folder of this file". In JSX every tag must be closed: a tag with nothing inside ends with
`/>`, like `<Hero … />`.

:::check Check
"Pat Example" appears on the page, with the role above it in smaller letters and the bio under it. Now change all three
to your own!
:::

:::mistake Common mistake
In JSX we write `className`, not `class`, because `class` is a reserved word in JavaScript: it starts a class, like the
ones in the previous step.
:::

### A list of your skills

You keep your skills in an [[array]]: a list of values between square brackets, separated by commas. `const` gives it a
name; the capital letters (`SKILLS`) are a habit for fixed data that does not change. `map` turns each skill into a list
item, so when you learn something new, you only add it to the array. Create a `Skills.jsx` file in the `components`
folder:

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

`map` calls the function you hand it once for every item of the array, and makes a new array from what it gives back.
`(skill) => ( … )` is such a short [[arrow function]]: it gets the current skill as `skill` and gives back the `<li>`
in the brackets. The `key` helps React tell the list items apart when the list changes. It must be unique: here it is
the skill itself.

A component can return only **one** thing. To show Skills under the Hero, wrap them in one element:

```jsx file=src/App.jsx mark=2,6,12-13
import Hero from './components/Hero.jsx'
import Skills from './components/Skills.jsx'

function App() {
  return (
    <main>
      <Hero
        name="Pat Example"
        role="Junior front-end developer"
        bio="I build friendly web pages with React."
      />
      <Skills />
    </main>
  )
}

export default App
```

:::try Task
Add two skills of your own to the array. Then give the list a heading in `Skills`: put `<h2>What I can do</h2>` above
the `<ul>`, and wrap the two in a `<section>`, because a component returns only one element.
:::

:::mistake Common mistake
Without the `key` the page still works, but React warns you in the browser console. Try it: delete `key={skill}`,
save, and open the console (++F12++, on a Mac ++Cmd++ + ++Option++ + ++I++ → **Console**). You will see a warning that
each child in a list should have a unique "key" prop. Then put the `key` back. Make a habit of checking the console.
:::

### Styles and a responsive layout

Every component can have its own CSS file that it loads. The rules still apply to the whole page, so give classes names
that say where they belong: `hero__role` is the `role` part of the `hero` (the double underscore is just a common naming
habit). [[Flexbox]] puts elements next to each other, and a [[media query]] stacks them on phones.

The Hero also gets a round monogram with the first letter of your name, so Flexbox has something to put side by side:
the circle on the left, the text on the right. Create `Hero.css` in the `components` folder, next to `Hero.jsx`:

```css file=src/components/Hero.css
.hero {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 48px 0;
}

.hero__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* the circle must not get squeezed */
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #017b6b;
  color: #fff;
  font-size: 56px;
  font-weight: 700;
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

Then change `Hero.jsx`. Its first line loads the CSS file (a CSS file only works when the component loads it), and the
`<section>` now has two parts: the circle and a `<div>` with the text.

```jsx file=src/components/Hero.jsx mark=1,6-7,11
import './Hero.css'

function Hero({ name, role, bio }) {
  return (
    <section className="hero">
      <div className="hero__avatar" aria-hidden="true">{name[0]}</div>
      <div>
        <p className="hero__role">{role}</p>
        <h1>{name}</h1>
        <p>{bio}</p>
      </div>
    </section>
  )
}

export default Hero
```

`name[0]` is the first letter of the name: the letters of a text are numbered from zero, and the number in square
brackets picks one. `aria-hidden="true"` hides the circle from screen readers, which read your name anyway.
`border-radius: 50%` makes the square a circle, and inside it the same Flexbox centres the letter (`align-items`
vertically, `justify-content` horizontally).

Create `Skills.css` next to `Skills.jsx` as well. It turns your skills into "tags" in a row that wrap to a new line when
needed:

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

The component loads this one too: make `import './Skills.css'` the first line of `Skills.jsx`, as in the Hero.

:::check Check
In a wide window the monogram circle sits on the left, next to the text, and the role is still above your name. The
skills are rounded tags in a row. Now open the developer tools (++F12++, on a Mac ++Cmd++ + ++Option++ + ++I++), switch
on the device toolbar (++Ctrl++ + ++Shift++ + ++M++, on a Mac ++Cmd++ + ++Shift++ + ++M++), and pick a phone at the top
(for example iPhone 12 Pro): the circle moves above the text, and the Hero's content is centred.
:::

### Contact details

The bottom of the page shows how people can reach you: an e-mail address and your profiles. A `mailto:` link opens the
visitor's e-mail program. Create a `Contact.jsx` file in the `components` folder:

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

Each link is an [[object]]: named values between curly braces (`label` and `href`); `link.label` reads one of them.
Replace the two addresses with your own profiles.

`target="_blank"` opens the link in a new tab, and `rel="noreferrer"` does not tell the opened site where the visitor
came from. The `mailto:` and the address are joined with a [[template literal]]: in text between backticks, `${email}`
is replaced by the variable's value.

:::mistake Common mistake
Make link text meaningful: "My GitHub profile", not "click here". Screen readers often list the links on their own, and
then they read out only the link text.
:::

Now put it at the bottom of `App`, under Skills. Like every component from another file, it needs an `import` first:

```jsx file=src/App.jsx mark=3,14
import Hero from './components/Hero.jsx'
import Skills from './components/Skills.jsx'
import Contact from './components/Contact.jsx'

function App() {
  return (
    <main>
      <Hero
        name="Pat Example"
        role="Junior front-end developer"
        bio="I build friendly web pages with React."
      />
      <Skills />
      <Contact email="pat@example.com" />
    </main>
  )
}

export default App
```

:::check Check
The e-mail address is clickable, and the profiles open in a new tab. The beginner level is done: commit it in the
second terminal (`git add .`, then `git commit -m "Beginner level done"`)!
:::

## Intermediate level {level=2}

### Project cards

Your projects appear on cards. You write one card component that works for any project through [[props]], and the data
lives in an array, like your skills. Create `ProjectCard.jsx` in the `components` folder:

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
      <a href={`#/projects/${project.slug}`}>{project.title}: details</a>
    </article>
  )
}

export default ProjectCard
```

The link text includes the project's title, so the links can be told apart in a screen reader's list as well.

The data goes into a file of its own, straight in the `src` folder (not in `components`): `src/data.js`.

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

Every project is an [[object]]. A [[slug]] is a short, address-friendly name for a project (lower case, no spaces); it
will appear in the address of the project's page (`#/projects/weather`). Here we have `export const` instead of
`export default`: this is a [[named export]], and a file can have several. You import them by name, in curly braces:
`import { PROJECTS } from '../data.js'`. `../` steps up one folder, from `components` to `src`.

The cards line up in a [[CSS Grid]]: as many columns as fit, each at least 240 px wide. `padding: 0` and
`list-style: none` remove the list's dots and indent, as in `Skills.css`, and each card gets a white background, a thin
border and rounded corners. `height: 100%` makes every card in a row the same height. Create `Projects.css`:

```css file=src/components/Projects.css
.projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 0;
  list-style: none;
}

.project-card {
  box-sizing: border-box; /* the padding and the border fit inside the 100% */
  height: 100%;
  padding: 16px;
  border: 1px solid #dde3ea;
  border-radius: 12px;
  background: #fff;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0;
  list-style: none;
  font-size: 14px;
}

.project-card__tags li {
  padding: 2px 10px;
  border-radius: 999px;
  background: #e8f8f4;
}
```

:::try Task
Write the `Projects` component in `src/components/Projects.jsx`. It returns a `<section>` with an
`<h2>My projects</h2>` heading and a `<ul className="projects">` list that holds an `<li key={project.slug}>` with a
`<ProjectCard project={project} />` for every item of `PROJECTS`. You need `import { PROJECTS } from '../data.js'`,
`import ProjectCard from './ProjectCard.jsx'` and `import './Projects.css'`. Add it to `App`
(`import Projects from './components/Projects.jsx'`) between Skills and Contact.
:::

:::check Check
Two cards appear next to each other (on a phone, one under the other), with a border and no dots. For now the
"details" link only changes the end of the address in the browser's address bar (`#/projects/weather`): in the next
step it becomes a page of its own.
:::

### Separate pages (routing)

Every project gets its own page. For that the page has to **remember** which address you are on, and draw itself again
when the address changes. Here you meet [[hooks|hook]] for the first time: functions from React whose names start with
`use` and that give a component an extra ability, such as memory. The two most important ones:

- [[useState]] is the component's memory: a value, and a function to change it. When it changes, React draws the
  component again.
- [[useEffect]] is for work that happens outside drawing, for example listening to a browser event.

We watch the part of the address after `#` (the "hash"), because changing it does not load a new page. We write our
own hook for it, in a new `src/useHashRoute.js` file (straight in the `src` folder, not in `components`):

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

`useState` gives back two things, which `const [path, setPath]` names: the current value and the function that changes
it. We pass `currentPath` without brackets: React calls it itself, once, for the first value. `slice(1)` cuts off the
`#`, and `|| '/'` means "or `/` if nothing is left". The `hashchange` event happens when the part of the address after
`#` changes. The empty `[]` at the end of `useEffect` means: run this only once, when the component first appears. The
function it gives back is the clean-up: React calls it when the component goes away.

:::try Task
Create `src/components/ProjectPage.jsx` and write the `ProjectPage` component in it. It gets the `project` prop and
shows the project's title in an `<h1>`, its `details` text, and a "← Back" link to `#/`.
:::

Depending on the address, `App` draws the home page or a project's page:

```jsx file=src/App.jsx mark=5-7,10-13
import Hero from './components/Hero.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Contact from './components/Contact.jsx'
import ProjectPage from './components/ProjectPage.jsx'
import useHashRoute from './useHashRoute.js'
import { PROJECTS } from './data.js'

function App() {
  const path = useHashRoute()
  const slug = path.startsWith('/projects/') ? path.slice('/projects/'.length) : null
  const project = PROJECTS.find((p) => p.slug === slug)
  if (project) return <ProjectPage project={project} />

  return (
    <main>
      <Hero
        name="Pat Example"
        role="Junior front-end developer"
        bio="I build friendly web pages with React."
      />
      <Skills />
      <Projects />
      <Contact email="pat@example.com" />
    </main>
  )
}

export default App
```

Only the marked lines are new; the rest is already in your file (`Projects` from the previous task).
`condition ? a : b` is a short if/else: if the address starts with `/projects/`, `slug` is the rest of it, otherwise
`null` (nothing). `find` hands the projects one by one to the arrow function `(p) => p.slug === slug` and gives back the
first one whose `slug` is the same (`===`); if none matches, it gives back nothing. If there is such a project, `App`
returns its page straight away, and the home page is not drawn.

:::check Check
Click "details" on the Weather app card: the address ends in `#/projects/weather` and the project's page appears. Your
"← Back" link and the browser's Back button both take you home.
:::

:::mistake Common mistake
A hook's name always starts with `use`, and you can only call it in a component or in another hook, at the top level
(not inside an `if` or a loop). That way the hooks run in the same order on every draw, and React knows from this order
which state belongs to which `useState` call.
:::

### A contact form

The form's fields are [[controlled inputs|controlled input]]: a `useState` holds their value, and every keystroke
updates it. React always knows what is in the fields, so you can check them before sending. Create `ContactForm.jsx`
in the `components` folder:

```jsx file=src/components/ContactForm.jsx
import { useState } from 'react'
import './ContactForm.css'

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  // One function for all three fields: the field's name says what it updates.
  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function submit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (!form.name || !form.email.includes('@') || !form.message) {
      setError('Fill in all three fields and give a valid e-mail address.')
      return
    }
    setError('')
    setSent(true)
  }

  if (sent) return <p>Thank you, {form.name}! I will answer soon.</p>

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
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
      {error && <p className="contact-form__error" role="alert">{error}</p>}
      <button type="submit">Send</button>
    </form>
  )
}

export default ContactForm
```

`onChange={update}` tells React to call `update` on every keystroke, and `onSubmit={submit}` to call `submit` when the
form is sent. Both get an [[event]]: `event.target` is the field, `event.target.value` its text. `[event.target.name]`
in square brackets uses the field's `name` (`name`, `email` or `message`) as the key to update. In the check, `!` means
"not" and `||` means "or". `{error && <p …>}` draws the paragraph only when there is an error message. `role="alert"`
makes screen readers read the error out, and `noValidate` switches off the browser's own pop-up checks, so that ours
show.

`...form` is the [[spread]] operator: it copies all fields of the old object into a new one, and the part after the
comma replaces the one that changed. We never change state directly; we always give `setForm` a new value.

`ContactForm.jsx` needs a `ContactForm.css` next to it:

```css file=src/components/ContactForm.css
.contact-form {
  display: grid;
  gap: 12px;
  max-width: 420px;
}

.contact-form label {
  display: grid;
  gap: 4px;
}

.contact-form button {
  justify-self: start;
}

.contact-form__error {
  margin: 0;
  color: #b3261e;
}
```

This stacks the labels and fields under each other, and the button keeps its own width.

Put the form into the contact section: at the top of `Contact.jsx` add
`import ContactForm from './ContactForm.jsx'`, and put `<ContactForm />` right after the paragraph with your e-mail
address.

:::concept Where does the message go?
Nowhere yet: the "Thank you" shows how the page reacts. Sending it for real needs a server; in later lessons with APIs we
look at how a React page talks to a server. The Solution tab already goes one step further: it "sends" the message to a
pretend server inside the browser, so you can see a "Sending…" state and, now and then, an error on purpose. Your
version does not need that yet.
:::

:::check Check
If you press **Send** with empty fields, an error message appears; when everything is filled in, the thank-you appears.
The intermediate level is done: commit it!
:::

## Advanced level {level=3}

### Subtle animations

A little movement makes the page feel alive, as long as it does not get in the way. The cards, for example, can lift a
little when the mouse is over them. Add these rules to the end of `Projects.css` (keep the rules that are already
there):

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

  .project-card:hover {
    transform: none;
  }
}
```

:::check Check
Move the mouse over a project card: it rises a little and gets a soft shadow. In the developer tools (**⋮** →
**More tools** → **Rendering**) set "Emulate CSS media feature prefers-reduced-motion" to `reduce`: now the card stays
in place, only the shadow appears.
:::

:::concept Why prefers-reduced-motion matters
Moving interfaces make some people dizzy or distract them. They can switch motion off in their operating system, and
the browser tells the page through this [[media query]].
:::

### Lighthouse 90+

Chrome's built-in [[Lighthouse]] scores the page in four categories: Performance, Accessibility, Best Practices and SEO
([[SEO]]: how well search engines can read the page). Run it on the final version, not on the development server: stop
the running `npm run dev` (++Ctrl++ + ++C++), then:

```shell
npm run build
npm run preview
```

`npm run build` makes the final version of the page in the `dist` folder, and `npm run preview` serves that folder so
you can look at it. Open the address it prints, then ++F12++ → **Lighthouse** → **Analyze page load**. The most common
fixes:

- every image you add has an `alt` text and is not much bigger than the size it is shown at;
- `index.html` says the page's language (`<html lang="en">`, the exercise already has it) and gets a short description
  in `<head>`, under the `<title>`:
  `<meta name="description" content="Pat Example, junior front-end developer: skills, projects and contact." />`.
  While you are there, change the `<title>` to your name;
- headings follow each other in order (`h1`, then `h2`, …);
- there is enough contrast between text and background.

:::check Check
All four categories score at least 90.
:::

### Publishing on GitHub Pages

Finally the page goes on the internet, for free, on GitHub Pages. There it does not run at the root of the address but
in a sub-folder (`/<repository-name>/`), so add the line `base: './'` to `vite.config.js`: the built page then looks for
all its files next to `index.html`, wherever that is.

```js file=vite.config.js mark=6
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite is the development server and the build tool; the React plugin teaches it JSX.
export default defineConfig({
  base: './',
  plugins: [react()],
})
```

You need a free GitHub account ([github.com](https://github.com)). Once you are signed in, create a new **public**,
**empty** repository, for example with the name `me-myself-and-react`, like your folder (no README, or GitHub refuses
the first push; with a free account GitHub Pages works only with public repositories). This is your own repository:
your copy goes there, not into `rika-mentoring`, which stays as it is. On the empty repository's page GitHub shows a
"…or push an existing repository from the command line" part: copy the commands there into your second terminal (the
one in `me-myself-and-react`). `git remote add origin` with your repository's address connects your project to that
repository, `git branch -M main` makes sure the branch is called `main` (since `git init -b main` it already is), and
`git push -u origin main` pushes your commits there (`-u` makes git remember this destination, so later a plain
`git push` is enough).

The first push asks you to sign in. On Windows a browser window opens for it. On a Mac the terminal asks for a username
and a password: GitHub refuses your account password there, so paste a token instead (**Settings** →
**Developer settings** → **Personal access tokens** → **Tokens (classic)**, with the repo and workflow scopes).

In the repository's settings choose **Settings** → **Pages** → **Source**: **GitHub Actions**. GitHub Actions runs a
[[workflow]] on GitHub's own computers, a list of steps: here it downloads the packages, builds the page and publishes
it. A file describes the steps, and it lives in the project's root folder (where `package.json` is), in a `workflows`
folder inside a `.github` folder. The dot at the start of the folder name is on purpose. In VS Code you can type
`.github/workflows/deploy.yml` as the new file's name in one go, and the folders are created for you.

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

Finally commit and push the changes in your second terminal: `git add .`, `git commit -m "Publish"`, then `git push`.

:::check Check
"Deploy" runs on the repository's **Actions** tab, and a few minutes later your page is live at
`https://<your-username>.github.io/<repository-name>/`. Congratulations, your own page is live!
:::
