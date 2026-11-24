// The "AI" of this demo: a fixed, bilingual set of answers about React, picked by keywords.
// No model, no API key, no network. A real app would call its own backend here, and the backend
// would call the AI API with a secret key, streaming the answer back.

const TOPICS = [
  {
    id: 'greeting',
    keywords: ['hello', 'hi ', 'hey', 'good morning', 'szia', 'helló', 'hello', 'üdv', 'jó napot', 'sziasztok'],
    reply: {
      en: `Hi! I am a **simulated** React helper. I do not think, I only pick a prepared answer by keyword, then type it out letter by letter.

Ask me about any of these:
- \`useState\`, \`useEffect\`, \`useReducer\`
- props, components, lists and keys
- forms, Context, custom hooks
- fetching data, performance, routing`,
      hu: `Szia! **Szimulált** React-segéd vagyok. Nem gondolkodom, csak kulcsszó alapján kiválasztok egy előre megírt választ, és betűnként begépelem.

Kérdezz ezekről:
- \`useState\`, \`useEffect\`, \`useReducer\`
- propok, komponensek, listák és key-ek
- űrlapok, Context, saját hookok
- adatlekérés, teljesítmény, routing`,
    },
  },
  {
    id: 'useState',
    keywords: ['usestate', 'state', 'állapot', 'counter', 'számláló', 'rerender', 're-render'],
    reply: {
      en: `## useState in one sentence
\`useState\` gives a component a value that **survives re-renders**, plus a function to change it. Calling the setter schedules a new render with the new value.

\`\`\`jsx
import { useState } from 'react'

const Counter = () => {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Clicked {count} times
    </button>
  )
}
\`\`\`

Two tips:
1. Use the **updater form** \`setCount((c) => c + 1)\` when the new value depends on the old one.
2. Never mutate state. Create a new object or array: \`setItems([...items, item])\`.`,
      hu: `## A useState egy mondatban
A \`useState\` egy olyan értéket ad a komponensnek, ami **megmarad az újrarajzolások között**, és egy függvényt a módosításához. A setter hívása új renderelést indít az új értékkel.

\`\`\`jsx
import { useState } from 'react'

const Counter = () => {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      {count} kattintás
    </button>
  )
}
\`\`\`

Két tipp:
1. Használd a **függvényes formát** (\`setCount((c) => c + 1)\`), ha az új érték a régitől függ.
2. Az állapotot sose módosítsd helyben. Készíts új objektumot vagy tömböt: \`setItems([...items, item])\`.`,
    },
  },
  {
    id: 'useEffect',
    keywords: ['useeffect', 'effect', 'side effect', 'cleanup', 'lifecycle', 'mellékhatás', 'életciklus', 'interval', 'timer', 'időzítő'],
    reply: {
      en: `## useEffect: sync with the outside world
An effect runs **after** React has updated the screen. Use it to connect your component to something outside React: a timer, a subscription, the document title.

\`\`\`jsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000)
  return () => clearInterval(id) // cleanup: stop what you started
}, []) // [] = run once after the first render
\`\`\`

- The **dependency array** decides when it runs again: \`[userId]\` means "whenever userId changes".
- In development, StrictMode runs effects twice on purpose, to reveal a missing cleanup.
- If you only calculate a value from props or state, you do **not** need an effect. Compute it during render.`,
      hu: `## useEffect: szinkron a külvilággal
Az effect **azután** fut le, hogy a React frissítette a képernyőt. Arra való, hogy a komponenst valami Reacten kívüli dologhoz kösd: időzítőhöz, feliratkozáshoz, az oldal címéhez.

\`\`\`jsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000)
  return () => clearInterval(id) // cleanup: állítsd le, amit elindítottál
}, []) // [] = csak az első render után fut
\`\`\`

- A **függőségtömb** dönti el, mikor fusson újra: \`[userId]\` = „valahányszor a userId változik”.
- Fejlesztés közben a StrictMode szándékosan kétszer futtatja az effecteket, hogy kiderüljön a hiányzó cleanup.
- Ha csak propokból vagy állapotból számolsz értéket, **nem** kell effect. Számold ki renderelés közben.`,
    },
  },
  {
    id: 'props',
    keywords: ['props', 'prop', 'children', 'parent', 'szülő', 'gyerek', 'átadni', 'pass data'],
    reply: {
      en: `## Props: arguments for components
Props flow **down**, from parent to child. A child never changes its props; it asks the parent by calling a function it received.

\`\`\`jsx
const PriceTag = ({ amount, currency = 'EUR' }) => {
  return <span>{amount} {currency}</span>
}

<PriceTag amount={64} />
\`\`\`

- \`children\` is a special prop: whatever you put between the tags.
- To send data **up**, pass a callback: \`<Search onChange={setQuery} />\`.
- If many levels need the same value, look at **Context**.`,
      hu: `## Propok: a komponensek paraméterei
A propok **lefelé** áramlanak, a szülőtől a gyerek felé. A gyerek sosem módosítja a propjait, hanem meghív egy kapott függvényt, hogy a szülő változtasson.

\`\`\`jsx
const PriceTag = ({ amount, currency = 'EUR' }) => {
  return <span>{amount} {currency}</span>
}

<PriceTag amount={64} />
\`\`\`

- A \`children\` különleges prop: az, amit a nyitó és záró tag közé írsz.
- Ha **felfelé** kell adatot küldeni, adj át callbacket: \`<Search onChange={setQuery} />\`.
- Ha sok szinten kell ugyanaz az érték, nézd meg a **Contextet**.`,
    },
  },
  {
    id: 'components',
    keywords: ['component', 'komponens', 'jsx', 'function component', 'split', 'szétbont', 'structure', 'felépít'],
    reply: {
      en: `## Components and JSX
A component is a **function that returns JSX**. JSX looks like HTML, but it is JavaScript: \`className\` instead of \`class\`, and \`{ }\` for any expression.

\`\`\`jsx
const Card = ({ title, children }) => {
  return (
    <article className="card">
      <h3>{title}</h3>
      {children}
    </article>
  )
}
\`\`\`

A good rule of thumb: when a piece of UI has its **own state** or appears **more than once**, make it a component. Names start with a capital letter.`,
      hu: `## Komponensek és JSX
A komponens egy **függvény, ami JSX-et ad vissza**. A JSX HTML-nek látszik, de JavaScript: \`class\` helyett \`className\`, és \`{ }\` között bármilyen kifejezés állhat.

\`\`\`jsx
const Card = ({ title, children }) => {
  return (
    <article className="card">
      <h3>{title}</h3>
      {children}
    </article>
  )
}
\`\`\`

Jó ökölszabály: ha egy felületdarabnak **saját állapota** van, vagy **többször** szerepel, legyen belőle komponens. A név nagybetűvel kezdődik.`,
    },
  },
  {
    id: 'keys',
    keywords: ['key', 'keys', 'list', 'map(', '.map', 'lista', 'kulcs', 'array', 'tömb'],
    reply: {
      en: `## Lists need keys
When you render an array, React needs a **stable key** per item to know which element is which between renders.

\`\`\`jsx
<ul>
  {todos.map((todo) => (
    <li key={todo.id}>{todo.text}</li>
  ))}
</ul>
\`\`\`

- Use an id from your data, not the array index. With the index, sorting or deleting makes React reuse the wrong element, and input values or checkboxes "jump".
- Keys only need to be unique **among siblings**.`,
      hu: `## A listáknak key kell
Ha tömböt renderelsz, a Reactnek elemenként egy **stabil key** kell, hogy két renderelés között tudja, melyik elem melyik.

\`\`\`jsx
<ul>
  {todos.map((todo) => (
    <li key={todo.id}>{todo.text}</li>
  ))}
</ul>
\`\`\`

- Az adatodból származó id-t használd, ne a tömbindexet. Indexszel rendezésnél vagy törlésnél a React rossz elemet használ újra, és az input értékek vagy pipák „elugranak”.
- A key-nek csak a **testvérek között** kell egyedinek lennie.`,
    },
  },
  {
    id: 'forms',
    keywords: ['form', 'input', 'controlled', 'validation', 'validál', 'űrlap', 'submit', 'mező'],
    reply: {
      en: `## Controlled forms
In a controlled input, **React state is the single source of truth**: the value comes from state, and every keystroke updates it.

\`\`\`jsx
const NameForm = () => {
  const [name, setName] = useState('')
  const error = name.trim().length < 2 ? 'Too short' : ''

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(name) }}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      {error && <small>{error}</small>}
      <button disabled={Boolean(error)}>Save</button>
    </form>
  )
}
\`\`\`

Notice that \`error\` is **derived**: it is calculated from \`name\` on every render, so it can never get out of sync.`,
      hu: `## Kontrollált űrlapok
Kontrollált inputnál **a React-állapot az egyetlen igazságforrás**: az érték az állapotból jön, és minden billentyűleütés frissíti.

\`\`\`jsx
const NameForm = () => {
  const [name, setName] = useState('')
  const error = name.trim().length < 2 ? 'Túl rövid' : ''

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(name) }}>
      <label>
        Név
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      {error && <small>{error}</small>}
      <button disabled={Boolean(error)}>Mentés</button>
    </form>
  )
}
\`\`\`

Figyeld meg, hogy az \`error\` **számolt érték**: minden rendereléskor a \`name\`-ből jön létre, így sosem csúszhat el.`,
    },
  },
  {
    id: 'context',
    keywords: ['context', 'usecontext', 'prop drilling', 'global', 'globális', 'provider', 'theme', 'téma'],
    reply: {
      en: `## Context: skip the prop drilling
Context lets deeply nested components read a value **without passing it through every level**.

\`\`\`jsx
const ThemeContext = createContext('light')

const App = () => {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  )
}

const Button = () => {
  const theme = useContext(ThemeContext)
  return <button className={theme}>OK</button>
}
\`\`\`

Every consumer re-renders when the value changes, so keep contexts focused (theme, user, cart) and memoise object values with \`useMemo\`.`,
      hu: `## Context: propok átpasszolgatása nélkül
A Context segítségével a mélyen beágyazott komponensek is elérnek egy értéket, **anélkül hogy minden szinten át kellene adni**.

\`\`\`jsx
const ThemeContext = createContext('light')

const App = () => {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  )
}

const Button = () => {
  const theme = useContext(ThemeContext)
  return <button className={theme}>OK</button>
}
\`\`\`

Minden fogyasztó újrarajzolódik, ha az érték változik, ezért a contextek legyenek szűkek (téma, felhasználó, kosár), az objektum-értékeket pedig memoizáld \`useMemo\`-val.`,
    },
  },
  {
    id: 'useReducer',
    keywords: ['usereducer', 'reducer', 'dispatch', 'action', 'redux', 'zustand', 'complex state', 'összetett'],
    reply: {
      en: `## useReducer for related state
When several values change together, or the next state depends on **what happened**, a reducer keeps the logic in one pure function.

\`\`\`jsx
function cartReducer(items, action) {
  switch (action.type) {
    case 'add':
      return [...items, action.item]
    case 'remove':
      return items.filter((item) => item.id !== action.id)
    default:
      throw new Error('Unknown action: ' + action.type)
  }
}

const [items, dispatch] = useReducer(cartReducer, [])
dispatch({ type: 'add', item })
\`\`\`

Combine it with Context and you have a small global store, often enough before reaching for Redux or Zustand.`,
      hu: `## useReducer összetartozó állapothoz
Ha több érték együtt változik, vagy a következő állapot attól függ, hogy **mi történt**, a reducer egyetlen tiszta függvényben tartja a logikát.

\`\`\`jsx
function cartReducer(items, action) {
  switch (action.type) {
    case 'add':
      return [...items, action.item]
    case 'remove':
      return items.filter((item) => item.id !== action.id)
    default:
      throw new Error('Ismeretlen action: ' + action.type)
  }
}

const [items, dispatch] = useReducer(cartReducer, [])
dispatch({ type: 'add', item })
\`\`\`

Contexttel kombinálva kész egy kis globális store, ami sokszor elég, mielőtt Reduxhoz vagy Zustandhoz nyúlnál.`,
    },
  },
  {
    id: 'customHooks',
    keywords: ['custom hook', 'own hook', 'saját hook', 'uselocalstorage', 'usedebounce', 'reuse', 'újrahasznosít', 'hook'],
    reply: {
      en: `## Custom hooks: reuse logic, not UI
A custom hook is a function whose name starts with \`use\` and that calls other hooks. It shares **stateful logic**; each component that uses it gets its own state.

\`\`\`js
const useLocalStorage = (key, initial) => {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
\`\`\`

Rules of hooks: call them at the **top level** of a component or another hook, never inside conditions or loops.`,
      hu: `## Saját hookok: logikát hasznosíts újra, ne felületet
A saját hook egy \`use\` kezdetű függvény, ami más hookokat hív. **Állapotos logikát** oszt meg; minden komponens, ami használja, saját állapotot kap.

\`\`\`js
const useLocalStorage = (key, initial) => {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
\`\`\`

A hookok szabálya: mindig a komponens vagy egy másik hook **legfelső szintjén** hívd őket, sosem feltételben vagy ciklusban.`,
    },
  },
  {
    id: 'fetch',
    keywords: ['fetch', 'api', 'data', 'request', 'loading', 'axios', 'adat', 'lekér', 'betölt', 'backend', 'server', 'szerver'],
    reply: {
      en: `## Fetching data with loading and error states
Every request has three outcomes worth showing: **loading**, **error** (with a retry) and **success** (which may be empty).

\`\`\`jsx
const useFetch = (url) => {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(res.status)
        return res.json()
      })
      .then((data) => setState({ status: 'done', data }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', error })
      })
    return () => controller.abort() // cancel if the url changes or we unmount
  }, [url])

  return state
}
\`\`\`

For bigger apps, a library like TanStack Query adds caching and refetching on top of this idea.`,
      hu: `## Adatlekérés betöltés- és hibaállapottal
Minden kérésnek három kimenetele van, amit érdemes megmutatni: **betöltés**, **hiba** (újrapróbálással) és **siker** (ami lehet üres is).

\`\`\`jsx
const useFetch = (url) => {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(res.status)
        return res.json()
      })
      .then((data) => setState({ status: 'done', data }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', error })
      })
    return () => controller.abort() // megszakítjuk, ha változik az url vagy eltűnik a komponens
  }, [url])

  return state
}
\`\`\`

Nagyobb appokban egy könyvtár, például a TanStack Query, gyorsítótárazást és újratöltést tesz erre az ötletre.`,
    },
  },
  {
    id: 'performance',
    keywords: ['memo', 'usememo', 'usecallback', 'performance', 'slow', 'optimiz', 'lassú', 'teljesítmény', 'gyors'],
    reply: {
      en: `## Performance: measure first
Most React apps are fast enough without any tricks. When something is slow, open the **React DevTools Profiler** first and find the component that renders too often.

Then the usual tools:
- \`useMemo\` caches an **expensive calculation** between renders.
- \`useCallback\` keeps the **same function** between renders (useful with \`memo\`).
- \`memo(Component)\` skips re-rendering when the props did not change.

\`\`\`jsx
const visible = useMemo(
  () => products.filter((p) => p.name.includes(query)),
  [products, query],
)
\`\`\`

Also check the basics: stable keys, and state kept as low in the tree as possible.`,
      hu: `## Teljesítmény: előbb mérj
A legtöbb React app trükkök nélkül is elég gyors. Ha valami lassú, először nyisd meg a **React DevTools Profilert**, és keresd meg, melyik komponens renderelődik túl sokszor.

Utána jöhetnek a szokásos eszközök:
- A \`useMemo\` megjegyzi egy **drága számítás** eredményét két renderelés között.
- A \`useCallback\` **ugyanazt a függvényt** adja vissza renderelésenként (a \`memo\`-val együtt hasznos).
- A \`memo(Component)\` kihagyja az újrarajzolást, ha a propok nem változtak.

\`\`\`jsx
const visible = useMemo(
  () => products.filter((p) => p.name.includes(query)),
  [products, query],
)
\`\`\`

Az alapokat is nézd meg: stabil key-ek, és az állapot a fában a lehető legalacsonyabban.`,
    },
  },
  {
    id: 'routing',
    keywords: ['router', 'routing', 'route', 'navigation', 'navigate', 'page', 'url', 'útvonal', 'oldalak', 'navigáció'],
    reply: {
      en: `## Routing
Routing maps the **URL to a screen**. React Router is the common choice, but the core idea fits in a few lines with the hash:

\`\`\`jsx
const useHashRoute = () => {
  const [path, setPath] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const onChange = () => setPath(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}
\`\`\`

Then switch on \`path\` to render the right page. Hash routes also work on static hosting like GitHub Pages, because the server never sees the part after \`#\`.`,
      hu: `## Routing
A routing az **URL-hez képernyőt rendel**. A React Router a szokásos választás, de az alapötlet néhány sorban is megvan a hash segítségével:

\`\`\`jsx
const useHashRoute = () => {
  const [path, setPath] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const onChange = () => setPath(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}
\`\`\`

Utána a \`path\` alapján rendereled a megfelelő oldalt. A hash-alapú útvonalak statikus tárhelyen (pl. GitHub Pages) is működnek, mert a szerver nem látja a \`#\` utáni részt.`,
    },
  },
  {
    id: 'meta',
    keywords: ['stream', 'how do you work', 'real ai', 'api key', 'are you', 'gpt', 'claude', 'openai', 'hogyan működsz', 'valódi', 'mesterséges', 'ki vagy', 'mi vagy'],
    reply: {
      en: `## How this demo works
There is **no real AI** here. Your message is matched against keywords, a prepared answer is picked, and a timer adds a few characters at a time to imitate a streamed response.

A real version would look like this:
1. The browser sends the conversation to **your own backend**.
2. The backend calls the AI API with a **secret key** that never reaches the browser.
3. The answer comes back as a stream (Server-Sent Events or a \`ReadableStream\`), and React appends each chunk to the last message.

\`\`\`js
const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }) })
const reader = res.body.getReader()
const decoder = new TextDecoder()
for (;;) {
  const { done, value } = await reader.read()
  if (done) break
  appendToLastMessage(decoder.decode(value))
}
\`\`\``,
      hu: `## Így működik ez a demó
Itt **nincs valódi AI**. Az üzenetedet kulcsszavakkal vetem össze, kiválasztok egy előre megírt választ, és egy időzítő néhány karakterenként adja hozzá, hogy streamelt válasznak tűnjön.

Egy valódi változat így nézne ki:
1. A böngésző elküldi a beszélgetést a **saját backendednek**.
2. A backend hívja az AI API-t egy **titkos kulccsal**, ami sosem jut el a böngészőig.
3. A válasz folyamként érkezik (Server-Sent Events vagy \`ReadableStream\`), és a React minden darabot hozzáfűz az utolsó üzenethez.

\`\`\`js
const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }) })
const reader = res.body.getReader()
const decoder = new TextDecoder()
for (;;) {
  const { done, value } = await reader.read()
  if (done) break
  appendToLastMessage(decoder.decode(value))
}
\`\`\``,
    },
  },
  {
    id: 'thanks',
    keywords: ['thanks', 'thank you', 'cheers', 'köszi', 'köszönöm', 'kösz', 'thx'],
    reply: {
      en: 'You are welcome! Happy coding. Ask another question whenever you like, or start a **new chat** from the sidebar.',
      hu: 'Szívesen! Jó kódolást! Kérdezz bármikor újra, vagy indíts **új beszélgetést** az oldalsávból.',
    },
  },
]

