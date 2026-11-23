import { useEffect, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import LevelMeter from '@shared/ui/LevelMeter.jsx'
import { useText } from '@shared/i18n.js'
import { generatePassword, strength } from './generator.js'
import './app.css'

const TEXT = {
  hu: {
    output: 'Generált jelszó',
    copy: 'Másolás',
    copied: 'Másolva',
    copyFailed: 'Nem sikerült másolni',
    regenerate: 'Új jelszó',
    length: 'Hossz',
    chars: 'karakter',
    sets: 'Karakterkészletek',
    lastOne: 'Legalább egy készletnek bekapcsolva kell maradnia.',
    options: { lower: 'Kisbetűk (a–z)', upper: 'Nagybetűk (A–Z)', digits: 'Számjegyek (0–9)', symbols: 'Speciális (!@#…)' },
    strength: 'Erősség',
    levels: ['Gyenge', 'Közepes', 'Erős', 'Nagyon erős'],
    bits: (b) => `kb. ${b} bit entrópia`,
    note: 'A jelszó a böngésződben készül a crypto.getRandomValues() segítségével, és sehova nem kerül elküldésre.',
  },
  en: {
    output: 'Generated password',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    regenerate: 'New password',
    length: 'Length',
    chars: 'characters',
    sets: 'Character sets',
    lastOne: 'At least one set has to stay enabled.',
    options: { lower: 'Lowercase (a–z)', upper: 'Uppercase (A–Z)', digits: 'Digits (0–9)', symbols: 'Symbols (!@#…)' },
    strength: 'Strength',
    levels: ['Weak', 'Fair', 'Strong', 'Very strong'],
    bits: (b) => `about ${b} bits of entropy`,
    note: 'The password is generated in your browser with crypto.getRandomValues() and is never sent anywhere.',
  },
}

const DEFAULT_OPTIONS = { lower: true, upper: true, digits: true, symbols: false }

function PasswordGenerator() {
  const t = useText(TEXT)
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const [password, setPassword] = useState(() => generatePassword(16, DEFAULT_OPTIONS))
  const [copyState, setCopyState] = useState('idle') // 'idle' | 'copied' | 'failed'

  // A „Másolva” felirat 1,6 mp után visszaáll. A cleanup törli az időzítőt, ha közben újra kattintasz.
  useEffect(() => {
    if (copyState === 'idle') return
    const timer = setTimeout(() => setCopyState('idle'), 1600)
    return () => clearTimeout(timer)
  }, [copyState])

  const regenerate = (nextLength = length, nextOptions = options) => {
    setPassword(generatePassword(nextLength, nextOptions))
  }

  const changeLength = (value) => {
    setLength(value)
    regenerate(value, options)
  }

  const toggle = (key) => {
    const next = { ...options, [key]: !options[key] }
    if (!Object.values(next).some(Boolean)) return
    setOptions(next)
    regenerate(length, next)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  const { bits, level } = strength(length, options)
  const enabledCount = Object.values(options).filter(Boolean).length

  return (
    <div className="pw">
      <div className="pw__output solid">
        <span className="pw__label">{t.output}</span>
        <output className="pw__value" aria-live="polite">
          {password}
        </output>
        <div className="pw__actions">
          <button type="button" className="btn pw__copy" onClick={copy}>
            {copyState === 'copied' ? t.copied : copyState === 'failed' ? t.copyFailed : t.copy}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => regenerate()}>
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
        <label className="field pw__length">
          <span>
            {t.length}: {length} {t.chars}
          </span>
          <input type="range" min="6" max="40" value={length} onChange={(e) => changeLength(Number(e.target.value))} />
        </label>

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
      </div>

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
