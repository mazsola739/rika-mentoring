import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import AppFrame, { useLesson } from '@shared/ui/AppFrame.jsx'
import LevelMeter from '@shared/ui/LevelMeter.jsx'
import { useText } from '@shared/i18n.js'
import { MAX_LEVEL, createGame, levelOf, step, tickMs, turn } from './engine.js'
import { drawGame } from './draw.js'
import './app.css'

const TEXT = {
  en: {
    intro:
      'Steer the snake with the arrow keys or WASD, eat the glowing dots and grow. Every third bite makes it faster. Keep away from the walls and your own tail.',
    score: 'Score',
    best: 'High score',
    speed: 'Speed',
    pause: 'Pause',
    resume: 'Resume',
    start: 'Start',
    stage: 'Game board. Steer with the arrow keys or WASD, pause with Space or P.',
    canvas: (score) => `Snake board, score ${score}`,
    readyTitle: 'Ready?',
    readyHint: 'Press Start, Space or an arrow key.',
    pausedTitle: 'Paused',
    pausedHint: 'Press Space or P to continue.',
    overTitle: 'Game over',
    overScore: (score) => `You scored ${score} points.`,
    newBest: 'New high score!',
    again: 'Play again',
    pad: 'Direction buttons',
    dirs: { up: 'Up', left: 'Left', right: 'Right', down: 'Down' },
    keys: 'Arrows or WASD steer · Space or P pauses · on touch screens you can also swipe on the board',
    announceOver: (score, record) => `Game over. ${score} points.${record ? ' New high score!' : ''}`,
  },
  hu: {
    intro:
      'Irányítsd a kígyót a nyilakkal vagy a WASD gombokkal, edd meg a világító pöttyöket, és nőj egyre hosszabbra. Minden harmadik falat után gyorsul. Kerüld el a falat és a saját farkadat.',
    score: 'Pontszám',
    best: 'Rekord',
    speed: 'Sebesség',
    pause: 'Szünet',
    resume: 'Folytatás',
    start: 'Start',
    stage: 'Játéktábla. A nyilakkal vagy a WASD gombokkal kormányozhatsz, a Szóköz vagy a P szünetet tart.',
    canvas: (score) => `Kígyós tábla, ${score} pont`,
    readyTitle: 'Kezdhetjük?',
    readyHint: 'Nyomd meg a Start gombot, a Szóközt vagy egy nyilat.',
    pausedTitle: 'Szünet',
    pausedHint: 'A Szóközzel vagy a P-vel folytathatod.',
    overTitle: 'Vége a játéknak',
    overScore: (score) => `${score} pontot szereztél.`,
    newBest: 'Új rekord!',
    again: 'Új játék',
    pad: 'Irányítógombok',
    dirs: { up: 'Fel', left: 'Balra', right: 'Jobbra', down: 'Le' },
    keys: 'Nyilak vagy WASD: kormányzás · Szóköz vagy P: szünet · érintőképernyőn a táblán húzással is irányíthatsz',
    announceOver: (score, record) => `Vége a játéknak. ${score} pont.${record ? ' Új rekord!' : ''}`,
  },
}

