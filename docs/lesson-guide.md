# Lesson app guide

Every lesson is a standalone React micro frontend in `apps/<slug>/`. This guide keeps all 50 apps consistent, professional and bilingual.

## Folder and boundaries

```
apps/<slug>/
  index.html   ← generated, do not edit
  main.jsx     ← generated, do not edit
  App.jsx      ← your app (replace the <ComingSoon /> placeholder)
  app.css      ← your styles
  *.jsx / *.js ← components, hooks, data, helpers
```

- Only edit files inside your own `apps/<slug>/` folder. Never edit `shared/`, `src/`, other apps, `package.json` or config files.
- No new npm packages. Available: `react`, `react-dom`, `qrcode`, `leaflet` (+ `leaflet/dist/leaflet.css`).
- If you are blocked by something outside your folder, write it in your report instead of changing it.

## App skeleton

```jsx
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import './app.css'

const TEXT = {
  en: { title: 'Shopping list', add: 'Add item' },
  hu: { title: 'Bevásárlólista', add: 'Tétel hozzáadása' },
}

function ShoppingList() {
  const t = useText(TEXT)
  // ...
}

export default function App() {
  return (
    <AppFrame slug="shopping-list">
      <ShoppingList />
    </AppFrame>
  )
}
```

### Component style by level

The lessons teach from the very basics, and the code style grows with the learner:

- **Beginner and Beginner+ (lessons 1–26):** function declarations, as above: `function ShoppingList() { … }`, `export default function App() { … }`.
- **Intermediate and Advanced (lessons 27–50):** arrow function components: `const ShoppingList = () => { … }`, then `export default App` at the end. The first Intermediate lesson's guide explains the switch.
- **Class components** are shown only once, in lesson 1's guide, as the older way to write the same component next to the function version ("you will meet this in older code"). No lesson app is written with classes. (Error boundaries are the one place React still needs a class; if a lesson needs one, keep it tiny and say why.)
- Custom hooks follow the same rule as the components of their lesson.

