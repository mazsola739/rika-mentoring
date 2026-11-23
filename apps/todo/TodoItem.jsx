import { useRef, useState } from 'react'
import LevelMeter from '@shared/ui/LevelMeter.jsx'
import { PRIORITY_LEVEL, dueInfo, label } from './todos.js'

export default function TodoItem({ todo, onToggle, onUpdate, onDelete, lang, t }) {
  // Edit mode is local state: only this one row needs to know about it.
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const cancelled = useRef(false) // Esc should not save on the blur that follows
  const text = label(todo.text, lang)
  const due = dueInfo(todo.due, lang)

  const startEditing = () => {
    cancelled.current = false
    setDraft(text)
    setEditing(true)
  }

  const cancel = () => {
    cancelled.current = true
    setEditing(false)
  }

  const save = () => {
    if (cancelled.current) return
    const value = draft.trim()
    if (value && value !== text) onUpdate(todo.id, { text: value })
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="td-item is-editing">
        {/* Leaving the whole form (not just the input) saves, so the priority menu stays usable. */}
        <form
          className="td-edit"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && save()}
          onKeyDown={(e) => e.key === 'Escape' && cancel()}
        >
          <label className="visually-hidden" htmlFor={`td-edit-${todo.id}`}>
            {t.editLabel}
          </label>
          <input id={`td-edit-${todo.id}`} className="input" value={draft} autoFocus onChange={(e) => setDraft(e.target.value)} />
          <select
            className="input td-select"
            aria-label={t.priority}
            value={todo.priority}
            onChange={(e) => onUpdate(todo.id, { priority: e.target.value })}
          >
            {Object.entries(t.priorities).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="input td-date"
            aria-label={t.dueDate}
            value={todo.due ?? ''}
            onChange={(e) => onUpdate(todo.id, { due: e.target.value })}
          />
          <button type="submit" className="btn td-small">
            {t.save}
          </button>
        </form>
      </li>
    )
  }

  return (
    <li className={`td-item${todo.done ? ' is-done' : ''}`}>
      <input
        type="checkbox"
        className="td-check"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={t.markDone(text)}
      />
      <div className="td-body" onDoubleClick={startEditing}>
        <span className="td-text">{text}</span>
        <span className="td-meta">
          <span className="td-priority" title={`${t.priority}: ${t.priorities[todo.priority]}`}>
            <LevelMeter value={PRIORITY_LEVEL[todo.priority]} max={3} />
            {t.priorities[todo.priority]}
          </span>
          {due && <span className={`td-due td-due--${due.state}`}>{t.due[due.state](due.date)}</span>}
        </span>
      </div>
      <div className="td-actions">
        <button type="button" className="td-icon" onClick={startEditing} aria-label={`${t.edit}: ${text}`} title={t.edit}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
            <path d="m13.5 6.5 4 4" />
          </svg>
        </button>
        <button
          type="button"
          className="td-icon"
          onClick={() => onDelete(todo.id)}
          aria-label={`${t.delete}: ${text}`}
          title={t.delete}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </li>
  )
}
