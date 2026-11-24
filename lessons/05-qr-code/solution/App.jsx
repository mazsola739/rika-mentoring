import { useEffect, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'
import { buildPng, download, fileNameFor } from './qr.js'
import { contrastRatio } from './color.js'
import { contactText, wifiText } from './formats.js'
import useQrCode from './useQrCode.js'
import useHistory from './useHistory.js'
import WifiForm from './WifiForm.jsx'
import ContactForm from './ContactForm.jsx'
import History from './History.jsx'
import Scanner from './Scanner.jsx'
import './app.css'

const MODES = ['text', 'wifi', 'contact']
const LEVELS = { L: 7, M: 15, Q: 25, H: 30 }
const LOGOS = ['❤️', '☕', '🎵', '⭐', '🍕']
const START_WIFI = { ssid: '', password: '', security: 'WPA', hidden: false }
const START_CONTACT = { name: '', phone: '', email: '' }

function shorten(s, max = 80) {
  return s.length > max ? `${s.slice(0, max)}…` : s
}

function ModeTabs({ mode, onChange, t }) {
  return (
    <div className="qr__modes" role="group" aria-label={t.modeLabel}>
      {MODES.map((key) => (
        <button
          key={key}
          type="button"
          className="qr__mode"
          aria-pressed={mode === key}
          onClick={() => onChange(key)}
        >
          {t.modes[key]}
        </button>
      ))}
    </div>
  )
}

function ColorPicker({ colors, value, onChange, t }) {
  const isCustom = !colors.includes(value)
  return (
    <fieldset className="qr__group">
      <legend>{t.color}</legend>
      <div className="qr__swatches">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={value === c}
            aria-label={c}
            title={c}
            className="qr__swatch"
            style={{ background: c }}
            onClick={() => onChange(c)}
          />
        ))}
        <label
          className={`qr__custom${isCustom ? ' is-active' : ''}`}
          title={t.custom}
          style={isCustom ? { background: value } : undefined}
        >
          <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} />
          <span className="visually-hidden">{t.custom}</span>
          {!isCustom && <span aria-hidden="true">+</span>}
        </label>
        <code className="qr__hex">{value.toUpperCase()}</code>
      </div>
    </fieldset>
  )
}

