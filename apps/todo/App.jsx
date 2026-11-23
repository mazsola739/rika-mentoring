import { useState } from 'react'
import AppFrame from '@shared/ui/AppFrame.jsx'
import { useLang, useText } from '@shared/i18n.js'
import { useLocalStorage } from './useLocalStorage.js'
import { FILTERS, SORTS, seedTodos } from './todos.js'
import TodoItem from './TodoItem.jsx'
import './app.css'

const TEXT = {
  en: {
    newTask: 'New task',
    placeholder: 'What needs to be done?',
    add: 'Add',
    priority: 'Priority',
    priorities: { low: 'Low', normal: 'Normal', high: 'High' },
    dueDate: 'Due date',
    filters: { all: 'All', active: 'Active', done: 'Done' },
    filterLabel: 'Show',
    sort: 'Sort',
    sorts: { newest: 'Newest first', due: 'Due date', priority: 'Priority' },
    left: (n) => (n === 1 ? '1 task left' : `${n} tasks left`),
    clearDone: (n) => `Clear completed (${n})`,
    empty: {
      all: 'Nothing to do yet. Add your first task above.',
      active: 'Everything is done. Nice work!',
      done: 'No completed tasks yet.',
    },
    markDone: (text) => `Done: ${text}`,
    edit: 'Edit',
    editLabel: 'Edit task',
    save: 'Save',
    delete: 'Delete',
    due: {
      overdue: (d) => `Overdue · ${d}`,
      today: () => 'Due today',
      tomorrow: () => 'Due tomorrow',
      later: (d) => `Due ${d}`,
    },
    hint: 'Tip: double-click a task to edit it. Enter saves, Esc cancels.',
  },
  hu: {
    newTask: 'Új feladat',
    placeholder: 'Mit kell elintézni?',
    add: 'Hozzáadás',
    priority: 'Fontosság',
    priorities: { low: 'Ráér', normal: 'Normál', high: 'Sürgős' },
    dueDate: 'Határidő',
    filters: { all: 'Összes', active: 'Aktív', done: 'Kész' },
    filterLabel: 'Mutasd',
    sort: 'Rendezés',
    sorts: { newest: 'Legújabb elöl', due: 'Határidő', priority: 'Fontosság' },
    left: (n) => `${n} feladat van hátra`,
    clearDone: (n) => `Készek törlése (${n})`,
    empty: {
      all: 'Még nincs teendő. Add hozzá az elsőt fent.',
      active: 'Minden kész. Szép munka!',
      done: 'Még nincs elvégzett feladat.',
    },
    markDone: (text) => `Kész: ${text}`,
    edit: 'Szerkesztés',
    editLabel: 'Feladat szerkesztése',
    save: 'Mentés',
    delete: 'Törlés',
    due: {
      overdue: (d) => `Lejárt · ${d}`,
      today: () => 'Ma esedékes',
      tomorrow: () => 'Holnap esedékes',
      later: (d) => `Határidő: ${d}`,
    },
    hint: 'Tipp: dupla kattintással szerkesztheted a feladatot. Enter: mentés, Esc: mégse.',
  },
}

function AddTodo({ onAdd, t }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('normal')
  const [due, setDue] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd({ text: text.trim(), priority, due })
    setText('')
    setDue('')
    setPriority('normal')
  }

  return (
    <form className="td-add" onSubmit={submit}>
      <label className="field td-add__text">
        <span>{t.newTask}</span>
        <input
          className="input"
          value={text}
          placeholder={t.placeholder}
          onChange={(e) => setText(e.target.value)}
          maxLength={140}
        />
      </label>
      <label className="field">
        <span>{t.priority}</span>
        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
          {Object.entries(t.priorities).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>{t.dueDate}</span>
        <input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      </label>
      <button type="submit" className="btn td-add__btn" disabled={!text.trim()}>
        {t.add}
      </button>
    </form>
  )
}

function TodoApp() {
  const lang = useLang()
  const t = useText(TEXT)
  const [todos, setTodos] = useLocalStorage('rika:todo:items', seedTodos)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useLocalStorage('rika:todo:sort', 'newest')

  // Derived values: counts and the visible list come from `todos` on every render.
  const counts = {
    all: todos.length,
    active: todos.filter(FILTERS.active).length,
    done: todos.filter(FILTERS.done).length,
  }
  const visible = todos.filter(FILTERS[filter]).sort(SORTS[sort] ?? SORTS.newest)

  // Create / update / delete always build a new array, the old one is never mutated.
  const add = (values) =>
    setTodos((list) => [{ id: crypto.randomUUID(), done: false, createdAt: Date.now(), ...values }, ...list])
  const update = (id, patch) => setTodos((list) => list.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo)))
  const toggle = (id) => setTodos((list) => list.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  const remove = (id) => setTodos((list) => list.filter((todo) => todo.id !== id))
  const clearDone = () => setTodos((list) => list.filter((todo) => !todo.done))

  return (
    <div className="td">
      <AddTodo onAdd={add} t={t} />

      <div className="td-toolbar">
        <div className="td-filters" role="group" aria-label={t.filterLabel}>
          {Object.keys(FILTERS).map((key) => (
            <button key={key} type="button" className="chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {t.filters[key]}
              <span className="td-count">{counts[key]}</span>
            </button>
          ))}
        </div>
        <label className="td-sort">
          <span>{t.sort}</span>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
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
          {/* key = the task's own id, so React keeps each row (and its edit state) when the list is re-sorted. */}
          {visible.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggle} onUpdate={update} onDelete={remove} lang={lang} t={t} />
          ))}
        </ul>
      )}

      <div className="td-footer">
        <span aria-live="polite">{t.left(counts.active)}</span>
        <button type="button" className="btn btn--ghost td-small" onClick={clearDone} disabled={counts.done === 0}>
          {t.clearDone(counts.done)}
        </button>
      </div>
      <p className="td-hint">{t.hint}</p>
    </div>
  )
}

export default function App() {
  return (
    <AppFrame slug="todo">
      <TodoApp />
    </AppFrame>
  )
}
