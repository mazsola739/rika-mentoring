import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { focusedId, loadState, saveState, windowReducer } from './windowReducer.js'

const WindowContext = createContext(null)

// One provider for the whole desktop: icons, windows, the taskbar and the Start menu
// all read the same window list and send actions to the same reducer.
// `apps` lists the known program keys, so saved windows of removed apps are dropped on load.
export const WindowProvider = ({ apps, children }) => {
  const [state, dispatch] = useReducer(windowReducer, apps, loadState)
  const [bounds, setBounds] = useState({ width: 640, height: 520 }) // measured by the desktop

  // Save shortly after the last change (dragging changes the state on every pointer move).
  useEffect(() => {
    const timer = setTimeout(() => saveState(state), 300)
    return () => clearTimeout(timer)
  }, [state])

  const value = useMemo(
    () => ({
      windows: state.windows,
      focusedId: focusedId(state),
      bounds,
      setBounds,
      open: (app) =>
        dispatch({ type: 'open', app, x: 96, y: 18, maxX: bounds.width - 220, maxY: bounds.height - 200, now: Date.now() }),
      close: (id) => dispatch({ type: 'close', id }),
      focus: (id) => dispatch({ type: 'focus', id }),
      minimize: (id) => dispatch({ type: 'minimize', id }),
      toggleMaximize: (id) => dispatch({ type: 'toggleMaximize', id }),
      move: (id, x, y) => dispatch({ type: 'move', id, x, y }),
      taskbarClick: (id) => dispatch({ type: 'taskbarClick', id }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state, bounds],
  )

  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
}

export const useWindows = () => {
  const ctx = useContext(WindowContext)
  if (!ctx) throw new Error('useWindows must be used inside <WindowProvider>')
  return ctx
}
