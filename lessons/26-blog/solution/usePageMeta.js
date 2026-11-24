import { useEffect } from 'react'
import { useLesson } from '@shared/ui/AppFrame.jsx'

const pad = (n) => String(n).padStart(2, '0')

// Our own <meta name="description">, created when a page first needs it.
function descriptionTag() {
  let tag = document.head.querySelector('meta[name="description"][data-bl]')
  if (!tag) {
    tag = document.createElement('meta')
    tag.name = 'description'
    tag.dataset.bl = ''
    document.head.append(tag)
  }
  return tag
}

// SEO for one page of the blog: the title of the browser tab ("<title> · 26 · Blog Platform – Rika Mentoring")
// and the description that search engines show under it. An empty title gives the lesson's own title;
// null means "not known yet" (a post that is still loading), and then the hook does nothing.
export function usePageMeta(title, description) {
  const lesson = useLesson()
  const base = `${pad(lesson.n)} · ${lesson.text.title} – Rika Mentoring`
  const fallback = lesson.text.card?.build ?? lesson.text.short // "A blog with posts written in Markdown"

  useEffect(() => {
    if (title === null || title === undefined) return
    // The lesson frame sets the plain lesson title in its own effect, which runs after ours (a parent runs its
    // effects after its children). Waiting one frame lets the page title win.
    const frame = requestAnimationFrame(() => {
      document.title = title ? `${title} · ${base}` : base
      descriptionTag().setAttribute('content', description || fallback)
    })
    return () => {
      cancelAnimationFrame(frame)
      // Leaving the page (or the Solution tab): back to the plain lesson title, and no description of ours.
      document.title = base
      document.head.querySelector('meta[name="description"][data-bl]')?.remove()
    }
  }, [title, description, base, fallback])
}
