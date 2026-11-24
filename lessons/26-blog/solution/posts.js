// Seed data for the mock API, the same blog as the exercise's sampleData.js. Text fields are bilingual ({ en, hu });
// posts and comments written in the app are plain strings. `cover` is a colour key from covers.js, `tags` are
// language-neutral, and `authorId` says which author may change a post.

export const SEED_POSTS = [
  {
    id: 'welcome',
    cover: 'gold',
    author: 'Rika',
    authorId: 'rika',
    createdAt: '2026-11-16T08:30:00.000Z',
    tags: ['news'],
    title: { en: 'Welcome to the Peacock Journal', hu: 'Üdv a Pávanaplóban!' },
    body: {
      en: `Hello, and welcome! This is a small blog about React, writing and the web, built step by step in a React course.

# What you will find here

- short posts about things learnt while building this site,
- notes on **Markdown**, the way every post here is written,
- and now and then a *colourful* detour.

If you would like to write a post yourself, start with [Writing posts in Markdown](#/post/markdown-basics).`,
      hu: `Szia, és üdv itt! Ez egy kis blog a Reactről, az írásról és a webről, lépésről lépésre építve egy React-kurzusban.

# Mit találsz itt?

- rövid bejegyzéseket arról, amit az oldal építése közben tanultunk,
- jegyzeteket a **Markdownról**, amivel itt minden bejegyzés készül,
- és időnként egy *színes* kitérőt.

Ha te is írnál egy bejegyzést, kezdd a [Bejegyzések írása Markdownban](#/post/markdown-basics) című bejegyzéssel.`,
    },
  },
  {
    id: 'markdown-basics',
    cover: 'blue',
    author: 'Rika',
    authorId: 'rika',
    createdAt: '2026-11-12T09:30:00.000Z',
    tags: ['markdown', 'writing'],
    title: { en: 'Writing posts in Markdown', hu: 'Bejegyzések írása Markdownban' },
    body: {
      en: `Markdown lets you format text with a few plain characters. You type them into an ordinary text box, and the blog turns them into headings, lists and **bold** words.

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
      hu: `A Markdownnal néhány egyszerű karakterrel formázhatod a szöveget. Egy sima szövegdobozba írod őket, a blog pedig címeket, listákat és **félkövér** szavakat készít belőlük.

# Jelek egy soron belül

- Két csillag **félkövérré** tesz egy szót, egy csillag *dőltté*.
- A fordított aposztróf kódrészletet jelöl, például \`useState\`.
- A link így néz ki: [a routingról szóló bejegyzés](#/post/hash-routing).

# Blokkok

A \`#\` jellel kezdődő sor cím, a \`- \` jellel kezdődő pedig listaelem. A számokból számozott lista lesz:

1. Megírod a bejegyzést.
2. Megnézed az előnézetet.
3. Közzéteszed.

> A > jellel kezdődő sor idézet.

Három fordított aposztróf nyit és zár egy kódblokkot:

\`\`\`jsx
function Hello({ name }) {
  return <p>Szia, {name}!</p>
}
\`\`\`

Próbáld ki: írd be egy bejegyzésbe, hogy \`<script>\`. Sima szöveg marad, mert ez a blog sosem készít HTML-t a bejegyzésekből.`,
    },
  },
  {
    id: 'hash-routing',
    cover: 'teal',
    author: 'Sam',
    authorId: 'sam',
    createdAt: '2026-10-28T15:00:00.000Z',
    tags: ['react', 'routing'],
    title: { en: 'Why this blog uses hash routes', hu: 'Miért hash-útvonalakat használ ez a blog?' },
    body: {
      en: `Every page of this blog has an address of its own: \`#/\` is the list of posts, and \`#/post/hash-routing\` is this post.

# Why the # sign?

The part after the \`#\` never reaches the server. Whatever comes after it, the server sends the same \`index.html\`, and React decides which page to show. This is why the blog works on the simplest hosting, too.

# How it works

1. You click a link, and the part after the \`#\` changes.
2. The browser fires a \`hashchange\` event.
3. A small hook keeps the path in state, and the app draws the matching page.

The Back button, bookmarks and shared links all work *without* a routing library.`,
      hu: `A blog minden oldalának saját címe van: a \`#/\` a bejegyzések listája, a \`#/post/hash-routing\` pedig ez a bejegyzés.

# Miért a # jel?

A \`#\` utáni rész sosem jut el a szerverig. Akármi áll utána, a szerver ugyanazt az \`index.html\`-t küldi, és a React dönti el, melyik oldalt mutassa. Ezért működik a blog a legegyszerűbb tárhelyen is.

# Hogyan működik?

1. Rákattintasz egy linkre, és megváltozik a \`#\` utáni rész.
2. A böngésző \`hashchange\` eseményt küld.
3. Egy kis hook állapotban tartja az útvonalat, az app pedig kirajzolja a hozzá tartozó oldalt.

A Vissza gomb, a könyvjelzők és a megosztott linkek mind működnek, routing könyvtár *nélkül* is.`,
    },
  },
  {
    id: 'colours',
    cover: 'ruby',
    author: 'Sam',
    authorId: 'sam',
    createdAt: '2026-10-09T08:15:00.000Z',
    tags: ['design'],
    title: { en: 'Picking colours for a website', hu: 'Színek választása egy weboldalhoz' },
    body: {
      en: `Choosing colours for a website is mostly about restraint. Here is the short version of how this blog does it.

# Three roles

- **Base:** a calm, deep colour for the header and the main buttons.
- **Accent:** one bright colour, only for small highlights.
- **Text:** a colour dark enough to read on white.

# Check the contrast

Body text needs a contrast ratio of at least *4.5 : 1* against its background. A colour can look great as a large surface and still be hard to read as text.

> One loud colour is a highlight. Three loud colours are noise.`,
      hu: `Egy weboldal színeinek kiválasztása leginkább mértéktartás. Íme röviden, hogyan csinálja ez a blog.

# Három szerep

- **Alapszín:** nyugodt, mély szín a fejléchez és a fő gombokhoz.
- **Kiemelés:** egyetlen élénk szín, csak apró hangsúlyokra.
- **Szöveg:** elég sötét szín ahhoz, hogy fehér háttéren is olvasható legyen.

# Mérd meg a kontrasztot

A folyószövegnek legalább *4,5 : 1* kontrasztarány kell a hátteréhez képest. Egy szín nagy felületként gyönyörű lehet, szövegként mégis nehezen olvasható.

> Egy harsány szín kiemelés. Három harsány szín zaj.`,
    },
  },
]

