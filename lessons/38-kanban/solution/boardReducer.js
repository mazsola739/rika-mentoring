// The board is nested state: columns → cards.
// { todo: [card, …], doing: [card, …], done: [card, …] }, card = { id, title, description, priority }
// Every change goes through one pure function, the reducer, so the rules live in one place.

export const COLUMNS = ['todo', 'doing', 'done']
export const PRIORITIES = ['high', 'medium', 'low']

// Sample cards are bilingual until edited, then they hold plain strings.
export const localize = (value, lang) => (value && typeof value === 'object' ? (value[lang] ?? value.en ?? '') : (value ?? ''))

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function findCard(board, id) {
  for (const column of COLUMNS) {
    const index = board[column].findIndex((card) => card.id === id)
    if (index !== -1) return { column, index, card: board[column][index] }
  }
  return null
}

const mapCards = (board, fn) => Object.fromEntries(COLUMNS.map((column) => [column, fn(board[column])]))

export function boardReducer(board, action) {
  switch (action.type) {
    case 'add': {
      const { column, card } = action
      return { ...board, [column]: [...board[column], card] }
    }

    case 'update': {
      const { id, changes } = action
      return mapCards(board, (cards) => cards.map((card) => (card.id === id ? { ...card, ...changes } : card)))
    }

    case 'delete':
      return mapCards(board, (cards) => cards.filter((card) => card.id !== action.id))

    // `index` is counted in the target column *without* the moved card.
    case 'move': {
      const { id, to } = action
      const from = findCard(board, id)
      if (!from || !COLUMNS.includes(to)) return board

      const without = { ...board, [from.column]: board[from.column].filter((card) => card.id !== id) }
      const target = [...without[to]]
      const index = Math.max(0, Math.min(action.index ?? target.length, target.length))
      if (from.column === to && from.index === index) return board // nothing changed: same object, no re-render

      target.splice(index, 0, from.card)
      return { ...without, [to]: target }
    }

    case 'reset':
      return action.board

    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

export function isBoard(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    COLUMNS.every(
      (column) =>
        Array.isArray(value[column]) &&
        value[column].every((card) => card && typeof card.id === 'string' && PRIORITIES.includes(card.priority)),
    )
  )
}

export function sampleBoard() {
  const card = (en, hu, priority, description = { en: '', hu: '' }) => ({
    id: createId(),
    title: { en, hu },
    description,
    priority,
  })

  return {
    todo: [
      card('Fix the sign-in redirect', 'A bejelentkezés utáni átirányítás javítása', 'high', {
        en: 'Users land on a blank page after signing in.',
        hu: 'Bejelentkezés után üres oldalra kerülnek a felhasználók.',
      }),
      card('Write the project README', 'A projekt README-jének megírása', 'medium', {
        en: 'Setup steps, scripts and a screenshot.',
        hu: 'Telepítési lépések, scriptek és egy képernyőkép.',
      }),
      card('Design the empty states', 'Üres állapotok megtervezése', 'low', {
        en: 'What does a column look like without cards?',
        hu: 'Hogyan néz ki egy oszlop kártyák nélkül?',
      }),
    ],
    doing: [
      card('Keyboard support for drag & drop', 'Billentyűzetes mozgatás a táblán', 'high', {
        en: 'Space picks a card up, the arrow keys move it.',
        hu: 'Szóközzel felveszed a kártyát, a nyilakkal mozgatod.',
      }),
      card('Save the board in localStorage', 'A tábla mentése localStorage-be', 'medium', {
        en: 'Save after every change, load on start.',
        hu: 'Mentés minden változás után, betöltés induláskor.',
      }),
    ],
    done: [
      card('Set up Vite and React', 'Vite és React beállítása', 'low'),
      card('Sketch the three columns', 'A három oszlop felvázolása', 'medium'),
    ],
  }
}
