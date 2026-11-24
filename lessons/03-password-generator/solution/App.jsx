import { useEffect, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import LevelMeter from '@shared/ui/LevelMeter.jsx'
import { useText } from '@shared/i18n.js'
import { entropy, generatePassword, generatePronounceable, pronounceableEntropy, strengthLevel } from './generator.js'
import { isCommonPassword } from './breach.js'
import './app.css'

const TEXT = {
  hu: {
    output: 'Generált jelszó',
    copy: 'Másolás',
    copied: 'Másolva!',
    copyFailed: 'Nem sikerült',
    regenerate: 'Új jelszó',
    mode: 'A jelszó fajtája',
    modes: { random: 'Véletlen karakterek', pronounceable: 'Kiejthető' },
    length: 'Hossz',
    chars: 'karakter',
    sets: 'Felhasznált karakterek',
    lastOne: 'Legalább egy készletnek bekapcsolva kell maradnia.',
    options: { lower: 'Kisbetűk (a–z)', upper: 'Nagybetűk (A–Z)', digits: 'Számjegyek (0–9)', symbols: 'Szimbólumok (!@#…)' },
    strength: 'Erősség',
    levels: ['Gyenge', 'Közepes', 'Erős', 'Nagyon erős'],
    bits: (b) => `kb. ${b} bit entrópia`,
    breachTitle: 'Rajta van a jelszavad a listán?',
    breachLabel: 'Írj be egy jelszót az ellenőrzéshez',
    breachBad: 'Ez a jelszó rajta van a gyakori, kiszivárgott jelszavak listáján. Soha ne használd!',
    breachOk: 'Nincs rajta a listánkon. Ettől még nem biztos, hogy erős: a lista rövid.',
    note: 'A jelszó a böngésződben készül a crypto.getRandomValues() segítségével, és sehova nem kerül elküldésre.',
  },
  en: {
    output: 'Generated password',
    copy: 'Copy',
    copied: 'Copied!',
    copyFailed: 'Copy failed',
    regenerate: 'New password',
    mode: 'Kind of password',
    modes: { random: 'Random characters', pronounceable: 'Pronounceable' },
    length: 'Length',
    chars: 'characters',
    sets: 'Characters to use',
    lastOne: 'At least one set has to stay enabled.',
    options: { lower: 'Lowercase (a–z)', upper: 'Uppercase (A–Z)', digits: 'Digits (0–9)', symbols: 'Symbols (!@#…)' },
    strength: 'Strength',
    levels: ['Weak', 'Fair', 'Strong', 'Very strong'],
    bits: (b) => `about ${b} bits of entropy`,
    breachTitle: 'Is your password on the list?',
    breachLabel: 'Type a password to check it',
    breachBad: 'This password is on the list of common leaked passwords. Never use it!',
    breachOk: 'Not on our list. That alone does not make it strong: the list is short.',
    note: 'The password is generated in your browser with crypto.getRandomValues() and is never sent anywhere.',
  },
}

const DEFAULT_OPTIONS = { lower: true, upper: true, digits: true, symbols: false }

// The one place that knows how to make a password from the three settings.
function makePassword(length, options, mode) {
  if (mode === 'pronounceable') return generatePronounceable(length)
  return generatePassword(length, options)
}

// Rendered with key={password}: a new password gives a fresh button, so "Copied!" never lingers.
function CopyButton({ text }) {
  const t = useText(TEXT)
  const [copyState, setCopyState] = useState('idle') // 'idle' | 'copied' | 'failed'

  // "Copied!" turns back after 1.5 s; the cleanup clears the timer if the state changes first.
  useEffect(() => {
    if (copyState === 'idle') return
    const timer = setTimeout(() => setCopyState('idle'), 1500)
    return () => clearTimeout(timer)
  }, [copyState])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <button type="button" className="btn pw__copy" onClick={copy}>
      {copyState === 'copied' ? t.copied : copyState === 'failed' ? t.copyFailed : t.copy}
    </button>
  )
}

// A controlled text field, checked against a short local list while you type.
function BreachCheck() {
  const t = useText(TEXT)
  const [value, setValue] = useState('')
  const found = isCommonPassword(value)

  let message = ''
  if (value !== '') message = found ? t.breachBad : t.breachOk

  return (
    <section className="pw__breach">
      <h2>{t.breachTitle}</h2>
      <label className="field">
        <span>{t.breachLabel}</span>
        <input
          className="input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <p className={found ? 'pw__breach-result is-bad' : 'pw__breach-result'} role="status">
        {message}
      </p>
    </section>
  )
}

function PasswordGenerator() {
  const t = useText(TEXT)
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const [mode, setMode] = useState('random') // 'random' | 'pronounceable'
  const [password, setPassword] = useState(() => makePassword(16, DEFAULT_OPTIONS, 'random'))

  const regenerate = () => {
    setPassword(makePassword(length, options, mode))
  }

  const changeLength = (value) => {
    setLength(value)
    setPassword(makePassword(value, options, mode))
  }

  const toggle = (key) => {
    const next = { ...options, [key]: !options[key] }
    if (!Object.values(next).some(Boolean)) return
    setOptions(next)
    setPassword(makePassword(length, next, mode))
  }

  const changeMode = (next) => {
    setMode(next)
    setPassword(makePassword(length, options, next))
  }

  // Derived values: calculated at every drawing, never stored in state.
  const bits = mode === 'pronounceable' ? pronounceableEntropy(length) : entropy(length, options)
  const level = strengthLevel(bits)
  const enabledCount = Object.values(options).filter(Boolean).length

  return (
    <div className="pw">
      <div className="pw__output solid">
        <span className="pw__label">{t.output}</span>
        <output className="pw__value" aria-live="polite">
          {password}
        </output>
        <div className="pw__actions">
          <CopyButton key={password} text={password} />
          <button type="button" className="btn btn--ghost" onClick={regenerate}>
            {t.regenerate}
          </button>
        </div>
      </div>

      <div className="pw__strength">
        <span className="pw__strength-label">{t.strength}</span>
        <LevelMeter value={level + 1} max={4} label={t.levels[level]} className="pw__meter" />
        <strong>{t.levels[level]}</strong>
        <span className="pw__bits">{t.bits(bits)}</span>
      </div>

      <div className="pw__settings">
        <div className="pw__column">
          <fieldset className="pw__sets">
            <legend>{t.mode}</legend>
            {Object.entries(t.modes).map(([key, label]) => (
              <label key={key} className="pw__check">
                <input
                  type="radio"
                  name="pw-mode"
                  value={key}
                  checked={mode === key}
                  onChange={() => changeMode(key)}
                />
                {label}
              </label>
            ))}
          </fieldset>

          <label className="field pw__length">
            <span>
              {t.length}: {length} {t.chars}
            </span>
            <input type="range" min="6" max="40" value={length} onChange={(e) => changeLength(Number(e.target.value))} />
          </label>
        </div>

        {/* Conditional rendering: the character sets mean nothing for pronounceable passwords. */}
        {mode === 'random' && (
          <fieldset className="pw__sets">
            <legend>{t.sets}</legend>
            {Object.entries(t.options).map(([key, label]) => (
              <label key={key} className="pw__check">
                <input
                  type="checkbox"
                  checked={options[key]}
                  disabled={options[key] && enabledCount === 1}
                  title={options[key] && enabledCount === 1 ? t.lastOne : undefined}
                  onChange={() => toggle(key)}
                />
                {label}
              </label>
            ))}
          </fieldset>
        )}
      </div>

      <BreachCheck />

      <p className="pw__note">{t.note}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="password-generator">
      <PasswordGenerator />
    </AppFrame>
  )
}
