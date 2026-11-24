import { api, tx } from './api.js'
import Cover from './Cover.jsx'
import { excerpt, readingMinutes } from './markdown.js'
import { useRequest } from './useRequest.js'
import { ErrorState } from './Status.jsx'

export default function PostList({ lang, t, fmt }) {
  const posts = useRequest(() => api.list('posts'), 'list')

  const restore = () => {
    api.reset()
    posts.retry()
  }

  // Copy before sorting: never mutate data that came from state.
  const sorted = [...(posts.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="bl-page">
      <header className="bl-hero">
        <div>
          <h3>{t.blogTitle}</h3>
          <p>{t.blogIntro}</p>
        </div>
        <a className="btn" href="#/new">
          <span aria-hidden="true">+</span> {t.newPost}
        </a>
      </header>

      {posts.status === 'loading' && (
        <ul className="bl-list" aria-busy="true">
          <li className="visually-hidden" role="status">
            {t.loading}
          </li>
          {[0, 1, 2].map((i) => (
            <li key={i} className="bl-card bl-card--ghost" aria-hidden="true">
              <span className="bl-card__cover bl-skeleton" />
              <span className="bl-card__body">
                <span className="bl-skeleton" />
                <span className="bl-skeleton" />
              </span>
            </li>
          ))}
        </ul>
      )}

      {posts.status === 'error' && (
        <ErrorState title={t.loadFailed} message={posts.error.message} onRetry={posts.retry} retryLabel={t.retry} />
      )}

      {posts.status === 'ready' && sorted.length === 0 && (
        <div className="bl-empty">
          <p>{t.empty}</p>
          <div className="bl-row">
            <a className="btn" href="#/new">
              {t.newPost}
            </a>
            <button type="button" className="btn btn--ghost" onClick={restore}>
              {t.restore}
            </button>
          </div>
        </div>
      )}

      {posts.status === 'ready' && sorted.length > 0 && (
        <ul className="bl-list">
          {sorted.map((post) => {
            const body = tx(post.body, lang)
            return (
              <li key={post.id} className="bl-card">
                <Cover cover={post.cover} title={tx(post.title, lang)} className="bl-card__cover" />
                <div className="bl-card__body">
                  <p className="bl-meta">
                    <time dateTime={post.createdAt}>{fmt.date(post.createdAt)}</time> · {t.minutes(readingMinutes(body))}
                  </p>
                  <h4>
                    {/* The ::after of this link stretches over the card, so the whole card is clickable. */}
                    <a className="bl-card__link" href={`#/post/${post.id}`}>
                      {tx(post.title, lang)}
                    </a>
                  </h4>
                  <p className="bl-card__excerpt">{excerpt(body)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