// The authors who can log in. A real server never keeps passwords like this, only a hash of them.
// These are practice accounts: never use a real password here.
export const SEED_AUTHORS = [
  { id: 'rika', name: 'Rika', password: 'peacock' },
  { id: 'sam', name: 'Sam', password: 'pancakes' },
]

// Comments of the readers. postId is a foreign key: it says which post a comment belongs to.
export const SEED_COMMENTS = [
  {
    id: 'comment-1',
    postId: 'markdown-basics',
    name: 'Bence',
    text: {
      en: 'Thanks! I did not know that numbers make a numbered list.',
      hu: 'Köszi! Nem tudtam, hogy a számokból számozott lista lesz.',
    },
    createdAt: '2026-11-13T10:05:00.000Z',
  },
  {
    id: 'comment-2',
    postId: 'markdown-basics',
    name: 'Mia',
    text: { en: 'The preview is my favourite part.', hu: 'Az előnézet a kedvencem.' },
    createdAt: '2026-11-14T18:40:00.000Z',
  },
  {
    id: 'comment-3',
    postId: 'hash-routing',
    name: 'Leo',
    text: {
      en: 'So that is why a reload never gives me a 404 here!',
      hu: 'Szóval ezért nem kapok itt soha 404-et újratöltéskor!',
    },
    createdAt: '2026-10-30T12:20:00.000Z',
  },
]

// May this author change this post? Only its own author may. Posts without an authorId
// (written before the login existed) may be changed by any logged-in author.
export function canEdit(post, author) {
  return author !== null && (!post.authorId || post.authorId === author.id)
}

// 'React, Markdown ,, tips' → ['react', 'markdown', 'tips']: tidy, lowercase, and each one only once.
export function parseTags(text) {
  const tags = text
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== '')
  return [...new Set(tags)]
}

// Lowercase and without accents, so that "cafe" finds "café" and "szinek" finds "színek".
const simplify = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

// Does every word of the search appear in the post's title, text or tags (in the shown language)?
export function matchesSearch(post, query, tx) {
  const text = simplify(`${tx(post.title)} ${tx(post.body)} ${(post.tags ?? []).join(' ')}`)
  const words = simplify(query).split(/\s+/).filter((word) => word !== '')
  return words.every((word) => text.includes(word))
}
