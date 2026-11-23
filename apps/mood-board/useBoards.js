import { PEACOCK } from '@shared/ui/palette.js'
import { legacyColor } from './colors.js'
import { useStoredState } from './useStoredState.js'

// Every position and size is stored as a fraction of the board's width, so a board looks
// the same on a phone and on a wide screen. The board is 4:3, so its height is 0.75.
export const BOARD_HEIGHT = 0.75
export const MIN_SIZE = 0.08

export const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
export const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))
function seedBoards() {
  const tile = (color, x, y, w, h, z) => ({ id: uid(), type: 'color', color, x, y, w, h, z })
  return [
    {
      id: uid(),
      name: '',
      items: [
        tile(PEACOCK.teal, 0.04, 0.06, 0.22, 0.3, 1),
        tile(PEACOCK.ruby, 0.29, 0.16, 0.17, 0.17, 2),
        tile(PEACOCK.plum, 0.74, 0.05, 0.22, 0.26, 3),
        tile(PEACOCK.tealLight, 0.1, 0.42, 0.16, 0.22, 4),
        {
          id: uid(),
          type: 'note',
          // Seed text is bilingual; once edited, a note holds a plain string.
          text: { en: 'Colors I love: teal, gold and plum.', hu: 'Kedvenc színeim: türkiz, arany és szilva.' },
          color: PEACOCK.gold,
          x: 0.5,
          y: 0.42,
          w: 0.24,
          h: 0.2,
          z: 5,
        },
      ],
    },
  ]
}

// Old boards stored pattern pictures ({ type: 'pattern', key }). They become flat color tiles
// in the same place and size, so nothing on a saved board disappears.
function upgradeBoards(boards) {
  return boards.map((board) => ({
    ...board,
    items: board.items.map((item) => {
      if (item.type !== 'pattern') return item
      const { key, ratio, ...rest } = item
      return { ...rest, type: 'color', color: legacyColor(key) }
    }),
  }))
}

const topZ = (board) => board.items.reduce((max, item) => Math.max(max, item.z), 0)

export function useBoards() {
  const [boards, setBoards, boardsFailed] = useStoredState(
    'rika:mood-board:boards',
    seedBoards,
    (value) => Array.isArray(value) && value.length > 0 && value.every((b) => Array.isArray(b.items)),
    upgradeBoards,
  )
  const [activeId, setActiveId] = useStoredState('rika:mood-board:active', null)
  const active = boards.find((b) => b.id === activeId) ?? boards[0]

  const updateActive = (fn) => setBoards((list) => list.map((b) => (b.id === active.id ? fn(b) : b)))

  return {
    boards,
    active,
    saveFailed: boardsFailed,
    selectBoard: setActiveId,

    addBoard() {
      const board = { id: uid(), name: '', items: [] }
      setBoards((list) => [...list, board])
      setActiveId(board.id)
    },
    renameBoard(name) {
      updateActive((b) => ({ ...b, name }))
    },
    removeBoard(id) {
      if (boards.length < 2) return
      const index = boards.findIndex((b) => b.id === id)
      const neighbour = boards[index + 1] ?? boards[index - 1]
      setBoards((list) => list.filter((b) => b.id !== id))
      setActiveId(neighbour.id)
    },

    // New items land in a cascade near the top-left, on top of everything else.
    addItem(item) {
      const id = uid()
      updateActive((b) => {
        const offset = (b.items.length % 6) * 0.035
        let w = item.w
        let h = item.h ?? w * item.ratio
        // Very tall images are scaled down so they fit on the board.
        if (h > BOARD_HEIGHT * 0.8) {
          h = BOARD_HEIGHT * 0.8
          if (item.ratio) w = h / item.ratio
        }
        return {
          ...b,
          items: [
            ...b.items,
            {
              ...item,
              id,
              w,
              h,
              x: clamp(0.06 + offset, 0, 1 - w),
              y: clamp(0.06 + offset, 0, BOARD_HEIGHT - h),
              z: topZ(b) + 1,
            },
          ],
        }
      })
      return id
    },
    updateItem(itemId, patch) {
      updateActive((b) => ({ ...b, items: b.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }))
    },
    bringToFront(itemId) {
      updateActive((b) => {
        const top = topZ(b)
        const item = b.items.find((i) => i.id === itemId)
        if (!item || item.z === top) return b
        return { ...b, items: b.items.map((i) => (i.id === itemId ? { ...i, z: top + 1 } : i)) }
      })
    },
    removeItem(itemId) {
      updateActive((b) => ({ ...b, items: b.items.filter((i) => i.id !== itemId) }))
    },
  }
}
