import { useEffect, useState } from 'react'

// Runs an async request when `key` changes and tracks loading / ready / error.
// The `ignore` flag drops answers that arrive after the component moved on.
export function useRequest(request, key) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    request().then(
      (data) => !ignore && setState({ status: 'ready', data, error: null }),
      (error) => !ignore && setState({ status: 'error', data: null, error }),
    )
    return () => {
      ignore = true
    }
    // `request` is a new function on every render, so it is left out on purpose:
    // `key` and `attempt` decide when to fetch again.
  }, [key, attempt])

  const retry = () => {
    setState((s) => ({ ...s, status: 'loading' }))
    setAttempt((a) => a + 1)
  }

  return { ...state, retry }
}
