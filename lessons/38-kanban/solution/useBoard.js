import { useEffect, useReducer } from 'react'
import { boardReducer, isBoard, sampleBoard } from './boardReducer.js'

const KEY = 'rika:kanban:board'

function loadBoard() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (isBoard(saved)) return saved
    }
  } catch {
    // unreadable or blocked storage: start with the sample board
  }
  return sampleBoard()
}

// useReducer with lazy initial state (read storage once), then save after every change.
export const useBoard = () => {
  const [board, dispatch] = useReducer(boardReducer, undefined, loadBoard)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(board))
    } catch {
      // storage full or unavailable: the board keeps working in memory
    }
  }, [board])

  return [board, dispatch]
}
