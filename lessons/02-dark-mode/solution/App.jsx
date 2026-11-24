import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { ThemeProvider, useTheme } from './ThemeContext.jsx'
import './app.css'

// The CSS variables of the two themes; the swatches are drawn from the same object.
const THEMES = {
  light: { '--bg': '#fbf5ea', '--surface': '#ffffff', '--text': '#2b211b', '--muted': '#6b5a4c', '--accent': '#0c5c45' },
  dark: { '--bg': '#0b0d1c', '--surface': '#161c36', '--text': '#f1ead9', '--muted': '#a9b0cf', '--accent': '#d9a441' },
}

const TEXT = {
  hu: {
    modeLabel: 'Téma',
    modes: { light: 'Világos', dark: 'Sötét', system: 'Rendszer' },
    active: (dark) => (dark ? 'Esti mód aktív' : 'Nappali mód aktív'),
    kicker: 'Bemutató cikk',
    title: 'Kényelmes esti olvasás',
    body: 'Sötét szobában a világos felület vakít és fárasztja a szemet. Egy jó sötét téma nem csak befeketíti az oldalt: csökkenti a kontrasztot, melegebb színeket használ, és a kiemeléseket is újrahangolja.',
    tokens: 'Aktív CSS-változók',
    saved: 'A választás megmarad oldalfrissítés után is (localStorage).',
    system: (dark) => `A „Rendszer” mód a gép beállítását követi, ami most: ${dark ? 'sötét' : 'világos'}.`,
  },
  en: {
    modeLabel: 'Theme',
    modes: { light: 'Light', dark: 'Dark', system: 'System' },
    active: (dark) => (dark ? 'Evening mode active' : 'Daylight mode active'),
    kicker: 'Sample article',
    title: 'Comfortable reading at night',
    body: 'In a dark room a bright interface is glaring and tiring for the eyes. A good dark theme doesn’t just paint the page black: it softens contrast, uses warmer colors and retunes the highlights.',
    tokens: 'Active CSS variables',
    saved: 'Your choice is kept after a page refresh (localStorage).',
    system: (dark) => `“System” follows your device setting, which is currently ${dark ? 'dark' : 'light'}.`,
  },
}

const ICONS = {
  light: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
}

function ModeSwitch() {
  const { mode, setMode } = useTheme()
  const t = useText(TEXT)
  return (
    <div className="dm-seg" role="group" aria-label={t.modeLabel}>
      {Object.keys(ICONS).map((key) => (
        <button key={key} type="button" aria-pressed={mode === key} onClick={() => setMode(key)}>
          {ICONS[key]}
          {t.modes[key]}
        </button>
      ))}
    </div>
  )
}

function Demo() {
  const { isDark, mode, systemDark } = useTheme()
  const t = useText(TEXT)
  const vars = THEMES[isDark ? 'dark' : 'light']

  return (
    <div className="dm" data-theme={isDark ? 'dark' : 'light'} style={vars}>
      <div className="dm__toolbar">
        <span className="dm__status">
          <span className="dm__lamp" aria-hidden="true" />
          {t.active(isDark)}
        </span>
        <ModeSwitch />
      </div>

      <article className="dm__article">
        <p className="dm__kicker">{t.kicker}</p>
        <h2>{t.title}</h2>
        <p>{t.body}</p>
      </article>

      <section className="dm__tokens" aria-label={t.tokens}>
        <h3>{t.tokens}</h3>
        <ul>
          {Object.entries(vars).map(([name, value]) => (
            <li key={name}>
              <span className="dm__swatch" style={{ background: value }} />
              <code>{name}</code>
              <span className="dm__value">{value}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="dm__note">
        {t.saved} {mode === 'system' && t.system(systemDark)}
      </p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="dark-mode">
      <ThemeProvider>
        <Demo />
      </ThemeProvider>
    </AppFrame>
  )
}