const FALLBACK = {
  en: `I am only a **simulated** assistant, so I did not recognise that topic.

I can talk about \`useState\`, \`useEffect\`, \`useReducer\`, props, components, lists and keys, forms, Context, custom hooks, fetching data, performance and routing. Try asking about one of them!`,
  hu: `Csak **szimulált** asszisztens vagyok, így ezt a témát nem ismertem fel.

Ezekről tudok beszélni: \`useState\`, \`useEffect\`, \`useReducer\`, propok, komponensek, listák és key-ek, űrlapok, Context, saját hookok, adatlekérés, teljesítmény és routing. Kérdezz valamelyikről!`,
}

export const SUGGESTIONS = {
  en: ['Explain useEffect with an example', 'When should I use useReducer?', 'How do I fetch data in React?', 'Why do lists need keys?'],
  hu: ['Magyarázd el a useEffectet egy példával', 'Mikor használjak useReducert?', 'Hogyan kérjek le adatot Reactben?', 'Miért kell key a listákhoz?'],
}

// Score every topic: longer (more specific) keywords count more, e.g. "usereducer" beats "state".
export function pickReply(message, lang) {
  const text = ` ${message.toLowerCase()} `
  let best = null
  let bestScore = 0
  for (const topic of TOPICS) {
    const score = topic.keywords.reduce((sum, kw) => (text.includes(kw) ? sum + kw.length : sum), 0)
    if (score > bestScore) {
      best = topic
      bestScore = score
    }
  }
  return (best?.reply ?? FALLBACK)[lang]
}