// The center logo: none, one of the emojis, or a short text of your own.
function LogoPicker({ logo, onChange, ownText, onOwnTextChange, t }) {
  return (
    <fieldset className="qr__group">
      <legend>{t.logo}</legend>
      <div className="qr__chips">
        <button type="button" className="chip" aria-pressed={logo === ''} onClick={() => onChange('')}>
          {t.logoNone}
        </button>
        {LOGOS.map((item) => (
          <button
            key={item}
            type="button"
            className="chip qr__emoji"
            aria-pressed={logo === item}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
        <button type="button" className="chip" aria-pressed={logo === 'own'} onClick={() => onChange('own')}>
          {t.logoOwn}
        </button>
      </div>
      {logo === 'own' && (
        <label className="field">
          <span>{t.badgeText}</span>
          <input
            className="input qr__badge-input"
            value={ownText}
            maxLength={3}
            onChange={(e) => onOwnTextChange(e.target.value)}
          />
        </label>
      )}
      {logo !== '' && <small className="qr__hint">{t.badgeNote}</small>}
    </fieldset>
  )
}

function QrGenerator() {
  const t = useText(TEXT)
  const { palette } = useLesson()
  const [mode, setMode] = useState('text')
  const [text, setText] = useState('https://react.dev')
  const [wifi, setWifi] = useState(START_WIFI)
  const [contact, setContact] = useState(START_CONTACT)
  const [color, setColor] = useState(palette.solid)
  const [size, setSize] = useState(512)
  const [level, setLevel] = useState('M')
  const [logo, setLogo] = useState('') // '', an emoji, or 'own'
  const [ownText, setOwnText] = useState('RM')
  const [status, setStatus] = useState('')
  const history = useHistory()

  // Derived values: no extra state needed, they are recomputed on every render.
  let value = text.trim()
  if (mode === 'wifi') value = wifi.ssid.trim() ? wifiText(wifi) : ''
  if (mode === 'contact') value = contact.name.trim() ? contactText(contact) : ''
  const badge = logo === 'own' ? ownText.trim().slice(0, 3) : logo
  const effectiveLevel = badge ? 'H' : level
  const swatches = [...new Set(['#111111', palette.solid, palette.dark, ...palette.colors].map((c) => c.toUpperCase()))]
  const lowContrast = contrastRatio(color, '#ffffff') < 3

  const result = useQrCode(value, { color, level: effectiveLevel, size, badge })

  // The download message disappears after a while; the cleanup cancels the old timer.
  useEffect(() => {
    if (!status) return
    const timer = setTimeout(() => setStatus(''), 3000)
    return () => clearTimeout(timer)
  }, [status])

  // A Wi-Fi code holds the password, so it never goes into the file name.
  const base = mode === 'wifi' ? 'qr-wifi' : mode === 'contact' ? 'qr-contact' : fileNameFor(value)
  const ready = value && result?.markup
  const altLabel = mode === 'wifi' ? wifi.ssid.trim() : mode === 'contact' ? contact.name.trim() : shorten(value)

  async function savePng() {
    try {
      const blob = await buildPng(value, { color, level: effectiveLevel, size, badge })
      download(blob, `${base}.png`)
      setStatus(t.started(`${base}.png`))
      history.remember(value)
    } catch {
      setStatus(t.downloadFailed)
    }
  }

  function saveSvg() {
    download(new Blob([result.markup], { type: 'image/svg+xml' }), `${base}.svg`)
    setStatus(t.started(`${base}.svg`))
    history.remember(value)
  }

  // An earlier or scanned text goes back into the text field.
  function openText(item) {
    setMode('text')
    setText(item)
  }

  return (
    <div className="qr">
      <div className="qr__layout">
        <div className="qr__controls">
          <ModeTabs mode={mode} onChange={setMode} t={t} />

          {mode === 'text' && (
            <>
              <label className="field">
                <span>{t.input}</span>
                <textarea
                  className="input qr__text"
                  rows={3}
                  value={text}
                  placeholder={t.placeholder}
                  onChange={(e) => setText(e.target.value)}
                  spellCheck={false}
                />
                <small>{t.chars(value.length)}</small>
              </label>

              <div className="qr__examples">
                <span className="qr__examples-label">{t.examples}</span>
                {t.exampleItems.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    className="chip"
                    aria-pressed={value === ex.value}
                    onClick={() => setText(ex.value)}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {mode === 'wifi' && <WifiForm wifi={wifi} onChange={setWifi} />}
          {mode === 'contact' && <ContactForm contact={contact} onChange={setContact} />}

          <ColorPicker colors={swatches} value={color} onChange={setColor} t={t} />
          {lowContrast && (
            <p className="qr__warn" role="status">
              {t.lowContrast}
            </p>
          )}

          <label className="field">
            <span>
              {t.size}: {t.px(size)}
            </span>
            <input type="range" min="128" max="1024" step="32" value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </label>

          <fieldset className="qr__group">
            <legend>{t.level}</legend>
            <div className="qr__chips">
              {Object.keys(LEVELS).map((key) => (
                <button
                  key={key}
                  type="button"
                  className="chip"
                  aria-pressed={effectiveLevel === key}
                  disabled={Boolean(badge) && key !== 'H'}
                  onClick={() => setLevel(key)}
                >
                  {key} · {t.levels[key]}
                </button>
              ))}
            </div>
            <small className="qr__hint">{t.levelHint(LEVELS[effectiveLevel])}</small>
          </fieldset>

          <LogoPicker logo={logo} onChange={setLogo} ownText={ownText} onOwnTextChange={setOwnText} t={t} />
        </div>

        <section className="qr__preview" aria-label={t.preview}>
          <div className="qr__stage">
            {!value ? (
              <p className="qr__empty">{t.empty[mode]}</p>
            ) : result?.error ? (
              <p className="qr__error" role="alert">
                {t[result.error]}
              </p>
            ) : result ? (
              <img
                className="qr__image"
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.markup)}`}
                alt={t.alt[mode](altLabel)}
              />
            ) : null}
          </div>

          {ready && <p className="qr__meta">{t.meta(result.version, result.modules)}</p>}

          <div className="qr__actions">
            <button type="button" className="btn" onClick={savePng} disabled={!ready}>
              {t.png}
            </button>
            <button type="button" className="btn btn--ghost" onClick={saveSvg} disabled={!ready}>
              {t.svg}
            </button>
          </div>
          <p className="qr__status" role="status" aria-live="polite">
            {status}
          </p>
        </section>
      </div>

      <div className="qr__extras">
        <History items={history.items} onPick={openText} onClear={history.clear} />
        <Scanner onResult={openText} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="qr-code">
      <QrGenerator />
    </AppFrame>
  )
}
