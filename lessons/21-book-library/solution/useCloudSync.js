import { useEffect, useRef, useState } from 'react'
import { loadShelves, saveShelves } from './cloud.js'
import { cleanBooks } from './useShelves.js'

// Keeps the shelves in step with the account on the pretend server. After a login (and on every visit
// while logged in) the account's books replace the ones in this browser; save() sends every change.
// status: 'loading' | 'saving' | 'saved' | 'load-failed' | 'save-failed' | 'expired'
export function useCloudSync(token, setBooks) {
  // The status belongs to one token, so a new login never shows the last one's "saved" for a moment.
  const [state, setState] = useState({ token: null, status: 'loading' })
  const [attempt, setAttempt] = useState(0) // reload() increases it, and the effect runs again
  const lastSave = useRef(0) // only the newest save may report how it went

  useEffect(() => {
    if (!token) return undefined
    // The cleanup sets this after a logout or a new attempt: a late answer is then ignored.
    let ignore = false
    setState({ token, status: 'loading' })
    loadShelves(token)
      .then((saved) => {
        if (ignore) return
        // null: nothing is saved in the account yet, so the books of this browser stay.
        if (saved !== null) setBooks(cleanBooks(saved))
        setState({ token, status: 'saved' })
      })
      .catch((error) => {
        if (!ignore) setState({ token, status: error.status === 401 ? 'expired' : 'load-failed' })
      })
    return () => {
      ignore = true
    }
  }, [token, attempt, setBooks])

  async function save(books) {
    if (!token) return // nobody is logged in: the books stay in this browser only
    const id = ++lastSave.current
    setState({ token, status: 'saving' })
    try {
      await saveShelves(token, books)
      if (id === lastSave.current) setState({ token, status: 'saved' })
    } catch (error) {
      if (id === lastSave.current) setState({ token, status: error.status === 401 ? 'expired' : 'save-failed' })
    }
  }

  function reload() {
    setAttempt((n) => n + 1)
  }

  return { status: state.token === token ? state.status : 'loading', save, reload }
}
