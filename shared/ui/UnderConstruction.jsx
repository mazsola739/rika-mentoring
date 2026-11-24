import site from '../site.json'
import './under-construction.css'

const TEXT = {
  en: {
    title: 'Under construction',
    text: 'The lessons are still being written, and some guides are not ready yet.',
    repo: 'Exercises and code on GitHub',
    newTab: 'opens in a new tab',
  },
  hu: {
    title: 'Fejlesztés alatt',
    text: 'A leckék még készülnek, néhány útmutató még hiányzik.',
    repo: 'Feladatok és kód a GitHubon',
    newTab: 'új lapon nyílik',
  },
}

// A thin strip at the top of every page while the site is being built.
// Turn it off with "underConstruction": false in shared/site.json.
export default function UnderConstruction({ lang }) {
  if (!site.underConstruction) return null
  const t = TEXT[lang] ?? TEXT.en
  return (
    <div className="uc" role="note">
      <p className="uc__inner">
        <strong className="uc__title">{t.title}</strong>
        <span>{t.text}</span>
        <a className="uc__link" href={site.repo} target="_blank" rel="noopener noreferrer">
          {t.repo}
          <span className="visually-hidden"> ({t.newTab})</span>
        </a>
      </p>
    </div>
  )
}
