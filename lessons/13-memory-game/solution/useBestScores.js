import { useState } from 'react'
import { isBetter } from './game.js'

const KEY = 'rika:memory-game:best'

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}

// Best result per difficulty ({ 6: { moves, time }, 8: … }), kept in localStorage.
export function useBestScores() {
  const [bests, setBests] = useState(load)

  // Saves the result if it beats the stored one and tells the caller whether it did.
  const record = (pairs, result) => {
    if (!isBetter(result, bests[pairs])) return false
    const next = { ...bests, [pairs]: result }
    setBests(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // storage can be full or blocked; the result still shows for this session
    }
    return true
  }

  return { bests, record }
}
