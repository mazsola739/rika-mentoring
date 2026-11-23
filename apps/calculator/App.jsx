import { useEffect, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { INITIAL, formatNumber, press } from './calculator.js'
import './app.css'

const TEXT = {
  en: {
    calculator: 'Calculator',
    labels: {
      clear: 'Clear',
      backspace: 'Delete last digit',
      percent: 'Percent',
      '÷': 'Divide',
      '×': 'Multiply',
      '−': 'Subtract',
      '+': 'Add',
      negate: 'Change sign',
      decimal: 'Decimal point',
      equals: 'Equals',
    },
    errors: { divZero: 'Cannot divide by zero', overflow: 'Number too large' },
    history: 'History',
    noHistory: 'Your calculations will show up here.',
    clearHistory: 'Clear history',
    recall: (r) => `Use result ${r}`,
    keys: 'Keyboard: 0–9 , . + − * / Enter % Backspace Esc',
  },
  hu: {
    calculator: 'Számológép',
    labels: {
      clear: 'Törlés',
      backspace: 'Utolsó számjegy törlése',
      percent: 'Százalék',
      '÷': 'Osztás',
      '×': 'Szorzás',
      '−': 'Kivonás',
      '+': 'Összeadás',
      negate: 'Előjelváltás',
      decimal: 'Tizedesvessző',
      equals: 'Egyenlő',
    },
    errors: { divZero: 'Nullával nem lehet osztani', overflow: 'Túl nagy szám' },
    history: 'Előzmények',
    noHistory: 'Itt jelennek meg a számításaid.',
    clearHistory: 'Előzmények törlése',
    recall: (r) => `${r} eredmény használata`,
    keys: 'Billentyűzet: 0–9 , . + − * / Enter % Backspace Esc',
  },
}

const op = (value) => ({ id: value, label: value, action: { type: 'operator', value }, kind: 'op' })
const digit = (value) => ({ id: value, label: value, action: { type: 'digit', value }, kind: 'digit' })

// The keypad is data: one array, rendered by one component.
const KEYS = [
  { id: 'clear', label: 'C', action: { type: 'clear' }, kind: 'fn' },
  { id: 'backspace', label: '⌫', action: { type: 'backspace' }, kind: 'fn' },
  { id: 'percent', label: '%', action: { type: 'percent' }, kind: 'fn' },
  op('÷'),
  digit('7'),
  digit('8'),
  digit('9'),
  op('×'),
  digit('4'),
  digit('5'),
  digit('6'),
  op('−'),
  digit('1'),
  digit('2'),
  digit('3'),
  op('+'),
  { id: 'negate', label: '±', action: { type: 'negate' }, kind: 'fn' },
  digit('0'),
  { id: 'decimal', label: '.', action: { type: 'decimal' }, kind: 'digit' },
  { id: 'equals', label: '=', action: { type: 'equals' }, kind: 'equals' },
]

// Physical keys → the id of the on-screen button.
const KEYBOARD = {
  '+': '+',
  '-': '−',
  '*': '×',
  x: '×',
  X: '×',
  '/': '÷',
  ':': '÷',
  '.': 'decimal',
  ',': 'decimal',
  '%': 'percent',
  Enter: 'equals',
  '=': 'equals',
  Backspace: 'backspace',
  Escape: 'clear',
  Delete: 'clear',
  F9: 'negate',
}

function CalcButton({ item, label, ariaLabel, pressed, flash, onPress }) {
  return (
    <button
      type="button"
      className={`calc-key calc-key--${item.kind}${flash ? ' is-flash' : ''}`}
      aria-label={ariaLabel}
      aria-pressed={item.kind === 'op' ? pressed : undefined}
      onClick={() => onPress(item)}
    >
      {label}
    </button>
  )
}

function Calculator() {
  const lang = useLang()
  const t = useText(TEXT)
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const [state, setState] = useState(INITIAL)
  const [flash, setFlash] = useState(null) // the key that was just typed on the keyboard

  // Functional update: React gives us the latest state, even for fast key presses.
  const run = (item) => setState((s) => press(s, item.action))

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const id = /^[0-9]$/.test(e.key) ? e.key : KEYBOARD[e.key]
      const item = KEYS.find((k) => k.id === id)
      if (!item) return
      // Enter keeps its normal job on links and other buttons (language switch, history…).
      if (e.key === 'Enter' && e.target !== document.body && !e.target.closest('.calc-key')) return
      // Enter would also "click" a focused keypad button, and / opens quick find in Firefox.
      e.preventDefault()
      setState((s) => press(s, item.action))
      setFlash(item.id)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!flash) return
    const timer = setTimeout(() => setFlash(null), 140)
    return () => clearTimeout(timer)
  }, [flash])

  const formatExpression = (text) => text.replace(/-?\d+(\.\d+)?(e[+-]\d+)?/g, (n) => formatNumber(n, locale))
  const shown = state.error ? t.errors[state.error] : formatNumber(state.display, locale)
  const decimalLabel = lang === 'hu' ? ',' : '.'

  return (
    <div className="calc">
      <div className="calc__layout">
        <div className="calc__device" role="group" aria-label={t.calculator}>
          <div className="calc__screen">
            <div className="calc__expression" aria-hidden="true">
              {formatExpression(state.expression) || '\u00a0'}
            </div>
            <output
              className={`calc__display${shown.length > 12 ? ' is-long' : ''}${state.error ? ' is-error' : ''}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {shown}
            </output>
          </div>
          <div className="calc__keys">
            {KEYS.map((item) => (
              <CalcButton
                key={item.id}
                item={item}
                label={item.id === 'decimal' ? decimalLabel : item.label}
                ariaLabel={t.labels[item.id]}
                pressed={state.operator === item.id && state.waiting}
                flash={flash === item.id}
                onPress={run}
              />
            ))}
          </div>
          <p className="calc__hint">{t.keys}</p>
        </div>

        <section className="calc__history" aria-labelledby="calc-history-title">
          <div className="calc__history-head">
            <h3 id="calc-history-title">{t.history}</h3>
            {state.history.length > 0 && (
              <button
                type="button"
                className="btn btn--ghost calc__small"
                onClick={() => setState((s) => press(s, { type: 'clearHistory' }))}
              >
                {t.clearHistory}
              </button>
            )}
          </div>
          {state.history.length === 0 ? (
            <p className="calc__empty">{t.noHistory}</p>
          ) : (
            <ol className="calc__history-list">
              {state.history.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    aria-label={t.recall(formatNumber(entry.result, locale))}
                    onClick={() => setState((s) => press(s, { type: 'recall', value: entry.result }))}
                  >
                    <span className="calc__history-expr">{formatExpression(entry.expression)} =</span>
                    <strong>{formatNumber(entry.result, locale)}</strong>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="calculator">
      <Calculator />
    </AppFrame>
  )
}
