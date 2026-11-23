import { useEffect, useReducer } from 'react'

const KEY = 'rika:ai-chat:state'
const newId = () => crypto.randomUUID()

// All conversations live in one reducer: every change is a named action,
// which makes multi-conversation state much easier to follow than a dozen useStates.
function reducer(state, action) {
  const updateConversation = (id, fn) => ({
    ...state,
    conversations: state.conversations.map((c) => (c.id === id ? { ...fn(c), updatedAt: Date.now() } : c)),
  })
  const updateMessage = (convId, msgId, fn) =>
    updateConversation(convId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)) }))

  switch (action.type) {
    case 'create': {
      const conversation = { id: action.id, title: null, createdAt: Date.now(), updatedAt: Date.now(), messages: [] }
      return { conversations: [conversation, ...state.conversations], activeId: action.id }
    }
    case 'select':
      return { ...state, activeId: action.id }
    case 'rename':
      return updateConversation(action.id, (c) => ({ ...c, title: action.title }))
    case 'remove': {
      const conversations = state.conversations.filter((c) => c.id !== action.id)
      const activeId = state.activeId === action.id ? (conversations[0]?.id ?? null) : state.activeId
      return { conversations, activeId }
    }
    case 'addMessage':
      return updateConversation(action.convId, (c) => ({
        ...c,
        // The first question becomes the title, until the user renames the chat.
        title: c.title ?? (action.message.role === 'user' ? action.message.text.slice(0, 48) : null),
        messages: [...c.messages, action.message],
      }))
    case 'append':
      return updateMessage(action.convId, action.msgId, (m) => ({ ...m, text: m.text + action.chunk }))
    case 'finish':
      return updateMessage(action.convId, action.msgId, (m) => ({ ...m, status: action.status }))
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(saved?.conversations)) {
      // A reply that was still streaming when the page closed is marked as stopped.
      const conversations = saved.conversations.map((c) => ({
        ...c,
        messages: c.messages.map((m) => (m.status === 'streaming' ? { ...m, status: 'stopped' } : m)),
      }))
      return { conversations, activeId: saved.activeId ?? conversations[0]?.id ?? null }
    }
  } catch {
    // broken or blocked storage: start fresh
  }
  return { conversations: [], activeId: null }
}

export function useConversations() {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  // Save a moment after the last change: while a reply streams in, the state changes
  // dozens of times per second, and we do not need to write each one to localStorage.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(state))
      } catch {
        // storage full or blocked
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [state])

  const active = state.conversations.find((c) => c.id === state.activeId) ?? null
  return { ...state, active, dispatch, newId }
}
