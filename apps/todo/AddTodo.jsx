import { useState } from 'react'

// The new-task form: three controlled fields. It does not keep the list itself, it only reports a new task via onAdd.
export default function AddTodo({ onAdd, t }) {
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
