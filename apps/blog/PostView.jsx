import { useState } from 'react'
import { api, tx } from './api.js'
import Cover from './Cover.jsx'
import { readingMinutes } from './markdown.js'
import { useRequest } from './useRequest.js'
import Markdown from './Markdown.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import { ErrorState, Loading, NotFound } from './Status.jsx'

export default function PostView({ id, lang, t, fmt, onDeleted }) {
  const post = useRequest(() => api.get('posts', id), id)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  if (post.status === 'loading') return <Loading label={t.loading} lines={5} />
  if (post.status === 'error') {
    return post.error.status === 404 ? (
      <NotFound text={t.notFound} backLabel={t.back} />
    ) : (
      <ErrorState title={t.loadFailed} message={post.error.message} onRetry={post.retry} retryLabel={t.retry} />
    )
  }

  const data = post.data
  const title = tx(data.title, lang)
  const body = tx(data.body, lang)

  const remove = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.remove('posts', id)
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
      </header>

      <Markdown source={body} />

      <footer className="bl-post__actions">
        <a className="btn btn--ghost" href={`#/edit/${id}`}>
          {t.edit}
        </a>
        <button type="button" className="btn btn--ghost bl-btn-danger-ghost" onClick={() => setConfirming(true)}>
          {t.delete}
        </button>
      </footer>

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
  )
}
