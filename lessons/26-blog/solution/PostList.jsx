import { useState } from 'react'
import { api, tx } from './api.js'
import Cover from './Cover.jsx'
import TagList from './TagList.jsx'
import { excerpt, readingMinutes } from './markdown.js'
import { matchesSearch } from './posts.js'
import { useRequest } from './useRequest.js'
import { usePageMeta } from './usePageMeta.js'
import { ErrorState } from './Status.jsx'

// The list of posts, and with `tag` the list of one tag's posts (#/tag/react).
export default function PostList({ lang, t, fmt, author, tag }) {
  const posts = useRequest(() => api.list('posts'), 'list')
  const [query, setQuery] = useState('')
  usePageMeta(tag ? `#${tag}` : '', t.blogIntro)

  const restore = () => {
    api.reset()
    posts.retry()
  }

  // Derived values, worked out at every render: copy before sorting (never mutate data from state),
  // then the tag filter, then the search.
  const sorted = [...(posts.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const tagged = tag ? sorted.filter((post) => (post.tags ?? []).includes(tag)) : sorted
  const shown = tagged.filter((post) => matchesSearch(post, query, (value) => tx(value, lang)))
  const ready = posts.status === 'ready'

  return (
    <div className="bl-page">
      <header className="bl-hero">
        <div>
          <h3>{tag ? t.taggedTitle(tag) : t.blogTitle}</h3>
          {!tag && <p>{t.blogIntro}</p>}
        </div>
        {author && (
          <a className="btn" href="#/new">
            <span aria-hidden="true">+</span> {t.newPost}
          </a>
        )}
      </header>

      {tag && (
        <a className="bl-back" href="#/">
          <span aria-hidden="true">←</span> {t.back}
        </a>
      )}

      <div className="bl-tools">
        <label className="bl-search">
          <span className="visually-hidden">{t.searchLabel}</span>
          <input
            type="search"
            className="input"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {/* role="status": a screen reader hears it when the tag or the search leaves no post. */}
        <div className="bl-status" role="status">
          {ready && sorted.length > 0 && tagged.length === 0 && <p className="bl-empty">{t.noTagged}</p>}
          {ready && tagged.length > 0 && shown.length === 0 && <p className="bl-empty">{t.noMatch(query.trim())}</p>}
        </div>
      </div>

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

      {ready && sorted.length === 0 && (
        <div className="bl-empty">
          <p>{author ? t.emptyAuthor : t.empty}</p>
          <div className="bl-row">
            {author && (
              <a className="btn" href="#/new">
                {t.newPost}
              </a>
            )}
            <button type="button" className="btn btn--ghost" onClick={restore}>
              {t.restore}
            </button>
          </div>
        </div>
      )}

      {ready && shown.length > 0 && (
        <ul className="bl-list">
          {shown.map((post) => {
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
                  {post.author && <p className="bl-meta">{t.by(post.author)}</p>}
                  {/* The tags sit above the stretched link (app.css), so a click on a tag opens the tag page. */}
                  <TagList tags={post.tags ?? []} label={t.tagsLabel} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
