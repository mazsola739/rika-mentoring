import { useState } from 'react'
import { useLang } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { useServerTodos } from './useServerTodos.js'
import {
  FILTER_KEYS,
  addTodo,
  clearDone,
  countTodos,
  deleteTodo,
  filterTodos,
  moveTodo,
  renameTodo,
  toggleTodo,
  updateTodo,
} from './todoLogic.js'
import { SORTS } from './todos.js'
import AddTodo from './AddTodo.jsx'
import TodoItem from './TodoItem.jsx'

export default function TodoList({ accountId, t, onLogout }) {
  const lang = useLang()
  const { todos, setTodos, status, saveStatus, retry } = useServerTodos(accountId)
  // View settings belong to this browser, not to the account, so they stay in localStorage.
  const [savedFilter, setFilter] = useLocalStorage('rika:todo:filter', 'all')
  const [sort, setSort] = useLocalStorage('rika:todo:sort', 'manual')
  const [draggedId, setDraggedId] = useState(null) // the ID of the task being dragged, or null

  // Derived values, worked out on every render. An unknown saved filter (an old or broken save) counts as 'all'.
  const filter = FILTER_KEYS.includes(savedFilter) ? savedFilter : 'all'
  const counts = countTodos(todos)
  const compare = SORTS[sort] // undefined: the user's own order
  const canMove = !compare
  const visible = canMove ? filterTodos(todos, filter) : [...filterTodos(todos, filter)].sort(compare)

  // Every change builds a new array with a pure function from todoLogic.js; the hook saves it on the server.
  const add = (values) => setTodos(addTodo(todos, values))
  const toggle = (id) => setTodos(toggleTodo(todos, id))
  const rename = (id, text) => setTodos(renameTodo(todos, id, text))
  const update = (id, patch) => setTodos(updateTodo(todos, id, patch))
  const remove = (id) => setTodos(deleteTodo(todos, id))
  const removeDone = () => setTodos(clearDone(todos))

  // The dragged task was dropped on the targetId task: it takes that task's place.
  const drop = (targetId) => {
    if (draggedId !== null && draggedId !== targetId) setTodos(moveTodo(todos, draggedId, targetId))
    setDraggedId(null)
  }

  // The arrows: one place up (-1) or down (+1) in the visible list, so hidden tasks are skipped.
  const move = (id, step) => {
    const index = visible.findIndex((todo) => todo.id === id)
    const neighbor = visible[index + step]
    if (neighbor) setTodos(moveTodo(todos, id, neighbor.id))
  }

  // Until the list is here, only a message shows. These returns come after all the hooks, never before them.
  if (status === 'loading') {
    return (
      <p className="td-status" role="status">
        {t.loading}
      </p>
    )
  }
  if (status !== 'ready') {
    const missing = status === 'missing'
    return (
      <div className="td-status td-status--error" role="alert">
        <p>{missing ? t.missing : t.loadError}</p>
        <button type="button" className="btn" onClick={missing ? onLogout : retry}>
          {missing ? t.logInAgain : t.retry}
        </button>
      </div>
    )
  }

  return (
    <>
      <AddTodo onAdd={add} t={t} />

      <div className="td-toolbar">
        <div className="td-filters" role="group" aria-label={t.filterLabel}>
          {FILTER_KEYS.map((key) => (
            <button key={key} type="button" className="chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {t.filters[key]}
              <span className="td-count">{counts[key]}</span>
            </button>
          ))}
        </div>
        <label className="td-sort">
          <span>{t.sort}</span>
          <select className="input" value={SORTS[sort] ? sort : 'manual'} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(t.sorts).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="td-empty">{t.empty[filter]}</p>
      ) : (
        <ul className="td-list">
          {/* key = the task's own id, so React keeps each row (and its edit state) when the list changes order. */}
          {visible.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              lang={lang}
              t={t}
              canMove={canMove}
              isFirst={index === 0}
              isLast={index === visible.length - 1}
              dragging={draggedId === todo.id}
              onToggle={toggle}
              onRename={rename}
              onUpdate={update}
              onDelete={remove}
              onMove={move}
              onDragStart={setDraggedId}
              onDragEnd={() => setDraggedId(null)}
              onDrop={drop}
            />
          ))}
        </ul>
      )}

      <div className="td-footer">
        <span>{t.left(counts.active)}</span>
        <span className={`td-save td-save--${saveStatus}`} aria-live="polite">
          {t.saveStatus[saveStatus]}
        </span>
        {saveStatus === 'failed' && (
          <button type="button" className="btn btn--ghost td-small" onClick={() => setTodos(todos)}>
            {t.saveAgain}
          </button>
        )}
        <button type="button" className="btn btn--ghost td-small" onClick={removeDone} disabled={counts.done === 0}>
          {t.clearDone(counts.done)}
        </button>
      </div>
      <p className="td-hint">{canMove ? t.hintManual : t.hintSorted}</p>
    </>
  )
}
