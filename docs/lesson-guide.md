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
- Only use public APIs that work without keys (NASA uses `DEMO_KEY`). Plan a graceful fallback when the API is down or rate-limited.
- When an app needs sample pictures, draw simple ones yourself (flat peacock-color shapes as inline SVG, emoji, initials). No other external images except those returned by public APIs.

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
