import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { MODES, PASSAGES, textFor } from './passages.js'
import { computeStats, formatClock, initialState, typingReducer } from './typingReducer.js'
import { isBetter, useBestResults } from './useBestResults.js'
import { useNow } from './useNow.js'
import Passage from './Passage.jsx'
import './app.css'

const TEXT = {
  en: {
    intro: 'Pick a mode and a passage, then start typing. The clock starts with your first key; press Esc to start over.',
    mode: 'Mode',
    modes: { time30: '30 seconds', time60: '60 seconds', passage: 'Full passage' },
    passage: 'Passage',
    wpm: 'WPM',
    wpmLong: 'words per minute',
    accuracy: 'Accuracy',
    cpm: 'Characters / min',
    timeLeft: 'Time left',
    time: 'Time',
    best: 'Best',
    noBest: 'No result yet',
    bestValue: (wpm, acc) => `${wpm} WPM · ${acc}%`,
    inputLabel: 'Type the passage here',
    hintIdle: 'Click the text and start typing.',
    hintTyping: 'Mistakes stay red until you fix them with Backspace.',
    hintDone: 'Press Esc or use the buttons below for another round.',
    restart: 'Restart',
    result: 'Your result',
    correct: 'Correct characters',
    mistakes: 'Mistakes',
    newBest: 'New personal best in this mode.',
    bestLine: (text) => `Your best in this mode: ${text}.`,
    again: 'Try again',
    next: 'Next passage',
    announce: (wpm, acc) => `Finished: ${wpm} words per minute, ${acc}% accuracy.`,
  },
  hu: {
    intro: 'Válassz módot és szöveget, aztán kezdj el gépelni. Az óra az első leütéssel indul, az Esc gombbal újrakezdheted.',
    mode: 'Mód',
    modes: { time30: '30 másodperc', time60: '60 másodperc', passage: 'Teljes szöveg' },
    passage: 'Szöveg',
    wpm: 'Szó/perc',
    wpmLong: 'szó percenként',
    accuracy: 'Pontosság',
    cpm: 'Karakter/perc',
    timeLeft: 'Hátralévő idő',
    time: 'Idő',
    best: 'Legjobb',
    noBest: 'Még nincs eredmény',
    bestValue: (wpm, acc) => `${wpm} szó/perc · ${acc}%`,
    inputLabel: 'Ide gépeld a szöveget',
    hintIdle: 'Kattints a szövegre, és kezdj el gépelni.',
    hintTyping: 'A hibás betű piros marad, amíg Backspace-szel ki nem javítod.',
    hintDone: 'Új körhöz nyomd meg az Esc gombot, vagy használd a lenti gombokat.',
    restart: 'Újrakezdés',
    result: 'Az eredményed',
    correct: 'Helyes karakterek',
    mistakes: 'Hibák',
    newBest: 'Új egyéni csúcs ebben a módban.',
    bestLine: (text) => `A legjobb eredményed ebben a módban: ${text}.`,
    again: 'Újra',
    next: 'Következő szöveg',
    announce: (wpm, acc) => `Kész: ${wpm} szó percenként, ${acc}% pontosság.`,
  },
}

const NAV_KEYS = new Set(['Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'])

// Only this component ticks while the clock runs, so the long passage is not re-rendered five times a second.
function LiveStats({ state, correct, limit, total, best, t }) {
  const { startedAt, endedAt, keystrokes, errors, typed } = state
  const running = startedAt != null && endedAt == null
  const now = useNow(running)
  const elapsed = startedAt == null ? 0 : Math.max(0, (endedAt ?? now) - startedAt)
  const { wpm, accuracy } = computeStats({ correct, keystrokes, errors }, elapsed)
  const progress = limit ? elapsed / limit : typed.length / total

  return (
    <div className="tt-live">
      <dl className="tt-stats">
        <div>
          <dt>{t.wpm}</dt>
          <dd>{wpm}</dd>
        </div>
        <div>
          <dt>{t.accuracy}</dt>
          <dd>{accuracy}%</dd>
        </div>
        <div>
          <dt>{limit ? t.timeLeft : t.time}</dt>
          <dd>{limit ? formatClock(limit - elapsed) : formatClock(elapsed, Math.floor)}</dd>
        </div>
        <div className="tt-stats__best">
          <dt>{t.best}</dt>
          <dd>{best ? t.bestValue(best.wpm, best.accuracy) : t.noBest}</dd>
        </div>
      </dl>
      <div className="tt-progress" aria-hidden="true">
        <span style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
    </div>
  )
}

