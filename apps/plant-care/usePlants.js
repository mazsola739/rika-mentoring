import { useEffect, useState } from 'react'
import { createSamplePlants } from './samplePlants.js'

const KEY = 'rika:plant-care:plants'

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(saved)) return saved
  } catch {
    // broken JSON or blocked storage: start with the samples
  }
  return createSamplePlants()
}

// The plant list, saved to localStorage on every change. Photos make the data big,
// so a failed save (quota exceeded) is reported instead of silently ignored.
export const usePlants = () => {
  const [plants, setPlants] = useState(load)
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(plants))
      setSaveFailed(false)
    } catch {
      setSaveFailed(true)
    }
  }, [plants])

  return [plants, setPlants, saveFailed]
}

// A clock that ticks once a minute, so "thirsty" appears without a page reload.
export const useNow = (interval = 60_000) => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(timer)
  }, [interval])
  return now
}
