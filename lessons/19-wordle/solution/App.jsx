import { useEffect, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { MAX_TRIES, WORD_LENGTH, emojiGrid, evaluate, letterStates, statusOf } from './logic.js'
import {
  addResult,
  loadGame,
  loadStats,
  loadWordList,
  saveGame,
  saveStats,
  saveWordList,
  startNewPracticeGame,
  visibleStreak,
} from './storage.js'
import { WORD_LISTS, WORD_LIST_NAMES } from './wordLists.js'
import { useGlobalKeys } from './useGlobalKeys.js'
import Board from './Board.jsx'
import Keyboard from './Keyboard.jsx'
import './app.css'

const TEXT = {
  en: {
    intro: 'Guess the hidden five-letter word in six tries. After every guess the tiles show how close you were.',
    listNote:
      'Two word lists: English (179 secret words, about 2,250 accepted guesses) and Hungarian (181 secret words, about 470 accepted guesses, accented letters included).',
    modes: { daily: 'Daily word', practice: 'Practice' },
    modeLabel: 'Game mode',
    listLabel: 'Word list',
    dailyOf: (date) => `Daily word for ${date}`,
    practiceInfo: 'Practice: a random word, as many rounds as you like.',
    legend: { correct: 'Right letter, right spot', present: 'In the word, wrong spot', absent: 'Not in the word' },
    states: { correct: 'correct', present: 'wrong spot', absent: 'not in the word' },
    board: 'Guesses',
    row: (n) => `Guess ${n}`,
    keyboard: 'Keyboard',
    enter: 'Enter',
    enterShort: 'Enter',
    backspace: 'Delete letter',
    notEnough: 'Not enough letters',
    notInList: 'Not in the word list',
    announceGuess: (word, parts) => `${word}: ${parts}.`,
    won: ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'],
    wonBody: (tries) => `You found the word in ${tries} ${tries === 1 ? 'try' : 'tries'}.`,
    lost: 'So close!',
    lostBody: (word) => `The word was ${word}.`,
    stats: 'Statistics',
    played: 'Played',
    winRate: 'Win %',
    streak: 'Streak',
    maxStreak: 'Best streak',
    dist: 'Guess distribution',
    share: 'Copy result',
    copied: 'Copied to the clipboard',
    copyFailed: 'Copying failed',
    newWord: 'New word',
    tomorrow: 'A new daily word arrives tomorrow.',
    toPractice: 'Play practice',
    shareTitle: (date) => (date ? `Rika Word Guess ${date}` : 'Rika Word Guess · practice'),
  },
  hu: {
    intro: 'Találd ki a rejtett ötbetűs szót hat tippből. Minden tipp után a mezők megmutatják, mennyire jártál közel.',
    listNote:
      'Két szólista közül választhatsz: angol (179 titkos szó, nagyjából 2250 elfogadott tipp) és magyar (181 titkos szó, nagyjából 470 elfogadott tipp, ékezetes betűkkel).',
    modes: { daily: 'Napi szó', practice: 'Gyakorlás' },
    modeLabel: 'Játékmód',
    listLabel: 'Szólista',
    dailyOf: (date) => `A napi szó: ${date}`,
    practiceInfo: 'Gyakorlás: véletlen szó, annyi körrel, amennyit csak szeretnél.',
    legend: { correct: 'Jó betű, jó helyen', present: 'Benne van, de máshol', absent: 'Nincs a szóban' },
    states: { correct: 'jó helyen', present: 'rossz helyen', absent: 'nincs a szóban' },
    board: 'Tippek',
    row: (n) => `${n}. tipp`,
    keyboard: 'Billentyűzet',
    enter: 'Enter',
    enterShort: 'Enter',
    backspace: 'Betű törlése',
    notEnough: 'Nincs elég betű',
    notInList: 'Nincs a szólistában',
    announceGuess: (word, parts) => `${word}: ${parts}.`,
    won: ['Zseniális!', 'Lenyűgöző!', 'Remek!', 'Nagyszerű!', 'Szép munka!', 'Meglett!'],
    wonBody: (tries) => `${tries} tippből megtaláltad a szót.`,
    lost: 'Majdnem!',
    lostBody: (word) => `A megoldás: ${word}.`,
    stats: 'Statisztika',
    played: 'Játszma',
    winRate: 'Nyerési %',
    streak: 'Sorozat',
    maxStreak: 'Leghosszabb',
    dist: 'Tippek eloszlása',
    share: 'Eredmény másolása',
    copied: 'Vágólapra másolva',
    copyFailed: 'Nem sikerült másolni',
    newWord: 'Új szó',
    tomorrow: 'Holnap új napi szó érkezik.',
    toPractice: 'Gyakorlás',
    shareTitle: (date) => (date ? `Rika Szókitaláló ${date}` : 'Rika Szókitaláló · gyakorlás'),
  },
}

const STEP_MS = 250 // delay between tiles while a row flips
const FLIP_MS = 500

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function formatDate(key, lang) {
  const [y, m, d] = key.split('-').map(Number)
  return new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { dateStyle: 'long' }).format(new Date(y, m - 1, d))
}

