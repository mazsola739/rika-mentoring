import { useEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { DIFFICULTIES, flipCard, formatTime, hideFlipped, isBetter, newGame } from './game.js'
import { useBestScores } from './useBestScores.js'
import { useLocalStorage } from './useLocalStorage.js'
import { useNow } from './useNow.js'
import { THEMES, faceOf, themeByKey } from './faces.js'
import Card from './Card.jsx'
import WinDialog from './WinDialog.jsx'
import './app.css'

const TEXT = {
  en: {
    intro:
      'Flip two cards at a time and find every matching pair, on your own or taking turns with a friend. Move between cards with Tab or the arrow keys, flip with Enter or Space.',
    difficulty: 'Difficulty',
    levels: { 6: 'Easy', 8: 'Medium', 12: 'Hard' },
    pairsOf: (n) => `${n} pairs`,
    players: 'Players',
    solo: 'Solo',
    duo: 'Two players',
    theme: 'Theme',
    moves: 'Moves',
    time: 'Time',
    found: 'Pairs',
    best: 'Best',
    none: '–',
    bestShort: (moves, time) => `${moves} moves · ${time}`,
    player: (n) => `Player ${n}`,
    nextUp: (name) => `Next up: ${name}`,
    restart: 'New game',
    board: 'Cards',
    cardDown: (i) => `Card ${i}, face down`,
    cardUp: (i, name) => `Card ${i}: ${name}`,
    cardMatched: (i, name) => `Card ${i}: ${name}, matched`,
    match: (name, found, total) => `Match: ${name}. ${found} of ${total} pairs found.`,
    miss: (moves) => `No match on move ${moves}. The cards turn back.`,
    wonTitle: 'You found them all!',
    wins: (name) => `${name} wins!`,
    draw: 'A draw!',
    wonBody: (moves, time) => `All pairs found in ${moves} moves and ${time}.`,
    duoBody: (moves, time) => `All pairs found in ${moves} moves and ${time}.`,
    duoScore: (a, b) => `Player 1 found ${a} ${a === 1 ? 'pair' : 'pairs'}, Player 2 found ${b}.`,
    newBest: 'New best result on this level.',
    bestWas: (text) => `Your best on this level: ${text}.`,
    again: 'Play again',
    close: 'Close',
  },
  hu: {
    intro:
      'Fordíts fel egyszerre két kártyát, és keresd meg az összes párt, egyedül vagy egy baráttal felváltva. A kártyák között a Tab vagy a nyílbillentyűk visznek, az Enter vagy a Szóköz fordít.',
    difficulty: 'Nehézség',
    levels: { 6: 'Könnyű', 8: 'Közepes', 12: 'Nehéz' },
    pairsOf: (n) => `${n} pár`,
    players: 'Játékosok',
    solo: 'Egyedül',
    duo: 'Ketten',
    theme: 'Téma',
    moves: 'Lépések',
    time: 'Idő',
    found: 'Párok',
    best: 'Legjobb',
    none: '–',
    bestShort: (moves, time) => `${moves} lépés · ${time}`,
    player: (n) => `${n}. játékos`,
    nextUp: (name) => `Következik: ${name}`,
    restart: 'Új játék',
    board: 'Kártyák',
    cardDown: (i) => `${i}. kártya, lefordítva`,
    cardUp: (i, name) => `${i}. kártya: ${name}`,
    cardMatched: (i, name) => `${i}. kártya: ${name}, megtalálva`,
    match: (name, found, total) => `Pár: ${name}. ${total} párból ${found} megvan.`,
    miss: (moves) => `A(z) ${moves}. lépés nem talált. A kártyák visszafordulnak.`,
    wonTitle: 'Mindet megtaláltad!',
    wins: (name) => `${name} nyert!`,
    draw: 'Döntetlen!',
    wonBody: (moves, time) => `Minden párt megtaláltál ${moves} lépésből, ${time} alatt.`,
    duoBody: (moves, time) => `Minden párt megtaláltatok ${moves} lépésből, ${time} alatt.`,
    duoScore: (a, b) => `Az 1. játékos ${a}, a 2. játékos ${b} párt talált.`,
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

// The win dialog's title: in two-player mode it names the winner (or says it is a draw).
function winTitle(t, result) {
  if (!result?.scores) return t.wonTitle
  const [a, b] = result.scores
  if (a === b) return t.draw
  return t.wins(t.player(a > b ? 1 : 2))
}

function Board({ pairs, theme, players, best, onRecord, onRestart, t, lang }) {
  const [game, setGame] = useState(() => newGame(pairs, theme.faces.map((face) => face.key)))
  const [result, setResult] = useState(null) // { moves, time, newBest } or { moves, time, scores } once the game is won
  const [dialogOpen, setDialogOpen] = useState(false)
  const gridRef = useRef(null)

  const mismatch = game.flipped.length === 2
  const duo = players === 2

  // setTimeout: a wrong pair stays visible for a moment, then turns back.
  // The cleanup cancels the timer if a third card is clicked first or the board unmounts.
  useEffect(() => {
    if (!mismatch) return
    const timer = setTimeout(() => setGame((g) => hideFlipped(g)), FLIP_BACK_MS)
    return () => clearTimeout(timer)
  }, [mismatch])

  // Side effects (saving the best score, opening the dialog) live in the event handler, not in an effect.
  // Two-player games share their moves, so they are not saved as best results.
  const handleFlip = (index) => {
    const next = flipCard(game, index, Date.now())
    if (next === game) return
    setGame(next)
    if (next.finishedAt) {
      const outcome = { moves: next.moves, time: next.finishedAt - next.startedAt }
      if (duo) {
        setResult({ ...outcome, scores: next.scores })
      } else {
        setResult({ ...outcome, newBest: isBetter(outcome, best) })
        onRecord(pairs, outcome)
      }
      setDialogOpen(true)
    }
  }

  // Arrow keys move the focus around the grid; the column count is read from the CSS grid itself.
  // preventDefault comes first, so an arrow key never scrolls the page, not even at the edge of the grid.
  const handleKeyDown = (e) => {
    const buttons = [...gridRef.current.querySelectorAll('.mg-card')]
    const current = buttons.indexOf(document.activeElement)
    if (current === -1) return
    const columns = getComputedStyle(gridRef.current).gridTemplateColumns.split(' ').length
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }[e.key]
    let target = step === undefined ? null : current + step
    if (e.key === 'Home') target = 0
    if (e.key === 'End') target = buttons.length - 1
    if (target == null) return
    e.preventDefault()
    if (target < 0 || target >= buttons.length) return
    buttons[target].focus()
  }

  const nameOf = (key) => faceOf(theme, key).name[lang]
  const found = game.cards.filter((c) => c.matched).length / 2
  const bestText = best ? t.bestShort(best.moves, formatTime(best.time)) : t.none

  let announcement = ''
  if (game.last?.type === 'match') announcement = t.match(nameOf(game.last.key), found, pairs)
  if (game.last?.type === 'miss') announcement = t.miss(game.last.moves)

  return (
    <>
      <dl className={`mg-stats${duo ? ' mg-stats--duo' : ''}`}>
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
        {duo ? (
          game.scores.map((score, i) => (
            <div key={i} className={`mg-stats__player${i === game.turn && !game.finishedAt ? ' is-turn' : ''}`}>
              <dt>{t.player(i + 1)}</dt>
              <dd>{score}</dd>
            </div>
          ))
        ) : (
          <div className="mg-stats__best">
            <dt>{t.best}</dt>
            <dd>{bestText}</dd>
          </div>
        )}
      </dl>

      {duo && !game.finishedAt && (
        <p className="mg-turn" aria-live="polite">
          {t.nextUp(t.player(game.turn + 1))}
        </p>
      )}

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
              face={faceOf(theme, card.key)}
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

      <WinDialog open={dialogOpen} title={winTitle(t, result)} onClose={() => setDialogOpen(false)}>
        {result && (
          <>
            <p className="mg-dialog__score">
              {(result.scores ? t.duoBody : t.wonBody)(result.moves, formatTime(result.time))}
            </p>
            {result.scores ? (
              <p className="mg-dialog__note">{t.duoScore(result.scores[0], result.scores[1])}</p>
            ) : (
              <p className={`mg-dialog__note${result.newBest ? ' is-new' : ''}`}>
                {result.newBest ? t.newBest : t.bestWas(bestText)}
              </p>
            )}
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
  const [players, setPlayers] = useState(1)
  const [round, setRound] = useState(0)
  const [themeKey, setThemeKey] = useLocalStorage('rika:memory-game:theme', THEMES[0].key)
  const { bests, record } = useBestScores()

  const theme = themeByKey(themeKey)

  return (
    // The theme's colour reaches every card back through a CSS variable.
    <div className="mg" style={{ '--card-color': theme.back }}>
      <p className="mg__intro">{t.intro}</p>

      <div className="mg__toolbar">
        <div className="mg__chips" role="group" aria-label={t.difficulty}>
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

      <div className="mg__toolbar">
        <div className="mg__chips" role="group" aria-label={t.players}>
          <button type="button" className="chip" aria-pressed={players === 1} onClick={() => setPlayers(1)}>
            {t.solo}
          </button>
          <button type="button" className="chip" aria-pressed={players === 2} onClick={() => setPlayers(2)}>
            {t.duo}
          </button>
        </div>
        <label className="mg__theme">
          <span>{t.theme}</span>
          <select className="input" value={theme.key} onChange={(e) => setThemeKey(e.target.value)}>
            {THEMES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.name[lang]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* A new key throws away the whole board state: a fresh deck for every round, difficulty, theme and player count. */}
      <Board
        key={`${pairs}-${theme.key}-${players}-${round}`}
        pairs={pairs}
        theme={theme}
        players={players}
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
