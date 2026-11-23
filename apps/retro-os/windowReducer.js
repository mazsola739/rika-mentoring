// Window manager state as plain data: every window is an object, the reducer is a pure function.
// z is a growing counter: the window with the highest z is on top (and has the focus).

export const TASKBAR_HEIGHT = 40
const STORAGE_KEY = 'rika:retro-os:windows'

export const initialState = { windows: [], topZ: 0 }

const topWindow = (windows) =>
  windows.filter((w) => !w.minimized).reduce((top, w) => (!top || w.z > top.z ? w : top), null)

export function focusedId(state) {
  return topWindow(state.windows)?.id ?? null
}

export function windowReducer(state, action) {
  const patch = (id, changes) => state.windows.map((w) => (w.id === id ? { ...w, ...changes } : w))
  const z = state.topZ + 1

  switch (action.type) {
    case 'open': {
      const existing = state.windows.find((w) => w.id === action.app)
      if (existing) return { windows: patch(existing.id, { minimized: false, z, openedAt: action.now }), topZ: z }
      const n = state.windows.length
      const win = {
        id: action.app,
        app: action.app,
        x: Math.max(4, Math.min(action.x + n * 26, action.maxX)),
        y: Math.max(4, Math.min(action.y + n * 22, action.maxY)),
        minimized: false,
        maximized: false,
        z,
        openedAt: action.now, // time comes in with the action, so the reducer stays pure
      }
      return { windows: [...state.windows, win], topZ: z }
    }
    case 'close':
      return { ...state, windows: state.windows.filter((w) => w.id !== action.id) }
    case 'focus': {
      const win = state.windows.find((w) => w.id === action.id)
      if (!win || (win.z === state.topZ && !win.minimized)) return state // already on top: no re-render
      return { windows: patch(action.id, { z, minimized: false }), topZ: z }
    }
    case 'minimize':
      return { ...state, windows: patch(action.id, { minimized: true }) }
    case 'toggleMaximize': {
      const win = state.windows.find((w) => w.id === action.id)
      return { windows: patch(action.id, { maximized: !win?.maximized, z }), topZ: z }
    }
    case 'move':
      return { ...state, windows: patch(action.id, { x: action.x, y: action.y }) }
    case 'taskbarClick': {
      // Like the classic taskbar: minimized → restore, active → minimize, otherwise → bring to front.
      const win = state.windows.find((w) => w.id === action.id)
      if (!win) return state
      if (!win.minimized && focusedId(state) === win.id) return { ...state, windows: patch(win.id, { minimized: true }) }
      return { windows: patch(win.id, { minimized: false, z }), topZ: z }
    }
    case 'reset':
      return initialState
    default:
      throw new Error(`Unknown window action: ${action.type}`)
  }
}

export function loadState(knownApps) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved?.windows)) {
      const windows = saved.windows.filter((w) => knownApps.includes(w.app))
      return { windows, topZ: Math.max(0, ...windows.map((w) => w.z)) }
    }
  } catch {
    // ignore broken data
  }
  return initialState
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // not critical
  }
}