function Result({ result, newBest, best, onRestart, onNext, t }) {
  return (
    <section className="tt-result" aria-labelledby="tt-result-title">
      <h3 id="tt-result-title">{t.result}</h3>
      <p className="tt-result__wpm">
        <strong>{result.wpm}</strong> <span>{t.wpmLong}</span>
      </p>
      <dl className="tt-result__grid">
        <div>
          <dt>{t.accuracy}</dt>
          <dd>{result.accuracy}%</dd>
        </div>
        <div>
          <dt>{t.cpm}</dt>
          <dd>{result.cpm}</dd>
        </div>
        <div>
          <dt>{t.time}</dt>
          <dd>{formatClock(result.time, Math.round)}</dd>
        </div>
        <div>
          <dt>{t.correct}</dt>
          <dd>{result.correct}</dd>
        </div>
        <div>
          <dt>{t.mistakes}</dt>
          <dd>{result.errors}</dd>
        </div>
      </dl>
      <p className={`tt-result__best${newBest ? ' is-new' : ''}`}>
        {newBest ? t.newBest : t.bestLine(t.bestValue(best.wpm, best.accuracy))}
      </p>
      <div className="tt-result__actions">
        <button type="button" className="btn" onClick={onRestart}>
          {t.again}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onNext}>
          {t.next}
        </button>
      </div>
    </section>
  )
}

