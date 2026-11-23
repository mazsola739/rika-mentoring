import { useEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { DIFFICULTIES, flipCard, formatTime, hideFlipped, isBetter, newGame } from './game.js'
import { useBestScores } from './useBestScores.js'
import { useNow } from './useNow.js'
import { faceByKey } from './faces.js'
import Card from './Card.jsx'
import WinDialog from './WinDialog.jsx'
import './app.css'

const TEXT = {
  en: {
    intro:
      'Flip two cards at a time and find every matching pair. Move between cards with Tab or the arrow keys, flip with Enter or Space.',
    difficulty: 'Difficulty',
    levels: { 6: 'Easy', 8: 'Medium', 12: 'Hard' },
    pairsOf: (n) => `${n} pairs`,
    moves: 'Moves',
    time: 'Time',
    found: 'Pairs',
    best: 'Best',
    none: '–',
    bestShort: (moves, time) => `${moves} moves · ${time}`,
    restart: 'New game',
    board: 'Cards',
    cardDown: (i) => `Card ${i}, face down`,
    cardUp: (i, name) => `Card ${i}: ${name}`,
    cardMatched: (i, name) => `Card ${i}: ${name}, matched`,
    match: (name, found, total) => `Match: ${name}. ${found} of ${total} pairs found.`,
    miss: (moves) => `No match on move ${moves}. The cards turn back.`,
    wonTitle: 'You found them all!',
    wonBody: (moves, time) => `All pairs found in ${moves} moves and ${time}.`,
    newBest: 'New best result on this level.',
    bestWas: (text) => `Your best on this level: ${text}.`,
    again: 'Play again',
    close: 'Close',
  },
  hu: {
    intro:
      'Fordíts fel egyszerre két kártyát, és keresd meg az összes párt. A kártyák között a Tab vagy a nyílbillentyűk visznek, az Enter vagy a Szóköz fordít.',
    difficulty: 'Nehézség',
    levels: { 6: 'Könnyű', 8: 'Közepes', 12: 'Nehéz' },
    pairsOf: (n) => `${n} pár`,
    moves: 'Lépések',
    time: 'Idő',
    found: 'Párok',
    best: 'Legjobb',
    none: '–',
    bestShort: (moves, time) => `${moves} lépés · ${time}`,
    restart: 'Új játék',
    board: 'Kártyák',
    cardDown: (i) => `${i}. kártya, lefordítva`,
    cardUp: (i, name) => `${i}. kártya: ${name}`,
    cardMatched: (i, name) => `${i}. kártya: ${name}, megtalálva`,
    match: (name, found, total) => `Pár: ${name}. ${total} párból ${found} megvan.`,
    miss: (moves) => `A(z) ${moves}. lépés nem talált. A kártyák visszafordulnak.`,
    wonTitle: 'Mindet megtaláltad!',
    wonBody: (moves, time) => `Minden párt megtaláltál ${moves} lépésből, ${time} alatt.`,
    newBest: 'Új egyéni csúcs ezen a szinten.',
    bestWas: (text) => `A legjobb eredményed ezen a szinten: ${text}.`,
    again: 'Új játék',
    close: 'Bezárás',
  },
}

const FLIP_BACK_MS = 900

// The clock is its own component, so only this small piece re-renders four times a second.
function Clock({ startedAt, finishedAt }) {
  const running = startedAt != null && finishedAt == null
  const now = useNow(running)
  const ms = startedAt == null ? 0 : (finishedAt ?? now) - startedAt
  return <>{formatTime(Math.max(0, ms))}</>
}

function Board({ pairs, best, onRecord, onRestart, t, lang }) {
  const [game, setGame] = useState(() => newGame(pairs))
  const [result, setResult] = useState(null) // { moves, time, newBest } once the game is won
  const [dialogOpen, setDialogOpen] = useState(false)
  const gridRef = useRef(null)

  const mismatch = game.flipped.length === 2

  // setTimeout: a wrong pair stays visible for a moment, then turns back.
  // The cleanup cancels the timer if a third card is clicked first or the board unmounts.
  useEffect(() => {
    if (!mismatch) return
    const timer = setTimeout(() => setGame((g) => hideFlipped(g)), FLIP_BACK_MS)
    return () => clearTimeout(timer)
  }, [mismatch])

  // Side effects (saving the best score, opening the dialog) live in the event handler, not in an effect.
  const handleFlip = (index) => {
    const next = flipCard(game, index, Date.now())
    if (next === game) return
    setGame(next)
    if (next.finishedAt) {
      const outcome = { moves: next.moves, time: next.finishedAt - next.startedAt }
      setResult({ ...outcome, newBest: isBetter(outcome, best) })
      onRecord(pairs, outcome)
      setDialogOpen(true)
    }
  }

  // Arrow keys move the focus around the grid; the column count is read from the CSS grid itself.
  const handleKeyDown = (e) => {
    const buttons = [...gridRef.current.querySelectorAll('.mg-card')]
    const current = buttons.indexOf(document.activeElement)
    if (current === -1) return
    const columns = getComputedStyle(gridRef.current).gridTemplateColumns.split(' ').length
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }[e.key]
    let target = step === undefined ? null : current + step
    if (e.key === 'Home') target = 0
    if (e.key === 'End') target = buttons.length - 1
    if (target == null || target < 0 || target >= buttons.length) return
    e.preventDefault()
    buttons[target].focus()
  }

  const nameOf = (key) => faceByKey(key).name[lang]
  const found = game.cards.filter((c) => c.matched).length / 2
  const bestText = best ? t.bestShort(best.moves, formatTime(best.time)) : t.none

  let announcement = ''
  if (game.last?.type === 'match') announcement = t.match(nameOf(game.last.key), found, pairs)
  if (game.last?.type === 'miss') announcement = t.miss(game.last.moves)

  return (
    <>
      <dl className="mg-stats">
        <div>
          <dt>{t.moves}</dt>
          <dd>{game.moves}</dd>
        </div>
        <div>
          <dt>{t.time}</dt>
          <dd>
            <Clock startedAt={game.startedAt} finishedAt={game.finishedAt} />
          </dd>
        </div>
        <div>
          <dt>{t.found}</dt>
          <dd>
            {found} / {pairs}
          </dd>
        </div>
        <div className="mg-stats__best">
          <dt>{t.best}</dt>
          <dd>{bestText}</dd>
        </div>
      </dl>

      <div
        ref={gridRef}
        className={`mg-grid mg-grid--${pairs}`}
        role="group"
        aria-label={t.board}
        onKeyDown={handleKeyDown}
      >
        {game.cards.map((card, i) => {
          const faceUp = card.matched || game.flipped.includes(i)
          const name = nameOf(card.key)
          const label = card.matched ? t.cardMatched(i + 1, name) : faceUp ? t.cardUp(i + 1, name) : t.cardDown(i + 1)
          return (
            <Card
              key={card.id}
              index={i}
              face={faceByKey(card.key)}
              faceUp={faceUp}
              matched={card.matched}
              label={label}
              onFlip={handleFlip}
            />
          )
        })}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>

      <WinDialog open={dialogOpen} title={t.wonTitle} onClose={() => setDialogOpen(false)}>
        {result && (
          <>
            <p className="mg-dialog__score">{t.wonBody(result.moves, formatTime(result.time))}</p>
            <p className={`mg-dialog__best${result.newBest ? ' is-new' : ''}`}>
              {result.newBest ? t.newBest : t.bestWas(bestText)}
            </p>
          </>
        )}
        <div className="mg-dialog__actions">
          <button type="button" className="btn" onClick={onRestart}>
            {t.again}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setDialogOpen(false)}>
            {t.close}
          </button>
        </div>
      </WinDialog>
    </>
  )
}

function MemoryGame() {
  const t = useText(TEXT)
  const lang = useLang()
  const [pairs, setPairs] = useState(8)
  const [round, setRound] = useState(0)
  const { bests, record } = useBestScores()

  return (
    <div className="mg">
      <p className="mg__intro">{t.intro}</p>

      <div className="mg__toolbar">
        <div className="mg__levels" role="group" aria-label={t.difficulty}>
          {DIFFICULTIES.map((n) => (
            <button key={n} type="button" className="chip" aria-pressed={n === pairs} onClick={() => setPairs(n)}>
              {t.levels[n]} <span className="mg__pairs">{t.pairsOf(n)}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn--ghost" onClick={() => setRound((r) => r + 1)}>
          {t.restart}
        </button>
      </div>

      {/* A new key throws away the whole board state: a fresh deck for every round and difficulty. */}
      <Board
        key={`${pairs}-${round}`}
        pairs={pairs}
        best={bests[pairs]}
        onRecord={record}
        onRestart={() => setRound((r) => r + 1)}
        t={t}
        lang={lang}
      />
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="memory-game">
      <MemoryGame />
    </AppFrame>
  )
}
