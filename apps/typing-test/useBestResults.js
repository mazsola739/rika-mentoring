import { useCallback, useEffect, useState } from 'react'

const KEY = 'rika:typing-test:best'

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}

export function isBetter(result, best) {
  if (!best) return true
  return result.wpm > best.wpm || (result.wpm === best.wpm && result.accuracy > best.accuracy)
}

// Best result per mode ({ time30: { wpm, accuracy, at }, … }), synced to localStorage by an effect.
export function useBestResults() {
  const [bests, setBests] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(bests))
    } catch {
      // storage blocked: the results stay for this session only
    }
  }, [bests])

  const record = useCallback((mode, result) => {
    setBests((current) => (isBetter(result, current[mode]) ? { ...current, [mode]: result } : current))
  }, [])

  return { bests, record }
}
