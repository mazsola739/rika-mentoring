import { useRef, useState } from 'react'
import LevelMeter from '@shared/ui/LevelMeter.jsx'
import { PRIORITY_LEVEL, dueInfo, label } from './todos.js'

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {d.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  )
}

const ICONS = {
  up: ['M12 19V5', 'm6 11 6-6 6 6'],
  down: ['M12 5v14', 'm6 13 6 6 6-6'],
  edit: ['M4 20h4L19 9l-4-4L4 16v4Z', 'm13.5 6.5 4 4'],
  delete: ['M6 6l12 12M18 6 6 18'],
}

export default function TodoItem({
  todo,
  lang,
  t,
  canMove,
  isFirst,
  isLast,
  dragging,
  onToggle,
  onRename,
  onUpdate,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  onDrop,
}) {
  // Edit mode is local state: only this one row needs to know about it.
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const cancelled = useRef(false) // Esc / Cancel should not save on the blur that follows
  const text = label(todo.text, lang)
  const due = dueInfo(todo.due, lang)

  const startEditing = () => {
    cancelled.current = false
    setDraft(text) // always start from the current text, not from an edit that was thrown away
    setEditing(true)
  }

  const cancel = () => {
    cancelled.current = true
    setEditing(false)
  }

  const save = () => {
    if (cancelled.current) return
    const value = draft.trim()
    if (value && value !== text) onRename(todo.id, value)
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
          <input
            id={`td-edit-${todo.id}`}
            className="input td-edit__text"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
          />
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
          {/* type="button": inside a form every button would submit (and save) by default.
              onMouseDown keeps the focus in the form, so its blur-save does not run before the click. */}
          <button type="button" className="btn btn--ghost td-small" onMouseDown={(e) => e.preventDefault()} onClick={cancel}>
            {t.cancel}
          </button>
        </form>
      </li>
    )
  }

  // Drag and drop (mouse) works only in the user's own order; the arrows do the same for keyboard and touch.
  const dragProps = canMove
    ? {
        draggable: true,
        onDragStart: (e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', text) // Firefox does not start a drag without data
          onDragStart(todo.id)
        },
        onDragEnd,
        onDragOver: (e) => e.preventDefault(), // allows dropping on this row
        onDrop: (e) => {
          e.preventDefault()
          onDrop(todo.id)
        },
      }
    : {}

  let className = 'td-item'
  if (todo.done) className += ' is-done'
  if (dragging) className += ' is-dragging'

  return (
    <li className={className} {...dragProps}>
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
        {canMove && (
          <>
            <button
              type="button"
              className="td-icon"
              onClick={() => onMove(todo.id, -1)}
              disabled={isFirst}
              aria-label={`${t.moveUp}: ${text}`}
              title={t.moveUp}
            >
              <Icon d={ICONS.up} />
            </button>
            <button
              type="button"
              className="td-icon"
              onClick={() => onMove(todo.id, 1)}
              disabled={isLast}
              aria-label={`${t.moveDown}: ${text}`}
              title={t.moveDown}
            >
              <Icon d={ICONS.down} />
            </button>
          </>
        )}
        <button type="button" className="td-icon" onClick={startEditing} aria-label={`${t.edit}: ${text}`} title={t.edit}>
          <Icon d={ICONS.edit} />
        </button>
        <button
          type="button"
          className="td-icon"
          onClick={() => onDelete(todo.id)}
          aria-label={`${t.delete}: ${text}`}
          title={t.delete}
        >
          <Icon d={ICONS.delete} />
        </button>
      </div>
    </li>
  )
}
