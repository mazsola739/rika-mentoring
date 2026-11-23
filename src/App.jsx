import { useEffect, useMemo, useRef, useState } from 'react'
import lessons from '@shared/lessons.json'
import { TIERS } from '@shared/tiers.js'
import { useLang, useText } from '@shared/i18n.js'
import { PALETTES, PEACOCK_COLORS, paletteFor, paletteVars, rainbowRank } from '@shared/ui/palette.js'
import LevelMeter from '@shared/ui/LevelMeter.jsx'
import LangSwitch from '@shared/ui/LangSwitch.jsx'
import LessonCard from './card/LessonCard.jsx'
import Carousel from './Carousel.jsx'
import { SHELL_TEXT } from './text.js'
import heroLarge from './assets/peacock-hero.webp'
import heroSmall from './assets/peacock-hero-small.webp'

const pad = (n) => String(n).padStart(2, '0')

// Accent-insensitive search: "hazi" also finds "házi".
const normalize = (s) => s.toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// Fisher–Yates shuffle: a fresh random order for the carousel.
function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// The gallery lists lessons easiest first. Lesson colors follow the same order along the rainbow,
// so they also blend from card to card.
const byNumber = (list) => [...list].sort((a, b) => a.n - b.n)

// Two lessons look alike when they sit close together on the rainbow.
const similar = (x, y) => Math.abs(rainbowRank(x.n) - rainbowRank(y.n)) < 5
const hasClash = (a) => a.some((l, i) => a.length > 1 && similar(l, a[(i + 1) % a.length]))

// A random order in which no two neighbours look alike
// (the row loops, so the last card is also the first one's neighbour).
function shuffleSpread(list) {
  let a = list
  for (let attempt = 0; attempt < 30; attempt++) {
    a = spreadColors(shuffle(list))
    if (!hasClash(a)) break
  }
  return a
}

