import { useEffect, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { buildPng, buildSvg, download, fileNameFor, isTooLong } from './qr.js'
import { contrastRatio } from './color.js'
import './app.css'

const LEVELS = { L: 7, M: 15, Q: 25, H: 30 }

const TEXT = {
  en: {
    input: 'Text or link',
    placeholder: 'https://example.com or any text',
    examples: 'Try',
    exampleItems: [
      { label: 'Link', value: 'https://react.dev' },
      { label: 'Email', value: 'mailto:hello@example.com' },
      { label: 'Text', value: 'Hello from my first React app!' },
    ],
    chars: (n) => `${n} characters`,
    color: 'Color',
    custom: 'Custom color',
    lowContrast: 'Low contrast: scanners may not read this color on a white background.',
    size: 'PNG size',
    px: (n) => `${n} × ${n} px`,
    level: 'Error correction',
    levels: { L: 'Low', M: 'Medium', Q: 'Strong', H: 'Maximum' },
    levelHint: (p) => `About ${p}% of the code can be damaged or covered and it still scans.`,
    badge: 'Logo in the center',
    badgeText: 'Logo text (max. 3 characters)',
    badgeNote: 'A logo covers part of the code, so maximum error correction is switched on.',
    preview: 'Preview',
    empty: 'Type some text or paste a link and your QR code appears here.',
    tooLong: 'This text is too long for a QR code. Shorten it or choose a lower error correction.',
    failed: 'The QR code could not be generated.',
    meta: (v, m) => `Version ${v} · ${m} × ${m} modules`,
    png: 'Download PNG',
    svg: 'Download SVG',
    started: (file) => `Download started: ${file}`,
    downloadFailed: 'The download failed. Please try again.',
    alt: (v) => `QR code for: ${v}`,
  },
  hu: {
    input: 'Szöveg vagy link',
    placeholder: 'https://pelda.hu vagy bármilyen szöveg',
    examples: 'Példák',
    exampleItems: [
      { label: 'Link', value: 'https://react.dev' },
      { label: 'E-mail', value: 'mailto:hello@example.com' },
      { label: 'Szöveg', value: 'Üdv az első React-appomból!' },
    ],
    chars: (n) => `${n} karakter`,
    color: 'Szín',
    custom: 'Egyéni szín',
    lowContrast: 'Alacsony kontraszt: ezt a színt fehér háttéren a szkennerek nehezen olvassák.',
    size: 'PNG mérete',
    px: (n) => `${n} × ${n} px`,
    level: 'Hibajavítás',
    levels: { L: 'Alacsony', M: 'Közepes', Q: 'Erős', H: 'Maximális' },
    levelHint: (p) => `A kód kb. ${p}%-a sérülhet vagy takarható ki úgy, hogy még beolvasható maradjon.`,
    badge: 'Logó középen',
    badgeText: 'Logó szövege (max. 3 karakter)',
    badgeNote: 'A logó kitakarja a kód egy részét, ezért a maximális hibajavítás kapcsol be.',
    preview: 'Előnézet',
    empty: 'Írj be egy szöveget vagy illessz be egy linket, és itt megjelenik a QR-kód.',
    tooLong: 'Ez a szöveg túl hosszú egy QR-kódhoz. Rövidítsd, vagy válassz gyengébb hibajavítást.',
    failed: 'Nem sikerült elkészíteni a QR-kódot.',
    meta: (v, m) => `${v}. verzió · ${m} × ${m} modul`,
    png: 'PNG letöltése',
    svg: 'SVG letöltése',
    started: (file) => `Elindult a letöltés: ${file}`,
    downloadFailed: 'A letöltés nem sikerült. Próbáld újra!',
    alt: (v) => `QR-kód ehhez: ${v}`,
  },
}

const shorten = (s, max = 80) => (s.length > max ? `${s.slice(0, max)}…` : s)

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

function QrGenerator() {
  const t = useText(TEXT)
  const { palette } = useLesson()
  const [text, setText] = useState('https://react.dev')
  const [color, setColor] = useState(palette.solid)
  const [size, setSize] = useState(512)
  const [level, setLevel] = useState('M')
  const [badgeOn, setBadgeOn] = useState(false)
  const [badgeText, setBadgeText] = useState('RM')
  const [result, setResult] = useState(null) // { markup, version, modules } or { error }
  const [status, setStatus] = useState('')

  const value = text.trim()
  // Derived values: no extra state needed, they are recomputed on every render.
  const effectiveLevel = badgeOn ? 'H' : level
  const badge = badgeOn ? badgeText.trim().slice(0, 3) : ''
  const swatches = [...new Set(['#111111', palette.solid, palette.dark, ...palette.colors].map((c) => c.toUpperCase()))]
  const lowContrast = contrastRatio(color, '#ffffff') < 3

  // The library works asynchronously. `ignore` drops answers that arrive after the input changed again.
  useEffect(() => {
    if (!value) return
    let ignore = false
    buildSvg(value, { color, level: effectiveLevel, size, badge })
      .then((qr) => !ignore && setResult(qr))
      .catch((error) => !ignore && setResult({ error: isTooLong(error) ? 'tooLong' : 'failed' }))
    return () => {
      ignore = true
    }
  }, [value, color, effectiveLevel, size, badge])

  // The download message disappears after a while; the cleanup cancels the old timer.
  useEffect(() => {
    if (!status) return
    const timer = setTimeout(() => setStatus(''), 3000)
    return () => clearTimeout(timer)
  }, [status])

  const base = fileNameFor(value)
  const ready = value && result?.markup

  const savePng = async () => {
    try {
      const blob = await buildPng(value, { color, level: effectiveLevel, size, badge })
      download(blob, `${base}.png`)
      setStatus(t.started(`${base}.png`))
    } catch {
      setStatus(t.downloadFailed)
    }
  }

  const saveSvg = () => {
    download(new Blob([result.markup], { type: 'image/svg+xml' }), `${base}.svg`)
    setStatus(t.started(`${base}.svg`))
  }

  return (
    <div className="qr">
      <div className="qr__layout">
        <div className="qr__controls">
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
            <div className="qr__levels">
              {Object.keys(LEVELS).map((key) => (
                <button
                  key={key}
                  type="button"
                  className="chip"
                  aria-pressed={effectiveLevel === key}
                  disabled={badgeOn && key !== 'H'}
                  onClick={() => setLevel(key)}
                >
                  {key} · {t.levels[key]}
                </button>
              ))}
            </div>
            <small className="qr__hint">{t.levelHint(LEVELS[effectiveLevel])}</small>
          </fieldset>

          <div className="qr__badge">
            <label className="qr__check">
              <input type="checkbox" checked={badgeOn} onChange={(e) => setBadgeOn(e.target.checked)} />
              {t.badge}
            </label>
            {badgeOn && (
              <>
                <label className="field">
                  <span>{t.badgeText}</span>
                  <input
                    className="input qr__badge-input"
                    value={badgeText}
                    maxLength={3}
                    onChange={(e) => setBadgeText(e.target.value)}
                  />
                </label>
                <small className="qr__hint">{t.badgeNote}</small>
              </>
            )}
          </div>
        </div>

        <section className="qr__preview" aria-label={t.preview}>
          <div className="qr__stage">
            {!value ? (
              <p className="qr__empty">{t.empty}</p>
            ) : result?.error ? (
              <p className="qr__error" role="alert">
                {t[result.error]}
              </p>
            ) : result ? (
              <img
                className="qr__image"
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.markup)}`}
                alt={t.alt(shorten(value))}
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
