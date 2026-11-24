import { useEffect, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { matchRoute, navigate, useHashRoute } from './useHashRoute.js'
import { useLocalStorage } from './useLocalStorage.js'
import PostList from './PostList.jsx'
import PostView from './PostView.jsx'
import PostEditor from './PostEditor.jsx'
import LoginPage from './LoginPage.jsx'
import { NotFound } from './Status.jsx'
import { TEXT } from './text.js'
import './app.css'

function Blog() {
  const t = useText(TEXT)
  const lang = useLang()
  const path = useHashRoute()
  const route = matchRoute(path)
  // The session: the logged-in author ({ id, name }) or null. In localStorage, so a reload does not log you out.
  const [author, setAuthor] = useLocalStorage('rika:blog:author', null)
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

  const handleLogin = (newAuthor) => {
    setAuthor(newAuthor)
    // From the login page to the list. On a protected page we stay: it opens now by itself.
    if (route.name === 'login') go('/')
  }

  const locale = lang === 'hu' ? 'hu-HU' : 'en-GB'
  const dateFormat = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' })
  const fmt = { date: (iso) => dateFormat.format(new Date(iso)) }
  const shared = { lang, t, fmt, author }

  // Writing and editing need a logged-in author: anyone else gets the login form in their place.
  const needsAuthor = route.name === 'new' || route.name === 'edit'

  let page
  if (route.name === 'login' || (needsAuthor && !author)) {
    page = <LoginPage t={t} onLogin={handleLogin} />
  } else {
    switch (route.name) {
      case 'list':
        page = <PostList {...shared} />
        break
      case 'tag':
        // The same component as the list, in the same place: only its tag changes, the posts are not loaded again.
        page = <PostList {...shared} tag={route.id} />
        break
      case 'post':
        page = <PostView key={route.id} id={route.id} {...shared} onDeleted={() => go('/', 'deleted')} />
        break
      case 'new':
        page = (
          <PostEditor key="new" {...shared} onSaved={(id, kind) => go(`/post/${id}`, kind)} onCancel={() => go('/')} />
        )
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
        page = <NotFound title={t.pageNotFoundTitle} text={t.pageNotFound} backLabel={t.back} />
    }
  }

  const flashText = flash && flash.path === path ? t.flash[flash.key] : ''

  return (
    <div className="bl" ref={rootRef} tabIndex={-1}>
      <div className="bl-account">
        {author ? (
          <>
            <span>
              {t.account.loggedIn} <strong>{author.name}</strong>
            </span>
            <button type="button" className="btn btn--ghost bl-account__btn" onClick={() => setAuthor(null)}>
              {t.account.logOut}
            </button>
          </>
        ) : (
          route.name !== 'login' && (
            <a className="btn btn--ghost bl-account__btn" href="#/login">
              {t.account.logIn}
            </a>
          )
        )}
      </div>
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
