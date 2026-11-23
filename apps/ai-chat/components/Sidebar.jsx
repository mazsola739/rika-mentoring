import { useState } from 'react'
import { useLang, useText } from '@shared/i18n.js'
import { TEXT } from '../text.js'

function ConversationItem({ conversation, active, onSelect, onRename, onDelete }) {
  const lang = useLang()
  const t = useText(TEXT)
  const [mode, setMode] = useState('view') // 'view' | 'rename' | 'delete'
  const [draft, setDraft] = useState('')
  const title = conversation.title || t.untitled
  const date = new Intl.DateTimeFormat(lang === 'hu' ? 'hu-HU' : 'en-GB', { month: 'short', day: 'numeric' }).format(
    conversation.updatedAt,
  )

  if (mode === 'rename') {
    const save = () => {
      if (draft.trim()) onRename(draft.trim().slice(0, 60))
      setMode('view')
    }
    return (
      <li className="ac-conv ac-conv--edit">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <label className="visually-hidden" htmlFor={`ac-rename-${conversation.id}`}>
            {t.renameLabel}
          </label>
          <input
            id={`ac-rename-${conversation.id}`}
            className="input ac-conv__input"
            value={draft}
            maxLength={60}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setMode('view')}
          />
          <div className="ac-conv__row">
            <button type="submit" className="ac-mini ac-mini--primary">
              {t.save}
            </button>
            <button type="button" className="ac-mini" onClick={() => setMode('view')}>
              {t.cancel}
            </button>
          </div>
        </form>
      </li>
    )
  }

  if (mode === 'delete') {
    return (
      <li className="ac-conv ac-conv--edit" role="group" aria-label={t.deleteConfirm}>
        <span className="ac-conv__question">{t.deleteConfirm}</span>
        <div className="ac-conv__row">
          <button type="button" className="ac-mini ac-mini--danger" onClick={onDelete} autoFocus>
            {t.yes}
          </button>
          <button type="button" className="ac-mini" onClick={() => setMode('view')}>
            {t.no}
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className={`ac-conv${active ? ' is-active' : ''}`}>
      <button type="button" className="ac-conv__main" onClick={onSelect} aria-current={active ? 'true' : undefined}>
        <span className="ac-conv__title">{title}</span>
        <span className="ac-conv__meta">
          {date} · {t.messages(conversation.messages.length)}
        </span>
      </button>
      <div className="ac-conv__tools">
        <button
          type="button"
          className="ac-icon"
          onClick={() => {
            setDraft(conversation.title ?? '')
            setMode('rename')
          }}
          aria-label={`${t.rename}: ${title}`}
          title={t.rename}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />
          </svg>
        </button>
        <button type="button" className="ac-icon" onClick={() => setMode('delete')} aria-label={`${t.delete}: ${title}`} title={t.delete}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" />
          </svg>
        </button>
      </div>
    </li>
  )
}

export default function Sidebar({ conversations, activeId, open, onToggle, onNew, onSelect, onRename, onDelete }) {
  const t = useText(TEXT)
  return (
    <aside className={`ac-side${open ? ' is-open' : ''}`} aria-label={t.chats}>
      <div className="ac-side__top">
        <button type="button" className="btn ac-new" onClick={onNew}>
          + {t.newChat}
        </button>
        <button type="button" className="ac-side__toggle btn btn--ghost" onClick={onToggle} aria-expanded={open} aria-controls="ac-conv-list">
          {t.showChats(conversations.length)}
        </button>
      </div>
      <ul className="ac-convs" id="ac-conv-list">
        {conversations.length === 0 && <li className="ac-muted">{t.noChats}</li>}
        {conversations.map((c) => (
          <ConversationItem
            key={c.id}
            conversation={c}
            active={c.id === activeId}
            onSelect={() => onSelect(c.id)}
            onRename={(title) => onRename(c.id, title)}
            onDelete={() => onDelete(c.id)}
          />
        ))}
      </ul>
    </aside>
  )
}