// Moves a later card forward wherever two neighbours look alike.
function spreadColors(list) {
  const a = [...list]
  for (let i = 1; i < a.length; i++) {
    const clash = (x) => similar(x, a[i - 1]) || (i === a.length - 1 && similar(x, a[0]))
    if (!clash(a[i])) continue
    const j = a.findIndex((x, k) => k > i && !clash(x))
    if (j > 0) [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const TABS = ['all', ...TIERS.map((tr) => tr.key)]

// Level tabs. Arrow keys, Home and End move between them (and select).
function LevelTabs({ tier, setTier, counts, lang, t }) {
  const refs = useRef({})
  const onKeyDown = (e) => {
    const i = TABS.indexOf(tier)
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    const key = TABS[(next + TABS.length) % TABS.length]
    setTier(key)
    refs.current[key]?.focus()
  }
  return (
    <div className="tabs" role="tablist" aria-label={t.filterLabel} onKeyDown={onKeyDown}>
      {TABS.map((key) => {
        const tr = TIERS.find((x) => x.key === key)
        return (
          <button
            key={key}
            ref={(el) => (refs.current[key] = el)}
            type="button"
            role="tab"
            id={`tab-${key}`}
            className="tab"
            aria-selected={tier === key}
            aria-controls="lessons-panel"
            tabIndex={tier === key ? 0 : -1}
            onClick={() => setTier(key)}
          >
            {tr && <LevelMeter value={tr.buttons} max={4} />}
            {tr ? tr.label[lang] : t.all}
            <span className="tab__count">{counts[key]}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function App() {
  const lang = useLang()
  const t = useText(SHELL_TEXT)
  const [tier, setTier] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.title = t.docTitle
  }, [t.docTitle])

  const byTier = useMemo(
    () => ({ all: lessons, ...Object.fromEntries(TIERS.map((tr) => [tr.key, lessons.filter((l) => l.tier.key === tr.key)])) }),
    [],
  )
  const counts = useMemo(() => Object.fromEntries(TABS.map((key) => [key, byTier[key].length])), [byTier])

  // The carousel shows every lesson, in a new random order on each visit.
  const shuffled = useMemo(() => shuffleSpread(lessons), [])

  // The gallery: the open tab's lessons, easiest first, narrowed by the search.
  const q = normalize(query.trim())
  const listed = useMemo(() => {
    const list = byNumber(byTier[tier])
    if (!q) return list
    return list.filter((l) => {
      const x = l[lang]
      return normalize(`${x.title} ${x.short} ${x.learn} ${x.card.build} ${x.card.learn}`).includes(q)
    })
  }, [byTier, tier, q, lang])

  // A level's color: the color of its middle lesson, as the levels follow the rainbow too.
  const tierColor = (key) => {
    const list = byTier[key]
    return paletteFor(list[Math.floor((list.length - 1) / 2)].n).solid
  }

  const card = (lesson, extra) => <LessonCard lesson={lesson} lang={lang} t={t} color={paletteFor(lesson.n).solid} {...extra} />

  const showLevel = (key) => {
    setTier(key)
    setQuery('')
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="home">
      {/* Hero with the peacock header image */}
      <section className="hero" aria-labelledby="hero-title">
        <picture className="hero__image" aria-hidden="true">
          <source media="(max-width: 700px)" srcSet={heroSmall} />
          <img src={heroLarge} alt="" fetchPriority="high" />
        </picture>

        <nav className="topnav container" aria-label="Rika Mentoring">
          <a className="brand" href="./" aria-label="Rika Mentoring">
            <span className="brand__mark" aria-hidden="true">
              R
            </span>
            <span className="brand__name">Rika Mentoring</span>
          </a>
          <div className="topnav__links">
            <a href="#path">{t.nav.path}</a>
            <a href="#lessons">{t.nav.lessons}</a>
            <a href="#stack">{t.nav.stack}</a>
          </div>
          <LangSwitch className="langswitch--dark" />
        </nav>

        <div className="hero__body container">
          <p className="hero__kicker">{t.kicker}</p>
          <h1 id="hero-title" className="hero__title">
            {t.titleLead} <span className="hero__title-accent">{t.titleRest}</span>
          </h1>
          <p className="hero__lead">{t.lead}</p>
          <div className="hero__actions">
            <a className="hero__cta" href="#lessons">
              {t.cta} <span aria-hidden="true">→</span>
            </a>
            <a className="hero__cta hero__cta--ghost" href="#path">
              {t.ctaSecondary}
            </a>
          </div>
        </div>

        <div className="hero__strip" aria-hidden="true">
          {PEACOCK_COLORS.slice(1).map((c) => (
            <span key={c} style={{ background: c }} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats container" aria-label="Rika Mentoring">
        <dl>
          {t.stats.map(([value, label]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Learning path */}
      <section id="path" className="path container" aria-labelledby="path-title">
        <p className="kicker">{t.pathKicker}</p>
        <h2 id="path-title" className="section-title">
          {t.pathTitle}
        </h2>
        <p className="section-lead">{t.pathLead}</p>
        <ol className="path__steps">
          {TIERS.map((tr, i) => (
            <li key={tr.key} className="path__step" style={{ '--c': tierColor(tr.key) }}>
              <div className="path__top">
                <span className="path__index">{pad(i + 1)}</span>
                <LevelMeter value={tr.buttons} max={4} />
              </div>
              <h3>{tr.label[lang]}</h3>
              <p>{t.pathItems[tr.key]}</p>
              <ul className="path__examples">
                {byTier[tr.key].slice(0, 3).map((l) => (
                  <li key={l.slug}>{l[lang].title}</li>
                ))}
              </ul>
              <button type="button" className="path__link" onClick={() => showLevel(tr.key)}>
                {t.pathView(byTier[tr.key].length)} <span aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {/* Lessons */}
      <main id="lessons" className="lessons container" aria-labelledby="lessons-title">
        <p className="kicker">{t.sectionKicker}</p>
        <h2 id="lessons-title" className="section-title">
          {t.sectionTitle}
        </h2>
        <p className="section-lead">{t.sectionLead}</p>

        {/* Every lesson in a drifting row, in random order */}
        <div className="lessons__carousel">
          <Carousel
            items={shuffled}
            getKey={(l) => l.slug}
            renderItem={card}
            label={t.carouselLabel}
            t={t}
            head={
              <p className="lessons__count">
                {t.carouselHead(shuffled.length)} <span className="lessons__tip">· {t.flipTip}</span>
              </p>
            }
          />
        </div>

        {/* The gallery: level tabs and every card in rainbow order */}
        <section id="gallery" className="gallery" aria-labelledby="gallery-title">
          <div className="gallery__head">
            <h3 id="gallery-title" className="gallery__title">
              {t.galleryTitle}
            </h3>
            <label className="search">
              <span className="visually-hidden">{t.searchLabel}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input type="search" value={query} placeholder={t.searchPlaceholder} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>
          <LevelTabs tier={tier} setTier={setTier} counts={counts} lang={lang} t={t} />

          <div id="lessons-panel" role="tabpanel" aria-labelledby={`tab-${tier}`} className="lessons__panel">
            <p className="lessons__count" aria-live="polite">
              {t.count(listed.length)} <span className="lessons__tip">· {t.galleryTip}</span>
            </p>
            {listed.length ? (
              <ul className="grid">
                {listed.map((lesson) => (
                  <li key={lesson.slug}>{card(lesson)}</li>
                ))}
              </ul>
            ) : (
              <div className="empty">
                <p>{t.empty}</p>
                <button
                  type="button"
                  className="filter"
                  onClick={() => {
                    setTier('all')
                    setQuery('')
                  }}
                >
                  {t.reset}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* How it's built */}
      <section id="stack" className="stack" aria-labelledby="stack-title">
        <div className="container">
          <p className="kicker">{t.stackKicker}</p>
          <h2 id="stack-title" className="section-title">
            {t.stackTitle}
          </h2>
          <ul className="stack__grid">
            {t.stackItems.map(([title, body], i) => (
              <li key={title} style={paletteVars(PALETTES[i % PALETTES.length])}>
                <span className="stack__dot" aria-hidden="true" />
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="site-foot">
        <div className="site-foot__grid container">
          <div className="site-foot__brand">
            <a className="brand" href="./">
              <span className="brand__mark" aria-hidden="true">
                R
              </span>
              <span className="brand__name">Rika Mentoring</span>
            </a>
            <p>{t.footerTagline}</p>
          </div>
          <div>
            <h3>{t.footerLevels}</h3>
            <ul>
              {TIERS.map((tr) => (
                <li key={tr.key}>
                  <button type="button" onClick={() => showLevel(tr.key)}>
                    {tr.label[lang]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t.footerProject}</h3>
            <ul>
              {t.footerProjectItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="site-foot__bottom container">
          <span>{t.footerCopy}</span>
          <span className="site-foot__colors" aria-hidden="true">
            {PEACOCK_COLORS.slice(1).map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </span>
        </div>
      </footer>
    </div>
  )
}
