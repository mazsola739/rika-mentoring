import lessons from '@shared/lessons.json'
import { paletteFor, paletteVars } from '@shared/ui/palette.js'

// Project cards: each card gets the accent color of its own lesson.
export default function Projects({ projects, lang, t }) {
  return (
    <section className="pf-section" id="pf-projects" aria-labelledby="pf-projects-title">
      <h2 className="pf-section__title" id="pf-projects-title">
        {t.projectsTitle}
      </h2>
      <p className="pf-section__lead">{t.projectsLead}</p>
      <ul className="pf-projects">
        {projects.map((project) => {
          const lesson = lessons.find((l) => l.slug === project.slug)
          const text = lesson[lang]
          return (
            <li key={project.slug}>
              <a className="pf-card" href={`#/projects/${project.slug}`} style={paletteVars(paletteFor(lesson.n))}>
                <span className="pf-card__thumb solid" aria-hidden="true">
                  <span className="pf-card__num">{String(lesson.n).padStart(2, '0')}</span>
                </span>
                <span className="pf-card__body">
                  <span className="pf-card__title">{text.title}</span>
                  <span className="pf-card__short">{text.short}</span>
                  <span className="pf-tags">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="pf-tag">
                        {tag}
                      </span>
                    ))}
                  </span>
                  <span className="pf-card__more">
                    {t.details} <span aria-hidden="true">→</span>
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
