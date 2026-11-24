import { Suspense, createContext, lazy, useContext, useEffect, useState } from 'react'
import lessons from '../lessons.json'
import site from '../site.json'
import { tierByKey } from '../tiers.js'
import { useLang, useText } from '../i18n.js'
import { paletteFor, paletteVars } from './palette.js'
import { FRAME_TEXT } from './strings.js'
import LevelMeter from './LevelMeter.jsx'
import LangSwitch from './LangSwitch.jsx'
import PaperWaves from './PaperWaves.jsx'
import Inline from './Inline.jsx'
import { hasGuide } from './guide/guides.js'
import UnderConstruction from './UnderConstruction.jsx'

// The guide viewer loads only when the Guide tab is opened.
const GuideView = lazy(() => import('./guide/GuideView.jsx'))

const LessonContext = createContext(null)

// Any app component can read the current lesson, in the current language.
export function useLesson() {
  return useContext(LessonContext)
}

const pad = (n) => String(n).padStart(2, '0')

// Which tab is open: ?view=guide or ?view=solution in the address. A query parameter, not the hash,
// because many lesson apps route with the hash (#/projects/…).
const VIEWS = ['guide', 'solution']
function viewFromUrl(guideExists) {
  const asked = new URLSearchParams(window.location.search).get('view')
  if (asked === 'solution' || (asked === 'guide' && guideExists)) return asked
  return guideExists ? 'guide' : 'solution'
}

// The shared lesson page around every app: dark top bar, a dark header with paper-cut waves
// (like the front of the lesson card), and two tabs: the step-by-step guide and the solution
// (the app itself with the lesson details). The tab bar links to the lesson's exercise folder on GitHub.
// Lesson pages live at lessons/<NN-slug>/solution/, so the site root is three folders up.
export default function AppFrame({ slug, children }) {
  const lang = useLang()
  const t = useText(FRAME_TEXT)
  const index = lessons.findIndex((l) => l.slug === slug)
  if (index === -1) throw new Error(`Unknown lesson: ${slug}`)

  const lesson = lessons[index]
  const prev = lessons[index - 1]
  const next = lessons[index + 1]
  const text = lesson[lang]
  const tier = tierByKey(lesson.tier.key)
  const palette = paletteFor(lesson.n)
  const value = { ...lesson, text, lang, palette }
  const guideExists = hasGuide(slug)
  // The exercise (the starting project) is a folder of the one repository: lessons/<NN-slug>/exercise.
  const exercise = lesson.exercise
    ? { path: `lessons/${lesson.dir}/exercise`, url: `${site.repo}/tree/${site.branch}/lessons/${lesson.dir}/exercise` }
    : null
  const [view, setView] = useState(() => viewFromUrl(guideExists))

  // Back and forward move between the tabs too.
  useEffect(() => {
    const onPop = () => setView(viewFromUrl(guideExists))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [guideExists])

  const openView = (next, event) => {
    event?.preventDefault()
    if (next === view) return
    const url = new URL(window.location.href)
    url.searchParams.set('view', next)
    url.hash = '' // a step anchor of the guide means nothing to the app, and the other way round
    window.history.pushState(null, '', url)
    setView(next)
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    document.title = `${pad(lesson.n)} · ${text.title} – Rika Mentoring`
  }, [lesson.n, text.title])

  return (
    <LessonContext.Provider value={value}>
      <div className="lesson-page" style={paletteVars(palette)}>
        <UnderConstruction lang={lang} />
        <div className="lp-topbar">
          <div className="lp-topbar__inner container">
            <a className="lp-brand" href="../../../">
              <span className="lp-brand__mark" aria-hidden="true">
                R
              </span>
              <span className="lp-brand__name">Rika Mentoring</span>
            </a>
            <nav className="lp-crumbs" aria-label="Breadcrumb">
              <a href="../../../#lessons">{t.home}</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">
                {pad(lesson.n)} · {text.title}
              </span>
            </nav>
            <LangSwitch className="langswitch--dark" />
          </div>
        </div>

        <header className="lp-head">
          <PaperWaves className="lp-head__waves" />
          <div className="lp-head__inner container">
            <span className="lp-head__num" aria-hidden="true">
              {pad(lesson.n)}
            </span>
            <div className="lp-title__meta">
              <span className="lp-badge">
                {t.lesson} {pad(lesson.n)}
              </span>
              <span className="lp-title__tier">
                <LevelMeter value={lesson.tier.buttons} max={4} label={`${t.level}: ${tier.label[lang]}`} />
                {tier.label[lang]}
              </span>
            </div>
            <h1 className="lp-title">{text.title}</h1>
            <p className="lp-lead">{text.short}</p>
          </div>
        </header>

        <div className="lp-tabs">
          <div className="lp-tabs__inner container">
            <nav className="lp-tabs__list" aria-label={t.viewsLabel}>
              {VIEWS.map((key) =>
                key === 'guide' && !guideExists ? (
                  <span key={key} className="lp-tab is-disabled">
                    {t.tabGuide} <small>{t.soon}</small>
                  </span>
                ) : (
                  <a
                    key={key}
                    className="lp-tab"
                    href={`?view=${key}`}
                    aria-current={view === key ? 'page' : undefined}
                    onClick={(e) => openView(key, e)}
                  >
                    {key === 'guide' ? t.tabGuide : t.tabSolution}
                  </a>
                ),
              )}
            </nav>
            {exercise && (
              <a className="lp-starter" href={exercise.url} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
                </svg>
                {t.exerciseButton}
                <span className="visually-hidden"> ({t.newTab})</span>
              </a>
            )}
          </div>
        </div>

        {view === 'guide' ? (
          <Suspense fallback={<p className="gd-loading container">{t.guideLoading}</p>}>
            <GuideView
              slug={slug}
              lang={lang}
              t={{ ...t, levelNames: t.guideLevels }}
              exercise={exercise}
              onSolution={() => openView('solution')}
              next={
                next ? { href: `../../${next.dir}/solution/`, label: `${t.next}: ${pad(next.n)} · ${next[lang].title}` } : null
              }
            />
          </Suspense>
        ) : (
          <main className="lp-main container">
            <section className="lp-app panel" aria-label={t.appRegion}>
              {children}
            </section>

            <aside className="lp-aside panel" aria-label={t.lessonRegion}>
              <div>
                <h2>{t.learn}</h2>
                <p>
                  <Inline text={text.learn} />
                </p>
              </div>
              <div>
                <h2>{t.levels}</h2>
                <ol className="levels">
                  {[
                    [t.beginner, text.beginner, 1],
                    [t.intermediate, text.intermediate, 2],
                    [t.advanced, text.advanced, 3],
                  ].map(([name, body, count]) => (
                    <li key={count}>
                      <span className="levels__name">
                        <LevelMeter value={count} max={3} /> {name}
                      </span>
                      <Inline text={body} />
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </main>
        )}

        <nav className="lp-nav container" aria-label={`${t.prev} / ${t.next}`}>
          {prev && (
            <a href={`../../${prev.dir}/solution/`}>
              <small>← {t.prev}</small>
              <strong>
                {pad(prev.n)} · {prev[lang].title}
              </strong>
            </a>
          )}
          {next && (
            <a className="lp-nav__next" href={`../../${next.dir}/solution/`}>
              <small>{t.next} →</small>
              <strong>
                {pad(next.n)} · {next[lang].title}
              </strong>
            </a>
          )}
        </nav>
      </div>
    </LessonContext.Provider>
  )
}
