import { useEffect, useReducer, useRef, useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from '../text.js'
import { Face } from '../components/Icons.jsx'
import { MINES, SIZE, gameReducer, initialGame } from './minesweeper.js'

// Seconds since the first click; the interval only runs while a game is in progress.
const useGameTimer = (game) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (game.status !== 'playing') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [game.status])
  if (!game.startedAt) return 0
  const end = game.endedAt ?? Math.max(now, game.startedAt)
  return Math.min(999, Math.floor((end - game.startedAt) / 1000))
}

const pad3 = (n) => String(Math.max(-99, n)).padStart(3, '0')

const Minesweeper = () => {
  const t = useText(TEXT).mines
  const [game, dispatch] = useReducer(gameReducer, undefined, initialGame)
  const [flagMode, setFlagMode] = useState(false)
  const [cursor, setCursor] = useState(40) // roving tabindex: the one focusable cell (starts in the centre)
  const [pressing, setPressing] = useState(false)
  const gridRef = useRef(null)
  const seconds = useGameTimer(game)
  const flags = game.board.filter((c) => c.flag).length

  const reveal = (i) => dispatch({ type: 'reveal', i, seed: Math.floor(Math.random() * 2 ** 32), now: Date.now() })
  const flag = (i) => dispatch({ type: 'flag', i })
  const act = (i) => (flagMode ? flag(i) : reveal(i))

  const moveCursor = (next) => {
    setCursor(next)
    gridRef.current?.querySelector(`[data-i="${next}"]`)?.focus()
  }

  const onKeyDown = (e, i) => {
    const row = Math.floor(i / SIZE)
    const col = i % SIZE
    const moves = {
      ArrowUp: row > 0 ? i - SIZE : i,
      ArrowDown: row < SIZE - 1 ? i + SIZE : i,
      ArrowLeft: col > 0 ? i - 1 : i,
      ArrowRight: col < SIZE - 1 ? i + 1 : i,
    }
    if (e.key in moves) {
      e.preventDefault()
      moveCursor(moves[e.key])
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault()
      flag(i)
    }
  }

  const mood = game.status === 'lost' ? 'lost' : game.status === 'won' ? 'won' : pressing ? 'tense' : 'play'

  const label = (cell, i) => {
    const where = t.cell(Math.floor(i / SIZE) + 1, (i % SIZE) + 1)
    if (cell.flag && !cell.open) return `${where}: ${t.flagged}`
    if (!cell.open) return `${where}: ${t.hidden}`
    if (cell.mine) return `${where}: ${t.mine}`
    return `${where}: ${cell.count || t.empty}`
  }

  return (
    <div className="ro-mines">
      <div className="ro-mines__bar ro-inset">
        <span className="ro-led" aria-label={t.minesLeft(MINES - flags)}>
          {pad3(MINES - flags)}
        </span>
        <button
          type="button"
          className="ro-face-btn ro-raised"
          onClick={() => {
            dispatch({ type: 'reset' })
            setCursor(40)
          }}
          aria-label={t.newGame}
          title={t.newGame}
        >
          <Face mood={mood} />
        </button>
        <span className="ro-led" aria-label={t.time(seconds)}>
          {pad3(seconds)}
        </span>
      </div>

      <div
        ref={gridRef}
        className="ro-mines__grid ro-inset"
        role="grid"
        aria-label={t.help}
        onPointerDown={() => setPressing(true)}
        onPointerUp={() => setPressing(false)}
        onPointerLeave={() => setPressing(false)}
      >
        {Array.from({ length: SIZE }, (_, row) => (
          <div key={row} role="row" className="ro-mines__row">
            {game.board.slice(row * SIZE, row * SIZE + SIZE).map((cell, col) => {
              const i = row * SIZE + col
              return (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  data-i={i}
                  tabIndex={i === cursor ? 0 : -1}
                  className={[
                    'ro-cell',
                    cell.open ? 'is-open' : 'ro-raised',
                    cell.open && cell.mine ? 'is-mine' : '',
                    game.hit === i ? 'is-hit' : '',
                    cell.open && cell.count ? `n${cell.count}` : '',
                  ].join(' ')}
                  aria-label={label(cell, i)}
                  onFocus={() => setCursor(i)}
                  onClick={() => act(i)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    flag(i)
                  }}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  {cell.open ? (cell.mine ? '●' : cell.count || '') : cell.flag ? '⚑' : ''}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="ro-mines__foot">
        <label className="ro-check">
          <input type="checkbox" checked={flagMode} onChange={(e) => setFlagMode(e.target.checked)} />
          {t.flagMode}
        </label>
        <span className="ro-mines__msg" role="status">
          {game.status === 'won' ? t.won : game.status === 'lost' ? t.lost : ''}
        </span>
      </div>
    </div>
  )
}

export default Minesweeper
