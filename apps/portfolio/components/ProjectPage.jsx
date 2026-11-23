import lessons from '@shared/lessons.json'
import { paletteFor, paletteVars } from '@shared/ui/palette.js'
import Inline from '@shared/ui/Inline.jsx'

// Egy projekt saját oldala (esettanulmány): kihívás, megoldás, tanulság, technológiák, élő demó.
export default function ProjectPage({ project, lang, t, onBack }) {
  if (!project) {
    return (
      <section className="pf-section">
        <a className="pf-back" href="#/" onClick={onBack}>
          <span aria-hidden="true">←</span> {t.back}
        </a>
        <p>{t.notFound}</p>
      </section>
    )
  }

  const lesson = lessons.find((l) => l.slug === project.slug)
  const text = lesson[lang]
  const story = project[lang]

  return (
    <article className="pf-project" style={paletteVars(paletteFor(lesson.n))}>
      {/* Header: one flat accent block with the lesson number as a quiet graphic. */}
      <header className="pf-project__head solid">
        <span className="pf-project__num" aria-hidden="true">
          {String(lesson.n).padStart(2, '0')}
        </span>
        <a className="pf-back pf-back--on-solid" href="#/" onClick={onBack}>
          <span aria-hidden="true">←</span> {t.back}
        </a>
        <h2 className="pf-project__title">{text.title}</h2>
        <p className="pf-project__short">{text.short}</p>
      </header>

      <div className="pf-project__content">
        <div className="pf-project__grid">
          <div className="pf-project__story">
            <h3>{t.challenge}</h3>
            <p>{story.challenge}</p>
            <h3>{t.solution}</h3>
            <p>{story.solution}</p>
            <h3>{t.learned}</h3>
            <p>
              <Inline text={text.learn} />
            </p>
          </div>

          <aside className="pf-project__side">
            <h3>{t.tech}</h3>
            <div className="pf-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="pf-tag">
                  {tag}
                </span>
              ))}
            </div>
            <a className="btn pf-project__demo" href={`../${project.slug}/`}>
              {t.liveDemo} <span aria-hidden="true">↗</span>
            </a>
          </aside>
        </div>
      </div>
    </article>
  )
}