const BEST_KEY = 'rika:snake:best'
const KEY_DIRS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' }
const PAD = [
  ['up', '▲'],
  ['left', '◀'],
  ['right', '▶'],
  ['down', '▼'],
]

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function Snake() {
  const t = useText(TEXT)
  const { palette } = useLesson()
  // Canvas colours straight from the lesson palette (Jewel Bloom).
  const colors = useMemo(
    () => ({
      board: palette.colors[0],
      head: palette.colors[1],
      tail: palette.colors.at(-1),
      food: palette.colors[2],
      spark: palette.accent,
    }),
    [palette],
  )

  // The game itself lives in a ref: the loop reads and writes it 60 times a second without re-rendering.
  // React state holds only what the UI shows (status, score, speed, high score).
  const gameRef = useRef(null)
  if (gameRef.current === null) gameRef.current = createGame()
  const canvasRef = useRef(null)
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const swipeRef = useRef(null)

  const [status, setStatus] = useState('ready') // 'ready' | 'running' | 'paused' | 'over'
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [best, setBest] = useState(loadBest)
  const [bestAtStart, setBestAtStart] = useState(0)

  const paint = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) drawGame(ctx, gameRef.current, colors)
  }, [colors])

  // Sharp pixels on every screen: the drawing buffer follows the CSS size × devicePixelRatio.
  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      const px = Math.round(canvas.clientWidth * (window.devicePixelRatio || 1))
      if (px > 0 && canvas.width !== px) {
        canvas.width = px
        canvas.height = px
      }
      paint()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [paint])

  useEffect(() => {
    try {
      localStorage.setItem(BEST_KEY, String(best))
    } catch {
      // storage blocked: the high score lasts for this visit only
    }
  }, [best])

  // The game loop. requestAnimationFrame paints every frame; the accumulator moves the snake one cell
  // whenever a full tick has passed. The cleanup cancels the next frame on pause, game over or unmount.
  useEffect(() => {
    if (status !== 'running') return
    let frame = 0
    let last = performance.now()
    let acc = 0
    const loop = (now) => {
      acc = Math.min(acc + now - last, 300) // after a slow frame, do not jump several cells at once
      last = now
      const before = gameRef.current
      let game = before
      while (!game.over && acc >= tickMs(game)) {
        acc -= tickMs(game)
        game = step(game)
      }
      gameRef.current = game
      paint()
      if (game.score !== before.score) {
        setScore(game.score)
        setLevel(levelOf(game))
      }
      if (game.over) {
        setStatus('over')
        setBest((b) => Math.max(b, game.score))
        return
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [status, paint])

  // Leaving the tab pauses the game instead of letting the snake crash unseen.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setStatus((s) => (s === 'running' ? 'paused' : s))
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const start = () => {
    if (gameRef.current.over) {
      gameRef.current = createGame()
      setScore(0)
      setLevel(1)
      paint()
    }
    setBestAtStart(best)
    setStatus('running')
    stageRef.current?.focus({ preventScroll: true })
  }

  const togglePause = () => {
    if (status === 'running') setStatus('paused')
    else if (status === 'paused') setStatus('running')
    else start()
  }

  const steer = (dir) => {
    if (status === 'paused') setStatus('running')
    else if (status !== 'running') start()
    gameRef.current = turn(gameRef.current, dir)
  }

  // Global keyboard: while the game runs, arrows always steer (and do not scroll the page).
  // Otherwise keys only count when the focus is inside the game, so normal page scrolling still works.
  const onKeyRef = useRef(null)
  useLayoutEffect(() => {
    onKeyRef.current = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest('input, textarea, select')) return
      const inside = rootRef.current?.contains(document.activeElement)
      if (status !== 'running' && !inside) return

      const dir = KEY_DIRS[e.key] ?? KEY_DIRS[e.key.toLowerCase()]
      if (dir) {
        e.preventDefault()
        steer(dir)
      } else if ((e.key === ' ' && !target?.closest('button')) || e.key.toLowerCase() === 'p') {
        e.preventDefault()
        togglePause()
      }
    }
  })
  useEffect(() => {
    const listener = (e) => onKeyRef.current(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  // Swipe (or tap to start) on touch screens.
  const onPointerDown = (e) => {
    swipeRef.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e) => {
    const from = swipeRef.current
    swipeRef.current = null
    if (!from) return
    const dx = e.clientX - from.x
    const dy = e.clientY - from.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) {
      if (status !== 'running') togglePause()
      return
    }
    steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
  }

  const newRecord = status === 'over' && score > 0 && score > bestAtStart

  return (
    <div className="sn" ref={rootRef}>
      <p className="sn__intro">{t.intro}</p>

      <div className="sn__bar">
        <dl className="sn-stats">
          <div>
            <dt>{t.score}</dt>
            <dd>{score}</dd>
          </div>
          <div>
            <dt>{t.best}</dt>
            <dd>{best}</dd>
          </div>
          <div>
            <dt>{t.speed}</dt>
            <dd className="sn-stats__speed">
              <LevelMeter value={level} max={MAX_LEVEL} className="sn-stats__meter" />
              {level}
            </dd>
          </div>
        </dl>
        <button type="button" className="btn btn--ghost" onClick={togglePause} disabled={status === 'over' || status === 'ready'}>
          {status === 'paused' ? t.resume : t.pause}
        </button>
      </div>

      <div className="sn-stage" ref={stageRef} tabIndex={0} aria-label={t.stage}>
        <canvas
          ref={canvasRef}
          className="sn-canvas"
          role="img"
          aria-label={t.canvas(score)}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeRef.current = null)}
        />
        {status !== 'running' && (
          <div className="sn-overlay">
            {status === 'ready' && (
              <>
                <h3>{t.readyTitle}</h3>
                <p>{t.readyHint}</p>
                <button type="button" className="btn" onClick={start}>
                  {t.start}
                </button>
              </>
            )}
            {status === 'paused' && (
              <>
                <h3>{t.pausedTitle}</h3>
                <p>{t.pausedHint}</p>
                <button type="button" className="btn" onClick={() => setStatus('running')}>
                  {t.resume}
                </button>
              </>
            )}
            {status === 'over' && (
              <>
                <h3>{t.overTitle}</h3>
                <p>{t.overScore(score)}</p>
                {newRecord && <p className="sn-overlay__record">{t.newBest}</p>}
                <button type="button" className="btn" onClick={start}>
                  {t.again}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="sn-pad" role="group" aria-label={t.pad}>
        {PAD.map(([dir, arrow]) => (
          <button
            key={dir}
            type="button"
            className={`sn-pad__btn sn-pad__btn--${dir}`}
            aria-label={t.dirs[dir]}
            // pointerdown reacts instantly on touch; detail === 0 means the click came from the keyboard.
            onPointerDown={(e) => {
              e.preventDefault()
              steer(dir)
            }}
            onClick={(e) => e.detail === 0 && steer(dir)}
          >
            <span aria-hidden="true">{arrow}</span>
          </button>
        ))}
      </div>

      <p className="sn__keys">{t.keys}</p>
      <p className="visually-hidden" aria-live="polite">
        {status === 'over' ? t.announceOver(score, newRecord) : status === 'paused' ? t.pausedTitle : ''}
      </p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="snake">
      <Snake />
    </AppFrame>
  )
}
