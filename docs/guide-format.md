# Lesson guides and starters

Every lesson page has two tabs: **Guide** (step by step, from the very basics) and **Solution** (the finished app).
The tab bar also offers the **starter** project as a ZIP. Lesson 1 is the reference for both:
`content/guides/portfolio/` and `starters/portfolio/`.

## The guide: `content/guides/<slug>/hu.md` and `en.md`

Plain Markdown with a few additions. The page header already shows the lesson title, so the file starts with the
introduction. A missing language falls back to the other one.

```md
# What we build                      ← title of the introduction card

Introduction paragraphs…

:::levels
- What the beginner level builds. | about 2 hours
- What the intermediate level adds. | about 3 hours
- What the advanced level adds. | about 3 hours
:::

**Before you start you need:** …

## Beginner level {level=1}         ← level sections: level=1, 2, 3
### Before you start                 ← steps, numbered automatically from 0
Text with `code`, **bold**, [a link](https://…), [[glossary term]] or [[shown text|glossary term]],
and keys like ++Ctrl++ + ++C++.

- list items (an indented line continues the item)

```jsx file=src/App.jsx mark=2,4-6
function App() {
  return <h1>Hello, React!</h1>
}
```                                  ← code: language, optional file name and marked lines

:::check Check                        ← boxes: check, mistake, try, concept (title after the name)
Text of the box.
:::

:::compare                            ← code blocks side by side
```jsx label="Before: a class" file=Hello.jsx
…
```
```jsx label="Today: a function" now file=Hello.jsx
…
```
:::
```

Code languages with colours: `jsx`/`js`, `css`, `shell`. Others (for example `yaml`, `html`) are shown plain.
No raw HTML: the text is rendered as React elements.

### How a guide teaches

- Start from the basics. Say what a new word means the first time it appears, and mark it as a `[[term]]` (the glossary
  will link these).
- One step, one idea. Show the code, explain it in plain words, then tell the learner what they should see
  (`:::check`), what usually goes wrong (`:::mistake`) and something small to try (`:::try`).
- The steps build the app in the starter project, not in this site's code: plain React, no site helpers.
- Code style by lesson: lessons 1–26 use `function Name() {}` components, 27–50 arrow functions
  (`const Name = () => {}`). Class components appear only in lesson 1's detour.
- Data and pictures the starter needs come from this site (`public/media/…`, the lesson APIs), never from other services.
- Write the Hungarian and the English version with the same steps, the same code structure and the same file, component,
  function and variable names (always English). What the learner types as visible UI text (labels, messages, sample
  content) and as code comments is in the guide's language: Hungarian in `hu.md`, English in `en.md`. Line numbers in
  `mark=` must match the code shown in each file.
- Files that already come with the starter are shared by both languages, so they are in English; the Hungarian guide
  says so where it matters ("the sample text is in English, feel free to translate it").

## The starter: `starters/<slug>/`

`npm run starters` (also run before `dev` and `build`) builds `public/starters/<slug>.zip` for every lesson that has a
`starters/<slug>/starter.json`. The ZIP is the common project in `starters/_base/` (Vite + React, README, .gitignore)
plus the lesson's own files on top, as a git repository with one "starting point" commit.

- `starter.json`: `{ "folder": "name-of-the-unzipped-folder" }`.
- Any other file in `starters/<slug>/` is added or replaces the base file with the same path (for example `src/App.jsx`).
- `{{N}}`, `{{TITLE_EN}}`, `{{TITLE_HU}}`, `{{GUIDE_URL}}`, `{{SOLUTION_URL}}`, `{{SITE_URL}}` and `{{FOLDER}}` are filled in
  text files. The site address comes from `starters/site.json`.
- The starter is the state of step 0 of the guide: everything the learner needs to begin, nothing they are meant to write.
