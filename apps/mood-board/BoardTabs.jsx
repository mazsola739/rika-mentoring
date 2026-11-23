import { useState } from 'react'
import { useText } from '@shared/i18n.js'
import { TEXT } from './text.js'

export const boardName = (board, index, t) => board.name.trim() || t.untitled(index + 1)

// Switch, add, rename and delete boards.
const BoardTabs = ({ boards, active, onSelect, onAdd, onRename, onRemove }) => {
  const t = useText(TEXT)
  const [confirming, setConfirming] = useState(false)
  const activeIndex = boards.findIndex((b) => b.id === active.id)
  const activeName = boardName(active, activeIndex, t)

  return (
    <div className="mb-boards">
      <div className="mb-boards__tabs" role="group" aria-label={t.boards}>
        {boards.map((board, i) => (
          <button
            key={board.id}
            type="button"
            className="chip"
            aria-pressed={board.id === active.id}
            onClick={() => {
              setConfirming(false)
              onSelect(board.id)
            }}
          >
            {boardName(board, i, t)}
            <span className="mb-boards__count">{board.items.length}</span>
          </button>
        ))}
        <button type="button" className="chip mb-boards__new" onClick={onAdd}>
          {t.newBoard}
        </button>
      </div>

      <div className="mb-boards__edit">
        {/* key: switching boards gives a fresh input with that board's name */}
        <label className="field mb-boards__name" key={active.id}>
          <span>{t.boardName}</span>
          <input
            className="input"
            value={active.name}
            placeholder={t.untitled(activeIndex + 1)}
            maxLength={40}
            onChange={(e) => onRename(e.target.value)}
          />
        </label>

        {confirming ? (
          <div className="mb-confirm" role="group" aria-label={t.deleteBoard}>
            <span>{t.confirmDelete(activeName)}</span>
            <button
              type="button"
              className="btn mb-danger"
              onClick={() => {
                setConfirming(false)
                onRemove(active.id)
              }}
            >
              {t.yes}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)} autoFocus>
              {t.no}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setConfirming(true)}
            disabled={boards.length < 2}
            title={boards.length < 2 ? t.lastBoard : undefined}
          >
            {t.deleteBoard}
          </button>
        )}
      </div>
    </div>
  )
}

export default BoardTabs
