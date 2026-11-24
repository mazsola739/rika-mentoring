// Sample data for the pretend server (src/fakeApi.js): what its database holds before you change anything.
// The texts are in English; feel free to translate them, or to write your own posts in the app.
//
// - createdAt is a date in ISO format (in UTC time), the same format the server gives new posts.
// - The bodies are Markdown text. Inside these JavaScript texts, \` is a backtick: the backslash
//   keeps it from ending the text.

export const SAMPLE_POSTS = [
  {
    id: 'welcome',
    title: 'Welcome to the Peacock Journal',
    author: 'Rika',
    authorId: 'rika',
    createdAt: '2026-11-16T08:30:00.000Z',
    tags: ['news'],
    body: `Hello, and welcome! This is a small blog about React, writing and the web, built step by step in a React course.

# What you will find here

- short posts about things learnt while building this site,
- notes on **Markdown**, the way every post here is written,
- and now and then a *colourful* detour.

If you would like to write a post yourself, start with [Writing posts in Markdown](#/post/markdown-basics).`,
  },
  {
    id: 'markdown-basics',
    title: 'Writing posts in Markdown',
    author: 'Rika',
    authorId: 'rika',
    createdAt: '2026-11-12T09:30:00.000Z',
    tags: ['markdown', 'writing'],
    body: `Markdown lets you format text with a few plain characters. You type them into an ordinary text box, and the blog turns them into headings, lists and **bold** words.

# Marks inside a line

- Two stars make a word **bold**, one star makes it *italic*.
- Backticks mark a piece of code, like \`useState\`.
- A link looks like this: [the post about routing](#/post/hash-routing).

# Blocks

A line that starts with \`#\` is a heading, and one that starts with \`- \` is a list item. Numbers make a numbered list:

1. Write the post.
2. Look at the preview.
3. Publish it.

> A line that starts with a > sign is a quote.

Three backticks start and end a code block:

\`\`\`jsx
function Hello({ name }) {
  return <p>Hello, {name}!</p>
}
\`\`\`

Try typing \`<script>\` into a post: it stays plain text, because this blog never turns a post into HTML.`,
  },
  {
    id: 'hash-routing',
    title: 'Why this blog uses hash routes',
    author: 'Sam',
    authorId: 'sam',
    createdAt: '2026-10-28T15:00:00.000Z',
    tags: ['react', 'routing'],
    body: `Every page of this blog has an address of its own: \`#/\` is the list of posts, and \`#/post/hash-routing\` is this post.

# Why the # sign?

The part after the \`#\` never reaches the server. Whatever comes after it, the server sends the same \`index.html\`, and React decides which page to show. This is why the blog works on the simplest hosting, too.

# How it works

1. You click a link, and the part after the \`#\` changes.
2. The browser fires a \`hashchange\` event.
3. A small hook keeps the path in state, and the app draws the matching page.

The Back button, bookmarks and shared links all work *without* a routing library.`,
  },
  {
    id: 'colours',
    title: 'Picking colours for a website',
    author: 'Sam',
    authorId: 'sam',
    createdAt: '2026-10-09T08:15:00.000Z',
    tags: ['design'],
    body: `Choosing colours for a website is mostly about restraint. Here is the short version of how this blog does it.

# Three roles

- **Base:** a calm, deep colour for the header and the main buttons.
- **Accent:** one bright colour, only for small highlights.
- **Text:** a colour dark enough to read on white.

# Check the contrast

Body text needs a contrast ratio of at least *4.5 : 1* against its background. A colour can look great as a large surface and still be hard to read as text.

> One loud colour is a highlight. Three loud colours are noise.`,
  },
]

// The authors who can log in (advanced level). A real server never keeps passwords like this:
// the guide's login step explains why. Never use a real password in this project.
export const SAMPLE_AUTHORS = [
  { id: 'rika', name: 'Rika', password: 'peacock' },
  { id: 'sam', name: 'Sam', password: 'pancakes' },
]

// Comments of the readers (advanced level). postId says which post a comment belongs to.
export const SAMPLE_COMMENTS = [
  {
    id: 'comment-1',
    postId: 'markdown-basics',
    name: 'Bence',
    text: 'Thanks! I did not know that numbers make a numbered list.',
    createdAt: '2026-11-13T10:05:00.000Z',
  },
  {
    id: 'comment-2',
    postId: 'markdown-basics',
    name: 'Mia',
    text: 'The preview is my favourite part.',
    createdAt: '2026-11-14T18:40:00.000Z',
  },
  {
    id: 'comment-3',
    postId: 'hash-routing',
    name: 'Leo',
    text: 'So that is why a reload never gives me a 404 here!',
    createdAt: '2026-10-30T12:20:00.000Z',
  },
]
