export const initialState = { typed: '', keystrokes: 0, errors: 0, startedAt: null, endedAt: null }

// Every keystroke goes through this reducer. Keystrokes and errors are counted here, so accuracy
// also remembers mistakes that were later fixed with Backspace.
export function typingReducer(state, action) {
  switch (action.type) {
    case 'input': {
      if (state.endedAt) return state
      const { text, time } = action
      const value = action.value.replace(/\n/g, '').slice(0, text.length)

      // Only characters after the part that stayed the same count as new keystrokes.
      let same = 0
      while (same < value.length && same < state.typed.length && value[same] === state.typed[same]) same++
      let keystrokes = state.keystrokes
      let errors = state.errors
      for (let i = same; i < value.length; i++) {
        keystrokes++
        if (value[i] !== text[i]) errors++
      }

      const startedAt = state.startedAt ?? (value.length > 0 ? time : null)
      const endedAt = value.length === text.length ? time : null
      return { typed: value, keystrokes, errors, startedAt, endedAt }
    }
    case 'finish':
      return state.endedAt || !state.startedAt ? state : { ...state, endedAt: action.time }
    default:
      return state
  }
}

// Words per minute uses the standard "5 characters = 1 word" rule and counts only correct characters.
export function computeStats({ correct, keystrokes, errors }, elapsedMs) {
  const minutes = elapsedMs / 60000
  const valid = elapsedMs >= 1000
  return {
    wpm: valid ? Math.round(correct / 5 / minutes) : 0,
    cpm: valid ? Math.round(correct / minutes) : 0,
    accuracy: keystrokes ? Math.round(((keystrokes - errors) / keystrokes) * 100) : 100,
  }
}

// Countdowns round up (0:30 at the start), elapsed time rounds down.
export function formatClock(ms, round = Math.ceil) {
  const total = Math.max(0, round(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
