import { useState } from 'react'
import { api, tx } from './api.js'
import { useRequest } from './useRequest.js'
import { ErrorState } from './Status.jsx'

// The readers' comments under a post: loaded with a filter on postId (a foreign key), and a form that adds a new one
// to the end of the list without loading the list again.
export default function CommentSection({ postId, author, lang, t, fmt }) {
  const c = t.comments
  const comments = useRequest(() => api.list('comments', (comment) => comment.postId === postId), postId)
  const [name, setName] = useState(author ? author.name : '') // a logged-in author need not type it
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'error'

  const send = async (event) => {
    event.preventDefault()
    if (name.trim() === '' || text.trim() === '') return
    setStatus('sending')
    try {
      const saved = await api.create('comments', { postId, name: name.trim(), text: text.trim() })
      // The server's answer is the saved comment: a new array with it at the end, never a push into the state.
      comments.setData([...comments.data, saved])
      setText('')
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  const sending = status === 'sending'

  return (
    <section className="bl-comments" aria-labelledby="bl-comments-title">
      <h4 id="bl-comments-title">{c.title}</h4>

      {comments.status === 'loading' && (
        <p className="bl-note" role="status">
          {c.loading}
        </p>
      )}
      {comments.status === 'error' && (
        <ErrorState title={c.failed} message={comments.error.message} onRetry={comments.retry} retryLabel={t.retry} />
      )}

      {comments.status === 'ready' && (
        <>
          {comments.data.length === 0 ? (
            <p className="bl-note">{c.empty}</p>
          ) : (
            <ul className="bl-comment-list">
              {comments.data.map((comment) => (
                <li key={comment.id} className="bl-comment">
                  <p className="bl-meta">
                    <strong>{comment.name}</strong> ·{' '}
                    <time dateTime={comment.createdAt}>{fmt.date(comment.createdAt)}</time>
                  </p>
                  <p className="bl-comment__text">{tx(comment.text, lang)}</p>
                </li>
              ))}
            </ul>
          )}

          <form className="bl-comment-form" onSubmit={send}>
            <fieldset className="bl-editor__fields" disabled={sending}>
              <label className="field">
                <span>{c.name}</span>
                <input
                  className="input"
                  value={name}
                  maxLength={40}
                  autoComplete="name"
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>{c.text}</span>
                <textarea
                  className="input bl-comment-form__text"
                  value={text}
                  rows={3}
                  maxLength={1000}
                  onChange={(event) => setText(event.target.value)}
                  required
                />
              </label>
              {status === 'error' && (
                <p className="bl-alert" role="alert">
                  {c.sendFailed}
                </p>
              )}
              <div className="bl-row">
                <button type="submit" className="btn" aria-busy={sending}>
                  {sending && <span className="bl-spinner" aria-hidden="true" />}
                  {sending ? c.sending : c.send}
                </button>
              </div>
            </fieldset>
          </form>
        </>
      )}
    </section>
  )
}
