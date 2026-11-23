import { useMemo, useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT, pick, useFullDate, useTimeAgo } from '../text.js'
import Comment from './Comment.jsx'
import ReplyForm from './ReplyForm.jsx'

const VoteBox = ({ score, myVote, busy, onVote }) => {
  const t = useText(TEXT)
  return (
    <div className="fd-vote" aria-busy={busy}>
      <button
        type="button"
        className="fd-vote__btn fd-vote__btn--up"
        aria-label={t.upvote}
        aria-pressed={myVote === 1}
        onClick={() => onVote(1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5 4 14h5v5h6v-5h5z" />
        </svg>
      </button>
      <span className="fd-vote__score" aria-label={t.score(score)}>
        {score}
      </span>
      <button
        type="button"
        className="fd-vote__btn fd-vote__btn--down"
        aria-label={t.downvote}
        aria-pressed={myVote === -1}
        onClick={() => onVote(-1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 19 4 10h5V5h6v5h5z" />
        </svg>
      </button>
    </div>
  )
}

const CommentSection = ({ post, comments, onAddComment }) => {
  const t = useText(TEXT)
  // Group the flat comment list by parent once per change: { root: [...], c1: [...], … }.
  const byParent = useMemo(() => {
    const map = {}
    const sorted = [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    for (const c of sorted) (map[c.parentId ?? 'root'] ??= []).push(c)
    return map
  }, [comments])

  const reply = (parentId, text) => onAddComment({ postId: post.id, parentId, author: null, body: text })
  const roots = byParent.root ?? []

  return (
    <section className="fd-comments" aria-label={t.comments(comments.length)}>
      <ReplyForm id={`fd-new-comment-${post.id}`} label={t.commentLabel} submitLabel={t.send} onSubmit={(text) => reply(null, text)} />
      {roots.length === 0 ? (
        <p className="fd-muted">{t.noComments}</p>
      ) : (
        <ul className="fd-thread fd-thread--root">
          {roots.map((comment) => (
            <Comment key={comment.id} comment={comment} byParent={byParent} depth={0} onReply={reply} />
          ))}
        </ul>
      )}
    </section>
  )
}

const PostCard = ({ post, comments, myVote, busy, onVote, onAddComment }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const timeAgo = useTimeAgo()
  const fullDate = useFullDate()
  const [open, setOpen] = useState(false)
  const body = pick(post.body, lang)

  return (
    <article className="fd-post">
      <VoteBox score={post.score} myVote={myVote} busy={busy} onVote={(dir) => !busy && onVote(post.id, dir, myVote)} />
      <div className="fd-post__main">
        <p className="fd-post__meta">
          <span className="fd-community">r/{post.community}</span>
          <span>
            u/{post.mine ? t.you : post.author}
            {post.mine && <span className="fd-badge">{t.newBadge}</span>}
          </span>
          <time dateTime={post.createdAt} title={fullDate(post.createdAt)}>
            {timeAgo(post.createdAt)}
          </time>
        </p>
        <h3 className="fd-post__title">{pick(post.title, lang)}</h3>
        {body && <p className="fd-post__body">{body}</p>}
        <button type="button" className="fd-action fd-action--comments" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5h16v11H9l-5 4z" />
          </svg>
          {open ? t.hideComments : t.comments(comments.length)}
        </button>
        {open && <CommentSection post={post} comments={comments} onAddComment={onAddComment} />}
      </div>
    </article>
  )
}

export default PostCard
