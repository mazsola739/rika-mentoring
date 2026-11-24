import { useReducer } from 'react'

// Undo/redo with two stacks: `done` holds what is on the canvas, `undone` what can come back.
// Any new action empties the redo stack, like in every editor.
function reducer(state, action) {
  switch (action.type) {
    case 'push':
      return { done: [...state.done, action.entry], undone: [] }
    case 'undo': {
      if (!state.done.length) return state
      return { done: state.done.slice(0, -1), undone: [state.done.at(-1), ...state.undone] }
    }
    case 'redo': {
      if (!state.undone.length) return state
      const [next, ...rest] = state.undone
      return { done: [...state.done, next], undone: rest }
    }
    default:
      return state
  }
}

export const useHistory = () => {
  const [state, dispatch] = useReducer(reducer, { done: [], undone: [] })
  return {
    history: state.done,
    canUndo: state.done.length > 0,
    canRedo: state.undone.length > 0,
    push: (entry) => dispatch({ type: 'push', entry }),
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
  }
}
