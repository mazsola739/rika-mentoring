import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { tierByKey } from '@shared/tiers.js'
import { BACK_SHEET, BACK_SHIFT, BACK_WAVE, FRONT_LAYERS, VIEWBOX } from '@shared/ui/card-art.js'
import './card.css'

const pad = (n) => String(n).padStart(2, '0')

// Keeps the SVG at the card's own size even if outside CSS tries to resize SVGs.
const ART_STYLE = { position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }

// Title sizes to try, largest first, as [font size in cqw, most lines allowed].
// Every size on the card is relative to its width, so a fit found once holds at any card size.
const BACK_TITLE = [
  [4.77, 2],
  [4.4, 2],
  [4.0, 2],
  [3.64, 2],
  [3.3, 2],
  [3.3, 3],
]
const FRONT_TITLE = [
  [4.1, 4],
  [3.7, 4],
  [3.3, 5],
  [3.0, 5],
  [2.7, 5],
]

const fitCache = new Map()

// Measure only with the real fonts: a fallback font has other widths.
let fontsLoaded
const cardFonts = () =>
  (fontsLoaded ??= Promise.all(['700 16px Montserrat', '400 16px Inter', '700 16px Inter'].map((f) => document.fonts.load(f)))
    .catch(() => {})
    .then(() => document.fonts.ready))

