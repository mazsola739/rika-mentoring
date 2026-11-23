import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT, pick, useFullDate, useTimeAgo } from '../text.js'
import ReplyForm from './ReplyForm.jsx'

// How many comments are below this one (children, grandchildren…). Recursion again!
const countDescendants = (id, byParent) =>
  (byParent[id] ?? []).reduce((sum, child) => sum + 1 + countDescendants(child.id, byParent), 0)

// A recursive component: a comment renders its replies with <Comment />, and so on, to any depth.
// `byParent` maps a parent id to its direct replies, so each level finds its children quickly.
const Comment = ({ comment, byParent, depth, onReply }) => {
  const lang = useLang()
  const t = useText(TEXT)
  const timeAgo = useTimeAgo()
  const fullDate = useFullDate()
  const [collapsed, setCollapsed] = useState(false)
  const [replying, setReplying] = useState(false)
  const replies = byParent[comment.id] ?? []
  const author = comment.mine ? t.you : comment.author
  const threadId = `fd-thread-${comment.id}`

  return (
    <li className={`fd-comment${collapsed ? ' is-collapsed' : ''}`} style={{ '--depth': depth }}>
      <div className="fd-comment__head">
        <button
          type="button"
          className="fd-collapse"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls={threadId}
          aria-label={collapsed ? t.expand : t.collapse}
        >
          {collapsed ? '+' : '−'}
        </button>
        <span className={`fd-author${comment.mine ? ' is-mine' : ''}`}>u/{author}</span>
        <time dateTime={comment.createdAt} title={fullDate(comment.createdAt)}>
          {timeAgo(comment.createdAt)}
        </time>
        {collapsed && replies.length > 0 && <span className="fd-hidden">{t.hiddenReplies(countDescendants(comment.id, byParent))}</span>}
      </div>

      <div id={threadId} hidden={collapsed}>
        <p className="fd-comment__body">{pick(comment.body, lang)}</p>
        <div className="fd-comment__actions">
          <button type="button" className="fd-action" onClick={() => setReplying((r) => !r)} aria-expanded={replying}>
            {t.reply}
          </button>
        </div>

        {replying && (
          <ReplyForm
            id={`fd-reply-${comment.id}`}
            label={t.replyLabel(author)}
            submitLabel={t.sendReply}
            autoFocus
            onCancel={() => setReplying(false)}
            onSubmit={async (text) => {
              await onReply(comment.id, text)
              setReplying(false)
            }}
          />
        )}

        {replies.length > 0 && (
          <ul className="fd-thread">
            {replies.map((reply) => (
              <Comment key={reply.id} comment={reply} byParent={byParent} depth={depth + 1} onReply={onReply} />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export default Comment
