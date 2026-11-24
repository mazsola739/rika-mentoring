import { useEffect, useRef, useState } from 'react'
import { fetchTodos, saveTodos } from './server.js'

// The logged-in account's tasks: loaded from the pretend server, and sent back after every change.
export function useServerTodos(accountId) {
  const [todos, setTodos] = useState([])
  const [status, setStatus] = useState('loading') // 'loading', 'ready', 'error' or 'missing'
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved', 'saving' or 'failed'
  const [attempt, setAttempt] = useState(0) // "Try again" increases it, which runs the effect again
  const lastSave = useRef(0) // only the newest save may change saveStatus

  // Loading: when the list appears, and on every new attempt.
  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const list = await fetchTodos(accountId)
        if (ignore) return
        setTodos(list)
        setStatus('ready')
      } catch (error) {
        if (!ignore) setStatus(error.status === 404 ? 'missing' : 'error')
      }
    }

    load()
    // Cleanup: after a logout or a new attempt, this request's late answer is thrown away (no race condition).
    return () => {
      ignore = true
    }
  }, [accountId, attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  // Every change shows at once; meanwhile the whole list is sent to the server.
  async function changeTodos(newTodos) {
    setTodos(newTodos)
    setSaveStatus('saving')
    const save = ++lastSave.current
    try {
      await saveTodos(accountId, newTodos)
      if (save === lastSave.current) setSaveStatus('saved')
    } catch {
      if (save === lastSave.current) setSaveStatus('failed')
    }
  }

  return { todos, setTodos: changeTodos, status, saveStatus, retry }
}