`AppFrame` renders the whole page: header (lesson title + the lesson's pattern), the "What you'll learn" panel, previous/next links and the language switch. Your app renders inside a white panel that is roughly 600–820 px wide on desktop and full width on phones.

`useLesson()` returns `{ n, slug, tier, lang, text: { title, short, learn, beginner, intermediate, advanced }, palette: { key, name: { en, hu }, colors: [...], solid, dark, light, ink, accent, text } }`.

## Languages

- English is the default language, Hungarian is the second. Every visible string exists in both, in natural, professional wording.
- Put strings in a `TEXT = { en: {...}, hu: {...} }` object and read them with `useText(TEXT)`. The UI must update live when the language changes.
- Seed data with text (products, posts, questions…) is bilingual (`{ en, hu }`) or language-neutral.
- Dates and numbers: `new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', …)`, `Intl.NumberFormat` likewise.

## Design system

The site is a clean, modern, very professional website with **simple flat colors** from the peacock palette. **No patterns or decorative images** and no furniture motifs.

The "Páva" palette (`PEACOCK_PALETTE`, `PEACOCK`, `PEACOCK_COLORS` from `@shared/ui/palette.js`; also saved in `resources/pava-szinek/`): night `#070B1A`, surface `#111E3D`, deep teal `#083F58`, peacock green `#017B6B`, turquoise `#01C5AC`, sky `#0197D8`, peacock blue `#013E8E`, violet `#9A03B7`, magenta `#F70677`, orange `#FD7701`, gold `#FEB800`. Every lesson gets one accent (`--solid`, from `paletteFor(n)` in `@shared/ui/palette.js`), the same colour as its card on the main page; never hard-code a lesson's accent — read the CSS variables or `useLesson().palette`.

Tokens (from `shared/ui/theme.css`):

| Token | Use |
|---|---|
| `--ink`, `--ink-soft` | main and secondary text |
| `--paper` (#fff), `--paper-2`, `--page` | surfaces |
| `--line` | borders |
| `--radius` (18px), `--shadow` | cards |
| `--font-display` (Plus Jakarta Sans), `--font-body` (DM Sans) | type |
| `--solid`, `--solid-dark`, `--solid-light` | the lesson palette's main color and shades |
| `--solid-ink` | text on `--solid` |
| `--solid-text` | palette color that is readable as text on white |
| `--accent` | small highlights |

Shared classes: `.btn`, `.btn--ghost`, `.input`, `.field` (label wrapper: `<label class="field"><span>Label</span><input class="input"/></label>`), `.chip` (with `aria-pressed`), `.solid`, `.panel`, `.visually-hidden`.

Shared components: `LevelMeter` (`@shared/ui/LevelMeter.jsx`, bars for levels/strength), `Inline` (renders `` `code` `` in text).

Rules:
- Prefix every CSS class with a short app prefix (e.g. `.qr-…`, `.fc-…`) so apps never collide.
- Flat, calm UI: white or `--paper-2` surfaces, 1px `--line` borders, 12–18 px radius, generous spacing. Use `--solid` for primary actions and highlights; use `--solid-text` for colored text on white. Prefer the lesson palette (`useLesson().palette.colors`) over new hard-coded colors.
- Headings in `--font-display`. Body text 15–16 px.
- Works from 320 px wide with no horizontal scroll. Use container queries on your root element if the layout depends on the panel width.
- Accessible: real `<button>`s and `<label>`s, keyboard support, visible focus, `aria-live` for changing results, `alt` text, sufficient contrast. Respect `prefers-reduced-motion`.

## Data and "backend"

- There is no real server (the site runs on GitHub Pages). Persist with `localStorage` (always inside `try/catch`), keys namespaced as `rika:<slug>:…`.
- For server-like behavior use the fake backend:

```js
import { createMockApi, createChannel, MockApiError } from '@shared/mock-api/index.js'

const api = createMockApi('blog', { seed: { posts: [...] }, latency: [300, 800], failRate: 0.1 })
await api.list('posts') // also: get(c, id), create(c, data), update(c, id, patch), remove(c, id), reset()

const channel = createChannel('chat', (message) => {/* from other tabs */})
channel.send({ ... }) // real time between browser tabs (BroadcastChannel)
```

- Always show loading, error (with retry) and empty states.
- **No external services.** The whole mentoring runs on this site: no third-party APIs, images, videos, fonts or CDNs.
- Lessons that teach `fetch()` call the site's own HTTP API, served in the browser by Mock Service Worker. Write handlers in `apps/<slug>/mocks/handlers.js` and start them in `main.jsx` before rendering (see `apps/currency-converter`):

```js
// main.jsx
import { startMockApi } from '@shared/mock-api/msw.js'
import { handlers } from './mocks/handlers.js'
await startMockApi(handlers)

// mocks/handlers.js
import { http, HttpResponse } from 'msw'
import { networkDelay, errorResponse, svgResponse } from '@shared/mock-api/msw.js'
export const handlers = [
  http.get('/api/things', async () => {
    await networkDelay()
    return HttpResponse.json([...])
  }),
]
```

- The app code calls `/api/...` like a real REST back end (an env var such as `VITE_THINGS_API` may override the base URL as a teaching point). Mimic real behaviour: paging, 400/404 errors, an API key with 403 where the lesson teaches keys, a gentle 429 rate limit so error states can be shown.
- Pictures: the site owner brings real media (see `docs/media-needed.md`). Until then draw them in code as SVG and serve them from the mock API with `svgResponse` (`<img>` requests are answered by MSW too), or as inline SVG / data URLs.

## Scope and code quality

- Fully implement the **Beginner** and **Intermediate** levels of your lesson (see `content/lessons.en.json` for your slug). Add Advanced features only when they are cheap and solid.
- The code is teaching material: small components, readable names, custom hooks in their own files when the lesson mentions them (`useLocalStorage`, `useFetch`, `useDebounce`, …), short English comments that explain the React idea, not the obvious.
- Clean up every effect (intervals, listeners, audio, camera streams, object URLs). StrictMode mounts effects twice in development.

## Done checklist

- `npx vite build --outDir <your own temporary folder> --emptyOutDir` passes (never build into `dist/`, other builds run in parallel).
- No runtime errors you can foresee (effects cleaned up, no undefined access on first render).
- Both languages complete; switching language mid-use does not break state.
- Nothing outside your app folder changed.

Reference implementations: `apps/password-generator` (simple), `apps/mad-libs` (i18n, resetting state with `key`), `apps/dark-mode` (custom hook + Context), `apps/portfolio` (hash routing, mock API form in `components/ContactForm.jsx`).
