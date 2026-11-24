import { useState } from 'react'
import { deletePost, api, tx } from './api.js'
import Cover from './Cover.jsx'
import TagList from './TagList.jsx'
import CommentSection from './CommentSection.jsx'
import { excerpt, readingMinutes } from './markdown.js'
import { canEdit } from './posts.js'
import { useRequest } from './useRequest.js'
import { usePageMeta } from './usePageMeta.js'
import Markdown from './Markdown.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import { ErrorState, Loading, NotFound } from './Status.jsx'

export default function PostView({ id, lang, t, fmt, author, onDeleted }) {
  const post = useRequest(() => api.get('posts', id), id)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const data = post.status === 'ready' ? post.data : null
  const title = data ? tx(data.title, lang) : ''
  const body = data ? tx(data.body, lang) : ''
  // A hook, so it comes before the early returns. null while the post is loading: the tab keeps the lesson title.
  usePageMeta(data ? title : null, data ? excerpt(body) : undefined)

  if (post.status === 'loading') return <Loading label={t.loading} lines={5} />
  if (post.status === 'error') {
    return post.error.status === 404 ? (
      <NotFound title={t.pageNotFoundTitle} text={t.notFound} backLabel={t.back} />
    ) : (
      <ErrorState title={t.loadFailed} message={post.error.message} onRetry={post.retry} retryLabel={t.retry} />
    )
  }

  const remove = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deletePost(id) // the post, and its comments too
      onDeleted() // navigates away, this page unmounts
    } catch (err) {
      setDeleteError(`${t.confirm.failed} ${err.message}`)
      setDeleting(false)
    }
  }

  const closeDialog = () => {
    setConfirming(false)
    setDeleteError('')
  }

  return (
    <>
      <article className="bl-page bl-post">
        <a className="bl-back" href="#/">
          <span aria-hidden="true">←</span> {t.back}
        </a>

        <Cover cover={data.cover} title={title} className="bl-post__cover" />

        <header className="bl-post__head">
          <h3>{title}</h3>
          <p className="bl-meta">
            {data.author && <span>{t.by(data.author)} · </span>}
            <time dateTime={data.createdAt}>{fmt.date(data.createdAt)}</time> · {t.minutes(readingMinutes(body))}
            {data.updatedAt && <span> · {t.updated(fmt.date(data.updatedAt))}</span>}
          </p>
          <TagList tags={data.tags ?? []} label={t.tagsLabel} />
        </header>

        <Markdown source={body} />

        {/* Only the post's own author sees the buttons. (A real server would check this too, on every request.) */}
        {canEdit(data, author) && (
          <footer className="bl-post__actions">
            <a className="btn btn--ghost" href={`#/edit/${id}`}>
              {t.edit}
            </a>
            <button type="button" className="btn btn--ghost bl-btn-danger-ghost" onClick={() => setConfirming(true)}>
              {t.delete}
            </button>
          </footer>
        )}

        <ConfirmDialog
          open={confirming}
          title={t.confirm.title}
          cancelLabel={t.confirm.cancel}
          confirmLabel={deleting ? t.confirm.deleting : t.confirm.confirm}
          busy={deleting}
          error={deleteError}
          onCancel={closeDialog}
          onConfirm={remove}
        >
          <p>{t.confirm.text(title)}</p>
        </ConfirmDialog>
      </article>

      <CommentSection postId={id} author={author} lang={lang} t={t} fmt={fmt} />
    </>
  )
}