// Picks the largest title size that keeps whole words on a line and stays within the line limit.
function useFitTitle(ref, key, steps) {
  const [size, setSize] = useState(() => fitCache.get(key) ?? steps[0][0])
  useLayoutEffect(() => {
    if (fitCache.has(key)) {
      setSize(fitCache.get(key))
      return
    }
    let live = true
    cardFonts().then(() => {
      const el = ref.current
      if (!live || !el?.isConnected || !el.clientWidth) return
      let pick = steps[steps.length - 1][0]
      for (const [s, maxLines] of steps) {
        el.style.setProperty('--fs', s)
        const lines = Math.round(el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight))
        if (el.scrollWidth <= el.clientWidth + 1 && lines <= maxLines) {
          pick = s
          break
        }
      }
      fitCache.set(key, pick)
      setSize(pick)
    })
    return () => {
      live = false
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  return size
}

// The filter only works on the card area plus a margin wider than the blur and the offset,
// so the paths' long tails outside the card cost nothing.
function Shadow({ id, blur, dx, dy, slope, top = -200 }) {
  return (
    <filter id={id} filterUnits="userSpaceOnUse" x="-200" y={top} width="1945" height="1400">
      <feGaussianBlur in="SourceAlpha" stdDeviation={blur} />
      <feOffset dx={dx} dy={dy} />
      <feComponentTransfer result="sh">
        <feFuncA type="linear" slope={slope} />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="sh" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  )
}

// Front art: three paper layers from the left, their shadow falling downward.
function FrontArt({ uid }) {
  return (
    <svg className="lc__art" viewBox={VIEWBOX} style={ART_STYLE} aria-hidden="true" focusable="false">
      <defs>
        <Shadow id={`${uid}f`} blur="30" dx="0" dy="44.9" slope="0.6" />
      </defs>
      {FRONT_LAYERS.map((layer) => (
        <g key={layer.tone}>
          <path className={`lc__${layer.tone}`} d={layer.d} filter={`url(#${uid}f)`} />
          <path className="lc__rim" d={layer.rim} transform="translate(-2.2 0)" />
        </g>
      ))}
    </svg>
  )
}

// Back art: a colour wave under the near-white sheet, the shadow falling right (light from the left).
function BackArt({ uid }) {
  return (
    <svg className="lc__art" viewBox={VIEWBOX} style={ART_STYLE} aria-hidden="true" focusable="false">
      <defs>
        <Shadow id={`${uid}b`} blur="28.6" dx="60.7" dy="-8.7" slope="0.754" top={-BACK_SHIFT - 200} />
      </defs>
      <g transform={`translate(0 ${BACK_SHIFT})`}>
        <path className="lc__b1" d={BACK_WAVE.d} filter={`url(#${uid}b)`} />
        <path className="lc__rim lc__rim--back" d={BACK_WAVE.rim} transform="translate(0 -2.2)" />
        <path className="lc__b2" d={BACK_SHEET} filter={`url(#${uid}b)`} />
      </g>
    </svg>
  )
}

const ICONS = {
  build: <path d="M7 10h3V7L6.5 3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1-3 3l-6-6a6 6 0 0 1-8-8L7 10" />,
  learn: (
    <>
      <path d="M3 12h1m8-9v1m8 8h1M5.6 5.6l.7.7m12.1-.7-.7.7" />
      <path d="M9 16a5 5 0 1 1 6 0 3.5 3.5 0 0 0-1 3 2 2 0 0 1-4 0 3.5 3.5 0 0 0-1-3M9.7 17h4.6" />
    </>
  ),
}

function Fact({ icon, label, text }) {
  return (
    <div className="lc__fact">
      <span className="lc__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          {ICONS[icon]}
        </svg>
      </span>
      <div>
        <dt className="lc__label">{label}</dt>
        <dd className="lc__txt">{text}</dd>
      </div>
    </div>
  )
}

// A lesson as a two-sided business card.
// Front: the traced paper waves, the lesson number, title and level. Click flips it.
// Back: what we build and learn, and the link to the lesson. Click (or Esc) flips it back.
// `copy` marks the carousel's looping duplicates: visible and clickable, but hidden from
// screen readers and the Tab order, so every lesson is announced once.
export default function LessonCard({ lesson, lang, t, color, copy = false, onFlipChange }) {
  const [flipped, setFlipped] = useState(false)
  const uid = 'lc' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const frontRef = useRef(null)
  const linkRef = useRef(null)
  const backTitleRef = useRef(null)
  const frontTitleRef = useRef(null)
  const moved = useRef(false)
  const text = lesson[lang]
  const tier = tierByKey(lesson.tier.key).label[lang]
  const backSize = useFitTitle(backTitleRef, `b|${text.title}`, BACK_TITLE)
  const frontSize = useFitTitle(frontTitleRef, `f|${text.title}`, FRONT_TITLE)

  // Tell the carousel to hold still while the back is open; move focus to the visible side.
  // (The carousel keeps a set of open cards, so repeated reports are harmless.)
  const report = useRef(onFlipChange)
  report.current = onFlipChange
  useEffect(() => {
    if (!moved.current) return
    report.current?.(flipped)
    if (!copy) (flipped ? linkRef : frontRef).current?.focus({ preventScroll: true })
  }, [flipped]) // eslint-disable-line react-hooks/exhaustive-deps

  // A card that disappears while open (tab change) releases the carousel.
  useEffect(() => () => report.current?.(false), [])

  const flip = (value) => {
    moved.current = true
    setFlipped(value)
  }
  const skip = copy ? -1 : undefined

  return (
    <div
      className={`lc${flipped ? ' is-flipped' : ''}`}
      style={{ '--c': color }}
      aria-hidden={copy || undefined}
      onKeyDown={(e) => e.key === 'Escape' && flipped && flip(false)}
    >
      <span className="lc__drop" aria-hidden="true" />
      <div className="lc__inner">
        <button
          ref={frontRef}
          type="button"
          className="lc__face lc__front"
          onClick={() => flip(true)}
          aria-label={`${t.lesson} ${lesson.n}: ${text.title}, ${tier}. ${t.showDetails}`}
          inert={flipped}
          tabIndex={skip}
        >
          <FrontArt uid={uid} />
          <span className="lc__front-text">
            <span className="lc__mark">
              <span>{pad(lesson.n)}</span>
            </span>
            <span ref={frontTitleRef} className="lc__title" style={{ '--fs': frontSize }}>
              {text.title}
            </span>
            <span className="lc__level">{tier}</span>
          </span>
        </button>

        <div
          className="lc__face lc__back"
          role="group"
          aria-label={text.title}
          inert={!flipped}
          onClick={(e) => {
            if (!e.target.closest('a, button')) flip(false)
          }}
        >
          <BackArt uid={uid} />
          <div className="lc__back-in">
            <div className="lc__head">
              <h3 ref={backTitleRef} className="lc__back-title" style={{ '--fs': backSize }}>
                {text.title}
              </h3>
              <p className="lc__sub">
                {t.lesson} {pad(lesson.n)} · {tier}
              </p>
            </div>
            <dl className="lc__facts">
              <Fact icon="build" label={t.build} text={text.card.build} />
              <Fact icon="learn" label={t.learn} text={text.card.learn} />
            </dl>
          </div>
          <a ref={linkRef} className="lc__open" href={`apps/${lesson.slug}/`} target="_blank" rel="noopener" tabIndex={skip}>
            {t.open}
            <span className="visually-hidden">
              : {text.title} ({t.newTab})
            </span>
          </a>
          <button type="button" className="lc__unflip" onClick={() => flip(false)} tabIndex={skip}>
            {t.flipBack}
          </button>
        </div>
      </div>
    </div>
  )
}
