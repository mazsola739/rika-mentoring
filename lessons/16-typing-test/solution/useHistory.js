import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'

const KEY = 'rika:typing-test:history'
const MAX_RUNS = 100

export function isBetter(result, best) {
  if (!best) return true
  return result.wpm > best.wpm || (result.wpm === best.wpm && result.accuracy > best.accuracy)
}

// Fastest first; with equal speed, the more accurate run first. Returns a sorted copy.
export function rankRuns(runs) {
  return [...runs].sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
}

// Every finished run, newest first: { at, mode, name, wpm, accuracy, cpm }. Synced with the other open
// windows, so in a race both results are kept.
export function useHistory() {
  const [saved, setSaved] = useLocalStorage(KEY, [], true)
  const history = Array.isArray(saved) ? saved : []

  // Stable (useCallback), because it is a dependency of the saving effect in TypingRun.
  // Idempotent: a run that is already in the list (same `at`) is not added again.
  const record = useCallback(
    (run) => {
      setSaved((list) => {
        const current = Array.isArray(list) ? list : []
        if (current.some((item) => item.at === run.at)) return list
        return [run, ...current].slice(0, MAX_RUNS)
      })
    },
    [setSaved],
  )

  return { history, record }
}
