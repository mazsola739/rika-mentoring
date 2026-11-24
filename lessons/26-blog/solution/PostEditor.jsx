import { useRef, useState } from 'react'
import { api, isBilingual, tx } from './api.js'
import { COVERS, coverFor } from './covers.js'
import Cover from './Cover.jsx'
import { canEdit, parseTags } from './posts.js'
import { useRequest } from './useRequest.js'
import { usePageMeta } from './usePageMeta.js'
import Markdown from './Markdown.jsx'
import { ErrorState, Loading, NotFound } from './Status.jsx'

const TABS = ['write', 'preview']

function validate(v) {
  const e = {}
  if (v.title.trim().length < 3) e.title = 'title'
  if (v.author.trim().length < 2) e.author = 'author'
  if (v.body.trim().length < 20) e.body = 'body'
  return e
}

function EditorForm({ post, author, lang, t, onSaved, onCancel }) {
  // The language being edited is fixed when the editor opens, so switching the UI language
  // mid-edit keeps your text and still saves it into the right version.
  const [editLang] = useState(lang)
  const [values, setValues] = useState(() => ({
    title: post ? tx(post.title, editLang) : '',
    // A new post starts with the logged-in author's name (it can still be changed, for a pen name).
    author: post ? post.author ?? '' : author.name,
    // Old posts may store a retired cover key; coverFor maps it to one of the current colours.
    cover: coverFor(post?.cover).key,
    body: post ? tx(post.body, editLang) : '',
    // The tags array becomes one text for the field: ['react', 'routing'] → 'react, routing'.
    tags: (post?.tags ?? []).join(', '),
  }))
  const [touched, setTouched] = useState({})
  const [tab, setTab] = useState('write')
  const [status, setStatus] = useState('idle') // 'idle' | 'saving' | 'error'
  const [error, setError] = useState('')
  const formRef = useRef(null)
  const e = t.editor
  usePageMeta(post ? e.editTitle : e.newTitle, t.blogIntro)

  const errors = validate(values)
  const show = (field) => (touched[field] && errors[field] ? t.errors[errors[field]] : undefined)
  const set = (field) => (ev) => setValues((v) => ({ ...v, [field]: ev.target.value }))
  const blur = (field) => () => setTouched((x) => ({ ...x, [field]: true }))

  const save = async (ev) => {
    ev.preventDefault()
    setTouched({ title: true, author: true, body: true })
    const first = ['title', 'author', 'body'].find((f) => errors[f])
    if (first) {
      if (first === 'body') setTab('write')
      // Wait one frame so the (maybe just un-hidden) field can take focus.
      requestAnimationFrame(() => formRef.current?.elements[first]?.focus())
      return
    }

    // Bilingual seed posts: only the edited language changes, the other one is kept.
    const merge = (original, value) => (isBilingual(original) ? { ...original, [editLang]: value } : value)
    const data = {
      title: merge(post?.title, values.title.trim()),
      body: merge(post?.body, values.body),
      author: values.author.trim(),
      cover: values.cover,
      tags: parseTags(values.tags),
      // A new post remembers who wrote it: only that author may change it later.
      ...(post ? {} : { authorId: author.id }),
    }

    setStatus('saving')
    setError('')
    try {
      const saved = post ? await api.update('posts', post.id, data) : await api.create('posts', data)
      onSaved(saved.id, post ? 'saved' : 'created')
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  const onTabKey = (ev) => {
    if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return
    const next = tab === 'write' ? 'preview' : 'write'
    setTab(next)
    document.getElementById(`bl-tab-${next}`)?.focus()
  }

  const describe = (field, extra) => [extra, show(field) && `bl-err-${field}`].filter(Boolean).join(' ') || undefined
  const saving = status === 'saving'

  return (
    <form ref={formRef} className="bl-page bl-editor" onSubmit={save} noValidate>
      <h3>{post ? e.editTitle : e.newTitle}</h3>
      {post && isBilingual(post.title) && <p className="bl-note">{e.bilingual(e.langNames[editLang])}</p>}

      <fieldset className="bl-editor__fields" disabled={saving}>
        <div className="bl-editor__row">
          <label className="field">
            <span>{e.title}</span>
            <input
              className="input"
              name="title"
              value={values.title}
              maxLength={120}
              onChange={set('title')}
              onBlur={blur('title')}
              aria-invalid={Boolean(show('title'))}
              aria-describedby={describe('title')}
            />
            {show('title') && (
              <small id="bl-err-title" className="bl-error">
                {show('title')}
              </small>
            )}
          </label>
          <label className="field">
            <span>{e.author}</span>
            <input
              className="input"
              name="author"
              value={values.author}
              maxLength={60}
              autoComplete="name"
              onChange={set('author')}
              onBlur={blur('author')}
              aria-invalid={Boolean(show('author'))}
              aria-describedby={describe('author')}
            />
            {show('author') && (
              <small id="bl-err-author" className="bl-error">
                {show('author')}
              </small>
            )}
          </label>
        </div>

        <fieldset className="bl-covers">
          <legend>{e.cover}</legend>
          <div className="bl-covers__list">
            {COVERS.map((cover) => {
              const name = cover.name[lang]
              return (
                <label key={cover.key} className="bl-cover" title={name}>
                  <input
                    type="radio"
                    name="cover"
                    value={cover.key}
                    checked={values.cover === cover.key}
                    onChange={set('cover')}
                  />
                  {/* A live preview: every swatch shows the initial of the title being typed. */}
                  <Cover cover={cover.key} title={values.title} className="bl-cover__swatch" />
                  <span className="visually-hidden">{name}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="bl-editor__body">
          <div className="bl-editor__bar">
            <label htmlFor="bl-body" className="bl-editor__label">
              {e.body}
            </label>
            <div className="bl-tabs" role="tablist" aria-label={e.body}>
              {TABS.map((key) => (
                <button
                  key={key}
                  id={`bl-tab-${key}`}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  aria-controls={`bl-panel-${key}`}
                  tabIndex={tab === key ? 0 : -1}
                  onClick={() => setTab(key)}
                  onKeyDown={onTabKey}
                >
                  {e[key]}
                </button>
              ))}
            </div>
          </div>

          <div id="bl-panel-write" role="tabpanel" aria-labelledby="bl-tab-write" hidden={tab !== 'write'}>
            <textarea
              id="bl-body"
              name="body"
              className="input bl-editor__textarea"
              rows={14}
              value={values.body}
              onChange={set('body')}
              onBlur={blur('body')}
              aria-invalid={Boolean(show('body'))}
              aria-describedby={describe('body', 'bl-md-help')}
              spellCheck
            />
            <small id="bl-md-help" className="bl-editor__help">
              {e.help}
            </small>
          </div>
          <div id="bl-panel-preview" role="tabpanel" aria-labelledby="bl-tab-preview" hidden={tab !== 'preview'} className="bl-editor__preview">
            {values.body.trim() ? <Markdown source={values.body} /> : <p className="bl-note">{e.nothing}</p>}
          </div>
          {show('body') && (
            <small id="bl-err-body" className="bl-error">
              {show('body')}
            </small>
          )}
        </div>

        <label className="field">
          <span>{e.tags}</span>
          <input
            className="input"
            name="tags"
            value={values.tags}
            maxLength={120}
            placeholder="react, markdown"
            onChange={set('tags')}
            aria-describedby="bl-tags-help"
          />
          <small id="bl-tags-help" className="bl-editor__help">
            {e.tagsHint}
          </small>
        </label>

        {status === 'error' && (
          <p className="bl-alert" role="alert">
            <strong>{e.failed}</strong> {error}
          </p>
        )}

        <div className="bl-row bl-editor__actions">
          <button type="submit" className="btn" aria-busy={saving}>
            {saving && <span className="bl-spinner" aria-hidden="true" />}
            {saving ? e.saving : post ? e.save : e.publish}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {e.cancel}
          </button>
        </div>
      </fieldset>
    </form>
  )
}

// Edit mode loads the post first; the form only mounts once the data is there,
// so its initial state can be computed from the post.
function EditLoader({ id, ...props }) {
  const post = useRequest(() => api.get('posts', id), id)
  const { t, author } = props
  if (post.status === 'loading') return <Loading label={t.loading} lines={4} />
  if (post.status === 'error') {
    return post.error.status === 404 ? (
      <NotFound title={t.pageNotFoundTitle} text={t.notFound} backLabel={t.back} />
    ) : (
      <ErrorState title={t.loadFailed} message={post.error.message} onRetry={post.retry} retryLabel={t.retry} />
    )
  }
  // Typing #/edit/… by hand is no way round it: only the post's own author gets the form.
  if (!canEdit(post.data, author)) {
    return (
      <div className="bl-empty">
        <p>{t.onlyAuthor(post.data.author)}</p>
        <a className="btn btn--ghost" href={`#/post/${id}`}>
          <span aria-hidden="true">←</span> {t.backToPost}
        </a>
      </div>
    )
  }
  return <EditorForm post={post.data} {...props} />
}

export default function PostEditor({ id, ...props }) {
  return id ? <EditLoader id={id} {...props} /> : <EditorForm {...props} />
}
