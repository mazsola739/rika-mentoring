import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useText } from '@shared/i18n.js'
import { COMMUNITIES } from './seed.js'
import { TEXT } from './text.js'
import { useFeed } from './useFeed.js'
import PostCard from './components/PostCard.jsx'
import NewPostForm from './components/NewPostForm.jsx'
import './app.css'

const PAGE_SIZE = 4

const SORTERS = {
  new: (a, b) => b.createdAt.localeCompare(a.createdAt),
  top: (a, b) => b.score - a.score,
}

// Infinite scroll: when the sentinel element scrolls into view, show the next page.
// `page` re-creates the observer after each load, so a still-visible sentinel triggers again.
const useInfiniteScroll = (onReachEnd, enabled, page) => {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onReachEnd()
    }, { rootMargin: '120px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onReachEnd, enabled, page])
  return ref
}

const Skeleton = () => {
  return (
    <div className="fd-skeleton" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="fd-skeleton__card">
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  )
}

const Feed = () => {
  const t = useText(TEXT)
  const feed = useFeed()
  const [sort, setSort] = useState('top')
  const [community, setCommunity] = useState('all')
  const [composing, setComposing] = useState(false)
  const [limit, setLimit] = useState(PAGE_SIZE)
  const createRef = useRef(null)

  // Sorting and filtering are derived from the data on every render. With "top" sorting,
  // a vote can move a post, which is exactly what Reddit does too.
  const visiblePosts = useMemo(
    () => feed.posts.filter((p) => community === 'all' || p.community === community).sort(SORTERS[sort]),
    [feed.posts, community, sort],
  )

  const commentsByPost = useMemo(() => {
    const map = {}
    for (const c of feed.comments) (map[c.postId] ??= []).push(c)
    return map
  }, [feed.comments])

  const hasMore = limit < visiblePosts.length
  const loadMore = useCallback(() => setLimit((l) => l + PAGE_SIZE), [])
  const sentinelRef = useInfiniteScroll(loadMore, feed.status === 'ready' && hasMore, limit)

  // Start from the first page whenever the list changes shape.
  useEffect(() => setLimit(PAGE_SIZE), [sort, community])

  // Show the "vote reverted" message for a few seconds after each failure.
  const [toast, setToast] = useState(false)
  useEffect(() => {
    if (!feed.voteError) return
    setToast(true)
    const timer = setTimeout(() => setToast(false), 4000)
    return () => clearTimeout(timer)
  }, [feed.voteError])

  return (
    <div className="fd">
      <div className="fd-toolbar">
        <div className="fd-seg" role="radiogroup" aria-label={t.sortLabel}>
          {Object.keys(SORTERS).map((key) => (
            <button key={key} type="button" role="radio" aria-checked={sort === key} onClick={() => setSort(key)}>
              {t.sorts[key]}
            </button>
          ))}
        </div>
        <button
          ref={createRef}
          type="button"
          className="btn"
          onClick={() => setComposing((c) => !c)}
          aria-expanded={composing}
          disabled={feed.status !== 'ready'}
        >
          + {t.create}
        </button>
      </div>

      <div className="fd-chips" role="group" aria-label={t.communityLabel}>
        {['all', ...COMMUNITIES].map((key) => (
          <button key={key} type="button" className="chip" aria-pressed={community === key} onClick={() => setCommunity(key)}>
            {key === 'all' ? t.all : `r/${key}`}
          </button>
        ))}
      </div>

      {composing && (
        <NewPostForm
          defaultCommunity={community === 'all' ? 'react' : community}
          onSubmit={async (data) => {
            await feed.addPost(data)
            setSort('new')
          }}
          onClose={() => {
            setComposing(false)
            createRef.current?.focus()
          }}
        />
      )}

      {/* Announced to screen readers whenever an optimistic vote had to be undone. */}
      <div className="fd-toast-region" aria-live="assertive">
        {toast && (
          <p key={feed.voteError} className="fd-toast">
            {t.voteFailed}
          </p>
        )}
      </div>

      {feed.status === 'loading' && (
        <>
          <p className="visually-hidden" role="status">
            {t.loading}
          </p>
          <Skeleton />
        </>
      )}

      {feed.status === 'error' && (
        <div className="fd-state" role="alert">
          <p>{t.loadFailed}</p>
          <button type="button" className="btn" onClick={feed.retry}>
            {t.retry}
          </button>
        </div>
      )}

      {feed.status === 'ready' && visiblePosts.length === 0 && (
        <div className="fd-state">
          <p>{t.empty}</p>
        </div>
      )}

      {feed.status === 'ready' && visiblePosts.length > 0 && (
        <>
          <ol className="fd-list">
            {visiblePosts.slice(0, limit).map((post) => (
              <li key={post.id}>
                <PostCard
                  post={post}
                  comments={commentsByPost[post.id] ?? []}
                  myVote={feed.votes[post.id] ?? 0}
                  busy={Boolean(feed.pending[post.id])}
                  onVote={feed.vote}
                  onAddComment={feed.addComment}
                />
              </li>
            ))}
          </ol>
          <div ref={sentinelRef} className="fd-end">
            {hasMore ? (
              <button type="button" className="btn btn--ghost" onClick={loadMore}>
                {t.loadMore}
              </button>
            ) : (
              <span>{t.end}</span>
            )}
          </div>
        </>
      )}

      <button type="button" className="fd-reset" onClick={feed.reset}>
        {t.reset}
      </button>
    </div>
  )
}

const App = () => {
  return (
    <AppFrame slug="feed">
      <Feed />
    </AppFrame>
  )
}

export default App
