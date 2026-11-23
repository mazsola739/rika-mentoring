import { useEffect, useState } from 'react'
import LevelMeter from '../LevelMeter.jsx'
import { Highlighted } from './highlight.jsx'
import { Inline } from './inline.jsx'
import { loadGuide } from './guides.js'
import './guide.css'

const readDone = (key) => {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]'))
  } catch {
    return new Set()
  }
}

function CodeBlock({ block, t }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // the clipboard is blocked: the code can still be selected by hand
    }
  }
  const shell = ['shell', 'bash', 'sh'].includes(block.lang)
  return (
    <figure className="gd-code">
      <figcaption>
        <span className="gd-code__file">{block.file ?? (shell ? t.terminal : '')}</span>
        <button type="button" className="gd-code__copy" onClick={copy}>
          {copied ? t.copied : t.copy}
        </button>
      </figcaption>
      <pre tabIndex={0}>
        <code>
          <Highlighted code={block.code} lang={block.lang} marks={block.marks} />
        </code>
      </pre>
    </figure>
  )
}

const ICON = { check: '✓', mistake: '!', try: '★', concept: '?' }

function Blocks({ blocks, t }) {
  return blocks.map((block, i) => {
    switch (block.type) {
      case 'p':
        return (
          <p key={i}>
            <Inline text={block.text} />
          </p>
        )
      case 'list': {
        const List = block.ordered ? 'ol' : 'ul'
        return (
          <List key={i}>
            {block.items.map((item, j) => (
              <li key={j}>
                <Inline text={item} />
              </li>
            ))}
          </List>
        )
      }
      case 'code':
        return <CodeBlock key={i} block={block} t={t} />
      case 'callout':
        return (
          <aside key={i} className={`gd-callout gd-callout--${block.kind}`}>
            <span className="gd-callout__icon" aria-hidden="true">
              {ICON[block.kind]}
            </span>
            <div>
              {block.title && <p className="gd-callout__title">{block.title}</p>}
              <Blocks blocks={block.blocks} t={t} />
            </div>
          </aside>
        )
      case 'compare':
        return (
          <div key={i} className="gd-compare">
            {block.blocks.map((code, j) => (
              <div key={j}>
                {code.label && <p className={`gd-compare__label${code.now ? ' is-now' : ''}`}>{code.label}</p>}
                <CodeBlock block={code} t={t} />
              </div>
            ))}
          </div>
        )
      case 'levels':
        return (
          <div key={i} className="gd-levels">
            {block.items.map((item, j) => (
              <div key={j} className="gd-level">
                <p className="gd-level__name">
                  <LevelMeter value={j + 1} max={3} /> {t.levelNames[j]}
                </p>
                <p>
                  <Inline text={item.text} />
                </p>
                {item.time && <p className="gd-level__time">{item.time}</p>}
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  })
}

// The step-by-step guide of a lesson. `starterUrl` is the ZIP to download (or null),
// `onSolution` switches the page to the finished app, `next` is the next lesson ({ href, label }) or null.
export default function GuideView({ slug, lang, t, starterUrl, onSolution, next }) {
  const [loaded, setLoaded] = useState(null) // { lang, guide } | null while loading | false when missing
  const storageKey = `rika:guide:${slug}:done`
  const [done, setDone] = useState(() => readDone(storageKey))

  useEffect(() => {
    let live = true
    setLoaded(null)
    loadGuide(slug, lang)
      .then((result) => live && setLoaded(result ?? false))
      .catch(() => live && setLoaded(false))
    return () => {
      live = false
    }
  }, [slug, lang])

  const toggle = (id) =>
    setDone((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]))
      } catch {
        // not saved; the ticks still work for this visit
      }
      return next
    })

  if (loaded === null) return <p className="gd-loading container">{t.guideLoading}</p>
  if (loaded === false) return <p className="gd-loading container">{t.guideMissing}</p>

  const { guide } = loaded
  const steps = guide.steps
  const doneCount = steps.filter((s) => done.has(s.id)).length
  const pct = steps.length ? Math.round((doneCount / steps.length) * 100) : 0

  return (
    <div className="gd-layout container" lang={loaded.lang}>
      <aside className="gd-side" aria-label={t.stepsLabel}>
        <div className="gd-progress">
          <p>
            {t.progress} <strong>{pct}%</strong>
          </p>
          <span
            className="gd-progress__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <span style={{ width: `${pct}%` }} />
          </span>
        </div>
        <nav className="gd-toc" aria-label={t.stepsLabel}>
          {guide.sections.map((section) => (
            <div key={section.title}>
              <p className="gd-toc__level">
                <LevelMeter value={section.level} max={3} /> {section.title}
              </p>
              <ol>
                {section.steps.map((s) => (
                  <li key={s.id} className={done.has(s.id) ? 'is-done' : ''}>
                    <a href={`#${s.id}`}>
                      <span className="gd-toc__n" aria-hidden="true">
                        {s.n}
                      </span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </nav>
        {starterUrl && (
          <div className="gd-starter">
            <p className="gd-starter__title">{t.starterTitle}</p>
            <p>{t.starterInfo}</p>
            <a className="gd-starter__link" href={starterUrl} download>
              {t.starterDownload}
            </a>
          </div>
        )}
      </aside>

      <div className="gd-main">
        <section className="gd-card gd-intro">
          <h2>{guide.title ?? t.whatWeBuild}</h2>
          <Blocks blocks={guide.intro} t={t} />
        </section>

        {guide.sections.map((section, si) => (
          <div key={section.title} className="gd-section">
            {si > 0 && (
              <h2 className="gd-level-break">
                <LevelMeter value={section.level} max={3} /> {section.title}
              </h2>
            )}
            {section.blocks.length > 0 && (
              <div className="gd-card">
                <Blocks blocks={section.blocks} t={t} />
              </div>
            )}
            {section.steps.map((s) => (
              <section key={s.id} id={s.id} className="gd-card gd-step" aria-labelledby={`${s.id}-title`}>
                <header className="gd-step__head">
                  <span className="gd-step__n" aria-hidden="true">
                    {s.n}
                  </span>
                  <h3 id={`${s.id}-title`}>{s.title}</h3>
                  <label className="gd-step__done">
                    <input type="checkbox" checked={done.has(s.id)} onChange={() => toggle(s.id)} />
                    {t.done}
                  </label>
                </header>
                <Blocks blocks={s.blocks} t={t} />
              </section>
            ))}
          </div>
        ))}

        <section className="gd-card gd-finish">
          <h2>{t.finishTitle}</h2>
          <p>{t.finishText}</p>
          <div className="gd-actions">
            <button type="button" className="gd-btn gd-btn--solid" onClick={onSolution}>
              {t.openSolution}
            </button>
            {next && (
              <a className="gd-btn gd-btn--outline" href={next.href}>
                {next.label} →
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
