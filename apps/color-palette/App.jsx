import { useCallback, useEffect, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { HARMONY_KEYS, contrast, generatePalette, rating, readableInk } from './color.js'
import './app.css'

const TEXT = {
  en: {
    generate: 'New palette',
    spaceHint: 'or press Space',
    harmony: 'Harmony',
    harmonies: { random: 'Random', analogous: 'Analogous', complementary: 'Complementary', monochrome: 'Monochrome' },
    lock: (hex) => `Lock ${hex}`,
    unlock: (hex) => `Unlock ${hex}`,
    copyHex: (hex) => `Copy ${hex}`,
    copied: 'Copied!',
    copiedMsg: (text) => `Copied: ${text}`,
    copyFailed: 'Copying is not allowed in this browser.',
    locked: 'Locked',
    contrastTitle: (ratio) => `Contrast of the label: ${ratio}:1`,
    save: 'Save to favorites',
    saved: 'Saved',
    copyCss: 'Copy as CSS variables',
    favorites: 'Favorites',
    noFavorites: 'No saved palettes yet. Find one you like and press “Save to favorites”.',
    load: (hexes) => `Use palette ${hexes}`,
    remove: 'Remove',
    removeLabel: (hexes) => `Remove palette ${hexes}`,
  },
  hu: {
    generate: 'Új paletta',
    spaceHint: 'vagy nyomd meg a szóközt',
    harmony: 'Harmónia',
    harmonies: { random: 'Véletlen', analogous: 'Analóg', complementary: 'Komplementer', monochrome: 'Monokróm' },
    lock: (hex) => `${hex} zárolása`,
    unlock: (hex) => `${hex} feloldása`,
    copyHex: (hex) => `${hex} másolása`,
    copied: 'Másolva!',
    copiedMsg: (text) => `Vágólapra másolva: ${text}`,
    copyFailed: 'Ebben a böngészőben nem engedélyezett a másolás.',
    locked: 'Zárolva',
    contrastTitle: (ratio) => `A felirat kontrasztja: ${ratio}:1`,
    save: 'Mentés a kedvencekhez',
    saved: 'Elmentve',
    copyCss: 'Másolás CSS-változóként',
    favorites: 'Kedvencek',
    noFavorites: 'Még nincs mentett paletta. Ha találsz egy tetszőt, nyomd meg a „Mentés a kedvencekhez” gombot.',
    load: (hexes) => `${hexes} paletta betöltése`,
    remove: 'Törlés',
    removeLabel: (hexes) => `${hexes} paletta törlése`,
  },
}

// Shortcuts work on the page itself and inside this app, but never while typing in a field
// and never on controls of the surrounding page (e.g. the language switch).
const ownsShortcut = (el) =>
  el === document.body || (Boolean(el.closest?.('.cp')) && !el.closest('input, textarea, select, [contenteditable="true"]'))

function LockIcon({ locked }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="cp-icon">
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d={locked ? 'M8 11V8a4 4 0 0 1 8 0v3' : 'M8 11V8a4 4 0 0 1 7.6-1.7'} />
    </svg>
  )
}

function Swatch({ color, copied, onCopy, onToggleLock, t }) {
  const ink = readableInk(color.hex)
  const ratio = contrast(color.hex, ink)
  const level = rating(ratio)
  return (
    <li className={`cp-swatch${color.locked ? ' is-locked' : ''}`} style={{ background: color.hex, color: ink }}>
      <button
        type="button"
        className="cp-swatch__lock"
        aria-pressed={color.locked}
        aria-label={color.locked ? t.unlock(color.hex) : t.lock(color.hex)}
        title={color.locked ? t.unlock(color.hex) : t.lock(color.hex)}
        onClick={onToggleLock}
      >
        <LockIcon locked={color.locked} />
      </button>
      <div className="cp-swatch__info">
        <button type="button" className="cp-swatch__hex" onClick={onCopy} aria-label={t.copyHex(color.hex)}>
          {copied ? t.copied : color.hex}
        </button>
        <span className="cp-swatch__meta" title={t.contrastTitle(ratio.toFixed(1))}>
          {level && `${level} · `}
          {ratio.toFixed(1)}:1
        </span>
      </div>
    </li>
  )
}

