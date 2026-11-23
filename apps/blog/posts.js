// Seed posts for the mock API. Text fields are bilingual ({ en, hu }); posts written in the
// app are plain strings. `cover` is a colour key from covers.js.

export const SEED_POSTS = [
  {
    id: 'markdown-basics',
    cover: 'blue',
    author: 'Rika',
    createdAt: '2026-11-12T09:30:00.000Z',
    title: { en: 'Writing posts in Markdown', hu: 'Bejegyzések írása Markdownban' },
    body: {
      en: `Markdown lets you format text with a few plain characters. This blog understands a **small, safe** subset of it.

## The basics

- Wrap words in two asterisks for **bold** and in one for *italic*.
- Use backticks for inline code, like \`useState\`.
- Write a link as [label](https://www.markdownguide.org).

## Code blocks

Three backticks start and end a block:

\`\`\`jsx
function Hello({ name }) {
  return <p>Hello, {name}!</p>
}
\`\`\`

> Tip: try typing \`<script>\` in a new post. It shows up as text, because the renderer escapes HTML first.`,
      hu: `A Markdownnal néhány egyszerű karakterrel formázhatod a szöveget. Ez a blog egy **kicsi, biztonságos** részét érti.

## Az alapok

- Két csillag közé tett szó **félkövér**, egy csillag közé tett *dőlt*.
- Kódrészlethez használj fordított aposztrófot, például \`useState\`.
- A link így néz ki: [felirat](https://www.markdownguide.org).

## Kódblokkok

Három fordított aposztróf nyitja és zárja a blokkot:

\`\`\`jsx
function Hello({ name }) {
  return <p>Szia, {name}!</p>
}
\`\`\`

> Tipp: írd be egy új bejegyzésbe, hogy \`<script>\`. Szövegként jelenik meg, mert a megjelenítő először minden HTML-t semlegesít.`,
    },
  },
  {
    id: 'hash-routing',
    cover: 'teal',
    author: 'Rika',
    createdAt: '2026-10-28T15:00:00.000Z',
    title: { en: 'Why this blog uses hash routes', hu: 'Miért hash-útvonalakat használ ez a blog?' },
    body: {
      en: `Every page of this blog has its own address: \`#/\` is the list, \`#/post/hash-routing\` is this post, and \`#/new\` opens the editor.

## How it works

1. The part after \`#\` never reaches the server, so GitHub Pages always serves the same \`index.html\`.
2. When it changes, the browser fires a \`hashchange\` event.
3. A tiny custom hook stores the current path in state, and React shows the matching page.

\`\`\`js
useEffect(() => {
  const onChange = () => setPath(readPath())
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}, [])
\`\`\`

The back button, bookmarks and shared links all work *without* a routing library. In a bigger app you would reach for **React Router**, but the idea is the same.`,
      hu: `A blog minden oldalának saját címe van: a \`#/\` a lista, a \`#/post/hash-routing\` ez a bejegyzés, a \`#/new\` pedig a szerkesztőt nyitja meg.

## Hogyan működik?

1. A \`#\` utáni rész sosem jut el a szerverig, így a GitHub Pages mindig ugyanazt az \`index.html\`-t adja.
2. Amikor megváltozik, a böngésző \`hashchange\` eseményt küld.
3. Egy apró saját hook állapotban tárolja az aktuális útvonalat, a React pedig a hozzá tartozó oldalt mutatja.

\`\`\`js
useEffect(() => {
  const onChange = () => setPath(readPath())
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}, [])
\`\`\`

A vissza gomb, a könyvjelzők és a megosztott linkek *routing könyvtár nélkül* is működnek. Nagyobb appban a **React Router** a megszokott választás, de az ötlet ugyanez.`,
    },
  },
  {
    id: 'colours-of-the-site',
    cover: 'ruby',
    author: 'Rika',
    createdAt: '2026-10-09T08:15:00.000Z',
    title: { en: 'Picking colours for a website', hu: 'Színek választása egy weboldalhoz' },
    body: {
      en: `Every lesson on this site gets one accent colour from the same peacock palette: teal, peacock blue, plum, ruby or gold, next to deep night blue and white. Here is the short version of how I use them.

## Three roles

- **Solid:** a calm, deep colour for headers and primary buttons.
- **Accent:** one bright colour for small highlights only.
- **Text:** a colour dark enough to read on white.

## Check the contrast

Body text needs a contrast ratio of at least *4.5 : 1*. A colour can look great as a big flat surface and still fail as text, so I keep a darker shade just for that.

> A good palette is mostly restraint: one loud colour is a highlight, three are noise.`,
      hu: `Az oldal minden leckéje ugyanabból a pávás palettából kap egy kiemelő színt: türkizt, pávakéket, szilvát, rubint vagy aranyat, a mély éjkék és a fehér mellé. Röviden leírom, hogyan használom őket.

## Három szerep

- **Fő szín:** nyugodt, mély szín a fejlécekhez és a fő gombokhoz.
- **Kiemelés:** egyetlen élénk szín, csak apró hangsúlyokra.
- **Szöveg:** elég sötét szín ahhoz, hogy fehér háttéren olvasható legyen.

## Kontrasztot is mérj

A folyószöveghez legalább *4,5 : 1* kontrasztarány kell. Egy szín nagy, egyszínű felületként gyönyörű lehet, szövegként mégis elbukhat, ezért tartok mellé egy sötétebb árnyalatot.

> A jó paletta leginkább mértéktartás: egy harsány szín kiemelés, három már zaj.`,
    },
  },
]
