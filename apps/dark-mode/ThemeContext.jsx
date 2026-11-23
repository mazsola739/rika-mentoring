import { createContext, useContext } from 'react'
import { useDarkMode } from './useDarkMode.js'

const ThemeContext = createContext(null)

// A Provider egyszer hívja meg a hookot, és minden gyerekkomponens ugyanazt az állapotot látja.
export function ThemeProvider({ children }) {
  const theme = useDarkMode()
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const theme = useContext(ThemeContext)
  if (!theme) throw new Error('useTheme must be used inside <ThemeProvider>')
  return theme
}
