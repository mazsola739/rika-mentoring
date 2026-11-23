import { useEffect, useMemo, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { useShows } from './useShows.js'
import { FALLBACK_SHOWS } from './fallbackShows.js'
import SwipeCard from './SwipeCard.jsx'
import ShowArt from './ShowArt.jsx'
import { TEXT, genreLabel } from './text.js'
import './app.css'

const FLY_OUT_MS = 280

const isDecisionList = (value) =>
  Array.isArray(value) &&
  value.every((d) => (d?.choice === 'like' || d?.choice === 'nope') && typeof d.show?.id === 'string' && typeof d.show?.name === 'string')

const newSeed = () => Math.floor(Math.random() * 2 ** 31)

// Seeded shuffle: the same seed always gives the same order, so re-renders never reshuffle the deck.
function shuffled(list, seed) {
  let s = seed
  const random = () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function topGenres(shows, limit = 10) {
  const counts = new Map()
  shows.forEach((show) => show.genres.forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1)))
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre]) => genre)
}

function Swipe() {
  const lang = useLang()
  const t = useText(TEXT)
  const { status, shows, retry } = useShows()
  const [decisions, setDecisions] = useLocalStorage('rika:swipe:decisions', [], isDecisionList)
  const [seed, setSeed] = useState(newSeed)
  const [genre, setGenre] = useState('all')
  const [pinned, setPinned] = useState(null) // a show put back on top by "undo"
  const [leaving, setLeaving] = useState(null) // { show, choice } while the top card flies away
  const [message, setMessage] = useState('')

  const decidedIds = useMemo(() => new Set(decisions.map((d) => d.show.id)), [decisions])

  // The deck is derived state: shuffled shows minus the decided ones, filtered by genre.
  const deck = useMemo(() => {
    const pool = shuffled(shows, seed)
    if (pinned && !pool.some((s) => s.id === pinned.id)) pool.unshift(pinned)
    const list = pool.filter((s) => !decidedIds.has(s.id) && (genre === 'all' || s.genres.includes(genre)))
    const i = pinned ? list.findIndex((s) => s.id === pinned.id) : -1
    if (i > 0) list.unshift(...list.splice(i, 1))
    return list
  }, [shows, seed, pinned, decidedIds, genre])

  const genres = useMemo(() => topGenres(shows), [shows])
  const seen = shows.filter((s) => decidedIds.has(s.id)).length
  const ready = status !== 'loading'

  // Liked shows, newest first. Prefer the fresh copy (image URLs can change between builds).
  const liked = useMemo(() => {
    const byId = new Map([...FALLBACK_SHOWS, ...shows].map((s) => [s.id, s]))
    return decisions
      .filter((d) => d.choice === 'like')
      .map((d) => byId.get(d.show.id) ?? d.show)
      .reverse()
  }, [decisions, shows])

  const decide = (choice) => {
    const show = deck[0]
    if (!ready || !show || leaving) return false
    setLeaving({ show, choice })
    setMessage(choice === 'like' ? t.likedMsg(show.name) : t.nopedMsg(show.name))
    return true
  }

  // Commit the decision once the fly-out animation has played. The cleanup cancels the timer.
  useEffect(() => {
    if (!leaving) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setTimeout(
      () => {
        setDecisions((list) => [...list, { choice: leaving.choice, show: leaving.show }])
        setPinned((p) => (p?.id === leaving.show.id ? null : p))
        setLeaving(null)
      },
      reduced ? 0 : FLY_OUT_MS,
    )
    return () => clearTimeout(timer)
  }, [leaving, setDecisions])

  const undo = () => {
    if (leaving || decisions.length === 0) return
    const last = decisions[decisions.length - 1]
    setDecisions((list) => list.slice(0, -1))
    setPinned(last.show)
    if (genre !== 'all' && !last.show.genres?.includes(genre)) setGenre('all')
    setMessage(t.undoneMsg(last.show.name))
  }

  const unlike = (id) => {
    setDecisions((list) => list.map((d) => (d.show.id === id ? { ...d, choice: 'nope' } : d)))
  }

  const reset = () => {
    if (decisions.length > 0 && !window.confirm(t.resetConfirm)) return
    setDecisions([])
    setPinned(null)
    setLeaving(null)
    setGenre('all')
    setSeed(newSeed())
  }

  // ← and → anywhere on the page. A ref always points to the latest `decide`,
  // so the listener is added only once.
  const decideRef = useRef(decide)
  useEffect(() => {
    decideRef.current = decide
  })
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      if (e.target instanceof Element && e.target.closest('input, select, textarea, [contenteditable="true"]')) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        decideRef.current(e.key === 'ArrowRight' ? 'like' : 'nope')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const visible = deck.slice(0, leaving ? 4 : 3)
  const othersLeft = shows.some((s) => !decidedIds.has(s.id))

  let stage
  if (!ready) {
    stage = (
      <div className="sw-deck">
        <div className="sw-card sw-card--skeleton" role="status">
          <span className="sw-spinner" aria-hidden="true" />
          <p>{t.loading}</p>
        </div>
      </div>
    )
  } else if (deck.length === 0) {
    stage = (
      <div className="sw-deck">
        <div className="sw-card sw-card--empty">
          {genre !== 'all' && othersLeft ? (
            <>
              <p className="sw-empty__title">{t.genreDone}</p>
              <button type="button" className="btn" onClick={() => setGenre('all')}>
                {t.showAll}
              </button>
            </>
          ) : (
            <>
              <p className="sw-empty__title">{t.doneTitle}</p>
              <p>{t.doneText(liked.length)}</p>
              <button type="button" className="btn" onClick={reset}>
                {t.reset}
              </button>
            </>
          )}
        </div>
      </div>
    )
  } else {
    stage = (
      <div className="sw-deck" role="group" aria-label={t.deckLabel}>
        {visible.map((show, i) => {
          const isLeaving = leaving && i === 0
          const depth = leaving ? Math.max(0, i - 1) : i
          return (
            <SwipeCard
              key={show.id}
              show={show}
              depth={depth}
              layer={10 - i}
              leaving={isLeaving ? leaving.choice : null}
              locked={Boolean(leaving)}
              onSwipe={decide}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="sw">
      {status === 'fallback' && (
        <div className="sw-notice" role="status">
          <p>{t.offline}</p>
          <button type="button" className="btn btn--ghost" onClick={retry}>
            {t.retry}
          </button>
        </div>
      )}

      <div className="sw-layout">
        <div className="sw-main">
          <div className="sw-toolbar">
            <label className="field sw-genre">
              <span>{t.genre}</span>
              <select className="input" value={genre} disabled={!ready} onChange={(e) => setGenre(e.target.value)}>
                <option value="all">{t.allGenres}</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {genreLabel(g, lang)}
                  </option>
                ))}
              </select>
            </label>
            {ready && <p className="sw-progress">{t.progress(seen, shows.length)}</p>}
          </div>

          <div className="sw-stage">{stage}</div>

          <div className="sw-actions">
            <button
              type="button"
              className="sw-btn sw-btn--nope"
              disabled={!ready || deck.length === 0}
              aria-keyshortcuts="ArrowLeft"
              onClick={() => decide('nope')}
            >
              <span className="sw-btn__icon" aria-hidden="true">
                ✕
              </span>
              {t.nope}
            </button>
            <button type="button" className="sw-btn sw-btn--undo" disabled={decisions.length === 0} onClick={undo}>
              <span className="sw-btn__icon" aria-hidden="true">
                ↶
              </span>
              {t.undo}
            </button>
            <button
              type="button"
              className="sw-btn sw-btn--like"
              disabled={!ready || deck.length === 0}
              aria-keyshortcuts="ArrowRight"
              onClick={() => decide('like')}
            >
              <span className="sw-btn__icon" aria-hidden="true">
                ♥
              </span>
              {t.like}
            </button>
          </div>
          <p className="sw-hint">{t.hint}</p>
        </div>

        <section className="sw-liked" aria-labelledby="sw-liked-title">
          <div className="sw-liked__head">
            <h3 id="sw-liked-title">{t.liked}</h3>
            <span className="sw-count">{liked.length}</span>
          </div>
          {liked.length > 0 ? (
            <ul className="sw-liked__list">
              {liked.map((show) => (
                <li key={show.id} className="sw-liked__item">
                  {show.thumb || show.image ? (
                    <img src={show.thumb ?? show.image} alt="" loading="lazy" />
                  ) : (
                    <ShowArt name={show.name} className="sw-liked__art" />
                  )}
                  <div>
                    <strong>{show.name}</strong>
                    <span>
                      {[show.year, ...(show.genres ?? []).slice(0, 2).map((g) => genreLabel(g, lang))].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <button type="button" className="sw-remove" aria-label={t.removeLike(show.name)} title={t.removeLike(show.name)} onClick={() => unlike(show.id)}>
                    <span aria-hidden="true">✕</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sw-muted">{t.noLikes}</p>
          )}
          {decisions.length > 0 && (
            <button type="button" className="sw-link" onClick={reset}>
              {t.reset}
            </button>
          )}
        </section>
      </div>

      <p className="sw-credit">
        {t.credit}{' '}
        <a href="https://www.tvmaze.com/" target="_blank" rel="noreferrer">
          TVmaze
        </a>{' '}
        (CC BY-SA)
      </p>

      <p className="visually-hidden" aria-live="polite">
        {message}
      </p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="swipe">
      <Swipe />
    </AppFrame>
  )
}
