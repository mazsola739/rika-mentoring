import { useEffect, useState } from 'react'

const STORAGE_KEY = 'rika:dark-mode:mode'
const QUERY = '(prefers-color-scheme: dark)'
const MODES = ['light', 'dark', 'system']

function readSavedMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (MODES.includes(saved)) return saved
  } catch {
    // Storage unavailable: keep following the system setting.
  }
  return 'system'
}

// Custom hook: remembers the choice and, in "system" mode, follows the device setting.
export function useDarkMode() {
  const [mode, setMode] = useState(readSavedMode)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(QUERY).matches)

  // Listen for the user changing the theme on their device, and stop listening on unmount.
  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const onChange = (event) => setSystemDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // Save the mode on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // Not a problem if it cannot be saved.
    }
  }, [mode])

  const isDark = mode === 'dark' || (mode === 'system' && systemDark)
  return { mode, setMode, isDark, systemDark }
}
