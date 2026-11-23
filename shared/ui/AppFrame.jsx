import { createContext, useContext, useEffect } from 'react'
import lessons from '../lessons.json'
import { tierByKey } from '../tiers.js'
import { useLang, useText } from '../i18n.js'
import { paletteFor, paletteVars } from './palette.js'
import { FRAME_TEXT } from './strings.js'
import LevelMeter from './LevelMeter.jsx'
import LangSwitch from './LangSwitch.jsx'
import PaperWaves from './PaperWaves.jsx'
import Inline from './Inline.jsx'

const LessonContext = createContext(null)

// Any app component can read the current lesson, in the current language.
export function useLesson() {
  return useContext(LessonContext)
}

const pad = (n) => String(n).padStart(2, '0')

// The shared lesson page around every app: dark top bar, a dark header with paper-cut waves
// (like the front of the lesson card), the app itself and the lesson details.
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

  useEffect(() => {
    document.title = `${pad(lesson.n)} · ${text.title} – Rika Mentoring`
  }, [lesson.n, text.title])

  return (
    <LessonContext.Provider value={value}>
      <div className="lesson-page" style={paletteVars(palette)}>
        <div className="lp-topbar">
          <div className="lp-topbar__inner container">
            <a className="lp-brand" href="../../">
              <span className="lp-brand__mark" aria-hidden="true">
                R
              </span>
              <span className="lp-brand__name">Rika Mentoring</span>
            </a>
            <nav className="lp-crumbs" aria-label="Breadcrumb">
              <a href="../../#lessons">{t.home}</a>
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

        <nav className="lp-nav container" aria-label={`${t.prev} / ${t.next}`}>
          {prev && (
            <a href={`../${prev.slug}/`}>
              <small>← {t.prev}</small>
              <strong>
                {pad(prev.n)} · {prev[lang].title}
              </strong>
            </a>
          )}
          {next && (
            <a className="lp-nav__next" href={`../${next.slug}/`}>
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
