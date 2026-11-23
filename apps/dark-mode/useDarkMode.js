import { useEffect, useState } from 'react'

const STORAGE_KEY = 'rika-dark-mode:mode'
const QUERY = '(prefers-color-scheme: dark)'
const MODES = ['light', 'dark', 'system']

function readSavedMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (MODES.includes(saved)) return saved
  } catch {
    // ha a tárhely nem elérhető, marad a rendszerbeállítás
  }
  return 'system'
}

// Saját hook: megjegyzi a választást, és „Rendszer” módban követi a gép beállítását.
export function useDarkMode() {
  const [mode, setMode] = useState(readSavedMode)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(QUERY).matches)

  // Figyeljük, ha a felhasználó a gépén átállítja a témát.
  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const onChange = (event) => setSystemDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // Mentés minden változáskor.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // nem baj, ha nem menthető
    }
  }, [mode])

  const isDark = mode === 'dark' || (mode === 'system' && systemDark)
  return { mode, setMode, isDark, systemDark }
}