function Stats({ stats, mode, highlight, t }) {
  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0
  const top = Math.max(1, ...stats.dist)
  return (
    <div className="wd-stats">
      <dl className="wd-stats__numbers">
        {[
          [t.played, stats.played],
          [t.winRate, winRate],
          [t.streak, visibleStreak(stats, mode)],
          [t.maxStreak, stats.maxStreak],
        ].map(([label, value]) => (
          <div key={label}>
            <dd>{value}</dd>
            <dt>{label}</dt>
          </div>
        ))}
      </dl>
      <h4>{t.dist}</h4>
      <ol className="wd-dist">
        {stats.dist.map((count, i) => (
          <li key={i} className={highlight === i + 1 ? 'is-current' : ''}>
            <span className="wd-dist__n">{i + 1}</span>
            <span className="wd-dist__bar" style={{ '--w': `${(count / top) * 100}%` }}>
              {count}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Game({ mode, words, stats, lang, onResult, onNewWord, onPractice, t }) {
  const list = WORD_LISTS[words] // the chosen word list: its words, letters and keyboard rows
  const [game, setGame] = useState(() => loadGame(mode, words)) // { answer, guesses, date? }
  const [current, setCurrent] = useState('')
  const [revealRow, setRevealRow] = useState(null) // the row that is flipping right now
  const [shake, setShake] = useState(0)
  const [toast, setToast] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const [copyState, setCopyState] = useState('idle')

  const { answer, guesses } = game
  const status = statusOf(guesses, answer)
  const playing = status === 'playing'
  const revealing = revealRow != null

  // Every change of the game is saved, so a reload continues where you left off.
  useEffect(() => {
    saveGame(mode, words, game)
  }, [mode, words, game])

  // The keyboard colours and the result wait until the flip animation of the new row is over.
  useEffect(() => {
    if (revealRow == null) return
    const duration = prefersReducedMotion() ? 0 : STEP_MS * (WORD_LENGTH - 1) + FLIP_MS
    const timer = setTimeout(() => setRevealRow(null), duration)
    return () => clearTimeout(timer)
  }, [revealRow])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = setTimeout(() => setCopyState('idle'), 2000)
    return () => clearTimeout(timer)
  }, [copyState])

  const reject = (text) => {
    setToast({ text, id: Date.now() })
    setAnnouncement(text)
    setShake((s) => s + 1)
  }

  const submit = () => {
    if (current.length < WORD_LENGTH) return reject(t.notEnough)
    if (!list.valid.has(current)) return reject(t.notInList)

    const nextGuesses = [...guesses, current]
    const states = evaluate(current, answer)
    setGame({ ...game, guesses: nextGuesses })
    setCurrent('')
    setRevealRow(guesses.length)
    setAnnouncement(t.announceGuess(current, states.map((s, i) => `${current[i]} ${t.states[s]}`).join(', ')))

    const outcome = statusOf(nextGuesses, answer)
    if (outcome !== 'playing') onResult(mode, { won: outcome === 'won', tries: nextGuesses.length, date: game.date })
  }

  // One handler for both the physical keyboard (via useGlobalKeys) and the on-screen keys.
  const handleKey = (key) => {
    if (!playing || revealing) return
    if (key === 'ENTER') submit()
    else if (key === 'BACK') setCurrent((c) => c.slice(0, -1))
    else if (list.letters.includes(key)) setCurrent((c) => (c.length < WORD_LENGTH ? c + key : c))
  }
  useGlobalKeys(handleKey)

  const copyResult = async () => {
    const score = status === 'won' ? guesses.length : 'X'
    const text = `${t.shareTitle(game.date)} ${score}/${MAX_TRIES}\n\n${emojiGrid(guesses, answer)}`
    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  const settledGuesses = revealing ? guesses.slice(0, revealRow) : guesses
  const showResult = !playing && !revealing

  return (
    <div className="wd-game">
      <p className="wd-game__info">{mode === 'daily' ? t.dailyOf(formatDate(game.date, lang)) : t.practiceInfo}</p>

      <div className="wd-stage">
        <Board
          guesses={guesses}
          current={current}
          answer={answer}
          playing={playing}
          revealRow={revealRow}
          won={status === 'won'}
          shake={shake}
          t={t}
        />
        {toast && (
          <p key={toast.id} className="wd-toast" aria-hidden="true">
            {toast.text}
          </p>
        )}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>

      {showResult ? (
        <section className="wd-result" aria-labelledby="wd-result-title" aria-live="polite">
          <h3 id="wd-result-title">{status === 'won' ? t.won[guesses.length - 1] : t.lost}</h3>
          <p>{status === 'won' ? t.wonBody(guesses.length) : t.lostBody(answer)}</p>
          <Stats stats={stats} mode={mode} highlight={status === 'won' ? guesses.length : null} t={t} />
          <div className="wd-result__actions">
            <button type="button" className="btn" onClick={copyResult}>
              {copyState === 'copied' ? t.copied : copyState === 'failed' ? t.copyFailed : t.share}
            </button>
            {mode === 'practice' ? (
              <button type="button" className="btn btn--ghost" onClick={() => onNewWord(answer)}>
                {t.newWord}
              </button>
            ) : (
              <button type="button" className="btn btn--ghost" onClick={onPractice}>
                {t.toPractice}
              </button>
            )}
          </div>
          {mode === 'daily' && <p className="wd-result__note">{t.tomorrow}</p>}
        </section>
      ) : (
        <Keyboard rows={list.keyboard} states={letterStates(settledGuesses, answer)} onKey={handleKey} t={t} />
      )}

      {playing && (
        <details className="wd-statsbox">
          <summary>{t.stats}</summary>
          <Stats stats={stats} mode={mode} t={t} />
        </details>
      )}
    </div>
  )
}

function WordGame() {
  const t = useText(TEXT)
  const lang = useLang()
  const [mode, setMode] = useState('daily')
  // The word list: the saved choice, or the page's language on a first visit.
  const [words, setWords] = useState(() => loadWordList() ?? (lang === 'hu' ? 'hu' : 'en'))
  const [round, setRound] = useState(0)
  // Every word list keeps its own statistics: { en: { daily, practice }, hu: { daily, practice } }.
  const [stats, setStats] = useState(() => ({ en: loadStats('en'), hu: loadStats('hu') }))

  useEffect(() => {
    saveStats('en', stats.en)
    saveStats('hu', stats.hu)
  }, [stats])

  const chooseWords = (next) => {
    setWords(next)
    saveWordList(next)
  }

  const recordResult = (gameMode, result) => {
    setStats((s) => ({ ...s, [words]: { ...s[words], [gameMode]: addResult(s[words][gameMode], result) } }))
  }

  const newWord = (previous) => {
    startNewPracticeGame(previous, words)
    setRound((r) => r + 1)
  }

  return (
    <div className="wd">
      <div className="wd__head">
        <p className="wd__intro">{t.intro}</p>
        <div className="wd__switches">
          <div className="wd__modes" role="group" aria-label={t.modeLabel}>
            {['daily', 'practice'].map((m) => (
              <button key={m} type="button" className="chip" aria-pressed={m === mode} onClick={() => setMode(m)}>
                {t.modes[m]}
              </button>
            ))}
          </div>
          {/* The language of the words, not of the page: the page has its own language switch. */}
          <div className="wd__modes" role="group" aria-labelledby="wd-list-label">
            <span id="wd-list-label" className="wd__label">
              {t.listLabel}
            </span>
            {Object.keys(WORD_LISTS).map((w) => (
              <button
                key={w}
                type="button"
                className="chip"
                lang={w}
                aria-pressed={w === words}
                onClick={() => chooseWords(w)}
              >
                {WORD_LIST_NAMES[w]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="wd-legend">
        {Object.entries(t.legend).map(([state, label]) => (
          <li key={state}>
            <span className={`wd-tile wd-tile--mini is-${state}`} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>

      {/* A new word list, mode or "New word" remounts the game with its own saved state. */}
      <Game
        key={`${words}-${mode}-${round}`}
        mode={mode}
        words={words}
        stats={stats[words][mode]}
        lang={lang}
        onResult={recordResult}
        onNewWord={newWord}
        onPractice={() => setMode('practice')}
        t={t}
      />

      <p className="wd__note">{t.listNote}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="wordle">
      <WordGame />
    </AppFrame>
  )
}
