import { createContext, useContext } from 'react'
import { useDarkMode } from './useDarkMode.js'

const ThemeContext = createContext(null)

// The Provider calls the hook once, so every child component sees the same state.
export function ThemeProvider({ children }) {
  const value = useDarkMode()
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
