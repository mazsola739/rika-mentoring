import { useEffect, useRef } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { PROFILE, PROJECTS, SKILLS, UI } from './data.js'
import { navigate, projectSlugFrom, useHashRoute } from './useHashRoute.js'
import BrowserWindow from './components/BrowserWindow.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import ProjectPage from './components/ProjectPage.jsx'
import Contact from './components/Contact.jsx'
import './app.css'

// Simán görget, kivéve ha a felhasználó csökkentett mozgást kér.
function scrollToSection(id, smooth = true) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document
    .getElementById(`pf-${id}`)
    ?.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block: 'start' })
}

function Portfolio() {
  const lang = useLang()
  const t = useText(UI)
  const profile = PROFILE[lang]
  const path = useHashRoute()
  const slug = projectSlugFrom(path)
  const windowRef = useRef(null)
  const pendingScroll = useRef(null)

  // Oldalváltáskor az „ablak” tetejére ugrunk, vagy a kért szakaszhoz görgetünk.
  useEffect(() => {
    if (pendingScroll.current) {
      // Oldalváltás után azonnal ugrunk: az új tartalomhoz nincs mit „animálni”.
      scrollToSection(pendingScroll.current, false)
      pendingScroll.current = null
    } else if (path !== '/') {
      windowRef.current?.scrollIntoView({ block: 'start' })
    }
  }, [path])

  const scrollTo = (id) => {
    if (slug) {
      pendingScroll.current = id
      navigate('/')
      return
    }
    scrollToSection(id)
  }

  return (
    <div ref={windowRef} className="pf-scroll-anchor">
      <BrowserWindow url={`mira.example.dev${slug ? `/projects/${slug}` : ''}`} badge={t.sample}>
        <div className="pf">
          <SiteHeader profile={profile} nav={t.nav} onNavigate={scrollTo} />
          <main>
            {slug ? (
              <ProjectPage
                project={PROJECTS.find((p) => p.slug === slug)}
                lang={lang}
                t={t}
                onBack={() => {
                  pendingScroll.current = 'projects'
                }}
              />
            ) : (
              <>
                <Hero profile={profile} t={t} onNavigate={scrollTo} />
                <About profile={profile} t={t} />
                <Skills skills={SKILLS} lang={lang} t={t} />
                <Projects projects={PROJECTS} lang={lang} t={t} />
                <Contact profile={profile} t={t} />
              </>
            )}
          </main>
          <footer className="pf-footer">
            © 2026 {profile.name} · {t.footer}
          </footer>
        </div>
      </BrowserWindow>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="portfolio">
      <Portfolio />
    </AppFrame>
  )
}