function ColorPalette() {
  const t = useText(TEXT)
  const { palette } = useLesson()
  const [colors, setColors] = useLocalStorage('rika:color-palette:current', () =>
    palette.colors.slice(0, 5).map((hex) => ({ hex: hex.toUpperCase(), locked: false })),
  )
  const [favorites, setFavorites] = useLocalStorage('rika:color-palette:favorites', [])
  const [mode, setMode] = useLocalStorage('rika:color-palette:mode', 'random')
  const [copied, setCopied] = useState(null) // index of the swatch, or 'css'
  const [message, setMessage] = useState('')

  const harmony = HARMONY_KEYS.includes(mode) ? mode : 'random'
  const hexes = colors.map((c) => c.hex)
  const isSaved = favorites.some((f) => f.colors.join() === hexes.join())

  // useCallback keeps the same function between renders, so the keyboard effect
  // below only re-subscribes when the harmony mode changes.
  const generate = useCallback(() => setColors((current) => generatePalette(current, harmony)), [harmony, setColors])

  // Arrays in state are never changed in place: map() builds a new array with one new object.
  const toggleLock = (index) => setColors((current) => current.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c)))

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== 'Space' || !ownsShortcut(e.target) || e.ctrlKey || e.metaKey || e.altKey) return
      e.preventDefault() // no page scroll and no "click" on a focused button
      if (!e.repeat) generate()
    }
    const onKeyUp = (e) => {
      if (e.code === 'Space' && ownsShortcut(e.target)) e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [generate])

  // The "Copied!" feedback goes away by itself; the cleanup cancels a pending timer.
  useEffect(() => {
    if (copied === null) return
    const timer = setTimeout(() => setCopied(null), 1400)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setMessage(t.copiedMsg(text.length > 9 ? 'CSS' : text))
    } catch {
      setMessage(t.copyFailed)
    }
  }

  const cssVariables = `:root {\n${hexes.map((hex, i) => `  --color-${i + 1}: ${hex};`).join('\n')}\n}`

  const save = () => {
    if (isSaved) return
    setFavorites((list) => [{ id: crypto.randomUUID(), colors: hexes }, ...list].slice(0, 12))
  }

  return (
    <div className="cp">
      <div className="cp-bar">
        <div className="cp-bar__main">
          <button type="button" className="btn" onClick={generate}>
            {t.generate}
          </button>
          <span className="cp-hint">
            <kbd>Space</kbd> {t.spaceHint}
          </span>
        </div>
        <div className="cp-harmony" role="group" aria-label={t.harmony}>
          <span className="cp-label">{t.harmony}</span>
          {HARMONY_KEYS.map((key) => (
            <button key={key} type="button" className="chip" aria-pressed={harmony === key} onClick={() => setMode(key)}>
              {t.harmonies[key]}
            </button>
          ))}
        </div>
      </div>

      {/* The five slots never move, so the index is a stable key here. */}
      <ul className="cp-swatches">
        {colors.map((color, i) => (
          <Swatch
            key={i}
            color={color}
            copied={copied === i}
            onCopy={() => copy(color.hex, i)}
            onToggleLock={() => toggleLock(i)}
            t={t}
          />
        ))}
      </ul>

      <div className="cp-actions">
        <button type="button" className="btn btn--ghost" onClick={save} disabled={isSaved}>
          {isSaved ? `✓ ${t.saved}` : t.save}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => copy(cssVariables, 'css')}>
          {copied === 'css' ? t.copied : t.copyCss}
        </button>
        <p className="visually-hidden" role="status" aria-live="polite">
          {message}
        </p>
      </div>

      <section className="cp-favs" aria-labelledby="cp-favs-title">
        <h3 id="cp-favs-title">
          {t.favorites} <span className="cp-favs__count">{favorites.length}</span>
        </h3>
        {favorites.length === 0 ? (
          <p className="cp-empty">{t.noFavorites}</p>
        ) : (
          <ul className="cp-favs__list">
            {favorites.map((fav) => {
              const list = fav.colors.join(', ')
              return (
                <li key={fav.id} className="cp-fav">
                  <button
                    type="button"
                    className="cp-fav__strip"
                    aria-label={t.load(list)}
                    title={list}
                    onClick={() => setColors(fav.colors.map((hex) => ({ hex, locked: false })))}
                  >
                    {fav.colors.map((hex, i) => (
                      <span key={i} style={{ background: hex }} />
                    ))}
                  </button>
                  <button
                    type="button"
                    className="cp-fav__remove"
                    aria-label={t.removeLabel(list)}
                    title={t.remove}
                    onClick={() => setFavorites((all) => all.filter((f) => f.id !== fav.id))}
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="color-palette">
      <ColorPalette />
    </AppFrame>
  )
}
