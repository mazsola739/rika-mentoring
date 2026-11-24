import { useRef, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { formatNumber, toText } from './calculator.js'
import { evaluate } from './parser.js'

const TEXT = {
  en: {
    title: 'Formula',
    label: 'Type a formula, for example (2 + 3) * 4',
    shortcuts: 'Insert a symbol',
    names: {
      open: 'Opening parenthesis',
      close: 'Closing parenthesis',
      power: 'Power',
      sqrt: 'Square root',
      sin: 'Sine',
      cos: 'Cosine',
      tan: 'Tangent',
      log: 'Base-10 logarithm',
      pi: 'Pi',
    },
    errors: {
      unknown: (symbol) => `Unknown character: ${symbol}`,
      unknownName: (name) => `Unknown name: ${name}`,
      unexpected: (symbol) => `Unexpected symbol: ${symbol}`,
      missing: (symbol) => `Missing ${symbol}`,
      incomplete: 'The formula is incomplete',
      divZero: 'Cannot divide by zero',
      cannot: 'I cannot calculate this',
    },
    hint: 'Multiplication comes before addition here: 2 + 3 * 4 is 14. Angles are in degrees.',
  },
  hu: {
    title: 'Képlet',
    label: 'Írj be egy képletet, például (2 + 3) * 4',
    shortcuts: 'Jel beszúrása',
    names: {
      open: 'Nyitó zárójel',
      close: 'Záró zárójel',
      power: 'Hatvány',
      sqrt: 'Négyzetgyök',
      sin: 'Szinusz',
      cos: 'Koszinusz',
      tan: 'Tangens',
      log: 'Tízes alapú logaritmus',
      pi: 'Pí',
    },
    errors: {
      unknown: (symbol) => `Ismeretlen jel: ${symbol}`,
      unknownName: (name) => `Ismeretlen név: ${name}`,
      unexpected: (symbol) => `Váratlan jel: ${symbol}`,
      missing: (symbol) => `Hiányzik egy ${symbol}`,
      incomplete: 'A képlet hiányos',
      divZero: 'Nullával nem lehet osztani',
      cannot: 'Ezt nem tudom kiszámolni',
    },
    hint: 'Itt a szorzás előbb jön, mint az összeadás: a 2 + 3 * 4 eredménye 14. A szögek fokban értendők.',
  },
}

// Buttons for symbols that are hard to type on a phone: what they show, and what they add to the formula.
const SHORTCUTS = [
  { id: 'open', label: '(', insert: '(' },
  { id: 'close', label: ')', insert: ')' },
  { id: 'power', label: 'xʸ', insert: '^' },
  { id: 'sqrt', label: '√', insert: 'sqrt(' },
  { id: 'sin', label: 'sin', insert: 'sin(' },
  { id: 'cos', label: 'cos', insert: 'cos(' },
  { id: 'tan', label: 'tan', insert: 'tan(' },
  { id: 'log', label: 'log', insert: 'log(' },
  { id: 'pi', label: 'π', insert: 'pi' },
]

function FormulaBar() {
  const lang = useLang()
  const t = useText(TEXT)
  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const [text, setText] = useState('')
  // React puts the input element here, so a shortcut button can give the focus back to it.
  const inputRef = useRef(null)

  function insert(part) {
    setText((current) => current + part)
    inputRef.current?.focus()
  }

  // The result is derived from the text: worked out on every render, never stored.
  let message = ''
  let failed = false
  if (text.trim() !== '') {
    try {
      message = `= ${formatNumber(toText(evaluate(text)), locale)}`
    } catch (error) {
      const describe = t.errors[error.code] ?? t.errors.cannot
      message = typeof describe === 'function' ? describe(error.detail) : describe
      failed = true
    }
  }

  return (
    <section className="calc__formula" aria-labelledby="calc-formula-title">
      <h3 id="calc-formula-title">{t.title}</h3>
      <label className="field">
        <span>{t.label}</span>
        <input
          ref={inputRef}
          className="input calc__formula-input"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="done"
        />
      </label>
      <div className="calc__shortcuts" role="group" aria-label={t.shortcuts}>
        {SHORTCUTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip calc__chip"
            aria-label={t.names[item.id]}
            title={t.names[item.id]}
            onClick={() => insert(item.insert)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className={`calc__formula-result${failed ? ' is-error' : ''}`} role="status">
        {message}
      </p>
      <p className="calc__formula-hint">{t.hint}</p>
    </section>
  )
}

export default FormulaBar