function TypingRun({ text, mode, best, focusOnMount, onRecord, onRestart, onNext, t }) {
  const [state, dispatch] = useReducer(typingReducer, initialState)
  const [bestBefore] = useState(best) // snapshot, so "new best" still shows after the record is saved
  const inputRef = useRef(null) // the hidden textarea that receives the keystrokes
  const boxRef = useRef(null) // the scrolling text inside the passage box
  const limit = mode.seconds ? mode.seconds * 1000 : null
  const { typed, startedAt, endedAt, keystrokes, errors } = state
  const running = startedAt != null && endedAt == null

  // useRef gives direct access to the DOM node: after a restart the cursor is ready in the field.
  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus({ preventScroll: true })
  }, [focusOnMount])

  // Timed mode: one timeout for the exact end. The cleanup stops it on restart or unmount.
  useEffect(() => {
    if (!running || !limit) return
    const timer = setTimeout(() => dispatch({ type: 'finish', time: startedAt + limit }), startedAt + limit - Date.now())
    return () => clearTimeout(timer)
  }, [running, limit, startedAt])

  // Recomputed only when the typed text changes, not on every clock tick.
  const correct = useMemo(() => {
    let n = 0
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) n++
    return n
  }, [typed, text])

  const result = endedAt
    ? { ...computeStats({ correct, keystrokes, errors }, endedAt - startedAt), time: endedAt - startedAt, correct, errors }
    : null

  // When the test ends (by the timer or by the last character), the result is saved once.
  const finalWpm = result?.wpm
  const finalAccuracy = result?.accuracy
  useEffect(() => {
    if (endedAt) onRecord(mode.id, { wpm: finalWpm, accuracy: finalAccuracy, at: endedAt })
  }, [endedAt, finalWpm, finalAccuracy, mode.id, onRecord])

  // Keep the caret's line in view inside the passage box.
  useLayoutEffect(() => {
    const box = boxRef.current
    const caret = box?.querySelector('.is-current')
    if (!caret) return
    const line = parseFloat(getComputedStyle(box).lineHeight)
    // Scroll by whole lines and keep one finished line visible above the caret.
    const target = Math.max(0, (Math.floor(caret.offsetTop / line) - 1) * line)
    if (Math.abs(box.scrollTop - target) > line / 2) box.scrollTop = target
  }, [typed.length])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onRestart()
    } else if (NAV_KEYS.has(e.key)) {
      e.preventDefault() // the caret always stays at the end of the text
    }
  }

  const keepCaretAtEnd = (e) => {
    const el = e.currentTarget
    const end = el.value.length
    if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end)
  }

  const newBest = result ? isBetter(result, bestBefore) : false
  const hint = endedAt ? t.hintDone : startedAt ? t.hintTyping : t.hintIdle

  return (
    <div className="tt-run">
      {result ? (
        <Result result={result} newBest={newBest} best={best ?? result} onRestart={onRestart} onNext={onNext} t={t} />
      ) : (
        <LiveStats state={state} correct={correct} limit={limit} total={text.length} best={best} t={t} />
      )}

      <div className={`tt-box${endedAt ? ' is-done' : ''}`}>
        <div className="tt-text" ref={boxRef} aria-hidden="true">
          <Passage text={text} typed={typed} done={Boolean(endedAt)} />
        </div>
        <label className="visually-hidden" htmlFor="tt-input">
          {t.inputLabel}
        </label>
        <textarea
          id="tt-input"
          ref={inputRef}
          className="tt-input"
          value={typed}
          maxLength={text.length}
          readOnly={Boolean(endedAt)}
          aria-describedby="tt-source"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(e) => dispatch({ type: 'input', value: e.target.value, text, time: Date.now() })}
          onKeyDown={handleKeyDown}
          onSelect={keepCaretAtEnd}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
        />
      </div>
      <p id="tt-source" className="visually-hidden">
        {text}
      </p>

      <div className="tt-foot">
        <p className="tt-hint">{hint}</p>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          {t.restart}
        </button>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {result ? t.announce(result.wpm, result.accuracy) : ''}
      </p>
    </div>
  )
}

function TypingTest() {
  const lang = useLang()
  const t = useText(TEXT)
  const [modeId, setModeId] = useState('time60')
  const [passage, setPassage] = useState(0)
  const [run, setRun] = useState(0)
  const [interacted, setInteracted] = useState(false)
  const { bests, record } = useBestResults()

  const mode = MODES.find((m) => m.id === modeId)
  const passages = PASSAGES[lang]
  const text = useMemo(() => textFor(lang, passage, mode), [lang, passage, mode])

  // Every control starts a fresh run; after the first click the field gets the focus automatically.
  const start = (update) => {
    update?.()
    setRun((r) => r + 1)
    setInteracted(true)
  }

  return (
    <div className="tt">
      <p className="tt__intro">{t.intro}</p>

      <div className="tt__controls">
        <div className="tt__group" role="group" aria-label={t.mode}>
          <span className="tt__label">{t.mode}</span>
          {MODES.map((m) => (
            <button key={m.id} type="button" className="chip" aria-pressed={m.id === modeId} onClick={() => start(() => setModeId(m.id))}>
              {t.modes[m.id]}
            </button>
          ))}
        </div>
        <div className="tt__group" role="group" aria-label={t.passage}>
          <span className="tt__label">{t.passage}</span>
          {passages.map((p, i) => (
            <button key={p.id} type="button" className="chip" aria-pressed={i === passage} onClick={() => start(() => setPassage(i))}>
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* The key gives every run (and every language) its own fresh reducer state and timers. */}
      <TypingRun
        key={`${lang}-${modeId}-${passage}-${run}`}
        text={text}
        mode={mode}
        best={bests[modeId]}
        focusOnMount={interacted}
        onRecord={record}
        onRestart={() => start()}
        onNext={() => start(() => setPassage((p) => (p + 1) % passages.length))}
        t={t}
      />
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="typing-test">
      <TypingTest />
    </AppFrame>
  )
}
