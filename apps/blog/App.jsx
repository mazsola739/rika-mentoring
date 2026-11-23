import { useEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { matchRoute, navigate, useHashRoute } from './useHashRoute.js'
import PostList from './PostList.jsx'
import PostView from './PostView.jsx'
import PostEditor from './PostEditor.jsx'
import { NotFound } from './Status.jsx'
import { TEXT } from './text.js'
import './app.css'

function Blog() {
  const t = useText(TEXT)
  const lang = useLang()
  const path = useHashRoute()
  const route = matchRoute(path)
  // A one-off message ("Post deleted") that belongs to the page we navigate to.
  const [flash, setFlash] = useState(null)
  const rootRef = useRef(null)
  const [initialPath] = useState(path)
  const moved = useRef(false)

  // After an in-app navigation, move focus to the top of the app so keyboard and
  // screen reader users start reading the new page (not on the first load).
  useEffect(() => {
    if (path !== initialPath) moved.current = true
    if (!moved.current) return
    const root = rootRef.current
    root?.focus({ preventScroll: true })
    if (root && root.getBoundingClientRect().top < 0) root.scrollIntoView({ block: 'start' })
  }, [path, initialPath])

  const go = (to, flashKey) => {
    setFlash(flashKey ? { path: to, key: flashKey } : null)
    navigate(to)
  }

  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const dateFormat = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' })
  const fmt = { date: (iso) => dateFormat.format(new Date(iso)) }
  const shared = { lang, t, fmt }

  let page
  switch (route.name) {
    case 'list':
      page = <PostList {...shared} />
      break
    case 'post':
      page = <PostView key={route.id} id={route.id} {...shared} onDeleted={() => go('/', 'deleted')} />
      break
    case 'new':
      page = <PostEditor key="new" {...shared} onSaved={(id, kind) => go(`/post/${id}`, kind)} onCancel={() => go('/')} />
      break
    case 'edit':
      page = (
        <PostEditor
          key={`edit-${route.id}`}
          id={route.id}
          {...shared}
          onSaved={(id, kind) => go(`/post/${id}`, kind)}
          onCancel={() => go(`/post/${route.id}`)}
        />
      )
      break
    default:
      page = <NotFound text={t.notFound} backLabel={t.back} />
  }

  const flashText = flash && flash.path === path ? t.flash[flash.key] : ''

  return (
    <div className="bl" ref={rootRef} tabIndex={-1}>
      <p className="bl-flash" role="status">
        {flashText}
      </p>
      {page}
      <p className="bl-foot">{t.note}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="blog">
      <Blog />
    </AppFrame>
  )
}
