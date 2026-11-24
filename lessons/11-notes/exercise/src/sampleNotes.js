// Four sample notes, so the app has something to show the very first time it starts.
// Every note is an object with the same fields:
//   id         a unique name for the note, it never changes
//   title      the title, plain text
//   body       the text of the note (the advanced level reads a little Markdown and #tags in it)
//   category   'personal', 'work', 'ideas' or 'learning'
//   updatedAt  when the note was last changed, in milliseconds (a timestamp, see Date.now())
// The guide explains each field when it first needs it. Feel free to translate the texts.

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const now = Date.now()

export const SAMPLE_NOTES = [
  {
    id: 'sample-hooks',
    title: 'React hooks cheat sheet',
    body: 'Three hooks I use all the time:\n- **useState**: values that change while the page is open\n- **useEffect**: work outside of drawing, always with a cleanup\n- *custom hooks*: my own `use…` functions\n\n#react #learning',
    category: 'learning',
    updatedAt: now - 2 * HOUR,
  },
  {
    id: 'sample-meeting',
    title: 'Meeting notes – Monday',
    body: 'Short meeting with the whole team.\n## Decisions\n- Release on **Friday**\n- Anna reviews the pull request\n\nAsk about the new design tokens. #release',
    category: 'work',
    updatedAt: now - DAY - 3 * HOUR,
  },
  {
    id: 'sample-weekend',
    title: 'Weekend plans',
    body: 'Farmers’ market on Saturday morning\nCall Grandma\nFinish the book I started\n\n#weekend',
    category: 'personal',
    updatedAt: now - 3 * DAY,
  },
  {
    id: 'sample-portfolio',
    title: 'Ideas for my portfolio',
    body: 'A short case study for every project.\n- show the code next to the live demo\n- small animations, but respect *reduced motion*\n\n#portfolio',
    category: 'ideas',
    updatedAt: now - 6 * DAY,
  },
]
